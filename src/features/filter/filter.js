/**
 * Filter Feature Module
 * Handles subscription filtering by platform, frequency, and currency.
 * Replicates "Add Subscription" smart logic for inputs.
 */

let filters = {
    name: '',
    frequency: 'all',
    currency: 'all',
    status: 'all'
};

export function initFilter() {
    console.log('[Filter] Initialized');
    
    // Expose toggle globally
    window.toggleFilterModal = toggleFilterModal;
    window.applyFilters = applyFilters;
    window.clearFilters = clearFilters;
    window.getGlobalFilters = () => filters;

    setupPlatformPicker();
    setupCurrencyPicker();
}

export function toggleFilterModal(show = true) {
    const modal = document.getElementById('filter-modal');
    if (!modal) return;

    if (show) {
        modal.classList.remove('hidden');
        resetModalUI();
    } else {
        modal.classList.add('hidden');
    }
}

function resetModalUI() {
    // Platform
    const nameInput = document.getElementById('filter-platform-name');
    nameInput.value = filters.name;
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
            <img src="https://icon.horse/icon/${app.domain}" style="width:20px; height:20px;">
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
    preview.innerHTML = `<img src="https://icon.horse/icon/${domainOrUrl}" style="width:100%; height:100%; object-fit:contain;">`;
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
                       filters.status !== 'all';

    const headerBadge = document.getElementById('filter-badge-header');
    const optBadge = document.getElementById('filter-badge-opt');

    if (headerBadge) headerBadge.classList.toggle('hidden', !isFiltered);
    if (optBadge) optBadge.classList.toggle('hidden', !isFiltered);
}

// --- Global Actions ---
export function applyFilters() {
    filters.name = document.getElementById('filter-platform-name').value.trim();
    filters.currency = document.getElementById('filter-currency-val').value;
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
        status: 'all'
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
});
