import { HapticsService } from '../../features/haptics/haptics.js';

let isSignUpMode = false;

export function initEmailAuthPage() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  const emailAuthView = document.createElement('div');
  emailAuthView.id = 'email-auth-view';
  emailAuthView.className = 'email-auth-page hidden';

  emailAuthView.innerHTML = `
    <!-- Back Button -->
    <div class="email-auth-back" id="email-auth-back-btn">
      <svg viewBox="0 0 24 24">
        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
      </svg>
      <span>Back</span>
    </div>

    <!-- Space BG Shared -->
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <div class="email-header-content">
      <div class="email-auth-header">
        <img src="https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/LOGOS/ChatGPT%20Image%20Mar%2017,%202026,%2010_36_13%20PM.png" class="email-auth-logo" alt="Sublify Logo">
      </div>

      <h2 class="email-auth-title" id="email-auth-title-text">Welcome Back</h2>

      <form class="email-auth-form" id="email-auth-form-submit">
        <div class="form-field">
          <label>Email Address</label>
          <input type="email" id="email-auth-input" placeholder="name@example.com" required>
        </div>

        <div class="form-field">
        <label>Password (Min. 10 chars)</label>
        <div class="password-input-wrapper">
          <input type="password" id="password-auth-input" placeholder="••••••••" minlength="10" required>
          <div class="strength-meter-container">
            <svg class="strength-svg" viewBox="0 0 36 36">
              <circle class="strength-track" cx="18" cy="18" r="16" fill="none" stroke-width="3"></circle>
              <circle id="auth-pass-circle" class="strength-fill" cx="18" cy="18" r="16" fill="none" stroke-width="3" stroke-dasharray="100.5" stroke-dashoffset="100.5"></circle>
            </svg>
          </div>
        </div>
      </div>

        <button type="submit" id="email-auth-main-btn" class="email-auth-submit">Log In</button>
      </form>

      <div class="email-auth-footer">
        <span id="email-auth-toggle-btn">Don't have an account? Sign Up</span>
      </div>
    </div>
  `;

  authScreen.appendChild(emailAuthView);

  // Interaction Logic
  const backBtn = document.getElementById('email-auth-back-btn');
  if (backBtn) {
    backBtn.onclick = () => {
      const hapticSvc = window.HapticsService || HapticsService;
      if (hapticSvc) hapticSvc.light();
      
      emailAuthView.classList.add('hidden');
      const authViewNew = document.getElementById('auth-view-new');
      if (authViewNew) authViewNew.classList.remove('hidden');
    };
  }

  const toggleBtn = document.getElementById('email-auth-toggle-btn');
  toggleBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    updateAuthMode();
    if (window.HapticsService) window.HapticsService.selection();
  });

  const passwordInput = document.getElementById('password-auth-input');
  const strengthCircle = document.getElementById('auth-pass-circle');
  const submitBtn = document.getElementById('email-auth-main-btn');

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const len = val.length;

    if (len === 0) {
      strengthCircle.style.strokeDashoffset = '100.5';
      strengthCircle.style.stroke = 'rgba(255,255,255,0.2)';
      submitBtn.classList.add('disabled-btn');
      return;
    }

    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    const complexityScore = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    let progress = Math.min((len / 10) * 60, 60); 
    if (len >= 10) progress += (complexityScore * 13.33); 
    
    const offset = 100.5 - (progress / 100) * 100.5;
    strengthCircle.style.strokeDashoffset = offset;

    if (len < 10) {
      strengthCircle.style.stroke = '#ff3b30'; 
      submitBtn.classList.add('disabled-btn');
    } else if (complexityScore < 2) {
      strengthCircle.style.stroke = '#ffcc00'; 
      submitBtn.classList.remove('disabled-btn');
    } else if (complexityScore === 3 && len >= 12) {
      strengthCircle.style.stroke = '#00ff88'; 
      submitBtn.classList.remove('disabled-btn');
    } else {
      strengthCircle.style.stroke = '#00a2ff'; 
      submitBtn.classList.remove('disabled-btn');
    }
  });

  // Global error listener for the button logic
  window.showAuthErrorOnButton = (message) => {
    const originalText = submitBtn.innerText;
    submitBtn.innerText = message || "User Not Found";
    submitBtn.classList.add('error-btn-state');
    
    setTimeout(() => {
      submitBtn.innerText = originalText;
      submitBtn.classList.remove('error-btn-state');
    }, 3000);
  };

  document.getElementById('email-auth-form-submit').addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value.length < 10) return;
    
    if (window.HapticsService) window.HapticsService.success();
    // Connect to original main.js logic
    const email = document.getElementById('email-auth-input').value;
    const password = document.getElementById('password-auth-input').value;
    
    const originalEmail = document.getElementById('auth-email');
    const originalPass = document.getElementById('auth-password');
    if (originalEmail) originalEmail.value = email;
    if (originalPass) originalPass.value = password;
    
    const originalSubmit = document.getElementById('auth-form');
    if (originalSubmit) {
      originalSubmit.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });
}




function updateAuthMode() {
  const title = document.getElementById('email-auth-title-text');
  const submitBtn = document.getElementById('email-auth-main-btn');
  const toggleBtn = document.getElementById('email-auth-toggle-btn');

  if (isSignUpMode) {
    title.innerText = "Create Account";
    submitBtn.innerText = "Sign Up";
    toggleBtn.innerHTML = "Already have an account? <span>Log In</span>";
  } else {
    title.innerText = "Welcome Back";
    submitBtn.innerText = "Log In";
    toggleBtn.innerHTML = "Don't have an account? <span>Sign Up</span>";
  }
}

export function showEmailAuthPage() {
  const emailAuthView = document.getElementById('email-auth-view');
  if (emailAuthView) {
    emailAuthView.classList.remove('hidden');
  }
}
