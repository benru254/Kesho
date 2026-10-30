// THE GOAL MATH (pure logic — tested on its own).
//
// Your goal: grow monthly income from a starting point to a target by a date.
// The honest path is not a straight line: to 10x in ~15 months you must grow by the
// SAME PERCENT every month (compound growth). This file draws that path and tells you
// where you stand against it — no flattery.

export const DEFAULT_GOAL = {
  startMonth: '2026-10',
  startAmount: 10000,
  goalMonth: '2028-01',
  goalAmount: 100000,
};

export const MONEY_LADDER = [10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000];

export function monthKey(d = new Date()) {
  const m = d.getMonth() + 1;
  return `${d.getFullYear()}-${m < 10 ? '0' : ''}${m}`;
}

export function addMonths(key, n) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}

export function monthsBetween(fromKey, toKey) {
  const [y1, m1] = fromKey.split('-').map(Number);
  const [y2, m2] = toKey.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

export function daysInMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function monthName(key) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m] = key.split('-').map(Number);
  return `${names[m - 1]} ${y}`;
}

// Monthly growth needed, e.g. 0.166 = 16.6% every month.
export function monthlyGrowthNeeded(goal) {
  const months = monthsBetween(goal.startMonth, goal.goalMonth);
  if (months <= 0 || goal.startAmount <= 0) return 0;
  return Math.pow(goal.goalAmount / goal.startAmount, 1 / months) - 1;
}

// What you should be earning in a given month to stay on the path.
export function targetFor(goal, key) {
  const total = monthsBetween(goal.startMonth, goal.goalMonth);
  const k = monthsBetween(goal.startMonth, key);
  if (k <= 0) return goal.startAmount;
  if (k >= total) return goal.goalAmount;
  return Math.round(goal.startAmount * Math.pow(1 + monthlyGrowthNeeded(goal), k));
}

// Where you stand this month. dayOfMonth = today's date number.
export function monthStatus(goal, key, earnedSoFar, dayOfMonth) {
  const target = targetFor(goal, key);
  const days = daysInMonth(key);
  const pace = dayOfMonth > 0 ? Math.round((earnedSoFar / dayOfMonth) * days) : 0;
  const gap = target - earnedSoFar;
  let verdict;
  if (earnedSoFar >= target) verdict = 'hit';
  else if (pace >= target) verdict = 'on_track';
  else verdict = 'behind';
  return {
    target,
    earned: earnedSoFar,
    pace,
    gap: Math.max(0, gap),
    daysLeft: days - dayOfMonth,
    percent: target > 0 ? Math.min(100, Math.round((earnedSoFar / target) * 100)) : 0,
    verdict,
  };
}

// Your current rung on the 1 → 1B ladder from your notebook.
export function ladderLevel(amount) {
  let reached = null;
  let next = MONEY_LADDER[0];
  for (const rung of MONEY_LADDER) {
    if (amount >= rung) reached = rung;
    else { next = rung; break; }
    next = null;
  }
  return { reached, next };
}
