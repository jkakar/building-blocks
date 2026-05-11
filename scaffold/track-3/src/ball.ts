import { Ctx } from "./game";
import { Paddle } from "./paddle";

// What `update` reports back to the game loop after one step:
// did the ball stay alive, and did it hit the paddle this frame?
export type BallStep = { alive: boolean; hitPaddle: boolean };

// One Ball: position, velocity, and the logic to move and draw
// itself. Each instance carries its own state, so a game with
// three balls is three Ball instances, not three sets of
// variables.

export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number = 30;
  color: string;

  constructor(x: number, y: number, vx: number, vy: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
  }

  update(dt: number, paddle: Paddle): BallStep {
    this.x = this.x + this.vx * dt;
    this.y = this.y + this.vy * dt;

    if (this.x < 0) {
      this.x = 0;
      this.vx = -this.vx;
    }
    if (this.x > 800 - this.size) {
      this.x = 800 - this.size;
      this.vx = -this.vx;
    }
    if (this.y < 0) {
      this.y = 0;
      this.vy = -this.vy;
    }

    let hitPaddle = false;
    if (
      paddle.intersects({
        x: this.x,
        y: this.y,
        width: this.size,
        height: this.size,
      })
    ) {
      this.vy = -Math.abs(this.vy);
      this.y = paddle.y - this.size;
      hitPaddle = true;
    }

    if (this.y > 600) {
      return { alive: false, hitPaddle: hitPaddle };
    }
    return { alive: true, hitPaddle: hitPaddle };
  }

  draw(ctx: Ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
