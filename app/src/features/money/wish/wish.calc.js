// The 24-hour rule (pure logic — tested on its own).
// A want that is parked for a day usually loses its grip. If you still want it tomorrow,
// buying it is a decision — not a mood.

export const WAIT_HOURS = 24;

export function unlockTime(createdIso) {
  return new Date(new Date(createdIso).getTime() + WAIT_HOURS * 3600000).toISOString();
}

// { ready: bool, hoursLeft: number } for one waiting wish.
export function waitState(unlockIso, nowMs = Date.now()) {
  const ms = new Date(unlockIso).getTime() - nowMs;
  return { ready: ms <= 0, hoursLeft: ms <= 0 ? 0 : Math.ceil(ms / 3600000) };
}
