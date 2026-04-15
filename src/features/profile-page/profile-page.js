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
        // If other pages are active, we might want to close them or just overlay
        // For now, following user request to keep it simple and just make it a page
    } else {
        profilePage.classList.add('hidden');
    }
}

// Global expose for reliability across the app
window.toggleProfilePage = toggleProfilePage;
window.isProfilePageActive = () => profilePageActive;
