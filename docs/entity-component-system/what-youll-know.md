# What you'll know after Course 6

A short tour of what this course adds to what you learned in
Course 1. Useful before you start and after you finish.

By the end of Course 6 you'll have built an asteroid-dodge
game from scratch using **Entity-Component-System** — an
architecture where entities are just IDs, components are
typed data tables keyed by ID, and systems are stateless
functions that iterate over entities-with-specific-components.

## What you'll add to your toolkit

- **Entity** — a numeric ID that names "a thing in the game."
- **Component** — a typed piece of data attached to one
  entity (`Position`, `Velocity`, `Sprite`).
- **Component buckets** — `{ [id: number]: Position }` etc.
  Each component type has its own storage.
- **System** — a function that loops over entities with the
  components it cares about and does its job.
- **Marker components** — empty `{ [id: number]: true }` to
  *tag* entities ("this one is a player," "this one is an
  asteroid").
- **`for ... in` over objects** — and the `Number(id)` cast,
  because keys come out as strings.
- **Cross-component queries** — loop one bucket and look up
  another.
- **Smallest-bucket loops** — iterate the rarest component
  first for performance.
- **The temporary-state pattern** — a component with a
  `remaining: number` plus a system that decrements it and
  removes the component at zero.

## Patterns and principles

- **Data and behavior live in completely separate places.**
  Entities and components are data; systems are behavior. No
  methods on data.
- **Scaling is free.** Adding 200 asteroids requires no
  changes to Movement, Render, or Collision systems — they
  query their components and process them.
- **Composition over inheritance.** An entity is whatever
  components it has. A player with a `Shielded` marker is
  shielded; remove the marker and they're not. No class
  hierarchy.
- **The smallest-bucket loop pattern.** When a system needs
  multiple component types, loop the smallest one. Marker
  components are deliberately tiny so you can loop them as
  the outer.
- **Powers up = temporary components.** Powerups, stuns,
  burns, invuln — all the same shape: add a marker (or
  remaining-timer component) when the effect starts; remove
  it when it ends.

## What this course deliberately doesn't teach

- **Archetype-grouped storage.** Real engines (Bevy, Flecs)
  group entities by their component set for cache locality.
  Ours uses one object per component type.
- **Sparse-set / packed-array storage** — performance-tuned
  data structures.
- **Parallel systems** — running independent systems on
  multiple threads.
- **Component pools** — reusing destroyed entity slots to
  avoid allocations.
- **Complex queries** — modern ECS libraries support
  with/without filters; we use plain loops.
- **Events / commands** as an ECS-native communication
  mechanism.

## How it fits with the other courses

- **Course 3 (object-oriented)** bundles data and behavior;
  ECS deliberately separates them. The contrast is sharp.
- **Course 4 (functional)** also separates data from
  behavior, but state is immutable. ECS mutates components in
  place — you trade purity for performance.
- **Course 1 (procedural)** is "global variables and
  functions"; ECS is "global *typed buckets* and functions."
  ECS is procedural at scale, with discipline.

ECS is the architecture behind big game engines (Unity DOTS,
Unreal's Mass, Bevy, Flecs) and increasingly in simulations
and high-throughput systems outside games. Once you've felt
how spawning 200 asteroids didn't break anything, you'll
understand why.
