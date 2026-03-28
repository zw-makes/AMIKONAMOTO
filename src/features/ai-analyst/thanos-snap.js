/**
 * Thanos Snap Effect implementation in Vanilla JS
 * Highly inspired by Mikhail Bespalov's codepen and the React implementation from 21st.dev
 */

// 1. Inject SVG directly at the module level immediately when script loads 
// This ensures iOS/Safari has the filter registered BEFORE any animation starts.
(function injectFilter() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('thanos-snap-svg-container')) return;
    const svgWrapper = document.createElement('div');
    svgWrapper.id = 'thanos-snap-svg-container';
    // Position it slightly more 'centrally' but still tiny/invisible to encourage Safari to render it
    svgWrapper.setAttribute('style', 'position: fixed; top: 10px; left: 10px; width: 2px; height: 2px; opacity: 0.1; pointer-events: none; z-index: -9999; overflow: hidden;');
    svgWrapper.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1" height="1">
            <defs>
                <filter id="thanos-snap-filter" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="noise" />
                    <feDisplacementMap id="thanos-snap-map" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
                </filter>
            </defs>
        </svg>
    `;
    document.body.appendChild(svgWrapper);
})();

export function animateThanosSnap(element) {
    return new Promise((resolve) => {
        // Prevent multiple simultaneous animations on the same element
        if (element.dataset.isAnimating === 'true') {
            resolve();
            return;
        }
        element.dataset.isAnimating = 'true';

        const dissolveMap = document.getElementById('thanos-snap-map');
        
        // 2. Apply filter to element with iOS hardware acceleration hints
        element.style.webkitFilter = 'url(#thanos-snap-filter)';
        element.style.filter = 'url(#thanos-snap-filter)';
        element.style.willChange = 'transform, opacity, filter';
        element.style.pointerEvents = 'none'; 
        
        // CRITICAL iOS FIX: Safari isolates elements with backdrop-filters into separate layers,
        // which prevents parent SVG filters from affecting them. We must disable them during animation.
        const isolatedElements = element.querySelectorAll('*');
        const originalStyles = new Map();
        isolatedElements.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.backdropFilter !== 'none' || style.webkitBackdropFilter !== 'none') {
                originalStyles.set(el, {
                    backdropFilter: el.style.backdropFilter,
                    webkitBackdropFilter: el.style.webkitBackdropFilter
                });
                el.style.backdropFilter = 'none';
                el.style.webkitBackdropFilter = 'none';
            }
        });

        
        // Increased duration from 0.6 to 1.8 for a much smoother, visible snap effect
        const durationSeconds = 1.8; 
        const durationMs = durationSeconds * 1000;
        const maxDisplacement = 400; // Increased displacement for more "dust"
        const opacityChangeStart = 0.2; // Starts fading out at 20%
        
        const easeOutCubic = (time) => 1 - Math.pow(1 - time, 3);
        
        let start = null;

        function tick(timestamp) {
            if (!start) start = timestamp;
            const elapsed = timestamp - start;
            let progress = elapsed / durationMs;
            if (progress > 1) progress = 1;
            
            const easedProgress = easeOutCubic(progress);
            
            // Map displacement scale
            const displacementMapScale = easedProgress * maxDisplacement;
            if (dissolveMap) dissolveMap.setAttribute('scale', displacementMapScale.toString());
            
            // Element opacity: fade from 1 to 0 over the later portion
            let elementOpacity = 1;
            if (progress > opacityChangeStart) {
                const opacityProgress = (progress - opacityChangeStart) / (1 - opacityChangeStart);
                elementOpacity = 1 - (opacityProgress * opacityProgress); // slight ease-in for opacity
            }
            
            // Use translate3d for iOS hardware acceleration
            const translateY = -(easedProgress * 100); 
            element.style.transform = `translate3d(0, ${translateY}px, 0)`;
            element.style.opacity = Math.max(0, elementOpacity);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                // Done! Stay dissolved (opacity 0) so the element doesn't flash back on screen.
                // ResetChat or the caller is responsible for completely wiping the DOM and resetting styles.
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.willChange = ''; // Clean up
                element.dataset.isAnimating = 'false';
                if (dissolveMap) dissolveMap.setAttribute('scale', '0');
                resolve();
            }
        }
        
        requestAnimationFrame(tick);
    });
}
