# Unit 1 — Entities, components, systems

Before any code, the picture.

In Course 3 you wrote a `Ball` class. It bundled four numbers
(`x`, `y`, `vx`, `vy`) with two functions (`update`, `draw`).
The data and the behavior lived inside the same `{ }`.

ECS pulls them apart.

- The "ball" becomes an **entity** — and an entity is just a
  number. The number `1`. That's it. No fields. No methods.
- The ball's `x` and `y` live in a separate place called a
  **Position** component. That place is a bucket keyed by entity
  ID. To look up entity 1's position, you ask: "bucket, do you
  have a row for ID 1?"
- The ball's `vx` and `vy` live in a *different* bucket called
  **Velocity**. Same idea — keyed by ID.
- The code that moves things — what used to be `Ball.update` —
  is a **system**. It's a plain function that walks the Position
  bucket and asks, for each ID, "do you also have a Velocity?"
  If yes, it moves.

The same entity ID — `1` — pops up in many buckets. The buckets
don't know about each other. The systems are the only thing
that connects them.

In this unit you'll set all that up and watch one square slide
across the screen.

## What you'll learn

- The three words: **entity**, **component**, **system**.
- Why "data over here, behavior over there" — the central ECS
  bet.
- How to store components in an **index-signature object**.
- A small gotcha about `for...in` keys being strings.

## Step 1 — Make a new project folder

Course 6 lives in its own folder. Your earlier projects stay
where they are.

Open Zed's terminal. Run these one at a time:

```sh
mkdir ~/blocks-ecs
cd ~/blocks-ecs
```

Copy the same four supporting files Course 1 had:

```sh
cp ~/blocks/index.html ~/blocks-ecs/
cp ~/blocks/package.json ~/blocks-ecs/
cp ~/blocks/tsconfig.json ~/blocks-ecs/
mkdir ~/blocks-ecs/src
cp ~/blocks/src/game.ts ~/blocks-ecs/src/
```

Install the tools:

```sh
npm install
```

(If anything feels rusty, [Unit 0](/procedural/unit-0) has the full
walk-through.)

You won't write `main.ts` from a giant block this time. We'll
build it piece by piece across the unit.

## Step 2 — Component storage

Create a new file: `src/components.ts`. The name says what it'll
hold — the **types** of the components and the **buckets** they
live in.

Type this in:

```ts
export type Position = { x: number; y: number };
export type Velocity = { vx: number; vy: number };

export const positions: { [id: number]: Position } = {};
export const velocities: { [id: number]: Velocity } = {};
```

Save. Four lines that say a lot.

The first two lines name two **shapes**: a Position has an `x`
and a `y`, a Velocity has a `vx` and a `vy`. These are *types* —
they describe the contents of a value without creating one.

The last two lines create the buckets. `{ [id: number]: Position
}` is an **index-signature object** — a plain object whose keys
are numbers and whose values are Positions. You first saw this
shape in Course 2's event bus.

::: tip Vocab: component
A **component** is a small piece of data attached to an entity.
The shapes (`Position`, `Velocity`) say what *kind* of data.
The buckets (`positions`, `velocities`) hold the actual rows.

Each bucket is keyed by entity ID. To say "entity 42 is at
(100, 200)," you write `positions[42] = { x: 100, y: 200 };`.
To remove it, `delete positions[42];`.
:::

::: tip Why two buckets, not one big one?
You might be tempted to glue everything together — one object
per entity that has both `position` and `velocity` inside it.
That's how Course 3's classes worked. ECS deliberately *doesn't*
do that. Why?

- An entity can have any combination of components. A *wall*
  has a Position but no Velocity. A *score popup* has a Position
  and a sprite but no Velocity either. Separate buckets let
  entities pick and choose.
- Systems are written against *one or two* component types.
  Splitting them means a system doesn't have to know about (or
  load) the other components an entity might happen to have.

We'll feel both of these payoffs in Units 2 and 3.
:::

## Step 3 — Entities

Create another file: `src/ecs.ts`. This one holds the bookkeeping
that's *not* about a specific component type — the entity
counter, the helpers that create and destroy entities.

```ts
import { positions, velocities } from "./components";

let nextId = 1;

export function createEntity(): number {
  const id = nextId;
  nextId = nextId + 1;
  return id;
}

export function destroyEntity(id: number) {
  delete positions[id];
  delete velocities[id];
}
```

Save. Read it.

`createEntity` doesn't make an object — it just hands out the
next integer and increments. Entity 1, then entity 2, then
entity 3. The number *is* the entity. There's nothing else to
create.

`destroyEntity` deletes the entity's row from every bucket. We
have two buckets so far, so two `delete` lines. When we add more
component types (Sprite, Player, Asteroid) we'll add lines here
too.

::: tip Vocab: entity
An **entity** is an integer ID. Nothing more. It has no fields,
no methods, no shape of its own. Its *components* — the rows in
the buckets that share its ID — describe what it is and what
it can do.

