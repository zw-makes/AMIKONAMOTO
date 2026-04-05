import { HapticsService } from '../../features/haptics/haptics.js';
import { animateThanosSnap } from '../ai-analyst/thanos-snap.js';
import { showAuthPage } from './auth-view.js';

const SUBSCRIPTION_DATA = [
  {
    category: "Streaming & Entertainment",
    subs: [
      { name: "Netflix", price: 649, domain: "netflix.com" },
      { name: "Spotify", price: 119, domain: "spotify.com" },
      { name: "YouTube Premium", price: 139, domain: "youtube.com" },
      { name: "Amazon Prime", price: 179, domain: "amazon.com" },
      { name: "Disney+ Hotstar", price: 299, domain: "hotstar.com" },
      { name: "Apple TV+", price: 99, domain: "apple.com" }
    ]
  },
  {
    category: "Productivity & Storage",
    subs: [
      { name: "Google One", price: 130, domain: "google.com" },
      { name: "iCloud+", price: 75, domain: "icloud.com" },
      { name: "Microsoft 365", price: 620, domain: "microsoft.com" },
      { name: "Notion Plus", price: 1650, domain: "notion.so" },
      { name: "Dropbox Plus", price: 875, domain: "dropbox.com" }
    ]
  },
  {
    category: "Creative & Design",
    subs: [
      { name: "Adobe Creative Cloud", price: 4230, domain: "adobe.com" },
      { name: "Canva Pro", price: 499, domain: "canva.com" },
      { name: "Figma Pro", price: 1130, domain: "figma.com" }
    ]
  },
  {
    category: "Business & Marketing",
    subs: [
      { name: "Slack Pro", price: 525, domain: "slack.com" },
      { name: "Zoom Pro", price: 1300, domain: "zoom.us" },
      { name: "Mailchimp", price: 770, domain: "mailchimp.com" },
      { name: "HubSpot Starter", price: 1300, domain: "hubspot.com" },
      { name: "Shopify Basic", price: 1994, domain: "shopify.com" }
    ]
  },
  {
    category: "AI Tools",
    subs: [
      { name: "ChatGPT Plus", price: 1950, domain: "openai.com" },
      { name: "Claude Pro", price: 1950, domain: "anthropic.com" },
      { name: "Midjourney", price: 830, domain: "midjourney.com" },
      { name: "Grammarly Premium", price: 700, domain: "grammarly.com" }
    ]
  },
  {
    category: "Developer & Tech",
    subs: [
      { name: "GitHub Copilot", price: 830, domain: "github.com" },
      { name: "AWS", price: 830, domain: "aws.amazon.com" },
      { name: "Linear", price: 670, domain: "linear.app" }
    ]
  },
  {
    category: "News & Learning",
    subs: [
      { name: "Bloomberg", price: 2900, domain: "bloomberg.com" },
      { name: "Coursera Plus", price: 2490, domain: "coursera.org" },
      { name: "Medium", price: 350, domain: "medium.com" }
    ]
  },
  {
    category: "Health & Lifestyle",
    subs: [
      { name: "Cult.fit", price: 999, domain: "cult.fit" }
    ]
  }
];

let selectedSubs = new Set();
let totalMonthly = 0;
let userCurrency = 'INR';
let userRate = 1.0;

