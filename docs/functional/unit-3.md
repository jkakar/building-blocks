# Unit 3 — Time travel

The end of Unit 2 left you with a pure `tick(state, dt)` that
takes the world and returns the next world. The shape of your
game loop is now:

```ts
const next = tick(state, dt);
reactToChange(state, next);
state = next;
```

Each frame, `state` gets replaced with a brand-new object that
came out of `tick`. The old `state` object isn't *changed* —
it's just no longer pointed to by the `state` variable, so the
language eventually throws it out.

But what if we *kept* the old states instead?

You'd have a list of every state the game has been in. A photo
album of frames. And then "rewind" wouldn't be a feature you'd
have to build — it'd be a feature you already had.

That's the unit.

## What you'll learn

- How to keep a bounded **history** of past states.
- How "rewinding" is just *walking the list backward*.
- Why this works at all (and why Course 1's code can't do it).

## Step 1 — Remember every state

Open `main.ts`. Near the `let state: State = { ... };` line, add:

```ts
let history: State[] = [];
const HISTORY_MAX = 600;
```

`State[]` is an array of `State` values. We start it empty. The
`600` is "ten seconds at 60 frames per second" — about how far
back we want to be able to rewind.

Inside `update`, right before the `tick` call, push the current
state into history:

```ts
history.push(state);
if (history.length > HISTORY_MAX) {
  history.shift();
}

const next = tick(state, dt);
reactToChange(state, next);
state = next;
```

`history.push(state)` appends the current state to the end of
the array. `history.shift()` removes the *first* element if the
array has grown past 600 — that's how we keep the list from
growing forever.

Save. The game plays exactly the same. You can't *see* anything,
but in the background you're now collecting frames.

Open the browser's developer tools (`cmd + option + I` →
Console). Type:

```js
history.length
```

It steadily climbs from `0` toward `600` and then stays there.
Each entry is a frozen snapshot — a full `State` object from one
frame in the past.

::: tip Why this is cheap
Each `State` object is just nine numbers (well, eight numbers and
a string). 600 of them is a few hundred kilobytes. A browser
won't notice.

If you tried this for a game with thousands of moving things,
you'd think harder — maybe save every fifth frame, maybe save
*diffs* between frames. But for a paddle and a ball, brute force
works.
:::

**Quick check.** Look at the push line: `history.push(state);`.
If `state` were a *mutable* object that we kept poking at, what
would happen to the entries in `history`?

<details><summary>Click for the answer</summary>

They'd all be *the same object*. Every push would store a
reference to the *one* `state`, and every reference would point
to its current values. By frame 600, `history[0]` would no longer
hold the ball's starting position — it would hold whatever
`state` looks like *right now*, because both `history[0]` and
`state` would point to the same memory.

That's exactly what Course 1 couldn't do trivially. In Course 1,
"the ball's state" wasn't an object you could copy; it was eight
loose variables, and the only way to "save a snapshot" was to
write a function that copied each of the eight by hand.

Because *we* never mutate — every frame we replace `state` with a
new object — the old objects are safe. `history[0]` still holds
the state from frame 1, untouched. That's the win.

</details>

## Step 2 — Track which mode we're in

The game has two modes now — *playing forward* and *rewinding*.
You need somewhere to remember which one.

Add this near `state`:

```ts
let mode: "playing" | "rewinding" = "playing";
```

Another **union type** — `mode` is allowed to be either
`"playing"` or `"rewinding"`. TypeScript will complain if you set
it to anything else.

Why isn't this inside `State`? Because `mode` is about the *game
loop's* behavior, not the game world. The world doesn't have a
"rewinding" — the paddle and ball don't know whether time is
moving forward or backward. Only the outer loop knows.

::: tip Vocab: world data vs loop data
A useful distinction for any game: **world data** describes the
imagined situation (ball position, lives, score). **Loop data**
describes the program *running* the game (which mode you're in,
where you are in a replay, whether the dev console is open).
Mixing them in one state object is tempting but causes
exactly the kind of bug above. Keep them in separate variables
when you can.
:::

This is a real design choice. Some teams would put `mode` in the
state object. Either is defensible — but if `mode` is in the
state, then every frame *while* rewinding, you'd be saving states
that say `mode: "rewinding"`. When you re-played one of those
states later it'd be confused. Cleaner to keep the loop's mode
separate from the world's snapshots.

## Step 3 — Catch the R key

The engine in `game.ts` only knows about the arrow keys and
space. We need one more — R, to rewind. The easiest way is to
add our own keyboard hook in `main.ts`.

Add this near the top, after the keyboard-related lines:

```ts
let rDown = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") rDown = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "r" || e.key === "R") rDown = false;
});
```

