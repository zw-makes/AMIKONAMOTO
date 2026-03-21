/**
 * iOS 26 Glassmorphic Bottom Bar Component
 * This initializes the new split bottom bar structure and logic.
 */
import { initHistory, toggleHistoryMode } from '../history/history.js';
import { openSearchModal } from '../search/search.js';

export function initBottomBar() {
    const container = document.querySelector('.bottom-bar-container');
    if (!container) return;

    initHistory();

    // The separate grand total container acts as the trigger for the stats modal
    const grandTotalTrigger = container.querySelector('.grand-total-container');
    const statsModal = document.getElementById('stats-modal');

    if (grandTotalTrigger && statsModal) {
        grandTotalTrigger.addEventListener('click', (e) => {
            if (typeof window.showMonthlyBreakdown === 'function') {
                window.showMonthlyBreakdown('all');
            }
        });
    }

    // --- Star/Magic Mode State ---
    let starModeActive = false;

    // --- Helper to get current user ID across files ---
    const getUserId = () => {
        if (window.currentUser) return window.currentUser.id;
        const authData = localStorage.getItem('supabase.auth.token');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                return parsed.currentSession?.user?.id || null;
            } catch (e) { return null; }
        }
        return null;
    };

    // --- Sync to Supabase ---
    const saveStarredDatesToSupabase = async (dates) => {
        const userId = getUserId();
        if (!userId || !window.supabase) return;

        try {
            // We store this inside the user_profile's settings JSONB for elegance
            const { data: profile } = await window.supabase
                .from('profiles')
                .select('settings')
                .eq('id', userId)
                .single();

            const currentSettings = profile?.settings || {};
            const updatedSettings = { ...currentSettings, starred_dates: dates };

            await window.supabase
                .from('profiles')
                .update({ settings: updatedSettings })
                .eq('id', userId);

            console.log('Star Mode: Synced to Cloud');
        } catch (e) {
            console.error('Star Mode: Sync failed', e);
        }
    };

    // Load starred dates from localStorage (Main JS handles initial load from profile)
    const getStarredDates = () => {
        try {
            return JSON.parse(localStorage.getItem('starred_dates') || '[]');
        } catch (e) {
            return [];
        }
    };

    const saveStarredDate = (dateStr) => {
        let dates = getStarredDates();
        if (!dates.includes(dateStr)) {
            dates.push(dateStr);
            localStorage.setItem('starred_dates', JSON.stringify(dates));
            saveStarredDatesToSupabase(dates);
        }
    };

    const removeStarredDate = (dateStr) => {
        let dates = getStarredDates();
        dates = dates.filter(d => d !== dateStr);
        localStorage.setItem('starred_dates', JSON.stringify(dates));
        saveStarredDatesToSupabase(dates);
    };

    // Feature Buttons (Left container)
    const buttons = container.querySelectorAll('.feature-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.HapticsService) window.HapticsService.light();

            const action = btn.id;
            if (action === 'search-btn') {
                openSearchModal();
            } else if (action === 'list-btn') {
                if (typeof window.toggleListView === 'function') {
                    window.toggleListView(btn);
                }
            } else if (action === 'star-btn') {
                toggleStarMode(btn);
            } else if (action === 'ai-btn') {
                // AI Assistant / Insights
                if(window.showAIInsights) window.showAIInsights();
                else console.log("AI Analyst triggered!");
            }
        });
    });

    function toggleStarMode(btn) {
        starModeActive = !starModeActive;
        if (window.HapticsService) window.HapticsService.medium();
        const calendarGrid = document.getElementById('calendar-grid');

        if (starModeActive) {
            btn.classList.add('magic-active');
            calendarGrid.classList.add('star-mode');

            // 1. If there are ALREADY starred days, make them 'star-glow' so user can click to remove them
            const existingStars = calendarGrid.querySelectorAll('.starred-day');
            existingStars.forEach(cell => {
                cell.classList.add('star-glow');
            });

            // 2. Add temporary listeners to toggle individual glows
            calendarGrid.addEventListener('click', handleCellClickInStarMode, true);

            console.log('Star Mode: Selection active');
        } else {
            btn.classList.remove('magic-active');
            calendarGrid.classList.remove('star-mode');

            // 3. Save the results: whatever is STILL GLOWING becomes a permanent "starred-day"
            const cells = calendarGrid.querySelectorAll('.calendar-cell:not(.other-month)');
            cells.forEach(cell => {
                const time = cell.dataset.time;
                if (!time) return;

                const date = new Date(parseInt(time));
                const dateStr = date.toISOString().split('T')[0];

                if (cell.classList.contains('star-glow')) {
                    saveStarredDate(dateStr);
                    cell.classList.remove('star-glow');
                    cell.classList.add('starred-day');
                } else {
                    // If it was glowing before but user clicked it off, remove permanent star
                    removeStarredDate(dateStr);
                    cell.classList.remove('starred-day');
                }
            });

            calendarGrid.removeEventListener('click', handleCellClickInStarMode, true);
            console.log('Star Mode: Selection saved');
        }
    }
    window.toggleStarMode = toggleStarMode; // Expose to window for reliability

    function handleCellClickInStarMode(e) {
        const cell = e.target.closest('.calendar-cell:not(.other-month)');
        if (cell) {
            e.preventDefault();
            e.stopPropagation(); // Block normal day-detail opening

            // LOGIC: Only allow toggling IF the day has subscriptions or is already starred
            const hasSubs = cell.querySelector('.sub-dots-container') || cell.querySelector('.sub-icons-container');
            const isAlreadyStarred = cell.classList.contains('starred-day') || cell.classList.contains('star-glow');

            if (hasSubs || isAlreadyStarred) {
                if (window.HapticsService) window.HapticsService.selection();
                cell.classList.toggle('star-glow');
                cell.classList.toggle('starred-day'); // Immediate visual removal feedback
            } else {
                console.log('Star Mode: This day has no subscriptions to highlight!');
            }
        }
    }

    // Scale font sizes based on container size
    const observer = new ResizeObserver(entries => {
        for (let entry of entries) {
            const width = entry.contentRect.width;
            const fontSize = Math.max(12, Math.min(16, width / 25));
            container.style.fontSize = `${fontSize}px`;
        }
    });

    observer.observe(container);
}