A common confusion: "but where's the object for entity 1?"
There isn't one. Entity 1 is just the number `1`. Pieces of it
live in different places.
:::

::: tip Why the ID counter never goes down
Notice `destroyEntity` deletes the entity's rows but never
decrements `nextId`. If we *reused* numbers, a stale reference
to "entity 5" could accidentally line up with a brand-new
"entity 5" and you'd get a ghost — code expecting the dead
entity would find the new one's data. Letting IDs grow forever
is the simple fix. A 32-bit counter wouldn't roll over until
you'd spawned four billion entities.
:::

## Step 4 — Your first system

Create `src/systems.ts`. Type this in:

```ts
import { positions, velocities } from "./components";

export function movementSystem(dt: number) {
  for (const id in positions) {
    const v = velocities[id];
    if (v) {
      const p = positions[id];
      p.x = p.x + v.vx * dt;
      p.y = p.y + v.vy * dt;
    }
  }
}
```

Save. Read each line.

- `for (const id in positions)` — walk every key in the
  `positions` bucket. Each `id` is the ID of an entity that has
  a Position.
- `const v = velocities[id];` — pull out the same ID's Velocity,
  if there is one. If the entity *only* has a Position, `v` is
  `undefined`.
- `if (v) { ... }` — skip the entity if it has no Velocity.
- The two assignments inside do the same arithmetic you've seen
  every course: move `x` and `y` forward by velocity times time.

That's it. That's a system.

::: tip Vocab: system
A **system** is a function that does one job over the
components. It picks the bucket it cares most about, loops the
entity IDs in it, and pulls in any other components it needs
for those IDs.

Systems are stateless. They hold no fields of their own.
Everything they touch lives in the buckets. Run the same system
twice with the same buckets and you get the same result.
:::

::: tip A subtle thing: keys are strings
The `id` in `for (const id in positions)` looks like a number
but it's actually a **string**. JavaScript object keys are
always strings, even when they look like `42`. Most of the time
this doesn't matter — `positions[id]` and `positions[42]` both
work because the language coerces. But the moment you need to
call something that *expects* a number — for example
`destroyEntity(id)` — TypeScript will complain.

The fix is to wrap with `Number(id)`. We'll see that in Unit 3.
For now, since we're only *reading* the buckets, the strings
work fine.
:::

## Step 5 — Wire it up

Now write `src/main.ts`. Type this in:

```ts
import { start, Ctx } from "./game";
import { positions, velocities } from "./components";
import { createEntity } from "./ecs";
import { movementSystem } from "./systems";

// Make one test entity with a Position and a Velocity.
const id = createEntity();
positions[id] = { x: 100, y: 100 };
velocities[id] = { vx: 60, vy: 40 };

function update(dt: number) {
  movementSystem(dt);
}

function draw(ctx: Ctx) {
  // Draw every entity that has a Position, as a small white box.
  for (const id in positions) {
    const p = positions[id];
    ctx.fillStyle = "white";
    ctx.fillRect(p.x, p.y, 20, 20);
  }
}

start(update, draw);
```

Save. In the terminal:

```sh
npm run dev
```

