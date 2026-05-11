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
  if (isKeyDown("ArrowUp")) {
    y = y - 200 * dt;
  }
  if (isKeyDown("ArrowDown")) {
    y = y + 200 * dt;
  }

  // Keep the square inside the canvas (800 wide, 600 tall; square is 30).
  if (x < 0) {
    x = 0;
  }
  if (x > 800 - 30) {
    x = 800 - 30;
  }
  if (y < 0) {
    y = 0;
  }
  if (y > 600 - 30) {
    y = 600 - 30;
  }
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

start(update, draw);
