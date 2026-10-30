// All money data logic. Screens call these, never SQL.
// Rule: the ledger (money_tx) is the truth. Every total is calculated from it.

import { run, get, all, nowIso, logEvent } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { DEFAULT_GOAL, addMonths } from './money.goal';

export const PAY_YOURSELF_RATE = 0.1; // 10% of every income, offered right after you log it
const DEFAULT_EMERGENCY_TARGET = 8000; // used until you have a full month of "Needs" data

// ---------- Sources & buckets ----------

export async function getSources() {
  return all('SELECT * FROM money_sources WHERE archived = 0 ORDER BY id');
}

// Finds an existing source by name first (no duplicates), otherwise creates it.
export async function addSource(name) {
  const clean = name.trim();
  if (!clean) return null;
  const existing = await get('SELECT * FROM money_sources WHERE lower(name) = lower(?)', [clean]);
  if (existing) {
    if (existing.archived) await run('UPDATE money_sources SET archived = 0 WHERE id = ?', [existing.id]);
    return existing.id;
  }
  const res = await run('INSERT INTO money_sources (name, created_at) VALUES (?, ?)', [clean, nowIso()]);
  return res.lastInsertRowId;
}

export async function archiveSource(id) {
  await run('UPDATE money_sources SET archived = 1 WHERE id = ?', [id]);
}

export async function getBuckets() {
  return all('SELECT * FROM money_buckets WHERE archived = 0 ORDER BY sort');
}

// ---------- Recording money ----------

