// The engine. You won't change this file (for now).
// It sets up the canvas, runs your code 60 times per second,
// and tracks which keys are being pressed.

type Ctx = CanvasRenderingContext2D;

const canvas = document.querySelector("#game") as HTMLCanvasElement | null;
if (!canvas) {
  throw new Error("Could not find <canvas id='game'> in index.html.");
}
const ctx = canvas.getContext("2d");
if (!ctx) {
  throw new Error("Could not get a 2D drawing context.");
}

export const WIDTH = canvas.width;
export const HEIGHT = canvas.height;

const keys = new Set<string>();
window.addEventListener("keydown", (e) => keys.add(e.key));
window.addEventListener("keyup", (e) => keys.delete(e.key));

export function isKeyDown(key: string): boolean {
  return keys.has(key);
}

type UpdateFn = (dt: number) => void;
type DrawFn = (ctx: Ctx) => void;

export function start(update: UpdateFn, draw: DrawFn): void {
  let last = performance.now();
  function loop(now: number) {
    const dt = (now - last) / 1000;
    last = now;
    update(dt);
    ctx!.clearRect(0, 0, WIDTH, HEIGHT);
    draw(ctx!);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

export type { Ctx };
