// Reminder plan: skips what's done, max 3 a day, gentle when away, fresh start on Mondays.
import { check, done } from './lib/check.js';
import { buildPlan, DEFAULT_TIMES, shiftTime } from '../src/features/reminders/reminders.plan.js';

const perDayMax = (plan) => {
  const m = {};
  plan.forEach((p) => { const k = p.at.toDateString(); m[k] = (m[k] || 0) + 1; });
  return Math.max(...Object.values(m));
};
const now = new Date(2026, 9, 21, 17, 30); // Wed 17:30

const a = buildPlan({ now, todayKey: '2026-10-21', times: DEFAULT_TIMES,
  today: { morningDone: true, moved: true, nightDone: false, active: true, mood: 2 } });
check(/Hard day|Not every/.test(a[0].body), 'low mood → gentle night message');
check(!a.some((p) => p.at.getDate() === 21 && p.slot === 'move'), 'no move reminder once moved');
check(perDayMax(a) <= 3, 'never more than 3 a day');

const b = buildPlan({ now, todayKey: '2026-10-21', times: DEFAULT_TIMES,
  today: { morningDone: false, moved: false, nightDone: false, active: false, mood: null } });
const tomorrow = b.filter((p) => p.at.getDate() === 22);
check(tomorrow[0].kind === 'back' && /slipped|human/.test(tomorrow[0].body), '"don\'t miss twice" after a missed day');
check(b.filter((p) => p.at.getDate() === 23).length === 1, 'away 2+ days → only one reminder a day');
check(b.length < 25, 'tapers off when away (no spam)');

const c = buildPlan({ now, todayKey: '2026-10-21', times: { ...DEFAULT_TIMES, morning: { on: false, h: 6, m: 0 } },
  today: { morningDone: true, moved: true, nightDone: true, active: true, mood: 4 } });
check(!c.some((p) => p.slot === 'morning'), 'switched-off reminder never sent');

const mon = buildPlan({ now: new Date(2026, 9, 25, 20, 0), todayKey: '2026-10-25', times: DEFAULT_TIMES,
  today: { morningDone: true, moved: true, nightDone: true, active: true, mood: 4 } }).find((p) => p.at.getDay() === 1);
check(/New week/.test(mon.body), 'Monday = fresh start message');

check(JSON.stringify(shiftTime({ h: 23, m: 50, on: true }, 15)) === '{"h":0,"m":5,"on":true}', 'time wraps past midnight');
done();
