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

export async function setMoved(date, moved) {
  await saveDay(date, { moved: moved ? 1 : 0 });
  await logEvent(moved ? 'moved' : 'moved_undo', { date });
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

// The ONE thing first, then the order they were added.
export async function getTasks(date) {
  return all('SELECT * FROM tasks WHERE date = ? ORDER BY is_one DESC, id', [date]);
}

export async function addTask(date, title) {
  const clean = title.trim();
  if (!clean) return;
  const count = await get('SELECT COUNT(*) AS n FROM tasks WHERE date = ?', [date]);
  if (count.n >= MAX_TASKS) return;
  // The first task of a day becomes the ONE thing until you choose another.
  const isOne = count.n === 0 ? 1 : 0;
  await run('INSERT INTO tasks (date, title, is_one, created_at) VALUES (?, ?, ?, ?)', [date, clean, isOne, nowIso()]);
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

// Make this task the ONE thing of its day (only one per day).
export async function setOne(id) {
  const task = await get('SELECT date FROM tasks WHERE id = ?', [id]);
  if (!task) return;
  await run('UPDATE tasks SET is_one = 0 WHERE date = ?', [task.date]);
  await run('UPDATE tasks SET is_one = 1 WHERE id = ?', [id]);
}

// "Tomorrow starts tonight": the one thing chosen in the night check-in.
export async function getTomorrowOne(today) {
  const row = await get('SELECT title FROM tasks WHERE date = ? AND is_one = 1', [addDays(today, 1)]);
  return row ? row.title : null;
}

export async function setTomorrowOne(today, title) {
  const clean = String(title || '').trim();
  if (!clean) return;
  const tomorrow = addDays(today, 1);
  const existing = await get('SELECT id FROM tasks WHERE date = ? AND is_one = 1', [tomorrow]);
  if (existing) {
    await run('UPDATE tasks SET title = ? WHERE id = ?', [clean, existing.id]);
  } else {
    await run('INSERT INTO tasks (date, title, is_one, created_at) VALUES (?, ?, 1, ?)', [tomorrow, clean, nowIso()]);
  }
  await logEvent('tomorrow_planned', { date: tomorrow });
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
  const existing = await get('SELECT COUNT(*) AS n, COALESCE(SUM(is_one), 0) AS ones FROM tasks WHERE date = ?', [today]);
  const room = Math.max(0, MAX_TASKS - existing.n);
  let hasOne = existing.ones > 0;
  for (const t of tasks.slice(0, room)) {
    const isOne = !hasOne && (t.is_one || existing.n === 0) ? 1 : 0;
    if (isOne) hasOne = true;
    await run('INSERT INTO tasks (date, title, is_one, created_at) VALUES (?, ?, ?, ?)', [today, t.title, isOne, nowIso()]);
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

// ---------- Where you stand (never guilt) ----------

const SHOWED_UP = 'morning_done_at IS NOT NULL OR night_done_at IS NOT NULL OR moved = 1';

// kind: 'first' (never used) · 'nudge' (missed exactly yesterday) · 'back' (away 2+ days) · 'normal'
// dayNumber: which day of showing up today is (it never resets — missed days just don't count).
export async function getDayContext(today) {
  const before = await get(`SELECT COUNT(*) AS n, MAX(date) AS last FROM daily_log WHERE date < ? AND (${SHOWED_UP})`, [today]);
  const dayNumber = before.n + 1;
  if (before.n === 0) return { kind: 'first', gapDays: 0, dayNumber };
  const gapDays = daysBetween(before.last, today);
  if (gapDays === 2) return { kind: 'nudge', gapDays, dayNumber };
  if (gapDays > 2) return { kind: 'back', gapDays, dayNumber };
  return { kind: 'normal', gapDays, dayNumber };
}

// Small numbers shown under the sky. Reads (never writes) the Focus and Pause tables.
export async function getTodayExtras(today) {
  const focus = await get('SELECT COALESCE(SUM(actual_min), 0) AS n FROM focus_sessions WHERE date = ?', [today]);
  const held = await get("SELECT COUNT(*) AS n FROM urges WHERE date = ? AND outcome = 'held'", [today]);
  return { focusMin: focus.n, urgesHeld: held.n };
}
