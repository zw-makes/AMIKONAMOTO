// ─────────────────────────────────────────────────────────────────────────────
// syncUI.js — AMIKONAMOTO Professional Sync Feedback UI
//
// Hooks into the standalone syncQueue events to drive beautiful top-nav 
// animations and modal feedback without touching existing app state.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize all sync-related UI elements
 */
export function initSyncUI() {
  const timeEl = document.getElementById('current-time');
  const pillEl = document.getElementById('offline-center-pill');
  const pillText = document.getElementById('offline-pill-text');
  
  const offlineModal = document.getElementById('offline-modal');
  const closeOfflineBtn = document.getElementById('close-offline');

  let timeRestoreTimeout = null;

  // -- Modal Logic --
  pillEl.addEventListener('click', () => {
    // Only open the modal if we are currently offline (not when it's just flashing "Online")
    if (pillEl.classList.contains('show-offline')) {
      offlineModal.classList.remove('hidden');
    }
  });

  closeOfflineBtn.addEventListener('click', () => {
    offlineModal.classList.add('hidden');
  });
  
  offlineModal.addEventListener('click', (e) => {
    if (e.target === offlineModal) offlineModal.classList.add('hidden');
  });

  // -- Event Listeners from syncQueue.js --

  // 1. Queue Changed (e.g. 1 new item added to the backpack)
  window.addEventListener('syncqueue:changed', (e) => {
    const pendingCount = e.detail.count;
    
    // If we're completely offline and just lost connection
    if (!navigator.onLine) {
       pillText.innerText = 'Offline';
       pillEl.classList.remove('show-online');
       pillEl.classList.add('show-offline');
    }

    if (pendingCount > 0) {
      // Temporarily hijack the clock to show the pending count
      clearTimeout(timeRestoreTimeout);
      
      const originalTimeHtml = timeEl.innerHTML;
      timeEl.classList.add('sync-time-override');
      timeEl.innerText = `${pendingCount} Pending`;

      // Return to clock after 5 seconds
      timeRestoreTimeout = setTimeout(() => {
        timeEl.classList.remove('sync-time-override');
        // The main clock interval will overwrite this immediately, but we clear it just in case
        timeEl.innerHTML = originalTimeHtml; 
      }, 5000);
    }
  });

  // 2. Syncing has started (Internet is back, firing up to Supabase)
  window.addEventListener('syncqueue:syncing', () => {
    // Show green "Online" temporarily
    pillEl.classList.remove('show-offline');
    pillEl.classList.add('show-online');
    pillText.innerText = 'Online';

    // After 2.5 seconds, hide the pill gracefully
    setTimeout(() => {
      pillEl.classList.remove('show-online', 'show-offline');
    }, 2500);

    // Hijack the clock with an animation
    clearTimeout(timeRestoreTimeout);
    timeEl.classList.remove('sync-time-override');
    timeEl.innerHTML = `<div class="sync-loader-text">Syncing<span></span><span></span><span></span></div>`;
  });

  // 3. Sync finished completely
  window.addEventListener('syncqueue:flushed', () => {
    // Immediately return the clock to normal state
    timeEl.classList.remove('sync-time-override');
    // Force a UI clock update immediately (will just look like normal text again)
    const timeEvent = new CustomEvent('syncqueue:clock_restore');
    window.dispatchEvent(timeEvent);
  });
}