You met `addEventListener` in passing inside `game.ts`. Here it
is on its own: "browser, when a key goes down, run my function."
We flip `rDown` to `true` while R (or Shift-R) is held, `false`
when it's released. (Two checks because the browser tells you
`"r"` for lower-case and `"R"` for shift-held — we accept either.)

::: tip Vocab: arrow function
The `(e) => { ... }` is an **arrow function** — a function
written without the `function` keyword and without a name. The
two forms

```ts
function onKeyDown(e: KeyboardEvent) { rDown = true; }
window.addEventListener("keydown", onKeyDown);
```

and

```ts
window.addEventListener("keydown", (e) => { rDown = true; });
```

do the same thing. The arrow form is shorter when you only need
the function in one place. Arrow functions show up all over
JavaScript; you'll write them often when handing a function to
something else (an event listener, a method that takes a
callback, etc.). For this file, that one use is enough — read
`(e) => { ... }` as "a function that takes `e` and runs the
body."
:::

The R-tracking is impure (it reads the browser, updates a
module-level variable) and that's fine — it's another seam, same
as `playBonk()`. The pure code never sees it directly.

## Step 4 — Rewind by walking backward

Now teach `update` what to do when R is held.

Change the body of `update` to look like:

```ts
function update(dt: number) {
  // Switch into rewinding while R is held.
  if (mode === "playing" && rDown && history.length > 0) {
    mode = "rewinding";
  }

  if (mode === "rewinding") {
    if (!rDown) {
      mode = "playing";
    } else if (history.length > 0) {
      state = history[history.length - 1];
      history.pop();
    }
    return;
  }

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
      history = [];
    }
    return;
  }

  history.push(state);
  if (history.length > HISTORY_MAX) {
    history.shift();
  }

  const next = tick(state, dt);
  reactToChange(state, next);
  state = next;
}
```

Read the new bits top to bottom:

- The first `if` switches into rewind mode the moment R goes
  down (if we have any history to walk back through).
- The `mode === "rewinding"` block: if R was released, switch
  back to playing. Otherwise, grab the *last* state in history,
  make *it* the current state, and pop it off the end. Next frame
  we grab the new last, and so on.
- We also clear `history = []` when restarting after game over —
  the old life's snapshots aren't useful anymore.

The frame loop never runs `tick` while rewinding. We just *read*
from history.

Save. Play the game. Hold R during a paddle bounce — the ball
flies *backward* along the same arc, your paddle slides back to
where it was, the score un-bumps when you cross a frame that had
just scored. Let go of R, the game picks up from wherever rewind
stopped.

::: tip Why this works
Each entry in `history` is a complete, frozen `State`. Setting
`state = history[i]` is enough to put the game in *exactly* the
shape it was on frame `i` — same ball position, same paddle
position, same score, same lives.

In Course 1, "going back one frame" wasn't a meaningful idea. The
state was scattered across `x`, `y`, `vx`, `vy`, `paddleX`,
`lives`, `score`, `gameState`. You'd have to remember and restore
each one. With one object, restoring is one line.

This is the *immutability payoff*: every `{ ...s, score: s.score
+ 1 }` you wrote in Unit 1 paid for this moment. They look
verbose individually. Collectively, they buy you rewind for free.
:::

## Step 5 — Add a "rewinding" overlay

A quick visual touch. Add a draw helper:

```ts
function drawMode(ctx: Ctx) {
  if (mode === "rewinding") {
    ctx.fillStyle = "yellow";
    ctx.font = "20px sans-serif";
    ctx.fillText("rewinding…", 350, 60);
  }
}
```

Call it at the end of `draw`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawHud(ctx);
  if (state.gameState === "gameOver" && mode === "playing") {
    drawGameOver(ctx);
  }
  drawMode(ctx);
}
```

(That `mode === "playing"` check stops "Game Over" from being
plastered over the screen while you're rewinding back into life.)

Save, lose a life on purpose, hold R while the ball is falling.
The "Game Over" text disappears, "rewinding…" appears, the ball
floats back up. Magic.

## Step 6 — Look at draw, briefly

You may have noticed `draw` still reads from the module-level
`state` directly. That's fine — drawing is one-way (state in,
pixels out) and that's a kind of purity all on its own.

But for consistency with `tick`, you can make the draw helpers
take a `State` argument too:

```ts
function drawBall(ctx: Ctx, s: State) {
  ctx.fillStyle = "red";
  ctx.fillRect(s.x, s.y, ballSize, ballSize);
}

