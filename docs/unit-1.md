# Unit 1 — A square that moves

In this unit you'll make the red square from Unit 0 move when you
press the arrow keys. Along the way you'll meet **variables**, see
the `update` function actually do something, and learn why "pixels
per second" is the right way to talk about speed.

## Open your project

Open Zed. Open the folder `~/building-blocks/v0-paddle`. Open Zed's
terminal (``ctrl + ` ``) and start the dev server:

```sh
npm run dev
```

Open `http://localhost:5173` in your browser. You should see your
red square from Unit 0. **Leave the dev server running** — it'll
reload the page each time you save.

## The plan

Right now your `main.ts` always draws the square at the same spot:
`(100, 100)`. To make it move, we need two things:

1. A way to *remember* where the square is right now (so we can
   change it later).
2. Code that runs over and over, changing that "where" based on
   which keys are pressed.

That second thing is what `update` is for. It already runs 60 times
per second — it just doesn't do anything yet.

## Step 1 — Remember the position in variables

Open `src/main.ts`. Right now it looks like this:

```ts
import { start, Ctx } from "./game";

function update(dt: number) {
  // Nothing happens here yet.
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(100, 100, 30, 30);
}

start(update, draw);
```

Change it to this:

```ts
import { start, Ctx } from "./game";

let x = 100;
let y = 100;

function update(dt: number) {
  // Nothing happens here yet.
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

start(update, draw);
```

Two things changed:

- We added `let x = 100;` and `let y = 100;` at the top.
- In `draw`, `fillRect(100, 100, ...)` became `fillRect(x, y, ...)`.

Save it. Look at the browser. **The square is in the exact same
place as before.** That's the point.

`let x = 100;` creates a **variable** named `x` and gives it the
value `100`. A variable is a name that holds a value you can read
and change later. `let y = 100;` does the same for `y`. Then in
`draw`, instead of hard-coding the position, we look up whatever `x`
and `y` are *right now*.

Same numbers, same picture. But now any code can change `x` or `y`
and the square will move with them. That's what we're going to do
next.

**Quick check.** What value does `x` hold right now?

<details><summary>Click for the answer</summary>

`100`. The line `let x = 100;` created `x` and gave it that value.
Nothing has changed it since.

</details>

**Quick check.** What would change if you replaced `let x = 100;`
with `let x = 300;` and saved?

<details><summary>Click for the answer</summary>

The red square would jump to the right, to where x is 300. The
`draw` function looks up `x` and uses it — it doesn't care that you
typed `100` originally. That's the whole point of variables.

</details>

## Step 2 — Make it move (too fast on purpose)

Now we'll have `update` change `x` over time. Add one line inside
`update`:

```ts
function update(dt: number) {
  x = x + 200 * dt;
}
```

Save.

**Whoa.** The square shoots off the right side of the canvas in a
few seconds. Press `cmd + R` in the browser to reload and watch it
again.

Here's what's happening:

- `update` runs about 60 times per second.
- Each time, `x = x + 200 * dt;` reads the current value of `x`,
  adds `200 * dt`, and stores the new value back in `x`.
- `dt` is the time (in seconds) since the last `update` ran. On a
  fast computer it's usually about `0.0166` (which is `1 / 60`).
- So each `update`, `x` grows by about `200 * 0.0166` = about `3.3`
  pixels.
- Over one second, that adds up to about `200` pixels — exactly
  what we asked for.

That's what *pixels per second* means: we picked `200` as the speed
in pixels per second. The math `200 * dt` turns "I want to move 200
pixels per second" into "how much should I move *this frame*."

::: tip Why "pixels per second"?
You might wonder why we don't just write `x = x + 3;` and skip
`dt`. The problem: not every computer runs at the same number of
frames per second. A slower laptop might do 30. A fancy gaming
monitor might do 120. If you say "3 pixels per frame," your game
runs at different speeds on different computers — slow ones feel
sluggish, fast ones feel zippy.

If you say "200 pixels per second" by multiplying speed by `dt`,
the game runs the *same* speed everywhere. The engine measures how
long each frame took and gives you `dt`. Your job is just to use
it.
:::

**Quick check.** At 200 pixels per second, roughly how long does
it take the square to cross the 800-pixel-wide canvas?

<details><summary>Click for the answer</summary>

About 4 seconds. The canvas is 800 wide, the speed is 200 per
second, and 800 ÷ 200 = 4.

</details>

## Step 3 — Move it with the arrow keys

The square moves on its own right now, off the screen. We want it
to only move when you actually press a key.

::: tip Vocab: import
The **`import`** line at the top of `main.ts` is how this file
borrows things from another file. Each file in your project is
its own little world, and `import` is how you reach into another
file and pull names out of it. `./game` means "the file called
`game.ts` next to me." The names in `{ ... }` are the things
you're borrowing — once imported, you can use them as if they
were defined right here.

You're about to edit that line to borrow one more name.
:::

First, update the import at the top of `main.ts` so we can use a
new function called `isKeyDown`:

```ts
import { start, isKeyDown, Ctx } from "./game";
```

(We added `isKeyDown` between `start` and `Ctx`.)

Then change `update`:

```ts
function update(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    x = x - 200 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    x = x + 200 * dt;
  }
}
```

**Predict first.** Before you save, picture what's about to happen.
What does the square do if you *don't* touch the keyboard?

<details><summary>Click for the answer</summary>

It sits still. Neither `if` is true (no arrow keys are held), so
nothing inside either block runs. `x` doesn't change.

Now save, **click on the browser window**, and press the right
arrow. The square should slide right while you hold it.

(The "click on the browser window" part matters. Your computer
sends keyboard input to whichever app you last clicked. If you
just hit save in Zed, the keys are going to Zed, not the browser.)

</details>

Here's what `update` does now:

- `isKeyDown("ArrowLeft")` asks the engine "is the left arrow key
  being held right now?" It returns `true` if yes, `false` if no.
- An `if` statement runs its block (the code between `{` and `}`)
  only when the condition is `true`.
- So `x = x - 200 * dt;` only runs while you're holding the left
  arrow. Subtracting from `x` moves the square left.
- The right arrow is the mirror image: `x = x + 200 * dt;` runs
  only while you're holding the right arrow, and adding to `x`
  moves the square right.

**Quick check.** What happens if you hold *both* arrow keys at
the same time?

<details><summary>Click for the answer</summary>

The square sits still. Both `if`s run, but the moves cancel out:
first `x = x - 200 * dt;`, then `x = x + 200 * dt;` — `x` ends up
where it started.

</details>

Your full `main.ts` should look like this now:

```ts
import { start, isKeyDown, Ctx } from "./game";

let x = 100;
let y = 100;

function update(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    x = x - 200 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    x = x + 200 * dt;
  }
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

start(update, draw);
```

If yours doesn't match, fix it before moving on.

## Step 4 — Play with it

Save and try a few things:

- Hold left, then right, then left. The square should slide back
  and forth.
- Tap an arrow briefly. Short tap, short move.
- Change one of the `200`s to `400`. Save. Which direction is now
  twice as fast?
- Change a `200` to `50`. The square crawls in that direction.
- Change the color of the square from `"red"` to `"blue"` or
  anything else. Pick what you want.

This is the loop again: change a number, save, watch.

## On your own

The unit is about to end, but there's still real code for you to
write. Two challenges. Try each one *before* reading its hint — and
no, there's no "show me the answer" at the bottom. The whole point
is the wrestling.

### Challenge 1 — Up and down

The square moves left and right, but not up or down. The arrow keys
for up and down are called `"ArrowUp"` and `"ArrowDown"`.

Add code so the square moves in all four directions.

<details><summary>Hint</summary>

You need two more `if` blocks in `update`, like the ones for left
and right but using `"ArrowUp"` / `"ArrowDown"` and changing `y`
instead of `x`.

Remember from Unit 0: on the canvas, going *down* means `y` gets
*bigger*. So which arrow should *add* to `y`, and which should
*subtract*?

</details>

### Challenge 2 — Stop at the edges

If you push the square far enough, it leaves the canvas and
disappears. Make it stop at the edges instead. When the square
hits a wall, it should sit against the wall until you push the
other way.

Some numbers to work with: the canvas is **800 wide and 600 tall**,
and the square is **30 wide and 30 tall**.

<details><summary>Hint</summary>

`ctx.fillRect(x, y, 30, 30)` draws the square's *top-left corner*
at `(x, y)`. So when `x` is `0`, the square is touching the left
edge. But when `x` is `800`, the square is *past* the right edge
— its left side is at the canvas's right edge, and the rest is
off-screen. When does the square's *right* side line up with the
*right* edge of the canvas? Work that number out before writing
any code.

One approach: *after* `update` changes `x` and `y`, add some `if`
checks that *fix* `x` or `y` if they've gone too far. There are
four edges to think about.

</details>

If a hint doesn't unstick you, ask a grown-up to look at it with
you. The point of this part is the wrestling — if I wrote the
answer here, you'd type it and miss the part where you learn.

## Troubleshooting

**The square doesn't move when I press arrow keys.**
Click on the browser window first, then try the keys. The browser
needs to know your typing is *for it*, not for some other app.

**The square zoomed off and never came back.**
Reload the page (`cmd + R`). The square's position resets to
`(100, 100)`. If it still zooms off, an arrow key might be stuck —
press it once and let go.

**Red squiggly line under `isKeyDown`.**
Check the import line at the top. It should say
`import { start, isKeyDown, Ctx } from "./game";` — `isKeyDown`
needs to be in there.

## What you just did

- Made the square's position into **variables**, so other code can
  change them.
- Used `update` to actually change those variables over time.
- Learned why **pixels per second** beats "pixels per frame."
- Used `if` with `isKeyDown` to make the square respond to your
  keyboard.

A few new words:

- **Variable** — a name that holds a value you can read and
  change.
- **`let`** — the keyword you use to *create* a new variable in
  TypeScript.
- **Assignment** — the line `x = x + 200 * dt;` is an *assignment*:
  it computes the right side, then puts the result into the left
  side. The `=` here means "store this," not "is equal to."
- **`if`** — runs a block of code only when a condition is true.
- **`dt`** — short for "delta time" — the seconds since the last
  `update` ran.
- **Import** — a line that pulls names (functions, types, etc.)
  from another file into this one so you can use them.

## What's next

In Unit 2 the square becomes a **ball that bounces around on its
own**, no keyboard needed. You'll learn:

- How to make something move on its own using **velocity** (a
  variable that says "how fast and which direction").
- How to detect when the ball hits a wall.
- How to flip the velocity's sign to make the ball bounce.
