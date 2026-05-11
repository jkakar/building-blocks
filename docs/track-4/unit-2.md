# Unit 2 — Composition

In Unit 1 you put the whole game in one `state` object and made
one tiny pure function — `moveBall(s, dt)` — that returned a new
state instead of poking at the old one. Everything else still
mutates.

In this unit you'll finish the job. By the end:

- `updatePaddle`, `updateBall`, `handleEdgeBounce`,
  `handlePaddleHit`, and `handleMiss` will all be pure: each
  takes a state, returns a new state, touches nothing else.
- A single `tick(state, dt): State` function will glue them
  together — the output of one becomes the input of the next.
- The audio and the keyboard reads stay imperative. That's a
  real, honest seam we'll talk about, not paper over.

## What you'll learn

- How to **compose** small pure functions into a bigger one by
  passing each one's output into the next.
- Why the *order* you call them in matters.
- Where impure things (sound, keyboard, save-to-disk) belong:
  *outside* the pure functions, at the edges.

## Step 1 — Carve `updateBall` into pieces

Open `main.ts`. Right now `updateBall` has four jobs:

1. Move the ball forward (`x = x + vx * dt`, `y = y + vy * dt`).
2. Bounce off three walls.
3. Bounce off the paddle, with a score bump.
4. Notice the bottom miss, lose a life, reset or game-over.

You already extracted job 1 in Unit 1 as `moveBall`. Let's
extract the rest, one pure function per job.

::: tip A naming nudge
You met `moveBall` in Unit 1 — short, clear. For the rest of this
unit we'll use `update*` and `handle*` names. Same pattern:
`update*` for "move things forward in time," `handle*` for "react
to a condition." Pick consistent names in your own code — that
choice is half the value of small functions.
:::

While we're here, rename `moveBall` to `updateBall` to match the
rest of the family. Delete the old (mutating) `updateBall` first
— we're about to replace it entirely.

So at the top of your update helpers you should have:

```ts
function updateBall(s: State, dt: number): State {
  return { ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt };
}
```

## Step 2 — `handleEdgeBounce`

Walls first. Three checks — left, right, top — each one
potentially flips a velocity and snaps the ball back to the edge.

Add this next:

```ts
function handleEdgeBounce(s: State): State {
  let x = s.x;
  let y = s.y;
  let vx = s.vx;
  let vy = s.vy;
  if (x < 0) {
    x = 0;
    vx = -vx;
  }
  if (x > 800 - ballSize) {
    x = 800 - ballSize;
    vx = -vx;
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
  }
  return { ...s, x: x, y: y, vx: vx, vy: vy };
}
```

Notice the shape: copy the four numbers we might change into
local variables, mutate the *locals* (that's fine — they're not
the input), then return a new state with the locals stitched
back in.

Two things to *not* do here:

- **Don't call `playBonk()`.** The old `updateBall` did. We're
  pulling sound out of the pure code; you'll add it back in
  Step 6, in a different place.
- **Don't write `s.vx = -s.vx;`.** That would mutate the input
  object. The locals are the safe place to do the arithmetic.

## Step 3 — `handlePaddleHit`

Paddle next. The collision test stays the same; the reaction
turns into "build a new state with `vy` flipped, `y` snapped, and
`score` bumped."

```ts
function handlePaddleHit(s: State): State {
  if (
    s.x + ballSize > s.paddleX &&
    s.x < s.paddleX + paddleWidth &&
    s.y + ballSize > paddleY &&
    s.y < paddleY + paddleHeight
  ) {
    return {
      ...s,
      vy: -s.vy,
      y: paddleY - ballSize,
      score: s.score + 1,
    };
  }
  return s;
}
```

Note the `return s;` at the bottom. When there's no paddle hit,
we just hand the same state back. That's the pure-function way
of saying "nothing to do here."

::: tip Returning the input
Returning `s` unchanged is fine — the *outside* world hasn't
been mutated. It does mean the caller might end up with the
exact same object reference, not a new one, but that's only a
problem if you start *changing* the object after the call, which
we never do.

A stricter style is `return { ...s };` (always a fresh copy).
The slight cost is an unnecessary object allocation per frame.
For our game, `return s;` is fine.
:::

