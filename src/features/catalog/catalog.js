
const CATALOG_DATA = [
  {
    category: 'Streaming',
    apps: [
      { name: 'Netflix', domain: 'netflix.com' },
      { name: 'Spotify', domain: 'spotify.com' },
      { name: 'Disney+', domain: 'disneyplus.com' },
      { name: 'YouTube Premium', domain: 'youtube.com' },
      { name: 'HBO Max', domain: 'max.com' },
      { name: 'Hulu', domain: 'hulu.com' },
      { name: 'Apple TV+', domain: 'tv.apple.com' },
      { name: 'Amazon Prime', domain: 'amazon.com' },
      { name: 'Paramount+', domain: 'paramountplus.com' },
      { name: 'Peacock', domain: 'peacocktv.com' },
      { name: 'Crunchyroll', domain: 'crunchyroll.com' },
      { name: 'Discovery+', domain: 'discoveryplus.com' },
      { name: 'MUBI', domain: 'mubi.com' },
      { name: 'TIDAL', domain: 'tidal.com' },
      { name: 'Deezer', domain: 'deezer.com' },
      { name: 'SoundCloud Go+', domain: 'soundcloud.com' },
      { name: 'Apple Music', domain: 'music.apple.com' },
      { name: 'Twitch Turbo', domain: 'twitch.tv' },
      { name: 'DAZN', domain: 'dazn.com' },
      { name: 'F1 TV', domain: 'f1tv.formula1.com' },
      { name: 'ESPN+', domain: 'espn.com' },
      { name: 'CuriosityStream', domain: 'curiositystream.com' },
      { name: 'Viaplay', domain: 'viaplay.com' },
      { name: 'Sling TV', domain: 'sling.com' }
    ]
  },
  {
    category: 'Productivity',
    apps: [
      { name: 'SUBLIFY', domain: 'sublify.com' },
      { name: 'Notion', domain: 'notion.so' },
      { name: 'Slack', domain: 'slack.com' },
      { name: 'Google Workspace', domain: 'google.com' },
      { name: 'Coda', domain: 'coda.io' },
      { name: 'Evernote', domain: 'evernote.com' },
      { name: 'Microsoft 365', domain: 'microsoft.com' },
      { name: 'Zoom', domain: 'zoom.us' },
      { name: 'Todoist', domain: 'todoist.com' },
      { name: 'Trello', domain: 'trello.com' },
      { name: 'Asana', domain: 'asana.com' },
      { name: 'Monday.com', domain: 'monday.com' },
      { name: 'ClickUp', domain: 'clickup.com' },
      { name: 'Airtable', domain: 'airtable.com' },
      { name: 'Linear', domain: 'linear.app' },
      { name: 'Superhuman', domain: 'superhuman.com' },
      { name: 'Calendly', domain: 'calendly.com' },
      { name: 'Loom', domain: 'loom.com' },
      { name: 'Miro', domain: 'miro.com' },
      { name: 'Obsidian Sync', domain: 'obsidian.md' },
      { name: 'Roam Research', domain: 'roamresearch.com' },
      { name: 'Basecamp', domain: 'basecamp.com' },
      { name: 'Microsoft Teams', domain: 'microsoft.com' }
    ]
  },
  {
    category: 'Creative',
    apps: [
      { name: 'Adobe Creative Cloud', domain: 'adobe.com' },
      { name: 'Figma', domain: 'figma.com' },
      { name: 'Canva', domain: 'canva.com' },
      { name: 'Midjourney', domain: 'midjourney.com' },
      { name: 'Dribbble', domain: 'dribbble.com' },
      { name: 'Spline', domain: 'spline.design' },
      { name: 'Framer', domain: 'framer.com' },
      { name: 'CapCut', domain: 'capcut.com' },
      { name: 'Envato Elements', domain: 'envato.com' },
      { name: 'Artlist', domain: 'artlist.io' },
      { name: 'Epidemic Sound', domain: 'epidemicsound.com' },
      { name: 'Skillshare', domain: 'skillshare.com' },
      { name: 'MasterClass', domain: 'masterclass.com' },
      { name: 'Behance', domain: 'behance.net' },
      { name: 'Sketch', domain: 'sketch.com' },
      { name: 'InVision', domain: 'invisionapp.com' },
      { name: 'Balsamiq', domain: 'balsamiq.com' },
      { name: 'Mural', domain: 'mural.co' },
      { name: 'Webflow', domain: 'webflow.com' },
      { name: 'Squarespace', domain: 'squarespace.com' },
      { name: 'Wix', domain: 'wix.com' },
      { name: 'Ghost', domain: 'ghost.org' },
      { name: 'DALL-E', domain: 'openai.com' }
    ]
  },
  {
    category: 'Development',
    apps: [
      { name: 'GitHub', domain: 'github.com' },
      { name: 'Cursor', domain: 'cursor.sh' },
      { name: 'Vercel', domain: 'vercel.com' },
      { name: 'Supabase', domain: 'supabase.com' },
      { name: 'Postman', domain: 'postman.com' },
      { name: 'DigitalOcean', domain: 'digitalocean.com' },
      { name: 'Heroku', domain: 'heroku.com' },
      { name: 'IntelliJ IDEA', domain: 'jetbrains.com' },
      { name: 'Replit', domain: 'replit.com' },
      { name: 'Railway', domain: 'railway.app' },
      { name: 'Fly.io', domain: 'fly.io' },
      { name: 'AWS', domain: 'amazon.com' },
      { name: 'Google Cloud', domain: 'cloud.google.com' },
      { name: 'Azure', domain: 'azure.microsoft.com' },
      { name: 'Cloudflare', domain: 'cloudflare.com' },
      { name: 'MongoDB Atlas', domain: 'mongodb.com' },
      { name: 'PlanetScale', domain: 'planetscale.com' },
      { name: 'GitKraken', domain: 'gitkraken.com' },
      { name: 'Tower', domain: 'git-tower.com' },
      { name: 'Docker Hub', domain: 'docker.com' },
      { name: 'Sentry', domain: 'sentry.io' },
      { name: 'Datadog', domain: 'datadoghq.com' },
      { name: 'Bitbucket', domain: 'bitbucket.org' }
    ]
  },
  {
    category: 'AI Tools',
    apps: [
      { name: 'SUBLIFY', domain: 'sublify.com' },
      { name: 'ChatGPT', domain: 'chatgpt.com' },
      { name: 'Claude', domain: 'anthropic.com' },
      { name: 'Perplexity', domain: 'perplexity.ai' },
      { name: 'Grammarly', domain: 'grammarly.com' },
      { name: 'Jasper', domain: 'jasper.ai' },
      { name: 'Copy.ai', domain: 'copy.ai' },
      { name: 'Descript', domain: 'descript.com' },
      { name: 'Otter.ai', domain: 'otter.ai' },
      { name: 'ElevenLabs', domain: 'elevenlabs.io' },
      { name: 'Runway', domain: 'runwayml.com' },
      { name: 'Pika', domain: 'pika.art' },
      { name: 'HeyGen', domain: 'heygen.com' },
      { name: 'Gamma', domain: 'gamma.app' },
      { name: 'Tome', domain: 'tome.app' },
      { name: 'Leonardo.ai', domain: 'leonardo.ai' },
      { name: 'Phind', domain: 'phind.com' },
      { name: 'Warp', domain: 'warp.dev' },
      { name: 'Raycast Pro', domain: 'raycast.com' },
      { name: 'Tabnine', domain: 'tabnine.com' },
      { name: 'GitHub Copilot', domain: 'github.com' },
      { name: 'Poe', domain: 'poe.com' },
      { name: 'Character.ai', domain: 'character.ai' }
    ]
  }
];

