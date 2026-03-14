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
let currentDate = new Date();
let currentStatsFilter = 'all';

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
const settingsModal = document.getElementById('settings-modal');
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
  { name: 'Discord Nitro', domain: 'discord.com' }
];

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
    li.innerHTML = `
      <img src="https://icon.horse/icon/${app.domain}" alt="${app.name}">
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
 
  let domain = domainOrUrl;
  if (domain.startsWith('http')) {
    try {
      domain = new URL(domain).hostname;
    } catch (e) { }
  }
 
  preview.innerHTML = `<img src="https://icon.horse/icon/${domain}" style="width:100%; height:100%; object-fit:contain;">`;
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

document.getElementById('sub-name').addEventListener('input', (e) => {
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
  if (!document.getElementById('trial-months-picker').contains(e.target)) {
    document.getElementById('trial-months-dropdown').classList.add('hidden');
  }
});

// --- Currency Exchange ---
async function fetchExchangeRates(base = 'USD') {
  const now = Date.now();
  if (exchangeRatesCache[base] && (now - exchangeRatesCache[base].timestamp < 3600000)) {
    return exchangeRatesCache[base].rates;
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await response.json();
    if (data.result === 'success') {
      exchangeRatesCache[base] = {
        rates: data.rates,
        timestamp: now
      };
      return data.rates;
    }
  } catch (err) {
    console.error(`Failed to fetch exchange rates for ${base}:`, err);
  }
  return null;
}

function getConvertedPrice(price, fromCurrency, targetCurrency, rates) {
  if (!rates || Object.keys(rates).length === 0) return price;
  const from = fromCurrency || 'USD';
  if (from === targetCurrency) return price;
  const rate = rates[from] || 1;
  return price / rate;
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

async function loadSubscriptions() {
  if (!currentUser) return;

  // Show loading state in footer immediately
  const footTotal = document.getElementById('total-amount');
  if (footTotal) footTotal.innerText = 'Loading...';

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', currentUser.id);

    if (error) throw error;

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

    // Always sync local cache with the exact DB state
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));

    // Auto-generate reminders only on fresh loads
    updateReminders();
  } catch (err) {
    console.error('Error loading subscriptions:', err.message);
    subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
  }

  renderCalendar();
  updateStats();
}

async function saveToSupabase(sub) {
  if (!currentUser) return null;
  try {
    // Only send columns that exist in the database to avoid 400 "Bad Request" errors
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
      user_id: currentUser.id
    };

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
    return null;
  }
}

async function removeFromSupabase(id) {
  try {
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;

    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  } catch (err) {
    console.error('Error removing from Supabase:', err.message);
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
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

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  // Returns 0 for Sunday, 1 for Monday, etc. Adjust for Mon-Sun grid.
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // 0 (Mon) to 6 (Sun)
}

function renderCalendar() {
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
    createCell(d, true, false, fullDate);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    const fullDate = new Date(year, month, d);
    createCell(d, false, isToday, fullDate);
  }

  // Next month leading days (fill up to 42 cells for 6 rows of 7)
  const remainingCells = 42 - calendarGrid.children.length;
  for (let i = 1; i <= remainingCells; i++) {
    const fullDate = new Date(year, month + 1, i);
    createCell(i, true, false, fullDate);
  }

  updateStats();
}

function getDomain(s) {
  const brandMap = {
    'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
    'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
    'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
    'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
    'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so',
    'twitter': 'twitter.com', 'x': 'x.com', 'meta': 'meta.com', 'facebook': 'facebook.com',
    'instagram': 'instagram.com', 'tiktok': 'tiktok.com', 'github': 'github.com',
    'chatgpt': 'openai.com', 'openai': 'openai.com', 'cursor': 'cursor.sh'
  };
  
  let nameLower = s.name.toLowerCase().trim();
  let domain = s.domain;

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

function createCell(day, isOtherMonth, isToday, fullDate) {
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
    const daySubs = subscriptions.filter(s => {
      const start = new Date(s.startDate);
      const isMultiMonthTrial = s.type === 'trial' && parseInt(s.trialMonths) > 0;
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
        } else if (index === 3) {
          const plus = document.createElement('div');
          plus.className = 'sub-more-plus';
          plus.innerText = '+';
          dotsContainer.appendChild(plus);
        }

        // Create icon (only show first 3 to prevent overflow)
        if (index < 3) {
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
          const logoUrl = `https://icon.horse/icon/${domain}`;

          const img = document.createElement('img');
          img.src = logoUrl;
          img.alt = sub.name;
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.style.pointerEvents = 'none';

          // Circular Logo Container for Calendar
          icon.style.borderRadius = '50%';
          icon.style.cursor = 'pointer';
          icon.style.overflow = 'hidden';
          icon.onclick = (e) => {
            e.stopPropagation();
            showSubscriptionDetails(sub, daySubs, new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          };

          // Fallback if logo fails (Show a sleek white cross)
          img.onerror = () => {
            icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
          };

          icon.appendChild(img);
          iconsContainer.appendChild(icon);
        }
      });

      cell.appendChild(dotsContainer);
      cell.appendChild(iconsContainer);
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
        }, 1000);
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
    }
  }
}

