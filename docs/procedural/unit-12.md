# Unit 12 — Power-ups

In Unit 11 destroyed bricks made a satisfying explosion. In Unit 12
some of them also **drop a power-up** that floats down toward the
player. Catch it on the paddle and the paddle gets *wider* for ten
seconds, making the game easier for a while. Then the effect wears
off and things go back to normal.

After this unit, **v5**.

## What you'll learn

- A *third* dynamic array — power-ups — alongside bricks and
  particles. You'll notice the patterns from Unit 11 repeat
  (spawn, update, expire).
- **Probability** — using `Math.random()` to make something happen
  *some* of the time, not always.
- A **temporary effect**: turn something on, count down a timer,
  turn it off when the timer hits zero.

## Step 1 — Set up the power-ups array

Add this near `particles`:

```ts
let powerUps: { x: number; y: number; vy: number; alive: boolean }[] = [];
let wideTimer = 0;
```

A power-up has a position, a downward velocity, and an `alive`
flag (used so we don't try to catch a power-up twice).

`wideTimer` is the timer that tracks how many seconds are left on
the wide-paddle effect. When the player catches a power-up,
`wideTimer` becomes `10` (ten seconds). Each frame it counts down
toward zero. When it hits zero, the paddle goes back to normal.

## Step 2 — Drop a power-up sometimes when a brick dies

In `updateBricks`, the block where a brick is destroyed (right
after `spawnParticles(...)`), add:

```ts
if (Math.random() < 0.2) {
  powerUps.push({
    x: brick.x + brick.width / 2 - 10,
    y: brick.y,
    vy: 80,
    alive: true,
  });
}
```

`Math.random() < 0.2` is the probability check. `Math.random()`
returns a number from 0 to (almost) 1. `< 0.2` is true *only when*
the random number is less than 0.2, which is 20% of the time. So
two out of every ten destroyed bricks drop a power-up, on average.

The power-up spawns at the brick's horizontal center (offset by
`-10` to center the 20-pixel-wide power-up), floats down at 80
pixels per second.

## Step 3 — Move power-ups; catch them with the paddle

Add this helper function:

```ts
function updatePowerUps(dt: number) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    if (!p.alive) {
      powerUps.splice(i, 1);
      continue;
    }
    p.y = p.y + p.vy * dt;
    if (p.y > 600) {
      p.alive = false;
      continue;
    }
    if (
      p.x + 20 > paddleX &&
      p.x < paddleX + paddleWidth &&
      p.y + 20 > paddleY &&
      p.y < paddleY + paddleHeight
    ) {
      p.alive = false;
      paddleWidth = 160;
      wideTimer = 10;
    }
  }
}
```

That's the same pattern as `updateParticles` from Unit 11:

- Iterate backwards (in case we splice).
- If marked dead, splice it out.
- Move the live ones; mark them dead if they fall off the bottom.
- Check collision against the paddle (the same AABB check from
  Unit 3). On hit, mark dead and activate the wide paddle.

Call `updatePowerUps(dt);` from `update`, after `updateBall(dt)`:

```ts
function update(dt: number) {
  // ... existing ...
  updatePowerUps(dt);
  updateParticles(dt);
}
```

## Step 4 — Wind down the wide-paddle effect

The paddle is wide forever right now. We need it to go back to
normal after ten seconds.

Add this at the top of `update`, after the `gameOver`/`won` check:

```ts
if (wideTimer > 0) {
  wideTimer = wideTimer - dt;
  if (wideTimer <= 0) {
    paddleWidth = 80;
  }
}
```

Each frame the timer counts down by `dt`. When it crosses zero, we
restore the original paddle width (`80` — the same number you set
back in Unit 3).

::: tip Vocab: probability
`Math.random() < 0.2` is the standard way to do *20% chance*.
Bigger threshold = more often: `< 0.5` is 50% chance, `< 0.9` is
90%. Smaller threshold = rarer: `< 0.05` is 5%. You'll see this
pattern any time a game needs "something happens occasionally."
:::

## Step 5 — Draw the power-ups

Add:

```ts
function drawPowerUps(ctx: Ctx) {
  ctx.fillStyle = "lime";
  for (let i = 0; i < powerUps.length; i++) {
    const p = powerUps[i];
    if (p.alive) {
      ctx.fillRect(p.x, p.y, 20, 20);
    }
  }
}
```

Call it from `draw`, after `drawParticles`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawBricks(ctx);
  drawParticles(ctx);
  drawPowerUps(ctx);
  drawHud(ctx);
  // ... game over / won screens ...
}
```

## Step 6 — Reset power-ups on restart

In `restartGame`:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  timeSinceLastFall = 0;
  paddleWidth = 80;
  wideTimer = 0;
  particles = [];
  powerUps = [];
  resetBall();
  buildBricks();
}
```

Save. Smash bricks. Some of them drop little lime squares that
float toward the paddle. Catch one — the paddle gets wider. Wait
ten seconds without catching another and it goes back.

## Step 7 — Play with it

- Drop power-ups more often: `< 0.5` (half the bricks).
- Make the power-up bigger / smaller / a different color.
- Make the wide paddle even wider: `paddleWidth = 240;`.
- Make the effect last longer or shorter: change the `10` in
  `wideTimer = 10;`.
- Let the wide effect *stack*: if you catch another power-up while
  one's active, add to the timer instead of resetting it.
  (Replace `wideTimer = 10;` with `wideTimer = wideTimer + 10;`.)

## On your own

### Challenge 1 — A second kind of power-up

Add a second power-up type — something the player *doesn't* want.
"Slow paddle" or "fast ball" or "shrink paddle." When a brick is
destroyed, randomly pick which kind drops.

<details><summary>Hint</summary>

Each power-up needs to know what *kind* it is. Add a `kind: string`
field — `"wide"` or `"shrink"` or `"fast"`. When you push a
power-up, decide its kind based on another `Math.random()` call.

When the paddle catches it, branch on `p.kind` and apply the
matching effect (and set a different timer, like `shrinkTimer`).

When you draw, pick a different color per kind so the player can
see what's coming.

</details>

### Challenge 2 — Show the active effect

The player has no idea how much time is left on the wide-paddle
effect. Show it in the HUD — something like `Wide: 7.3s left`.

<details><summary>Hint</summary>

In `drawHud`, add a third `fillText` call that only draws when
`wideTimer > 0`. Use `Math.ceil(wideTimer)` to round up to a whole
second so it doesn't display `7.3214567` to the user.

</details>

## What you just did

- Added a third dynamic array (power-ups) — and noticed the
  spawn-update-expire pattern repeating.
- Used **probability** to make something happen *sometimes*.
- Built a **temporary effect**: a state change that goes back on
  its own after a timer.

New words:

- **Probability** — using `Math.random() < threshold` to make
  something happen a fraction of the time.
- **Temporary effect** — turning a piece of state on, then having
  a timer eventually turn it off.

## What's next

In Unit 13 you'll **load level layouts from a separate file**.
Instead of a hard-coded grid, your bricks come from a chunk of text
like `###...###` that you (or the kids) can edit to design any
level you want. This is **v6** — and one of the most rewarding
units in the arc, because it puts level design into your own
hands.
