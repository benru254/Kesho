// The Pause button's data: every urge you faced, and how it ended.

import { run, get, all, nowIso, logEvent } from '../../core/db/database';
import { dateKey } from '../../core/dates';

export const TRIGGERS = [
  { key: 'phone', label: '📱 Scrolling / phone' },
  { key: 'spend', label: '💸 Spending money' },
  { key: 'skip', label: '🛋️ Skipping the work' },
  { key: 'anger', label: '😤 Anger / stress' },
  { key: 'food', label: '🍺 Food / drink' },
  { key: 'other', label: 'Something else' },
];

// Records that an urge came up. Returns its id (the outcome is set later).
export async function logUrge(triggerKey) {
  const res = await run('INSERT INTO urges (date, trigger_key, created_at) VALUES (?, ?, ?)', [
    dateKey(), triggerKey, nowIso(),
  ]);
  await logEvent('urge', { trigger: triggerKey });
  return res.lastInsertRowId;
}

// outcome: 'held' | 'slipped'
export async function setOutcome(id, outcome) {
  await run('UPDATE urges SET outcome = ? WHERE id = ?', [outcome, id]);
  await logEvent(`urge_${outcome}`, { id });
}

export async function getUrgeStats() {
  const row = await get(
    "SELECT COUNT(*) AS total, COALESCE(SUM(outcome = 'held'), 0) AS held FROM urges"
  );
  const top = await all(
    'SELECT trigger_key, COUNT(*) AS n FROM urges GROUP BY trigger_key ORDER BY n DESC LIMIT 1'
  );
  return { total: row.total, held: row.held, topTrigger: top.length ? top[0].trigger_key : null };
}
