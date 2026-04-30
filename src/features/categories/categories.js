import './categories.css';
import { supabase } from '../../supabase.js';

let categoriesVisible = false;
let localizedCategories = []; // Real-time local cache of the DB state

// Expanded System Categories (Inherited from Catalog + Essentials)
// These will be seeded into the DB with is_system: true
const SYSTEM_CATEGORIES_SEED = [
    { name: 'AI Tools', icon: '🤖', color: 'linear-gradient(135deg, #3b82f6 0%, #000 100%)', is_system: true },
    { name: 'Streaming', icon: '🎬', color: 'linear-gradient(135deg, #ef4444 0%, #000 100%)', is_system: true },
    { name: 'Productivity', icon: '⚡', color: 'linear-gradient(135deg, #f59e0b 0%, #000 100%)', is_system: true },
    { name: 'Creative', icon: '🎨', color: 'linear-gradient(135deg, #ec4899 0%, #000 100%)', is_system: true },
    { name: 'Development', icon: '💻', color: 'linear-gradient(135deg, #10b981 0%, #000 100%)', is_system: true },
    { name: 'Work', icon: '💼', color: 'linear-gradient(135deg, #1e3a8a 0%, #000 100%)', is_system: true },
    { name: 'Essentials', icon: '🏠', color: 'linear-gradient(135deg, #2c3e50 0%, #000 100%)', is_system: true },
    { name: 'Health & Fitness', icon: '🏃', color: 'linear-gradient(135deg, #10b981 0%, #000 100%)', is_system: true }
];

const NOT_SET_CAT = { id: 'cat-1', name: 'Not set', icon: '📁', color: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)', is_system: true };

export async function initCategories() {
    await fetchCategoriesFromDB();

    const categoriesBtn = document.getElementById('categories-btn');
    const closeBtn = document.getElementById('close-categories');
    const addSheetBtn = document.getElementById('add-category-sheet-btn');

    if (categoriesBtn) {
        categoriesBtn.addEventListener('click', () => toggleCategoriesPage(true));
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleCategoriesPage(false));
    }
    if (addSheetBtn) {
        addSheetBtn.addEventListener('click', () => {
            if (!navigator.onLine) {
                if (window.showOfflineWarning) window.showOfflineWarning();
                return;
            }
            toggleAddCategorySheet(true);
        });
    }

    const closeExplorerBtn = document.getElementById('close-category-explorer');
    if (closeExplorerBtn) {
        closeExplorerBtn.addEventListener('click', () => toggleCategoryExplorer(false));
    }

    const explorerDeleteBtn = document.getElementById('delete-category-explorer-btn');
    if (explorerDeleteBtn) {
        explorerDeleteBtn.addEventListener('click', () => {
            if (!navigator.onLine) {
                if (window.showOfflineWarning) window.showOfflineWarning();
                return;
            }
            const catName = document.getElementById('explorer-category-name').textContent;
            const cat = localizedCategories.find(c => c.name === catName);
            if (cat) {
                if (cat.is_system) {
                    showCategoriesToast('System categories cannot be deleted');
                } else {
                    showDeleteCategoryConfirm(cat.id, cat.name);
                }
            }
        });
    }

    const iconBox = document.getElementById('explorer-category-icon-box');
    if (iconBox) {
        iconBox.addEventListener('click', () => {
            const catName = document.getElementById('explorer-category-name').textContent;
            const cat = getCategories().find(c => c.name === catName);
            
            // Block emoji update for system categories (except "Not set")
            if (cat && cat.is_system && cat.id !== 'cat-1') {
                showCategoriesToast('System icons are locked');
                if (window.HapticsService) window.HapticsService.heavy();
                return;
            }
            
            showEmojiPicker(catName);
        });
    }

    const togglePresetsBtn = document.getElementById('toggle-presets-btn');
    if (togglePresetsBtn) {
        togglePresetsBtn.addEventListener('click', () => {
            const container = document.getElementById('presets-container');
            const isHidden = container.classList.contains('hidden');
            if (isHidden) {
                container.classList.remove('hidden');
                togglePresetsBtn.textContent = 'Hide Presets';
                togglePresetsBtn.style.color = 'var(--accent-blue)';
            } else {
                container.classList.add('hidden');
                togglePresetsBtn.textContent = 'View Presets';
                togglePresetsBtn.style.color = 'rgba(255,255,255,0.5)';
            }
            if (window.HapticsService) window.HapticsService.light();
        });
    }

    const toggleCreationsBtn = document.getElementById('toggle-creations-btn');
    if (toggleCreationsBtn) {
        toggleCreationsBtn.addEventListener('click', () => {
            const container = document.getElementById('my-categories-collection-box');
            const isHidden = container.classList.contains('hidden');
            if (isHidden) {
                container.classList.remove('hidden');
                toggleCreationsBtn.textContent = 'Hide Creations';
                toggleCreationsBtn.style.color = 'var(--accent-blue)';
            } else {
                container.classList.add('hidden');
                toggleCreationsBtn.textContent = 'See Creations';
                toggleCreationsBtn.style.color = 'rgba(255,255,255,0.5)';
            }
            if (window.HapticsService) window.HapticsService.light();
        });
    }

    renderStoredCategories();
}

