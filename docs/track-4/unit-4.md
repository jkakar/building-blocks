# Unit 4 — Replay

Unit 3 gave you rewind: hold R and the ball flies backward. This
unit gives you replay: lose, press P, and watch the last five
seconds back. Then save it to the browser so it survives a
reload.

The shape of replay is closer to a movie than rewind is. Rewind
*pops* states off history one by one, consuming them. Replay
walks an index *forward* through history without consuming it.
You're projecting frames onto the screen, the same way a film
projector pulls a strip of film through a light.

## What you'll learn

- The shape of a **replay loop** — read frames in order, don't
  modify history.
- The **lifecycle** of recording (during play) vs playing back
  (after game over).
- How to **save and load** state to the browser with
  `localStorage`, and why it's so easy here.

The last point is the big payoff of the whole track. Because
your state is a plain object full of numbers — no methods, no
class instances — turning it into text (`JSON.stringify`) and
back (`JSON.parse`) takes one line each. That's a freebie you
earned in Unit 1 when you decided state would be data.

## Step 1 — A third mode

In Unit 3 your `mode` variable was one of two values. Add a third
— `"replay"`:

```ts
let mode: "playing" | "rewinding" | "replay" = "playing";
let replayIndex = 0;
```

`replayIndex` will track *which frame of the replay we're on*.
While replaying, we increment it each tick.

## Step 2 — Catch the P key

P should fire on a single press, not on hold. We already used the
"once per press, cleared after use" pattern for B in Unit 3's
challenge — same shape here. Add this near your other key hooks:

```ts
let pPressed = false;
window.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") pPressed = true;
});
```

No `keyup`. Each press flips the flag to `true`; `update` will
flip it back to `false` once it's used.

## Step 3 — Trigger replay on game over

The replay should start when the player presses P from the Game
Over screen. Change the game-over block inside `update` to:

```ts
if (state.gameState === "gameOver") {
  if (pPressed && history.length > 0) {
    mode = "replay";
    replayIndex = Math.max(0, history.length - 300);
    pPressed = false;
    return;
  }
  if (isKeyDown(" ")) {
    state = {
      x: 100,
      y: 100,
      vx: 200,
      vy: 150,
      paddleX: 400,
      lives: 3,
      score: 0,
      gameState: "playing",
    };
    history = [];
    pPressed = false;
  }
  return;
}
```

`replayIndex = Math.max(0, history.length - 300);` starts the
replay 300 frames (5 seconds at 60fps) before the end. If history
is shorter than that, start at the beginning.

`Math.max(a, b)` returns the bigger of two numbers — a handy
guard against negative indices when history's been short.

## Step 4 — Walk history forward during replay

Add a `mode === "replay"` block to `update`. Put it next to the
rewinding block:

```ts
if (mode === "replay") {
  if (replayIndex < history.length) {
    state = history[replayIndex];
    replayIndex = replayIndex + 1;
  } else {
    mode = "playing";
    state = {
      x: 100,
      y: 100,
      vx: 200,
      vy: 150,
      paddleX: 400,
      lives: 3,
      score: 0,
      gameState: "playing",
    };
    history = [];
  }
  pPressed = false;
  return;
}
```

Each frame: read `history[replayIndex]`, set `state` to it, bump
the index. When the index runs off the end, we're done — drop
back into a fresh new game.

Save. Lose a life on purpose three times, see Game Over, press
P. The last five seconds play back. The ball walks through the
moves you actually played, the paddle slides to where it actually
was, the score climbs back up.

::: tip Replay vs rewind
The two modes share *machinery* — both read from `history` and
set `state`. But they're different shapes:

- **Rewind** walks **backward**, **pops** frames off (history
  shrinks), and works **while you hold R**.
- **Replay** walks **forward**, **leaves history alone**, and
  runs **automatically** after a single P press until it
  finishes.

You could imagine other modes too: a slow-motion forward replay,
a step-by-step "advance one frame at a time" mode, a reverse
replay (rewind but starting from the end and not consuming).
They're all small variations on "read frames from history at
some rate."
:::

## Step 5 — Show "replay" on screen

Update `drawMode` so it has a second case:

```ts
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
```

While in replay mode, "replay" sits at the top. The HUD still
shows the score and lives — but those are the *historical* score
and lives, because `drawHud` reads from whatever `state` is right
now, which during replay is an old snapshot.

Update the game-over text too, so the player knows the key:

```ts
function drawGameOver(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "60px sans-serif";
  ctx.fillText("Game Over", 240, 300);
  ctx.font = "20px sans-serif";
  ctx.fillText("space — new game     P — replay last 5s", 200, 360);
}
```

## Step 6 — Save the replay to the browser

