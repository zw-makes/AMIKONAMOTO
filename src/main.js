// Triggering iOS Build - March 13
import './style.css';
import './features/bottombar/bottombar.css';
import { supabase } from './supabase.js';
window.supabase = supabase;
import { initNotifications, clearReminders, loadNotifications } from './features/notifications/notifications.js';
import { initPricing } from './features/pricing/pricing.js';
import { initBottomBar } from './features/bottombar/bottombar.js';
import { initGlass } from './features/glass/glass.js';
import { showSubscriptionDetails } from './features/details/details.js';
import { NativeNotifications } from './features/notifications/nativeNotifications.js';
import { scheduleDailyReminders } from './features/notifications/dailyReminder.js';
import { queueOperation, getQueue } from './features/sync/syncQueue.js';
import { initListView, toggleListView } from './features/listview/listview.js';
import { HapticsService } from './features/haptics/haptics.js';
import { initFilter } from './features/filter/filter.js';
import { animateThanosSnap } from './features/ai-analyst/thanos-snap.js';
import { initCatalog } from './features/catalog/catalog.js';
import { initSmartImport, openSmartImport } from './features/smart-import/smart-import.js';
import { initSurveyPage } from './features/onboarding/survey-page.js';
import { initBelievePage } from './features/onboarding/believe-page.js';
import { initAuthPage, showAuthPage } from './features/onboarding/auth-view.js';
import { initEmailAuthPage, showEmailAuthPage, showOtpVerification, resetEmailAuthViews } from './features/onboarding/email-auth.js';
import { initGuider, showGuider } from './features/onboarding/guider.js';
import './features/onboarding/survey-page.css';
import { initProfilePage, toggleProfilePage } from './features/profile-page/profile-page.js';
import { initAccountSettingsPage, toggleAccountSettingsPage } from './features/account-settings/account-settings.js';
import './features/onboarding/believe-page.css';
import './features/onboarding/auth-page.css';
import './features/onboarding/email-auth.css';
import './features/onboarding/guider.css';
import { LOCAL_LOGOS } from './features/logos/local-logos-map.js';
import { initPullToRefresh } from './features/refresh/refresh.js';
import './features/data-management/data-management.css';
import { initDataManagement } from './features/data-management/data-management.js';
import { initNexus, populatePaymentCardsDropdown } from './features/nexus/nexus.js';
window.populatePaymentCardsDropdown = populatePaymentCardsDropdown;
import { initCategories, getCategories } from './features/categories/categories.js';
window.getCategories = getCategories;




// --- Global Start Time (Min 1.2s splash) ---
const appStartTime = Date.now();

// --- Global Utilities ---
window.getLogoUrl = function(domainOrUrl) {
    if (!domainOrUrl) return '';
    
    // Check if it's already a full URL or data:image
    if (domainOrUrl.startsWith('data:image') || (
        domainOrUrl.startsWith('http') && (
            domainOrUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|ico|bmp)/i) || 
            domainOrUrl.includes('supabase.co')
        )
    )) return domainOrUrl;
    
    // Support local paths
    if (domainOrUrl.startsWith('/')) return domainOrUrl;
    
    // Normalise to bare domain
    let domain = domainOrUrl;
    if (domain.startsWith('http')) {
        try {
            domain = new URL(domain).hostname;
        } catch(e) {}
    }

    // ✅ Check local bundled logos first (always works offline)
    if (LOCAL_LOGOS[domain]) {
        return LOCAL_LOGOS[domain];
    }
    
    // Robust brand mapping check for Sublify family
    const lower = domain.toLowerCase();
    if (lower.includes('sublify') || lower.includes('syncspend') || lower.includes('subtrack')) {
        return '/sublify-logo.png';
    }

    // Fallback: remote icon.horse (requires internet)
    return `https://icon.horse/icon/${domain}`;
};

// --- GLOBAL OFFLINE WARNING ---
window.showOfflineWarning = function() {
    document.getElementById('offline-warning-sheet')?.remove();
    const modal = document.createElement('div');
    modal.id = 'offline-warning-sheet';
    modal.style.cssText = `position: fixed; inset: 0; z-index: 11000; display: flex; align-items: flex-end; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); animation: fadeIn 0.2s ease;`;

    modal.innerHTML = `
        <div class="category-sheet-inner" style="
            width: 100%; max-width: 450px;
            background: rgba(13, 13, 13, 0.98);
            border-top: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px 32px 0 0;
            padding: 28px 24px 45px;
            animation: nexusSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        ">
            <div style="width: 36px; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; margin: 0 auto 32px;"></div>
            
            <div style="width: 66px; height: 66px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; opacity: 0.6; filter: grayscale(1);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
            </div>

            <h2 style="text-align: center; font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; color: #fff; font-family: var(--font-sci-fi);">
                Connection Required
            </h2>
            <p style="text-align: center; font-size: 0.88rem; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 35px; padding: 0 40px;">
                Please connect to the internet to perform cloud-sync operations like adding or removing categories and payment cards.
            </p>

            <button id="close-offline-warning" style="width: 100%; padding: 19px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; font-weight: 800; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;">
                UNDERSTOOD
            </button>
        </div>
    `;

    document.body.appendChild(modal);
    if (window.HapticsService) window.HapticsService.medium();
    
    document.getElementById('close-offline-warning').onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
};


// Initialize List View
initListView();
// Initialize Filter
initFilter();
// Initialize Catalog
initCatalog();
// Initialize Smart Import
initSmartImport();
// Initialize Survey
initSurveyPage();
// Initialize Believe
initBelievePage();
// Initialize New Auth
initAuthPage();
// Initialize Email Auth
initEmailAuthPage();
// Initialize Guider
initGuider();
window.showGuider = showGuider;

// Initialize Data Management
initDataManagement();

// Initialize Nexus
initNexus();

// Initialize Categories
initCategories();


// --- Sublify Sync Calendar Banner Logic ---
function initCalendarSyncBanner() {
    const phrases = [
        { text: "Add subscriptions from your email", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>` },
        { text: "Find all subs from bank statement", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21v-8"/><path d="M19 21v-8"/><path d="M9 21v-8"/><path d="M15 21v-8"/><path d="M12 4 5 10h14Z"/></svg>` },
        { text: "Upload a PDF, find your subs", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>` },
        { text: "Scan receipts, catch every sub", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>` },
        { text: "Import from CSV in seconds", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>` },
        { text: "Connect Gmail, we find the rest", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.3.8.8.8 1.4v10.2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.8c0-.6.3-1.1.8-1.4l8-5.3c.7-.5 1.7-.5 2.4 0l8 5.3Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>` },
        { text: "Drop your statement, we do the work", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.55 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M12 10v6"/><path d="m9 13 3-3 3 3"/></svg>` },
        { text: "Find hidden subs from your inbox", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>` }
    ];

    let phraseIdx = 0;
    let timer = null;

    // Helper to temporarily show a success message
    window.showCalendarSyncSuccess = (count) => {
        window.isSyncBannerSuccessMode = true;
        if (timer) clearTimeout(timer);

        const textContainer = document.getElementById('calendar-sync-text-container');
        const iconContainer = document.getElementById('calendar-sync-dynamic-icon');
        const banner = document.getElementById('calendar-smart-import-btn');

        if (textContainer) {
            textContainer.innerHTML = `<span class="smart-import-word" style="animation-delay: 0s; color: #00ff88; font-weight: 800;">✓</span> <span class="smart-import-word" style="animation-delay: 0.1s; color: #fff;">${count} Synced Subscriptions</span>`;
        }
        if (iconContainer) {
            iconContainer.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            iconContainer.style.background = 'rgba(0, 255, 136, 0.1)';
            iconContainer.style.borderColor = 'rgba(0, 255, 136, 0.2)';
        }
        if (banner) {
            banner.style.borderColor = 'rgba(0, 255, 136, 0.3)';
            banner.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.15)';
        }

        setTimeout(() => {
            window.isSyncBannerSuccessMode = false;
            if (iconContainer) {
                iconContainer.style.background = '';
                iconContainer.style.borderColor = '';
            }
            if (banner) {
                banner.style.borderColor = '';
                banner.style.boxShadow = '';
            }
            animate();
        }, 5000);
    };

    function animate() {
        if (window.isSyncBannerSuccessMode) return;
        const textContainer = document.getElementById('calendar-sync-text-container');
        const iconContainer = document.getElementById('calendar-sync-dynamic-icon');
        if (!textContainer) return;

        textContainer.innerHTML = '';
        const currentData = phrases[phraseIdx];
        const words = currentData.text.split(' ');

        if (iconContainer && iconContainer.innerHTML !== currentData.icon) {
            iconContainer.innerHTML = currentData.icon;
            iconContainer.style.animation = 'none';
            void iconContainer.offsetWidth; // trigger reflow
            iconContainer.style.animation = 'iconRotateIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        }

        words.forEach((word, idx) => {
            const span = document.createElement('span');
            span.innerText = word;
            span.className = 'smart-import-word';
            span.style.animationDelay = `${idx * 0.15}s`;
            textContainer.appendChild(span);
        });

        const finishTime = 2200 + (words.length * 150);
        timer = setTimeout(() => {
            if (!document.getElementById('calendar-sync-text-container')) return;
            textContainer.style.transition = 'opacity 0.4s ease';
            textContainer.style.opacity = '0';
            if (iconContainer) {
                iconContainer.style.transition = 'opacity 0.4s ease';
                iconContainer.style.opacity = '0';
            }
            setTimeout(() => {
                textContainer.style.transition = 'none';
                textContainer.style.opacity = '1';
                if (iconContainer) {
                    iconContainer.style.transition = 'none';
                    iconContainer.style.opacity = '1';
                }
                phraseIdx = (phraseIdx + 1) % phrases.length;
                animate();
            }, 400);
        }, finishTime);
    }

    animate();
}

// Initialize Calendar Sync Banner
initCalendarSyncBanner();

// Initialize Pull to Refresh (Calendar & List View root)
initPullToRefresh();


// --- World Currencies ---
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso' },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
];
window.CURRENCIES = CURRENCIES;
window.setFormDefaultCurrency = function() {
    const settings = userProfile?.settings || {};
    const defaultCurrency = settings.currency || 'USD';
    const currObj = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];
    
    const subCurrency = document.getElementById('sub-currency');
    const subSymbol = document.getElementById('sub-currency-symbol');
    const uiSymbol = document.getElementById('currency-symbol');
    const uiCode = document.getElementById('currency-code');
    
    if (subCurrency) subCurrency.value = currObj.code;
    if (subSymbol) subSymbol.value = currObj.symbol;
    if (uiSymbol) uiSymbol.textContent = currObj.symbol;
    if (uiCode) uiCode.textContent = currObj.code;
};

// --- Time Zones ---
const TIMEZONES = [
  { label: 'UTC-12:00 (International Date Line West)', value: 'UTC-12:00' },
  { label: 'UTC-11:00 (Samoa Time Zone)', value: 'UTC-11:00' },
  { label: 'UTC-10:00 (Hawaii-Aleutian Time Zone)', value: 'UTC-10:00' },
  { label: 'UTC-09:00 (Alaska Time Zone)', value: 'UTC-09:00' },
  { label: 'UTC-08:00 (Pacific Time Zone)', value: 'UTC-08:00' },
  { label: 'UTC-07:00 (Mountain Time Zone)', value: 'UTC-07:00' },
  { label: 'UTC-06:00 (Central Time Zone)', value: 'UTC-06:00' },
  { label: 'UTC-05:00 (Eastern Time Zone)', value: 'UTC-05:00' },
  { label: 'UTC-04:00 (Atlantic Time Zone)', value: 'UTC-04:00' },
  { label: 'UTC-03:00 (Argentina/Brazil Time)', value: 'UTC-03:00' },
  { label: 'UTC-02:00 (Mid-Atlantic Time)', value: 'UTC-02:00' },
  { label: 'UTC-01:00 (Azores Time)', value: 'UTC-01:00' },
  { label: 'UTC+00:00 (Greenwich Mean Time)', value: 'UTC+00:00' },
  { label: 'UTC+01:00 (Central European Time)', value: 'UTC+01:00' },
  { label: 'UTC+02:00 (Eastern European Time)', value: 'UTC+02:00' },
  { label: 'UTC+03:00 (Moscow/East Africa Time)', value: 'UTC+03:00' },
  { label: 'UTC+04:00 (Gulf Standard Time)', value: 'UTC+04:00' },
  { label: 'UTC+05:00 (Pakistan Standard Time)', value: 'UTC+05:00' },
  { label: 'UTC+05:30 (India Standard Time)', value: 'UTC+05:30' },
  { label: 'UTC+06:00 (Bangladesh Standard Time)', value: 'UTC+06:00' },
  { label: 'UTC+07:00 (Indochina Time)', value: 'UTC+07:00' },
  { label: 'UTC+08:00 (China/Singapore/Perth Time)', value: 'UTC+08:00' },
  { label: 'UTC+09:00 (Japan/Korea Standard Time)', value: 'UTC+09:00' },
  { label: 'UTC+10:00 (Australian Eastern Time)', value: 'UTC+10:00' },
  { label: 'UTC+11:00 (Solomon Islands Time)', value: 'UTC+11:00' },
  { label: 'UTC+12:00 (New Zealand Standard Time)', value: 'UTC+12:00' },
];

const FREE_AVATARS = [
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/FREE%20ONES/FREE%20(1).jpg",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/FREE%20ONES/FREE%20(2).jpg",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/FREE%20ONES/FREE%20(3).jpg",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/FREE%20ONES/FREE%20(4).jpg",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/FREE%20ONES/FREE%20(5).jpg"
];

const PAID_AVATARS = [
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(1).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(10).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(11).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(12).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(13).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(14).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(15).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(17).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(18).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(19).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(2).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(20).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(21).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(3).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(4).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(5).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(6).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(8).gif",
  "https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/USER%20IMAGES/PAID%20ONES/PAID%20(9).gif"
];

// --- State Management ---
let currentUser = null;
let subscriptions = [];
const cachedInitial = localStorage.getItem('subscriptions');
if (cachedInitial) {
  try { subscriptions = JSON.parse(cachedInitial); } catch(e) {}
}
let currentDate = new Date();
let currentStatsFilter = 'all';

// Set initial loading state based on local cache availability
window.isInitialDataLoading = !localStorage.getItem('subscriptions');

Object.defineProperty(window, 'subscriptions', {
  get: () => subscriptions,
  set: (val) => { subscriptions = val; }
});

Object.defineProperty(window, 'currentDate', {
  get: () => currentDate,
  set: (val) => { currentDate = val; }
});

Object.defineProperty(window, 'userProfile', {
  get: () => userProfile,
  set: (val) => { userProfile = val; }
});

let exchangeRatesCache = {}; // base -> { rates, timestamp }
const DEFAULT_SUBS = [
  { name: 'Netflix', price: 15.99, date: 2, type: 'monthly', color: '--accent-pink', currency: 'USD', symbol: '$' },
  { name: 'Adobe', price: 52.99, date: 7, type: 'monthly', color: '--accent-orange', currency: 'USD', symbol: '$' },
  { name: 'Apple', price: 9.99, date: 12, type: 'monthly', color: '--text-primary', currency: 'USD', symbol: '$' },
  { name: 'Figma', price: 15.00, date: 28, type: 'monthly', color: '--accent-purple', currency: 'USD', symbol: '$' },
  { name: 'Slack', price: 12.50, date: 25, type: 'yearly', color: '--accent-yellow', currency: 'USD', symbol: '$' },
];

// --- Selectors ---
const authScreen = document.getElementById('auth-screen');
const welcomeView = document.getElementById('welcome-view');
const loginView = document.getElementById('login-view');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const toggleAuth = document.getElementById('toggle-auth');
const getStartedBtn = document.getElementById('get-started-btn');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const onboardingScreen = document.getElementById('onboarding-screen');
const welcomeScreen = document.getElementById('welcome-screen');
// --- Account Settings Logic handled in account-settings.js ---
const settingsForm = document.getElementById('settings-form');
const avatarUpload = document.getElementById('avatar-upload');
const avatarImgPreview = document.getElementById('avatar-img-preview');
const avatarSvgPlaceholder = document.getElementById('avatar-svg-placeholder');
const accountSettingsBtn = document.getElementById('account-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings');

// Gender Picker Selectors
const genderPicker = document.getElementById('gender-picker');
const genderTrigger = document.getElementById('gender-trigger');
const genderDropdown = document.getElementById('gender-dropdown');
const genderSelectedSpan = document.getElementById('gender-selected');
const genderList = document.getElementById('gender-list');
const genderHiddenInput = document.getElementById('settings-gender');

// App Settings Selectors
const appSettingsModal = document.getElementById('app-settings-modal');
const appSettingsBtn = document.getElementById('app-settings-btn');
const closeAppSettingsBtn = document.getElementById('close-app-settings');
const saveAppSettingsBtn = document.getElementById('save-app-settings');
const notifToggle = document.getElementById('notif-toggle');
const themeToggle = document.getElementById('theme-toggle');
const autoCurrencyToggle = document.getElementById('auto-currency-toggle');
const usdTotalToggle = document.getElementById('usd-total-toggle');
const timezonePicker = document.getElementById('timezone-picker');
const timezoneTrigger = document.getElementById('timezone-trigger');
const timezoneDropdown = document.getElementById('timezone-dropdown');
const timezoneSelectedSpan = document.getElementById('timezone-selected');
const timezoneList = document.getElementById('timezone-list');
const timezoneSearch = document.getElementById('timezone-search');
const timezoneHiddenInput = document.getElementById('settings-timezone');

const settingsCurrencyPicker = document.getElementById('settings-currency-picker');
const settingsCurrencyTrigger = document.getElementById('settings-currency-trigger');
const settingsCurrencyDropdown = document.getElementById('settings-currency-dropdown');
const settingsCurrencySelected = document.getElementById('settings-currency-selected');
const settingsCurrencyList = document.getElementById('settings-currency-list');
const prefCurrencyHidden = document.getElementById('settings-pref-currency');

const notifTimePicker = document.getElementById('notif-time-picker');
const notifTimeTrigger = document.getElementById('notif-time-trigger');
const notifTimeDropdown = document.getElementById('notif-time-dropdown');
const notifTimeSelected = document.getElementById('notif-time-selected');
const notifTimeList = document.getElementById('notif-time-list');
const notifTimeSearch = document.getElementById('notif-time-search');
const notifTimeHidden = document.getElementById('settings-notif-time');

let isSignUp = false;
let userProfile = null; // { name, age, gender }

window.isSubPaid = function (sub, date) {
  const profile = window.userProfile;
  const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

  // If we have history for this specific sub
  if (profile?.settings?.paid_history?.[sub.id]) {
    const history = profile.settings.paid_history[sub.id];
    
    // For trials and yearly plans, paying ONCE means it's paid for its entire duration
    const isMultiMonthTrial = sub.type === 'trial' && parseInt(sub.trialMonths) > 0;
    if (sub.type === 'yearly' || isMultiMonthTrial) {
      if (history.length > 0) return true; // Paid in ANY month means paid globally
    }
    
    // For regular monthly plans, check specific month
    return history.includes(monthKey);
  }

  // Fallback for non-recurring subs: use the boolean flag
  if (sub.recurring !== 'recurring') {
    return sub.paid;
  }

  // For recurring subs, if not in history for this month, it's unpaid
  return false;
};

const monthDisplay = document.getElementById('current-month');
const calendarGrid = document.getElementById('calendar-grid');
const subCountEl = document.getElementById('sub-count');
const newCountEl = document.getElementById('new-count');
const totalAmountEl = document.getElementById('total-amount');
const addModal = document.getElementById('add-modal');
const dayDetailModal = document.getElementById('day-detail-modal');
const subForm = document.getElementById('sub-form');
const tooltip = document.getElementById('tooltip');

// --- Currency Picker Setup ---
function renderCurrencyList(filter = '') {
  const list = document.getElementById('currency-list');
  const selectedCode = document.getElementById('sub-currency').value;
  const filtered = CURRENCIES.filter(c =>
    c.name.toLowerCase().includes(filter.toLowerCase()) ||
    c.code.toLowerCase().includes(filter.toLowerCase())
  );
  list.innerHTML = filtered.map(c => `
    <li data-code="${c.code}" data-symbol="${c.symbol}" class="${c.code === selectedCode ? 'selected' : ''}">
      <span class="cur-symbol">${c.symbol}</span>
      <span>${c.code} – ${c.name}</span>
    </li>
  `).join('');
  list.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => selectCurrency(li.dataset.code, li.dataset.symbol));
  });
}

function selectCurrency(code, symbol) {
  document.getElementById('sub-currency').value = code;
  document.getElementById('sub-currency-symbol').value = symbol;
  document.getElementById('currency-symbol').textContent = symbol;
  document.getElementById('currency-code').textContent = code;
  document.getElementById('currency-dropdown').classList.add('hidden');
}

document.getElementById('currency-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('currency-dropdown');
  dropdown.classList.toggle('hidden');
  if (!dropdown.classList.contains('hidden')) {
    renderCurrencyList();
    document.getElementById('currency-search').value = '';
    document.getElementById('currency-search').focus();
  }
});

document.getElementById('currency-search').addEventListener('input', (e) => {
  renderCurrencyList(e.target.value);
});

// --- Platform Picker Setup ---
const popularApps = [
  { name: 'Netflix', domain: 'netflix.com' },
  { name: 'Spotify', domain: 'spotify.com' },
  { name: 'Amazon Prime', domain: 'amazon.com' },
  { name: 'YouTube Premium', domain: 'youtube.com' },
  { name: 'Apple Music', domain: 'apple.com' },
  { name: 'Disney+', domain: 'disneyplus.com' },
  { name: 'Hulu', domain: 'hulu.com' },
  { name: 'HBO Max', domain: 'max.com' },
  { name: 'Adobe CC', domain: 'adobe.com' },
  { name: 'Figma', domain: 'figma.com' },
  { name: 'Slack', domain: 'slack.com' },
  { name: 'Google Workspace', domain: 'google.com' },
  { name: 'Canva', domain: 'canva.com' },
  { name: 'Notion', domain: 'notion.so' },
  { name: 'Grammarly', domain: 'grammarly.com' },
  { name: 'Medium', domain: 'medium.com' },
  { name: 'Dropbox', domain: 'dropbox.com' },
  { name: 'Discord Nitro', domain: 'discord.com' },
  { name: 'SUBLIFY', domain: '/sublify-logo.png' }
];
window.popularApps = popularApps;
window.getDomain = getDomain;

function renderPlatformList(filter = '') {
  const platformList = document.getElementById('platform-list');
  platformList.innerHTML = '';

  const filtered = popularApps.filter(app =>
    app.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Dynamically allow any user text or link to immediately resolve into an app
  if (filter.trim()) {
    const computedDomain = getDomain({ name: filter.trim(), domain: '' });
    const isDuplicate = filtered.some(app => 
        app.domain === computedDomain || app.name.toLowerCase() === filter.trim().toLowerCase()
    );
    
    if (!isDuplicate) {
      filtered.push({
        name: filter.trim(),
        domain: computedDomain
      });
    }
  }

  filtered.forEach(app => {
    const li = document.createElement('li');
    const logoUrl = window.getLogoUrl(app.domain);
    li.innerHTML = `
      <img src="${logoUrl}" alt="${app.name}">
      <span>${app.name}</span>
    `;
    li.addEventListener('click', () => selectPlatform(app.name, app.domain));
    platformList.appendChild(li);
  });
}

function selectPlatform(name, domain) {
  document.getElementById('sub-name').value = name;
  document.getElementById('sub-domain').value = domain;
  updatePlatformIcon(domain);
  document.getElementById('platform-dropdown').classList.add('hidden');
}

window.updatePlatformIcon = function(domainOrUrl) {
  const preview = document.getElementById('selected-platform-icon');
  if (!domainOrUrl) {
    preview.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>`;
    return;
  }
  const logoUrl = window.getLogoUrl(domainOrUrl);
  preview.innerHTML = `<img src="${logoUrl}" style="width:100%; height:100%; object-fit:contain;">`;
};

document.getElementById('platform-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  const dropdown = document.getElementById('platform-dropdown');
  dropdown.classList.toggle('hidden');
  if (!dropdown.classList.contains('hidden')) {
    renderPlatformList();
    document.getElementById('platform-search').value = '';
    document.getElementById('platform-search').focus();
  }
});

document.getElementById('platform-search').addEventListener('input', (e) => {
  renderPlatformList(e.target.value);
});

// Custom Logo Upload Logic
document.getElementById('upload-custom-logo-btn').addEventListener('click', () => {
  document.getElementById('custom-logo-upload').click();
});

document.getElementById('custom-logo-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      document.getElementById('sub-domain').value = base64; // Use full Base64 string
      updatePlatformIcon(base64);
      
      // Auto-set Name if empty
      const nameInput = document.getElementById('sub-name');
      if (!nameInput.value.trim()) {
        nameInput.value = file.name.split('.')[0];
      }
      
      document.getElementById('platform-dropdown').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('sub-name').addEventListener('input', (e) => {
  const currentDomain = document.getElementById('sub-domain').value;
  const isDirect = currentDomain.startsWith('data:image') || (
      currentDomain.startsWith('http') && (
          currentDomain.match(/\.(jpeg|jpg|gif|png|webp|svg|ico|bmp)/i) || 
          currentDomain.includes('supabase.co')
      )
  );
  if (isDirect) {
    // User has a custom/branded logo, don't auto-update it
    return;
  }
  const val = e.target.value.trim();

  if (val.startsWith('http') || (val.includes('.') && val.includes('/'))) {
    // Looks like a full URL — extract the hostname
    let domain = val;
    try {
      domain = new URL(val.startsWith('http') ? val : 'https://' + val).hostname;
    } catch (err) { /* keep as-is */ }

    document.getElementById('sub-domain').value = domain;
    updatePlatformIcon(domain);

  } else if (val.includes('.') && !val.includes(' ')) {
    // Bare domain like "netflix.com"
    document.getElementById('sub-domain').value = val;
    updatePlatformIcon(val);

  } else {
    // Look up via brand map or popularApps, or fallback using getDomain's internal logic replica
    const match = popularApps.find(app => app.name.toLowerCase() === val.toLowerCase());
    if (match) {
      document.getElementById('sub-domain').value = match.domain;
      updatePlatformIcon(match.domain);
    } else {
      // Create a dummy object to run through our robust getDomain function
      const dummySub = { name: val, domain: '' };
      const computedDomain = getDomain(dummySub);
      
      // If we got 'example.com' from empty string, clear it. Otherwise use the computed domain.
      if (!val) {
        document.getElementById('sub-domain').value = '';
        updatePlatformIcon(null);
      } else {
        document.getElementById('sub-domain').value = computedDomain;
        updatePlatformIcon(computedDomain);
      }
    }
  }

    // --- UNIVERSAL HAPTIC ENGINE ---
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .glass-btn, .nav-arrow, .platform-trigger, .category-collection-row, .nexus-glow-btn, .add-page-back-btn, .status-icon-btn, [id$="-btn"]');
        if (!target) return;

        if (window.HapticsService) {
            const id = target.id?.toLowerCase() || '';
            // Priority 1: Heavy/Success/Danger Actions
            if (id.includes('delete') || id.includes('confirm') || id.includes('wipe') || target.classList.contains('submit-btn')) {
                window.HapticsService.medium();
            } 
            // Priority 2: Standard Interactions
            else {
                window.HapticsService.light();
            }
        }
    }, { capture: true });

    // --- RE-RENDER DEBOUNCE LOGIC ---
  // --- AUTO-CATEGORIZATION ---
  if (window.getCategoryForApp) {
    const name = document.getElementById('sub-name').value;
    const domain = document.getElementById('sub-domain').value;
    const suggestedCat = window.getCategoryForApp(name, domain);
    
    if (suggestedCat && suggestedCat !== 'Not set') {
        const catInput = document.getElementById('sub-category');
        const catText = document.getElementById('form-category-selected-text');
        const catIcon = document.getElementById('form-selected-category-icon');
        
        if (catInput) catInput.value = suggestedCat;
        if (catText) catText.textContent = suggestedCat;
        
        if (catIcon) {
            const allCats = (window.getCategories && typeof window.getCategories === 'function') ? window.getCategories() : [];
            const found = allCats.find(c => c.name === suggestedCat);
            catIcon.textContent = found ? (found.icon || '📁') : '📁';
        }
    }
  }
});

