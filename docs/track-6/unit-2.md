# Unit 2 — The player ship

End of Unit 1 you had a square drifting across the screen. This
unit turns it into a *player ship* that moves with the arrow
keys.

That's a small change in *what shows on screen*, but it asks a
new question of the ECS: how does the input system know *which*
entity is the player?

The answer is a new kind of component. One with no fields. A
**marker component** — also called a tag. It exists to *say*
something rather than *hold* something.

## What you'll learn

- What a **marker component** is and when to use one.
- How an **input system** reads keys and writes to a component
  bucket.
- Why systems should pick the smallest bucket as their loop.

## Step 1 — Add a Sprite component

We'll need this in a moment, and it's a clean place to start.
If you did the Sprite challenge at the end of Unit 1, you've
already got most of this — skim and make sure your code lines
up.

In `components.ts`, add a `Sprite` shape and bucket alongside
the others:

```ts
export type Sprite = { color: string; size: number };
export const sprites: { [id: number]: Sprite } = {};
```

In `ecs.ts`, update `destroyEntity` so it cleans up Sprite rows
too:

```ts
import { positions, velocities, sprites } from "./components";

// ...

export function destroyEntity(id: number) {
  delete positions[id];
  delete velocities[id];
  delete sprites[id];
}
```

Now in `systems.ts`, add a `renderSystem` that uses Sprite to
draw. We're moving the drawing *out of* `main.ts` and into a
system, so it stays in the same place as movement.

```ts
import { Ctx } from "./game";
import { positions, velocities, sprites } from "./components";

// (movementSystem stays the same)

export function renderSystem(ctx: Ctx) {
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

Save. In `main.ts`, simplify `draw` so it just calls the system:

```ts
import { renderSystem } from "./systems";

// ...

function draw(ctx: Ctx) {
  renderSystem(ctx);
}
```

And in your entity setup, give the test entity a Sprite:

```ts
sprites[id] = { color: "white", size: 30 };
```

(Add the `sprites` import to `main.ts`'s top-of-file imports if
it's not there yet.)

Save. The page should look the same as before — a white square
drifting. The change is purely structural: now drawing is a
system, just like movement.

## Step 2 — The Player marker

Now the new piece. In `components.ts`, add:

```ts
export const players: { [id: number]: true } = {};
```

That's it. No `type Player = ...` line at all — there's nothing
to describe. The bucket holds `true` as the value because
TypeScript wants *some* value, and `true` is the smallest one
that says "present."

::: tip Vocab: marker component
A **marker component** (also called a **tag**) is a component
with no data. Its presence in the bucket says something — "this
entity is the player," "this entity is an enemy," "this entity
is on fire" — and that's the whole point. You never `.read` a
field off of it.

Why not just put a `isPlayer: boolean` field on Position? Three
reasons:

1. Position is supposed to be about *where the entity is*, not
   *what kind of entity it is*. Mixing concerns muddles both.
2. A boolean on Position would force *every* entity to declare
   `isPlayer: false`. With a marker, "not present" *is* the
   "no" answer.
3. Systems can loop the marker bucket directly to find the
   players — typically a one-element set. A boolean would force
   loops over the whole Position bucket.

We'll feel point 3 in Step 5.
:::

Update `destroyEntity` to clean up the marker too:

```ts
import { positions, velocities, sprites, players } from "./components";

export function destroyEntity(id: number) {
  delete positions[id];
  delete velocities[id];
  delete sprites[id];
  delete players[id];
}
```

## Step 3 — Make the player entity

In `main.ts`, replace the test entity setup with a player.
Delete:

```ts
const id = createEntity();
positions[id] = { x: 100, y: 100 };
velocities[id] = { vx: 60, vy: 40 };
sprites[id] = { color: "white", size: 30 };
```

Put in its place:

```ts
import { players } from "./components";
import { WIDTH, HEIGHT } from "./game";

