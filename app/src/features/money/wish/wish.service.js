// Wait list data: wants parked for 24 hours, and what happened to them.

import { run, get, all, nowIso, logEvent } from '../../../core/db/database';
import { dateKey } from '../../../core/dates';
import { addTx, getBuckets } from '../money.service';
import { unlockTime } from './wish.calc';

export async function addWish(title, amount) {
  const clean = String(title || '').trim();
  if (!clean) throw new Error('What is the thing you want?');
  const created = nowIso();
  await run('INSERT INTO wishes (title, amount, created_at, unlock_at) VALUES (?, ?, ?, ?)', [
    clean, Math.max(0, Math.round(Number(amount) || 0)), created, unlockTime(created),
  ]);
  await logEvent('wish_parked', {});
}

export async function getWaiting() {
  return all("SELECT * FROM wishes WHERE status = 'waiting' ORDER BY unlock_at");
}

// You decided you don't need it. The money stays yours.
export async function dropWish(id) {
  await run("UPDATE wishes SET status = 'dropped', decided_at = ? WHERE id = ? AND status = 'waiting'", [nowIso(), id]);
  await logEvent('wish_dropped', { id });
}

// You still want it after waiting: buy it on purpose. Records the spending under Wants.
export async function buyWish(id) {
  const wish = await get("SELECT * FROM wishes WHERE id = ? AND status = 'waiting'", [id]);
  if (!wish) return;
  if (wish.amount > 0) {
    const wants = (await getBuckets()).find((b) => b.key === 'wants');
    await addTx({ date: dateKey(), type: 'out', amount: wish.amount, bucketId: wants.id, note: wish.title });
  }
  await run("UPDATE wishes SET status = 'bought', decided_at = ? WHERE id = ?", [nowIso(), id]);
  await logEvent('wish_bought', { id });
}

// Lifetime: how much stayed in your pocket because you waited.
export async function getKept() {
  const row = await get("SELECT COUNT(*) AS n, COALESCE(SUM(amount), 0) AS total FROM wishes WHERE status = 'dropped'");
  return { count: row.n, total: row.total };
}