## Step 4 — `handleMiss`

If the ball falls below the canvas, the player loses a life. If
they're out of lives, switch to `gameOver`. Otherwise reset the
ball.

```ts
function handleMiss(s: State): State {
  if (s.y > 600) {
    const lives = s.lives - 1;
    if (lives <= 0) {
      return { ...s, lives: 0, gameState: "gameOver" };
    }
    return { ...s, x: 100, y: 100, vx: 200, vy: 150, lives: lives };
  }
  return s;
}
```

The two return statements show off how spread + override lets you
say "same state, but with these specific changes." The branch
with `lives <= 0` switches the `gameState` field; the other
branch resets four ball fields and decrements `lives`.

Notice: the old `resetBall()` helper is *gone*. The reset is now
just a piece of `handleMiss`'s return value. You don't need a
separate function — the spread makes it cheap to express inline.

## Step 5 — Compose them into `tick`

You now have five pure pieces — `updatePaddle` from Unit 1's
challenge, plus `updateBall`, `handleEdgeBounce`,
`handlePaddleHit`, `handleMiss`. Each is pure, each takes a
state, each returns a state.

Glue them together:

```ts
function tick(s: State, dt: number): State {
  let next = s;
  next = updatePaddle(next, dt);
  next = updateBall(next, dt);
  next = handleEdgeBounce(next);
  next = handlePaddleHit(next);
  next = handleMiss(next);
  return next;
}
```

That's the *pipeline*. Each line passes the output of the
previous step in as the input of the next.

::: tip Vocab: function composition
**Composition** is the word for what `tick` is doing. You have
five small functions, and you're feeding each one's output into
the next, building up a chain. The chain is itself a function.

You can read `tick` top to bottom and see, in order, what
happens each frame: paddle moves, ball moves, ball bounces off
walls, ball maybe hits the paddle, ball maybe falls off the
bottom. Each step's *whole job* is the difference between the
state it gets and the state it returns. Bigger games have
fifteen of these — characters, projectiles, particle effects —
and the shape stays the same.
:::

The `let next = s;` line at the top might look pointless — why
not just `let next = updatePaddle(s, dt);` and start? Because
this shape makes every step look identical. Adding a new step
later is one line in the middle, not a re-shuffle.

## Step 6 — Use `tick` from `update`

Now wire `tick` into the game loop. Replace the body of `update`
so it looks like:

```ts
function update(dt: number) {
  if (state.gameState === "gameOver") {
    if (isKeyDown(" ")) {
      state = {
        x: 100,
        y: 100,
        vx: 200,
        vy: 150,
        paddleX: 400,
        lives: 3,
        score: 0,
        gameState: "playing",
      };
    }
    return;
  }

  const next = tick(state, dt);
  reactToChange(state, next);
  state = next;
}
```

Three things in the playing case: build the next state with
`tick`, react to anything that just changed (sound!), and replace
`state` with `next`. The "react" step is new — we'll write it in
a second.

The game-over branch builds a fresh starting state by spelling
out all the fields. No `restartGame()` helper anymore. The
spread isn't useful here because there's no old state we're
copying *from* — we want a brand-new world.

Delete the old `restartGame` function and the original mutating
`updatePaddle` and `updateBall` and `resetBall` — `tick` replaces
all of them now.

Save. The game plays — but **silently**. No bonks. Because we
pulled `playBonk()` out of every helper, nobody calls it
anymore.

## Step 7 — Sound at the seam

Here's the honest tradeoff with FP. The pure functions only know
how to compute "next state." But playing a sound *isn't* a state
change — it's a thing that happens in the speakers, in the world
outside our program. That makes it a **side effect**.

The cleanest trick: compute the new state purely, then *compare*
old and new and decide what side effects are warranted.

Add this function near `playBonk`:

```ts
function reactToChange(oldState: State, newState: State) {
  // Score went up -> paddle hit.
  if (newState.score > oldState.score) {
    playBonk();
    return;
  }
  // Velocity flipped -> wall bounce.
  if (newState.vx !== oldState.vx || newState.vy !== oldState.vy) {
    playBonk();
  }
}
```