function drawPaddle(ctx: Ctx, s: State) {
  ctx.fillStyle = "white";
  ctx.fillRect(s.paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawHud(ctx: Ctx, s: State) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + s.lives, 10, 30);
  ctx.fillText("Score: " + s.score, 700, 30);
}
```

Then `draw`:

```ts
function draw(ctx: Ctx) {
  drawBall(ctx, state);
  drawPaddle(ctx, state);
  drawHud(ctx, state);
  if (state.gameState === "gameOver" && mode === "playing") {
    drawGameOver(ctx);
  }
  drawMode(ctx);
}
```

Same picture, but now the draw helpers don't depend on a global
`state`. You could in theory hand them *any* state. We'll use
that in Unit 4 — replay mode wants to draw a *historical* state,
not the live one.

Save. Game still works.

## Play with it

- **Crank up the cap.** Change `HISTORY_MAX` to `6000` (a minute,
  not ten seconds). Play for thirty seconds. Hold R for *much*
  longer. The browser yawns. (You'd notice the difference in a
  bigger game.)

- **Drop the cap.** Change `HISTORY_MAX` to `60` (one second).
  Hold R — you can only rewind a second at a time. Use this if
  you want to be more careful about memory.

- **Slow rewind.** Inside the `mode === "rewinding"` block, only
  pop *every other* frame. Use a counter:

  ```ts
  let rewindCounter = 0;
  // inside the block:
  rewindCounter = rewindCounter + 1;
  if (rewindCounter % 2 === 0 && history.length > 0) {
    state = history[history.length - 1];
    history.pop();
  }
  ```

  Now the rewind plays back at half speed. Slow-motion replays
  out of the same machinery.

- **Print the gap.** In `update` (in the playing branch), add
  `console.log("history:", history.length);`. Watch it climb to
  600 and stay there. Then hold R and watch it shrink.

## On your own

### Challenge — Step back one frame

Rewind is fun, but it walks back fast. Make a **B** key that
steps back *one* frame each time you tap it. Holding it
shouldn't walk back continuously — only fresh presses count.

The trick: track presses with a flag that you *reset* each frame
after you've used it.

<details><summary>Hint 1 — A different kind of key flag</summary>

For R you used "held down right now" — `keydown` sets the flag,
`keyup` clears it. For B you want "*just* pressed" — set the
flag in `keydown`, and clear it in `update` once you've used it.
That way each press only triggers one step.

```ts
let bPressed = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "b" || e.key === "B") bPressed = true;
});
```

No `keyup` listener — we don't care when the key comes up.

</details>

<details><summary>Hint 2 — Step in update</summary>

Inside `update`, *before* the rewind-mode block, do:

```ts
if (bPressed) {
  bPressed = false;
  if (history.length > 0) {
    state = history[history.length - 1];
    history.pop();
  }
  return;
}
```

The `return` matters — you don't want to *also* run `tick` this
frame.

</details>

## Troubleshooting

**Holding R does nothing.**
Click the browser window first — it needs to be focused to get
your keystrokes. Then check that you wired up the
`addEventListener` lines, and that the spelling in `e.key` is
right (`"r"`, *not* `"R"`only — both should set the flag).

**Holding R rewinds, then "rewinding…" stays on forever.**
The "release switches back to playing" path is broken. Inside
the `mode === "rewinding"` block, you need `if (!rDown) { mode
= "playing"; }`. The `!` is "not" — so this fires when R has
been released.

**The game crashes on rewind with "Cannot read property…".**
You're trying to read past the end of `history`. Always check
`history.length > 0` before reading `history[history.length -
1]`.

**Rewinding feels like teleporting.**
Two ways this can happen. (1) Your computer is dropping frames —
the dev-tools Performance panel will tell you. (2) You're
rewinding *too far* per frame — if you accidentally wrote
`history.length - 5` instead of `- 1`, you'd jump five frames per
loop.

**`history` is full of duplicates and grows really fast.**
You probably pushed `state` *after* setting `state = next;`.
Push the *old* state before overwriting it.

## What you just did

- Kept every state in a **history** array, capped at 600 entries.
- Added a `mode` variable so `update` knows whether to compute
  the next state or read an old one.
- Used `addEventListener` directly to read the R key (the engine
  doesn't know about it).
- Made the game **rewind** by walking backward through history.

New words:

- **History** — the list of states the game has been in.
- **Mode** — what the game loop is currently doing
  (playing/rewinding).
- **The immutability payoff** — because nothing was mutated,
  every saved state is independently valid. Replay is *almost
  free*.
- **Arrow function** — `(args) => { ... }`, a function literal
  without the `function` keyword and without a name.

## What's next

In [Unit 4](/functional/unit-4) we turn rewind into a proper
**replay** feature: after Game Over, press **P** to watch the
last five seconds. Then we save the replay to the browser so it
survives a reload — your last play's final moments are still
there when you come back.