const playerId = createEntity();
positions[playerId] = { x: WIDTH / 2 - 20, y: HEIGHT - 60 };
velocities[playerId] = { vx: 0, vy: 0 };
sprites[playerId] = { color: "#33cc66", size: 40 };
players[playerId] = true;
```

Read those five lines. They say:

- Make a fresh entity. Call its ID `playerId`.
- Put its Position at the bottom-center of the canvas.
- Give it a Velocity of zero (it'll only move when you press a
  key).
- Give it a green Sprite, 40 pixels square.
- Mark it as the player.

Save. You should see a green square sitting at the bottom of the
canvas. It doesn't move yet — there's no input system.

## Step 4 — An input system

In `systems.ts`, add:

```ts
import { isKeyDown } from "./game";
import { players } from "./components";

const playerSpeed = 400;

export function inputSystem() {
  for (const id in players) {
    const v = velocities[id];
    if (v) {
      v.vx = 0;
      if (isKeyDown("ArrowLeft")) v.vx = v.vx - playerSpeed;
      if (isKeyDown("ArrowRight")) v.vx = v.vx + playerSpeed;
    }
  }
}
```

Save. Then in `main.ts`, call it from `update`, *before*
`movementSystem`:

```ts
import { inputSystem, movementSystem, renderSystem } from "./systems";

function update(dt: number) {
  inputSystem();
  movementSystem(dt);
}
```

Save. Reload the browser. Click on the page so the keyboard
focus is on it, then press the arrow keys.

**The ship moves.**

Walk through what just happened. Each frame:

1. `inputSystem` loops the `players` bucket — exactly one entity
   in it: the player. It looks up the player's Velocity, sets
   `vx` to 0, then bumps it left or right depending on which
   arrow is held.
2. `movementSystem` loops the `positions` bucket. The player
   has both a Position *and* a Velocity, so it runs the
   arithmetic and the player slides.
3. `renderSystem` draws everything with a Sprite.

Three systems. None of them know about each other. They meet at
the buckets.

## Step 5 — Keep the ship on the canvas

Right now you can hold left and walk the ship off the edge.
Add a small system that clamps the player back in:

```ts
import { WIDTH } from "./game";