export function initCatalog() {
  const catalogModal = document.getElementById('catalog-modal');
  const openCatalogBtn = document.getElementById('open-all-subs-btn');
  const closeCatalogBtn = document.getElementById('close-catalog');
  const catalogGrid = document.getElementById('catalog-grid');
  const searchBar = document.getElementById('catalog-search-bar');
  const searchInput = document.getElementById('catalog-search-input');
  const cancelSearchBtn = document.getElementById('cancel-catalog-search');

  if (!catalogModal || !openCatalogBtn || !catalogGrid) return;

  // Global helper for the Smart Import banner button injected inside the grid
  window.catalogModalCloseAndOpenSmartImport = () => {
    if (window.openSmartImport) window.openSmartImport();
    // Delay hiding catalog modal slightly to ensure new modal is painted first
    // This avoids seeing the main app screen flash behind.
    setTimeout(() => {
        catalogModal.classList.add('hidden');
    }, 100);
  };

  // Smart Import animated typography logic
  let smartImportTypoTimer = null;
  let smartImportPhraseIdx = 0;
  const smartImportPhrases = [
    { text: "Add subscriptions from your email", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>` },
    { text: "Find all subs from bank statement", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21v-8"/><path d="M19 21v-8"/><path d="M9 21v-8"/><path d="M15 21v-8"/><path d="M12 4 5 10h14Z"/></svg>` },
    { text: "Upload a PDF, find your subs", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>` },
    { text: "Scan receipts, catch every sub", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>` },
    { text: "Import from CSV in seconds", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>` },
    { text: "Connect Gmail, we find the rest", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.2 8.4c.5.3.8.8.8 1.4v10.2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.8c0-.6.3-1.1.8-1.4l8-5.3c.7-.5 1.7-.5 2.4 0l8 5.3Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>` },
    { text: "Drop your statement, we do the work", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.55 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><path d="M12 10v6"/><path d="m9 13 3-3 3 3"/></svg>` },
    { text: "Find hidden subs from your inbox", icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>` }
  ];
  
  function animateSmartImportTypography() {
    const container = document.getElementById('smart-import-text-container');
    const iconContainer = document.getElementById('smart-import-dynamic-icon');
    if (!container) return;
    
    container.innerHTML = '';
    const currentData = smartImportPhrases[smartImportPhraseIdx];
    const words = currentData.text.split(' ');
    
    if (iconContainer && iconContainer.innerHTML !== currentData.icon) {
      iconContainer.innerHTML = currentData.icon;
      iconContainer.style.animation = 'none';
      void iconContainer.offsetWidth; // trigger reflow
      iconContainer.style.animation = 'iconRotateIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }

    words.forEach((word, idx) => {
      const span = document.createElement('span');
      span.innerText = word;
      span.className = 'smart-import-word';
      span.style.animationDelay = `${idx * 0.15}s`;
      container.appendChild(span);
    });
    
    const finishTime = 2200 + (words.length * 150);
    smartImportTypoTimer = setTimeout(() => {
      if (!document.getElementById('smart-import-text-container')) return;
      container.style.transition = 'opacity 0.4s ease';
      container.style.opacity = '0';
      if (iconContainer) {
        iconContainer.style.transition = 'opacity 0.4s ease';
        iconContainer.style.opacity = '0';
      }
      smartImportTypoTimer = setTimeout(() => {
        container.style.transition = 'none';
        container.style.opacity = '1';
        if (iconContainer) {
          iconContainer.style.transition = 'none';
          iconContainer.style.opacity = '1';
        }
        smartImportPhraseIdx = (smartImportPhraseIdx + 1) % smartImportPhrases.length;
        animateSmartImportTypography();
      }, 400);
    }, finishTime);
  }

  // Render Catalog
  function render(filter = '') {
    const filteredData = CATALOG_DATA.map(cat => {
      const apps = cat.apps.filter(app => app.name.toLowerCase().includes(filter.toLowerCase()));
      return { ...cat, apps };
    }).filter(cat => cat.apps.length > 0);

    if (filteredData.length === 0) {
      const escapedFilter = filter.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
      const jsSanitizedFilter = filter.replace(/'/g, "\\'");
      
      catalogGrid.innerHTML = `
        <div class="no-results" onclick="window.selectCatalogApp('${jsSanitizedFilter}', '')">
          <p style="margin-bottom: 8px; font-weight: 700; color: rgba(255,255,255,0.8);">No matching found!</p>
          <span class="add-custom-link">
            Add a customized subscription: <strong>"${escapedFilter}"</strong>
          </span>
        </div>`;
      return;
    }

    catalogGrid.innerHTML = filteredData.map(cat => `
      <div class="catalog-category">
        <h3 class="catalog-category-title">${cat.category}</h3>
        <div class="catalog-apps-grid">
          ${cat.apps.map((app, index) => {
            const logoUrl = window.getLogoUrl(app.domain);
            let smartImportHtml = '';
            
            // Inject Smart Import Banner in Streaming category on the second row (after 4th item)
            if (cat.category === 'Streaming' && index === 4 && filter === '') {
              smartImportHtml = `
                <div style="grid-column: 1 / -1;">
                  <button id="smart-import-banner-btn" class="smart-import-banner" aria-label="Sublify Sync" onclick="window.catalogModalCloseAndOpenSmartImport()">
                    <div class="space-bg" style="border-radius: 25px;">
                      <div class="stars"></div>
                      <div class="stars2"></div>
                      <div class="stars3"></div>
                      <div class="shooting-star" style="top: -20px; right: 20%; animation-duration: 6s;"></div>
                      <div class="shooting-star" style="top: 50%; right: 40%; animation-duration: 9s; animation-delay: 3s;"></div>
                    </div>
                    <div class="smart-import-banner-logo">
                      <img src="/sublify-logo.png" alt="Sublify">
                    </div>
                    <div class="smart-import-banner-text" style="text-align: left;">
                      <span class="smart-import-banner-title">Sublify Sync</span>
                      <div class="smart-import-typo-container">
                        <div id="smart-import-text-container" class="smart-import-text-wrapper"></div>
                      </div>
                    </div>
                    <div id="smart-import-dynamic-icon" class="smart-import-banner-arrow"></div>
                  </button>
                </div>
              `;
            }

            // Use an inline fallback for broken images to keep it looking premium
            return smartImportHtml + `
              <div class="catalog-app-card" onclick="window.selectCatalogApp('${app.name}', '${app.domain}')">
                <div class="catalog-app-icon">
                  <img src="${logoUrl}" alt="${app.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                  <div class="catalog-app-icon-fallback" style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); font-weight: 700; font-size: 1.1rem; border-radius: 12px; font-family: 'Roboto Mono', monospace;">
                    ${app.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span class="catalog-app-name">${app.name}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    clearTimeout(smartImportTypoTimer);
    if (document.getElementById('smart-import-text-container')) {
      animateSmartImportTypography();
    }
  }

  // Initial render
  render();

  // Search Logic
  searchInput.addEventListener('focus', () => {
    searchBar.classList.add('active');
    // Ensure the top category isn't covered by search bar - tightly matched to bar height
    catalogGrid.style.paddingTop = '68px';
    // Auto-scroll catalog to top as requested
    catalogGrid.scrollTo({ top: 0, behavior: 'smooth' });
    // Remove the scroll lock - Let users scroll freely
    catalogGrid.style.overflow = 'auto';
  });

  searchInput.addEventListener('blur', () => {
    // Only remove active if empty
    if (searchInput.value === '') {
      searchBar.classList.remove('active');
      catalogGrid.style.paddingTop = '0';
    }
  });

  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    render(val);
  });

  cancelSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    render('');
    searchBar.classList.remove('active');
    catalogGrid.style.paddingTop = '0';
    catalogGrid.style.overflow = 'auto';
  });

  // Scroll Behavior Logic (Auto-hide search bar)
  let lastScrollY = 0;
  catalogGrid.addEventListener('scroll', () => {
    const currentScrollY = catalogGrid.scrollTop;
    
    // Only auto-hide if NOT searching (not active)
    if (!searchBar.classList.contains('active')) {
      // Threshold: only start hiding after minor scroll
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Scrolling DOWN -> Hide
        searchBar.classList.add('hidden-scrolled');
      } else {
        // Scrolling UP -> Show
        searchBar.classList.remove('hidden-scrolled');
      }
    }
    
    lastScrollY = currentScrollY;
  }, { passive: true });

  // Open Catalog
  openCatalogBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    catalogModal.classList.remove('hidden');
    searchInput.value = '';
    render('');
    searchBar.classList.remove('hidden-scrolled');
  });

  // Close Catalog
  closeCatalogBtn.addEventListener('click', () => {
    catalogModal.classList.add('hidden');
  });

  // Plus button in Catalog (Go back to empty Add Modal)
  const catalogPlusBtn = document.getElementById('catalog-plus-btn');
  if (catalogPlusBtn) {
    catalogPlusBtn.addEventListener('click', () => {
      catalogModal.classList.add('hidden');
      const addModal = document.getElementById('add-modal');
      const form = document.getElementById('sub-form');
      form.reset();
      window.editingSubId = null;
      if (window.updatePlatformIcon) window.updatePlatformIcon(null);
      addModal.querySelector('h2').innerHTML = `ADD SUBSCRIPTION`;
      if (window.setFormDefaultCurrency) window.setFormDefaultCurrency();
      addModal.classList.remove('hidden');
    });
  }

  // Global selection function
  window.selectCatalogApp = (name, domain) => {
    const addModal = document.getElementById('add-modal');
    const form = document.getElementById('sub-form');

    // 1. Pre-fill Name & Domain while catalog is still visible (Seamless)
    form.reset();
    window.editingSubId = null; 
    const nameInput = document.getElementById('sub-name');
    nameInput.value = name;
    document.getElementById('sub-domain').value = domain;
    
    // Manually trigger the input event to activate logo fetching logic in main.js
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    addModal.querySelector('h2').innerHTML = `ADD SUBSCRIPTION`;
    if (window.setFormDefaultCurrency) window.setFormDefaultCurrency();

    // 2. Immediate switch (No delay to avoid background flash)
    addModal.classList.remove('hidden');
    catalogModal.classList.add('hidden');

    // Populate Nexus dropdown if function is available
    if (window.populatePaymentCardsDropdown) {
        window.populatePaymentCardsDropdown();
    }
  };
}

