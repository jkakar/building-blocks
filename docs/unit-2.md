# Unit 2 — A ball that bounces off walls

In Unit 1 your square moved when you held the arrow keys, and (if
you did Challenge 2) it stopped when it hit an edge. In Unit 2
you'll turn it into a *ball* that moves all on its own and bounces
off the walls when it hits them — no keyboard at all.

That bouncing square is the seed of the **ball** in a brick-breaker
game.

## What you'll learn

- **Velocity**: a new pair of variables that says "how fast and in
  which direction this thing is moving."
- How to make something move without anyone pressing a key.
- A neat trick: *flipping the sign* of a number to reverse a
  direction.

## Step 1 — Throw away the arrow keys

Open `src/main.ts`. It should look like the end of Unit 1 — four
`if` blocks for the arrow keys, and four more `if` blocks to stop
the square at the edges.

We don't want the arrow keys anymore. The ball is going to move on
its own.

**Delete the four arrow-key `if` blocks.** The four "stop at edges"
checks stay for now. Your `update` should look like this:

```ts
function update(dt: number) {
  // Keep the square inside the canvas.
  if (x < 0) {
    x = 0;
  }
  if (x > 800 - 30) {
    x = 800 - 30;
  }
  if (y < 0) {
    y = 0;
  }
  if (y > 600 - 30) {
    y = 600 - 30;
  }
}
```

You can also remove `isKeyDown` from the import, since you don't
use it anymore:

```ts
import { start, Ctx } from "./game";
```

Save. The square sits still — no input, nothing moving it.

::: tip Tidying up as you go
Deleting code is part of programming. When something stops being
useful, take it out. Code you don't use is *clutter* — it makes
the file longer and harder to read for no payoff.
:::

## Step 2 — Move on its own

To make the square move without input, we need two more variables.
One for "how fast in the x direction," one for "how fast in the y
direction."

Add these right under `let x` and `let y`:

```ts
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;
```

Then add two lines at the top of `update`:

```ts
function update(dt: number) {
  x = x + vx * dt;
  y = y + vy * dt;

  // ... the four edge checks stay below ...
}
```

Save. The square slides toward the bottom-right corner, then
*sticks* there (your "stop at the edges" code is still running).

Here's what's happening:

- `vx = 200` means "200 pixels per second to the right." A negative
  number would mean left.
- `vy = 150` means "150 pixels per second down." A negative number
  would mean up.
- Each frame, `update` reads the current `x`, adds `vx * dt`, and
  stores the result. Same pattern as Unit 1 with the arrow keys,
  except the *speed* now lives in a variable instead of being a
  fixed `200`.

These two numbers together — `vx` and `vy` — are the square's
**velocity**: how fast and in which direction it's moving.

**Quick check.** What would the square do if you changed `vx` to
`-200`?

<details><summary>Click for the answer</summary>

It would slide *left* instead of right. Negative `vx` means "move
in the negative-x direction." It would slide left and stick
against the left wall (because the edge code stops it).

</details>

## Step 3 — Bounce instead of stop

Now the fun part. We don't want the ball to stick to a wall. We
want it to **bounce**.

Look at one of your edge checks:

```ts
if (x > 800 - 30) {
  x = 800 - 30;
}
```

It says: "if the square has gone too far right, snap it back to the
right edge." Bouncing means doing the snap *and also* reversing the
x-direction so it heads left from now on. We do that by flipping
the sign of `vx`:

```ts
if (x > 800 - 30) {
  x = 800 - 30;
  vx = -vx;
}
```

`-vx` means "the opposite of whatever `vx` is right now." If `vx`
is `200`, then `-vx` is `-200`. If `vx` is `-200`, then `-vx` is
`200`. So `vx = -vx;` always reverses the x-direction.

Do the same thing to all four edge checks. Your full `update`
should look like:

```ts
function update(dt: number) {
  x = x + vx * dt;
  y = y + vy * dt;

  if (x < 0) {
    x = 0;
    vx = -vx;
  }
  if (x > 800 - 30) {
    x = 800 - 30;
    vx = -vx;
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
  }
  if (y > 600 - 30) {
    y = 600 - 30;
    vy = -vy;
  }
}
```

Save. **The square ricochets around the canvas forever.** That's a
bouncing ball.

::: tip Vocab: comparison
Lines like `x > 800 - 30` and `x < 0` are **comparisons**. A
comparison asks a *yes-or-no* question — "is `x` greater than
`770`?" — and produces `true` or `false`. `if` runs its block only
when the answer is `true`. The two main comparisons you'll use
are `<` (less than) and `>` (greater than).
:::

## Step 4 — Play with the numbers

Try a few changes. Save after each, watch the result.

- Change `vx` to `400`. The ball moves faster.
- Change `vx` to `-200`. The ball starts by moving left.
- Change `vy` to `300`. The ball drifts down steeper.
- Change `vx` to `0`. The ball moves only up and down.
- Change `x` and `y` at the top to put the ball in a different
  starting spot.
- Change the ball's color.

## On your own

Two challenges. Try each *before* reading its hint.

### Challenge 1 — Speed up on each bounce

Make the ball **speed up** every time it bounces off a wall. After
each bounce, the speed in that direction should be 10% bigger.

<details><summary>Hint</summary>

You need to multiply the velocity by `1.1` inside the bounce.
The tricky part: you also want to flip the sign at the same time.
There's a way to do both in one line. Walk through what happens
to `vx` if it's `200` and the ball hits the right wall — what
should it become?

</details>

### Challenge 2 — A second ball

Add a **second ball** to the canvas. It should have its own
position and its own velocity, and bounce independently.

<details><summary>Hint</summary>

Variables can have any name. You used `x`, `y`, `vx`, `vy` for one
ball. Pick four more names for the second ball — `x2`, `y2`, `vx2`,
`vy2` works fine. In `update`, do all the same motion and bounce
math for the second ball too. In `draw`, add a second `fillRect`
call.

It's a *lot* of repetition. Notice how cluttered `update` gets —
that will matter in Unit 6.

</details>

If a hint doesn't unstick you, ask a grown-up.

## Troubleshooting

**The square shakes / vibrates against a wall.**
That means the "snap back" math is slightly off. Double-check
`x = 800 - 30;` (not `x = 800;`) on the right-edge bounce, and
`x = 0;` on the left edge. Same for `y`.

**The square moves but doesn't bounce — it flies off-screen.**
You probably forgot one of the edge `if` checks, or it doesn't
include `vx = -vx;` (or `vy = -vy;`). Compare your `update` to
Step 3.

**Red squiggly line under `isKeyDown`.**
You removed the arrow-key code but kept `isKeyDown` in the import.
Remove it from the import line.

## What you just did

- Made the square move on its own with **velocity** (`vx`, `vy`).
- Learned that flipping a number's sign reverses a direction.
- Used `if` with comparisons to make the ball *bounce* instead of
  stop.

New words:

- **Velocity** — a pair of numbers (`vx`, `vy`) that say how fast
  and in which direction something is moving.
- **Comparison** — a yes-or-no question like `x > 770` that
  produces `true` or `false`.

## What's next

In Unit 3 the paddle comes back. The ball *and* a paddle exist on
screen at the same time, and the ball can bounce off the paddle as
well as the walls. You'll learn:

- How to keep two moving things in mind at once.
- How to check whether two rectangles are touching.
