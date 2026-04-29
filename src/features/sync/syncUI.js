export const SyncUI = {
    terminal: null,
    statusText: null,
    offlineTag: null,
    modal: null,
    statusTimeout: null,
    lastSyncResults: {
        synced: [],
        failed: []
    },

    init() {
        window.SyncUI = this;
        this.terminal = document.getElementById('status-terminal');
        this.statusText = document.getElementById('sync-status-text');
        this.offlineTag = document.getElementById('offline-tag');
        this.modal = document.getElementById('offline-modal');
        const closeBtn = document.getElementById('close-offline-modal');

        if (this.offlineTag) {
            this.offlineTag.addEventListener('click', () => this.showOfflineModal());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideOfflineModal());
        }

        if (this.terminal) {
            this.terminal.addEventListener('click', () => {
                const text = this.statusText?.innerText || '';
                if (text.includes('REMINDERS SCHEDULED')) {
                    if (window.showScheduledNotifications) window.showScheduledNotifications();
                } else if (text.includes('SYNCED') || text.includes('FAILED')) {
                    if (window.showSyncDetails) window.showSyncDetails();
                }
            });

            // Gesture support for manual status peek
            let touchStartY = 0;
            this.terminal.addEventListener('touchstart', (e) => {
                touchStartY = e.touches[0].clientY;
                // Subtle interaction hint
                this.terminal.style.transition = 'opacity 0.2s ease';
                this.terminal.style.opacity = '0.7';
            }, { passive: true });

            this.terminal.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = Math.abs(touchEndY - touchStartY);
                
                // Reset interaction hint
                this.terminal.style.opacity = '1';

                if (deltaY > 25) { // Increased threshold for smoother/more intentional feel
                    if (window.showRemindersStatus) {
                        // Small delay to let the touch release feel natural
                        setTimeout(() => window.showRemindersStatus(), 50);
                    }
                }
            }, { passive: true });
        }

        // Expose to window so other modules can use the status terminal
        window.showAppStatus = (text, type, duration) => this.showStatus(text, type, duration);

        // Check initial state
        this.updateNetworkState(navigator.onLine);
    },

    /**
     * Shows a message in the terminal for a few seconds
     */
    showStatus(text, type = 'success', duration = 3000) {
        if (!this.statusText || !this.terminal) return;

        clearTimeout(this.statusTimeout);
        
        this.statusText.innerText = text;
        // Reset classes and add new ones
        this.statusText.className = 'sync-status-text';
        if (type) this.statusText.classList.add(type);
        
        this.terminal.classList.add('show-status');

        this.statusTimeout = setTimeout(() => {
            this.terminal.classList.remove('show-status');
        }, duration);
    },

    updateNetworkState(isOnline) {
        if (this.offlineTag) {
            if (isOnline) {
                // Keep the offline tag visible for a bit after coming back online
                // but the user asked for "online tag visible for 10 secs"
                // Actually they said "whne online it should fade into the online text and should be visible for just 2 secs"
                // But in the new request they said "make that online tag visible for 10 secs"
                // Let's go with 10 seconds for the "Online" status message in the terminal.
                this.offlineTag.classList.add('hidden');
            } else {
                this.offlineTag.classList.remove('hidden');
            }
        }
    },

    showOfflineModal() {
        if (this.modal) this.modal.classList.remove('hidden');
    },

    hideOfflineModal() {
        if (this.modal) this.modal.classList.add('hidden');
    }
};
