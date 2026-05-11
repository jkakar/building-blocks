# Unit 3 — Auto-clickers

The game right now needs you. No clicks, no progress. This unit
adds an **upgrade**: pay 10 blocks, get one block per second
forever. Pay 10 more, get another. The count climbs even when
your finger is off the mouse.

That alone would be a fun afternoon. But the interesting bit is
the *button*. When you can afford it, it should look green and
inviting. When you can't, dim and unclickable. That little
yes/no — *can I afford it?* — is a **derived value**: a thing
that depends on the count and updates whenever the count
updates.

## What you'll learn

- How to add a second signal that *grows* a third signal over
  time.
- What a **derived value** is, and why "derived" is just a name
  for a particular shape of subscriber.
- Why a signal-with-subscriber buys you something here that
  Unit 2 didn't really need.

## Step 1 — A second signal

Open `main.ts`. Below `const count = numberSignal(0);`, add:

```ts
const clicksPerSecond = numberSignal(0);
```

Blocks per second. Starts at zero. Save. Nothing changes — the
new signal has no listeners and isn't used anywhere yet.

## Step 2 — Auto-increment

Each frame, the count should rise by `clicksPerSecond * dt`.
`dt` is the seconds elapsed since the last frame, so `cps * dt`
is "how much should the counter rise this frame to match the
target rate."

Change `update`:

```ts
function update(dt: number) {
  if (clicksPerSecond.get() > 0) {
    count.set(count.get() + clicksPerSecond.get() * dt);
  }
}
```

Save. Nothing visible happens — `clicksPerSecond` is still
zero, so the `if` skips. But the wiring is in.

::: tip Subscribers fire 60 times a second now
This is worth noticing. Once `clicksPerSecond > 0`, `count.set`
runs *every frame*. That means every subscriber on `count`
fires 60 times a second — including any you wrote in Unit 2.

If you still have a `console.log` subscriber on `count`, your
console will fill up *fast* once you buy an upgrade. Take it
out.

**If you did the flash-on-click challenge in Unit 2**, you have
a `count` subscriber that calls `flashUntil.set(performance.now()
+ 500)`. That'll fire every frame too — the button will be
permanently flashed white once auto-clickers start. Fix it now:
move the `flashUntil.set(...)` line out of the subscriber and
into your click-handler branch directly (right next to
`count.set(count.get() + 1)`). The flash should fire on real
clicks only, not on every `count` change.

A real signal library might **batch** these — only fire
listeners once per frame, even if `set` ran ten times. Ours
doesn't. The naive thing is the clearest first version.
:::

## Step 3 — The upgrade button

Add constants for the upgrade button. Put them next to your
existing button constants:

```ts
const autoX = 80;
const autoY = 460;
const autoW = 280;
const autoH = 90;
const autoCost = 10;
```

Draw it. In `draw`, after the reset button code:

```ts
ctx.fillStyle = "#553333";
ctx.fillRect(autoX, autoY, autoW, autoH);
ctx.fillStyle = "white";
ctx.font = "20px sans-serif";
ctx.fillText(
  "Auto +1/s (cost " + autoCost + ")",
  autoX + autoW / 2,
  autoY + autoH / 2 - 10,
);
```

A dark-red rectangle in the bottom-left. Save. You should see
the upgrade button.

Add a click branch. Inside the click handler, with the others:

```ts
if (inRect(x, y, autoX, autoY, autoW, autoH)) {
  if (count.get() >= autoCost) {
    count.set(count.get() - autoCost);
    clicksPerSecond.set(clicksPerSecond.get() + 1);
  }
  return;
}
```

Save. Click the big CLICK button until you have ten blocks.
Then click the auto-upgrade. The count drops by ten. The
counter then *climbs on its own*, one per second, even with
your mouse still.

Click the auto-upgrade again — when you can afford it — and
you'll be earning two per second. And so on.

::: tip Where did the floating-point come in?
You might notice the displayed count showing fractions like
`12.34` after you buy an upgrade. `clicksPerSecond * dt` is a
*fraction* per frame (e.g. `1 * 0.0166 ≈ 0.0166`), so
`count.get()` is no longer a whole number.

