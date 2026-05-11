// The engine. You won't change this file (for now). It sets up
// the canvas, runs your code about 60 times per second, and
// tracks which keys are being pressed.
//
// Almost every line uses things you've met or will meet: `let`,
// `const`, `function`, `if`, `===`, `return`. A few pieces go
// beyond what the course teaches — they're normal parts of
// writing JavaScript for a browser:
//
// - `as HTMLCanvasElement` — a *type assertion*. You're telling
//   TypeScript "trust me, this element is a canvas." The browser
//   returns a generic element from `document.getElementById`, and
//   TypeScript wants you to be explicit when you narrow it.
// - `addEventListener` — how the browser tells your code about
//   things the user did, like pressing a key. You hand it a
//   function and it'll call your function when the event happens.
// - `requestAnimationFrame` — how the browser asks you to draw
//   the next frame, in time with the screen's refresh (about 60
//   times per second).
//
// You don't need to understand them to use the engine. The names
// you'll actually touch from `main.ts` are `start`, `isKeyDown`,
// `WIDTH`, `HEIGHT`, and `Ctx`.

const canvas = document.getElementById("game") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

export const WIDTH = canvas.width;
export const HEIGHT = canvas.height;
export type Ctx = CanvasRenderingContext2D;

// Keyboard tracking — one boolean per key the course uses.

let leftDown = false;
let rightDown = false;
let upDown = false;
let downDown = false;
let spaceDown = false;

function setKey(name: string, isDown: boolean) {
  if (name === "ArrowLeft") leftDown = isDown;
  if (name === "ArrowRight") rightDown = isDown;
  if (name === "ArrowUp") upDown = isDown;
  if (name === "ArrowDown") downDown = isDown;
  if (name === " ") spaceDown = isDown;
}

function onKeyDown(e: KeyboardEvent) {
  setKey(e.key, true);
}

function onKeyUp(e: KeyboardEvent) {
  setKey(e.key, false);
}

window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);

export function isKeyDown(key: string): boolean {
  if (key === "ArrowLeft") return leftDown;
  if (key === "ArrowRight") return rightDown;
  if (key === "ArrowUp") return upDown;
  if (key === "ArrowDown") return downDown;
  if (key === " ") return spaceDown;
  return false;
}

// The game loop. Calls your `update` and `draw` ~60 times per
// second, with `dt` measured in seconds since the previous frame.

export function start(
  update: (dt: number) => void,
  draw: (ctx: Ctx) => void,
): void {
  let last = performance.now();
  function loop(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    update(dt);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    draw(ctx);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
