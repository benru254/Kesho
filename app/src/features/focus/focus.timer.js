// Focus timer math (pure logic — tested on its own).
// The timer is based on clock times, not on counting ticks, so it stays correct
// when the phone sleeps or Kesho is in the background.

export const DURATIONS = [15, 25, 45];

export function endTimeMs(startedAtIso, plannedMin) {
  return new Date(startedAtIso).getTime() + plannedMin * 60000;
}

export function remainingMs(startedAtIso, plannedMin, nowMs = Date.now()) {
  return Math.max(0, endTimeMs(startedAtIso, plannedMin) - nowMs);
}

// Whole minutes actually focused (never more than planned).
export function minutesDone(startedAtIso, plannedMin, nowMs = Date.now()) {
  const mins = Math.floor((nowMs - new Date(startedAtIso).getTime()) / 60000);
  return Math.max(0, Math.min(plannedMin, mins));
}

// 0 → 1
export function fraction(startedAtIso, plannedMin, nowMs = Date.now()) {
  const total = plannedMin * 60000;
  return total <= 0 ? 1 : 1 - remainingMs(startedAtIso, plannedMin, nowMs) / total;
}

// 754000 → "12:34"
export function clock(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// 95 → "1 h 35 min", 40 → "40 min"
export function prettyMinutes(min) {
  const m = Math.round(min || 0);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h} h ${rest} min` : `${h} h`;
}