export async function initBelievePage() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  // 1. Determine User Currency (Mirror Survey Page Logic)
  let userCurrency = 'INR';
  const profile = window.userProfile || {};
  if (profile.settings?.currency) userCurrency = profile.settings.currency;
  else {
    const locale = navigator.language || 'en-IN';
    if (locale.includes('US')) userCurrency = 'USD';
    else if (locale.includes('GB')) userCurrency = 'GBP';
    else if (locale.includes('EU') || locale.includes('FR') || locale.includes('DE') || locale.includes('ES') || locale.includes('IT')) userCurrency = 'EUR';
  }

  // Define global variables for sync
  window.onboardingCurrency = userCurrency;
  window.onboardingRate = 1.0;

  // 2. Fetch Rates
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/INR');
    const data = await response.json();
    window.onboardingRate = data.rates[userCurrency] || 1.0;
  } catch (e) {
    window.onboardingRate = 1.0;
  }

  const believeView = document.createElement('div');
  believeView.id = 'believe-view';
  believeView.className = 'believe-page hidden';

  let sectionsHTML = '';
  SUBSCRIPTION_DATA.forEach(category => {
    let subsHTML = '';
    category.subs.forEach(sub => {
      const logoUrl = window.getLogoUrl ? window.getLogoUrl(sub.domain) : '';
      const localPrice = sub.price * window.onboardingRate;
      const formattedPrice = formatCurrency(localPrice, window.onboardingCurrency);

      subsHTML += `
        <div class="sub-card" data-raw-price="${sub.price}" data-id="${sub.name.replace(/\s+/g, '-')}">
          <div class="sub-card-header">
            <div class="sub-icon-circle">
              <img src="${logoUrl}" alt="${sub.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div class="sub-icon-fallback" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); font-weight: 700; font-size: 1.2rem; font-family: 'Outfit', sans-serif;">
                ${sub.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div class="sub-name">${sub.name}</div>
          </div>
          <div class="sub-price-label">${formattedPrice}/mo</div>
        </div>
      `;
    });

    sectionsHTML += `
      <div class="believe-category-section">
        <div class="category-title">${category.category}</div>
        <div class="subs-grid">${subsHTML}</div>
      </div>
    `;
  });

  believeView.innerHTML = `
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>
    
    <div class="believe-header" id="believe-header-snap">
      <h2>Tap what you're subscribed to</h2>
      <p>The <span class="glow-word">TOTAL</span> might <span class="glow-word">SURPRISE</span> you</p>
    </div>

    <div class="believe-scroll-area" id="believe-scroll-snap">
      ${sectionsHTML}
    </div>

    <!-- Hidden Yearly Result View (Revealed after Snap) -->
    <div id="believe-result-view" class="believe-result-view hidden">
      <div class="result-main-area">
        <div class="result-label" id="result-label-box"></div>
        <div class="result-value" id="yearly-total-result">₹0</div>
        <div class="result-subtext">EVERY YEAR</div>
      </div>
      
      <div class="result-footer-lockup" id="believe-result-footer">
        <img src="/sublify-logo.png" class="landing-logo-img" alt="Sublify Logo">
        <div class="privacy-note">Your data is end-to-end encrypted and never used to train AI models.</div>
        <button id="believe-auth-btn" class="believe-next-btn">Start Free. AI Handles the Rest.</button>
      </div>
    </div>

    <div class="believe-footer" id="believe-footer-snap">
      <button id="believe-next-btn" class="believe-next-btn">None of These</button>
    </div>
  `;

  authScreen.appendChild(believeView);

  // Interaction logic
  const nextBtn = document.getElementById('believe-next-btn');

  function updateNextBtnText() {
    if (selectedSubs.size === 0) {
      nextBtn.innerText = 'None of These';
    } else {
      nextBtn.innerText = 'Show my total';
    }
  }

  believeView.querySelectorAll('.sub-card').forEach(card => {
    card.addEventListener('click', () => {
      const rawPrice = parseInt(card.dataset.rawPrice);
      const id = card.dataset.id;

      if (selectedSubs.has(id)) {
        selectedSubs.delete(id);
        totalMonthly -= (rawPrice * window.onboardingRate);
        card.classList.remove('selected');
        if (window.HapticsService) window.HapticsService.light();
      } else {
        selectedSubs.add(id);
        totalMonthly += (rawPrice * window.onboardingRate);
        card.classList.add('selected');
        if (window.HapticsService) window.HapticsService.medium();
      }

      updateNextBtnText();
      updateTotalDisplay();
    });
  });

  nextBtn.addEventListener('click', async () => {
    if (window.HapticsService) window.HapticsService.success();
    
    if (selectedSubs.size === 0) {
       // Just skip directly to auth
       believeView.classList.add('hidden');
       if (window.showAuthPage) window.showAuthPage();
       else showAuthPage();
    } else {
       await handleThanosSnapSequence();
    }
  });
}

