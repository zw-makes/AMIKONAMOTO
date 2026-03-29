import './search.css';

export function openSearchModal() {
    let overlay = document.getElementById('search-modal-overlay');
    if (!overlay) {
        overlay = createSearchModal();
    }
    overlay.classList.remove('hidden');

    // Focus input and reset state
    setTimeout(() => {
        const input = document.getElementById('search-input');
        input.value = '';
        input.focus();
        updateSearchState('');
    }, 100);
}

function createSearchModal() {
    const overlay = document.createElement('div');
    overlay.id = 'search-modal-overlay';
    overlay.className = 'modal-overlay hidden';

    overlay.innerHTML = `
        <div id="search-container" class="search-container">
            <header class="search-header">
                <div class="search-bar-pill">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="search-icon">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input type="text" id="search-input" placeholder="Search subscriptions..." autocomplete="off">
                </div>
                <button id="close-search-btn" title="Close Search">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </header>

            <div id="search-content" class="search-content">
                <!-- Search Empty State -->
                <div id="search-empty-state" class="search-empty-state">
                    <div class="empty-state-icon">
                         <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </div>
                    <h2 class="empty-state-title">Search Subscriptions</h2>
                    <p class="empty-state-subtitle">Enter a name to find your subscriptions</p>
                </div>

                <!-- Search Results List -->
                <div id="search-results" class="search-results hidden">
                    <div id="search-results-list" class="search-results-list"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-search-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    const input = document.getElementById('search-input');
    input.addEventListener('input', (e) => {
        updateSearchState(e.target.value);
    });

    return overlay;
}

function updateSearchState(query) {
    const emptyState = document.getElementById('search-empty-state');
    const resultsContainer = document.getElementById('search-results');

    if (!query.trim()) {
        emptyState.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
        if (window.HapticsService) window.HapticsService.selection();
        renderResults(query);
    }
}

function getDomain(sub) {
    const brandMap = {
        'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
        'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
        'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
        'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
        'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so'
    };
    let nameLower = sub.name.toLowerCase().trim();
    let domain = sub.domain || brandMap[nameLower] || nameLower.replace(/\s+/g, '') + '.com';
    if (domain.startsWith('http')) {
        try { domain = new URL(domain).hostname; } catch (e) { }
    }
    return domain;
}

function getSubEndDate(sub) {
    const start = new Date(sub.startDate);
    let end = null;
    if (sub.type === 'trial' || (sub.type === 'monthly' && sub.recurring !== 'recurring') || sub.type === 'one-time') {
        end = new Date(start);
        if (sub.type === 'trial') {
            const tDays = parseInt(sub.trialDays) || 0;
            const tMonths = parseInt(sub.trialMonths) || 0;
            end.setMonth(end.getMonth() + tMonths);
            end.setDate(end.getDate() + tDays);
        } else {
            end.setMonth(end.getMonth() + 1);
        }
    } else if (sub.type === 'yearly') {
        end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);
    }
    return end;
}

function renderResults(query) {
    const list = document.getElementById('search-results-list');
    const subs = window.subscriptions || [];

    const filtered = subs.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="search-empty">No results found for "${query}"</div>`;
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    list.innerHTML = filtered.map(sub => {
        const domain = getDomain(sub);
        const logoUrl = domain.startsWith('data:image') ? domain : `https://icon.horse/icon/${domain}`;
        
        // Calculate Ended Status
        const endDate = getSubEndDate(sub);
        const isEnded = endDate && today > endDate;
        const isStopped = sub.stopped;
        
        let statusTag = '';
        if (isStopped) {
            statusTag = '<span class="status-tag-search stopped">STOPPED</span>';
        } else if (isEnded) {
            statusTag = '<span class="status-tag-search ended">ENDED</span>';
        } else {
            statusTag = '<span class="status-tag-search active">ACTIVE</span>';
        }

        const subData = encodeURIComponent(JSON.stringify(sub));

        return `
            <div class="search-result-item" data-sub="${subData}">
                <div class="search-result-icon">
                    <img src="${logoUrl}" alt="${sub.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'white\\' stroke-width=\\'2\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/></svg>'">
                </div>
                <div class="search-result-details">
                    <div class="search-result-name">${sub.name}</div>
                    <div class="search-result-meta">
                        <span>${sub.type}</span>
                        <span>${sub.currency || '$'} ${sub.price}</span>
                        ${statusTag}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events
    const items = list.querySelectorAll('.search-result-item');
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            const overlay = document.getElementById('search-modal-overlay');
            if (window.HapticsService) window.HapticsService.success();
            overlay.classList.add('hidden');

            try {
                const subObj = JSON.parse(decodeURIComponent(item.dataset.sub));
                
                // Navigate the global calendar context to the subscription's month/year
                if (window.currentDate) {
                    const subStartDate = new Date(subObj.startDate);
                    // Use the 1st of the month for the global navigator to avoid day-overflow bugs
                    window.currentDate = new Date(subStartDate.getFullYear(), subStartDate.getMonth(), 1);
                    
                    if (typeof window.renderCalendar === 'function') window.renderCalendar();
                    if (typeof window.renderHeader === 'function') window.renderHeader();
                    if (typeof window.updateStats === 'function') window.updateStats();
                }

                if (typeof window.showDayDetails === 'function') {
                    // Find all subs for that same day in the newly navigated month
                    const allSubs = window.subscriptions || [];
                    const daySubs = allSubs.filter(s => s.date === subObj.date);
                    window.showDayDetails(subObj.date, daySubs);
                }
            } catch (err) {
                console.error('Failed to parse search result click:', err);
            }
        });
    });
}
