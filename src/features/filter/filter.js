/**
 * Filter Feature Module
 * Handles subscription filtering by platform, frequency, and currency.
 * Replicates "Add Subscription" smart logic for inputs.
 */

let filters = {
    name: '',
    frequency: 'all',
    currency: 'all',
    status: 'all',
    category: 'all',
    nexus: 'all'
};


// Expose actions globally immediately
window.toggleFilterModal = toggleFilterModal;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;

export function initFilter() {
    console.log('[Filter] Initialized');
    
    // Expose remaining data globally
    window.getGlobalFilters = () => filters;
    window.setCategoryFilter = (catName) => {
        filters.category = catName;
        updateFilterBadges();
        if (window.renderCalendar) window.renderCalendar();
        if (window.updateStats) window.updateStats();
        
        // Show a little toast or badge to show we are filtered
        console.log(`[Filter] Dashboard filtered by category: ${catName}`);
    };

    setupPlatformPicker();
    setupCategoryPicker();
    setupNexusPicker();
    setupCurrencyPicker();

    // Drag is initialized lazily on first open to avoid race conditions
}

let _filterDragInitialized = false;
let _filterBackdropInitialized = false;

export function toggleFilterModal(show = true) {
    const modal = document.getElementById('filter-modal');
    if (!modal) return;

    if (show) {
        modal.classList.remove('hidden');
        resetModalUI();

        // Lazy drag init: attach once, after modal is visible & elements are in DOM
        if (!_filterDragInitialized) {
            _filterDragInitialized = true;
            if (window.initBottomSheetDrag) {
                window.initBottomSheetDrag('filter-sheet-content', 'filter-drag-area', 'filter-modal');
            }
        }

        // Lazy backdrop click-to-close: attach once
        if (!_filterBackdropInitialized) {
            _filterBackdropInitialized = true;
            modal.addEventListener('click', (e) => {
                // Only close when tapping the bare overlay, not any children
                if (e.target === modal) {
                    toggleFilterModal(false);
                }
            });
        }
    } else {
        modal.classList.add('hidden');
    }
}

function resetModalUI() {
    // Platform
    const nameInput = document.getElementById('filter-platform-name');
    if (nameInput) nameInput.value = filters.name;
    updateFilterPlatformIcon(null);
    
    // Frequency Tags
    document.querySelectorAll('.filter-freq-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.value === filters.frequency);
    });

    // Status Tags
    document.querySelectorAll('.filter-status-tag').forEach(tag => {
        tag.classList.toggle('active', tag.dataset.value === filters.status);
    });

    // Currency
    const codeSpan = document.getElementById('filter-currency-code');
    const symbolSpan = document.getElementById('filter-currency-symbol');
    const hiddenCurrency = document.getElementById('filter-currency-val');
    
    if (codeSpan && symbolSpan) {
        if (filters.currency === 'all') {
            codeSpan.innerText = 'Any Currency';
            symbolSpan.innerText = '?';
            if (hiddenCurrency) hiddenCurrency.value = 'all';
        } else {
            codeSpan.innerText = filters.currency;
            if (hiddenCurrency) hiddenCurrency.value = filters.currency;
            const cur = (window.CURRENCIES || []).find(c => c.code === filters.currency);
            symbolSpan.innerText = cur ? cur.symbol : '';
        }
    }
    
    // Category
    const catText = document.getElementById('filter-category-text');
    const catIcon = document.getElementById('filter-category-icon');
    const catVal = document.getElementById('filter-category-val');
    if (catText && catIcon && catVal) {
        if (filters.category === 'all') {
            catText.innerText = 'All';
            catIcon.innerText = '📁';
            catVal.value = 'all';
        } else {
            catText.innerText = filters.category;
            catVal.value = filters.category;
            const cats = (window.getCategories && typeof window.getCategories === 'function') ? window.getCategories() : [];
            const found = cats.find(c => c.name === filters.category);
            catIcon.innerText = found ? (found.icon || '📁') : '📁';
        }
    }

    // Nexus
    const nexusText = document.getElementById('filter-nexus-text');
    const nexusIcon = document.getElementById('filter-nexus-icon');
    const nexusVal = document.getElementById('filter-nexus-val');
    if (nexusText && nexusIcon && nexusVal) {
        if (filters.nexus === 'all') {
            nexusText.innerText = 'All Cards';
            nexusIcon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>';
            nexusVal.value = 'all';
        } else {
            nexusVal.value = filters.nexus;
            const getCards = window.getStoredCards || window.getStoredCardsFromCache;
            if (getCards) {
                Promise.resolve(getCards()).then(cards => {
                    const card = cards.find(c => c.id === filters.nexus);
                    if (card) {
                        const isPhys = ['visa','mastercard','amex','discover','jcb','debit','credit'].includes(card.type);
                        nexusText.innerText = `Nexus: ${isPhys ? '•••• ' + card.last4 : card.name || card.type}`;
                        const logoMap = { 'visa': 'https://cdn.simpleicons.org/visa/white', 'mastercard': 'https://cdn.simpleicons.org/mastercard/white', 'amex': 'https://cdn.simpleicons.org/americanexpress/white', 'discover': 'https://cdn.simpleicons.org/discover/white', 'jcb': 'https://cdn.simpleicons.org/jcb/white', 'paypal': 'https://cdn.simpleicons.org/paypal/white', 'applepay': 'https://cdn.simpleicons.org/applepay/white', 'googlepay': 'https://cdn.simpleicons.org/googlepay/white' };
                        nexusIcon.innerHTML = `<img src="${logoMap[card.type] || '/sublify-logo.png'}" style="width: 100%; height: 100%; object-fit: contain;">`;
                    }
                });
            }
        }
    }
}

