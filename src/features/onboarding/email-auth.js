import { supabase } from '../../supabase.js';
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
        <img src="/sublify-logo.png" class="email-auth-logo" alt="Sublify Logo">
      </div>

      <h2 class="email-auth-title" id="email-auth-title-text">Welcome Back</h2>

      <form class="email-auth-form" id="email-auth-form-submit">
      <div id="signup-only-fields" class="hidden">
        <div class="form-field">
          <label>Full Name</label>
          <input type="text" id="auth-name-input" placeholder="Your name" maxlength="30">
        </div>
        
        <div class="form-row-grid">
          <div class="form-field">
            <label>Gender</label>
            <div class="custom-select-wrapper" id="gender-select-wrapper">
              <div class="custom-select-trigger" id="gender-select-trigger">
                <span id="gender-selected-text" style="color: rgba(255,255,255,0.35);">Select</span>
                <svg viewBox="0 0 24 24" fill="white" width="18" height="18"><path d="M7 10l5 5 5-5z"/></svg>
              </div>
              <div class="custom-select-dropdown hidden" id="gender-dropdown">
                <div class="custom-select-option" data-value="male">Male</div>
                <div class="custom-select-option" data-value="female">Female</div>
                <div class="custom-select-option" data-value="other">Other</div>
              </div>
            </div>
            <input type="hidden" id="auth-gender-input">
          </div>
          <div class="form-field">
            <label>Birthday</label>
            <input type="date" id="auth-dob-input">
          </div>
        </div>
      </div>

      <div class="form-field">
        <label>Email Address</label>
        <input type="email" id="email-auth-input" placeholder="name@example.com" required>
      </div>

        <div class="form-field">
        <div style="display:flex; justify-content:space-between; align-items:flex-end;">
          <label id="password-field-label">Password</label>
          <span id="email-auth-forgot-btn" style="font-size: 0.7rem; color: rgba(255,255,255,0.4); text-decoration: underline; cursor: pointer; font-weight: 600;">Forgot Password?</span>
        </div>
        <div class="password-input-wrapper">
          <input type="password" id="password-auth-input" placeholder="••••••••" required>
          <div class="strength-meter-container">
            <svg class="strength-svg" viewBox="0 0 36 36">
              <circle class="strength-track" cx="18" cy="18" r="16" fill="none" stroke-width="3"></circle>
              <circle id="auth-pass-circle" class="strength-fill" cx="18" cy="18" r="16" fill="none" stroke-width="3" stroke-dasharray="100.5" stroke-dashoffset="100.5"></circle>
            </svg>
          </div>
        </div>
      </div>

        <div id="auth-error-message" class="auth-error-text hidden">User Not Found</div>
        <button type="submit" id="email-auth-main-btn" class="email-auth-submit">Log In</button>
      </form>

      <!-- OTP Verification View (Initially Hidden) -->
      <div id="otp-verification-view" class="hidden">
        <p class="otp-instruction" id="otp-instruction-text">
          Enter the 6-digit code sent to<br><strong id="otp-email-display">your email</strong>
        </p>
        
        <div class="otp-input-group" id="otp-input-group">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
          <input type="number" maxlength="1" class="otp-digit" pattern="\d*" inputmode="numeric">
        </div>

        <button id="otp-verify-btn" class="email-auth-submit">Verify Code</button>
        
        <div class="otp-resend">
          Didn't receive code? <span id="otp-resend-btn">Resend</span>
        </div>
      </div>

      <!-- New Password View (Initially Hidden) -->
      <div id="new-password-view" class="hidden">
        <div class="form-field">
          <label>New Password (Min. 10 chars)</label>
          <div class="password-input-wrapper">
            <input type="password" id="new-password-input" placeholder="••••••••" required>
            <div class="strength-meter-container" id="new-password-strength-container" style="display:flex;">
              <svg class="strength-svg" viewBox="0 0 36 36">
                <circle class="strength-track" cx="18" cy="18" r="16" fill="none" stroke-width="3"></circle>
                <circle id="new-pass-circle" class="strength-fill" cx="18" cy="18" r="16" fill="none" stroke-width="3" stroke-dasharray="100.5" stroke-dashoffset="100.5"></circle>
              </svg>
            </div>
          </div>
        </div>
        <button id="reset-final-btn" class="email-auth-submit disabled-btn">Update Password</button>
        <div style="margin-top: 15px; text-align: center;">
          <span id="skip-reset-btn" style="font-size: 0.8rem; color: rgba(255,255,255,0.4); text-decoration: underline; cursor: pointer; font-weight: 600;">Skip for now</span>
        </div>
      </div>

      <div class="email-auth-footer" id="email-auth-footer-container">
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

  const forgotBtn = document.getElementById('email-auth-forgot-btn');
  if (forgotBtn) {
    forgotBtn.addEventListener('click', async () => {
      const emailVal = document.getElementById('email-auth-input').value.trim();
      if (!emailVal) {
        if (window.showAuthErrorOnButton) window.showAuthErrorOnButton("Please enter your email first", false);
        return;
      }
      
      const submitBtn = document.getElementById('email-auth-main-btn');
      const hapticSvc = window.HapticsService || HapticsService;
      if (hapticSvc) hapticSvc.light();
      
      // Set flag to prevent main.js from hiding the auth screen pre-emptively
      window.isRecoveringPassword = true;

      if (submitBtn) {
        submitBtn.innerText = "SENDING CODE...";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;
      }
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(emailVal);
        if (error) throw error;
        
        // Transition to OTP Screen with 'recovery' type
        showOtpVerification(emailVal, 'recovery');
        
      } catch (err) {
        if (window.showAuthErrorOnButton) window.showAuthErrorOnButton(err.message || "Failed to send reset code", false);
      }
    });
  }

  const toggleBtn = document.getElementById('email-auth-toggle-btn');
  toggleBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    updateAuthMode();
    if (window.HapticsService) window.HapticsService.selection();
  });

  const passwordInput = document.getElementById('password-auth-input');
  const strengthCircle = document.getElementById('auth-pass-circle');
  const strengthCircleContainer = document.querySelector('.strength-meter-container');
  const submitBtn = document.getElementById('email-auth-main-btn');

  // Initial Visibility
  if (strengthCircleContainer) strengthCircleContainer.style.display = 'none';

  // Shared strength meter logic for both signup and password reset
  const setupStrengthMeter = (inputEl, circleEl, containerEl, btnEl) => {
    inputEl.addEventListener('input', () => {
      const val = inputEl.value;
      const len = val.length;

      // Only show for signup or reset screens
      if (!isSignUpMode && inputEl.id === 'password-auth-input') {
        if (containerEl) containerEl.style.display = 'none';
        btnEl.classList.remove('disabled-btn');
        return;
      }

      if (containerEl) containerEl.style.display = 'flex';
      
      if (len === 0) {
        circleEl.style.strokeDashoffset = '100.5';
        circleEl.style.stroke = 'rgba(255,255,255,0.2)';
        btnEl.classList.add('disabled-btn');
        return;
      }

      const hasUpper = /[A-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSpecial = /[^A-Za-z0-9]/.test(val);
      const complexityScore = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
      
      let progress = Math.min((len / 10) * 60, 60); 
      if (len >= 10) progress += (complexityScore * 13.33); 
      
      const offset = 100.5 - (progress / 100) * 100.5;
      circleEl.style.strokeDashoffset = offset;

      if (len < 10) {
        circleEl.style.stroke = '#ff3b30'; 
        btnEl.classList.add('disabled-btn');
      } else if (complexityScore < 2) {
        circleEl.style.stroke = '#ffcc00'; 
        btnEl.classList.remove('disabled-btn');
      } else if (complexityScore === 3 && len >= 12) {
        circleEl.style.stroke = '#00ff88'; 
        btnEl.classList.remove('disabled-btn');
      } else {
        circleEl.style.stroke = '#00a2ff'; 
        btnEl.classList.remove('disabled-btn');
      }
    });
  };

  setupStrengthMeter(
    passwordInput, 
    strengthCircle, 
    strengthCircleContainer, 
    submitBtn
  );

  const newPassInput = document.getElementById('new-password-input');
  const newStrengthCircle = document.getElementById('new-pass-circle');
  const newStrengthContainer = document.getElementById('new-password-strength-container');
  const resetFinalBtn = document.getElementById('reset-final-btn');

  setupStrengthMeter(
    newPassInput,
    newStrengthCircle,
    newStrengthContainer,
    resetFinalBtn
  );

  // New Password Reset Handler
  resetFinalBtn.onclick = async () => {
    if (resetFinalBtn.classList.contains('disabled-btn')) return;
    
    resetFinalBtn.disabled = true;
    resetFinalBtn.innerText = "UPDATING...";
    
    const hapticSvc = window.HapticsService || HapticsService;
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassInput.value
      });

      if (error) throw error;
      
      // Success! Reset flag
      window.isRecoveringPassword = false;
      window.dispatchEvent(new Event('passwordResetComplete'));

      if (hapticSvc) hapticSvc.success();
      
      if (window.addNotification) {
        window.addNotification({
          title: "Password Updated",
          text: "Your password has been changed successfully. Logging you in...",
          type: "success"
        });
      }

      // Success! The session is updated. The main.js onAuthStateChange will take them to the app.
      // But we should hide this view first.
      document.getElementById('email-auth-view').classList.add('hidden');
      
    } catch (err) {
      if (hapticSvc) hapticSvc.error();
      if (window.showAuthErrorOnButton) window.showAuthErrorOnButton(err.message, false);
    } finally {
      resetFinalBtn.disabled = false;
      resetFinalBtn.innerText = "Update Password";
    }
  };

  // Skip Password Reset Handler
  const skipBtn = document.getElementById('skip-reset-btn');
  if (skipBtn) {
    skipBtn.onclick = () => {
      if (window.HapticsService) window.HapticsService.light();
      
      // Reset flag
      window.isRecoveringPassword = false;
      window.dispatchEvent(new Event('passwordResetComplete'));

      // Just hide the view and let the app takeover (since they are already verified/logged in)
      document.getElementById('email-auth-view').classList.add('hidden');
      if (window.addNotification) {
        window.addNotification({
          title: "Setup Complete",
          text: "You can change your password anytime in settings.",
          type: "info"
        });
      }
    };
  }

  // Global error listener for the button logic
  window.showAuthErrorOnButton = (message, isSuccess = false) => {
    const errEl = document.getElementById('auth-error-message');
    const submitBtn = document.getElementById('email-auth-main-btn');
    if (submitBtn) {
      submitBtn.innerText = isSignUpMode ? "Sign Up" : "Log In";
      submitBtn.style.opacity = "1";
      submitBtn.disabled = false;
    }

    if (!errEl) return;
    
    errEl.innerText = message || "User Not Found";
    errEl.style.color = isSuccess ? "#50fa7b" : "#ff3b30";
    errEl.classList.remove('hidden');
    
    setTimeout(() => {
      errEl.classList.add('hidden');
    }, 4000); // Give them 4 seconds to read it
  };

  // Clear error on any input
  const clearError = () => {
    const errEl = document.getElementById('auth-error-message');
    if (errEl) errEl.classList.add('hidden');
  };
  passwordInput.addEventListener('input', clearError);
  document.getElementById('email-auth-input').addEventListener('input', clearError);

  // --- Custom Gender Dropdown Logic ---
  const genderTrigger = document.getElementById('gender-select-trigger');
  const genderDropdown = document.getElementById('gender-dropdown');
  const genderSelectedText = document.getElementById('gender-selected-text');
  const genderInput = document.getElementById('auth-gender-input');
  const genderWrapper = document.getElementById('gender-select-wrapper');

  if (genderTrigger && genderDropdown) {
    genderTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !genderDropdown.classList.contains('hidden');
      genderDropdown.classList.toggle('hidden');
      genderWrapper.classList.toggle('open', !isOpen);
    });

    genderDropdown.querySelectorAll('.custom-select-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.dataset.value;
        genderInput.value = val;
        genderSelectedText.textContent = opt.textContent;
        genderSelectedText.style.color = '#ffffff';
        genderDropdown.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        genderDropdown.classList.add('hidden');
        genderWrapper.classList.remove('open');
      });
    });

    document.addEventListener('click', () => {
      genderDropdown.classList.add('hidden');
      genderWrapper.classList.remove('open');
    });
  }


  document.getElementById('email-auth-form-submit').addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSignUpMode && passwordInput.value.length < 10) return;
    
    if (window.HapticsService) window.HapticsService.success();
    
    const submitBtn = document.getElementById('email-auth-main-btn');
    if (submitBtn) {
      submitBtn.innerText = "PROCESSING...";
      submitBtn.style.opacity = "0.7";
      submitBtn.disabled = true;
    }
    
    // Connect to original main.js logic
    const emailVal = document.getElementById('email-auth-input').value;
    const passVal = document.getElementById('password-auth-input').value;
    
    const originalEmail = document.getElementById('auth-email');
    const originalPass = document.getElementById('auth-password');
    const originalForm = document.getElementById('auth-form');
    const originalToggle = document.getElementById('toggle-auth');

    if (originalEmail) originalEmail.value = emailVal;
    if (originalPass) originalPass.value = passVal;
    
    // Sync the mode (signup vs login) in background
    const isCurrentlySignUp = (document.querySelector('.view-title')?.innerText === 'Create Account');
    if (isSignUpMode !== isCurrentlySignUp && originalToggle) {
      originalToggle.click(); // Trigger the mode switch on the hidden original form
    }
    
    // IF SIGNUP: Populate the hidden onboarding fields too
    if (isSignUpMode) {
      const onboardName = document.getElementById('onboard-name');
      const onboardDob = document.getElementById('onboard-dob');
      const nameVal = document.getElementById('auth-name-input').value;
      const dobVal = document.getElementById('auth-dob-input').value;
      const genderVal = document.getElementById('auth-gender-input').value;

      if (onboardName) onboardName.value = nameVal;
      if (onboardDob) onboardDob.value = dobVal;
      
      // Select gender in hidden list
      const genderBtns = document.querySelectorAll('.gender-btn');
      genderBtns.forEach(btn => {
        if (btn.dataset.value === genderVal) btn.click();
      });

      // Signal to the system that we should SKIP the onboarding popups
      window.skipOnboardingPopups = true;
    }
    
    // Dispatch the submit
    if (originalForm) {
      originalForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }
  });

  // --- OTP Specific Logic ---
  const otpGroup = document.getElementById('otp-input-group');
  const otpInputs = otpGroup.querySelectorAll('.otp-digit');
  const otpVerifyBtn = document.getElementById('otp-verify-btn');
  const otpResendBtn = document.getElementById('otp-resend-btn');

  // Multi-input focus management
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (input.value.length > 1) input.value = input.value.slice(-1);
      
      if (input.value && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
      
      // Auto-trigger verify if complete
      const code = Array.from(otpInputs).map(i => i.value).join('');
      if (code.length === 6) {
        otpVerifyBtn.click();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });
  });

  otpVerifyBtn.onclick = async () => {
    const code = Array.from(otpInputs).map(i => i.value).join('');
    if (code.length !== 6) return;

    otpVerifyBtn.disabled = true;
    otpVerifyBtn.innerText = "VERIFYING...";
    
    const email = document.getElementById('otp-email-display').innerText;
    const currentOtpType = otpVerifyBtn.getAttribute('data-otp-type') || 'signup';

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: currentOtpType
      });

      if (error) throw error;
      
      const hapticSvc = window.HapticsService || HapticsService;
      if (hapticSvc) hapticSvc.success();

      // If it was a recovery code, we need to show the New Password screen
      if (currentOtpType === 'recovery') {
        showNewPasswordScreen();
      }
      
    } catch (err) {
      console.error('OTP Verification Error:', err.message);
      const hapticSvc = window.HapticsService || HapticsService;
      if (hapticSvc) hapticSvc.error();
      
      // Flash error on the boxes
      otpInputs.forEach(i => {
        i.style.borderColor = "#ff3b30";
        i.style.color = "#ff3b30";
        setTimeout(() => {
          i.style.borderColor = "";
          i.style.color = "";
          i.value = "";
        }, 1500);
      });
      otpInputs[0].focus();
      if (window.showAuthErrorOnButton) window.showAuthErrorOnButton(err.message, false);
      
    } finally {
      otpVerifyBtn.disabled = false;
      otpVerifyBtn.innerText = "VERIFY CODE";
    }
  };

  if (otpResendBtn) {
    otpResendBtn.onclick = async () => {
      // Prevent double clicks if already sending or in timer
      if (otpResendBtn.style.pointerEvents === 'none') return;
      
      const email = document.getElementById('otp-email-display').innerText.trim();
      if (!email || email === 'your email') {
          console.error('Invalid email for resend');
          return;
      }

      try {
        const originalText = otpResendBtn.innerText;
        otpResendBtn.innerText = "SENDING...";
        otpResendBtn.style.opacity = "0.7";
        otpResendBtn.style.pointerEvents = "none";

        const currentOtpType = otpVerifyBtn.getAttribute('data-otp-type') || 'signup';
        let error;

        if (currentOtpType === 'recovery') {
           // For password resets, we call resetPasswordForEmail again to resend the code
           const result = await supabase.auth.resetPasswordForEmail(email);
           error = result.error;
        } else {
           // For signups, we use the standard resend method
           const result = await supabase.auth.resend({
             type: currentOtpType,
             email: email
           });
           error = result.error;
        }

        if (error) throw error;
        
        // Use global notification if available
        if (window.addNotification) {
          window.addNotification({
            title: "Code Resent",
            text: "A new verification code has been sent to your email.",
            type: "success"
          });
        }

        otpResendBtn.innerText = "SENT!";
        otpResendBtn.style.color = "#00ff88"; // Success color
        
        setTimeout(() => { 
          otpResendBtn.style.color = ""; // Reset color
          startOtpResendTimer();
        }, 1500);
      } catch (e) {
        console.error('Resend failed:', e.message);
        otpResendBtn.innerText = "Resend";
        otpResendBtn.style.opacity = "1";
        otpResendBtn.style.pointerEvents = "all";
        
        if (window.addNotification) {
          window.addNotification({
            title: "Resend Failed",
            text: e.message || "Could not resend code. Please try again.",
            type: "error"
          });
        }
      }
    };
  }
}

