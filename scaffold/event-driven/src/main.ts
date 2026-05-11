import { start, isKeyDown, Ctx } from "./game";
import { on, emit } from "./events";
import { drawAchievements } from "./achievements";

// Ball state
let x = 100;
let y = 100;
let vx = 200;
let vy = 150;

// Paddle state
let paddleX = 400;
let paddleY = 560;
let paddleWidth = 80;
let paddleHeight = 12;

// Game state
let lives = 3;
let score = 0;
let gameState = "playing";

function playBonk(frequency: number) {
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.frequency.value = frequency;
  gain.gain.value = 0.2;
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.1);
  osc.start();
  osc.stop(audio.currentTime + 0.1);
}

function resetBall() {
  x = 100;
  y = 100;
  vx = 200;
  vy = 150;
}

// --- Subscribers ----------------------------------------------------
//
// Everything below is reaction to events. The game-logic code (in
// updateBall and updatePaddle) only *emits* events. The handlers
// here decide what each event actually means.

// Score goes up when the paddle hits the ball.
on("ball:paddle-hit", () => {
  const oldScore = score;
  score = score + 1;
  // Every 10 points is a milestone.
  const oldBucket = Math.floor(oldScore / 10);
  const newBucket = Math.floor(score / 10);
  if (newBucket > oldBucket) {
    emit("score:milestone", score);
  }
});

// Any bounce makes a sound. Paddle hit, wall hit, and ball lost
// all emit "ball:bonk" so one subscriber covers them all.
on("ball:bonk", () => {
  playBonk(440);
});

// Milestone celebration: a higher-pitched bonk.
on("score:milestone", () => {
  playBonk(880);
});

// When the ball is lost, lose a life. If we're out of lives,
// emit "game:over"; otherwise reset the ball for the next round.
on("ball:lost", () => {
  lives = lives - 1;
  if (lives <= 0) {
    emit("game:over");
  } else {
    resetBall();
  }
});

// Game over: change state and stop the ball.
on("game:over", () => {
  gameState = "gameOver";
});

// Restart: full reset.
on("game:restart", () => {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
});

// --- Game logic -----------------------------------------------------
//
// These functions never touch score, lives, or gameState directly.
// They emit events; subscribers above decide what those events mean.

function updatePaddle(dt: number) {
  if (isKeyDown("ArrowLeft")) {
    paddleX = paddleX - 400 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    paddleX = paddleX + 400 * dt;
  }
  if (paddleX < 0) {
    paddleX = 0;
  }
  if (paddleX > 800 - paddleWidth) {
    paddleX = 800 - paddleWidth;
  }
}

function updateBall(dt: number) {
  x = x + vx * dt;
  y = y + vy * dt;

  if (x < 0) {
    x = 0;
    vx = -vx;
    emit("ball:wall-hit");
    emit("ball:bonk");
  }
  if (x > 800 - 30) {
    x = 800 - 30;
    vx = -vx;
    emit("ball:wall-hit");
    emit("ball:bonk");
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
    emit("ball:wall-hit");
    emit("ball:bonk");
  }

  if (
    x + 30 > paddleX &&
    x < paddleX + paddleWidth &&
    y + 30 > paddleY &&
    y < paddleY + paddleHeight
  ) {
    vy = -vy;
    y = paddleY - 30;
    emit("ball:paddle-hit");
    emit("ball:bonk");
  }

  if (y > 600) {
    emit("ball:lost");
    emit("ball:bonk");
  }
}

function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      emit("game:restart");
    }
    return;
  }
  updatePaddle(dt);
  updateBall(dt);
}

function drawBall(ctx: Ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 30, 30);
}

function drawPaddle(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + lives, 10, 30);
  ctx.fillText("Score: " + score, 700, 30);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
}

function draw(ctx: Ctx) {
  drawBall(ctx);
  drawPaddle(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
  drawAchievements(ctx);
}

start(update, draw);
