// Backup data logic: read every table out of the database, and put a backup back in.
// Phone-specific file/share/picker work lives in backup.files.js.

import { getDb, get, all, logEvent } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { emit } from '../../core/bus';
import { buildPayload, isBackupOverdue, backupAgeDays } from './backup.format';

async function schemaVersion() {
  const row = await get('SELECT version FROM schema_version LIMIT 1');
  return row ? row.version : 0;
}

export async function currentSchemaVersion() {
  return schemaVersion();
}

// Every real table (not SQLite's own, not schema_version).
async function listTables() {
  const rows = await all(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != 'schema_version' ORDER BY name"
  );
  return rows.map((r) => r.name);
}

async function columnsOf(table) {
  const cols = await all(`PRAGMA table_info(${table})`);
  return cols.map((c) => c.name);
}

// Everything in the database as one object (see backup.format.js for the layout).
export async function exportData() {
  const tables = {};
  for (const name of await listTables()) {
    tables[name] = await all(`SELECT * FROM ${name}`);
  }
  return buildPayload({ schemaVersion: await schemaVersion(), tables });
}

// Replaces this phone's data with the backup. All-or-nothing: if anything fails, nothing changes.
// Only tables that exist in BOTH the backup and this app are touched. Unknown columns are ignored.
export async function restoreData(payload) {
  const db = await getDb();
  const existing = await listTables();
  await db.withTransactionAsync(async () => {
    for (const table of existing) {
      const rows = payload.tables[table];
      if (!Array.isArray(rows)) continue;
      const cols = await columnsOf(table);
      await db.runAsync(`DELETE FROM ${table}`);
      for (const row of rows) {
        const keys = Object.keys(row).filter((k) => cols.includes(k));
        if (keys.length === 0) continue;
        const marks = keys.map(() => '?').join(', ');
        await db.runAsync(
          `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${marks})`,
          keys.map((k) => (row[k] === undefined ? null : row[k]))
        );
      }
    }
  });
  await setSetting('last_backup_at', payload.exportedAt || new Date().toISOString());
  await logEvent('backup_restored', { exportedAt: payload.exportedAt || null });
  emit('restored', {});
}

// Is there anything worth backing up yet?
export async function hasData() {
  const row = await get(
    `SELECT (SELECT COUNT(*) FROM daily_log) + (SELECT COUNT(*) FROM money_tx) + (SELECT COUNT(*) FROM tasks) AS n`
  );
  return row.n > 0;
}

export async function markBackedUp() {
  const now = new Date().toISOString();
  await setSetting('last_backup_at', now);
  await logEvent('backup_made', {});
  emit('backup-changed', {});
}

export async function getBackupStatus() {
  const last = await getSetting('last_backup_at', null);
  const data = await hasData();
  const snoozedUntil = await getSetting('backup_banner_snooze', null);
  return {
    last,
    ageDays: backupAgeDays(last),
    hasData: data,
    overdue: isBackupOverdue(last, data),
    snoozed: !!(snoozedUntil && new Date(snoozedUntil) > new Date()),
  };
}

// "Later" on the banner: hide it until tomorrow morning.
export async function snoozeBanner() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  t.setHours(5, 0, 0, 0);
  await setSetting('backup_banner_snooze', t.toISOString());
  emit('backup-changed', {});
}