A replay you can only see right after dying is fun. A replay you
can come back to *tomorrow* is wild. The browser gives us a tiny
key/value store called **`localStorage`** that lives on disk and
survives reloads.

Inside the game-over branch, save the replay tail when the player
starts a new game:

```ts
if (isKeyDown(" ")) {
  const tail = history.slice(Math.max(0, history.length - 300));
  try {
    localStorage.setItem("last-replay", JSON.stringify(tail));
  } catch {
    // ignore quota errors
  }
  state = { /* same restart object as before */ };
  history = [];
  pPressed = false;
}
```

Two new pieces:

- `history.slice(start)` returns a *copy* of part of the array,
  starting at index `start`. We pass `history.length - 300` to
  get the last five seconds.
- `JSON.stringify(value)` converts a value into a string. Our
  `tail` is an array of objects, and `JSON.stringify` turns it
  into one long string of text that looks like
  `[{"x":100,"y":100,...},{"x":102,"y":98,...},...]`.
- `localStorage.setItem(key, value)` stores that string under a
  name. We use `"last-replay"`.

The `try { ... } catch { ... }` is in case the browser's storage
is full or disabled. We just ignore the error.

Now load it on page load. Near the top of `main.ts`, after the
`let history: State[] = [];` line, add:

```ts
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
```

`JSON.parse(string)` is the inverse of `JSON.stringify` — it
turns a JSON string back into a value. The `Array.isArray`
check is defensive: `JSON.parse` will happily produce any shape
the saved string described. If someone (or a previous version
of your code) wrote `"hello"` or `42` or `{ "x": 1 }` to that
storage key, we'd get a non-array back, and the rest of the
program would explode the moment it tried to `.push` to
`history`. Checking the shape before trusting it keeps the load
path robust to corrupt or out-of-date saves.

Save. Play once until Game Over. Press space to start a new
game. *Reload the page* (`cmd + R`). The new game starts fresh —
but `history` is no longer empty; it holds your last attempt's
final five seconds. From the new game's Game Over screen, you
can press P to watch the *previous* attempt.

::: tip Why JSON works here
Look at the State type: it's a plain object with numbers and one
string. No methods, no class instances, no functions. That kind
of object is exactly what `JSON.stringify` was designed to write,
and `JSON.parse` is designed to read.

Compare to a Track 3 game built around classes. A `Ball` is an
*instance* of the `Ball` class — it has methods like `update`
and `draw`. `JSON.stringify(ball)` will dutifully write out the
fields but throw away the methods. When you `JSON.parse` the
result, you get a plain object back, *not* an instance of
`Ball` — `loaded.update(...)` would crash.

This is one of the quiet wins of state-as-data: serialization is
trivial. The shape of the data is the shape of the storage.
:::

**Quick check.** A friend says: "I'll save the whole `history`,
600 frames of it, every frame, just in case." Why is that a bad
idea?

<details><summary>Click for the answer</summary>

Two reasons:

1. **Slow.** `JSON.stringify` on a 600-element array runs in a
   millisecond, but doing it 60 times per second eats your frame
   budget. Save *only when something interesting happens* —
   game over, level complete.
2. **Wears out the disk.** `localStorage` writes to disk. SSDs
   have a finite number of writes. Writing 60 times per second
   isn't going to actually kill anyone's drive (browsers
   probably buffer), but it's the wrong shape.

Save on *events*. Game over is a perfect event.

</details>

## Step 7 — Read the final file

Scroll through `main.ts` one last time. The shape of a functional
game with replay:

1. The `import`.
2. The `type State = { ... }` shape.
3. The starting state.
4. Constants.
5. The runtime state of the *loop*: `state`, `history`, `mode`,
   `replayIndex`.
6. The key-press hooks (R held, P pressed).
7. Load-the-saved-replay on boot.
8. Pure update pieces: `updatePaddle`, `updateBall`,
   `handleEdgeBounce`, `handlePaddleHit`, `handleMiss`.
9. The composition: `tick`.
10. The impure seam: `playBonk`, `reactToChange`.
11. `update` — the big switch: rewind / replay / game-over /
    record-and-tick.
12. Drawing helpers.
13. `start(update, draw);`.

The pure part of the file (sections 8 and 9) is the math of the
game. Everything else is *plumbing*: feeding states in, getting
states out, watching keys, saving to disk, drawing pictures. That
split is the FP architecture in one paragraph.

## Play with it

- After Game Over, press P twice in a row — the second press
  during replay does nothing. Why? (Because the replay block
  clears `pPressed` itself.)
- Open the browser dev tools, go to the Application tab (Chrome)
  or Storage tab (Firefox/Safari), find Local Storage, find your
  page's domain, and look at the `last-replay` entry. It's a long
  string of JSON. You can copy it out, paste it back in later,
  and it'd still work.