// type: 'in' | 'out' | 'aside'. Amount is always a positive whole number here.
// origin: 'manual' | 'mpesa'. extRef: M-Pesa code — the database refuses the same code twice.
export async function addTx({
  date, type, amount, sourceId = null, bucketId = null, note = null, origin = 'manual', extRef = null,
}) {
  const n = Math.round(Number(amount));
  if (!n || n <= 0) throw new Error('Amount must be more than 0');
  if (type === 'in' && !sourceId) throw new Error('Pick where the money came from');
  if ((type === 'out' || type === 'aside') && !bucketId) throw new Error('Pick a bucket');
  const res = await run(
    `INSERT INTO money_tx (date, type, amount, source_id, bucket_id, note, origin, ext_ref, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [date, type, n, sourceId, bucketId, note && note.trim() ? note.trim() : null, origin, extRef, nowIso()]
  );
  await logEvent(`money_${type}`, { amount: n });
  return res.lastInsertRowId;
}

// Taking money OUT of a pot (life happens). Stored as a negative 'aside' row.
export async function withdrawFromPot({ date, bucketId, amount, note }) {
  const n = Math.round(Number(amount));
  if (!n || n <= 0) throw new Error('Amount must be more than 0');
  const bal = await potBalance(bucketId);
  if (n > bal) throw new Error(`Only KES ${bal} in this pot`);
  await run(
    `INSERT INTO money_tx (date, type, amount, bucket_id, note, created_at)
     VALUES (?, 'aside', ?, ?, ?, ?)`,
    [date, -n, bucketId, note && note.trim() ? note.trim() : null, nowIso()]
  );
  await logEvent('money_withdraw', { amount: n, bucketId });
}

// Soft delete: the row stays in the database (history), it just stops counting.
export async function deleteTx(id) {
  await run('UPDATE money_tx SET deleted_at = ? WHERE id = ?', [nowIso(), id]);
  await logEvent('money_deleted', { id });
}

// ---------- Reading totals ----------

const LIVE = 'deleted_at IS NULL';

async function potBalance(bucketId) {
  const row = await get(
    `SELECT COALESCE(SUM(amount), 0) AS n FROM money_tx WHERE ${LIVE} AND type = 'aside' AND bucket_id = ?`,
    [bucketId]
  );
  return row.n;
}

async function sumBySource(month) {
  return all(
    `SELECT source_id, COALESCE(SUM(amount), 0) AS total FROM money_tx
     WHERE ${LIVE} AND type = 'in' AND substr(date, 1, 7) = ? GROUP BY source_id`,
    [month]
  );
}

export async function getMonthSummary(month) {
  const lastMonth = addMonths(month, -1);
  const [sources, buckets, thisBySource, lastBySource, outRows, asideRow] = await Promise.all([
    all('SELECT * FROM money_sources ORDER BY id'),
    getBuckets(),
    sumBySource(month),
    sumBySource(lastMonth),
    all(
      `SELECT bucket_id, COALESCE(SUM(amount), 0) AS total FROM money_tx
       WHERE ${LIVE} AND type = 'out' AND substr(date, 1, 7) = ? GROUP BY bucket_id`,
      [month]
    ),
    get(
      `SELECT COALESCE(SUM(amount), 0) AS n FROM money_tx
       WHERE ${LIVE} AND type = 'aside' AND substr(date, 1, 7) = ?`,
      [month]
    ),
  ]);

  const thisMap = Object.fromEntries(thisBySource.map((r) => [r.source_id, r.total]));
  const lastMap = Object.fromEntries(lastBySource.map((r) => [r.source_id, r.total]));
  const income = sources
    .map((s) => ({ id: s.id, name: s.name, total: thisMap[s.id] || 0, last: lastMap[s.id] || 0 }))
    .filter((s) => s.total > 0 || s.last > 0)
    .sort((a, b) => b.total - a.total);

  const outMap = Object.fromEntries(outRows.map((r) => [r.bucket_id, r.total]));
  const spend = buckets
    .filter((b) => b.kind === 'spend')
    .map((b) => ({ id: b.id, key: b.key, name: b.name, total: outMap[b.id] || 0 }));

  const totalIn = income.reduce((a, s) => a + s.total, 0);
  const totalInLast = income.reduce((a, s) => a + s.last, 0);
  const totalOut = spend.reduce((a, s) => a + s.total, 0);
  const totalAside = asideRow.n;

  return {
    month,
    income,
    spend,
    totalIn,
    totalInLast,
    totalOut,
    totalAside,
    left: totalIn - totalOut - totalAside,
  };
}

export async function getPots() {
  const buckets = (await getBuckets()).filter((b) => b.kind === 'pot');
  const rows = await all(
    `SELECT bucket_id, COALESCE(SUM(amount), 0) AS bal FROM money_tx
     WHERE ${LIVE} AND type = 'aside' GROUP BY bucket_id`
  );
  const map = Object.fromEntries(rows.map((r) => [r.bucket_id, r.bal]));
  const pots = buckets.map((b) => ({ id: b.id, key: b.key, name: b.name, balance: map[b.id] || 0 }));
  const emergencyTarget = await getEmergencyTarget();
  return { pots, emergencyTarget, totalSaved: pots.reduce((a, p) => a + p.balance, 0) };
}

// 1 month of your real "Needs" spending (last full month). Until then: 8,000.
export async function getEmergencyTarget(month = null) {
  const now = new Date();
  const thisMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const last = addMonths(thisMonth, -1);
  const row = await get(
    `SELECT COALESCE(SUM(t.amount), 0) AS n FROM money_tx t JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.${LIVE} AND t.type = 'out' AND b.key = 'needs' AND substr(t.date, 1, 7) = ?`,
    [last]
  );
  return row.n > 0 ? row.n : DEFAULT_EMERGENCY_TARGET;
}

export async function getRecent(month, limit = 15) {
  return all(
    `SELECT t.*, s.name AS source_name, b.name AS bucket_name, b.key AS bucket_key
     FROM money_tx t
     LEFT JOIN money_sources s ON s.id = t.source_id
     LEFT JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.${LIVE} AND substr(t.date, 1, 7) = ?
     ORDER BY t.date DESC, t.id DESC LIMIT ?`,
    [month, limit]
  );
}

// ---------- Goal ----------

export async function getGoal() {
  const saved = await getSetting('money_goal', null);
  return { ...DEFAULT_GOAL, ...(saved || {}) };
}

export async function saveGoal(goal) {
  await setSetting('money_goal', goal);
}