document.addEventListener('click', (e) => {
  if (!document.getElementById('platform-picker').contains(e.target)) {
    document.getElementById('platform-dropdown').classList.add('hidden');
  }
  if (!document.getElementById('currency-picker').contains(e.target)) {
    document.getElementById('currency-dropdown').classList.add('hidden');
  }
  if (!document.getElementById('trial-days-picker').contains(e.target)) {
    document.getElementById('trial-days-dropdown').classList.add('hidden');
  }
});

// --- Currency Exchange ---
async function fetchExchangeRates(base = 'USD') {
  const now = Date.now();
  const storageKey = 'sublify_exchange_rates_' + base;
  
  // 1. Try to populate memory cache from local storage if memory is empty
  if (!exchangeRatesCache[base]) {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { exchangeRatesCache[base] = JSON.parse(stored); } catch (e) {}
    }
  }

  // 2. Return cached rates if they are fresh (< 1 hour old)
  if (exchangeRatesCache[base] && (now - exchangeRatesCache[base].timestamp < 3600000)) {
    return exchangeRatesCache[base].rates;
  }

  // 3. Attempt to fetch live rates
  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await response.json();
    if (data.result === 'success') {
      exchangeRatesCache[base] = { rates: data.rates, timestamp: now };
      localStorage.setItem(storageKey, JSON.stringify(exchangeRatesCache[base]));
      return data.rates;
    }
  } catch (err) {
    console.warn(`[Offline] Live fetch failed for ${base}.`);
  }

  // 4. Offline Best-Effort Fallback: 
  // If we have THE specific base even if it's old, use it.
  if (exchangeRatesCache[base]) return exchangeRatesCache[base].rates;

  // 5. UNIVERSAL SYNTHETIC FALLBACK:
  // If requested base is missing (e.g. user offline and switched to NZD but only have INR cache),
  // search ALL local storage for ANY rates cache and mathematically derive the missing base rates.
  console.log(`[Offline Logic] Searching Universal Fallback for ${base}...`);
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('sublify_exchange_rates_')) {
      try {
        const otherBase = key.replace('sublify_exchange_rates_', '');
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.rates && data.rates[base]) {
          console.log(`[Offline Sync] Reconstructing ${base} rates from ${otherBase} cache!`);
          const pivotRate = data.rates[base]; // Value of 1 otherBase in base
          const reconstructed = {};
          // If 1 USD = 80 INR, and we want INR base, then 1 INR = 1/80 USD.
          // TargetRate = (USD/Target) / (USD/Base)
          for (const [curr, rate] of Object.entries(data.rates)) {
            reconstructed[curr] = rate / pivotRate;
          }
          exchangeRatesCache[base] = { rates: reconstructed, timestamp: data.timestamp };
          return reconstructed;
        }
      } catch (e) {}
    }
  }

  return null;
}

function getConvertedPrice(price, fromCurrency, targetCurrency, rates) {
  const p = parseFloat(price) || 0;
  if (!rates) return p;
  const from = fromCurrency || 'USD';
  if (from === targetCurrency) return p;
  
  // If the rates object is directly the from-to link
  if (typeof rates === 'number') return p * rates;
  
  // Standard extraction from rates object
  const rate = rates[from];
  if (rate !== undefined) return p / rate;
  
  return p;
}
window.fetchExchangeRates = fetchExchangeRates;
window.getConvertedPrice = getConvertedPrice;

// --- Functions ---

function updateTime() {
  const timeEl = document.getElementById('current-time');
  if (!timeEl) return;

  let now = new Date();

  // Apply timezone offset from settings if exists
  if (userProfile?.settings?.timezone) {
    const tz = userProfile.settings.timezone; // e.g., "UTC+05:30"
    const match = tz.match(/UTC([+-])(\d{2}):(\d{2})/);
    if (match) {
      const sign = match[1] === '+' ? 1 : -1;
      const hours = parseInt(match[2]);
      const minutes = parseInt(match[3]);
      const offsetMs = (hours * 60 + minutes) * 60 * 1000 * sign;

      // Get current UTC time and add the offset
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      now = new Date(utc + offsetMs);
    }
  }

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  timeEl.innerText = timeStr;
}

window.loadSubscriptions = loadSubscriptions;
let lastFetchTimestamp = 0;
let cachedAvatarUrl = null; // Part 3: Persistent avatar cache
let renderTimeout = null;   // Part 4: For debouncing

function debounceRender(callback, delay = 300) {
  if (renderTimeout) clearTimeout(renderTimeout);
  renderTimeout = setTimeout(callback, delay);
}

async function loadSubscriptions(force = false) {
  if (!currentUser) return;

  // Faster than Light: If we just fetched successfully in the last 15 seconds, skip background sync
  // unless explicitly forced (e.g. manual refresh or auth change).
  const now = Date.now();
  if (!force && lastFetchTimestamp && (now - lastFetchTimestamp < 15000)) {
     console.log('[Sync] Skipping redundant background sync (speed optimization)');
     return;
  }
  lastFetchTimestamp = now;

  const footTotal = document.getElementById('total-amount');
  // Show a subtle skeleton bar instead of a jarring "Loading..." text
  if (footTotal) {
    footTotal.innerHTML = '<span class="total-amount-skeleton">&nbsp;</span>';
  }

  // 1. OFFLINE-FIRST OPTIMISTIC LOAD: Always render what's in local storage first!
  const cached = localStorage.getItem('subscriptions');
  if (cached) {
    subscriptions = JSON.parse(cached);
    window.isInitialDataLoading = false;
    renderCalendar();
    updateStats();
  } else {
    // No cache → show skeleton grid so the calendar doesn't look completely empty
    window.isInitialDataLoading = true;
    subscriptions = [];

    // Skeletonize stats in the legend box
    const subCountEl = document.getElementById('sub-count');
    const newCountEl = document.getElementById('new-count');
    if (subCountEl) subCountEl.innerHTML = '<span class="skeleton-lv-pill" style="width:15px; height:10px; display:inline-block; margin:0 2px;"></span>';
    if (newCountEl) newCountEl.innerHTML = '<span class="skeleton-lv-pill" style="width:15px; height:10px; display:inline-block; margin:0 2px;"></span>';
    
    // Always prepare both skeletons so toggling between views during load is seamless
    if (typeof window.renderSkeletonListView === 'function') window.renderSkeletonListView();
    renderSkeletonCalendar();
  }

  // If literally offline mode, stop here.
  if (!navigator.onLine) {
    console.log('[Offline] Using local subscriptions cache.');
    if (footTotal && subscriptions.length > 0) footTotal.innerText = 'Offline Mode';
    return;
  }

    // 2. BACKGROUND SYNC with a longer 15s timeout for stability
    try {
      const subPromise = supabase.from('subscriptions').select('*').eq('user_id', currentUser.id);
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000));
      
      const { data, error } = await Promise.race([subPromise, timeoutPromise]);
      if (error) {
        // If it's a transient 400/404, we log it but don't crash
        console.error('[Sync] Supabase request failed:', error.message);
        throw error;
      }

    if (data && data.length > 0) {
      subscriptions = data;
    } else {
      // New users start with an empty dashboard
      subscriptions = [];

      // If we haven't marked demo as handled, do it now (effectively ignoring it)
      const settings = userProfile?.settings || {};
      if (settings.demo_handled !== true && userProfile) {
        userProfile.settings = { ...settings, demo_handled: true };
        await supabase.from('profiles').update({ settings: userProfile.settings }).eq('id', currentUser.id);
      }
    }

    // Merge any pending offline operations before rendering or caching
    const q = getQueue();
    q.forEach(item => {
      if (item.action === 'upsert_sub' && item.data) {
        const idx = subscriptions.findIndex(s => s.id === item.data.id);
        if (idx !== -1) subscriptions[idx] = { ...subscriptions[idx], ...item.data };
        else subscriptions.push(item.data);
      } else if (item.action === 'delete_sub' && item.data) {
        subscriptions = subscriptions.filter(s => s.id !== item.data.id);
      }
    });

    // Always sync local cache with the exact DB state (plus pending changes)
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

    window.isInitialDataLoading = false;
    updateReminders();
    renderCalendar();
    updateStats();
  } catch (err) {
    
    console.warn('[Sync] Subscriptions sync delayed/failed:', err.message);
  }
}

window.saveToSupabase = saveToSupabase;
async function saveToSupabase(sub) {
  if (!currentUser) return null;
  
  // IMMEDIATELY cache the local change to make it offline-first
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

  // Define subToSave OUTSIDE the try block so the catch block can access it
  const subToSave = {
    id: sub.id,
    name: sub.name,
    price: sub.price,
    date: sub.date,
    type: sub.type,
    domain: sub.domain,
    currency: sub.currency,
    symbol: sub.symbol,
    color: sub.color,
    stopped: sub.stopped ?? false,
    paid: sub.paid ?? false,
    trialDays: sub.trialDays,
    trialMonths: sub.trialMonths,
    recurring: sub.recurring,
    startDate: sub.startDate,
    notes: sub.notes || null,
    category: sub.category || 'Not set',
    nexus_card_id: sub.nexus_card_id || null,
    user_id: currentUser.id
  };


  try {
    console.log('[Supabase] Attempting to save:', subToSave);

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subToSave)
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Save Error:', error.message, error.details, error.hint);
      throw error;
    }

    console.log('[Supabase] Save successful:', data);
    return data;
  } catch (err) {
    console.error('[Supabase] Error saving to Supabase:', err.message);
    // Queue for retry when back online
    queueOperation('upsert_sub', subToSave);
    return null;
  }
}

async function saveProfileToSupabase() {
  if (!currentUser || !userProfile) return;
  
  // 1. Update Local Cache IMMEDIATELY
  safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));

  try {
    // 2. Attempt network sync
    if (!navigator.onLine) {
      console.log('[Profile] Offline — queuing sync');
      if (window.queueOperation) {
        window.queueOperation('upsert_profile', userProfile);
        if (window.showNexusToast || window.showCategoriesToast) {
           const toast = window.showNexusToast || window.showCategoriesToast;
           toast('Saved locally — will sync when online.', false);
        }
      }
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: currentUser.id, ...userProfile });

    if (error) {
      console.warn('[Profile] Sync failed, queuing...', error.message);
      if (window.queueOperation) window.queueOperation('upsert_profile', userProfile);
      return;
    }
    
    console.log('[Supabase] Profile synced successfully');
  } catch (err) {
    console.error('[Supabase] Profile sync error:', err.message);
    if (window.queueOperation) window.queueOperation('upsert_profile', userProfile);
  } finally {
    // Part 2: Targeted update only
    updateProfileUI();
  }
}
window.saveProfileToSupabase = saveProfileToSupabase;

async function removeFromSupabase(id) {
  try {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;

    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  } catch (err) {
    console.error('Error removing from Supabase:', err.message);
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    // Queue for retry when back online
    queueOperation('delete_sub', { id });
  }
}

function renderHeader() {
  const options = { month: 'long', year: 'numeric' };
  monthDisplay.innerText = currentDate.toLocaleDateString('en-US', options);

  // --- Past Month Protection Logic ---
  const addBtn = document.getElementById('add-sub-btn');
  if (addBtn) {
    const today = new Date();
    const currentMonthView = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    if (currentMonthView < thisMonth) {
      addBtn.classList.add('dimmed');
      addBtn.disabled = true;
      addBtn.title = "You cannot add subscriptions to a past month.";
    } else {
      addBtn.classList.remove('dimmed');
      addBtn.disabled = false;
      addBtn.removeAttribute('title');
    }
  }
}

// --- Filter Logic ---
window.getDisplaySubscriptions = function() {
    const f = window.getGlobalFilters ? window.getGlobalFilters() : null;
    if (!f) return subscriptions;

    return subscriptions.filter(s => {
        // Filter by platform name
        if (f.name && !s.name.toLowerCase().includes(f.name.toLowerCase())) return false;
        
        // Filter by frequency
        if (f.frequency !== 'all' && s.type !== f.frequency) return false;
        
        // Filter by currency
        if (f.currency && f.currency !== 'all') {
            const subCurr = (s.currency || 'USD').toUpperCase();
            const filterCurr = f.currency.toUpperCase();
            if (subCurr !== filterCurr) return false;
        }

        // Filter by category
        if (f.category && f.category !== 'all' && s.category !== f.category) return false;

        // Filter by status
        if (f.status && f.status !== 'all') {
            const { end } = window.getSubDates ? window.getSubDates(s) : { end: null };
            const isEnded = end && end < new Date();
            const isPaid = window.isSubPaid ? window.isSubPaid(s, currentDate) : false;
            
            if (f.status === 'active') {
                if (s.stopped || isEnded) return false;
            } else if (f.status === 'cancelled') {
                if (!s.stopped) return false;
            } else if (f.status === 'ended') {
                if (!isEnded) return false;
            } else if (f.status === 'paid') {
                if (!isPaid) return false;
            } else if (f.status === 'unpaid') {
                if (isPaid) return false;
            }
        }
        
        return true;
    });
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // Returns 0 for Sunday, 1 for Monday, etc. Adjust for Mon-Sun grid.
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0 (Mon) to 6 (Sun)
}

window.renderCalendar = renderCalendar;
window.updateStats = updateStats;

