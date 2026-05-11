# Unit 13 — Load a level from a file

So far the brick layout has been baked into your code: nested
loops in `buildBricks` say "5 rows of 10 columns, top two rows are
tough." If you want a different layout, you change the code. In
Unit 13 you separate the *level design* from the *game code*:
levels live in their own text file, and you can edit them without
touching the rest of the game.

After this unit, **v6**.

## What you'll learn

- The split between **data** and **code**: same engine, different
  levels.
- Using strings to represent a grid (`#` for a brick, `.` for
  empty space).
- Splitting a string into lines and reading each character.

## Step 1 — Create a level file

Create a new file in your project's `src` folder called
`level.ts`. Paste this into it:

```ts
export const level = `
##########
##########
##########
##########
.#.#.#.#.#
.#.#.#.#.#
`;
```

Save.

A few new things at once:

- The backticks `` ` `` around the text make a **template
  literal** — a string that can span multiple lines. The whole
  block between the backticks is one big string.
- `export` makes `level` available to other files. Anything you
  don't `export` stays private to this file.
- The string itself is just `#` (brick) and `.` (empty) characters,
  arranged as rows separated by line breaks.

Read the picture: top four rows are solid walls of bricks; the
bottom two rows are spaced out. That's the level you're about to
load.

## Step 2 — Import the level into `main.ts`

At the top of `main.ts`, add:

```ts
import { level } from "./level";
```

This is the same pattern you saw in Unit 0 importing from `./game`
— except this time you're importing *data* (a string) instead of
functions.

## Step 3 — Build bricks from the level string

Rewrite `buildBricks` to read the string:

```ts
function buildBricks() {
  bricks = [];
  const rows = level.trim().split("\n");
  for (let row = 0; row < rows.length; row++) {
    const rowText = rows[row];
    for (let col = 0; col < rowText.length; col++) {
      const ch = rowText[col];
      if (ch === "#") {
        bricks.push({
          x: col * 80 + 5,
          y: row * 30 + 50,
          width: 70,
          height: 20,
          hp: 1,
          vy: 0,
        });
      }
    }
  }
}
```

Walking through what's new:

- `level.trim()` — removes any whitespace from the start and end
  of the string. This cleans up the line break after the opening
  `` ` `` and the line break before the closing `` ` ``.
- `.split("\n")` — turns a single string into an array of strings,
  splitting on the newline character `\n`. So a string like
  `"abc\ndef\nghi"` becomes `["abc", "def", "ghi"]`. Our level
  string becomes an array of 6 row-strings.
- `rowText[col]` — gets the character at position `col` of the
  row. Just like reading from an array, but with a string.
- `if (ch === "#")` — only push a brick if the character is `#`.
  Any other character (`.`, space, etc.) is skipped.

Save. The bricks now match whatever you wrote in `level.ts`.

**Quick check.** What happens if you put a `?` somewhere in the
level string?

<details><summary>Click for the answer</summary>

Nothing visible. `if (ch === "#")` only matches `#`. `?`, `.`,
and any other character all fall through and don't create a brick.
You could add another `if (ch === "?")` and have *another* kind
of brick — that's what Challenge 1 is about.

</details>

::: tip Vocab: data vs code
What you just did is one of the most important ideas in
programming: separating **data** from **code**. The *behavior* of
your game (the engine, the collision rules, the rendering) lives
in `main.ts`. The *content* (which bricks exist, where) lives in
`level.ts`. To make a new level, you edit data, not code. To
change how the game *plays*, you edit code, not data.

This is how every real game with levels works — the engine ships
once, but the levels live in their own files, often dozens or
hundreds of them.
:::

## Step 4 — Make a level yourself

Open `level.ts`. The string is your canvas — `#` for a brick, `.`
for nothing. Try these:

- **A wall along the sides:**
  ```
  #........#
  #........#
  #........#
  #........#
  #........#
  ```
- **A pyramid:**
  ```
  ....##....
  ...####...
  ..######..
  .########.
  ##########
  ```
- **Your name:** spell something out. Letters need 3 wide each;
  10 columns gives you 3 letters or so. Try "BBB" (three rows of
  three `#`s each, blank columns between).
- **Sparse:**
  ```
  #.#.#.#.#.
  .#.#.#.#.#
  #.#.#.#.#.
  ```

Save `level.ts` after each change. The dev server reloads and you
see your new level. **No `main.ts` changes needed.** That's the
power of the data/code split.

## Step 5 — Multiple levels

Add a second `export` to `level.ts`:

```ts
export const level1 = `
##########
##########
##########
.#.#.#.#.#
`;

export const level2 = `
....##....
...####...
..######..
.########.
##########
`;
```

In `main.ts`, you'd import whichever you want:

```ts
import { level1, level2 } from "./level";
```

(Or rename `level` to `level1` if you only had one before — same
idea.)

Pick which level loads in `buildBricks`:

```ts
const rows = level1.trim().split("\n");
```

Save. Change `level1` to `level2`, save again. Same game, totally
different level — by editing one line.

## On your own

### Challenge 1 — A second kind of brick

In your level file, use `T` instead of `#` to mean "tough brick"
(hp = 2). Update `buildBricks` to read both characters.

<details><summary>Hint</summary>

Add a second `if`:

```ts
if (ch === "#") {
  bricks.push({ ..., hp: 1, ... });
}
if (ch === "T") {
  bricks.push({ ..., hp: 2, ... });
}
```

Make sure `drawBricks` still picks the right color for the
different hp values (from Unit 9).

You could keep going: `B` for a bomb brick (spawns more
particles), `S` for a brick that always drops a power-up, etc.
The level file becomes its own little language.

</details>

### Challenge 2 — Level progression

When the player wins a level, *don't* go to the "You Win!" screen.
Instead, load the next level and keep playing. After level 3,
*then* show the win screen.

<details><summary>Hint</summary>

You need a `currentLevel` variable that starts at 1. When the
player wins, increment it. If `currentLevel` exceeds the number
of levels you have, switch to `"won"`. Otherwise, reload bricks
from the matching level string.

You'll probably want an array of levels rather than separate
named exports — `export const levels = [level1, level2, level3];`
— and pick `levels[currentLevel - 1]` in `buildBricks`.

</details>

## What you just did

- Moved the level layout out of `main.ts` and into its own file.
- Read a multi-line string and parsed it into a grid of bricks.
- Used `export` and `import` for *data* the same way you've been
  using them for functions.
- Made the engine **data-driven**: same code, different content.

New words:

- **Template literal** — a string made with backticks (`` ` ``)
  that can span multiple lines and (later) include expressions.
- **`export`** — makes a name in this file available for other
  files to `import`.
- **Data-driven** — when the behavior of a program is shaped by
  data (a level file) rather than code (a hand-written loop).
- **`.split`** — string method that breaks a string into pieces.

## What's next

In Unit 14 — the last unit — you'll **build** the game for
production and put it on the public web. Send the URL to anyone
with a browser and they can play. After all this work, it should
feel real.
