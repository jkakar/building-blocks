import { start, Ctx, WIDTH, HEIGHT } from "./game";
import { numberSignal, NumberSignal } from "./signal";

// --- State: every changing value is a signal --------------------

const count = numberSignal(0);
const clicksPerSecond = numberSignal(0);
const canAffordAuto = numberSignal(0);
const canAffordDouble = numberSignal(0);

// --- Persistence: signals save themselves to localStorage -------

function persist(name: string, sig: NumberSignal) {
  const saved = localStorage.getItem(name);
  if (saved !== null) {
    const parsed = Number(saved);
    if (!Number.isNaN(parsed)) {
      sig.set(parsed);
    }
  }
  sig.subscribe(() => {
    localStorage.setItem(name, String(sig.get()));
  });
}

persist("count", count);
persist("clicksPerSecond", clicksPerSecond);

// --- Derived values: react when their inputs change -------------
//
// "Can I afford the next upgrade?" depends on `count`. So every
// time `count` changes, we recompute and write to a signal of
// our own. Drawing reads that signal and colors the button.

const autoCost = 10;
const doubleCost = 100;

function recomputeCanAffordAuto() {
  canAffordAuto.set(count.get() >= autoCost ? 1 : 0);
}
function recomputeCanAffordDouble() {
  canAffordDouble.set(count.get() >= doubleCost ? 1 : 0);
}

count.subscribe(recomputeCanAffordAuto);
count.subscribe(recomputeCanAffordDouble);
recomputeCanAffordAuto();
recomputeCanAffordDouble();

// --- The big click button: a rectangle on the canvas -----------

const buttonX = 250;
const buttonY = 220;
const buttonW = 300;
const buttonH = 160;

const autoX = 80;
const autoY = 460;
const autoW = 280;
const autoH = 90;

const doubleX = 440;
const doubleY = 460;
const doubleW = 280;
const doubleH = 90;

const resetX = 700;
const resetY = 20;
const resetW = 80;
const resetH = 36;

const wipeX = 700;
const wipeY = 64;
const wipeW = 80;
const wipeH = 36;

function inRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// --- Mouse input: attached directly to the canvas --------------
//
// The engine doesn't expose mouse events. That's fine — the
// browser does, and we can listen ourselves. The trick: the
// canvas might be drawn at a different on-screen size than its
// internal pixel size, so we scale the click coordinates.

const canvas = document.getElementById("game") as HTMLCanvasElement;

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) * WIDTH) / rect.width;
  const y = ((e.clientY - rect.top) * HEIGHT) / rect.height;

  if (inRect(x, y, buttonX, buttonY, buttonW, buttonH)) {
    count.set(count.get() + 1);
    return;
  }
  if (inRect(x, y, autoX, autoY, autoW, autoH)) {
    if (count.get() >= autoCost) {
      count.set(count.get() - autoCost);
      clicksPerSecond.set(clicksPerSecond.get() + 1);
    }
    return;
  }
  if (inRect(x, y, doubleX, doubleY, doubleW, doubleH)) {
    if (count.get() >= doubleCost) {
      count.set(count.get() - doubleCost);
      clicksPerSecond.set(clicksPerSecond.get() * 2);
    }
    return;
  }
  if (inRect(x, y, resetX, resetY, resetW, resetH)) {
    count.set(0);
    return;
  }
  if (inRect(x, y, wipeX, wipeY, wipeW, wipeH)) {
    count.set(0);
    clicksPerSecond.set(0);
    return;
  }
});

// --- The game loop ---------------------------------------------

function update(dt: number) {
  // Auto-clickers: cps * dt blocks per frame. Smooth, even
  // though we only redraw and re-derive on whole-number changes.
  if (clicksPerSecond.get() > 0) {
    count.set(count.get() + clicksPerSecond.get() * dt);
  }
}

function drawButton(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  label: string,
  size: number,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "white";
  ctx.font = size + "px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x + w / 2, y + h / 2);
}

function draw(ctx: Ctx) {
  // Header: the count, big.
  ctx.fillStyle = "white";
  ctx.font = "72px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(Math.floor(count.get()) + " blocks", WIDTH / 2, 40);

  // Sub-header: blocks per second.
  ctx.font = "20px sans-serif";
  ctx.fillText(
    clicksPerSecond.get().toFixed(0) + " / sec",
    WIDTH / 2,
    130,
  );

  // The big click button.
  drawButton(ctx, buttonX, buttonY, buttonW, buttonH, "#3366cc", "CLICK", 48);

  // The auto-clicker upgrade.
  const autoFill = canAffordAuto.get() === 1 ? "#33aa55" : "#553333";
  drawButton(
    ctx,
    autoX,
    autoY,
    autoW,
    autoH,
    autoFill,
    "Auto +1/s (cost " + autoCost + ")",
    20,
  );

  // The doubler.
  const doubleFill = canAffordDouble.get() === 1 ? "#aa8833" : "#553333";
  drawButton(
    ctx,
    doubleX,
    doubleY,
    doubleW,
    doubleH,
    doubleFill,
    "Double /s (cost " + doubleCost + ")",
    20,
  );

  // Reset and wipe.
  drawButton(ctx, resetX, resetY, resetW, resetH, "#444", "reset", 16);
  drawButton(ctx, wipeX, wipeY, wipeW, wipeH, "#882222", "wipe", 16);
}

start(update, draw);
