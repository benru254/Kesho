// One way to celebrate, used by every feature.
//   celebrate({ title, text })                  → small toast + a few confetti
//   celebrate({ level: 'big', emoji, title, text }) → full-screen moment (milestones only)
// The picture is drawn by features/celebrate/CelebrationLayer.js, which listens on the bus.
// Rule: celebrate real wins only. If everything gets confetti, nothing feels like a win.

import { emit } from './bus';
import { success, heavy } from './haptics';

export function celebrate({ level = 'small', emoji = '✨', title, text = '' }) {
  if (level === 'big') heavy();
  else success();
  emit('celebrate', { level, emoji, title, text });
}

// Picks one line at random — rewards that vary keep feeling fresh.
export function oneOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}
