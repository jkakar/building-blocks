# Unit 4 — Achievements

This is the unit that makes Course 2 worth it.

You're going to add a brand-new feature — a little **achievement
system** that pops up celebration toasts on the canvas when you
hit certain milestones. "Pong Master: 10 paddle hits!" floats up
in gold lettering. "Untouchable: 10 in a row!" stacks under it.

The catch — and the point — is that you'll add this feature
**without changing the game code in `main.ts`** (except for one
single line that calls a draw function so the toasts appear on
top). The achievements logic lives in its own file. The game has
no idea it exists. It just emits the events it was already
emitting. The new file *listens* and decides.

This is what programmers mean when they say a system is
"extensible." New behavior, no surgery on old behavior.

## What you'll learn

- How to write a **standalone module** that's purely a
  subscriber.
- One concrete technique for "rendering on top": exporting a
  draw function that the main loop calls last.
- The phrase **decoupled feature** — the idea that some features
  can be added without touching the code they react to.

## Step 1 — Plan the achievements

Two achievements to start:

- **Pong Master** — earned the first time you've hit the ball
  with the paddle 10 times total (cumulative across all lives).
- **Untouchable** — earned the first time you hit the ball 10
  times *in a row without losing a life*. Lose a ball, the streak
  resets.

When earned, an achievement should show a *toast* — a little
labelled rectangle on the canvas that fades out over a few
seconds.

Both achievements need to track counters and decide when to fire.
Both need the toasts to draw on top of the game. None of that
should live in `main.ts`.

## Step 2 — Create `src/achievements.ts`

In `src/`, create a new file called `achievements.ts`. We'll
build it up in pieces. Start with the imports and the toast list:

```ts
import { on } from "./events";
import { Ctx } from "./game";

type Toast = { text: string; bornAt: number };
let toasts: Toast[] = [];

const TOAST_LIFETIME = 3; // seconds before a toast disappears

function showToast(text: string) {
  toasts.push({ text: text, bornAt: performance.now() });
}
```

A `Toast` is just two fields: the text to show and when it was
created (so we can fade it). `performance.now()` is a built-in
that returns the current time in milliseconds — handy for
"how old is this thing right now?" math.

The `type Toast = { ... }` line is new. It's how TypeScript lets
you name a shape: from now on, `Toast` means "an object with a
`text` string and a `bornAt` number."

Save. Nothing happens yet — nobody calls anything in here.

## Step 3 — Wire up the first achievement

Below `showToast`, add the counters and the first subscriber:

```ts
let paddleHits = 0;
let unlockedPongMaster = false;

on("ball:paddle-hit", () => {
  paddleHits = paddleHits + 1;
  if (!unlockedPongMaster && paddleHits >= 10) {
    unlockedPongMaster = true;
    showToast("Pong Master: 10 paddle hits!");
  }
});
```

What's happening:

- Every paddle hit, bump the counter.
- If we haven't already unlocked Pong Master *and* we've reached
  10 hits, unlock it and queue a toast.
- The `!unlockedPongMaster` check matters — without it, we'd push
  a fresh toast on hits 10, 11, 12, 13, … Once unlocked, we never
  unlock again.

::: tip Modules and module-scope state
The counters `paddleHits` and `unlockedPongMaster` live at the
top of `achievements.ts`, not inside the subscriber. That makes
them **module-scope** — available to every function in this
file, kept alive between calls. Each file is its own little
world; nothing in `main.ts` can see these variables.

This is how a standalone module keeps its own state without
leaking it back to the game.
:::

## Step 4 — Add the second achievement

The "Untouchable" achievement needs a streak counter that resets
on `"ball:lost"`. Update the `"ball:paddle-hit"` subscriber to
bump the streak too, and add a `"ball:lost"` subscriber:

```ts
let paddleHits = 0;
let paddleHitsInARow = 0;
let unlockedPongMaster = false;
let unlockedUntouchable = false;

on("ball:paddle-hit", () => {
  paddleHits = paddleHits + 1;
  paddleHitsInARow = paddleHitsInARow + 1;

  if (!unlockedPongMaster && paddleHits >= 10) {
    unlockedPongMaster = true;
    showToast("Pong Master: 10 paddle hits!");
  }
  if (!unlockedUntouchable && paddleHitsInARow >= 10) {
    unlockedUntouchable = true;
    showToast("Untouchable: 10 in a row!");
  }
});

on("ball:lost", () => {
  paddleHitsInARow = 0;
});
```

Two subscribers, four counters, two unlock guards.

Now the *game restart* case. If the player loses three lives and
restarts, we want the achievements to reset too — otherwise
"Untouchable" would already be unlocked the second time around,
which is a less satisfying game. Add one more subscriber:

```ts
on("game:restart", () => {
  paddleHits = 0;
  paddleHitsInARow = 0;
  unlockedPongMaster = false;
  unlockedUntouchable = false;
  toasts = [];
});
```

