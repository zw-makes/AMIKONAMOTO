import './categories.css';
import { supabase } from '../../supabase.js';

let categoriesVisible = false;
const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Not set', icon: '📁', color: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)' },
    { id: 'cat-ai', name: 'AI Tools', icon: '🤖', color: 'linear-gradient(135deg, #3b82f6 0%, #000 100%)' },
    { id: 'cat-stream', name: 'Streaming', icon: '🎬', color: 'linear-gradient(135deg, #ef4444 0%, #000 100%)' },
    { id: 'cat-prod', name: 'Productivity', icon: '⚡', color: 'linear-gradient(135deg, #f59e0b 0%, #000 100%)' },
    { id: 'cat-creative', name: 'Creative', icon: '🎨', color: 'linear-gradient(135deg, #ec4899 0%, #000 100%)' },
    { id: 'cat-dev', name: 'Development', icon: '💻', color: 'linear-gradient(135deg, #10b981 0%, #000 100%)' },
    { id: 'cat-music', name: 'Music & Audio', icon: '🎵', color: 'linear-gradient(135deg, #8b5cf6 0%, #000 100%)' },
    { id: 'cat-gaming', name: 'Gaming', icon: '🎮', color: 'linear-gradient(135deg, #4b5563 0%, #000 100%)' },
    { id: 'cat-family', name: 'Family', icon: '🏠', color: 'linear-gradient(135deg, #2c3e50 0%, #000 100%)' },
    { id: 'cat-work', name: 'Work', icon: '💼', color: 'linear-gradient(135deg, #1e3a8a 0%, #000 100%)' },
    { id: 'cat-free', name: 'Free Apps', icon: '📱', color: 'linear-gradient(135deg, #065f46 0%, #000 100%)' }
];