// --- Skeleton Calendar (shown while data is loading) ---
function renderSkeletonCalendar() {
  calendarGrid.innerHTML = '';
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay   = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Days of the week that "feel" like they'd have subs — add a fake circle on a few
  // to make the calendar look naturally populated rather than bare.
  const pseudoSubDays = new Set();
  // Sprinkle ~5 days across the month as visual hints
  const spread = [3, 7, 12, 18, 25].filter(d => d <= daysInMonth);
  spread.forEach(d => pseudoSubDays.add(d));

  function makeSkeletonCell(day, isOtherMonth, isToday) {
    const cell = document.createElement('div');
    cell.className = `calendar-cell skeleton-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    const span = document.createElement('span');
    span.className = 'cell-date';
    if (day) span.innerText = day;
    cell.appendChild(span);

    // Add a fake circular icon placeholder on select days
    if (!isOtherMonth && pseudoSubDays.has(day)) {
      const circle = document.createElement('div');
      circle.className = 'skeleton-circle';
      cell.appendChild(circle);

      // Fake dot in top-right (like a subscription colour dot)
      const dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;top:4px;right:4px;width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.1);';
      cell.appendChild(dot);
    }

    return cell;
  }

  // leading other-month cells
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarGrid.appendChild(makeSkeletonCell(null, true, false));
  }

  // current-month cells
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear();
    calendarGrid.appendChild(makeSkeletonCell(d, false, isToday));
  }

  // trailing cells to fill 42 slots
  const remaining = 42 - calendarGrid.children.length;
  for (let i = 1; i <= remaining; i++) {
    calendarGrid.appendChild(makeSkeletonCell(null, true, false));
  }
}

function renderCalendar() {
  if (window.isInitialDataLoading) return;
  calendarGrid.innerHTML = '';
  // Close tooltip on render to be safe
  hideTooltip();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const fullDate = new Date(year, month - 1, d);
    createCell(d, true, false, fullDate, false);
  }

  const todayDate = new Date();
  const viewedDateStart = new Date(year, month, 1);
  const todayDateStart = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
  const isPastMonth = viewedDateStart < todayDateStart;

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    const fullDate = new Date(year, month, d);
    createCell(d, false, isToday, fullDate, isPastMonth);
  }

  // Next month leading days (fill up to 42 cells for 6 rows of 7)
  const remainingCells = 42 - calendarGrid.children.length;
  for (let i = 1; i <= remainingCells; i++) {
    const fullDate = new Date(year, month + 1, i);
    createCell(i, true, false, fullDate, false);
  }


  updateStats();
}

window.getDomain = getDomain;
function getDomain(s) {
  const brandMap = {
    'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
    'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
    'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
    'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
    'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so',
    'twitter': 'twitter.com', 'x': 'x.com', 'meta': 'meta.com', 'facebook': 'facebook.com',
    'instagram': 'instagram.com', 'tiktok': 'tiktok.com', 'github': 'github.com',
    'chatgpt': 'openai.com', 'openai': 'openai.com', 'cursor': 'cursor.sh',
    'sublify': 'sublify.com', 'syncspend': 'sublify.com', 'subtrack': 'sublify.com'
  };
  
  let nameLower = (s.name || '').toLowerCase().trim();
  let domain = s.domain;

  // Absolute Priority for Sublify Family
  if (nameLower.includes('sublify') || nameLower.includes('syncspend') || nameLower.includes('subtrack')) {
    return 'sublify.com';
  }

  if (domain) {
    if (domain.startsWith('data:image')) return domain;
    
    // Check if it's already a full direct link (Supabase logo, specific image formats)
    const isDirect = domain.startsWith('http') && (
        domain.match(/\.(jpeg|jpg|gif|png|webp|svg|ico|bmp)/i) || 
        domain.includes('supabase.co')
    );
    if (isDirect) return domain;
  }

  if (!domain) {
    if (brandMap[nameLower]) {
      domain = brandMap[nameLower];
    } else {
      // Check if the user typed a URL or domain in the Name field
      let testInput = nameLower;
      if (!testInput.startsWith('http')) {
        testInput = 'https://' + testInput;
      }
      try {
        let parsed = new URL(testInput);
        if (parsed.hostname.includes('.')) {
          domain = parsed.hostname;
        } else {
          domain = nameLower.replace(/[^a-z0-9]/g, '') + '.com';
        }
      } catch (e) {
        domain = nameLower.replace(/[^a-z0-9]/g, '') + '.com';
      }
    }
  } else {
    // If s.domain was explicitly provided
    if (domain.startsWith('http')) {
      try { domain = new URL(domain).hostname; } catch (e) { }
    }
    domain = domain.trim().toLowerCase().replace(/^(https?:\/\/)?/, '').split('/')[0];
  }

  // Final cleanup for better logo hit rate
  if (domain && domain.startsWith('www.')) {
    domain = domain.substring(4);
  }
  return domain || 'example.com';
}

function createCell(day, isOtherMonth, isToday, fullDate, isPastMonth) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;

  if (fullDate) {
    cell.dataset.time = fullDate.getTime();

    // Check for Starred Dates (Persistent highlights)
    const starredDatesStr = localStorage.getItem('starred_dates') || '[]';
    try {
      const starred = JSON.parse(starredDatesStr);
      const dateStr = fullDate.toISOString().split('T')[0];
      if (starred.includes(dateStr)) {
        cell.classList.add('starred-day');
      }
    } catch (e) { }
  }

  const span = document.createElement('span');
  span.className = 'cell-date';
  span.innerText = day;
  cell.appendChild(span);

  if (!isOtherMonth) {
    cell.dataset.day = day;
  }

  // Check for subscriptions on this day (only for current month)
  if (!isOtherMonth) {
    const daySubs = getDisplaySubscriptions().filter(s => {
      const start = new Date(s.startDate);
      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
      
      // Inline styles to prevent iOS context menus
      cell.style.userSelect = 'none';
      cell.style.webkitUserSelect = 'none';
      cell.style.webkitTouchCallout = 'none';
      cell.style.webkitTapHighlightColor = 'transparent';
      if (s.type === 'monthly' || (s.type === 'trial' && !isMultiMonthTrial) || s.type === 'one-time') {
        if (s.date !== day) return false;
        if (s.type === 'monthly' && s.recurring === 'recurring') {
          const viewTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
          const startTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
          if (startTime <= viewTime) return true;
          return false;
        }

        // Month-exact matching required for one-time, trial, or non-recurring monthly
        const calendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return start.getMonth() === calendarDate.getMonth() && start.getFullYear() === calendarDate.getFullYear();
      }
      if (s.type === 'yearly' || isMultiMonthTrial) {
        if (s.date !== day) return false;
        // Visible every month within the 12-month frequency window
        const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
        const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
        const durationMonths = s.type === 'yearly' ? 12 : parseInt(s.trialMonths);
        return currentTotalMonths >= startTotalMonths && currentTotalMonths < startTotalMonths + durationMonths;
      }
      return false;
    });

    if (daySubs.length > 0) {
      // Dots container (top right)
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'sub-dots-container';

      // Icons container (center)
      const iconsContainer = document.createElement('div');
      iconsContainer.className = 'sub-icons-container';

      daySubs.forEach((sub, index) => {
        // Create dot (max 3, then a plus)
        if (index < 3) {
          const dot = document.createElement('div');
          dot.className = `sub-dot ${sub.stopped ? 'dimmed' : ''}`;
          let colorVar;
          if (sub.type === 'monthly') colorVar = 'var(--accent-green)';
          else if (sub.type === 'yearly') colorVar = 'var(--accent-blue)';
          else if (sub.type === 'one-time') colorVar = 'var(--accent-purple)';
          else colorVar = 'var(--accent-red)';

          dot.style.backgroundColor = colorVar;
          dot.style.color = colorVar; // For currentColor box-shadow
          dotsContainer.appendChild(dot);
        }

        // Create icon (only show first 2 to keep calendar clean)
        if (index < 2) {
          const isPaidOnThisMonth = window.isSubPaid(sub, currentDate);
          const icon = document.createElement('div');
          icon.className = `sub-icon ${sub.stopped ? 'dimmed' : ''} ${isPaidOnThisMonth ? 'paid-icon' : ''}`;

          // Smart brand mapping to ensure legit logos always work
          const brandMap = {
            'netflix': 'netflix.com',
            'spotify': 'spotify.com',
            'amazon': 'amazon.com',
            'prime': 'amazon.com',
            'youtube': 'youtube.com',
            'apple': 'apple.com',
            'disney': 'disneyplus.com',
            'hulu': 'hulu.com',
            'adobe': 'adobe.com',
            'figma': 'figma.com',
            'slack': 'slack.com',
            'google': 'google.com',
            'hbo': 'max.com',
            'canva': 'canva.com',
            'notion': 'notion.so'
          };

          let domain = getDomain(sub);
          const logoUrl = window.getLogoUrl(domain);

          const img = document.createElement('img');
          img.src = logoUrl;
          img.alt = sub.name;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.style.pointerEvents = 'none';

          // Circular Logo Container for Calendar
          icon.style.borderRadius = '50%';
          icon.style.overflow = 'hidden';
          // No click handler - details only open from list view or date popup

          // Fallback if logo fails (Show a sleek white cross)
          img.onerror = () => {
            icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
          };

          icon.appendChild(img);
          iconsContainer.appendChild(icon);
        }
      });

      // If more than 2 subscriptions, show a "+N" badge in the 3rd slot
      if (daySubs.length > 2) {
        const extraCount = daySubs.length - 2;
        const badge = document.createElement('div');
        badge.className = 'sub-icon calendar-extra-badge';
        badge.textContent = `+${extraCount}`;
        iconsContainer.appendChild(badge);
      }

      cell.appendChild(dotsContainer);
      cell.appendChild(iconsContainer);
    } else if (isPastMonth && daySubs.length === 0) {
      cell.classList.add('empty-past-day');
    }
  }

  calendarGrid.appendChild(cell);

  // Click listener for detailed view
  cell.addEventListener('click', () => {
    if (!isOtherMonth) {
      const daySubs = subscriptions.filter(s => {
        const { start, end } = getSubDates(s);

        // Starts today logic
        let startsToday = false;
        if (s.type === 'monthly' || s.type === 'trial' || s.type === 'one-time') {
          if (s.date === day) {
            if (s.type === 'monthly' && s.recurring === 'recurring') {
              const viewTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
              const startTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
              if (startTime <= viewTime) startsToday = true;
            } else {
              const calendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
              if (start.getMonth() === calendarDate.getMonth() && start.getFullYear() === calendarDate.getFullYear()) startsToday = true;
            }
          }
        } else if (s.type === 'yearly') {
          if (s.date === day) {
            const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
            const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
            if (currentTotalMonths >= startTotalMonths && currentTotalMonths < startTotalMonths + 12) startsToday = true;
          }
        }

        // Ends today logic
        let endsToday = false;
        if (end) {
          if (end.getDate() === day && end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear()) {
            endsToday = true;
          }
        }

        return startsToday || endsToday;
      });

      if (daySubs.length > 0) {
        showDayDetails(day, daySubs);
      }
    }
  });

  // Tooltip listeners
  if (!isOtherMonth) {
    const daySubs = subscriptions.filter(s => {
      const start = new Date(s.startDate);
      // For monthly/trial/one-time, check if it matches the day and we are in the correct month view
      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
      if (s.type === 'monthly' || (s.type === 'trial' && !isMultiMonthTrial) || s.type === 'one-time') {
        if (s.date !== day) return false;
        if (s.type === 'monthly' && s.recurring === 'recurring') {
          const viewTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getTime();
          const startTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
          if (startTime <= viewTime) return true;
          return false;
        }

        // One-time or first month of recurring
        const calendarDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        return start.getMonth() === calendarDate.getMonth() && start.getFullYear() === calendarDate.getFullYear();
      }

      // For yearly, show every month within the 12-month frequency window
      if (s.type === 'yearly' || isMultiMonthTrial) {
        if (s.date !== day) return false;
        const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
        const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
        const durationMonths = s.type === 'yearly' ? 12 : parseInt(s.trialMonths);
        return currentTotalMonths >= startTotalMonths && currentTotalMonths < startTotalMonths + durationMonths;
      }

      return false;
    });
    if (daySubs.length > 0) {
      cell.addEventListener('mouseenter', (e) => showTooltip(e, daySubs));
      cell.addEventListener('mousemove', (e) => moveTooltip(e));
      cell.addEventListener('mouseleave', hideTooltip);

      // Long-press logic (1 second)
      let holdTimer;
      const startHold = (e) => {
        holdTimer = setTimeout(() => {
          showTooltip(e, daySubs);
        }, 300);
      };
      const clearHold = () => {
        clearTimeout(holdTimer);
        hideTooltip();
      };

      cell.addEventListener('mousedown', startHold);
      cell.addEventListener('touchstart', startHold, { passive: true });
      cell.addEventListener('mouseup', clearHold);
      cell.addEventListener('mouseleave', clearHold);
      cell.addEventListener('touchend', clearHold);
      cell.addEventListener('touchmove', clearHold, { passive: true });
      cell.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }
}

window.showTooltip = showTooltip;
window.moveTooltip = moveTooltip;
window.hideTooltip = hideTooltip;

async function showTooltip(e, subs) {
  if (!tooltip) return;
  HapticsService.selection();
  const settings = userProfile?.settings || {};
  const useAutoCurrency = settings.autoCurrency !== false;
  const targetCurrency = settings.currency || 'USD';
  const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
  const targetSymbol = targetCurrObj.symbol || '$';

  let targetRates = null;
  if (useAutoCurrency) {
    targetRates = await fetchExchangeRates(targetCurrency);
  }

  tooltip.innerHTML = subs.map(s => {
    const priceNum = parseFloat(s.price) || 0;
    const originalPriceStr = `${s.symbol || '$'}${priceNum.toFixed(2)}`;
    let price = s.price;
    let symbol = s.symbol || '$';
    let displayPrice = originalPriceStr;

    if (useAutoCurrency && targetRates && (s.currency || 'USD') !== targetCurrency) {
      price = getConvertedPrice(price, s.currency || 'USD', targetCurrency, targetRates);
      symbol = targetSymbol;
      displayPrice = `${originalPriceStr} <span style="opacity: 0.6; margin: 0 4px;">→</span> ${symbol}${price.toFixed(2)}`;
    }
    const isPaidOnThisMonth = window.isSubPaid(s, currentDate);
    return `
      <div class="tooltip-item ${s.stopped ? 'dimmed' : ''}">
        <div style="display: flex; align-items: center; gap: 4px;">
          ${isPaidOnThisMonth ? '<span style="color:var(--accent-green); font-size: 0.7rem; font-weight: 800;">✓</span>' : ''}
          <span>${s.name}</span>
        </div>
        <span class="tooltip-price">${displayPrice}</span>
      </div>
    `;
  }).join('');

  if (!tooltip) return;
  tooltip.classList.remove('hidden');
  moveTooltip(e);
}

function moveTooltip(e) {
  if (!tooltip) return;
  // Handle both mouse and touch events
  const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  // Keep tooltip on screen
  const rect = tooltip.getBoundingClientRect();
  
  // Position ABOVE the cursor/finger, centered horizontally
  const x = clientX - (rect.width / 2);
  const y = clientY - rect.height - 25; // 25px offset above

  let finalX = Math.max(10, Math.min(x, window.innerWidth - rect.width - 10));
  let finalY = y;

  // If it goes off the top, flip it to the bottom
  if (finalY < 10) {
    finalY = clientY + 25;
  }

  tooltip.style.left = `${finalX}px`;
  tooltip.style.top = `${finalY}px`;
}

function hideTooltip() {
  if (tooltip) tooltip.classList.add('hidden');
}

window.showDayDetails = async function (day, subs) {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const header = document.querySelector('#day-detail-modal .detail-header');

  // Refined header logic: Only build the toggle structure once
  if (!header.querySelector('.detail-header-container')) {
    header.innerHTML = `
      <div class="detail-header-container">
        <div class="day-title-group">
          <h3 id="detail-date-title" style="margin:0;">${monthName} ${day}</h3>
          <div class="detail-header-toggle">
            <span class="toggle-link active bought" id="toggle-bought">BOUGHT</span>
            <span class="toggle-divider">/</span>
            <span class="toggle-link ends" id="toggle-ends">ENDS</span>
          </div>
        </div>
        <button class="close-detail" id="close-detail">&times;</button>
      </div>
    `;
    // Attach close listener
    document.getElementById('close-detail').onclick = () => dayDetailModal.classList.add('hidden');
  } else {
    // Already built, just update content
    const title = document.getElementById('detail-date-title');
    if (title) title.innerText = `${monthName} ${day}`;
    // Reset toggle states
    const tb = document.getElementById('toggle-bought');
    const te = document.getElementById('toggle-ends');
    if (tb) { tb.classList.add('active'); }
    if (te) { te.classList.remove('active'); }
  }

  const settings = userProfile?.settings || {};
  let useAutoCurrency = settings.autoCurrency !== false;
  let targetCurrency = settings.currency || 'USD';

  if (settings.usdTotal) {
    useAutoCurrency = true;
    targetCurrency = 'USD';
  }

  const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
  const targetSymbol = targetCurrObj.symbol || '$';

  let displayRates = null;
  let mathRates = null;

  if (useAutoCurrency) {
    displayRates = await fetchExchangeRates(targetCurrency);
    mathRates = displayRates;
  } else {
    const uniqueCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  const boughtToday = [];
  const endsToday = [];

  subs.forEach(s => {
    const { start, end } = getSubDates(s);
    let isStart = false;
    if (s.date === day) {
      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
      if (s.type === 'monthly' && s.recurring === 'recurring') isStart = true;
      else if (s.type === 'yearly' || isMultiMonthTrial) {
        const currentTotalMonths = currentDate.getFullYear() * 12 + currentDate.getMonth();
        const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
        const durationMonths = s.type === 'yearly' ? 12 : parseInt(s.trialMonths);
        if (currentTotalMonths >= startTotalMonths && currentTotalMonths < startTotalMonths + durationMonths) isStart = true;
      } else {
        if (start.getMonth() === currentDate.getMonth() && start.getFullYear() === currentDate.getFullYear()) isStart = true;
      }
    }

    let isEnd = false;
    if (end && end.getDate() === day && end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear()) {
      isEnd = true;
    }

    if (isStart) boughtToday.push(s);
    if (isEnd) endsToday.push(s);
  });

  const list = document.getElementById('detail-list');
  const footTotal = document.getElementById('detail-total-amount');
  const labelEl = document.querySelector('#detail-total-amount')?.previousElementSibling;
  const finalSymbol = mathRates ? targetSymbol : (subs[0]?.symbol || '$');

  const updateModalContent = (activeList, type) => {
    // 1. Update List
    if (activeList.length === 0) {
      list.innerHTML = `<div style="padding:60px 20px; text-align:center; color:var(--text-dim); font-style:italic; font-size:0.9rem;">
        No subscriptions ${type === 'bought' ? 'bought' : 'ending'} on this day.
      </div>`;
    } else {
      list.innerHTML = activeList.map(s => {
        s.displayPrice = getDisplayPrice(s, targetCurrency, useAutoCurrency, displayRates);
        return getSwipeTemplate(s);
      }).join('');
      attachSwipeEvents();
    }

    // 2. Update Total & Paid Badge
    let sum = 0;
    let allPaid = activeList.length > 0;
    activeList.forEach(s => {
      let p = parseFloat(s.price) || 0;
      if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
      if (!s.stopped) sum += p;
      if (!window.isSubPaid(s, currentDate)) allPaid = false;
    });

    if (footTotal) {
      let totalHtml = `${finalSymbol}${sum.toFixed(2)}`;
      if (allPaid && activeList.length > 0) {
        totalHtml = `<div class="footer-badge-container">${totalHtml} <span class="tag-paid-small">PAID</span></div>`;
      }
      footTotal.innerHTML = totalHtml;
    }
    if (labelEl) labelEl.innerText = "SECTION TOTAL:";
  };

  const boughtToggle = document.getElementById('toggle-bought');
  const endsToggle = document.getElementById('toggle-ends');

  boughtToggle.onclick = () => {
    boughtToggle.classList.add('active');
    endsToggle.classList.remove('active');
    updateModalContent(boughtToday, 'bought');
  };

  endsToggle.onclick = () => {
    endsToggle.classList.add('active');
    boughtToggle.classList.remove('active');
    updateModalContent(endsToday, 'ends');
  };

  // Initial View
  updateModalContent(boughtToday, 'bought');
  dayDetailModal.classList.remove('hidden');
};

window.deleteSubscription = async function (id, e) {
  if (e) e.stopPropagation();

  // Robust element detection: use the event target's context if available, fallback to ID
  let element = null;
  if (e && e.target) {
    element = e.target.closest('.detail-item-wrapper');
  }
  if (!element) {
    element = document.getElementById(`sw-wrapper-${id}`);
  }

  if (element) {
    // 1. Snapshot the haptics early for a tactile feel
    HapticsService.heavy();
    
    // 2. Perform the Thanos disintegration on the row
    await animateThanosSnap(element);
  } else {
    HapticsService.heavy();
  }


  const subToRemove = subscriptions.find(s => s.id === id);
  if (subToRemove && window.addNotification) {
    window.addNotification({
      title: "Subscription Removed",
      text: `${subToRemove.name} has been deleted from your list.`,
      type: "info",
      domain: subToRemove.domain
    });
  }


  subscriptions = subscriptions.filter(s => s.id !== id);

  // Background sync (Optimistic)
  removeFromSupabase(id);

  renderCalendar();

  // Refresh whichever view is open
  updateStats();
  if (!document.getElementById('stats-modal').classList.contains('hidden')) {
    showMonthlyBreakdown(currentStatsFilter);
    dayDetailModal.classList.add('hidden');
  }

  // Refresh Category Explorer if open
  const explorer = document.getElementById('category-explorer');
  if (explorer && !explorer.classList.contains('hidden')) {
      const catName = document.getElementById('explorer-category-name')?.textContent;
      if (catName && window.renderCategorySubscriptions) window.renderCategorySubscriptions(catName);
  }
};

window.editSubscription = function (id, e) {
  if (e) e.stopPropagation();
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return;

  console.log('[Edit] Loading subscription:', sub);

  window.editingSubId = sub.id;
  const addModal = document.getElementById('add-modal');
  
  // Set Modal Title
  const titleEl = addModal.querySelector('h2');
  if (titleEl) {
    titleEl.innerHTML = `
      <span style="font-size: 1.1rem; font-weight: 300; letter-spacing: -0.02em; font-family: 'Inter', sans-serif;">EDIT</span>
      <span style="font-size: 1.1rem; font-weight: 300; letter-spacing: -0.02em; font-family: 'Inter', sans-serif;">SUBSCRIPTION</span>
    `;
  }

  // Basic Fields
  document.getElementById('sub-name').value = sub.name || '';
  document.getElementById('sub-price').value = sub.price || '0';
  document.getElementById('sub-date').value = sub.date || '';
  document.getElementById('sub-domain').value = sub.domain || '';
  document.getElementById('sub-notes').value = sub.notes || '';
  
  // Currency
  const currency = sub.currency || 'USD';
  const symbol = sub.symbol || '$';
  document.getElementById('sub-currency').value = currency;
  document.getElementById('sub-currency-symbol').value = symbol;
  document.getElementById('currency-symbol').textContent = symbol;
  document.getElementById('currency-code').textContent = currency;

  // Platform icon
  if (window.updatePlatformIcon) window.updatePlatformIcon(sub.domain);

  // Frequency logic
  document.getElementById('sub-type').value = sub.type || 'monthly';
  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === sub.type);
  });

  const monthlySec = document.getElementById('monthly-options-section');
  const trialSec = document.getElementById('trial-duration-section');
  if (monthlySec) monthlySec.classList.add('hidden');
  if (trialSec) trialSec.classList.add('hidden');

  if (sub.type === 'monthly' && monthlySec) {
    monthlySec.classList.remove('hidden');
    document.getElementById('sub-recurring-val').value = sub.recurring || '';
    document.querySelectorAll('.recur-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === sub.recurring);
    });
  } else if (sub.type === 'trial' && trialSec) {
    trialSec.classList.remove('hidden');
    document.getElementById('trial-days-val').value = sub.trialDays || '';
    document.getElementById('trial-months-val').value = sub.trialMonths || '';
    const trialLabel = document.getElementById('trial-days-selected');
    if (trialLabel) {
        if (sub.trialDays) trialLabel.innerText = `${sub.trialDays} Days`;
        else if (sub.trialMonths) trialLabel.innerText = `${sub.trialMonths} Month${sub.trialMonths > 1 ? 's' : ''}`;
        else trialLabel.innerText = 'Duration';
    }
  }

  // --- PROTECTED CATEGORY RECOVERY ---
  try {
    const allCats = (window.getCategories && typeof window.getCategories === 'function') ? window.getCategories() : [];
    let subCatName = sub.category || 'Not set';
    
    // Self-Healing: If category no longer exists, reset to Not set
    const found = allCats.find(c => c.name === subCatName);
    if (!found && subCatName !== 'Not set') {
        console.log(`[Edit] Healing ghost category: ${subCatName} -> Not set`);
        subCatName = 'Not set';
        sub.category = 'Not set';
        if (window.saveToSupabase) window.saveToSupabase(sub);
    }

    const catInput = document.getElementById('sub-category');
    const catText = document.getElementById('form-category-selected-text');
    const catIcon = document.getElementById('form-selected-category-icon');

    if (catInput) catInput.value = subCatName;
    if (catText) catText.textContent = subCatName;
    if (catIcon) catIcon.textContent = found ? (found.icon || '📁') : '👤';
  } catch (catErr) {
    console.warn('[Edit] Category recovery failed:', catErr);
  }

  // --- PROTECTED NEXUS CARD RECOVERY ---
  try {
    const cardId = sub.nexus_card_id;
    const cardIdInput = document.getElementById('selected-card-id');
    const cardText = document.getElementById('card-select-text');
    const cardIcon = document.getElementById('selected-card-status-icon');

    if (cardId && cardId !== 'null') {
      if (cardIdInput) cardIdInput.value = cardId;
      const getCards = window.getStoredCards || (window.getStoredCardsFromCache);
      if (getCards) {
          Promise.resolve(getCards()).then(cards => {
              const card = cards.find(c => c.id === cardId);
              if (card && cardText) {
                  const isPhys = ['visa','mastercard','amex','discover','jcb','debit','credit'].includes(card.type);
                  cardText.textContent = `Nexus: ${isPhys ? '•••• ' + card.last4 : card.name || card.type}`;
                  if (cardIcon) {
                      const logoMap = { 'visa': 'https://cdn.simpleicons.org/visa/white', 'mastercard': 'https://cdn.simpleicons.org/mastercard/white', 'amex': 'https://cdn.simpleicons.org/americanexpress/white', 'discover': 'https://cdn.simpleicons.org/discover/white', 'jcb': 'https://cdn.simpleicons.org/jcb/white', 'paypal': 'https://cdn.simpleicons.org/paypal/white', 'applepay': 'https://cdn.simpleicons.org/applepay/white', 'googlepay': 'https://cdn.simpleicons.org/googlepay/white' };
                      cardIcon.innerHTML = `<img src="${logoMap[card.type] || '/sublify-logo.png'}" style="width: 100%; height: 100%; object-fit: contain;">`;
                  }
              }
          });
      }
    } else {
      if (cardIdInput) cardIdInput.value = '';
      if (cardText) cardText.textContent = 'Associate Nexus Card';
      if (cardIcon) cardIcon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.5;"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>';
    }
  } catch (cardErr) {
    console.warn('[Edit] Nexus recovery failed:', cardErr);
  }

  if (window.updateNotesCounter) window.updateNotesCounter();
  addModal.classList.remove('hidden');
  if (window.dayDetailModal) window.dayDetailModal.classList.add('hidden');
};

window.stopSubscription = function (id, e) {
  if (e) e.stopPropagation();
  HapticsService.medium();
  const sub = subscriptions.find(s => s.id === id);
  if (sub) {
    sub.stopped = !sub.stopped; // Toggle stopped state

    if (window.addNotification) {
      window.addNotification({
        title: sub.stopped ? "Subscription Stopped" : "Subscription Resumed",
        text: `You have ${sub.stopped ? 'paused' : 'restored'} payments for ${sub.name}.`,
        type: sub.stopped ? "warning" : "success",
        domain: sub.domain
      });
    }

    // Background sync (Optimistic)
    saveToSupabase(sub);

    // 1. Smoothly slide back to center for a premium feel
    const wrapper = document.getElementById(`sw-wrapper-${id}`);
    if (wrapper) {
      const item = wrapper.querySelector('.detail-item');
      item.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.transform = 'translateX(0)';
      // Hide buttons as it closes
      const stopBtn = wrapper.querySelector('.stop');
      if (stopBtn) stopBtn.style.opacity = '0';
    }

    // 2. Refresh everything after animation completes
    setTimeout(() => {
      if (window.refreshUniversalUI) window.refreshUniversalUI(id);
    }, 300);

    // 3. Trigger sync in background
    if (window.saveToSupabase) window.saveToSupabase(sub);
  }
};


window.togglePaidStatus = async function (id, e, forceStatus = null) {
  if (e && e.stopPropagation) e.stopPropagation();
  HapticsService.success();
  if (!userProfile) return;
  const sub = subscriptions.find(s => s.id === id);
  if (sub) {
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    
    // Update local settings history
    if (!userProfile.settings) userProfile.settings = {};
    if (!userProfile.settings.paid_history) userProfile.settings.paid_history = {};
    if (!userProfile.settings.paid_history[id]) userProfile.settings.paid_history[id] = [];
    
    const history = userProfile.settings.paid_history[id];
    let newState = false;
    
    // For trials and yearly plans, we toggle the entire history
    const isMultiMonthTrial = sub.type === 'trial' && parseInt(sub.trialMonths) > 0;
    if (sub.type === 'yearly' || isMultiMonthTrial) {
      if (forceStatus !== null) {
        newState = forceStatus;
        userProfile.settings.paid_history[id] = newState ? [monthKey] : [];
      } else {
        if (history.length > 0) {
          // Was paid, now unpaid globally
          userProfile.settings.paid_history[id] = [];
          newState = false;
        } else {
          // Was unpaid, now paid globally (just push current month as marker)
          userProfile.settings.paid_history[id] = [monthKey];
          newState = true;
        }
      }
    } else {
      // Normal monthly toggle
      const index = history.indexOf(monthKey);
      if (forceStatus !== null) {
        newState = forceStatus;
        if (newState && index === -1) history.push(monthKey);
        else if (!newState && index > -1) history.splice(index, 1);
      } else {
        if (index > -1) {
          history.splice(index, 1);
          newState = false;
        } else {
          history.push(monthKey);
          newState = true;
        }
      }
    }
    
    // Fallback sync for non-recurring
    if (sub.recurring !== 'recurring') {
      sub.paid = newState;
    }

    if (window.addNotification) {
      window.addNotification({
        title: newState ? "Payment Confirmed" : "Payment Unsettled",
        text: newState
          ? `You marked ${sub.name} as paid for ${currentDate.toLocaleString('default', { month: 'long' })}. Good job!`
          : `You unmarked ${sub.name} as paid for ${currentDate.toLocaleString('default', { month: 'long' })}.`,
        type: newState ? "success" : "info",
        domain: sub.domain
      });
    }

    // 1. Smoothly slide back to center for a premium feel
    const wrapper = document.getElementById(`sw-wrapper-${id}`);
    if (wrapper) {
      const item = wrapper.querySelector('.detail-item');
      item.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.transform = 'translateX(0)';
      // Hide buttons as it closes
      const paidBtn = wrapper.querySelector('.paid');
      const freqBtn = wrapper.querySelector('.freq');
      if (paidBtn) paidBtn.style.opacity = '0';
      if (freqBtn) freqBtn.style.opacity = '0';
    }

    // 2. Refresh everything after animation
    setTimeout(() => {
      if (window.refreshUniversalUI) window.refreshUniversalUI(id);
    }, 300);
    // --- 2. BACKGROUND PERSISTENCE ---
    if (window.saveProfileToSupabase) {
      window.saveProfileToSupabase();
    } else {
      supabase.from('profiles').update({ settings: userProfile.settings }).eq('id', currentUser.id);
    }

    if (sub.recurring !== 'recurring') {
      saveToSupabase(sub);
    }
  }
};


function attachSwipeEvents() {
  const items = document.querySelectorAll('.detail-item');
  items.forEach(item => {
    // Prevent double-attaching listeners which causes massive lag
    if (item.getAttribute('data-swipe-attached')) return;
    item.setAttribute('data-swipe-attached', 'true');

    let startX = 0;

    let currentX = 0;
    let isDragging = false;
    let hasStartedSwipe = false;
    const threshold = 15;
    const maxTranslateX = 120;

    const onStart = (e) => {
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      isDragging = true;
      hasStartedSwipe = false;
      item.style.transition = 'none';
      
      // Elevate the item slightly for a "picked up" feel
      item.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
      item.style.zIndex = '10';

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const walk = (currentX - startX);

      if (!hasStartedSwipe) {
        if (Math.abs(walk) > threshold) {
          hasStartedSwipe = true;
          HapticsService.selection();
          item.style.transform = `scale(1.02)`; // Subtle scale up when swipe starts
        } else {
          return;
        }
      }

      const wrapper = item.parentElement;
      const del = wrapper.querySelector('.delete');
      const stp = wrapper.querySelector('.stop');
      const frq = wrapper.querySelector('.freq');
      const paidBtn = wrapper.querySelector('.paid');

      // MAGNETIC ELASTICITY: If we go past the snap point, we add resistance
      const hardLimit = 110;
      let translate = walk > 0 ? walk - threshold : walk + threshold;
      
      if (Math.abs(translate) > hardLimit) {
        const overflow = Math.abs(translate) - hardLimit;
        translate = (translate > 0 ? 1 : -1) * (hardLimit + (overflow * 0.3)); // 70% damping
      }

      // Action Opacity mapping
      if (translate > 0) {
        if (del) del.style.opacity = Math.min(translate / 60, 1);
        if (stp) stp.style.opacity = Math.min(translate / 60, 1);
        if (frq) frq.style.opacity = '0';
      } else {
        if (frq) frq.style.opacity = Math.min(-translate / 60, 1);
        if (paidBtn) paidBtn.style.opacity = Math.min(-translate / 60, 1);
        if (del) del.style.opacity = '0';
        if (stp) stp.style.opacity = '0';
      }

      item.style.transform = `translateX(${translate}px) scale(1.02)`;
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      // Reset elevation
      item.style.boxShadow = 'none';
      item.style.zIndex = '2';

      if (!hasStartedSwipe) {
        item.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
        item.style.transform = 'translateX(0) scale(1)';
        return;
      }

      const walk = currentX - startX;
      // MAGNETIC SPRING SNAP: Fast and bouncy
      item.style.transition = 'transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      const wrapper = item.parentElement;

      if (walk > 50) {
        item.style.transform = `translateX(${maxTranslateX}px) scale(1)`;
        HapticsService.impact('light');
      } else if (walk < -50) {
        item.style.transform = `translateX(${-maxTranslateX}px) scale(1)`;
        HapticsService.impact('light');
      } else {
        item.style.transform = `translateX(0) scale(1)`;
        const actions = wrapper.querySelectorAll('.swipe-action');
        actions.forEach(a => a.style.opacity = '0');
      }
    };

    item.addEventListener('touchstart', onStart, { passive: true });
    item.addEventListener('mousedown', onStart);
  });
}

async function updateStats() {
  // Main aggregate footer should only show ACTIVE monthly commitment relevant to THE VIEWED month
  const displaySubs = getDisplaySubscriptions();
  const activeSubs = displaySubs.filter(s => !s.stopped && isSubRelevantToMonth(s, currentDate));
  const settings = userProfile?.settings || {};
  let useAutoCurrency = settings.autoCurrency !== false;
  let targetCurrency = settings.currency || 'USD';

  // Override for USD Total mode
  if (settings.usdTotal) {
    useAutoCurrency = true;
    targetCurrency = 'USD';
  }

  let monthlyTotal = 0;
  let actuallyActiveOnes = [];
  let displayRates = null; // For UI display
  let mathRates = null;    // For background math

  if (useAutoCurrency) {
    displayRates = await fetchExchangeRates(targetCurrency);
    mathRates = displayRates;
  } else {
    // Check for mixed currencies across all subscriptions to ensure consistency
    const uniqueCurrencies = new Set(displaySubs.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      // Background math correction
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  activeSubs.forEach(s => {
    let price = parseFloat(s.price) || 0; // Show full price impact, not average commitment

    // Background math uses mathRates
    if (mathRates) {
      price = getConvertedPrice(price, s.currency || 'USD', targetCurrency, mathRates);
    }

    let skipPrice = false;
    const { start: startDateObj, end: endDateObj } = getSubDates(s);
    const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
    // 1. Exclude carry-overs (started in past, ends now or future, not yearly or multi-month trial)
    if (startDateObj < viewStart && endDateObj && s.type !== 'yearly' && !isMultiMonthTrial) skipPrice = true;

    // 2. Yearly plans only count in their renewal month
    if (s.type === 'yearly') {
      if (currentDate.getMonth() !== startDateObj.getMonth()) skipPrice = true;
    }

    // 3. Multi-month trials never count in grand total
    if (isMultiMonthTrial) {
      skipPrice = true;
    }

    if (!skipPrice) {
      monthlyTotal += price;
      actuallyActiveOnes.push(s);
    }
  });

  const relevantSubs = displaySubs.filter(s => isSubRelevantToMonth(s, currentDate));
  const activeCount = actuallyActiveOnes.length;

  subCountEl.innerText = relevantSubs.length;
  newCountEl.innerText = relevantSubs.filter(s => !s.stopped).length;

  // Sync label for clarity
  const footerLabelEl = document.querySelector('.total-label');
  if (footerLabelEl) footerLabelEl.innerText = "GRAND TOTAL:";

  // IMPORTANT: Choose symbol based on whether conversion actually happened
  let finalSymbol = '$';
  if (mathRates) {
    const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
    finalSymbol = targetCurrObj.symbol || '$';
  } else if (activeSubs.length > 0) {
    finalSymbol = activeSubs[0].symbol || '$';
  }

  let totalStr = monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const digitOnly = totalStr.replace(/[^0-9]/g, '');
  if (digitOnly.length > 10) {
      totalStr = digitOnly.substring(0, 9) + '+';
  }
  totalAmountEl.innerText = `${finalSymbol}${totalStr}`;

  // Store globally for List View Sync
  window.lastReport = {
    total: monthlyTotal,
    activeSubs: actuallyActiveOnes,
    symbol: finalSymbol,
    currency: targetCurrency,
    rates: displayRates || mathRates
  };

  // Re-render list view if it's active
  if (typeof window.renderListView === 'function') {
    window.renderListView();
  }
}

window.refreshUniversalUI = async function (targetSubId = null) {
  // Part 4: Debounce the heavy full-app re-render
  debounceRender(async () => {
    console.log('[UI] Universal Refresh firing (debounced)...');
    renderCalendar();
    await updateStats(); // Ensures totals and rates are ready

    const isStatsOpen = !document.getElementById('stats-modal').classList.contains('hidden');
    const explorer = document.getElementById('category-explorer');
    const isExplorerOpen = explorer && !explorer.classList.contains('hidden');
    const isDayDetailOpen = !document.getElementById('day-detail-modal')?.classList.contains('hidden');
    const nexusDetail = document.getElementById('nexus-card-detail');
    const isNexusDetailOpen = nexusDetail && !nexusDetail.classList.contains('hidden');

    if (isStatsOpen && window.showMonthlyBreakdown) {
      window.showMonthlyBreakdown(window.currentStatsFilter || 'all');
    }

    if (isExplorerOpen) {
      const catName = document.getElementById('explorer-category-name')?.textContent;
      if (catName && window.renderCategorySubscriptions) {
        await window.renderCategorySubscriptions(catName);
      }
    }

    if (isNexusDetailOpen && window.renderLinkedSubscriptions) {
      window.renderLinkedSubscriptions(window._currentNexusCardId);
    }

    if (isDayDetailOpen && targetSubId && window.showDayDetails) {
      const sub = (window.subscriptions || []).find(s => s.id === targetSubId);
      if (sub) {
        const daySubs = (window.subscriptions || []).filter(s => s.date === sub.date);
        window.showDayDetails(sub.date, daySubs);
      }
    }
  }, 300);
};

// --- Event Listeners ---

document.getElementById('prev-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderHeader();
  renderCalendar();
  updateStats();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderHeader();
  renderCalendar();
  updateStats();
});

document.getElementById('today-btn').addEventListener('click', () => {
  currentDate = new Date();
  renderHeader();
  renderCalendar();
  updateStats();
});

document.getElementById('add-sub-btn').addEventListener('click', () => {
  // Directly open the All Subscriptions catalog instead of the empty add modal
  const openCatalogBtn = document.getElementById('open-all-subs-btn');
  if (openCatalogBtn) {
    openCatalogBtn.click();
  }
});

document.getElementById('close-modal').addEventListener('click', () => {
  addModal.classList.add('hidden');
  // Reset form when going back/closing to ensure a clean state next time
  setTimeout(() => {
    subForm.reset();
    if (window.setFormDefaultCurrency) window.setFormDefaultCurrency();
    window.editingSubId = null;
    if (window.updatePlatformIcon) window.updatePlatformIcon(null);
    
    // Reset Nexus card selector
    const cardSelectText = document.getElementById('card-select-text');
    const cardSelectId = document.getElementById('selected-card-id');
    const cardSelectIcon = document.getElementById('selected-card-status-icon');
    if (cardSelectText) cardSelectText.textContent = 'Select Nexus Card';
    if (cardSelectId) cardSelectId.value = '';
    if (cardSelectIcon) {
        cardSelectIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>`;
    }
  }, 300);
});

