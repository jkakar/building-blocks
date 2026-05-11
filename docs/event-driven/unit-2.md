# Unit 2 — Events all the way down

In Unit 1 you converted one piece of the game to use the event
bus: the paddle bounce. In this unit you'll convert the rest of
the ball's life — the three wall bounces and the moment the ball
falls past the bottom. By the end, `updateBall` will only do
*physics* — moving the ball and flipping its direction — and
emit events. Everything else (sound, score, lives) lives in
subscribers.

The payoff: a single subscriber will handle *all* the bonks. Add
a wall, you don't add a `playBonk()` call. The wall emits, the
sound subscriber hears.

## What you'll learn

- The split between **emitters** and **subscribers**.
- Why moving a feature (like sound) out of the game code can
  shrink the game code dramatically.
- That multiple subscribers can react to the same event, and you
  can choose whether to have one shared event or several.

## Step 1 — Pick up where you left off

Open `~/blocks-events` in Zed. Start the dev server:

```sh
npm run dev
```

Your `main.ts` from Unit 1 should already have:

- The `import { on, emit } from "./events";` line at the top.
- A subscriber for `"ball:paddle-hit"` that bumps the score.
- (If you did the Unit 1 challenge) a second subscriber for the
  same event that calls `playBonk()`.

If you skipped the Unit 1 challenge — that's fine. We'll fold
sound into events fully in this unit anyway.

## Step 2 — Emit on every wall bounce

There are three wall bounces in `updateBall`: left, right, and
top. Each looks like this right now (top wall shown):

```ts
if (y < 0) {
  y = 0;
  vy = -vy;
  playBonk();
}
```

Two lines are physics: snap the ball back to the wall, flip the
velocity. The `playBonk()` line is a *reaction* to a thing
happening — exactly the kind of line that wants to be an event.

Change each of the three wall-bounce blocks. Replace `playBonk();`
with `emit("ball:wall-hit");`:

```ts
if (x < 0) {
  x = 0;
  vx = -vx;
  emit("ball:wall-hit");
}
if (x > 800 - 30) {
  x = 800 - 30;
  vx = -vx;
  emit("ball:wall-hit");
}
if (y < 0) {
  y = 0;
  vy = -vy;
  emit("ball:wall-hit");
}
```

Save. Bounce the ball. Notice: the wall bounces are now **silent**
— no bonk. The paddle bounce still bonks (because its old inline
`playBonk()` may still be there, depending on whether you did the
Unit 1 challenge). Either way, there's a sound gap to fix.

Now add a subscriber. Put it next to your existing `on(...)`
subscribers near the top of `main.ts`:

```ts
on("ball:wall-hit", () => {
  playBonk();
});
```

Save. Bounce the ball. All three walls bonk again.

You just moved sound out of `updateBall` for the wall case. The
ball physics doesn't know about sound anymore.

## Step 3 — Emit when the ball is lost

The last piece of `updateBall` is the bottom-edge check:

```ts
if (y > 600) {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    resetBall();
  }
}
```

That's a *lot* of decisions for one place: decrement a life,
decide whether the game is over, reset the ball. Each of those is
a reaction to "the ball went off the bottom of the screen."

Replace the whole `if (y > 600) { ... }` block with one line:

```ts
if (y > 600) {
  emit("ball:lost");
}
```

Save. Watch what happens when the ball goes off the bottom. The
game *breaks*: the ball keeps falling, `y` keeps growing, but
lives don't drop and the ball never resets. Why? You're emitting
an event nobody is listening to. Fix that next.

## Step 4 — Subscribe to `"ball:lost"`

Add this near your other subscribers:

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

Save. The ball falls off, you lose a life, the ball resets. After
three losses the game over screen appears. Same gameplay as
before — but the *logic* now lives in a subscriber, not in the
ball's physics code.

Also: a missed ball should make a sound. Add a second subscriber
right next to that one:

```ts
on("ball:lost", () => {
  playBonk();
});
```

::: tip Multiple subscribers, same event
Two `on("ball:lost", ...)` calls? Yes — that's allowed and
useful. The bus calls them in the order they subscribed. You
could mash both bodies into one handler, but splitting them by
*responsibility* (one handler is about lives, the other is about
sound) keeps each one easier to read. Use whichever style feels
clearer at the time.
:::

## Step 5 — Read what `updateBall` looks like now

Open `updateBall` in `main.ts`. You should see something close to
this:

```ts
function updateBall(dt: number) {
  x = x + vx * dt;
  y = y + vy * dt;

  if (x < 0) {
    x = 0;
    vx = -vx;
    emit("ball:wall-hit");
  }
  if (x > 800 - 30) {
    x = 800 - 30;
    vx = -vx;
    emit("ball:wall-hit");
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
    emit("ball:wall-hit");
  }

  if (
    x + 30 > paddleX &&
    x < paddleX + paddleWidth &&
    y + 30 > paddleY &&
    y < paddleY + paddleHeight
  ) {
    vy = -vy;
    y = paddleY - 30;
    emit("ball:paddle-hit");
    playBonk(); // we'll get rid of this in the challenge
  }

  if (y > 600) {
    emit("ball:lost");
  }
}
```

That's a *physics function*. Move the ball. If it hits a wall,
snap it back and flip. If it hits the paddle, snap it on top and
flip. If it falls off, announce that.

It does not know about scores. It does not know about lives. It
does not know about game over. It does not know about anything
*outside the ball*. Every reaction lives in a subscriber.

::: tip Vocab: emitter and subscriber
The two sides of the bus have names. The code that calls `emit`
is the **emitter** (also called the *publisher*). The code that
calls `on` is the **subscriber**. The bus sits between them. The
emitter doesn't know what subscribers will do — that's the whole
point. The subscribers don't know who emitted — they only know
the event name.
:::

