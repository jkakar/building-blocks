# Unit 6 — Refactor: break `main.ts` apart

If you scroll through `main.ts` right now, you might notice
something: it's getting *long*. The `update` function alone has
ball motion, wall bounces with sound calls, paddle controls, paddle
edge clamps, paddle collision, score, lives, game-over logic, and
restart. Reading from top to bottom takes a while, and finding a
specific bit means scanning past a lot of unrelated stuff.

In Unit 7 we add the thing the game is named after — bricks.
Lots of them, in an array, with their own draw and collision code.
Before we cram more into `main.ts`, let's make `main.ts` somewhere
we'd *want* to put new things. The game won't look any different
at the end of this unit, but the code will be **easier to read,
easier to find things in, and easier to extend**. The work of
cleaning up code without changing what it does is called
**refactoring**.

## What you'll learn

- How to **write your own functions** (not just `update` and
  `draw` from the scaffold).
- That a long block of code with a clear purpose can almost always
  be pulled out into a function with a good name.
- When *not* to refactor.

## Step 1 — Notice what's repeated

Open `main.ts` and read through it. Look for these two patterns:

1. **Code that gets repeated.** The "reset the ball" lines —
   `x = 100; y = 100; vx = 200; vy = 150;` — show up in *two*
   places: once when the player loses a life (but still has lives
   left), and once when they press space to restart.
2. **A long function doing many things.** The `update` function
   has maybe 40 lines and does at least three jobs: move the
   paddle, move the ball, check for game over.

Both of those are reasons to refactor. Repeated code is annoying:
when you want to change the starting position, you have to change
it in two places, and miss one is a bug. Long functions are
hard to read: you have to hold many things in your head at once.

The fix for both: pull related lines into their own **function**
with a clear name.

::: tip Vocab: function (again)
You first saw the word *function* in Unit 0. So far you've only
modified the *inside* of two functions — `update` and `draw` —
that came from the scaffold. From now on you'll write your own
functions. The shape is:

```ts
function nameItDescriptively(args: type) {
  // code that does the thing
}
```

You *call* a function by writing its name followed by `()`. The
call runs the code inside. You can call a function from any other
function. Code outside any function (like `let x = 100;` at the
top of the file) runs once, when the file loads.
:::

## Step 2 — Extract `resetBall`

Add this near the top of `main.ts`, right after `playBonk`:

```ts
function resetBall() {
  x = 100;
  y = 100;
  vx = 200;
  vy = 150;
}
```

Now replace the two places that have those four lines with a
single call to `resetBall()`:

```ts
// In the "ball missed paddle" block:
if (y > 600) {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    resetBall();
  }
}

// In the "press space to restart" block:
if (isKeyDown(" ")) {
  lives = 3;
  score = 0;
  resetBall();
  gameState = "playing";
}
```

Save. The game should behave **exactly the same** — that's the
point of refactoring. Same behavior, less code.

You just *extracted* four lines into a named function and called
that function in two places. Now changing the starting position
means changing it once, in `resetBall`. The benefit grows as the
codebase grows.

## Step 3 — Extract `restartGame`

The "press space to restart" block resets `lives`, `score`,
`gameState`, and calls `resetBall`. That's all "start a new round"
work. Let's pull it out:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
}
```

Replace the contents of the `if (isKeyDown(" "))` block:

```ts
if (isKeyDown(" ")) {
  restartGame();
}
```

Save. Same behavior, cleaner code.

Notice: `restartGame` *calls* `resetBall`. Functions can call other
functions. That's how complicated programs get built — small named
pieces that fit together.

## Step 4 — Split `update` apart

The `update` function does several things. Let's split it into
two helper functions, one for the paddle and one for the ball.

Add these. Put them above `update`:

```ts
function updatePaddle(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    paddleX = paddleX - 400 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    paddleX = paddleX + 400 * dt;
  }
  if (paddleX < 0) {
    paddleX = 0;
  }
  if (paddleX > 800 - paddleWidth) {
    paddleX = 800 - paddleWidth;
  }
}

function updateBall(dt: number) {
  x = x + vx * dt;
  y = y + vy * dt;

  if (x < 0) {
    x = 0;
    vx = -vx;
    playBonk();
  }
  if (x > 800 - 30) {
    x = 800 - 30;
    vx = -vx;
    playBonk();
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
    playBonk();
  }

  if (
    x + 30 > paddleX &&
    x < paddleX + paddleWidth &&
    y + 30 > paddleY &&
    y < paddleY + paddleHeight
  ) {
    vy = -vy;
    y = paddleY - 30;
    score = score + 1;
    playBonk();
  }

  if (y > 600) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetBall();
    }
  }
}
```

Now `update` itself becomes much shorter:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  updatePaddle(dt);
  updateBall(dt);
}
```

Delete the old paddle and ball code that used to live inside
`update` — the new helper functions replaced it.