Same `"game:restart"` event the main game listens to. Both
subscribers fire on the same event. Neither knows the other
exists.

## Step 5 — Drawing the toasts

Now we need the toasts to actually appear on the canvas. Add
this at the bottom of `achievements.ts`:

```ts
export function drawAchievements(ctx: Ctx) {
  const now = performance.now();
  // Keep only toasts that are still alive.
  const alive: Toast[] = [];
  for (let i = 0; i < toasts.length; i = i + 1) {
    const age = (now - toasts[i].bornAt) / 1000;
    if (age < TOAST_LIFETIME) {
      alive.push(toasts[i]);
    }
  }
  toasts = alive;

  // Draw each surviving toast.
  for (let i = 0; i < toasts.length; i = i + 1) {
    const age = (now - toasts[i].bornAt) / 1000;
    const alpha = 1 - age / TOAST_LIFETIME;
    const y = 70 + i * 36;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#222";
    ctx.fillRect(250, y, 300, 28);
    ctx.fillStyle = "gold";
    ctx.font = "16px sans-serif";
    ctx.fillText(toasts[i].text, 260, y + 19);
    ctx.globalAlpha = 1;
  }
}
```

Two passes through `toasts`:

1. **Filter pass.** Build a new array of only the toasts that
   are still young enough. Replace the original list. (This is
   how a toast "disappears" — we throw it away.)
2. **Draw pass.** For each surviving toast, compute its age,
   convert age into alpha (1 → fully visible, 0 → invisible),
   draw a dark background rectangle and the gold text on top.
   Older toasts sit lower (`y = 70 + i * 36`).

`ctx.globalAlpha` is the canvas's transparency knob. `1` is
opaque, `0` is invisible. We set it before drawing the toast,
then put it back to `1` so the rest of the game draws at full
opacity.

The `export` keyword on `drawAchievements` is the thing that
lets `main.ts` import this function. The rest of `achievements.ts`
is *not* exported — nothing else outside the file can poke at
the counters or the toasts list. They're private to this module,
the way it should be.

## Step 6 — Plug it into `main.ts`

This is the one and only line of `main.ts` we touch this unit.

At the top of `main.ts`, with the other imports, add:

```ts
import { drawAchievements } from "./achievements";
```

Then, at the *end* of the `draw` function, after everything else,
call it:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
  drawAchievements(ctx);
}
```

Why at the end? Because we want toasts to draw *on top* of the
game world. The canvas draws like paint — the last thing drawn
sits on top of everything before it.

Save. Play. Bounce the ball 10 times. A gold "Pong Master" toast
should fade in, sit, and fade out. Bounce 10 in a row without
losing a ball: "Untouchable" too.

If both feel hard to hit, do this fast play test: edit
`achievements.ts` and temporarily change `paddleHits >= 10` to
`paddleHits >= 3`. You'll trigger the achievement immediately.
Once you've confirmed it works, change it back.

## Step 7 — Look at what just happened

Before you open `main.ts`, take a guess: how many lines in
**the game code** did you change to add achievements? Five? Two?
Ten? Hold a number in your head.

Now open `main.ts`. What actually changed?

- One new import line.
- One new line inside `draw`.

**Two lines.** That's it. The achievements feature is real,
runs every frame,
tracks counters across the whole game's lifetime, draws on
screen — and the game code didn't grow by more than two lines.
Everything else lives in `achievements.ts`, which the rest of
the program doesn't even know exists.

::: tip Vocab: decoupled feature
A **decoupled feature** is one you can add (or remove) without
editing the code it depends on. Achievements is a decoupled
feature: it depends on the events the game emits, but the game
code doesn't depend on it back. Pull `achievements.ts` out of
the project and delete that one import line — the game still
works fine, just without celebrations.

This is the second reason pub/sub is worth the bother. The
*first* reason (Unit 3) was that the game code stayed small.
The *second* is that new features get to be additive.
:::

## Quick check

Suppose you wanted a *third* achievement: "Halfway There" —
fires the moment your score reaches `5` for the first time.
Which file would you edit?

<details><summary>Click for the answer</summary>

Only `achievements.ts`. You'd add a new counter, a new flag,
either subscribe to `"ball:paddle-hit"` (and check the score
yourself — but achievements doesn't *have* the score) or, better,
emit a new event from the score subscriber in `main.ts` when the
score hits 5 — but that *would* mean changing `main.ts`.

The cleanest version: have `achievements.ts` keep its own little
"my score" counter that goes up when `"ball:paddle-hit"` fires
(since you know paddle hits give +1 score). Then it never has to
ask `main.ts` what the score is.

Either way: `main.ts`'s **game logic** doesn't change. At worst,
you add one more event emit — never a new variable, never a new
draw call (you already have `drawAchievements` set up).

</details>

## Play with it

- Drop the unlock threshold to `3` so you can see toasts more
  often while you experiment.
- Change the toast colors. Try `"red"` text on a `"black"`
  background. Try `"black"` text on `"gold"`. Find one you like.
- Change `TOAST_LIFETIME` from `3` to `8`. Toasts hang around
  much longer.
- Add a third `showToast(...)` call somewhere — for instance,
  inside the `"game:restart"` subscriber: `showToast("Game
  restarted")`. (Wait — you cleared `toasts = []` *before* the
  show. Move the show to *after* the clear, or just delete the
  clear. Notice how easy it is to read this and reason about
  what fires when.)