// Nexus Card Dropdown Toggle
document.getElementById('card-select-trigger').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('card-select-dropdown');
    dropdown.classList.toggle('hidden');
    if (!dropdown.classList.contains('hidden')) {
        populatePaymentCardsDropdown();
    }
});


document.getElementById('close-detail').addEventListener('click', () => {
  dayDetailModal.classList.add('hidden');
});

// Frequency toggle buttons
document.querySelectorAll('.freq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.value;
    document.getElementById('sub-type').value = type;

    // Toggle Sections Based on Type
    const trialSection = document.getElementById('trial-duration-section');
    const monthlySection = document.getElementById('monthly-options-section');

    if (type === 'trial') {
      trialSection.classList.remove('hidden');
      monthlySection.classList.add('hidden');
    } else if (type === 'monthly') {
      monthlySection.classList.remove('hidden');
      trialSection.classList.add('hidden');
    } else {
      trialSection.classList.add('hidden');
      monthlySection.classList.add('hidden');
      document.getElementById('trial-error').classList.add('hidden');
      document.getElementById('monthly-error').classList.add('hidden');
    }
  });
});

// --- Category Picker for Form ---
function initFormCategoryPicker() {
    const trigger = document.getElementById('form-category-trigger');
    const dropdown = document.getElementById('form-category-dropdown');
    const list = document.getElementById('form-category-list');
    const hiddenInput = document.getElementById('sub-category');
    const selectedIcon = document.getElementById('form-selected-category-icon');
    const selectedText = document.getElementById('form-category-selected-text');

    if (!trigger || !dropdown || !list) return;

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
        if (!dropdown.classList.contains('hidden')) {
            renderFormCategoryList();
        }
    });

    window.selectFormCategory = function(name, icon) {
        hiddenInput.value = name;
        selectedIcon.textContent = icon;
        selectedText.textContent = name;
        dropdown.classList.add('hidden');
    };

    function renderFormCategoryList() {
        const categories = window.getCategories ? window.getCategories() : [];
        if (categories.length === 0) return;

        list.innerHTML = categories.map(cat => `
            <li onclick="window.selectFormCategory('${cat.name}', '${cat.icon || '📁'}')" style="padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;">
                <span style="font-size: 1.1rem;">${cat.icon || '📁'}</span>
                <span style="font-size: 0.85rem; font-weight: 500;">${cat.name}</span>
            </li>
        `).join('');
    }

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}