// --- Platform Picker Logic ---
function setupPlatformPicker() {
    const trigger = document.getElementById('filter-platform-trigger');
    const dropdown = document.getElementById('filter-platform-dropdown');
    const search = document.getElementById('filter-platform-search');
    const nameInput = document.getElementById('filter-platform-name');

    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderFilterPlatformList('');
            search.value = '';
            search.focus();
        }
    });

    search.addEventListener('input', (e) => {
        renderFilterPlatformList(e.target.value);
    });

    nameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        const apps = window.popularApps || [];
        const getDomain = window.getDomain;

        if (val) {
            const match = apps.find(app => app.name.toLowerCase() === val.toLowerCase());
            if (match) {
                updateFilterPlatformIcon(match.domain);
            } else if (getDomain) {
                const domain = getDomain({ name: val, domain: '' });
                updateFilterPlatformIcon(domain);
            }
        } else {
            updateFilterPlatformIcon(null);
        }
    });

    // Close on outside click is handled by a global listener below
}

function renderFilterPlatformList(filter = '') {
    const list = document.getElementById('filter-platform-list');
    const apps = window.popularApps || [];
    if (!list) return;

    list.innerHTML = '';
    const filtered = apps.filter(app => app.name.toLowerCase().includes(filter.toLowerCase()));

    filtered.forEach(app => {
        const li = document.createElement('li');
        li.innerHTML = `
            <img src="${window.getLogoUrl(app.domain)}" style="width:20px; height:20px;">
            <span>${app.name}</span>
        `;
        li.addEventListener('click', () => {
            document.getElementById('filter-platform-name').value = app.name;
            updateFilterPlatformIcon(app.domain);
            document.getElementById('filter-platform-dropdown').classList.add('hidden');
        });
        list.appendChild(li);
    });
}

