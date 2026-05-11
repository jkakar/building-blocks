# Unit 4 — Save state

The clicker plays well. Buy upgrades, watch the counter climb,
break the game in twenty minutes. Then close the tab. Open it
again. Back to zero blocks. All your progress, gone.

This unit fixes that. **Two lines per signal** is all it takes.
The reason it's that cheap: every piece of mutable state in
your game lives in a signal, and signals already have a hook
for "tell me when this changes." We use that hook to write to
the browser's storage, and we read back on boot.

## What you'll learn

- How **`localStorage`** lets the browser remember things across
  page loads.
- A pattern: load on boot, subscribe-to-save on update.
- Why this works *cleanly* here, and what would make it harder
  in a different architecture.

## Step 1 — Look at `localStorage` once

Open your dev tools console (`cmd + option + I`, Console tab)
and type this — *literally just type it in the console*, not in
your code:

```js
localStorage.setItem("test", "hello")
```

Press enter. Then:

```js
localStorage.getItem("test")
```

Press enter. The console prints `"hello"`.

Reload the page. Try `localStorage.getItem("test")` again. Still
`"hello"`.

That's the whole API. A key-value store keyed by strings, with
string values, that survives reloads. Now clean up:

```js
localStorage.removeItem("test")
```

::: tip Vocab: localStorage
**`localStorage`** is a tiny key/value store the browser keeps
on disk. Each website gets its own slice. Keys are strings,
values are strings, the size limit is "a few megabytes." It's
not a database — there's no querying, no expiry, no encryption
— but for small game state it's perfect.

Three methods you'll use here:
- `localStorage.setItem(key, value)` — write
- `localStorage.getItem(key)` — read; returns `null` if the key
  isn't there
- `localStorage.removeItem(key)` — delete one key
:::

## Step 2 — Save on every change

Back in `main.ts`. We're going to write a helper that, given a
name and a signal, sets up two things at once:

1. Read the saved value on boot, and `set` the signal to it.
2. Subscribe a "write to localStorage" function so future
   changes save automatically.

Add this above your signal declarations (right after the
imports):

```ts
import { numberSignal, NumberSignal } from "./signal";
```

(If you already imported `numberSignal` only, add `NumberSignal`
too — it's the type alias we'll need.)

Then add this helper near the top of the file, before the signal
declarations:

```ts
function persist(name: string, sig: NumberSignal) {
  const saved = localStorage.getItem(name);
  if (saved !== null) {
    const parsed = Number(saved);
    if (!Number.isNaN(parsed)) {
      sig.set(parsed);
    }
  }
  sig.subscribe(() => {
    localStorage.setItem(name, String(sig.get()));
  });
}
```

Read it line by line:

- `localStorage.getItem(name)` — string or `null`.
- `Number(saved)` — JavaScript's "make this a number." Falls
  back to `NaN` if the string isn't number-shaped.
- `!Number.isNaN(parsed)` — defensive check. If something
  corrupted the saved value, we leave the signal's default.
- The `subscribe` block runs *every time* the signal changes
  and writes the current value to `localStorage` under `name`.

::: tip Why `Number(saved)` and not `parseFloat(saved)`?
Both turn a string into a number. The difference is in the
edge cases:

- `Number("12abc")` → `NaN`
- `parseFloat("12abc")` → `12`

`Number` is stricter — it rejects anything that isn't *cleanly*
a number. For storage data we want the strict version: a
corrupt entry should fail loudly (well, fall back to default),
not pretend to succeed.
:::

Now wire it up. Below your signal declarations:

```ts
persist("count", count);
persist("clicksPerSecond", clicksPerSecond);
```

(The two `canAfford...` signals are **derived** — they should
*not* be persisted. They recompute themselves from `count` on
boot. If you saved them, you'd risk a stale value briefly
showing through before the recompute fires.)

Save. Click a few times, buy an upgrade, watch the counter
climb. *Now reload the page.* The big number is no longer
`0` — it's whatever you'd built up. Your upgrade is still
applied; the cps keeps ticking.

That was the whole feature. The signal already knew how to
notify on change. We just gave it one more listener.

## Step 3 — A "wipe save" button

You want a way to start over. Add a button next to the reset
one.

Constants near your others:

```ts
const wipeX = 700;
const wipeY = 64;
const wipeW = 80;
const wipeH = 36;
```

Click branch (put it before the others to avoid overlap
issues):

```ts
if (inRect(x, y, wipeX, wipeY, wipeW, wipeH)) {
  count.set(0);
  clicksPerSecond.set(0);
  return;
}
```

Draw block:

```ts
ctx.fillStyle = "#882222";
ctx.fillRect(wipeX, wipeY, wipeW, wipeH);
ctx.fillStyle = "white";
ctx.font = "16px sans-serif";
ctx.fillText("wipe", wipeX + wipeW / 2, wipeY + wipeH / 2 - 8);
```