let otpResendInterval = null;

function startOtpResendTimer() {
  const btn = document.getElementById('otp-resend-btn');
  if (!btn) return;

  if (otpResendInterval) clearInterval(otpResendInterval);
  
  let seconds = 60;
  btn.style.pointerEvents = 'none';
  btn.style.opacity = '0.5';
  btn.innerText = `Resend in ${seconds}s`;

  otpResendInterval = setInterval(() => {
    seconds--;
    btn.innerText = `Resend in ${seconds}s`;

    if (seconds <= 0) {
      clearInterval(otpResendInterval);
      btn.innerText = "Resend";
      btn.style.pointerEvents = 'all';
      btn.style.opacity = '1';
    }
  }, 1000);
}


/**
 * Transitions the view to the OTP input screen
 */
export function showOtpVerification(email, type = 'signup') {
  const authForm = document.getElementById('email-auth-form-submit');
  const otpView = document.getElementById('otp-verification-view');
  const title = document.getElementById('email-auth-title-text');
  const footer = document.getElementById('email-auth-footer-container');
  const emailDisplay = document.getElementById('otp-email-display');
  const otpInputs = document.querySelectorAll('.otp-digit');
  const otpVerifyBtn = document.getElementById('otp-verify-btn');

  const submitBtn = document.getElementById('email-auth-main-btn');
  if (submitBtn) {
    submitBtn.innerText = isSignUpMode ? "Sign Up" : "Log In";
    submitBtn.style.opacity = "1";
    submitBtn.disabled = false;
  }

  if (!authForm || !otpView) return;

  // Set the type for later verification
  otpVerifyBtn.setAttribute('data-otp-type', type);

  // Update State
  title.innerText = type === 'recovery' ? "Reset Password" : "Verify Email";
  emailDisplay.innerText = email;
  
  // Hide Login/Signup Form via smooth fade out
  authForm.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  authForm.style.opacity = '0';
  authForm.style.transform = 'scale(0.97)';
  footer.style.transition = 'opacity 0.2s ease';
  footer.style.opacity = '0';
  
  setTimeout(() => {
    authForm.classList.add('hidden');
    footer.classList.add('hidden');
    
    // Clean up inline styles
    authForm.style.opacity = '';
    authForm.style.transform = '';
    footer.style.opacity = '';

    // Show Verification View smoothly
    otpView.classList.remove('hidden');
    
    // Force DOM reflow to restart animation reliably
    void otpView.offsetWidth;
    otpView.style.animation = 'none';
    void otpView.offsetWidth;
    otpView.style.animation = 'fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards';
    
    // Focus first box
    otpInputs.forEach(i => i.value = ''); // Clear old inputs
    otpInputs[0].focus();
  }, 250);

  // Start the 60s cooldown timer
  startOtpResendTimer();
}

