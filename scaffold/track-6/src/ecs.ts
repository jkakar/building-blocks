// The Entity-Component-System core.
//
// - An **entity** is just a number. `createEntity()` hands out
//   the next one.
// - A **component** is plain data — a `Position`, a `Velocity`.
//   The shapes live in `components.ts`. The storage lives there
//   too: each component type has its own bucket (a plain object
//   keyed by entity ID).
// - A **system** is a function that walks the buckets and does
//   one job. Systems live in `systems.ts`.
//
// This file holds only the entity helpers, because they're the
// only ECS code that isn't about a specific component or a
// specific job.

import {
  positions,
  velocities,
  sprites,
  players,
  asteroids,
} from "./components";

let nextId = 1;

export function createEntity(): number {
  const id = nextId;
  nextId = nextId + 1;
  return id;
}

// Destroying an entity means deleting its row from every
// component bucket. Forget one and the entity is half-alive — it
// still has a Velocity, say, but no Position. Systems would skip
// it silently. We keep the list of buckets here, in one place,
// so adding a new component type means updating one function.

export function destroyEntity(id: number) {
  delete positions[id];
  delete velocities[id];
  delete sprites[id];
  delete players[id];
  delete asteroids[id];
}
