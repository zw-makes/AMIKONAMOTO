import './nexus.css';
import { supabase } from '../../supabase.js';
import { queueOperation, getQueue } from '../sync/syncQueue.js';

export async function initNexus() {
    console.log('Nexus initialized');
    
    const nexusBtn = document.getElementById('nexus-btn');
    const closeNexusBtn = document.getElementById('close-nexus');
    const addCardBtn = document.getElementById('nexus-add-card-btn');
    const addDigitalBtn = document.getElementById('nexus-add-digital-btn');
    const closeAddCardBtn = document.getElementById('close-add-card');
    
    if (nexusBtn) {
        nexusBtn.addEventListener('click', () => toggleNexus(true));
    }
    
    if (closeNexusBtn) {
        closeNexusBtn.addEventListener('click', () => toggleNexus(false));
    }
    
    if (addCardBtn) {
        addCardBtn.addEventListener('click', async () => {
            const cards = await getStoredCards();
            if (cards.length >= 6) {
                showNexusToast('Maximum limit of 6 payment methods.');
                return;
            }
            toggleAddCardModal(true, 'card');
        });
    }

    if (addDigitalBtn) {
        addDigitalBtn.addEventListener('click', async () => {
            const cards = await getStoredCards();
            if (cards.length >= 6) {
                showNexusToast('Maximum limit of 6 payment methods.');
                return;
            }
            toggleAddCardModal(true, 'digital');
        });
    }


    const closeCardDetailBtn = document.getElementById('close-card-detail');
    if (closeCardDetailBtn) {
        closeCardDetailBtn.addEventListener('click', () => {
            document.getElementById('nexus-card-detail').classList.add('hidden');
        });
    }

    initCardTypePicker();
    initFormValidation();
    initFormSubmit();

    // Listen for sync queue flushes to refresh Nexus view
    window.addEventListener('syncqueue:flushed', () => {
        console.log('[Nexus] Sync queue flushed — refreshing cards...');
        renderStoredCards();
    });
    
    // Load persisted cards from DB
    await renderStoredCards();
}

async function getStoredCards() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // 1. OFFLINE-FIRST: Always try local storage first
        const cache = localStorage.getItem('nexus_cards');
        let cards = cache ? JSON.parse(cache) : [];

        // Merge with pending offline operations (optimistic)
        const q = getQueue();
        q.forEach(item => {
            if (item.action === 'upsert_nexus_card' && item.data) {
                const idx = cards.findIndex(c => c.id === item.data.id);
                if (idx !== -1) cards[idx] = { ...cards[idx], ...item.data };
                else cards.push(item.data);
            } else if (item.action === 'delete_nexus_card' && item.data) {
                cards = cards.filter(c => c.id !== item.data.id);
            }
        });

        // 2. BACKGROUND FETCH (if online)
        if (navigator.onLine) {
            supabase
                .from('nexus_cards')
                .select('*')
                .order('created_at', { ascending: true })
                .then(({ data, error }) => {
                    if (!error && data) {
                        // Update local storage for next time
                        localStorage.setItem('nexus_cards', JSON.stringify(data));
                        // No need to trigger a full re-render here as the initial render 
                        // already showed the correct data (cache + queue).
                    }
                });
        }

        return cards;
    } catch (err) {
        console.error('Error fetching cards:', err);
        const cache = localStorage.getItem('nexus_cards');
        return cache ? JSON.parse(cache) : [];
    }
}

async function saveCardToStorage(cardData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showNexusToast('Sign in to save cards.');
            return false;
        }

        const fullCard = { ...cardData, user_id: user.id };

        // 1. Update Local Cache IMMEDIATELY (Offline-First)
        const cache = localStorage.getItem('nexus_cards');
        let cards = cache ? JSON.parse(cache) : [];
        const existingIdx = cards.findIndex(c => c.id === fullCard.id);
        if (existingIdx !== -1) cards[existingIdx] = fullCard;
        else cards.push(fullCard);
        localStorage.setItem('nexus_cards', JSON.stringify(cards));

        // 2. Attempt Supabase Write
        if (!navigator.onLine) {
            console.log('[Nexus] Offline — queuing card upsert');
            queueOperation('upsert_nexus_card', fullCard);
            showNexusToast('Working offline — synced locally.', false);
            return true;
        }

        const { error } = await supabase
            .from('nexus_cards')
            .upsert([fullCard]);

        if (error) {
            console.warn('[Nexus] Supabase write failed, queuing...', error.message);
            queueOperation('upsert_nexus_card', fullCard);
            return true;
        }

        return true;
    } catch (err) {
        console.error('Error saving card:', err);
        // Best effort fallback to queue
        queueOperation('upsert_nexus_card', cardData);
        return true; 
    }
}

