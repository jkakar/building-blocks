# Unit 2 — A clicker

Unit 1's `setInterval` was a stand-in for a real event. This
unit replaces it with a click. You'll draw a big rectangle on
the canvas, attach a click listener, and bump `count` whenever
the player taps inside the rectangle.

The game stays small. By the end of this unit you'll have:

- A big blue **CLICK** button.
- A counter centered above it.
- A small **reset** button that sets `count` back to zero.

## What you'll learn

- How to **listen for mouse clicks** on the canvas — code the
  engine doesn't write for you.
- How to test whether a click landed inside a rectangle (a
  *hit-test*).
- Why "signals + per-frame redraw" leans on `get()` for drawing
  and `subscribe(...)` for *everything else*.

## Step 1 — Tear out the timer

Open `main.ts`. Delete the `setInterval(...)` block from Unit 1.
Also delete the two `count.subscribe(...)` console.log
subscribers — they were diagnostic; you don't need them now.

Your `main.ts` should look roughly like:

```ts
import { start, Ctx, WIDTH } from "./game";
import { numberSignal } from "./signal";

const count = numberSignal(0);

function update(dt: number) {
  // Empty.
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

Save. The page now shows `0 blocks` and sits there. Good
starting point.

## Step 2 — Draw the big button

Add some constants near the top, above `function update`:

```ts
const buttonX = 250;
const buttonY = 220;
const buttonW = 300;
const buttonH = 160;
```

Then in `draw`, after the existing `fillText` line, add a
rectangle and a label:

```ts
ctx.fillStyle = "#3366cc";
ctx.fillRect(buttonX, buttonY, buttonW, buttonH);

