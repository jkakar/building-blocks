# Roadmap

This is the planned arc of units after Unit 0. It's intentionally
flexible — each unit's exact shape will firm up when we build it,
informed by how the previous units played out with real learners.

## Conventions

- Major game versions (v0, v1, v2…) get their own folder under
  `scaffold/v<n>/`. Within a version, the scaffold evolves with each
  unit that touches it.
- "End" describes what the learner has on their screen at the end of
  the unit — the shippable thing they can show off.
- "Concepts" lists the new programming ideas introduced. Earlier
  units have lots of new concepts; later units are mostly application
  of what's already been taught.

## v0 — paddle, ball, lives

**Unit 1 — A square that moves.** Arrow keys move the square left
and right. End: a square sliding around the canvas. Concepts:
variables (`let x = 100`), the `update` function actually doing
something, `isKeyDown`, `if`, and *pixels per second* via `dt`.

**Unit 2 — A ball that bounces off walls.** The square becomes a
ball that moves on its own. End: a ball ricocheting around the
canvas forever, no input. Concepts: velocity (`vx`, `vy`),
comparison (`<`, `>`), flipping a number's sign to bounce.

**Unit 3 — Bring back the paddle.** A paddle at the bottom (arrow
keys); the ball still bouncing, and now it can bounce off the paddle
too. End: a recognizable Pong-ish mini-game. Concepts: two moving
things at once, axis-aligned rectangle collision (AABB), the first
whiff of refactor pressure (two of everything).

**Unit 4 — Lives and game over.** 3 lives. Ball below the paddle =
lose a life. 0 lives = a "Game over" screen. End: **v0** complete.
Concepts: a counter variable (lives), a state machine (`playing` vs
`gameOver`), drawing text on canvas (`ctx.fillText`), reset logic.

## v0+ — polish

**Unit 5 — Score and sound.** Score goes up on every paddle bounce;
a satisfying "bonk" plays on every hit. End: v0 that feels *real*.
Concepts: HTML5 Audio (load + play), rendering live numbers as
text.

**Unit 6 — Refactor: break `main.ts` apart.** By now `main.ts` has
~100 lines and is starting to feel cramped. This unit walks them
through extracting groups of related code into their own functions
(`drawHud()`, `updateBall()`, `updatePaddle()`). End: the same
game, but the code reads better and they can find things faster.
Concepts: defining their own functions (not just using engine
ones), the value of names, when *not* to refactor.

## v1 — bricks

**Unit 7 — A row of bricks.** One row of bricks at the top. Ball
destroys a brick on contact. End: their game has bricks. Concepts:
an *array* of objects, drawing in a loop, collision in a loop,
removing an item from an array.

**Unit 8 — Multiple rows.** N rows of bricks. Win condition: clear
them all. End: **v1** — a fully recognizable brick-breaker.
Concepts: nested `for` loops (rows × columns), end-of-level
handling.

## v2 — brick types

**Unit 9 — Tough bricks.** Some bricks need 2 hits before they
break. End: **v2** — a mix of normal and tough bricks. Concepts:
brick *objects* with multiple fields (`{ x, y, hp, color }`),
per-object state, choosing color/style by type.

## v3 — falling bricks

**Unit 10 — Bricks that drift down.** Bricks randomly start falling
and float toward the paddle; they break if they hit the bottom or
get hit by the ball. End: **v3** — chaotic and fun. Concepts:
per-object motion (each brick has its own `vy`), `Math.random()`,
object lifecycle (created → moves → eventually removed).

## v4 — particles

**Unit 11 — Explosions when a brick dies.** Each destroyed brick
emits ~8 short-lived particles that fly out and fade. End: **v4** —
visual juice. Concepts: short-lived objects with state of their own
(`{ x, y, vx, vy, life }`), spawning many at once, fading via
alpha, removing dead particles.

## v5 — power-ups

**Unit 12 — Power-ups drop from bricks.** Some destroyed bricks
drop a power-up; catching it on the paddle gives wider paddle /
multi-ball / etc. End: **v5** — power-up chaos. Concepts: power-ups
as another object type, temporary timed modifiers, paddle width as
a variable.

## v6 — levels from text

**Unit 13 — Load a level from a file.** Layouts come from a text
file like `X.X.X / .XXX. / .X.X.`. The learner can design their
own. End: **v6** — a small level editor of sorts. Concepts:
`fetch`, parsing strings into a 2D grid, *data* vs. *code*, and the
satisfaction of a self-designed level.

## Ship it

**Unit 14 — Deploy & share.** Build the production version of the
game and put it on the public web at a real URL. Send it to
friends. End: a URL anyone with a browser can visit. Concepts: a
"build" step that bundles everything for the web, the difference
between dev mode and production, that hosting is a separate
decision from writing code.

## Future ideas

Units we might add, in no particular order. We'll fold them in if a
unit feels short, or queue them after Unit 14, or skip them if the
kids lose interest.

- **Title screen and menu.** "Press space to start." Builds on the
  state machine from Unit 4. Could slot in between Unit 4 and Unit
  5.
- **High scores via `localStorage`.** Save the best score across
  page reloads. Introduces *persistence* — data that survives the
  program exiting.
- **Combo / streak counter.** Bonus points for destroying multiple
  bricks quickly. Builds on score, introduces time-based bonuses.
- **Background music.** Mixing music with sound effects. Could slot
  after Unit 5 or as polish for v4.
- **A "make your own variant" capstone.** Open-ended challenge:
  change one major thing about the game (different controls,
  different win condition, different game mode). Could be a
  multi-week project that builds independence.

## A note on timing

At 30–60 minutes per unit plus iteration sessions, this is
comfortably a multi-month curriculum. There is no rush. The right
pacing is the pacing the learner enjoys.