async function renderStoredCards() {
    const cards = await getStoredCards();
    const stack = document.getElementById('nexus-cards-list');
    if (!stack) return;

    // Clear existing (except maybe placeholder if empty)
    stack.innerHTML = '';
    
    if (cards.length === 0) {
        // Add back a dummy/placeholder if empty? 
        // For now just leave it empty or add the original one
        stack.innerHTML = `
            <div class="premium-physical-card placeholder-card" style="opacity: 0.8;">
                <div class="card-chip"></div>
                <div class="card-brand-logo">
                    <img src="/sublify-logo.png" alt="Sublify">
                </div>
                <div class="card-number">•••• •••• •••• 4242</div>
                <div class="card-footer-info">
                    <div class="card-holder">Nexus Member</div>
                    <div class="card-expiry">12/29</div>
                </div>
            </div>
        `;
        return;
    }

    cards.forEach(c => {
        createCardElement(c.type, c.last4, c.expiry, false, c.id);
    });
}

function showNexusToast(message, isError = true) {
    const toast = document.getElementById('nexus-toast');
    const msgSpan = document.getElementById('nexus-toast-msg');
    if (!toast || !msgSpan) return;

    msgSpan.textContent = message;
    toast.style.background = isError ? 'rgba(255, 59, 48, 0.9)' : 'rgba(52, 199, 89, 0.9)';
    toast.classList.remove('hidden');
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    if (window.HapticsService) window.HapticsService.error();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 3000);
}

function initFormSubmit() {
    const form = document.getElementById('nexus-add-card-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const cards = await getStoredCards();
        if (cards.length >= 6) {
            showNexusToast('Maximum limit of 6 payment methods reached.');
            toggleAddCardModal(false);
            return;
        }

        const type = document.getElementById('new-card-type').value;
        const identifierInput = document.getElementById('new-card-last4');
        const expiryInput = document.getElementById('new-card-expiry');
        const identifier = identifierInput ? identifierInput.value.trim() : '';
        const expiry = expiryInput ? expiryInput.value.trim() : '';

        if (!type) { showNexusToast('Please select a payment method type.'); return; }

        const CARD_TYPES = ['visa','mastercard','amex','discover','jcb','debit','credit'];
        const isCard = CARD_TYPES.includes(type);

        if (isCard) {
            if (identifier.length < 4) { showNexusToast('Enter the last 4 digits.'); return; }
            if (expiry.length < 5) { showNexusToast('Enter a valid expiry date.'); return; }
        } else if (type === 'paypal') {
            if (!identifier.includes('@')) { showNexusToast('Enter a valid PayPal email.'); return; }
        } else if (type === 'bank') {
            if (identifier.length < 2) { showNexusToast('Enter a bank or account name.'); return; }
        }
        // For applepay / googlepay — no identifier needed

        const submitBtn = form.querySelector('[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2.5px solid rgba(0,0,0,0.3);border-top-color:#000;border-radius:50%;animation:nexusSpin 0.7s linear infinite;"></span>`;
        }

        const success = await saveCardToStorage({ type, last4: identifier, expiry: isCard ? expiry : 'N/A' });
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        if (success) {
            await renderStoredCards();
            showNexusToast('Payment method added!', false);
            toggleAddCardModal(false);
        }
    });
}


function initFormValidation() {
    const last4Input = document.getElementById('new-card-last4');
    const expiryInput = document.getElementById('new-card-expiry');
    const CARD_TYPES = ['visa','mastercard','amex','discover','jcb','debit','credit'];

    // Only apply digit-restriction to card types (not email/UPI fields)
    const typeHiddenInput = document.getElementById('new-card-type');
    const isCurrentlyCard = () => CARD_TYPES.includes(typeHiddenInput?.value || '');

    if (last4Input) {
        last4Input.addEventListener('input', (e) => {
            if (!isCurrentlyCard()) return;
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) val = val.slice(0, 4);
            e.target.value = val;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 0) {
                let formatted = val.slice(0, 2);
                if (val.length > 2) formatted += '/' + val.slice(2, 4);
                e.target.value = formatted;
            } else {
                e.target.value = '';
            }
        });
    }
}


