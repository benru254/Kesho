// How much of today is done (pure logic — tested on its own). Drives the sun's height.
//
// A normal day has 4 parts: morning check-in · important tasks · move · close the day.
// A LOW-ENERGY day (mood 1–2) has a smaller target: one task + close the day = a full day.
// That is on purpose: on bad days the bar drops, but it never disappears.

export function dayProgress({ morningDone, tasksPlanned, tasksDone, moved, nightDone, mood }) {
  const low = mood != null && mood <= 2;
  if (low) {
    const task = tasksDone >= 1 ? 1 : 0;
    const base = (task + (nightDone ? 1 : 0)) / 2;
    // The morning check-in already happened (that's how we know the mood) — give it visible credit.
    return clamp(Math.max(base, 0.15));
  }
  const tasks = tasksPlanned > 0 ? tasksDone / tasksPlanned : 0;
  const total = (morningDone ? 1 : 0) + tasks + (moved ? 1 : 0) + (nightDone ? 1 : 0);
  return clamp(total / 4);
}

function clamp(x) {
  return Math.max(0, Math.min(1, Math.round(x * 100) / 100));
}

// What is still open today, in the order it should be done. Used for the "next step" hint.
export function nextStep({ morningDone, tasksPlanned, tasksDone, moved, nightDone, hour }) {
  if (!morningDone && hour < 15) return 'morning';
  if (tasksPlanned === 0 && !nightDone) return 'plan';
  if (tasksDone < tasksPlanned) return 'task';
  if (!moved && hour >= 12) return 'move';
  if (!nightDone && hour >= 19) return 'night';
  if (!moved) return 'move';
  if (!nightDone) return 'night';
  return 'done';
}
