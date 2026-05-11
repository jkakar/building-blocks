# Track 5 — Reactive

The four tracks behind you all do the same job four different
ways: a paddle, a ball, a score that ticks up on each bounce. The
state-shapes differ — loose `let`s, event handlers, classes, a
single `state` object — but every frame the engine runs your
`update`, draws everything, and repeats. *Everything* recomputes,
sixty times per second, whether it changed or not.

Real apps don't usually work that way. When you click the like
button on a video, the only number on the page that changes is
the like count. The video doesn't redraw. The thumbnails next to
it don't redraw. Just the number — and the little heart icon that
depends on whether *you* liked it.

The trick for that is **signals**: small wrappers around values
that *know who's interested*. Change the value, and only the
things that depend on it react. The pattern shows up in just
about every modern UI library — Svelte, Solid, the newer Vue,
Vue's `ref`s, React's `useState` (a cousin), MobX `observable`s,
Knockout from a decade ago. Different names, same idea.

Track 5 teaches signals by building a *new* game — a clicker.

## Why a new game

Reactivity is built for **sparse change**. A score that bumps
when the ball hits the paddle and otherwise sits still. A button
that lights up when you can afford an upgrade. A counter that
saves itself to disk whenever it changes.

A brick-breaker is the opposite. *Everything* updates every tick:
the ball moves, the paddle might move, bricks might disappear.
You'd be wiring up signals only to fire them sixty times a
second, which buys you nothing. A clicker — a button you tap, a
counter that goes up, upgrades that unlock when the counter
crosses a threshold — is the canonical signals demo.

## Who this track is for

You finished Track 1. Anything else is a bonus. If you did
Track 2 (events), you'll notice that signals are pub/sub focused
on *one value at a time*. If you did Track 4 (functional),
you'll notice that signals are state-as-data with subscriptions
bolted on. Both are useful background, neither is required.

## What you'll build

A working idle/clicker game:

- A big **CLICK** button on the canvas. Each tap bumps a counter.
- An **auto-clicker** upgrade: costs 10 blocks, then adds one
  block per second forever.
- A **doubler** upgrade: costs 100 blocks, then doubles your
  blocks-per-second.
- Counters that **save themselves** to the browser so progress
  survives a reload.
- Buttons that **light up green** when you can afford them, on
  their own, without anyone telling them to redraw.

## What you'll learn

- **Signal** — a value that knows who's listening.
- **Subscribe / notify** — the two halves of how a signal tells
  its listeners that something changed.
- **Derived value** — a value computed from other values, that
  updates *automatically* when the inputs change.
- **Effect** — a piece of "do something when this signal
  changes" code, separate from drawing.
- **Persistence** — once your state lives in signals, saving and
  loading it is a four-line trick.

## What you keep from Track 1

The engine (`game.ts`) doesn't change. `index.html`,
`package.json`, and `tsconfig.json` don't change. Your earlier
projects still work — leave them alone and start fresh in a new
folder.

What *is* new: you'll need mouse clicks for the first time. The
engine doesn't know about the mouse, and we won't extend it.
You'll attach a click listener directly to the canvas from
`main.ts`. (A real engine would smooth that seam over; for one
unit it's fine to see the join.)

Ready? Open [Unit 1 — Signals](/track-5/unit-1).