export function initCategories() {
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
        addSheetBtn.addEventListener('click', () => toggleAddCategorySheet(true));
    }

    const closeExplorerBtn = document.getElementById('close-category-explorer');
    if (closeExplorerBtn) {
        closeExplorerBtn.addEventListener('click', () => toggleCategoryExplorer(false));
    }

    const explorerDeleteBtn = document.getElementById('delete-category-explorer-btn');
    if (explorerDeleteBtn) {
        explorerDeleteBtn.addEventListener('click', () => {
            const catName = document.getElementById('explorer-category-name').textContent;
            const categories = getCategories();
            const cat = categories.find(c => c.name === catName);
            if (cat) {
                showDeleteCategoryConfirm(cat.id, cat.name);
                // Also close explorer when delete is triggered
                toggleCategoryExplorer(false);
            }
        });
    }

    const iconBox = document.getElementById('explorer-category-icon-box');
    if (iconBox) {
        iconBox.addEventListener('click', () => {
            const catName = document.getElementById('explorer-category-name').textContent;
            showEmojiPicker(catName);
        });
    }

    // Initial render
    renderStoredCategories();
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
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(10px);
        animation: fadeIn 0.2s ease;
    `;

    const emojiCategories = [
        { name: 'Essentials', color: 'rgba(148, 163, 184, 0.12)', emojis: ['📁','🏠','💼','💰','🏦','📊','📈','📉','💳','💸','💎','🔒','🔑','📢','🔔','📅','📍','🏷️','📌'] },
        { name: 'Tech & AI', color: 'rgba(59, 130, 246, 0.18)', emojis: ['🤖','💻','⚡','📡','🧠','🔌','🔋','🖥️','📱','🖱️','⌨️','🛰️','🚀','🛸','🛸','🌌','🧪','🔭','🧬','👾'] },
        { name: 'Entertainment', color: 'rgba(236, 72, 153, 0.18)', emojis: ['🎬','🎵','🎮','🍿','📺','🎙️','🎧','🎨','🖌️','📸','🎥','🎭','🎪','🎫','🎹','🎸','🎷','🥁','🎻'] },
        { name: 'Service & Apps', color: 'rgba(20, 184, 166, 0.18)', emojis: ['📱','📶','☁️','🌐','📧','📩','📨','📬','📦','🚚','🛒','🛍️','👔','👕','👗','👡','👠','👞','👟','👓'] },
        { name: 'Food & Drink', color: 'rgba(245, 158, 11, 0.18)', emojis: ['🍕','🍔','🍟','🍱','🍣','🍝','🍜','🥘','🍛','🍲','🥗','🥙','🥪','🌮','🌯','🧇','🥞','🍕','🍩','🍦','🍰','🧁','🍪','☕','🍵','🥤','🥤','🍺','🥂','🍹','🍸','🍾','🥃'] },
        { name: 'Activities', color: 'rgba(239, 68, 68, 0.18)', emojis: ['🏃','🏋️','🚴','🏊','⚽','🏀','🎾','🏉','🏐','🎱','🎳','🏌️','🏄','⛸️','🎿','🧗','🚣','🚴','🧗','🏋️','🧘'] },
        { name: 'Travel & Places', color: 'rgba(6, 182, 212, 0.18)', emojis: ['🚗','🚕','🚙','🚌','🏎️','🚓','🚑','🚒','🚐','🚚','🚲','🛵','🏍️','🛴','🚇','🚉','🚅','🚄','✈️','🛫','🛬','🛥️','🛳️','⛴️','🗺️','🏔️','🌋','🏖️','🏙️','🌃','🏰','⛲'] },
        { name: 'Symbols', color: 'rgba(139, 92, 246, 0.18)', emojis: ['❤️','🔥','🌈','✨','⭐','🌟','💥','💯','✅','❌','➕','➖','✖️','➗','❓','‼️','💤','💢','💭','💬','💡','💢','🛡️','🏹','🗡️','🔱','⚖️','⚕️','☯️','☮️'] },
        { name: 'Nature', color: 'rgba(34, 197, 94, 0.18)', emojis: ['🪐','🌍','🌜','☀️','⭐','⛅','☁️','⚡','❄️','⛄','🌀','🌊','🌬️','🍀','🌿','🌵','🌴','🌳','🌲','🍂','🍁','🌸','🌼','🌻','🌷','🌹'] },
        { name: 'Animals', color: 'rgba(120, 113, 108, 0.18)', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🦁','🐯','🐮','🐷','🐵','🐧','🦜','🦉','🐥','🦆','🦢','🦅','蝙蝠','🦋','蜗牛','蜜蜂','甲虫','贝壳','乌龟','蛇','恐龙','章鱼','海豚','河豚','鲸鱼','鳄鱼','斑马'] }
    ];

    modal.innerHTML = `
        <div style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding: 24px 24px 40px;
            animation: nexusSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
            position: relative;
            height: 65vh;
            display: flex;
            flex-direction: column;
        ">
            <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px; margin: 0 auto 20px; flex-shrink: 0;"></div>
            
            <h3 style="color: #fff; font-size: 1.1rem; font-weight: 700; margin-bottom: 24px; text-align: center; letter-spacing: -0.01em; flex-shrink: 0;">
                Choose Icon for ${catName}
            </h3>

            <div style="flex: 1; overflow-y: auto; padding-right: 5px; -webkit-overflow-scrolling: touch;">
                ${emojiCategories.map(group => `
                    <div style="margin-bottom: 24px;">
                        <p style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 12px; font-weight: 800; opacity: 0.6;">${group.name}</p>
                        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;">
                            ${group.emojis.map(emoji => `
                                <button class="emoji-opt-btn" data-emoji="${emoji}" style="
                                    aspect-ratio: 1; border-radius: 14px; background: ${group.color};
                                    border: 1.5px solid rgba(255,255,255,0.05); font-size: 1.4rem; cursor: pointer;
                                    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                                    box-shadow: inset 0 0 12px ${group.color.replace('0.18', '0.1')};
                                ">${emoji}</button>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <button id="save-emoji-picker" style="width: 100%; padding: 18px; border-radius: 20px; background: #fff; border: none; color: #000; font-weight: 800; cursor: pointer; margin-top: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.05em;">
                SAVE
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    let selectedEmoji = cat.icon || '📁';

    const updateBtns = () => {
        modal.querySelectorAll('.emoji-opt-btn').forEach(btn => {
            const isSelected = btn.dataset.emoji === selectedEmoji;
            btn.style.background = isSelected ? 'rgba(0,122,255,0.2)' : 'rgba(255,255,255,0.03)';
            btn.style.borderColor = isSelected ? 'rgba(0,122,255,0.5)' : 'rgba(255,255,255,0.05)';
            btn.style.transform = isSelected ? 'scale(1.1)' : 'scale(1)';
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
        saveBtn.innerHTML = `
            <div class="spinner" style="width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: nexusSpin 0.8s linear infinite;"></div>
            SYNCING...
        `;

        try {
            await updateCategoryEmoji(cat.id, selectedEmoji);
            
            saveBtn.innerHTML = `✅ SYNCED`;
            saveBtn.style.color = '#34c759';
            if (window.HapticsService) window.HapticsService.success();
            
            setTimeout(() => {
                modal.remove();
            }, 500);
        } catch (err) {
            console.error('Save failed:', err);
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.innerHTML = 'SAVE CHANGES (RETRY)';
        }
    };

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    // --- GRAB AND PULL DISMISS LOGIC ---
    const sheet = modal.querySelector('div');
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const startDrag = (e) => {
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        const nowY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = nowY - startY;
        
        if (deltaY > 0) {
            currentY = deltaY;
            sheet.style.transform = `translateY(${currentY}px)`;
        }
    };

    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        sheet.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
        
        if (currentY > 100) {
            sheet.style.transform = 'translateY(100%)';
            setTimeout(() => modal.remove(), 300);
        } else {
            sheet.style.transform = 'translateY(0)';
        }
        currentY = 0;
    };

    // Attach to the handle area specifically for better UX, but allow entire sheet header too
    const handle = sheet.querySelector('div:first-child');
    handle.style.cursor = 'grab';
    
    handle.addEventListener('mousedown', startDrag);
    handle.addEventListener('touchstart', startDrag, { passive: true });
    
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    
    window.addEventListener('mouseup', endDrag);
    window.addEventListener('touchend', endDrag);
}

async function updateCategoryEmoji(catId, newEmoji) {
    if (window.HapticsService) window.HapticsService.medium();
    
    const profile = window.userProfile;
    if (!profile.settings) profile.settings = {};
    
    const isSystem = DEFAULT_CATEGORIES.some(d => d.id === catId);
    
    if (isSystem) {
        if (!profile.settings.categoryCustomizations) profile.settings.categoryCustomizations = {};
        profile.settings.categoryCustomizations[catId] = { 
            ...(profile.settings.categoryCustomizations[catId] || {}),
            icon: newEmoji 
        };
    } else {
        // Custom category - update directly in the categories array
        if (profile.settings.categories) {
            const idx = profile.settings.categories.findIndex(c => c.id === catId);
            if (idx !== -1) {
                profile.settings.categories[idx].icon = newEmoji;
            }
        }
    }

    // Sync to Supabase
    if (window.saveProfileToSupabase) {
        await window.saveProfileToSupabase();
    }

    renderStoredCategories();
    
    const explorer = document.getElementById('category-explorer');
    if (explorer && !explorer.classList.contains('hidden')) {
        const catName = document.getElementById('explorer-category-name').textContent;
        renderCategorySubscriptions(catName);
    }

    if (window.renderSubscriptions) window.renderSubscriptions();
    if (window.updateStats) window.updateStats();
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

export function getCategories() {
    const profile = window.userProfile;
    let custom = [];
    let deletedSystemIds = [];
    let customizations = {};

    if (profile?.settings?.categories && Array.isArray(profile.settings.categories)) {
        custom = profile.settings.categories;
    }
    if (profile?.settings?.deletedSystemCategoryIds && Array.isArray(profile.settings.deletedSystemCategoryIds)) {
        deletedSystemIds = profile.settings.deletedSystemCategoryIds;
    }
    if (profile?.settings?.categoryCustomizations) {
        customizations = profile.settings.categoryCustomizations;
    }
    
    // Merge defaults with custom, filtering out deleted system IDs
    const all = DEFAULT_CATEGORIES.filter(d => !deletedSystemIds.includes(d.id)).map(cat => {
        // Apply customizations (like custom icons)
        if (customizations[cat.id]) {
            return { ...cat, ...customizations[cat.id] };
        }
        return cat;
    });
    
    custom.forEach(c => {
        if (!all.some(a => a.name.toLowerCase() === c.name.toLowerCase())) {
            all.push(c);
        }
    });
    return all;
}

async function renderStoredCategories() {
    const categories = getCategories();
    const box = document.getElementById('categories-collection-box');
    if (!box) return;

    box.innerHTML = '';
    
    categories.forEach((cat) => {
        const isDefault = DEFAULT_CATEGORIES.some(d => d.id === cat.id);
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
                <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.04); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                    ${cat.icon || '📁'}
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px;">
                    <span style="font-size: 0.95rem; font-weight: 700; color: #fff;">${cat.name}</span>
                    <span style="font-size: 0.6rem; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.05em;">
                        ${isDefault ? 'System Layer' : 'Custom Layer'}
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
                if (window.HapticsService) window.HapticsService.selection();
                
                // Open the dedicated Category Explorer page
                toggleCategoryExplorer(true, cat.name);
            };
        }

        box.appendChild(row);
    });
}


