// Pure logic for the living sky (tested on its own).

// Which sky to show for an hour of the day (0–23).
export function skyPhase(hour) {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

// Where the sun sits: 0 = just peeking over the hill, 1 = high in the sky.
export function sunHeight(progress) {
  const p = Math.max(0, Math.min(1, progress || 0));
  return Math.round(p * 100) / 100;
}

// Star positions that never change between renders (same seed → same sky).
// Returns [{ x: 0–1, y: 0–1, size, bright }]. One star per day you showed up (max 60).
export function starField(count, seed = 7) {
  const n = Math.max(0, Math.min(60, count || 0));
  const stars = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = 0; i < n; i++) {
    stars.push({ x: rnd(), y: rnd() * 0.7, size: rnd() < 0.2 ? 3 : 2, bright: rnd() < 0.3 });
  }
  return stars;
}
