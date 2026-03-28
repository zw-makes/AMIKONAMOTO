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
            // Explicitly hide the SVG using styles that keep it in the rendering tree for iOS
            svgWrapper.setAttribute('style', 'position: absolute; width: 0; height: 0; overflow: hidden; pointer-events: none; visibility: hidden; z-index: -100;');
            svgWrapper.innerHTML = `
                <svg width="0" height="0">
                    <defs>
                        <filter id="dissolve-filter" x="-300%" y="-300%" width="600%" height="600%" color-interpolation-filters="sRGB">
                            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="1" seed="${Math.floor(Math.random() * 1000)}" result="bigNoise" />
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
        
        // 2. Apply filter with iOS force-composition trick
        element.style.webkitFilter = 'url(#dissolve-filter) brightness(1.001)';
        element.style.filter = 'url(#dissolve-filter) brightness(1.001)';
        element.style.webkitBackfaceVisibility = 'hidden'; 
        element.style.willChange = 'transform, opacity, filter';
        element.style.pointerEvents = 'none'; 
        
        const durationSeconds = 1.8; 
        const durationMs = durationSeconds * 1000;
        const maxDisplacement = 400; 
        const opacityChangeStart = 0.2; 
        
        const easeOutCubic = (time) => 1 - Math.pow(1 - time, 3);
        
        // Ensure dissolve-map scale is initialized to something non-zero to "wake up" the filter
        if (dissolveMap) dissolveMap.setAttribute('scale', '0.1');

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
                elementOpacity = 1 - (opacityProgress * opacityProgress); 
            }
            
            // Use translate3d for iOS hardware acceleration
            const translateY = -(easedProgress * 100); 
            element.style.transform = `translate3d(0, ${translateY}px, 0)`;
            element.style.opacity = Math.max(0, elementOpacity);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.willChange = ''; 
                element.dataset.isAnimating = 'false';
                if (dissolveMap) dissolveMap.setAttribute('scale', '0');
                resolve();
            }
        }

        // Give iOS a tiny beat (50ms) to recognize the filter before ticking starts
        setTimeout(() => {
            requestAnimationFrame(tick);
        }, 50);
    });
}