function showNewPasswordScreen() {
  const otpView = document.getElementById('otp-verification-view');
  const newPassView = document.getElementById('new-password-view');
  const title = document.getElementById('email-auth-title-text');

  if (!otpView || !newPassView) return;

  // Ensure loading screens or other views don't overlap
  const loadingScreen = document.getElementById('auth-loading-screen');
  if (loadingScreen) loadingScreen.classList.add('hidden');

  title.innerText = "New Password";

  otpView.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
  otpView.style.opacity = '0';
  otpView.style.transform = 'scale(0.97)';

  setTimeout(() => {
    otpView.classList.add('hidden');
    otpView.style.opacity = '';
    otpView.style.transform = '';

    newPassView.classList.remove('hidden');
    void newPassView.offsetWidth;
    newPassView.style.animation = 'fadeIn 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards';
    
    const input = document.getElementById('new-password-input');
    if (input) input.focus();
  }, 250);
}




function updateAuthMode() {
  const title = document.getElementById('email-auth-title-text');
  const submitBtn = document.getElementById('email-auth-main-btn');
  const toggleBtn = document.getElementById('email-auth-toggle-btn');
  const passInput = document.getElementById('password-auth-input');
  const passLabel = document.getElementById('password-field-label');
  const strengthContainer = document.querySelector('.strength-meter-container');
  const signupFields = document.getElementById('signup-only-fields');
  const forgotBtn = document.getElementById('email-auth-forgot-btn');
  
  const nameInp = document.getElementById('auth-name-input');
  const genderInp = document.getElementById('auth-gender-input');
  const dobInp = document.getElementById('auth-dob-input');

  if (isSignUpMode) {
    title.innerText = "Create Account";
    submitBtn.innerText = "Sign Up";
    toggleBtn.innerHTML = "Already have an account? <span>Log In</span>";
    passLabel.innerText = "Password (Min. 10 chars)";
    passInput.setAttribute('minlength', '10');
    if (strengthContainer) strengthContainer.style.display = 'flex';
    if (signupFields) signupFields.classList.remove('hidden');
    if (forgotBtn) forgotBtn.style.display = 'none';
    
    nameInp.required = true;
    genderInp.required = true;
    dobInp.required = true;
    
    passInput.dispatchEvent(new Event('input'));
  } else {
    title.innerText = "Welcome Back";
    submitBtn.innerText = "Log In";
    toggleBtn.innerHTML = "Don't have an account? <span>Sign Up</span>";
    passLabel.innerText = "Password";
    passInput.removeAttribute('minlength');
    if (strengthContainer) strengthContainer.style.display = 'none';
    if (signupFields) signupFields.classList.add('hidden');
    if (forgotBtn) forgotBtn.style.display = 'inline';
    
    nameInp.required = false;
    genderInp.required = false;
    dobInp.required = false;
    
    submitBtn.classList.remove('disabled-btn');
  }
}

