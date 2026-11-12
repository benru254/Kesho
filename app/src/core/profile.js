// Who the app is for, in his own words. Saved in settings under "profile".
//   name      how Kesho greets you
//   why       your reason, in your own words — shown back to you on weak days
//   identity  "I am becoming someone who ..."
//   trigger   what usually pulls you off track
//   plan      "When that happens, I will ..." (an if-then plan)
// Any feature may READ the profile. Only the "me" feature edits it.

import { getSetting, setSetting } from './settings';
import { emit } from './bus';

const KEY = 'profile';
const DEFAULTS = { name: 'Reuben', why: '', identity: '', trigger: '', plan: '', onboarded: false };

export async function getProfile() {
  return { ...DEFAULTS, ...((await getSetting(KEY, null)) || {}) };
}

export async function saveProfile(changes) {
  const next = { ...(await getProfile()), ...changes };
  for (const k of ['name', 'why', 'identity', 'trigger', 'plan']) {
    next[k] = String(next[k] || '').trim();
  }
  await setSetting(KEY, next);
  emit('profile-changed', next);
  return next;
}

// Shortens long text for notifications and one-line displays.
export function shorten(text, max = 90) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}
