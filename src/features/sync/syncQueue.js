// ─────────────────────────────────────────────────────────────────────────────
// syncQueue.js  —  AMIKONAMOTO Offline Sync Queue (Stage 2)
//
// When a Supabase write fails (no internet), the operation is saved here.
// The moment the device comes back online, everything is replayed automatically.
//
// Completely standalone — no changes needed to existing app logic.
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../../supabase.js';

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
  
  // Inform UI that the queue has changed
  window.dispatchEvent(new CustomEvent('syncqueue:changed', { detail: { count: deduped.length } }));
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

  // Trigger syncing animation UI
  window.dispatchEvent(new CustomEvent('syncqueue:syncing'));

  console.log(`[SyncQueue] Online — flushing ${q.length} pending operation(s)...`);
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

  // Update UI with remaining (if any) or clear the pending count
  window.dispatchEvent(new CustomEvent('syncqueue:changed', { detail: { count: failed.length } }));

  const synced = q.length - failed.length;
  if (synced > 0) {
    console.log(`[SyncQueue] ${synced} operation(s) synced ✅`);
    // Tell the main app to refresh so UI matches the cloud
    window.dispatchEvent(new CustomEvent('syncqueue:flushed', { detail: { synced } }));
  }
}

// ── Network event listeners ───────────────────────────────────────────────────

window.addEventListener('online', () => {
  console.log('[SyncQueue] Device back online — flushing queue...');
  flushQueue();
});

window.addEventListener('offline', () => {
  console.log('[SyncQueue] Device offline — writes will be queued locally.');
  window.dispatchEvent(new CustomEvent('syncqueue:changed', { detail: { count: getPendingCount() } }));
});

// Trigger initial state broadcast
setTimeout(() => {
  window.dispatchEvent(new CustomEvent('syncqueue:changed', { detail: { count: getPendingCount() } }));
}, 500);

// If the app starts up and we already have internet, flush immediately
if (navigator.onLine) {
  setTimeout(() => flushQueue(), 2000); // Small delay to let Supabase auth settle
}
