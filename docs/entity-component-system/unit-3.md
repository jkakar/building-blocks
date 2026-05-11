# Unit 3 — A field of asteroids

End of Unit 2 you had one ship moving with the arrow keys. This
unit fills the screen.

The plan:

1. A new marker — `Asteroid` — so the game can tell rocks apart
   from everything else.
2. A **spawner system** that drops a new asteroid every half
   second.
3. A **cleanup system** that destroys asteroids that have fallen
   off the bottom.

The wow: `movementSystem` and `renderSystem` from Units 1 and 2
will handle the new asteroids without a single change.

## What you'll learn

- The **timer-pattern** you saw in Course 1 Unit 10, now wrapped
  in a system.
- How to **destroy** an entity properly across multiple
  component buckets.
- The `Number(id)` cast for the `for...in` string-key gotcha.
- Why ECS pays off: every existing system scales linearly with
  no rewrite.

## Step 1 — The Asteroid marker

In `components.ts`, add another marker bucket next to
`players`:

```ts
export const asteroids: { [id: number]: true } = {};
```

In `ecs.ts`, update `destroyEntity` so it cleans up the new
bucket too:

```ts
import {
  positions,
  velocities,
  sprites,
  players,
  asteroids,
} from "./components";

export function destroyEntity(id: number) {
  delete positions[id];
  delete velocities[id];
  delete sprites[id];
  delete players[id];
  delete asteroids[id];
}
```

Save. No visible change yet — there's no asteroid to mark.

::: tip Why two markers, not one Type field?
You might think: "Player and Asteroid are mutually exclusive —
why not one `type Kind = 'player' | 'asteroid'` component, with
a `kinds` bucket?"

Two reasons:

1. Tomorrow you'll add a "powerup," then a "boss," then a
   "bullet." Each new kind means changing the `Kind` type *and*
   every system that switches on it.
2. Markers compose. An entity can have *both* `players` and
   `shielded` (in the Unit 4 challenge). With a single Kind
   field, that'd require something like `"playerShielded"` —
   exponential blow-up.

The general rule: **one marker per orthogonal property**. If
two markers can be combined and the combination means something,
they belong as separate markers.
:::

## Step 2 — Spawning one asteroid

Before we automate, do it by hand once. In `main.ts`, *below*
the player setup, type this in:

```ts
import { asteroids } from "./components";

const a1 = createEntity();
positions[a1] = { x: 200, y: 0 };
velocities[a1] = { vx: 0, vy: 150 };
sprites[a1] = { color: "#aa8855", size: 30 };
asteroids[a1] = true;
```

Save. Reload the page. You should see a brown square fall from
the top of the canvas, drift past the ship, and walk off the
bottom edge.

**Stop and look at what just happened.** You added a new kind
of thing to the game — an asteroid. Different from the player.
Different velocity. Different color. A whole new entity type.

Now look at `systems.ts`. **Did you change anything in it?** No.
The `movementSystem` you wrote in Unit 1 moves the asteroid.
The `renderSystem` you wrote in Unit 2 draws it. Neither
function knows the word "asteroid." They see Position +
Velocity (move it), Position + Sprite (draw it). The new
entity *qualifies* for both buckets, so they handle it for
free.

This is the bet the whole architecture has been building
toward. In an OO version (Course 3), adding a new entity type
meant a new class. In a procedural version (Course 1), adding
a second moving thing meant copying every loop. Here, the
*data* is new; the *behavior* is unchanged.

When you're done staring at it, **delete** those five lines —
the spawner system in the next step will replace them. You
won't need them by hand anymore.

## Step 3 — A spawner system

In `systems.ts`, add this. At the top of the file, add `WIDTH`
to the imports from `./game`, then add the `createEntity`
import:

```ts
import { WIDTH } from "./game";
import { createEntity } from "./ecs";
import {
  positions,
  velocities,
  sprites,
  players,
  asteroids,
} from "./components";

// ...

let spawnTimer = 0;
const spawnInterval = 0.5;

export function spawnerSystem(dt: number) {
  spawnTimer = spawnTimer + dt;
  while (spawnTimer >= spawnInterval) {
    spawnTimer = spawnTimer - spawnInterval;
    spawnAsteroid();
  }
}

function spawnAsteroid() {
  const id = createEntity();
  const size = 20 + Math.floor(Math.random() * 30);
  positions[id] = { x: Math.random() * (WIDTH - size), y: -size };
  velocities[id] = { vx: 0, vy: 120 + Math.random() * 180 };
  sprites[id] = { color: "#aa8855", size };
  asteroids[id] = true;
}
```

Save. Then in `main.ts`:

```ts
import {
  inputSystem,
  movementSystem,
  clampPlayerSystem,
  spawnerSystem,
  renderSystem,
} from "./systems";

function update(dt: number) {
  inputSystem();
  movementSystem(dt);
  clampPlayerSystem();
  spawnerSystem(dt);
}
```

Save. Reload.

**Asteroids start falling, two per second**, at random
horizontal positions, with random speeds and sizes. Some go past
the ship; some you can dodge by moving. The screen fills up.

