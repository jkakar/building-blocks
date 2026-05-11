# Unit 1 — State as data

Track 1's game holds the ball's information in four loose
variables — `x`, `y`, `vx`, `vy` — and pokes at them every frame:
`x = x + vx * dt;`, `vx = -vx;`, and so on. That works fine, but
it has a property worth noticing: every old value gets **thrown
away**. The instant you write `x = x + vx * dt;`, the old `x` is
gone. You can't ask "where was the ball half a second ago?"
because nobody kept that number.

This unit starts a rewrite where nothing gets thrown away. The
ball's `x` from frame 1 will *still exist* on frame 2, because
each frame's state is a separate object. By Unit 3 we'll keep
hundreds of them in a list, and Game Over will be a button you
can press to rewind.

That's the destination. First, the foundation: get all the
game's information into **one object**, and rewrite one function
to make a *new* object instead of poking at the old one.

## What you'll learn

- What a **type alias** is.
- What an **immutable** value is, and why you'd want one.
- What the **spread** operator (`...`) does.
- What a **pure function** is.

## Step 1 — Make a new project folder

You'll keep your earlier projects where they are. Track 4 lives
in its own folder.

Open Zed's terminal. Run these one at a time:

```sh
mkdir ~/blocks-fp
cd ~/blocks-fp
```

Copy the four supporting files from your Track 1 project:

```sh
cp ~/blocks/index.html ~/blocks-fp/
cp ~/blocks/package.json ~/blocks-fp/
cp ~/blocks/tsconfig.json ~/blocks-fp/
mkdir ~/blocks-fp/src
cp ~/blocks/src/game.ts ~/blocks-fp/src/
```

Install the tools:

```sh
npm install
```

(If anything feels rusty, [Unit 0](/unit-0) has the full
walk-through.)

Create `src/main.ts`. We're starting from the **end of Track 1's
Unit 6** — the simple paddle-and-ball game with lives, score, and
sound, but no bricks yet. (Same starting point as Tracks 2 and
3.) Type this in:

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

Open the URL. You should see the paddle-and-ball game from the
end of Track 1's Unit 6 — bounce the ball, score points, lose
lives, see Game Over.

From here on the picture won't change much. We're changing how
the *code* is shaped.

## Step 2 — Give the state a shape

Right now nine loose `let` variables hold the game's information.
Pretend you wanted to *take a photo* of everything the game
knows right now. You'd have to write all nine values on a
sticky note. That's annoying — they belong together.

The first move is to name that shape. Add this near the top of
`main.ts`, *above* the `let x = 100;` line:

```ts
type State = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  paddleX: number;
  lives: number;
  score: number;
  gameState: "playing" | "gameOver";
};
```

Save. The game still works exactly the same — you haven't used
`State` for anything yet. You just *named a shape*.

::: tip Vocab: type alias
A **type alias** says "wherever I write the name `State`, I mean
this shape." It doesn't create a value — there's no `State` you
can read or change. It's a label TypeScript uses to check your
code. Aliases are written with the `type` keyword:
`type Name = shape;`.

Compare to `let`, which makes a *variable* (a value that exists
at run time). A `type` declaration disappears once the program
runs — it's only there to keep you honest while you write.
:::

::: tip Vocab: union type
Look at the last field: `gameState: "playing" | "gameOver";`.
The `|` (read it "or") makes a **union type** — a type that's
*one of* a few specific values. `gameState` is allowed to be the
string `"playing"` *or* the string `"gameOver"`, and nothing
else. If you tried to set it to `"paused"`, TypeScript would
complain.

That's a tiny safety net. With a plain `string`, a typo like
`"gameOvr"` would slip through; with the union, TypeScript
catches it.
:::

Notice we didn't include `paddleY`, `paddleWidth`, `paddleHeight`,
or the ball's size in the type. Those never change during play —
they're constants, not state. We'll leave them as plain
top-level variables.

## Step 3 — One object, not nine variables

Now use it. Replace the nine `let` lines at the top with one
object that has the same fields:

Delete:

```ts
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
```

In place of all of that, put:

```ts
// Constants — never change during play.
const paddleY = 560;
const paddleWidth = 80;
const paddleHeight = 12;
const ballSize = 30;

// The whole game state, in one object.
let state: State = {
  x: 100,
  y: 100,
  vx: 200,
  vy: 150,
  paddleX: 400,
  lives: 3,
  score: 0,
  gameState: "playing",
};
```