async function showTooltip(e, subs) {
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
    const originalPriceStr = `${s.symbol || '$'}${s.price.toFixed(2)}`;
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

  tooltip.classList.remove('hidden');
  moveTooltip(e);
}

function moveTooltip(e) {
  // Handle both mouse and touch events
  const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clientY = e.clientY ?? (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

  const x = clientX + 10;
  const y = clientY + 10;

  // Keep tooltip on screen
  const rect = tooltip.getBoundingClientRect();
  const finalX = x + rect.width > window.innerWidth ? x - rect.width - 20 : x;
  const finalY = y + rect.height > window.innerHeight ? y - rect.height - 20 : y;

  tooltip.style.left = `${finalX}px`;
  tooltip.style.top = `${finalY}px`;
}

function hideTooltip() {
  tooltip.classList.add('hidden');
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
      let p = s.price;
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

window.deleteSubscription = function (id, e) {
  if (e) e.stopPropagation();

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
  } else {
    dayDetailModal.classList.add('hidden');
  }
};

window.editSubscription = function (id) {
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return;

  // Fill the add-modal with sub data
  document.getElementById('sub-name').value = sub.name;
  document.getElementById('sub-price').value = sub.price;
  document.getElementById('sub-date').value = sub.date;
  document.getElementById('sub-domain').value = sub.domain;
  document.getElementById('sub-currency').value = sub.currency || 'USD';
  document.getElementById('sub-currency-symbol').value = sub.symbol || '$';
  document.getElementById('currency-symbol').textContent = sub.symbol || '$';
  document.getElementById('currency-code').textContent = sub.currency || 'USD';

  // Platform icon
  updatePlatformIcon(sub.domain);

  // Freq
  document.getElementById('sub-type').value = sub.type;
  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === sub.type);
  });

  // Notes
  document.getElementById('sub-notes').value = sub.notes || '';

  // Handle specific frequency sections
  const monthlySec = document.getElementById('monthly-options-section');
  const trialSec = document.getElementById('trial-duration-section');
  monthlySec.classList.add('hidden');
  trialSec.classList.add('hidden');

  if (sub.type === 'monthly') {
    monthlySec.classList.remove('hidden');
    document.getElementById('sub-recurring-val').value = sub.recurring;
    document.querySelectorAll('.recur-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === sub.recurring);
    });
  } else if (sub.type === 'trial') {
    trialSec.classList.remove('remove'); // Typo fix from existing code if any, or just ensuring visible
    trialSec.classList.remove('hidden');
    document.getElementById('trial-days-val').value = sub.trialDays || '';
    document.getElementById('trial-months-val').value = sub.trialMonths || '';
    document.getElementById('trial-days-selected').innerText = sub.trialDays ? `${sub.trialDays} Days` : 'Days';
    document.getElementById('trial-months-selected').innerText = sub.trialMonths ? `${sub.trialMonths} Month` : 'Months';
  }

  // Set as editing (temp property for the form submit)
  window.editingSubId = id;
  
  // Show modal
  const addModal = document.getElementById('add-modal');
  addModal.querySelector('h2').innerText = 'Edit Subscription';
  addModal.classList.remove('hidden');
  
  // Close the detail views if open
  document.getElementById('day-detail-modal').classList.add('hidden');
};

