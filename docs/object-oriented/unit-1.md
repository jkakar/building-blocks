# Unit 1 — Ball as a class

Course 1's game keeps the ball's information in four loose
variables: `x`, `y`, `vx`, `vy`. The code that moves the ball is
in `updateBall`. The code that draws it is in `drawBall`. The
state and the behavior live in different places — connected only
by reading and writing the same module-level variables.

In this unit you'll glue them together. A new word — **class** —
will let you wrap "the ball's four numbers" and "the ball's two
functions" into a single thing called `Ball`. By the end you'll
make a ball with `new Ball()` and tell it to move with
`ball.update(dt, ...)`.

## What you'll learn

- What a **class** is, and what an **instance** is.
- How to write a **constructor**, **fields**, and **methods**.
- What the word **`this`** means inside a method.
- Why bundling state and behavior into one thing makes the rest
  of your code shorter.

## Step 1 — Make a new project folder

You'll keep your Course 1 (and Course 2, if you did it) games where
they are. Course 3 lives in its own folder.

Open Zed's terminal. Run these one at a time:

```sh
mkdir ~/blocks-oo
cd ~/blocks-oo
```

You need the same four supporting files Course 1 had — the engine
(`game.ts`), the web page (`index.html`), and the two config
files (`package.json`, `tsconfig.json`). Copy them from your
Course 1 project:

```sh
cp ~/blocks/index.html ~/blocks-oo/
cp ~/blocks/package.json ~/blocks-oo/
cp ~/blocks/tsconfig.json ~/blocks-oo/
mkdir ~/blocks-oo/src
cp ~/blocks/src/game.ts ~/blocks-oo/src/
```

Then install the tools:

```sh
npm install
```

(If anything here feels rusty, [Unit 0](/procedural/unit-0) has the full
walk-through.)

Now create `src/main.ts`. We're starting from the **end of Course
1's Unit 6** — the simple paddle-and-ball game with lives, score,
and sound, but no bricks yet. (Same starting point as Course 2 — if
you did Course 2, this code will look very familiar.) Bricks come
back in Unit 2.

Open `~/blocks-oo/src/main.ts` in Zed and type in this code:

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

Open the URL it prints. You should see the paddle-and-ball game —
bounce the ball, score points, lose lives, see Game Over. Same
gameplay you've already shipped twice. From here on, the picture
on the screen won't change much — we're changing how the *code*
is shaped.

## Step 2 — What a class is

Before you write any code, the idea.

Look at the eight ball-and-paddle variables in your `main.ts`:

```ts
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;

let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;
```

Four of them are the ball. Four are the paddle. They have nothing
to do with each other, but they sit side by side because
*everything* sits in one big list at the top of the file. The
ball's *behavior* — `updateBall` and `drawBall` — lives much
further down. To answer "what is the ball, exactly?" you have to
piece it together from two different parts of the file.

A **class** is how you say "these four numbers and these two
functions are *one thing*, called a Ball." Once you've said that,
the language gives you a way to make a ball — to call the four
variables into existence as a unit, every time you need one.

::: tip Vocab: class and instance
A **class** is a *blueprint* — it says what a kind of thing looks
like and what it can do. An **instance** is a real thing made
from that blueprint.

A cookie cutter is the *class*. Each cookie you press out of the
dough is an *instance*. The cutter never appears on a plate; only
cookies do. Cookies all share the same shape (because they came
from the same cutter), but each one is its own actual cookie —
you can eat one without eating the others.

For us: `Ball` will be the class. Each ball you put in the game
is an instance.
:::

## Step 3 — Write the Ball class

In `src/`, create a new file called `ball.ts`. You're about to
type in a 30-line block with five new ideas at once. Before you
do, a heads-up on the one piece you'll see *everywhere*:

::: tip Heads-up: `this`
You'll see the word `this` on almost every line. Read it as
"the instance the method is currently being called on." Step 4
gives the full vocab; for now, when you read `this.x`, mentally
substitute "this ball's x." That's enough to follow along.
:::

Type this in:

```ts
import { Ctx } from "./game";

export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number = 30;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
  }

  update(
    dt: number,
    paddleX: number,
    paddleY: number,
    paddleWidth: number,
    paddleHeight: number,
  ) {
    this.x = this.x + this.vx * dt;
    this.y = this.y + this.vy * dt;

    if (this.x < 0) {
      this.x = 0;
      this.vx = -this.vx;
    }
    if (this.x > 800 - this.size) {
      this.x = 800 - this.size;
      this.vx = -this.vx;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy;
    }

    if (
      this.x + this.size > paddleX &&
      this.x < paddleX + paddleWidth &&
      this.y + this.size > paddleY &&
      this.y < paddleY + paddleHeight
    ) {
      this.vy = -this.vy;
      this.y = paddleY - this.size;
    }
  }

  draw(ctx: Ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
```