Walk through what the new system does, line by line:

- `spawnTimer = spawnTimer + dt;` — accumulate seconds.
- `while (spawnTimer >= spawnInterval)` — a *while*, not an
  *if*. If the frame was slow and `dt` was bigger than
  `spawnInterval`, this catches up by spawning multiple in one
  frame.
- Inside, decrement the timer and call `spawnAsteroid()`.

The `spawnAsteroid` helper does the five-line dance you did by
hand: create an entity, add four component rows. The
randomization makes each asteroid different.

::: tip Vocab: closed-over state
`spawnTimer` is a plain `let` at module scope inside
`systems.ts`. It's *not* a component on any entity; it's the
spawner system's own private bookkeeping.

Is that allowed in ECS? In a strict pure ECS, no — every piece
of mutable state would be a component. In practice, almost
every real ECS has a few of these for things that aren't really
about entities: a clock, a random seed, a spawn timer.

The judgement call: if the value would never appear on more
than one "thing in the world," it doesn't need to be a
component. `spawnTimer` is one number that the spawner system
alone owns. A loose `let` is fine.
:::

## Step 4 — A cleanup system

If you let the page run for a minute, you'll notice the
asteroids that fall off the bottom *never go away*. Their
component rows still exist; the systems keep iterating over
them. After enough time the loops slow down. By an hour the tab
would freeze.

Add a cleanup system. In `systems.ts`:

```ts
import { HEIGHT } from "./game";
import { destroyEntity } from "./ecs";

// ...

export function cleanupSystem() {
  for (const id in positions) {
    const p = positions[id];
    if (p.y > HEIGHT + 50) {
      destroyEntity(Number(id));
    }
  }
}
```

Save. Call it from `update`:

```ts
import {
  inputSystem,
  movementSystem,
  clampPlayerSystem,
  spawnerSystem,
  cleanupSystem,
  renderSystem,
} from "./systems";

function update(dt: number) {
  inputSystem();
  movementSystem(dt);
  clampPlayerSystem();
  spawnerSystem(dt);
  cleanupSystem();
}
```

Save. The browser doesn't *look* different — the asteroids
were already falling off the bottom. But now they're being
freed instead of piling up invisibly. Open the dev tools
console (`cmd + option + I`) and type
`Object.keys(positions).length`. Watch the number. It should
oscillate between low single digits and maybe twenty, never
trending up.

::: tip The `Number(id)` cast
That's the gotcha from Unit 1. `for (const id in positions)`
gives you `id` as a string, but `destroyEntity` is typed
`(id: number) => void`. Pass the string and TypeScript
complains.

`Number("42")` returns the number `42`. That's the simple fix,
and it lives at *every* call site where you hand a `for...in`
key to a function expecting a number. You'll write
`Number(id)` again in Unit 4's collision system.
:::

::: tip Why "off the bottom" not "off any edge"?
The cleanup system checks `p.y > HEIGHT + 50` — well below the
canvas — and nothing else. Why not also check the left, right,
or top?

In *this* game, no entity moves up or sideways off the canvas
on its own — asteroids fall straight down, the player can't
leave because `clampPlayerSystem` stops it. Any entity that
walks off the bottom is junk; nothing else does.

In a different game, the rule would change. A side-scrolling
shooter would clean up bullets that fly off the right. A
top-down game would clean up off-screen enemies. The system
*encodes a rule* — "what's the criteria for an entity being
done?" Different games, different criteria, same shape of
system.
:::

## Quick check

The spawner system uses a `while` loop, not an `if`. Why?

```ts
while (spawnTimer >= spawnInterval) {
  spawnTimer = spawnTimer - spawnInterval;
  spawnAsteroid();
}
```

<details><summary>Click for the answer</summary>

To survive slow frames. If the browser tab is backgrounded for
two seconds and then resumed, the next `dt` might be `2.0`. A
plain `if` would spawn *one* asteroid and leave 1.5 seconds of
budget on the floor. The `while` catches up — it spawns four
asteroids (one per 0.5-second budget) before falling back below
the threshold.

For our game it's a small thing. For a game where spawn timing
matters (a rhythm game, say), it'd matter a lot.

</details>

## Quick check

A friend asks: "if I wanted to give every asteroid a thin red
outline when its size is big, where would I add that code?"

<details><summary>Click for the answer</summary>

The natural answer is *inside `renderSystem`*. That's the
function that draws sprites, and a "big asteroid gets an
outline" rule is a rendering rule.

The slightly more ECS-y answer is: *give the asteroid an extra
component* — say, `outlines: { [id: number]: { color: string }
} = {};` — and have `renderSystem` (or a separate
`outlineSystem`) look for it. Now you can give an outline to
anything (a powerup, a boss, the player), not just big
asteroids.

The general split: **gameplay decisions** (which entities get an
outline) go into a system that *adds the component*. **Rendering
behavior** (what an outline looks like) goes into the render
side. Same as how this unit's spawner system *decides* to make
an asteroid, but the render system doesn't know spawner exists.

</details>

## Play with it

