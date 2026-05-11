# Unit 4 — Collisions and lives

End of Unit 3 you had a green ship and a falling brown blizzard
— but they didn't interact. Asteroids passed straight through
the ship. This unit makes the ship *take damage*.

The new piece is a **collision system**. Every system so far has
looped *one* bucket. Collision is the first system in this track
that walks *two* — players and asteroids — and asks "do any of
these overlap any of those?"

By the end you'll have a real game: 3 lives, Game Over, restart
on space.

## What you'll learn

- How to write a **two-bucket** system without generics or
  fancy queries.
- How systems talk to game-level state (lives, score) without
  knowing about it directly.
- How to **destroy** an entity safely from inside a loop.

## Step 1 — Box overlap

Add an AABB ("axis-aligned bounding box") test to
`systems.ts` — a plain helper you'll use in the collision
system:

```ts
function overlaps(
  ax: number,
  ay: number,
  asize: number,
  bx: number,
  by: number,
  bsize: number,
): boolean {
  return (
    ax < bx + bsize && ax + asize > bx && ay < by + bsize && ay + asize > by
  );
}
```

If you've done Track 1 Unit 7 (bricks) or Track 3 Unit 2, this
math should look familiar — it's the same paddle-vs-ball check,
generalized to "two squares of any size."

Read each condition:

- `ax < bx + bsize` — A's left edge is left of B's right edge.
- `ax + asize > bx` — A's right edge is right of B's left edge.
- Same for the vertical edges.

All four true at once means the boxes overlap.

::: tip Vocab: AABB
**AABB** stands for *axis-aligned bounding box* — a rectangle
whose sides line up with the X and Y axes (no rotation). Most
2D games approximate collision with AABBs because the math is
fast: four comparisons, no square roots.

Real games often use a *smaller* AABB than the visible sprite —
say, 80% the size — so a clipped corner doesn't count as a hit.
That makes the game *feel* fair. We'll keep ours at 100% for
simplicity, but you can tighten yours in the challenge.
:::

## Step 2 — The collision system

Below the `overlaps` helper, add:

```ts
export function collisionSystem(onHit: () => void) {
  for (const playerId in players) {
    const pp = positions[playerId];
    const ps = sprites[playerId];
    if (!pp || !ps) continue;
    for (const asteroidId in asteroids) {
      const ap = positions[asteroidId];
      const as = sprites[asteroidId];
      if (!ap || !as) continue;
      if (overlaps(pp.x, pp.y, ps.size, ap.x, ap.y, as.size)) {
        destroyEntity(Number(asteroidId));
        onHit();
      }
    }
  }
}
```

Save. Read it slowly. There's only one new shape here — *nested
loops over two buckets* — and the rest is patterns you've seen.

- The outer loop walks `players` — exactly one row, usually.
- For each player, the inner loop walks `asteroids` — 0 to 200
  rows, depending.
- For each (player, asteroid) pair, we pull the Position and
  Sprite of both, and check `overlaps`.
- On hit: destroy the asteroid, and call the `onHit` callback.

The callback is the trick. The collision system doesn't know
about `lives` or `gameState` — those live in `main.ts`. Rather
than import them and tangle the system with game-wide
variables, we let `main.ts` hand the system a function: "do
this when a hit happens."

::: tip Vocab: dependency by callback
Passing a function as an argument is a way to *invert* a
dependency. The collision system *needs* to know "what should
happen on a hit?" but it doesn't need to know what *kind* of
thing should happen — losing a life, playing a sound, sending
a network message. By taking a `onHit: () => void` parameter
it stays usable in any of those games.

A real ECS often uses an **event queue** instead of a callback:
"push a HitEvent into a queue, and other systems read the
queue." Same idea, more decoupled. For us, one callback is
plenty.
:::

::: tip Why destroy from *inside* the loop?
We're calling `destroyEntity(Number(asteroidId))` while we're
still iterating over `asteroids`. The same question came up at
the end of Unit 3.

JavaScript's `for...in` over an object handles deletes from
the same iteration cleanly: the loop sees keys that existed
when the iteration began, and once you've deleted one it's
just absent. If we *added* keys during the loop, the result
would depend on the engine — but we don't. So this is safe.

