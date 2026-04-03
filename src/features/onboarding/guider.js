import { HapticsService } from '../haptics/haptics.js';

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

  // Localized Currency Logic
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
        const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: finalCurrency, maximumFractionDigits: 0 });
        finalTotalStr = formatter.format(converted);
    }
  } catch(e) {}

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
          <div class="guider-calendar-preview modern-glass">
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
        </div>

        <div class="guider-content">
          <div class="guider-branding">
             <img src="https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/LOGOS/ChatGPT%20Image%20Mar%2017,%202026,%2010_36_13%20PM.png" class="guider-logo" alt="Sublify Logo">
             <h2 class="guider-title">One app. Every subscription. Zero surprises.</h2>
             <p class="guider-description">See exactly which days money leaves your account. No more surprise charges, just a clear view of what's coming.</p>
          </div>
          
          <button id="guider-continue-btn" class="guider-main-btn">Got it, what's next?</button>

        </div>
      </div>
    </div>
  `;

  authScreen.appendChild(guiderView);

  // Skip logic: Direct to dashboard for now as it's a guide
  document.getElementById('guider-continue-btn').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    
    // For now, take them to main app as this is the guider logic
    guiderView.classList.add('hidden');
    // We would normally fire the actual Google Auth here, or take to dashboard
    if (window.loadSubscriptions) window.loadSubscriptions();
  });
}

/**
 * Revealed when "Continue with Google" is clicked
 */
export function showGuider() {
  const guiderView = document.getElementById('guider-view');
  if (guiderView) {
    guiderView.classList.remove('hidden');
  }
}
