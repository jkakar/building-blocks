import { start, isKeyDown, Ctx } from "./game";

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

function playBonk() {
  const audio = new AudioContext();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.frequency.value = 440;
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

function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  resetBall();
}

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
    playBonk();
  }
  if (x > 800 - 30) {
    x = 800 - 30;
    vx = -vx;
    playBonk();
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
    playBonk();
  }

  if (
    x + 30 > paddleX &&
    x < paddleX + paddleWidth &&
    y + 30 > paddleY &&
    y < paddleY + paddleHeight
  ) {
    vy = -vy;
    score = score + 1;
    playBonk();
  }

  if (y > 600) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetBall();
    }
  }
}

function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
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
}

start(update, draw);