If you ever feel uneasy, fall back to the "collect, then
delete" pattern from Unit 3's challenge.
:::

## Step 3 — Lives, score, and Game Over

In `main.ts`, you need a few module-level variables and a
restart helper. Add them just below your imports:

```ts
let lives = 3;
let score = 0;
let gameState: "playing" | "gameOver" = "playing";

function loseLife() {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  }
}
```

`loseLife` is the function you'll hand to `collisionSystem`. The
type signature matches: `() => void`.

Now restart. When the player presses space after Game Over, we
need to:

1. Destroy every asteroid still on screen.
2. Re-center the ship.
3. Reset `lives`, `score`, and `gameState`.

```ts
function restartGame() {
  for (const id in asteroids) {
    destroyEntity(Number(id));
  }
  positions[playerId] = { x: WIDTH / 2 - 20, y: HEIGHT - 60 };
  velocities[playerId] = { vx: 0, vy: 0 };
  lives = 3;
  score = 0;
  gameState = "playing";
}
```

Notice: the player entity is *not* destroyed and re-created.
Its component rows are *reset*. That's a perfectly valid ECS
move — components are just data, and resetting them is one
write per row.

::: tip Why is the player not destroyed and re-created?
Either approach works. Resetting is one frame of churn fewer
(no new ID, no fresh allocations) and matters more in big
games. It also keeps the special `playerId` variable in
`main.ts` valid — destroying the player would invalidate it
and you'd need to remember to update it.

In the bigger-engine world, "destroy and re-create" is the
typical pattern when an entity changes archetype (gains or
loses components). "Reset" is typical when only the *values* of
existing components change.
:::

## Step 4 — Wire it all up

Update `update` to use the new state machine and the new
system. You'll also start counting score as time-alive.

In `main.ts`:

```ts
import { isKeyDown } from "./game";
import {
  inputSystem,
  movementSystem,
  clampPlayerSystem,
  spawnerSystem,
  cleanupSystem,
  collisionSystem,
  renderSystem,
} from "./systems";

function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  score = score + dt;
  inputSystem();
  movementSystem(dt);
  clampPlayerSystem();
  spawnerSystem(dt);
  collisionSystem(loseLife);
  cleanupSystem();
}
```

The order in `update` matters a little:

- `inputSystem` — set the player's velocity from the keys.
- `movementSystem` — apply velocity to position.
- `clampPlayerSystem` — keep the player on screen.
- `spawnerSystem` — drop new asteroids.
- `collisionSystem` — *now* check for hits, after everyone has
  moved this frame.
- `cleanupSystem` — finally, sweep up anyone who fell off.

Save. The game still draws the same — you haven't drawn the HUD
or Game Over screen yet.

## Step 5 — Draw the HUD and Game Over

Add the HUD helpers to `main.ts`:

```ts
function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Lives: " + lives, 10, 10);
  ctx.fillText("Score: " + Math.floor(score), 700, 10);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 30);
  ctx.font = "20px sans-serif";
  ctx.fillText("Press space to restart", WIDTH / 2, HEIGHT / 2 + 30);
}

function draw(ctx: Ctx) {
  renderSystem(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}
```

Save. **You have a game.**

Move the ship. The score climbs in seconds. Take three hits and
the screen says Game Over. Press space — the screen clears, the
ship recenters, the asteroids start fresh.

Take a minute to stare at it. Compare to the Track 1
brick-breaker. Same number of components (paddle, ball,
bricks). Wildly different *peak entity count*: brick-breaker
caps around 30; this game easily hits 100+ at once.

The ECS isn't doing anything fancier than what loose variables
could do. The win is *organization*: each piece of behavior is
a system, each piece of state is a component, and the systems
compose without knowing about each other.

::: tip Vocab: archetype (again, slightly more useful)
You met the word in Unit 1. Now it carries weight: this game
has effectively three archetypes.

- The **player**: Position + Velocity + Sprite + Player marker.
- An **asteroid**: Position + Velocity + Sprite + Asteroid
  marker.
- (Nothing else, until you add powerups.)

A real ECS often stores components *grouped by archetype* so
that loops can skip whole groups they don't care about. We're
doing the simple bucket-per-component-type thing; archetypes are
only conceptual here, not a runtime feature. The word still
helps you reason: "this system applies to entities with the
archetype Position + Player," for instance.
:::

