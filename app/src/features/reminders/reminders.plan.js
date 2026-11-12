// THE BRAIN OF REMINDERS (pure logic, no phone APIs — easy to test).
// Decides every reminder for the next 30 days, based on what you did today.
// The plan is rebuilt every time you open Kesho or tick something, so it always fits reality.
//
// Rules:
// - Today: only remind you of what you HAVEN'T done yet.
// - Low mood today: gentler move/night messages.
// - Normal days: up to 3 reminders (morning, move, night). Never more.
// - After 1 missed day: "don't miss twice" morning message.
// - After 2+ missed days: only ONE gentle "welcome back" a day (spam = you mute it).
// - After a week away: one every 3 days, then silence after 30 days.
// - Personal: tomorrow morning names the ONE thing you chose tonight; "welcome back"
//   messages sometimes quote your own why.

import { addDays, keyToDate, isMonday, isFirstOfMonth } from '../../core/dates';
import { MESSAGES, TITLES, pick } from './reminders.messages';

export const DEFAULT_TIMES = {
  morning: { on: true, h: 6, m: 0 },
  move: { on: true, h: 17, m: 0 },
  night: { on: true, h: 22, m: 30 },
};

export const SLOTS = [
  { key: 'morning', label: 'Morning check-in', hint: 'Mood, sleep, pick your 1–3 things' },
  { key: 'move', label: 'Move', hint: '10-minute walk reminder' },
  { key: 'night', label: 'Close the day', hint: 'Stress + one win, then sleep' },
];

const HORIZON_DAYS = 30;
const DAILY_WELCOME_UNTIL = 7; // missed days 2–6: one a day
const TAPER_EVERY = 3;         // missed days 7+: one every 3 days

// why: your own words (core/profile). tomorrowOne: title of tomorrow's ONE thing, if chosen.
export function buildPlan({ now, todayKey, times, today, why = '', tomorrowOne = '' }) {
  const items = [];
  const low = today.mood != null && today.mood <= 2;
  const cut = (text, max) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);

  for (let d = 0; d <= HORIZON_DAYS; d++) {
    const key = addDays(todayKey, d);

    const add = (slot, kind, list, exactBody = null) => {
      const t = times[slot];
      if (!t || !t.on) return;
      const at = keyToDate(key);
      at.setHours(t.h, t.m, 0, 0);
      if (at.getTime() <= now.getTime() + 30 * 1000) return; // already passed
      items.push({ at, slot, kind, title: TITLES[kind], body: exactBody || pick(list, key + slot) });
    };

    if (d === 0) {
      if (!today.morningDone) add('morning', 'morning', MESSAGES.morning);
      if (!today.moved) add('move', 'move', low ? MESSAGES.moveLow : MESSAGES.move);
      if (!today.nightDone) add('night', 'night', low ? MESSAGES.nightLow : MESSAGES.night);
      continue;
    }

    // How many full days in a row you'd have missed before this day, if you stop now.
    const missed = today.active ? d - 1 : d;

    if (missed === 0) {
      const morningList = isFirstOfMonth(key)
        ? MESSAGES.morningFreshMonth
        : isMonday(key) ? MESSAGES.morningFreshWeek : MESSAGES.morning;
      const oneBody = d === 1 && tomorrowOne
        ? `Today’s one thing: “${cut(tomorrowOne, 60)}”. Check in, then start there.`
        : null;
      add('morning', 'morning', morningList, oneBody);
      add('move', 'move', MESSAGES.move);
      add('night', 'night', MESSAGES.night);
    } else if (missed === 1) {
      add('morning', 'back', MESSAGES.dontMissTwice);
      add('move', 'move', MESSAGES.move);
      add('night', 'night', MESSAGES.night);
    } else if (missed < DAILY_WELCOME_UNTIL || (missed - DAILY_WELCOME_UNTIL) % TAPER_EVERY === 0) {
      const slot = firstOnSlot(times);
      // Every second "welcome back" speaks in your own words.
      const whyBody = why && missed % 2 === 0 ? `You wrote: “${cut(why, 90)}”. Still true? 30 seconds in Kesho.` : null;
      if (slot) add(slot, 'back', MESSAGES.welcomeBack, whyBody);
    }
  }

  return items.sort((a, b) => a.at - b.at);
}

function firstOnSlot(times) {
  const s = SLOTS.find((x) => times[x.key] && times[x.key].on);
  return s ? s.key : null;
}

export function fmtTime(h, m) {
  return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}`;
}

// Move a time by N minutes, wrapping around midnight.
export function shiftTime(t, minutes) {
  let total = (t.h * 60 + t.m + minutes) % 1440;
  if (total < 0) total += 1440;
  return { ...t, h: Math.floor(total / 60), m: total % 60 };
}
