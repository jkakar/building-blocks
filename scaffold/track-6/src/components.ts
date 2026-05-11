// Component types — the shapes — and their storage buckets.
//
// Each component type is a small data shape with no behavior.
// Each bucket is a plain object keyed by entity ID. To check if
// entity 42 has a Position, you read `positions[42]`. To add one
// you write `positions[42] = { x: 0, y: 0 };`. To remove it,
// `delete positions[42];`.
//
// Marker components (Player, Asteroid) don't carry data — they
// just say "this entity is a player" or "this entity is an
// asteroid." We store `true` as the value; the only thing systems
// ever ask is "is this key present?"

export type Position = { x: number; y: number };
export type Velocity = { vx: number; vy: number };
export type Sprite = { color: string; size: number };

export const positions: { [id: number]: Position } = {};
export const velocities: { [id: number]: Velocity } = {};
export const sprites: { [id: number]: Sprite } = {};
export const players: { [id: number]: true } = {};
export const asteroids: { [id: number]: true } = {};
