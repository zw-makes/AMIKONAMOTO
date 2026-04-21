import './profile-page.css';

let profilePageActive = false;

export function initProfilePage() {
    const profilePage = document.getElementById('profile-page');
    const closeBtn = document.getElementById('close-profile');
    const profileBtn = document.getElementById('header-profile-btn');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            toggleProfilePage(true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toggleProfilePage(false);
        });
    }
}

export function toggleProfilePage(show) {
    const profilePage = document.getElementById('profile-page');
    if (!profilePage) return;

    profilePageActive = show;
    if (window.HapticsService) window.HapticsService.medium();

    if (profilePageActive) {
        profilePage.classList.remove('hidden');
        // Re-check network state every time the page opens
        if (window.syncProfileFieldsToNetworkState) window.syncProfileFieldsToNetworkState();
    } else {
        profilePage.classList.add('hidden');
    }
}

// Global expose for reliability across the app
window.toggleProfilePage = toggleProfilePage;
window.isProfilePageActive = () => profilePageActive;
