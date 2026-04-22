import { supabase } from '../../supabase.js';
import { showEmailAuthPage } from './email-auth.js';

const TAGLINES = [
  "Cancel what you don't need. Keep what you love.",
  "The average person wastes ₹40,000 a year on unused subscriptions.",
  "Your bank statement has secrets. We'll find them.",
  "One dashboard. Zero surprises.",
  "Smarter spending starts here.",
  "You work hard. Stop wasting it on forgotten subscriptions."
];

let currentTagIndex = 0;
let taglineTimer = null;

export function initAuthPage() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  // Create the new structure
  const authView = document.createElement('div');
  authView.id = 'auth-view-new';
  authView.className = 'auth-page hidden';

  authView.innerHTML = `
    <!-- Space BG Shared -->
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <div class="auth-branding">
      <img src="/sublify-logo.png" class="auth-logo-img" alt="Sublify Logo">
      
      <div class="auth-tagline-container">
        <p id="auth-rotating-tagline" class="auth-tagline"></p>
      </div>
    </div>

    <div class="auth-options">
      <button class="social-btn google">
        <img src="/logos/google-brand.png" alt="Google">
        Continue with Google
      </button>

      <button class="social-btn apple">
        <img src="/logos/apple-brand.svg" alt="Apple">
        Continue with Apple
      </button>

      <div class="auth-divider">
        <span>OR</span>
      </div>

      <button id="auth-email-btn-legacy" class="social-btn email-btn">
        Continue with Email
      </button>

      <p class="email-link">Don't have an account? <span id="auth-signup-toggle">Sign Up</span></p>
    </div>
  `;

  authScreen.appendChild(authView);

  // Connect Google Auth
  const googleBtn = authView.querySelector('.social-btn.google');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
       if (window.HapticsService) window.HapticsService.light();

       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'google',
         options: {
           redirectTo: 'com.amikonamoto.app://',
           scopes: 'https://www.googleapis.com/auth/gmail.readonly'
         }
       });

       if (error) {
         console.error('[OAuth] Google Error:', error.message);
         if (window.showAuthErrorOnButton) window.showAuthErrorOnButton(error.message);
       }
    });
  }

  // Connect Apple Auth
  const appleBtn = authView.querySelector('.social-btn.apple');
  if (appleBtn) {
    appleBtn.addEventListener('click', async () => {
       if (window.HapticsService) window.HapticsService.light();
       
       const { error } = await supabase.auth.signInWithOAuth({
         provider: 'apple',
         options: {
           redirectTo: 'com.amikonamoto.app://'
         }
       });

       if (error) {
         console.error('[OAuth] Apple Error:', error.message);
         if (window.showAuthErrorOnButton) window.showAuthErrorOnButton(error.message);
       }
    });
  }

  // Connect new email auth
  document.getElementById('auth-email-btn-legacy').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.light();
    if (window.showEmailAuthPage) window.showEmailAuthPage();
    else showEmailAuthPage();
    authView.classList.add('hidden');
  });

  // Connect Sign Up toggle
  document.getElementById('auth-signup-toggle').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.light();
    
    // Explicitly show the signup mode
    if (window.showEmailAuthPage) window.showEmailAuthPage('signup');
    else showEmailAuthPage('signup');
    
    authView.classList.add('hidden');
  });


  // Cycle taglines when revealed
  startTaglineRotation();
}

function startTaglineRotation() {
  const el = document.getElementById('auth-rotating-tagline');
  if (!el) return;

  if (taglineTimer) clearInterval(taglineTimer);

  function animateWords(text) {
    el.innerHTML = '';
    const words = text.split(' ');
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.innerText = word + (i < words.length - 1 ? ' ' : '');
      span.className = 'word-fade';
      span.style.animationDelay = `${i * 0.1}s`;
      el.appendChild(span);
    });
  }

  function update() {
    // Phase 1: Inverted Exit Animation (Drift out to right)
    const spans = el.querySelectorAll('.word-fade');
    spans.forEach((s, i) => {
       s.style.transition = `all 0.4s cubic-bezier(0.19, 1, 0.22, 1) ${i * 0.05}s`;
       s.style.opacity = '0';
       s.style.transform = 'translateX(10px)'; // Drifting out to the right
       s.style.filter = 'blur(5px)';
    });

    // Phase 2: Show new words (Faster reveal)
    setTimeout(() => {
      currentTagIndex = (currentTagIndex + 1) % TAGLINES.length;
      animateWords(TAGLINES[currentTagIndex]);
    }, 600);
  }

  // Initial set
  animateWords(TAGLINES[0]);

  taglineTimer = setInterval(update, 2500); // Brisk 2.5 second rotation
}

export function showAuthPage() {
  const authView = document.getElementById('auth-view-new');
  if (authView) {
    authView.classList.remove('hidden');
    startTaglineRotation();
  }
}
