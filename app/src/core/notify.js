// Small shared helpers for scheduling phone notifications (used by Backup and Report).
// The Reminders feature has its own, bigger scheduler; these helpers never touch its notifications
// because every caller uses its own identifier (e.g. "kesho-backup", "kesho-report-weekly").

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CHANNEL_ID = 'kesho-general';

let channelReady = false;

async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Kesho (backup & weekly report)',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelReady = true;
}

export async function notificationsAllowed() {
  const res = await Notifications.getPermissionsAsync();
  return res.status === 'granted';
}

export async function cancel(identifier) {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // nothing scheduled under that name — fine
  }
}

// One notification at an exact date/time. Replaces any earlier one with the same identifier.
export async function scheduleAt(identifier, date, title, body) {
  if (!(await notificationsAllowed())) return false;
  await ensureChannel();
  await cancel(identifier);
  if (date.getTime() <= Date.now() + 30 * 1000) return false;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: true },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
  return true;
}

// Repeats every week. weekday: 1 = Sunday ... 7 = Saturday (Expo's numbering).
export async function scheduleWeekly(identifier, weekday, hour, minute, title, body) {
  if (!(await notificationsAllowed())) return false;
  await ensureChannel();
  await cancel(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
      channelId: CHANNEL_ID,
    },
  });
  return true;
}