// Call it
initFormCategoryPicker();

// Monthly Recurring Logic
document.querySelectorAll('.recur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.recur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('sub-recurring-val').value = btn.dataset.value;
    document.getElementById('monthly-error').classList.add('hidden');
  });
});

// Trial Combined Duration Dropdown Logic
document.getElementById('trial-days-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('trial-days-dropdown').classList.toggle('hidden');
});

document.getElementById('trial-days-list').querySelectorAll('li').forEach(li => {
  li.addEventListener('click', () => {
    const val = li.dataset.value;
    const type = li.dataset.type; // 'days' or 'months'

    if (type === 'days') {
      document.getElementById('trial-days-val').value = val;
      document.getElementById('trial-months-val').value = '';
    } else {
      document.getElementById('trial-months-val').value = val;
      document.getElementById('trial-days-val').value = '';
    }

    document.getElementById('trial-days-selected').innerText = li.innerText;
    document.getElementById('trial-days-dropdown').classList.add('hidden');
    document.getElementById('trial-error').classList.add('hidden');
  });
});

// Free Trial Toggle Button
const freeTrialBtn = document.getElementById('free-trial-btn');
window._isFreeTrial = false;

freeTrialBtn.addEventListener('click', () => {
  window._isFreeTrial = !window._isFreeTrial;

  if (window._isFreeTrial) {
    freeTrialBtn.style.background = '#fff';
    freeTrialBtn.style.color = '#1a1a1a';
    freeTrialBtn.style.borderColor = '#fff';
    freeTrialBtn.style.boxShadow = '0 0 14px rgba(255,255,255,0.15)';
    document.getElementById('sub-price').value = '0';
  } else {
    freeTrialBtn.style.background = '';
    freeTrialBtn.style.color = '';
    freeTrialBtn.style.borderColor = '';
    freeTrialBtn.style.boxShadow = '';
  }
});

// --- Notes Character Counter Logic ---
const subNotesInput = document.getElementById('sub-notes');
const notesProgressRing = document.getElementById('notes-progress-ring');
const ringCircumference = 2 * Math.PI * 8; // r=8

window.updateNotesCounter = function() {
  const length = subNotesInput.value.length;
  const maxLength = 80;
  
  // Update ring
  const offset = ringCircumference - (length / maxLength) * ringCircumference;
  notesProgressRing.style.strokeDashoffset = offset;
  
  // Update color based on length
  if (length >= maxLength) {
    notesProgressRing.style.stroke = 'var(--accent-red)';
  } else if (length >= maxLength * 0.8) {
    notesProgressRing.style.stroke = 'var(--accent-orange)';
  } else {
    notesProgressRing.style.stroke = 'var(--accent-green)';
  }
};

subNotesInput.addEventListener('input', updateNotesCounter);

subForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const type = document.getElementById('sub-type').value;

  // Validation for Trial
  if (type === 'trial') {
    const days = document.getElementById('trial-days-val').value;
    const months = document.getElementById('trial-months-val').value;
    if (!days && !months) {
      document.getElementById('trial-error').classList.remove('hidden');
      return;
    }
  }

  // Validation for Monthly
  if (type === 'monthly') {
    const recurring = document.getElementById('sub-recurring-val').value;
    if (!recurring) {
      document.getElementById('monthly-error').classList.remove('hidden');
      return;
    }
  }

  let subObj;
  const subName = document.getElementById('sub-name').value;
  const subPrice = parseFloat(document.getElementById('sub-price').value);
  const subDate = parseInt(document.getElementById('sub-date').value);
  const subDomain = document.getElementById('sub-domain').value;
  const subCurrency = document.getElementById('sub-currency').value;
  const subSymbol = document.getElementById('sub-currency-symbol').value;
  const trialDays = type === 'trial' ? document.getElementById('trial-days-val').value : null;
  const trialMonths = type === 'trial' ? document.getElementById('trial-months-val').value : null;
  const recurring = type === 'monthly' ? document.getElementById('sub-recurring-val').value : null;
  const subCategory = document.getElementById('sub-category').value || 'Not set';
  const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), subDate).toISOString();

  const subNotes = document.getElementById('sub-notes').value.trim();

  if (window.editingSubId) {
    subObj = subscriptions.find(s => s.id === window.editingSubId);
    if (subObj) {
      subObj.name = subName;
      subObj.price = subPrice;
      subObj.date = subDate;
      subObj.type = type;
      subObj.domain = subDomain;
      subObj.currency = subCurrency;
      subObj.symbol = subSymbol;
      subObj.trialDays = trialDays;
      subObj.trialMonths = trialMonths;
      subObj.recurring = recurring;
      subObj.startDate = startDate;
      subObj.notes = subNotes;
      subObj.category = subCategory;
      subObj.nexus_card_id = document.getElementById('selected-card-id').value || null;
      // Keep existing properties like color, stopped, paid

    }
  }

  if (!subObj) {
    subObj = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      name: subName,
      price: subPrice,
      date: subDate,
      type: type,
      domain: subDomain,
      currency: subCurrency,
      symbol: subSymbol,
      color: type === 'trial' ? '--accent-red' : (type === 'one-time' ? '--accent-purple' : '--accent-blue'),
      trialDays: trialDays,
      trialMonths: trialMonths,
      recurring: recurring,
      startDate: startDate,
      notes: subNotes,
      category: subCategory,
      nexus_card_id: document.getElementById('selected-card-id').value || null,
      paid: false

    };
    subscriptions.push(subObj);
  }

  const isEdit = !!window.editingSubId;

  // Notify user
  if (window.addNotification) {
    window.addNotification({
      title: isEdit ? "Subscription Updated" : "Subscription Added",
      text: `${subObj.name} has been ${isEdit ? 'updated' : 'added to your calendar'}.`,
      type: "success",
      domain: subObj.domain
    });
  }

  // Update UI Instantly
  renderCalendar();
  updateStats();

  // Refresh Category Explorer if open
  const explorer = document.getElementById('category-explorer');
  if (explorer && !explorer.classList.contains('hidden')) {
      const catName = document.getElementById('explorer-category-name')?.textContent;
      if (catName && window.renderCategorySubscriptions) window.renderCategorySubscriptions(catName);
  }

  // Refresh Nexus Detail if open
  const nexusDetail = document.getElementById('nexus-card-detail');
  if (nexusDetail && !nexusDetail.classList.contains('hidden') && window.renderLinkedSubscriptions) {
      window.renderLinkedSubscriptions(window._currentNexusCardId);
  }
  addModal.classList.add('hidden');
  document.getElementById('trial-duration-section').classList.add('hidden');
  document.getElementById('monthly-options-section').classList.add('hidden');
  subForm.reset(); // Reset form after success
  if (window.setFormDefaultCurrency) window.setFormDefaultCurrency();
  document.getElementById('trial-days-val').value = '';
  document.getElementById('trial-months-val').value = '';
  document.getElementById('trial-days-selected').innerText = 'Duration';
  // Reset Free Trial button
  window._isFreeTrial = false;
  const _freeBtn = document.getElementById('free-trial-btn');
  if (_freeBtn) {
    _freeBtn.style.background = '';
    _freeBtn.style.borderColor = '';
    _freeBtn.style.color = '';
    _freeBtn.style.boxShadow = '';
  }
  document.getElementById('sub-recurring-val').value = '';
  document.querySelectorAll('.recur-btn').forEach(b => b.classList.remove('active'));


  // Background sync and ID replacement
  saveToSupabase(subObj).then(savedSub => {
    if (!isEdit && savedSub && savedSub.id) {
      // Find the temporary sub we just pushed and update its ID to the real DB ID
      const index = subscriptions.findIndex(s => s.id === subObj.id);
      if (index !== -1) {
        subscriptions[index].id = savedSub.id;
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      }
    }
  });

  // Reset form and currency
  window.editingSubId = null; // Important: Clear edit mode
  addModal.querySelector('h2').innerHTML = `
    <span style="font-size: 0.62rem; letter-spacing: 0.25em; opacity: 0.5; font-weight: 800; font-family: 'Roboto Mono', monospace;">ADD</span>
    <span style="font-size: 1.1rem; font-weight: 300; letter-spacing: -0.02em; font-family: 'Inter', sans-serif;">SUBSCRIPTION</span>
  `;
  document.getElementById('sub-notes').value = '';
  updateNotesCounter();
  selectCurrency('USD', '$');
  updatePlatformIcon(null);
  document.getElementById('sub-domain').value = '';
});

// --- Monthly Breakdown Modal ---
const totalAmountBtn = document.getElementById('total-amount');
const monthlyTotalContainer = document.querySelector('.grand-total-container');

const openStats = () => {
  console.log("Opening Monthly Breakdown...");
  currentStatsFilter = 'all'; // Default to show all when opening
  showMonthlyBreakdown('all');
};

if (monthlyTotalContainer) monthlyTotalContainer.addEventListener('click', openStats);
if (totalAmountBtn) totalAmountBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  openStats();
});

document.getElementById('close-stats').addEventListener('click', () => {
  document.getElementById('stats-modal').classList.add('hidden');
});

// --- Profile Page Integration ---
const profileBtn = document.querySelector('.profile-btn');

if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    updateProfilePageData();
    if (window.toggleProfilePage) window.toggleProfilePage(true);
  });
}

const updateProfilePageData = async () => {
  const statsContainer = document.querySelector('.profile-stats');
  if (!statsContainer) return;

  const email = currentUser?.email || 'User';
  const name = userProfile?.name || email.split('@')[0];

  document.querySelector('.profile-info h4').innerText = name.toUpperCase();
  document.querySelector('.profile-info p').innerText = email;

  // 1. Get Settings
  let settings = userProfile?.settings || {};
  let useAutoCurrency = settings.autoCurrency !== false;
  let targetCurrency = settings.currency || 'USD';

  if (settings.usdTotal) {
    useAutoCurrency = true;
    targetCurrency = 'USD';
  }

  // 2. Multi-Currency Math Logic (Matches updateStats)
  let mathRates = null;
  if (useAutoCurrency) {
    mathRates = await fetchExchangeRates(targetCurrency);
  } else {
    const uniqueCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  // 3. Calculate Stats
  const activeSubs = subscriptions.filter(s => !s.stopped && isSubRelevantToMonth(s, currentDate));
  let totalMonthlyImpact = 0;
  let actuallyActiveOnes = [];

  activeSubs.forEach(s => {
    let price = s.price;
    if (mathRates) {
      price = getConvertedPrice(price, s.currency || 'USD', targetCurrency, mathRates);
    }

    let skipPrice = false;
    const { start: startDateObj, end: endDateObj } = getSubDates(s);
    const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
    // 1. Exclude carry-overs (started in past, ends now or future, not yearly or multi-month trial)
    if (startDateObj < viewStart && endDateObj && s.type !== 'yearly' && !isMultiMonthTrial) skipPrice = true;

    // 2. Yearly plans only count in their renewal month
    if (s.type === 'yearly') {
      if (currentDate.getMonth() !== startDateObj.getMonth()) skipPrice = true;
    }

    // 3. Multi-month trials never count in grand total
    if (isMultiMonthTrial) {
      skipPrice = true;
    }

    if (!skipPrice) {
      totalMonthlyImpact += price;
      actuallyActiveOnes.push(s);
    }
  });

  const relevantCount = actuallyActiveOnes.length;

  // 4. Determine Symbol
  let finalSymbol = '$';
  if (mathRates) {
    const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
    finalSymbol = targetCurrObj.symbol || '$';
  } else if (actuallyActiveOnes.length > 0) {
    finalSymbol = actuallyActiveOnes[0].symbol || '$';
  }

  const currentMonthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

  // 5. Update UI
  statsContainer.innerHTML = `
     <div style="flex: 1; text-align: center;">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${relevantCount}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Active</span>
        <span style="font-size: 0.5rem; color: var(--text-dim); opacity: 0.6; display: block; margin-top: 2px;">${currentMonthName}</span>
     </div>
     <div style="flex: 1; text-align: center; border-left: 1px solid var(--border-color);">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${finalSymbol}${(parseFloat(totalMonthlyImpact) || 0).toFixed(2)}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Per Month</span>
        <span style="font-size: 0.5rem; color: var(--text-dim); opacity: 0.6; display: block; margin-top: 2px;">${currentMonthName}</span>
     </div>
  `;

  if (window.toggleProfilePage) window.toggleProfilePage(true);
};

// --- Auth Event Listeners ---
if (getStartedBtn) {
  getStartedBtn.addEventListener('click', () => {
    // Premium Haptic Feedback
    if (window.HapticsService) window.HapticsService.success();
    else HapticsService.success();
    
    // Hide the pipeline landing
    welcomeView.classList.add('hidden');
    // Hide the main bottom container background (it was transparent)
    document.querySelector('.landing-page').style.background = 'transparent';
    
    // Show the auth screen wrapper
    authScreen.classList.remove('hidden');
    
    // BUT hide the login part and show our new SURVEY page first
    const surveyView = document.getElementById('survey-view');
    const loginContainer = document.getElementById('login-container');
    if (surveyView) {
      surveyView.classList.remove('hidden');
      // Trigger the sequential word animation
      if (window.triggerSurveyAnimation) window.triggerSurveyAnimation();
    }
    if (loginContainer) loginContainer.classList.add('hidden');
  });
}

if (toggleAuth) {
  toggleAuth.addEventListener('click', () => {
    isSignUp = !isSignUp;
    document.querySelector('.view-title').innerText = isSignUp ? 'Create Account' : 'Welcome Back';
    authSubmitBtn.innerText = isSignUp ? 'Sign Up' : 'Log In';
    toggleAuth.innerText = isSignUp ? 'Login' : 'Sign Up';
    document.querySelector('.auth-toggle').firstChild.textContent = isSignUp ? 'Already have an account? ' : "Don't have an account? ";
  });
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('hidden');
  authSubmitBtn.disabled = true;
  authSubmitBtn.innerText = isSignUp ? 'Signing Up...' : 'Logging In...';

  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      // When a user already exists, Supabase returns a user object but with an empty identities array.
      if (result.data?.user?.identities && result.data.user.identities.length === 0) {
        throw new Error('An account with this email already exists! Please login.');
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) throw result.error;

    if (isSignUp && result.data.user && !result.data.session) {
      // Transition to OTP Screen
      if (typeof showOtpVerification === 'function') {
        showOtpVerification(email);
      } else {
        authError.innerText = "Check your email for the verification code!";
        authError.classList.remove('hidden');
      }
    }

  } catch (err) {
    console.error('Full Auth Error Object:', err);
    
    // --- Handle unconfirmed users gracefully ---
    if (err.message && (err.message.toLowerCase().includes('email not confirmed') || err.message.toLowerCase().includes('not confirmed'))) {
      try {
        await supabase.auth.resend({ type: 'signup', email });
        if (typeof showOtpVerification === 'function') {
          showOtpVerification(email);
          return; // Stop and wait for OTP verification
        }
      } catch (resendErr) {
        console.error('Failed to auto-resend OTP:', resendErr);
      }
    }

    // Bridge to premium onboarding UI if active
    if (window.showAuthErrorOnButton) {
      window.showAuthErrorOnButton(err.message || 'Login Failed');
    } else {
      authError.innerText = err.message || 'Network error — please check your connection';
      authError.classList.remove('hidden');
    }
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.innerText = isSignUp ? 'Sign Up' : 'Log In';
  }
});

