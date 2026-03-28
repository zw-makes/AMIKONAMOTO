/**
 * Thanos Snap Effect implementation in Vanilla JS
 * Highly inspired by Mikhail Bespalov's codepen and the React implementation from 21st.dev
 */

export function animateThanosSnap(element) {
    return new Promise((resolve) => {
        // Prevent multiple simultaneous animations on the same element
        if (element.dataset.isAnimating === 'true') {
            resolve();
            return;
        }
        element.dataset.isAnimating = 'true';

        // 1. Inject SVG to body if it doesn't exist
        let svgWrapper = document.getElementById('thanos-snap-svg');
        if (!svgWrapper) {
            svgWrapper = document.createElement('div');
            svgWrapper.id = 'thanos-snap-svg';
            svgWrapper.innerHTML = `
                <svg width="0" height="0" class="absolute -z-1" style="position: absolute; width: 0; height: 0; z-index: -1;">
                    <defs>
                        <filter id="dissolve-filter" x="-300%" y="-300%" width="600%" height="600%" color-interpolation-filters="sRGB">
                            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" result="bigNoise" />
                            <feComponentTransfer in="bigNoise" result="bigNoiseAdjusted">
                                <feFuncR type="linear" slope="0.5" intercept="-0.2" />
                                <feFuncG type="linear" slope="3" intercept="-0.6" />
                            </feComponentTransfer>
                            <feTurbulence type="fractalNoise" baseFrequency="1" numOctaves="2" result="fineNoise" />
                            <feMerge result="combinedNoise">
                                <feMergeNode in="bigNoiseAdjusted" />
                                <feMergeNode in="fineNoise" />
                            </feMerge>
                            <feDisplacementMap id="dissolve-map" in="SourceGraphic" in2="combinedNoise" scale="0" xChannelSelector="R" yChannelSelector="G" />
                        </filter>
                    </defs>
                </svg>
            `;
            document.body.appendChild(svgWrapper);
        }

        const dissolveMap = document.getElementById('dissolve-map');
        
        // 2. Apply filter to element with iOS hardware acceleration hints
        element.style.webkitFilter = 'url(#dissolve-filter)';
        element.style.filter = 'url(#dissolve-filter)';
        element.style.willChange = 'transform, opacity, filter';
        element.style.pointerEvents = 'none'; // disable interaction during snap
        
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
