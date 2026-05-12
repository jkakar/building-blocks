# What you'll know after Course 4

A short tour of what this course adds to what you learned in
Course 1. Useful before you start and after you finish.

By the end of Course 4 you'll have rewritten the v0
brick-breaker so the whole game state is one immutable object
and each frame is a *pure transformation* — old state in, new
state out. The payoff: rewind, replay, and save-to-localStorage
are nearly free.

## What you'll add to your toolkit

- **Type aliases** — `type State = { ... }` to name a shape.
- **Union types** — `"playing" | "gameOver"` — a value
  restricted to a few specific options.
- **The spread operator `...`** — `{ ...old, x: newX }` makes a
  new object that's a copy with one field changed.
- **Pure functions** — same inputs always give the same
  output; no mutation, no side effects.
- **Immutability** as a discipline (TypeScript won't enforce
  it for us; the convention does).
- **Function composition** — `tick(state, dt)` is a sequence
  of small named pure steps; each one's output is the next
  one's input.
- **Arrow functions** — `(x) => x + 1`, an alternative to
  `function`.
- **JSON for plain data** — `JSON.stringify` and `JSON.parse`
  work trivially when state is just numbers and strings.

## Patterns and principles

- **State is data.** Behavior is separate functions that
  consume and produce it.
- **No mutation = free history.** Keep a list of past states;
  rewind by walking backward. That's the whole trick.
- **Pipeline composition.** Each frame's `tick` calls a
  sequence of small, named pure steps. Each step is testable
  in isolation.
- **World data vs loop data.** Game-state fields go in the
  immutable `State`. Mode flags (rewinding, replaying) live in
  separate module-level variables — they describe the loop,
  not the world.
- **The seams are imperative.** Audio, keyboard, localStorage
  are necessarily side-effecting. The pure pipeline calls them
  at the boundaries, not inside.

## What this course deliberately doesn't teach

- **`map`, `filter`, `reduce`** — the array-functional toolbox.
- **Recursion** as a primary tool.
- **Currying** and **partial application**.
- **Lenses / optics** for updating deeply nested values
  cleanly.
- **Reactive streams** — Course 5 does a related but distinct
  thing.
- **Monads / `Option` / `Result`** — error handling without
  exceptions.
- **Strict immutability via `Readonly<T>`** or
  `Object.freeze`. We rely on convention.
- **Function combinators** — higher-order helpers for
  composing functions.

## How it fits with the other courses

- **Course 1 (procedural)** mutates freely. Course 4 mutates
  *nothing*. The contrast is the whole lesson.
- **Course 3 (object-oriented)** ties data to methods. Course
  4 separates them. Two different answers to "how do I
  organize this?"
- **Course 2 (event-driven)** can work alongside FP — pure
  functions emit events at the seams.
- **Course 5 (reactive)** builds on the FP idea of "values
  change over time." Signals are mutable from the outside but
  pure from the inside.

The functional discipline shows up in modern JavaScript (React
hooks, Redux), in data pipelines (Spark, dbt), and in
languages where it's the default (Haskell, Elixir, Clojure).
