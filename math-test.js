import fs from 'fs';

// Mock data
const subscriptions = [
    { id: 1, price: 1000, currency: 'INR', stopped: false },
    { id: 2, price: 10, currency: 'USD', stopped: false },
    { id: 3, price: 50, currency: 'EUR', stopped: true }
];

const targetCurrency = 'INR';
const mathRates = { INR: 1, USD: 83.5, EUR: 90.2 }; // Mock rates (1 target = x other)

function getConvertedPrice(price, fromCode, toCode, ratesInfo) {
    if (fromCode === toCode) return price;
    // This is a naive mock of the conversion logic for testing
    // Assuming rates are relative to a base
    const rateTarget = ratesInfo[toCode] || 1;
    const rateFrom = ratesInfo[fromCode] || 1;
    return price * (rateTarget / rateFrom);
}

// 1. Footer Logic (updateStats)
let footerTotal = 0;
const activeSubs = subscriptions.filter(s => !s.stopped);
activeSubs.forEach(s => {
    let p = s.price;
    if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
    footerTotal += p;
});

// 2. Modal Logic (showMonthlyBreakdown - all tab)
let sumAll = 0;
let sumStopped = 0;
subscriptions.forEach(s => {
    let p = s.price;
    if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
    sumAll += p;
    if (s.stopped) sumStopped += p;
});
const modalGrandTotal = sumAll - sumStopped;

console.log('Footer Total:', footerTotal);
console.log('Modal Grand Total:', modalGrandTotal);
console.log('Match?', footerTotal === modalGrandTotal);