## Quick check

The collision system has nested loops. If there are 100
asteroids and 1 player, how many `overlaps` calls happen per
frame?

<details><summary>Click for the answer</summary>

100. The outer loop runs once (one player), the inner loop runs
100 times. The system is **O(players × asteroids)**.

If you had 2 players, it'd be 200. If you had 100 enemies
shooting 100 bullets and checked bullets-vs-enemies, that's
10,000 — still fine on modern hardware for an arcade game, but
the cost grows fast.

Real engines fix this with **spatial partitioning** — divide the
canvas into a grid, and only check pairs that share a cell.
Trades simplicity for speed. We don't need it.

</details>

## Quick check

You want to add **lasers** the player can fire — a new entity
type that destroys asteroids on contact (instead of the player
losing a life). How do you fit lasers into the ECS?

<details><summary>Click for the answer</summary>

1. A new marker: `export const lasers: { [id: number]: true }
   = {};`.
2. Update `destroyEntity` to delete the laser row.
3. A *second* collision system — `laserCollisionSystem` — that
   walks `lasers` (outer loop), then `asteroids` (inner loop),
   and on overlap destroys *both* the laser and the asteroid.
   No `onHit` callback needed if losing a life isn't the
   outcome.
4. A spawn point: when the player presses space (mid-game), the
   `inputSystem` or a separate `fireSystem` creates a new
   entity with Position (from the player), Velocity (upward),
   Sprite (a small red square), and the `lasers` marker.

That's a whole new gameplay loop in *four small changes*. No
existing system needs to know about lasers — `movementSystem`,
`renderSystem`, `cleanupSystem` will all do the right thing
because lasers have the components those systems care about.

</details>

## Play with it

- Reduce `spawnInterval` to `0.1` — twenty asteroids per
  second. Brutal. Score climbs fast.
- Make the player invincible for testing. In `loseLife`, comment
  out the body and `console.log("ouch")` instead. The ship
  takes hits without losing.
- Make `loseLife` *also* destroy the asteroid that hit. Wait —
  it already does, that's `destroyEntity` in the collision
  system. What if you wanted the asteroid to *bounce* instead?
  Hint: don't destroy it; flip `velocities[asteroidId].vy`.
  Quick way to feel "the collision system is gameplay
  policy."
- Open the dev tools and watch `Object.keys(asteroids).length`
  during play. It should hover around 20 to 50 depending on
  spawn rate and how fast you let them fall past.

## On your own

::: tip Vocab: temporary-state pattern
Powerups, stuns, burn damage, brief invulnerability windows —
they all need to *time out* after some seconds. The ECS way to
build a temporary state is: a component that holds a `remaining`
number, plus a system that decrements it each frame and removes
the component when it hits zero. The challenge below uses this
pattern for a shield; once you've seen it, you'll reach for it
constantly.
:::

### Challenge — A shield powerup

A shield is a temporary "you don't lose a life when hit"
state. The natural ECS way to model it is a *marker* —
`shielded: { [id: number]: true } = {};` — that the collision
system checks before calling `onHit`.

The full design:

1. Add a `shielded` marker bucket and update `destroyEntity`.
2. The collision system, on overlap, checks `shielded[playerId]`
   *before* calling `onHit`. If shielded, the asteroid is still
   destroyed (the shield "absorbs" it) but no life is lost.
3. A spawn rule: every 10 seconds, spawn a *powerup* — a blue
   square that falls like an asteroid but is marked `powerups`
   instead.
4. A *powerup-collision* system: on player-vs-powerup overlap,
   destroy the powerup, set `shielded[playerId] = true;`, and
   start a timer to clear it.

Take it as far as you'd like. A full shield-with-timer is a lot
for one challenge. The first hint sketches the minimum
absorb-and-clear; the second sketches the timer.

<details><summary>Hint 1 — Just the absorb, no timer</summary>

If you want to feel the mechanism with the least code:

- Add `shielded` to `components.ts` and `destroyEntity`.
- Press `s` to toggle the shield manually. (`isKeyDown` doesn't
  know about `s` — but if you only need a one-shot toggle, use
  the dev console: `players` is still in scope if you import it.)
  Or extend the engine's key list — also valid.
