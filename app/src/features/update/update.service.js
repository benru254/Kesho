// Asks GitHub whether a newer Kesho exists. Works only with internet; offline it quietly does nothing.
// The answer is saved in settings, so the banner can show it later even without internet.

import { Linking, AppState } from 'react-native';
import * as Application from 'expo-application';
import { getSetting, setSetting } from '../../core/settings';
import { emit } from '../../core/bus';
import { LATEST_URL, RELEASES_PAGE, parseRelease, isNewer, shouldCheck } from './update.check';

const KESHO_ID = 'com.kesho.app';
const TIMEOUT_MS = 10000;

// { build, version, isKesho } — isKesho is false in Expo Go (the version would be Expo Go's).
export function installed() {
  const build = Number(Application.nativeBuildVersion);
  return {
    build: Number.isFinite(build) ? build : null,
    version: Application.nativeApplicationVersion || '?',
    isKesho: Application.applicationId === KESHO_ID,
  };
}

async function fetchLatest() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(LATEST_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    if (res.status === 404) return null; // no release published yet
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    return parseRelease(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

// force = true: always ask (button in Me → Updates). Otherwise at most every 12 hours.
// Returns { ok, release, available, error }.
export async function checkForUpdate(force = false) {
  const last = await getSetting('update_last_check', null);
  if (!force && !shouldCheck(last)) return getUpdateState();
  try {
    const release = await fetchLatest();
    await setSetting('update_last_check', new Date().toISOString());
    await setSetting('update_latest', release);
    const state = await getUpdateState();
    emit('update-changed', state);
    return { ...state, ok: true };
  } catch (e) {
    return { ...(await getUpdateState()), ok: false, error: e.name === 'AbortError' ? 'No answer from GitHub (slow or no internet).' : 'Could not reach GitHub. Check the internet and try again.' };
  }
}

// What is known right now, without internet.
export async function getUpdateState() {
  const me = installed();
  const release = await getSetting('update_latest', null);
  const dismissed = await getSetting('update_dismissed_build', null);
  const available = me.isKesho && isNewer(release, me.build);
  return {
    ok: true,
    installed: me,
    release,
    available,
    showBanner: available && release.build !== dismissed,
    lastCheck: await getSetting('update_last_check', null),
  };
}

// Opens the APK download in the browser. After it downloads, tap the file to install over Kesho.
export async function download(release) {
  await Linking.openURL((release && (release.apkUrl || release.pageUrl)) || RELEASES_PAGE);
}

// "Later" on the banner: hide it until an even newer version appears.
export async function dismiss(build) {
  await setSetting('update_dismissed_build', build);
  emit('update-changed', await getUpdateState());
}

// Runs once at app start, and again whenever the app comes back to the screen (max every 12 h).
let started = false;
export async function initUpdate() {
  if (started) return;
  started = true;
  const run = () => checkForUpdate(false).catch(() => {});
  AppState.addEventListener('change', (s) => { if (s === 'active') run(); });
  await run();
}
