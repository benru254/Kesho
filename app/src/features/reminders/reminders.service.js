// Talks to the phone's notification system.
// The decisions live in reminders.plan.js — this file just carries them out.

import * as Notifications from 'expo-notifications';
import { AppState, Linking, Platform } from 'react-native';
import { get } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { on } from '../../core/bus';
import { dateKey } from '../../core/dates';
import { buildPlan, DEFAULT_TIMES } from './reminders.plan';

const CHANNEL_ID = 'reminders';
const PLAN_PREFIX = 'kesho-plan-';
const TEST_ID = 'kesho-test';

let started = false;
let lastSignature = null;
let syncTimer = null;

// Runs once when the app starts (called from the feature registry).
export async function initReminders() {
  if (started) return;
  started = true;

  // Show reminders even while Kesho is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    // Android needs a channel BEFORE asking permission.
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Kesho reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
    });
  }

  await requestPermission();

  // Re-plan whenever you do something, or come back to the app.
  on('event', () => queueSync());
  AppState.addEventListener('change', (s) => {
    if (s === 'active') queueSync();
  });

  await syncReminders(true);
}

// ---------- Permission ----------

export async function getPermission() {
  const res = await Notifications.getPermissionsAsync();
  return { granted: res.status === 'granted', canAskAgain: res.canAskAgain !== false };
}

// Asks Android for permission. If Android won't ask again, opens the phone settings.
export async function requestPermission() {
  const current = await getPermission();
  if (current.granted) return current;
  if (!current.canAskAgain) {
    // Only Android can open its settings page. (Kesho is Android-only, this just avoids a crash elsewhere.)
    if (Platform.OS === 'android') await Linking.openSettings();
    return current;
  }
  const res = await Notifications.requestPermissionsAsync();
  return { granted: res.status === 'granted', canAskAgain: res.canAskAgain !== false };
}

// ---------- Times ----------

export async function getTimes() {
  const saved = await getSetting('reminder_times', null);
  return { ...DEFAULT_TIMES, ...(saved || {}) };
}

export async function saveTimes(times) {
  await setSetting('reminder_times', times);
  return syncReminders(true);
}

// ---------- Scheduling ----------

function queueSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncReminders().catch((e) => console.warn('[reminders] sync failed', e));
  }, 800);
}

// Reads today's progress (read-only look at the Today feature's table + the shared events log).
async function readToday(todayKey) {
  const day = await get('SELECT * FROM daily_log WHERE date = ?', [todayKey]);
  // Anything you logged today (check-in, task, money...) counts as showing up.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const actions = await get('SELECT COUNT(*) AS n FROM events WHERE created_at >= ?', [startOfToday.toISOString()]);
  const morningDone = !!(day && day.morning_done_at);
  const nightDone = !!(day && day.night_done_at);
  const moved = !!(day && day.moved);
  return {
    morningDone,
    nightDone,
    moved,
    mood: day ? day.mood : null,
    active: morningDone || nightDone || moved || actions.n > 0,
  };
}

export async function getPlan() {
  const now = new Date();
  const todayKey = dateKey(now);
  const [times, today] = await Promise.all([getTimes(), readToday(todayKey)]);
  return buildPlan({ now, todayKey, times, today });
}

// Cancels Kesho's old reminders and schedules the fresh plan.
// Returns { granted, count, next }.
export async function syncReminders(force = false) {
  const perm = await getPermission();
  if (!perm.granted) return { granted: false, count: 0, next: null };

  const plan = await getPlan();
  const signature = JSON.stringify(plan.map((p) => [p.at.getTime(), p.body]));
  if (!force && signature === lastSignature) {
    return { granted: true, count: plan.length, next: plan[0] || null };
  }

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.identifier && n.identifier.startsWith(PLAN_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );

  for (let i = 0; i < plan.length; i++) {
    const p = plan[i];
    await Notifications.scheduleNotificationAsync({
      identifier: `${PLAN_PREFIX}${i}`,
      content: { title: p.title, body: p.body, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: p.at,
        channelId: CHANNEL_ID,
      },
    });
  }

  lastSignature = signature;
  await setSetting('reminders_last_sync', new Date().toISOString());
  return { granted: true, count: plan.length, next: plan[0] || null };
}

export async function sendTest() {
  await Notifications.scheduleNotificationAsync({
    identifier: TEST_ID,
    content: {
      title: '✅ Kesho test',
      body: 'Reminders work. Lock your phone and wait — this is how they will reach you.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
      channelId: CHANNEL_ID,
    },
  });
}
