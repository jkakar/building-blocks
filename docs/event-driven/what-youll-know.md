# What you'll know after Course 2

A short tour of what this course adds to what you learned in
Course 1. Useful before you start (to see what you're signing up
for) and after you finish (to take stock of what you can do).

By the end of Course 2 you'll have rewritten the simpler v0
brick-breaker (paddle + ball + lives + score + sound, no bricks)
using a publish/subscribe event bus, and added an achievements
system that listens for game events without modifying any game
code.

## What you'll add to your toolkit

Building on what Course 1 taught:

- **The event bus** — one small file (`events.ts`) with `on(name,
  handler)` to subscribe and `emit(name, payload)` to announce.
- **Callbacks** — functions you hand to another function so it
  can call yours later.
- **Pub/sub** as a named pattern — *publishers* emit events,
  *subscribers* react; neither knows the other exists.
- **Decoupling** — building features that depend on events
  without depending on each other's code.
- **Index-signature types** (`{ [name: string]: ... }`) for the
  event bus's `listeners` map.

## Patterns and principles

- **Game logic emits, subscribers react.** The ball doesn't know
  about sound; it emits a bounce event, and a sound subscriber
  plays the bonk.
- **Many subscribers, same event.** Adding a new reaction is one
  `on(...)` call. No central dispatcher to edit.
- **Naming events with `subject:verb`** — `ball:paddle-hit`,
  `game:over`, `score:milestone`. Namespaces keep them readable.
- **The "added without touching" test.** By Unit 4 you can add a
  whole achievements module by importing it. Game code unchanged.

## What this course deliberately doesn't teach

- **Typed events.** Real event buses use generics so each event
  has a known payload shape. We use a single `number` payload
  for simplicity.
- **Subscriber removal.** We never call `off(...)`; subscribers
  live for the lifetime of the page. Real apps need lifecycle
  management.
- **Error isolation.** A throwing subscriber crashes the rest of
  the chain. Real buses wrap each call.
- **Batching, debouncing, throttling.** Real buses might coalesce
  rapid-fire events.
- **Event bubbling.** Browser events have parent/child
  propagation. Our bus is flat.

## How it fits with the other courses

- **Course 3 (object-oriented)** is about *who owns what*; this
  course is about *how things signal each other*. Classes that
  emit events are the most common combination in real codebases.
- **Course 4 (functional)** removes the mutation that subscribers
  usually rely on. The pattern works there too, but reactions
  have to return new state rather than poke at old state.
- **Course 5 (reactive)** is pub/sub for *one specific value*
  rather than named events. Same shape, different scope.
- **Course 6 (ECS)** doesn't lean on events as its primary
  comms; it queries components instead. Some ECS engines layer
  events on top for game-level signals.

The pattern shows up in every codebase. Once you've seen it,
you'll spot it in browser DOM events, Node.js EventEmitter, chat
bots, and most UI frameworks.
