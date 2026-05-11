# Unit 1 — An event bus

This unit is the one where you meet the idea Track 2 is built
around. You'll write a tiny piece of code called an **event bus**
— a place where one part of your program can *announce* that
something happened, and another part can *listen* and react.

Then you'll convert exactly one piece of your game to use it. The
paddle-bounce currently does two things in one place: it bumps
the score and plays a sound. By the end of this unit it'll
*announce* that the paddle hit the ball, and a separate piece of
code will bump the score. Same gameplay. Different shape.

## What you'll learn

- What a **callback** is — a function you hand to another
  function so it can call yours.
- The shape of an **event bus**: `on(name, handler)` to
  subscribe, `emit(name)` to announce.
- The phrase **pub/sub** — the family name for this pattern.

## Step 1 — Make a new project folder

You'll keep your Track 1 game where it is. Track 2 lives in its
own folder so nothing collides.

Open Zed's terminal (or your Mac's Terminal). Run these one at a
time:

```sh
mkdir ~/blocks-events
cd ~/blocks-events
```

You need the same four supporting files Track 1 had — the engine
(`game.ts`), the web page (`index.html`), and the two config
files (`package.json`, `tsconfig.json`). Rather than retyping
them, copy them from your Track 1 project:

```sh
cp ~/blocks/index.html ~/blocks-events/
cp ~/blocks/package.json ~/blocks-events/
cp ~/blocks/tsconfig.json ~/blocks-events/
mkdir ~/blocks-events/src
cp ~/blocks/src/game.ts ~/blocks-events/src/
```

Then install the tools:

```sh
npm install
```

(If anything here feels rusty, [Unit 0](/unit-0) has the full
walk-through.)

Now create `src/main.ts`. We're starting from the **end of Track
1's Unit 6** — the simple paddle-and-ball game with lives, score,
and sound, but no bricks yet. Bricks add a lot of moving parts;
we'll keep them out for this track so you can focus on the new
idea.

Open `~/blocks-events/src/main.ts` in Zed and type in this code.
It's the post-Unit-6 game from Track 1:

```ts
import { start, isKeyDown, Ctx } from "./game";

// Ball state
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;

// Paddle state
let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;

// Game state
let lives = 3;
let score = 0;
let gameState = "playing";

function playBonk() {
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.frequency.value = 440;
  gain.gain.value = 0.2;
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.1);
  osc.start();
  osc.stop(audio.currentTime + 0.1);
}

function resetBall() {
  x = 100;
  y = 100;
  vx = 200;
  vy = 150;
}

function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
}

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

function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}

start(update, draw);
```

Save. In the terminal:

```sh
npm run dev
```

Open the URL it prints. You should see the paddle-and-ball game
you finished Unit 6 with: bounce the ball, score points, lose
lives, see Game Over.

If it doesn't work, jump to [Troubleshooting](#troubleshooting)
before going on. Everything from here assumes a working starting
point.

## Step 2 — Write the event bus

Now the new file. In `src/`, create `events.ts` and type this in:

```ts
let listeners: { [name: string]: ((payload: number) => void)[] } = {};

export function on(name: string, handler: (payload: number) => void) {
  if (!listeners[name]) {
    listeners[name] = [];
  }
  listeners[name].push(handler);
}

export function emit(name: string, payload: number = 0) {
  const handlers = listeners[name];
  if (!handlers) return;
  for (let i = 0; i < handlers.length; i = i + 1) {
    handlers[i](payload);
  }
}
```

That's the whole event bus. Fifteen lines.

Save the file. Nothing visible happens — nobody uses it yet. Take
a minute to read it.

The first line creates `listeners` — a place to remember every
function that wants to be told about a given event. It's keyed by
the event name. The funny part — `{ [name: string]: ... }` — is
TypeScript's way of saying "this is a lookup where the keys are
strings and the values are *arrays of functions*."

::: tip Vocab: index signature
The `{ [name: string]: ... }` shape is called an **index
signature**. Read it as: "this object can have *any* string key,
and the value at every key looks like this." A plain
`{ score: number }` says "this object has a key called `score`,
which holds a number." An index signature is the same idea but
for "the key can be any string." Two flavors of it, simpler
first:

- `{ [name: string]: number }` — a lookup where keys are strings
  and each value is a number. Like a scoreboard mapping player
  names to scores.
- `{ [name: string]: ((payload: number) => void)[] }` — same
  shape, but each value is an *array of functions*. That's what
  `listeners` is.

If the second one looks like a wall of parens, that's because it
*is* — a function-that-returns-nothing, wrapped in array
brackets. You don't need to write this from memory; you'll see
it once here and then forget it.
:::

