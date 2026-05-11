import { isKeyDown, Ctx } from "./game";

// A simple "rectangle" shape — useful for collision checks
// without having to pass four loose numbers around.
export type Rect = { x: number; y: number; width: number; height: number };

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number = 400;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update(dt: number) {
    if (isKeyDown("ArrowLeft")) {
      this.x = this.x - this.speed * dt;
    }
    if (isKeyDown("ArrowRight")) {
      this.x = this.x + this.speed * dt;
    }
    if (this.x < 0) {
      this.x = 0;
    }
    if (this.x > 800 - this.width) {
      this.x = 800 - this.width;
    }
  }

  // Does the given rectangle overlap this paddle?
  intersects(rect: Rect): boolean {
    return (
      rect.x + rect.width > this.x &&
      rect.x < this.x + this.width &&
      rect.y + rect.height > this.y &&
      rect.y < this.y + this.height
    );
  }

  draw(ctx: Ctx) {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
