# What you'll know after Unit 14

A short, honest tour of what this course teaches — and what it
doesn't. Useful before you start (so you know what you're signing
up for) and after you finish (to take stock of what you can do).

By the end of Unit 14 you'll have written a brick-breaker game
from scratch, line by line, and deployed it to a real URL. Along
the way you'll have learned the parts of TypeScript listed below,
plus a handful of patterns that show up in every codebase.

## Primitives and syntax you'll write

The course sticks to a small core of language features. Everything
you write yourself comes from this list — no surprises, no
imported magic.

- **Variables.** `let` for changing values, `const` for fixed ones.
- **Types** (when needed): `number`, `string`, `boolean`,
  array-of-object shapes for declared-empty arrays.
- **Branching.** `if` / `else` / `else if`.
- **Comparison.** `<`, `>`, `<=`, `>=`, `===`.
- **Logic.** `&&` (and), `||` (or), `!` (not).
- **Math.** `+`, `-`, `*`, `/`, sign flip (`-x`), increment
  (`i++`).
- **Loops.** `for (let i = 0; i < n; i++) { ... }`, including
  iterating backwards when you need to remove items.
- **Control flow.** `continue` (skip to next loop iteration),
  `return` (exit a function).
- **Functions.** Plain `function name(arg: type) { ... }`
  declarations. You'll write your own helpers (Unit 6) and a
  function that returns a value (Unit 6's challenge).
- **Importing and exporting.** `import { name } from "./file";`,
  `export const`, `export function`. You'll bring data and
  functions across files (Units 0, 13).
- **Strings.** Template literals (backticks for multi-line),
  `.trim()`, `.split("\n")`, character indexing.
- **Arrays.** Literals, indexing, `.length`, `.push()`,
  `.splice(i, 1)`.
- **Objects.** Literal `{ field: value, ... }`, dot access
  (`thing.field`).
- **Browser APIs.** Canvas (`fillRect`, `fillText`, `fillStyle`,
  `font`, `clearRect`), Web Audio (an `AudioContext` recipe),
  and a small input helper (`isKeyDown`) the course gives you.
- **Random and rounding.** `Math.random()`, `Math.floor()`.

## Patterns and principles you'll learn

Names for things you'll do over and over, in this course and in
real software.

- **The game loop.** `update(dt)` then `draw(ctx)`, ~60 times a
  second. Same shape every frame.
- **Pixels per second.** Multiply by `dt` so the game runs the
  same speed on slow and fast computers.
- **Variables as state.** A value that survives between frames
  and across functions.
- **Sign flip to reverse direction.** `vx = -vx;` — three
  characters, the whole bounce.
- **AABB collision.** Four comparisons joined by `&&` to detect
  whether two rectangles overlap.
- **State machines.** A variable like `gameState = "playing"` /
  `"gameOver"` / `"won"`, plus rules for switching between
  states.
- **Counters.** Score going up, lives going down, streak resetting
  on miss.
- **Helper functions.** Pulling a clear job into a named
  function makes code easier to read and change.
- **Module scope.** Variables at the top of a file are visible to
  every function in the file.
- **Arrays of objects.** A collection where each item has its own
  state (bricks, particles, power-ups).
- **Nested loops.** Walk a 2D grid by row × column.
- **Object lifecycle.** Things appear, exist for a while, then go
  away (particles, power-ups, falling bricks).
- **Probability.** `Math.random() < threshold` for "this happens
  some fraction of the time."
- **Timer pattern.** Accumulate `dt` each frame; when the total
  crosses a threshold, do a thing and reset.
- **Temporary effects.** Turn state on, count down, turn it off.
- **Data versus code.** Same engine, different content — levels
  live in their own file.
- **Dev mode versus production.** Fast iteration vs. small,
  shippable files.
- **Static hosting.** Drag a folder onto the internet, get a URL.

## What this course deliberately doesn't teach

Some real, important parts of TypeScript and JavaScript don't
appear in any unit. That's intentional — they're either advanced
or not needed yet. You don't write any of these:

- **Classes** or **inheritance**.
- **Interfaces** or **type aliases** of your own.
- **Async / await** or **Promises**.
- **try / catch.**
- **Generics** in your code.
- **Ternaries** (`a ? b : c`).
- **Destructuring** outside of `import` statements.
- **Shorthand object literals** (`{ x }` for `{ x: x }`).
- **Spread / rest** (`...`).
- **Modulo** (`%`), **typeof**, **instanceof**, **in**.

If you go on to read other people's code, you'll see these
features and they'll look unfamiliar. That's fine — they're a
"next steps" list, not a prerequisite.

## The one honest caveat: the engine

In Unit 0 you paste a ~30-line file called `game.ts` and the
course tells you to trust it. That file uses things from the
"doesn't teach" list — `Set<string>`, arrow functions,
`as HTMLCanvasElement | null`, `throw new Error`,
`requestAnimationFrame`, `addEventListener`. You're *exposed* to
these on screen for a few minutes but never asked to write,
modify, or even understand them.

The reason: the engine handles the bookkeeping (running your
`update` and `draw` at the right cadence, tracking which keys are
held) so your game code can stay focused on the game. When you're
ready, you can come back and read `game.ts` from top to bottom —
and you'll find that the same patterns from the course
(functions, `let` and `const`, arrays, `if`) are doing the
heavy lifting under all the unfamiliar syntax.

## Where to go from here

- The [Roadmap](/roadmap) lists optional **synthesis stretches**
  at three milestones — places to take everything you've built
  and make something different with it.
- Use the same engine (`game.ts`) for an entirely different game:
  Snake, Pong, an asteroid dodge, a maze.
- Pick up one of the "doesn't teach" items from the list above
  and read about it on your own. Classes are a common next step.