- Increase the saved tail from 300 to 1800 (30 seconds). Notice
  the saved string in dev tools gets a lot longer. The browser
  generally allows several megabytes — plenty.
- Delete the saved replay from dev tools (`localStorage.clear()`
  in the console works too) and reload. The game starts with no
  replay available, which the P-on-game-over check handles
  gracefully (it only acts if `history.length > 0`).

## On your own

### Challenge 1 — Slow-motion replay

Make the replay play back at half speed — one history step per
*two* frames of the game loop. While the replay is running, the
ball should drift slowly across the screen.

<details><summary>Hint — a counter, like Unit 3's slow rewind</summary>

You need to advance `replayIndex` only every other frame. Track a
counter:

```ts
let replayTick = 0;
```

Inside the replay block, increment the counter each frame and
only advance the index when the counter is even:

```ts
replayTick = replayTick + 1;
if (replayTick % 2 === 0) {
  if (replayIndex < history.length) {
    state = history[replayIndex];
    replayIndex = replayIndex + 1;
  } else {
    // finish replay (same as before)
  }
}
```

(On the *other* frames, `state` doesn't change, so `draw` shows
the same frozen state — that's why it looks slowed down rather
than choppy.)

Reset `replayTick` to 0 whenever you start a replay.

</details>

### Challenge 2 — A "replay anytime" button

Right now you can only trigger a replay from Game Over. Add the
ability to start a replay *while playing* by pressing P. It
should replay the last five seconds of action and then drop back
into a fresh game.

<details><summary>Hint — where to put the check</summary>

The check goes in the playing branch of `update`, *before*
`history.push(state);`. If P was pressed and history's long
enough, switch mode to `"replay"` and set up `replayIndex`. The
existing replay block in `update` handles the rest, because it
doesn't care *why* mode changed.

One thing to think about: should mid-game replay save what you
were doing first, then drop you back at the moment you pressed P
afterwards? That's harder. The simpler version — "replay
replaces the run" — is fine for this challenge.

</details>

## Troubleshooting

**Press P after Game Over and nothing happens.**
Check three things: (1) the `pPressed` flag is being set by the
`keydown` listener (try `console.log(pPressed)` inside the
game-over branch — it should log `true` once after each press),
(2) `history.length > 0` is true (it should be, after a normal
game), (3) the order in `update` puts the rewind block *before*
the replay-trigger but the replay-trigger *inside* the game-over
branch.

**Replay starts but the screen shows an empty paddle/no ball.**
Make sure the `mode === "replay"` block sets
`state = history[replayIndex];` — and that the draw helpers read
from `state`, not from some old global.

**Saved replay loads but it's the wrong game.**
You probably saved the new game's empty `history` after restart.
Save *before* you reset `history = []`. The code order matters:
serialize first, then reset.

**`localStorage` is read-only.**
Some browsers in private/incognito mode forbid writes. The `try
/ catch` swallows the error — your game still works, you just
don't get persistent replays in incognito. Try a regular window.

**The saved JSON is enormous.**
You're saving more than 300 frames. Check your `slice` — it
should be `Math.max(0, history.length - 300)`.

## What you just did

- Added a third **mode** — `replay` — that walks history forward
  on its own.
- Triggered the replay from a single press of P at Game Over.
- Used `localStorage` to **save** the last replay across reloads,
  and **load** it on boot.
- Saw why JSON serialization is essentially free when your
  state is plain data: no classes, no methods, no surprises.

New words:

- **Replay** — playback of a recorded run, distinct from rewind
  in that it walks *forward* and doesn't consume history.
- **Lifecycle** — the stages a game goes through: recording
  during play, saving on game-over, loading on boot, playing
  back on demand.
- **`localStorage`** — a tiny key/value store the browser keeps
  on disk for your page.
- **`JSON.stringify` / `JSON.parse`** — turn a value into a
  string and back. Trivial when the value is plain data.

## What this whole track was about

Four short units. The shape of it:

- **Unit 1** said: put the whole game in one object, and make
  one tiny function that returns a new object instead of
  modifying the old one.
- **Unit 2** said: now do that for every piece, and chain them
  together with a pipeline called `tick`.
- **Unit 3** said: since you never throw away states, *keep*
  them in a list. Rewind comes for free.
- **Unit 4** said: since each state is just data, you can save
  it to disk and load it back. Replay comes for free too.

Each step bought the next one. That's the FP trade: a little
extra ceremony around `{ ...s, score: s.score + 1 }` instead of
`s.score = s.score + 1;` — paid up front, every frame — in
exchange for time-travel that no other architecture in this
course can do as cheaply.

You'll meet this pattern again in big real-world systems: undo
in a text editor, "diff" views in version control, save-states
in emulators, database transactions. All of them rest on the
same idea: keep the old, build the new, don't lose track.