Save. **Behavior should be exactly the same.**

`update` is now five lines instead of forty, and you can read it
in a second: "if game over, handle restart and return; otherwise,
update the paddle and update the ball." The *what* is right there.
The *how* moved down into the helpers.

Scroll up to your `update` function and count the lines. That's
your win for this unit — same behavior, way easier to read.

## Step 5 — Split `draw` apart

Same idea for `draw`. Add three helpers:

```ts
function drawBall(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

function drawPaddle(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + lives, 10, 30);
  ctx.fillText("Score: " + score, 700, 30);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
}
```

(HUD is short for "heads-up display" — the lives and score that
sit on top of the game world.)

Replace the body of `draw`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}
```

Save. Same picture, much shorter `draw`.

## Step 6 — Read the file

Scroll to the top of `main.ts`. Read from top to bottom.

You should see:

1. The `import` line.
2. The variable declarations (`let x`, `let y`, …) — all the state.
3. The functions — each with a clear name.
4. The final `start(update, draw);` line.

The file *tells you what it does* just by reading function names:
`updatePaddle`, `updateBall`, `drawHud`, `drawGameOver`. You can
read `update`'s body and ignore the helpers if you're trying to
understand the big picture. You can dive into one helper if
you're trying to understand a specific piece.

That's the value of names.

::: tip Vocab: scope
You may have noticed that the helper functions use variables like
`x`, `y`, `paddleX`, `lives` that are defined *outside* them, at
the top of the file. That works because those variables live at
**module scope** — they're available everywhere in the file. A
variable declared *inside* a function (like `let foo = 5;` inside
`updateBall`) would only be available inside that function — its
scope would be local to the function.

For this game we keep almost all state at module scope. As things
get more complex, you'd often pass state as parameters instead.
That's a topic for another day.
:::

## On your own

### Challenge 1 — Notice when not to refactor

Look at the `playBonk` function. It's already its own function —
no work needed. Look at the four wall-bounce blocks. They each have
three lines that are *almost* the same (the snap-back number, the
sign-flip variable, and `playBonk()`). Could those be a single
function?

Try it. Write a function `bounceX(boundary: number)` (or similar)
and call it twice for the two x-edges. Then decide: did extracting
make the code *easier* or *harder* to read?

<details><summary>Hint</summary>

A bounce helper might look like:

```ts
function bounceX(boundary: number) {
  x = boundary;
  vx = -vx;
  playBonk();
}
```

And the callers become:

```ts
if (x < 0) bounceX(0);
if (x > 800 - 30) bounceX(800 - 30);
```

Try writing it. Decide for yourself if it's clearer. (Honest
answer: usually yes, but only barely. Two-line if blocks are at
the edge of "worth extracting.")

</details>

### Challenge 2 — A function that *returns* something

So far your functions have just *done* things. Functions can also
**return** a value — like a question with an answer.

Write a function `isGameOver()` that returns `true` if `gameState`
is `"gameOver"` and `false` otherwise. Then replace
`gameState === "gameOver"` everywhere with `isGameOver()`.

::: warning Don't use find-and-replace here
You might be tempted to use your editor's find-and-replace on
`gameState === "gameOver"`. *Don't* — the body of `isGameOver`
itself contains that exact text, and replacing it there gives you
`function isGameOver() { return isGameOver(); }`, which calls
itself forever and freezes your game when triggered. Swap each
call site by hand, or write the new function only *after* you've
swapped all the call sites.
:::

<details><summary>Hint</summary>

```ts
function isGameOver(): boolean {
  return gameState === "gameOver";
}
```

The `: boolean` after `()` says "this function returns a boolean"
(a true/false value). The `return` keyword sends a value back to
whoever called the function.

Then `if (isGameOver()) { ... }` instead of
`if (gameState === "gameOver") { ... }`.

This is *slightly* worth it — the name `isGameOver()` reads as a
question, which is nicer at the call site. The tradeoff: one more
function to keep track of. As always with refactors, judgement
call.

</details>

## What you just did

- Wrote your first functions from scratch.
- Pulled repeated code into one named place (`resetBall`).
- Split a long function (`update`) into smaller named pieces
  (`updatePaddle`, `updateBall`).
- Did the same for `draw`.
- Practiced reading code top-to-bottom and using function names as
  signposts.

New words:

- **Refactor** — change the *structure* of code without changing
  what it does.
- **Module scope** — variables declared at the top level of a file
  are available to every function in that file.
- **Return** — what a function "answers back" with. A function can
  do work and / or return a value.

## What's next

In Unit 7 we add the thing this game is named after — **bricks**.
Specifically, a single row of bricks at the top of the canvas that
the ball destroys on contact. You'll meet two big new concepts:
**arrays** (a list of things) and **loops** (running the same code
for each item in a list).
