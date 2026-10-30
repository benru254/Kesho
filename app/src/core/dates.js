// Dates are stored as local "YYYY-MM-DD" keys (Nairobi time on your phone).

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const dt = keyToDate(key);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt);
}

export function daysBetween(fromKey, toKey) {
  const ms = keyToDate(toKey) - keyToDate(fromKey);
  return Math.round(ms / 86400000);
}

export function prettyDate(key) {
  const d = keyToDate(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function isMonday(key) {
  return keyToDate(key).getDay() === 1;
}

export function isFirstOfMonth(key) {
  return keyToDate(key).getDate() === 1;
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ---------- Weeks (Monday → Sunday) ----------

// Monday of the week that contains `key`.
export function startOfWeek(key) {
  const day = keyToDate(key).getDay(); // 0 = Sunday
  const back = day === 0 ? 6 : day - 1;
  return addDays(key, -back);
}

// The 7 date keys of the week starting on Monday `mondayKey`.
export function weekDays(mondayKey) {
  return [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(mondayKey, i));
}

// "26 Oct"
export function shortDate(key) {
  const d = keyToDate(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}