function createCardElement(type, last4, expiry, isNew = true, cardId = null) {
    const stack = document.getElementById('nexus-cards-list');
    if (!stack) return;

    const card = document.createElement('div');
    card.className = 'premium-physical-card';
    card.dataset.id = cardId;
    
    const cardCount = stack.querySelectorAll('.premium-physical-card:not(.placeholder-card)').length;
    card.style.zIndex = cardCount + 2;
    card.style.cursor = 'pointer';

    const CARD_TYPES = ['visa','mastercard','amex','discover','jcb','debit','credit'];
    const isCard = CARD_TYPES.includes(type);

    const logoMap = {
        'visa': 'https://cdn.simpleicons.org/visa/white',
        'mastercard': 'https://cdn.simpleicons.org/mastercard/white',
        'amex': 'https://cdn.simpleicons.org/americanexpress/white',
        'discover': 'https://cdn.simpleicons.org/discover/white',
        'jcb': 'https://cdn.simpleicons.org/jcb/white',
        'debit': '/sublify-logo.png',
        'credit': '/sublify-logo.png',
        'paypal': 'https://cdn.simpleicons.org/paypal/white',
        'applepay': 'https://cdn.simpleicons.org/applepay/white',
        'googlepay': 'https://cdn.simpleicons.org/googlepay/white',
        'bank': '/sublify-logo.png',
    };

    const labelMap = {
        'paypal': 'PayPal',
        'applepay': 'Apple Pay',
        'googlepay': 'Google Pay',
        'bank': 'Bank Transfer',
    };

    const logoUrl = logoMap[type] || '/sublify-logo.png';
    const profileNameEl = document.getElementById('profile-name-text');
    const userName = profileNameEl ? profileNameEl.innerText.trim() : 'Nexus Member';

    if (isCard) {
        card.innerHTML = `
            <div class="card-chip"></div>
            <div class="card-brand-logo">
                <img src="${logoUrl}" alt="${type}" style="opacity: 0.95; max-height: 24px;">
            </div>
            <div class="card-number">•••• •••• •••• ${last4}</div>
            <div class="card-footer-info">
                <div class="card-holder">${userName}</div>
                <div class="card-expiry">${expiry}</div>
            </div>
        `;
    } else {
        // Digital payment method — flat, logo-centric design
        const label = labelMap[type] || type;
        const identifierLine = last4 && last4 !== 'N/A' && last4.length > 0
            ? `<div style="font-size:0.75rem; opacity:0.5; letter-spacing:0.02em; margin-top:4px;">${last4}</div>`
            : '';
        card.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; justify-content:space-between;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="font-size:0.6rem; font-weight:700; text-transform:uppercase; letter-spacing:0.15em; opacity:0.5;">Nexus Wallet</div>
                    <img src="${logoUrl}" alt="${label}" style="max-height:22px; opacity:0.9;">
                </div>
                <div>
                    <div style="font-size:1.4rem; font-weight:800; letter-spacing:-0.02em;">${label}</div>
                    ${identifierLine}
                </div>
                <div style="font-size:0.6rem; font-weight:600; text-transform:uppercase; letter-spacing:0.12em; opacity:0.4;">${userName}</div>
            </div>
        `;
    }
    
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        openCardDetail(card, { type, last4, expiry, id: cardId });
    });
    
    stack.appendChild(card);
}

async function openCardDetail(cardElement, data) {
    const detailPage = document.getElementById('nexus-card-detail');
    const container = document.getElementById('detail-card-container');
    if (!detailPage || !container) return;

    if (window.HapticsService) window.HapticsService.medium();

    container.innerHTML = cardElement.innerHTML;
    container.className = 'premium-physical-card';
    container.style.zIndex = '1';
    container.style.boxShadow = '0 20px 50px rgba(0,0,0,0.8)';

    detailPage.classList.remove('hidden');

    // Fetch and render linked subscriptions
    renderLinkedSubscriptions(data.id);

    // Handle delete
    const deleteBtn = document.getElementById('delete-card-btn');
    if (deleteBtn) {
        deleteBtn.onclick = () => showDeleteCardConfirm(data.id);
    }
}

function showDeleteCardConfirm(cardId) {
    // Remove any existing confirm modal
    document.getElementById('nexus-delete-confirm')?.remove();

    const modal = document.createElement('div');
    modal.id = 'nexus-delete-confirm';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding: 28px 24px 40px;
            animation: nexusSlideIn 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        ">
            <!-- Drag handle -->
            <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px; margin: 0 auto 24px;"></div>

            <!-- Icon -->
            <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255,69,58,0.1); border: 1px solid rgba(255,69,58,0.2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff453a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    <path d="M10 11v6"></path><path d="M14 11v6"></path>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
                </svg>
            </div>

            <!-- Title -->
            <h2 style="text-align: center; font-size: 1.1rem; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px; color: #fff;">
                Remove Card from Nexus?
            </h2>

            <!-- Warning message -->
            <p style="text-align: center; font-size: 0.82rem; color: rgba(255,255,255,0.45); line-height: 1.6; margin: 0 0 28px; padding: 0 10px;">
                This card will be permanently removed from your Nexus wallet. Any subscriptions currently linked to this card will be <strong style="color: rgba(255,200,0,0.8);">automatically delinked</strong> and will no longer have an associated payment method.
            </p>

            <!-- Warning pill -->
            <div style="background: rgba(255,200,0,0.05); border: 1px solid rgba(255,200,0,0.15); border-radius: 14px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,200,0,0.8)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span style="font-size: 0.75rem; color: rgba(255,200,0,0.8); font-weight: 600; line-height: 1.4;">Linked subscriptions will not be deleted — only the payment method will be unlinked.</span>
            </div>

            <!-- Actions -->
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <button id="nexus-confirm-delete-yes" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: rgba(255,69,58,0.12); border: 1px solid rgba(255,69,58,0.25);
                    color: #ff453a; font-size: 1rem; font-weight: 700;
                    cursor: pointer; letter-spacing: -0.01em; transition: all 0.15s ease;
                ">Remove Card</button>
                <button id="nexus-confirm-delete-no" style="
                    width: 100%; padding: 17px; border-radius: 18px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.7); font-size: 1rem; font-weight: 600;
                    cursor: pointer; letter-spacing: -0.01em; transition: all 0.15s ease;
                ">Keep Card</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // ── Drag-to-dismiss ──────────────────────────────────────────────
    const sheet = modal.querySelector('div');
    let startY = 0, currentY = 0, isDragging = false;

    const onDragStart = (e) => {
        startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        isDragging = true;
        sheet.style.transition = 'none';
    };

    const onDragMove = (e) => {
        if (!isDragging) return;
        const y = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        currentY = Math.max(0, y - startY); // Only allow pulling DOWN
        sheet.style.transform = `translateY(${currentY}px)`;
        // Fade backdrop as user pulls
        modal.style.background = `rgba(0,0,0,${Math.max(0, 0.6 - currentY / 400)})`;
    };

    const onDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        if (currentY > 120) {
            // Pull far enough → dismiss
            sheet.style.transition = 'transform 0.25s ease';
            sheet.style.transform = `translateY(110%)`;
            setTimeout(() => modal.remove(), 250);
        } else {
            // Snap back
            sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
            sheet.style.transform = 'translateY(0)';
            modal.style.background = 'rgba(0,0,0,0.6)';
        }
        currentY = 0;
    };

    sheet.addEventListener('touchstart', onDragStart, { passive: true });
    sheet.addEventListener('touchmove', onDragMove, { passive: true });
    sheet.addEventListener('touchend', onDragEnd);
    // ─────────────────────────────────────────────────────────────────

    // Dismiss on backdrop tap
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    // Cancel
    document.getElementById('nexus-confirm-delete-no').onclick = () => modal.remove();

    // Confirm delete
    document.getElementById('nexus-confirm-delete-yes').onclick = async () => {
        const yesBtn = document.getElementById('nexus-confirm-delete-yes');
        if (yesBtn) {
            yesBtn.disabled = true;
            yesBtn.innerHTML = `<span style="display:inline-block;width:18px;height:18px;border:2.5px solid rgba(255,69,58,0.3);border-top-color:#ff453a;border-radius:50%;animation:nexusSpin 0.7s linear infinite;"></span>`;
        }

        // 1. Update Local Storage Immediately
        const cache = localStorage.getItem('nexus_cards');
        if (cache) {
            const cards = JSON.parse(cache).filter(c => c.id !== cardId);
            localStorage.setItem('nexus_cards', JSON.stringify(cards));
        }

        // 2. Optimistic UI update
        modal.remove();
        await renderStoredCards();
        document.getElementById('nexus-card-detail')?.classList.add('hidden');

        // 3. Attempt network delete
        if (!navigator.onLine) {
            queueOperation('delete_nexus_card', { id: cardId });
            showNexusToast('Offline — change queued locally.', false);
            return;
        }

        const { error } = await supabase
            .from('nexus_cards')
            .delete()
            .eq('id', cardId);

        if (error) {
            console.warn('[Nexus] Network delete failed, queuing...', error.message);
            queueOperation('delete_nexus_card', { id: cardId });
            showNexusToast('Action queued locally.', false);
        } else {
            showNexusToast('Card removed from Nexus', false);
        }
    };
}


window.renderLinkedSubscriptions = renderLinkedSubscriptions;

async function renderLinkedSubscriptions(cardId) {

    // Save current card ID to window for easy refreshing
    window._currentNexusCardId = cardId;
    
    const list = document.getElementById('card-linked-subs-list');
    if (!list) return;

    // Only show loading if we don't have existing items (smoother refresh)
    if (list.children.length === 0 || list.innerHTML.includes('No subscriptions linked')) {
        list.innerHTML = `<p style="text-align: center; opacity: 0.5; font-size: 0.8rem; padding: 20px;">Fetching linked accounts...</p>`;
    }

    try {

        const { data: subs, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('nexus_card_id', cardId);

        if (error) throw error;

        if (!subs || subs.length === 0) {
            list.innerHTML = `
                <div style="padding: 24px; text-align: center; background: rgba(255,255,255,0.02); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);">
                    <p style="font-size: 0.8rem; color: var(--text-secondary); opacity: 0.6;">No subscriptions linked to this card</p>
                </div>
            `;
            return;
        }

        list.innerHTML = `
            <div class="latest-list" style="margin-top: 0; padding: 0;">
                ${subs.map(sub => {
                    const report = window.lastReport || { total: 0, activeSubs: [], symbol: '$', currency: 'USD', rates: null };
                    const settings = (window.userProfile && window.userProfile.settings) || {};
                    const targetCurrency = report.currency;
                    const targetSymbol = report.symbol;
                    const useAutoCurrency = settings.autoCurrency !== false || settings.usdTotal;

                    let displayPrice = `${sub.symbol || '$'}${parseFloat(sub.price).toFixed(2)}`;
                    
                    if (useAutoCurrency && report.rates && (sub.currency || 'USD') !== targetCurrency) {
                        const convertedPrice = window.getConvertedPrice ? window.getConvertedPrice(parseFloat(sub.price), sub.currency || 'USD', targetCurrency, report.rates) : parseFloat(sub.price);
                        displayPrice = `${displayPrice} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${targetSymbol}${convertedPrice.toFixed(2)}`;
                    }

                    sub.displayPrice = displayPrice;

                    if (window.getSwipeTemplate) {
                        return window.getSwipeTemplate(sub);
                    }
                    return `<div style="padding: 10px; color: white;">${sub.name}</div>`;
                }).join('')}
            </div>
        `;


        // Attach Swipe Events if available (Native-like feel)
        if (window.attachSwipeEvents) {
            window.attachSwipeEvents();
        }

    } catch (err) {

        console.error('Error fetching linked subs:', err);
        list.innerHTML = `<p style="color: var(--accent-red); font-size: 0.8rem; text-align: center;">Failed to load linked subscriptions</p>`;
    }
}



export async function populatePaymentCardsDropdown() {
    const list = document.getElementById('nexus-cards-dropdown-list');
    const triggerText = document.getElementById('card-select-text');
    const hiddenInput = document.getElementById('selected-card-id');
    const statusIcon = document.getElementById('selected-card-status-icon');

    if (!list) return;

    const cards = await getStoredCards();
    
    if (cards.length === 0) {
        list.innerHTML = `<li style="padding: 12px; opacity: 0.5; font-size: 0.75rem; pointer-events: none;">No cards found in Nexus</li>`;
        return;
    }

    const logoMap = {
        'visa': 'https://cdn.simpleicons.org/visa/white',
        'mastercard': 'https://cdn.simpleicons.org/mastercard/white',
        'amex': 'https://cdn.simpleicons.org/americanexpress/white',
        'discover': 'https://cdn.simpleicons.org/discover/white',
        'jcb': 'https://cdn.simpleicons.org/jcb/white',
        'debit': '/sublify-logo.png',
        'credit': '/sublify-logo.png',
        'paypal': 'https://cdn.simpleicons.org/paypal/white',
        'applepay': 'https://cdn.simpleicons.org/applepay/white',
        'googlepay': 'https://cdn.simpleicons.org/googlepay/white',
        'bank': '/sublify-logo.png'
    };

    const labelMap = {
        'paypal': 'PayPal',
        'applepay': 'Apple Pay',
        'googlepay': 'Google Pay',
        'bank': 'Bank Transfer'
    };

    const CARD_TYPES = ['visa','mastercard','amex','discover','jcb','debit','credit'];

    list.innerHTML = cards.map(c => {
        const isCard = CARD_TYPES.includes(c.type);
        const title = isCard ? `•••• ${c.last4}` : (labelMap[c.type] || c.type);
        const subtext = isCard ? c.type : (c.last4 && c.last4 !== 'N/A' ? c.last4 : 'Linked');
        
        return `
        <li data-id="${c.id}" data-type="${c.type}" data-last4="${c.last4}" style="display: flex; align-items: center; gap: 10px; padding: 12px;">
            <img src="${logoMap[c.type] || '/sublify-logo.png'}" style="width: 20px; height: 14px; object-fit: contain; opacity: 0.9;">
            <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 600; text-transform: ${!isCard && labelMap[c.type] ? 'none' : 'uppercase'};">${title}</span>
                <span style="font-size: 0.65rem; opacity: 0.5; text-transform: ${isCard ? 'uppercase' : 'none'};">${subtext}</span>
            </div>
        </li>
    `}).join('');

    list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', () => {
            const id = li.dataset.id;
            const last4 = li.dataset.last4;
            const type = li.dataset.type;

            if (hiddenInput) hiddenInput.value = id;
            if (triggerText) triggerText.textContent = `Nexus: •••• ${last4}`;
            if (statusIcon) {
                statusIcon.innerHTML = `<img src="${logoMap[type] || '/sublify-logo.png'}" style="width: 100%; height: 100%; object-fit: contain;">`;
            }
            document.getElementById('card-select-dropdown').classList.add('hidden');
        });
    });
}


export function toggleNexus(show) {



    const nexusPage = document.getElementById('nexus-page');
    if (!nexusPage) return;

    if (window.HapticsService) window.HapticsService.medium();

    if (show) {
        nexusPage.classList.remove('hidden');
    } else {
        nexusPage.classList.add('hidden');
    }
}

export function toggleAddCardModal(show, mode = 'both') {
    if (show) showAddCardSheet(mode);
    else {
        const modal = document.getElementById('nexus-add-card-sheet');
        if (modal) dismissSheet(modal);
    }
}

function dismissSheet(modal) {
    const sheet = modal.querySelector('.nexus-sheet-inner');
    if (sheet) {
        sheet.style.transition = 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)';
        sheet.style.transform = 'translateY(110%)';
    }
    modal.style.transition = 'opacity 0.28s ease';
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 300);
}

function showAddCardSheet(mode) {
    document.getElementById('nexus-add-card-sheet')?.remove();

    let dropdownHtml = '';
    
    if (mode === 'card' || mode === 'both') {
        dropdownHtml += `
            <li style="font-size:0.6rem; text-transform:uppercase; letter-spacing:0.1em; opacity:0.4; padding: 10px 14px 4px; pointer-events:none; font-weight:700;">Physical Cards</li>
            <li data-value="visa">Visa</li>
            <li data-value="mastercard">MasterCard</li>
            <li data-value="amex">American Express</li>
            <li data-value="discover">Discover</li>
            <li data-value="jcb">JCB</li>
            <li data-value="debit">Debit Card</li>
            <li data-value="credit">Other Credit Card</li>
        `;
    }
    
    if (mode === 'digital' || mode === 'both') {
        dropdownHtml += `
            <li style="font-size:0.6rem; text-transform:uppercase; letter-spacing:0.1em; opacity:0.4; padding: 12px 14px 4px; pointer-events:none; font-weight:700; ${mode === 'both' ? 'border-top: 1px solid rgba(255,255,255,0.06); margin-top:6px;' : ''}">Digital Methods</li>
            <li data-value="paypal">PayPal</li>
            <li data-value="applepay">Apple Pay</li>
            <li data-value="googlepay">Google Pay</li>
            <li data-value="bank">Bank Transfer</li>
        `;
    }

    const titleText = mode === 'digital' ? 'Add Digital Method' : 'Add New Card';

    const modal = document.createElement('div');
    modal.id = 'nexus-add-card-sheet';
    modal.style.cssText = `
        position: fixed; inset: 0; z-index: 9999;
        display: flex; align-items: flex-end; justify-content: center;
        background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
        animation: fadeIn 0.2s ease;
    `;

    modal.innerHTML = `
        <div class="nexus-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: #111;
            border-top: 1px solid rgba(255,255,255,0.08);
            border-radius: 28px 28px 0 0;
            padding-bottom: 34px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.32, 0.72, 0, 1);
            position: relative;
        ">
            <!-- Drag Handle -->
            <div id="add-card-drag-handle" style="padding: 14px 0 4px; display: flex; justify-content: center; cursor: grab;">
                <div style="width: 36px; height: 4px; background: rgba(255,255,255,0.15); border-radius: 10px;"></div>
            </div>

            <!-- Header -->
            <div style="display: flex; align-items: center; padding: 8px 20px 20px; gap: 16px;">
                <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                </div>
                <div>
                    <h2 style="margin: 0 0 2px; font-size: 1.05rem; font-weight: 700; letter-spacing: -0.02em; color: #fff;">${titleText}</h2>
                    <p style="margin: 0; font-size: 0.75rem; color: rgba(255,255,255,0.35); font-weight: 400;">Your details are stored securely.</p>
                </div>
            </div>

            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 0 20px 20px;"></div>

            <!-- Form -->
            <div style="padding: 0 20px;">
                <form id="nexus-add-card-form" style="display: flex; flex-direction: column; gap: 14px;">

                    <div>
                        <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 8px;">Payment Method</label>
                        <div class="custom-dropdown dropdown-up" id="card-type-picker">
                            <button type="button" class="dropdown-trigger" id="card-type-trigger">
                                <span id="card-type-selected">Select Type</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
                            </button>
                            <div class="dropdown-content hidden" id="card-type-dropdown">
                                <ul id="card-type-list">
                                    ${dropdownHtml}
                                </ul>
                            </div>
                            <input type="hidden" id="new-card-type" value="">
                        </div>
                    </div>

                    <!-- Dynamic fields — shown/hidden by initCardTypePicker -->
                    <div id="card-fields-card" style="display: ${mode === 'digital' ? 'none' : 'block'};">
                        <div style="margin-bottom:14px;">
                            <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 8px;">Last 4 Digits</label>
                            <input type="tel" id="new-card-last4" placeholder="e.g. 4242" maxlength="4" inputmode="numeric" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; color: #fff; outline: none; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                        <div>
                            <label style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 8px;">Expiry Date</label>
                            <input type="tel" id="new-card-expiry" placeholder="MM/YY" maxlength="5" inputmode="numeric" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; color: #fff; outline: none; font-size: 0.95rem; box-sizing: border-box;">
                        </div>
                    </div>

                    <div id="card-fields-identifier" style="display:none;">
                        <label id="identifier-label" style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.4); font-weight: 600; display: block; margin-bottom: 8px;">Identifier</label>
                        <input type="text" id="new-card-identifier-hidden" placeholder="e.g. you@example.com" style="width: 100%; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; color: #fff; outline: none; font-size: 0.95rem; box-sizing: border-box;">
                        <input type="hidden" id="new-card-expiry-hidden" value="N/A">
                    </div>

                    <button id="add-card-submit-btn" type="submit" style="width: 100%; padding: 17px; border-radius: 18px; background: rgba(255,255,255,0.92); border: none; color: #000; font-size: 1rem; font-weight: 700; cursor: pointer; letter-spacing: -0.01em; margin-top: 4px;">Save Payment Method</button>
                </form>
            </div>
        </div>
    `;


    document.body.appendChild(modal);

    // Init card type picker inline
    initCardTypePicker();
    initFormValidation();
    initFormSubmit();

    // Drag-to-dismiss
    const sheet = modal.querySelector('.nexus-sheet-inner');
    let startY = 0, currentY = 0, dragging = false;
    const handle = document.getElementById('add-card-drag-handle');
    if (handle) {
        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY; dragging = true;
            sheet.style.transition = 'none';
        }, { passive: true });
        handle.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            currentY = Math.max(0, e.touches[0].clientY - startY);
            sheet.style.transform = `translateY(${currentY}px)`;
            modal.style.background = `rgba(0,0,0,${Math.max(0, 0.6 - currentY / 400)})`;
        }, { passive: true });
        handle.addEventListener('touchend', () => {
            if (!dragging) return; dragging = false;
            if (currentY > 120) { dismissSheet(modal); }
            else {
                sheet.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
                sheet.style.transform = 'translateY(0)';
                modal.style.background = 'rgba(0,0,0,0.6)';
            }
            currentY = 0;
        });
    }

    // Backdrop tap to dismiss
    modal.addEventListener('click', (e) => { if (e.target === modal) dismissSheet(modal); });
}



function initCardTypePicker() {
    const trigger = document.getElementById('card-type-trigger');
    const dropdown = document.getElementById('card-type-dropdown');
    const selectedSpan = document.getElementById('card-type-selected');
    const hiddenInput = document.getElementById('new-card-type');
    const listItems = document.querySelectorAll('#card-type-list li');

    if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
        });

        listItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!item.dataset.value) return; // Skip headers
                const val = item.dataset.value;
                const text = item.textContent;
                selectedSpan.textContent = text;
                hiddenInput.value = val;
                dropdown.classList.add('hidden');

                // Dynamic Form Logic
                const cardFields = document.getElementById('card-fields-card');
                const idFields = document.getElementById('card-fields-identifier');
                const idLabel = document.getElementById('identifier-label');
                const mainInput = document.getElementById('new-card-last4');

                const CARD_TYPES = ['visa','mastercard','amex','discover','jcb','debit','credit'];
                
                if (CARD_TYPES.includes(val)) {
                    cardFields.style.display = 'block';
                    idFields.style.display = 'none';
                    // Re-bind to the card inputs
                    mainInput.id = ''; // clear from old
                    cardFields.querySelector('input[placeholder="e.g. 4242"]').id = 'new-card-last4';
                    cardFields.querySelector('input[placeholder="MM/YY"]').id = 'new-card-expiry';
                } else {
                    cardFields.style.display = 'none';
                    idFields.style.display = 'block';
                    // Re-bind to the id input
                    if (cardFields.querySelector('#new-card-last4')) cardFields.querySelector('#new-card-last4').id = '';
                    if (cardFields.querySelector('#new-card-expiry')) cardFields.querySelector('#new-card-expiry').id = '';
                    
                    const idInput = idFields.querySelector('input[type="text"]');
                    idInput.id = 'new-card-last4';
                    
                    // Update label and placeholder dynamically
                    if (val === 'paypal') {
                        idLabel.textContent = 'PayPal Email';
                        idInput.placeholder = 'you@example.com';
                        idFields.style.display = 'block';
                    } else if (val === 'bank') {
                        idLabel.textContent = 'Bank / Account Name';
                        idInput.placeholder = 'e.g. Chase Checking';
                        idFields.style.display = 'block';
                    } else if (val === 'applepay' || val === 'googlepay') {
                        // These don't need user identifiers, the system knows what they are
                        idFields.style.display = 'none';
                        idInput.value = 'Linked'; // Auto-fill
                    }
                }
            });
        });

        document.addEventListener('click', () => {
            dropdown.classList.add('hidden');
        });
    }
}

// Global expose
window.toggleNexus = toggleNexus;
window.toggleAddCardModal = toggleAddCardModal;
