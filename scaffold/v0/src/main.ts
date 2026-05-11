import { start, isKeyDown, Ctx } from "./game";

let x = 100;
let y = 100;

function update(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    x = x - 200 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    x = x + 200 * dt;
  }
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

start(update, draw);
