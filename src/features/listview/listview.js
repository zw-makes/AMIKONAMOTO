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

    // Initial Scroll Listener Logic - ATTACHED TO PARENT SCROLL ROOT
    let lastScrollY = 0;
    const legendBox = document.querySelector('.calendar-legend-box');

    parent.addEventListener('scroll', () => {
        // Only trigger scroll hiding if list view is active
        if (!listViewActive || !legendBox) return;

        const currentScrollY = parent.scrollTop;

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
    const parent = document.querySelector('.calendar-container');
    
    listViewActive = !listViewActive;
    if (window.HapticsService) window.HapticsService.medium();
    
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
    const report = window.lastReport || { total: 0, activeSubs: [], symbol: '$', currency: 'USD', rates: null };
    
    const monthlyTotal = report.total;
    const activeSubs = report.activeSubs;
    const targetSymbol = report.symbol;
    const targetCurrency = report.currency;

    // Use filtered subscriptions from main.js
    const subs = window.getDisplaySubscriptions ? window.getDisplaySubscriptions() : (window.subscriptions || []);
    const relevantSubs = subs.filter(s => {
        if (typeof window.isSubRelevantToMonth === 'function') {
            return window.isSubRelevantToMonth(s, currentDate);
        }
        return true;
    });

    const activeCount = relevantSubs.filter(s => !s.stopped).length;

    const weekSpending = [0, 0, 0, 0, 0, 0, 0];
    const weekLogos = [[], [], [], [], [], [], []];

    activeSubs.forEach(s => {
        let p = parseFloat(s.price);
        if (window.getConvertedPrice && report.rates) {
            p = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, report.rates);
        }
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), s.date);
        const dayOfWeek = dateObj.getDay();
        weekSpending[dayOfWeek] += p;

        const domain = getSubDomain(s);
        weekLogos[dayOfWeek].push({ domain, price: p, sub: s });
    });

    const maxSpend = Math.max(...weekSpending, 20);
    const chartMax = Math.ceil(maxSpend / 20) * 20;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    
    listViewContainer.innerHTML = `
        <div class="spending-card" style="animation: none;">
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
                        
                        const topLogos = weekLogos[i]
                            .sort((a, b) => b.price - a.price)
                            .slice(0, 3)
                            .map(l => `<img src="https://icon.horse/icon/${l.domain}" class="chart-mini-logo" onerror="this.style.display='none'">`)
                            .join('');

                        return `
                        <div class="chart-bar-group">
                            <div class="chart-bar ${amount === 0 ? 'empty' : ''}" style="height: ${Math.max(amount === 0 ? 5 : height, 5)}%"></div>
                            <span class="chart-day-label">${days[i]}</span>
                            <div class="chart-logos-container">
                                ${topLogos}
                            </div>
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
                  (function() {
                      const monthEvents = [];
                      relevantSubs.forEach(s => {
                          const sDates = window.getSubDates ? window.getSubDates(s) : null;
                          let endDay = -1;
                          if (sDates && sDates.end) {
                              if (sDates.end.getMonth() === currentDate.getMonth() && sDates.end.getFullYear() === currentDate.getFullYear()) {
                                  endDay = sDates.end.getDate();
                              }
                          }
                          
                          monthEvents.push({ day: parseInt(s.date), sub: s, isEndEvent: false });
                          
                          if (endDay !== -1 && endDay !== parseInt(s.date)) {
                              const clone = Object.assign({}, s);
                              clone.id = clone.id + 99999;
                              monthEvents.push({ day: endDay, sub: clone, isEndEvent: true });
                          }
                      });
                      
                      monthEvents.sort((a, b) => a.day - b.day);
                      
                      let lastDay = null;
                      return monthEvents.map(event => {
                          const s = event.sub;
                          const useAutoCurrency = settings.autoCurrency !== false || settings.usdTotal;
                          
                          let displayPrice = `${s.symbol || '$'}${parseFloat(s.price).toFixed(2)}`;
                          if (useAutoCurrency && report.rates && (s.currency || 'USD') !== targetCurrency) {
                              const convertedPrice = window.getConvertedPrice ? window.getConvertedPrice(parseFloat(s.price), s.currency || 'USD', targetCurrency, report.rates) : parseFloat(s.price);
                              displayPrice = `${displayPrice} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${targetSymbol}${convertedPrice.toFixed(2)}`;
                          }
                          
                          s.displayPrice = displayPrice;
                          s.isCarryOver = false;
                          
                          if (event.isEndEvent) {
                              s.isCarryOver = true;
                              s.displayPrice = `<span style="font-size:0.65rem; opacity:0.6; letter-spacing:0.05em; font-weight:700;">ENDS CURRENT</span>`;
                          } else {
                              const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                              const sDates = window.getSubDates ? window.getSubDates(s) : null;
                              const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
                              if (sDates && sDates.start) {
                                  if (s.type === 'yearly' && currentDate.getMonth() !== sDates.start.getMonth()) {
                                      s.isCarryOver = true;
                                      s.displayPrice = `<span style="font-size:0.65rem; opacity:0.6; letter-spacing:0.05em; font-weight:700;">PREVIOUS</span>`;
                                  } else if (isMultiMonthTrial && (currentDate.getMonth() !== sDates.start.getMonth() || currentDate.getFullYear() !== sDates.start.getFullYear())) {
                                      s.isCarryOver = true;
                                      s.displayPrice = `<span style="font-size:0.65rem; opacity:0.6; letter-spacing:0.05em; font-weight:700;">PREVIOUS</span>`;
                                  } else if (sDates.end && sDates.start < viewStart && s.type !== 'yearly' && !isMultiMonthTrial) {
                                      s.isCarryOver = true;
                                      s.displayPrice = `<span style="font-size:0.65rem; opacity:0.6; letter-spacing:0.05em; font-weight:700;">PREVIOUS</span>`;
                                  }
                              }
                          }
                          
                          let headerHtml = '';
                          if (event.day !== lastDay) {
                              headerHtml = `<div class="detail-section-header">${monthName.toUpperCase()} ${event.day}</div>`;
                              lastDay = event.day;
                          }
                          
                          if (window.getSwipeTemplate) {
                              return headerHtml + window.getSwipeTemplate(s);
                          }
                          return '';
                      }).join('');
                  })()
                }
            </div>
        </div>
    `;

    setTimeout(() => {
        if (typeof window.attachSwipeEvents === 'function') {
            window.attachSwipeEvents();
        }

        // Attach Chart Tooltips
        const barGroups = listViewContainer.querySelectorAll('.chart-bar-group');
        barGroups.forEach((group, i) => {
            const bar = group.querySelector('.chart-bar');
            if (!bar) return;

            const daySubs = weekLogos[i].map(l => l.sub);
            if (daySubs.length === 0) return;

            let holdTimer;
            const startHold = (e) => {
                holdTimer = setTimeout(() => {
                   if (window.showTooltip) window.showTooltip(e, daySubs);
                }, 300); // Faster for list view? 
            };
            const clearHold = () => {
                clearTimeout(holdTimer);
                if (window.hideTooltip) window.hideTooltip();
            };

            bar.addEventListener('mousedown', startHold);
            bar.addEventListener('touchstart', startHold, { passive: true });
            bar.addEventListener('mouseup', clearHold);
            bar.addEventListener('mouseleave', clearHold);
            bar.addEventListener('touchend', clearHold);
            bar.addEventListener('touchmove', (e) => {
                clearTimeout(holdTimer);
                if (window.hideTooltip) window.hideTooltip();
            }, { passive: true });
            bar.addEventListener('contextmenu', (e) => e.preventDefault());
            
            // Also supports simple hover for non-touch
            bar.addEventListener('mouseenter', (e) => {
                if (window.showTooltip) window.showTooltip(e, daySubs);
            });
            bar.addEventListener('mousemove', (e) => {
                if (window.moveTooltip) window.moveTooltip(e);
            });
            bar.addEventListener('mouseleave', () => {
                if (window.hideTooltip) window.hideTooltip();
            });
        });
    }, 100);
}

// Global expose
window.toggleListView = toggleListView;
window.renderListView = renderListView;
window.listViewActive = () => listViewActive;