window.stopSubscription = function (id, e) {
  if (e) e.stopPropagation();
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

    renderCalendar();

    // Re-render the correct view so they see the state change
    updateStats();
    if (!document.getElementById('stats-modal').classList.contains('hidden')) {
      showMonthlyBreakdown(currentStatsFilter);
    } else {
      const daySubs = subscriptions.filter(s => s.date === sub.date);
      showDayDetails(sub.date, daySubs);
    }

    // Keep the action 'revealed' after refreshing
    const wrapper = document.getElementById(`sw-wrapper-${id}`);
    if (wrapper) {
      const item = wrapper.querySelector('.detail-item');
      item.style.transition = 'none';
      item.style.transform = 'translateX(-120px)';
      wrapper.querySelector('.stop').style.opacity = '1';
    }
  }
};

window.togglePaidStatus = async function (id, e) {
  if (e) e.stopPropagation();
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
      if (history.length > 0) {
        // Was paid, now unpaid globally
        userProfile.settings.paid_history[id] = [];
        newState = false;
      } else {
        // Was unpaid, now paid globally (just push current month as marker)
        userProfile.settings.paid_history[id] = [monthKey];
        newState = true;
      }
    } else {
      // Normal monthly toggle
      const index = history.indexOf(monthKey);
      if (index > -1) {
        history.splice(index, 1);
        newState = false;
      } else {
        history.push(monthKey);
        newState = true;
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

    // Save profile settings to persist paid history
    await supabase.from('profiles').update({ settings: userProfile.settings }).eq('id', currentUser.id);
    
    // Background sync for subscription object if changed (non-recurring)
    if (sub.recurring !== 'recurring') {
      saveToSupabase(sub);
    }
    
    renderCalendar();
    updateStats();
    if (!document.getElementById('stats-modal').classList.contains('hidden')) {
      showMonthlyBreakdown(currentStatsFilter);
    } else {
      const daySubs = subscriptions.filter(s => s.date === sub.date);
      showDayDetails(sub.date, daySubs);
    }
    const wrapper = document.getElementById(`sw-wrapper-${id}`);
    if (wrapper) {
      const item = wrapper.querySelector('.detail-item');
      item.style.transition = 'none';
      item.style.transform = 'translateX(-105px)';
      wrapper.querySelector('.paid').style.opacity = '1';
      wrapper.querySelector('.freq').style.opacity = '1';
    }
  }
};

function attachSwipeEvents() {
  const items = document.querySelectorAll('.detail-item');
  items.forEach(item => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let hasStartedSwipe = false;
    const threshold = 15;
    const maxTranslateX = 120;

    const onStart = (e) => {
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      isDragging = true;
      hasStartedSwipe = false; // Reset swipe detection
      item.style.transition = 'none';

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('touchend', onEnd);
    };

    const onMove = (e) => {
      if (!isDragging) return;
      currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      const walk = currentX - startX;

      // STRICT GATE: Do not do anything until we cross the threshold
      if (!hasStartedSwipe) {
        if (Math.abs(walk) > threshold) {
          hasStartedSwipe = true;
        } else {
          return; // Still just a potential tap
        }
      }

      // If we are here, it's a real swipe
      const wrapper = item.parentElement;
      const del = wrapper.querySelector('.delete');
      const stp = wrapper.querySelector('.stop');
      const frq = wrapper.querySelector('.freq');

      const maxRight = 105;
      const maxLeft = 105;
      const translate = Math.max(-maxLeft, Math.min(maxRight, walk > 0 ? walk - threshold : walk + threshold));

      if (translate > 0) {
        if (del) del.style.opacity = Math.min(translate / 60, 1);
        if (stp) stp.style.opacity = Math.min(translate / 60, 1);
        if (frq) frq.style.opacity = 0;
      } else {
        if (frq) frq.style.opacity = Math.min(-translate / 60, 1);
        const paidBtn = wrapper.querySelector('.paid');
        if (paidBtn) paidBtn.style.opacity = Math.min(-translate / 60, 1);
        if (del) del.style.opacity = 0;
        if (stp) stp.style.opacity = 0;
      }

      item.style.transform = `translateX(${translate}px)`;
      
      // Prevent scrolling once we've decided it's a swipe
      if (e.cancelable) e.preventDefault();
    };

    const onEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      if (!hasStartedSwipe) {
        // It was just a tap, the click listener on the logo will fire naturally
        item.style.transform = 'translateX(0)';
        return;
      }

      const walk = currentX - startX;
      item.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
      const wrapper = item.parentElement;

      if (walk > 50) {
        item.style.transform = `translateX(${maxTranslateX}px)`;
      } else if (walk < -50) {
        item.style.transform = `translateX(${-maxTranslateX}px)`;
      } else {
        item.style.transform = `translateX(0)`;
        if (wrapper.querySelector('.delete')) wrapper.querySelector('.delete').style.opacity = 0;
        if (wrapper.querySelector('.stop')) wrapper.querySelector('.stop').style.opacity = 0;
      }
    };

    item.addEventListener('touchstart', onStart, { passive: true });
    item.addEventListener('mousedown', onStart);
  });
}

