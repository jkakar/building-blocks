# Unit 4 — Lives and game over

In Unit 3 you got a paddle and a ball that bounces off it. But
nothing bad happens if you miss the ball — it just keeps bouncing
around forever. A real game has *stakes*. In Unit 4 you'll add:

- **3 lives.** Miss the ball, lose a life.
- A **Game Over** screen when lives run out.
- A way to **start over** with the space bar.

This is the unit where your project finally becomes recognisable as
**v0** of the brick-breaker.

## What you'll learn

- How to keep a **counter** — a variable that counts how many of
  something you have.
- How to write **text** on the canvas with `ctx.fillText`.
- A new kind of variable: one that tracks what *state* the game is
  in (a **state machine**).
- The difference between `=` and `===` in code.

## Step 1 — Add lives and show them

Add a new variable near the top of `main.ts`:

```ts
let lives = 3;
```

This is a **counter** — a variable that starts at some number and
goes down (or up) as the game runs.

Show the lives on the canvas. In `draw`, after you draw the paddle,
add:

```ts
ctx.fillStyle = "white";
ctx.font = "20px sans-serif";
ctx.fillText("Lives: " + lives, 10, 30);
```

Save. You should see `Lives: 3` in the top-left corner of the
canvas.

What's happening:

- `ctx.font = "20px sans-serif";` — set the text size (20 pixels)
  and a basic font.
- `ctx.fillText(text, x, y)` — draw text at position (x, y). The
  text is `"Lives: " + lives`, which mashes the string `"Lives: "`
  together with the *number* in `lives`. The `+` operator works
  for both adding numbers and joining strings.
- Position `(10, 30)` puts the text 10 pixels from the left and 30
  from the top.

## Step 2 — Lose a life when the ball gets past the paddle

If the ball goes below the paddle, the player missed it. Add this
near the bottom of `update`:

```ts
if (y > 600) {
  lives = lives - 1;
  x = 100;
  y = 100;
  vx = 200;
  vy = 150;
}
```

This says: "if the ball has gone below the canvas (y past 600),
lose one life and reset the ball to its starting position and
velocity."

Save. Now miss the ball — you should see `Lives: 2`. Miss again,
`Lives: 1`. And so on.

**Quick check.** What happens after `Lives: 0`?

<details><summary>Click for the answer</summary>

The game keeps running, and `lives` becomes `-1`, `-2`, `-3`, …
That's a bug. We need to *stop* the game when lives reaches zero.
That's what Step 3 is for.

</details>

## Step 3 — Game over

We need the game to know whether it's "currently playing" or
"showing the game over screen." That's what a **state machine** is:
a variable whose value tells the rest of the code which mode to
be in.

Add this near `lives`:

```ts
let gameState = "playing";
```

For now `gameState` is just a string. It can be `"playing"` or
`"gameOver"`. (We'll learn fancier ways to handle this later — a
string is plenty for now.)

Change the "ball below the paddle" code so it switches `gameState`
to `"gameOver"` when lives hit zero, instead of resetting:

```ts
if (y > 600) {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    x = 100;
    y = 100;
    vx = 200;
    vy = 150;
  }
}
```

There's a new piece here: `if (lives <= 0)` is a regular `if`, and
`else` is its companion — it runs the *other* block when the `if`
condition is false. So: if lives ran out, switch to game over;
otherwise (else), reset the ball.

Now make `update` stop doing anything when the game is over. Add
this **at the very top** of `update`:

```ts
if (gameState === "gameOver") {
  return;
}
```

`return` means "stop running this function right now." So when
`gameState` is `"gameOver"`, `update` exits immediately and skips
everything else (motion, bouncing, paddle, lives). The ball freezes
in place.

::: tip `=` vs `===`
You've been writing things like `x = 100;` — a single `=` *writes*
a value. To *compare* values you use `===` (three equal signs).
`gameState === "gameOver"` asks "is `gameState` equal to
`"gameOver"`?" It doesn't change anything; it returns `true` or
`false`. Mixing them up — using `=` where you meant `===` — is a
classic bug. Single `=` writes; triple `=` reads.
:::