function updateFilterPlatformIcon(domainOrUrl) {
    const preview = document.getElementById('filter-platform-icon');
    if (!preview) return;

    if (!domainOrUrl) {
        preview.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`;
        return;
    }
    preview.innerHTML = `<img src="${window.getLogoUrl(domainOrUrl)}" style="width:100%; height:100%; object-fit:contain;">`;
}

// --- Category Picker Logic ---
function setupCategoryPicker() {
    const trigger = document.getElementById('filter-category-trigger');
    const dropdown = document.getElementById('filter-category-dropdown');
    const list = document.getElementById('filter-category-list');
    
    if (!trigger || !dropdown || !list) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.HapticsService) window.HapticsService.light();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderFilterCategoryList(list);
        }
    });
}

function renderFilterCategoryList(list) {
    list.innerHTML = '';
    const cats = (window.getCategories && typeof window.getCategories === 'function') ? window.getCategories() : [];
    
    // Add "All"
    const allLi = document.createElement('li');
    allLi.innerHTML = `<span style="font-size: 1.1rem;">📁</span> <span style="font-size: 0.85rem; font-weight: 500;">All</span>`;
    allLi.style.cssText = "padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;";
    allLi.addEventListener('click', () => {
        if (window.HapticsService) window.HapticsService.light();
        selectFilterCategory('all', '📁');
    });
    list.appendChild(allLi);

    cats.forEach(cat => {
        const li = document.createElement('li');
        li.innerHTML = `<span style="font-size: 1.1rem;">${cat.icon || '📁'}</span> <span style="font-size: 0.85rem; font-weight: 500;">${cat.name}</span>`;
        li.style.cssText = "padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;";
        li.addEventListener('click', () => {
            if (window.HapticsService) window.HapticsService.light();
            selectFilterCategory(cat.name, cat.icon);
        });
        list.appendChild(li);
    });
}

function selectFilterCategory(name, icon) {
    document.getElementById('filter-category-val').value = name;
    document.getElementById('filter-category-text').innerText = name === 'all' ? 'All' : name;
    document.getElementById('filter-category-icon').innerText = icon || '📁';
    document.getElementById('filter-category-dropdown').classList.add('hidden');
}

// --- Nexus Picker Logic ---
function setupNexusPicker() {
    const trigger = document.getElementById('filter-nexus-trigger');
    const dropdown = document.getElementById('filter-nexus-dropdown');
    const list = document.getElementById('filter-nexus-list');
    
    if (!trigger || !dropdown || !list) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.HapticsService) window.HapticsService.light();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderFilterNexusList(list);
        }
    });
}

function renderFilterNexusList(list) {
    list.innerHTML = '';
    
    // Add "All Cards"
    const allLi = document.createElement('li');
    allLi.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center; padding: 12px 16px; cursor: pointer;">
            <span style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></span>
            <span style="font-size: 0.85rem; font-weight: 500;">All Cards</span>
        </div>
    `;
    allLi.addEventListener('click', () => {
        if (window.HapticsService) window.HapticsService.light();
        selectFilterNexus('all', null);
    });
    list.appendChild(allLi);

    const getCards = window.getStoredCards || window.getStoredCardsFromCache;
    if (getCards) {
        Promise.resolve(getCards()).then(cards => {
            cards.forEach(card => {
                const li = document.createElement('li');
                const isPhys = ['visa','mastercard','amex','discover','jcb','debit','credit'].includes(card.type);
                const name = isPhys ? `•••• ${card.last4}` : card.name || card.type;
                const logoMap = { 'visa': 'https://cdn.simpleicons.org/visa/white', 'mastercard': 'https://cdn.simpleicons.org/mastercard/white', 'amex': 'https://cdn.simpleicons.org/americanexpress/white', 'discover': 'https://cdn.simpleicons.org/discover/white', 'jcb': 'https://cdn.simpleicons.org/jcb/white', 'paypal': 'https://cdn.simpleicons.org/paypal/white', 'applepay': 'https://cdn.simpleicons.org/applepay/white', 'googlepay': 'https://cdn.simpleicons.org/googlepay/white' };
                const logoSrc = logoMap[card.type] || '/sublify-logo.png';
                
                li.innerHTML = `
                    <div style="display: flex; gap: 10px; align-items: center; padding: 12px 16px; cursor: pointer;">
                        <span style="width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><img src="${logoSrc}" style="width: 100%; height: 100%; object-fit: contain;"></span>
                        <span style="font-size: 0.85rem; font-weight: 500;">Nexus: ${name}</span>
                    </div>
                `;
                li.addEventListener('click', () => {
                    if (window.HapticsService) window.HapticsService.light();
                    selectFilterNexus(card.id, card);
                });
                list.appendChild(li);
            });
        });
    }
}

function selectFilterNexus(id, card) {
    document.getElementById('filter-nexus-val').value = id;
    const text = document.getElementById('filter-nexus-text');
    const icon = document.getElementById('filter-nexus-icon');
    
    if (id === 'all') {
        text.innerText = 'All Cards';
        icon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>';
    } else if (card) {
        const isPhys = ['visa','mastercard','amex','discover','jcb','debit','credit'].includes(card.type);
        text.innerText = `Nexus: ${isPhys ? '•••• ' + card.last4 : card.name || card.type}`;
        const logoMap = { 'visa': 'https://cdn.simpleicons.org/visa/white', 'mastercard': 'https://cdn.simpleicons.org/mastercard/white', 'amex': 'https://cdn.simpleicons.org/americanexpress/white', 'discover': 'https://cdn.simpleicons.org/discover/white', 'jcb': 'https://cdn.simpleicons.org/jcb/white', 'paypal': 'https://cdn.simpleicons.org/paypal/white', 'applepay': 'https://cdn.simpleicons.org/applepay/white', 'googlepay': 'https://cdn.simpleicons.org/googlepay/white' };
        icon.innerHTML = `<img src="${logoMap[card.type] || '/sublify-logo.png'}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
    
    document.getElementById('filter-nexus-dropdown').classList.add('hidden');
}

// --- Currency Picker Logic ---
function setupCurrencyPicker() {
    const trigger = document.getElementById('filter-currency-trigger');
    const dropdown = document.getElementById('filter-currency-dropdown');
    const search = document.getElementById('filter-currency-search');

    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderFilterCurrencyList('');
            search.value = '';
            search.focus();
        }
    });

    search.addEventListener('input', (e) => {
        renderFilterCurrencyList(e.target.value);
    });
}

function renderFilterCurrencyList(filterText = '') {
    const list = document.getElementById('filter-currency-list');
    const currencies = window.CURRENCIES || [];
    if (!list) return;

    list.innerHTML = '';
    
    // Add "Any Currency" option
    const allLi = document.createElement('li');
    allLi.innerHTML = `<span class="cur-symbol">?</span> Any Currency`;
    allLi.addEventListener('click', () => selectFilterCurrency('all', '?'));
    list.appendChild(allLi);

    const filtered = currencies.filter(c =>
        c.name.toLowerCase().includes(filterText.toLowerCase()) ||
        c.code.toLowerCase().includes(filterText.toLowerCase())
    );

    filtered.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="cur-symbol">${c.symbol}</span> ${c.code} – ${c.name}`;
        li.addEventListener('click', () => selectFilterCurrency(c.code, c.symbol));
        list.appendChild(li);
    });
}