async function updateStats() {
  // Main aggregate footer should only show ACTIVE monthly commitment relevant to THE VIEWED month
  const activeSubs = subscriptions.filter(s => !s.stopped && isSubRelevantToMonth(s, currentDate));
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
    const uniqueCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      // Background math correction
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  activeSubs.forEach(s => {
    let price = s.price; // Show full price impact, not average commitment

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

  const relevantSubs = subscriptions.filter(s => isSubRelevantToMonth(s, currentDate));
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

  totalAmountEl.innerText = `${finalSymbol}${monthlyTotal.toFixed(2)}`;
}

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
  // Set default currency from settings if available
  if (userProfile?.settings?.currency) {
    const prefCode = userProfile.settings.currency;
    const curr = CURRENCIES.find(c => c.code === prefCode);
    if (curr) {
      selectCurrency(curr.code, curr.symbol);
    }
  }

  addModal.classList.remove('hidden');
  document.getElementById('sub-date').value = new Date().getDate();

  // Reset frequency to default: One-Time Only
  document.getElementById('sub-type').value = 'one-time';
  document.querySelectorAll('.freq-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.freq-btn[data-value="one-time"]')?.classList.add('active');

  // Hide extra sections
  document.getElementById('trial-duration-section')?.classList.add('hidden');
  document.getElementById('monthly-options-section')?.classList.add('hidden');

  // Reset notes counter
  updateNotesCounter();
});

document.getElementById('close-modal').addEventListener('click', () => {
  addModal.classList.add('hidden');
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

// Monthly Recurring Logic
document.querySelectorAll('.recur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.recur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('sub-recurring-val').value = btn.dataset.value;
    document.getElementById('monthly-error').classList.add('hidden');
  });
});

// Trial Custom Dropdowns Logic
document.getElementById('trial-days-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('trial-days-dropdown').classList.toggle('hidden');
  document.getElementById('trial-months-dropdown').classList.add('hidden');
});

document.getElementById('trial-months-trigger').addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('trial-months-dropdown').classList.toggle('hidden');
  document.getElementById('trial-days-dropdown').classList.add('hidden');
});

[
  { id: 'days', trigger: 'trial-days-trigger', dropdown: 'trial-days-dropdown', list: 'trial-days-list', selected: 'trial-days-selected', val: 'trial-days-val' },
  { id: 'months', trigger: 'trial-months-trigger', dropdown: 'trial-months-dropdown', list: 'trial-months-list', selected: 'trial-months-selected', val: 'trial-months-val' }
].forEach(pick => {
  const listEl = document.getElementById(pick.list);
  const selectedEl = document.getElementById(pick.selected);
  const valEl = document.getElementById(pick.val);
  const dropdownEl = document.getElementById(pick.dropdown);

  listEl.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const val = li.dataset.value;
      valEl.value = val;
      selectedEl.innerText = li.innerText;
      dropdownEl.classList.add('hidden');
      document.getElementById('trial-error').classList.add('hidden');

      // Clear other picker if one is selected
      const otherId = pick.id === 'days' ? 'trial-months' : 'trial-days';
      document.getElementById(`${otherId}-val`).value = '';
      document.getElementById(`${otherId}-selected`).innerText = pick.id === 'days' ? 'Months' : 'Days';
    });
  });
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
  addModal.classList.add('hidden');
  document.getElementById('trial-duration-section').classList.add('hidden');
  document.getElementById('monthly-options-section').classList.add('hidden');
  subForm.reset(); // Reset form after success
  document.getElementById('trial-days-val').value = '';
  document.getElementById('trial-months-val').value = '';
  document.getElementById('trial-days-selected').innerText = 'Days';
  document.getElementById('trial-months-selected').innerText = 'Months';
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
  addModal.querySelector('h2').innerText = 'Add Subscription';
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

// --- Profile Modal ---
const profileBtn = document.querySelector('.profile-btn');
const profileModal = document.getElementById('profile-modal');
const closeProfile = document.getElementById('close-profile');

if (profileBtn) {
  profileBtn.addEventListener('click', () => {
    showProfileModal();
  });
}

