// BACKUP FILE FORMAT (pure logic — tested on its own).
//
// A backup is ONE JSON file that holds every table of the Kesho database:
// {
//   "app": "kesho",
//   "format": 1,                    ← version of this file layout
//   "schemaVersion": 3,             ← database version (see core/db/migrations.js)
//   "exportedAt": "2026-10-30T16:00:00.000Z",
//   "tables": { "daily_log": [ {...row}, ... ], "money_tx": [...], ... }
// }
// Rules:
// - A backup from a NEWER Kesho (higher schemaVersion) is refused: this app can't understand it.
// - A backup from an OLDER Kesho is accepted: tables it doesn't have are left as they are.

export const BACKUP_APP = 'kesho';
export const BACKUP_FORMAT = 1;
export const BACKUP_EVERY_DAYS = 7;

export function buildPayload({ schemaVersion, tables, exportedAt = new Date().toISOString() }) {
  return { app: BACKUP_APP, format: BACKUP_FORMAT, schemaVersion, exportedAt, tables };
}

// "kesho-backup-2026-10-30.json"
export function backupFileName(date = new Date()) {
  const p = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `kesho-backup-${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}.json`;
}

// Returns { ok: true, payload, summary } or { ok: false, error } — error is plain language for the screen.
export function validateBackup(text, currentSchemaVersion) {
  let payload;
  try {
    payload = typeof text === 'string' ? JSON.parse(text) : text;
  } catch {
    return { ok: false, error: 'This file is not a Kesho backup (it is not readable JSON).' };
  }
  if (!payload || payload.app !== BACKUP_APP || typeof payload.tables !== 'object' || !payload.tables) {
    return { ok: false, error: 'This file is not a Kesho backup.' };
  }
  if (payload.format > BACKUP_FORMAT) {
    return { ok: false, error: 'This backup was made by a newer Kesho. Update the app first.' };
  }
  if ((payload.schemaVersion || 0) > currentSchemaVersion) {
    return { ok: false, error: 'This backup was made by a newer Kesho. Update the app first.' };
  }
  for (const [name, rows] of Object.entries(payload.tables)) {
    if (!Array.isArray(rows)) return { ok: false, error: `Backup is damaged (table "${name}").` };
  }
  return { ok: true, payload, summary: summarize(payload) };
}

// Counts that matter to a human: how many days, money entries, tasks.
export function summarize(payload) {
  const t = payload.tables || {};
  const len = (name) => (Array.isArray(t[name]) ? t[name].length : 0);
  return {
    exportedAt: payload.exportedAt || null,
    days: len('daily_log'),
    tasks: len('tasks'),
    money: len('money_tx'),
    mpesa: len('mpesa_inbox'),
  };
}

// Whole days since the last backup (null = never).
export function backupAgeDays(lastIso, now = new Date()) {
  if (!lastIso) return null;
  const ms = now.getTime() - new Date(lastIso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

export function isBackupOverdue(lastIso, hasData, now = new Date()) {
  if (!hasData) return false;
  const age = backupAgeDays(lastIso, now);
  return age === null || age >= BACKUP_EVERY_DAYS;
}

// When to send the next "please back up" notification: 19:30 on the due day,
// or the next 19:30 if it's already overdue.
export function nextBackupReminder(lastIso, hasData, now = new Date()) {
  if (!hasData) return null;
  const at = (d) => {
    const x = new Date(d);
    x.setHours(19, 30, 0, 0);
    return x;
  };
  let due = lastIso ? at(new Date(new Date(lastIso).getTime() + BACKUP_EVERY_DAYS * 86400000)) : at(now);
  if (due.getTime() <= now.getTime()) {
    due = at(now);
    if (due.getTime() <= now.getTime()) due = at(new Date(now.getTime() + 86400000));
  }
  return due;
}
