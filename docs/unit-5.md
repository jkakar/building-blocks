# Unit 5 — Score and sound

v0 is done — you have a working paddle, a bouncing ball, three
lives, and a game over screen. In Unit 5 we polish it with two
small additions that make the whole thing feel *real*:

- A **score** that goes up every time the paddle hits the ball.
- A satisfying **bonk** sound on every bounce.

## What you'll learn

- One more counter pattern, this time going *up* instead of down.
- How to make sound on a web page using the **Web Audio API** (you
  won't have to fully understand the code — we'll treat it like
  the engine, as something that just works).

## Step 1 — Add a score

Add a new variable near `lives`:

```ts
let score = 0;
```

Show it on the canvas. In `draw`, near the line that draws lives:

```ts
ctx.fillStyle = "white";
ctx.font = "20px sans-serif";
ctx.fillText("Lives: " + lives, 10, 30);
ctx.fillText("Score: " + score, 700, 30);
```

The score is in the top-right corner (x = 700).

Now make the score go up every time the ball bounces off the
paddle. Find the paddle-bounce code from Unit 3:

```ts
if (
  x + 30 > paddleX &&
  x < paddleX + paddleWidth &&
  y + 30 > paddleY &&
  y < paddleY + paddleHeight
) {
  vy = -vy;
}
```

Add one line inside the block:

```ts
if (
  x + 30 > paddleX &&
  x < paddleX + paddleWidth &&
  y + 30 > paddleY &&
  y < paddleY + paddleHeight
) {
  vy = -vy;
  score = score + 1;
}
```

Don't forget to reset the score when the game restarts. In the
space-to-restart code from Unit 4, set `score = 0;`:

```ts
if (isKeyDown(" ")) {
  lives = 3;
  score = 0;
  x = 100;
  y = 100;
  vx = 200;
  vy = 150;
  gameState = "playing";
}
```

Save. Each paddle hit makes the score go up by 1. Game over resets
it to 0.

**Quick check.** If you didn't reset the score in the restart, what
would happen on the second round?

<details><summary>Click for the answer</summary>

The new round would *continue* from the score you had when you got
game-overed. So if you scored 12 in the first round and then lost,
the second round would start at 12. That's a bug — each round
should start fresh.

</details>

## Step 2 — Make a sound

We're going to play a short "bonk" sound every time the ball
bounces off anything (the walls *or* the paddle).

Browsers can generate sound directly without any audio file using
the **Web Audio API**. The code is a little dense — treat it like
the engine, as a black box that *makes sound*.

Paste this `playBonk` function near the top of `main.ts`, after the
variable declarations but before `update`:

```ts
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
```

What it does, high level: makes a quick beep at 440 Hz (a musical
A note), lasting 100 milliseconds, fading out at the end. You
don't need to understand every line. What matters is that calling
`playBonk()` plays a bonk.

Now *call* it. Add `playBonk();` inside every bounce — the four
wall bounces and the paddle bounce:

```ts
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
if (y > 600 - 30) {
  y = 600 - 30;
  vy = -vy;
  playBonk();
}
```

And inside the paddle bounce:

```ts
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
```

Save. Click on the browser window (browsers require a click before
they'll play audio). Now every bounce plays a little beep.

::: tip Vocab: API
You just used a browser **API** — Application Programming
Interface. An API is *a set of named tools the browser gives you*
that your code can call. The Canvas API gives you `fillRect` and
`fillText`. The Web Audio API gives you `AudioContext`,
`Oscillator`, and the rest of the audio bits. APIs are how
different layers of software talk to each other — your game talks
to the browser's audio system *through* the Web Audio API.
:::

## Step 3 — Play with it

- Change the frequency: `osc.frequency.value = 880;` (twice as
  high — an A an octave up). Try `220` (an octave down). Try `60`
  (very low rumble). Try `2000` (high squeak).
- Change the duration: replace both `0.1` values with `0.3` for a
  longer beep, or `0.05` for a sharper one.
- Change the volume: `gain.gain.value = 0.05;` (quieter) or `0.5;`
  (louder).

## On your own

### Challenge 1 — Different sound for the paddle bounce

Make the paddle bounce a **higher pitch** than the wall bounces, so
you can tell when you got a paddle hit by ear alone.

<details><summary>Hint</summary>

You'll want a second function — `playPaddleBonk()` or whatever
name you like — that's the same as `playBonk` but with a different
frequency. Replace `playBonk();` in the *paddle*-bounce block with
your new function call.

There's repetition here — two near-identical functions. That's
the kind of thing Unit 6 is about cleaning up.

</details>

### Challenge 2 — Pitch goes up with score

Make the bonk's pitch go *up* as the score climbs. So the first
bounce sounds at one pitch, the next a little higher, etc.

<details><summary>Hint</summary>

`playBonk` could take a *parameter* — a value passed in when you
call it. The function definition becomes
`function playBonk(frequency: number) { ... }`, and the call
becomes `playBonk(440 + score * 20);` or similar.

You haven't really written functions that take parameters yet
(except for `update(dt: number)` and `draw(ctx: Ctx)`, which you
inherited from the scaffold). But the pattern is the same:
`function name(parameter: type) { ... }` defines it, and
`name(value)` calls it.

</details>

## Troubleshooting

**No sound plays.**
You probably haven't clicked on the browser window yet. Browsers
block sound until the user clicks somewhere — security feature.
Click once, then try.

**The sound is super loud.**
Lower the `gain.gain.value` from `0.2` to something smaller, like
`0.05`.

**Browser console says something about AudioContext.**
Some browsers print a warning the first time `new AudioContext()`
runs without a user gesture. Click in the window once; the warning
will go away on subsequent reloads.

## What you just did

- Added a **score** counter that goes up.
- Made the browser produce sound from code using the **Web Audio
  API**.
- Tied sound effects to in-game events (wall bounces, paddle
  bounces).

New words:

- **API** — a set of named tools that one layer of software offers
  to another. The browser has lots of APIs — Canvas, Web Audio,
  Storage, etc.

## What's next

Your `main.ts` is starting to get long — paddle code, ball code,
bounce code, score, sound, game-over handling, restart, edge
checks. In Unit 6 we'll **refactor**: keep all the same behavior,
but break the long function into smaller, named pieces that are
easier to read. This is your first taste of an idea you'll use
every day in real programming.