if (closeProfile) {
  closeProfile.addEventListener('click', () => {
    profileModal.classList.add('hidden');
  });
}

const showProfileModal = async () => {
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
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${finalSymbol}${totalMonthlyImpact.toFixed(2)}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Per Month</span>
        <span style="font-size: 0.5rem; color: var(--text-dim); opacity: 0.6; display: block; margin-top: 2px;">${currentMonthName}</span>
     </div>
  `;

  profileModal.classList.remove('hidden');
};

// --- Auth Event Listeners ---
if (getStartedBtn) {
  getStartedBtn.addEventListener('click', () => {
    welcomeView.classList.add('hidden');
    loginView.classList.remove('hidden');
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
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) throw result.error;

    if (isSignUp && !result.data.session) {
      authError.innerText = "Check your email for the confirmation link!";
      authError.classList.remove('hidden');
    }

  } catch (err) {
    console.error('Full Auth Error Object:', err);
    authError.innerText = err.message || 'Network error — please check your connection';
    authError.classList.remove('hidden');
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
          const domain = getDomain(sub);
          const logoUrl = `https://icon.horse/icon/${domain}`;

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
  profileModal.classList.add('hidden');
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
    // 1. Call the database function to delete the user
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
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log(`[Auth] Event: ${event} `);

  if (session) {
    currentUser = session.user;
    window.currentUser = session.user;
    console.log(`[Auth] Session active for: ${currentUser.email} `);

    // 1. IMMEDIATELY hide login screen—don't wait for profile.
    authScreen.classList.add('hidden');

    // 2. Background task to load profile
    const loadProfile = async () => {
      try {
        console.log('[Auth] Fetching profile from Supabase...');
        // Safety timeout for profile fetch (5 seconds)
        const profilePromise = supabase
          .from('profiles')
          .select('name, gender, dob, avatar_url, settings')
          .eq('id', currentUser.id)
          .single();

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );

        const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

        if (profile) {
          console.log('[Auth] Profile fetched successfully.');
          userProfile = profile;
          safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));
        } else {
          console.warn('[Auth] No profile in Supabase, checking local cache...');
          const saved = localStorage.getItem(`profile_${currentUser.id}`);
          if (saved) userProfile = JSON.parse(saved);
        }

        // Apply theme immediately after profile is loaded
        if (userProfile?.settings?.theme) {
          applyTheme(userProfile.settings.theme === 'dark');
        }

        // --- Sync Starred Dates from DB to UI ---
        if (userProfile?.settings?.starred_dates) {
          const starredDates = userProfile.settings.starred_dates;
          localStorage.setItem('starred_dates', JSON.stringify(starredDates));
          renderCalendar(); // Re-render to show the stars
        }

        // Ensure UI reflects latest settings
        updateStats();
        updateTime();
      } catch (err) {
        console.error('[Auth] Profile fetch failed/timed out:', err.message);
        const saved = localStorage.getItem(`profile_${currentUser.id}`);
        if (saved) userProfile = JSON.parse(saved);
      } finally {
        // Always try to update UI and show welcome, even if fetch failed
        updateProfileUI();

        const accountAgeMs = Date.now() - new Date(currentUser.created_at).getTime();
        const isNewUser = accountAgeMs < 2 * 60 * 1000;

        if (!userProfile && isNewUser) {
          showOnboarding();
        } else {
          showWelcomeScreen();
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
    authScreen.classList.remove('hidden');
    onboardingScreen.classList.add('hidden');
    welcomeScreen.classList.add('hidden');
    welcomeView.classList.remove('hidden');
    loginView.classList.add('hidden');
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
    loadSubscriptions();
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
    loadSubscriptions();
  }, 2600);
}