Save. Nothing visible has changed — `main.ts` doesn't use any of
this yet — but take a few minutes to read what you typed.

There's a lot here. Walk through it:

- `export class Ball { ... }` — opens the blueprint. Everything
  between the `{` and the `}` describes what a Ball *is* and
  what it can *do*. The `export` part lets `main.ts` import it.
- `x: number;` (and the other four lines like it) — **fields**.
  These are the variables every Ball instance carries with it.
  `size: number = 30;` gives `size` a *default* value of 30; the
  others get their values from the constructor.
- `constructor(...)` — the special method that runs when you
  *make* a new Ball. It takes some arguments and copies them
  into the fields. So `new Ball(100, 100, 200, 150)` creates a
  Ball whose `x` is 100, `y` is 100, `vx` is 200, `vy` is 150.
- `update(...)` — a **method**. A method is a function that
  lives on the class. It runs against a particular instance.
- `draw(ctx)` — another method. Same idea.

::: tip Vocab: field
A **field** is a variable that belongs to an instance. `Ball` has
five fields: `x`, `y`, `vx`, `vy`, and `size`. Each Ball instance
has its own copies — one ball can be at `x = 100` while another
is at `x = 400`. They don't share state.

Fields look like variable declarations, but they're *inside* the
class body and they don't use `let`. The shape is `name: type;`
or `name: type = defaultValue;`.
:::

::: tip Vocab: method
A **method** is a function that belongs to a class. You call it
on an instance: `ball.update(dt, ...)` calls the `update` method
on the specific ball stored in `ball`.

Methods are written without `function` (the `class` is already
saying "everything in here is part of the class"). They go
between the `{` and `}` of the class body.
:::

## Step 4 — What `this` means

The word **`this`** is everywhere in the Ball class. Every line
inside `update` and `draw` says `this.x`, `this.y`, and so on. It
deserves its own moment.

Inside a method, `this` means **"the instance the method was
called on."**

That sentence does a lot of work. Picture it: you write
`ball.update(dt, ...)`. The language takes the ball in `ball` and
*hands it to the method* as `this`. Inside `update`, `this.x` is
the ball's `x`. If you'd written `otherBall.update(dt, ...)`
instead, the same code in `update` would touch `otherBall`'s `x`,
because `this` would be `otherBall`.

That's the magic that makes one class definition usable for many
instances. The code is written once. It reaches the right
instance every time, through `this`.

::: tip Vocab: `this`
Inside a method, **`this`** refers to the instance the method
was called on. `ball.update(dt, ...)` makes `this` be `ball`.
`otherBall.update(dt, ...)` makes `this` be `otherBall`. Same
method, different `this`, different data touched.

If you forget the `this.` prefix and write `x = x + vx * dt;`,
TypeScript will complain. Inside a method, `x` by itself isn't a
field — fields are always reached through `this`.
:::

::: tip Vocab: constructor and `new`
A **constructor** is a method named `constructor`. It runs once,
when you *make* a new instance. You don't call it by name; you
call it by writing `new ClassName(args)`.

The `new` keyword does the work: it creates a fresh object,
hands it to the constructor as `this`, lets the constructor
fill in fields, then gives you back the finished instance.

`new Ball(100, 100, 200, 150)` — make a fresh Ball, set its
`x = 100`, `y = 100`, `vx = 200`, `vy = 150`, hand it back.
:::

**Quick check.** In `update`, look at the line
`this.x = this.x + this.vx * dt;`. If the ball's `vx` is `200`
and `dt` is `0.0166`, what does this line set `this.x` to?

<details><summary>Click for the answer</summary>

`this.x` ends up about `3.3` higher than it was. The right-hand
side reads the *current* `this.x`, adds `200 * 0.0166 ≈ 3.32`, and
puts that result back into `this.x`. Same arithmetic as `x = x +
vx * dt` from Course 1 — `this.` just spells out *whose* `x` and
`vx` you mean.

</details>

## Step 5 — Use the class from main.ts

Now you actually use it. Open `main.ts`. We're going to delete the
four ball variables, the `resetBall` function, and the
`updateBall` and `drawBall` functions — and replace them with one
`Ball` instance.

At the top, add an import:

```ts
import { Ball } from "./ball";
```

Then *delete* these four lines:

```ts
// Ball state
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;
```

In their place, put:

```ts
// The ball — one instance of the Ball class.
let ball = new Ball(100, 100, 200, 150);
```

Save. The page will show a TypeScript squiggle and the game won't
work yet because lots of code still mentions the old `x` / `y` /
`vx` / `vy` variables. We'll fix that next.

::: tip Why `let ball =` not `const ball =`?
`const` would be fine for keeping the ball *instance* the same
forever — and the ball's *fields* (`this.x`, `this.vy`, ...) can
still change even when the variable is `const`, because `const`
only freezes the variable itself, not what's inside it.

We use `let` because in Unit 4 we'll *replace* the ball with a
brand-new one (a list of balls, actually). For now either works.
:::

Now replace `updateBall(dt)` with a call to the method. Delete
the whole `function updateBall(dt: number) { ... }` block — it's
about 25 lines. Then change `update` to call the method instead:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  updatePaddle(dt);
  ball.update(dt, paddleX, paddleY, paddleWidth, paddleHeight);

  // The score-bump, sound, and ball-lost checks used to live in
  // updateBall. Until the rest of the game is class-based, do
  // them here.
  if (
    ball.x + ball.size > paddleX &&
    ball.x < paddleX + paddleWidth &&
    ball.y + ball.size > paddleY &&
    ball.y < paddleY + paddleHeight
  ) {
    score = score + 1;
    playBonk();
  }

  if (ball.x === 0 || ball.x === 800 - ball.size || ball.y === 0) {
    playBonk();
  }

  if (ball.y > 600) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetBall();
    }
  }
}
```

There's some duplication here (the same paddle-overlap math
appears in `Ball.update` and again in `main.ts`). We'll clean it
up in Unit 2 once the paddle is *also* a class. For this unit
we're focused on Ball.

Also replace `resetBall` so it makes a fresh ball instead of
poking variables:

```ts
function resetBall() {
  ball = new Ball(100, 100, 200, 150);
}
```

And replace `drawBall` to call the method:

```ts
function drawBall(ctx: Ctx) {
  ball.draw(ctx);
}
```

Save. Click the browser. The ball should bounce around like
always. Score climbs. Lives drop. Game over works. **Same picture
on the screen**, very different code underneath.

::: tip Reading `ball.update(dt, paddleX, paddleY, paddleWidth, paddleHeight)`
That call looks long. The reason: the Ball class needs to know
where the paddle is to do its own paddle-bounce, and right now
the paddle is still four loose variables. So we have to pass them
in one by one.

This is the *seam* between the new Ball class and the old
paddle code. It's deliberately ugly. In Unit 2 we'll make a
`Paddle` class too, and the call will collapse to
`ball.update(dt, paddle)` — pass one thing, not four.
:::

## Step 6 — Make a second ball, just to see it work

This won't stay in the game — it's a one-minute experiment so you
can *see* what an instance is.

Add a second ball just below the first one:

```ts
let ball = new Ball(100, 100, 200, 150);
let secondBall = new Ball(500, 100, -200, 120);
```

In `update`, after the first `ball.update(...)`, call the second
one's:

```ts
secondBall.update(dt, paddleX, paddleY, paddleWidth, paddleHeight);
```

In `drawBall` (or directly in `draw` — your choice), add:

```ts
secondBall.draw(ctx);
```

Save. **Two red squares are bouncing around at once.** They have
totally independent positions, velocities, and bounces. Same
class, two instances, two lives.

When you're done staring at it, *remove* the three
`secondBall` lines and save. We'll come back to multiple balls in
Unit 4 — for now we want the simpler one-ball game so we can
focus on Paddle and Brick next.

**Quick check.** Suppose `ball.x` is `400` and `secondBall.x` is
`100`. Then you call `ball.update(...)`. Inside the method,
`this.x` is updated. Whose `x` just changed?

<details><summary>Click for the answer</summary>

`ball`'s. You called the method on `ball`, so `this` *is* `ball`
inside the method body. `secondBall.x` is untouched. That's the
whole point of `this` — same code, different instance, no
crossing of wires.

</details>

## Play with it

- Change the red of the ball. In `Ball.draw`, replace
  `ctx.fillStyle = "red";` with another color name. Save. The
  ball changes color *because the change lives in one place
  now*.
- Change the ball's starting velocity in `resetBall` — try
  `new Ball(100, 100, 400, 200)`. Each new life starts faster.
- Make `size` bigger. Change the line `size: number = 30;` to
  `size: number = 50;`. Save. The ball is now bigger. Notice
  the bounce math at the right wall and the paddle still works
  — because `this.size` is used everywhere, not the magic
  number `30`.
- Add a temporary `console.log(this.x);` inside `Ball.update`,
  open the browser console (`cmd + option + I` → Console tab),
  and watch the numbers fly by. Remove it when you're done.

## On your own

### Challenge — Give the ball a color

The ball's color is hard-coded to `"red"` inside `Ball.draw`.
That's fine for one ball — but it stops being useful the moment
you want two balls in different colors (you saw this in Step 6).

Make `color` a **field** of `Ball`, like `x` and `vx`, and pass
it to the constructor. Then `Ball.draw` should use `this.color`.

Try it before peeking.

<details><summary>Hint 1 — The shape of a new field</summary>

Adding a new field is three small changes:

1. Add a declaration inside the class body, next to the other
   fields:

   ```ts
   color: string;
   ```

2. Add it to the constructor's argument list, and copy it into
   the field:

   ```ts
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
   ```

3. Use it inside `draw`:

   ```ts
   ctx.fillStyle = this.color;
   ```

</details>

<details><summary>Hint 2 — The caller has to change too</summary>

`new Ball(100, 100, 200, 150)` no longer matches the
constructor's argument list — TypeScript will complain. Add a
fifth argument:

```ts
ball = new Ball(100, 100, 200, 150, "red");
```

Update *both* places that make a Ball (`let ball =` at the top
*and* `resetBall`'s body). Try a different color in one of them
just to confirm the field is doing its job.

</details>

### Challenge — A ball that starts slower

Right now every ball starts with `vx = 200` and `vy = 150`. Make
a function `makeSlowBall()` that returns `new Ball(100, 100, 100,
75)`. Replace one of the `new Ball(...)` lines in `resetBall`
with `makeSlowBall()`. Try the game. Then make a `makeFastBall()`.

The shape of the answer is one line. The point is just to feel
that constructors are *normal function calls* — you can wrap them
in helpers like any other function.

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**Red squiggle on `new Ball(...)` — "Expected 4 arguments, but
got 5."**
You added the `color` field but only updated one of the two
`new Ball(...)` callsites. Search the file for `new Ball(` and
fix every one.

**Red squiggle on `this.x = ...` — "Cannot find name 'this'."**
Make sure the line is *inside* a method (a function body that
lives between the class's `{` and `}`). `this` only exists
inside methods.

**Red squiggle — "Property 'x' does not exist on type
'Ball'."**
You probably referred to a field that isn't declared at the top
of the class. Field declarations like `x: number;` have to
appear before the constructor — they tell TypeScript what fields
exist.

**`Cannot find module './ball'`**
Make sure you saved `ball.ts` inside `src/`, right next to
`main.ts` and `game.ts`. The path `./ball` means "the file
called `ball` right next to me."

**The ball draws but doesn't move.**
Check that you call `ball.update(dt, paddleX, paddleY,
paddleWidth, paddleHeight)` from inside `update`. If `update`
just calls `updatePaddle(dt)` and stops, the ball will be drawn
in its constructor position forever.

**Score climbs even when the ball is nowhere near the paddle.**
The paddle-overlap math in `update` has to match — `ball.x +
ball.size`, not `x + 30`. Re-read the block; the four numbers
that matter are the ball's `x`, `y`, `size`, and the paddle's
`paddleX`, `paddleY`, `paddleWidth`, `paddleHeight`.

## What you just did

- Wrote `Ball` — your first class. It has four numeric fields,
  one constructor, an `update` method, and a `draw` method.
- Made an instance of it with `new Ball(...)`.
- Saw what happens when there's more than one instance (two
  balls, two independent bounces).
- Met `this` — the way a method reaches the instance it was
  called on.

New words:

- **Class** — a blueprint that bundles state and behavior.
- **Instance** — a real thing made from a class. `new Ball(...)`
  produces an instance.
- **`new`** — the keyword that makes an instance, by running the
  class's constructor.
- **Constructor** — the special method that runs when you make
  an instance. Sets up the fields.
- **Field** — a variable that belongs to an instance.
- **Method** — a function that belongs to a class. Called on an
  instance with the dot: `ball.update(...)`.
- **`this`** — inside a method, refers to the instance the
  method was called on.

## What's next

In [Unit 2](/object-oriented/unit-2) you'll do for the paddle what you
just did for the ball — turn it into a `Paddle` class. That
cleans up the long `ball.update(dt, paddleX, paddleY,
paddleWidth, paddleHeight)` call: it becomes
`ball.update(dt, paddle)`. You'll also meet your first **`Brick`**
class — it doesn't add much to the game on its own, but it sets
up Unit 3.
