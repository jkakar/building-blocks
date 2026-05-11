import { start, isKeyDown, Ctx } from "./game";

// The whole game lives in one State object. Each frame we make a
// *new* state from the old one — we never poke values in place.
// That's what gives us replay for free at the end.

type State = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  paddleX: number;
  lives: number;
  score: number;
  gameState: "playing" | "gameOver";
};

const initial: State = {
  x: 100,
  y: 100,
  vx: 200,
  vy: 150,
  paddleX: 400,
  lives: 3,
  score: 0,
  gameState: "playing",
};

const paddleY = 560;
const paddleWidth = 80;
const paddleHeight = 12;
const ballSize = 30;

// The whole game state, right now. `let` because we replace it
// each frame with a fresh object.
let state: State = initial;

// Every state we've been in for the last 10 seconds (600 frames
// at 60fps). Trimmed from the front when it grows past the cap.
let history: State[] = [];
const HISTORY_MAX = 600;

// What we're doing right now. `playing` runs `tick` every frame.
// `rewinding` walks history backward (R held during play).
// `replay` walks history forward (P after game over).
let mode: "playing" | "rewinding" | "replay" = "playing";
let replayIndex = 0;

// The engine only knows arrow keys and space. We track three
// extras here — this is the impure seam between the browser and
// our pure tick function.
let rDown = false;
let pPressed = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") rDown = true;
  if (e.key === "p" || e.key === "P") pPressed = true;
});
window.addEventListener("keyup", (e) => {
  if (e.key === "r" || e.key === "R") rDown = false;
});

// On load, try to restore the last attempt from the browser.
const saved = localStorage.getItem("last-replay");
if (saved !== null) {
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      history = parsed;
    }
  } catch {
    // ignore bad data
  }
}

// --- pure tick pieces ----------------------------------------

function updatePaddle(s: State, dt: number): State {
  let nextX = s.paddleX;
  if (isKeyDown("ArrowLeft")) {
    nextX = nextX - 400 * dt;
  }
  if (isKeyDown("ArrowRight")) {
    nextX = nextX + 400 * dt;
  }
  if (nextX < 0) {
    nextX = 0;
  }
  if (nextX > 800 - paddleWidth) {
    nextX = 800 - paddleWidth;
  }
  return { ...s, paddleX: nextX };
}

function updateBall(s: State, dt: number): State {
  return { ...s, x: s.x + s.vx * dt, y: s.y + s.vy * dt };
}

function handleEdgeBounce(s: State): State {
  let x = s.x;
  let y = s.y;
  let vx = s.vx;
  let vy = s.vy;
  if (x < 0) {
    x = 0;
    vx = -vx;
  }
  if (x > 800 - ballSize) {
    x = 800 - ballSize;
    vx = -vx;
  }
  if (y < 0) {
    y = 0;
    vy = -vy;
  }
  return { ...s, x: x, y: y, vx: vx, vy: vy };
}

function handlePaddleHit(s: State): State {
  if (
    s.x + ballSize > s.paddleX &&
    s.x < s.paddleX + paddleWidth &&
    s.y + ballSize > paddleY &&
    s.y < paddleY + paddleHeight
  ) {
    return {
      ...s,
      vy: -s.vy,
      y: paddleY - ballSize,
      score: s.score + 1,
    };
  }
  return s;
}

function handleMiss(s: State): State {
  if (s.y > 600) {
    const lives = s.lives - 1;
    if (lives <= 0) {
      return { ...s, lives: 0, gameState: "gameOver" };
    }
    return { ...s, x: 100, y: 100, vx: 200, vy: 150, lives: lives };
  }
  return s;
}

function tick(s: State, dt: number): State {
  let next = s;
  next = updatePaddle(next, dt);
  next = updateBall(next, dt);
  next = handleEdgeBounce(next);
  next = handlePaddleHit(next);
  next = handleMiss(next);
  return next;
}

// --- the impure seam: keyboard, audio, save -------------------

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

function reactToChange(oldState: State, newState: State) {
  // Score went up -> paddle hit.
  if (newState.score > oldState.score) {
    playBonk();
    return;
  }
  // Velocity flipped -> wall bounce.
  if (newState.vx !== oldState.vx || newState.vy !== oldState.vy) {
    playBonk();
  }
}

function update(dt: number) {
  // Rewind while R is held during play.
  if (mode === "playing" && rDown && history.length > 0) {
    mode = "rewinding";
  }

  if (mode === "rewinding") {
    if (!rDown) {
      mode = "playing";
    } else if (history.length > 0) {
      state = history[history.length - 1];
      history.pop();
    }
    pPressed = false;
    return;
  }

  if (mode === "replay") {
    if (replayIndex < history.length) {
      state = history[replayIndex];
      replayIndex = replayIndex + 1;
    } else {
      mode = "playing";
      state = initial;
      history = [];
    }
    pPressed = false;
    return;
  }

  // Normal play.
  if (state.gameState === "gameOver") {
    if (pPressed && history.length > 0) {
      mode = "replay";
      replayIndex = Math.max(0, history.length - 300);
      pPressed = false;
      return;
    }
    if (isKeyDown(" ")) {
      // Save the last attempt so we can replay it across reloads.
      const tail = history.slice(Math.max(0, history.length - 300));
      try {
        localStorage.setItem("last-replay", JSON.stringify(tail));
      } catch {
        // ignore quota errors
      }
      state = initial;
      history = [];
      pPressed = false;
    }
    return;
  }

  history.push(state);
  if (history.length > HISTORY_MAX) {
    history.shift();
  }

  const next = tick(state, dt);
  reactToChange(state, next);
  state = next;
  pPressed = false;
}

// --- drawing -------------------------------------------------

function drawBall(ctx: Ctx, s: State) {
  ctx.fillStyle = "red";
  ctx.fillRect(s.x, s.y, ballSize, ballSize);
}

function drawPaddle(ctx: Ctx, s: State) {
  ctx.fillStyle = "white";
  ctx.fillRect(s.paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawHud(ctx: Ctx, s: State) {
  ctx.fillStyle = "white";
  ctx.font = "20px sans-serif";
  ctx.fillText("Lives: " + s.lives, 10, 30);
  ctx.fillText("Score: " + s.score, 700, 30);
}

function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
  ctx.font = "20px sans-serif";
  ctx.fillText("space — new game     P — replay last 5s", 200, 360);
}

function drawMode(ctx: Ctx) {
  if (mode === "rewinding") {
    ctx.fillStyle = "yellow";
    ctx.font = "20px sans-serif";
    ctx.fillText("rewinding…", 350, 60);
  } else if (mode === "replay") {
    ctx.fillStyle = "cyan";
    ctx.font = "20px sans-serif";
    ctx.fillText("replay", 370, 60);
  }
}

function draw(ctx: Ctx) {
  drawBall(ctx, state);
  drawPaddle(ctx, state);
  drawHud(ctx, state);
  if (state.gameState === "gameOver" && mode === "playing") {
    drawGameOver(ctx);
  }
  drawMode(ctx);
}

start(update, draw);