We have two options: store fractions and let the display deal
with it, or store whole numbers only and let auto-clicks
accumulate.

The simpler fix: in `draw`, show `Math.floor(count.get())`
instead of `count.get()`. The fraction lives inside the signal;
the display rounds. Make that tweak now — find your
`ctx.fillText(count.get() + " blocks", ...)` line and change it
to:

```ts
ctx.fillText(Math.floor(count.get()) + " blocks", WIDTH / 2, 40);
```

That's a small example of a pattern you'll see again: store
*the truth* (a fraction), display *the friendly version* (a
whole number).
:::

## Step 4 — A derived value

The button looks the same whether you can afford it or not.
Let's make it green when affordable, dim red when not.

We *could* compute the answer inside `draw`:

```ts
const affordable = count.get() >= autoCost;
ctx.fillStyle = affordable ? "#33aa55" : "#553333";
```

That works. So why not do that and move on?

Two reasons we won't:

1. We want a *named* yes/no so other code (a tooltip, an
   achievement, a sound) can subscribe to it. Inline code in
   `draw` doesn't give that.
2. We want a name for the *pattern*: "this value depends on
   another value." That pattern is called a **derived value**,
   and you'll meet it under five different names in five
   different libraries (computed, derived, memo, selector,
   reaction). The shape is what matters.

Add a third signal:

```ts
const canAffordAuto = numberSignal(0);
```

Then, *separately*, wire it to update from `count`:

```ts
function recomputeCanAffordAuto() {
  canAffordAuto.set(count.get() >= autoCost ? 1 : 0);
}
count.subscribe(recomputeCanAffordAuto);
recomputeCanAffordAuto();
```

Three lines that read like: "Every time count changes, recompute
canAffordAuto. Also run it once now, so the initial value is
right."

Save. In `draw`, color the button based on the new signal:

```ts
ctx.fillStyle = canAffordAuto.get() === 1 ? "#33aa55" : "#553333";
ctx.fillRect(autoX, autoY, autoW, autoH);
```

Save. Click the big button until you've got ten blocks. The
auto-upgrade button turns green. Buy it — the count drops, and
*if you don't have ten more*, the button goes red again.

::: tip Vocab: derived value
A **derived value** (also called a **computed** or sometimes a
**reaction**) is a signal whose value is computed from other
signals. The shape:

1. A signal to hold the derived result.
2. A function that recomputes it.
3. A `subscribe` on every input signal that runs the function.
4. One initial call to set the starting value.

A real signal library bundles those four steps into a single
call like `derived([count], () => count.get() >= 10)`. Ours
doesn't. The four steps are visible. That's the bones.

The word "derived" is a contract: this signal isn't set by
anyone except the recompute function. You never write
`canAffordAuto.set(1)` from outside. Anything that tried would
fight the recompute, and the value would flicker.
:::

## Step 5 — Stack on a second derived

The pattern is reusable. Let's add a second upgrade — a doubler
that costs 100 blocks and *doubles* the current cps.

Constants:

```ts
const doubleX = 440;
const doubleY = 460;
const doubleW = 280;
const doubleH = 90;
const doubleCost = 100;
```

Its derived "can I afford it?":

```ts
const canAffordDouble = numberSignal(0);
function recomputeCanAffordDouble() {
  canAffordDouble.set(count.get() >= doubleCost ? 1 : 0);
}
count.subscribe(recomputeCanAffordDouble);
recomputeCanAffordDouble();
```

Click branch:

```ts
if (inRect(x, y, doubleX, doubleY, doubleW, doubleH)) {
  if (count.get() >= doubleCost) {
    count.set(count.get() - doubleCost);
    clicksPerSecond.set(clicksPerSecond.get() * 2);
  }
  return;
}
```

Draw:

```ts
ctx.fillStyle = canAffordDouble.get() === 1 ? "#aa8833" : "#553333";
ctx.fillRect(doubleX, doubleY, doubleW, doubleH);
ctx.fillStyle = "white";
ctx.font = "20px sans-serif";
ctx.fillText(
  "Double /s (cost " + doubleCost + ")",
  doubleX + doubleW / 2,
  doubleY + doubleH / 2 - 10,
);
```

