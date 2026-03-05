import './style.css';
import { supabase } from './supabase.js';

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

// --- State Management ---
let currentUser = null;
let currentDate = new Date();
let currentStatsFilter = 'all';
let subscriptions = [];
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

// Profile Pic Modal Selectors
const profilePicModal = document.getElementById('profile-pic-modal');
const closeProfilePic = document.getElementById('close-profile-pic');
const uploadCustomPic = document.getElementById('upload-custom-pic');
const freePicOptions = document.querySelectorAll('.free-pic-option');


let isSignUp = false;
let userProfile = null; // { name, age, gender }

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

function updatePlatformIcon(domainOrUrl) {
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
}

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

    // Save the clean domain into the hidden field so it gets stored on save
    document.getElementById('sub-domain').value = domain;
    updatePlatformIcon(domain);

  } else if (val.includes('.') && !val.includes(' ')) {
    // Bare domain like "netflix.com"
    document.getElementById('sub-domain').value = val;
    updatePlatformIcon(val);

  } else {
    // Plain text name — look for a match in popularApps
    const match = popularApps.find(app => app.name.toLowerCase() === val.toLowerCase());
    if (match) {
      document.getElementById('sub-domain').value = match.domain;
      updatePlatformIcon(match.domain);
    } else {
      document.getElementById('sub-domain').value = '';
      updatePlatformIcon(null);
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
    const subToSave = { ...sub, user_id: currentUser.id };
    const { data, error } = await supabase.from('subscriptions').upsert(subToSave).select().single();
    if (error) throw error;

    return data;
  } catch (err) {
    console.error('Error saving to Supabase:', err.message);
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
    createCell(prevMonthDays - i, true);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() &&
      month === new Date().getMonth() &&
      year === new Date().getFullYear();
    createCell(d, false, isToday);
  }

  // Next month leading days (fill up to 42 cells for 6 rows of 7)
  const remainingCells = 42 - calendarGrid.children.length;
  for (let i = 1; i <= remainingCells; i++) {
    createCell(i, true);
  }

  updateStats();
}

function getDomain(s) {
  const brandMap = {
    'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
    'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
    'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
    'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
    'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so'
  };
  let nameLower = s.name.toLowerCase().trim();
  let domain = s.domain || brandMap[nameLower] || nameLower.replace(/\s+/g, '') + '.com';
  if (domain.startsWith('http')) {
    try { domain = new URL(domain).hostname; } catch (e) { }
  }
  return domain;
}

