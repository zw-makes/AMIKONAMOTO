import './refresh.css';

export function initPullToRefresh() {
    const container = document.querySelector('.calendar-container');
    const app = document.getElementById('app'); // Root app container
    if (!container || !app) return;

    // Create indicator element if not exists
    let indicator = document.querySelector('.refresh-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<img src="/sublify-logo.png" class="refresh-logo">';
        app.appendChild(indicator);
    }

    let startY = 0;
    let currentY = 0;
    let isPulling = false;
    const threshold = 70; 
    const maxPull = 120; 

    container.addEventListener('touchstart', (e) => {
        // Only allow pulling if we are at the very top of the scroll
        if (container.scrollTop <= 5) { // Slight tolerance for iOS
            startY = e.touches[0].pageY;
            isPulling = true;
            indicator.classList.remove('active');
            indicator.classList.remove('reached');
        } else {
            isPulling = false;
        }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isPulling) return;

        currentY = e.touches[0].pageY;
        let pullDistance = currentY - startY;

        if (pullDistance > 0) {
            // CRITICAL: Prevent system scroll/bounce to allow our custom UI to show
            if (e.cancelable) e.preventDefault();
            
            pullDistance = Math.min(pullDistance * 0.75, maxPull);
            
            // Move items
            container.style.transition = 'none';
            container.style.transform = `translate3d(0, ${pullDistance}px, 0.1px)`; // Content slide
            container.style.willChange = 'transform';
            
            // Move indicator (No more -50% needed as parent is full-width flex)
            indicator.style.opacity = Math.min(pullDistance / (threshold * 0.4), 1);
            indicator.style.transform = `translate3d(0, ${pullDistance - 80}px, 0.2px)`;
            
            if (pullDistance >= threshold) {
                indicator.classList.add('reached');
                if (window.HapticsService && !indicator.dataset.hapticFired) {
                    window.HapticsService.light();
                    indicator.dataset.hapticFired = "true";
                }
            } else {
                indicator.classList.remove('reached');
                indicator.dataset.hapticFired = "";
            }
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;

        let pullDistance = currentY - startY;
        const finalDistance = Math.min(pullDistance * 0.75, maxPull);

        container.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
        
        if (finalDistance >= threshold) {
            indicator.classList.add('active');
            indicator.classList.add('reached');
            indicator.style.transform = `translate3d(0, 45px, 0.2px)`;
            indicator.style.opacity = '1';
            container.style.transform = `translate3d(0, 85px, 0.1px)`;

            if (window.HapticsService) window.HapticsService.medium();
            
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } else {
            indicator.classList.remove('reached');
            indicator.style.opacity = '0';
            indicator.style.transform = `translate3d(0, -100px, 0.2px)`;
            container.style.transform = `translate3d(0, 0, 0)`;
        }
        
        indicator.dataset.hapticFired = "";
        setTimeout(() => { container.style.willChange = 'auto'; }, 500);
    });
}