Save. Play a bit. Click **wipe**. The counts go to zero — and
because of the subscribers, `localStorage` updates to match.
Reload — still zero. The wipe persisted.

::: tip Notice what wipe didn't do
The wipe handler didn't call `localStorage.removeItem(...)`. It
just `set` the signals to zero. The `subscribe` on each signal
caught those `set` calls and wrote `"0"` to storage.

That's a small reward for keeping signals as the source of
truth. You don't have *two* places to keep in sync ("memory
state" and "saved state") — there's only one place, the
signal, and `localStorage` is a *reflection* of it.
:::

## Step 4 — Read your final `main.ts`

Scroll through `main.ts` end-to-end. The shape:

1. Imports.
2. Signal declarations (`count`, `clicksPerSecond`).
3. Persistence wiring (`persist("count", count)`, etc.).
4. Derived signals (`canAffordAuto`, `canAffordDouble`) with
   their recompute functions and `subscribe` calls.
5. Button-position constants and the `inRect` helper.
6. The `canvas.addEventListener("click", ...)` block.
7. `update` — auto-clickers and that's it.
8. `draw` — reads signals, paints rectangles and text.
9. `start(update, draw);`.

Compare it to the bricky `main.ts` you finished Course 1 with.
Different game, very different shape — but notice what's *not*
there:

- **No** `if (justChanged) save()` scattered through the code.
- **No** "redraw the button because count changed" call.
- **No** explicit "tell the upgrade button it's now
  affordable" line.

All three of those happen, because the signal *graph* causes
them. You wrote each rule once. The rules keep themselves
true.

## Quick check

The `persist` helper subscribes a writer to `localStorage`.
What would happen if you called `persist("count", count)`
*twice* by accident?

<details><summary>Click for the answer</summary>

Two subscribers would be attached to `count`. Each change would
write to `localStorage` *twice* — same value, twice in a row.
Same effect, double the work. The game would feel fine; the
disk would be slightly grumpier.

That's a real failure mode in growing signal-based codebases:
you forget you already subscribed something, and now you have a
duplicate listener. Some libraries return an *unsubscribe*
function from `subscribe` (a function you call to undo it).
Ours doesn't. Adding that as a feature is a small change to
`signal.ts`:

```ts
function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    const i = listeners.indexOf(listener);
    if (i >= 0) listeners.splice(i, 1);
  };
}
```

The caller would then keep that returned function around and
call it later to detach the listener.

</details>

## Quick check

A friend says: "I'll save the *whole* count not 60 times a
second when the auto-clicker is on. That's tons of writes."

Are they right?

<details><summary>Click for the answer</summary>

Half right. When `clicksPerSecond > 0`, `count.set` runs every
frame inside `update`, which fires the persistence subscriber,
which calls `localStorage.setItem` once per frame. That's
60 writes per second.

Is that a problem? In practice, no — browsers buffer
`localStorage` writes, and you're writing maybe 20 bytes at a
time. You won't hurt your SSD. You won't notice the latency.

But the *shape* of the concern is right. If you were saving to
a server over the network — even a millisecond-fast one — 60
writes per second would be wasteful and possibly rate-limited.
The fix would be **throttling**: a subscriber that remembers
the last time it wrote and skips if it's been less than (say)
500ms.

```ts
let lastSave = 0;
count.subscribe(() => {
  const now = performance.now();
  if (now - lastSave < 500) return;
  lastSave = now;
  localStorage.setItem("count", String(count.get()));
});
```

That's a real signal-library feature (often called `throttle`
or `debounce`). For `localStorage` and one game, you don't need
it. For a network save, you would.

</details>

## Play with it

- Open dev tools → Application tab (Chrome) or Storage tab
  (Firefox/Safari) → Local Storage → your page's domain.
  You'll see two keys: `count` and `clicksPerSecond`. The
  values change in real time as you play. Try editing them by
  hand — set `count` to `999999` and reload. The game accepts
  it.

- Add a third persistable signal — say, `totalClicks` that
  counts *all clicks* (not the count, which goes down when you
  buy upgrades). Increment it in the big-button click branch.
  Persist it. Display it in the corner. Reload to confirm.

- Comment out `persist("clicksPerSecond", clicksPerSecond);`.
  Play a bit, buy an auto-upgrade. Reload. The count comes
  back but the auto-clicker is gone — because we asked the
  browser to remember `count` but forgot `clicksPerSecond`.
  Bug demonstrated; un-comment the line.

## On your own

### Challenge — An offline progress bonus

When you reload, the game starts ticking right where it left
off — but it doesn't *catch up* on time the tab was closed. If
you closed the tab at 1pm with 5 cps and come back at 2pm, an
hour didn't tick.

Add a `lastSeen` signal: a number that holds `Date.now()`. Save
it whenever the game state changes (the same `persist` helper
works on it). On boot, compute `Date.now() - lastSeen.get()` to
see how many milliseconds passed since the player last had the
tab open, multiply by `clicksPerSecond.get() / 1000`, and bump
`count` accordingly.