function createCell(day, isOtherMonth, isToday) {
  const cell = document.createElement('div');
  cell.className = `calendar-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;

  const span = document.createElement('span');
  span.className = 'cell-date';
  span.innerText = day;
  cell.appendChild(span);

  // Check for subscriptions on this day (only for current month)
  if (!isOtherMonth) {
    const daySubs = subscriptions.filter(s => s.date === day);

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
          const icon = document.createElement('div');
          icon.className = `sub-icon ${sub.stopped ? 'dimmed' : ''}`;

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
      const daySubs = subscriptions.filter(s => s.date === day);
      if (daySubs.length > 0) {
        showDayDetails(day, daySubs);
      }
    }
  });

  // Tooltip listeners
  if (!isOtherMonth) {
    const daySubs = subscriptions.filter(s => s.date === day);
    if (daySubs.length > 0) {
      cell.addEventListener('mouseenter', (e) => showTooltip(e, daySubs));
      cell.addEventListener('mousemove', (e) => moveTooltip(e));
      cell.addEventListener('mouseleave', hideTooltip);
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
    return `
      <div class="tooltip-item ${s.stopped ? 'dimmed' : ''}">
        <span>${s.name}</span>
        <span class="tooltip-price">${displayPrice}</span>
      </div>
    `;
  }).join('');

  tooltip.classList.remove('hidden');
  moveTooltip(e);
}

function moveTooltip(e) {
  const x = e.clientX + 10;
  const y = e.clientY + 10;

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
  document.getElementById('detail-date-title').innerText = `${monthName} ${day}`;

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
    // Check for mixed currencies for smart total globally for consistent totals
    const uniqueCurrencies = new Set(subscriptions.map(s => s.currency || 'USD'));
    if (uniqueCurrencies.size > 1) {
      mathRates = await fetchExchangeRates(targetCurrency);
    }
  }

  let totalImpact = 0;
  const list = document.getElementById('detail-list');
  list.innerHTML = subs.map(s => {
    let domain = getDomain(s);
    const isStopped = s.stopped;

    // Use full price for the "Monthly Impact" list view in modals
    let itemPrice = s.price;
    const originalPriceStr = `${s.symbol || '$'}${itemPrice.toFixed(2)}`;
    let convertedMathPrice = itemPrice;
    let symbol = s.symbol || '$';
    let displayPrice = originalPriceStr;

    // Background math converted price
    if (mathRates && (s.currency || 'USD') !== targetCurrency) {
      convertedMathPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, mathRates);
    }

    // UI display converted price
    if (useAutoCurrency && displayRates && (s.currency || 'USD') !== targetCurrency) {
      const convertedDisplayPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, displayRates);
      symbol = targetSymbol || '$';
      displayPrice = `${originalPriceStr} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${symbol}${convertedDisplayPrice.toFixed(2)}`;
    }

    if (!isStopped) {
      totalImpact += convertedMathPrice;
    }

    return `
      <div class="detail-item-wrapper" id="sw-wrapper-${s.id}">
        <div class="swipe-actions-bg">
          <div class="swipe-action delete" onclick="deleteSubscription(${s.id}, event)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            CANCEL
          </div>
          <div class="swipe-action stop ${isStopped ? 'stopped-active' : ''}" onclick="stopSubscription(${s.id}, event)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              ${isStopped
        ? '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-5-8h10"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>'}
            </svg>
            ${isStopped ? 'STOPPED' : 'STOP'}
          </div>
        </div>
        <div class="detail-item ${isStopped ? 'dimmed' : ''}" data-id="${s.id}">
          <div class="detail-logo">
            <img src="https://icon.horse/icon/${domain}" style="width:100%; height:100%; object-fit:contain;">
          </div>
          <div class="detail-info">
            <span class="detail-name">${s.name}</span>
            <span class="detail-type">${s.type} plan</span>
          </div>
          <div class="detail-price" style="font-size: 0.85rem;">${displayPrice}</div>
        </div>
      </div>
    `;
  }).join('');

  // Choose symbol based on mathematical conversion
  let finalSymbol = '$';
  if (mathRates) {
    finalSymbol = targetSymbol;
  } else if (subs.length > 0) {
    finalSymbol = subs[0].symbol || '$';
  }

  // Calculate sums for the day
  let sumAll = 0;
  let sumStopped = 0;
  subs.forEach(s => {
    let p = s.price;
    if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
    sumAll += p;
    if (s.stopped) sumStopped += p;
  });
  const grandTotal = sumAll - sumStopped;

  const labelEl = document.querySelector('#detail-total-amount')?.previousElementSibling;
  const footTotal = document.querySelector('#detail-total-amount');

  if (sumStopped > 0) {
    if (labelEl) labelEl.innerHTML = `<span style="opacity:0.5">${finalSymbol}${sumAll.toFixed(2)}</span> - <span style="color:var(--accent-red)">${finalSymbol}${sumStopped.toFixed(2)}</span> = GRAND TOTAL:`;
  } else {
    if (labelEl) labelEl.innerText = "GRAND TOTAL FOR THIS DAY:";
  }

  if (footTotal) footTotal.innerText = `${finalSymbol}${grandTotal.toFixed(2)}`;

  dayDetailModal.classList.remove('hidden');
  attachSwipeEvents();
};

window.deleteSubscription = function (id, e) {
  if (e) e.stopPropagation();

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

window.stopSubscription = function (id, e) {
  if (e) e.stopPropagation();
  const sub = subscriptions.find(s => s.id === id);
  if (sub) {
    sub.stopped = !sub.stopped; // Toggle stopped state

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

function attachSwipeEvents() {
  const items = document.querySelectorAll('.detail-item');
  items.forEach(item => {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    const thresh = 40;
    const maxTranslateX = 120; // More generous reveal

    const onStart = (e) => {
      startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
      isDragging = true;
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

      const wrapper = item.parentElement;
      const del = wrapper.querySelector('.delete');
      const stp = wrapper.querySelector('.stop');

      const translate = Math.max(-maxTranslateX, Math.min(maxTranslateX, walk));

      // Fluid background reveal (better opacity curves)
      if (translate > 0) {
        del.style.opacity = Math.min(translate / 60, 1);
        stp.style.opacity = 0;
      } else {
        stp.style.opacity = Math.min(-translate / 60, 1);
        del.style.opacity = 0;
      }

      item.style.transform = `translateX(${translate}px)`;

      // Stop vertical scroll only when horizontal swipe is clear
      if (Math.abs(walk) > 10 && e.cancelable) {
        e.preventDefault();
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);

      const walk = currentX - startX;
      item.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
      const wrapper = item.parentElement;

      if (walk > thresh + 10) {
        item.style.transform = `translateX(${maxTranslateX}px)`;
      } else if (walk < -(thresh + 10)) {
        item.style.transform = `translateX(${-maxTranslateX}px)`;
      } else {
        item.style.transform = `translateX(0)`;
        wrapper.querySelector('.delete').style.opacity = 0;
        wrapper.querySelector('.stop').style.opacity = 0;
      }
    };

    item.addEventListener('touchstart', onStart);
    item.addEventListener('mousedown', onStart);
  });
}

async function updateStats() {
  // Main aggregate footer should only show ACTIVE monthly commitment
  const activeSubs = subscriptions.filter(s => !s.stopped);
  const settings = userProfile?.settings || {};
  let useAutoCurrency = settings.autoCurrency !== false;
  let targetCurrency = settings.currency || 'USD';

  // Override for USD Total mode
  if (settings.usdTotal) {
    useAutoCurrency = true;
    targetCurrency = 'USD';
  }

  let monthlyTotal = 0;
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

    monthlyTotal += price;
  });

  const activeCount = activeSubs.length;

  subCountEl.innerText = subscriptions.length;
  newCountEl.innerText = activeCount;

  // Sync label for clarity
  const footerLabelEl = document.querySelector('.monthly-total .label');
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
});

document.getElementById('next-month').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderHeader();
  renderCalendar();
});

document.getElementById('today-btn').addEventListener('click', () => {
  currentDate = new Date();
  renderHeader();
  renderCalendar();
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
    document.getElementById('sub-type').value = btn.dataset.value;
  });
});

subForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const newSub = {
    // Add a random integer offset to prevent double-click millisecond collisions
    id: Date.now() + Math.floor(Math.random() * 10000),
    name: document.getElementById('sub-name').value,
    price: parseFloat(document.getElementById('sub-price').value),
    date: parseInt(document.getElementById('sub-date').value),
    type: document.getElementById('sub-type').value,
    domain: document.getElementById('sub-domain').value,
    currency: document.getElementById('sub-currency').value,
    symbol: document.getElementById('sub-currency-symbol').value,
    color: '--accent-blue' // Default for new ones
  };

  subscriptions.push(newSub);

  // Update UI Instantly
  renderCalendar();
  addModal.classList.add('hidden');

  // Background sync and ID replacement
  saveToSupabase(newSub).then(savedSub => {
    if (savedSub && savedSub.id) {
      // Find the temporary sub we just pushed and update its ID to the real DB ID
      const index = subscriptions.findIndex(s => s.id === newSub.id);
      if (index !== -1) {
        subscriptions[index].id = savedSub.id;
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      }
    }
  });

  // Reset form and currency
  subForm.reset();
  selectCurrency('USD', '$');
  updatePlatformIcon(null);
  document.getElementById('sub-domain').value = '';
});

// --- Monthly Breakdown Modal ---
const totalAmountBtn = document.getElementById('total-amount');
const monthlyTotalContainer = document.querySelector('.monthly-total');

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
  const activeSubs = subscriptions.filter(s => !s.stopped);
  let totalMonthlyImpact = 0;

  activeSubs.forEach(s => {
    // Average monthly impact (Yearly / 12)
    // Use full price impact (no averaging for yearly subscriptions)
    let price = s.price;
    if (mathRates) {
      price = getConvertedPrice(price, s.currency || 'USD', targetCurrency, mathRates);
    }
    totalMonthlyImpact += price;
  });

  // 4. Determine Symbol
  let finalSymbol = '$';
  if (mathRates) {
    const targetCurrObj = CURRENCIES.find(c => c.code === targetCurrency) || CURRENCIES[0];
    finalSymbol = targetCurrObj.symbol || '$';
  } else if (activeSubs.length > 0) {
    finalSymbol = activeSubs[0].symbol || '$';
  }

  // 5. Update UI
  statsContainer.innerHTML = `
     <div style="flex: 1; text-align: center;">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${activeSubs.length}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Active</span>
     </div>
     <div style="flex: 1; text-align: center; border-left: 1px solid var(--border-color);">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${finalSymbol}${totalMonthlyImpact.toFixed(2)}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Per Month</span>
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
          safeSetLocalStorage(`profile_${currentUser.id} `, JSON.stringify(userProfile));
        } else {
          console.warn('[Auth] No profile in Supabase, checking local cache...');
          const saved = localStorage.getItem(`profile_${currentUser.id} `);
          if (saved) userProfile = JSON.parse(saved);
        }

        // Apply theme immediately after profile is loaded
        if (userProfile?.settings?.theme) {
          applyTheme(userProfile.settings.theme === 'dark');
        }

        // Ensure UI reflects latest settings
        updateStats();
        updateTime();
      } catch (err) {
        console.error('[Auth] Profile fetch failed/timed out:', err.message);
        const saved = localStorage.getItem(`profile_${currentUser.id} `);
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
        filter: `id = eq.${currentUser.id} `
      }, payload => {
        if (payload.new) {
          console.log('[Realtime] Profile update received.');
          userProfile = payload.new;
          safeSetLocalStorage(`profile_${currentUser.id} `, JSON.stringify(userProfile));
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
            updateStats();
            updateTime();
          }
        }
      })
      .subscribe();

  } else {
    console.log('[Auth] No active session.');
    currentUser = null;
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
  document.getElementById(`onboard - step - ${step} `).classList.remove('hidden');
  // Update dots
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById(`dot - ${i} `);
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
    localStorage.setItem(`profile_${currentUser.id} `, JSON.stringify(userProfile));

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

  const activeCount = subscriptions.filter(s => !s.stopped).length;
  const stoppedCount = subscriptions.filter(s => s.stopped).length;
  const totalCount = subscriptions.length;

  summary.innerHTML = `
    <span class="${filter === 'all' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('all')">${totalCount} TOTAL</span> /
    <span class="${filter === 'active' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('active')">${activeCount} ACTIVE</span> /
    <span class="${filter === 'stopped' ? 'filter-active' : ''}" onclick="showMonthlyBreakdown('stopped')">${stoppedCount} STOPPED</span>
  `;

  let filtered = [...subscriptions];
  if (filter === 'active') filtered = subscriptions.filter(s => !s.stopped);
  if (filter === 'stopped') filtered = subscriptions.filter(s => s.stopped);

  // Sort by billing date
  filtered.sort((a, b) => a.date - b.date);

  let totalImpact = 0;
  list.innerHTML = filtered.map(s => {
    let domain = getDomain(s);
    const isStopped = s.stopped;

    // Use full price for modal lists, not averaged commitment
    let itemPrice = s.price;
    const originalPriceStr = `${s.symbol || '$'}${itemPrice.toFixed(2)} `;
    let convertedMathPrice = itemPrice; // Used for the sum
    let symbol = s.symbol || '$';
    let displayPrice = originalPriceStr; // Used for UI

    if (mathRates && (s.currency || 'USD') !== targetCurrency) {
      convertedMathPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, mathRates);
    }

    if (useAutoCurrency && displayRates && (s.currency || 'USD') !== targetCurrency) {
      const convertedDisplayPrice = getConvertedPrice(itemPrice, s.currency || 'USD', targetCurrency, displayRates);
      symbol = targetSymbol || '$';
      displayPrice = `${originalPriceStr} <span style="opacity: 0.5; margin: 0 5px;">→</span> ${symbol}${convertedDisplayPrice.toFixed(2)} `;
    }

    if (!isStopped) {
      totalImpact += convertedMathPrice;
    }

    return `
      <div class="detail-item-wrapper" id="sw-wrapper-${s.id}">
        <div class="swipe-actions-bg">
          <div class="swipe-action delete" onclick="deleteSubscription(${s.id}, event)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            CANCEL
          </div>
          <div class="swipe-action stop ${isStopped ? 'stopped-active' : ''}" onclick="stopSubscription(${s.id}, event)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              ${isStopped
        ? '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-5-8h10"/>'
        : '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>'}
            </svg>
            ${isStopped ? 'STOPPED' : 'STOP'}
          </div>
        </div>
        <div class="detail-item ${isStopped ? 'dimmed' : ''}" data-id="${s.id}">
          <div class="detail-logo">
            <img src="https://icon.horse/icon/${domain}" style="width:100%; height:100%; object-fit:contain;">
          </div>
          <div class="detail-info">
            <span class="detail-name">${s.name}</span>
            <span class="detail-type" style="display:flex; align-items:center; gap:8px;">
              DUE ON ${s.date}${s.date === 1 ? 'st' : s.date === 2 ? 'nd' : s.date === 3 ? 'rd' : 'th'}
              <span class="status-badge ${s.stopped ? 'status-stopped' : 'status-active'}">
                ${s.stopped ? 'STOPPED' : 'ACTIVE'}
              </span>
            </span>
          </div>
          <div class="detail-price" style="font-size: 0.85rem;">${displayPrice}</div>
        </div>
      </div>
    `;
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
    subscriptions.forEach(s => {
      let p = s.price;
      if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
      sumAll += p;
      if (s.stopped) sumStopped += p;
    });
    const grandTotal = sumAll - sumStopped;

    if (labelEl) labelEl.innerHTML = `<span style="opacity:0.5">${finalSymbol}${sumAll.toFixed(2)}</span> - <span style="color:var(--accent-red)">${finalSymbol}${sumStopped.toFixed(2)}</span> = GRAND TOTAL: `;
    if (amountEl) amountEl.innerText = `${finalSymbol}${grandTotal.toFixed(2)} `;
  } else if (filter === 'stopped') {
    const sumStopped = filtered.reduce((acc, s) => {
      let p = s.price;
      if (mathRates) p = getConvertedPrice(p, s.currency || 'USD', targetCurrency, mathRates);
      return acc + p;
    }, 0);
    if (labelEl) labelEl.innerText = "TOTAL SAVED:";
    if (amountEl) amountEl.innerText = `${finalSymbol}${sumStopped.toFixed(2)} `;
  } else {
    // Active only
    if (labelEl) labelEl.innerText = "ACTIVE TOTAL:";
    if (amountEl) amountEl.innerText = `${finalSymbol}${totalImpact.toFixed(2)} `;
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

  appSettingsModal.classList.remove('hidden');
  profileModal.classList.add('hidden');
};

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
    currency: prefCurrencyHidden.value
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
    safeSetLocalStorage(`profile_${currentUser.id} `, JSON.stringify(userProfile));

    // Apply theme immediately
    applyTheme(newSettings.theme === 'dark');

    // Update time immediately
    updateTime();

    // Refresh totals with new settings
    updateStats();

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
closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

appSettingsBtn.addEventListener('click', () => window.showAppSettings());
closeAppSettingsBtn.addEventListener('click', () => appSettingsModal.classList.add('hidden'));

// Avatar Selection Logic
document.getElementById('settings-avatar-preview').addEventListener('click', () => {
  profilePicModal.classList.remove('hidden');

  // Highlight currently selected free pic if applicable
  if (userProfile?.avatar_url) {
    document.querySelectorAll('.free-pic-option').forEach(el => {
      el.style.borderColor = el.dataset.url === userProfile.avatar_url ? 'var(--accent-blue)' : 'transparent';
    });
  }
});

closeProfilePic.addEventListener('click', () => profilePicModal.classList.add('hidden'));

uploadCustomPic.addEventListener('click', () => {
  avatarUpload.click();
  profilePicModal.classList.add('hidden');
});

document.querySelectorAll('.free-pic-option').forEach(option => {
  option.addEventListener('click', () => {
    const url = option.dataset.url;
    userProfile.avatar_url = url;
    updateProfileUI();
    profilePicModal.classList.add('hidden');

    // Immediate feedback: highlight selection
    document.querySelectorAll('.free-pic-option').forEach(el => el.style.borderColor = 'transparent');
    option.style.borderColor = 'var(--accent-blue)';
  });
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

    localStorage.setItem(`profile_${currentUser.id} `, JSON.stringify(userProfile));

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

// Initial Render
updateTime();
setInterval(updateTime, 30000); // Update every 30s
renderHeader();
loadSubscriptions(); // Fetch from Supabase
