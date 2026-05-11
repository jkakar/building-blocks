# Unit 4 — Multi-ball

This is the unit that makes Track 3 worth it.

You're going to add a feature that, in Track 1, would have meant
copying eight variables and duplicating dozens of lines of
collision and bounce code: a **multi-ball** power-up. Every five
paddle hits, a new ball spawns. Five balls bouncing around at
once.

With the OO setup from Units 1-3, the new feature is a few lines
in `main.ts` and zero changes to the Ball class. The reason: one
ball is a Ball instance; many balls is an *array of* Ball
instances. Once you've written the class, "more of them" is
trivial.

## What you'll learn

- How to put instances in an **array** and treat them all the
  same.
- A small new syntax: **`for (const item of array)`** — a
  cleaner way to walk an array than `for (let i = 0; i <
  array.length; i++)`.
- Why "the OO version pays off when you scale up" is *not*
  marketing — you'll feel the difference between writing the
  multi-ball code now versus what it would have taken in
  Track 1.

## Step 1 — Pick up where you left off

Open `~/blocks-oo` in Zed. Start the dev server:

```sh
npm run dev
```

Your game has a paddle, a single ball, and a row of bricks (some
tough, some not). Score climbs. Lives drop. Game over works.

If you finished the Unit 3 "third brick type" challenge, your
brick row might be even fancier. That's fine — Unit 4 only
touches the ball.

## Step 2 — Give the ball a color (if you haven't yet)

Multi-ball is a lot less visible if every ball is red. The Unit 1
challenge added a `color` field to `Ball`. If you skipped that
challenge, do it now — it's worth one minute.

In `ball.ts`, add a `color` field and a constructor argument:

```ts
export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number = 30;
  color: string;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  // update method unchanged …

  draw(ctx: Ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
```

In `main.ts`, every `new Ball(...)` needs a fifth argument. For
now use `"red"` everywhere:

```ts
let ball = new Ball(100, 100, 200, 150, "red");

// And in resetBall:
function resetBall() {
  ball = new Ball(100, 100, 200, 150, "red");
}
```

Save. The game should play exactly the same — red ball, same
gameplay. We added a field; we didn't change behavior.

## Step 3 — From one ball to a list of balls

The big change. In `main.ts`, *replace* the single ball with an
array:

```ts
// Was: let ball = new Ball(100, 100, 200, 150, "red");
let balls: Ball[] = [new Ball(100, 100, 200, 150, "red")];
```

`balls` starts as a one-element array. The game-state will be:
*however many balls are in the array, right now*.

::: tip Vocab: `for ... of`
You may have already used `for (const b of bricks)` in Units 2
and 3 — it's the modern way to walk through every item in an
array.

- The Track 1 style: `for (let i = 0; i < arr.length; i = i +
  1) { const item = arr[i]; ... }`. You write the bookkeeping.
- The `for ... of` style: `for (const item of arr) { ... }`.
  No counter, no `arr[i]`, no `i < arr.length`. You just get
  each item, one after the other.