- Change `spawnInterval` to `0.1`. Twenty asteroids per second.
  The canvas turns into a brown blizzard. The frame rate still
  looks fine. (If it doesn't, your computer is heroic.)
- Change `spawnInterval` to `2.0`. Sparse field. Boring.
- Reach into `spawnAsteroid` and change the color to a random
  hex string:

  ```ts
  const colors = ["#aa8855", "#cc6633", "#996644"];
  // ...
  sprites[id] = {
    color: colors[Math.floor(Math.random() * colors.length)],
    size,
  };
  ```

  Each asteroid picks one color when it's born. They keep it
  for the rest of their lives — because Sprite is *data on the
  entity*, not a global the render system looks up.

- Bump the spawn rate so the canvas fills up, then open the
  console and run:

  ```js
  Object.keys(positions).length
  ```

  You'll see somewhere between 30 and 80 entities, depending on
  timing. Two thousand if you'd set `spawnInterval` to
  `0.01`. The systems don't care.

## On your own

### Challenge — A second cleanup system, for the top

The cleanup system runs *every entity that has a Position* and
checks `y > HEIGHT + 50`. Two things to notice:

1. It also runs for the player. The player can't fall off the
   bottom (the clamp keeps them on screen vertically — actually,
   it doesn't, but `y` is set once at startup and never
   changed). If the player *did* drift down past the canvas,
   the cleanup system would silently destroy them.
2. The check is "bottom only." What if you wanted to remove
   asteroids that drift off the *sides* too — say, if you add
   `vx` randomness in the challenge?

Tighten the cleanup. Make it loop the `asteroids` bucket (the
smallest one with the entities you actually want to clean) and
check both vertical and horizontal bounds.

<details><summary>Hint 1 — Loop the right bucket</summary>

```ts
export function cleanupSystem() {
  for (const id in asteroids) {
    const p = positions[id];
    if (
      p.y > HEIGHT + 50 ||
      p.x < -50 ||
      p.x > WIDTH + 50
    ) {
      destroyEntity(Number(id));
    }
  }
}
```

Now the player is safe from this system no matter what, because
the player is not in `asteroids`. That's a small refactor with
a big safety benefit: a bug in cleanup can only delete
asteroids, by construction.

</details>

<details><summary>Hint 2 — A subtle gotcha while looping and deleting</summary>

You're calling `destroyEntity` from inside a `for...in` loop
over the same bucket you're deleting from. Is that safe?

In JavaScript, `for...in` over an object whose keys you delete
during iteration is *defined* behavior — the loop sees the
keys that existed at the start, and `delete` just makes a key
absent. But for some kinds of mutation (adding keys, in some
engines) the behavior is implementation-specific. For our case
— deleting only — it's fine and matches what every browser
does.

The bullet-proof pattern, if you ever feel uneasy: collect the
IDs first, *then* destroy.

```ts
const dead: number[] = [];
for (const id in asteroids) {
  // ...checks...
  if (offscreen) dead.push(Number(id));
}
for (let i = 0; i < dead.length; i = i + 1) {
  destroyEntity(dead[i]);
}
```

A bit more code. Easier to reason about under heavy mutation.

</details>

## Troubleshooting

**The page lags after a minute.**
You forgot to call `cleanupSystem()` from `update`, or you
forgot to import it from `./systems`. Dead asteroids keep
piling up.

**`destroyEntity(id)` — "Argument of type 'string' is not
assignable to parameter of type 'number'."**
That's the `for...in` string-key thing. Wrap the call:
`destroyEntity(Number(id))`.

**Asteroids stop appearing after a few seconds.**
You probably called `destroyEntity` on the `asteroids` marker
without thinking, in the cleanup system, but on a check that
also accidentally matches the player (like `y > 500`). Print
`Object.keys(players).length` in the console — if it's `0`,
the player got destroyed. Tighten your cleanup check.

**The player flickers or jumps.**
Make sure `spawnerSystem(dt)` is called *after* `inputSystem`
and `movementSystem`. Order matters: input writes to velocity,
movement reads it. Spawn the new asteroids only after the
existing ones have moved this frame.

## What you just did

- Added the `Asteroid` marker and updated `destroyEntity` to
  clean it up.
- Wrote a `spawnerSystem` that creates new entities on a timer.
- Wrote a `cleanupSystem` that destroys entities that have left
  the canvas.
- Discovered the `Number(id)` cast for the `for...in`
  string-key gotcha.
- Made fifty asteroids fall, with zero changes to Movement or
  Render.

New words:

- **Cleanup system** — a system that destroys entities matching
  some "done" criterion.
- **Closed-over state** — module-level mutable variables a
  system owns privately. Like `spawnTimer`.

## What's next

In [Unit 4](/entity-component-system/unit-4) the ship and the asteroids start
interacting. You'll write a **collision system** that asks:
"for every player, for every asteroid, do their boxes
overlap?" You'll add lives and a Game Over screen, and the game
will *be a game*. The collision system is the first system in
this course that has to look at *two different markers* at
once — the cleanest demo of why systems compose.