async function handleThanosSnapSequence() {
  const header = document.getElementById('believe-header-snap');
  const scrollArea = document.getElementById('believe-scroll-snap');
  const footer = document.getElementById('believe-footer-snap');
  const resultView = document.getElementById('believe-result-view');
  const yearlyEl = document.getElementById('yearly-total-result');
  const authBtn = document.getElementById('believe-auth-btn');

  // 1. Snap existing UI away
  // Run snaps in parallel
  Promise.all([
    animateThanosSnap(header),
    animateThanosSnap(scrollArea),
    animateThanosSnap(footer)
  ]).then(() => {
    header.classList.add('hidden');
    scrollArea.classList.add('hidden');
    footer.classList.add('hidden');
  });

  // 2. Prepare Result logic
  const yearlyTotal = totalMonthly * 12;
  const smartHeadline = getSmartHeadline(yearlyTotal / window.onboardingRate); // Compare logic stays on INR terms for accurate scaling
  
  // 3. Reveal and Animate Result
  setTimeout(() => {
    resultView.classList.remove('hidden');
    resultView.classList.add('fade-in');
    
    // Counting animation (Delayed slightly to let text start)
    setTimeout(() => animateYearlyTotal(yearlyEl, yearlyTotal, authBtn, window.onboardingCurrency), 500);

    // Dynamic Narrative Animation (Word by word)
    animateResultText(smartHeadline);
  }, 1000);

  // 4. Final Handoff to Auth
  authBtn.addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    const believeView = document.getElementById('believe-view');
    believeView.classList.add('hidden');
    
    // Instead of showing the old container, show the NEW premium auth view
    if (window.showAuthPage) window.showAuthPage();
    else showAuthPage();
  });
}

async function animateResultText(text) {
  const container = document.getElementById('result-label-box');
  if (!container) return;
  container.innerHTML = '';

  const words = text.split(' ');
  const hapticSvc = window.HapticsService || HapticsService;

  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.innerText = word + ' ';
    span.className = 'word-fade';
    const delay = index * 0.1; // Slightly slower for impact
    span.style.animationDelay = `${delay}s`;
    
    if (hapticSvc) {
      setTimeout(() => hapticSvc.light(), delay * 1000);
    }
    
    container.appendChild(span);
  });
}

function animateYearlyTotal(yearlyEl, yearlyTotal, authBtn, currency) {
  let current = 0;
  const duration = 2500;
  const startTime = performance.now();
  const hapticSvc = window.HapticsService || HapticsService;

  function updateCounter(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    
    const val = ease * yearlyTotal;
    yearlyEl.innerText = formatCurrency(val, currency);

    if (hapticSvc && Math.random() > 0.9) hapticSvc.selection();

    if (progress < 1) {
      requestAnimationFrame(updateCounter);
    } else {
      if (hapticSvc) hapticSvc.medium();
      const footerLockup = document.getElementById('believe-result-footer');
      if (footerLockup) {
        footerLockup.style.transition = 'opacity 1s ease, transform 1s ease';
        footerLockup.style.opacity = '1';
        footerLockup.style.transform = 'translateY(0)';
      }
    }
  }
  requestAnimationFrame(updateCounter);
}

function formatCurrency(val, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  } catch(e) {
    return `${currency} ${Math.floor(val).toLocaleString()}`;
  }
}

function getSmartHeadline(total) {
  if (total <= 20000) {
    return "Not bad. But that's still a weekend trip to Goa every year.";
  } else if (total <= 50000) {
    return "That's a brand new iPhone SE. Just sitting in your subscriptions.";
  } else if (total <= 80000) {
    return "You could've done a solo Europe trip. Every. Single. Year.";
  } else if (total <= 120000) {
    return "That's a two-week international vacation — vanishing silently every year.";
  } else if (total <= 200000) {
    return "You're paying someone's full year college fees. In subscriptions.";
  } else {
    return "That's a down payment on a car. Are you even using all of these?";
  }
}

function updateTotalDisplay() {
  // Purposefully empty as requested - it's a surprise!
}
