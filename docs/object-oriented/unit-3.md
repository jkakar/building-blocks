# Unit 3 — Inheritance for brick types

You have a `Brick` class. One hit, gone. That's a brick.

But not *every* brick has to behave like that. A "tough" brick
might need two hits before it dies. A "bomb" brick might wipe out
its neighbors. You could write three full classes — `Brick`,
`ToughBrick`, `BombBrick` — copying the fields and `intersects`
into each. That's the duplication the Unit 2 quick-check hinted
at: now there's a real reason to share.

This unit introduces **inheritance**. `ToughBrick` will *extend*
`Brick`: it inherits the fields, the constructor, the
`intersects` method, the whole shape — and overrides only the
parts that need to be different. The game loop won't have to
change at all. Same collision check, different behavior per
brick. That last sentence is the win, and it has a name:
**polymorphism**.

## What you'll learn

- The keyword **`extends`** — how one class builds on another.
- The keyword **`super`** — how a subclass reaches back into its
  parent.
- What **method override** means — defining a method in a
  subclass that takes precedence over the parent's.
- **Polymorphism** — one piece of calling code (the collision
  loop) working unchanged across multiple classes.

## Step 1 — Pick up where you left off

Open `~/blocks-oo` in Zed. Start the dev server:

```sh
npm run dev
```

Your `main.ts` should have:

- The `paddle` instance, the `ball` instance, the single `brick`
  instance from Unit 2.
- The collision check inside `update` that flips the ball's `vy`
  and calls `brick.onHit()` and `playBonk()`.

If you did the "two bricks" challenge in Unit 2 you might
already have a `bricks` array. We'll get there in Step 3 either
way — but if you have an array of one brick, that's perfect.

## Step 2 — Evolve `Brick.onHit` to take the brick list

Before we write any subclasses, one small change to `Brick`. Open
`brick.ts` and change `onHit`:

```ts
onHit(others: Brick[]) {
  this.alive = false;
}
```

Save. The body didn't change — but the signature did. Now every
`onHit` takes an `others: Brick[]` argument: the full list of
bricks currently in the game.

Why are we adding an argument the base class doesn't use yet?
**Because subclasses inherit the signature.** Once you pin down
what `onHit` looks like in the base class, every subclass either
matches it or doesn't override at all. If we don't add `others`
now and later we want a `BombBrick` that knows about its
neighbors, we'd have to change the base *and* every existing
subclass at the same time. Setting the signature early lets
subclasses opt into using `others` (or ignore it) without
disturbing the contract. It's a real cost of inheritance:
parent decisions ripple down.

::: tip Reading unused arguments
TypeScript will warn you about unused arguments unless you tell
it you mean it. Two ways to make the warning go away:

- Prefix the name with an underscore: `_others: Brick[]`. Many
  projects use this convention to mean "I know I'm not using
  this, on purpose."
- Just use it somewhere — even `if (others.length === 0) {}`
  counts.

For now you can leave it as `others: Brick[]` and use it (we
will in a moment when the brick list moves into the collision
loop). If your editor squiggles it, the underscore prefix is the
quickest fix.
:::

You'll need to update the caller too. In `main.ts`, change:

```ts
brick.onHit();
```

to:

```ts
brick.onHit([brick]);
```

For now we just hand it a one-element list. In Step 4 you'll
make a real `bricks` array and pass *that*.

Save. The game should still play exactly as before.

## Step 3 — Write `ToughBrick`

Time for the new class. At the bottom of `brick.ts`, type this:

```ts
export class ToughBrick extends Brick {
  hp: number = 2;

  onHit(others: Brick[]) {
    this.hp = this.hp - 1;
    if (this.hp <= 0) {
      super.onHit(others);
    }
  }

  draw(ctx: Ctx) {
    if (!this.alive) return;
    if (this.hp >= 2) {
      ctx.fillStyle = "#3949ab";
    } else {
      ctx.fillStyle = "#7986cb";
    }
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
```

Read through it before saving. There's a *lot* of class
machinery in fifteen lines.

