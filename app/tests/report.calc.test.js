// Weekly report math on made-up weeks.
import { check, done } from './lib/check.js';
import { buildDays, weekStats, compareWeeks, findPatterns, nextFocus } from '../src/features/report/report.calc.js';
import { weekDays, addDays } from '../src/core/dates.js';

const mon = '2026-10-26';
const keys = weekDays(mon);
// Mon–Fri logged, Sat+Sun missed (= one "missed twice"). Today = Sunday.
const dailyLog = keys.slice(0, 5).map((date, i) => ({
  date, morning_done_at: 'x', night_done_at: i % 2 ? 'x' : null,
  sleep_hours: [8, 5, 7, 6, 8][i], sleep_quality: 2, mood: [4, 2, 4, 3, 5][i], stress: [2, 4, 2, 3, 1][i], moved: i < 2 ? 1 : 0,
}));
const tasks = [
  { date: keys[0], done: 1 }, { date: keys[0], done: 1 }, { date: keys[1], done: 0 }, { date: keys[2], done: 1 },
];
const money = [
  { date: keys[0], type: 'in', amount: 3000, bucket_key: null },
  { date: keys[1], type: 'out', amount: 1200, bucket_key: 'wants' },
  { date: keys[2], type: 'out', amount: 800, bucket_key: 'needs' },
  { date: keys[2], type: 'out', amount: 13, bucket_key: 'fees' },
  { date: keys[3], type: 'aside', amount: 300, bucket_key: 'payme' },
];
const days = buildDays({ keys, dailyLog, tasks, money, activeDates: [] });
const w = weekStats(days, keys[6]);
check(w.daysCounted === 7 && w.showedUp === 5, 'showed up 5 of 7');
check(w.missedTwice === 1, 'Sat+Sun missed = 1× "missed twice"');
check(w.morning === 5 && w.night === 2, 'check-in counts');
check(w.sleepAvg === 6.8 && w.sleepShort === 1, 'sleep average and short nights');
check(w.moved === 2 && w.moodAvg === 3.6 && w.stressAvg === 2.4, 'move, mood, stress');
check(w.tasksPlanned === 4 && w.tasksDone === 3 && w.taskRate === 75, 'tasks 3 of 4');
check(w.moneyIn === 3000 && w.wants === 1200 && w.needs === 800 && w.fees === 13 && w.aside === 300, 'money totals');

const midweek = weekStats(days, keys[2]);
check(midweek.daysCounted === 3 && midweek.missedTwice === 0, 'future days are never "missed"');

const prev = weekStats(buildDays({ keys: weekDays(addDays(mon, -7)), dailyLog: [], tasks: [], money: [], activeDates: [] }), keys[6]);
const diff = compareWeeks(w, prev);
check(diff.showedUp === 5 && diff.sleepAvg === null, 'compare: counts vs empty week, no fake averages');

check(nextFocus(w) === 'Move on 3 days next week. 10 minutes counts.', 'focus picks the weakest habit (moved 2 days)');
check(/Show up first/.test(nextFocus({ ...w, showedUp: 2 })), 'showing up comes before everything');
check(/Protect sleep/.test(nextFocus({ ...w, sleepAvg: 5.9 })), 'short sleep beats movement');

// Patterns: 28 days where 7h+ sleep goes with better mood, and moving goes with lower stress.
const pk = []; for (let i = 0; i < 28; i++) pk.push(addDays('2026-10-03', i));
const pLog = pk.map((date, i) => ({
  date, morning_done_at: 'x', night_done_at: 'x',
  sleep_hours: i % 2 ? 8 : 5, mood: i % 2 ? 4 : 2, moved: i % 3 === 0 ? 1 : 0, stress: i % 3 === 0 ? 2 : 4,
}));
const pat = findPatterns(buildDays({ keys: pk, dailyLog: pLog, tasks: [], money: [], activeDates: [] }));
check(pat.found.some((p) => p.key === 'sleep_mood' && p.tone === 'good'), 'finds sleep → mood pattern');
check(pat.found.some((p) => p.key === 'move_stress' && p.tone === 'good'), 'finds move → stress pattern');
const few = findPatterns(days);
check(!few.found.some((p) => p.key === 'mood_wants'), 'no pattern claimed without 3+ days in each group');
done();
