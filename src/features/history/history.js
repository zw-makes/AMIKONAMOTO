/**
 * History Tracker Module - Premium Edition
 * Dedicated pop-up for visual overview of subscription dots
 */
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

let historyDate = new Date();
let exportContext = {
    mode: 'monthly', // 'monthly' or 'daily'
    subs: [],
    title: '',
    fileName: ''
};

// --- Currency Helper ---
async function getHistoryCurrencyContext() {
    const settings = window.userProfile?.settings || {};
    let targetCurrency = settings.currency || 'USD';
    const useAuto = settings.autoCurrency !== false;

    if (settings.usdTotal) {
        targetCurrency = 'USD';
    }

    const rates = (useAuto || settings.usdTotal) ? await window.fetchExchangeRates(targetCurrency) : null;
    const currObj = (window.CURRENCIES || []).find(c => c.code === targetCurrency) || { symbol: '$' };

    return {
        targetCurrency,
        symbol: currObj.symbol,
        rates
    };
}

export function initHistory() {
    const modal = document.getElementById('history-modal');
    const closeBtn = document.getElementById('close-history');
    const prevBtn = document.getElementById('hist-prev');
    const nextBtn = document.getElementById('hist-next');
    const downloadBtn = document.getElementById('hist-download-monthly');

    // Initialize Bottom Sheet Drag
    if (window.initBottomSheetDrag) {
        window.initBottomSheetDrag('history-modal', 'history-drag-area', 'history-modal');
        window.initBottomSheetDrag('export-choice-modal', 'export-drag-area', 'export-choice-modal');
    }

    // Export Modal Selectors
    const exportModal = document.getElementById('export-choice-modal');
    const closeExportBtn = document.getElementById('close-export-choice');
    const choiceCsv = document.getElementById('choice-csv');
    const choicePdf = document.getElementById('choice-pdf');
    const choiceSnap = document.getElementById('choice-snapshot');
    const choiceBoth = document.getElementById('choice-both');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.add('hidden');
            const hBtn = document.getElementById('opt-history-btn');
            if (hBtn) hBtn.classList.remove('history-active');
        };
    }

    if (prevBtn) {
        prevBtn.onclick = async () => {
            if (window.HapticsService) window.HapticsService.light();
            historyDate.setMonth(historyDate.getMonth() - 1);
            await renderHistoryCalendar();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = async () => {
            if (window.HapticsService) window.HapticsService.light();
            historyDate.setMonth(historyDate.getMonth() + 1);
            await renderHistoryCalendar();
        };
    }

    // --- Export Logic ---
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            if (window.HapticsService) window.HapticsService.medium();
            const year = historyDate.getFullYear();
            const month = historyDate.getMonth();
            const subs = window.subscriptions || [];

            const monthlySubs = subs.filter(s => {
                const start = new Date(s.startDate);
                if (s.type === 'monthly' && s.recurring === 'recurring') {
                    const viewTime = new Date(year, month, 1).getTime();
                    const startTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
                    return startTime <= viewTime;
                }
                return start.getMonth() === month && start.getFullYear() === year;
            });

            if (monthlySubs.length === 0) {
                alert("No records found for this month.");
                return;
            }

            const monthName = historyDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            exportContext = {
                mode: 'monthly',
                subs: monthlySubs,
                title: `Monthly Subscription Report - ${monthName}`,
                fileName: `Sublify_History_${monthName.replace(' ', '_')}`
            };
            exportModal.classList.remove('hidden');
        };
    }

    if (closeExportBtn) {
        closeExportBtn.onclick = () => {
            exportModal.classList.add('hidden');
        };
    }

    if (choiceCsv) {
        choiceCsv.onclick = () => {
            downloadCSV(exportContext.subs, exportContext.fileName + '.csv');
            exportModal.classList.add('hidden');
        };
    }

    if (choicePdf) {
        choicePdf.onclick = () => {
            downloadPDF(exportContext.subs, exportContext.fileName, exportContext.title);
            exportModal.classList.add('hidden');
        };
    }

    if (choiceSnap) {
        choiceSnap.onclick = () => {
            downloadSnapshot(exportContext.subs, exportContext.fileName, exportContext.title.split('-').pop().trim());
            exportModal.classList.add('hidden');
        };
    }

    if (choiceBoth) {
        choiceBoth.onclick = async () => {
            downloadCSV(exportContext.subs, exportContext.fileName + '.csv');
            await new Promise(r => setTimeout(r, 500));
            downloadPDF(exportContext.subs, exportContext.fileName, exportContext.title);
            await new Promise(r => setTimeout(r, 800));
            downloadSnapshot(exportContext.subs, exportContext.fileName, exportContext.title.split('-').pop().trim());
            exportModal.classList.add('hidden');
        };
    }

    // Auto-close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            const hBtn = document.getElementById('opt-history-btn');
            if (hBtn) hBtn.classList.remove('history-active');
        }
    });

    if (exportModal) {
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                exportModal.classList.add('hidden');
            }
        });
    }
}