- Pop open `main.ts` and stare at it. Notice that *all* of
  `main.ts` looks the way it did at the end of Unit 3. The
  achievements file added itself to the side.

## On your own

### Challenge — A third achievement

Pick an idea. Some prompts to choose from:

- "Wall Crawler" — earned the first time you hit any wall 15
  times.
- "Survivor" — earned the first time you reach a score of 25.
- "Glass Cannon" — earned if you lose your *first* ball without
  hitting the paddle even once.
- Something you make up.

Add it to `achievements.ts` only. Don't touch `main.ts`.

<details><summary>Hint 1 — Which event(s) does it need?</summary>

Make a list of the events you already emit:

- `"ball:paddle-hit"`
- `"ball:wall-hit"`
- `"ball:lost"`
- `"ball:bonk"` (if you did the Unit 2 challenge)
- `"score:milestone"` (if you did the Unit 3 challenge)
- `"game:over"`
- `"game:restart"`

Which of those tell you what your achievement needs? "Wall
Crawler" wants `"ball:wall-hit"`. "Survivor" wants
`"ball:paddle-hit"` (since each is +1 to score, that's enough to
count). "Glass Cannon" needs both `"ball:paddle-hit"` (to spot a
hit) and `"ball:lost"` (to spot the loss).

</details>

<details><summary>Hint 2 — The shape of an achievement</summary>

Every achievement has three pieces:

1. A counter or flag that tracks the relevant state. (Some need
   more than one.)
2. A subscriber (or two) that updates the counter and checks the
   condition.
3. An "already unlocked" guard so the toast doesn't fire over
   and over.

Copy the shape of "Pong Master" and adapt it.

</details>

If a hint doesn't unstick you, ask a grown-up. The goal is for
you to see one feature *not* require touching another.

### Stretch — Achievements per-game vs forever

Right now `"game:restart"` resets all the counters and flags.
That makes achievements per-game. What if you wanted them
forever — so once unlocked, always unlocked?

What lines would you delete? What might that break? (Try it.
Decide which version you like better.)

## Troubleshooting

**No toast ever appears.**
Probably one of three things. (1) `drawAchievements(ctx);` is
missing from the end of `draw` in `main.ts`. (2) The unlock
threshold is higher than what you've reached — try lowering it
to `3` temporarily. (3) The subscriber in `achievements.ts`
isn't being registered because the file isn't imported. Make
sure `main.ts` has `import { drawAchievements } from "./achievements";`
at the top — importing the file is also what runs its top-level
code, including the `on(...)` calls.

**Toasts appear but never disappear.**
The "filter pass" code at the top of `drawAchievements` is what
discards old toasts. Make sure that's there and that
`TOAST_LIFETIME` is a small number (like `3`), not a huge one.

**Toasts disappear instantly.**
You probably wrote `(now - toasts[i].bornAt)` without dividing
by `1000`. `performance.now()` returns *milliseconds*; we want
*seconds*. The divide is what makes age and `TOAST_LIFETIME`
comparable.

**TypeScript squiggle: `Property 'globalAlpha' does not exist on
type 'Ctx'`.**
You probably wrote `ctx.globalalpha` (all lowercase) somewhere.
The browser is picky: it's `globalAlpha` with a capital A.

## What you just did

- Wrote `achievements.ts`, a standalone module that only
  subscribes to events.
- Added two achievements (Pong Master, Untouchable) and the
  toast-rendering code, complete with a fade-out animation.
- Added the feature to your game by changing `main.ts` by
  **two lines**: one import, one draw call.
- Met the idea of a **decoupled feature**: an extension that
  doesn't require editing the code it extends.

New words:

- **Decoupled feature** — a feature added through subscription,
  without changing the code it reacts to.
- **`performance.now()`** — a built-in clock that returns the
  current time in milliseconds. Handy for "how old?" math.
- **`globalAlpha`** — canvas's transparency knob, `0` to `1`.

## What's next

You've finished Course 2. Stop and look at what you built:

- A working brick-breaker-shaped game (paddle, ball, sound,
  lives, score, restart).
- A 15-line event bus.
- Game logic that *announces* what happened instead of *handling*
  it.
- A whole achievement system you added in its own file.

Course 3 takes the same brick-breaker and rewrites it again — this
time using **objects** and **classes**, so the ball "knows how
to update itself" and the paddle is a thing you create rather
than five separate variables. After two rewrites, you'll start to
see something subtle: there is more than one good way to
structure a program. Each course is one of those ways.