async function fetchCategoriesFromDB() {
    try {
        const { data: userResp } = await supabase.auth.getUser();
        if (!userResp.user) return;
        const userId = userResp.user.id;

        let { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        // Auto-Seed System Categories if missing
        const systemNames = SYSTEM_CATEGORIES_SEED.map(s => s.name);
        const existingNames = data ? data.map(d => d.name) : [];
        const missing = SYSTEM_CATEGORIES_SEED.filter(s => !existingNames.includes(s.name));

        if (missing.length > 0) {
            console.log(`[Categories] Seeding ${missing.length} system categories...`);
            const seedData = missing.map(c => ({ ...c, user_id: userId }));
            const { data: seeded, error: seedError } = await supabase
                .from('categories')
                .insert(seedData)
                .select();
            
            if (!seedError && seeded) {
                data = [...(data || []), ...seeded].sort((a,b) => a.name.localeCompare(b.name));
            }
        }

        localizedCategories = data || [];
        renderStoredCategories();
    } catch (err) {
        console.error('[Categories] DB Fetch error:', err.message);
        localizedCategories = [];
    }
}

export function getCategories() {
    return [NOT_SET_CAT, ...localizedCategories];
}

async function updateCategoryEmoji(catId, newEmoji) {
    if (window.HapticsService) window.HapticsService.medium();
    
    // 1. Optimistic UI update
    const idx = localizedCategories.findIndex(c => c.id === catId);
    if (idx !== -1) localizedCategories[idx].icon = newEmoji;
    renderStoredCategories();
    
    // 2. Database Sync
    const { error } = await supabase
        .from('categories')
        .update({ icon: newEmoji })
        .eq('id', catId);

    if (error) {
        console.error('[Categories] Sync failed:', error.message);
    }

    const explorer = document.getElementById('category-explorer');
    if (explorer && !explorer.classList.contains('hidden')) {
        const catName = document.getElementById('explorer-category-name').textContent;
        renderCategorySubscriptions(catName);
    }
    if (window.refreshUniversalUI) window.refreshUniversalUI();
}

export function toggleCategoriesPage(show) {
    const page = document.getElementById('categories-page');
    if (!page) return;
    categoriesVisible = show;
    if (window.HapticsService) window.HapticsService.medium();
    if (show) {
        page.classList.remove('hidden');
        renderStoredCategories();
    } else {
        page.classList.add('hidden');
    }
}

function renderStoredCategories() {
    const presetsContainer = document.getElementById('presets-container');
    const myCatsBox = document.getElementById('my-categories-collection-box');
    if (!presetsContainer || !myCatsBox) return;

    const all = getCategories();
    const presets = all.filter(c => c.is_system === true);
    const custom = all.filter(c => !c.is_system);

    const renderTo = (list, container) => {
        container.innerHTML = '';
        if (list.length === 0) {
           container.innerHTML = `<div style="padding: 20px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.05); color: rgba(255,255,255,0.2); font-size: 0.7rem;">None yet</div>`;
           return;
        }

        list.forEach((cat) => {
            const row = document.createElement('div');
            row.className = 'category-collection-row';
            row.style.cssText = `
                display: flex; align-items: center; justify-content: space-between;
                padding: 14px 16px; background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.04); border-radius: 18px;
                transition: all 0.2s ease;
            `;

            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: ${cat.color || 'rgba(255,255,255,0.04)'}; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                        ${cat.icon || '📁'}
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #fff;">${cat.name}</span>
                        <span style="font-size: 0.6rem; font-weight: 600; color: ${cat.is_system ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)'}; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8;">
                            ${cat.is_system ? 'System Layer' : 'Custom Layer'}
                        </span>
                    </div>
                </div>
                ${cat.id !== 'cat-1' ? `
                    <button class="open-cat-btn" style="
                        padding: 8px 16px; border-radius: 12px; 
                        background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); 
                        color: rgba(255,255,255,0.8); font-size: 0.75rem; font-weight: 700;
                        text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s ease;
                    ">Open</button>
                ` : `
                    <div style="padding: 6px 12px; border-radius: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.2); font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">
                        Default
                    </div>
                `}
            `;

            const openBtn = row.querySelector('.open-cat-btn');
            if (openBtn) {
                openBtn.onclick = (e) => {
                    e.stopPropagation();
                    toggleCategoryExplorer(true, cat.name);
                };
            }
            container.appendChild(row);
        });
    };

    renderTo(presets, presetsContainer);
    renderTo(custom, myCatsBox);
}

function showDeleteCategoryConfirm(id, name) {
    document.getElementById('cat-delete-confirm')?.remove();

    const modal = document.createElement('div');
    modal.id = 'cat-delete-confirm';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10002;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: rgba(13,13,13,0.98);
            border-top: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px 32px 0 0;
            padding: 28px 24px 40px;
            animation: nexusSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        ">
            <div id="cat-delete-drag-area" style="cursor: grab; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding-bottom: 24px; padding-top: 10px; margin-top: -10px;">
                <div style="width: 36px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 24px; flex-shrink: 0;"></div>
                
                <div style="width: 60px; height: 60px; border-radius: 18px; background: rgba(255,69,58,0.08); border: 1px solid rgba(255,69,58,0.15); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; flex-shrink: 0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                    </svg>
                </div>

                <h2 style="text-align: center; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; margin: 0; color: #fff;">
                    Remove ${name}?
                </h2>
            </div>
            
            <p style="text-align: center; font-size: 0.88rem; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0 0 24px; padding: 0 20px;">
                This category will be permanently removed from your account. Any subscriptions currently linked to this category will be <span style="color: #ffb340; font-weight: 700;">automatically recategorized</span>.
            </p>

            <!-- Image-matched Safety Box -->
            <div style="background: rgba(255, 179, 64, 0.05); border: 1px solid rgba(255, 179, 64, 0.15); border-radius: 16px; padding: 16px; display: flex; gap: 12px; align-items: center; margin-bottom: 32px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffb340" stroke-width="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p style="color: #ffb340; font-size: 0.78rem; font-weight: 600; line-height: 1.4; margin: 0;">
                    Linked subscriptions will not be deleted — only the category will be unlinked.
                </p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <button id="cat-confirm-delete-yes" style="
                    width: 100%; padding: 19px; border-radius: 20px;
                    background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.05);
                    color: #ff453a; font-size: 0.95rem; font-weight: 700;
                    cursor: pointer; transition: all 0.2s ease;
                ">Remove Category</button>
                <button id="cat-confirm-delete-no" style="
                    width: 100%; padding: 19px; border-radius: 20px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.01);
                    color: rgba(255,255,255,0.6); font-size: 0.95rem; font-weight: 600;
                    cursor: pointer; transition: all 0.2s ease;
                ">Keep Category</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const sheet = modal.querySelector('.category-sheet-inner');
    
    // --- NEXUS DRAG LOGIC ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handle = document.getElementById('cat-delete-drag-area');
    
    const startDrag = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
        document.activeElement?.blur();
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        const nowY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = nowY - startY;
        if (deltaY > 0) {
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
            modal.style.background = `rgba(0,0,0,${0.6 * (1 - currentY/500)})`;
            if (e.cancelable) e.preventDefault();
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        sheet.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        if (currentY > 120) {
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => modal.remove(), 300);
        } else {
            sheet.style.transform = 'translateY(0)';
            modal.style.background = 'rgba(0,0,0,0.6)';
        }
    };

    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    document.getElementById('cat-confirm-delete-no').onclick = () => {
        sheet.style.transform = 'translateY(110%)';
        setTimeout(() => modal.remove(), 250);
    };

    document.getElementById('cat-confirm-delete-yes').onclick = async () => {
        if (!navigator.onLine) {
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => {
                modal.remove();
                if (window.showOfflineWarning) window.showOfflineWarning();
            }, 250);
            return;
        }
        if (window.HapticsService) window.HapticsService.medium();
        
        const { error } = await supabase.from('categories').delete().eq('id', id);
        
        if (!error) {
            localizedCategories = localizedCategories.filter(c => c.id !== id);
            renderStoredCategories();
            toggleCategoryExplorer(false);
            
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => {
                modal.remove();
                if (window.HapticsService) window.HapticsService.success();
                showCategoriesToast('Category removed from cloud', false);
            }, 250);
        } else {
            showCategoriesToast('Error: ' + error.message);
        }
    };

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

async function addNewCategory(name) {
    try {
        const { data: userResp } = await supabase.auth.getUser();
        if (!userResp.user) return false;

        const newCatData = {
            user_id: userResp.user.id,
            name: name,
            icon: '📁',
            color: 'linear-gradient(135deg, #1f2937 0%, #000 100%)',
            is_system: false 
        };

        const { data, error } = await supabase
            .from('categories')
            .insert([newCatData])
            .select()
            .single();

        if (error) throw error;
        localizedCategories.push(data);
        renderStoredCategories();
        return true;
    } catch (err) {
        console.error('[Categories] Error adding:', err.message);
        return false;
    }
}

function showCategoriesToast(message, isError = true) {
    const toast = document.getElementById('categories-toast');
    const msgSpan = document.getElementById('categories-toast-msg');
    if (!toast || !msgSpan) return;
    msgSpan.textContent = message;
    toast.style.background = isError ? '#ff3b30' : '#34c759';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function toggleCategoryExplorer(show, catName = '') {
    const explorer = document.getElementById('category-explorer');
    const footer = document.getElementById('category-explorer-footer');
    if (!explorer) return;
    if (show) {
        explorer.classList.remove('hidden');
        renderCategorySubscriptions(catName);
        
        const cat = getCategories().find(c => c.name === catName);
        if (footer) footer.classList.toggle('hidden', cat?.is_system === true);
    } else {
        explorer.classList.add('hidden');
    }
}

export async function renderCategorySubscriptions(catName) {
    const nameEl = document.getElementById('explorer-category-name');
    const iconBox = document.getElementById('explorer-category-icon-box');
    const list = document.getElementById('category-subs-list');
    const statsEl = document.getElementById('explorer-category-stats');
    if (nameEl) nameEl.textContent = catName;

    const catInfo = getCategories().find(c => c.name === catName) || NOT_SET_CAT;
    if (iconBox) {
        iconBox.textContent = catInfo.icon;
        iconBox.style.background = catInfo.color;
    }

    if (!list) return;
    
    // Initial fetch from "Real" DB table
    list.innerHTML = `<p style="text-align: center; opacity: 0.5; padding: 40px; font-size: 0.8rem;">Accessing Cloud Table...</p>`;

    try {
        const { data: subs, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('category', catName)
            .order('name', { ascending: true });

        if (error) throw error;

        if (statsEl) statsEl.textContent = `${subs.length} SUBSCRIPTION${subs.length !== 1 ? 'S' : ''}`;

        if (!subs || subs.length === 0) {
            list.innerHTML = `
                <div style="padding: 24px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
                    <p style="font-size: 0.8rem; color: var(--text-secondary); opacity: 0.6;">No items found in ${catName}</p>
                </div>
            `;
            return;
        }

        // --- NEXUS MIRRORED RENDERING ENGINE ---
        list.innerHTML = `
            <div class="latest-list" style="margin-top: 0; padding: 0;">
                ${subs.map(sub => {
                    const report = window.lastReport || { total: 0, activeSubs: [], symbol: '$', currency: 'USD', rates: null };
                    const settings = (window.userProfile && window.userProfile.settings) || {};
                    const targetCurrency = report.currency;
                    const targetSymbol = report.symbol;
                    const useAutoCurrency = settings.autoCurrency !== false || settings.usdTotal;
                    const displayPrice = window.getDisplayPrice ? window.getDisplayPrice(sub, targetCurrency, useAutoCurrency, report.rates) : `${sub.symbol || '$'}${parseFloat(sub.price).toFixed(2)}`;
                    sub.displayPrice = displayPrice;

                    if (window.getSwipeTemplate) {
                        return window.getSwipeTemplate(sub);
                    }
                    return `<div style="padding: 16px; background: rgba(255,255,255,0.05); border-radius: 12px;">${sub.name}</div>`;
                }).join('')}
            </div>
        `;

        if (window.attachSwipeEvents) {
            window.attachSwipeEvents();
        }

    } catch (err) {
        console.error('[Explorer] Fetch failed:', err.message);
        list.innerHTML = `<p style="color: var(--accent-red); font-size: 0.8rem; text-align: center; padding: 20px;">Error: ${err.message || 'Unknown error'}</p>`;
    }
}

function toggleAddCategorySheet(show) {
    if (show) {
        showAddCategorySheet();
    } else {
        const sheet = document.getElementById('category-add-sheet');
        if (sheet) sheet.remove();
    }
}

function showAddCategorySheet() {
    // Remove existing
    document.getElementById('category-add-sheet')?.remove();

    const modal = document.createElement('div');
    modal.id = 'category-add-sheet';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10001;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding-bottom: 34px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
            position: relative;
        ">
            <!-- Drag Area -->
            <div id="cat-add-drag-area" style="cursor: grab; display: flex; flex-direction: column; width: 100%; padding-top: 10px;">
                <!-- Drag Handle -->
                <div style="padding: 14px 0 4px; display: flex; justify-content: center;">
                    <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px;"></div>
                </div>

                <!-- Header -->
                <div style="display: flex; align-items: center; padding: 8px 20px 20px; gap: 16px;">
                    <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            <line x1="12" y1="11" x2="12" y2="17"></line>
                            <line x1="9" y1="14" x2="15" y2="14"></line>
                        </svg>
                    </div>
                    <div>
                        <h2 style="margin: 0 0 2px; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; color: #fff;">Create New Layer</h2>
                        <p style="margin: 0; font-size: 0.75rem; color: rgba(255,255,255,0.35); font-weight: 400;">Organize your dashboard with custom categories.</p>
                    </div>
                </div>
            </div>

            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 0 20px 20px;"></div>

            <!-- Form -->
            <div style="padding: 0 20px;">
                <div style="margin-bottom: 24px;">
                    <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 12px;">Category Name</label>
                    <input type="text" id="cat-name-input" placeholder="e.g. Work Tools" autocomplete="off" style="
                        width: 100%; padding: 16px 18px; background: rgba(255,255,255,0.04);
                        border: 1px solid rgba(255,255,255,0.1); border-radius: 14px;
                        color: #fff; font-size: 0.95rem; outline: none;
                        transition: all 0.2s; box-sizing: border-box;
                    ">
                </div>

                <button id="submit-new-cat" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: #fff; border: none;
                    color: #000; font-size: 1rem; font-weight: 800;
                    cursor: pointer; transition: all 0.2s ease;
                    display: flex; align-items: center; justify-content: center; gap: 10px;
                ">Create Category</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const sheet = modal.querySelector('.category-sheet-inner');
    const input = document.getElementById('cat-name-input');
    const submitBtn = document.getElementById('submit-new-cat');
    
    // Focus input slightly delayed for animation smoothness
    setTimeout(() => input.focus(), 400);

    input.onfocus = () => { input.style.borderColor = 'rgba(0, 162, 255, 0.3)'; };
    input.onblur = () => { input.style.borderColor = 'rgba(255,255,255,0.08)'; };

    // --- NEXUS DRAG LOGIC ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handle = document.getElementById('cat-add-drag-area');
    
    const startDrag = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
        document.activeElement?.blur();
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        const nowY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = nowY - startY;
        if (deltaY > 0) {
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
            modal.style.background = `rgba(0,0,0,${0.6 * (1 - currentY/500)})`;
            if (e.cancelable) e.preventDefault();
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        sheet.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        if (currentY > 120) {
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => modal.remove(), 300);
        } else {
            sheet.style.transform = 'translateY(0)';
            modal.style.background = 'rgba(0,0,0,0.6)';
        }
    };

    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);

    submitBtn.onclick = async () => {
        if (!navigator.onLine) {
            if (window.showOfflineWarning) window.showOfflineWarning();
            return;
        }
        const name = input.value.trim();
        if (!name) return;

        // 1. Enter Loading State
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerHTML = `
            <div style="width: 18px; height: 18px; border: 2.5px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: nexusSpin 0.8s linear infinite;"></div>
            SYNCING...
        `;

        if (window.HapticsService) window.HapticsService.medium();

        try {
            const ok = await addNewCategory(name);
            if (ok) {
                // Success State
                submitBtn.innerHTML = `✅ CREATED`;
                submitBtn.style.color = '#34c759';
                if (window.HapticsService) window.HapticsService.success();
                
                setTimeout(() => {
                    sheet.style.transform = 'translateY(110%)';
                    setTimeout(() => modal.remove(), 250);
                }, 400);
            } else {
                throw new Error('Failed');
            }
        } catch (err) {
            // Restore button on error
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.color = '#000';
            submitBtn.innerHTML = 'RETRY CREATION';
        }
    };

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function showEmojiPicker(catName) {
    // Remove existing
    document.getElementById('cat-emoji-picker')?.remove();

    const categories = getCategories();
    const cat = categories.find(c => c.name === catName);
    if (!cat) return;

    const modal = document.createElement('div');
    modal.id = 'cat-emoji-picker';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10001;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
        animation: fadeIn 0.3s ease;
    `;

    const emojiCategories = [
        { name: 'Essentials', emojis: ['📁','🏠','💼','💰','🏦','📊','📈','📉','💸','💎','🔒','🔑','📢','🔔','📅','📍','⚙️','🛡️','⚖️','🏹'] },
        { name: 'Tech & AI', emojis: ['🤖','💻','⚡','📡','🧠','🔌','🔋','🖥️','📱','🖱️','键盘','🛰️','🚀','🛸','🧪','🔭','🧬','👾','🕹️','🎛️'] },
        { name: 'Entertainment', emojis: ['🎬','🎵','🎮','🍿','📺','🎙️','🎧','🎨','🖌️','📸','🎥','🎭','🎪','🎫','🎹','🎸','🎷','🥁','🎻','🎧'] },
        { name: 'Apps & Travel', emojis: ['📱','📶','☁️','🌐','📧','📩','📨','📬','📦','🚚','🛒','🛍️','👔','👕','🚗','🚕','🚲','🛵','✈️','🛫'] }
    ];

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: rgba(13, 13, 13, 0.98);
            border-top: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px 32px 0 0;
            padding: 24px 24px 40px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            position: relative;
            height: 70vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
        ">
            <div id="emoji-drag-area" style="cursor: grab; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; padding-bottom: 4px; padding-top: 10px; margin-top: -10px; flex-shrink: 0;">
                <div style="width: 36px; height: 5px; background: rgba(255,255,255,0.15); border-radius: 10px; margin-bottom: 20px; flex-shrink: 0;"></div>
                
                <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; text-align: center; letter-spacing: -0.01em; flex-shrink: 0;">
                    Choose ${catName} Icon
                </h3>
            </div>

            <div style="flex: 1; overflow-y: auto; padding: 0 10px 20px; -webkit-overflow-scrolling: touch;" class="custom-scroll">
                ${emojiCategories.map(group => `
                    <div style="margin-bottom: 32px;">
                        <p style="font-size: 0.6rem; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 16px; font-weight: 800; padding-left: 4px;">${group.name}</p>
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                            ${group.emojis.map(emoji => `
                                <button class="emoji-opt-btn" data-emoji="${emoji}" style="
                                    aspect-ratio: 1; border-radius: 14px; background: rgba(255,255,255,0.02);
                                    border: 1px solid rgba(255,255,255,0.04); font-size: 1.3rem; cursor: pointer;
                                    display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.32, 0.72, 0, 1);
                                ">${emoji}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button id="save-emoji-picker" style="width: 100%; padding: 18px; border-radius: 20px; background: #fff; border: none; color: #000; font-weight: 800; cursor: pointer; margin-top: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em;">
                SAVE CHANGES
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    const sheet = modal.querySelector('.category-sheet-inner');
    let selectedEmoji = cat.icon || '📁';

    const updateBtns = () => {
        modal.querySelectorAll('.emoji-opt-btn').forEach(btn => {
            const isSelected = btn.dataset.emoji === selectedEmoji;
            btn.style.background = isSelected ? 'rgba(0,122,255,0.15)' : 'rgba(255,255,255,0.03)';
            btn.style.borderColor = isSelected ? 'rgba(0,122,255,0.4)' : 'rgba(255,255,255,0.05)';
            btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
            btn.style.boxShadow = isSelected ? '0 0 20px rgba(0,122,255,0.2)' : 'none';
        });
    };
    updateBtns();

    modal.querySelectorAll('.emoji-opt-btn').forEach(btn => {
        btn.onclick = () => {
            selectedEmoji = btn.dataset.emoji;
            updateBtns();
            if (window.HapticsService) window.HapticsService.light();
        };
    });

    const saveBtn = modal.querySelector('#save-emoji-picker');
    saveBtn.onclick = async () => {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';
        saveBtn.innerHTML = `<div class="spinner" style="width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: nexusSpin 0.8s linear infinite;"></div> SYNCING...`;

        try {
            await updateCategoryEmoji(cat.id, selectedEmoji);
            saveBtn.innerHTML = `✅ SAVED`;
            saveBtn.style.color = '#34c759';
            if (window.HapticsService) window.HapticsService.success();
            setTimeout(() => modal.remove(), 400);
        } catch (err) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.innerHTML = 'RETRY';
        }
    };

    // --- NEXUS DRAG LOGIC ---
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handle = document.getElementById('emoji-drag-area');
    
    const startDrag = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
        document.activeElement?.blur();
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        const nowY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = nowY - startY;
        if (deltaY > 0) {
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
            modal.style.background = `rgba(0,0,0,${0.6 * (1 - currentY/500)})`;
            if (e.cancelable) e.preventDefault();
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        sheet.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        if (currentY > 120) {
            sheet.style.transform = 'translateY(110%)';
            setTimeout(() => modal.remove(), 300);
        } else {
            sheet.style.transform = 'translateY(0)';
            modal.style.background = 'rgba(0,0,0,0.6)';
        }
    };

    handle.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);

    handle.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', endDrag);

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

window.renderCategorySubscriptions = renderCategorySubscriptions;