export function toggleHistoryMode(btn) {
    const modal = document.getElementById('history-modal');
    const isCurrentlyHidden = modal.classList.contains('hidden');

    if (isCurrentlyHidden) {
        modal.classList.remove('hidden');
        if (btn && btn.classList) btn.classList.add('history-active');
        historyDate = new Date(window.currentDate || new Date());
        renderHistoryCalendar();
    } else {
        modal.classList.add('hidden');
        if (btn && btn.classList) btn.classList.remove('history-active');
    }
}

async function renderHistoryCalendar() {
    const grid = document.getElementById('history-grid');
    const title = document.getElementById('history-month-title');
    const summary = document.getElementById('history-summary-stats');
    if (!grid || !title) return;

    grid.innerHTML = '';
    const year = historyDate.getFullYear();
    const month = historyDate.getMonth();

    title.innerText = historyDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let firstDayInMonth = new Date(year, month, 1).getDay();
    firstDayInMonth = firstDayInMonth === 0 ? 6 : firstDayInMonth - 1;

    const prevMonthDays = new Date(year, month, 0).getDate();

    // Get currency context
    const { targetCurrency, symbol, rates } = await getHistoryCurrencyContext();

    let monthTotal = 0;
    let activeSubsCount = 0;

    // Prev month days
    for (let i = firstDayInMonth - 1; i >= 0; i--) {
        createHistoryCell(prevMonthDays - i, true, year, month - 1, targetCurrency, symbol, rates);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
        const { cost, count } = createHistoryCell(d, false, year, month, targetCurrency, symbol, rates);
        monthTotal += cost;
        activeSubsCount += count;
    }

    // Next month filling
    const remaining = 42 - grid.children.length;
    for (let i = 1; i <= remaining; i++) {
        createHistoryCell(i, true, year, month + 1, targetCurrency, symbol, rates);
    }

    // Update Summary Header
    if (summary) {
        summary.innerHTML = `
            <span>TOTAL: <b>${symbol}${monthTotal.toFixed(2)}</b></span>
            <span>EVENTS: <b>${activeSubsCount}</b></span>
        `;
    }
}

function createHistoryCell(day, isOtherMonth, year, month, targetCurrency, symbol, rates) {
    const grid = document.getElementById('history-grid');
    const cell = document.createElement('div');
    cell.className = `history-cell ${isOtherMonth ? 'other-month' : ''}`;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'history-cell-date';
    dateSpan.innerText = day;
    cell.appendChild(dateSpan);

    let dayTotalCost = 0;
    let daySubsCount = 0;

    if (!isOtherMonth) {
        const subs = window.subscriptions || [];
        const daySubs = subs.filter(s => {
            const start = new Date(s.startDate);
            if (s.date !== day) return false;

            if (s.type === 'monthly' && s.recurring === 'recurring') {
                const viewTime = new Date(year, month, 1).getTime();
                const startTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
                return startTime <= viewTime;
            }
            return start.getMonth() === month && start.getFullYear() === year;
        });

        if (daySubs.length > 0) {
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'history-dots-container';

            daySubs.forEach(sub => {
                let p = sub.price;
                if (rates) {
                    p = window.getConvertedPrice(p, sub.currency || 'USD', targetCurrency, rates);
                }
                dayTotalCost += p;
                daySubsCount++;

                const dot = document.createElement('div');
                dot.className = 'history-dot';
                const color = getHistoryColor(sub.type);
                dot.style.backgroundColor = color;
                dot.style.color = color;
                dotsContainer.appendChild(dot);
            });
            cell.appendChild(dotsContainer);

            if (daySubs.length > 2) {
                cell.style.background = 'rgba(255, 255, 255, 0.08)';
            }

            cell.onclick = () => showHistoryDayPop(day, daySubs, targetCurrency, symbol, rates);
        }
    }

    grid.appendChild(cell);
    return { cost: dayTotalCost, count: daySubsCount };
}

