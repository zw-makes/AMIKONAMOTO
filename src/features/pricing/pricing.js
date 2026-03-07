// Pricing Feature Module — Pure Vanilla JS (no React/Tailwind needed)
import './pricing.css';

// ─── Electric Border Canvas Effect ─────────────────────────────────────────
function hexToRgba(hex, alpha = 1) {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const int = parseInt(h, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r},${g},${b},${alpha})`;
}

function createElectricBorder(wrapper, color = '#7df9ff', speed = 1, chaos = 0.12) {
    const canvas = document.createElement('canvas');
    canvas.className = 'electric-canvas';
    wrapper.appendChild(canvas);

    // Glow layers
    const glowBase = document.createElement('div');
    glowBase.className = 'electric-glow-base';
    glowBase.style.border = `2px solid ${hexToRgba(color, 0.5)}`;
    glowBase.style.filter = 'blur(1px)';
    glowBase.style.borderRadius = 'inherit';
    wrapper.appendChild(glowBase);

    const glowHard = document.createElement('div');
    glowHard.className = 'electric-glow-hard';
    glowHard.style.border = `2px solid ${color}`;
    glowHard.style.filter = 'blur(4px)';
    glowHard.style.borderRadius = 'inherit';
    wrapper.appendChild(glowHard);

    const bloom = document.createElement('div');
    bloom.className = 'electric-bg-bloom';
    bloom.style.background = `linear-gradient(-30deg, ${color}, transparent, ${color})`;
    bloom.style.filter = 'blur(32px)';
    bloom.style.borderRadius = 'inherit';
    wrapper.appendChild(bloom);

    const ctx = canvas.getContext('2d');
    let animId = null;
    let timeRef = 0;
    let lastFrameTime = 0;
    const displacement = 20;  // wave displacement
    const borderOffset = 24;  // canvas MUST be larger than card to not clip the stroke

    function rand(x) { return ((Math.sin(x * 12.9898) * 43758.5453) % 1 + 1) % 1; }
    function noise2D(x, y) {
        const i = Math.floor(x), j = Math.floor(y);
        const fx = x - i, fy = y - j;
        const a = rand(i + j * 57), b = rand(i + 1 + j * 57);
        const c = rand(i + (j + 1) * 57), d = rand(i + 1 + (j + 1) * 57);
        const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
        return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy;
    }
    function octavedNoise(x, seed, t) {
        let y = 0, amp = chaos, freq = 10, octaves = 10;
        for (let i = 0; i < octaves; i++) {
            y += amp * noise2D(freq * x + seed * 100, t * freq * 0.3);
            freq *= 1.6; amp *= 0.7;
        }
        return y;
    }

    function getCorner(cx, cy, radius, startAngle, arc, progress) {
        const angle = startAngle + progress * arc;
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
    }

    function getRoundedRectPoint(t, left, top, w, h, radius) {
        const sw = w - 2 * radius, sh = h - 2 * radius;
        const cArc = (Math.PI * radius) / 2;
        const perimeter = 2 * sw + 2 * sh + 4 * cArc;
        let d = t * perimeter, acc = 0;

        if (d <= acc + sw) return { x: left + radius + (d - acc) / sw * sw, y: top };
        acc += sw;
        if (d <= acc + cArc) return getCorner(left + w - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, (d - acc) / cArc);
        acc += cArc;
        if (d <= acc + sh) return { x: left + w, y: top + radius + (d - acc) / sh * sh };
        acc += sh;
        if (d <= acc + cArc) return getCorner(left + w - radius, top + h - radius, radius, 0, Math.PI / 2, (d - acc) / cArc);
        acc += cArc;
        if (d <= acc + sw) return { x: left + w - radius - (d - acc) / sw * sw, y: top + h };
        acc += sw;
        if (d <= acc + cArc) return getCorner(left + radius, top + h - radius, radius, Math.PI / 2, Math.PI / 2, (d - acc) / cArc);
        acc += cArc;
        if (d <= acc + sh) return { x: left, y: top + h - radius - (d - acc) / sh * sh };
        acc += sh;
        return getCorner(left + radius, top + radius, radius, Math.PI, Math.PI / 2, (d - acc) / cArc);
    }

    function updateSize() {
        const rect = wrapper.getBoundingClientRect();
        const w = rect.width + borderOffset * 2;
        const h = rect.height + borderOffset * 2;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
        return { w, h };
    }

    let { w, h } = updateSize();

    function draw(currentTime) {
        const delta = (currentTime - lastFrameTime) / 1000;
        timeRef += delta * speed; lastFrameTime = currentTime;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = color; ctx.lineWidth = 1.5;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';

        const left = borderOffset, top = borderOffset;
        const bw = w - 2 * borderOffset, bh = h - 2 * borderOffset;
        const radius = Math.min(34, Math.min(bw, bh) / 2);
        const perimeter = 2 * (bw + bh);
        const samples = Math.floor(perimeter / 2);

        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const progress = i / samples;
            const pt = getRoundedRectPoint(progress, left, top, bw, bh, radius);
            const dx = octavedNoise(progress * 8, 0, timeRef) * displacement;
            const dy = octavedNoise(progress * 8, 1, timeRef) * displacement;
            if (i === 0) ctx.moveTo(pt.x + dx, pt.y + dy);
            else ctx.lineTo(pt.x + dx, pt.y + dy);
        }
        ctx.closePath(); ctx.stroke();
        animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(() => { const s = updateSize(); w = s.w; h = s.h; });
    ro.observe(wrapper);
    animId = requestAnimationFrame(draw);

    return () => { cancelAnimationFrame(animId); ro.disconnect(); };
}

// ─── Plans Data ─────────────────────────────────────────────────────────────
function getPlans(annual) {
    return [
        {
            name: 'Free',
            badge: 'free-badge',
            badgeText: 'FREE',
            color: '#a3a3a3',
            monthly: 0,
            annual: 0,
            ctaClass: 'free-cta',
            ctaText: 'Current Plan',
            features: [
                { text: 'Up to 5 subscriptions', active: true },
                { text: 'Calendar view', active: true },
                { text: 'Monthly totals', active: true },
                { text: 'Currency support', active: true },
                { text: 'Notifications', active: false },
                { text: 'Export reports', active: false },
                { text: 'AI insights', active: false },
            ]
        },
        {
            name: 'Pro',
            badge: 'pro-badge',
            badgeText: 'PRO',
            color: '#7df9ff',
            monthly: 4.99,
            annual: 3.49,
            ctaClass: 'pro-cta',
            ctaText: 'Get Pro',
            features: [
                { text: 'Unlimited subscriptions', active: true },
                { text: 'Calendar view', active: true },
                { text: 'Monthly totals', active: true },
                { text: 'All currency support', active: true },
                { text: 'Notifications & reminders', active: true },
                { text: 'Export reports (CSV/PDF)', active: true },
                { text: 'AI insights', active: false },
            ]
        },
        {
            name: 'Elite',
            badge: 'elite-badge',
            badgeText: 'ELITE',
            color: '#bf5af2',
            monthly: 9.99,
            annual: 6.99,
            ctaClass: 'elite-cta',
            ctaText: 'Go Elite',
            features: [
                { text: 'Everything in Pro', active: true },
                { text: 'AI-powered insights', active: true },
                { text: 'Smart budget advisor', active: true },
                { text: 'Priority support', active: true },
                { text: 'Multi-device sync', active: true },
                { text: 'Early access to features', active: true },
                { text: 'Custom themes & icons', active: true },
            ]
        }
    ];
}

function renderPricing(annual) {
    const grid = document.getElementById('pricing-grid');
    if (!grid) return;

    // Destroy previous canvases
    grid.innerHTML = '';
    const cleanups = [];
    const wrappers = [];

    const plans = getPlans(annual);

    plans.forEach(plan => {
        const price = annual ? plan.annual : plan.monthly;
        const priceDisplay = price === 0 ? 'Free' : `$${price.toFixed(2)}`;

        const wrapper = document.createElement('div');
        wrapper.className = 'electric-card-wrapper';

        const inner = document.createElement('div');
        inner.className = 'electric-card-inner';
        inner.innerHTML = `
      <span class="pricing-badge ${plan.badge}">${plan.badgeText}</span>
      <div class="pricing-plan-name">${plan.name}</div>
      <div class="pricing-price">
        ${price > 0 ? `<span class="pricing-currency">$</span>` : ''}
        <span class="pricing-amount">${price === 0 ? '0' : price.toFixed(2)}</span>
        ${price > 0 ? `<span class="pricing-period">/ ${annual ? 'mo' : 'mo'}</span>` : ''}
      </div>
      ${annual && price > 0 ? `<span style="font-size:0.6rem; color:#00ff88; font-weight:600;">Billed $${(price * 12).toFixed(2)} annually</span>` : ''}
      <ul class="pricing-features">
        ${plan.features.map(f => `
          <li class="${f.active ? '' : 'disabled'}">
            <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="${f.active ? plan.color : 'currentColor'}" stroke-width="2.5">
              ${f.active
                ? '<path d="M20 6L9 17l-5-5"/>'
                : '<path d="M18 6L6 18M6 6l12 12"/>'}
            </svg>
            ${f.text}
          </li>
        `).join('')}
      </ul>
      <button class="pricing-cta-btn ${plan.ctaClass}">${plan.ctaText}</button>
    `;

        wrapper.appendChild(inner);
        grid.appendChild(wrapper);

        // Start the electric animation — speed 1.2, chaos 0.2, radius 34
        const cleanup = createElectricBorder(wrapper, plan.color, 1.2, 0.2);
        cleanups.push(cleanup);
        wrappers.push(wrapper);
    });

    // --- Dots (removed for vertical layout) ---
    const dotsEl = document.getElementById('pricing-dots');
    if (dotsEl) dotsEl.innerHTML = '';

    return () => cleanups.forEach(fn => fn && fn());
}

// ─── Init Function ───────────────────────────────────────────────────────────
export function initPricing() {
    const pricingBtn = document.getElementById('pricing-btn');
    const pricingModal = document.getElementById('pricing-modal');
    const closePricingBtn = document.getElementById('close-pricing');
    const monthlyToggle = document.getElementById('pricing-monthly-toggle');
    const annualToggle = document.getElementById('pricing-annual-toggle');
    const billingSwitch = document.getElementById('pricing-billing-switch');

    if (!pricingBtn || !pricingModal) return;

    let isAnnual = false;
    let cleanupFn = null;

    pricingBtn.addEventListener('click', () => {
        if (cleanupFn) cleanupFn();
        cleanupFn = renderPricing(isAnnual);
        pricingModal.classList.remove('hidden');
    });

    closePricingBtn?.addEventListener('click', () => {
        pricingModal.classList.add('hidden');
        if (cleanupFn) { cleanupFn(); cleanupFn = null; }
    });

    pricingModal?.addEventListener('click', (e) => {
        if (e.target === pricingModal) {
            pricingModal.classList.add('hidden');
            if (cleanupFn) { cleanupFn(); cleanupFn = null; }
        }
    });

    // Annual / Monthly toggle
    function setToggle(annual) {
        isAnnual = annual;
        if (billingSwitch) billingSwitch.checked = annual;

        if (annual) {
            annualToggle?.classList.add('active');
            monthlyToggle?.classList.remove('active');
        } else {
            monthlyToggle?.classList.add('active');
            annualToggle?.classList.remove('active');
        }
        if (cleanupFn) cleanupFn();
        cleanupFn = renderPricing(isAnnual);
    }

    monthlyToggle?.addEventListener('click', () => setToggle(false));
    annualToggle?.addEventListener('click', () => setToggle(true));
    billingSwitch?.addEventListener('change', () => setToggle(billingSwitch.checked));

    // Pre-init: don't render until opened
    document.getElementById('pricing-grid').innerHTML = '';
}
