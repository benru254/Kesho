// KESHO'S VOICE (pure logic — tested on its own).
// One short line at the top of Today that reacts to your real situation: time of day, mood,
// progress, days away, your ONE thing, and your own "why". Honest and warm — never guilt.
//
// The FIRST matching rule wins, so order = priority.

import { shorten } from '../../core/profile';

function pick(list, seed) {
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

// ctx: { hour, kind ('first'|'back'|'nudge'|'normal'), gapDays, progress, mood, morningDone,
//        nightDone, oneThing ({title, done} | null), tomorrowOne (string|null), why, identity, seed }
export function voiceLine(ctx) {
  const { hour, kind, gapDays, progress, mood, morningDone, nightDone, oneThing, tomorrowOne, why, identity, seed } = ctx;
  const low = mood != null && mood <= 2;

  if (nightDone) {
    return tomorrowOne
      ? `Day closed. Tomorrow already has a target: “${shorten(tomorrowOne, 50)}”. Rest now.`
      : 'Day closed. You showed up. Rest — that is part of the work.';
  }
  if (kind === 'first') return 'Day one. Start small: one honest check-in is a win.';
  if (kind === 'back' && !morningDone) {
    return why
      ? `You came back after ${gapDays - 1} days. That is the whole skill. You wrote: “${shorten(why, 70)}”`
      : `You came back after ${gapDays - 1} days. That is the whole skill. Fresh start, no catching up.`;
  }
  if (kind === 'nudge' && !morningDone) {
    return 'Yesterday slipped. Normal. Today is the one that matters — never miss twice.';
  }
  if (progress >= 1) {
    return identity
      ? `Everything done. This is what it looks like: “${shorten(identity, 70)}”`
      : 'Everything done. The sun is up because you put it there.';
  }
  if (low) {
    return 'Heavy day. The bar is lower today: one task, then close the day. That counts as a full win.';
  }
  if (!morningDone) {
    if (oneThing && !oneThing.done) return `Last night you chose: “${shorten(oneThing.title, 50)}”. Check in, then start there.`;
    return pick([
      'Check in first. 30 seconds, then choose what makes today count.',
      'The sun rises as you do. Start with the check-in.',
      'Before the noise: how are you, really? Tap in.',
    ], seed);
  }
  if (oneThing && !oneThing.done) {
    return hour >= 15
      ? `Still open: “${shorten(oneThing.title, 50)}”. 25 focused minutes will move it. Press Focus.`
      : `Your one thing: “${shorten(oneThing.title, 50)}”. Do it before anything easy.`;
  }
  if (oneThing && oneThing.done && progress < 1) {
    return 'The one thing is done — the day is already won. The rest is bonus.';
  }
  if (hour >= 20) {
    return 'Close the day before 23:00, and choose tomorrow’s one thing tonight.';
  }
  if (mood === 5) return 'High energy. Spend it on the hardest thing first — it won’t last all day.';
  return pick([
    'Small steps, every day. That is how 10k becomes 100k.',
    'Nobody is watching. That is exactly when it counts.',
    'You don’t need a perfect day. You need the next step.',
  ], seed);
}
