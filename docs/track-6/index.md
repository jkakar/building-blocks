# Track 6 — Entity-Component-System

Five tracks. Five shapes for the same brick-breaker. Loose
variables, an event bus, classes, immutable state objects,
signals. Each one taught you a different angle on the same
question: *where does the game's information live, and who's
allowed to change it?*

Track 6 changes the question. Instead of "how do we shape one
ball, one paddle, a row of bricks," we ask: *what if the game
had two hundred things in it at once?*

A brick-breaker doesn't really need an answer to that. A ball, a
paddle, a few dozen bricks — the shapes you already know handle
it fine. So Track 6 doesn't rebuild the brick-breaker. It builds
a different game where two hundred things on screen *is* the
point: an **asteroid-dodge**. A green ship at the bottom of the
canvas. A field of brown rocks tumbling down from the top. Move
left and right, don't get hit, see how long you last.

The architecture is called **Entity-Component-System**, ECS for
short. It's the shape most modern game engines reach for once
the number of things in the world gets large. Unity has it. Bevy
(a Rust engine) is built around it. So is Overwatch, by the way
— Blizzard gave a famous talk about how their netcode falls out
of an ECS for free.

The trick is to take everything you know about objects and pull
them *apart*. In Track 3 you bundled "the ball's data" and "the
ball's methods" into one `Ball` class. ECS does the opposite:
data goes in one place, behavior goes in another, and they meet
at a single ID.

## Who this track is for

You finished Track 1. Anything else is a bonus. Track 3
(objects) is the most useful contrast — ECS is what you get when
you delete the methods, scatter the fields, and stop using
inheritance. Track 4 (state-as-data) shares the "data over
everything" feeling, though ECS happily mutates that data in
place.

## What you'll build

A working asteroid-dodge:

- A green ship at the bottom you steer with the arrow keys.
- A field of rocks falling from the top — 50, 100, eventually as
  many as you let pile up.
- 3 lives. A rock that hits the ship vanishes and costs a life.
- Game over at 0 lives. Press space to restart.
- A score that ticks up while you're alive.

Under the hood, three new words:

- **Entity** — just a number. An ID. That's the whole entity.
- **Component** — plain data attached to an entity. `Position`
  is `{ x, y }`. `Velocity` is `{ vx, vy }`. No methods.
- **System** — a function that walks the components and does
  one job. `movementSystem`. `renderSystem`. `collisionSystem`.

## What you'll learn

- **Entity** — an integer ID with no fields of its own.
- **Component** — a small piece of data stored in a bucket
  keyed by entity ID.
- **System** — a function that processes "every entity that has
  these components."
- **Marker component** — a component with no fields, used as a
  tag (`Player`, `Asteroid`).
- **Archetype** — the set of component types an entity has.
  We'll touch this lightly.
- Why ECS *scales* — adding a 200th asteroid is one line, and
  every system handles it without changes.

## What you keep from Track 1

The engine (`game.ts`) doesn't change. `index.html`,
`package.json`, and `tsconfig.json` don't change. Your earlier
projects still work — leave them alone and start fresh in a new
folder.

Ready? Open [Unit 1 — Entities, components, systems](/track-6/unit-1).
