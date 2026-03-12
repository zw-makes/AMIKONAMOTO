import './details.css';

let currentSub = null;
const modalId = 'subscription-details-modal';

/**
 * Initializes the detail view modal in the DOM if it doesn't exist
 */
function initModal() {
    if (document.getElementById(modalId)) return;

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.className = 'modal-overlay detail-view-modal hidden';
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

            <!-- Main Content -->
            <div class="detail-main-content">
                <div class="detail-ambient-glow"></div>
                
                <div class="detail-premium-card">
                    <div class="detail-bg-text">INFO</div>
                    <div class="detail-logo-container" id="detail-logo-container">
                        <!-- Logo injected here -->
                    </div>
                    
                    <h2 class="detail-sub-name" id="detail-name">Netflix</h2>
                    <p class="detail-sub-domain" id="detail-domain">netflix.com</p>

                    <div class="detail-card-divider"></div>

                    <div class="detail-info-grid">
                        <div class="info-card">
                            <span class="info-label">Price</span>
                            <span class="info-value price" id="detail-price">$15.99</span>
                        </div>
                        <div class="info-card">
                            <span class="info-label">Date</span>
                            <span class="info-value" id="detail-date">15th</span>
                        </div>
                        <div class="info-card">
                            <span class="info-label">Frequency</span>
                            <span class="info-value" id="detail-freq">Monthly</span>
                        </div>
                        <div class="info-card">
                            <span class="info-label">Status</span>
                            <div id="detail-status-container">
                                <span id="detail-status" class="status-badge status-active">Active</span>
                            </div>
                        </div>
                        <div class="info-card">
                            <span class="info-label">Currency</span>
                            <span class="info-value" id="detail-currency">USD</span>
                        </div>
                    </div>
                </div>

                <!-- Pagination Dots -->
                <div class="detail-dots" id="detail-dots"></div>
            </div>
        </div>
    `;

    document.getElementById('app').appendChild(modal);

    // Event Listeners
    document.getElementById('sub-detail-back').addEventListener('click', hideSubscriptionDetails);
    document.getElementById('sub-detail-edit').addEventListener('click', handleEditClick);
    
    // Close on overlay click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideSubscriptionDetails();
    });
}

/**
 * Shows the subscription details popup
 * @param {Object} sub - The active subscription object
 * @param {Array} daySubs - All subscriptions for the same day
 */
export function showSubscriptionDetails(sub, daySubs = []) {
    if (!sub) return;
    currentSub = sub;
    initModal();

    const modal = document.getElementById(modalId);
    
    // Update data
    document.getElementById('detail-name').innerText = sub.name;
    document.getElementById('detail-domain').innerText = sub.domain || 'No domain';
    document.getElementById('detail-price').innerText = `${sub.symbol || '$'}${sub.price.toFixed(2)}`;
    document.getElementById('detail-date').innerText = `${sub.date}${getDaySuffix(sub.date)}`;
    document.getElementById('detail-freq').innerText = sub.type.charAt(0).toUpperCase() + sub.type.slice(1);
    document.getElementById('detail-currency').innerText = sub.currency || 'USD';

    // Background Text (Large impact)
    const bgText = modal.querySelector('.detail-bg-text');
    if (bgText) {
        bgText.innerText = (sub.name || 'INFO').toUpperCase();
    }

    // Status
    const statusEl = document.getElementById('detail-status');
    if (sub.stopped) {
        statusEl.innerText = 'Stopped';
        statusEl.className = 'status-badge status-stopped';
    } else {
        statusEl.innerText = 'Active';
        statusEl.className = 'status-badge status-active';
    }

    // Logo
    const logoContainer = document.getElementById('detail-logo-container');
    const domain = sub.domain || 'example.com';
    logoContainer.innerHTML = `<img src="https://icon.horse/icon/${domain}" alt="${sub.name}" onerror="this.src='https://icon.horse/icon/example.com'">`;

    // Trigger Animation on the card
    const card = modal.querySelector('.detail-premium-card');
    if (card) {
        card.classList.remove('card-content-animate');
        void card.offsetWidth; // Trigger reflow to restart animation
        card.classList.add('card-content-animate');
    }

    // Render Dots
    renderDots(sub, daySubs);

    modal.classList.remove('hidden');
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