function selectFilterCurrency(code, symbol) {
    document.getElementById('filter-currency-val').value = code;
    document.getElementById('filter-currency-code').innerText = code === 'all' ? 'Any Currency' : code;
    document.getElementById('filter-currency-symbol').innerText = symbol;
    document.getElementById('filter-currency-dropdown').classList.add('hidden');
}

function updateFilterBadges() {
    const isFiltered = filters.name !== '' || 
                       filters.frequency !== 'all' || 
                       filters.currency !== 'all' || 
                       filters.status !== 'all' ||
                       filters.category !== 'all' ||
                       filters.nexus !== 'all';

    const headerBadge = document.getElementById('filter-badge-header');
    const optBadge = document.getElementById('filter-badge-opt');

    if (headerBadge) headerBadge.classList.toggle('hidden', !isFiltered);
    if (optBadge) optBadge.classList.toggle('hidden', !isFiltered);
}

// --- Global Actions ---
export function applyFilters() {
    filters.name = document.getElementById('filter-platform-name').value.trim();
    filters.currency = document.getElementById('filter-currency-val').value;
    filters.category = document.getElementById('filter-category-val')?.value || 'all';
    filters.nexus = document.getElementById('filter-nexus-val')?.value || 'all';
    // frequency and status are managed by buttons

    console.log('[Filter] Applying:', filters);
    
    updateFilterBadges();

    if (window.renderCalendar) window.renderCalendar();
    if (window.updateStats) window.updateStats();

    toggleFilterModal(false);
}

export function clearFilters() {
    filters = {
        name: '',
        frequency: 'all',
        currency: 'all',
        status: 'all',
        category: 'all',
        nexus: 'all'
    };
    resetModalUI();
    updateFilterBadges();
    applyFilters();
}

// Global UI Listeners
document.addEventListener('click', (e) => {
    // Frequency tags
    if (e.target.classList.contains('filter-freq-tag')) {
        filters.frequency = e.target.dataset.value;
        document.querySelectorAll('.filter-freq-tag').forEach(tag => {
            tag.classList.toggle('active', tag.dataset.value === filters.frequency);
        });
    }

    // Status Tags
    if (e.target.classList.contains('filter-status-tag')) {
        filters.status = e.target.dataset.value;
        document.querySelectorAll('.filter-status-tag').forEach(tag => {
            tag.classList.toggle('active', tag.dataset.value === filters.status);
        });
    }

    // Outside clicks for dropdowns
    const pPicker = document.getElementById('filter-platform-picker');
    if (pPicker && !pPicker.contains(e.target)) {
        document.getElementById('filter-platform-dropdown')?.classList.add('hidden');
    }
    const cPicker = document.getElementById('filter-currency-picker');
    if (cPicker && !cPicker.contains(e.target)) {
        document.getElementById('filter-currency-dropdown')?.classList.add('hidden');
    }
    const catPicker = document.getElementById('filter-category-picker');
    if (catPicker && !catPicker.contains(e.target)) {
        document.getElementById('filter-category-dropdown')?.classList.add('hidden');
    }
    const nexPicker = document.getElementById('filter-nexus-picker');
    if (nexPicker && !nexPicker.contains(e.target)) {
        document.getElementById('filter-nexus-dropdown')?.classList.add('hidden');
    }
});
