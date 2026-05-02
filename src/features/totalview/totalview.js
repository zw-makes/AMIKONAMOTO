/**
 * TotalView Feature
 * Handles toggling between Monthly and Yearly subscription totals.
 */

let viewMode = localStorage.getItem('totalViewMode') || 'monthly'; // 'monthly' or 'yearly'

export function initTotalView() {
    const trigger = document.getElementById('total-bar-trigger');
    if (!trigger) return;

    // Click to toggle between Monthly and Yearly
    trigger.addEventListener('click', () => {
        toggleViewMode();
        if (window.HapticsService) window.HapticsService.medium();
    });

    // Initial render sync
    updateTotalDisplay();
}

export function toggleViewMode() {
    viewMode = (viewMode === 'monthly') ? 'yearly' : 'monthly';
    localStorage.setItem('totalViewMode', viewMode);
    
    const container = document.querySelector('.grand-total-container');
    
    // Trigger the vertical "roll out"
    container.classList.remove('rolling-in');
    container.classList.add('rolling');
    
    setTimeout(() => {
        updateTotalDisplay();
        container.classList.remove('rolling');
        
        // Trigger the vertical "roll in"
        requestAnimationFrame(() => {
            container.classList.add('rolling-in');
        });
    }, 200); // Matches the 'rollOut' duration
}

export function calculateTotals(subscriptions, targetCurrency, rates) {
    let monthlySum = 0;
    let dailySum = 0;

    subscriptions.forEach(sub => {
        if (sub.stopped) return;

        let price = parseFloat(sub.price) || 0;
        
        // Convert currency if needed
        if (rates && sub.currency && sub.currency !== targetCurrency) {
            const rate = rates[sub.currency];
            if (rate) price = price / rate;
        }

        // Calculate Daily Rate
        let dailyRate = 0;
        if (sub.type === 'monthly') {
            dailyRate = price / 30.436875; // Average month length
            monthlySum += price;
        } else if (sub.type === 'yearly') {
            dailyRate = price / 365;
            monthlySum += (price / 12); // Pro-rated monthly impact
        } else if (sub.type === 'weekly') {
            dailyRate = price / 7;
            monthlySum += (price * 4.345); // Average weeks in month
        } else {
            // One-time or other
            dailyRate = 0;
        }

        dailySum += dailyRate;
    });

    return {
        monthly: monthlySum,
        yearly: dailySum * 365
    };
}

export function updateTotalDisplay() {
    const labelEl = document.querySelector('.total-label');
    const amountEl = document.getElementById('total-amount');
    if (!labelEl || !amountEl) return;

    // Get latest data from global state
    const report = window.lastReport || {};
    const subs = window.subscriptions || [];
    const targetCurrency = report.currency || 'USD';
    const rates = report.rates || null;
    const symbol = report.symbol || '$';

    const totals = calculateTotals(subs, targetCurrency, rates);
    const value = (viewMode === 'monthly') ? totals.monthly : totals.yearly;

    labelEl.innerText = viewMode.toUpperCase();
    amountEl.innerText = `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Add a class for styling based on mode
    document.querySelector('.grand-total-container').classList.toggle('yearly-mode', viewMode === 'yearly');
}

// Expose to window for integration with main.js
window.updateTotalView = updateTotalDisplay;
