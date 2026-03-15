/* src/features/sync/syncUI.js */

export const SyncUI = {
    terminal: null,
    statusText: null,
    offlineTag: null,
    modal: null,
    statusTimeout: null,

    init() {
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
        this.statusText.className = `sync-status-text ${type}`;
        this.terminal.classList.add('show-status');

        this.statusTimeout = setTimeout(() => {
            this.terminal.classList.remove('show-status');
        }, duration);
    },

    updateNetworkState(isOnline) {
        if (this.offlineTag) {
            if (isOnline) {
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