// --- Helper to check if a subscription is relevant to a specific month ---
function isSubRelevantToMonth(sub, monthDate) {
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
  const relevantSubs = subscriptions.filter(s => isSubRelevantToMonth(s, currentDate));

  // Determine what counts towards numerical totals (exclude carry-overs)
  const summedSubs = relevantSubs.filter(s => {
    const { start: startDateObj, end: endDateObj } = getSubDates(s);
    const viewStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // 1. Exclude strictly past ended subs
    if (endDateObj && endDateObj < viewStart) return false;

    // 2. Exclude carry-overs (started in past, ends now or future, not yearly)
    if (startDateObj < viewStart && endDateObj && s.type !== 'yearly') return false;

    // 3. Yearly plans only count in their renewal month
    if (s.type === 'yearly') {
      if (currentDate.getMonth() !== startDateObj.getMonth()) return false;
    }

    return true;
  });

  const activeCount = summedSubs.filter(s => !s.stopped).length;
  const stoppedCount = summedSubs.filter(s => s.stopped).length;
  const paidCount = summedSubs.filter(s => !s.stopped && s.paid).length;
  const unpaidCount = summedSubs.filter(s => !s.stopped && !s.paid).length;

  const boughtCount = summedSubs.filter(s => {
    const { start } = getSubDates(s);
    return start.getMonth() === currentDate.getMonth() && start.getFullYear() === currentDate.getFullYear();
  }).length;

  const endsCount = summedSubs.filter(s => {
    const { end } = getSubDates(s);
    return end && end.getMonth() === currentDate.getMonth() && end.getFullYear() === currentDate.getFullYear();
  }).length;

  const totalCount = summedSubs.length;

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
    let itemPrice = s.price;
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
        let p = s.price;
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
        let p = s.price;
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
  genderSelectedSpan.innerText = gender.charAt(0).toUpperCase() + gender.slice(1);

  // Update selected class in list
  genderList.querySelectorAll('li').forEach(li => {
    li.classList.toggle('selected', li.dataset.value === gender);
  });

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

  settingsModal.classList.remove('hidden');
  profileModal.classList.add('hidden'); // Close profile modal
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
  profileModal.classList.add('hidden');
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

// Mutually exclusive toggles
autoCurrencyToggle.addEventListener('change', () => {
  if (autoCurrencyToggle.checked) {
    usdTotalToggle.checked = false;
  }
});

usdTotalToggle.addEventListener('change', () => {
  if (usdTotalToggle.checked) {
    autoCurrencyToggle.checked = false;
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

  try {
    saveAppSettingsBtn.innerText = 'Saving...';
    saveAppSettingsBtn.disabled = true;

    const { error } = await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('id', currentUser.id);

    if (error) throw error;

    // Local update
    userProfile.settings = newSettings;
    safeSetLocalStorage(`profile_${currentUser.id}`, JSON.stringify(userProfile));

    // Apply theme immediately
    applyTheme(newSettings.theme === 'dark');

    // Update time immediately
    updateTime();

    // Refresh totals with new settings
    updateStats();

    // Refresh notifications immediately to reflect toggle
    loadNotifications();

    // Show success toast
    showToast('App settings saved successfully! ⚙️');

    appSettingsModal.classList.add('hidden');

  } catch (err) {
    console.error('[Error] Failed to save app settings:', err);
    const errMsg = err.message || err.details || JSON.stringify(err);

    if (errMsg.includes('column "settings" of relation "profiles" does not exist') ||
      errMsg.includes('404') ||
      errMsg.includes('Could not find')) {
      alert(`Database update needed! 🚀\n\nPlease add a JSONB column named "settings" to your "profiles" table in Supabase.\n\nSQL to run: \nALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}':: jsonb; `);
    } else {
      showToast(`Error: ${errMsg} `, 'error');
    }
  } finally {
    saveAppSettingsBtn.innerText = 'Save Settings';
    saveAppSettingsBtn.disabled = false;
  }
});

// Close app settings currency and timezone dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!settingsCurrencyPicker.contains(e.target)) {
    settingsCurrencyDropdown.classList.add('hidden');
  }
  if (!timezonePicker.contains(e.target)) {
    timezoneDropdown.classList.add('hidden');
  }
  if (!notifTimePicker.contains(e.target)) {
    notifTimeDropdown.classList.add('hidden');
  }
  if (!genderPicker.contains(e.target)) {
    genderDropdown.classList.add('hidden');
  }
});

// Custom Gender Dropdown Event Listeners
genderTrigger.addEventListener('click', (e) => {
  e.stopPropagation();
  genderDropdown.classList.toggle('hidden');

  // Close other dropdowns if any (following app pattern)
  document.getElementById('currency-dropdown')?.classList.add('hidden');
  document.getElementById('platform-dropdown')?.classList.add('hidden');
});

genderList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (li) {
    const val = li.dataset.value;
    genderHiddenInput.value = val;
    genderSelectedSpan.innerText = li.innerText;

    genderList.querySelectorAll('li').forEach(el => el.classList.remove('selected'));
    li.classList.add('selected');

    genderDropdown.classList.add('hidden');
  }
});