function showCategoriesToast(message, isError = true) {
    const toast = document.getElementById('categories-toast');
    const msgSpan = document.getElementById('categories-toast-msg');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    toast.style.background = isError ? 'rgba(255, 59, 48, 0.9)' : 'rgba(52, 199, 89, 0.9)';
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (window.HapticsService) {
        if (isError) window.HapticsService.heavy();
        else window.HapticsService.medium();
    }

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

function toggleAddCategorySheet(show) {
    if (show) {
        showAddCategorySheet();
    } else {
        const sheet = document.getElementById('category-add-sheet');
        if (sheet) dismissCategorySheet(sheet);
    }
}

function showAddCategorySheet() {
    document.getElementById('category-add-sheet')?.remove();

    const modal = document.createElement('div');
    modal.id = 'category-add-sheet';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10001;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding: 24px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        ">
            <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px; margin: 0 auto 24px;"></div>
            
            <h2 style="font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 24px; color: #fff; text-align: center;">NEW CATEGORY</h2>
            
            <form id="category-add-form" style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <label style="font-size: 0.65rem; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-left: 4px;">Name</label>
                    <input type="text" id="cat-name-input" placeholder="e.g. Subscriptions, Family..." 
                        style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 16px; color: #fff; font-size: 0.95rem; outline: none;"
                        autocomplete="off">
                </div>

                <div style="margin-top: 10px;">
                    <button type="submit" style="
                        width: 100%; padding: 18px; border-radius: 18px;
                        background: #fff; color: #000; border: none;
                        font-size: 0.9rem; font-weight: 800; text-transform: uppercase;
                        letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s ease;
                    ">Create Category</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    const form = document.getElementById('category-add-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name-input').value.trim();
        if (!name) {
            showCategoriesToast('Please enter a name');
            return;
        }

        const success = await addNewCategory(name);
        if (success) {
            dismissCategorySheet(modal);
            showCategoriesToast('Category added!', false);
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) dismissCategorySheet(modal);
    });
}