Finally, draw the game over message. In `draw`, after everything
else, add:

```ts
if (gameState === "gameOver") {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
}
```

Save. Miss the ball three times — the ball freezes and a big
"Game Over" appears in the middle of the canvas.

## Step 4 — Press space to restart

A game with no way to start over is a sad game. Let the player
press the space bar to reset.

Add this inside the `if (gameState === "gameOver")` block at the
top of `update`:

```ts
if (gameState === "gameOver") {
  if (isKeyDown(" ")) {
    lives = 3;
    x = 100;
    y = 100;
    vx = 200;
    vy = 150;
    gameState = "playing";
  }
  return;
}
```

Note the key name: `" "` (a single space inside quotes) is what
`isKeyDown` calls the space bar.

Save. When the Game Over screen is showing, press space — the game
restarts with 3 lives.

::: tip Vocab: state machine
Your game now has two **states**: `"playing"` and `"gameOver"`.
The variable `gameState` says which state you're in, and your
code behaves differently in each state. That's a **state machine**
— a small set of named states, plus rules for moving between
them. You'll see state machines all over real software: a video
player is "playing" or "paused"; a button is "idle," "hovered," or
"pressed."
:::

## Step 5 — Play with it

- Change `lives = 3` to `lives = 1`. Sudden-death mode.
- Add a "you can do it!" message that appears when `lives === 1`.
- Change the Game Over font size, color, or position.
- Make the game easier by slowing the ball down (`vy = 100`).

## On your own

### Challenge 1 — Show the winner of a long run

Add a **streak counter** — count how many times in a row you've
bounced the ball off the paddle without missing. Show the current
streak on the canvas. When you lose a life, reset the streak to
zero.

<details><summary>Hint</summary>

You need a new variable like `let streak = 0;`. In the
paddle-bounce code from Unit 3, do `streak = streak + 1;`. In the
"lose a life" code, do `streak = 0;`. To show it, another
`fillText` call — somewhere it won't overlap the lives text.

</details>

### Challenge 2 — High score across rounds

Add a `bestStreak` variable that tracks the **best** streak across
all rounds played in this session. When the player loses a life,
if the current streak is bigger than `bestStreak`, update
`bestStreak`. Show it next to the current streak.

<details><summary>Hint</summary>

`bestStreak` should start at `0` and **never** get reset when the
game starts over. It outlives each round. The comparison you need
is `streak > bestStreak`.

</details>

## Troubleshooting

**The ball doesn't freeze on Game Over.**
Check that you put `return;` inside the `if (gameState === "gameOver")`
block at the top of `update`. If it's at the bottom of the function
it runs too late.

**The Game Over text overlaps weirdly with the ball.**
That's fine — you're drawing the ball before checking the state in
`draw`. You can add `if (gameState === "playing")` around the
ball-drawing code if you want a cleaner game over screen.

**Pressing space does nothing.**
Make sure your `if (isKeyDown(" "))` is *inside* the
`if (gameState === "gameOver")` block. The key name is `" "`
(quote-space-quote), not `"space"`.

## What you just did

- Added a **counter** (`lives`) that tracks a number across many
  frames.
- Wrote text on the canvas with `ctx.fillText`.
- Built a tiny **state machine** with two states (`"playing"`,
  `"gameOver"`).
- Used `===` for the first time to *compare* values (not assign
  them).
- Used `return` to exit a function early.

New words:

- **Counter** — a variable that holds a number you change over
  time (lives, score, streak, ammo, etc.).
- **State machine** — a set of named states (like `"playing"` and
  `"gameOver"`) plus rules for switching between them.
- **`===`** — the comparison operator. Reads "is equal to." Don't
  confuse it with `=`, which writes.
- **`else`** — the companion to `if`. Runs when the `if`'s
  condition is false.
- **`return`** — stops running the function immediately.

## What's next

v0 is done. In Unit 5 we'll polish it: add a **score** that goes
up on every paddle hit, and a satisfying **bonk** sound when the
ball hits anything. The game suddenly feels real.
