// Every reminder text lives here. Edit freely — no other file needs to change.
// Several versions per reminder so your brain doesn't learn to ignore them.
// Rule: never guilt. Short. One clear action.

export const TITLES = {
  morning: '☀️ Kesho',
  move: '🚶 Move',
  night: '🌙 Close the day',
  back: '👋 Kesho',
};

export const MESSAGES = {
  morning: [
    'Morning, Reuben. 30-second check-in, then pick today’s 1–3 things.',
    'New day. How do you feel? Tap in and choose what matters.',
    'Before the noise starts: check in and pick your 3.',
    'Your day, your rules. 30 seconds to set it up.',
  ],
  morningFreshWeek: [
    'New week. Clean slate. Last week doesn’t count against you — check in and pick your 3.',
  ],
  morningFreshMonth: [
    'New month. Clean slate. Check in and set the tone for the next 30 days.',
  ],
  dontMissTwice: [
    'Yesterday slipped. That’s normal. Just don’t miss twice — one tap today keeps you on track.',
    'Missing one day is human. Missing two becomes a habit. 30 seconds today.',
  ],
  welcomeBack: [
    'No guilt, no catching up. Open Kesho — 30 seconds and you’re back.',
    'Kesho is still here. Today can be day one again.',
    'Whatever happened, the next 30 seconds are yours. Check in?',
    'You don’t need a perfect week. You need today. Tap in.',
  ],
  move: [
    '10-minute walk. Just 10. Shoes on.',
    'You’ve been sitting. 10 minutes outside — go.',
    'Move now, think clearer tonight. 10 minutes.',
    'A short walk beats a perfect workout you never do.',
  ],
  moveLow: [
    'Rough day? A 5-minute walk outside clears the head. That still counts.',
    'Low day. Step outside for 5 minutes. Fresh air, nothing more.',
  ],
  night: [
    'Close the day in 30 seconds, then phone down. Sleep at 23:00 protects tomorrow.',
    'Rate today, note one win, rest. Tomorrow is built tonight.',
    'Day’s done. Close it in Kesho and let your mind rest.',
  ],
  nightLow: [
    'Hard day. Just close it — rate it and rest. Tomorrow is new.',
    'Not every day is a good day. Close it, sleep early, try again tomorrow.',
  ],
};

// Picks a version based on the date, so it changes daily but stays stable if rescheduled.
export function pick(list, seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}
