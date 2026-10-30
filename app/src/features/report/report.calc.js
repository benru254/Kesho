// THE REPORT BRAIN (pure logic — tested on its own).
//
// Turns raw rows into: this week's numbers, change vs last week, patterns over the last 28 days,
// and ONE focus for next week. Honesty rules:
// - Patterns are shown only with enough data (3+ days in each group) and a real difference.
// - A pattern is "something that tends to happen together", not proof of cause. The screen says so.
// - Days in the future are never counted as "missed".

// ---------- Helpers ----------

function avg(list) {
  const nums = list.filter((x) => typeof x === 'number' && Number.isFinite(x));
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function round1(x) {
  return x == null ? null : Math.round(x * 10) / 10;
}

function byDate(rows) {
  const map = {};
  for (const r of rows) {
    if (!map[r.date]) map[r.date] = [];
    map[r.date].push(r);
  }
  return map;
}

// ---------- One day ----------

// Collects everything known about each day into one simple record.
// input: { keys, dailyLog, tasks, money, activeDates }
//   dailyLog: rows of daily_log           tasks: rows of tasks
//   money: [{ date, type, amount, bucket_key }]   activeDates: ['YYYY-MM-DD', ...] (any action that day)
export function buildDays({ keys, dailyLog, tasks, money, activeDates }) {
  const logMap = Object.fromEntries(dailyLog.map((d) => [d.date, d]));
  const taskMap = byDate(tasks);
  const moneyMap = byDate(money);
  const active = new Set(activeDates);
  return keys.map((date) => {
    const log = logMap[date] || {};
    const t = taskMap[date] || [];
    const m = moneyMap[date] || [];
    const sum = (fn) => m.filter(fn).reduce((a, r) => a + r.amount, 0);
    return {
      date,
      active: active.has(date) || !!log.morning_done_at || !!log.night_done_at || !!log.moved,
      morning: !!log.morning_done_at,
      night: !!log.night_done_at,
      sleep: log.sleep_hours ?? null,
      quality: log.sleep_quality ?? null,
      mood: log.mood ?? null,
      stress: log.stress ?? null,
      moved: !!log.moved,
      tasksPlanned: t.length,
      tasksDone: t.filter((x) => x.done).length,
      moneyIn: sum((r) => r.type === 'in'),
      needs: sum((r) => r.type === 'out' && r.bucket_key === 'needs'),
      wants: sum((r) => r.type === 'out' && r.bucket_key === 'wants'),
      fees: sum((r) => r.type === 'out' && r.bucket_key === 'fees'),
      out: sum((r) => r.type === 'out'),
      aside: sum((r) => r.type === 'aside'),
    };
  });
}

// ---------- One week ----------

// days: output of buildDays for 7 days. todayKey: days after it are "not yet".
export function weekStats(days, todayKey) {
  const counted = days.filter((d) => d.date <= todayKey);
  const n = counted.length;

  // "Never miss twice": count runs of 2+ missed days in a row.
  let run = 0;
  let missedTwice = 0;
  for (const d of counted) {
    if (d.active) {
      run = 0;
    } else {
      run++;
      if (run === 2) missedTwice++;
    }
  }

  const planned = counted.reduce((a, d) => a + d.tasksPlanned, 0);
  const done = counted.reduce((a, d) => a + d.tasksDone, 0);
  const sum = (k) => counted.reduce((a, d) => a + d[k], 0);

  return {
    daysCounted: n,
    showedUp: counted.filter((d) => d.active).length,
    morning: counted.filter((d) => d.morning).length,
    night: counted.filter((d) => d.night).length,
    missedTwice,
    sleepAvg: round1(avg(counted.map((d) => d.sleep))),
    sleepShort: counted.filter((d) => d.sleep != null && d.sleep < 6).length,
    moved: counted.filter((d) => d.moved).length,
    moodAvg: round1(avg(counted.map((d) => d.mood))),
    stressAvg: round1(avg(counted.map((d) => d.stress))),
    tasksPlanned: planned,
    tasksDone: done,
    taskRate: planned > 0 ? Math.round((done / planned) * 100) : null,
    moneyIn: sum('moneyIn'),
    needs: sum('needs'),
    wants: sum('wants'),
    fees: sum('fees'),
    out: sum('out'),
    aside: sum('aside'),
  };
}

// Change vs last week for the numbers that matter. null = can't compare.
export function compareWeeks(cur, prev) {
  const diff = (k) => (cur[k] == null || prev[k] == null ? null : round1(cur[k] - prev[k]));
  return {
    showedUp: diff('showedUp'),
    moved: diff('moved'),
    sleepAvg: diff('sleepAvg'),
    moodAvg: diff('moodAvg'),
    stressAvg: diff('stressAvg'),
    taskRate: diff('taskRate'),
    wants: diff('wants'),
    moneyIn: diff('moneyIn'),
  };
}

// ---------- Patterns (last 28 days) ----------

const MIN_GROUP = 3;

function split(days, test, value) {
  const yes = days.filter((d) => test(d) === true && value(d) != null).map(value);
  const no = days.filter((d) => test(d) === false && value(d) != null).map(value);
  return { yes, no, enough: yes.length >= MIN_GROUP && no.length >= MIN_GROUP };
}

// Returns { found: [{ key, text, tone }], loggedDays, needMore }
export function findPatterns(days) {
  const found = [];
  const logged = days.filter((d) => d.morning || d.night);

  // 1. Sleep → mood (sleep is last night, mood is this morning)
  const sleepGroup = (d) => (d.sleep == null ? null : d.sleep >= 7);
  const a = split(days, sleepGroup, (d) => d.mood);
  if (a.enough) {
    const y = avg(a.yes);
    const n = avg(a.no);
    if (Math.abs(y - n) >= 0.5) {
      found.push({
        key: 'sleep_mood',
        tone: y > n ? 'good' : 'info',
        text: `Mood after 7h+ sleep: ${round1(y)}/5 · after less: ${round1(n)}/5.`
          + (y > n ? ' Sleep is buying you better days.' : ''),
      });
    }
  }

  // 2. Movement → stress the same evening
  const b = split(days, (d) => d.moved, (d) => d.stress);
  if (b.enough) {
    const y = avg(b.yes);
    const n = avg(b.no);
    if (Math.abs(y - n) >= 0.5) {
      found.push({
        key: 'move_stress',
        tone: y < n ? 'good' : 'info',
        text: `Stress on days you moved: ${round1(y)}/5 · days you didn't: ${round1(n)}/5.`
          + (y < n ? ' The walk is working.' : ''),
      });
    }
  }

  // 3. Low mood → wants spending
  const c = split(days, (d) => (d.mood == null ? null : d.mood <= 2), (d) => d.wants);
  if (c.enough) {
    const y = avg(c.yes);
    const n = avg(c.no);
    if (y - n >= 100 && y >= n * 1.5) {
      found.push({
        key: 'mood_wants',
        tone: 'warn',
        text: `On low-mood days you spend about KES ${Math.round(y)} on wants, vs KES ${Math.round(n)} on other days.`
          + ' Feelings are spending your money. On low days: wait 24h before any Want.',
      });
    }
  }

  // 4. Sleep → finishing tasks
  const d4 = split(days.filter((d) => d.tasksPlanned > 0), sleepGroup, (d) => (d.tasksDone / d.tasksPlanned) * 100);
  if (d4.enough) {
    const y = avg(d4.yes);
    const n = avg(d4.no);
    if (Math.abs(y - n) >= 15) {
      found.push({
        key: 'sleep_tasks',
        tone: y > n ? 'good' : 'info',
        text: `You finish ${Math.round(y)}% of tasks after 7h+ sleep, ${Math.round(n)}% after less.`,
      });
    }
  }

  return { found, loggedDays: logged.length, needMore: found.length === 0 };
}

// ---------- One focus for next week ----------

// The FIRST rule that matches wins. One focus — not ten.
export function nextFocus(week) {
  const share = week.out > 0 ? week.wants / week.out : 0;
  if (week.daysCounted >= 5 && week.showedUp <= 3) {
    return 'Show up first: open Kesho once every day. Nothing else matters until this sticks.';
  }
  if (week.sleepAvg != null && week.sleepAvg < 6.5) {
    return 'Protect sleep: phone down at 22:45, in bed by 23:00. Everything else gets easier.';
  }
  if (week.daysCounted >= 5 && week.moved < 3) {
    return 'Move on 3 days next week. 10 minutes counts.';
  }
  if (week.out >= 1000 && share > 0.3) {
    return `Wants were ${Math.round(share * 100)}% of spending. Next week: wait 24 hours before any Want.`;
  }
  if (week.taskRate != null && week.tasksPlanned >= 5 && week.taskRate < 50) {
    return 'Plan fewer tasks: 1–2 a day, not 3. Finishing builds momentum; leftovers kill it.';
  }
  if (week.stressAvg != null && week.stressAvg >= 4) {
    return 'Heavy week. Block one evening with zero work — rest is part of the plan.';
  }
  return 'Solid week. Keep the same rhythm — consistency beats intensity.';
}
