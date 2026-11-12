// MILESTONES (pure logic — tested on its own).
// Milestones mark real, lasting progress. They are counted from totals that never reset,
// so a bad week can slow you down but can never take anything away.

const DAYS = [1, 3, 7, 14, 21, 30, 50, 75, 100, 150, 200, 300, 365];
const HELD = [1, 5, 10, 25, 50, 100];
const FOCUS_HOURS = [1, 5, 10, 25, 50, 100];
const SAVED = [1000, 10000, 100000, 1000000];
const KEPT = [1, 5000, 20000, 50000];

const DAY_TEXT = {
  1: 'You started. Most people only talk about it.',
  3: 'Three days. A pattern is forming.',
  7: 'One full week of showing up.',
  14: 'Two weeks. The hardest part — starting — is behind you.',
  21: 'Three weeks. It is getting easier, and that is not an accident.',
  30: 'A month of showing up. This is who you are now.',
  50: 'Fifty days. You are not trying this — you are doing it.',
  75: 'Seventy-five days of evidence against “I am lazy”.',
  100: 'One hundred days. Almost nobody gets here.',
  150: 'One hundred and fifty days. This is a way of life.',
  200: 'Two hundred days. Look how far the start is behind you.',
  300: 'Three hundred days of proof.',
  365: 'A full year of days. You built this one day at a time.',
};

function commas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Every milestone that exists, with the number it needs.
// stats: { days, held, focusMin, saved, kept }
function catalog() {
  const list = [];
  for (const n of DAYS) {
    list.push({ key: `days-${n}`, group: 'days', need: n, emoji: '🌅', title: `Day ${n}`, text: DAY_TEXT[n] });
  }
  for (const n of HELD) {
    list.push({
      key: `held-${n}`, group: 'held', need: n, emoji: '🛡️',
      title: n === 1 ? 'First urge held' : `${n} urges held`,
      text: n === 1 ? 'You paused instead of reacting. That is the whole skill, done once.' : `${n} times you chose instead of reacting. Feelings no longer drive alone.`,
    });
  }
  for (const n of FOCUS_HOURS) {
    list.push({
      key: `focus-${n}`, group: 'focus', need: n * 60, emoji: '🎯',
      title: n === 1 ? 'First hour of deep focus' : `${n} hours of deep focus`,
      text: 'Focused hours are what income is made of.',
    });
  }
  for (const n of SAVED) {
    list.push({ key: `saved-${n}`, group: 'saved', need: n, emoji: '💰', title: `KES ${commas(n)} saved`, text: 'Money you moved out of reach of your moods. Next level is waiting.' });
  }
  for (const n of KEPT) {
    list.push({
      key: `kept-${n}`, group: 'kept', need: n, emoji: '🧘',
      title: n === 1 ? 'First want you let go' : `KES ${commas(n)} kept by waiting`,
      text: 'You waited 24 hours and the want lost its grip. That money is still yours.',
    });
  }
  return list;
}

const VALUE = { days: 'days', held: 'held', focus: 'focusMin', saved: 'saved', kept: 'kept' };

// Which milestones are newly reached.
// Returns { save: [keys to store], show: [milestones to celebrate] }.
// Only the HIGHEST new milestone per group is celebrated (so old data never causes a flood).
export function newMilestones(stats, reachedKeys) {
  const reached = new Set(reachedKeys);
  const fresh = catalog().filter((m) => (stats[VALUE[m.group]] || 0) >= m.need && !reached.has(m.key));
  const best = {};
  for (const m of fresh) {
    if (!best[m.group] || m.need > best[m.group].need) best[m.group] = m;
  }
  return { save: fresh.map((m) => m.key), show: Object.values(best) };
}

// The next "Day N" milestone and how many days are left to it (null after 365).
export function nextDayMilestone(days) {
  const next = DAYS.find((n) => n > days);
  return next ? { day: next, left: next - days } : null;
}

// Titles for milestone keys (for the list on the Me tab).
export function describe(keys) {
  const map = Object.fromEntries(catalog().map((m) => [m.key, m]));
  return keys.filter((k) => map[k]).map((k) => map[k]);
}