window.showTrialPath = function (id, e) {
  if (e) e.stopPropagation();
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return;

  const btn = e.currentTarget;
  const btnText = btn.querySelector('.freq-btn-text');
  const originalText = btnText.innerText;

  const start = new Date(sub.startDate);
  let infoText = "";
  let end = null;

  if (sub.type === 'trial') {
    const days = parseInt(sub.trialDays) || 0;
    const months = parseInt(sub.trialMonths) || 0;
    end = new Date(start);
    if (days) end.setDate(end.getDate() + days);
    if (months) end.setMonth(end.getMonth() + months);
    infoText = `ENDS: ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (sub.type === 'one-time') {
    end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    infoText = `ENDS: ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else if (sub.type === 'monthly') {
    if (sub.recurring === 'recurring') {
      infoText = "RENEWS MONTHLY";
    } else {
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      infoText = `ENDS: ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  } else if (sub.type === 'yearly') {
    infoText = "RENEWS YEARLY";
    // FIX: Calculate end date for yearly animation
    end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
  }

  // Show info text on button
  btnText.innerText = infoText;
  btn.style.width = "80px"; // Expanded narrow width

  // Also show visual path if applicable
  if (sub.type === 'yearly' && end) {
    const originalDate = new Date(currentDate);
    dayDetailModal.classList.add('hidden');

    // Animation Logic for Yearly: Month per second
    let animMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const runFrame = () => {
      currentDate = new Date(animMonth);
      renderHeader();
      renderCalendar();

      // Highlight path in current view
      setTimeout(() => {
        document.querySelectorAll('.calendar-cell').forEach(cell => {
          const cellTime = parseInt(cell.dataset.time);
          const startTimeMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
          const targetTimeMs = endMidnight.getTime();

          if (cellTime >= startTimeMs && cellTime <= targetTimeMs) {
            cell.classList.add('yearly-path');
            setTimeout(() => cell.classList.remove('yearly-path'), 2000);
          }
        });
      }, 50);

      // Next step
      animMonth.setMonth(animMonth.getMonth() + 1);
      if (animMonth <= endMidnight) {
        setTimeout(runFrame, 1000);
      } else {
        // Return to present after a short wait
        setTimeout(() => {
          currentDate = originalDate;
          renderHeader();
          renderCalendar();
        }, 3000);
      }
    };

    runFrame();

  } else if ((sub.type === 'trial' || sub.type === 'monthly' || sub.type === 'one-time') && end) {
    // If end date is in a different month, switch to it!
    const endMonth = end.getMonth();
    const endYear = end.getFullYear();
    const currentViewMonth = currentDate.getMonth();
    const currentViewYear = currentDate.getFullYear();

    let switchExecuted = false;
    const originalDate = new Date(currentDate);

    // SMARTER LOGIC: Check if the end date is ALREADY visible in the current grid
    // (even if it's an "other-month" cell)
    const endTimeValue = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
    const isEndVisible = Array.from(document.querySelectorAll('.calendar-cell'))
      .some(cell => parseInt(cell.dataset.time) === endTimeValue);

    if (!isEndVisible && (endMonth !== currentViewMonth || endYear !== currentViewYear)) {
      currentDate = new Date(endYear, endMonth, 1);
      renderHeader();
      renderCalendar();
      switchExecuted = true;
    }

    // Keep it open for a moment before closing modal for path
    setTimeout(() => {
      dayDetailModal.classList.add('hidden');

      // Delay highlighting slightly more if we switched months to ensure DOM is ready
      setTimeout(() => {
        let endCell = null;

        document.querySelectorAll('.calendar-cell').forEach(cell => {
          const cellTime = parseInt(cell.dataset.time);
          const startTime = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
          const endTime = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();

          if (cellTime >= startTime && cellTime <= endTime) {
            const pathClass = sub.type === 'trial' ? 'trial-path' : (sub.type === 'one-time' ? 'one-time-path' : 'monthly-path');
            cell.classList.add(pathClass);

            // Track the last cell (end date cell)
            if (cellTime === endTime) endCell = cell;

            // Remove highlight after 7 seconds
            setTimeout(() => {
              cell.classList.remove(pathClass);

              // If we switched months, return to original month ONLY ONCE
              if (switchExecuted) {
                setTimeout(() => {
                  currentDate = originalDate;
                  renderHeader();
                  renderCalendar();
                }, 100);
                switchExecuted = false;
              }
            }, 7000);
          }
        });

        // Inject subscription icon+dot on the end cell
        if (endCell) {
          const logoUrl = window.getLogoUrl(getDomain(sub));

          const tempDots = document.createElement('div');
          tempDots.className = 'sub-dots-container';
          tempDots.setAttribute('data-temp-freq', 'true');

          const dot = document.createElement('div');
          dot.className = `sub-dot`;
          let colorVar;
          if (sub.type === 'monthly') colorVar = 'var(--accent-green)';
          else if (sub.type === 'trial') colorVar = 'var(--accent-red)';
          else if (sub.type === 'one-time') colorVar = 'var(--accent-purple)';
          else colorVar = 'var(--accent-blue)';
          dot.style.backgroundColor = colorVar;
          dot.style.color = colorVar;
          tempDots.appendChild(dot);

          const tempIcons = document.createElement('div');
          tempIcons.className = 'sub-icons-container';
          tempIcons.setAttribute('data-temp-freq', 'true');

          const icon = document.createElement('div');
          icon.className = 'sub-icon';
          const img = document.createElement('img');
          img.src = logoUrl;
          img.alt = sub.name;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.style.pointerEvents = 'none';
          img.onerror = () => {
            icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
          };
          icon.appendChild(img);

          // Cross sign overlaid directly on the icon
          const crossBadge = document.createElement('div');
          crossBadge.style.cssText = `
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 8px;
            font-size: 13px;
            font-weight: 900;
            color: rgba(239, 68, 68, 1);
            z-index: 10;
            text-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
          `;
          crossBadge.innerText = '✕';
          icon.style.position = 'relative';
          icon.appendChild(crossBadge);

          tempIcons.appendChild(icon);

          endCell.appendChild(tempDots);
          endCell.appendChild(tempIcons);

          // Remove after 7 seconds
          setTimeout(() => {
            tempDots.remove();
            tempIcons.remove();
          }, 7000);
        }

      }, switchExecuted ? 300 : 50);

    }, 1500);
  } else {
    // Revert text after 3 seconds for non-trials
    setTimeout(() => {
      btnText.innerText = originalText;
      btn.style.width = "50px";
    }, 3000);
  }
};

// Logout logic
document.getElementById('logout-btn').addEventListener('click', async () => {
  await supabase.auth.signOut();
  if (window.toggleProfilePage) window.toggleProfilePage(false);
});

// Delete Account logic - Step 1: Show Confirmation Modal
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmEmailInput = document.getElementById('delete-confirm-email');
const deleteEmailError = document.getElementById('delete-email-error');
const finalDeleteBtn = document.getElementById('final-delete-btn');
const closeDeleteConfirm = document.getElementById('close-delete-confirm');

document.getElementById('delete-account-btn').addEventListener('click', () => {
  // Reset modal state
  deleteConfirmEmailInput.value = '';
  deleteEmailError.classList.add('hidden');
  finalDeleteBtn.disabled = false;
  finalDeleteBtn.innerText = 'Delete My Account Forever';

  // Show modal
  deleteConfirmModal.classList.remove('hidden');
});

// Close confirmation modal
closeDeleteConfirm.addEventListener('click', () => {
  deleteConfirmModal.classList.add('hidden');
});

// Step 2: Final Verification and Deletion
finalDeleteBtn.addEventListener('click', async () => {
  const enteredEmail = deleteConfirmEmailInput.value.trim().toLowerCase();
  const userEmail = currentUser?.email?.toLowerCase();

  if (enteredEmail !== userEmail) {
    deleteEmailError.classList.remove('hidden');
    deleteConfirmEmailInput.focus();
    return;
  }

  deleteEmailError.classList.add('hidden');
  finalDeleteBtn.innerText = 'Deleting Account...';
  finalDeleteBtn.disabled = true;

  try {
    // 1. Manually clear out dependencies that might block the deletion
    // The 'notifications' table currently lacks a 'CASCADE' rule, so we must wipe it first.
    await supabase.from('notifications').delete().eq('user_id', currentUser.id);

    // 2. Call the database function to delete the user entirely
    const { error: deleteError } = await supabase.rpc('delete_user_permanently');
    if (deleteError) throw deleteError;

    // 2. Clear ALL local storage and cache
    localStorage.clear();

    // 3. Force reload to ensure a clean state
    window.location.reload();
  } catch (err) {
    console.error('[Auth] Delete account failed:', err.message);
    deleteEmailError.innerText = "Error: " + err.message;
    deleteEmailError.classList.remove('hidden');
    finalDeleteBtn.innerText = 'Try Again';
    finalDeleteBtn.disabled = false;
  }
});

// Helper to safely set localStorage
function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`[Storage] localStorage.setItem failed for "${key}": `, e.message);
  }
}

// Auth State Listener
// --- Splash Screen Helper ---
let splashHidden = false;
function hideSplash(force = false) {
  if (splashHidden) return;
  
  const now = Date.now();
  const diff = now - appStartTime;
  const minDuration = 1200; // 1.2s to see the full logo entrance
  
  // If user is NOT logged in or we need it gone "now", just hide it instantly
  if (force) {
    splashHidden = true;
    const splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.transition = 'none';
      splash.classList.add('hidden');
    }
    return;
  }

  if (diff < minDuration) {
    setTimeout(() => hideSplash(false), minDuration - diff);
    return;
  }

  splashHidden = true;
  const splash = document.getElementById('splash-screen');
  if (!splash) return;
  
  splash.classList.add('fade-out');
  setTimeout(() => splash.classList.add('hidden'), 820);
}

// === OFFLINE BOOT FAILSAFE ===
// If the device is connected to WiFi but has no actual internet, Supabase's internal 
// fetch request to refresh an expired token can hang indefinitely, locking the app.
// This kicks in after 3 seconds to unfreeze the UI and force load the cached offline state.
setTimeout(() => {
  if (!splashHidden) {
    console.warn('[Offline Failsafe] Supabase initialization hung. Forcing offline boot...');
    
    // Attempt to manually recover user session bypassing the hung provider
    const sessionCookie = localStorage.getItem('sb-ptueakygbjohifkscplk-auth-token'); 
    
    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed?.user) {
           currentUser = parsed.user;
           window.currentUser = parsed.user;
           
           const savedProf = localStorage.getItem(`profile_${currentUser.id}`);
           if (savedProf) {
             userProfile = JSON.parse(savedProf);
             if (userProfile?.settings?.theme) applyTheme(userProfile.settings.theme === 'dark');
             if (userProfile?.settings?.starred_dates) {
               localStorage.setItem('starred_dates', JSON.stringify(userProfile.settings.starred_dates));
             }
           }
           
           hideSplash();
           const loadingScreen = document.getElementById('auth-loading-screen');
           if (loadingScreen) loadingScreen.classList.add('hidden');
           
           const appCont = document.getElementById('app-container');
           if (appCont) appCont.classList.remove('hidden');
           if (typeof window.listViewActive === 'function' && window.listViewActive()) {
            if (typeof window.renderSkeletonListView === 'function') window.renderSkeletonListView();
          } else {
            renderSkeletonCalendar();
          }
           
           updateProfileUI();
           loadSubscriptions(true);
           return;
        }
      } catch (e) {
        console.warn('[Offline Failsafe] Could not parse local session:', e.message);
      }
    }
    
    // Force show login screen if no cached offline user data
    hideSplash();
    authScreen.classList.remove('hidden');
  }
}, 3000);


supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(`[Auth] Event: ${event}`);

  if (session) {
    currentUser = session.user;
    window.currentUser = session.user;
    console.log(`[Auth] Session active for: ${currentUser.email} `);

    // Check if we are in the middle of a password reset flow
    if (window.isRecoveringPassword) {
      console.log('[Auth] Holding session transition for password recovery...');
      
      // We still need to expose a way to start the app once recovery is done
      window.addEventListener('passwordResetComplete', () => {
         window.isRecoveringPassword = false;
         supabase.auth.getSession().then(({ data: { session: newSession } }) => {
            if (newSession) {
               console.log('[Auth] Password reset complete, launching app...');
               // We manually trigger the logic again by calling the handler
               // This is a bit recursive but since we cleared the flag it will proceed
               window.location.reload(); // Simplest way to ensure everything loads correctly
            }
         });
      }, { once: true });
      
      return; 
    }

    // 1. Show the transition screen IMMEDIATELY
    const loadingScreen = document.getElementById('auth-loading-screen');
    if (loadingScreen) loadingScreen.classList.remove('hidden');
    
    // Also hide the auth screen so it doesn't stay behind the loader
    authScreen.classList.add('hidden');

    // 2. Background task to load profile
    const loadProfile = async () => {
      let hasCache = false;
      
      // 1. INSTANT CACHE BOOT: Tear down the loading screens immediately if we have a cache
      const saved = localStorage.getItem(`profile_${currentUser.id}`);
      if (saved) {
        hasCache = true;
        console.log('[Offline-First] Booting instantly from cache...');
        userProfile = JSON.parse(saved);
        
        if (userProfile?.settings?.theme) applyTheme(userProfile.settings.theme === 'dark');
        if (userProfile?.settings?.starred_dates) {
          localStorage.setItem('starred_dates', JSON.stringify(userProfile.settings.starred_dates));
          renderCalendar();
        }
        updateStats();
        updateTime();
        updateProfileUI();
        
        // Remove Splash and Loading Screens instantly
        hideSplash();
        const loadingScreen = document.getElementById('auth-loading-screen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
        const appCont = document.getElementById('app-container');
        if (appCont) appCont.classList.remove('hidden');
        if (typeof window.listViewActive === 'function' && window.listViewActive()) {
            if (typeof window.renderSkeletonListView === 'function') window.renderSkeletonListView();
          } else {
            renderSkeletonCalendar();
          }
      }

      if (!navigator.onLine) {
        console.log('[Offline] Using cached profile.');
        if (!hasCache) {
          hideSplash();
          const loadingScreen = document.getElementById('auth-loading-screen');
          if (loadingScreen) loadingScreen.classList.add('hidden');
          const appCont = document.getElementById('app-container');
          if (appCont) appCont.classList.remove('hidden');
          if (typeof window.listViewActive === 'function' && window.listViewActive()) {
            if (typeof window.renderSkeletonListView === 'function') window.renderSkeletonListView();
          } else {
            renderSkeletonCalendar();
          }
        }
        loadSubscriptions(true);
        return;
      }

      // 2. SYNC IN BACKGROUND: Fetch from Supabase
      try {
        console.log('[Auth] Syncing profile from Supabase in background...');
        const profilePromise = supabase
          .from('profiles')
          .select('name, gender, dob, avatar_url, settings, onboarding_completed')
          .eq('id', currentUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 15000)
        );

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

        // --- CRITICAL GUARD: Only create a Profile record IF the user is confirmed ---
        const isConfirmed = !!currentUser.email_confirmed_at || !!currentUser.phone_confirmed_at;

        if (profile) {
          console.log('[Auth] Profile synced successfully.');
          userProfile = profile;
          safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));
        } else if (isConfirmed && error && (error.code === 'PGRST116' || error.code === '406')) {
          console.log('[Auth] New confirmed user detected — capturing registration data...');
          
          const signupName = document.getElementById('auth-name-input')?.value || 
                             document.getElementById('onboard-name')?.value || 
                             currentUser.user_metadata?.full_name || 
                             'New Creator';
                             
          const signupDob = document.getElementById('auth-dob-input')?.value || 
                            document.getElementById('onboard-dob')?.value || 
                            null;

          const signupGender = document.getElementById('auth-gender-input')?.value ||
                               document.querySelector('.gender-btn.selected')?.dataset?.value ||
                               'other';

          userProfile = {
            name: signupName,
            onboarding_completed: false,
            dob: signupDob || null, // Atomic null for Postgres
            gender: signupGender,
            settings: { theme: 'dark', notifications: true, paid_history: {} }
          };
          
          // Create the record immediately so the Guider has something to work with
          await supabase.from('profiles').upsert({ id: currentUser.id, ...userProfile });
          safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));
        } else {
          console.warn('[Auth] DB connection lag. Sync failed, relying on cache.');
        }

        // Apply theme/starred dates silently
        if (userProfile?.settings?.theme) applyTheme(userProfile.settings.theme === 'dark');
        updateStats();
        updateTime();

      } catch (err) {
        console.warn('[Auth] Background sync delayed:', err.message);
      } finally {
        updateProfileUI();

        const accountAgeMs = Date.now() - new Date(currentUser.created_at).getTime();
        const isFreshSignup = Math.abs(accountAgeMs) < 3 * 60 * 1000;
        
        // Priority check: Use NEW atomic database column
        const isAlreadyDone = userProfile?.onboarding_completed === true;

        if (isFreshSignup && !isAlreadyDone) {
          console.log('[Auth] Launching Guider tour...');
          hideSplash();
          const loadingScreen = document.getElementById('auth-loading-screen');
          if (loadingScreen) loadingScreen.classList.add('hidden');
          const appCont = document.getElementById('app-container');
          if (appCont) appCont.classList.add('hidden'); // Guarantee hidden for Guider
          
          if (window.showGuider) window.showGuider(); else showOnboarding();
        } else {
          hideSplash();
          const loadingScreen = document.getElementById('auth-loading-screen');
          if (loadingScreen) loadingScreen.classList.add('hidden');
          const appCont = document.getElementById('app-container');
          if (appCont) appCont.classList.remove('hidden');
          if (typeof window.listViewActive === 'function' && window.listViewActive()) {
            if (typeof window.renderSkeletonListView === 'function') window.renderSkeletonListView();
          } else {
            renderSkeletonCalendar();
          }
          
          // Load subscriptions (it has its own cache-first logic)
          loadSubscriptions(true);
        }
      }
    };

    loadProfile();

    // 3. Realtime listener for cross-tab sync
    console.log('[Auth] Subscribing to profile changes...');
    supabase
      .channel('public:profiles')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`
      }, payload => {
        if (payload.new) {
          console.log('[Realtime] Profile update received.');
          userProfile = payload.new;
          safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));
          updateProfileUI();

          const pName = document.querySelector('.profile-info h4');
          if (pName && userProfile?.name) pName.innerText = userProfile.name.toUpperCase();

          // Sync open gender dropdown
          if (userProfile.gender && genderSelectedSpan) {
            genderHiddenInput.value = userProfile.gender;
            genderSelectedSpan.innerText = userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1);
            genderList.querySelectorAll('li').forEach(li => {
              li.classList.toggle('selected', li.dataset.value === userProfile.gender);
            });
          }

          // Refresh UI with potentially new settings
          if (userProfile.settings) {
            applyTheme(userProfile.settings.theme === 'dark');

            // Sync Starred Dates in Realtime
            if (userProfile.settings.starred_dates) {
              localStorage.setItem('starred_dates', JSON.stringify(userProfile.settings.starred_dates));
              renderCalendar();
            }

            updateStats();
            updateTime();
          }
        }
      })
      .subscribe();

  } else {
    console.log('[Auth] No active session.');
    currentUser = null;
    window.currentUser = null;
    userProfile = null;
    hideSplash(true); // Don't show loading screen if user is not logged in!
    
    // Fix: Ensure main app UI is hidden when logging out
    const appCont = document.getElementById('app-container');
    if (appCont) appCont.classList.add('hidden');
    
    const loadingScreen = document.getElementById('auth-loading-screen');
    if (loadingScreen) loadingScreen.classList.add('hidden');

    authScreen.classList.remove('hidden');
    onboardingScreen.classList.add('hidden');
    welcomeScreen.classList.add('hidden');
    welcomeView.classList.remove('hidden');
    loginView.classList.add('hidden');
    const loginContainer = document.getElementById('login-container');
    if (loginContainer) loginContainer.classList.add('hidden');
    
    // reset external auth views
    resetEmailAuthViews();
    
    subscriptions = [];
    renderCalendar();
  }
});

// --- Onboarding Logic ---
function showOnboarding() {
  onboardingScreen.classList.remove('hidden');
  onboardingScreen.style.zIndex = '1100';
  // Reset steps
  document.getElementById('onboard-step-1').classList.remove('hidden');
  document.getElementById('onboard-step-2').classList.add('hidden');
  document.getElementById('onboard-step-3').classList.add('hidden');
  document.getElementById('dot-1').className = 'step-dot active';
  document.getElementById('dot-2').className = 'step-dot';
  document.getElementById('dot-3').className = 'step-dot';
  document.getElementById('onboard-finish').disabled = true;

  // Clear inputs
  document.getElementById('onboard-name').value = '';
  document.getElementById('onboard-dob').value = '';
  document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
}

function goToOnboardStep(step) {
  document.querySelectorAll('.onboard-step').forEach(s => s.classList.add('hidden'));
  document.getElementById(`onboard-step-${step}`).classList.remove('hidden');
  // Update dots
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById(`dot-${i}`);
    if (i < step) dot.className = 'step-dot done';
    else if (i === step) dot.className = 'step-dot active';
    else dot.className = 'step-dot';
  });
}

document.getElementById('onboard-next-1').addEventListener('click', () => {
  const name = document.getElementById('onboard-name').value.trim();
  if (!name) { document.getElementById('onboard-name').focus(); return; }
  goToOnboardStep(2);
});

document.getElementById('onboard-next-2').addEventListener('click', () => {
  const dob = document.getElementById('onboard-dob').value;
  if (!dob) { document.getElementById('onboard-dob').focus(); return; }
  goToOnboardStep(3);
});

document.querySelectorAll('.gender-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('onboard-finish').disabled = false;
  });
});

document.getElementById('onboard-finish').addEventListener('click', async () => {
  const name = document.getElementById('onboard-name').value.trim();
  const dob = document.getElementById('onboard-dob').value;
  const gender = document.querySelector('.gender-btn.selected')?.dataset.value;
  if (!name || !dob || !gender) return;

  const onboardBtn = document.getElementById('onboard-finish');
  onboardBtn.disabled = true;
  onboardBtn.innerText = 'Saving Profile...';

  userProfile = { name, dob, gender };

  try {
    // Save to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: currentUser.id, name, dob, gender });

    if (error) throw error;

    // Save to LocalStorage as fallback/cache
    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));

    onboardingScreen.classList.add('hidden');
    showWelcomeScreen();
  } catch (err) {
    console.error('Error saving profile:', err.message);
    alert('Error saving profile — please try again.');
  } finally {
    onboardBtn.disabled = false;
    onboardBtn.innerText = "Let's Go! 🎉";
  }
});

function showWelcomeScreen() {
  if (!userProfile) {
    loadSubscriptions(true);
    return;
  }

  const title = {
    male: `Welcome, Mr.${userProfile.name || 'User'} !`,
    female: `Welcome, Mrs.${userProfile.name || 'User'} !`,
    other: `Welcome, ${userProfile.name || 'User'} !`
  }[userProfile.gender] || `Welcome, ${userProfile.name || 'User'} !`;

  document.getElementById('welcome-greeting').innerText = title;

  // Re-trigger animations by replacing the loader bar
  const loaderContainer = document.querySelector('.welcome-loader');
  if (loaderContainer) {
    loaderContainer.innerHTML = '<div class="loader-bar"></div>';
  }

  welcomeScreen.classList.remove('hidden');
  welcomeScreen.style.zIndex = '1050';

  // Auto-advance to main app after 2.5s
  setTimeout(() => {
    welcomeScreen.classList.add('hidden');
    loadSubscriptions(true);
  }, 2600);
}

// --- Helper to check if a subscription is relevant to a specific month ---
window.isSubRelevantToMonth = function (sub, monthDate) {
  const { start, end } = getSubDates(sub);
  const viewStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const viewEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

  // 1. Fundamental Overlap Check
  if (start > viewEnd) return false;
  if (end && end < viewStart) return false;

  const isMultiMonthTrial = sub.type === 'trial' && parseInt(sub.trialMonths) > 0;
  // 2. Yearly or Multi-month trial: Always relevant once started (until end)
  if (sub.type === 'yearly') return true;
  if (isMultiMonthTrial) return true;

  if (end && end < viewStart) return false;

  // 3. User Rule: Subscriptions from previous months (trials/one-time)
  // ONLY show if they end in the current month.
  if (start < viewStart && end) {
    const endsThisMonth = end.getMonth() === monthDate.getMonth() && end.getFullYear() === monthDate.getFullYear();
    return endsThisMonth;
  }

  return true;
}

