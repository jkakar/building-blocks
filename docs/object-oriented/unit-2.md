# Unit 2 — Paddle and Brick classes

Unit 1 made the ball a class. The seam — `ball.update(dt,
paddleX, paddleY, paddleWidth, paddleHeight)` — still hands the
paddle in as four loose arguments, because the paddle is still
four loose variables.

In this unit you'll fix that. The paddle becomes a `Paddle` class
with its own fields and methods. The Ball's `update` will take a
*Paddle instance* instead of four numbers. And while we're here,
you'll meet a third class — `Brick` — that doesn't do much
yet, but sets up Unit 3, which is where inheritance lands.

## What you'll learn

- That a method can take *another instance* as an argument:
  `ball.update(dt, paddle)`.
- The difference between `this.x` and `paddle.x` — both are
  fields, both written the same way, but they belong to different
  instances.
- How to keep collision logic in *one* place by giving paddles
  and bricks the same shape (an `intersects` method).

## Step 1 — Pick up where you left off

Open `~/blocks-oo` in Zed. Start the dev server:

```sh
npm run dev
```

Your `main.ts` from Unit 1 should still have:

- An `import { Ball } from "./ball";` near the top.
- A `let ball = new Ball(100, 100, 200, 150);` (or with a fifth
  `color` argument if you did the Unit 1 challenge).
- Paddle state — `paddleX`, `paddleY`, `paddleWidth`,
  `paddleHeight` — still as loose variables.
- `updatePaddle` and `drawPaddle` still as standalone functions.

If anything's missing, fix it before going on.

## Step 2 — Write the Paddle class

In `src/`, create `paddle.ts`. Type this in:

