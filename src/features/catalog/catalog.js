
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

  if (!catalogModal || !openCatalogBtn || !catalogGrid) return;

  // Render Catalog
  catalogGrid.innerHTML = CATALOG_DATA.map(cat => `
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

  // Open Catalog
  openCatalogBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    catalogModal.classList.remove('hidden');
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