When you need the index (e.g. "the i-th ball gets color
i"), the old style is still right. When you don't, `for ... of`
is shorter and harder to typo.
:::

Now replace every `ball.update(...)` and `ball.draw(...)` in
`main.ts` with loops. `update` first:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }

  paddle.update(dt);

  // Move every ball. Each ball's update returns a report.
  const survivors: Ball[] = [];
  for (const b of balls) {
    const step = b.update(dt, paddle);
    if (step.hitPaddle) {
      score = score + 1;
      playBonk();
    }
    if (step.alive) {
      survivors.push(b);
    }
  }
  balls = survivors;

  // Ball-vs-brick collisions, one ball at a time.
  for (const b of balls) {
    for (const brick of bricks) {
      if (!brick.alive) continue;
      if (
        brick.intersects({
          x: b.x,
          y: b.y,
          width: b.size,
          height: b.size,
        })
      ) {
        b.vy = -b.vy;
        brick.onHit(bricks);
        playBonk();
        break;
      }
    }
  }

  // Ran out of balls? Lose a life.
  if (balls.length === 0) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetForNewLife();
    }
  }
}
```

And `draw`:

```ts
function draw(ctx: Ctx) {
  for (const b of balls) b.draw(ctx);
  paddle.draw(ctx);
  for (const b of bricks) b.draw(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}
```

Rename `resetBall` to `resetForNewLife` and have it rebuild the
list to a single ball:

```ts
function resetForNewLife() {
  balls = [new Ball(100, 100, 200, 150, "red")];
}
```

Don't forget to update `restartGame` to call `resetForNewLife`
instead of `resetBall`.

Save. The game should play exactly like before — *one* ball, all
the rest of the gameplay intact. Lose the ball, lose a life,
reset. Lose three lives, game over.

The reason this matters: from now on, the code already handles
*any* number of balls. It loops over `balls`, whatever's in
there. We didn't add an "if there's more than one ball, do X"
branch anywhere. The loop *is* the branch.

::: tip Building a survivor list
The `survivors` pattern is worth a moment. We *can't* remove
items from an array while we're walking it — that scrambles the
indices and we'd skip elements. The specific trap: if you write
`balls.splice(i, 1)` in the middle of a `for` loop, every item
after `i` shifts down by one, and your next iteration jumps over
the item that just slid into position `i`.

Instead, walk the original list, push the keepers into a new
array, then *replace* the original with the new array. There are
fancier ways to remove items from an array in place, but "build
a fresh list of survivors" is clear and hard to mess up.
:::

## Step 4 — Spawn a new ball every five paddle hits

Now the actual multi-ball. Add a counter at the top of
`main.ts`:

```ts
let paddleHitsSinceLastBall = 0;
const MAX_BALLS = 5;
```

Add a helper that creates an extra ball:

```ts
function spawnExtraBall() {
  if (balls.length >= MAX_BALLS) return;
  const seed = balls[0];
  const colors = ["orange", "deepskyblue", "magenta", "yellow", "lime"];
  const color = colors[balls.length % colors.length];
  balls.push(new Ball(seed.x, seed.y, -seed.vx, seed.vy, color));
}
```

Read it. There's no class-level surgery here — just an array push
and some color-picking. The `seed` line copies the first ball's
position so the new ball *visibly forks* from an existing one. We
negate `vx` so the new ball heads the *other* direction.

Hook the counter into the paddle-hit code in `update`:

```ts
if (step.hitPaddle) {
  score = score + 1;
  paddleHitsSinceLastBall = paddleHitsSinceLastBall + 1;
  playBonk();
  if (paddleHitsSinceLastBall >= 5) {
    paddleHitsSinceLastBall = 0;
    spawnExtraBall();
  }
}
```

And reset the counter when a new life starts:

```ts
function resetForNewLife() {
  balls = [new Ball(100, 100, 200, 150, "red")];
  paddleHitsSinceLastBall = 0;
}
```

Save. Click into the browser. Play.

Bounce the ball off the paddle five times. **A second ball
forks**, in a different color, heading the other way. Bounce
five more times: a third. Up to `MAX_BALLS`.

Each ball has its own position, velocity, and color. The same
collision code works for all of them. Losing all the balls
costs a life. Losing a life resets to *one* ball.

## Quick check

The line `balls.push(new Ball(seed.x, seed.y, -seed.vx, seed.vy,
color));` is the heart of multi-ball — the one line that *makes*
a new ball. Walk through it: in your head, what's the value of
`balls.length` immediately before this line runs (the very first
time you press the paddle to 5 hits)? What is it after?

<details><summary>Click for the answer</summary>

Before: `1` — you've still got just the original ball.

After: `2` — `push` appends a new element to the array, growing
its length by one. The game loop on the *next* frame walks both
balls, calling `update` and `draw` for each.

Nothing else in the program had to change to handle two balls
versus one. The loop took care of it.

</details>

## Quick check

In Track 1's Unit 2 there's a challenge: "add a second ball."
Take a minute and imagine the diff for it. How many variables
would you copy? How many lines of `updateBall` would you
duplicate? How many places in `drawBall`?

<details><summary>Click for the answer</summary>

Roughly: four new variables (`x2`, `y2`, `vx2`, `vy2`), plus a
near-duplicate of `updateBall` for the second ball (call it
`updateBall2`), plus a second call inside `draw`. To go from two
balls to three, repeat. From three to five, repeat. By
`MAX_BALLS = 5` you'd have twenty loose variables and five
nearly-identical update functions.

In the OO version, "one ball" and "five balls" are the same
code. The only difference is what's in the `balls` array. That's
the win.

</details>

## Step 5 — Read it

Open `main.ts` and read from top to bottom. Count what you can.

- Three classes total — `Paddle`, `Ball`, `Brick` — plus two
  subclasses (`ToughBrick`, maybe the one from your Unit 3
  challenge).
- One paddle instance.
- One array of balls. One array of bricks.
- An `update` function whose top-level reads like a recipe:
  paddle moves, balls move, balls collide with bricks, lose a
  life if no balls remain.
- A `draw` function that walks each list once.

The *number* of bricks, the *number* of balls, the *types* of
bricks — none of those decisions are baked into the structure of
the code. They're data in arrays. Want a level with 30 bricks?
Push more bricks into the array. Want a power-up that gives 10
balls? Crank `MAX_BALLS` and `spawnExtraBall`.

That's the OO investment paying back, one more time.

## Play with it

- Crank `MAX_BALLS` to `12`. Bounce the paddle for a while. The
  screen looks like a fireworks show.
- Drop the trigger threshold from `5` to `2`. New balls spawn
  fast. (Drop it back when you're done; 2 is too easy.)
- Change `spawnExtraBall` so the new ball gets *double* the
  speed: `new Ball(seed.x, seed.y, -seed.vx * 2, seed.vy * 2,
  color)`. The game gets wild.
- Add a `console.log(balls.length);` inside `spawnExtraBall`.
  Watch the count rise as you play. Remove when bored.
- In `Ball.update`, temporarily speed up the ball each time it
  hits a wall: `this.vx = this.vx * 1.05;` just inside the left
  wall bounce. Now each ball gradually accelerates. Try to
  juggle five of those. (Roll it back when you're done.)

## On your own

### Challenge — Spawn on a different rule

The "every 5 paddle hits" rule is fine, but it's arbitrary. Pick
a different rule and implement it. Some ideas:

- Spawn a new ball every 10 paddle hits (your call: cumulative or
  per-life).
- Spawn a new ball every time a `ToughBrick` finishes dying.
- Cap *active* balls at 3, but each time a ball is lost off the
  bottom, immediately spawn a replacement (so you have infinite
  lives until the bricks are gone).

You won't change the `Ball` class. All of these are tweaks in
`main.ts` — the *rules* live there, not in the ball.

<details><summary>Hint</summary>

For "spawn on a ToughBrick death," the place to add the logic is
right where `b.onHit(bricks)` is called in the collision loop.
Right after that, check `b.alive` (it will be `false` if the
brick just died) *and* `b instanceof ToughBrick` (it was a tough
brick). If both, `spawnExtraBall()`.

You'd need `import { ToughBrick } from "./brick";` at the top to
use `instanceof ToughBrick`.

</details>

### Stretch — Per-ball score

Right now `step.hitPaddle` bumps the score by 1 regardless of
which ball hit. What if *each ball* tracked how many paddle hits
*it* had managed?

Add a `paddleHits: number = 0;` field to `Ball`, and bump it
inside `Ball.update` when the paddle-collision fires. Then in
`main.ts`'s `update`, after `step.hitPaddle`, add the ball's
`paddleHits` to the score *as a multiplier*: a ball that's
already bounced 10 times gives more points than a fresh one.

Don't worry about getting the math beautiful — feel out how it
plays.

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**Red squiggle on `new Ball(...)` — "Expected 5 arguments, but
got 4."**
You skipped Step 2 (the color field). Either add the field to
`Ball` *and* update every `new Ball(...)` call to pass a color,
or revert your color change and stay with four arguments.

**Only one ball ever shows up.**
Either `spawnExtraBall()` isn't being called, or it's called but
the new ball is overlapping the old one (so they look like one
big sprite). Try setting `MAX_BALLS` to `3` and bouncing the
ball — you should see a fork after every five hits. If nothing
happens, add a `console.log("spawning")` inside `spawnExtraBall`
to confirm it's running.

**The game freezes when a ball is lost.**
Probably the lives logic — make sure the `if (balls.length ===
0)` block calls `resetForNewLife()` when `lives > 0`. If you
forgot the reset, `balls` stays empty forever and every frame
the game tries to lose another life.

**Balls disappear after a frame.**
The `survivors` array might be missing the `survivors.push(b);`
line, so the loop drops every ball even if it's still alive.

**`Cannot find name 'ball'`** (singular).
You renamed `ball` to `balls`. Search the file for `ball.` (with
the trailing dot) — every one of those needs to become either
`b.` inside a loop or `balls[i].` if you kept the older for
syntax somewhere. Don't replace `balls.` itself by mistake.

## What you just did

- Replaced the single `ball` variable with `balls: Ball[]`, an
  array of Ball instances.
- Wrote a `spawnExtraBall` helper that's one `balls.push(new
  Ball(...))` underneath.
- Saw multi-ball *as a feature* — five Ball instances on the
  screen at once, each independent.
- Met `for ... of` for walking through arrays.
- Saw the OO investment from Units 1-3 pay off: a substantial
  feature took a few lines in `main.ts` and no changes inside
  any class.

New words:

- **`for ... of`** — a way to walk every item in an array
  without managing an index variable.
- **Survivor list pattern** — building a new array of "things
  that should stick around" instead of removing items from the
  original mid-loop.

## What's next

You've finished Track 3. Stop and look at what you built:

- The same paddle-and-ball game you wrote in Track 1, restructured
  around classes (Paddle, Ball, Brick).
- A real use of inheritance — `ToughBrick extends Brick` —
  inside a polymorphic collision loop.
- A multi-ball power-up: five Ball instances dancing across the
  canvas, all from one `Ball` class and one array.

You've now written this game three ways: procedural (Track 1),
event-driven (Track 2), object-oriented (Track 3). Each track
emphasized a different way of organizing code. None of them is
the "right" one. Programmers use all three, sometimes in the
same project, depending on which fits the problem.

Track 4 takes the same game and rewrites it again — this time in
a **functional** style, where the whole game state lives in one
big value that gets *replaced* every frame instead of mutated.
You'll see why that opens the door to features that feel like
magic, like rewinding the game.
