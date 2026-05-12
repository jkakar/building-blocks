# What you'll know after Course 5

A short tour of what this course adds to what you learned in
Course 1. Useful before you start and after you finish.

By the end of Course 5 you'll have built a clicker game from
scratch using a tiny **signal** library you wrote yourself
(~25 lines). Click a button, your "blocks" count goes up. Buy
upgrades to auto-click. Everything saves automatically to
localStorage because every changing value is a signal, and
signals know how to notify subscribers.

## What you'll add to your toolkit

- **Signals** — a value bundled with a list of functions to
  notify when it changes.
- **`subscribe(handler)`** — register code that runs after the
  value changes.
- **Derived values** — signals whose value is computed from
  other signals, and which auto-recompute when their inputs
  change.
- **Notify-on-set** — the heart of reactivity: changing a
  value broadcasts to listeners.
- **Mouse input on canvas** — `canvas.addEventListener("click",
  ...)` plus the `getBoundingClientRect` scaling trick to map
  screen coordinates to canvas coordinates.
- **`localStorage` persistence** that's nearly free because
  signals are the only mutable state.

## Patterns and principles

- **Reactivity is the inverse of polling.** Instead of "check
  if X changed and update Y," you say "Y depends on X" and
  the system runs Y when X changes.
- **The signal is the channel.** No named events; the value
  itself is what subscribers care about.
- **State that subscribes to itself.** Derived values are
  signals that recompute when their inputs change. The
  composition forms a graph.
- **Saves itself.** Once all state lives in signals, "save
  every change to disk" is a 4-line helper that wraps `set`
  with `localStorage.setItem`.
- **Honest seam.** Drawing a canvas every frame doesn't *need*
  reactivity — `draw()` reads the current value. Signals earn
  their keep where the read isn't already in a render loop:
  derived values, persistence, side effects.

## What this course deliberately doesn't teach

- **Generic signals** (`Signal<T>`) — we use a `numberSignal`
  specialized to numbers.
- **`effect()`** as a separate primitive — we use `subscribe`
  for both pure recomputes and side effects.
- **Batching** — real signal libraries fire subscribers once
  per frame even if `set` runs many times. Ours fires each
  time.
- **Automatic dependency tracking** — frameworks like SolidJS,
  Vue, and Svelte figure out what your computed function
  reads. We pass dependencies explicitly.
- **Async signals** — values that arrive over time from a
  Promise.
- **DOM integration** — frameworks bind signals directly to
  HTML. We render to canvas instead.

## How it fits with the other courses

- **Course 2 (event-driven)** is pub/sub for *named events*.
  Course 5 is pub/sub for *one specific value*. Same shape,
  different scope.
- **Course 4 (functional)** says "no mutation." Signals are
  mutable but only via `set`, which is the chokepoint for
  notification. A controlled form of mutation.
- **Course 1 (procedural)** has its state as loose variables;
  signals wrap each one so the rest of the program can react.

Signals are the heart of modern reactive UI — SolidJS, Vue 3,
Svelte 5, Angular signals, MobX. Once you've built one
yourself, those frameworks become a lot less mysterious.
