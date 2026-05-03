/**
 * TotalView Feature
 * Advanced Math: Monthly (Cash Flow) vs Yearly (Expected Annual Spend).
 */

let viewMode = localStorage.getItem('totalViewMode') || 'monthly';
let touchStartY = 0;
let lastTotals = { monthly: 0, yearly: 0 };

export function initTotalView() {
    if (window._totalViewInitialized) return;
    window._totalViewInitialized = true;

    const trigger = document.getElementById('total-bar-trigger');
    if (!trigger) return;

    const newTrigger = trigger.cloneNode(true);
    trigger.parentNode.replaceChild(newTrigger, trigger);

    newTrigger.classList.toggle('yearly-mode', viewMode === 'yearly');

    newTrigger.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
        newTrigger.style.opacity = '0.7';
    }, { passive: true });

    newTrigger.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = Math.abs(touchEndY - touchStartY);
        newTrigger.style.opacity = '1';
        if (deltaY > 20) toggleViewMode();
    }, { passive: true });

    updateTotalDisplay();
}

export function toggleViewMode() {
    const trigger = document.getElementById('total-bar-trigger');
    if (!trigger) return;

    viewMode = (viewMode === 'monthly') ? 'yearly' : 'monthly';
    localStorage.setItem('totalViewMode', viewMode);
    
    if (viewMode === 'yearly') {
        trigger.classList.add('yearly-mode');
    } else {
        trigger.classList.remove('yearly-mode');
    }

    if (window.HapticsService) window.HapticsService.light();
    setTimeout(() => updateTotalDisplay(), 50);
}

function animateValue(obj, start, end, duration, symbol) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = progress * (end - start) + start;
        obj.innerText = `${symbol}${currentVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

export function calculateTotals(subscriptions, targetCurrency, rates, viewedDate) {
    let monthlySum = 0;
    let expectedAnnualSum = 0;

    const isRelevant = window.isSubRelevantToMonth || (() => true);
    const getSubDates = window.getSubDates || (() => ({ start: new Date(), end: null }));
    const today = new Date();

    subscriptions.forEach(sub => {
        if (sub.stopped) return;

        let price = parseFloat(sub.price) || 0;
        if (rates && sub.currency && sub.currency !== targetCurrency) {
            const rate = rates[sub.currency];
            if (rate) price = price / rate;
        }

        const { start: startDateObj, end: endDateObj } = getSubDates(sub);

        // --- BRAIN 1: Expected Annual Spend (Advanced Formula) ---
        let subType = (sub.type || 'monthly').toLowerCase();
        
        // Handle Trials: Only count after they end
        if (subType === 'trial') {
            if (endDateObj && today >= endDateObj) {
                // Trial ended, treat as monthly
                expectedAnnualSum += (price / 30.42) * 365;
            }
            // If still in trial, it adds $0
        } else if (subType === 'monthly') {
            expectedAnnualSum += (price / 30.42) * 365;
        } else if (subType === 'weekly') {
            expectedAnnualSum += (price / 7) * 365;
        } else {
            // Yearly, One-Time, Non-Recurring: Flat Addition
            expectedAnnualSum += price;
        }

        // --- BRAIN 2: Monthly Cash Flow (Matching Pop-up) ---
        if (isRelevant(sub, viewedDate)) {
            let skipMonthlyPrice = false;
            
            if (subType === 'yearly') {
                if (viewedDate.getMonth() !== startDateObj.getMonth()) {
                    skipMonthlyPrice = true;
                }
            }

            if (!skipMonthlyPrice) {
                if (subType === 'monthly' || subType === 'trial') {
                    monthlySum += price;
                } else if (subType === 'yearly' || subType === 'one-time') {
                    monthlySum += price; 
                } else if (subType === 'weekly') {
                    monthlySum += (price * 4.345);
                }
            }
        }
    });

    return { 
        monthly: monthlySum, 
        yearly: expectedAnnualSum 
    };
}

export function updateTotalDisplay() {
    const amountMonthlyEl = document.getElementById('total-amount-monthly');
    const amountYearlyEl = document.getElementById('total-amount-yearly');
    if (!amountMonthlyEl || !amountYearlyEl) return;

    const report = window.lastReport || {};
    const subs = window.subscriptions || [];
    const targetCurrency = report.currency || 'USD';
    const rates = report.rates || null;
    const symbol = report.symbol || '$';
    const viewedDate = window.currentDate || new Date();

    const totals = calculateTotals(subs, targetCurrency, rates, viewedDate);

    animateValue(amountMonthlyEl, lastTotals.monthly, totals.monthly, 600, symbol);
    animateValue(amountYearlyEl, lastTotals.yearly, totals.yearly, 600, symbol);

    lastTotals = totals;
}

window.updateTotalView = updateTotalDisplay;
