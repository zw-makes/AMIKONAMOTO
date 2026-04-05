import './guider-step3.css';
import { HapticsService } from '../haptics/haptics.js';
import { supabase } from '../../supabase.js';

export function initGuiderStep3() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  const view = document.createElement('div');
  view.id = 'guider-step3-view';
  view.className = 'guider-page guider-step3-view';

  const sampleNotifications = [
    { title: 'Netflix', text: 'Renews in 3 days. ₹1,000 will be charged on Apr 7.', domain: 'netflix.com' },
    { title: 'Spotify', text: 'Your free trial ends tomorrow. Card gets charged Apr 5.', domain: 'spotify.com' },
    { title: 'Apple Music', text: 'Payment due today. Don\'t forget to mark it paid.', domain: 'apple.com' },
    { title: 'Lovable.dev', text: 'Yearly renewal in 7 days. €10.00 coming up on Apr 11.', domain: 'lovable.dev' },
    { title: 'YouTube Premium', text: 'Trial ending in 2 days. Cancel before Apr 6 to avoid charges.', domain: 'youtube.com' },
    { title: 'Adobe Creative Cloud', text: '$54.99 renews this Friday. Your most expensive one.', domain: 'adobe.com' },
    { title: 'Hulu', text: 'Marked unpaid. You still haven\'t paid this month\'s bill.', domain: 'hulu.com' },
    { title: 'iCloud', text: 'Renews tomorrow. $2.99 — small but don\'t miss it.', domain: 'apple.com' },
    { title: 'GitHub', text: 'Team plan renewal in 2 days. $4.00 per user.', domain: 'github.com' },
    { title: 'Figma', text: 'Pro subscription renews next week.', domain: 'figma.com' }
  ];

  const notifStack = view.querySelector('.guider-notif-stack');
  
  function addNotifSequential(idx) {
    if (idx >= sampleNotifications.length) return;
    
    const n = sampleNotifications[idx];
    const logoUrl = window.getLogoUrl ? window.getLogoUrl(n.domain) : `https://icon.horse/icon/${n.domain}`;
    const time = 'Just now';
    
    const notifEl = document.createElement('div');
    notifEl.className = 'notif-item unread-notif guider-notif-anim';
    notifEl.style.width = '100%';
    notifEl.style.cursor = 'default';
    notifEl.innerHTML = `
        <div class="notif-logo-container">
            <img src="${logoUrl}" class="notif-logo">
        </div>
        <div class="notif-content">
            <span class="notif-title">${n.title}</span>
            <span class="notif-text">${n.text}</span>
            <span class="notif-time">${time}</span>
        </div>
    `;
    
    const stack = document.querySelector('.guider-notif-stack');
    if (stack) {
        // Find the oldest one BEFORE adding the new one
        const children = Array.from(stack.children);
        if (children.length >= 3) {
            const oldest = children[children.length - 1];
            // Start exit animation immediately
            oldest.classList.add('guider-notif-out');
            // Clean up from DOM after transition
            setTimeout(() => { if (oldest.parentNode) oldest.remove(); }, 600);
        }
        
        // Add newest one at the top
        stack.insertBefore(notifEl, stack.firstChild);
    }
    
    // Continue sequence
    setTimeout(() => addNotifSequential(idx + 1), 2200);
  }

  view.innerHTML = `
    <!-- Space Background -->
    <div class="space-bg">
      <div class="stars"></div>
      <div class="stars2"></div>
      <div class="stars3"></div>
    </div>

    <div class="guider-container">
      <div class="guider-step active">
        <div class="guider-visual-area" style="flex: 1;">
          <div class="guider-visual-switcher" style="position: relative; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <div class="guider-notif-stack">
              <!-- Notifications injected here sequentially -->
            </div>
            <div class="notif-glow"></div>
          </div>
        </div>

        <div class="guider-content">
          <div class="guider-branding">
             <img src="/sublify-logo.png" class="guider-logo" alt="Sublify Logo">
             <h2 class="guider-title">We remember so you don't have to.</h2>
             <p class="guider-description">Stay ahead, always.<br>Sublify sends you reminders before every renewal, trial, and due date, so nothing ever sneaks up on you.</p>
          </div>
          
          <div class="guider-actions" style="display: flex; gap: 12px; width: 100%; margin-top: auto;">
              <button id="guider-step3-back-btn" class="guider-main-btn" style="flex: 1; background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1);">Previous</button>
              <button id="guider-step3-finish-btn" class="guider-main-btn" style="flex: 1;">GOT IT!</button>
          </div>
        </div>
      </div>
    </div>
  `;

  authScreen.appendChild(view);

  // Trigger fade in 
  requestAnimationFrame(() => {
    view.classList.add('visible');
  });

  // ──── iOS/System Notification Permission Trigger ──── 
  // We trigger the ACTUAL system pop-up right when user sees this page
  setTimeout(async () => {
    if (window.NativeNotifications) {
      const granted = await window.NativeNotifications.requestPermissions();
      if (granted) {
          console.log('[Guider] User granted notifications! Scheduling alerts...');
          // Trigger the app's internal notification logic immediately (from main.js)
          if (typeof window.updateReminders === 'function') {
              window.updateReminders();
          }
      }
    }
  }, 1200); // Show pop-up slightly after the slide appears for better flow

  // Start sequence shortly after view appears
  setTimeout(() => addNotifSequential(0), 400);

  // Back Button Logic
  document.getElementById('guider-step3-back-btn').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.light();
    view.style.opacity = '0';
    setTimeout(() => {
        view.remove();
        import('./guider-step2.js').then(module => {
            module.initGuiderStep2();
        });
    }, 400);
  });

  document.getElementById('guider-step3-finish-btn').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    view.style.opacity = '0';
    
    setTimeout(() => {
      view.remove();
      // Reveal the app immediately to avoid 'Loading' hang
      authScreen.classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      
      // Init real app payload (Must happen BEFORE the potential DB wait)
      if (typeof window.initApp === 'function') {
          window.initApp();
      }

      // Mark onboarding as completed and persist to TOP-LEVEL DB COLUMN
      if (window.userProfile) {
        window.userProfile.onboarding_completed = true;
        
        // Push update to the NEW dedicated column
        supabase.from('profiles').upsert({ 
           id: window.currentUser.id,
           onboarding_completed: true, // Write to the new atomic column
           ...window.userProfile
        }).then(({ error }) => {
           if (error) console.error('[Guider] Database update failed:', error);
           else console.log('[Guider] Tour locked out in dedicated database column.');
        });
      }
    }, 400);
  });
}