Read it: "if the score just went up, bonk. Otherwise, if either
velocity just flipped, bonk." That covers all four old `playBonk`
calls (paddle hit, three wall bounces). The miss case — losing a
life — was silent in Track 1, so we leave it silent.

`reactToChange` is the *opposite* of pure: it makes noise, and it
returns nothing useful. It's where we keep the side effects on a
leash. Pure code computes the new world; impure code (here, in
`update`) compares to the old world and decides what to do.

::: tip A real tradeoff
You might notice the comparison approach isn't airtight. If `vy`
flips *and* the score goes up on the same frame, we play bonk
once (paddle hit), not twice. That's actually what we want — but
it took thought to get right. The Track 1 version was more
obvious: every place that bounced called `playBonk()` right
there.

This is the FP tradeoff in miniature: the pure code is easier to
reason about *in isolation*, but stitching the side effects back
in takes care. The kids will see this again, in bigger games and
bigger codebases. For now: the leash works, and you can read
`reactToChange` in five seconds and know what makes noise.
:::

Save. Bonks come back. The game plays exactly like before.

## Step 8 — Read the file

Scroll to the top of `main.ts` and read top to bottom. You should
see:

1. The `import` line.
2. The `type State = { ... }` shape.
3. The `let state: State = { ... }` starting state.
4. The constants (`paddleY`, `paddleWidth`, ...).
5. The pure update pieces: `updatePaddle`, `updateBall`,
   `handleEdgeBounce`, `handlePaddleHit`, `handleMiss`.
6. The composition: `tick`.
7. The impure seam: `playBonk`, `reactToChange`, and the
   `update` function that drives the loop.
8. The pure drawing helpers and `draw`.
9. `start(update, draw);`.

The middle is all pure. Sound and keyboard live at the edges. The
state object is the river that flows through every frame.

**Quick check.** What happens if you swap the order of
`updatePaddle` and `updateBall` inside `tick`?

<details><summary>Click for the answer</summary>

Almost nothing visible. Both functions read the *same* state
they're given and update one part — the paddle's `paddleX` or
the ball's `x` and `y`. Neither depends on the other yet.

What does matter is `handlePaddleHit` going *after* `updateBall`
— the ball needs to have moved before you check whether it
overlaps the paddle. Try moving `handlePaddleHit` to *before*
`updateBall` and watch: the ball can tunnel through the paddle,
because the collision check runs on the ball's *previous*
position, not its current one. Order is a real constraint when
later steps depend on earlier ones.

</details>

**Quick check.** Is `tick` a pure function?

<details><summary>Click for the answer</summary>

*Mostly* yes. It only calls other pure functions and uses its
inputs. **But** — `updatePaddle` calls `isKeyDown` inside, which
reads from the global keyboard state. Strictly, that makes
`updatePaddle` (and therefore `tick`) impure: the same inputs
can produce different outputs depending on what keys are
currently held.

The fully-pure cure is "pass the keyboard state in as a parameter
too" — `updatePaddle(s, dt, keys)`. We're choosing not to,
because plumbing a `keys` object through every function adds
clutter without much benefit at this size. Pure FP isn't always
practical at the seams between your game and the browser. The
useful version of "pure" here is: *no mutation*, and *no calls to
the audio or storage APIs*. Those rules we hold tight.

</details>

## Play with it

