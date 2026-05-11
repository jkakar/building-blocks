// Systems — the verbs.
//
// Every system is a plain function. It reads from one or more
// component buckets, decides what to do, and writes back. None
// of them know about each other; they only know about data.
//
// The pattern in every system: `for (const id in someBucket)`
// loops the entity IDs that have at least the component you keyed
// off of. If the system needs *more* than one component on the
// same entity, it checks the other buckets explicitly:
// `if (velocities[id]) { ... }`.
//
// Heads-up about the loop. `for (const id in obj)` gives you the
// keys as **strings**, even when they look like numbers. We turn
// them back into numbers with `Number(id)` when we need a number
// (for example, when calling `destroyEntity(Number(id))`).

import { Ctx, WIDTH, HEIGHT, isKeyDown } from "./game";
import {
  positions,
  velocities,
  sprites,
  players,
  asteroids,
} from "./components";
import { createEntity, destroyEntity } from "./ecs";

// --- Movement: any entity with both Position and Velocity moves.

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

// --- Input: players read the arrow keys to set their velocity.

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

// --- Clamp the player to the canvas so they can't walk off.

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

// --- Spawner: drops a new asteroid every `interval` seconds.

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

// --- Cleanup: destroy anything that has fallen off the canvas.

export function cleanupSystem() {
  for (const id in positions) {
    const p = positions[id];
    if (p.y > HEIGHT + 50) {
      destroyEntity(Number(id));
    }
  }
}

// --- Collision: a Player hitting an Asteroid loses a life.
//
// We hand the system a callback so we don't have to import the
// game-state variables. Anything that wants to know "a hit
// happened" can pass a function.

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

// --- Render: any entity with Position and Sprite gets drawn.

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
