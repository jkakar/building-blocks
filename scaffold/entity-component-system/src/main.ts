import { start, Ctx, WIDTH, HEIGHT, isKeyDown } from "./game";
import {
  positions,
  velocities,
  sprites,
  players,
  asteroids,
} from "./components";
import { createEntity, destroyEntity } from "./ecs";
import {
  movementSystem,
  inputSystem,
  clampPlayerSystem,
  spawnerSystem,
  cleanupSystem,
  collisionSystem,
  renderSystem,
} from "./systems";

// --- The player ship: one entity with four components. ----------

const playerId = createEntity();
positions[playerId] = { x: WIDTH / 2 - 20, y: HEIGHT - 60 };
velocities[playerId] = { vx: 0, vy: 0 };
sprites[playerId] = { color: "#33cc66", size: 40 };
players[playerId] = true;

// --- Game state lives in plain variables (not components). ------
//
// `lives` and `score` aren't per-entity — they belong to the
// game as a whole. Keeping them outside the ECS keeps the ECS
// purely about *things in the world*.

let lives = 3;
let score = 0;
let gameState: "playing" | "gameOver" = "playing";

function loseLife() {
  lives = lives - 1;
  if (lives <= 0) {
    gameState = "gameOver";
  }
}

function restartGame() {
  // Destroy every entity except the player.
  for (const id in asteroids) {
    destroyEntity(Number(id));
  }
  // Reset the player.
  positions[playerId] = { x: WIDTH / 2 - 20, y: HEIGHT - 60 };
  velocities[playerId] = { vx: 0, vy: 0 };
  lives = 3;
  score = 0;
  gameState = "playing";
}

// --- The loop: each frame, run the systems in order. ------------

function update(dt: number) {
  if (gameState === "gameOver") {
    if (isKeyDown(" ")) {
      restartGame();
    }
    return;
  }
  score = score + dt;
  inputSystem();
  movementSystem(dt);
  clampPlayerSystem();
  spawnerSystem(dt);
  collisionSystem(loseLife);
  cleanupSystem();
}

function drawHud(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("Lives: " + lives, 10, 10);
  ctx.fillText("Score: " + Math.floor(score), 700, 10);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Game Over", WIDTH / 2, HEIGHT / 2 - 30);
  ctx.font = "20px sans-serif";
  ctx.fillText("Press space to restart", WIDTH / 2, HEIGHT / 2 + 30);
}

function draw(ctx: Ctx) {
  renderSystem(ctx);
  drawHud(ctx);
  if (gameState === "gameOver") {
    drawGameOver(ctx);
  }
}

start(update, draw);
