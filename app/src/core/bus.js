// A tiny message board between features.
// One feature shouts emit('event', data); any feature listening with on('event', fn) hears it.
// This keeps features separate: Today doesn't need to know Reminders exists.

const listeners = {};

export function on(name, fn) {
  if (!listeners[name]) listeners[name] = new Set();
  listeners[name].add(fn);
  return () => listeners[name].delete(fn);
}

export function emit(name, data) {
  const set = listeners[name];
  if (!set) return;
  set.forEach((fn) => {
    try {
      fn(data);
    } catch (e) {
      console.warn(`[bus] listener for "${name}" failed:`, e);
    }
  });
}
