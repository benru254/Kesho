// "Please back up" notification: one at a time, 19:30 on the day a backup becomes 7 days old.
// Re-planned whenever the app opens or a backup is made/restored.

import { AppState } from 'react-native';
import { on } from '../../core/bus';
import { getSetting } from '../../core/settings';
import { scheduleAt, cancel } from '../../core/notify';
import { nextBackupReminder, backupAgeDays } from './backup.format';
import { hasData } from './backup.service';

const ID = 'kesho-backup';
let started = false;

export async function planBackupReminder() {
  const last = await getSetting('last_backup_at', null);
  const data = await hasData();
  const at = nextBackupReminder(last, data);
  if (!at) {
    await cancel(ID);
    return;
  }
  const age = backupAgeDays(last, at);
  const body = age === null
    ? 'You have data in Kesho but no backup yet. 30 seconds: save it to Google Drive.'
    : `Your last backup is ${age} days old. 30 seconds: save a fresh one to Google Drive.`;
  await scheduleAt(ID, at, '💾 Back up Kesho', body);
}

// Runs once at app start (from the feature registry).
export async function initBackup() {
  if (started) return;
  started = true;
  const replan = () => planBackupReminder().catch((e) => console.warn('[backup] reminder failed', e));
  on('backup-changed', replan);
  on('restored', replan);
  AppState.addEventListener('change', (s) => { if (s === 'active') replan(); });
  await replan();
}
