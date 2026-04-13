import './refresh.css';

export function initPullToRefresh() {
    const container = document.querySelector('.calendar-container');
    const app = document.getElementById('app'); 
    if (!container || !app) return;

    let indicator = document.querySelector('.refresh-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'refresh-indicator';
        indicator.innerHTML = '<img src="/sublify-logo.png" class="refresh-logo">';
        app.appendChild(indicator);
    }

    let startY = 0;
    let pullDistance = 0;
    let isPulling = false;
    let ticking = false;
    const threshold = 75; 
    const maxPull = 130; 

    function updateUI() {
        if (!isPulling && pullDistance === 0) {
            container.style.transform = `translate3d(0, 0, 0)`;
            indicator.style.transform = `translate3d(-50%, -120px, 0.1px)`; // Hide deep
            indicator.style.opacity = '0';
            ticking = false;
            return;
        }

        container.style.transform = `translate3d(0, ${pullDistance}px, 0)`;
        
        // Perfectly centered in the opened gap
        const logoOffset = (pullDistance / 2); 
        indicator.style.opacity = Math.min(pullDistance / (threshold * 0.4), 1);
        indicator.style.transform = `translate3d(-50%, ${logoOffset}px, 0.1px)`;

        if (pullDistance >= threshold) {
            indicator.classList.add('reached');
        } else {
            indicator.classList.remove('reached');
        }

        ticking = false;
    }

    container.addEventListener('touchstart', (e) => {
        if (container.scrollTop <= 5) {
            startY = e.touches[0].pageY;
            isPulling = true;
            indicator.classList.remove('active', 'reached');
            container.style.transition = 'none';
            indicator.style.transition = 'none';
            container.style.willChange = 'transform';
        } else {
            isPulling = false;
        }
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isPulling) return;

        const currentY = e.touches[0].pageY;
        let diff = currentY - startY;

        if (diff > 0) {
            if (e.cancelable) e.preventDefault();
            
            pullDistance = Math.min(diff * 0.75, maxPull);

            if (!ticking) {
                requestAnimationFrame(updateUI);
                ticking = true;
            }
        }
    }, { passive: false });

    container.addEventListener('touchend', () => {
        if (!isPulling) return;
        isPulling = false;

        container.style.transition = 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)';
        indicator.style.transition = 'all 0.4s cubic-bezier(0.19, 1, 0.22, 1)';

        if (pullDistance >= threshold) {
            indicator.classList.add('active', 'reached');
            
            // Hold logo in the middle of the final refresh gap
            indicator.style.transform = `translate3d(-50%, 45px, 0.1px)`; 
            indicator.style.opacity = '1';
            container.style.transform = `translate3d(0, 100px, 0)`;

            if (window.HapticsService) window.HapticsService.medium();
            
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } else {
            pullDistance = 0;
            requestAnimationFrame(updateUI);
        }
        
        indicator.dataset.hapticFired = "";
        setTimeout(() => { container.style.willChange = 'auto'; }, 500);
    });
}