```ts
import { isKeyDown, Ctx } from "./game";

export type Rect = { x: number; y: number; width: number; height: number };

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number = 400;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update(dt: number) {
    if (isKeyDown("ArrowLeft")) {
      this.x = this.x - this.speed * dt;
    }
    if (isKeyDown("ArrowRight")) {
      this.x = this.x + this.speed * dt;
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > 800 - this.width) {
      this.x = 800 - this.width;
    }
  }

  intersects(rect: Rect): boolean {
    return (
      rect.x + rect.width > this.x &&
      rect.x < this.x + this.width &&
      rect.y + rect.height > this.y &&
      rect.y < this.y + this.height
    );
  }

  draw(ctx: Ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

Save. Most of this should feel familiar from `Ball` — fields,
constructor, `update`, `draw`. Three things are new:

- `export type Rect = ...` — a *type alias*. We're saying: from
  now on, when we say `Rect`, we mean "an object with four
  numbers: `x`, `y`, `width`, and `height`." Both Paddle and (in
  the next step) Brick are rectangles, and the ball's hitbox is
  also a rectangle. Giving the shape a name lets us pass *any*
  rectangle to `intersects` — not just a paddle.
- `intersects(rect: Rect): boolean` — a method that returns
  `true` if the given rectangle overlaps this paddle. It uses
  the same four-condition math the ball-paddle collision used
  before, just written in terms of `this.x`, `this.width`, and
  the incoming `rect`.
- `speed: number = 400;` — a field with a default value. Every
  Paddle starts with `speed = 400`, and the constructor doesn't
  take a `speed` argument. (You could add one if you wanted some
  paddles faster than others. We don't, yet.)

::: tip Vocab: type alias
A `type` alias in TypeScript is a name for a *shape* — what
fields an object has. `type Rect = { x: number; y: number;
width: number; height: number; }` doesn't create a class or
make any objects. It just names a shape so you can say "this
function takes a Rect" without rewriting the four fields every
time.

Types disappear when your code runs. They only exist while
TypeScript is checking your code.
:::

## Step 3 — Use Paddle from main.ts

Open `main.ts`. Add the import:

```ts
import { Paddle } from "./paddle";
```

Delete the four paddle variables:

```ts
let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;
```

Replace them with one Paddle instance:

```ts
const paddle = new Paddle(400, 560, 80, 12);
```

(`const` is fine here — the paddle's *fields* can still change,
because `const` only locks the variable itself, not what's
inside it.)

Delete `function updatePaddle(dt: number) { ... }` entirely. The
class has that method now.

Delete `function drawPaddle(ctx: Ctx) { ... }`. Same reason.

In `update`, change `updatePaddle(dt)` to:

```ts
paddle.update(dt);
```

In `draw`, change `drawPaddle(ctx)` to:

```ts
paddle.draw(ctx);
```

Save. The game won't compile yet — lots of `paddleX` /
`paddleWidth` references are left over in `update` and in
`Ball.update`. We'll fix those next.

## Step 4 — Hand the paddle to the ball

Inside `update`, there's still some scaffolding from Unit 1 — a
manual paddle-overlap check, plus the call
`ball.update(dt, paddleX, paddleY, paddleWidth, paddleHeight)`.
We're going to clean *all* of that up.

First, change Ball's `update` method so it takes a `Paddle`
instead of four loose numbers. Open `ball.ts` and change:

```ts
import { Ctx } from "./game";
```

to:

```ts
import { Ctx } from "./game";
import { Paddle } from "./paddle";
```

Then change the `update` method's signature from:

```ts
update(
  dt: number,
  paddleX: number,
  paddleY: number,
  paddleWidth: number,
  paddleHeight: number,
) {
```

to:

```ts
update(dt: number, paddle: Paddle): { alive: boolean; hitPaddle: boolean } {
```

And rewrite its body to use `paddle.intersects(...)` and to
*return* what happened:

```ts
update(
  dt: number,
  paddle: Paddle,
): { alive: boolean; hitPaddle: boolean } {
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

  let hitPaddle = false;
  if (
    paddle.intersects({
      x: this.x,
      y: this.y,
      width: this.size,
      height: this.size,
    })
  ) {
    this.vy = -Math.abs(this.vy);
    this.y = paddle.y - this.size;
    hitPaddle = true;
  }

  if (this.y > 600) {
    return { alive: false, hitPaddle: hitPaddle };
  }
  return { alive: true, hitPaddle: hitPaddle };
}
```

Two real changes:

1. **Collision uses the paddle's own method.** Instead of
   spelling out four overlap conditions, we hand `paddle` a
   rectangle (the ball's hitbox) and let *the paddle* decide
   whether they overlap. The paddle owns its shape; nobody else
   has to know its width and height.
2. **`update` returns a report** — a small object with two
   booleans. `alive` says "the ball is still in play." `hitPaddle`
   says "the ball touched the paddle this frame." The game loop
   reads the report and decides what to do (bump score, play
   sound, drop the ball from the game).

::: tip Vocab: `Math.abs`
`Math.abs(x)` is the *absolute value* of `x` — strip the sign
off if it has one. `Math.abs(-5)` is `5`. `Math.abs(7)` is `7`.

We use it in the paddle bounce to make sure the ball always ends
up moving *up* after a paddle hit (`-Math.abs(this.vy)` is
guaranteed negative). Without it, a ball that happened to clip
the side of the paddle while already heading up could end up
flipping the wrong way.
:::

Now update `main.ts`'s `update` function to use the new method
signature and act on the report:

```ts
function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }

  paddle.update(dt);
  const step = ball.update(dt, paddle);

  if (step.hitPaddle) {
    score = score + 1;
    playBonk();
  }
  if (!step.alive) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetBall();
    }
  }
}
```

Read it once. Five lines of *what just happened* — move the
paddle, move the ball, react to the paddle hit, react to the
ball being lost. Compare it to the long `update` you had at the
end of Unit 1. This is the win of bundling state and behavior
into classes: the top-level code gets to be high-level.

Save. The game should play exactly like before.

**Quick check.** Inside the new `Ball.update`, what's the
difference between `this.x` and `paddle.x`?

<details><summary>Click for the answer</summary>

`this.x` is the *ball's* `x` (this method is being called on a
Ball instance, so `this` is the ball). `paddle.x` is the
*paddle's* `x` — we got the whole paddle instance as an argument,
and we can read its fields with the same dot we use for our own.

Both are written `something.x`. The thing before the dot tells
you whose `x` you mean. `this` means me; `paddle` means the
paddle. That's all the dot ever does — say *whose* field or
method you're reaching for.

</details>

## Step 5 — Add a single Brick

The Course 1 game we're rebuilding doesn't have bricks yet. But in
Unit 3 we want to teach **inheritance**, and inheritance is most
fun when one class extends another and changes a few things. So
we add `Brick` here, as a single brick at the top of the canvas,
even though it's a tiny gameplay feature on its own.

In `src/`, create `brick.ts`:

```ts
import { Ctx } from "./game";
import { Rect } from "./paddle";

