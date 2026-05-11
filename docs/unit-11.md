# Unit 11 — Explosions when a brick dies

When you smash a brick right now, it just *disappears*. That's
fine, but it's flat. In Unit 11 every dying brick explodes into a
handful of small particles that fly out, slow down, and fade away.
This is the unit where the game starts to feel *juicy*.

After this unit, **v4**.

## What you'll learn

- A new array — `particles` — of small, short-lived objects.
- The **lifecycle** pattern: spawn → live → expire.
- Transparency / fading via `rgba(...)`.
- A useful trick: iterating a list **backwards** when you might
  remove items from it.

## Step 1 — Set up the particles array

Add this near the top of `main.ts`, where the other state lives:

```ts
let particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
```

A particle has a position (`x`, `y`), a velocity (`vx`, `vy`), and
a **`life`** — how many seconds it has left. When `life` hits zero,
the particle is dead and gets removed from the array.

We don't fill the array yet. Particles get *created* (spawned) at
the moment a brick dies, and *removed* when their life runs out.

## Step 2 — Spawn particles when a brick dies

Add a helper function that creates 8 particles at a given position:

```ts
function spawnParticles(centerX: number, centerY: number) {
  for (let i = 0; i < 8; i++) {
    particles.push({
      x: centerX,
      y: centerY,
      vx: (Math.random() - 0.5) * 400,
      vy: (Math.random() - 0.5) * 400,
      life: 0.5,
    });
  }
}
```

The interesting math here:

- `Math.random() - 0.5` produces a number from `-0.5` to `+0.5`.
  Times `400`, that's `-200` to `+200`. So each particle flies off
  in a random direction at up to 200 pixels per second.
- `life: 0.5` — half a second. Long enough to see, short enough to
  not clutter.

Call `spawnParticles` from `updateBricks`, right after `brick.hp =
brick.hp - 1;` — but only when the brick actually dies:

```ts
brick.hp = brick.hp - 1;
if (brick.hp <= 0) {
  aliveCount = aliveCount - 1;
  spawnParticles(brick.x + brick.width / 2, brick.y + brick.height / 2);
}
```

The position passed in is the *center* of the brick:
`brick.x + brick.width / 2` is the horizontal center;
`brick.y + brick.height / 2` is the vertical center. Particles fan
out from the middle of where the brick was.

Save. Nothing visible changes yet — the particles get *added* to
the array but we don't move them or draw them.

## Step 3 — Update and draw particles

Add this helper:

```ts
function updateParticles(dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x = p.x + p.vx * dt;
    p.y = p.y + p.vy * dt;
    p.life = p.life - dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}
```

Two new patterns to notice:

**Iterating backwards.** Instead of `for (let i = 0; i < ...; i++)`
this loop counts *down* from the end: `for (let i = particles.length
- 1; i >= 0; i--)`. Why? Because we sometimes remove a particle
from the array (the `splice` call). If you remove the item at
index `i` while going forward, the next item shifts into position
`i` and you skip it. Going backwards avoids that — items not yet
visited are at lower indices and don't move when you splice.

**`particles.splice(i, 1)`.** This removes 1 item from the array
starting at position `i`. It's how you take a particle out of the
list when its life runs out.

Now draw the particles. Add:

```ts
function drawParticles(ctx: Ctx) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const alpha = p.life / 0.5;
    ctx.fillStyle = "rgba(255, 165, 0, " + alpha + ")";
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
  }
}
```

Each particle is a 4×4 orange square. The interesting bit:
`rgba(255, 165, 0, alpha)` is a color with **transparency**. The
first three numbers are red, green, blue (0 to 255 each); the
last is the alpha (0 = fully see-through, 1 = fully opaque).

`alpha = p.life / 0.5` makes the particle fade out over its
lifetime: when life is 0.5 (just spawned), alpha is 1.0 (fully
visible). When life is 0 (about to die), alpha is 0 (invisible).

Call both from `update` and `draw`:

```ts
function update(dt: number) {
  if (gameState === "gameOver" || gameState === "won") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  updatePaddle(dt);
  updateBricks(dt);
  updateBall(dt);
  updateParticles(dt);
}

function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawBricks(ctx);
  drawParticles(ctx);
  drawHud(ctx);
  // ... game over / won screens ...
}
```

Save. **Smash a brick.** Eight tiny orange squares fly out, slow
down, and fade away.

The game just got a lot more satisfying.

## Step 4 — Reset particles on restart

Make sure particles get cleared when the player restarts:

```ts
function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  timeSinceLastFall = 0;
  particles = [];
  resetBall();
  buildBricks();
}
```

## Step 5 — Play with it

- Spawn more particles per brick: change `i < 8` to `i < 30`.
- Make particles faster: `* 800` instead of `* 400`.
- Make them last longer: `life: 1.5` (and update the alpha math
  to divide by 1.5).
- Bigger particles: change the 4 in `fillRect(p.x - 2, p.y - 2,
  4, 4)` to 8 (and the -2 to -4 so they stay centered).
- Different color per brick row — make particles match the brick
  they came from. (You'd need to pass a color in to
  `spawnParticles`.)

## On your own

### Challenge 1 — Gravity on the particles

Make the particles fall as they fly out. Each frame, *add* a
little to `vy`, so over time they all drift downward. That gives
the explosion a more natural "blown up and falling" feel.

<details><summary>Hint</summary>

In `updateParticles`, before updating position, add something like
`p.vy = p.vy + 800 * dt;` to each particle. That accelerates them
downward at 800 pixels-per-second-squared (which is a fairly
strong gravity). Tune the number.

</details>

### Challenge 2 — Trails behind the ball

Spawn a small particle at the ball's position every frame
(or every few frames). It gives the ball a comet-like trail.

<details><summary>Hint</summary>

In `updateBall` or `update`, add one particle at the ball's
position each frame, with very small `vx` and `vy` (or zero) and
a short `life`. Reuse `spawnParticles` if you want — though it
spawns 8 at once, which might be too many. You could write a new
`spawnTrailParticle(x, y)` helper that spawns just one.

</details>

## What you just did

- Created your second array of objects (after bricks), but this
  one is *dynamic* — items appear and disappear over the life of
  the game.
- Used the **lifecycle pattern**: spawn → update → expire.
- Drew with **transparency** using `rgba(...)`.
- Iterated an array **backwards** to safely remove items while
  iterating.

New words:

- **Lifecycle** — the pattern of "created, lives for a while, gets
  removed." Particles are the simplest example. Bullets, enemies,
  power-ups, sounds — almost everything in a game has a lifecycle.
- **Alpha** — how transparent something is. `0` is invisible,
  `1` is fully opaque.
- **`.splice(i, 1)`** — array method that removes 1 item starting
  at index `i`.

## What's next

In Unit 12 some destroyed bricks **drop a power-up** that floats
down. Catching one on the paddle gives the player something fun —
wider paddle, multi-ball, etc. New things: a second kind of
dynamic object, plus *temporary* effects (the paddle is wide for
10 seconds, then goes back). This is **v5**.
