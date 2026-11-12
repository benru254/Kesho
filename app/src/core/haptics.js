// Small vibrations that make the app feel physical. Never throws (some phones have no haptics).

import * as Haptics from 'expo-haptics';

function safe(fn) {
  try {
    const p = fn();
    if (p && p.catch) p.catch(() => {});
  } catch {
    // no haptics on this device — fine
  }
}

// Light tick: every tap that changes something.
export function tap() {
  safe(() => Haptics.selectionAsync());
}

// Firm double-pulse: something finished (check-in saved, task done).
export function success() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

// Warning buzz: honest warnings.
export function warn() {
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

// Heavy thump: milestones.
export function heavy() {
  safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}