function showHistoryDayPop(day, subs, targetCurrency, symbol, rates) {
    const pop = document.getElementById('history-day-pop');
    if (!pop) return;

    if (window.HapticsService) window.HapticsService.light();

    pop.innerHTML = `
        <div class="history-pop-header">
            <div class="history-pop-title-group">
                <span class="history-pop-subtitle">RECORDS FOR</span>
                <h3 class="history-pop-title">DAY ${day}</h3>
            </div>
            <div class="history-pop-actions">
                <button id="hist-download-day" class="history-pop-btn" title="Export Day History">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                </button>
                <button onclick="window.closeHistoryDayPop()" class="history-pop-btn close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
        </div>
        <div class="history-pop-list">
            ${subs.map(s => {
                let p = parseFloat(s.price) || 0;
                const origSymbol = s.symbol || '$';
                const originalPriceStr = `${origSymbol}${p.toFixed(2)}`;
                let displayPrice = originalPriceStr;

                if (rates && (s.currency || 'USD') !== targetCurrency) {
                    const converted = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, rates);
                    displayPrice = `<span class="orig-price-small">${originalPriceStr}</span> ${symbol}${converted.toFixed(2)}`;
                }

                // Prepare sub object for the shared template
                const subToRender = { 
                    ...s, 
                    displayPrice, 
                    // ensure we use the same paid logic
                    isPaid: window.isSubPaid(s, historyDate) 
                };

                return window.getSwipeTemplate ? window.getSwipeTemplate(subToRender) : `
                <div class="notif-item ${s.stopped ? 'dimmed' : ''}" style="margin-bottom: 8px; border-radius: 20px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);">
                    <div class="notif-icon">
                        <img src="${window.getLogoUrl(s.domain)}" style="width:24px; height:24px; object-fit:contain;">
                    </div>
                    <div class="notif-content">
                        <div class="notif-top">
                            <span class="notif-title">${s.name}</span>
                            <span class="notif-time">${displayPrice}</span>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;

    pop.classList.remove('hidden');

    // Attach swipe events to the newly rendered items
    if (window.attachSwipeEvents) window.attachSwipeEvents();

    const downloadDayBtn = document.getElementById('hist-download-day');
    if (downloadDayBtn) {
        downloadDayBtn.onclick = () => {
            exportContext = {
                mode: 'daily',
                subs: subs,
                title: `Daily Subscription Report - Day ${day}`,
                fileName: `Sublify_History_${historyDate.getFullYear()}_${historyDate.getMonth() + 1}_Day_${day}`
            };
            document.getElementById('export-choice-modal').classList.remove('hidden');
        };
    }
}

async function downloadCSV(subs, fileName) {
    const { targetCurrency, symbol, rates } = await getHistoryCurrencyContext();
    const header = ['Name', 'Orig Price', 'Orig Curr', 'Converted Price', 'Target Curr', 'Type', 'Status', 'Paid', 'Start Date', 'End Date', 'Domain'];
    const rows = subs.map(s => {
        const { start, end } = calculateSubTimeline(s);
        let p = s.price;
        let convertedPrice = p;
        if (rates) {
            convertedPrice = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, rates);
        }
        const { end: subEndDate } = calculateSubTimeline(s);
        const todayStr = new Date().toISOString().split('T')[0];
        const isEnded = subEndDate !== 'N/A' && todayStr > subEndDate;

        return [
            s.name.replace(/,/g, ''),
            p.toFixed(2),
            s.currency || 'USD',
            convertedPrice.toFixed(2),
            targetCurrency,
            s.type,
            s.stopped ? 'STOPPED' : (isEnded ? 'ENDED' : 'ACTIVE'),
            window.isSubPaid(s, historyDate) ? 'YES' : 'NO',
            start,
            end,
            s.domain || ''
        ];
    });

    let csvContent = header.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Capacitor / Mobile Support
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const base64 = btoa(unescape(encodeURIComponent(csvContent)));
        shareFileOnMobile(base64, fileName, 'text/csv');
        return;
    }

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