function dismissCategorySheet(modal) {
    const inner = modal.querySelector('.category-sheet-inner');
    if (inner) {
        inner.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
        inner.style.transform = 'translateY(110%)';
    }
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
}

async function addNewCategory(name) {
    const profile = window.userProfile;
    if (!profile) return false;

    if (!profile.settings) profile.settings = {};
    const current = profile.settings.categories || [];
    
    // Check for duplicates
    if (DEFAULT_CATEGORIES.some(c => c.name.toLowerCase() === name.toLowerCase()) || 
        current.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        showCategoriesToast('Category already exists');
        return false;
    }

    const newCat = {
        id: 'cat-' + Date.now(),
        name: name,
        icon: '📁',
        color: 'linear-gradient(135deg, #1f2937 0%, #000 100%)'
    };

    // 1. Update LOCAL STATE and UI Immediately
    profile.settings.categories = [...current, newCat];
    renderStoredCategories();
    
    if (window.HapticsService) window.HapticsService.success();

    // 2. Sync to Database (handles offline queue automatically)
    if (window.saveProfileToSupabase) {
        await window.saveProfileToSupabase();
    }

    return true;
}

function showDeleteCategoryConfirm(id, name) {
    document.getElementById('cat-delete-confirm')?.remove();

    const modal = document.createElement('div');
    modal.id = 'cat-delete-confirm';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 10002;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding: 28px 24px 40px;
            animation: nexusSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        ">
            <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px; margin: 0 auto 24px;"></div>
            
            <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path><path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
            </div>

            <h2 style="text-align: center; font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px; color: #fff;">
                Remove Category?
            </h2>
            <p style="text-align: center; font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0 0 28px; padding: 0 10px;">
                Subscriptions currently in <strong style="color: #fff;">"${name}"</strong> will stay in your list but will no longer have a category.
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="cat-confirm-delete-yes" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: rgba(255,69,58,0.12); border: 1px solid rgba(255,69,58,0.25);
                    color: #ff453a; font-size: 1rem; font-weight: 700;
                    cursor: pointer; transition: all 0.15s ease;
                ">Delete Category</button>
                <button id="cat-confirm-delete-no" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.7); font-size: 1rem; font-weight: 600;
                    cursor: pointer; transition: all 0.15s ease;
                ">Keep it</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cat-confirm-delete-no').onclick = () => modal.remove();
    document.getElementById('cat-confirm-delete-yes').onclick = async () => {
        const profile = window.userProfile;
        const subCats = profile.settings?.categories || [];
        const deletedSystemIds = profile.settings?.deletedSystemCategoryIds || [];
        
        // 1. Find if it was a default or custom category
        const isSystem = DEFAULT_CATEGORIES.some(d => d.id === id);
        let catName = "";

        if (isSystem) {
            const sysCat = DEFAULT_CATEGORIES.find(d => d.id === id);
            catName = sysCat.name;
            if (!deletedSystemIds.includes(id)) {
                deletedSystemIds.push(id);
            }
        } else {
            const customCat = subCats.find(c => c.id === id);
            catName = customCat?.name || "";
            profile.settings.categories = subCats.filter(c => c.id !== id);
        }

        profile.settings.deletedSystemCategoryIds = deletedSystemIds;
        
        // 2. Perform Optimistic Subscription Cleanup locally
        if (catName && window.subscriptions) {
            window.subscriptions = window.subscriptions.map(s => {
                if (s.category === catName) {
                    const updatedSub = { ...s, category: 'Not set' };
                    // If online, save sub. If offline, the core sync engine in main.js will handle subs
                    // (Note: Subscriptions are usually handled by saveToSupabase which has its own queue)
                    if (window.saveToSupabase) window.saveToSupabase(updatedSub);
                    return updatedSub;
                }
                return s;
            });
        }

        // 3. Update UI IMMEDIATELY
        renderStoredCategories();
        modal.remove();
        if (window.renderSubscriptions) window.renderSubscriptions();
        if (window.updateStats) window.updateStats();
        if (window.renderCalendar) window.renderCalendar();
        
        showCategoriesToast('Category removed', false);

        // 4. Sync Profile (handles offline queue automatically)
        if (window.saveProfileToSupabase) {
            await window.saveProfileToSupabase();
        }
    };
}

