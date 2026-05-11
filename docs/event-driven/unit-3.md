# Unit 3 — Game state as events

So far the ball's life is event-driven. But the game-state
transitions — Game Over and restart — still happen *inside* the
subscribers, as direct writes to `gameState`. In this unit you'll
push those last two transitions through the event bus too.

When you're done, the game loop and its subscribers will hardly
ever write to `gameState` directly. The "game is over" moment
will *be* an event. The "press space to restart" moment will *be*
an event. Anything else that wants to know about those moments —
say, the achievements module you'll write in Unit 4 — just has
to subscribe.

That property is called **decoupling**, and it's the reason
people use pub/sub.

## What you'll learn

- That state *transitions* are great candidates for events.
- The word **decoupling** — and why it makes a program easier to
  change.
- That **the order of `emit` and `on` matters at startup**.

## Step 1 — Pick up where you left off

Open `~/blocks-events`. Start the dev server:

```sh
npm run dev
```

If you did the Unit 2 challenge, your sound subscriber listens on
`"ball:bonk"` and every bouncy emit also emits `"ball:bonk"`. If
you didn't — that's fine; this unit doesn't need it.

The piece we're going to change today is the `"ball:lost"`
subscriber:

```ts
on("ball:lost", () => {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    resetBall();
  }
});
```

And this block inside `update`:

```ts
if (gameState === "gameOver") {
  if (isKeyDown(" ")) {
    restartGame();
  }
  return;
}
```

Both directly poke at `gameState` or call `restartGame`. We're
going to give those moments their own event names.

## Step 2 — Emit `"game:over"` instead of setting state

In the `"ball:lost"` subscriber, replace the line that sets
`gameState = "gameOver"` with an `emit`:

```ts
on("ball:lost", () => {
  lives = lives - 1;
  if (lives <= 0) {
    emit("game:over");
  } else {
    resetBall();
  }
});
```

Now subscribe to that event somewhere near your other
subscribers:

```ts
on("game:over", () => {
  gameState = "gameOver";
});
```

Save. Play. Lose three lives. The game-over screen should appear
just like before.

You might be thinking: "that's barely a change. I moved one line
into a subscriber." True. But notice what just became true:
**nothing else in the code writes `gameState = "gameOver"`**. If
you wanted to play a sad sound on game over, or fade the screen,
or show a stat — you'd just add another `on("game:over", ...)`
subscriber. You wouldn't need to find the place in the ball code
that ends the game. There is no such place anymore. The ball just
announces the loss; somebody else decides it's game over.

## Step 3 — Emit `"game:restart"`

The other place that writes `gameState` is the restart handler.
Currently:

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

Change `restartGame()` to an emit:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      emit("game:restart");
    }
    return;
  }
  updatePaddle(dt);
  updateBall(dt);
}
```

Save. Lose three lives, then press space. *Nothing happens* — the
game stays on the Game Over screen. We emit an event nobody's
listening to.

Add a subscriber:

```ts
on("game:restart", () => {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
});
```

(That's the body of the old `restartGame` function inlined into
the subscriber.) Save. Press space. The game restarts.

**Now delete the `restartGame` function.** It isn't called from
anywhere — the subscriber above does its job. TypeScript will
warn you that `restartGame` is unused; delete the function and
the warning goes away. Cleaning up dead code is part of every
refactor.

## Step 4 — Look at `update`

`update` should now look like this:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      emit("game:restart");
    }
    return;
  }
  updatePaddle(dt);
  updateBall(dt);
}
```

`update` *reads* `gameState` (to check if we're on the Game Over
screen) but no longer *writes* it. The only writes to
`gameState` in the whole file are inside the `"game:over"` and
`"game:restart"` subscribers — and those are the only two places
the state ever changes.

::: tip Vocab: decoupling
**Decoupling** means separating two things that used to be
connected. The ball code used to *do* a lot of jobs — physics
*and* score *and* sound *and* lives *and* game over. Now it just
emits events. The pieces that handle the consequences live
somewhere else. The ball doesn't know what "game over" *means*
anymore — only that the ball was lost.

Why does this matter? Two reasons.

1. **Smaller pieces are easier to read and change.** `updateBall`
   used to do six things; now it does one.
2. **Adding new behavior doesn't require editing existing
   behavior.** Want a sad sound on Game Over? Add an
   `on("game:over", ...)` subscriber. You don't crack open the
   ball code, the lives code, or the restart code. You don't risk
   breaking anything that already works.

Unit 4 leans on that second one *hard*.
:::

## Quick check — ordering

Imagine you wrote this in `main.ts`, in this exact order:

```ts
emit("game:over");          // line 1
on("game:over", () => {     // line 2
  gameState = "gameOver";
});
```

What happens on line 1?

<details><summary>Click for the answer</summary>

**Nothing.** `emit("game:over")` runs *before* the subscriber is
registered. The bus looks in `listeners["game:over"]`, finds
nothing, and returns. The subscriber gets registered on line 2 —
but the event already came and went.

This is why every `on(...)` call in `main.ts` should appear
*before* anything that might `emit`. In practice you do that by
grouping the subscribers near the top of the file, above
everything that the game loop runs.

