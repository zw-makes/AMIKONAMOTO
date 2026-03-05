// Quick debug script to see if reduce sum matches manual sum
const subs = [
    { price: 10, stopped: false },
    { price: 20, stopped: true },
    { price: 30, stopped: false }
];

let sumAll = 0;
let sumStopped = 0;
subs.forEach(s => {
    sumAll += s.price;
    if (s.stopped) sumStopped += s.price;
});
console.log("Manual Active (All - Stopped):", sumAll - sumStopped);

const activeReduce = subs.reduce((acc, s) => {
    return acc + (s.stopped ? 0 : s.price);
}, 0);
console.log("Reduce Active:", activeReduce);