export function clampPlayerSystem() {
  for (const id in players) {
    const p = positions[id];
    const s = sprites[id];
    if (p && s) {
      if (p.x < 0) p.x = 0;
      if (p.x > WIDTH - s.size) p.x = WIDTH - s.size;
    }
  }
}
```

Notice the loop walks `players`, *not* `positions`. The
clamp-to-canvas behavior is only for players (asteroids should
fall freely off both edges), so picking the smallest bucket is
both *correct* and faster.

Call it after `movementSystem`:

```ts
function update(dt: number) {
  inputSystem();
  movementSystem(dt);
  clampPlayerSystem();
}
```

Save. The ship now stops at the walls.

## Quick check

Look at `inputSystem`. Why does it do `v.vx = 0;` at the top of
each iteration — couldn't it just `v.vx = v.vx - playerSpeed`
when left is held?

<details><summary>Click for the answer</summary>

Because without the reset, `vx` would *accumulate* every frame.
At 60 frames per second, holding left for one second would give
the ship a `vx` of `60 * -400 = -24000` — instantly across the
screen.

`inputSystem` runs every frame and *overwrites* Velocity from
the raw key state. It's the simplest model: "the keys are what
you intend right now, ignore what you did last frame."

A different style — "press = accelerate, release = decelerate"
— would *not* reset to zero, and would also have a friction or
damping term. Velocity-based games like Asteroids work that
way. Ours uses the simpler instant-stop model. Either is fine
for an ECS; the choice is just gameplay feel.

</details>

## Quick check

Could `inputSystem` loop `velocities` instead of `players`?

```ts
for (const id in velocities) {
  if (!players[id]) continue;
  // ...
}
```

<details><summary>Click for the answer</summary>

Yes — it'd still work. But it'd be slower and conceptually
backwards.

There's one entity in `players` and (later in this track) up to
200 in `velocities`. Looping the bigger bucket and filtering down
to the player means doing 200 lookups to find one row, every
frame, forever.

The general rule: **loop the smallest bucket that contains the
entities you care about.** For input it's `players`. For
asteroid logic in Unit 4 it'll be `asteroids`. For movement it's
`positions` — but movement *wants* every moving entity, so it's
already smallest-for-the-job.

</details>

## Play with it

- Change the ship's color in the Sprite — `"#ff66cc"`. Save.
  Pink ship.
- Change `playerSpeed` to `200`. Save. Sluggish.
- Add an up/down option in `inputSystem`:

  ```ts
  v.vy = 0;
  if (isKeyDown("ArrowUp")) v.vy = v.vy - playerSpeed;
  if (isKeyDown("ArrowDown")) v.vy = v.vy + playerSpeed;
  ```

  Now you can fly anywhere. We won't keep that in the final
  game (the genre is "dodge from the bottom"), but it's a
  one-line proof that systems compose.

- Open the browser console and type
  `Object.keys(players).length`. You should see `1`. The marker
  bucket holds one row — the player's ID.

## On your own

### Challenge 1 — A second player

Add a *second* player entity with the same kind of setup but
different starting position. Walk through what happens when you
press an arrow key.

<details><summary>Hint</summary>

```ts
const player2 = createEntity();
positions[player2] = { x: 100, y: HEIGHT - 60 };
velocities[player2] = { vx: 0, vy: 0 };
sprites[player2] = { color: "#cc6633", size: 40 };
players[player2] = true;
```

Both ships move together when you press an arrow. Why? Because
`inputSystem` loops *every* entity in the `players` bucket and
sets each one's velocity from the same keys.

To split them — left-stick versus right-stick, basically —
you'd need a second marker (`type Controlled = "player1" |
"player2"`, or two separate marker buckets). That's outside
this track, but the shape is there: more component types let
you carve the world into finer slices.

Take the second player back out when you're done.

</details>

### Challenge 2 — A flame behind the ship

When the ship is moving, draw a small orange square just behind
it (below it, in canvas coordinates). When it's still, no
flame.

You *could* hardcode it inside `renderSystem`, but that's
ugly — drawing a flame is a different job from drawing every
entity. Cleaner: a new system, `flameSystem(ctx)`, that loops
the player marker and draws the flame if the ship is moving.

<details><summary>Hint — what to check, what to draw</summary>

```ts
export function flameSystem(ctx: Ctx) {
  for (const id in players) {
    const p = positions[id];
    const s = sprites[id];
    const v = velocities[id];
    if (p && s && v && v.vx !== 0) {
      ctx.fillStyle = "#ff8833";
      // A small flame below the ship, half its width, centered.
      ctx.fillRect(p.x + s.size / 4, p.y + s.size, s.size / 2, 10);
    }
  }
}
```

Call `flameSystem(ctx)` from `draw`, *after* `renderSystem` so
the flame doesn't get overwritten. Notice this system needs
three components on the same entity — Position, Sprite, and
Velocity. The `if (p && s && v && ...)` chain handles missing
ones gracefully.

</details>

## Troubleshooting

**The ship moves but doesn't stop.**
You probably forgot the `v.vx = 0;` reset at the top of the
input loop. Velocity is accumulating.

**The ship flickers off-screen on the first frame.**
Make sure `clampPlayerSystem()` is called *after*
`movementSystem(dt)` in `update`. Otherwise you clamp a
position the ship hasn't moved to yet.

**"Property 'vx' does not exist on type 'true'."**
You probably typed `players[id].vx` somewhere when you meant
`velocities[id].vx`. The marker bucket holds `true`, not data.

**Two ships move when you press left.**
That's expected if you ran Challenge 1. The input system loops
*all* entities in `players`. Remove the second player to go
back to one ship.

## What you just did

- Added a Sprite component and moved drawing into a
  `renderSystem`.
- Defined a **marker component** (`players`) and used it to tag
  the player entity.
- Wrote an `inputSystem` that loops the marker bucket and writes
  to Velocity rows.
- Wrote a `clampPlayerSystem` that keeps the player on the
  canvas.
- Noticed that picking the smallest bucket to loop is the
  cheapest way to write the system.

New words:

- **Marker component** / **tag** — a component with no data;
  presence is the whole signal.
- **Smallest-bucket loop** — pick the smallest bucket whose
  entities you actually care about as your `for...in` target.

## What's next

In [Unit 3](/track-6/unit-3) the canvas fills up. You'll write a
**spawner system** that drops a new asteroid every half-second,
and a **cleanup system** that destroys asteroids that fall off
the bottom. The Movement and Render systems you already have
will handle the rest — no changes. That's the ECS scaling
payoff.
