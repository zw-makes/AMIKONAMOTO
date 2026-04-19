import './details.css';

let currentSub = null;
const modalId = 'subscription-details-modal';
let currentDaySubs = []; // Track all subs for swiping
let currentViewDate = new Date();

/**
 * Initializes the modal HTML if it doesn't exist
 */
function initModal() {
    if (document.getElementById(modalId)) return;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-overlay detail-view-modal hidden';
    
    // Using a more semantic structure with glassmorphism
    modal.innerHTML = `
        <div class="detail-view-content" id="detail-view-content">
            <!-- Header -->
            <div class="detail-view-header">
                <button class="header-back-btn" id="sub-detail-back">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <button class="header-edit-btn" id="sub-detail-edit">
                    Edit
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>

            <!-- Pagination Dots -->
            <div class="detail-dots" id="detail-dots"></div>

            <!-- Main Content with Scroll Track -->
            <div class="detail-main-content">
                <div class="detail-scroll-track" id="detail-scroll-track">
                    <!-- Cards injected here -->
                </div>
            </div>

            <!-- Action Buttons (Restored to Bottom) -->
            <div class="detail-footer-actions">
                <button class="footer-action-btn footer-cancel-btn" id="sub-detail-cancel">
                    Stop
                </button>
                <button class="footer-action-btn footer-paid-btn" id="sub-detail-paid">
                    Pay
                </button>
            </div>

            <!-- Frequency Dots Section -->
            <div class="detail-frequency-section">
                <div class="frequency-header">
                    <span>USAGE FREQUENCY</span>
                    <span id="frequency-month-label">APRIL</span>
                </div>
                <div class="frequency-dots-grid" id="frequency-dots-grid">
                    <!-- Dots injected here -->
                </div>
                <div class="frequency-footer">
                    <span id="frequency-year">2025</span>
                    <span id="frequency-days-left">0 DAYS LEFT</span>
                </div>
            </div>
        </div>

        <!-- Full Note Popup -->
        <div id="full-note-modal" class="full-note-modal">
            <div class="full-note-content">
                <div class="full-note-text" id="full-note-text-area"></div>
            </div>
        </div>
    `;

    document.getElementById('app').appendChild(modal);

    // Event Listeners
    document.getElementById('sub-detail-back').onclick = hideSubscriptionDetails;
    document.getElementById('sub-detail-edit').onclick = () => {
        if (currentSub && window.editSubscription) {
            window.editSubscription(currentSub.id);
            hideSubscriptionDetails();
        }
    };

    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target.id === modalId) hideSubscriptionDetails();
    };

    // Full Note Modal Close logic
    const noteModal = document.getElementById('full-note-modal');
    noteModal.onclick = (e) => {
        if (e.target.id === 'full-note-modal') {
            noteModal.classList.remove('show');
        }
    };

    // Sync Dots & Buttons with Scroll (Optimized to prevent lag)
    const track = document.getElementById('detail-scroll-track');
    let lastSnappedIndex = -1;
    let scrollTimeout = null;

    track.addEventListener('scroll', () => {
        const rawIndex = track.scrollLeft / 360; 
        const snappedIndex = Math.round(rawIndex);
        
        // 1. Light update: Only update the pagination dots immediately (Safe for scroll performance)
        updateActiveDot(snappedIndex);
        
        // 2. Heavy update: Wait for the scroll to SETTLE before rendering dots
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            if (snappedIndex !== lastSnappedIndex && currentDaySubs[snappedIndex]) {
                lastSnappedIndex = snappedIndex;
                currentSub = currentDaySubs[snappedIndex];
                
                // Now it's safe to render the heavy usage grid
                updateFooterButtons(currentSub);
            }
        }, 100); // 100ms wait after last scroll movement
    }, { passive: true });

    // Footer Button Listeners
    document.getElementById('sub-detail-cancel').onclick = (e) => {
        if (currentSub && window.stopSubscription) {
            window.stopSubscription(currentSub.id, e);
            // Live update: refresh buttons, dots, and card status
            updateFooterButtons(currentSub);
            refreshCardInPlace(currentSub);
            
            // Re-sync with the main UI
            if (window.renderDashboard) window.renderDashboard();
            if (window.renderCalendar) window.renderCalendar();
        }
    };
    document.getElementById('sub-detail-paid').onclick = (e) => {
        if (currentSub && window.togglePaidStatus) {
            window.togglePaidStatus(currentSub.id, e);
            // Live update: refresh buttons, dots, and card status
            updateFooterButtons(currentSub);
            refreshCardInPlace(currentSub);

            // Re-sync with the main UI
            if (window.renderDashboard) window.renderDashboard();
            if (window.renderCalendar) window.renderCalendar();
        }
    };
}

