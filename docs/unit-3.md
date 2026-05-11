# Unit 3 — Bring back the paddle

Right now you have a ball that bounces off four walls, no input. In
Unit 3 you'll bring back the paddle from Unit 1 — a player-
controlled rectangle at the bottom of the screen — and make the
ball bounce off it too. After this unit the game starts looking
like a real brick-breaker (minus the bricks).

## What you'll learn

- How to keep *two* moving things on screen at the same time.
- **AABB collision**: how to check whether two rectangles are
  touching.

## Step 1 — Add the paddle

A paddle is just another rectangle. We need to remember where it is
and how big it is. Add four new variables near the top of
`main.ts`, under `vx` and `vy`:

```ts
let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;
```

Where the numbers come from:

- `paddleX = 400` — start it in the middle horizontally (canvas is
  800 wide).
- `paddleY = 560` — near the bottom (canvas is 600 tall; the paddle
  is 12 tall, so `560` leaves `28` pixels of space below).
- `paddleWidth = 80`, `paddleHeight = 12` — a wide, short
  rectangle.

Now draw it. In `draw`, after the existing `fillRect` for the ball,
add:

```ts
function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);

  ctx.fillStyle = "white";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}
```

Save. You see a white rectangle near the bottom of the canvas — and
the ball ricocheting around as before.

## Step 2 — Control the paddle with arrow keys

You've done this before. Bring `isKeyDown` back into the import:

```ts
import { start, isKeyDown, Ctx } from "./game";
```

Then add paddle-control code inside `update` (put it after the ball
math and bounces). The paddle should move left and right with the
arrow keys, and stop at the canvas edges:

```ts
// Move the paddle
if (isKeyDown("ArrowLeft")) {
  paddleX = paddleX - 400 * dt;
}
if (isKeyDown("ArrowRight")) {
  paddleX = paddleX + 400 * dt;
}

// Keep the paddle on screen
if (paddleX < 0) {
  paddleX = 0;
}
if (paddleX > 800 - paddleWidth) {
  paddleX = 800 - paddleWidth;
}
```

`400` is a bit faster than the `200` we used in Unit 1. Paddles
need to be quick — a paddle that's slower than the ball can't
get under the ball in time, and the player feels like the game is
fighting them. You can tune that number to taste.

Save. The paddle slides left and right when you press the arrow
keys; the ball still bounces around. They don't notice each other
yet.

**Quick check.** Without saving, what would happen if you changed
`paddleX = 800 - paddleWidth;` to `paddleX = 800;`?

<details><summary>Click for the answer</summary>

The whole paddle would slide off the right edge — invisible.
`paddleX = 800;` puts the *left side* of the paddle right at the
canvas's right edge, so the rest of the paddle is drawn past the
edge, off-screen.

</details>

## Step 3 — Bounce the ball off the paddle

The paddle is now the bottom guard — when the player misses, the
ball *should* fly past the paddle and off the canvas (we'll handle
that case in Unit 4). The old bottom-wall bounce from Unit 2 is
in the way: it catches the ball and prevents the miss from ever
happening.

**Delete the bottom-wall bounce.** Find this block in `update`:

```ts
if (y > 600 - 30) {
  y = 600 - 30;
  vy = -vy;
}
```

Remove it. Leave the left, right, and top bounces in place — those
still walls. The ball will now fly straight through where the
floor used to be and off the bottom of the canvas. That's fine for
this step.

Save. Now the ball still goes straight through the paddle. We want
it to bounce when they touch.

Two rectangles are *touching* (overlapping) when **all four** of
these are true:

1. The right side of the ball is past the left side of the paddle.
2. The left side of the ball is before the right side of the
   paddle.
3. The bottom of the ball is past the top of the paddle.
4. The top of the ball is before the bottom of the paddle.

If any one of those four is false, they don't overlap.

Add this check at the bottom of `update`:

```ts
if (
  x + 30 > paddleX &&
  x < paddleX + paddleWidth &&
  y + 30 > paddleY &&
  y < paddleY + paddleHeight
) {
  vy = -vy;
  y = paddleY - 30;
}
```

