import { start, Ctx } from "./game";

function update(dt: number) {
  // Nothing happens here yet.
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(100, 100, 30, 30);
}

start(update, draw);