ctx.fillStyle = "white";
ctx.font = "48px sans-serif";
ctx.fillText("CLICK", buttonX + buttonW / 2, buttonY + buttonH / 2 - 24);
```

(The `- 24` shoves the text up half a line so it sits in the
visual middle of the rectangle. Canvas text baseline math is
fiddly — feel free to tweak the number until it looks right to
you.)

Save. You should see a blue rectangle with the word **CLICK** on
it, centered on the canvas, with `0 blocks` above it.

Click on it. **Nothing happens.** That's because the engine
doesn't know what mouse clicks are. Let's fix that.

## Step 3 — Catch the click

The engine knows about the canvas, but it doesn't pass mouse
events through. We could change the engine to do that — but
that's scope creep for one unit. Instead, we'll grab the canvas
directly from `main.ts` and attach our own click listener.

Add this near the top of `main.ts`, *after* the imports and
*before* the constants:

```ts
const canvas = document.getElementById("game") as HTMLCanvasElement;
```

That's the same line the engine uses internally. Doing it again
here is a small duplication — both `game.ts` and `main.ts` now
look up the canvas. We accept it for one unit because the
alternative (export the canvas from `game.ts`, change every
import site) costs more than it saves.

::: tip Why we don't extend the engine
We *could* add mouse support to the engine the same way it has
keyboard support — track click positions in a variable, expose
an `onClick(handler)` function. We're not doing it because:

1. The whole engine is the size of one screen. Keep it small.
2. Mouse events have a wrinkle the keyboard doesn't — the canvas
   can be drawn at a different size than its internal pixels,
   so you have to scale the coordinates. That conversation
   doesn't belong in `game.ts`.
3. You'll see the scaling math up close in one place rather
   than buried in a helper.

If you were starting a fifth or tenth game, you'd pull this
into the engine and forget about it. For one game, the seam
costs nothing.
:::

Now attach the listener. Add this right after the `canvas =`
line:

```ts
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) * 800) / rect.width;
  const y = ((e.clientY - rect.top) * 600) / rect.height;

  if (
    x >= buttonX &&
    x <= buttonX + buttonW &&
    y >= buttonY &&
    y <= buttonY + buttonH
  ) {
    count.set(count.get() + 1);
  }
});
```

(You'll get a TypeScript squiggle here if `buttonX`/etc. aren't
defined yet. Add the four `const`s from Step 2 first, then come
back.)

Save. Click on the blue button. The number above it climbs by
one each click. Click *outside* the button — nothing happens.

::: tip Why the scaling math?
`e.clientX` is the click position in *screen* pixels relative
to the viewport. Our canvas is 800 pixels wide internally
(`<canvas width="800" ...>`), but the browser might be drawing
it at a different size — for example if you zoomed the page,
or if a CSS rule sized it differently.

`canvas.getBoundingClientRect()` returns the canvas's
*on-screen* size and position. So:

```ts
((e.clientX - rect.left) * 800) / rect.width
```

reads as "subtract the canvas's left edge to get a pixel
offset within the canvas, then scale from on-screen pixels up
to internal pixels." Same idea for `y` and `600`.

In most cases this comes out to the same number. The scaling
matters as soon as someone zooms the browser or you resize the
canvas with CSS — without it, the click and the visual would
drift apart.
:::

::: tip Where things go in `main.ts` so far
After Step 3 your file should be laid out like this, top to
bottom:

1. `import { start, Ctx } from "./game";` and the signal import.
2. `const canvas = document.getElementById("game") as HTMLCanvasElement;`
3. The `const buttonX/Y/W/H` constants from Step 2.
4. `const count = numberSignal(0);` (the signal).
5. `canvas.addEventListener("click", ...)` from this step.
6. `function draw(ctx: Ctx) { ... }` (drawing — uses
   `count.get()`).
7. `function update(dt: number) { ... }` (often empty for now).
8. `start(update, draw);` at the very bottom.

If your file doesn't match, it's worth tidying before Step 4.
TypeScript doesn't care about the order, but you'll be reading
this file a lot — keeping the layout predictable saves time.
:::

## Step 4 — Pull out a hit-test

That click handler is already a bit dense, and we're going to
add more buttons soon. Pull the rectangle check into a helper.
Add this above the `addEventListener` call:

```ts
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
```

Then simplify the click handler:

```ts
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = ((e.clientX - rect.left) * 800) / rect.width;
  const y = ((e.clientY - rect.top) * 600) / rect.height;

  if (inRect(x, y, buttonX, buttonY, buttonW, buttonH)) {
    count.set(count.get() + 1);
  }
});
```

Save. Same behavior, ready for more buttons.

## Step 5 — Add a reset button

Add four more constants, below the existing ones:

```ts
const resetX = 700;
const resetY = 20;
const resetW = 80;
const resetH = 36;
```

Add the click branch:

```ts
if (inRect(x, y, resetX, resetY, resetW, resetH)) {
  count.set(0);
  return;
}
```

(The `return` short-circuits — once we matched a button, we
don't keep checking the others. Put this branch *before* the
big-button check, since it's drawn on top.)

And draw it. Inside `draw`, after the CLICK button:

```ts
ctx.fillStyle = "#444";
ctx.fillRect(resetX, resetY, resetW, resetH);
ctx.fillStyle = "white";
ctx.font = "16px sans-serif";
ctx.fillText("reset", resetX + resetW / 2, resetY + resetH / 2 - 8);
```

Save. You should see a small gray "reset" button in the
top-right. Click it. The counter snaps back to zero.

## Step 6 — Where did the subscribers go?

Look at `main.ts` now. There's *no* `count.subscribe(...)` call
anywhere. The screen still updates correctly when you click —
the count goes from `0` to `1` to `2` and so on — because
`draw` reads `count.get()` every frame.

This is the honest correction promised in Unit 1. **When you
have a per-frame redraw, signals don't earn their keep on
drawing.** A loose `let count = 0;` with `count = count + 1;`
inside the click handler would work *exactly the same* for what
you have so far.

So why bother? Two reasons. They're not visible yet; they'll
become visible in Unit 3 and Unit 4:

1. **Side effects.** Anything that *isn't* drawing — playing a
   sound on click, saving to disk, unlocking a button — wants
   to fire *on the change*, not every frame. That's what
   `subscribe` is for.
2. **Derived values.** "Can the player afford the upgrade?" is a
   *yes/no* that depends on `count`. We could compute it inside
   `draw` every frame — but a signal lets us compute it once
   per change and cache the answer.

For now, you've built the foundation: a signal, a click handler,
a hit-test. The reactivity payoff comes next.

## Quick check

If you replaced `const count = numberSignal(0);` with `let count
= 0;` and changed every `count.get()` to `count` and every
`count.set(N)` to `count = N`, would the game still work?

<details><summary>Click for the answer</summary>

Yes. Try it on a scratch copy if you want — the game plays
identically. The signal isn't earning anything in this unit
yet. That's by design — we're going to *add* things in Unit 3
that the loose `let` version *can't* do (or can only do with
a lot more code). When you see the signal version stay clean
where the loose version would get tangled, you'll know what
signals are for.

</details>

## Quick check

Look at the click handler:

```ts
if (inRect(x, y, resetX, resetY, resetW, resetH)) {
  count.set(0);
  return;
}
if (inRect(x, y, buttonX, buttonY, buttonW, buttonH)) {
  count.set(count.get() + 1);
}
```

What would happen if the *reset* button overlapped the *click*
button — for example, if you put reset at the center of the
canvas?

<details><summary>Click for the answer</summary>

Whichever check came first would win, and the second would
never run. With the order above, reset wins. Swap the order
and click wins. The `return` is what guarantees only one
fires.

This is one of those small things you have to think about
when you do your own input — a button library would handle it
for you, with a click consumed by the topmost matching
target. Doing it yourself is fine; just keep the layout in
your head.

</details>

## Play with it

- Move the reset button to the *middle* of the canvas, on top
  of the click button. Click in the overlap area. Which wins?
  Reverse the order of the two `if` blocks and try again.

- Add a subscriber that logs the count each change. Click a few
  times, look at the Console. (Then remove it — the console is
  noisy.)

  ```ts
  count.subscribe(() => {
    console.log("count is now", count.get());
  });
  ```

- Change the CLICK button color so it gets brighter the more
  you've clicked. Hint: in `draw`, replace `"#3366cc"` with
  something like `"hsl(" + (200 + count.get() * 2) + ", 60%, 50%)"`.
  After enough clicks the color cycles through the rainbow.

## On your own

### Challenge — A negative-click button

Add a third small button on the canvas — top-*left* corner,
say. Label it `-1`. Clicking it subtracts one from the count.
*Don't let the count go below zero.* (Without the clamp the
upgrades in Unit 3 will misbehave.)

<details><summary>Hint — the pattern</summary>

The shape is the same as the reset button: a new set of
position constants, a new `inRect` branch in the click
handler, and a new rectangle in `draw`. The clamp goes inside
the branch:

```ts
if (inRect(x, y, minusX, minusY, minusW, minusH)) {
  const next = count.get() - 1;
  if (next >= 0) {
    count.set(next);
  }
  return;
}
```

Or, if you'd rather, set the clamp *inside* the signal by
writing `count.set(Math.max(0, count.get() - 1));`. Both work.
The second is shorter; the first reads more like English.

</details>

### Challenge — A `subscribe`-based highlight

Make the CLICK button flash white for half a second after every
click. Constraint: do it from a *subscriber*, not from `draw`.

<details><summary>Hint — store the flash deadline in a signal</summary>

Make a second signal — `flashUntil = numberSignal(0)`. On every
click, the subscriber sets `flashUntil` to "now plus 500 ms":

```ts
count.subscribe(() => {
  flashUntil.set(performance.now() + 500);
});
```

Inside `draw`, color the button white if
`performance.now() < flashUntil.get()`, else blue.

That's signals starting to pull their weight: `count`
changing *causes* `flashUntil` to update, which causes the
draw to look different. The signal subscriber is the *causal*
link.

</details>

## Troubleshooting

**Clicking the button does nothing.**
Open the Console (`cmd + option + I`). Add a
`console.log("clicked", x, y)` at the top of the click handler.
Click. If nothing prints, the listener isn't attached — make
sure you got `const canvas = document.getElementById("game") as
HTMLCanvasElement;` at the top. If `x` and `y` print but they're
huge or zero, the scaling math is off — re-read Step 3.

**Click registers slightly off from where you clicked.**
That's the scaling math. Without
`canvas.getBoundingClientRect()`, the click coordinates are in
viewport pixels, not canvas pixels.

**The text "CLICK" isn't centered.**
`ctx.textAlign = "center"` and `ctx.textBaseline = "middle"`
(or "top", with manual y adjustment) help. The exact y
position is a fiddly nudge. Tweak until it looks right.

**The TypeScript error says `Property 'getBoundingClientRect'
does not exist on type 'never'`.**
Your `document.getElementById("game")` cast didn't take. Check
that you wrote `as HTMLCanvasElement` exactly that way.

## What you just did

- Drew a big blue button on the canvas.
- Attached a `click` listener directly to the canvas from
  `main.ts`, because the engine doesn't expose mouse events.
- Used `getBoundingClientRect` to translate the click position
  from on-screen pixels into canvas pixels.
- Built a tiny `inRect` helper and used it twice — once for
  the click button, once for the reset.
- Noticed that signals aren't earning much in this unit
  because the per-frame redraw already handles UI updates.

New words:

- **Hit-test** — checking whether a click landed inside a
  shape. `inRect` is the simplest possible one.
- **`getBoundingClientRect`** — a browser method that returns
  the on-screen size and position of an element.

## What's next

In [Unit 3](/reactive/unit-3) you'll add the first
**upgrade** — a button that costs blocks to buy and adds
auto-clicks per second forever. You'll meet **derived
values**: signals computed from other signals. That's where
the reactive style finally beats the loose-variable style.
