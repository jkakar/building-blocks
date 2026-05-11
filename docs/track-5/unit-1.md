# Unit 1 — Signals

Before this track you've kept the game's information in plain
variables. `let score = 0;` and then later `score = score + 1;`.
Works fine. But notice: nobody finds out the score changed
*unless* they happen to look. The HUD draws the score every
frame, so it always shows the right number — but if you wanted
to, say, *play a sound* whenever the score crossed a multiple of
ten, you'd have to scatter that check through every place that
touched `score`.

A **signal** is a small wrapper around a value that fixes that.
Instead of a loose `let score = 0;`, you build a tiny object —
also called `score` — with three abilities:

- `score.get()` — read the current value.
- `score.set(7)` — change it.
- `score.subscribe(fn)` — register a function that should run
  *every time* `set` is called.

Now anything that cares about `score` can wire itself up once and
forget about it. The signal does the notifying.

## What you'll learn

- The shape of a **signal**: `get`, `set`, `subscribe`.
- The words **subscribe** and **notify** for the two halves of
  the pattern.
- Why a per-frame redraw makes signals *less* important for
  drawing, and *more* important for everything else.

## Step 1 — Make a new project folder

Track 5 lives in its own folder. Your earlier projects stay
where they are.

Open Zed's terminal. Run these one at a time:

```sh
mkdir ~/blocks-clicker
cd ~/blocks-clicker
```

You need the same four supporting files Track 1 had — the engine
(`game.ts`), the web page (`index.html`), and the two config
files. Copy them from your Track 1 project:

```sh
cp ~/blocks/index.html ~/blocks-clicker/
cp ~/blocks/package.json ~/blocks-clicker/
cp ~/blocks/tsconfig.json ~/blocks-clicker/
mkdir ~/blocks-clicker/src
cp ~/blocks/src/game.ts ~/blocks-clicker/src/
```

Install the tools:

```sh
npm install
```

(If anything feels rusty, [Unit 0](/unit-0) has the full
walk-through.)

You won't write `main.ts` yet — we'll build it piece by piece in
the next two steps.

## Step 2 — Write the signal primitive

Create `src/signal.ts`. Type this in:

```ts
export type NumberSignal = {
  get: () => number;
  set: (next: number) => void;
  subscribe: (listener: () => void) => void;
};

export function numberSignal(initial: number): NumberSignal {
  let value = initial;
  const listeners: (() => void)[] = [];

  function get(): number {
    return value;
  }

  function set(next: number) {
    value = next;
    for (let i = 0; i < listeners.length; i = i + 1) {
      listeners[i]();
    }
  }

  function subscribe(listener: () => void) {
    listeners.push(listener);
  }

  return { get, set, subscribe };
}
```

Save. About twenty lines. Take a minute to read it.

The whole thing is a closure around two things: a private
`value` and a private `listeners` array. Three functions get
returned in an object. Outside code can only touch `value`
through `get` and `set` — and any call to `set` runs through the
listeners list before returning.

::: tip Vocab: signal
A **signal** is the object `numberSignal` returns — a value
plus the list of functions that care about it. The word comes
from electronics: a wire that carries a changing voltage, and
the things plugged into the wire that react to the voltage
changing. Same idea here. The value is the voltage; the
subscribers are the things plugged in.

You'll see related words in other libraries: *observable*,
*ref*, *state*, *atom*. Different names, same shape.
:::

::: tip Why number-only?
Real signal libraries let you store *anything* in a signal — a
string, an object, an array. Doing that cleanly in TypeScript
needs a feature called **generics** that's a topic for another
day. To keep things readable, our `numberSignal` only holds
numbers. That'll be enough for this whole track. If you ever
need a boolean, store `0` or `1` and pretend.
:::

## Step 3 — Use it

Create `src/main.ts`. Type this in:

```ts
import { start, Ctx, WIDTH } from "./game";
import { numberSignal } from "./signal";

const count = numberSignal(0);

count.subscribe(() => {
  console.log("count changed to", count.get());
});

function update(dt: number) {
  // Empty for now.
}

function draw(ctx: Ctx) {
  ctx.fillStyle = "white";
  ctx.font = "72px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(count.get() + " blocks", WIDTH / 2, 40);
}

start(update, draw);
```

Save. Run `npm run dev` and open the URL. You should see
**`0 blocks`** centered near the top of the black canvas.

Read through what you wrote:

- `const count = numberSignal(0);` — make a signal holding `0`.
- `count.subscribe(...)` — register a function that runs on
  every `set`. We pass an *arrow function* that logs the new
  value.
- `draw` reads `count.get()` every frame and writes it on
  screen.

Nothing changes yet. The number sits at zero.

## Step 4 — Poke the signal

In the browser, open the developer tools (`cmd + option + I`)
and click the **Console** tab. Then in Zed, add this line right
after `count.subscribe(...)`:

```ts
setInterval(() => {
  count.set(count.get() + 1);
}, 500);
```

Save. Look at the browser. **Two things happen:**

1. The big number on the canvas climbs: 1, 2, 3, …
2. The console prints `count changed to 1`, `count changed to
   2`, `count changed to 3`, … one line every half-second.

`setInterval(fn, ms)` is a browser thing — "call this function
every N milliseconds." We're using it as a stand-in for a real
event. In a real program you'd call `count.set(...)` from a
click handler or a network event or a timer running out.

Two pieces of code react to *one* change:

- The drawing reads `count.get()` 60 times a second, so it
  always shows the latest value.
- The subscriber runs *exactly when `set` runs* — half a second
  apart, in this case.

