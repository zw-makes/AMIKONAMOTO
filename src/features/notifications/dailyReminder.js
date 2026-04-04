// ─────────────────────────────────────────────────────────────────────────────
// dailyReminder.js
// Smart Daily Reminder Notifications — AMIKONAMOTO
//
// Schedules 30 days of context-aware daily notifications at the user's
// preferred time and timezone. Messages are generated from real subscription
// data so each alert is actually useful, not generic.
//
// ID range: 900000–900029 (reserved, won't collide with sub reminders)
// ─────────────────────────────────────────────────────────────────────────────

import { LocalNotifications } from '@capacitor/local-notifications';

const DAILY_REMINDER_BASE_ID = 900000;
const DAYS_TO_SCHEDULE = 30;

// ─── Timezone-aware date builder ─────────────────────────────────────────────
/**
 * Returns the correct UTC Date for "prefH:prefM in the user's preferred timezone"
 * on the day that is `dayOffset` days from today.
 */
function getScheduledDate(dayOffset, prefH, prefM, timezoneStr) {
  const tzMatch = (timezoneStr || 'UTC+00:00').match(/UTC([+-])(\d{2}):(\d{2})/);
  let tzOffsetMinutes = 0;
  if (tzMatch) {
    const sign = tzMatch[1] === '+' ? 1 : -1;
    tzOffsetMinutes = sign * (parseInt(tzMatch[2]) * 60 + parseInt(tzMatch[3]));
  }

  const target = new Date();
  target.setDate(target.getDate() + dayOffset);

  const year = target.getFullYear();
  const month = target.getMonth();
  const day = target.getDate();

  // Convert preferred local time → UTC
  // UTC = preferred_time - preferred_tz_offset
  const preferredMinutes = parseInt(prefH) * 60 + parseInt(prefM);
  const utcMinutes = preferredMinutes - tzOffsetMinutes;

  return new Date(Date.UTC(year, month, day) + utcMinutes * 60 * 1000);
}

// ─── Subscription helpers ─────────────────────────────────────────────────────
/**
 * Returns subscriptions that renew on a specific date.
 */
function getSubsRenewingOn(subscriptions, targetDate) {
  const day = targetDate.getDate();
  const month = targetDate.getMonth();
  const year = targetDate.getFullYear();

  return subscriptions.filter(s => {
    if (s.stopped || !s.date || s.date !== day) return false;

    const start = new Date(s.startDate);

    if (s.type === 'monthly' && s.recurring === 'recurring') {
      const startMonthTime = new Date(start.getFullYear(), start.getMonth(), 1).getTime();
      const targetMonthTime = new Date(year, month, 1).getTime();
      return startMonthTime <= targetMonthTime;
    }

    if (s.type === 'yearly') {
      const currentTotalMonths = year * 12 + month;
      const startTotalMonths = start.getFullYear() * 12 + start.getMonth();
      return currentTotalMonths >= startTotalMonths && currentTotalMonths < startTotalMonths + 12;
    }

    return false;
  });
}

// ─── Smart message builder ────────────────────────────────────────────────────
/**
 * Builds a context-aware notification title + body for a given day offset.
 * Priority: renewals today > renewals soon > all-clear (rotated messages)
 */
