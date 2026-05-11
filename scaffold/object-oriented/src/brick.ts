import { Ctx } from "./game";
import { Rect } from "./paddle";

// The base Brick: one hit and it's gone. Subclasses override
// `draw` and `onHit` to change how a brick looks and what
// happens when the ball touches it.

export class Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean = true;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // The same shape Paddle uses, so the Ball's collision code
  // doesn't care whether it's hitting a paddle or a brick.
  intersects(rect: Rect): boolean {
    return (
      rect.x + rect.width > this.x &&
      rect.x < this.x + this.width &&
      rect.y + rect.height > this.y &&
      rect.y < this.y + this.height
    );
  }

  // Called by the game loop when the ball touches this brick.
  // The default: die immediately. Subclasses can override to do
  // something else first.
  onHit(_others: Brick[]) {
    this.alive = false;
  }

  draw(ctx: Ctx) {
    if (!this.alive) return;
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// ToughBrick takes two hits before it dies. It overrides `draw`
// (different color, and the color *changes* once it's been hit
// once) and `onHit` (decrement hp; only die when hp hits zero).

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

// BombBrick destroys every other brick within a small radius of
// its center when it's hit. (Bricks don't have to ask the world
// what's nearby — the game loop hands them the full brick list
// through `onHit`.)

export class BombBrick extends Brick {
  onHit(others: Brick[]) {
    this.alive = false;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const radius = 90;
    for (const other of others) {
      if (other === this) continue;
      if (!other.alive) continue;
      const ox = other.x + other.width / 2;
      const oy = other.y + other.height / 2;
      const dx = ox - cx;
      const dy = oy - cy;
      if (dx * dx + dy * dy < radius * radius) {
        other.alive = false;
      }
    }
  }

  draw(ctx: Ctx) {
    if (!this.alive) return;
    ctx.fillStyle = "#e53935";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(this.x + 12, this.y + 6, this.width - 24, this.height - 12);
  }
}
