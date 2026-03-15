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

function getQueue() {
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
  updateBadge();
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
      }

      console.log(`[SyncQueue] ✅ "${item.action}" synced to cloud`);

    } catch (e) {
      console.warn(`[SyncQueue] ❌ "${item.action}" failed — will retry later:`, e.message);
      failed.push(item);
    }
  }

  saveQueue(failed);
  updateBadge();

  const synced = q.length - failed.length;
  if (synced > 0) {
    console.log(`[SyncQueue] ${synced} operation(s) synced ✅`);
    // Tell the main app to refresh so UI matches the cloud
    window.dispatchEvent(new CustomEvent('syncqueue:flushed', { detail: { synced } }));
  }
}

// ── Offline indicator badge ───────────────────────────────────────────────────

function updateBadge() {
  const count = getPendingCount();
  let badge = document.getElementById('offline-sync-badge');

  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'offline-sync-badge';
    badge.style.cssText = `
      position: fixed;
      bottom: 76px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 160, 0, 0.95);
      color: #000;
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      padding: 5px 14px;
      border-radius: 20px;
      z-index: 9999;
      display: none;
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(badge);
  }

  if (count > 0) {
    badge.innerText = `⚡ ${count} change${count > 1 ? 's' : ''} pending sync`;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// ── Network event listeners ───────────────────────────────────────────────────

window.addEventListener('online', () => {
  console.log('[SyncQueue] Device back online — flushing queue...');
  flushQueue();
});

window.addEventListener('offline', () => {
  console.log('[SyncQueue] Device offline — writes will be queued locally.');
  updateBadge();
});

// Show badge immediately on load if there are leftovers from a previous session
updateBadge();