async function downloadPDF(subs, fileName, title) {
    const { targetCurrency, symbol, rates } = await getHistoryCurrencyContext();
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        alert("PDF generator still loading. Please try again in a moment.");
        return;
    }
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()} | Currency: ${targetCurrency}`, 14, 30);

    let total = 0;
    const tableData = subs.map(s => {
        const { start, end } = calculateSubTimeline(s);
        let p = s.price;
        const origSymbol = s.symbol || '$';
        let displayPrice = `${origSymbol}${p.toFixed(2)}`;

        if (rates && (s.currency || 'USD') !== targetCurrency) {
            const converted = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, rates);
            total += converted;
            displayPrice += ` -> ${symbol}${converted.toFixed(2)}`;
        } else {
            total += p;
        }

        const { end: subEndDate } = calculateSubTimeline(s);
        const todayStr = new Date().toISOString().split('T')[0];
        const isEnded = subEndDate !== 'N/A' && todayStr > subEndDate;

        return [
            s.name,
            displayPrice,
            s.type.toUpperCase(),
            s.stopped ? 'STOPPED' : (isEnded ? 'ENDED' : 'ACTIVE'),
            window.isSubPaid(s, historyDate) ? 'PAID' : 'UNPAID',
            start,
            end
        ];
    });

    doc.autoTable({
        startY: 35,
        head: [['Platform', 'Price (Orig -> Conv)', 'Plan', 'Status', 'Payment', 'Start Date', 'Renewal/End']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }, // Slightly smaller to fit long price strings
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Monthly Spend: ${symbol}${total.toFixed(2)}`, 14, finalY);

    // Capacitor / Mobile Support
    if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const base64 = doc.output('datauristring').split(',')[1];
        shareFileOnMobile(base64, `${fileName}.pdf`, 'application/pdf');
        return;
    }

    doc.save(`${fileName}.pdf`);
}