export function setAuthMode(signUp) {
  isSignUpMode = signUp;
  updateAuthMode();
}

export function showEmailAuthPage(mode = 'login') {
  const emailAuthView = document.getElementById('email-auth-view');
  if (emailAuthView) {
    // Reset internal views first before showing
    resetEmailAuthViews();
    
    if (mode === 'signup') {
      isSignUpMode = true;
      updateAuthMode();
    } else if (mode === 'login') {
      isSignUpMode = false;
      updateAuthMode();
    }
    emailAuthView.classList.remove('hidden');
  }
}

/**
 * Resets all internal views of the email auth screen to their default state.
 * Useful for logout or switching between auth flows.
 */
export function resetEmailAuthViews() {
  const authForm = document.getElementById('email-auth-form-submit');
  const otpView = document.getElementById('otp-verification-view');
  const newPassView = document.getElementById('new-password-view');
  const footer = document.getElementById('email-auth-footer-container');

  // Reset the recovery flag safely
  window.isRecoveringPassword = false;

  if (authForm) authForm.classList.remove('hidden');
  if (footer) footer.classList.remove('hidden');
  if (otpView) otpView.classList.add('hidden');
  if (newPassView) newPassView.classList.add('hidden');
  
  // Clear inputs
  const inputs = document.querySelectorAll('#email-auth-view input');
  inputs.forEach(i => {
     if (i.type !== 'submit' && i.type !== 'button') i.value = '';
  });
}
