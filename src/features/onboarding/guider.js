import { HapticsService } from '../haptics/haptics.js';
import { initGuiderStep2 } from './guider-step2.js';


/**
 * Guider Feature: A cinematic feature tour for new users.
 * This is triggered after "Continue with Google" as requested.
 */
export async function initGuider() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  const guiderView = document.createElement('div');
  guiderView.id = 'guider-view';
  guiderView.className = 'guider-page hidden';

  // Sample data with real prices (INR base)
  const sampleSubs = [
    { name: 'Netflix', date: 2, domain: 'netflix.com', type: 'monthly', price: 649 },
    { name: 'Spotify', date: 4, domain: 'spotify.com', type: 'monthly', price: 119 },
    { name: 'Amazon Prime', date: 7, domain: 'amazon.com', type: 'monthly', price: 179 },
    { name: 'Apple Music', date: 7, domain: 'apple.com', type: 'yearly', price: 99 }, 
    { name: 'Disney+', date: 9, domain: 'disneyplus.com', type: 'monthly', price: 299 },
    { name: 'Hulu', date: 12, domain: 'hulu.com', type: 'trial', price: 0 },
    { name: 'Adobe CC', date: 15, domain: 'adobe.com', type: 'monthly', price: 4230 },
    { name: 'Figma', date: 15, domain: 'figma.com', type: 'monthly', price: 1130 }, 
    { name: 'Slack', date: 18, domain: 'slack.com', type: 'monthly', price: 525 },
    { name: 'Google Workspace', date: 21, domain: 'google.com', type: 'monthly', price: 130 },
    { name: 'Canva', date: 24, domain: 'canva.com', type: 'one-time', price: 499 },
    { name: 'LinkedIn Premium', date: 24, domain: 'linkedin.com', type: 'monthly', price: 2200 }, 
    { name: 'Zoom', date: 27, domain: 'zoom.us', type: 'monthly', price: 1300 },
    { name: 'Medium', date: 29, domain: 'medium.com', type: 'trial', price: 0 },
    { name: 'GitHub', date: 29, domain: 'github.com', type: 'monthly', price: 830 }
  ];

  // Calculate Total (Simplified for preview)
  const baseTotal = sampleSubs.reduce((acc, s) => acc + s.price, 0);
  let finalCurrency = 'INR';
  let finalTotalStr = `₹${baseTotal.toLocaleString()}`;

  // Calculate a projected yearly total for the secondary graph view
  let yearlyBaseTotal = 0;
  sampleSubs.forEach(s => {
      if (s.type === 'yearly') yearlyBaseTotal += s.price;
      else yearlyBaseTotal += (s.price * 12);
  });
  let yearlyTotalStr = `₹${yearlyBaseTotal.toLocaleString()}`;

  // Localized Currency Logic (Real-time Exchange Rates via Locale)
  try {
    const locale = navigator.language || 'en-IN';
    if (locale.includes('US')) finalCurrency = 'USD';
    else if (locale.includes('GB')) finalCurrency = 'GBP';
    else if (locale.includes('EU')) finalCurrency = 'EUR';

    const fetchRates = window.fetchExchangeRates || (async (base) => {
        const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const data = await res.json();
        return data.rates;
    });

    const rates = await fetchRates('INR');
    if (rates && rates[finalCurrency]) {
        const converted = baseTotal * rates[finalCurrency];
        const yearlyConverted = yearlyBaseTotal * rates[finalCurrency];
        
        const formatter = new Intl.NumberFormat(undefined, { 
            style: 'currency', 
            currency: finalCurrency, 
            maximumFractionDigits: 0 
        });
        
        finalTotalStr = formatter.format(converted);
        yearlyTotalStr = formatter.format(yearlyConverted);
    }
  } catch(e) {
      console.warn("Failed to fetch exchange rates in guider.", e);
  }


  // Dynamic current month/year
  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' }).toUpperCase();
  const currentYear = now.getFullYear();

  let calendarHTML = '';
  // Mirroring main.js 42-cell logic
  // We'll simulate Oct 2026: Starts on Thursday (firstDay = 3 in 0-6 index)
  // But wait, main.js uses firstDayOfMonth (Mon is 0), Oct 1 2026 is Thu -> 0:Mon, 1:Tue, 2:Wed, 3:Thu
  const firstDay = 3; 
  const daysInMonth = 31;
  const prevMonthMax = 30; // Sep

  // 1. Prev month trailing
  for (let i = firstDay - 1; i >= 0; i--) {
      calendarHTML += `<div class="guider-calendar-cell other-month"><span class="cell-date">${prevMonthMax - i}</span></div>`;
  }

  // 2. Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const daySubs = sampleSubs.filter(s => s.date === i);
    let subHTML = '';
    
    if (daySubs.length > 0) {
        let dotsHTML = '';
        let iconsHTML = '';
        
        daySubs.forEach((sub, idx) => {
            if (idx < 3) {
                // Color mapping from main.js logic
                let colorVar;
                if (sub.type === 'monthly') colorVar = 'var(--accent-green)';
                else if (sub.type === 'yearly') colorVar = 'var(--accent-blue)';
                else if (sub.type === 'one-time') colorVar = 'var(--accent-purple)';
                else colorVar = 'var(--accent-red)';

                dotsHTML += `<div class="guider-sub-dot" style="background: ${colorVar}; color: ${colorVar}"></div>`;
                iconsHTML += `
                    <div class="guider-sub-icon">
                        <img src="${window.getLogoUrl(sub.domain)}" alt="${sub.name}">
                    </div>
                `;
            }
        });

        subHTML = `
            <div class="guider-sub-dots-container">
                ${dotsHTML}
            </div>
            <div class="guider-sub-icons-container">
                ${iconsHTML}
            </div>
        `;
    }

    calendarHTML += `
      <div class="guider-calendar-cell ${i === 13 ? 'today' : ''}">
        <span class="cell-date">${i}</span>
        ${subHTML}
      </div>
    `;
  }

  // Calculate mock chart data for the Graph View
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekSpending = [0, 0, 0, 0, 0, 0, 0];
  const weekLogos = [[], [], [], [], [], [], []];

  sampleSubs.forEach(s => {
     const dayOfWeek = new Date(currentYear, now.getMonth(), s.date).getDay();
     weekSpending[dayOfWeek] += s.price;
     weekLogos[dayOfWeek].push(s);
  });

  const maxSpend = Math.max(...weekSpending, 20);
  const chartMax = Math.ceil(maxSpend / 20) * 20;

  let graphBarsHTML = '';
  weekSpending.forEach((amount, i) => {
      const height = (amount / chartMax) * 100;
      const topLogosHTML = weekLogos[i]
          .sort((a, b) => b.price - a.price)
          .slice(0, 3)
          .map(l => `<img src="${window.getLogoUrl(l.domain)}" class="chart-mini-logo">`)
          .join('');

      graphBarsHTML += `
      <div class="chart-bar-group">
          <div class="chart-bar ${amount === 0 ? 'empty' : ''}" style="height: ${Math.max(amount === 0 ? 5 : height, 5)}%;"></div>
          <span class="chart-day-label">${days[i]}</span>
          <div class="chart-logos-container">${topLogosHTML}</div>
      </div>
      `;
  });

  const graphHTML = `
      <div class="guider-graph-preview guider-view-layer guider-transparent">
          <div class="spending-card" style="box-shadow: none !important; background: transparent !important; padding: 0 !important; border: none !important; height: 100%; display: flex; flex-direction: column; justify-content: center;">

              <div class="spending-header" style="margin-bottom: 20px;">
                  <h3 style="font-size: 0.7rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.5);">MONTHLY SPENDING</h3>
                  <div class="spending-total" style="font-size: 1.5rem;">${finalTotalStr}</div>
              </div>
              <div class="chart-container" style="height: 200px; width: 100%;">
                  <div class="chart-grid-lines">
                      <div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div><div class="chart-grid-line"></div>
                  </div>
                  <div class="chart-y-axis" style="color: rgba(255,255,255,0.3);">
                      <span>0</span>
                      <span>${(chartMax * 0.25).toFixed(0)}</span>
                      <span>${(chartMax * 0.5).toFixed(0)}</span>
                      <span>${(chartMax * 0.75).toFixed(0)}</span>
                      <span>${chartMax}</span>
                  </div>
                  <div class="chart-bars">
                      ${graphBarsHTML}
                  </div>
              </div>
          </div>
          <div class="guider-calendar-total">
             <div class="guider-cal-actions">
               <div class="guider-icon-btn">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
               </div>
               <div class="guider-icon-btn">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
               </div>
               <div class="guider-icon-btn">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
               </div>
             </div>
             <div class="guider-total-group">
               <span class="total-label">YEARLY TOTAL</span>
               <span class="total-value">${yearlyTotalStr}</span>
             </div>
          </div>
      </div>
  `;




  // 3. Next month leading
  const currentCount = firstDay + daysInMonth;

  for (let i = 1; i <= (42 - currentCount); i++) {
      calendarHTML += `<div class="guider-calendar-cell other-month"><span class="cell-date">${i}</span></div>`;
  }

  guiderView.innerHTML = `
    <!-- Space Background -->
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <div class="guider-container">
      <!-- Step 1: Calendar Overview -->
      <div class="guider-step active" id="guider-step-1">
        <div class="guider-visual-area">
          <div class="guider-visual-switcher" style="position: relative; width: 100%;">
            <div id="guider-cal-layer" class="guider-calendar-preview modern-glass guider-view-layer">
              <div class="guider-calendar-header">
                <div class="guider-cal-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <span>${monthName} ${currentYear}</span>
                <div class="guider-cal-chevron">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </div>
              <div class="guider-calendar-grid">
                ${calendarHTML}
              </div>
              <div class="guider-calendar-total">
                 <div class="guider-cal-actions">
                   <div class="guider-icon-btn">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                   </div>
                   <div class="guider-icon-btn">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                   </div>
                   <div class="guider-icon-btn">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                   </div>
                 </div>
                 <div class="guider-total-group">
                   <span class="total-label">MONTHLY TOTAL</span>
                   <span class="total-value">${finalTotalStr}</span>
                 </div>
              </div>
            </div>
            
            <!-- Injected graph view -->
            ${graphHTML}
          </div>
        </div>


        <div class="guider-content">
          <div class="guider-branding">
             <img src="/sublify-logo.png" class="guider-logo" alt="Sublify Logo">
             <h2 class="guider-title">One app. Every subscription. Zero surprises.</h2>
             <p class="guider-description">See exactly which days money leaves your account. No more surprise charges, just a clear view of what's coming.</p>
          </div>
          
          <button id="guider-continue-btn" class="guider-main-btn">GOT IT!</button>

        </div>
      </div>
    </div>
  `;

  authScreen.appendChild(guiderView);

  // Setup toggle loop logic on global window so we can control it across steps
  if (window.guiderInterval) clearInterval(window.guiderInterval);
  
  window.guiderInterval = setInterval(() => {
     const calLayer = document.getElementById('guider-cal-layer');
     const graphLayer = guiderView.querySelector('.guider-graph-preview');
     if (calLayer && graphLayer) {
         if (calLayer.classList.contains('guider-transparent')) {
             calLayer.classList.remove('guider-transparent');
             graphLayer.classList.add('guider-transparent');
         } else {
             calLayer.classList.add('guider-transparent');
             graphLayer.classList.remove('guider-transparent');
         }
     }
  }, 5000);


  // Skip logic: Direct to dashboard for now as it's a guide

  document.getElementById('guider-continue-btn').addEventListener('click', () => {
    if (window.guiderInterval) clearInterval(window.guiderInterval);
    if (window.HapticsService) window.HapticsService.success();
    
    // Animate out
    guiderView.style.opacity = '0';
    setTimeout(() => {
      guiderView.classList.add('hidden');
      initGuiderStep2();
    }, 400);
  });
}

/**
 * Revealed when "Continue with Google" is clicked
 */
export function showGuider() {
  const guiderView = document.getElementById('guider-view');
  const authScreen = document.getElementById('auth-screen');
  const authViewNew = document.getElementById('auth-view-new');
  const emailAuthView = document.getElementById('email-auth-view');

  if (guiderView) {
    // 1. Hide the standard auth views to ensure they don't peek through
    if (authViewNew) authViewNew.classList.add('hidden');
    if (emailAuthView) emailAuthView.classList.add('hidden');

    // 2. Ensure parent auth-screen is visible
    if (authScreen) authScreen.classList.remove('hidden');

    // 3. Hide the auth-loading-screen (transition bridge)
    const loadingScreen = document.getElementById('auth-loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    // 4. Reveal the guider
    guiderView.classList.remove('hidden');
  }
}
