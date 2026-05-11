# Unit 9 — Tough bricks

In Unit 8 every brick was the same: hit once, gone. Real
brick-breakers have variety — bricks with more hit points, bricks
with different rules, bricks that drop power-ups. In Unit 9 you
add the first variation: **tough bricks** that take two hits.

This unit is mostly about *extending* what your bricks already are
— adding a new field, and letting that field shape behavior.

## What you'll learn

- Replacing a flag (`alive: true/false`) with a more flexible
  *number* (`hp`: 1, 2, 3, …).
- Choosing what to draw based on object state.
- The pattern that almost every game uses for "this thing has
  multiple kinds."

## Step 1 — Replace `alive` with `hp`

Open `main.ts`. We're going to swap the `alive: true` field on
every brick for `hp: 1`. **hp** is short for *hit points* — how
many hits this brick can take before it's destroyed.

In `buildBricks`, change the `alive: true` to `hp: 1`:

```ts
function buildBricks() {
  bricks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      bricks.push({
        x: col * 80 + 5,
        y: row * 30 + 50,
        width: 70,
        height: 20,
        hp: 1,
      });
    }
  }
}
```

Update the type annotation on the `bricks` declaration too:

```ts
let bricks: { x: number; y: number; width: number; height: number; hp: number }[] = [];
```

Now update everywhere that used `brick.alive`:

In `drawBricks`, change `if (brick.alive)` to `if (brick.hp > 0)`:

```ts
function drawBricks(ctx: Ctx) {
  ctx.fillStyle = "orange";
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.hp > 0) {
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
  }
}
```

In `updateBricks`, change `!brick.alive` to `brick.hp <= 0`, and
change `brick.alive = false;` to `brick.hp = brick.hp - 1;`:

```ts
function updateBricks() {
  let aliveCount = 0;
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.hp <= 0) {
      continue;
    }
    aliveCount = aliveCount + 1;
    if (
      x + 30 > brick.x &&
      x < brick.x + brick.width &&
      y + 30 > brick.y &&
      y < brick.y + brick.height
    ) {
      brick.hp = brick.hp - 1;
      if (brick.hp <= 0) {
        aliveCount = aliveCount - 1;
      }
      vy = -vy;
      score = score + 10;
      playBonk();
    }
  }
  if (aliveCount === 0) {
    gameState = "won";
  }
}
```

Save. Behavior should be identical to before — every brick still
breaks in one hit, because `hp: 1` becomes `hp: 0` on contact,
which counts as gone.

Even though nothing visible changed, you just opened the door to
*variety*. Some bricks can now start at higher `hp`.

## Step 2 — Make the top two rows tough

In `buildBricks`, use the `row` variable to give some bricks
more `hp`:

```ts
function buildBricks() {
  bricks = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 10; col++) {
      let hp = 1;
      if (row < 2) {
        hp = 2;
      }
      bricks.push({
        x: col * 80 + 5,
        y: row * 30 + 50,
        width: 70,
        height: 20,
        hp: hp,
      });
    }
  }
}
```

Bricks in the top two rows (`row` is 0 or 1) start with `hp: 2`.
The rest start with `hp: 1`.

Save and play. The top-row bricks now take two hits to break — but
you can't *tell* by looking at them, because they're all orange.
Let's fix that.

## Step 3 — Make tough bricks look different

Update `drawBricks` to pick a color based on the brick's hp:

```ts
function drawBricks(ctx: Ctx) {
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];
    if (brick.hp <= 0) {
      continue;
    }
    if (brick.hp >= 2) {
      ctx.fillStyle = "darkorange";
    } else {
      ctx.fillStyle = "orange";
    }
    ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
  }
}
```

Save. The top two rows are now `darkorange` and take two hits; the
bottom three are `orange` and break in one.

Notice that we moved `ctx.fillStyle` *inside* the loop. Before, we
set the color once for all bricks. Now each brick gets its own
color based on its hp.

::: tip Vocab: branch
That `if`/`else` pair is called a **branch** — two paths through
the code, only one of which runs. You've been writing branches
since Unit 1 (`if (isKeyDown("ArrowLeft"))`), but this is the
first one with an explicit `else` for the "otherwise" case. The
shape `if (...) { A } else { B }` reads as "if the condition is
true, do A; otherwise do B."
:::

## Step 4 — Play with it

- Make *more* rows tough: change `row < 2` to `row < 3`.
- Add a *third* tier: bricks with `hp: 3` that need three hits.
  Color them red. You'll need another `if`/`else if` branch.
- Make tough bricks worth more points: bigger `score += ...` when
  destroying a brick with high hp.
- Swap the layout: tough bricks on the *bottom* instead.

## On your own

### Challenge 1 — Brick types with named labels

Instead of using raw numbers for hp, add a separate **type** field
to each brick: `type: "normal"` or `type: "tough"`. Use this field
in both `buildBricks` (to set hp) and `drawBricks` (to pick
color).

This is more code but reads better — names beat numbers when the
numbers don't have an obvious meaning by themselves.

<details><summary>Hint</summary>

In `buildBricks`, choose `type` based on `row`, then use `type` to
set both `hp` and let `drawBricks` infer color.

```ts
let type = "normal";
if (row < 2) {
  type = "tough";
}
let hp = 1;
if (type === "tough") {
  hp = 2;
}
bricks.push({ x: ..., y: ..., width: 70, height: 20, hp: hp, type: type });
```

Update the type annotation on `bricks` to include `type: string`.

In `drawBricks`, switch on `brick.type` instead of `brick.hp` to
pick the color.

The tradeoff: more state per brick, but each brick now *says* what
it is. When you add `"superTough"` or `"explosive"` later, the
draw code reads `brick.type` instead of comparing magic numbers.

</details>

### Challenge 2 — A brick that needs 5 hits

Add a single special brick somewhere on the canvas that has
`hp: 5`. Make it visually distinct (its own color, maybe bigger).
Place it somewhere obvious.

<details><summary>Hint</summary>

In `buildBricks`, after the nested loop, you can `push` one more
brick by hand:

```ts
bricks.push({
  x: 350,
  y: 200,
  width: 100,
  height: 40,
  hp: 5,
});
```

In `drawBricks`, add a branch for `brick.hp >= 5`.

</details>

## What you just did

- Replaced a boolean flag with a *number* and reused the same
  collision code with one new behavior: decrement instead of
  destroy.
- Drew different bricks differently based on their state.
- Designed your first multi-tier game system.

New words:

- **HP** — hit points. How many hits something takes before it's
  gone.
- **Branch** — code that takes one of two paths, written with
  `if`/`else`.

## What's next

In Unit 10 we shake things up: some bricks **start falling** and
float toward the paddle. If they reach the bottom they break;
the player can also break them with the ball. New idea: bricks
that have their *own* velocity, just like the ball. That's
**v3**.
