// needs: sqlite
// Backup: export everything → change data → restore → data is back exactly. Plus file checks.
import { check, done } from './lib/check.js';
import * as M from '../src/features/money/money.service.js';
import { exportData, restoreData, getBackupStatus, markBackedUp, currentSchemaVersion } from '../src/features/backup/backup.service.js';
import { validateBackup, isBackupOverdue, nextBackupReminder, backupFileName } from '../src/features/backup/backup.format.js';
import { run, all } from '../src/core/db/database.js';
import { on } from '../src/core/bus.js';

check((await getBackupStatus()).overdue === false, 'empty app: no backup nagging');
const src = (await M.getSources())[0];
await M.addTx({ date: '2026-10-01', type: 'in', amount: 5000, sourceId: src.id, note: 'before' });
await run("INSERT INTO daily_log (date, mood, updated_at) VALUES ('2026-10-01', 4, 'x')");
check((await getBackupStatus()).overdue === true, 'data but never backed up → overdue');

const backup = await exportData();
check(backup.app === 'kesho' && backup.schemaVersion === (await currentSchemaVersion()), 'backup has app name and DB version');
check(backup.tables.money_tx.length === 1 && backup.tables.daily_log.length === 1, 'backup holds the rows');
const text = JSON.stringify(backup);

// Damage the data, then restore.
await M.addTx({ date: '2026-10-02', type: 'out', amount: 999, bucketId: (await M.getBuckets())[0].id });
await run('DELETE FROM daily_log');
let restoredEvent = false;
on('restored', () => { restoredEvent = true; });
const v = validateBackup(text, await currentSchemaVersion());
check(v.ok && v.summary.money === 1 && v.summary.days === 1, 'backup validates with a human summary');
await restoreData(v.payload);
const rows = await all('SELECT amount, note FROM money_tx');
check(rows.length === 1 && rows[0].note === 'before', 'restore brings back exactly the backed-up money');
check((await all('SELECT * FROM daily_log')).length === 1, 'restore brings back days');
check(restoredEvent, 'app is told to reload after restore');

check(!validateBackup('hello', 3).ok, 'random text refused');
check(!validateBackup(JSON.stringify({ app: 'other', tables: {} }), 3).ok, 'other app file refused');
check(/newer Kesho/.test(validateBackup(JSON.stringify({ ...backup, schemaVersion: 99 }), 3).error), 'backup from newer app refused');

await markBackedUp();
check((await getBackupStatus()).overdue === false && (await getBackupStatus()).ageDays === 0, 'fresh backup → not overdue');
const now = new Date(2026, 9, 30, 12, 0);
check(isBackupOverdue(new Date(2026, 9, 22).toISOString(), true, now), '8 days old → overdue');
check(!isBackupOverdue(new Date(2026, 9, 25).toISOString(), true, now), '5 days old → fine');
const at = nextBackupReminder(new Date(2026, 9, 25, 10).toISOString(), true, now);
check(at.getDate() === 1 && at.getMonth() === 10 && at.getHours() === 19 && at.getMinutes() === 30, 'reminder 7 days after last backup, 19:30');
const overdueAt = nextBackupReminder(new Date(2026, 9, 1).toISOString(), true, new Date(2026, 9, 30, 20, 0));
check(overdueAt.getDate() === 31 && overdueAt.getHours() === 19, 'overdue after 19:30 → tomorrow 19:30');
check(backupFileName(new Date(2026, 9, 30)) === 'kesho-backup-2026-10-30.json', 'file name');
done();