- `class ToughBrick extends Brick` — this is the new word. It
  says: ToughBrick *is a kind of* Brick. Everything a Brick has,
  a ToughBrick has too — same fields (`x`, `y`, `width`,
  `height`, `alive`), same constructor (we didn't write a new
  one, so we get Brick's), same `intersects` method.
- `hp: number = 2;` — a *new field* that only ToughBrick has.
  Plain Bricks don't have `hp`; ToughBricks do. It starts at 2.
- `onHit(others: Brick[]) { ... }` — **overrides** Brick's
  `onHit`. When you call `onHit` on a ToughBrick, *this* method
  runs, not the one in Brick. Decrement hp; only call
  `super.onHit(others)` when hp hits zero. `super` is how a
  child class reaches back into its parent: `super.onHit(...)`
  runs Brick's version of `onHit` (which sets `alive = false`).
  We don't *retype* the death logic — we just delegate to the
  parent.
- `draw(ctx: Ctx) { ... }` — **overrides** Brick's `draw`. Same
  shape, different color. The color even changes once `hp`
  drops to 1, so you can see a tough brick is damaged.

Save.

::: tip Vocab: inheritance and `extends`
**Inheritance** is one class building on another. When you write
`class B extends A`, you're saying "B is a kind of A." B
automatically gets everything A had — fields, constructor,
methods — without retyping them. B can also *add* new fields or
methods, or *override* the ones it inherited from A.

The class you extend (here, `Brick`) is called the **parent**,
**base**, or **superclass**. The class doing the extending
(here, `ToughBrick`) is the **child** or **subclass**.

Inheritance shines when two things really are related — "a
ToughBrick *is a* Brick" is the right phrase. If you find
yourself saying "a Wallet *is a* Person because they both have
money," that's not inheritance, that's a forced analogy. Use
inheritance for kind-of relationships.
:::

::: tip Vocab: method override
When a subclass defines a method with the same name as one in
its parent, the subclass's method **overrides** the parent's.
After that, calling the method on an instance of the subclass
runs the subclass's version, not the parent's. The parent's
version still exists for plain Brick instances — overriding is
*per class*, not per method-in-the-language.

This is one of two big things inheritance buys you. The other is
*not* having to retype the fields and methods the parent
already wrote.
:::

## Step 4 — Use ToughBrick in main.ts

Open `main.ts`. Change the import to include `ToughBrick`:

```ts
import { Brick, ToughBrick } from "./brick";
```

Replace the single brick (or the two-brick array if you did the
Unit 2 challenge) with a row of mixed bricks. Right after the
paddle:

```ts
const bricks: Brick[] = [
  new Brick(100, 80, 100, 24),
  new ToughBrick(220, 80, 100, 24),
  new Brick(340, 80, 100, 24),
  new ToughBrick(460, 80, 100, 24),
  new Brick(580, 80, 100, 24),
];
```

::: tip Why `bricks: Brick[]` and not `bricks: ToughBrick[]`?
The type annotation says "this is an array of `Brick`s." A
`ToughBrick` *is a* Brick (that's what `extends Brick` means),
so it fits in a `Brick[]`. This is what makes the next step
work — the collision loop can walk over `Brick[]` and not care
which subclass each element actually is.

If we'd typed it `ToughBrick[]`, only ToughBricks would fit. We
want both.
:::

Now change the collision check inside `update`. Replace the
single-brick `if` block with a loop:

```ts
for (const b of bricks) {
  if (!b.alive) continue;
  if (
    b.intersects({
      x: ball.x,
      y: ball.y,
      width: ball.size,
      height: ball.size,
    })
  ) {
    ball.vy = -ball.vy;
    b.onHit(bricks);
    playBonk();
    break;
  }
}
```

And in `draw`, replace `brick.draw(ctx)` with:

```ts
for (const b of bricks) b.draw(ctx);
```

Save. Click into the browser.

The plain green bricks die in one hit, like always. The blue
**ToughBricks** take two — the color even fades after the first
hit. **Same collision loop**. The loop doesn't have a single
`if (b instanceof ToughBrick)` check. It just calls `b.onHit`
and lets the right code run.

That last line is the whole point of this unit. **The collision
code doesn't care which class each brick is.** Each brick knows
what to do when hit. The loop just hands them the news.

## Quick check

The line `b.onHit(bricks);` runs for every brick that's hit. If
`b` is a plain `Brick`, what runs? If `b` is a `ToughBrick`?

<details><summary>Click for the answer</summary>

- If `b` is a plain `Brick`, the *Brick* class's `onHit` runs:
  `this.alive = false;`. The brick dies.
- If `b` is a `ToughBrick`, the *ToughBrick* class's `onHit`
  runs: `this.hp = this.hp - 1; if (this.hp <= 0) this.alive =
  false;`. The brick stays alive on the first hit and dies on
  the second.

Same line in `main.ts`. Different code runs depending on which
class made the instance. That's polymorphism.

</details>

::: tip Vocab: polymorphism
**Polymorphism** is the word for "one piece of calling code that
works for many shapes of object." Greek roots: "poly" = many,
"morph" = shape. Same call, different shape, different behavior.

You used polymorphism the moment you wrote `b.onHit(bricks)`
inside a loop over a mixed list. The loop is single-shape; the
results are many. New brick type? The loop doesn't change.
:::

## Step 5 — Look at the loop

Open `main.ts`. Find the collision loop:

```ts
for (const b of bricks) {
  if (!b.alive) continue;
  if (
    b.intersects({
      x: ball.x,
      y: ball.y,
      width: ball.size,
      height: ball.size,
    })
  ) {
    ball.vy = -ball.vy;
    b.onHit(bricks);
    playBonk();
    break;
  }
}
```

Read it carefully. Notice what it *doesn't* say:

- It doesn't say "if this brick is tough, do X, else Y."
- It doesn't say "look up which class this brick is."
- It doesn't even mention `ToughBrick` by name.

It walks the array, asks each brick "do you overlap with this
rectangle?", asks each brick that does to "handle being hit."
The bricks decide how. That's the OO investment paying back: the
loop got *shorter*, not longer, when you added a new brick type.

## On your own

### Challenge — A third brick type

Add a third brick subclass. Pick whichever idea grabs you most:

- **`BombBrick`** — when hit, it destroys every other brick
  within a small radius. Hint: it overrides `onHit(others)` and
  loops through `others`, marking nearby ones as `alive =
  false`. The `others` argument finally earns its keep.
- **`GoldBrick`** — gives the player bonus score when hit. You'd
  need a way to communicate "I'm worth extra points" back to the
  game loop. The easiest version: in the loop, after `b.onHit`,
  check `b instanceof GoldBrick` and add to the score. Slightly
  uglier; that's OK to notice.
- **`InvincibleBrick`** — never dies. The ball bounces off but
  the brick stays. Override `onHit` to do *nothing* (no `alive
  = false`, no hp decrement). Use it as a wall in level design.

Pick one and add it to `brick.ts`, then drop a couple instances
into the `bricks` array in `main.ts`.

<details><summary>Hint — How to override the right thing</summary>

Every brick subclass follows the same shape:

```ts
export class YourBrick extends Brick {
  // Optional: new fields, like `hp` for ToughBrick.

  // Optional: a new constructor, if you want different
  // arguments. You can usually skip this and use Brick's.

  // Override at least one of `onHit` and `draw` — that's where
  // your new behavior lives.

  onHit(others: Brick[]) {
    // do something different
  }

  draw(ctx: Ctx) {
    if (!this.alive) return;
    // draw something different
  }
}
```

For BombBrick, the *core* of `onHit` is a loop:

```ts
for (const other of others) {
  if (other === this) continue;   // don't blow up yourself
  if (!other.alive) continue;     // skip already-dead bricks
  // figure out if `other` is close enough; if so, mark dead.
}
```

To "figure out close enough," compute the center of each brick
(`this.x + this.width / 2`, `this.y + this.height / 2`), get the
difference, and compare to a radius.

</details>

<details><summary>Hint — Using `instanceof`</summary>

If your subclass needs the game loop to act differently — like
`GoldBrick` needing the loop to add bonus score — you'll use
**`instanceof`**:

```ts
if (b instanceof GoldBrick) {
  score = score + 5;
}
```

`b instanceof GoldBrick` is `true` if `b` was made with `new
GoldBrick(...)` (or a subclass of GoldBrick). It's a way to ask
"what *kind* is this instance?".

Heads up: `instanceof` is the *opposite* of polymorphism. Each
time you write it, you're hard-coding a check that the
calling code knows about a specific subclass. A handful of
those is fine. If you find yourself with a long `if /
else-if / else-if` chain of `instanceof`s, that's a sign the
behavior should live *inside the class* (as a method override)
instead.
</details>

### Stretch — Two ToughBrick rows

Make a second row of bricks below the first. Just position math
— change the `y` from `80` to `120` for the second row, vary the
mix of types as you like. The challenge isn't the code (you've
written the row once), it's that you'll feel a little impulse to
write a loop. Two rows is just barely worth it. Three would
definitely be. Make the call.

If a hint doesn't unstick you, ask a grown-up to look at it with
you.

## Troubleshooting

**Red squiggle on `ToughBrick`: "Property 'hp' does not exist on
type 'Brick'."**
The `bricks` array is typed `Brick[]`, so TypeScript only knows
*Brick* methods/fields on each element. That's fine for the
collision loop — it only calls `intersects`, `onHit`, and
`alive`, all of which exist on Brick. If you find yourself
needing to read `hp` from outside the class, you'd need
`if (b instanceof ToughBrick) { /* now b.hp is visible */ }`.

**TypeScript complains about `onHit`'s signature.**
The subclass's `onHit` has to match the parent's signature.
`onHit(others: Brick[])` should be the same in both. If you
wrote `onHit()` in `ToughBrick` (no arguments), TypeScript will
say it doesn't match. Add the `others: Brick[]` argument and
ignore it inside if you don't need it.

**The tough brick dies in one hit.**
Either you didn't override `onHit` in ToughBrick (so it's still
using Brick's version, which sets `alive = false` immediately),
or you wrote `onHit()` instead of `onHit(others: Brick[])` —
TypeScript may have silently ignored your override because the
signatures didn't match.

**Every brick is the same color.**
You probably didn't override `draw` in ToughBrick. Without an
override, ToughBrick uses Brick's `draw`, which paints
`#4caf50` (green) every time.

**The ball doesn't bounce off the brick anymore.**
Make sure `ball.vy = -ball.vy;` is *outside* the `if (!b.alive)
continue;` line — only inside the `if (b.intersects(...))`
block. And make sure `break;` is at the end, so the loop stops
after a single hit per frame.

## What you just did

- Wrote `ToughBrick extends Brick` — your first subclass.
- Overrode `onHit` and `draw` without touching `intersects` or
  the constructor (those came along for free).
- Mixed plain Bricks and ToughBricks in one array, and watched a
  *single* collision loop handle both correctly.
- Met **polymorphism**: the same call shape doing different
  things depending on the runtime class.

New words:

- **Inheritance** — one class building on another. Subclasses
  get the parent's shape for free; they only spell out the
  differences.
- **`extends`** — the keyword that makes a subclass.
  `class Child extends Parent { ... }`.
- **Override** — a method in a subclass with the same name as
  one in the parent. The subclass's version runs for instances
  of the subclass.
- **Superclass** / **parent** — the class being extended.
- **Subclass** / **child** — the class doing the extending.
- **Polymorphism** — one call site, many shapes, different
  results. The collision loop is polymorphic.

## What's next

[Unit 4](/object-oriented/unit-4) brings the whole course home with a
feature that's hard to imagine writing *without* classes:
**multi-ball**. Every five paddle hits, a new ball spawns. Five
balls bouncing around at once. The trick: in Course 1, adding a
second ball was eight lines of duplication. With a `Ball` class
and an array of balls, it's one line: `balls.push(new Ball(...))`.
