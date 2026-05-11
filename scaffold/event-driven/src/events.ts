// A tiny event bus. Other files use `on(name, handler)` to subscribe,
// and `emit(name, payload)` to tell the bus something happened. The
// bus then calls every handler that subscribed to that name.

let listeners: { [name: string]: ((payload: number) => void)[] } = {};

export function on(name: string, handler: (payload: number) => void) {
  if (!listeners[name]) {
    listeners[name] = [];
  }
  listeners[name].push(handler);
}

export function emit(name: string, payload: number = 0) {
  const handlers = listeners[name];
  if (!handlers) return;
  for (let i = 0; i < handlers.length; i = i + 1) {
    handlers[i](payload);
  }
}