- In `collisionSystem`, change:

  ```ts
  if (overlaps(...)) {
    destroyEntity(Number(asteroidId));
    if (!shielded[playerId]) {
      onHit();
    }
  }
  ```

  Now while `shielded` is on, you absorb hits.

The "shield expires" part is the next hint.

</details>

<details><summary>Hint 2 — A timer in a component</summary>

A clean way to handle "this state ends after N seconds" is to
make the shield component carry the data:

```ts
export type Shield = { remaining: number };
export const shields: { [id: number]: Shield } = {};
```

Then a `shieldTimerSystem(dt)` decrements `remaining` for every
shielded entity, and `delete shields[id];` when it hits zero.

```ts
export function shieldTimerSystem(dt: number) {
  for (const id in shields) {
    shields[id].remaining = shields[id].remaining - dt;
    if (shields[id].remaining <= 0) {
      delete shields[id];
    }
  }
}
```

This is the *general* ECS move for "temporary state": a
component with a `remaining` timer plus a system that ages it.
Stun effects, burn damage, brief invulnerability windows —
they're all variations on this.

</details>

## Troubleshooting

**The ship loses lives instantly when the game starts.**
The player spawns on top of an asteroid the spawner just made,
*and* the collision system runs in the same frame. Move the
spawner call below the collision call:

```ts
collisionSystem(loseLife);
spawnerSystem(dt);
```

Or start the player closer to the bottom edge, away from the
spawn zone. Or have the spawner skip its first half-second so
the player has a beat to react.

**Game Over appears but space doesn't restart.**
Make sure `update` checks `gameState === "gameOver"` and calls
`restartGame()`. Also check that `restartGame` actually sets
`gameState = "playing"` — without that line, the game stays
frozen.

**Score is something like `13.4823`.**
That's `score = score + dt` with `dt` in seconds. Display
`Math.floor(score)` in the HUD (or round it however you'd
like). The internal value is fine as a float.

**"Cannot read properties of undefined (reading 'x')."**
You probably called `collisionSystem` *before*
`movementSystem`, and your iteration ordering happened to look
up a position that was already cleaned up earlier in the frame.
Order the systems input → movement → spawn → collision →
cleanup.

## What you just did

- Wrote a **collision system** that nests two `for...in` loops
  — the first system in this track to combine two markers.
- Added game-level state (`lives`, `score`, `gameState`) outside
  of any component bucket.
- Wired a callback (`loseLife`) into the collision system so it
  can affect game state without knowing about it.
- Restart logic, HUD, and Game Over screen.

New words:

- **AABB** — axis-aligned bounding box. The simplest 2D
  collision shape.
- **Callback** — a function passed as a parameter so the
  receiver can call it without knowing what it does.
- **Spatial partitioning** — speeding up pair-checks by only
  comparing nearby things. Not built here; worth knowing about.

## What this whole track was about

Four short units. Each one cashed in a piece of the ECS bet:

- **Unit 1** — *Data, separate from behavior.* Components live
  in buckets keyed by entity ID. Systems are stateless functions
  over the buckets. Moving an entity is the same code whether
  there's one or a thousand.
- **Unit 2** — *Marker components.* Some "components" carry no
  data; their presence is the signal. Markers let systems pick
  the smallest meaningful bucket to loop.
- **Unit 3** — *Spawning at scale.* One spawner system makes a
  new entity every half-second. Movement and Render handle it
  for free, because they only care about components, not
  identity.
- **Unit 4** — *Two-bucket systems.* Collision pairs entities
  across markers. Game state lives outside the ECS, plugged in
  through a callback.

The big idea: **identity is just an ID; what an entity *is*, is
what components it has.** Drop a `lasers` marker on an entity
and the laser-systems pick it up. Strip a `velocities` row off
and the movement system ignores it. Composition is by
attribute, not by inheritance.

That shape — entities, components, systems — shows up across
modern game engines (Unity DOTS, Bevy, Flecs, Overwatch's
internal engine) and in some weird non-game places too: stream
processing, certain databases, GPU shader pipelines. Different
names, same shape: separate the data from the procedures that
walk it, and write the procedures so they don't care where
they're called from.

Track 6 done. The asteroid field stays in your folder — open
any of the system files, swap a number, save, and watch
something else happen. The bones are real.