Save. Play for a minute, buy a few auto-upgrades, click on the
doubler when you can afford it. The cps jumps and the counter
climbs faster.

The whole top of the file now has three signals (`count`,
`clicksPerSecond`, and the two `canAfford...` derivations) and
a clean separation between *what depends on what*. Every signal
update is one of three things: a click handler, the `update`
loop, or a recompute that fires from a `subscribe`.

::: tip You also want a "blocks per second" display
You've got `clicksPerSecond.get()` available — add a small
fillText to `draw` somewhere above the upgrade buttons:

```ts
ctx.font = "20px sans-serif";
ctx.fillText(clicksPerSecond.get().toFixed(0) + " / sec", WIDTH / 2, 130);
```

Reads the signal every frame. No subscription needed for
display, same as `count`.
:::

## Step 6 — Notice what you didn't have to do

Look at `draw`. The upgrade button color *just happens to be*
green or red on every frame, because `draw` reads
`canAffordAuto.get()` and that signal happens to have the right
value at every moment.

You never have to think about updating the button color from
the click handler. You never have to think about updating it
when the auto-clicker ticks the count forward. You wrote the
**rule** ("button is affordable when count >= cost") once, in a
recompute function, and the rule keeps itself true.

This is the whole game of reactivity. The rules describe what
*should* be true. The plumbing keeps it true. As the program
grows, the rules-to-plumbing ratio is what wins.

## Quick check

If `count` changes 100 times in a single frame (because
auto-clickers are firing fast and you bought a chain of doublers),
how many times does the `recomputeCanAffordAuto` function run?

<details><summary>Click for the answer</summary>

100 times. Every `count.set(...)` notifies its subscribers, and
`recomputeCanAffordAuto` is one of them.

Most of those calls will set `canAffordAuto` to the same value
it already had — but in our naive `numberSignal`, `set` notifies
listeners every time, even when the value doesn't change. So
`canAffordAuto`'s listeners (if it had any beyond `draw`) would
also fire 100 times.

Real signal libraries fix two things here:

