// All database logic for the Today screen. Screens call these, never SQL.

import { run, get, all, nowIso, logEvent } from '../../core/db/database';
import { addDays, daysBetween } from '../../core/dates';

const DAY_FIELDS = [
  'mood', 'sleep_hours', 'sleep_quality', 'moved', 'stress',
  'win_note', 'morning_done_at', 'night_done_at',
];

export const MAX_TASKS = 3;

export async function getDay(date) {
  return get('SELECT * FROM daily_log WHERE date = ?', [date]);
}

export async function saveDay(date, fields) {
  const keys = Object.keys(fields).filter((k) => DAY_FIELDS.includes(k));
  if (keys.length === 0) return;
  await run(
    'INSERT INTO daily_log (date, updated_at) VALUES (?, ?) ON CONFLICT(date) DO NOTHING',
    [date, nowIso()]
  );
  const setSql = keys.map((k) => `${k} = ?`).join(', ');
  await run(`UPDATE daily_log SET ${setSql}, updated_at = ? WHERE date = ?`, [
    ...keys.map((k) => fields[k]),
    nowIso(),
    date,
  ]);
}

// ---------- Check-ins ----------

export async function finishMorning(date, { mood, sleep_hours, sleep_quality }) {
  await saveDay(date, { mood, sleep_hours, sleep_quality, morning_done_at: nowIso() });
  await logEvent('morning_checkin', { date, mood, sleep_hours, sleep_quality });
}

export async function finishNight(date, { stress, win_note }) {
  await saveDay(date, { stress, win_note: win_note || null, night_done_at: nowIso() });
  await logEvent('night_checkin', { date, stress });
}

// Returns { firstEver: bool } so the screen can celebrate.
export async function setMoved(date, moved) {
  const before = await get('SELECT COUNT(*) AS n FROM daily_log WHERE moved = 1');
  await saveDay(date, { moved: moved ? 1 : 0 });
  await logEvent(moved ? 'moved' : 'moved_undo', { date });
  return { firstEver: moved && before.n === 0 };
}

export async function movedDaysThisWeek(today) {
  const from = addDays(today, -6);
  const row = await get(
    'SELECT COUNT(*) AS n FROM daily_log WHERE moved = 1 AND date BETWEEN ? AND ?',
    [from, today]
  );
  return row.n;
}

// ---------- Tasks ----------

export async function getTasks(date) {
  return all('SELECT * FROM tasks WHERE date = ? ORDER BY id', [date]);
}

export async function addTask(date, title) {
  const clean = title.trim();
  if (!clean) return;
  const count = await get('SELECT COUNT(*) AS n FROM tasks WHERE date = ?', [date]);
  if (count.n >= MAX_TASKS) return;
  await run('INSERT INTO tasks (date, title, created_at) VALUES (?, ?, ?)', [date, clean, nowIso()]);
}

export async function toggleTask(id, done) {
  await run('UPDATE tasks SET done = ?, done_at = ? WHERE id = ?', [
    done ? 1 : 0,
    done ? nowIso() : null,
    id,
  ]);
  await logEvent(done ? 'task_done' : 'task_undone', { id });
}

export async function deleteTask(id) {
  await run('DELETE FROM tasks WHERE id = ?', [id]);
}

// Unfinished tasks from the most recent earlier day that were not carried yet.
export async function getCarryOverCandidates(today) {
  const last = await get('SELECT MAX(date) AS d FROM tasks WHERE date < ?', [today]);
  if (!last || !last.d) return { fromDate: null, tasks: [] };
  const tasks = await all(
    'SELECT * FROM tasks WHERE date = ? AND done = 0 AND carried_to IS NULL ORDER BY id',
    [last.d]
  );
  return { fromDate: last.d, tasks };
}

export async function carryOver(today, tasks) {
  const existing = await get('SELECT COUNT(*) AS n FROM tasks WHERE date = ?', [today]);
  const room = Math.max(0, MAX_TASKS - existing.n);
  for (const t of tasks.slice(0, room)) {
    await run('INSERT INTO tasks (date, title, created_at) VALUES (?, ?, ?)', [today, t.title, nowIso()]);
  }
  for (const t of tasks) {
    await run('UPDATE tasks SET carried_to = ? WHERE id = ?', [today, t.id]);
  }
}

export async function dismissCarryOver(tasks) {
  for (const t of tasks) {
    await run("UPDATE tasks SET carried_to = 'dropped' WHERE id = ?", [t.id]);
  }
}

// ---------- Welcome message (no guilt, ever) ----------

export async function getWelcome(today) {
  const total = await get('SELECT COUNT(*) AS n FROM daily_log WHERE morning_done_at IS NOT NULL OR night_done_at IS NOT NULL');
  const last = await get(
    'SELECT MAX(date) AS d FROM daily_log WHERE date < ? AND (morning_done_at IS NOT NULL OR night_done_at IS NOT NULL)',
    [today]
  );
  const daysLogged = total.n;

  if (daysLogged === 0 && (!last || !last.d)) {
    return { kind: 'first', text: 'Day one. Start small: one check-in is a win.', daysLogged };
  }
  if (last && last.d) {
    const gap = daysBetween(last.d, today);
    if (gap === 2) {
      return { kind: 'nudge', text: 'You missed yesterday. That is normal. Just don’t miss twice — today counts.', daysLogged };
    }
    if (gap > 2) {
      return { kind: 'back', text: `Welcome back. ${gap - 1} days away — no problem. Fresh start today.`, daysLogged };
    }
  }
  return { kind: 'normal', text: `Day ${daysLogged + (await isTodayLogged(today) ? 0 : 1)} of showing up for yourself.`, daysLogged };
}

async function isTodayLogged(today) {
  const row = await getDay(today);
  return !!(row && (row.morning_done_at || row.night_done_at));
}

// ---------- Energy note (you are unpredictable — the plan bends, it doesn't break) ----------

export function energyNote(mood) {
  if (mood == null) return null;
  if (mood <= 2) {
    return { kind: 'low', text: 'Low-energy day. The minimum: one task + close the day tonight. That counts as a full win.' };
  }
  if (mood === 5) {
    return { kind: 'high', text: 'High energy today. Spend it on the hardest, most important thing first.' };
  }
  return null;
}
