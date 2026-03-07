/**
 * GlassSurface.js - Vanilla JS implementation
 * Applies advanced SVG-based glass distortion to all .glass elements.
 */

class GlassSurface {
    constructor() {
        this.counter = 0;
        this.resizeObserver = null;
        this.isDarkMode = true;
        this.svgContainer = null;
    }

    init() {
        this.isDarkMode = !document.body.classList.contains('light-mode');

        // 1. Create a global SVG container for filters
        if (!document.getElementById('glass-filters-global')) {
            this.svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            this.svgContainer.id = 'glass-filters-global';
            this.svgContainer.style.cssText = 'position: absolute; width: 0; height: 0; pointer-events: none; visibility: hidden;';
            document.body.appendChild(this.svgContainer);
        } else {
            this.svgContainer = document.getElementById('glass-filters-global');
        }

        // 2. Initial application
        this.scan();

        // 3. Mutation Observer for dynamic elements and visibility changes (Popups, Modals)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    this.scan();
                } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // If a hidden class was removed, or visibility changed
                    if (mutation.target.classList.contains('glass')) {
                        this.applyTo(mutation.target, true); // Force re-calculate for newly visible elements
                    }
                }
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        // 4. Update on resize
        this.resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                this.updateDisplacementMap(entry.target);
            }
        });

        // 5. Theme Sync
        const themeObserver = new MutationObserver(() => {
            const currentDark = !document.body.classList.contains('light-mode');
            if (currentDark !== this.isDarkMode) {
                this.isDarkMode = currentDark;
                this.scan(true); // Force update all
            }
        });
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return this;
    }

    scan(force = false) {
        const glassElements = document.querySelectorAll('.glass');
        glassElements.forEach(el => this.applyTo(el, force));
    }

    applyTo(el, force = false) {
        if (el.dataset.glassId && !force) return;

        if (!el.dataset.glassId) {
            this.counter++;
            const uniqueId = `glass-${this.counter}`;
            el.dataset.glassId = uniqueId;
        }

        const uniqueId = el.dataset.glassId;
        const filterId = `glass-filter-${uniqueId}`;

        // Default configuration (Matching user-provided spec)
        const config = {
            borderRadius: parseInt(getComputedStyle(el).borderRadius) || 20,
            borderWidth: 0.08,
            brightness: 100, // Matches 'Basic usage' or 'difference' logic
            opacity: 0.93,
            blur: 11,
            displace: 0.5, // Distortion intensity
            backgroundOpacity: 0.05,
            saturation: 1.8,
            distortionScale: -180,
            redOffset: 0,
            greenOffset: 10,
            blueOffset: 20,
            mixBlendMode: 'difference'
        };

        // Check for overrides via data attributes
        if (el.dataset.displace) config.displace = parseFloat(el.dataset.displace);
        if (el.dataset.distortion) config.distortionScale = parseFloat(el.dataset.distortion);

        el.glassConfig = config;

        // Remove existing filter if forcing
        let filter = document.getElementById(filterId);
        if (filter) filter.remove();

        filter = this.createFilter(filterId, config);
        this.svgContainer.appendChild(filter);

        this.updateDisplacementMap(el);
        this.applyThemeStyles(el);
        this.resizeObserver.observe(el);
    }

    createFilter(filterId, config) {
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('color-interpolation-filters', 'sRGB');
        filter.setAttribute('x', '-50%');
        filter.setAttribute('y', '-50%');
        filter.setAttribute('width', '200%');
        filter.setAttribute('height', '200%');

        filter.innerHTML = `
      <feImage class="fe-image" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.redOffset}" xChannelSelector="R" yChannelSelector="G" result="dispRed" />
      <feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="red" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.greenOffset}" xChannelSelector="R" yChannelSelector="G" result="dispGreen" />
      <feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="green" />
      <feDisplacementMap in="SourceGraphic" in2="map" scale="${config.distortionScale + config.blueOffset}" xChannelSelector="R" yChannelSelector="G" result="dispBlue" />
      <feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="blue" />
      <feBlend in="red" in2="green" mode="screen" result="rg" />
      <feBlend in="rg" in2="blue" mode="screen" result="output" />
      <feGaussianBlur class="fe-blur" in="output" stdDeviation="${config.displace}" />
    `;

        return filter;
    }

    updateDisplacementMap(el) {
        const uniqueId = el.dataset.glassId;
        const filter = document.getElementById(`glass-filter-${uniqueId}`);
        if (!filter) return;

        const feImage = filter.querySelector('.fe-image');
        if (!feImage) return;

        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (width === 0 || height === 0) return;

        const config = el.glassConfig;
        const redGradId = `red-grad-${uniqueId}`;
        const blueGradId = `blue-grad-${uniqueId}`;
        const edgeSize = Math.min(width, height) * (config.borderWidth * 0.5);

        const svgContent = `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="red"/>
          </linearGradient>
          <linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#0000"/>
            <stop offset="100%" stop-color="blue"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="${width}" height="${height}" fill="black"></rect>
        <rect x="0" y="0" width="${width}" height="${height}" rx="${config.borderRadius}" fill="url(#${redGradId})" />
        <rect x="0" y="0" width="${width}" height="${height}" rx="${config.borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${config.mixBlendMode}" />
        <rect x="${edgeSize}" y="${edgeSize}" width="${width - edgeSize * 2}" height="${height - edgeSize * 2}" rx="${config.borderRadius}" fill="hsl(0 0% ${config.brightness}% / ${config.opacity})" style="filter:blur(${config.blur}px)" />
      </svg>
    `;

        feImage.setAttribute('href', `data:image/svg+xml,${encodeURIComponent(svgContent.trim())}`);
    }

    applyThemeStyles(el) {
        const filterId = `glass-filter-${el.dataset.glassId}`;
        const config = el.glassConfig;

        // Force backdrop filter even on mobile webviews
        const filterUrl = `url(#${filterId})`;
        const backdropFilter = `${filterUrl} saturate(${config.saturation}) brightness(1.2)`;

        el.style.setProperty('backdrop-filter', backdropFilter, 'important');
        el.style.setProperty('-webkit-backdrop-filter', backdropFilter, 'important');

        if (this.isDarkMode) {
            el.style.setProperty('background', 'rgba(0, 0, 0, 0.4)', 'important');
            el.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.15)', 'important');
            el.style.setProperty('box-shadow', `
        0 0 2px 1px rgba(255, 255, 255, 0.2) inset,
        0 0 10px 4px rgba(255, 255, 255, 0.1) inset,
        0px 8px 32px rgba(0, 0, 0, 0.6)
      `, 'important');
        } else {
            el.style.setProperty('background', 'rgba(255, 255, 255, 0.25)', 'important');
            el.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.3)', 'important');
            el.style.setProperty('box-shadow', `
        0 8px 32px 0 rgba(31, 38, 135, 0.2),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.45)
      `, 'important');
        }
    }
}

// Global instance
export const glassSystem = new GlassSurface();
export const initGlass = () => glassSystem.init();
