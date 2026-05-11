// A tiny signal library for number values.
//
// A *signal* is a value (here, a number) that knows who's
// interested in it. Anyone can:
//
// - call `s.get()` to read the current value,
// - call `s.set(newValue)` to change it,
// - call `s.subscribe(fn)` to ask "tell me whenever this
//   changes."
//
// When `set` runs, every subscribed function fires. That's the
// whole pattern — a value paired with a list of listeners.
//
// We specialize to numbers so you can read every line without
// generic syntax getting in the way.

export type NumberSignal = {
  get: () => number;
  set: (next: number) => void;
  subscribe: (listener: () => void) => void;
};

export function numberSignal(initial: number): NumberSignal {
  let value = initial;
  const listeners: (() => void)[] = [];

  function get(): number {
    return value;
  }

  function set(next: number) {
    value = next;
    for (let i = 0; i < listeners.length; i = i + 1) {
      listeners[i]();
    }
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
  }

  return { get, set, subscribe };
}