function buildMessage(subscriptions, dayOffset) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + dayOffset);

  const active = subscriptions.filter(s => !s.stopped);
  const activeCnt = active.length;
  const subWord = activeCnt !== 1 ? 'subscriptions' : 'subscription';

  // ── Priority 1: Renewing TODAY ──────────────────────────────────────────
  const renewingToday = getSubsRenewingOn(subscriptions, targetDate);

  if (renewingToday.length === 1) {
    return {
      title: `🦁 Lion Alert: ${renewingToday[0].name} Due`,
      body: `Your ${renewingToday[0].name} renewal is today. Auditor's recommendation: Mark it as paid now.`
    };
  }
  if (renewingToday.length > 1) {
    return {
      title: `⚠️ Lion Audit: ${renewingToday.length} Renewals`,
      body: `${renewingToday.map(s => s.name).join(', ')} are all due today. Let's manage your cash flow.`
    };
  }

  // ── Priority 2: Trials & Expiring Guards ────────────────────────────────
  const trial = active.find(s => s.type === 'trial');
  if (trial && dayOffset % 5 === 0) { // Every 5 days, remind they have a trial
    return {
      title: `🦁 Lion Spotted a Trial: ${trial.name}`,
      body: `You still have an active trial for ${trial.name}. Should we kill it before it charges you?`
    };
  }

  // ── Priority 3: Renewing in 1–3 days ───────────────────────────────────
  for (let d = 1; d <= 3; d++) {
    const futureDate = new Date(targetDate);
    futureDate.setDate(futureDate.getDate() + d);
    const upcoming = getSubsRenewingOn(subscriptions, futureDate);
    if (upcoming.length > 0) {
      const dayStr = d === 1 ? 'tomorrow' : `in ${d} days`;
      return {
        title: `🔔 Lion Guard: ${upcoming[0].name} Soon`,
        body: `Upcoming renewal ${dayStr} for ${upcoming[0].name}. I'm keeping an eye on it for you.`
      };
    }
  }

  // ── Priority 4: All clear — The Lion's Financial Wisdom ────────────────
  const lionWisdom = [
    {
      title: '🦁 The Lion\'s Daily Audit',
      body: `Monitoring ${activeCnt} ${subWord}. Everything looks clean. No dues today.`
    },
    {
      title: '📊 Auditor\'s Note',
      body: `You have ${activeCnt} ${subWord} active. Open the app to audit your monthly trend.`
    },
    {
      title: '💰 Subscription Guard',
      body: `No renewals today. Your cash flow is protected by the Lion.`
    },
    {
      title: '🦁 Proactive Tip',
      body: `Seeing duplicate apps? I can help you consolidate and save. Open chat to start.`
    },
    {
      title: '✅ You\'re Optimized',
      body: `${activeCnt} items in your tracker. No action needed today. Stay elite.`
    },
    {
      title: '🗓️ Calendar Guard',
      body: `I've scanned the next 30 days. Your ${activeCnt} ${subWord} are all under control.`
    },
    {
      title: '🧠 Financial Intelligence',
      body: `The Lion is watching. No upcoming spikes detected in your subscription list.`
    }
  ];

  return lionWisdom[dayOffset % lionWisdom.length];
}

// ─── Main export ──────────────────────────────────────────────────────────────
/**
 * Schedules 30 days of smart daily reminder notifications.
 * Safe to call multiple times — always cancels + reschedules cleanly.
 *
 * @param {Array}  subscriptions - Current subscriptions array from the app
 * @param {Object} settings      - User's app settings (notificationTime, timezone)
 * @returns {Promise<number>}    - Number of notifications successfully scheduled
 */
export async function scheduleDailyReminders(subscriptions, settings) {
  try {
    // ── Guard: check permissions (QUIET CHECK - don't show pop-up yet!) ─────────────────────────────
    const hasPermission = await window.NativeNotifications.checkPermissions();
    if (!hasPermission) {
      console.log('[DailyReminder] No existing permission — skipping silent schedule.');
      return 0;
    }

    // ── Guard: no subscriptions = no smart context ────────────────────────
    if (!subscriptions || subscriptions.length === 0) {
      console.log('[DailyReminder] No subscriptions yet — skipping daily reminders.');
      return 0;
    }

    const [prefH, prefM] = (settings?.notificationTime || '09:00').split(':');
    const timezone = settings?.timezone || 'UTC+00:00';
    const now = new Date();
    const notifications = [];

    // ── Build 30 days of notifications ───────────────────────────────────
    for (let dayOffset = 0; dayOffset < DAYS_TO_SCHEDULE; dayOffset++) {
      const scheduledDate = getScheduledDate(dayOffset, prefH, prefM, timezone);

      // Skip if this time slot has already passed
      if (scheduledDate <= now) continue;

      const { title, body } = buildMessage(subscriptions, dayOffset);

      notifications.push({
        id: DAILY_REMINDER_BASE_ID + dayOffset,
        title,
        body,
        schedule: { at: scheduledDate },
        sound: null,
      });
    }

    if (notifications.length === 0) {
      console.log('[DailyReminder] All time slots for today already passed — nothing scheduled.');
      return 0;
    }

    // ── Cancel previous daily reminders to avoid duplicates ──────────────
    try {
      await LocalNotifications.cancel({
        notifications: Array.from({ length: DAYS_TO_SCHEDULE }, (_, i) => ({
          id: DAILY_REMINDER_BASE_ID + i
        }))
      });
    } catch (cancelErr) {
      // Non-fatal — proceed anyway
      console.warn('[DailyReminder] Could not cancel old daily reminders:', cancelErr);
    }

    // ── Schedule all at once ──────────────────────────────────────────────
    await LocalNotifications.schedule({ notifications });
    console.log(`[DailyReminder] ✅ Scheduled ${notifications.length} smart daily reminder(s)`);
    return notifications.length;

  } catch (e) {
    console.error('[DailyReminder] Failed to schedule daily reminders:', e);
    return 0;
  }
}
