# Unit 7 — A row of bricks

It's been five units. The game has a paddle, a ball that bounces,
lives, a score, sound — but it doesn't have the thing the game is
named after. Time to fix that.

In Unit 7 you'll add a single row of bricks at the top of the
canvas. The ball will destroy a brick on contact and bounce off.
This unit introduces two of the most important ideas in
programming: **arrays** (a list of things) and **loops** (running
the same code over and over for each thing in the list).

## What you'll learn

- **Array** — a list-of-things variable. Holds many values under
  one name.
- **Object** — a single value with multiple named fields (like a
  brick with `x`, `y`, `width`, `height`).
- **`for` loop** — repeats a chunk of code, usually once per item
  in a list.

## Step 1 — Make eight bricks

Add this near the other `let` declarations at the top of
`main.ts`:

```ts
let bricks = [
  { x:   5, y: 50, width: 90, height: 20, alive: true },
  { x: 105, y: 50, width: 90, height: 20, alive: true },
  { x: 205, y: 50, width: 90, height: 20, alive: true },
  { x: 305, y: 50, width: 90, height: 20, alive: true },
  { x: 405, y: 50, width: 90, height: 20, alive: true },
  { x: 505, y: 50, width: 90, height: 20, alive: true },
  { x: 605, y: 50, width: 90, height: 20, alive: true },
  { x: 705, y: 50, width: 90, height: 20, alive: true },
];
```

That's a lot at once. Let's pull it apart.

- The square brackets `[ ... ]` make an **array** — a list. Each
  thing in the list is separated by a comma.
- Each item is an **object** — written with curly braces
  `{ ... }`. An object holds multiple named pieces, like a brick
  knowing its `x`, `y`, `width`, `height`, and whether it's still
  `alive`.
- All eight bricks are on the same row (`y: 50`), each 100 pixels
  apart in x. So `x: 5, 105, 205, 305, …, 705`. 8 bricks × 100
  pixels = 800, which is exactly the canvas width.
- Each brick is `90` wide and `20` tall. The extra `10` pixels
  per brick is the gap between them.

`bricks` is now a single variable that holds *all eight* of those
brick objects.

::: tip Vocab: array
An **array** is a list of values, in order. You make one with
square brackets and commas: `[1, 2, 3]` or `["red", "green",
"blue"]`. You can read or change individual items by their
**index** — the position in the list, starting from `0`. So
`bricks[0]` is the first brick, `bricks[1]` is the second, and so
on. `bricks.length` tells you how many items the array has.
:::

::: tip Vocab: object
An **object** is a value that bundles together multiple named
pieces, called **fields** or **properties**. You make one with
curly braces and `name: value` pairs: `{ x: 5, y: 50, alive: true }`.
You read or change a field with a dot: `brick.x`, `brick.alive`.
A variable, an array, and an object are the three main shapes
that data takes in your program.
:::

## Step 2 — Draw all the bricks

You need to call `fillRect` once for each brick. The way to "do
something once for each item in a list" is a **loop**.

Add this helper function near `drawBall`:

```ts
function drawBricks(ctx: Ctx) {
  ctx.fillStyle = "orange";
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.alive) {
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  }
}
```

Then call `drawBricks(ctx);` from `draw`, right after `drawBall`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawBricks(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}
```

Save. **Eight orange bricks across the top.**

The `for` loop deserves a close look:

```ts
for (let i = 0; i < bricks.length; i++) {
  const brick = bricks[i];
  // ...
}
```

A `for` loop has three parts between the parentheses, separated by
semicolons:

1. **Start.** `let i = 0;` — create a counter `i` and set it to
   zero. (Programmers count from `0`, not `1`.)
2. **Keep going while.** `i < bricks.length;` — keep looping as
   long as `i` is less than the size of the array.
3. **Step forward.** `i++` — short for `i = i + 1`. After each
   pass through the loop, add 1 to `i`.

So the loop runs with `i = 0`, then `i = 1`, then `i = 2`, all the
way up to `i = 7`. When `i` becomes `8`, the "keep going while"
check is false (`8 < 8` is false), and the loop stops.

Inside the loop, `const brick = bricks[i];` reads the `i`-th brick
out of the array. `const` is a new keyword — it's like `let`, but
it says "this name won't be reassigned." Why bother? Because if
you ever write `brick = somethingElse` by accident later in the
loop, TypeScript will yell at you instead of letting the bug
slip through. Use `const` for names that shouldn't change;
`let` for ones that should. `brick` only exists inside this one
trip through the loop.

The `if (brick.alive)` check is there so we don't draw bricks that
have been destroyed. They all start `alive: true`, so right now
all eight draw.

**Quick check.** What is `bricks[0].x`? What about `bricks[7].y`?

<details><summary>Click for the answer</summary>

`bricks[0].x` is `5` — the `x` field of the *first* brick.
`bricks[7].y` is `50` — the `y` field of the *eighth* (last)
brick. The pattern is `array[index].field` — drill down by
position into the array, then by name into the object.

</details>

**Quick check.** How many times does `ctx.fillRect` get called when
`draw` runs?

<details><summary>Click for the answer</summary>

Ten. Once for the ball, once for the paddle, and once for each of
the 8 bricks. (`fillText` also runs twice for the HUD lives/score,
but the question only asked about `fillRect`.) All of that
happens roughly 60 times per second.

</details>

## Step 3 — Destroy bricks on contact

The ball flies right through the bricks. We need a collision check
just like the paddle check from Unit 3, but for every brick.

Add this helper function:

```ts
function updateBricks() {
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (!brick.alive) {
      continue;
    }
    if (
      x + 30 > brick.x &&
      x < brick.x + brick.width &&
      y + 30 > brick.y &&
      y < brick.y + brick.height
    ) {
      brick.alive = false;
      vy = -vy;
      score = score + 10;
      playBonk();
    }
  }
}
```

Two new operators show up here, both small:

- `!` means "**not**." `!brick.alive` is `true` when
  `brick.alive` is `false` (and the other way round). It's the
  yes/no flipper.
- `continue` inside a loop means "skip the rest of the body and
  jump to the next iteration." We use it as a quick way to bail
  out on dead bricks — the alternative would be wrapping the
  collision check in `if (brick.alive) { ... }`. Both work; using
  `continue` keeps the collision code from creeping rightward
  with extra indentation.

Then call it from `update`, right before `updateBall(dt)`:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  updatePaddle(dt);
  updateBricks();
  updateBall(dt);
}
```

