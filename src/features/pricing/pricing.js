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

function createElectricBorder(wrapper, color = '#7df9ff', speed = 1, chaos = 0.12, ambient = false) {
    const canvas = document.createElement('canvas');
    canvas.className = 'electric-canvas';
    wrapper.appendChild(canvas);

    if (ambient) {
        const glow = document.createElement('div');
        glow.className = 'ambient-glow-layer';
        glow.style.boxShadow = `0 0 60px 10px ${hexToRgba(color, 0.2)}`;
        wrapper.appendChild(glow);
    }

    const ctx = canvas.getContext('2d');
    let animId = null;
    let timeRef = 0;
    let lastFrameTime = 0;
    const displacement = ambient ? 12 : 8;
    const borderOffset = 60;

    // --- Particle System (Magnet Effect) ---
    const particles = [];
    const particleCount = ambient ? 40 : 15;

    function createParticle(w, h) {
        // Spawn on the outer edges of the canvas (outside the card)
        let x, y;
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { x = Math.random() * w; y = 0; }
        else if (side === 1) { x = w; y = Math.random() * h; }
        else if (side === 2) { x = Math.random() * w; y = h; }
        else { x = 0; y = Math.random() * h; }

        return {
            x, y,
            vx: 0, vy: 0,
            size: Math.random() * 1.5 + 0.3,
            opacity: Math.random() * 0.4 + 0.1,
            life: Math.random() * 150 + 50
        };
    }

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
        const w_base = wrapper.offsetWidth;
        const h_base = wrapper.offsetHeight;
        const w = w_base + borderOffset * 2;
        const h = h_base + borderOffset * 2;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr; canvas.height = h * dpr;
        canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;

        // Init particles
        particles.length = 0;
        for (let i = 0; i < particleCount; i++) particles.push(createParticle(w, h));

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

        const left = borderOffset, top = borderOffset;
        const bw = w - 2 * borderOffset, bh = h - 2 * borderOffset;
        const radius = Math.min(34, Math.min(bw, bh) / 2);
        const perimeter = 2 * (bw + bh);
        const samples = Math.floor(perimeter / 2);

        // 1. Draw Energy Base (Dimmer trail)
        ctx.strokeStyle = color; ctx.lineWidth = ambient ? 1.5 : 0.8;
        ctx.globalAlpha = 0.2;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (ambient) { ctx.shadowBlur = 10; ctx.shadowColor = color; }

        const borderPoints = [];
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const progress = i / samples;
            const pt = getRoundedRectPoint(progress, left, top, bw, bh, radius);
            const jitterX = (Math.random() - 0.5) * (ambient ? 3 : 1);
            const jitterY = (Math.random() - 0.5) * (ambient ? 3 : 1);
            const dx = octavedNoise(progress * 8, 0, timeRef) * displacement + jitterX;
            const dy = octavedNoise(progress * 8, 1, timeRef) * displacement + jitterY;
            const finalX = pt.x + dx;
            const finalY = pt.y + dy;
            borderPoints.push({ x: finalX, y: finalY });
            if (i === 0) ctx.moveTo(finalX, finalY);
            else ctx.lineTo(finalX, finalY);
        }
        ctx.closePath(); ctx.stroke();

        // 2. COUNTER-FLOW (Opposite Direction Dimmer)
        if (ambient) {
            ctx.globalAlpha = 0.15;
            const counterFlow = (timeRef * (samples * -0.25)) % samples;
            const segLen = Math.floor(samples * 0.4);
            ctx.beginPath();
            for (let i = 0; i < segLen; i++) {
                const idx = (Math.floor(counterFlow) + i + samples) % samples;
                const pt = borderPoints[idx];
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);
            }
            ctx.stroke();
        }

        // 3. MAIN HOT FLOW (Circulating Effect)
        ctx.globalAlpha = 1.0;
        ctx.lineWidth = ambient ? 3.5 : 2.2;
        if (ambient) { ctx.shadowBlur = 35; }

        const segmentCount = ambient ? 2 : 1;
        const segmentLength = Math.floor(samples * (ambient ? 0.35 : 0.25));
        const flowTime = timeRef * (samples * 0.4);

        for (let s = 0; s < segmentCount; s++) {
            const startIdx = Math.floor(flowTime + (s * (samples / segmentCount))) % samples;
            ctx.beginPath();
            for (let i = 0; i < segmentLength; i++) {
                const idx = (startIdx + i) % samples;
                const pt = borderPoints[idx];
                if (i === 0) ctx.moveTo(pt.x, pt.y);
                else ctx.lineTo(pt.x, pt.y);

                // Lightning Arcs (Discharge)
                if (ambient && Math.random() < 0.015 && i % 25 === 0) {
                    const arcX = pt.x + (Math.random() - 0.5) * 40;
                    const arcY = pt.y + (Math.random() - 0.5) * 40;
                    ctx.lineTo(arcX, arcY);
                    ctx.moveTo(pt.x, pt.y);
                }
            }
            ctx.stroke();
        }

        // 2. Update & Draw Particles (Magnet Effect)
        ctx.shadowBlur = 0; // Turn off glow for small particles to save perf
        particles.forEach(p => {
            // Find nearest point on border
            let minDist = Infinity;
            let target = borderPoints[0];
            // Sampling for performance
            for (let i = 0; i < borderPoints.length; i += 10) {
                const dx = borderPoints[i].x - p.x;
                const dy = borderPoints[i].y - p.y;
                const d = dx * dx + dy * dy;
                if (d < minDist) { minDist = d; target = borderPoints[i]; }
            }

            // Apply magnetic pull
            const angle = Math.atan2(target.y - p.y, target.x - p.x);
            const force = (ambient ? 25 : 10) / (Math.sqrt(minDist) + 5);
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;

            // Add air resistance
            p.vx *= 0.92; p.vy *= 0.92;

            p.x += p.vx; p.y += p.vy;
            p.life -= 0.5;

            // Avoid inside of card (X/Y check against card boundary)
            const margin = 10;
            const isInside = p.x > (left + margin) && p.x < (left + bw - margin) &&
                p.y > (top + margin) && p.y < (top + bh - margin);

            // Draw particle
            ctx.fillStyle = color;
            ctx.globalAlpha = p.opacity;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            // Reset if hit the border (harvested), gone inside, or life finished
            if (minDist < 4 || isInside || p.life <= 0) {
                const newP = createParticle(w, h);
                Object.assign(p, newP);
            }
        });

        ctx.globalAlpha = 1;
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
            name: 'Common',
            badge: 'free-badge',
            badgeText: 'FREE',
            color: '#ffffff',
            monthly: 0,
            annual: 0,
            ctaClass: 'free-cta',
            ctaText: 'Stay Common',
            description: 'The baseline experience for everyone.',
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
            name: 'The Purpose',
            badge: 'pro-badge',
            badgeText: 'PRO',
            color: '#00d2ff',
            monthly: 4.99,
            annual: 3.49,
            ctaClass: 'pro-cta',
            ctaText: 'Have a Purpose',
            description: 'SO HUNGRY TO KILL',
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
            name: 'The Sovereign',
            badge: 'elite-badge',
            badgeText: 'ELITE',
            color: '#ff3131', // Pure red
            monthly: 9.99,
            annual: 6.99,
            ctaClass: 'elite-cta',
            ctaText: 'Be the Sovereign',
            description: 'WAY MORE HUNGRY',
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

        const bgText = document.createElement('div');
        bgText.className = 'pricing-bg-text';
        bgText.innerText = 'Pricing';
        wrapper.appendChild(bgText);

        const inner = document.createElement('div');
        inner.className = 'electric-card-inner';
        inner.innerHTML = `
      <div class="pricing-card-top">
        <div class="pricing-plan-name">${plan.name}</div>
        <div class="pricing-price">
          ${price > 0 ? `<span class="pricing-currency">$</span>` : ''}
          <span class="pricing-amount">${price === 0 ? '0' : Math.floor(price)}</span>
          ${price > 0 ? `<span class="pricing-period">.${(price % 1).toFixed(2).split('.')[1]} /monthly</span>` : ''}
        </div>
        <div class="pricing-plan-desc">${plan.description}</div>
      </div>
      
      <div class="pricing-card-divider"></div>
      
      <div class="pricing-card-bottom">
        <ul class="pricing-features">
          ${plan.features.map(f => `
            <li class="${f.active ? '' : 'disabled'}">
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
                ${f.active
                ? '<path d="M20 6L9 17l-5-5"/>'
                : '<path d="M18 6L6 18M6 6l12 12"/>'}
              </svg>
              ${f.text}
            </li>
          `).join('')}
        </ul>
        <button class="pricing-cta-btn ${plan.ctaClass}">${plan.ctaText}</button>
      </div>
    `;

        wrapper.appendChild(inner);
        grid.appendChild(wrapper);

        // Start the electric animation with distinct speed/chaos/ambient per card
        let speedVal = 1.2;
        let chaosVal = 0.2;
        let isAmbient = false;

        if (plan.name === 'The Purpose') {
            speedVal = 1.1; // Slower, more elegant
            chaosVal = 0.4;
            isAmbient = true;
        } else if (plan.name === 'The Sovereign') {
            speedVal = 1.4; // Controlled power
            chaosVal = 0.6;
            isAmbient = true;
        }

        const cleanup = createElectricBorder(wrapper, plan.color, speedVal, chaosVal, isAmbient);
        cleanups.push(cleanup);
        wrappers.push(wrapper);
    });

    // --- Horizontal Dots Logic ---
    const dotsEl = document.getElementById('pricing-dots');
    if (dotsEl) {
        dotsEl.innerHTML = plans.map((_, i) =>
            `<div class="pricing-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
        ).join('');

        // Dots click to scroll
        const allDots = Array.from(dotsEl.children);
        allDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const idx = parseInt(dot.dataset.index);
                if (wrappers[idx]) {
                    wrappers[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }
            });
        });

        // Intersection observer to update dots on horizontal scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = wrappers.indexOf(entry.target);
                    if (idx !== -1) {
                        allDots.forEach(d => d.classList.remove('active'));
                        if (allDots[idx]) allDots[idx].classList.add('active');
                    }
                }
            });
        }, { root: grid, threshold: 0.6 });

        wrappers.forEach(w => observer.observe(w));

        cleanups.push(() => observer.disconnect());
    }

    return () => cleanups.forEach(fn => fn && fn());
}

// ─── Init Function ───────────────────────────────────────────────────────────
export function initPricing() {
    const pricingButtons = document.querySelectorAll('#pricing-btn, .pricing-trigger-btn');
    const pricingModal = document.getElementById('pricing-modal');
    const closePricingBtn = document.getElementById('close-pricing');

    if (pricingButtons.length === 0 || !pricingModal) return;

    let cleanupFn = null;

    pricingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (cleanupFn) cleanupFn();
            cleanupFn = renderPricing(false);
            pricingModal.classList.remove('hidden');
        });
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

    // Pre-init: don't render until opened
    document.getElementById('pricing-grid').innerHTML = '';
}
