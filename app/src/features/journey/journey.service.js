// Journey: lifetime totals and milestones. Reads (never writes) other features' tables.

import { run, get, all, nowIso } from '../../core/db/database';
import { on } from '../../core/bus';
import { celebrate } from '../../core/celebrate';
import { newMilestones, nextDayMilestone, describe } from './journey.calc';

export async function getStats() {
  const row = await get(`
    SELECT
      (SELECT COUNT(*) FROM daily_log WHERE morning_done_at IS NOT NULL OR night_done_at IS NOT NULL OR moved = 1) AS days,
      (SELECT COUNT(*) FROM urges WHERE outcome = 'held') AS held,
      (SELECT COUNT(*) FROM urges) AS urges,
      (SELECT COALESCE(SUM(actual_min), 0) FROM focus_sessions) AS focusMin,
      (SELECT COALESCE(SUM(amount), 0) FROM money_tx WHERE deleted_at IS NULL AND type = 'aside') AS saved,
      (SELECT COALESCE(SUM(amount), 0) FROM wishes WHERE status = 'dropped') AS kept,
      (SELECT COUNT(*) FROM wishes WHERE status = 'dropped') AS keptCount
  `);
  // A dropped wish with no price still counts as "first want you let go".
  return { ...row, kept: Math.max(row.kept, row.keptCount > 0 ? 1 : 0) };
}

// Stores newly reached milestones and returns the ones worth celebrating.
export async function checkMilestones() {
  const stats = await getStats();
  const reached = (await all('SELECT key FROM milestones')).map((r) => r.key);
  const { save, show } = newMilestones(stats, reached);
  for (const key of save) {
    await run('INSERT OR IGNORE INTO milestones (key, reached_at) VALUES (?, ?)', [key, nowIso()]);
  }
  return show;
}

export async function getJourney() {
  const stats = await getStats();
  const rows = await all('SELECT key FROM milestones ORDER BY reached_at DESC, key DESC LIMIT 6');
  return { stats, recent: describe(rows.map((r) => r.key)), next: nextDayMilestone(stats.days) };
}

// Runs once at app start: after every action, check for new milestones and celebrate them.
let started = false;
let timer = null;
export async function initJourney() {
  if (started) return;
  started = true;
  on('event', () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const show = await checkMilestones();
        show.forEach((m) => celebrate({ level: 'big', emoji: m.emoji, title: m.title, text: m.text }));
      } catch (e) {
        console.warn('[journey] milestone check failed', e);
      }
    }, 1500);
  });
}