<details><summary>Hint — order matters</summary>

You have to read `lastSeen` *before* calling `persist` on it,
because `persist` is going to immediately `set` it to the saved
value. Or you can do the calculation *after* persist runs and
*before* you store the new "now":

```ts
persist("count", count);
persist("clicksPerSecond", clicksPerSecond);
persist("lastSeen", lastSeen);

// At this point, lastSeen has the previous session's stamp.
const elapsedSeconds = (Date.now() - lastSeen.get()) / 1000;
if (elapsedSeconds > 0 && clicksPerSecond.get() > 0) {
  const bonus = elapsedSeconds * clicksPerSecond.get();
  count.set(count.get() + bonus);
}
lastSeen.set(Date.now());
```

You'd also want a subscriber that keeps `lastSeen` fresh during
play — bump it every five seconds or so. That's an exercise for
you.

(Real idle games often *cap* offline progress — "up to 24
hours" — so you can't leave the game closed for a month and
come back to absurd numbers. One `Math.min(elapsed, 86400)` and
you're capped at a day.)

</details>

### Challenge — Generalize `derived` and persist correctly

If you did the `derived` helper challenge in Unit 3, you have a
single function that returns a signal. *Don't* persist derived
signals — they should always recompute from their inputs. Add
a comment to that effect at the top of `persist`, or guard it
somehow.

(There's no great way for `persist` to *know* a signal is
derived; the type system isn't strong enough with our setup. A
real library would have a separate type alias —
`DerivedSignal` vs `NumberSignal` — and `persist` would only
accept the second. Worth thinking about.)

## Troubleshooting

**Reload, and the count is still zero.**
Three things to check, in order: (1) the `persist` calls run
*after* the signal declarations; (2) you saved the file and the
dev server reloaded; (3) in the Application/Storage panel of
dev tools, the keys `count` and `clicksPerSecond` actually
exist after you play a bit. If they don't, the subscriber isn't
firing — make sure `persist` itself is called, not just
declared.

**The auto-clicker rate is wrong after reload.**
You forgot `persist("clicksPerSecond", clicksPerSecond);`. Or
the order: `persist("clicksPerSecond", ...)` has to come
*before* anything that subscribes to `clicksPerSecond`, so the
initial `sig.set(parsed)` doesn't kick off a stale recompute.
For our naive signals it usually doesn't matter, but it's a
good habit.

**Inspecting `localStorage` shows the value as
`"3.0000003"` instead of `"3"`.**
That's float drift from the `count.set(count.get() +
clicksPerSecond.get() * dt)` math inside `update`. The display
rounds it with `Math.floor`, but storage holds the truth.
Acceptable; if you'd rather, write `String(Math.floor(...))`
inside `persist`. Trade-off: you lose partial-tick precision.

**`Cannot read properties of null (reading 'set')`**
You called `persist` on a signal that doesn't exist yet — order
problem. Move the `persist` calls below the signal
declarations.

## What you just did

- Wrote a tiny `persist` helper that loads on boot and saves
  on change.
- Wired it to `count` and `clicksPerSecond` (the two raw
  signals — *not* the derived `canAfford...` ones).
- Added a wipe button that uses the same `set` path, and
  watched `localStorage` follow along.
- Noticed that "save the game" is essentially free in this
  shape: signals were already the only place mutable state
  lives, and `subscribe` was already the hook for "react to
  changes."

New words:

- **`localStorage`** — the browser's small key/value store.
- **Persistence** — making state survive across reloads.
- **Throttle / debounce** — only firing a listener at most
  once every N milliseconds; useful for expensive
  side-effects. Not needed for `localStorage` in this game.

## What this whole course was about

Four short units. Each one bought you something the last one
couldn't have:

- **Unit 1**: a 20-line signal primitive. A value that knows
  who's interested. By itself it doesn't *do* much; per-frame
  redraws cover most of what subscribers would do for free.
- **Unit 2**: clicks on a canvas. The signal becomes the
  destination for player input. Still nothing a loose `let`
  couldn't have done.
- **Unit 3**: a *second* signal driven by the first. Now you
  need a **derived value** — and writing one means subscribing
  to changes, which loose `let`s can't. Reactivity finally
  pays.
- **Unit 4**: persistence. Two lines per signal, because
  signals are the *only* mutable state in the game.

The big idea: **state that knows who's interested**. Every
modern UI library is built around some flavor of it. The names
differ — observable, ref, computed, atom, store — but if you
read the source you'll find the same `value + listeners` core
you wrote in `signal.ts`.

You'll also find it in places you wouldn't expect: a
spreadsheet cell with a formula is a derived signal. The cell
"watches" its inputs; when an input changes, the formula
re-runs. Same shape.

Course 5 done. The game is small but the bones are real.