Open the URL. You should see a small white square drifting down
and to the right — about 60 pixels right per second, 40 down.
After about ten seconds it walks off the bottom of the canvas
(we won't clean that up until Unit 3).

**Stop and notice what just happened.** You wrote one line —
`positions[id] = { x: 100, y: 100 };` — and now the movement
system handles that entity. You didn't tell `movementSystem`
about it. You didn't list it anywhere. You added a row to a
bucket, and the system found it on its next loop.

That's the bet. The rest of the course cashes it in.

## Step 6 — A second entity, just to feel it

Add three more lines, right under the first entity's setup:

```ts
const id2 = createEntity();
positions[id2] = { x: 600, y: 50 };
velocities[id2] = { vx: -80, vy: 30 };
```

Save. **Two white squares are sliding around now.** The
movement system handled the new one without you touching it.
The draw loop handled it too — same reason.

Try a third. A fourth. Keep going for a minute. Each new entity
is three lines. The systems scale without a single change.

::: tip Vocab: archetype (just the word, for now)
The set of components an entity has — for our two entities
above, "Position + Velocity" — is called the entity's
**archetype**. We won't *use* archetypes as a feature in this
course (real engines often optimize storage by them). But the
word will come up. When you read about ECS later, "archetype"
just means "what shape of components this entity has."
:::

Take the extra entity lines back out when you're done — we want
a clean one-entity start for Unit 2.

## Quick check

What would happen if you set the Position of entity 5 but
*never* set its Velocity? Would the movement system crash, skip
it, or move it?

<details><summary>Click for the answer</summary>

Skip it. The system loops the IDs in `positions`. For each, it
asks `const v = velocities[id];`. If there's no row in
`velocities` for that ID, `v` is `undefined`. The next line —
`if (v)` — is false, so the body doesn't run.

That's the whole "entities have whatever components they
happen to have" idea, in one `if`. A wall (Position only) and a
ball (Position + Velocity) flow through the same system; one
moves, one doesn't, because the system asks before acting.

</details>

## Quick check

Look at the loop in `draw`:

```ts
for (const id in positions) {
  const p = positions[id];
  // ...
}
```

`id` is the *string* `"1"`, not the number `1`. Does
`positions[id]` work anyway?

<details><summary>Click for the answer</summary>

Yes. JavaScript objects accept both — `positions["1"]` and
`positions[1]` return the same row. The language coerces
between the two whenever you index into a plain object.

The string-versus-number thing only bites when you hand the key
to a *function* that's strictly typed for `number` — like
`destroyEntity(id)` would be in Unit 3. There you'll see
`destroyEntity(Number(id))`. For everything else, the coercion
hides the difference.

</details>

## Play with it

- Change `velocities[id]` to `{ vx: 200, vy: 0 }`. The square
  zips horizontally.
- Change `velocities[id2]` to `{ vx: 0, vy: 0 }`. The second
  square sits still. (Notice: the system *still* iterates over
  it — it just adds zero, which is fine.)
- Remove the `if (v)` line in `movementSystem`. Save. Then add a
  third entity that has *only* a Position (no Velocity) — say,
  `const id3 = createEntity(); positions[id3] = { x: 400, y:
  300 };`. Open the browser console. You'll see an error like
  "Cannot read properties of undefined." That's why the `if (v)`
  was there. Put it back.

## On your own

### Challenge — Add a Sprite component

Right now everything draws as the same white 20×20 square,
because `draw` hardcodes those numbers. Make each entity's look
a component too.

The shape:

```ts
export type Sprite = { color: string; size: number };
export const sprites: { [id: number]: Sprite } = {};
```

Then in `draw`, instead of hardcoding `"white"` and `20`, look
up the entity's Sprite and use those.

Try it before peeking.

<details><summary>Hint 1 — Adding the bucket</summary>

Three changes:

1. Add the type and bucket to `components.ts`:

   ```ts
   export type Sprite = { color: string; size: number };
   export const sprites: { [id: number]: Sprite } = {};
   ```

2. Import it where you need it. In `main.ts`:

   ```ts
   import { positions, velocities, sprites } from "./components";
   ```

3. Give each entity a Sprite alongside its Position:

   ```ts
   sprites[id] = { color: "red", size: 30 };
   ```

</details>

<details><summary>Hint 2 — Drawing from the component</summary>

```ts
function draw(ctx: Ctx) {
  for (const id in positions) {
    const s = sprites[id];
    if (s) {
      const p = positions[id];
      ctx.fillStyle = s.color;
      ctx.fillRect(p.x, p.y, s.size, s.size);
    }
  }
}
```

Notice this is exactly the same shape as `movementSystem`: loop
one bucket, look up another, skip if missing.

You'll also want to update `destroyEntity` in `ecs.ts` to
`delete sprites[id];` alongside the others, so destroying an
entity removes all of its rows. We don't destroy anything yet,
but it's the kind of thing easy to forget once you do.

</details>

## Troubleshooting

**Red squiggle on `velocities[id]` — "Element implicitly has
'any' type."**
Make sure your buckets are typed: `const velocities: { [id:
number]: Velocity } = {};`. The `: { [id: number]: Velocity }`
annotation is what tells TypeScript "this is a number-keyed
object of Velocities."

**"Cannot find module './components'."**
Make sure all four files — `components.ts`, `ecs.ts`,
`systems.ts`, `main.ts` — are inside `src/`, next to `game.ts`.
Relative imports like `./components` mean "the file right next
to me."

**The square sits still.**
Either the velocity is zero (check `velocities[id]`), or you
forgot to call `movementSystem(dt)` from `update`. Open the
browser console — if nothing's logged or erroring, the systems
just aren't being asked to run.

**The square moves but disappears immediately.**
The starting position is probably off-screen. The canvas is
800×600 — make sure `positions[id].x` is between 0 and 800 and
`y` between 0 and 600.

## What you just did

- Made three files: `components.ts`, `ecs.ts`, `systems.ts`.
- Defined two component types (`Position`, `Velocity`) and the
  buckets that hold them.
- Wrote an entity counter and a `createEntity` helper.
- Wrote your first system — `movementSystem` — and watched it
  move an entity it had never seen before.
- Made a second entity in three lines and watched the same
  system handle it for free.

New words:

- **Entity** — an integer ID. Nothing more.
- **Component** — a small piece of data attached to an entity,
  stored in a bucket keyed by entity ID.
- **Marker / tag** — a component with no data, used to say "this
  entity is a Player" or similar. (We'll meet one in Unit 2.)
- **System** — a function that walks the buckets and does one
  job. Stateless.
- **Archetype** — the set of component types an entity has.
- **Index-signature object** — a plain object typed as `{ [k:
  number]: T }`. Our buckets are these.

## What's next

In [Unit 2](/entity-component-system/unit-2) the white square becomes a *player
ship*. You'll meet your first **marker component** — a tag that
carries no data, just says "this entity is the player." And
you'll write an input system that reads the arrow keys.
