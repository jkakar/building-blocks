# Track 2 — Event-driven

You finished Track 1. The brick-breaker plays, the bricks crumble,
the level loads from a file. The game *works*. So why a second
track?

Look at `updateBall` from Track 1. In one function it moves the
ball, checks four walls, plays sounds, updates the score,
decrements lives, and decides when the game is over. That's a lot
of jobs in one place. Adding a new thing — say, an achievement
that fires the first time you bounce the ball off the left wall —
means digging *into* the ball code and editing it.

In Track 2 you'll rewrite the same game (well — a simpler version
of it) so the parts are **decoupled**. Instead of `updateBall`
doing all those jobs itself, it'll *announce* things ("the ball
hit the paddle!") and other code will *listen* for those
announcements and decide what to do. A score subscriber updates
the score. A sound subscriber plays a bonk. A new file you'll
write in Unit 4 — `achievements.ts` — listens for announcements
and pops up celebration messages, without changing the game code
at all.

The pattern has a few names. Programmers call it **pub/sub** (for
"publish / subscribe"), or the **event bus** pattern. By the end
of this track you'll know it by all of those names.

## Who this track is for

You finished Track 1. You're comfortable with `let`, `function`,
`if`, arrays, and writing your own helpers. You're not afraid to
poke at a long `main.ts` to see what each piece does.

## What you'll build

A working paddle-and-ball game — paddle, bouncing ball, lives,
score, sound, Game Over — same as where you were at the end of
Track 1's Unit 6. But under the hood:

- A tiny **event bus** (about 15 lines of code in a file you
  write).
- Game logic that **emits events** instead of doing things
  directly.
- **Subscribers** in `main.ts` that handle each event.
- A standalone `achievements.ts` module that adds celebration
  toasts purely by listening to events — no changes to the game
  code.

## What you'll learn

- **Callbacks** — passing a function to another function so it
  can call yours later.
- **Pub/sub** — one place announces things, another place listens.
- **Decoupling** — splitting "who knows when something happened"
  from "who decides what to do about it."
- Why splitting code this way makes new features *easier* to add.

## What you keep from Track 1

The engine (`game.ts`) doesn't change. `index.html`,
`package.json`, and `tsconfig.json` don't change. Your Track 1
project still works — you just leave it alone and start fresh in
a new folder.

Ready? Open [Unit 1 — An event bus](/track-2/unit-1).
