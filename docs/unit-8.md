# Unit 8 — Multiple rows of bricks

A real brick-breaker has rows and rows of bricks, not just one. In
Unit 8 you'll generate a grid of bricks with code — five rows, ten
columns, fifty bricks — and add a **You Win!** screen when the
player clears them all. After this unit, you have **v1**.

This unit is mostly *applying* what you saw in Unit 7. It
introduces only one really new thing: a **nested loop** — a loop
inside another loop.

## What you'll learn

- How to *generate* an array with a loop, instead of writing it
  out by hand.
- **Nested loops** — when you need to do something for every
  combination of two things (like row × column).
- A win condition: "are all the bricks gone?"

## Step 1 — Replace the hand-typed array with a loop

Find your `bricks` declaration from Unit 7 (the array with 8
objects written out by hand). Replace it with:

```ts
let bricks: { x: number; y: number; width: number; height: number; alive: boolean }[] = [];

for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 10; col++) {
    bricks.push({
      x: col * 80 + 5,
      y: row * 30 + 50,
      width: 70,
      height: 20,
      alive: true,
    });
  }
}
```

That replaces 8 hand-typed bricks with **fifty** bricks, generated
by code. Save. You should see five rows of ten bricks each,
filling the top of the canvas.

Let's walk through what's new.

The first line:

```ts
let bricks: { x: number; y: number; width: number; height: number; alive: boolean }[] = [];
```

This is the *type annotation*. Before, TypeScript figured out the
type of `bricks` from the array literal you wrote. Now you're
starting with an empty array (`[]`), so TypeScript can't tell what
kind of items will go in it. The annotation says: "this is an
array of brick objects, each with these five fields." The `[]` at
the end of the type means "array of."

The two loops:

```ts
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 10; col++) {
    bricks.push({ ... });
  }
}
```

This is a **nested loop**: a `for` loop inside another `for` loop.
The outer loop runs 5 times (`row` is 0, 1, 2, 3, 4). For *each*
of those, the inner loop runs 10 times (`col` is 0, 1, …, 9). So
the inner code runs 5 × 10 = **50 times**, once for every
combination.

Inside, `bricks.push({ ... })` adds a new brick object to the end
of the array. `.push` is one of the things you can do with an
array — it appends a new item.

The position math:

- `x: col * 80 + 5` — each column is 80 pixels wide, plus a 5
  pixel margin on the left. Col 0 → x=5. Col 1 → x=85. Col 9 →
  x=725. (Bricks are 70 wide, so the 10-pixel gap between them is
  what's left.)
- `y: row * 30 + 50` — each row is 30 pixels tall, starting at
  y=50. Row 0 → y=50. Row 4 → y=170.

::: tip Vocab: nested loop
A **nested loop** is a loop inside another loop. The classic use:
do something for every cell of a 2D grid (like the bricks). The
outer loop walks one axis (rows), the inner loop walks the other
(columns). Total iterations = outer × inner.

The total can get big fast. 5 × 10 = 50 here, but 100 × 100 =
10,000. For a game running 60 frames per second, you have to think
about how much your inner loop is doing.
:::

**Quick check.** What would happen if you swapped the inner and
outer loops? (`for (let col = ...) { for (let row = ...) { ... } }`)

<details><summary>Click for the answer</summary>

Nothing visible! You'd still end up with all 50 (row, col)
combinations being created. The only difference is the *order*
they get added to the array — column-by-column instead of
row-by-row. Since you're not relying on the order anywhere, the
end result is the same.

</details>

## Step 2 — Make `restartGame` rebuild the grid

Right now `restartGame` revives every dead brick. That worked when
the bricks were hand-typed and never changed. But — quick thought
experiment — what if we wanted *different* layouts each time the
game restarts? Or different rows by level?

For now, the existing revive-all-bricks loop is fine. But let's
make it cleaner by *replacing* the bricks array entirely. Update
`restartGame`:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
  bricks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      bricks.push({
        x: col * 80 + 5,
        y: row * 30 + 50,
        width: 70,
        height: 20,
        alive: true,
      });
    }
  }
}
```

You now have the brick-generation loop in *two* places: at module
scope (the first time) and in `restartGame`. That's repeated code
— the kind of thing Unit 6 told us to extract.

Pull it out into its own function. Put this above `restartGame`:

```ts
function buildBricks() {
  bricks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      bricks.push({
        x: col * 80 + 5,
        y: row * 30 + 50,
        width: 70,
        height: 20,
        alive: true,
      });
    }
  }
}
```

Replace the original module-scope loop *and* the loop in
`restartGame` with a single call:

```ts
// At module scope (top of the file):
let bricks: { x: number; y: number; width: number; height: number; alive: boolean }[] = [];
buildBricks();
```

::: warning Hoisting heads-up
Calling `buildBricks()` *above* its `function` declaration looks
wrong, but it works: TypeScript hoists `function`-style functions
to the top of their scope, so the call sees the definition even
though the definition appears later in the file. (Same trick is
why your `start(update, draw);` at the bottom of the file works.)
You don't have to know how it works to use it; just know it's not
a typo.
:::

```ts
// In restartGame:
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
  buildBricks();
}
```

Save. Same behavior, less repetition.

## Step 3 — Win condition

Right now the player can clear every brick and the game just keeps
going forever, with the ball bouncing around an empty canvas.
That's anticlimactic.

Add a `"won"` state and a winning screen.

In `updateBricks`, after the collision check, look at whether any
bricks remain alive. If none, switch to `"won"`:

```ts
function updateBricks() {
  let aliveCount = 0;
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (!brick.alive) {
      continue;
    }
    aliveCount = aliveCount + 1;
    if (
      x + 30 > brick.x &&
      x < brick.x + brick.width &&
      y + 30 > brick.y &&
      y < brick.y + brick.height
    ) {
      brick.alive = false;
      aliveCount = aliveCount - 1;
      vy = -vy;
      score = score + 10;
      playBonk();
    }
  }
  if (aliveCount === 0) {
    gameState = "won";
  }
}
```

We count alive bricks while we're already iterating. If after the
loop the count is zero, all bricks are gone — you win.

Now handle the new state. In `update`, the early-return for
`gameOver` should also trigger for `"won"`. Easiest way: check
either state:

```ts
function update(dt: number) {
  if (gameState === "gameOver" || gameState === "won") {
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

`||` means **OR** — the condition is true if either side is true.
You've used `&&` ("and"). `||` is its partner.

Finally, draw the win screen. Add:

```ts
function drawWon(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("You Win!", 270, 300);
}
```

And in `draw`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawBricks(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
  if (gameState === "won") {
    drawWon(ctx);
  }
}
```

Save. Clear all the bricks — "You Win!" appears, and you can press
space to play again.

**🎉 You have v1.**

(Yes, that's an emoji. The game now has bricks. Allow yourself a
moment to celebrate before adding more features.)

## Step 4 — Play with it

- Try more rows: change `row < 5` to `row < 8`.
- Try fewer columns: `col < 6` for wider bricks.
- Try changing the brick widths and gaps:
  - `width: 50, x: col * 60 + 5` for narrower bricks.
- Move the bricks lower: change the `+ 50` in the y math.
- Change the brick color depending on the row (each row gets a
  different color). Hint: in `drawBricks`, you don't have a `row`
  variable anymore, but each brick *could* have a `color` field if
  you set it during `buildBricks`.

## On your own

### Challenge 1 — Color per row

Make each row of bricks a different color. Top row red, next
orange, then yellow, green, blue. (Or your own choice.)

<details><summary>Hint</summary>

When you push a brick in `buildBricks`, you know what row it's in
(the `row` variable). Add a `color: ...` field to each brick that
depends on `row`. The simplest way: an array of colors at the top
of the file, then `color: colors[row]`.

In `drawBricks`, set `ctx.fillStyle = brick.color;` *inside* the
loop instead of once at the top.

</details>

### Challenge 2 — Faster ball as bricks disappear

Make the ball speed up as you clear bricks. After every brick is
destroyed, multiply `vx` and `vy` by something like `1.02` (2%
faster per brick). By the end, the ball will be flying.

<details><summary>Hint</summary>

In `updateBricks`, after `brick.alive = false;`, add `vx = vx * 1.02;`
and `vy = vy * 1.02;`. That's it.

The math: 50 bricks × 2% faster each ≈ 2.7x speed by the last
brick. (Not exactly 200% extra; small percentage gains compound.)

</details>

## Troubleshooting

**Some bricks are overlapping or wrapping around.**
Check the position math in `buildBricks`. With 10 columns at 80
pixels each plus a 5-pixel left margin, the last column's right
edge is at 5 + 9*80 + 70 = 795. Just inside the 800-wide canvas.
If your numbers don't line up, bricks wrap or overlap.

**The win screen appears immediately.**
You probably moved the `aliveCount` check to before the bricks
are built. Make sure `buildBricks()` runs at module scope (top
of file), before `start(update, draw)` runs.

**`||` and `&&` are confusing.**
`&&` means "both must be true." `||` means "either is enough."
Mnemonic: in `&&`, two separate sticks ("and"); in `||`, two
side-by-side pipes (one *or* the other).

## What you just did

- Replaced 8 hand-typed bricks with 50 generated by a **nested
  loop**.
- Pulled the generation into its own function, `buildBricks`.
- Added a third game state, `"won"`, with its own screen.
- Used `||` ("or") for the first time.

New words:

- **Nested loop** — a loop inside another loop. Common shape for
  walking a 2D grid.
- **`||`** — "or." A combined condition is true if either side is
  true.
- **`.push`** — array method to append a new item.

## What's next

In Unit 9 you'll add **tougher bricks** — some need *two* hits
before they break. That's the start of bricks having more
interesting properties (the `hp` field — "hit points"). This is
**v2**.
