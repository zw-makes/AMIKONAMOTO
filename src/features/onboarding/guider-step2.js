import './guider-step2.css';
import '../ai-analyst/ai-analyst.css';
import { initGuider, showGuider } from './guider.js';

export function initGuiderStep2() {
  const authScreen = document.getElementById('auth-screen');
  if (!authScreen) return;

  const view = document.createElement('div');
  view.id = 'guider-step2-view';
  view.className = 'guider-page guider-step2-view';

  // 12 top-tier recognizable subscriptions
  const logoDomains = [
    'netflix.com', 'spotify.com', 'amazon.com', 'apple.com', 
    'disneyplus.com', 'adobe.com', 'figma.com', 'slack.com', 
    'hulu.com', 'notion.so', 'github.com', 'chatgpt.com'
  ];

  let logosHTML = '';
  const numLogos = logoDomains.length;
  
  logoDomains.forEach((domain, idx) => {
    const logoUrl = window.getLogoUrl ? window.getLogoUrl(domain) : `https://icon.horse/icon/${domain}`;
    
    // Mathematically perfect ellipse around the AI box
    const angle = (idx / numLogos) * Math.PI * 2;
    // Ellipse dimensions compressed horizontally for mobile screens
    const rx = 140; 
    const ry = 85; 
    
    const x = Math.cos(angle) * rx;
    const y = Math.sin(angle) * ry;
    
    // Vary the floating speed to be incredibly dynamic
    const delay = (idx * 0.15).toFixed(2);
    
    // We send coordinates to CSS via variables for the magnetic pull animation!
    logosHTML += `<img src="${logoUrl}" class="guider-orbit-logo" style="--startX: ${x}px; --startY: ${y}px; animation-delay: -${delay}s;" />`;
  });

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
          <div class="guider-visual-switcher" style="position: relative; width: 100%;">
            <div class="guider-ai-wrapper" style="margin: 0 auto; position: relative; transform: scale(1.15); transform-origin: center center;">
                <div class="ai-input-box" style="margin: 0; position: relative; z-index: 10; cursor: default; pointer-events: none; background: transparent; border: 1px solid rgba(255, 255, 255, 0.2); padding: 18px 24px; min-height: 80px; display: flex; flex-direction: column; justify-content: center;">
                    <div class="ai-input-wrapper" style="position: relative; width: 100%; display: flex; align-items: center; justify-content: center;">
                        <input type="text" class="ai-chat-input" autocomplete="off" readonly style="position: absolute; opacity: 0; width: 100%;">
                        <div class="ai-typewriter-overlay"></div>
                    </div>
                    <div class="input-toolbar">
                        <div class="toolbar-left">
                            <button class="tool-icon-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                            </button>
                             <button class="tool-pill-btn prompt-limit-pill" title="Prompt Limit">
                                <div class="prompt-ring-wrap">
                                    <svg class="prompt-ring-svg" width="34" height="34">
                                        <circle class="prompt-ring-bg" cx="17" cy="17" r="15.5"></circle>
                                        <circle class="prompt-ring-progress" cx="17" cy="17" r="15.5" style="stroke: #4da6ff; stroke-dasharray: 97.4; stroke-dashoffset: 58.4;"></circle>
                                    </svg>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                </div>
                                <span class="version-label">v1.2.9</span>
                            </button>
                        </div>
                        <div class="toolbar-right">
                            <button class="cute-send-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"></line>
                                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                ${logosHTML}
            </div>
          </div>
        </div>

        <div class="guider-content">
          <div class="guider-branding">
             <img src="https://ptueakygbjohifkscplk.supabase.co/storage/v1/object/public/LOGOS/ChatGPT%20Image%20Mar%2017,%202026,%2010_36_13%20PM.png" class="guider-logo" alt="Sublify Logo">
             <h2 class="guider-title">Your AI. Your data. Full stop.</h2>
             <p class="guider-description">Stop thinking about it. We got it. 100% private, zero AI training on your data. Life's too full for subscription stress.</p>
          </div>
          
          <div class="guider-actions" style="display: flex; gap: 12px; width: 100%; margin-top: auto;">
              <button id="guider-back-btn" class="guider-main-btn" style="flex: 1; background: rgba(255, 255, 255, 0.05); color: #fff; border: 1px solid rgba(255, 255, 255, 0.1);">Previous</button>
              <button id="guider-finish-btn" class="guider-main-btn" style="flex: 1;">Got it!!</button>
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

  // Typewriter Animation for the Custom Overlay
  const typewriterText = view.querySelector('.ai-typewriter-overlay');
  const prompts = [
    "Ask Anything...",
    "Forgot to cancel something?",
    "Which trial is hitting soon?",
    "Cancel unused apps...",
    "Am I paying for two music apps?",
    "How much am I spending monthly?",
    "Mark Netflix as paid...",
    "What's renewing this week?",
    "Which is costing me the most?",
    "Compare costs to last month...",
    "Delete stopped subscriptions..."
  ];

  let currentPromptIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function typeWriter() {
    if (!document.body.contains(view)) return; 

    const currentString = prompts[currentPromptIdx];

    if (isDeleting) {
      typewriterText.textContent = currentString.substring(0, charIdx);
      charIdx--;
    } else {
      typewriterText.textContent = currentString.substring(0, charIdx);
      charIdx++;
    }

    let typeSpeed = isDeleting ? 25 : 50;

    if (!isDeleting && charIdx > currentString.length) {
      isDeleting = true;
      typeSpeed = 2500; 
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      currentPromptIdx = (currentPromptIdx + 1) % prompts.length;
      typeSpeed = 600; 
    }

    setTimeout(typeWriter, typeSpeed);
  }

  // Start typewriter slightly after view appears
  setTimeout(typeWriter, 800);

  // Back Button Logic
  document.getElementById('guider-back-btn').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.light();
    view.style.opacity = '0';
    setTimeout(() => {
        view.remove();

        // Always re-init Step 1 to ensure the 5-sec animation interval restarts fresh
        const guider1 = document.getElementById('guider-view');
        if (guider1) guider1.remove(); 
        
        initGuider().then(() => {
            showGuider();
        });
    }, 400);
  });

  document.getElementById('guider-finish-btn').addEventListener('click', () => {
    if (window.HapticsService) window.HapticsService.success();
    view.style.opacity = '0';
    
    setTimeout(() => {
      view.remove();
      authScreen.classList.add('hidden');
      document.getElementById('app-container').classList.remove('hidden');
      
      // Init real app payload
      if (window.initApp) {
          window.initApp();
      }
    }, 400);
  });
}