export function toggleCategoryExplorer(show, catName = '') {
    const explorer = document.getElementById('category-explorer');
    const footer = document.getElementById('category-explorer-footer');
    if (!explorer) return;

    if (show) {
        explorer.classList.remove('hidden');
        renderCategorySubscriptions(catName);
        
        // Hide delete footer for 'Not set' category
        if (footer) {
            footer.classList.toggle('hidden', catName === 'Not set');
        }
    } else {
        explorer.classList.add('hidden');
    }
}

async function renderCategorySubscriptions(catName) {
    const nameEl = document.getElementById('explorer-category-name');
    const iconBox = document.getElementById('explorer-category-icon-box');
    const statsEl = document.getElementById('explorer-category-stats');
    const list = document.getElementById('category-subs-list');

    if (nameEl) nameEl.textContent = catName;
    
    // Find category info for icon
    const categories = getCategories();
    const catInfo = categories.find(c => c.name === catName);
    if (iconBox) {
        iconBox.textContent = catInfo ? (catInfo.icon || '📁') : '📁';
        iconBox.style.background = catInfo ? (catInfo.color || 'rgba(255,255,255,0.05)') : 'rgba(255,255,255,0.05)';
    }

    if (!list) return;
    list.innerHTML = `<p style="text-align: center; opacity: 0.5; font-size: 0.8rem; padding: 20px;">Fetching subscriptions...</p>`;

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
                    <p style="font-size: 0.8rem; color: var(--text-secondary); opacity: 0.6;">No subscriptions found in this category</p>
                </div>
            `;
            return;
        }

        list.innerHTML = `
            <div class="latest-list" style="margin-top: 0; padding: 0;">
                ${subs.map(sub => {
                    // Use report data for display formatting if available
                    const report = window.lastReport || { total: 0, symbol: '$', currency: 'USD', rates: null };
                    const settings = (window.userProfile && window.userProfile.settings) || {};
                    const targetCurrency = report.currency;
                    const targetSymbol = report.symbol;
                    const useAutoCurrency = settings.autoCurrency !== false || settings.usdTotal;

                    let displayPrice = `${sub.symbol || '$'}${parseFloat(sub.price).toFixed(2)}`;
                    
                    if (useAutoCurrency && report.rates && (sub.currency || 'USD') !== targetCurrency) {
                        const convertedPrice = window.getConvertedPrice ? window.getConvertedPrice(parseFloat(sub.price), sub.currency || 'USD', targetCurrency, report.rates) : parseFloat(sub.price);
                        displayPrice = `${displayPrice} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${targetSymbol}${convertedPrice.toFixed(2)}`;
                    }

                    sub.displayPrice = displayPrice;

                    if (window.getSwipeTemplate) {
                        return window.getSwipeTemplate(sub);
                    }
                    return `<div style="padding: 10px; color: white;">${sub.name}</div>`;
                }).join('')}
            </div>
        `;

        // Attach Swipe Events if available
        if (window.attachSwipeEvents) {
            window.attachSwipeEvents();
        }

    } catch (err) {
        console.error('[Explorer] Error:', err);
        list.innerHTML = `<p style="color: var(--accent-red); font-size: 0.8rem; text-align: center; padding: 20px;">Failed to load subscriptions</p>`;
    }
}
