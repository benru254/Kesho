// Focus sessions: start, end, and survive the app being closed in the middle.

import { run, get, nowIso, logEvent } from '../../core/db/database';
import { getSetting, setSetting } from '../../core/settings';
import { scheduleAt, cancel } from '../../core/notify';
import { dateKey } from '../../core/dates';
import { endTimeMs, minutesDone, remainingMs } from './focus.timer';

const ACTIVE_KEY = 'focus_active';
const NOTIFY_ID = 'kesho-focus';
const MIN_TO_COUNT = 1; // sessions shorter than this are treated as false starts

export async function getActive() {
  return getSetting(ACTIVE_KEY, null);
}

export async function startSession({ taskId = null, title = '', plannedMin }) {
  const startedAt = nowIso();
  const res = await run(
    'INSERT INTO focus_sessions (date, task_id, title, planned_min, started_at) VALUES (?, ?, ?, ?, ?)',
    [dateKey(), taskId, title, plannedMin, startedAt]
  );
  const active = { id: res.lastInsertRowId, taskId, title, plannedMin, startedAt };
  await setSetting(ACTIVE_KEY, active);
  await scheduleAt(
    NOTIFY_ID,
    new Date(endTimeMs(startedAt, plannedMin)),
    '⏱ Focus done',
    title ? `${plannedMin} minutes on “${title}”. Open Kesho and tick it off.` : `${plannedMin} focused minutes. Well done.`,
    { tab: 'today' }
  );
  await logEvent('focus_start', { plannedMin });
  return active;
}

// Ends the running session. Returns { minutes, counted } (counted = false for a false start).
export async function endSession(nowMs = Date.now()) {
  const active = await getActive();
  if (!active) return { minutes: 0, counted: false };
  const minutes = minutesDone(active.startedAt, active.plannedMin, nowMs);
  const completed = remainingMs(active.startedAt, active.plannedMin, nowMs) === 0 ? 1 : 0;
  await setSetting(ACTIVE_KEY, null);
  await cancel(NOTIFY_ID);
  if (minutes < MIN_TO_COUNT) {
    await run('DELETE FROM focus_sessions WHERE id = ?', [active.id]);
    return { minutes: 0, counted: false, active };
  }
  const endedAt = new Date(Math.min(nowMs, endTimeMs(active.startedAt, active.plannedMin))).toISOString();
  await run('UPDATE focus_sessions SET actual_min = ?, completed = ?, ended_at = ? WHERE id = ?', [
    minutes, completed, endedAt, active.id,
  ]);
  await logEvent('focus_end', { minutes, completed });
  return { minutes, counted: true, completed: !!completed, active };
}

// Called when the app opens. If a session ran out while Kesho was closed, it is saved
// with full credit. If it is still running, it is returned so the timer can reappear.
export async function resumeOrSettle(nowMs = Date.now()) {
  const active = await getActive();
  if (!active) return null;
  if (remainingMs(active.startedAt, active.plannedMin, nowMs) > 0) return active;
  await endSession(nowMs);
  return null;
}

export async function minutesOn(date) {
  const row = await get('SELECT COALESCE(SUM(actual_min), 0) AS n FROM focus_sessions WHERE date = ?', [date]);
  return row.n;
}