That `let state: State = { ... };` line creates a variable called
`state`, tells TypeScript it has the shape `State`, and gives it
starting values.

Save. The game *won't work yet* — every function below still
mentions `x`, `paddleX`, `score`, etc. by their old loose names.
TypeScript will paint your file with squiggles. That's expected.

Now go through every other function and replace each loose
variable with `state.WHATEVER`. The body of `draw` becomes:

```ts
function drawBall(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(state.x, state.y, ballSize, ballSize);
}

function drawPaddle(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(state.paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + state.lives, 10, 30);
  ctx.fillText("Score: " + state.score, 700, 30);
}
```

`updatePaddle`, `updateBall`, `resetBall`, `restartGame`, and the
`update`'s game-over check all need the same treatment — `paddleX
= ...` becomes `state.paddleX = ...`, `lives - 1` becomes
`state.lives - 1`, `gameState === "gameOver"` becomes
`state.gameState === "gameOver"`, and so on.

Work through it function by function until the squiggles all go
away. The 30 in the wall-bounce math (`x > 800 - 30`) becomes
`ballSize` while you're in there.

Save. The game looks and plays exactly the same. *One object*,
the same picture.

**Quick check.** A friend says: "you just renamed everything from
`x` to `state.x` — that's not really a change." Is the game's
*behavior* different? Is its *shape* different?

<details><summary>Click for the answer</summary>

Behavior is exactly the same — the ball still bounces, the score
still climbs. But the shape *is* different in one important way:
all the game's information now lives in a single place you can
*hand to a function*. The functions still mutate that one place,
which we'll fix next, but the foundation is laid.

</details>

## Step 4 — A tiny detour: the spread operator

Before we change `updateBall` to stop mutating, you need a new
tool. Open Zed and paste this somewhere harmless (the very top of
`main.ts`, say) just to read it:

```ts
const a = { score: 0, lives: 3 };
const b = { ...a, score: 1 };
console.log(a);
console.log(b);
```

Save, look at the browser console (`cmd + option + I` → Console
tab), and read what got printed. You should see:

```
{ score: 0, lives: 3 }
{ score: 1, lives: 3 }
```

Two different objects. `a` still has `score: 0`. `b` has `score:
1` and the same `lives` as `a`. We didn't change `a` — we made a
*new* object that's a copy of `a` with one field overridden.

That's what `...a` does inside an object: "paste all of `a`'s
fields here, then I'll override the ones I list after."

::: tip Vocab: spread
The three dots `...` are the **spread operator**. Inside `{ }`,
`...a` means "spread out every field of `a` into here." If you
list more fields after, those overwrite the spread ones. The
order matters: later wins.

```ts
{ ...a, score: 1 }   // a's fields, then score becomes 1
{ score: 1, ...a }   // score 1 first, then a's fields overwrite it
```

You'll use the first form constantly. The second form is rarely
what you want.
:::

Remove that scratch code — it was just for the demo. Don't keep
it in `main.ts`.

**Quick check.** Given `const x = { a: 1, b: 2 };`, what does
`{ ...x, b: 99 }` evaluate to? And what's `x.b` afterward?

<details><summary>Click for the answer</summary>

`{ ...x, b: 99 }` is `{ a: 1, b: 99 }`. `x.b` is still `2` —
spread *copied* `x`'s fields; it didn't touch `x` itself. That
copy-then-override behavior is the whole point.

</details>

## Step 5 — Rewrite one function, the new way

We're going to change `updateBall` so it doesn't poke at `state`
anymore. Instead it'll *take a state, return a new state*. We'll
change only the ball-motion part for now (no wall bounces, no
paddle hit yet — that comes in Unit 2).

First, simplify `updateBall` down to just the motion lines so you
can see what we're doing. Find the current `updateBall` and look
at the very first two lines:

```ts
state.x = state.x + state.vx * dt;
state.y = state.y + state.vy * dt;
```

That's the move. Below it are the bounce checks and the
paddle-hit and the miss logic — leave those alone for the moment.
We'll rebuild them in Unit 2.

Add a brand new function *above* `updateBall`:

```ts
function moveBall(s: State, dt: number): State {
  return { ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt };
}
```

Read it slowly. It takes a state `s` and a time delta `dt`, and
returns a *new* state. The new state has all of `s`'s fields
(thanks to `...s`), but `x` and `y` are replaced with the
moved-forward versions. Nothing in `s` itself changes.

The `: State` after the parentheses is the function's **return
type** — it says "this function gives back something of shape
`State`." TypeScript will complain if you ever return something
that isn't.

Now use it. Inside `updateBall`, replace those first two motion
lines with:

```ts
state = moveBall(state, dt);
```

So the top of `updateBall` looks like:

```ts
function updateBall(dt: number) {
  state = moveBall(state, dt);

  if (state.x < 0) {
    // ...rest unchanged
```

Save. The ball moves exactly like before. Play a few rounds to
prove it.

What's different? In Track 1, the motion code was *changing*
`state.x` and `state.y` in place. Now `moveBall` builds a *new*
state with new `x` and `y`, hands it back, and the line `state =
moveBall(state, dt);` replaces the old state object with the new
one. The old object becomes garbage and goes away. For one frame
of work the difference doesn't matter much. By Unit 3, when we
keep every old state in a list, it'll matter enormously.

::: tip Vocab: immutability
**Immutability** means: once a value exists, nobody changes it.
The old state object that `moveBall` was given — we read its
fields, but we never wrote to them. The new state object —
`moveBall` returned it, and from there on we won't write to it
either; next frame we'll just build *yet another* new one.

The opposite is **mutation** — changing a value in place. Most of
your Track 1 code was mutation: `score = score + 1;`,
`x = x + vx * dt;`, `vy = -vy;`. All four "left side equals
something involving the same variable" patterns.

The rule for Track 4: pretend mutating an existing state is
illegal. To "change" a state, make a new one.
:::

## Step 6 — Why this is called "pure"

Look at `moveBall` again:

```ts
function moveBall(s: State, dt: number): State {
  return { ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt };
}
```

Ask yourself two questions:

1. If you called `moveBall(someState, 0.016)` twice in a row,
   would you get the same answer both times?
2. Does `moveBall` change anything *outside itself*?

The answer to both: **yes, and no.** For the same inputs you get
the same outputs, every time. And `moveBall` doesn't touch any
variable outside its own body — no `state = ...`, no
`playBonk()`, no `console.log`. Hand it inputs, get an output,
done.

A function with those two properties is called **pure**.

::: tip Vocab: pure function
A **pure function** is a function where:

- The output depends only on the inputs. Same inputs in, same
  output out. No reading the clock, no reading globals.
- There are no **side effects** — no playing sounds, no writing
  to `localStorage`, no `console.log`, no changing variables
  outside the function.

Pure functions are easy to think about, because reading the
arguments tells you *everything* the function uses. You don't
have to know what else is going on in the program.

`moveBall` is pure. `playBonk` isn't (it makes a sound).
`updateBall` (the big one in your file) isn't either — it writes
to `state`, calls `playBonk`, etc.

By the end of Unit 2, *every* `update*` function will be pure,
and the impure things will be pushed out to the edges.
:::

**Quick check.** What does this expression evaluate to, given
`const s = { score: 5, lives: 3 };`?

```ts
{ ...s, score: s.score + 1 }
```

<details><summary>Click for the answer</summary>

`{ score: 6, lives: 3 }`. `...s` pastes in `score: 5` and `lives:
3`. Then `score: s.score + 1` overrides `score` with `6`. The
original `s` is unchanged — `s.score` is still `5`.

</details>

**Quick check.** A friend writes this and is proud of it:

```ts
function updateScore(s: State): State {
  s.score = 0;
  return s;
}
```

Is `updateScore` pure?

<details><summary>Click for the answer</summary>

No. It returns `s` (good, that's a `State`), but it also *mutates
the input* on the way through — `s.score = 0;` writes to the
caller's object. Even if no other variable is touched, that
mutation is a side effect: anyone holding a reference to the same
object will see their `score` mysteriously reset.

A pure version: `return { ...s, score: 0 };`. Same return value,
no poking at the input.

</details>

## Play with it

- In `moveBall`, change `s.vx * dt` to `s.vx * dt * 2`. Save. The
  ball moves twice as fast horizontally. Notice you only had to
  change one line — there's no scattered `x = x + vx * dt;`
  anywhere else.

- Open the browser console and type:

  ```js
  console.log(state);
  ```

  You'll see the whole game's information printed as one object.
  That's the win of state-as-data — you can *see* it.

- Change the union to add a third state: `gameState: "playing" |
  "gameOver" | "paused";`. TypeScript won't complain *yet*, but
  it now allows you to set `state.gameState = "paused";` later.
  We won't use it — change it back. The point is just to feel
  what unions do.

## On your own

### Challenge — Make `updatePaddle` pure

`updateBall` still mutates `state` in lots of places — Unit 2
will rebuild it. But `updatePaddle` is short, and you can
convert it now to feel the pattern.

Right now it looks like (with `state.` in front of `paddleX`):

```ts
function updatePaddle(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    state.paddleX = state.paddleX - 400 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    state.paddleX = state.paddleX + 400 * dt;
  }
  if (state.paddleX < 0) {
    state.paddleX = 0;
  }
  if (state.paddleX > 800 - paddleWidth) {
    state.paddleX = 800 - paddleWidth;
  }
}
```

Rewrite it so it takes a state and returns a new state. The
signature should be:

```ts
function updatePaddle(s: State, dt: number): State {
  // ...
}
```

Then in `update`, replace `updatePaddle(dt)` with
`state = updatePaddle(state, dt)`.

<details><summary>Hint 1 — Use a local variable for the new paddleX</summary>

Inside the function body, don't write `s.paddleX = ...` (you'd
be mutating the input). Instead, make a local variable:

```ts
let nextX = s.paddleX;
if (isKeyDown("ArrowLeft")) {
  nextX = nextX - 400 * dt;
}
// ...
```

Then at the end, return `{ ...s, paddleX: nextX }`.

</details>

<details><summary>Hint 2 — The full shape</summary>

```ts
function updatePaddle(s: State, dt: number): State {
  let nextX = s.paddleX;
  if (isKeyDown("ArrowLeft")) {
    nextX = nextX - 400 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    nextX = nextX + 400 * dt;
  }
  if (nextX < 0) {
    nextX = 0;
  }
  if (nextX > 800 - paddleWidth) {
    nextX = 800 - paddleWidth;
  }
  return { ...s, paddleX: nextX };
}
```

Notice the function still *reads* the keyboard with `isKeyDown`,
which technically makes it *not* pure (the same inputs can give
different outputs depending on which keys are held). That's fine
for now — pure FP isn't always practical at the seams between
your game and the browser. We'll talk about it more in Unit 2.

</details>

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**Red squiggle under `state.x` or `state.paddleX`.**
You probably typed `state.X` (capital X) or forgot a comma in the
type alias. Field names are case-sensitive.

**"Property 'paddleX' does not exist on type 'State'."**
You added the field to the `let state = { ... }` but not to the
`type State = { ... }`. Both have to list the same field names.

**The ball doesn't move.**
Make sure the line in `updateBall` is
`state = moveBall(state, dt);` — *with* the `state =` in front.
Without it, you compute a new state and throw it away.

**The wall bounces use the magic number 30 instead of `ballSize`.**
That's fine — it still works. But while you're rewriting, swap
each `30` for `ballSize` so changing the ball's size is one edit.

**TypeScript says "Type '\"gameOver\"' is not assignable…"**
Check your union: `gameState: "playing" | "gameOver";`. The `|`
goes between the two string values. Quotes around each.

## What you just did

- Named the shape of the game's information with a **type alias**.
- Put nine loose variables into one **state** object.
- Met the **spread** operator and used it to build a new object
  that's a copy of the old one with one field changed.
- Wrote your first **pure function** (`moveBall`) — same inputs,
  same outputs, no side effects.
- Met the word **immutability** — the rule that says "don't change
  a value in place; make a new one."

New words:

- **Type alias** — a name for a shape, written with `type`.
- **Union type** — a type that allows one of several specific
  values, written with `|`.
- **State** — the whole bag of information that describes "where
  the game is right now."
- **Spread (`...`)** — inside `{ }`, copies all the fields of
  another object into this one; later fields overwrite earlier
  ones.
- **Immutability** — never modify a value once it exists; build a
  new one instead.
- **Pure function** — depends only on its inputs, and has no
  side effects.
- **Side effect** — anything a function does besides return a
  value: playing sounds, writing globals, logging.

## What's next

In [Unit 2](/track-4/unit-2) you'll convert *all* the
update-piece functions to the pure pattern — `updatePaddle`,
`updateBall`, `handleEdgeBounce`, `handleMiss`. Then you'll glue
them together into one `tick(state, dt)` function. That's the
shape every functional game has: a single pure function that
takes the world and returns the next world.
