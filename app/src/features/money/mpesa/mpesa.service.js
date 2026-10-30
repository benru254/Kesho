// M-Pesa import: SMS → mpesa_inbox (waiting room) → you sort → money ledger.
// Rules:
// - Shop till money ("New Account balance") is BUSINESS. It is never counted as personal income.
// - Nothing enters your ledger until you sort it (or confirm a suggestion). No silent guesses.
// - The same M-Pesa code is never imported twice.
// - Fees become their own spending row in "M-Pesa fees".

import { run, get, all, nowIso, logEvent } from '../../../core/db/database';
import { getSetting, setSetting } from '../../../core/settings';
import { addTx, getBuckets } from '../money.service';
import { parseMpesa } from './mpesa.parser';
import { isAvailable, hasPermission, readMpesaInbox } from './mpesa.native';

const STATUS_FOR_KIND = {
  business: 'business',
  balance: 'info',
  unknown: 'unknown',
};

// ---------- Import ----------

// messages: [{ body, date(ms) }]. Returns { added, pending }.
export async function importMessages(messages) {
  let added = 0;
  let newest = null;
  for (const msg of messages) {
    const p = parseMpesa(msg.body);
    if (!p) continue;
    const status = STATUS_FOR_KIND[p.kind] || 'pending';
    const res = await run(
      `INSERT OR IGNORE INTO mpesa_inbox
        (code, kind, direction, amount, fee, counterparty, party_key, account, balance, date, time, raw, status, sms_ms, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.code, p.kind, p.direction, p.amount, p.fee, p.counterparty, p.partyKey, p.account, p.balance,
        p.date, p.time, msg.body, status, msg.date || null, nowIso()]
    );
    if (res.changes > 0) added++;
    if (p.balance != null && p.kind !== 'business') {
      const ms = msg.date || 0;
      if (!newest || ms >= newest.ms) newest = { ms, amount: p.balance, date: p.date, time: p.time };
    }
  }
  if (newest) {
    const saved = await getSetting('mpesa_balance', null);
    if (!saved || newest.ms >= (saved.ms || 0)) await setSetting('mpesa_balance', newest);
  }
  if (added > 0) await logEvent('mpesa_import', { added });
  const pending = await get("SELECT COUNT(*) AS n FROM mpesa_inbox WHERE status = 'pending'");
  return { added, pending: pending.n };
}

function startOfMonthMs() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
}

// Reads new M-Pesa SMS from the phone. Safe to call often.
// Returns { available, permission, added, pending }
export async function syncFromPhone() {
  if (!isAvailable()) return { available: false, permission: false, added: 0, pending: 0 };
  if (!(await hasPermission())) return { available: true, permission: false, added: 0, pending: 0 };

  // First time: start from the 1st of this month, so this month's numbers are complete.
  const since = await getSetting('mpesa_since_ms', startOfMonthMs());
  const messages = await readMpesaInbox(since, 3000);
  const res = await importMessages(messages);
  const newestMs = messages.reduce((m, x) => Math.max(m, x.date || 0), since);
  await setSetting('mpesa_since_ms', newestMs);
  return { available: true, permission: true, ...res };
}

// ---------- Reading for the screen ----------

// What did you choose last time for this person/business? Used as a suggestion.
async function suggestionFor(item) {
  if (!item.party_key) return null;
  const last = await get(
    `SELECT bucket_id, source_id, status FROM mpesa_inbox
     WHERE party_key = ? AND direction = ? AND status IN ('done', 'skipped') AND id != ?
     ORDER BY decided_at DESC LIMIT 1`,
    [item.party_key, item.direction, item.id]
  );
  if (!last) return null;
  if (last.status === 'skipped') return { skip: true };
  return { bucketId: last.bucket_id || null, sourceId: last.source_id || null };
}

export async function getMpesaState(month) {
  const pendingRows = await all(
    "SELECT * FROM mpesa_inbox WHERE status = 'pending' ORDER BY sms_ms DESC, id DESC"
  );
  const pending = [];
  for (const r of pendingRows) pending.push({ ...r, suggestion: await suggestionFor(r) });

  const business = await get(
    `SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM mpesa_inbox
     WHERE status = 'business' AND substr(date, 1, 7) = ?`,
    [month]
  );
  const unknown = await all(
    "SELECT raw FROM mpesa_inbox WHERE status = 'unknown' ORDER BY id DESC LIMIT 3"
  );
  const unknownCount = await get("SELECT COUNT(*) AS n FROM mpesa_inbox WHERE status = 'unknown'");
  const fees = await get(
    `SELECT COALESCE(SUM(t.amount), 0) AS n FROM money_tx t JOIN money_buckets b ON b.id = t.bucket_id
     WHERE t.deleted_at IS NULL AND b.key = 'fees' AND substr(t.date, 1, 7) = ?`,
    [month]
  );
  return {
    pending,
    business: { count: business.n, total: business.total },
    unknown: { count: unknownCount.n, samples: unknown.map((u) => u.raw) },
    feesThisMonth: fees.n,
    balance: await getSetting('mpesa_balance', null),
  };
}

// ---------- Sorting ----------

async function feeBucketId() {
  const b = (await getBuckets()).find((x) => x.key === 'fees');
  return b ? b.id : null;
}

// choice: { bucketId } for money out, { sourceId } for money in.
export async function sortItem(id, choice) {
  const item = await get('SELECT * FROM mpesa_inbox WHERE id = ?', [id]);
  if (!item || item.status !== 'pending') return;
  const already = await get('SELECT id FROM money_tx WHERE ext_ref = ?', [item.code]);

  if (!already) {
    if (item.direction === 'out') {
      if (!choice.bucketId) throw new Error('Pick Need or Want');
      await addTx({
        date: item.date, type: 'out', amount: item.amount, bucketId: choice.bucketId,
        note: item.counterparty, origin: 'mpesa', extRef: item.code,
      });
    } else {
      if (!choice.sourceId) throw new Error('Pick where the money came from');
      await addTx({
        date: item.date, type: 'in', amount: item.amount, sourceId: choice.sourceId,
        note: item.counterparty, origin: 'mpesa', extRef: item.code,
      });
    }
    if (item.fee > 0) {
      const fb = await feeBucketId();
      const feeRef = `${item.code}-FEE`;
      const feeDone = await get('SELECT id FROM money_tx WHERE ext_ref = ?', [feeRef]);
      if (fb && !feeDone) {
        await addTx({
          date: item.date, type: 'out', amount: item.fee, bucketId: fb,
          note: `Fee: ${item.counterparty}`, origin: 'mpesa', extRef: feeRef,
        });
      }
    }
  }

  await run(
    "UPDATE mpesa_inbox SET status = 'done', bucket_id = ?, source_id = ?, decided_at = ? WHERE id = ?",
    [choice.bucketId || null, choice.sourceId || null, nowIso(), id]
  );
}

// Not personal spending/income (e.g. moving your own money, a loan to a friend).
export async function skipItem(id) {
  await run("UPDATE mpesa_inbox SET status = 'skipped', decided_at = ? WHERE id = ? AND status = 'pending'", [
    nowIso(),
    id,
  ]);
  await logEvent('mpesa_skip', { id });
}

// One tap: apply your previous choice to everything that has one. Returns how many were sorted.
export async function sortAllSuggested() {
  const { pending } = await getMpesaState('0000-00');
  let n = 0;
  for (const item of pending) {
    const s = item.suggestion;
    if (!s) continue;
    if (s.skip) await skipItem(item.id);
    else if (item.direction === 'out' && s.bucketId) await sortItem(item.id, { bucketId: s.bucketId });
    else if (item.direction === 'in' && s.sourceId) await sortItem(item.id, { sourceId: s.sourceId });
    else continue;
    n++;
  }
  return n;
}