::: tip Vocab: subscribe / notify
A signal's `subscribe` lets a piece of code say "tell me when
this changes." A signal's `set`, when it fires the listeners,
is called **notifying** them. So the pattern has two halves:
*you subscribe once*, *the signal notifies you many times*.

You'll see this exact shape outside of signals too: email
newsletters work this way (you subscribe once, the publisher
emails you every issue), and the event bus from Track 2 is the
same idea applied to *named events* rather than a single value.
:::

## Step 5 — A second subscriber

Add another subscriber, right after the first one:

```ts
count.subscribe(() => {
  if (count.get() % 5 === 0) {
    console.log("a fiver!");
  }
});
```

Save. Watch the console as the count climbs. Every multiple of
five prints "a fiver!" — *and* the original "count changed to
…" still prints on every change. Two subscribers, one signal,
both fire on every `set`.

That's the win of the pattern. You don't have to weave
"if-multiple-of-five" logic into the place that bumps the
counter. The bumper just calls `set`; the subscribers each
decide what to do.

## Quick check

What happens if you call `count.set(7)` and the current value is
already `7`?

<details><summary>Click for the answer</summary>

In our primitive `numberSignal`, the subscribers fire *anyway*.
`set` writes `value = next;` (which doesn't change anything) and
then loops the listeners and calls each one.

Real signal libraries (Svelte, Solid, MobX, etc.) usually
short-circuit this case: they check `if (next === value) return;`
at the top of `set`. That saves work — no point running
listeners that don't have new information.

We could add the check too. We're leaving it off for clarity:
one less rule to remember while you're getting the shape down.
If you want to add it as a one-line tweak later, you'll know
right where it goes.

</details>

## Quick check

A friend says: "the drawing code uses `count.get()` — but I
never subscribed it. How does the canvas know to redraw when
`count` changes?"

<details><summary>Click for the answer</summary>

Trick question. The canvas doesn't "know" anything. The engine
calls `draw` *every frame*, sixty times a second, no matter
what. Each call reads `count.get()` afresh. There's no
subscription involved.

That's a quiet point about this track: when you redraw every
frame anyway, signals don't add value to the drawing. They add
value to *the side effects that aren't drawing* — logging,
playing sounds, saving to localStorage, unlocking buttons. The
boring per-frame redraw eats most of the work signals normally
do for UI.

We'll come back to this in Unit 2 and 3.

</details>

## Play with it

- Remove the second subscriber. The console quiets down — only
  the first one fires. Add it back.
- Change the interval from `500` to `100`. The number climbs ten
  times a second. The console fills up fast.
- Change `count.set(count.get() + 1)` inside the interval to
  `count.set(count.get() + 7)`. The number jumps in sevens. Every
  *35* prints the "fiver!" line (since multiples of 35 are
  multiples of 5).
- Add a *third* subscriber that logs `"yikes"` when `count >
  100`. Watch it kick in.

## On your own

### Challenge — A reset button (well, a key)

A real reset comes in Unit 2 when we have mouse clicks. For
now, add a key-driven one. Make pressing the space bar set
`count` back to zero.

Hint: the engine already tracks the space bar — `isKeyDown(" ")`
returns `true` while it's held. You can call `count.set(0)`
inside `update` when that's true.

<details><summary>Hint — watch out for repeats</summary>

`isKeyDown(" ")` is true *for as long as the key is held*. If
you do this:

```ts
function update(dt: number) {
  if (isKeyDown(" ")) {
    count.set(0);
  }
}
```

…then `set(0)` runs sixty times per second while space is held.
The screen still shows `0` (because that's the right answer),
but the console fills up with "count changed to 0" — the
subscribers fire every frame.

That's *fine* for this challenge. It illustrates a real
property of our naive signal: it fires on every `set`, even
when the value didn't change. If you tried the "short-circuit
when next === value" tweak from the earlier quick check, the
spam would stop after the first frame.

</details>

## Troubleshooting

**Red squiggle on `import { numberSignal } from "./signal";`**
Make sure `signal.ts` is inside `src/`, next to `main.ts` and
`game.ts`. The path `./signal` means "the file called `signal`
right next to me."

**`Cannot find name 'setInterval'`**
You probably forgot the `"DOM"` entry in `tsconfig.json`'s
`"lib"`. Copy `tsconfig.json` from your Track 1 project again —
the version that says `"lib": ["ES2022", "DOM", "DOM.Iterable"]`.

**The console doesn't print anything.**
Make sure you opened the *Console* tab in developer tools, not
Elements or Network. And make sure you ran `setInterval(...)`
at module scope (top level), not inside `update`.

**The number on the canvas stays at zero.**
Check that the `setInterval` line is calling
`count.set(count.get() + 1)` — *with* the `set`, *with* the
`+ 1`. Without `set`, no listener fires and nothing changes.

## What you just did

- Wrote a 20-line **signal** primitive in `signal.ts`.
- Made a single `count` signal and subscribed two functions to
  it.
- Watched both subscribers fire on every change.
- Noticed that drawing reads the signal directly every frame
  rather than subscribing, because the engine redraws everything
  anyway.

New words:

- **Signal** — a value plus the list of functions interested in
  it.
- **Subscribe** — register a function to run when the signal
  changes.
- **Notify** — what `set` does to the subscribers when it runs.
- **Listener** / **subscriber** — interchangeable names for the
  function you handed to `subscribe`.

## What's next

In [Unit 2](/track-5/unit-2) you'll get rid of the
`setInterval`. Instead, the count goes up when the player
*clicks* a big rectangle on the canvas. You'll attach a click
listener directly to the canvas — the engine doesn't know about
mouse input yet, and we won't teach it; the seam is visible on
purpose.