1. **Equality check in `set`** — don't notify if `next ===
   value`. Already mentioned in Unit 1's quick check.
2. **Batching** — collect all signal changes that happen within
   one "transaction" (e.g. one frame), and run the listeners
   once at the end with the final values.

Both are nice-to-haves. The naive version still works; it just
does more work than necessary.

</details>

## Quick check

A friend looks at this code:

```ts
const canAffordAuto = numberSignal(0);
function recomputeCanAffordAuto() {
  canAffordAuto.set(count.get() >= autoCost ? 1 : 0);
}
count.subscribe(recomputeCanAffordAuto);
recomputeCanAffordAuto();
```

…and says "why not just call `canAffordAuto.set(count.get() >=
autoCost ? 1 : 0)` from inside the click handler? Same effect,
less code."

What's the answer?

<details><summary>Click for the answer</summary>

*Auto-clickers don't go through the click handler.* The count
also climbs because of `update` running once per frame:

```ts
count.set(count.get() + clicksPerSecond.get() * dt);
```

If `canAffordAuto` only updated from the click handler, the
moment the auto-clicker pushed the count past 10, the button
*still* wouldn't turn green until you clicked something.

Subscribing means "every place that touches `count` — no matter
who or why — triggers the recompute, automatically." That's the
point.

</details>

## Play with it

- Buy three auto-upgrades, then click the doubler. The cps
  jumps from 3 to 6. Buy two more, doubler again — 16. The
  game is now broken in a delightful way; you'll be at a
  trillion blocks in five minutes.

- Add a *third* derived signal — `cpsIsHigh`, set to `1` when
  `clicksPerSecond >= 10`. Hint: it depends on `clicksPerSecond`,
  not `count`, so the `subscribe` goes on `clicksPerSecond`. Use
  it to draw a "fast mode" label somewhere on the canvas.

- Open the dev tools console. Type `count.get()` — gets the
  current count. Type `count.set(1000000)`. The display jumps
  to a million blocks, both upgrades light up green. Signals
  are *just JavaScript values*; you can poke them from
  anywhere.

## On your own

### Challenge — A "tripler" upgrade

Add a third upgrade — costs 1000 blocks, triples the cps.
Hint: copy the doubler's pattern. Five new pieces: position
constants, a `canAfford` derived, a click branch, the cost
constant, and a draw block.

(After you've written it, look at the file. Three upgrades have
*almost identical structure*. That repetition is a smell — it's
telling you "we'd really like an `Upgrade` data structure that
captures all five pieces at once, and a loop that handles
them." That refactor is what Course 6 — ECS — opens with. We
won't do it here.)

### Challenge — The "subscribe-as-derived" shorthand

Each of our derivations has the same four-line shape: a signal,
a recompute, a subscribe, a one-shot initial call. Write a
helper:

```ts
function derived(deps: NumberSignal[], compute: () => number): NumberSignal {
  // ...
}
```

…that takes a list of input signals and a recompute function,
and returns a new signal that always reflects the latest
output of `compute`.

<details><summary>Hint — the four pieces, hidden inside</summary>

```ts
function derived(
  deps: NumberSignal[],
  compute: () => number,
): NumberSignal {
  const out = numberSignal(compute());
  function recompute() {
    out.set(compute());
  }
  for (let i = 0; i < deps.length; i = i + 1) {
    deps[i].subscribe(recompute);
  }
  return out;
}
```

Add this to `signal.ts`. Then replace the four-line block
inside `main.ts` with a one-liner:

```ts
const canAffordAuto = derived([count], () =>
  count.get() >= autoCost ? 1 : 0,
);
```

That's how grown-up signal libraries spell it. The same four
pieces are still there; they're hidden in `derived`'s body.

One caveat: this `derived` returns a `NumberSignal`, so
`canAffordAuto.set(0)` would *work* and stomp on the
recompute. Real libraries return a read-only flavor. We'd need
a different type alias for it (something like
`type ReadonlyNumberSignal = { get: () => number; subscribe:
... }`) and have `derived` return that. Worth doing if you
want to harden it.

</details>

## Troubleshooting

**The count climbs slowly even before I buy anything.**
You probably forgot the `if (clicksPerSecond.get() > 0)` guard
in `update`. Without it, `count.set(count.get() + 0 * dt)`
still runs — which sets count to the same value but notifies
listeners *every frame*. The number won't change, but
subscribers (your `recompute…` functions) will fire 60 times a
second for no reason.

**The button doesn't turn green after I cross 10.**
Two common causes: (1) you forgot
`recomputeCanAffordAuto()` as a one-shot at the bottom of the
wiring — so the initial value of `canAffordAuto` is whatever
the signal was created with; (2) `count.subscribe(...)` is
missing or has a typo.

**The doubler does nothing the first time.**
If `clicksPerSecond` is `0` when you click the doubler,
`0 * 2` is still `0`. Buy at least one auto-clicker first, then
the doubler does something. (Real games would gate the doubler
button until cps > 0. Try it as a tiny extra challenge.)

**TypeScript squiggle on `count.subscribe(recomputeCanAffordAuto)`.**
Check the signature of `subscribe` in `signal.ts` — it expects
a function with no parameters and no return value. Make sure
`recomputeCanAffordAuto` is declared *above* the `subscribe`
call. Function declarations are hoisted, so it should work
either way, but if you used `const recomputeCanAffordAuto = ...`
form, *order matters*.

## What you just did

- Added a second signal — `clicksPerSecond` — that drives the
  count over time.
- Added a third signal — `canAffordAuto` — that's *derived*
  from `count`: when `count` changes, a recompute runs and
  updates `canAffordAuto`.
- Repeated the pattern with `canAffordDouble`.
- Saw why a per-frame redraw doesn't make derived values
  pointless — they give you a *named yes/no* that other code
  can subscribe to.

New words:

- **Derived value** (also **computed**, **reaction**) — a
  signal whose value comes from a function of other signals.
- **Batching** — collapsing many signal updates within a single
  frame into a single listener notification. Real libs do it;
  ours doesn't.

## What's next

In [Unit 4](/reactive/unit-4) you'll add **persistence**. Each
signal that should survive a reload gets a subscriber that
writes to `localStorage`. On boot, you read those values back
and set the signals. Three lines per signal. The reason it's
that cheap: signals are the *only* place mutable game state
lives, so saving them captures everything.
