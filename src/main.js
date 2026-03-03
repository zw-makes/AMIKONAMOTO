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

// --- State Management ---
let currentUser = null;
let currentDate = new Date();
let currentStatsFilter = 'all';
let subscriptions = [];
const DEFAULT_SUBS = [
  { name: 'Netflix', price: 15.99, date: 2, type: 'monthly', color: '--accent-pink' },
  { name: 'Adobe', price: 52.99, date: 7, type: 'monthly', color: '--accent-orange' },
  { name: 'Apple', price: 9.99, date: 12, type: 'monthly', color: '--text-primary' },
  { name: 'Figma', price: 15.00, date: 28, type: 'monthly', color: '--accent-purple' },
  { name: 'Slack', price: 12.50, date: 25, type: 'yearly', color: '--accent-yellow' },
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

let isSignUp = false;

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

// --- Functions ---

function updateTime() {
  const timeEl = document.getElementById('current-time');
  if (!timeEl) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  timeEl.innerText = timeStr;
}

async function loadSubscriptions() {
  if (!currentUser) return;

  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', currentUser.id);

    if (error) throw error;

    if (data && data.length > 0) {
      subscriptions = data;
    } else {
      // If new user, create their first demo subs
      subscriptions = DEFAULT_SUBS.map(s => ({
        ...s,
        id: Date.now() + Math.random(),
        user_id: currentUser.id
      }));
      for (const sub of subscriptions) {
        await saveToSupabase(sub);
      }
    }
  } catch (err) {
    console.error('Error loading subscriptions:', err.message);
    subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];
  }
  renderCalendar();
}

async function saveToSupabase(sub) {
  if (!currentUser) return;
  try {
    const subToSave = { ...sub, user_id: currentUser.id };
    const { error } = await supabase.from('subscriptions').upsert(subToSave);
    if (error) throw error;
  } catch (err) {
    console.error('Error saving to Supabase:', err.message);
  }
  localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
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

function showTooltip(e, subs) {
  tooltip.innerHTML = subs.map(s => `
    <div class="tooltip-item ${s.stopped ? 'dimmed' : ''}">
      <span>${s.name}</span>
      <span class="tooltip-price">${s.symbol || '$'}${s.price.toFixed(2)}</span>
    </div>
  `).join('');

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

function showDayDetails(day, subs) {
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  document.getElementById('detail-date-title').innerText = `${monthName} ${day}`;

  const list = document.getElementById('detail-list');
  list.innerHTML = subs.map(s => {
    let domain = getDomain(s);

    const isStopped = s.stopped;
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
          <div class="detail-price">${s.symbol || '$'}${s.price.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');

  dayDetailModal.classList.remove('hidden');
  attachSwipeEvents();
}

// Global swipe actions
window.deleteSubscription = function (id, e) {
  if (e) e.stopPropagation();
  subscriptions = subscriptions.filter(s => s.id !== id);

  // Background sync (Optimistic)
  removeFromSupabase(id);

  renderCalendar();

  // Refresh whichever view is open
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

function updateStats() {
  // Main aggregate footer should only show ACTIVE monthly commitment
  const activeSubs = subscriptions.filter(s => !s.stopped);
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    return sum + (s.type === 'monthly' ? s.price : s.price / 12);
  }, 0);

  const activeCount = activeSubs.length;

  subCountEl.innerText = subscriptions.length;
  // Previously hardcoded "NEW", now showing actual "ACTIVE" count
  newCountEl.innerText = activeCount;
  const symbol = activeSubs.length > 0 ? (activeSubs[0].symbol || '$') : '$';
  totalAmountEl.innerText = `${symbol}${monthlyTotal.toFixed(2)}`;
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
    id: Date.now(),
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

  // Background sync (No await)
  saveToSupabase(newSub);

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

window.showProfileModal = function () {
  const statsContainer = document.getElementById('profile-stats-container');
  if (!statsContainer) return;

  const email = currentUser?.email || 'User';
  const name = email.split('@')[0];

  document.querySelector('.profile-info h4').innerText = name.toUpperCase();
  document.querySelector('.profile-info p').innerText = email;

  const activeSubs = subscriptions.filter(s => !s.stopped);
  const totalMonthlyImpact = activeSubs.reduce((sum, s) => {
    return sum + (s.type === 'monthly' ? s.price : s.price / 12);
  }, 0);

  const symbol = subscriptions.length > 0 ? (subscriptions[0].symbol || '$') : '$';

  statsContainer.innerHTML = `
     <div style="flex: 1; text-align: center;">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${subscriptions.length}</span>
        <span style="font-size: 0.65rem; color: var(--text-secondary); text-transform: uppercase;">Platforms</span>
     </div>
     <div style="flex: 1; text-align: center; border-left: 1px solid var(--border-color);">
        <span style="display: block; font-size: 1.1rem; font-weight: 700;">${symbol}${totalMonthlyImpact.toFixed(2)}</span>
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
    authSubmitBtn.innerText = isSignUp ? 'Sign Up' : 'Continue';
    toggleAuth.innerText = isSignUp ? 'Login' : 'Sign Up';
    document.querySelector('.auth-toggle').firstChild.textContent = isSignUp ? 'Already have an account? ' : "Don't have an account? ";
  });
}

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('hidden');
  authSubmitBtn.disabled = true;
  authSubmitBtn.innerText = 'Verifying...';

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
    authSubmitBtn.innerText = isSignUp ? 'Sign Up' : 'Continue';
  }
});

// Logout logic
document.querySelector('.profile-actions button:last-child').addEventListener('click', async () => {
  await supabase.auth.signOut();
  profileModal.classList.add('hidden');
});

// Auth State Listener
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    currentUser = session.user;
    authScreen.classList.add('hidden');
    loadSubscriptions();
  } else {
    currentUser = null;
    authScreen.classList.remove('hidden');
    welcomeView.classList.remove('hidden');
    loginView.classList.add('hidden');
    subscriptions = [];
    renderCalendar();
  }
});

window.showMonthlyBreakdown = function (filter = 'all') {
  currentStatsFilter = filter;
  const modal = document.getElementById('stats-modal');
  const summary = document.getElementById('stats-summary');
  const list = document.getElementById('stats-list');
  const statsTotalAmount = document.getElementById('stats-total-amount');

  if (!modal || !summary || !list || !statsTotalAmount) return;

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

  list.innerHTML = filtered.map(s => {
    let domain = getDomain(s);
    const isStopped = s.stopped;

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
          <div class="detail-price">${s.symbol || '$'}${s.price.toFixed(2)}</div>
        </div>
      </div>
    `;
  }).join('');

  // Calculate "Monthly Impact" total for the current filtered set
  const totalImpact = filtered.reduce((acc, s) => {
    return acc + (s.type === 'monthly' ? s.price : s.price / 12);
  }, 0);

  // Use the currency symbol of the first item, or fallback to $
  const currencySymbol = filtered.length > 0 ? (filtered[0].symbol || '$') : '$';
  statsTotalAmount.innerText = `${currencySymbol}${totalImpact.toFixed(2)}`;

  modal.classList.remove('hidden');
  attachSwipeEvents();
};

// Initial Render
updateTime();
setInterval(updateTime, 30000); // Update every 30s
renderHeader();
loadSubscriptions(); // Fetch from Supabase
