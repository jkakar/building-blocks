# Unit 10 — Bricks that drift down

The bricks have been sitting still for three units. In Unit 10
some of them start **moving**: every so often, a random brick
breaks free and drifts slowly down toward the paddle. If the
player smacks it with the ball before it reaches the bottom,
score. If it gets past, it just disappears.

After this unit, you have **v3**.

## What you'll learn

- **`Math.random()`** — the language's "pick a number between 0
  and 1" function.
- A **timer pattern**: count up by `dt` each frame, do something
  when the count crosses a threshold.
- Giving each item in an array its *own* motion (`vy` per brick).

## Step 1 — Give every brick its own velocity

Right now `bricks` is an array of objects with `{ x, y, width,
height, hp }`. We're adding one more field: `vy`. A brick with
`vy: 0` sits still. A brick with `vy: 50` falls at 50 pixels per
second.

Update the type annotation:

```ts
let bricks: { x: number; y: number; width: number; height: number; hp: number; vy: number }[] = [];
```

And `buildBricks`:

```ts
bricks.push({
  x: col * 80 + 5,
  y: row * 30 + 50,
  width: 70,
  height: 20,
  hp: hp,
  vy: 0,
});
```

(All bricks start with `vy: 0` — sitting still.)

Save. No visible change yet.

## Step 2 — Move falling bricks

In `updateBricks`, give each alive brick a chance to move based on
its `vy`. Add this near the top of the function, before the
collision check:

```ts
function updateBricks(dt: number) {
  // Move falling bricks
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.hp <= 0) {
      continue;
    }
    brick.y = brick.y + brick.vy * dt;
    if (brick.y > 600) {
      brick.hp = 0;
    }
  }

  // ... existing alive-count + collision code ...
}
```

Notice the function now takes `dt`:

```ts
function updateBricks(dt: number) {
```

And the call in `update` needs to pass it:

```ts
updateBricks(dt);
```

(All your bricks have `vy: 0` so nothing actually moves yet. We
need to *start* some bricks falling.)

## Step 3 — Start a random brick falling every few seconds

Add two new variables at the top of `main.ts`, near other state:

```ts
let timeSinceLastFall = 0;
const fallInterval = 2;
```

`timeSinceLastFall` is a **timer** that counts how many seconds
have passed since we last started a brick falling. `fallInterval`
is how many seconds we wait between falls. Two seconds is a good
starting pace.

(`const` instead of `let` because `fallInterval` won't change.
Tells future-you, and TypeScript, that this is a fixed value.)

In `updateBricks`, after the movement loop and before the
collision code, add:

```ts
// Maybe start a brick falling
timeSinceLastFall = timeSinceLastFall + dt;
if (timeSinceLastFall > fallInterval) {
  timeSinceLastFall = 0;
  const i = Math.floor(Math.random() * bricks.length);
  if (bricks[i].hp > 0 && bricks[i].vy === 0) {
    bricks[i].vy = 50;
  }
}
```

What's happening:

- Every frame, `timeSinceLastFall` grows by `dt` (so it grows by 1
  per second of real time).
- When it crosses the threshold (2 seconds), reset to 0 and *try*
  to start a brick falling.
- `Math.random()` returns a number between 0 and 1 (like
  `0.7341`). `Math.random() * bricks.length` is between 0 and 50.
  `Math.floor(...)` rounds down to a whole number — an integer
  between 0 and 49. That's our random brick index.
- If that randomly picked brick is still alive and not already
  falling, give it a downward velocity. If not, skip it. Over the
  next 2 seconds, we try again.

Also, in `restartGame`, reset the timer:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  timeSinceLastFall = 0;
  resetBall();
  buildBricks();
}
```

Save. Watch the canvas. Every couple of seconds, a random brick
peels out of formation and drifts toward the bottom. Hit it with
the ball before it reaches the bottom for the score; let it slide
past and it just disappears.

::: tip Vocab: Math.random
`Math.random()` is the standard "give me randomness" function. It
returns a number from 0 (inclusive) to 1 (exclusive). To get a
random integer between 0 and N (exclusive), the pattern is
`Math.floor(Math.random() * N)`. To get a random number between
`a` and `b`, use `Math.random() * (b - a) + a`.

It's not *truly* random — it's a pseudo-random sequence
calculated from a seed. For games, it's plenty random.
:::

## Step 4 — Play with it

- Make falls more frequent: `const fallInterval = 1;`.
- Make falling bricks faster: `bricks[i].vy = 100;` (or `200`).
- Make falling bricks worth more points: in the collision code,
  add a check — if the brick has `vy > 0`, add `score = score +
  20;` instead of `score = score + 10;`.
- Slow down the rate but let more bricks fall at once: use a
  longer interval, but inside the threshold block, pick *several*
  bricks to start falling.

## On your own

### Challenge 1 — Visual cue for falling bricks

A falling brick currently looks identical to a stationary one
until you notice it moving. Make falling bricks visually distinct
— a different color, or a thicker outline, or pulse them somehow.

<details><summary>Hint</summary>

In `drawBricks`, after deciding the fill color, check `brick.vy`.
If `vy > 0`, override the color (or draw an extra outline with
`ctx.strokeStyle`/`ctx.strokeRect`).

</details>

### Challenge 2 — Lose a life when a falling brick gets past

Right now a brick that reaches the bottom just disappears with no
penalty. Change it so the player loses a life when that happens.

<details><summary>Hint</summary>

In the movement loop, where you set `brick.hp = 0;` after a brick
reaches the bottom, also subtract from `lives`. Be careful not to
crash into the game-over logic — you'll want to check whether
`lives <= 0` and set `gameState = "gameOver"` if so.

This makes the game *much* harder. You might want to also slow
down or pause the fall logic during game over.

</details>

## What you just did

- Gave bricks their own velocity, so each one moves
  independently.
- Used **`Math.random()`** to pick a random brick.
- Built a **timer** that fires once every couple of seconds.
- Saw the same `dt`-based motion pattern from Unit 2 apply to a
  brick instead of the ball — same idea, different object.

New words:

- **`Math.random()`** — returns a random number from 0 to (just
  under) 1.
- **`Math.floor()`** — rounds a number down to the nearest whole
  number.
- **Timer** — an accumulator that adds `dt` each frame and fires
  when it crosses a threshold. Useful any time you want
  "something every N seconds."

## What's next

In Unit 11 destroyed bricks explode into **particles** — tiny
short-lived squares that fly out from the broken brick and fade.
This is **v4**. You'll learn about objects that come and go on
short timescales: created, lived their brief life, removed.