window.showMonthlyBreakdown = async function (filter = 'all') {
  currentStatsFilter = filter;
  const modal = document.getElementById('stats-modal');
  const summary = document.getElementById('stats-summary');
  const list = document.getElementById('stats-list');
  const statsTotalAmount = document.getElementById('stats-total-amount');

  if (!modal || !summary || !list || !statsTotalAmount) return;

  const settings = userProfile?.settings || {};
  let useAutoCurrency = settings.autoCurrency !== false;
  let targetCurrency = settings.currency || 'USD';

  if (settings.usdTotal) {
    useAutoCurrency = true;
    targetCurrency = 'USD';
  }

  const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
  const targetSymbol = targetCurrObj.symbol || '$';

  let displayRates = null;
  let mathRates = null;

  if (useAutoCurrency) {
    displayRates = await fetchExchangeRates(targetCurrency);
    mathRates = displayRates;
  } else {
    // Check for mixed currencies for smart total
    const uniqueCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  // --- GET RELEVANT SUBSCRIPTIONS FOR THIS MONTH ---
  const relevantSubs = getDisplaySubscriptions().filter(s => isSubRelevantToMonth(s, currentDate));

  const totalCount = relevantSubs.length;
  const activeCount = relevantSubs.filter(s => !s.stopped).length;
  const stoppedCount = relevantSubs.filter(s => s.stopped).length;
  const paidCount = relevantSubs.filter(s => !s.stopped && window.isSubPaid(s, currentDate)).length;
  const unpaidCount = relevantSubs.filter(s => !s.stopped && !window.isSubPaid(s, currentDate)).length;

  const boughtCount = relevantSubs.filter(s => {
    const { start } = getSubDates(s);
    return start.getMonth() === currentDate.getMonth() && start.getFullYear() === currentDate.getFullYear();
  }).length;

  const endsCount = relevantSubs.filter(s => {
    const { end } = getSubDates(s);
    return end && end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear();
  }).length;

  summary.innerHTML = `
    <span class="${filter === 'all' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('all')">${totalCount} TOTAL</span> /
    <span class="${filter === 'active' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('active')">${activeCount} ACTIVE</span> /
    <span class="${filter === 'bought' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('bought')" style="color:var(--accent-green)">${boughtCount} BOUGHT</span> /
    <span class="${filter === 'ends' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('ends')" style="color:var(--accent-red)">${endsCount} ENDS</span> /
    <span class="${filter === 'paid' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('paid')">${paidCount} PAID</span> /
    <span class="${filter === 'unpaid' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('unpaid')">${unpaidCount} UNPAID</span> /
    <span class="${filter === 'stopped' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('stopped')">${stoppedCount} STOPPED</span>
  `;

  let filtered = [...relevantSubs];
  if (filter === 'active') filtered = relevantSubs.filter(s => !s.stopped);
  if (filter === 'stopped') filtered = relevantSubs.filter(s => s.stopped);
  if (filter === 'paid') filtered = relevantSubs.filter(s => !s.stopped && s.paid);
  if (filter === 'unpaid') filtered = relevantSubs.filter(s => !s.stopped && !s.paid);

  if (filter === 'bought') {
    filtered = relevantSubs.filter(s => {
      const { start } = getSubDates(s);
      return start.getMonth() === currentDate.getMonth() && start.getFullYear() === currentDate.getFullYear();
    });
  }
  if (filter === 'ends') {
    filtered = relevantSubs.filter(s => {
      const { end } = getSubDates(s);
      return end && end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear();
    });
  }

  // Sort by billing date/end date
  if (filter === 'ends') {
    filtered.sort((a, b) => getSubDates(a).end - getSubDates(b).end);
  } else if (filter === 'bought') {
    filtered.sort((a, b) => getSubDates(a).start - getSubDates(b).start);
  } else {
    filtered.sort((a, b) => a.date - b.date);
  }

  const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  let totalImpact = 0;
  let lastDay = null;

  list.innerHTML = filtered.map(s => {
    let domain = getDomain(s);
    const isStopped = s.stopped;
    const { start, end } = getSubDates(s);

    // Grouping Header Logic
    let headerHtml = '';
    if (filter === 'bought' || filter === 'ends') {
      const targetDate = filter === 'bought' ? start : end;
      const day = targetDate.getDate();
      if (day !== lastDay) {
        headerHtml = `<div class="detail-section-header ${filter}">${monthName} ${day}</div>`;
        lastDay = day;
      }
    }

    // Use full price for modal lists, not averaged commitment
    let itemPrice = parseFloat(s.price) || 0;
    const originalPriceStr = `${s.symbol || '$'}${itemPrice.toFixed(2)} `;
    let convertedMathPrice = itemPrice;
    let symbol = s.symbol || '$';
    let displayPrice = originalPriceStr;

    if (mathRates && (s.currency || 'USD') !== targetCurrency) {
      convertedMathPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, mathRates);
    }

    if (useAutoCurrency && displayRates && (s.currency || 'USD') !== targetCurrency) {
      const convertedDisplayPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, displayRates);
      symbol = targetSymbol || '$';
      displayPrice = `${originalPriceStr} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${symbol}${convertedDisplayPrice.toFixed(2)} `;
    }

    // For yearly, only count impact if it's the exact month and year it was bought/renews
    // For past carry-over subscriptions, don't count amount
    let skipImpact = false;
    const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    let isCarryOver = false;

    const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
    if (s.type === 'yearly') {
      if (currentDate.getMonth() !== start.getMonth()) {
        skipImpact = true;
        isCarryOver = true;
      }
    } else if (isMultiMonthTrial) {
      if (currentDate.getMonth() !== start.getMonth() || currentDate.getFullYear() !== start.getFullYear()) {
        isCarryOver = true;
      }
      skipImpact = true; // Never count in grand total
    }

    // Carry-over detection: It's a carry-over if it started in the past (already filtered to end in current month)
    if (end && start < viewStart && s.type !== 'yearly' && !isMultiMonthTrial) {
      skipImpact = true;
      isCarryOver = true;
    }

    if (isCarryOver) {
      displayPrice = `<span style="font-size:0.65rem; opacity:0.6; letter-spacing:0.05em; font-weight:700;">PREVIOUS</span>`;
    }
    s.isCarryOver = isCarryOver;

    if (!isStopped && !skipImpact) {
      totalImpact += convertedMathPrice;
    }

    s.displayPrice = displayPrice;
    return headerHtml + getSwipeTemplate(s);
  }).join('');

  // Choose label and total based on filter
  let finalSymbol = '$';
  if (mathRates) {
    finalSymbol = targetSymbol;
  } else if (filtered.length > 0) {
    finalSymbol = filtered[0].symbol || '$';
  }

  const labelEl = document.querySelector('#stats-footer span:first-child');
  const amountEl = document.getElementById('stats-total-amount');

  if (filter === 'all') {
    let sumAll = 0;
    let sumStopped = 0;

    relevantSubs.forEach(s => {
      let skip = false;
      const { start: startDateObj, end: endDateObj } = getSubDates(s);
      const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
      if (s.type === 'yearly') {
        if (currentDate.getMonth() !== startDateObj.getMonth()) {
          skip = true;
        }
      } else if (isMultiMonthTrial) {
        skip = true;
      }

      if (endDateObj && startDateObj < viewStart && s.type !== 'yearly' && !isMultiMonthTrial) {
        skip = true;
      }

      if (!skip) {
        let p = parseFloat(s.price) || 0;
        if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
        sumAll += p;
        if (s.stopped) sumStopped += p;
      }
    });
    const grandTotal = sumAll - sumStopped;

    if (labelEl) labelEl.innerHTML = `<span style="opacity:0.5">${finalSymbol}${sumAll.toFixed(2)}</span> - <span style="color:var(--accent-red)">${finalSymbol}${sumStopped.toFixed(2)}</span> = GRAND TOTAL: `;
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${grandTotal.toFixed(2)}`;
    }
  } else if (filter === 'stopped') {
    let sumStopped = 0;
    filtered.forEach(s => {
      let skip = false;
      const { start: startDateObj, end: endDateObj } = getSubDates(s);
      const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
      if (s.type === 'yearly') {
        if (currentDate.getMonth() !== startDateObj.getMonth()) {
          skip = true;
        }
      } else if (isMultiMonthTrial) {
        skip = true;
      }

      if (endDateObj && startDateObj < viewStart && s.type !== 'yearly' && !isMultiMonthTrial) {
        skip = true;
      }

      if (!skip) {
        let p = parseFloat(s.price) || 0;
        if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
        sumStopped += p;
      }
    });

    if (labelEl) labelEl.innerText = "TOTAL SAVED:";
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${sumStopped.toFixed(2)}`;
    }
  } else if (filter === 'paid') {
    if (labelEl) labelEl.innerText = "PAID TOTAL:";
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${totalImpact.toFixed(2)}`;
    }
  } else if (filter === 'unpaid') {
    if (labelEl) labelEl.innerText = "UNPAID TOTAL:";
    if (amountEl) amountEl.innerText = `${finalSymbol}${totalImpact.toFixed(2)}`;
  } else if (filter === 'bought') {
    if (labelEl) labelEl.innerText = "BOUGHT TOTAL:";
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${totalImpact.toFixed(2)}`;
    }
  } else if (filter === 'ends') {
    if (labelEl) labelEl.innerText = "ENDING TOTAL:";
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${totalImpact.toFixed(2)}`;
    }
  } else {
    // Active only
    if (labelEl) labelEl.innerText = "ACTIVE TOTAL:";
    if (amountEl) {
      amountEl.innerHTML = `${finalSymbol}${totalImpact.toFixed(2)}`;
    }
  }

  modal.classList.remove('hidden');
  attachSwipeEvents();
};

// --- Account Settings Logic ---
window.showAccountSettings = function () {
  if (!userProfile || !currentUser) return;

  // Fill form fields
  document.getElementById('settings-name').value = userProfile.name || '';
  document.getElementById('settings-email').value = currentUser.email || '';
  document.getElementById('settings-dob').value = userProfile.dob || '';

  // Set Custom Gender Dropdown
  const gender = userProfile.gender || 'male';
  genderHiddenInput.value = gender;
  
  const selectedSpan = document.getElementById('settings-gender-selected');
  if (selectedSpan) selectedSpan.innerText = gender.charAt(0).toUpperCase() + gender.slice(1);

  // Update selected class in list
  const list = document.getElementById('settings-gender-list');
  if (list) {
    list.querySelectorAll('li').forEach(li => {
      li.classList.toggle('selected', li.dataset.value === gender);
    });
  }

  // Handle DOB locking
  const dobInput = document.getElementById('settings-dob');
  const dobMsg = document.getElementById('dob-locked-msg');
  if (userProfile.dob) {
    dobInput.disabled = true;
    dobInput.style.opacity = '0.6';
    dobInput.style.cursor = 'not-allowed';
    dobMsg?.classList.remove('hidden');
  } else {
    dobInput.disabled = false;
    dobInput.style.opacity = '1';
    dobInput.style.cursor = 'text';
    dobMsg?.classList.add('hidden');
  }

  // Handle Avatar Preview
  updateProfileUI();

  // Populate the banner card inside settings with user info
  const bannerName = document.getElementById('settings-banner-name');
  const bannerEmail = document.getElementById('settings-banner-email');
  const name = userProfile?.name || currentUser?.email?.split('@')[0] || 'User';
  if (bannerName) {
    bannerName.innerText = name;
    bannerName.dataset.fallback = name; // Used by live preview as fallback when input is cleared
  }
  if (bannerEmail) bannerEmail.innerText = currentUser?.email || '';

  if (window.toggleAccountSettingsPage) window.toggleAccountSettingsPage(true);
};

// --- App Settings Logic ---
function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
}

window.showAppSettings = function () {
  if (!userProfile) return;

  // Load current settings from userProfile or defaults
  const settings = userProfile.settings || {};
  notifToggle.checked = settings.notifications !== false;


  const isDark = settings.theme === 'dark' || !settings.theme;
  themeToggle.checked = isDark;
  applyTheme(isDark);

  autoCurrencyToggle.checked = settings.autoCurrency !== false;

  // Set USD toggle and ensure mutual exclusivity
  usdTotalToggle.checked = settings.usdTotal === true;
  if (usdTotalToggle.checked) {
    autoCurrencyToggle.checked = false;
  }

  const tzValue = settings.timezone || 'UTC+00:00';
  timezoneHiddenInput.value = tzValue;
  const tz = TIMEZONES.find(t => t.value === tzValue) || TIMEZONES[12];
  timezoneSelectedSpan.innerText = tz.label;

  const prefCurrency = settings.currency || 'USD';
  prefCurrencyHidden.value = prefCurrency;
  const curr = CURRENCIES.find(c => c.code === prefCurrency) || CURRENCIES[0];
  settingsCurrencySelected.innerText = `${curr.code} (${curr.symbol})`;

  const prefNoifTime = settings.notificationTime || '09:00';
  notifTimeHidden.value = prefNoifTime;
  notifTimeSelected.innerText = formatTimeLabel(prefNoifTime);

  appSettingsModal.classList.remove('hidden');
};

function formatTimeLabel(val) {
    if (!val) return '09:00 AM';
    const [h, m] = val.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
}

function renderNotifTimeList(filter = '') {
  const selectedValue = notifTimeHidden.value;
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let m of ['00', '30']) {
      const h = i.toString().padStart(2, '0');
      const val = `${h}:${m}`;
      const label = formatTimeLabel(val);
      if (label.toLowerCase().includes(filter.toLowerCase())) {
        times.push({ val, label });
      }
    }
  }

  notifTimeList.innerHTML = times.map(t => `
    <li data-value="${t.val}" class="${t.val === selectedValue ? 'selected' : ''}">
      <span>${t.label}</span>
    </li>
  `).join('');

  notifTimeList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      notifTimeHidden.value = li.dataset.value;
      notifTimeSelected.innerText = li.innerText;
      notifTimeDropdown.classList.add('hidden');
    });
  });
}

notifTimeTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  notifTimeDropdown.classList.toggle('hidden');
  timezoneDropdown.classList.add('hidden');
  settingsCurrencyDropdown.classList.add('hidden');
  if (!notifTimeDropdown.classList.contains('hidden')) {
    renderNotifTimeList();
    notifTimeSearch.value = '';
    notifTimeSearch.focus();
  }
});

notifTimeSearch.addEventListener('input', (e) => {
  renderNotifTimeList(e.target.value);
});

// Custom Time Zone Picker logic
function renderTimezoneList(filter = '') {
  const selectedValue = timezoneHiddenInput.value;
  const filtered = TIMEZONES.filter(t => t.label.toLowerCase().includes(filter.toLowerCase()));

  timezoneList.innerHTML = filtered.map(t => `
    <li data-value="${t.value}" class="${t.value === selectedValue ? 'selected' : ''}">
      <span>${t.label}</span>
    </li>
    `).join('');

  timezoneList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      timezoneHiddenInput.value = li.dataset.value;
      timezoneSelectedSpan.innerText = li.innerText;
      timezoneDropdown.classList.add('hidden');
    });
  });
}

timezoneTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  timezoneDropdown.classList.toggle('hidden');
  document.getElementById('currency-dropdown')?.classList.add('hidden');
  document.getElementById('platform-dropdown')?.classList.add('hidden');
  genderDropdown.classList.add('hidden');
  settingsCurrencyDropdown.classList.add('hidden');

  if (!timezoneDropdown.classList.contains('hidden')) {
    renderTimezoneList();
    timezoneSearch.value = '';
    timezoneSearch.focus();
  }
});

timezoneSearch.addEventListener('input', (e) => {
  renderTimezoneList(e.target.value);
});

// Custom Currency Picker for App Settings
function renderSettingsCurrencyList() {
  const selectedCode = prefCurrencyHidden.value;
  settingsCurrencyList.innerHTML = CURRENCIES.map(c => `
    <li data-code="${c.code}" data-symbol="${c.symbol}" class="${c.code === selectedCode ? 'selected' : ''}">
      <span class="cur-symbol">${c.symbol}</span>
      <span>${c.code} – ${c.name}</span>
    </li>
  `).join('');

  settingsCurrencyList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      prefCurrencyHidden.value = li.dataset.code;
      settingsCurrencySelected.innerText = `${li.dataset.code} (${li.dataset.symbol})`;
      settingsCurrencyDropdown.classList.add('hidden');
    });
  });
}

settingsCurrencyTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  settingsCurrencyDropdown.classList.toggle('hidden');
  timezoneDropdown.classList.add('hidden'); // Close timezone dropdown
  if (!settingsCurrencyDropdown.classList.contains('hidden')) {
    renderSettingsCurrencyList();
  }
});

appSettingsBtn.addEventListener('click', () => {
  window.showAppSettings();
});

closeAppSettingsBtn.addEventListener('click', () => {
  appSettingsModal.classList.add('hidden');
});

// At least one toggle must be active at all times
autoCurrencyToggle.addEventListener('change', () => {
  if (autoCurrencyToggle.checked) {
    usdTotalToggle.checked = false;
  } else {
    usdTotalToggle.checked = true;
  }
});

usdTotalToggle.addEventListener('change', () => {
  if (usdTotalToggle.checked) {
    autoCurrencyToggle.checked = false;
  } else {
    autoCurrencyToggle.checked = true;
  }
});

saveAppSettingsBtn.addEventListener('click', async () => {
  if (!currentUser) return;

  const newSettings = {
    notifications: notifToggle.checked,
    theme: themeToggle.checked ? 'dark' : 'light',
    autoCurrency: autoCurrencyToggle.checked,
    usdTotal: usdTotalToggle.checked,
    timezone: timezoneHiddenInput.value,
    currency: prefCurrencyHidden.value,
    notificationTime: notifTimeHidden.value
  };

    // Apply local changes immediately
    userProfile.settings = newSettings;
    safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));
    applyTheme(newSettings.theme === 'dark');
    updateTime();
    updateStats();
    loadNotifications();
    showToast('App settings saved successfully! ⚙️');
    appSettingsModal.classList.add('hidden');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings: newSettings })
        .eq('id', currentUser.id);

      if (error) throw error;
    } catch (err) {
      console.error('[Error] Failed to save app settings to cloud:', err);
      const errMsg = err.message || err.details || JSON.stringify(err);

      if (errMsg.includes('column "settings" of relation "profiles" does not exist') ||
        errMsg.includes('404') ||
        errMsg.includes('Could not find')) {
        alert(`Database update needed! 🚀\n\nPlease add a JSONB column named "settings" to your "profiles" table in Supabase.\n\nSQL to run: \nALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}':: jsonb; `);
      } else {
        // Assume network error, queue it
        queueOperation('update_app_settings', { settings: newSettings });
      }
    } finally {
      saveAppSettingsBtn.innerText = 'Save Settings';
      saveAppSettingsBtn.disabled = false;
    }
});

// Close app settings currency and timezone dropdowns on outside click
document.addEventListener('click', (e) => {
  if (settingsCurrencyPicker && !settingsCurrencyPicker.contains(e.target)) {
    if (settingsCurrencyDropdown) settingsCurrencyDropdown.classList.add('hidden');
  }
  if (timezonePicker && !timezonePicker.contains(e.target)) {
    if (timezoneDropdown) timezoneDropdown.classList.add('hidden');
  }
  if (notifTimePicker && !notifTimePicker.contains(e.target)) {
    if (notifTimeDropdown) notifTimeDropdown.classList.add('hidden');
  }
  if (genderPicker && !genderPicker.contains(e.target)) {
    if (genderDropdown) genderDropdown.classList.add('hidden');
  }
});

// Custom Gender Dropdown — handled by initFixedDropdown() in account-settings.js

// genderList click — handled by initFixedDropdown() in account-settings.js

// Close custom dropdowns on outside click
document.addEventListener('click', (e) => {
  if (genderPicker && !genderPicker.contains(e.target)) {
    if (genderDropdown) genderDropdown.classList.add('hidden');
  }
});

function updateProfileUI() {
  if (!userProfile) return;

  // Part 3: Populate cache
  if (userProfile.avatar_url) cachedAvatarUrl = userProfile.avatar_url;

  const avatars = document.querySelectorAll('.profile-avatar');
  avatars.forEach(container => {
    const svg = container.querySelector('svg');
    const img = container.querySelector('img');

    const effectiveUrl = userProfile.avatar_url || cachedAvatarUrl;

    if (effectiveUrl) {
      if (svg) svg.classList.add('hidden');
      if (img) {
        if (img.src !== effectiveUrl) img.src = effectiveUrl;
        img.classList.remove('hidden');
      }
    } else {
      if (svg) svg.classList.remove('hidden');
      if (img) img.classList.add('hidden');
    }
  });

  // Safe access for settings modal preview elements
  if (avatarImgPreview && avatarSvgPlaceholder) {
    if (userProfile.avatar_url) {
      avatarImgPreview.src = userProfile.avatar_url;
      avatarImgPreview.classList.remove('hidden');
      avatarSvgPlaceholder.classList.add('hidden');
    } else {
      avatarImgPreview.classList.add('hidden');
      avatarSvgPlaceholder.classList.remove('hidden');
    }
  }
}

