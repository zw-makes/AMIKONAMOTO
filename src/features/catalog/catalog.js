
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
      { name: 'Amazon Prime', domain: 'amazon.com' }
    ]
  },
  {
    category: 'Productivity',
    apps: [
      { name: 'Notion', domain: 'notion.so' },
      { name: 'Slack', domain: 'slack.com' },
      { name: 'Google Workspace', domain: 'google.com' },
      { name: 'Coda', domain: 'coda.io' },
      { name: 'Evernote', domain: 'evernote.com' },
      { name: 'Microsoft 365', domain: 'microsoft.com' },
      { name: 'Zoom', domain: 'zoom.us' },
      { name: 'Todoist', domain: 'todoist.com' }
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
      { name: 'CapCut', domain: 'capcut.com' }
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
      { name: 'IntelliJ IDEA', domain: 'jetbrains.com' }
    ]
  },
  {
    category: 'AI Tools',
    apps: [
      { name: 'ChatGPT', domain: 'openai.com' },
      { name: 'Claude', domain: 'anthropic.com' },
      { name: 'Perplexity', domain: 'perplexity.ai' },
      { name: 'Grammarly', domain: 'grammarly.com' },
      { name: 'Jasper', domain: 'jasper.ai' },
      { name: 'Copy.ai', domain: 'copy.ai' },
      { name: 'Descript', domain: 'descript.com' },
      { name: 'Otter.ai', domain: 'otter.ai' }
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

  // Render Catalog
  function render(filter = '') {
    const filteredData = CATALOG_DATA.map(cat => {
      const apps = cat.apps.filter(app => app.name.toLowerCase().includes(filter.toLowerCase()));
      return { ...cat, apps };
    }).filter(cat => cat.apps.length > 0);

    if (filteredData.length === 0) {
      catalogGrid.innerHTML = `<div class="no-results">No subscriptions found matching "${filter}"</div>`;
      return;
    }

    catalogGrid.innerHTML = filteredData.map(cat => `
      <div class="catalog-category">
        <h3 class="catalog-category-title">${cat.category}</h3>
        <div class="catalog-apps-grid">
          ${cat.apps.map(app => `
            <div class="catalog-app-card" onclick="window.selectCatalogApp('${app.name}', '${app.domain}')">
              <div class="catalog-app-icon">
                <img src="https://icon.horse/icon/${app.domain}" alt="${app.name}">
              </div>
              <span class="catalog-app-name">${app.name}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Initial render
  render();

  // Search Logic
  searchInput.addEventListener('focus', () => {
    searchBar.classList.add('active');
    // Ensure the top category isn't covered by search bar
    catalogGrid.style.paddingTop = '80px';
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
    document.getElementById('sub-name').value = name;
    document.getElementById('sub-domain').value = domain;
    if (window.updatePlatformIcon) window.updatePlatformIcon(domain);
    addModal.querySelector('h2').innerHTML = `ADD SUBSCRIPTION`;

    // 2. Immediate switch (No delay to avoid background flash)
    addModal.classList.remove('hidden');
    catalogModal.classList.add('hidden');
  };
}
