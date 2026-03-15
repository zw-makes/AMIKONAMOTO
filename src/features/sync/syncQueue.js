// ─────────────────────────────────────────────────────────────────────────────
// syncQueue.js  —  AMIKONAMOTO Offline Sync Queue (Stage 2)
//
// When a Supabase write fails (no internet), the operation is saved here.
// The moment the device comes back online, everything is replayed automatically.
//
// Completely standalone — no changes needed to existing app logic.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../../supabase.js';
import { SyncUI } from './syncUI.js';

const QUEUE_KEY = 'amiko_sync_queue';

// ── Queue helpers ─────────────────────────────────────────────────────────────

export function getQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
  catch { return []; }
}

function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); }
  catch (e) { console.warn('[SyncQueue] Could not persist queue:', e); }
}

// ── Public: add a failed operation to the queue ───────────────────────────────

/**
 * Queue a failed Supabase write so it can be retried when online.
 * @param {'upsert_sub'|'delete_sub'} action
 * @param {Object} data  - the subscription object (for upsert) or { id } (for delete)
 */
export function queueOperation(action, data) {
  const q = getQueue();

  // Replace any existing entry for the same item + action — no duplicate stacking
  const deduped = q.filter(
    item => !(item.action === action && item.data?.id != null && item.data.id === data?.id)
  );
  deduped.push({ action, data, ts: Date.now() });

  saveQueue(deduped);
  console.log(`[SyncQueue] Queued "${action}" — ${deduped.length} total pending`);
  SyncUI.showStatus(`${deduped.length} change${deduped.length > 1 ? 's' : ''} queued`, 'syncing');
}

// ── Public: how many operations are waiting ───────────────────────────────────

export function getPendingCount() {
  return getQueue().length;
}

// ── Flush: replay all queued operations against Supabase ─────────────────────

async function flushQueue() {
  const q = getQueue();
  if (q.length === 0) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('[SyncQueue] No active user — skipping flush.');
    return;
  }

  console.log(`[SyncQueue] Online — flushing ${q.length} pending operation(s)...`);
  // Use a very long duration so it stays while we loop
  SyncUI.showStatus(`Syncing ${q.length} change${q.length > 1 ? 's' : ''}...`, 'syncing', 60000); 
  const failed = [];

  for (const item of q) {
    try {
      if (item.action === 'upsert_sub') {
        const { error } = await supabase
          .from('subscriptions')
          .upsert({ ...item.data, user_id: user.id });
        if (error) throw error;

      } else if (item.action === 'delete_sub') {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('id', item.data.id);
        if (error) throw error;
        
      } else if (item.action === 'upsert_profile') {
        const { error } = await supabase
          .from('profiles')
          .upsert({ ...item.data, id: user.id });
        if (error) throw error;
      } else if (item.action === 'update_app_settings') {
        const { error } = await supabase
          .from('profiles')
          .update(item.data)
          .eq('id', user.id);
        if (error) throw error;
      }

      console.log(`[SyncQueue] ✅ "${item.action}" synced to cloud`);

    } catch (e) {
      console.warn(`[SyncQueue] ❌ "${item.action}" failed — will retry later:`, e.message);
      failed.push(item);
    }
  }

  saveQueue(failed);

  const synced = q.length - failed.length;
  if (synced > 0) {
    console.log(`[SyncQueue] ${synced} operation(s) synced ✅`);
    if (failed.length > 0) {
        SyncUI.showStatus(`⚠️ ${synced} Synced, ${failed.length} Failed`, 'syncing', 5000);
    } else {
        SyncUI.showStatus(`✅ ${synced} Synced`, 'success', 5000);
    }
    // Tell the main app to refresh so UI matches the cloud
    window.dispatchEvent(new CustomEvent('syncqueue:flushed', { detail: { synced } }));
  } else if (failed.length > 0) {
    SyncUI.showStatus(`❌ Sync Failed (${failed.length})`, 'syncing', 5000);
  }
}

// ── SyncUI Init ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => SyncUI.init());

// (Removed updateBadge function as it is now managed by SyncUI)

// ── Network event listeners ───────────────────────────────────────────────────

window.addEventListener('online', () => {
  console.log('[SyncQueue] Device back online — flushing queue...');
  SyncUI.updateNetworkState(true);
  SyncUI.showStatus(`🌐 Online`, 'success', 10000);
  flushQueue();
});

window.addEventListener('offline', () => {
  console.log('[SyncQueue] Device offline — writes will be queued locally.');
  SyncUI.updateNetworkState(false);
});

// Show initial state on load
document.addEventListener('DOMContentLoaded', () => {
    SyncUI.updateNetworkState(navigator.onLine);
});

// If the app starts up and we already have internet, flush immediately
if (navigator.onLine) {
  setTimeout(() => flushQueue(), 2000); // Small delay to let Supabase auth settle
}