- Inside `tick`, **add a `console.log(next.score);`** between two
  steps. Save, bounce off the paddle a few times, and watch the
  console. You can see the score change exactly when
  `handlePaddleHit` runs — between two adjacent steps in the
  pipeline. (Remove the log when you're done.)

- Change the paddle bounce in `handlePaddleHit` to give *two*
  points per hit by changing `s.score + 1` to `s.score + 2`. One
  line, one change, no need to hunt through several files.

- In `reactToChange`, comment out the score-went-up case and play.
  Wall bounces still bonk; paddle hits don't. That's the
  leash-on-side-effects pattern: the *what to react to* lives in
  one place.

## On your own

### Challenge 1 — A separate `updateScore`

Right now the score bump lives inside `handlePaddleHit`. That's a
fine choice — paddle hits *are* what score the player — but
purely as an exercise in composition, split it out.

Make `handlePaddleHit` only handle the physics (flip `vy`, snap
`y` to sit on top of the paddle). Add a new field to `State`
called `paddleHitThisFrame: boolean`. Set it to `true` in
`handlePaddleHit` when there's a hit, `false` otherwise. Add a
new pure step `updateScore` that reads that flag and bumps the
score. Insert it into `tick`'s pipeline.

<details><summary>Hint — where each piece slots in</summary>

You'll need to:

- Add `paddleHitThisFrame: boolean;` to the `State` type and
  the starting `state` object (initial value `false`).
- In `handlePaddleHit`, set `paddleHitThisFrame: true` in the
  hit branch and `false` in the no-hit branch.
- Write `updateScore(s)` that bumps the score when the paddle
  was hit this frame. With an `if`:

  ```ts
  function updateScore(s: State): State {
    if (s.paddleHitThisFrame) {
      return { ...s, score: s.score + 1 };
    }
    return s;
  }
  ```

  (There's a one-liner version using a *ternary* —
  `s.score + (s.paddleHitThisFrame ? 1 : 0)` — but the `if`
  form reads fine and uses only what Track 1 taught.)
- Insert `next = updateScore(next);` in `tick` *after*
  `handlePaddleHit`.

Then update `reactToChange` to look at `paddleHitThisFrame`
instead of comparing scores — it's a cleaner signal.

Did the split improve things? Honest answer for this game: not
really — the score bump was already a one-liner. The point of
the exercise is *feeling* how easy it is to slot a new pure step
into the pipeline. Real games hit a point where the split is
worth it.

</details>

### Challenge 2 — Top-bonk only

Right now any wall bounce makes a bonk sound. Change
`reactToChange` so it only bonks when the ball bounces off the
*top* wall (i.e., when `vy` flipped from negative to positive).
Side walls and paddle hits stay silent.

<details><summary>Hint — read both states</summary>

You have `oldState.vy` and `newState.vy`. The top wall is when
`oldState.vy < 0` (heading up) and `newState.vy > 0` (now
heading down). Side walls flip `vx`, not `vy`.

This is a *one-line* condition. It's also a tiny example of why
the diff-based reactToChange is powerful: you can write
arbitrary "did this specific thing happen?" rules by reading
both states.

</details>

## Troubleshooting

**The ball moves but doesn't bounce.**
You probably forgot to include `handleEdgeBounce` in `tick`'s
pipeline. Check the order: paddle, ball, edges, paddle-hit,
miss.

**No sound ever.**
`reactToChange(state, next)` needs to be called *before*
`state = next;`. If you call it after, both arguments end up
being the same new state and nothing looks like it changed.

**The ball tunnels through the paddle some frames.**
`handlePaddleHit` runs *after* `updateBall` for a reason — the
collision check uses the ball's just-moved position. If you
re-ordered them, swap them back.

**The score climbs by 2 per hit.**
You probably kept the old mutating paddle-hit code below
`updateBall` *and* added the new pure `handlePaddleHit`. Both
fire each hit. Delete the old code.

**TypeScript: "Property 'paddleHitThisFrame' does not exist on
type 'State'."**
You used the new field but didn't add it to the `type State =
{ ... }`. Add it.

## What you just did

- Carved `updateBall` into four small **pure** pieces:
  `updateBall`, `handleEdgeBounce`, `handlePaddleHit`,
  `handleMiss`.
- Built **`tick`** — a single pure function that **composes**
  the pieces by feeding each one's output into the next.
- Saw why **order matters** in a composition (moving before
  collision, not after).
- Pushed sound *out* of the pure functions and into
  `reactToChange`, which compares old and new states and decides
  what to do.
- Acknowledged the **seam**: keyboard reads and audio aren't
  fully pure, and chasing them down would cost more than it
  buys.

New words:

- **Composition** — building a bigger function by feeding the
  output of one into the input of the next.
- **Pipeline** — the informal name for a chain of compositions.
- **Seam** — the place where pure code meets the outside world.

## What's next

In [Unit 3](/track-4/unit-3) you'll start *keeping* every state
your game has ever been in. A `history` array, one frozen
snapshot per frame. And then — because the snapshots are
already there — pressing **R** rewinds the game by walking
history backward. Free time-travel, paid for in advance by every
spread operator you've written.