// Close custom dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!genderPicker.contains(e.target)) {
    genderDropdown.classList.add('hidden');
  }
});

function updateProfileUI() {
  if (!userProfile) return;

  const avatars = document.querySelectorAll('.profile-avatar');
  avatars.forEach(container => {
    const svg = container.querySelector('svg');
    const img = container.querySelector('img');

    if (userProfile.avatar_url) {
      if (svg) svg.classList.add('hidden');
      if (img) {
        img.src = userProfile.avatar_url;
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
document.getElementById('test-native-notif-btn')?.addEventListener('click', () => {
    NativeNotifications.sendTestNotification();
});
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

appSettingsBtn.addEventListener('click', () => window.showAppSettings());
closeAppSettingsBtn.addEventListener('click', () => appSettingsModal.classList.add('hidden'));

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
  renderAvatars();
  avatarModal.classList.add('hidden');
};

document.getElementById('settings-avatar-preview').addEventListener('click', () => {
  avatarModal.classList.remove('hidden');
  renderAvatars();
});

closeAvatarModalBtn.addEventListener('click', () => {
  avatarModal.classList.add('hidden');
});

uploadCustomBtn.addEventListener('click', () => {
  avatarUpload.click();
  avatarModal.classList.add('hidden');
});

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
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: currentUser.id,
        name: updatedName,
        gender: updatedGender,
        dob: updatedDob,
        avatar_url: userProfile.avatar_url // Save Base64 or URL
      });

    if (error) throw error;

    userProfile.name = updatedName;
    userProfile.gender = updatedGender;
    userProfile.dob = updatedDob;

    localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));

    // Update main profile name display
    document.querySelector('.profile-info h4').innerText = updatedName.toUpperCase();

    // settingsModal.classList.add('hidden'); // Removed alert, let user see it saved
    showToast('Settings saved successfully! 🎉');
  } catch (err) {
    console.error('Error saving settings:', err.message);
    showToast('Failed to save settings. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Save Settings';
  }
});

// --- UI Helpers ---
function showToast(message, type = 'success') {
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

window.editSubscription = function(id, e) {
  if (e) e.stopPropagation();
  const sub = subscriptions.find(s => s.id === id);
  if (!sub) return;

  window.editingSubId = sub.id;
  addModal.querySelector('h2').innerText = 'Edit Subscription';
  
  // Fill form
  document.getElementById('sub-name').value = sub.name;
  document.getElementById('sub-price').value = sub.price;
  document.getElementById('sub-date').value = sub.date;
  document.getElementById('sub-domain').value = sub.domain || '';
  document.getElementById('sub-type').value = sub.type;
  document.getElementById('sub-notes').value = sub.notes || '';
  
  updatePlatformIcon(sub.domain);
  selectCurrency(sub.currency || 'USD', sub.symbol || '$');
  
  // Update freq buttons
  document.querySelectorAll('.freq-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === sub.type);
  });
  
  // Show/hide sections based on type
  const trialSection = document.getElementById('trial-duration-section');
  const monthlySection = document.getElementById('monthly-options-section');
  
  trialSection.classList.add('hidden');
  monthlySection.classList.add('hidden');
  
  if (sub.type === 'trial') {
    trialSection.classList.remove('hidden');
    document.getElementById('trial-days-val').value = sub.trialDays || '';
    document.getElementById('trial-months-val').value = sub.trialMonths || '';
    document.getElementById('trial-days-selected').innerText = sub.trialDays ? `${sub.trialDays} Days` : 'Days';
    document.getElementById('trial-months-selected').innerText = sub.trialMonths ? `${sub.trialMonths} Month${sub.trialMonths > 1 ? 's' : ''}` : 'Months';
  } else if (sub.type === 'monthly') {
    monthlySection.classList.remove('hidden');
    document.getElementById('sub-recurring-val').value = sub.recurring || '';
    document.querySelectorAll('.recur-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === sub.recurring);
    });
  }
  
  updateNotesCounter();
  addModal.classList.remove('hidden');
  
  // Close the detail modal if it's open
  dayDetailModal.classList.add('hidden');
};

