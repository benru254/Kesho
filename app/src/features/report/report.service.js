// Report data: reads (never writes) the tables of Today and Money, then hands them to report.calc.js.

import { all } from '../../core/db/database';
import { dateKey, addDays, weekDays, keyToDate, startOfWeek } from '../../core/dates';
import {
  buildDays, weekStats, compareWeeks, findPatterns, nextFocus,
} from './report.calc';

const PATTERN_DAYS = 28;

async function loadRange(fromKey, toKey) {
  const fromIso = keyToDate(fromKey).toISOString();
  const toIso = keyToDate(addDays(toKey, 1)).toISOString();
  const [dailyLog, tasks, money, events] = await Promise.all([
    all('SELECT * FROM daily_log WHERE date BETWEEN ? AND ?', [fromKey, toKey]),
    all('SELECT date, done FROM tasks WHERE date BETWEEN ? AND ?', [fromKey, toKey]),
    all(
      `SELECT t.date, t.type, t.amount, b.key AS bucket_key FROM money_tx t
       LEFT JOIN money_buckets b ON b.id = t.bucket_id
       WHERE t.deleted_at IS NULL AND t.date BETWEEN ? AND ?`,
      [fromKey, toKey]
    ),
    all('SELECT created_at FROM events WHERE created_at >= ? AND created_at < ?', [fromIso, toIso]),
  ]);
  const activeDates = events.map((e) => dateKey(new Date(e.created_at)));
  return { dailyLog, tasks, money, activeDates };
}

// Which week to open by default: this week — except on Monday, when last week is the useful one.
export function defaultWeek(todayKey = dateKey()) {
  const monday = startOfWeek(todayKey);
  return monday === todayKey ? addDays(monday, -7) : monday;
}

export async function getWeekReport(mondayKey, todayKey = dateKey()) {
  const sunday = addDays(mondayKey, 6);
  const prevMonday = addDays(mondayKey, -7);
  const patternEnd = sunday < todayKey ? sunday : todayKey;
  const patternStart = addDays(patternEnd, -(PATTERN_DAYS - 1));
  const from = patternStart < prevMonday ? patternStart : prevMonday;

  const data = await loadRange(from, sunday);
  const daysFor = (keys) => buildDays({ keys, ...data });

  const cur = weekStats(daysFor(weekDays(mondayKey)), todayKey);
  const prev = weekStats(daysFor(weekDays(prevMonday)), todayKey);
  const patternKeys = [];
  for (let i = 0; i < PATTERN_DAYS; i++) patternKeys.push(addDays(patternStart, i));

  return {
    monday: mondayKey,
    sunday,
    isCurrentWeek: mondayKey === startOfWeek(todayKey),
    isFuture: mondayKey > todayKey,
    cur,
    prev,
    diff: compareWeeks(cur, prev),
    patterns: findPatterns(daysFor(patternKeys)),
    focus: nextFocus(cur),
  };
}
