/**
 * iOS 26 Glassmorphic Bottom Bar Component
 * This initializes the new split bottom bar structure and logic.
 */

export function initBottomBar() {
    const container = document.querySelector('.bottom-bar-container');
    if (!container) return;

    // The separate grand total container acts as the trigger for the stats modal
    const grandTotalTrigger = container.querySelector('.grand-total-container');
    const statsModal = document.getElementById('stats-modal');

    if (grandTotalTrigger && statsModal) {
        grandTotalTrigger.addEventListener('click', (e) => {
            // Logic from main.js or here
            if (typeof window.showMonthlyBreakdown === 'function') {
                window.showMonthlyBreakdown('all');
            }
        });
    }

    // Feature Buttons (Left container)
    const buttons = container.querySelectorAll('.feature-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop propagation if needed, though they are in a different container now

            const action = btn.id;
            if (action === 'search-btn') {
                console.log('Search triggered');
            } else if (action === 'download-btn') {
                console.log('Download triggered');
            } else if (action === 'magic-btn') {
                console.log('Magic tools triggered');
            }
        });
    });

    // Scale font sizes based on container size if needed
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            const width = entry.contentRect.width;
            const fontSize = Math.max(12, Math.min(16, width / 25));
            container.style.fontSize = `${fontSize}px`;
        }
    });

    observer.observe(container);
}