async function downloadSnapshot(subs, fileName, monthOrDayTitle) {
    const { targetCurrency, symbol, rates } = await getHistoryCurrencyContext();
    const template = document.getElementById('premium-report-template');
    if (!template) return;

    // Populate Template
    document.getElementById('st-month').innerText = monthOrDayTitle.toUpperCase();

    let total = 0;
    const list = document.getElementById('st-list');
    list.innerHTML = subs.map(s => {
        const domain = s.domain || (s.name.toLowerCase().replace(/\s+/g, '') + '.com');
        const { start, end } = calculateSubTimeline(s);
        let p = s.price;
        const origSymbol = s.symbol || '$';
        let displayPrice = `${origSymbol}${p.toFixed(2)}`;

        if (rates && (s.currency || 'USD') !== targetCurrency) {
            const converted = window.getConvertedPrice(p, s.currency || 'USD', targetCurrency, rates);
            total += converted;
            displayPrice = `<span style="opacity:0.4; font-size:0.6rem;">${displayPrice}</span> ${symbol}${converted.toFixed(2)}`;
        } else {
            total += p;
            displayPrice = `${symbol}${p.toFixed(2)}`;
        }

        const { end: subEndDate } = calculateSubTimeline(s);
        const todayStr = new Date().toISOString().split('T')[0];
        const isEnded = subEndDate !== 'N/A' && todayStr > subEndDate;

        return `
            <div class="st-item">
                <div class="st-item-main">
                    <div class="st-item-logo">
                        <img src="${window.getLogoUrl(domain)}" style="width:100%; height:100%; object-fit:contain;">
                    </div>
                    <div class="st-item-meta">
                        <span class="st-item-name">${s.name}</span>
                        <div class="st-tags">
                            <span class="st-tag">${s.type.toUpperCase()}</span>
                            <span class="st-tag ${s.stopped ? 'st-stopped' : (isEnded ? 'st-ended' : 'st-active')}">${s.stopped ? 'STOPPED' : (isEnded ? 'ENDED' : 'ACTIVE')}</span>
                            <span class="st-tag ${window.isSubPaid(s, historyDate) ? 'st-paid' : 'st-unpaid'}">${window.isSubPaid(s, historyDate) ? 'PAID' : 'UNPAID'}</span>
                        </div>
                    </div>
                </div>
                <div class="st-item-right">
                    <span class="st-item-price">${displayPrice}</span>
                    <span class="st-item-date">${start} — ${end}</span>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('st-total').innerText = `${symbol}${total.toFixed(2)}`;
    document.getElementById('st-gen-date').innerText = new Date().toLocaleDateString();

    // Capture with html2canvas (wait for images)
    try {
        const canvas = await html2canvas(template.querySelector('.premium-statement-card'), {
            backgroundColor: '#080808',
            scale: 2, // High DPI
            useCORS: true,
            logging: false
        });

        const link = document.createElement('a');
        const dataUrl = canvas.toDataURL('image/png');

        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            const base64 = dataUrl.split(',')[1];
            shareFileOnMobile(base64, `${fileName}_Snapshot.png`, 'image/png');
            return;
        }

        link.download = `${fileName}_Snapshot.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error("Snapshot failed:", err);
        alert("Premium Snapshot failed. Please use PDF or CSV.");
    }
}

function calculateSubTimeline(s) {
    let startObj = new Date(s.startDate);
    if (isNaN(startObj.getTime())) {
        // Fallback for corrupt or missing data to prevent app crashes
        startObj = new Date();
    }
    const start = startObj.toISOString().split('T')[0];
    let end = 'N/A';

    if (s.type === 'trial' || (s.type === 'monthly' && s.recurring !== 'recurring') || s.type === 'one-time') {
        const endDate = new Date(startObj);
        if (s.type === 'trial') {
            const tDays = parseInt(s.trialDays) || 0;
            const tMonths = parseInt(s.trialMonths) || 0;
            endDate.setMonth(endDate.getMonth() + tMonths);
            endDate.setDate(endDate.getDate() + tDays);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }
        end = endDate.toISOString().split('T')[0];
    } else if (s.type === 'yearly') {
        const endDate = new Date(startObj);
        endDate.setFullYear(endDate.getFullYear() + 1);
        end = endDate.toISOString().split('T')[0];
    } else if (s.type === 'monthly') {
        const nextRenewal = new Date(startObj);
        const now = new Date();
        nextRenewal.setFullYear(now.getFullYear());
        nextRenewal.setMonth(now.getMonth());
        if (nextRenewal < now) nextRenewal.setMonth(nextRenewal.getMonth() + 1);
        end = nextRenewal.toISOString().split('T')[0];
    }
    return { start, end };
}

// Capacitor Helper for mobile "download" via Share Sheet
async function shareFileOnMobile(base64Data, fileName, contentType) {
    try {
        const result = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
        });

        await Share.share({
            title: fileName,
            text: `Sublify Report: ${fileName}`,
            url: result.uri,
            dialogTitle: 'Save Report'
        });
    } catch (e) {
        console.error("Share failed", e);
        alert("Export failed: " + e.message);
    }
}

function getHistoryColor(type) {
    const colors = {
        'monthly': '#50fa7b',
        'yearly': '#8be9fd',
        'one-time': '#bd93f9',
        'trial': '#ff5555'
    };
    return colors[type] || '#7df9ff';
}

window.closeHistoryDayPop = () => {
    if (window.HapticsService) window.HapticsService.light();
    const pop = document.getElementById('history-day-pop');
    if (pop) pop.classList.add('hidden');
};

window.toggleHistoryMode = toggleHistoryMode;
window.calculateSubTimeline = calculateSubTimeline;
