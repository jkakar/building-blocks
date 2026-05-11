import { start, isKeyDown, Ctx } from "./game";
import { Ball } from "./ball";
import { Paddle } from "./paddle";
import { Brick, ToughBrick, BombBrick } from "./brick";

// One paddle, one starting ball, a mixed row of bricks.
const paddle = new Paddle(400, 560, 80, 12);
let balls: Ball[] = [new Ball(100, 100, 200, 150, "red")];
let bricks: Brick[] = makeBricks();

let lives = 3;
let score = 0;
let gameState = "playing";
let paddleHitsSinceLastBall = 0;
const MAX_BALLS = 5;

function makeBricks(): Brick[] {
  return [
    new Brick(60, 80, 100, 24),
    new ToughBrick(180, 80, 100, 24),
    new BombBrick(300, 80, 100, 24),
    new ToughBrick(420, 80, 100, 24),
    new Brick(540, 80, 100, 24),
    new Brick(660, 80, 100, 24),
  ];
}

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

function spawnExtraBall() {
  if (balls.length >= MAX_BALLS) return;
  // Pick the first existing ball and copy its position with a
  // mirrored horizontal velocity — that way it visibly forks.
  const seed = balls[0];
  const colors = ["orange", "deepskyblue", "magenta", "yellow", "lime"];
  const color = colors[balls.length % colors.length];
  balls.push(new Ball(seed.x, seed.y, -seed.vx, seed.vy, color));
}

function resetForNewLife() {
  balls = [new Ball(100, 100, 200, 150, "red")];
  paddleHitsSinceLastBall = 0;
}

function restartGame() {
  lives = 3;
  score = 0;
  gameState = "playing";
  bricks = makeBricks();
  resetForNewLife();
}

function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }

  paddle.update(dt);

  // Move every ball. `update` tells us whether the ball is still
  // alive and whether it hit the paddle this frame.
  const survivors: Ball[] = [];
  for (const ball of balls) {
    const step = ball.update(dt, paddle);
    if (step.hitPaddle) {
      score = score + 1;
      paddleHitsSinceLastBall = paddleHitsSinceLastBall + 1;
      playBonk();
      if (paddleHitsSinceLastBall >= 5) {
        paddleHitsSinceLastBall = 0;
        spawnExtraBall();
      }
    }
    if (step.alive) {
      survivors.push(ball);
    }
  }
  balls = survivors;

  // Ball <-> brick collisions. Same loop for every brick type;
  // the brick's own onHit decides what to do.
  for (const ball of balls) {
    for (const brick of bricks) {
      if (!brick.alive) continue;
      if (
        brick.intersects({
          x: ball.x,
          y: ball.y,
          width: ball.size,
          height: ball.size,
        })
      ) {
        ball.vy = -ball.vy;
        brick.onHit(bricks);
        playBonk();
        break;
      }
    }
  }

  if (balls.length === 0) {
    lives = lives - 1;
    if (lives <= 0) {
      gameState = "gameOver";
    } else {
      resetForNewLife();
    }
  }
}

function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + lives, 10, 30);
  ctx.fillText("Score: " + score, 700, 30);
  ctx.fillText("Balls: " + balls.length, 360, 30);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
}

function draw(ctx: Ctx) {
  for (const ball of balls) ball.draw(ctx);
  paddle.draw(ctx);
  for (const brick of bricks) brick.draw(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}

start(update, draw);