Modern frameworks have ways to dodge this (like "buffered" or
"sticky" events), but in our tiny bus, ordering is your
responsibility.

</details>

## Quick check — who writes `gameState` now?

How many places in `main.ts` *write* to `gameState`? List them.

<details><summary>Click for the answer</summary>

Two. The `on("game:over", () => { ... })` handler writes
`gameState = "gameOver"`, and the `on("game:restart", () => { ... })`
handler writes `gameState = "playing"`. That's it. The whole
game's notion of "what state am I in" is funneled through two
events.

</details>

## Play with it

- Add a `console.log("game over!");` inside the `"game:over"`
  subscriber. Lose three balls. The line logs once. (Compare:
  earlier in this course, the place that "knew" about game over
  was deep inside the ball code. Now it's a labeled handler at
  the top of the file.)
- Add a `console.log("restart!");` inside the `"game:restart"`
  subscriber. Press space after Game Over. It logs.
- *Temporarily* register a second `on("game:over", ...)` that
  also resets the score to `999`. Lose three balls. The score
  jumps to 999 the moment the game ends. (That's what people mean
  when they say "extension through subscription" — you added new
  behavior at game over *without* touching the code that detects
  game over.) When you're done, remove the extra subscriber.

## On your own

### Challenge — Milestones

Add a new event called `"score:milestone"` that fires whenever
the score crosses a multiple of `10` — so 10, 20, 30, and so on.
A subscriber should react by playing a *higher-pitched* bonk to
celebrate.

You'll need to change two things:

1. The thing that updates the score (your `on("ball:paddle-hit", ...)`
   subscriber). After bumping the score, check whether the new
   score is a milestone. If it is, emit `"score:milestone"`.
2. Add a subscriber for `"score:milestone"` that plays a tone at
   a higher pitch.

<details><summary>Hint 1 — Detecting the milestone</summary>

You want to fire on the *transition* from "below a milestone" to
"at or past a milestone." One way: compute the milestone bucket
*before* you bump the score and *after*. If the bucket changed,
fire the event.

A bucket is what you get when you divide by 10 and drop the
remainder — TypeScript has `Math.floor(n / 10)` for that.

```ts
const oldBucket = Math.floor(score / 10);
score = score + 1;
const newBucket = Math.floor(score / 10);
if (newBucket > oldBucket) {
  emit("score:milestone");
}
```

If you know your score only ever grows by 1 (it does, right
now), you can do this simpler check after the increment:
`if (score % 10 === 0) emit("score:milestone");`. The bucket
math is more robust if you ever start adding *more* than 1 at
a time (like 5 points for hitting a brick), so it's worth
knowing both.

</details>

<details><summary>Hint 2 — A higher-pitched bonk</summary>

`playBonk()` makes its sound at frequency `440`. Higher numbers
make higher pitches. One approach: change `playBonk()` so it
takes an argument:

```ts
function playBonk(frequency: number) { ... }
```

and pass `440` from the existing callers and `880` from the
milestone subscriber. (You'll have to update every existing
`playBonk()` call to pass `440`.) Another approach: write a
second function `playMilestone()` that's a copy of `playBonk`
with a different frequency, and call that.

Either is fine. Decide which one feels less repetitive to you.

</details>

If a hint doesn't unstick you, ask a grown-up.

## Troubleshooting

**Pressing space doesn't restart the game.**
Make sure the `on("game:restart", ...)` subscriber exists. If
it does, check it sits *above* the `start(update, draw);` line
at the bottom — subscribers have to be registered before the
game loop starts running.

**Game-over screen never appears.**
Check that the `on("game:over", ...)` subscriber actually sets
`gameState = "gameOver"`. A typo (`"gameover"` vs `"gameOver"`)
would silently set the wrong string. Then `draw` wouldn't show
the Game Over text, because it checks `gameState === "gameOver"`
exactly.

**The game restarts the moment you lose a life.**
Probably an event-name typo — `"ball:lost"` and `"game:restart"`
got crossed somewhere. Read each `emit` and each `on` line and
make sure the names match.

**TypeScript red squiggle: `'restartGame' is declared but never used`.**
You deleted the call but not the function. Delete the function
itself — Course 2's `main.ts` no longer needs `restartGame`.

## What you just did

- Turned the "game is over" moment into an event
  (`"game:over"`) and moved the state write into a subscriber.
- Did the same for the restart moment (`"game:restart"`).
- Learned that the game loop now *reads* `gameState` but no
  longer *writes* it.
- Met the word **decoupling**: when the producer of an event
  doesn't know — and doesn't need to know — who will react to
  it.
- Saw that **the order of `on` and `emit` matters**: subscribers
  have to be registered before anyone emits.

New words:

- **Decoupling** — separating two parts so they don't directly
  depend on each other. Pub/sub is one of the simplest tools for
  it.
- **State transition** — the moment a variable like `gameState`
  changes from one value to another. Transitions make great
  events.

## What's next

[Unit 4](/event-driven/unit-4) is the payoff. You'll add a brand-new
feature — an **achievements** system that pops up "Pong Master!"
and "Untouchable!" toasts — and write it in its own file. The
game code in `main.ts` won't change to support it, except for one
single draw line. Everything else is subscribers.
