import './listview.css';

let listViewContainer = null;
let listViewActive = false;

const LIST_ICON = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
`;

const CALENDAR_ICON = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
`;

export function initListView() {
    const parent = document.querySelector('.calendar-container');
    if (!parent || document.getElementById('list-view-container')) return;

    listViewContainer = document.createElement('div');
    listViewContainer.id = 'list-view-container';
    listViewContainer.className = 'list-view-container hidden';
    parent.appendChild(listViewContainer);

    // Initial Scroll Listener Logic
    let lastScrollY = 0;
    const legendBox = document.querySelector('.calendar-legend-box');

    listViewContainer.addEventListener('scroll', () => {
        const currentScrollY = listViewContainer.scrollTop;
        if (!legendBox) return;

        // Hide on scroll down, show on scroll up
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            legendBox.classList.add('hidden-scrolled');
        } else {
            legendBox.classList.remove('hidden-scrolled');
        }
        lastScrollY = currentScrollY;
    }, { passive: true });
}

export function toggleListView(btn) {
    const calendarGrid = document.getElementById('calendar-grid');
    const weekdayHeader = document.querySelector('.weekday-header');
    
    listViewActive = !listViewActive;
    
    if (listViewActive) {
        btn.innerHTML = CALENDAR_ICON;
        btn.title = "Calendar View";
        btn.classList.add('magic-active');
        calendarGrid.classList.add('hidden');
        if (weekdayHeader) weekdayHeader.classList.add('hidden');
        listViewContainer.classList.remove('hidden');
        renderListView();
    } else {
        btn.innerHTML = LIST_ICON;
        btn.title = "List View";
        btn.classList.remove('magic-active');
        calendarGrid.classList.remove('hidden');
        if (weekdayHeader) weekdayHeader.classList.remove('hidden');
        listViewContainer.classList.add('hidden');
        // Reset legend box just in case
        const legendBox = document.querySelector('.calendar-legend-box');
        if (legendBox) legendBox.classList.remove('hidden-scrolled');
    }
}

function getSubDomain(sub) {
    const brandMap = {
        'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
        'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
        'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
        'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
        'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so'
    };
    let nameLower = (sub.name || '').toLowerCase().trim();
    let domain = sub.domain || brandMap[nameLower] || nameLower.replace(/\s+/g, '') + '.com';
    return domain;
}

export function renderListView() {
    if (!listViewContainer || !listViewActive) return;

    const currentDate = window.currentDate || new Date();
    const settings = (window.userProfile && window.userProfile.settings) || {};
    const report = window.lastReport || { total: 0, activeSubs: [], symbol: '$', currency: 'USD' };
    
    const monthlyTotal = report.total;
    const activeSubs = report.activeSubs;
    const targetSymbol = report.symbol;
    const targetCurrency = report.currency;

    const subs = window.subscriptions || [];
    const relevantSubs = subs.filter(s => {
        if (typeof window.isSubRelevantToMonth === 'function') {
            return window.isSubRelevantToMonth(s, currentDate);
        }
        return true;
    });

    const activeCount = relevantSubs.filter(s => !s.stopped).length;

    const weekSpending = [0, 0, 0, 0, 0, 0, 0];
    activeSubs.forEach(s => {
        let p = parseFloat(s.price);
        if (window.getConvertedPrice && window.exchangeRates) {
            p = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, window.exchangeRates);
        }
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), s.date);
        const dayOfWeek = dateObj.getDay();
        weekSpending[dayOfWeek] += p;
    });

    const maxSpend = Math.max(...weekSpending, 20);
    const chartMax = Math.ceil(maxSpend / 20) * 20;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    
    listViewContainer.innerHTML = `
        <div class="spending-card">
            <div class="spending-header">
                <h3>${monthName.toUpperCase()} SPENDING (${targetCurrency})</h3>
                <div class="spending-total">${targetSymbol}${monthlyTotal.toFixed(2)}</div>
            </div>
            
            <div class="chart-container">
                <div class="chart-grid-lines">
                    <div class="chart-grid-line"></div>
                    <div class="chart-grid-line"></div>
                    <div class="chart-grid-line"></div>
                    <div class="chart-grid-line"></div>
                    <div class="chart-grid-line"></div>
                </div>
                <div class="chart-y-axis">
                    <span>0</span>
                    <span>${(chartMax * 0.25).toFixed(0)}</span>
                    <span>${(chartMax * 0.5).toFixed(0)}</span>
                    <span>${(chartMax * 0.75).toFixed(0)}</span>
                    <span>${chartMax}</span>
                </div>
                <div class="chart-bars">
                    ${weekSpending.map((amount, i) => {
                        const height = (amount / chartMax) * 100;
                        return `
                        <div class="chart-bar-group">
                            <div class="chart-bar ${amount === 0 ? 'empty' : ''}" style="height: ${Math.max(amount === 0 ? 5 : height, 5)}%"></div>
                            <span class="chart-day-label">${days[i]}</span>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>

        <div class="latest-section">
            <div class="latest-header">
                <h3>${monthName} Subscriptions</h3>
                <div class="latest-count">${relevantSubs.length} SUBSCRIPTIONS / ${activeCount} ACTIVE</div>
            </div>
            <div class="latest-list">
                ${relevantSubs.length === 0 ? '<div style="padding:40px; text-align:center; opacity:0.3; font-weight:700;">NO SUBSCRIPTIONS THIS MONTH</div>' : 
                  relevantSubs.sort((a, b) => a.date - b.date).map(s => {
                    const domain = getSubDomain(s);
                    const logoUrl = `https://icon.horse/icon/${domain}`;
                    const useAutoCurrency = settings.autoCurrency !== false || settings.usdTotal;
                    const displayPrice = window.getDisplayPrice ? window.getDisplayPrice(s, targetCurrency, useAutoCurrency, window.exchangeRates) : `${s.symbol || '$'}${s.price}`;
                    const dateStr = `${s.date} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

                    return `
                    <div class="latest-item" onclick="window.showSubscriptionDetails(${s.id}, event)">
                        <div class="latest-icon">
                            <img src="${logoUrl}" alt="${s.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'%23666\\' stroke-width=\\'2\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/></svg>'">
                        </div>
                        <div class="latest-info">
                            <div class="latest-name">${s.name} ${s.stopped ? '<span style="font-size:0.6rem; opacity:0.5;">(PAUSED)</span>' : ''}</div>
                            <div class="latest-date">${dateStr}</div>
                        </div>
                        <div class="latest-price">${displayPrice}</div>
                    </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

// Global expose
window.toggleListView = toggleListView;
window.renderListView = renderListView;
window.listViewActive = () => listViewActive;
