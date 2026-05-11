# Track 4 — Functional

You finished Track 1. Maybe Track 2, maybe Track 3. The same game
written two or three different ways. Time for one more — and this
one buys you something none of the others did.

Open `main.ts` from Track 1's Unit 6 and look at the top:

```ts
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;

let paddleX = 400;
// ...and so on
```

Eight or nine loose `let` variables, and code that *pokes at them*
over and over. `x = x + vx * dt;` reads `x`, computes a new value,
writes it back to the same `x`. Same with `vy` when the ball
bounces. Same with `score`, `lives`, everything.

In Track 4 you'll rewrite the same paddle-and-ball game so the
whole game's information lives in **one object** called `state` —
and every frame, instead of poking at fields, you build a brand
new state from the old one. The old one stays untouched.

Why bother? Because once every frame's state sticks around, you
can **keep them in a list**. Push each frame's state onto the end.
By the time you've played for ten seconds, you've got 600 frozen
snapshots. Hold R and the game *rewinds* — it walks back through
the list, frame by frame. Lose? Press P after Game Over and watch
the last five seconds back. Reload the page? The replay is still
there, because it's a plain object you can save to the browser.

You don't have to write *anything* extra to make the game record
itself. It does that for free, because you stopped mutating.

## Who this track is for

You finished Track 1. (Track 2 or 3 is helpful but optional.)
You're comfortable with `let`, `function`, `if`, arrays, and
writing your own helpers.

## What you'll build

The paddle-and-ball game from Track 1's Unit 6 — paddle, bouncing
ball, lives, score, sound, Game Over — plus two things only this
track has:

- Hold **R** to *rewind* the last few seconds of play.
- After Game Over, press **P** to *replay* what just happened.

Under the hood:

- A `State` type — the shape of everything the game knows.
- A `tick(state, dt)` function that's **pure**: same inputs always
  give same outputs, no side effects.
- A `history` array — every state we've seen, capped at 600
  entries.
- A few lines of `localStorage` so the replay survives a reload.

## What you'll learn

- **Immutability** — never change a thing in place; make a new
  thing instead.
- **Pure function** — a function whose output only depends on its
  inputs, and that has no side effects.
- **Spread (`...`)** — the new-syntax tool for "make me a copy of
  this object, but with one field changed."
- **Function composition** — feeding the output of one function
  straight into the next.
- Why frozen state makes **time travel** cheap.

## What you keep from Track 1

The engine (`game.ts`) doesn't change. `index.html`,
`package.json`, and `tsconfig.json` don't change. Your Track 1
project still works — leave it alone and start fresh in a new
folder.

Ready? Open [Unit 1 — State as data](/track-4/unit-1).
