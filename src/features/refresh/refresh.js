import './refresh.css';

export function initPullToRefresh() {
    const container = document.querySelector('.calendar-container');
    const app = document.getElementById('app-container');
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
    const threshold = 70; // pixels to pull before refresh
    const maxPull = 120; // limit pull distance

    container.addEventListener('touchstart', (e) => {
        // Only allow pulling if we are at the very top of the scroll
        if (container.scrollTop <= 0) {
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
            // Apply refined sensitivity
            pullDistance = Math.min(pullDistance * 0.7, maxPull);
            
            // GPU Accelerated Transform
            indicator.style.opacity = Math.min(pullDistance / (threshold * 0.5), 1);
            indicator.style.transform = `translate3d(-50%, ${pullDistance - 50}px, 0)`;
            
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
    }, { passive: true });

    container.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;

        let pullDistance = currentY - startY;
        const finalDistance = Math.min(pullDistance * 0.7, maxPull);

        if (finalDistance >= threshold) {
            // Trigger Refresh
            indicator.classList.add('active');
            indicator.classList.add('reached');
            indicator.style.transform = `translate3d(-50%, 45px, 0)`; // Increased clearance from 25px to 45px
            indicator.style.opacity = '1';
            
            if (window.HapticsService) window.HapticsService.medium();
            
            setTimeout(() => {
                window.location.reload();
            }, 750);
        } else {
            // Snap back
            indicator.classList.remove('reached');
            indicator.style.opacity = '0';
            indicator.style.transform = `translate3d(-50%, -80px, 0)`;
        }
        
        indicator.dataset.hapticFired = "";
    });
}
