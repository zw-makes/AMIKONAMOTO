import './nexus.css';

export function initNexus() {
    console.log('Nexus initialized');
    
    const nexusBtn = document.getElementById('nexus-btn');
    const closeNexusBtn = document.getElementById('close-nexus');
    const addCardBtn = document.getElementById('nexus-add-card-btn');
    const closeAddCardBtn = document.getElementById('close-add-card');
    
    if (nexusBtn) {
        nexusBtn.addEventListener('click', () => toggleNexus(true));
    }
    
    if (closeNexusBtn) {
        closeNexusBtn.addEventListener('click', () => toggleNexus(false));
    }

    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            const stack = document.getElementById('nexus-cards-list');
            const cardCount = stack ? stack.querySelectorAll('.premium-physical-card:not(.placeholder-card)').length : 0;
            
            if (cardCount >= 6) {
                alert('You have reached the maximum limit of 6 cards.');
                return;
            }
            toggleAddCardModal(true);
        });
    }


    if (closeAddCardBtn) {
        closeAddCardBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAddCardModal(false);
        });
    }

    const addCardHeader = document.getElementById('add-card-header');
    const addCardModal = document.getElementById('add-card-modal');
    
    if (addCardHeader && addCardModal) {
        let startY = 0;
        let isDragging = false;

        addCardHeader.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
            addCardModal.style.transition = 'none';
        }, { passive: true });

        addCardHeader.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0) {
                addCardModal.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });

        addCardHeader.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            addCardModal.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
            
            const diff = e.changedTouches[0].clientY - startY;
            if (diff > 100) {
                toggleAddCardModal(false);
            } else {
                addCardModal.style.transform = 'translateY(0)';
            }
        }, { passive: true });
    }

    initCardTypePicker();
    initFormValidation();
    initFormSubmit();
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
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const stack = document.getElementById('nexus-cards-list');
            const cardCount = stack ? stack.querySelectorAll('.premium-physical-card:not(.placeholder-card)').length : 0;

            if (cardCount >= 6) {
                showNexusToast('Maximum limit of 6 cards reached.');
                toggleAddCardModal(false);
                return;
            }

            const type = document.getElementById('new-card-type').value;
            const last4 = document.getElementById('new-card-last4').value;
            const expiry = document.getElementById('new-card-expiry').value;

            if (!type) {
                showNexusToast('Please select a Card Type.');
                const picker = document.getElementById('card-type-trigger');
                if (picker) {
                    picker.style.borderColor = 'var(--accent-red)';
                    setTimeout(() => picker.style.borderColor = '', 2000);
                }
                return;
            }

            if (last4.length < 4) {
                showNexusToast('Enter the last 4 digits.');
                return;
            }

            if (expiry.length < 5) {
                showNexusToast('Enter a valid expiry date.');
                return;
            }

            addCardToStack(type, last4, expiry);
            showNexusToast('Card added successfully!', false);
            toggleAddCardModal(false);
            
            form.reset();
            const selectedText = document.getElementById('card-type-selected');
            if (selectedText) selectedText.textContent = 'Select Type';
        });
    }
}



function initFormValidation() {
    const last4Input = document.getElementById('new-card-last4');
    const expiryInput = document.getElementById('new-card-expiry');

    if (last4Input) {
        last4Input.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 4) val = val.slice(0, 4);
            e.target.value = val;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', (e) => {
            let cursorPosition = e.target.selectionStart;
            let val = e.target.value.replace(/\D/g, '');
            let formatted = '';

            if (val.length > 0) {
                formatted = val.slice(0, 2);
                if (val.length > 2) {
                    formatted += '/' + val.slice(2, 4);
                }
            }
            
            e.target.value = formatted;
            
            if (val.length === 3 && cursorPosition === 3) {
                e.target.setSelectionRange(4, 4);
            }
        });
    }
}

function addCardToStack(type, last4, expiry) {

    const stack = document.getElementById('nexus-cards-list');
    if (!stack) return;

    // Remove placeholder if exists
    const placeholder = stack.querySelector('.placeholder-card');
    if (placeholder) placeholder.remove();

    const card = document.createElement('div');
    card.className = 'premium-physical-card';
    
    // Ensure the new card is visually layered correctly
    const cardCount = stack.children.length;
    card.style.zIndex = cardCount + 2;

    // Map logo based on type



    let logoUrl = '/sublify-logo.png';
    // Potential for more logos later
    
    card.innerHTML = `
        <div class="card-chip"></div>
        <div class="card-brand-logo">
            <img src="${logoUrl}" alt="Card Logo">
        </div>
        <div class="card-number">•••• •••• •••• ${last4}</div>
        <div class="card-footer-info">
            <div class="card-holder">Nexus Member</div>
            <div class="card-expiry">${expiry}</div>
        </div>
    `;
    
    stack.appendChild(card);
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

export function toggleAddCardModal(show) {
    const modal = document.getElementById('add-card-modal');
    if (!modal) return;

    if (window.HapticsService) window.HapticsService.light();

    if (show) {
        modal.classList.remove('hidden');
        modal.style.transform = ''; // Reset inline drag transform
    } else {
        modal.classList.add('hidden');
        setTimeout(() => {
            modal.style.transform = ''; // Clear after transition
        }, 400);
    }
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
                const val = item.dataset.value;
                const text = item.textContent;
                selectedSpan.textContent = text;
                hiddenInput.value = val;
                dropdown.classList.add('hidden');
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
