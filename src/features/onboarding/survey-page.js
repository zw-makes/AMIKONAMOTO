import { HapticsService } from '../../features/haptics/haptics.js';
/**
 * Initializes the onboarding survey page logic.
 */
export async function initSurveyPage() {
  const welcomeView = document.getElementById('welcome-view');
  const authScreen = document.getElementById('auth-screen');
  
  if (!welcomeView || !authScreen) return;

  const surveyView = document.createElement('div');
  surveyView.id = 'survey-view';
  surveyView.className = 'survey-page hidden';
  
  surveyView.innerHTML = `
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
      <div class="shooting-stars">
        <div class="shooting-star ss-1"></div>
        <div class="shooting-star ss-2"></div>
        <div class="shooting-star ss-3"></div>
        <div class="shooting-star ss-4"></div>
      </div>
    </div>

    <button id="survey-skip-btn" class="survey-skip-btn">Skip</button>

    <div class="survey-container">
      <div class="survey-text-wrapper" id="survey-text-box"></div>
      <div class="survey-footer" id="survey-bottom-bar">
        <img src="/sublify-logo.png" class="landing-logo-img" alt="Sublify Logo">
        <button id="survey-next-btn" class="survey-btn">don't believe?</button>
      </div>
    </div>
  `;

  authScreen.appendChild(surveyView);

  // Setup Next button logic
  const nextBtn = document.getElementById('survey-next-btn');
  nextBtn.addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    // Move to Believe View instead of direct login
    surveyView.classList.add('hidden');
    const believeView = document.getElementById('believe-view');
    if (believeView) believeView.classList.remove('hidden');
  });

  // Setup Skip button logic
  const skipBtn = document.getElementById('survey-skip-btn');
  skipBtn.addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    surveyView.classList.add('hidden');
    
    // Dynamically import or call showAuthPage from auth-view.js
    import('../../features/onboarding/auth-view.js').then(m => {
        if (m.showAuthPage) m.showAuthPage();
    });
  });


  window.triggerSurveyAnimation = async () => {
    // 1. Start the narrative first
    await updateConvertedAmountAndAnimate();
    
    // 2. Explicitly trigger the footer after a slight delay
    setTimeout(() => {
       const footer = document.getElementById('survey-bottom-bar');
       if (footer) footer.classList.add('reveal');
    }, 2000); 
  };
}

async function updateConvertedAmountAndAnimate() {
  const container = document.getElementById('survey-text-box');
  if (!container) return;
  container.innerHTML = '';

  const rawINR = 120000;
  let convertedStr = '₹1,20,000+';

  try {
    let userCurrency = 'INR';
    if (window.userProfile?.settings?.currency) userCurrency = window.userProfile.settings.currency;
    else {
      const locale = navigator.language || 'en-IN';
      if (locale.includes('US')) userCurrency = 'USD';
      else if (locale.includes('GB')) userCurrency = 'GBP';
      else if (locale.includes('EU')) userCurrency = 'EUR';
    }
    const fetchRates = window.fetchExchangeRates || (async (base) => {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await res.json();
      return data.rates;
    });
    const rates = await fetchRates('INR');
    if (rates && rates[userCurrency]) {
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency, maximumFractionDigits: 0 });
      convertedStr = `${formatter.format(rawINR * rates[userCurrency])}+`;
    }
  } catch (err) {}

  const fullText = `In a recent survey, we discovered that on average, people lose ${convertedStr} every year to forgotten subscriptions. For content creators and business owners, the bleeding is even worse — multiple tools silently draining your growth budget. Stop the leak. Manage smarter. Save real money with Sublify.`;

  const words = fullText.split(' ');
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.innerText = word + ' ';
    span.className = 'word-fade';
    const delay = index * 0.08;
    span.style.animationDelay = `${delay}s`;
    
    // Trigger haptic for every word appearance
    const hapticSvc = window.HapticsService || HapticsService;
    if (hapticSvc) {
       setTimeout(() => {
         hapticSvc.light(); 
       }, delay * 1000);
    }
    
    // Highlight the money as a special 3D block
    if (word.includes(convertedStr.replace(/[^0-9]/g, '')) || word.includes(convertedStr)) {
      span.classList.add('highlight-money');
    }
    
    container.appendChild(span);
  });
}