function refreshCardInPlace(sub) {
    const card = document.querySelector(`.detail-premium-card[data-sub-id="${sub.id}"]`);
    if (!card) return;
    
    // Temporarily store the scroll position if needed, but since it's inside the horizontal track
    // replacing outerHTML of one element in flex row should be fine.
    // We use the same viewDate used when the modal was opened.
    const newCardHTML = createCardHTML(sub, currentViewDate);
    
    // We update inner content to avoid losing the element reference if possible, 
    // but outerHTML is most reliable for a full refresh.
    const temp = document.createElement('div');
    temp.innerHTML = newCardHTML;
    const newCard = temp.firstElementChild;
    
    card.parentNode.replaceChild(newCard, card);
}

function updateFooterButtons(sub) {
    const cancelBtn = document.getElementById('sub-detail-cancel');
    const paidBtn = document.getElementById('sub-detail-paid');
    if (!cancelBtn || !paidBtn) return;

    const isStopped = sub.stopped;
    const isPaid = window.isSubPaid ? window.isSubPaid(sub, new Date()) : false;

    cancelBtn.innerText = isStopped ? 'Restart' : 'Stop';
    cancelBtn.classList.toggle('is-stopped', isStopped);
    
    paidBtn.innerText = isPaid ? 'PAID' : 'PAY';
    paidBtn.classList.toggle('is-paid', isPaid);

    // Update Frequency Dots
    renderFrequencyDots(sub);
}

function renderFrequencyDots(sub) {
    const grid = document.getElementById('frequency-dots-grid');
    const label = document.getElementById('frequency-month-label');
    const yearLabel = document.getElementById('frequency-year');
    const daysLeftLabel = document.getElementById('frequency-days-left');
    if (!grid || !label) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    label.innerText = today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
    if (yearLabel) yearLabel.innerText = currentYear;
    
    // Calculate days left in billing period or month
    const { end } = getSubCalculatedDates(sub);
    const isEnded = end && today > end;
    let daysLeft = 0;
    
    if (isEnded) {
        if (daysLeftLabel) daysLeftLabel.innerText = `COMPLETED`;
    } else if (end && end > today) {
        const diff = end.getTime() - today.getTime();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (daysLeftLabel) daysLeftLabel.innerText = `${daysLeft} DAYS LEFT`;
    } else {
        daysLeft = daysInMonth - currentDay;
        if (daysLeftLabel) daysLeftLabel.innerText = `${daysLeft} DAYS LEFT`;
    }

    grid.innerHTML = '';
    
    // Get sub start date
    const subStartDate = new Date(sub.startDate);
    subStartDate.setHours(0, 0, 0, 0);

    // Calculate total days to show using the already calculated 'end' date
    let totalDots = 31; // Default to current month
    if (end) {
        // If it's a trial or has an end date, show the FULL duration
        const diffSpan = end.getTime() - subStartDate.getTime();
        const totalSpanDays = Math.ceil(diffSpan / (1000 * 60 * 60 * 24));
        
        // Sanity check: don't show less than 30 or more than 366
        totalDots = Math.max(30, Math.min(366, totalSpanDays));
    }

    for (let dayOffset = 0; dayOffset < totalDots; dayOffset++) {
        const dot = document.createElement('div');
        dot.className = 'freq-dot';
        
        const date = new Date(subStartDate);
        date.setDate(subStartDate.getDate() + dayOffset);
        date.setHours(0, 0, 0, 0);

        const isPastOrToday = date <= today;
        const isWithinActiveLife = date <= (end || new Date(8640000000000000));
        const isNotStopped = !sub.stopped;

        if (isWithinActiveLife && isNotStopped && (isPastOrToday || isEnded)) {
            dot.classList.add('dot-filled'); // Active/Used day
            if (isEnded) dot.style.opacity = '0.35'; // "Paled color" for completed plan
        } else {
            dot.classList.add('dot-dimmed'); // Future or inactive day
        }
        
        grid.appendChild(dot);
    }
}