function getDisplayPrice(s, targetCurrency, useAutoCurrency, displayRates) {
  let itemPrice = s.price;
  const originalPriceStr = `${s.symbol || '$'}${itemPrice.toFixed(2)}`;
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
          <img src="https://icon.horse/icon/${domain}" style="width:100%; height:100%; object-fit:contain; border-radius: 50%;">
        </div>
        <div class="detail-info">
          <span class="detail-name">${s.name}</span>
          <div class="tag-container" style="display: flex; gap: 4px; margin-top: 2px;">
            ${isPaid ? '<span class="status-tag tag-paid">PAID</span>' : ''}
            ${isStopped
      ? '<span class="status-tag tag-stopped">STOPPED</span>'
      : '<span class="status-tag tag-active">ACTIVE</span>'}
            <span class="detail-type" style="margin-left: 4px; font-size: 0.6rem; opacity: 0.6;">${s.type} plan</span>
          </div>
        </div>
        <div class="detail-price" style="font-size: 0.85rem;">${s.displayPrice || ''}</div>
      </div>
    </div>
  `;
}

// Initial Render
updateTime();
setInterval(updateTime, 30000); // Update every 30s
renderHeader();
loadSubscriptions(); // Fetch from Supabase
initNotifications();

// --- Helper to get normalized start and end dates for a subscription ---
function getSubDates(sub) {
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
  const nativeReminders = [];

  subscriptions.forEach(s => {
    if (s.stopped) return;

    const { start: origStart, end: origEnd } = getSubDates(s);
    if (!origStart) return;

    const checkTarget = (targetDate, label) => {
      if (!targetDate) return;
      const diffMs = targetDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // 1. In-App Notification (Current View)
      if (diffDays >= 0 && diffDays <= 7 && !sessionStorage.getItem('notifs_cleared')) {
        const dateKey = targetDate.toISOString().split('T')[0];
        window.addNotification({
          key: `remind-${label.toLowerCase()}-${s.id}-${dateKey}`,
          title: diffDays === 0 ? `Due ${label}` : `${label} Soon`,
          text: diffDays === 0
            ? `${s.name} ${label.toLowerCase()} today! ⚠️`
            : `${s.name} ${label.toLowerCase()} in ${diffDays} day${diffDays > 1 ? 's' : ''}.`,
          type: "warning",
          domain: s.domain
        });
      }

      // 2. Native Notification (Future Scheduling)
      // Only schedule if it's in the future (today or later)
      if (diffDays >= 0 && diffDays <= 30) { // Schedule up to a month in advance
        const scheduledDate = new Date(targetDate);
        scheduledDate.setHours(parseInt(prefH), parseInt(prefM), 0, 0);

        // If scheduled time for TODAY has already passed, skip today's alert
        if (diffDays === 0 && scheduledDate < new Date()) return;

        nativeReminders.push({
          id: Math.floor(Math.random() * 1000000),
          title: diffDays === 0 ? `⚠️ ${s.name} ${label} Today` : `🔔 ${s.name} ${label} Soon`,
          body: diffDays === 0 
            ? `Your ${s.name} subscription ${label.toLowerCase()} today. Don't forget!`
            : `${s.name} ${label.toLowerCase()} in ${diffDays} days.`,
          date: scheduledDate
        });
      }
    };

    const billingDay = origStart.getDate();
    const billingDate = new Date(today.getFullYear(), today.getMonth(), billingDay);

    if (s.type === 'monthly' && s.recurring === 'recurring') {
      checkTarget(billingDate, "Payment");
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, billingDay);
      checkTarget(nextMonth, "Payment");
    } else if (s.type === 'yearly') {
      const yearlyRenewal = new Date(today.getFullYear(), origStart.getMonth(), billingDay);
      checkTarget(yearlyRenewal, "Renewal");
    } else {
      checkTarget(origStart, "Payment");
      checkTarget(origEnd, "Ends");
    }

    // Unpaid reminder logic
    const isPaid = window.isSubPaid(s, today);
    if (!isPaid && !s.stopped) {
       // If it's unpaid and due this month, remind them
       const dueDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
       if (dueDate >= today) {
         nativeReminders.push({
           id: Math.floor(Math.random() * 1000000),
           title: `📌 Unpaid: ${s.name}`,
           body: `You haven't marked ${s.name} as paid for this month yet.`,
           date: new Date(dueDate.setHours(parseInt(prefH), parseInt(prefM), 0, 0))
         });
       }
    }
  });

  // Bulk schedule native notifications
  NativeNotifications.scheduleReminders(nativeReminders);
}


// --- Feature Init ---
initNotifications();
initPricing();
initBottomBar();
initGlass();
