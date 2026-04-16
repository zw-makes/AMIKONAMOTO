let accountSettingsActive = false;

export function initAccountSettingsPage() {
    const closeBtn = document.getElementById('close-account-settings');
    const settingsBtn = document.getElementById('account-settings-btn');
    const nameInput = document.getElementById('settings-name');
    const bannerName = document.getElementById('settings-banner-name');

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            toggleAccountSettingsPage(true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toggleAccountSettingsPage(false);
        });
    }

    // Live name preview — updates banner as user types
    if (nameInput && bannerName) {
        nameInput.addEventListener('input', () => {
            const val = nameInput.value.trim();
            bannerName.innerText = val || bannerName.dataset.fallback || '';
        });
    }

    // Fix: gender dropdown clipped by overflow-y:auto scroll container.
    // Solution: reposition dropdown using fixed coords from getBoundingClientRect().
    initFixedDropdown();
}

function initFixedDropdown() {
    const trigger = document.getElementById('settings-gender-trigger');
    const dropdown = document.getElementById('settings-gender-dropdown');
    if (!trigger || !dropdown) return;

    // Move dropdown to body so it escapes overflow clipping
    document.body.appendChild(dropdown);
    dropdown.style.position = 'fixed';
    dropdown.style.zIndex = '99999';

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = trigger.getBoundingClientRect();
        const isHidden = dropdown.classList.contains('hidden');

        if (isHidden) {
            dropdown.style.top = `${rect.bottom + 6}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.width = `${rect.width}px`;
            dropdown.classList.remove('hidden');
        } else {
            dropdown.classList.add('hidden');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Handle item selection
    dropdown.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (li) {
            const val = li.dataset.value;
            const hiddenInput = document.getElementById('settings-gender');
            const selectedSpan = document.getElementById('settings-gender-selected');
            if (hiddenInput) hiddenInput.value = val;
            if (selectedSpan) selectedSpan.innerText = li.innerText;
            dropdown.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
            li.classList.add('selected');
            dropdown.classList.add('hidden');
        }
    });
}

export function toggleAccountSettingsPage(show) {
    const settingsPage = document.getElementById('account-settings-page');
    if (!settingsPage) return;

    accountSettingsActive = show;
    if (window.HapticsService) window.HapticsService.medium();

    if (accountSettingsActive) {
        settingsPage.classList.remove('hidden');
    } else {
        settingsPage.classList.add('hidden');
    }
}

// Global expose
window.toggleAccountSettingsPage = toggleAccountSettingsPage;
window.isAccountSettingsActive = () => accountSettingsActive;