function updateActiveDot(index) {
    const dots = document.querySelectorAll('.detail-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function createCardHTML(s, viewDate = new Date()) {
    const domain = window.getDomain ? window.getDomain(s) : (s.domain || 'example.com');
    const price = `${s.symbol || '$'}${(parseFloat(s.price) || 0).toFixed(2)}`;
    
    // Real world today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate Billing/End Date
    const { end } = getSubCalculatedDates(s);
    const isEnded = end && today > end;

    const isPaid = window.isSubPaid ? window.isSubPaid(s, viewDate) : false;
    const statusClass = s.stopped ? 'status-stopped' : (isEnded ? 'status-ended' : 'status-active');
    const statusText = s.stopped ? 'Stopped' : (isEnded ? 'Ended' : 'Active');

    // Calendar context date
    const calendarDate = new Date(viewDate);
    calendarDate.setHours(0, 0, 0, 0);

    // Subscription start date
    const startDate = new Date(s.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const purchaseDate = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    // Calculate Days Logic (Relative to Real Today)
    const diffTimeStart = startDate.getTime() - today.getTime();
    const diffDaysFromToday = Math.ceil(diffTimeStart / (1000 * 60 * 60 * 24));
    
    // Contextual Status (Relative to Calendar View)
    let contextStatusLabel = "Active For";
    let contextStatusValue = "";
    
    if (calendarDate > today) {
        // Looking at a future month/date
        contextStatusLabel = "Status (Future)";
        if (s.stopped) {
            contextStatusValue = "Stopped (No Billing)";
        } else {
            contextStatusValue = `Scheduled for ${calendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
    } else if (calendarDate.getTime() === today.getTime()) {
        // Looking at today
        if (diffDaysFromToday > 0) {
            contextStatusLabel = "Starts";
            contextStatusValue = `In ${diffDaysFromToday} Day${diffDaysFromToday !== 1 ? 's' : ''}`;
        } else if (diffDaysFromToday === 0) {
            contextStatusLabel = "Status";
            contextStatusValue = "Starts Today";
        } else {
            const pastDays = Math.abs(diffDaysFromToday);
            contextStatusLabel = "Active For";
            contextStatusValue = `${pastDays} Day${pastDays !== 1 ? 's' : ''}`;
        }
    } else {
        // Looking at the past
        contextStatusLabel = "Occurred";
        contextStatusValue = calendarDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const billingDate = end ? end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    // Currency Exchange (if applicable)
    const exchangeInfo = s.displayPrice && s.displayPrice.includes('→') ? s.displayPrice : null;

    // --- Category Healing & Icon Recovery ---
    const allCats = (window.getCategories && typeof window.getCategories === 'function') ? window.getCategories() : [];
    let displayCatName = s.category || 'Not set';
    let catIcon = '📁';

    const foundCat = allCats.find(c => c.name === displayCatName);
    if (foundCat) {
        catIcon = foundCat.icon || '📁';
    } else if (displayCatName !== 'Not set') {
        // Self-heal: category was deleted
        displayCatName = 'Not set';
        catIcon = '📁';
        s.category = 'Not set';
        if (window.saveToSupabase) window.saveToSupabase(s);
    }

    return `
        <div class="detail-premium-card" data-sub-id="${s.id}">
            <div class="detail-bg-text">${(s.name || 'INFO').toUpperCase()}</div>
            
            ${s.notes ? `
            <div class="detail-pinned-note" onclick="window.showFullNote(event)" style="cursor: pointer;">
                <div class="note-text-content">${s.notes}</div>
            </div>
            ` : ''}

            <div class="detail-logo-container">
                <img src="${window.getLogoUrl(domain)}" alt="${s.name}" onerror="this.src='https://icon.horse/icon/example.com'">
            </div>
            
            <h2 class="detail-sub-name">${s.name}</h2>
            <!-- Domain Removed as requested -->

            <div class="detail-card-divider"></div>

            <div class="detail-info-grid">
                <div class="info-card">
                    <span class="info-label">Price</span>
                    <span class="info-value price">${price}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">Purchase Date</span>
                    <span class="info-value">${purchaseDate}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">${s.type === 'monthly' && s.recurring === 'recurring' ? 'Next Billing' : 'End Date'}</span>
                    <span class="info-value">${billingDate}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">Frequency</span>
                    <span class="info-value">${s.type.charAt(0).toUpperCase() + s.type.slice(1)}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">Category</span>
                    <span class="info-value" style="display: flex; align-items: center; gap: 6px;">
                        <span>${catIcon}</span>
                        ${displayCatName}
                    </span>
                </div>
                <div class="info-card">
                    <span class="info-label">Current Status</span>
                    <div>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <div class="info-card">
                    <span class="info-label">${contextStatusLabel}</span>
                    <span class="info-value">${contextStatusValue}</span>
                </div>
                <div class="info-card">
                    <span class="info-label">Currency</span>
                    <span class="info-value">${s.currency || 'USD'}</span>
                </div>
                ${s.nexus_card_id ? `
                <div class="info-card" id="detail-payment-info-${s.id}">
                    <span class="info-label">Payment Method</span>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                        <div class="payment-icon-placeholder" style="width: 20px; height: 14px; background: rgba(255,255,255,0.05); border-radius: 2px;"></div>
                        <span class="info-value" style="font-size: 0.8rem; opacity: 0.8;">Loading...</span>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}


/**
 * Replicates main.js getSubDates for local calculation
 */
function getSubCalculatedDates(sub) {
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
    } else if (sub.type === 'monthly' && sub.recurring === 'recurring') {
        // Next billing date is same day next month
        end = new Date();
        end.setDate(start.getDate());
        if (end < new Date()) {
            end.setMonth(end.getMonth() + 1);
        }
    }

    return { start, end };
}

/**
 * Shows the subscription details popup
 * @param {Object} sub - The active subscription object
 * @param {Array} daySubs - All subscriptions for the same day
 */
export function showSubscriptionDetails(sub, daySubs = [], viewDate = new Date()) {
    if (!sub) return;
    currentSub = sub;
    currentDaySubs = daySubs;
    currentViewDate = viewDate;
    initModal();

    const modal = document.getElementById(modalId);
    const track = document.getElementById('detail-scroll-track');
    
    // Render all cards with the calendar context
    track.innerHTML = daySubs.map(s => createCardHTML(s, viewDate)).join('');

    // Render Dots
    renderDots(sub, daySubs);
    
    // Initial Button State
    updateFooterButtons(sub);

    modal.classList.remove('hidden');

    // Scroll to the active sub card
    const activeIndex = daySubs.findIndex(s => s.id === sub.id);
    if (activeIndex !== -1) {
        setTimeout(() => {
            track.scrollLeft = activeIndex * 360; 
        }, 10);
    }

    // Solve Payment Method Info
    resolvePaymentMethods(daySubs);
}

async function resolvePaymentMethods(subs) {
    const subsWithCards = subs.filter(s => s.nexus_card_id);
    if (subsWithCards.length === 0) return;

    // Fetch cards once
    const { supabase } = await import('../../supabase.js');
    const { data: cards, error } = await supabase.from('nexus_cards').select('*');
    if (error || !cards) return;

    const logoMap = {
        'visa': 'https://cdn.simpleicons.org/visa/white',
        'mastercard': 'https://cdn.simpleicons.org/mastercard/white',
        'amex': 'https://cdn.simpleicons.org/americanexpress/white',
        'discover': 'https://cdn.simpleicons.org/discover/white',
        'jcb': 'https://cdn.simpleicons.org/jcb/white',
        'debit': '/sublify-logo.png',
        'credit': '/sublify-logo.png'
    };

    subsWithCards.forEach(s => {
        const card = cards.find(c => c.id === s.nexus_card_id);
        if (card) {
            const infoDiv = document.getElementById(`detail-payment-info-${s.id}`);
            if (infoDiv) {
                const iconContainer = infoDiv.querySelector('.payment-icon-placeholder');
                const textSpan = infoDiv.querySelector('.info-value');
                if (iconContainer) {
                    iconContainer.innerHTML = `<img src="${logoMap[card.type] || '/sublify-logo.png'}" style="width: 100%; height: 100%; object-fit: contain;">`;
                    iconContainer.style.background = 'transparent';
                }
                if (textSpan) textSpan.textContent = `••• ${card.last4}`;
            }
        }
    });
}


function renderDots(activeSub, daySubs) {
    const dotsContainer = document.getElementById('detail-dots');
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    // If no daySubs provided, or only one, we still shows at least one dot or hide
    if (daySubs.length <= 1) {
        dotsContainer.style.display = 'none';
        return;
    }

    dotsContainer.style.display = 'flex';
    daySubs.forEach(s => {
        const dot = document.createElement('div');
        dot.className = `detail-dot ${s.id === activeSub.id ? 'active' : ''}`;
        dot.onclick = () => showSubscriptionDetails(s, daySubs, currentViewDate);
        dotsContainer.appendChild(dot);
    });
}

export function hideSubscriptionDetails() {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
}

window.showFullNote = function(e) {
    if (e) e.stopPropagation();
    const sub = currentSub;
    if (!sub || !sub.notes) return;

    const noteModal = document.getElementById('full-note-modal');
    const noteTextArea = document.getElementById('full-note-text-area');
    
    noteTextArea.innerText = sub.notes;
    noteModal.classList.add('show');
};

function handleEditClick() {
    if (!currentSub) return;
    
    // Close this view
    hideSubscriptionDetails();

    // Trigger the existing edit functionality in main.js
    // By convention, we assume window.openEditModal exists or we trigger via search/edit logic
    if (window.editSubscription) {
        window.editSubscription(currentSub.id);
    } else {
        console.warn('window.editSubscription not found. Need to wire up edit logic.');
        // Fallback: Dispatch a custom event that main.js can listen to
        window.dispatchEvent(new CustomEvent('edit-subscription', { detail: currentSub }));
    }
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
    }
}