Then two functions you'll actually call:

- `on(name, handler)` — "when something named `name` happens,
  please call my `handler` function." It looks up the bucket for
  that name (creating an empty array if there isn't one yet) and
  pushes the handler in.
- `emit(name, payload)` — "something named `name` just happened."
  It looks up the bucket and calls every handler that subscribed,
  one after the other. The `payload` is an optional number you
  can pass along to give the handlers some context.

::: tip Vocab: callback
When `emit` calls each `handler`, that handler is what
programmers call a **callback** — a function that *you* wrote and
handed to someone else, so they can *call* it *back* later. You
already used callbacks in Track 1 without naming them: every
time you call `start(update, draw)`, the engine takes your
`update` and `draw` functions and calls them every frame. They
are your callbacks. The handlers you'll hand to `on` are
callbacks too.
:::

## Step 3 — Convert one thing

Now we use the bus. We won't change the game's behavior — same
gameplay, same picture. We're just *rerouting* one decision
through the bus.

Right now, when the ball hits the paddle, `updateBall` does this:

```ts
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
```

Two of those lines are *physics*: flipping `vy` and snapping `y`
to sit on top of the paddle. Those have to be here — they're how
the ball bounces.

But the other two — `score = score + 1` and `playBonk()` — aren't
really physics. They're *reactions* to a thing that happened.

We'll move the score-bump to a subscriber. Sound stays inline for
now; you'll get to it in the challenge.

First, import `on` and `emit` at the top of `main.ts`. Change the
import lines so they read:

```ts
import { start, isKeyDown, Ctx } from "./game";
import { on, emit } from "./events";
```

Then change the paddle-collision block in `updateBall` to:

```ts
if (
  x + 30 > paddleX &&
  x < paddleX + paddleWidth &&
  y + 30 > paddleY &&
  y < paddleY + paddleHeight
) {
  vy = -vy;
  y = paddleY - 30;
  emit("ball:paddle-hit");
  playBonk();
}
```

We replaced `score = score + 1;` with `emit("ball:paddle-hit");`.
That announces the event. Nobody is listening yet, so right now
the score will stop going up.

::: tip Naming events
We named the event `"ball:paddle-hit"`. The colon is just a
convention — programmers like to put the *subject* of the event
first (ball-related events start with `ball:`), then a
description. There's no rule, but a consistent style helps when
you scroll past two dozen of them.
:::

Save. Click into the browser, bounce the ball off the paddle a
few times. The score stays at zero. That's expected — the event
fires, but nobody handles it.

## Step 4 — Subscribe

Add this near the top of `main.ts`, after the variable
declarations and before the `function playBonk` line:

```ts
on("ball:paddle-hit", () => {
  score = score + 1;
});
```

Read that out loud: "On ball paddle-hit, set score to score plus
one." `on("ball:paddle-hit", ...)` says "I want to be told when
this event fires." The thing after the comma is the function the
bus will call — the handler. `() => { ... }` is just a way to
write a function without giving it a name; it's called an *arrow
function*.

Save. Bounce the ball off the paddle. The score climbs again.

### A second subscriber

The whole point of the event bus is that *many* listeners can
react to the same event. Let's see that work. Add a second
subscriber right after the first one:

```ts
on("ball:paddle-hit", (payload) => {
  console.log("paddle hit!");
});
```

Save. Open the browser's developer tools (`cmd + option + I`) and
watch the Console tab while you play. Every paddle hit prints
"paddle hit!" — *and* the score still climbs. Two subscribers
both fired for the same event. The bus runs them in the order
they subscribed.

Remove the `console.log` subscriber when you're done — it's just
to see that multiplicity works.

::: tip Vocab: pub/sub
You just used a pattern called **pub/sub** (short for "publish /
subscribe", and also called the **event bus** pattern). The
*publisher* — the code that calls `emit` — announces that
something happened. The *subscriber* — the code that called
`on` — gets told about it and decides what to do. The publisher
doesn't know who's listening, and the subscribers don't know
who's announcing. They only know the *name* of the event.

It's one of the oldest tricks for keeping a growing program
manageable. By the end of Track 2 you'll see why.
:::

## Quick check

What would happen if you forgot the `on("ball:paddle-hit", ...)`
call and only kept the `emit("ball:paddle-hit");` line?

<details><summary>Click for the answer</summary>

The score would never go up. `emit` would still fire and the
event bus would dutifully look in its `listeners` map — find no
handlers — and return. No error, no warning, no score. Events
without subscribers are silent. (Some bugs hide here: a typo in
the event name on either side and the two sides stop matching.)

</details>

## Quick check

Look at `emit` in `events.ts`:

```ts
export function emit(name: string, payload: number = 0) {
  const handlers = listeners[name];
  if (!handlers) return;
  for (let i = 0; i < handlers.length; i = i + 1) {
    handlers[i](payload);
  }
}
```

What does the line `handlers[i](payload);` actually do?

<details><summary>Click for the answer</summary>

It *calls* the function that's stored at position `i` in the
`handlers` array, passing `payload` as the argument. `handlers`
is an array of functions, so `handlers[i]` *is* a function, and
the `()` after it calls that function. This is what makes
callbacks work: a function is just another value you can store in
a variable or an array, hand around, and call later.

</details>

## Play with it

Take a few minutes to poke at the new code:

- Change the subscriber to bump the score by `2` instead of `1`.
  Bounce the ball. The score jumps in twos. (Notice: the
  *game-physics* code didn't change. Only the subscriber did.)
- Add a `console.log("paddle hit!");` inside the subscriber. Open
  the browser's developer tools (`cmd + option + I`) and watch
  the Console tab while you play. Every paddle hit logs a line.
- Add a *second* subscriber to the same event, right after the
  first one:

  ```ts
  on("ball:paddle-hit", () => {
    console.log("hello from the second subscriber");
  });
  ```

  Both subscribers fire on the same event. The bus runs them in
  the order they subscribed.

- Change one of the `emit("ball:paddle-hit")` lines to
  `emit("ball:paddle-hit-typo")`. The score stops going up. Fix
  the typo. The score works again. The bus has no idea that
  `"ball:paddle-hit-typo"` was a mistake — to the bus, it's just
  a different event nobody's listening to.

## On your own

### Challenge — Move the bonk too

The paddle-hit case still calls `playBonk()` inline. Make sound
an event-driven thing as well — *without* removing any sound from
the game. The paddle bounce should still play a bonk.

<details><summary>Hint</summary>

You already have a subscriber registered for
`"ball:paddle-hit"`. The *minimum* change is to add a *second*
subscriber on the same event that calls `playBonk()`. You'll
also want to remove the inline `playBonk()` call inside
`updateBall` — otherwise you'd get the sound twice (once from
`updateBall`, once from your new subscriber).

Bonus thought: now `playBonk()` is triggered from a subscriber,
not from `updateBall`. What did that buy you? (Hint: think about
Unit 2, when the *wall* bounces will also want to make a sound.
You won't have to hunt down where each bounce happens — they'll
all flow through the same subscriber.)

</details>

If a hint doesn't unstick you, ask a grown-up to look at it with
you. The exercise here is reading the code you already wrote and
seeing where one more `on(...)` would fit.

## Troubleshooting

**`Cannot find module './events'`**
Make sure you saved `events.ts` inside `src/`, right next to
`main.ts` and `game.ts`. The path `./events` means "the file
called `events` right next to me."

**The score never goes up.**
Either the `on("ball:paddle-hit", ...)` line is missing, or it's
in the wrong place. It needs to run *before* the game starts. The
easiest place is near the top of `main.ts`, right after the
variable declarations. Also check the event name spelling matches
exactly on both sides of the bus — `"ball:paddle-hit"`, with the
colon and the hyphen.

**TypeScript squiggle under `on` or `emit`.**
Make sure the import line at the top of `main.ts` says
`import { on, emit } from "./events";`. Both names need to be
inside the curly braces.

**The game stops at "Game Over" forever after one loss.**
That's not new in this unit — the game was already restartable
with the space bar from Track 1. Click the browser window first
so it gets your key presses, then press space.

## What you just did

- Made a new project folder so you can build a second version of
  the game without disturbing your Track 1 one.
- Wrote `events.ts` — a tiny event bus with `on` and `emit`.
- Replaced one direct action (bumping the score) with an
  **emit**, and put the action behind a **subscriber**. Same
  behavior, new shape.
- Met the words **callback**, **pub/sub**, **emit**,
  **subscribe**, and **index signature**.

New words:

- **Event bus** — the file that knows who is listening for what.
- **Emit** — to *announce* an event. The publisher's job.
- **Subscribe** — to ask the bus to call your function when an
  event fires. The subscriber's job.
- **Callback** — a function you hand to other code so that code
  can call yours later.
- **Pub/sub** — publish/subscribe. The name for the pattern of
  one place announcing things and other places listening.
- **Arrow function** — `() => { ... }` is a function written
  without a name. Useful inline.

## What's next

In [Unit 2](/track-2/unit-2) you'll convert the rest of the ball
events — the three wall bounces and the ball-lost-the-bottom
case. The interesting bit: once those are events too, all four
"make a bonk sound" places collapse into a single subscriber.
That's the first hint at what events *buy* you.
