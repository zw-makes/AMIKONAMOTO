import './search.css';

export function openSearchModal() {
    let overlay = document.getElementById('search-modal-overlay');
    if (!overlay) {
        overlay = createSearchModal();
    }
    overlay.classList.remove('hidden');

    // Slight timeout allows display:block to apply before animation/focus
    setTimeout(() => {
        const input = document.getElementById('search-input');
        input.value = '';
        input.blur(); // Ensure it starts unfocused so it stays in the middle
        renderResults('');
        const container = document.getElementById('search-container');
        container.classList.remove('search-active');
        document.getElementById('search-results').classList.add('hidden');
    }, 10);
}

function createSearchModal() {
    const overlay = document.createElement('div');
    overlay.id = 'search-modal-overlay';
    overlay.className = 'modal-overlay hidden';

    overlay.innerHTML = `
        <div id="search-container" class="search-container glass">
            <div class="search-bar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="search-icon">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input type="text" id="search-input" placeholder="Search subscriptions..." autocomplete="off">
                <button id="close-search-btn" class="nav-arrow" style="background: transparent; border: none; cursor: pointer; color: var(--text-secondary);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div id="search-results" class="search-results hidden">
                <div id="search-results-list"></div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('close-search-btn');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.classList.add('hidden');
    });

    // Close when clicking outside the container
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
    });

    const input = document.getElementById('search-input');
    const container = document.getElementById('search-container');
    const results = document.getElementById('search-results');

    input.addEventListener('focus', () => {
        // Do nothing initially on focus
        const val = input.value;
        if (val.trim()) {
            container.classList.add('search-active');
            results.classList.remove('hidden');
        }
    });

    input.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.trim()) {
            container.classList.add('search-active');
            results.classList.remove('hidden');
            renderResults(val);
        } else {
            container.classList.remove('search-active');
            results.classList.add('hidden');
        }
    });

    return overlay;
}

function getDomain(sub) {
    const brandMap = {
        'netflix': 'netflix.com', 'spotify': 'spotify.com', 'amazon': 'amazon.com',
        'prime': 'amazon.com', 'youtube': 'youtube.com', 'apple': 'apple.com',
        'disney': 'disneyplus.com', 'hulu': 'hulu.com', 'adobe': 'adobe.com',
        'figma': 'figma.com', 'slack': 'slack.com', 'google': 'google.com',
        'hbo': 'max.com', 'canva': 'canva.com', 'notion': 'notion.so'
    };
    let nameLower = sub.name.toLowerCase().trim();
    let domain = sub.domain || brandMap[nameLower] || nameLower.replace(/\s+/g, '') + '.com';
    if (domain.startsWith('http')) {
        try { domain = new URL(domain).hostname; } catch (e) { }
    }
    return domain;
}

function renderResults(query) {
    const list = document.getElementById('search-results-list');
    const subs = window.subscriptions || [];

    if (!query.trim()) {
        list.innerHTML = '<div class="search-empty">Type to search your subscriptions</div>';
        return;
    }

    const filtered = subs.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

    if (filtered.length === 0) {
        list.innerHTML = `<div class="search-empty">No results found for "${query}"</div>`;
        return;
    }

    list.innerHTML = filtered.map(sub => {
        const domain = getDomain(sub);
        const logoUrl = `https://icon.horse/icon/${domain}`;

        // Convert to valid JSON string for our data attribute
        const subData = encodeURIComponent(JSON.stringify(sub));

        return `
            <div class="search-result-item" data-sub="${subData}">
                <div class="search-result-icon">
                    <img src="${logoUrl}" alt="${sub.name}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'white\\' stroke-width=\\'2\\'><rect width=\\'18\\' height=\\'18\\' x=\\'3\\' y=\\'3\\' rx=\\'2\\'/></svg>'">
                </div>
                <div class="search-result-details">
                    <div class="search-result-name">${sub.name}</div>
                    <div class="search-result-type">${sub.type} • ${sub.currency || '$'} ${sub.price}</div>
                </div>
            </div>
        `;
    }).join('');

    // Attach click events
    const items = list.querySelectorAll('.search-result-item');
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            const overlay = document.getElementById('search-modal-overlay');
            overlay.classList.add('hidden');

            try {
                const subObj = JSON.parse(decodeURIComponent(item.dataset.sub));
                if (typeof window.showDayDetails === 'function') {
                    // Pass the single selected sub in an array
                    window.showDayDetails(subObj.date, [subObj]);
                }
            } catch (err) {
                console.error('Failed to parse search result click:', err);
            }
        });
    });
}