The `y = paddleY - 30;` line snaps the ball to just above the
paddle. Without it, the ball can end up *inside* the paddle for a
frame or two and bounce up-and-down forever in place.

What each line is saying:

- `x + 30 > paddleX` — ball's right side past paddle's left side.
- `x < paddleX + paddleWidth` — ball's left side before paddle's
  right side.
- `y + 30 > paddleY` — ball's bottom past paddle's top.
- `y < paddleY + paddleHeight` — ball's top before paddle's
  bottom.

The `&&` between them means **AND** — the whole condition is true
only if every individual part is true. So we only flip the ball's
y-velocity when all four are true, which means the rectangles are
overlapping.

Save. Move the paddle under the falling ball. When they touch, the
ball bounces upward.

::: tip Vocab: AABB
What you just wrote is called **AABB collision** — *Axis-Aligned
Bounding Box*. "Axis-aligned" means the rectangles don't tilt.
"Bounding box" means we treat each thing as a simple rectangle for
collision purposes. AABB is the simplest, fastest collision test
in games — you'll see it everywhere.
:::

## Step 4 — Play with it

- Make the paddle wider (`paddleWidth = 200`). Easier to catch.
- Make the paddle narrower (`paddleWidth = 30`). Much harder.
- Change the paddle's color.
- Change the ball's starting velocity to make it move faster.
- Move the paddle's `y` higher up to give yourself more room.

## On your own

### Challenge 1 — Restart the ball

If the ball gets past your paddle, it gets stuck bouncing off the
bottom wall forever, which isn't very interesting. Make the ball
**reset to the top of the canvas** when it goes below the paddle.

<details><summary>Hint</summary>

You don't need a new variable. When `y` gets bigger than some
number (what number? — where below the paddle counts as "missed?"),
set `x`, `y`, `vx`, `vy` back to starting values.

</details>

### Challenge 2 — Different bounce angle depending on where it hits

Right now the ball bounces straight back up regardless of where on
the paddle it hits. In real brick-breaker, the ball goes more
sideways when it hits the *edge* of the paddle.

Try this: when the ball bounces off the paddle, change `vx` based
on how far from the paddle's center it hit.

<details><summary>Hint</summary>

In the paddle-bounce `if`, look at how far the ball's center
(`x + 15`) is from the paddle's center (`paddleX + paddleWidth / 2`).
Use that difference to set `vx`. The further from center, the
bigger `vx` should be (positive on the right side, negative on
the left).

Hint within a hint: try setting `vx` to that difference, scaled by
some number like `5` or `10`. Tune until it feels good.

</details>

## Troubleshooting

**The ball "sticks" to the paddle and shakes.**
That can happen if your paddle-bounce block doesn't include
`y = paddleY - 30;`. Without that line, the ball can end up
inside the paddle for a frame or two and bounce in place. Check
Step 3's code again.

**The ball passes right through the paddle.**
Either your AABB check is wrong (compare it to Step 3 carefully),
or the ball is moving so fast that it skips past the paddle in
a single frame. That's called **tunneling**: at 200 pixels per
second and a 12-pixel-tall paddle, the ball travels more than the
paddle's height per frame at certain frame rates, and the check
never sees the overlap. The fix is more advanced; for now, keep
the ball slow enough to catch (`vy = 150` is fine).

## What you just did

- Tracked *two* moving things at once (a ball and a paddle), each
  with its own state.
- Wrote your first **collision check** using the AABB rule.
- Connected those two things — the paddle now affects the ball.

New words:

- **AABB collision** — checking whether two axis-aligned rectangles
  overlap by comparing their edges with four `>`/`<` checks
  joined by `&&`.
- **`&&`** — "and." A combined condition is true only if both
  sides are true.

## What's next

In Unit 4 you'll add **lives** and a **game over** screen. When the
ball gets past the paddle, you'll lose a life instead of just
resetting. After 3 misses, the game ends. You'll learn:

- How to count things across many frames (a *counter* variable).
- How to switch between game *states* like "playing" and
  "game over."
- How to draw text on the canvas.