export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  intersects(rect: Rect): boolean {
    return (
      rect.x + rect.width > this.x &&
      rect.x < this.x + this.width &&
      rect.y + rect.height > this.y &&
      rect.y < this.y + this.height
    );
  }

  onHit() {
    this.alive = false;
  }

  draw(ctx: Ctx) {
    if (!this.alive) return;
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

Save. Things to notice:

- It looks *a lot* like Paddle — same four position-and-size
  fields, same `intersects` method. That's not a coincidence —
  bricks and paddles are both rectangles. In Course 1 you'd have
  written the overlap code twice. Now you write it once per
  class. (In a moment you'll see that even *that* duplication
  can be removed, when bricks inherit from one another in Unit 3
  — but the duplication between Paddle and Brick is fine; they're
  unrelated things that happen to share a shape.)
- `alive: boolean = true;` — a brick starts alive. `onHit` flips
  it to `false`. `draw` checks `this.alive` and bails out early
  if the brick is dead, so dead bricks don't draw.
- `import { Rect } from "./paddle";` — we're reusing the `Rect`
  type we defined inside `paddle.ts`. (You could also have put
  `Rect` in its own file. Either is fine; we kept it next to
  the first place that needs it.)

## Step 6 — Add one brick to main.ts

In `main.ts`, add the import:

```ts
import { Brick } from "./brick";
```

Right after `const paddle = ...`, create a brick:

```ts
const brick = new Brick(350, 100, 100, 24);
```

In `update`, after the ball moves, add a collision check. Put
this right before the `if (!step.alive)` block:

```ts
if (
  brick.alive &&
  brick.intersects({
    x: ball.x,
    y: ball.y,
    width: ball.size,
    height: ball.size,
  })
) {
  ball.vy = -ball.vy;
  brick.onHit();
  playBonk();
}
```

In `draw`, add:

```ts
brick.draw(ctx);
```

Save. Click into the browser. There's a green brick at the top
of the canvas. Hit it with the ball. The brick disappears. The
sound plays. The ball keeps bouncing.

Notice that `brick.intersects(...)` and `paddle.intersects(...)`
do the *same job*: they both take a `Rect` and answer "do you
overlap with it?" That's because `Brick` and `Paddle` happen to
share the same shape (both are rectangles), and we wrote the
same method on both. Unit 3 is going to show you a way to *share*
that code instead of writing it twice.

## Quick check

You wrote `intersects` twice — once inside `Paddle`, once inside
`Brick`. The bodies are identical. Why isn't that a refactoring
emergency?

<details><summary>Click for the answer</summary>

Two reasons. **First**, it's only two copies — not yet painful.
Three or more would be. **Second**, Paddle and Brick aren't
really the same *kind of thing*; they just happen to both be
rectangles. Sharing code between unrelated classes can make code
harder to follow, not easier.

That said: there *is* a reasonable way to share `intersects`,
and you'll see it in Unit 3 — between Brick and ToughBrick, two
classes that genuinely *are* related (they're both bricks).
Sharing within a family is what inheritance is for. Sharing
across families is a different conversation.

</details>

## Play with it

- Move the brick. Change `new Brick(350, 100, 100, 24)` to
  `new Brick(200, 200, 100, 24)`. The brick lives elsewhere now.
- Make the brick a different color. In `Brick.draw`, change
  `"#4caf50"` to `"orange"` or any other color.
- Make the brick *tall*. Change `24` to `60` in the constructor
  call. The hitbox grows automatically.
- Change `speed` on the paddle to be faster *for one specific
  paddle instance*: after `const paddle = new Paddle(...)`, add
  `paddle.speed = 800;`. Save. The paddle now zips. (You can
  change fields from outside the class, the same way you read
  them — `paddle.speed` is just a name.)

## On your own

### Challenge — Two bricks

Add a *second* brick. Two `new Brick(...)` calls, two draw calls,
two collision checks.

It's a deliberately small challenge — the point is to feel how
trivial "another instance" is once you have a class. You should
spend more time picking pixel positions than writing code.

<details><summary>Hint</summary>

The collision check is the line that grows. You can either copy
the whole `if (brick.intersects(...))` block once per brick (it
gets repetitive), or put the bricks in an *array* and loop:

```ts
const bricks = [
  new Brick(200, 100, 100, 24),
  new Brick(500, 100, 100, 24),
];

// In update, replace the single brick check with:
for (const b of bricks) {
  if (
    b.alive &&
    b.intersects({
      x: ball.x,
      y: ball.y,
      width: ball.size,
      height: ball.size,
    })
  ) {
    ball.vy = -ball.vy;
    b.onHit();
    playBonk();
    break;
  }
}

// And in draw:
for (const b of bricks) b.draw(ctx);
```

The `break` after the brick gets hit means "stop looking, we
found one." Without it the ball could destroy two bricks in one
frame, which usually isn't what you want.

If the `for (const b of bricks)` syntax is new — `for ... of`
is the modern way to walk through every item in an array
without doing the `i < bricks.length` bookkeeping yourself.
Unit 4 will use it a lot.

</details>

### Challenge — A paddle constructor with speed

Right now `speed` is a hard-coded `400` in Paddle. Add `speed`
to the constructor's argument list so you can make a slow paddle
and a fast paddle.

<details><summary>Hint</summary>

Three changes, exactly like the `color` challenge in Unit 1:

1. The constructor takes a fifth argument:

   ```ts
   constructor(
     x: number,
     y: number,
     width: number,
     height: number,
     speed: number,
   ) {
     this.x = x;
     this.y = y;
     this.width = width;
     this.height = height;
     this.speed = speed;
   }
   ```

2. The field declaration drops its default value, or keeps it
   (either works):

   ```ts
   speed: number;
   ```

3. The caller passes a speed:

   ```ts
   const paddle = new Paddle(400, 560, 80, 12, 400);
   ```

Try `200` for a slow paddle, `800` for a fast one.

</details>

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**Red squiggle on `paddle.intersects` — "Property 'intersects'
does not exist on type 'Paddle'."**
Save `paddle.ts`. TypeScript sometimes lags. If it persists,
check that `intersects` is *inside* the class body — between the
class's `{` and `}` — not below it.

**The ball still uses the old paddle variables.**
The Ball class's `update` method probably still has the old
arguments. Make sure you changed both the signature
(`update(dt: number, paddle: Paddle): { ... }`) and the body
(uses `paddle.intersects` and `paddle.y`, not `paddleX` or
`paddleWidth`).

**`ball.update(...)` still has five arguments.**
At the call site in `main.ts`, the call should be
`ball.update(dt, paddle)` — just two arguments now. If it's
still `ball.update(dt, paddleX, paddleY, paddleWidth,
paddleHeight)`, those variables don't even exist anymore.

**Score doesn't go up.**
Make sure you're reading `step.hitPaddle` in `main.ts`'s
`update`. Without that, the score-bump code never runs.

**The brick is invisible.**
Either `brick.draw(ctx)` is missing from `draw`, or
`brick.alive` is `false` for some reason (which would only
happen if `onHit` already fired — possible if the brick spawned
inside the ball's starting position).

**`Cannot find name 'paddleX'` (and friends).**
You deleted the loose paddle variables — good. Now find every
spot in `main.ts` that still mentions `paddleX`, `paddleY`,
`paddleWidth`, or `paddleHeight` and replace it with the
appropriate `paddle.x`, `paddle.y`, `paddle.width`, or
`paddle.height` — or, better, see if you really need to read it
at all (most of the old uses were inside the score / sound
logic, which `step.hitPaddle` now replaces).

## What you just did

- Wrote a `Paddle` class with the same shape as `Ball`: fields,
  constructor, `update`, `draw`, plus an `intersects` method.
- Changed `Ball.update` to take a `Paddle` instance instead of
  four loose numbers. The call site collapsed from five
  arguments to two.
- Had `Ball.update` *return* a small report so the game loop can
  react to a paddle hit and a lost ball without reaching into
  the ball's private fields.
- Wrote a `Brick` class — one brick lives at the top of the
  canvas. It uses the same `intersects` shape as `Paddle`.
- Met the **type alias** — `type Rect = { ... }`, a way to give
  a shape a reusable name.

New words:

- **Type alias** — `type Name = { ... }`, a name for an object
  shape. Doesn't create instances, just names a layout.
- **`Math.abs`** — the absolute-value built-in. Strips the sign
  off a number.
- **Instance argument** — passing a whole instance into a
  method, as in `ball.update(dt, paddle)`. The method gets to
  read `paddle.x`, `paddle.y`, etc. directly.

## What's next

In [Unit 3](/object-oriented/unit-3) you'll meet **inheritance**. You'll
write a `ToughBrick` class that *extends* `Brick` — it inherits
everything (fields, constructor, `intersects`) and overrides only
the bits that differ: a different color and a two-hit-to-die
behavior. The game loop won't change at all. Same collision code,
different result per brick. This is the moment where the OO
investment starts paying for itself.