accountSettingsBtn.addEventListener('click', () => window.showAccountSettings());

const updatePassBtn = document.getElementById('settings-update-pass-btn');
if (updatePassBtn) {
  updatePassBtn.addEventListener('click', async () => {
    const newPass = document.getElementById('settings-new-password').value;
    const msgEl = document.getElementById('settings-pass-msg');
    
    if (newPass.length < 10) {
      msgEl.innerText = "Password must be at least 10 characters";
      msgEl.style.color = "var(--accent-red)";
      msgEl.classList.remove('hidden');
      return;
    }

    updatePassBtn.innerText = "UPDATING...";
    updatePassBtn.style.opacity = "0.7";
    updatePassBtn.disabled = true;

    try {
      const { error } = await window.supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      
      msgEl.innerText = "Password updated successfully! ✅";
      msgEl.style.color = "#50fa7b";
      msgEl.classList.remove('hidden');
      document.getElementById('settings-new-password').value = "";
      
      if (window.HapticsService) window.HapticsService.success();
      
      setTimeout(() => {
        msgEl.classList.add('hidden');
      }, 4000);
      
    } catch (err) {
      console.error("Password update error:", err);
      msgEl.innerText = err.message || "Failed to update password";
      msgEl.style.color = "var(--accent-red)";
      msgEl.classList.remove('hidden');
      if (window.HapticsService) window.HapticsService.error();
    } finally {
      updatePassBtn.innerText = "Update Password";
      updatePassBtn.style.opacity = "1";
      updatePassBtn.disabled = false;
    }
  });
}
document.getElementById('test-native-notif-btn')?.addEventListener('click', () => {
    NativeNotifications.sendTestNotification();
    showToast('Scheduling test notification... 🔔');
});

document.getElementById('data-management-btn')?.addEventListener('click', () => {
    if (window.showDataModal) window.showDataModal(true);
});
// Handled in initAccountSettingsPage
appSettingsBtn.addEventListener('click', () => window.showAppSettings());

closeAppSettingsBtn.addEventListener('click', () => {
  appSettingsModal.classList.add('hidden');
});

// Avatar Selection Modal Logic
const avatarModal = document.getElementById('avatar-modal');
const closeAvatarModalBtn = document.getElementById('close-avatar-modal');
const uploadCustomBtn = document.getElementById('upload-custom-btn');
const freeAvatarGrid = document.getElementById('free-avatar-grid');
const paidAvatarGrid = document.getElementById('paid-avatar-grid');

function renderAvatars() {
  if (freeAvatarGrid) {
    freeAvatarGrid.innerHTML = FREE_AVATARS.map(url => `
      <div class="avatar-option ${userProfile.avatar_url === url ? 'selected' : ''}" onclick="selectAvatar('${url}')"
        style="cursor: pointer; transition: var(--transition);">
        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `).join('');
  }

  if (paidAvatarGrid) {
    paidAvatarGrid.innerHTML = PAID_AVATARS.map(url => `
      <div class="avatar-option ${userProfile.avatar_url === url ? 'selected' : ''}" onclick="selectAvatar('${url}')"
        style="cursor: pointer; transition: var(--transition);">
        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
    `).join('');
  }
}

window.selectAvatar = function (url) {
  userProfile.avatar_url = url;
  updateProfileUI();
  if (typeof renderAvatars === 'function') renderAvatars();
  if (window.saveProfileToSupabase) window.saveProfileToSupabase();
  
  const avatarModal = document.getElementById('avatar-modal');
  if (avatarModal) avatarModal.classList.add('hidden');
};

document.getElementById('settings-avatar-preview').addEventListener('click', () => {
  if (!window.navigator.onLine) {
    document.getElementById('offline-modal').classList.remove('hidden');
    return;
  }
  avatarModal.classList.remove('hidden');
  renderAvatars();
});

document.getElementById('close-offline-modal').addEventListener('click', () => {
  document.getElementById('offline-modal').classList.add('hidden');
});

closeAvatarModalBtn.addEventListener('click', () => {
  avatarModal.classList.add('hidden');
});

uploadCustomBtn.addEventListener('click', () => {
  avatarUpload.click();
  avatarModal.classList.add('hidden');
});

// Reusable Bottom Sheet Drag to Close Logic
function initBottomSheetDrag(modalId, dragAreaId) {
  const modal = document.getElementById(modalId);
  const dragArea = document.getElementById(dragAreaId);
  if (!modal || !dragArea) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  const onDragStart = (y) => {
    startY = y;
    isDragging = true;
    modal.style.transition = 'none';
    dragArea.style.cursor = 'grabbing';
  };

  const onDragMove = (y) => {
    if (!isDragging) return;
    currentY = y;
    const diffY = currentY - startY;
    if (diffY > 0) {
      modal.style.transform = `translateY(${diffY}px)`;
    }
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    dragArea.style.cursor = 'grab';
    modal.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.4s ease';

    const diffY = currentY > 0 ? (currentY - startY) : 0;
    if (diffY > 100) {
      modal.classList.add('hidden');
      setTimeout(() => { modal.style.transform = ''; }, 400);
    } else {
      modal.style.transform = '';
    }
    currentY = 0;
  };

  dragArea.addEventListener('touchstart', (e) => onDragStart(e.touches[0].clientY), { passive: true });
  dragArea.addEventListener('touchmove', (e) => onDragMove(e.touches[0].clientY), { passive: true });
  dragArea.addEventListener('touchend', onDragEnd);

  dragArea.addEventListener('mousedown', (e) => onDragStart(e.clientY));
  document.addEventListener('mousemove', (e) => {
    if (isDragging) onDragMove(e.clientY);
  });
  document.addEventListener('mouseup', onDragEnd);
}

// Initialize for all bottom sheets
initBottomSheetDrag('avatar-modal', 'avatar-drag-area');
initBottomSheetDrag('delete-subs-confirm-modal', 'delete-subs-drag-area');
initBottomSheetDrag('delete-confirm-modal', 'delete-account-drag-area');

avatarUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      userProfile.avatar_url = event.target.result; // Base64
      updateProfileUI();
    };
    reader.readAsDataURL(file);
  }
});

settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = settingsForm.querySelector('.submit-btn');
  submitBtn.disabled = true;
  submitBtn.innerText = 'Saving...';

  const updatedName = document.getElementById('settings-name').value.trim();
  const updatedGender = document.getElementById('settings-gender').value;
  const updatedDob = document.getElementById('settings-dob').value;

  try {
    // 1. Update Local Memory
    userProfile.name = updatedName;
    userProfile.gender = updatedGender;
    userProfile.dob = updatedDob || null; // Explicit null for SQL consistency
    userProfile.onboarding_completed = true;

    // 2. Sync Everywhere (Local, Cache, Cloud) Instantly
    if (window.saveProfileToSupabase) {
      await window.saveProfileToSupabase();
    } else {
       // Fallback if utility not found
       localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));
       await supabase.from('profiles').upsert({ id: currentUser.id, ...userProfile });
    }

    // 3. UI Feedback
    const infoH4 = document.querySelector('.profile-info h4');
    if (infoH4) infoH4.innerText = updatedName.toUpperCase();
    updateProfileUI();
    
    showToast('Profile updated & synced! 🎉');
  } catch (err) {
    console.error('Profile sync failed:', err.message);
    showToast('Saved locally — will sync when online. 📶', 'info');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Save Changes';
  }
});

// --- UI Helpers ---
window.showToast = function(message, type = 'success') {
  // Remove existing toasts if any
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type} `;
  toast.innerText = message;
  document.body.appendChild(toast);

  // Animation/Display logic
  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 2500);
}

window.showSubDetail = function(id, e) {
  if (e) e.stopPropagation();
  const sub = subscriptions.find(s => s.id === id);
  if (sub) {
    // Find all subs for the same day as this sub
    const daySubs = subscriptions.filter(s => s.date === sub.date);
    showSubscriptionDetails(sub, daySubs, new Date(currentDate.getFullYear(), currentDate.getMonth(), sub.date));
  }
};


function getDisplayPrice(s, targetCurrency, useAutoCurrency, displayRates) {
  let itemPrice = s.price;
  const priceNum = parseFloat(itemPrice) || 0;
  const originalPriceStr = `${s.symbol || '$'}${priceNum.toFixed(2)}`;
  if (useAutoCurrency && displayRates && (s.currency || 'USD') !== targetCurrency) {
    const convertedDisplayPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, displayRates);
    const targetSymbol = (CURRENCIES.find(c => c.code === targetCurrency) || {}).symbol || '$';
    return `${originalPriceStr} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${targetSymbol}${convertedDisplayPrice.toFixed(2)}`;
  }
  return originalPriceStr;
}

function getSwipeTemplate(s) {
  const isStopped = s.stopped;
  const isPaid = window.isSubPaid(s, currentDate);
  const domain = getDomain(s);

  // Check if ended (non-recurring/trial and today > end)
  const { end } = getSubDates(s);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isEnded = end && today > end;

  return `
    <div class="detail-item-wrapper" id="sw-wrapper-${s.id}">
      <div class="swipe-actions-bg" style="justify-content: space-between;">
        <div style="display: flex; height: 100%; gap: 5px;">
          <div class="swipe-action stop ${isStopped ? 'stopped-active' : ''}" onclick="stopSubscription(${s.id}, event)" style="width: 50px; font-size: 0.5rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 18px; height: 18px;">
              ${isStopped
      ? '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-5-8h10"/>'
      : '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>'}
            </svg>
            ${isStopped ? 'RESTART' : 'STOP'}
          </div>
          <div class="swipe-action delete" onclick="deleteSubscription(${s.id}, event)" style="width: 50px; font-size: 0.5rem;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 18px; height: 18px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            CANCEL
          </div>
        </div>
        <div style="display: flex; height: 100%; gap: 5px;">
          <div class="swipe-action paid ${isPaid ? 'paid-active' : ''}" onclick="togglePaidStatus(${s.id}, event)" style="width: 50px; color: ${isPaid ? '#fff' : 'var(--accent-green)'} !important; font-size: 0.5rem; text-align: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${isPaid ? 4 : 3}" style="width: 18px; height: 18px;"><path d="M20 6L9 17l-5-5"/></svg>
            ${isPaid ? 'PAID' : 'PAY'}
          </div>
          <div class="swipe-action freq" onclick="showTrialPath(${s.id}, event)" style="width: 50px; color: var(--accent-purple) !important; font-size: 0.5rem; text-align: center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width: 18px; height: 18px;"><path d="M12 2v20M17 5H7M17 19H7M22 12H2"/></svg>
            <span class="freq-btn-text">FREQ</span>
          </div>
        </div>
      </div>
      <div class="detail-item ${isStopped ? 'dimmed' : ''} ${s.isCarryOver ? (s.type === 'yearly' ? 'carry-over-path-blue' : (s.type === 'trial' ? 'carry-over-path-red' : 'carry-over-path')) : ''}" data-id="${s.id}">
        <div class="detail-logo ${isPaid ? 'paid-logo' : ''}" style="cursor: pointer; border-radius: 50%;" onclick="window.showSubDetail(${s.id}, event)">
          <img src="${window.getLogoUrl(domain)}" style="width:100%; height:100%; object-fit:contain; border-radius: 50%;">
        </div>
        <div class="detail-info">
          <span class="detail-name">${s.name}</span>
          <div class="tag-container" style="display: flex; gap: 4px; margin-top: 2px;">
            ${isPaid ? '<span class="status-tag tag-paid">PAID</span>' : ''}
            ${isStopped
      ? '<span class="status-tag tag-stopped">STOPPED</span>'
      : (isEnded ? '<span class="status-tag tag-ended">ENDED</span>' : '<span class="status-tag tag-active">ACTIVE</span>')}
            <span class="detail-type" style="margin-left: 4px; font-size: 0.6rem; opacity: 0.6;">${s.type} plan</span>
          </div>
        </div>
        <div class="detail-price" style="font-size: 0.85rem;">${s.displayPrice || ''}</div>
      </div>
    </div>
  `;
}
window.getSwipeTemplate = getSwipeTemplate;
window.attachSwipeEvents = attachSwipeEvents;

// Initial Render
updateTime();
setInterval(updateTime, 30000); // Update every 30s
renderHeader();
loadSubscriptions(); // Fetch from Supabase

// --- Background/Foreground Speed of Light Sync ---
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        const now = Date.now();
        // Only trigger if it's been at least 1 minute since last fetch to avoid spamming
        // but ensure data is "fresh" when coming back from background.
        if (now - lastFetchTimestamp > 60000) {
            console.log('[App] Resumed from background. Syncing for correctness...');
            loadSubscriptions();
        }
    }
});
initNotifications();
initProfilePage();
initAccountSettingsPage();

// --- Helper to get normalized start and end dates for a subscription ---
window.getSubDates = function (sub) {
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
      // One-time and Non-recurring Monthly both end in 1 month
      end.setMonth(end.getMonth() + 1);
    }
  } else if (sub.type === 'yearly') {
    end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
  }

  return { start, end };
}

/**
 * Converts a target calendar date + user preferred time + user preferred timezone
 * into the correct absolute Date object for scheduling a native notification.
 */
function getNotifScheduledDate(targetDate, prefH, prefM, timezoneStr) {
  // Parse the preferred timezone offset, e.g. "UTC+05:30" → +330 minutes
  const tzMatch = (timezoneStr || 'UTC+00:00').match(/UTC([+-])(\d{2}):(\d{2})/);
  let prefTzOffsetMinutes = 0;
  if (tzMatch) {
    const sign = tzMatch[1] === '+' ? 1 : -1;
    prefTzOffsetMinutes = sign * (parseInt(tzMatch[2]) * 60 + parseInt(tzMatch[3]));
  }

  // Extract the calendar date from the target (using local device time is fine for day accuracy)
  const d = new Date(targetDate);
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  // The user wants notification at prefH:prefM in their preferred timezone.
  // Convert preferred local time → UTC:  UTC = preferred_time - preferred_tz_offset
  const preferredMinutesFromMidnight = parseInt(prefH) * 60 + parseInt(prefM);
  const utcMinutesFromMidnight = preferredMinutesFromMidnight - prefTzOffsetMinutes;

  // Build the final UTC Date and return it (JS will handle display conversion)
  return new Date(Date.UTC(year, month, day) + utcMinutesFromMidnight * 60 * 1000);
}

function updateReminders() {
  if (!window.addNotification) return;

  const settings = userProfile?.settings || {};
  if (settings.notifications === false) {
    NativeNotifications.cancelAll();
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [prefH, prefM] = (settings.notificationTime || '09:00').split(':');
  const userTimezone = settings.timezone || 'UTC+00:00'; // FIX: use preferred timezone for scheduling
  const nativeReminders = [];

  subscriptions.forEach(s => {
    if (s.stopped) return;

    const { start: origStart, end: origEnd } = getSubDates(s);
    if (!origStart) return;

    const checkTarget = (targetDate, label, type) => {
      if (!targetDate) return;
      const diffMs = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // 1. In-App Notification (Recent View)
      if (diffDays >= 0 && diffDays <= 7 && !sessionStorage.getItem('notifs_cleared')) {
        const dateKey = targetDate.toISOString().split('T')[0];
        window.addNotification({
          key: `remind-${label.toLowerCase()}-${s.id}-${dateKey}`,
          title: diffDays === 0 ? `⚠️ ${label} TODAY` : `🔔 ${label} SOON`,
          text: diffDays === 0
            ? `Your ${s.name} ${type} ${label.toLowerCase()} today!`
            : `${s.name} ${type} ${label.toLowerCase()} in ${diffDays} day${diffDays > 1 ? 's' : ''}.`,
          type: "warning",
          domain: s.domain
        });
      }

      // 2. Native Notification (Future Scheduling)
      // Only schedule if it's today or in the next 30 days
      if (diffDays >= 0 && diffDays <= 30) {
        // FIX: Use timezone-aware scheduling instead of raw setHours()
        let scheduledDate = getNotifScheduledDate(targetDate, prefH, prefM, userTimezone);

        // FIX: If the preferred time for today has already passed, fire in 3 minutes
        // instead of silently skipping the notification entirely
        if (scheduledDate < new Date()) {
          scheduledDate = new Date(Date.now() + 3 * 60 * 1000);
        }

        nativeReminders.push({
          id: Math.floor(Math.random() * 1000000),
          title: diffDays === 0 ? `⚠️ ${s.name} ${label}` : `🔔 ${s.name} ${label} Soon`,
          body: diffDays === 0
            ? `Your ${s.name} ${type} ${label.toLowerCase()} today. Don't forget!`
            : `${s.name} ${type} ${label.toLowerCase()} in ${diffDays} days.`,
          date: scheduledDate
        });
      }
    };

    const billingDay = origStart.getDate();
    
    if (s.type === 'trial' && origEnd) {
      checkTarget(origEnd, "Trial Ending", "subscription");
    } else if (s.type === 'monthly') {
      if (s.recurring === 'recurring') {
        // Renewal logic
        const billingDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
        // If it's already past this month's billing day, target next month
        if (billingDate < today) {
            billingDate.setMonth(billingDate.getMonth() + 1);
        }
        checkTarget(billingDate, "Renewal", "monthly plan");
      } else if (origEnd) {
        // Non-recurring ends
        checkTarget(origEnd, "Ends", "subscription");
      }
    } else if (s.type === 'yearly') {
      const yearlyRenewal = new Date(today.getFullYear(), origStart.getMonth(), billingDay);
      if (yearlyRenewal < today) {
          yearlyRenewal.setFullYear(yearlyRenewal.getFullYear() + 1);
      }
      checkTarget(yearlyRenewal, "Renewal", "yearly plan");
    } else if (s.type === 'one-time' && origEnd) {
      checkTarget(origEnd, "Ends", "one-time plan");
    }

    // Unpaid reminder logic (as requested)
    // Only remind for unpaid recurring subs that are due soon or just passed
    const isPaid = window.isSubPaid(s, today);
    if (!isPaid && !s.stopped && s.recurring === 'recurring') {
       const dueDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
       // If due date is today or yesterday (missed it)
       const diff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
       
       if (diff >= 0 && diff <= 3) { // Remind for up to 3 days after it was due
          // FIX: Use timezone-aware scheduling + 2-hour buffer for unpaid reminders
          let unpaidDate = getNotifScheduledDate(today, prefH, prefM, userTimezone);
          unpaidDate = new Date(unpaidDate.getTime() + 2 * 60 * 60 * 1000); // +2 hours
          // If that time has already passed today, fire in 5 minutes instead
          if (unpaidDate < new Date()) {
            unpaidDate = new Date(Date.now() + 5 * 60 * 1000);
          }
          nativeReminders.push({
            id: Math.floor(Math.random() * 1000000),
            title: `📌 Unpaid Reminder: ${s.name}`,
            body: `You haven't marked your ${s.name} billing as paid yet.`,
            date: unpaidDate
          });
       }
    }
  });

  // Bulk schedule native notifications + show confirmation to the user
  if (nativeReminders.length > 0) {
    NativeNotifications.scheduleReminders(nativeReminders).then(() => {
      if (window.showAppStatus) {
        window.showAppStatus(`${nativeReminders.length} REMINDERS SCHEDULED`, 'success', 5000);
      } else {
        showToast(`🔔 ${nativeReminders.length} notification${nativeReminders.length > 1 ? 's' : ''} scheduled!`);
      }
      console.log(`[Notif] Successfully scheduled ${nativeReminders.length} native notification(s)`);
    });
  } else {
    console.log('[Notif] No upcoming events in next 30 days — nothing to schedule.');
  }

  // ── Stage 1: Smart daily reminders (separate module, zero risk to existing logic) ──
  scheduleDailyReminders(window.subscriptions || [], settings).then(count => {
    if (count > 0) {
      console.log(`[DailyReminder] ${count} daily reminder(s) queued.`);
    }
  });
}
window.updateReminders = updateReminders;


// --- Feature Init ---
initNotifications();
initPricing();
initBottomBar();
initGlass();

// Stage 2: Reload subscriptions after offline queue flushes to cloud
window.addEventListener('syncqueue:flushed', (e) => {
  console.log(`[App] Sync queue flushed ${e.detail.synced} item(s) — refreshing data...`);
  loadSubscriptions(true);
});

// --- Header Options Menu Logic (Outside click only) ---
document.addEventListener('click', (e) => {
    const optionsDropdown = document.getElementById('header-options-dropdown');
    const optionsBtn = document.getElementById('header-options-btn');
    if (optionsDropdown && !optionsDropdown.classList.contains('hidden') && !optionsDropdown.contains(e.target) && !optionsBtn.contains(e.target)) {
        optionsDropdown.classList.add('hidden');
    }
});

// --- Add Subscription Page "Catalog" Header Button ---
// Handled in src/features/catalog/catalog.js
