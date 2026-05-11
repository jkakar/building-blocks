// Achievements. This file is a pure *subscriber*: it listens to
// events from the game and decides when to congratulate the
// player. The game code in main.ts does not know this file
// exists, except for one line that calls `drawAchievements` so
// the toasts appear on top.

import { on } from "./events";
import { Ctx } from "./game";

// Each toast is a little message that fades out over a few
// seconds. We remember the text it shows and the time it was
// born so we can compute its age each frame.
type Toast = { text: string; bornAt: number };
let toasts: Toast[] = [];

const TOAST_LIFETIME = 3; // seconds before a toast disappears

function showToast(text: string) {
  toasts.push({ text: text, bornAt: performance.now() });
}

// Counters used by achievement rules.
let paddleHits = 0;
let paddleHitsInARow = 0;
let unlockedPongMaster = false;
let unlockedUntouchable = false;

// Achievement rules. Each rule subscribes to whatever events it
// cares about and calls `showToast` when its condition is met.

on("ball:paddle-hit", () => {
  paddleHits = paddleHits + 1;
  paddleHitsInARow = paddleHitsInARow + 1;

  if (!unlockedPongMaster && paddleHits >= 10) {
    unlockedPongMaster = true;
    showToast("Pong Master: 10 paddle hits!");
  }
  if (!unlockedUntouchable && paddleHitsInARow >= 10) {
    unlockedUntouchable = true;
    showToast("Untouchable: 10 in a row!");
  }
});

on("ball:lost", () => {
  paddleHitsInARow = 0;
});

on("game:restart", () => {
  paddleHits = 0;
  paddleHitsInARow = 0;
  unlockedPongMaster = false;
  unlockedUntouchable = false;
  toasts = [];
});

// Drawing. main.ts calls this once per frame, after everything
// else, so toasts sit on top of the game.

export function drawAchievements(ctx: Ctx) {
  const now = performance.now();
  // Keep only toasts that are still alive.
  const alive: Toast[] = [];
  for (let i = 0; i < toasts.length; i = i + 1) {
    const age = (now - toasts[i].bornAt) / 1000;
    if (age < TOAST_LIFETIME) {
      alive.push(toasts[i]);
    }
  }
  toasts = alive;

  // Draw each surviving toast. Newer toasts sit higher on the
  // stack; older ones drift down. They fade as they age.
  for (let i = 0; i < toasts.length; i = i + 1) {
    const age = (now - toasts[i].bornAt) / 1000;
    const alpha = 1 - age / TOAST_LIFETIME;
    const y = 70 + i * 36;

    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#222";
    ctx.fillRect(250, y, 300, 28);
    ctx.fillStyle = "gold";
    ctx.font = "16px sans-serif";
    ctx.fillText(toasts[i].text, 260, y + 19);
    ctx.globalAlpha = 1;
  }
}