## Quick check

You currently have a subscriber for `"ball:wall-hit"` that plays
a bonk, and a subscriber for `"ball:lost"` that plays a bonk too.
What if you added a *third* subscriber to `"ball:wall-hit"` that
also called `playBonk()`?

<details><summary>Click for the answer</summary>

Every wall hit would play **two** bonks at once — both
`"ball:wall-hit"` subscribers would fire. (You'd probably hear
one slightly louder sound; the browser starts each tone
independently.) The bus doesn't deduplicate handlers — if you
say "subscribe me twice," you get called twice. Worth
remembering.

</details>

## Step 6 — Look at your subscribers

Scroll to the top of `main.ts`. The subscribers should all live
near the top — a little stack of `on(...)` calls.

```ts
on("ball:paddle-hit", () => {
  score = score + 1;
});
on("ball:paddle-hit", () => {
  playBonk();
});
on("ball:wall-hit", () => {
  playBonk();
});
on("ball:lost", () => {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  } else {
    resetBall();
  }
});
on("ball:lost", () => {
  playBonk();
});
```

That stack of subscribers is the **other half** of your program.
The first half is the game logic (`updatePaddle`, `updateBall`,
`update`, the draw functions). The second half is the
subscribers. They're glued together only by event names.

You could rearrange the subscribers in any order and the game
would still behave the same, *except* when two subscribers are
registered for the same event — those fire in the order they
were registered. If that order doesn't matter, you're free to
reorder. If it *does* matter (we'll see one such case in Unit 3),
you need to think about it.

## Play with it

- Comment out the `on("ball:lost", () => { playBonk(); });` line.
  Now losing a ball is *silent* and a life is still lost. The
  game-physics code didn't change.
- Add `console.log("wall hit at x=" + x);` inside the
  `"ball:wall-hit"` subscriber. Watch the Console as you play —
  you can see exactly when each wall was hit and which one.
- Change `lives = lives - 1` to `lives = lives - 2` in the
  `"ball:lost"` subscriber, just to see what happens. The game
  ends faster. Change it back.
- Try registering the *same* subscriber three times for
  `"ball:wall-hit"`. Each wall bounce should now play three
  bonks. (Confirm the "multiple subscribers fire in order" rule.)

## On your own

### Challenge — One sound for every bounce

Right now `playBonk` is called from three subscribers — paddle,
wall, and ball-lost. That's not bad, but it's three places
instead of one. Sometimes "one place" is nicer.

Add a brand-new event, `"ball:bonk"`, and arrange things so that
the *only* subscriber calling `playBonk()` is the one for
`"ball:bonk"`. Every bounce (paddle, wall, ball-lost) should
still play a sound — but the way it gets there should change.

<details><summary>Hint</summary>

There are two common ways to wire this up. **Both are valid.**
Programmers argue about which is "better." Pick whichever feels
clearer to you — being consistent matters more than the choice
itself.

**Way 1 — emit twice from the source.** Right after each
existing `emit("ball:wall-hit")` or `emit("ball:paddle-hit")`
line, also `emit("ball:bonk")`. Then a single subscriber:

```ts
on("ball:bonk", () => {
  playBonk();
});
```

**Way 2 — re-emit from a subscriber.** Keep emitting just the
specific events from the source. Have the `"ball:wall-hit"`,
`"ball:paddle-hit"`, and `"ball:lost"` subscribers each *also*
do `emit("ball:bonk")`. Then the same single sound subscriber
fires for all of them.

**Tradeoff:** Way 1 keeps subscribers small but means the
gameplay code knows about two layers of event names. Way 2
keeps the gameplay code single-purpose but builds a chain of
event-triggers-event (which can be confusing if it gets deep).

Either way, remove the three direct `playBonk()` subscribers
you had before. Only the `"ball:bonk"` subscriber should call
`playBonk()`.

</details>

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**The ball falls off the bottom and just keeps falling.**
You're emitting `"ball:lost"` but nothing is subscribed yet. Add
the `on("ball:lost", () => { ... })` block. Without a subscriber,
no life is lost and `resetBall()` is never called.

**Two bonks on every wall bounce.**
You probably have *both* the inline `playBonk()` in `updateBall`
and the `on("ball:wall-hit", ...)` subscriber. Pick one. The
event-driven version is the goal.

**No sound at all.**
Either a subscriber is missing, or the event name doesn't match
between the `emit` side and the `on` side. They have to be
character-for-character identical, including the colon and
hyphen.

**TypeScript red squiggle on `lives = lives - 1`.**
Inside an arrow function `() => { ... }`, you can still read and
write the module-scope variables defined at the top of the file.
If you see a squiggle, the function body probably has a typo —
hover the squiggle and read what TypeScript is complaining
about.

## What you just did

- Replaced three inline `playBonk()` calls in `updateBall` with
  `emit("ball:wall-hit")`, and moved sound to a single
  subscriber.
- Replaced the bottom-edge logic with a single `emit("ball:lost")`,
  moving lives/game-over handling into subscribers.
- Saw that *one event can have multiple subscribers*, and that
  the bus runs them in subscription order.
- Met the names **emitter** and **subscriber**.

New words:

- **Emitter** / **publisher** — the code that calls `emit`. It
  announces things.
- **Subscriber** — the code that called `on`. It reacts.

## What's next

In [Unit 3](/event-driven/unit-3) the *game-state* transitions —
Game Over and restart — become events too. You'll see why this is
the moment things really start to pay off: the game loop will
stop writing to `gameState` directly. And you'll learn a word for
why that matters: **decoupling**.
