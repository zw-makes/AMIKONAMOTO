import './details.css';

let currentSub = null;
const modalId = 'subscription-details-modal';
let currentDaySubs = []; // Track all subs for swiping

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

            <!-- Main Content with Scroll Track -->
            <div class="detail-main-content">
                <div class="detail-scroll-track" id="detail-scroll-track">
                    <!-- Cards injected here -->
                </div>

                <!-- Pagination Dots -->
                <div class="detail-dots" id="detail-dots"></div>
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

    // Sync Dots with Scroll
    const track = document.getElementById('detail-scroll-track');
    track.addEventListener('scroll', () => {
        const index = Math.round(track.scrollLeft / 360); // 340 width + 20 margin
        updateActiveDot(index);
        
        // Update currentSub globally so Edit button works for the visible card
        if (currentDaySubs[index]) {
            currentSub = currentDaySubs[index];
        }
    }, { passive: true });
}

function updateActiveDot(index) {
    const dots = document.querySelectorAll('.detail-dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function createCardHTML(s, viewDate = new Date()) {
    const domain = s.domain || 'example.com';
    const price = `${s.symbol || '$'}${s.price.toFixed(2)}`;
    const statusClass = s.stopped ? 'status-stopped' : 'status-active';
    const statusText = s.stopped ? 'Stopped' : 'Active';

    // Real world today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // Calculate Billing/End Date
    const { end } = getSubCalculatedDates(s);
    const billingDate = end ? end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    // Currency Exchange (if applicable)
    const exchangeInfo = s.displayPrice && s.displayPrice.includes('→') ? s.displayPrice : null;

    return `
        <div class="detail-premium-card" data-sub-id="${s.id}">
            <div class="detail-bg-text">${(s.name || 'INFO').toUpperCase()}</div>
            
            ${s.notes ? `
            <div class="detail-pinned-note" onclick="window.showFullNote(event)" style="cursor: pointer;">
                <div class="note-text-content">${s.notes}</div>
            </div>
            ` : ''}

            <div class="detail-logo-container">
                <img src="https://icon.horse/icon/${domain}" alt="${s.name}" onerror="this.src='https://icon.horse/icon/example.com'">
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
    initModal();

    const modal = document.getElementById(modalId);
    const track = document.getElementById('detail-scroll-track');
    
    // Render all cards with the calendar context
    track.innerHTML = daySubs.map(s => createCardHTML(s, viewDate)).join('');

    // Render Dots
    renderDots(sub, daySubs);

    modal.classList.remove('hidden');

    // Scroll to the active sub card
    const activeIndex = daySubs.findIndex(s => s.id === sub.id);
    if (activeIndex !== -1) {
        setTimeout(() => {
            track.scrollLeft = activeIndex * 360; 
        }, 10);
    }
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
        dot.onclick = () => showSubscriptionDetails(s, daySubs);
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