Save. The ball now destroys bricks when it touches them, and the
score jumps by 10 per brick.

Two new things in `updateBricks`:

- `if (!brick.alive) { continue; }` — `!` means "not." So
  `!brick.alive` is `true` when `brick.alive` is `false`. The
  `continue` keyword means "skip the rest of this loop iteration
  and go to the next one." Together: "if this brick is dead, skip
  it."
- `brick.alive = false;` — sets the `alive` field on this brick
  object. The other 7 bricks' `alive` fields are unchanged.
  Objects let you give a name to a *single* thing's state.

Don't forget to also restore the bricks when the game restarts.
Update `restartGame`:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
  for (let i = 0; i < bricks.length; i++) {
    bricks[i].alive = true;
  }
}
```

Save. Press space after game over — all the bricks come back.

::: tip Lots of repetition in `bricks`?
Yes — 8 lines that are nearly the same. A real Brick Breaker has
many more bricks, and writing them all out by hand would be
miserable. Unit 8 shows you how to *generate* the brick array
with a loop, in just a few lines, instead of typing each one.
For now, hand-typed is fine.
:::

## Step 4 — Play with it

- Change brick colors per row: `ctx.fillStyle = "purple";` —
  affects all bricks since they all share the same `fillStyle`
  setting.
- Change brick width / height in the array literal. Or move them
  further down (`y: 100`).
- Change `score = score + 10;` to `score = score + 100;` for
  bigger numbers.
- Make the ball faster so brick-breaking is more frenetic.

## On your own

### Challenge 1 — Bricks with different colors

Make each brick a different color. Give each brick a `color` field
in the array (like `color: "red"` or `color: "#ff8800"`), and use
that color when drawing it.

<details><summary>Hint</summary>

Add `color: "red"` (or any color) to each brick object in the
array. In `drawBricks`, instead of `ctx.fillStyle = "orange";`
once at the top, set `ctx.fillStyle = brick.color;` *inside* the
loop, for each brick.

</details>

### Challenge 2 — Win condition

If the player destroys all the bricks, the game should end —
not with "Game Over" but with "You Win!" Add a new `gameState`
value `"won"` for this, and the matching draw + restart logic.

<details><summary>Hint</summary>

In `updateBricks` (or somewhere after it), check whether *every*
brick has `alive` set to `false`. One way: a counter that starts
at zero and increments for each dead brick. If the counter equals
`bricks.length`, switch `gameState` to `"won"`.

You'll also need a `drawWon` function (modeled after
`drawGameOver`), and you'll need to *widen* the early-return
check at the top of `update` — right now it only fires when
`gameState === "gameOver"`. Either change it to use `||` (which
you'll meet properly in Unit 8) so it fires on either
`"gameOver"` or `"won"`, or flip it around to fire when
`gameState !== "playing"`. Without that change, the ball keeps
flying around your won screen and space does nothing.

</details>

## Troubleshooting

**The ball passes through bricks without destroying them.**
Compare the brick collision check carefully to Step 3. It's the
same shape as the paddle collision, but with `brick.x`, `brick.y`,
`brick.width`, `brick.height` instead of the paddle's.

**A destroyed brick is still drawn.**
Check that you set `brick.alive = false;` in `updateBricks` and
that `drawBricks` has the `if (brick.alive)` guard.

**Bricks don't come back when I restart.**
You forgot to revive them in `restartGame`. The loop at the end of
`restartGame` sets every brick's `alive` back to `true`.

## What you just did

- Stored eight bricks in a single **array**.
- Used **objects** to give each brick its own state.
- Wrote your first `for` **loop**.
- Killed bricks on collision and revived them on restart.

New words:

- **Array** — a list of values. Use `[ ]` to make one, `array[i]`
  to read by index, `array.length` for the size.
- **Object** — a value with named fields, written `{ name: value,
  name: value, ... }`. Read fields with a dot: `thing.field`.
- **`for` loop** — `for (let i = 0; i < array.length; i++) { ... }`
  runs the body once for each item, with `i` taking the values
  `0, 1, 2, ...`.
- **`const`** — like `let`, but for variables that won't change.
- **`!`** — "not." Flips `true` to `false` and back.
- **`continue`** — inside a loop, "skip to the next iteration."

## What's next

In Unit 8 we go from one row of bricks to **many** rows. You'll
write a loop that *creates* the bricks (instead of hand-typing
them), and another loop inside it for the rows. That's called
**nested loops**. At the end you'll have **v1** — a fully
recognizable brick-breaker.
