# Unit 0 — Set up your workshop

In this unit you'll get your computer ready to build games. By the end
you'll have a red square on a black screen. That's your first game's
first pixel.

It's a lot of steps — more than you'll see in any other unit. Setting
up the workshop is a one-time job; once it's done, you'll spend almost
all of your time in one file, writing game code.

Take your time. If something breaks, scroll to
[Troubleshooting](#troubleshooting) at the end.

## What you're going to install

- **Node.js** — a tool that lets your computer run JavaScript code.
- **Zed** — an app for writing code. Like a word processor, but for
  programs.

Both are free. Both run on Mac.

## Step 1 — Install Node.js

1. Go to [nodejs.org](https://nodejs.org).
2. Click the big download button labelled **LTS**. (LTS means "the
   steady, well-tested version.")
3. Open the file that downloaded. Follow the installer.
4. Open the **Terminal** app on your Mac to check it worked: press
   `cmd + space`, type `terminal`, press enter.
5. In the Terminal window, type this and press enter:

   ```sh
   node --version
   ```

   You should see something like `v22.10.0`. The exact number might be
   different — that's fine.

If you see `command not found`, close the Terminal window, open a new
one, and try again. Sometimes Terminal needs a fresh start to notice
new programs.

## Step 2 — Install Zed

1. Go to [zed.dev](https://zed.dev).
2. Click the download button for Mac.
3. Open the file. Drag the Zed icon into the Applications folder.
4. Open Zed (from Applications, or `cmd + space`, type `zed`).

The first time you open Zed it shows a mostly empty screen with a
"Welcome" tab. That's normal. Close the Welcome tab if you like.

## Step 3 — Make a workshop folder

You need a folder to keep all your game projects in. Back in Terminal,
type these commands **one at a time**, pressing enter after each:

```sh
mkdir ~/building-blocks
cd ~/building-blocks
mkdir v0-paddle
cd v0-paddle
```

What those words mean:

- `mkdir` is short for **make directory**. A *directory* is the same
  thing as a folder.
- `cd` is short for **change directory** — go *into* a folder.
- `~` is shorthand for your home folder (the one with your name on it).
- So `~/building-blocks` means "a folder called `building-blocks` inside
  my home folder."

You now have:

- `~/building-blocks` — the folder that will hold *all* your game
  versions.
- `~/building-blocks/v0-paddle` — the folder for your **first** version,
  which is the one you're building right now.

## Step 4 — Open the folder in Zed

In Zed:

1. **File** menu → **Open...**
2. Navigate to your home folder, then `building-blocks`, then
   `v0-paddle`.
3. Click **Open**.

Zed will now show an empty file tree on the left (because the folder
has nothing in it yet) and a big empty area on the right. You're ready
to add files.

## Step 5 — Create `index.html`

This is the web page that holds your game.

1. In Zed, press `cmd + N` to make a new file.
2. Press `cmd + S` to save it. Name it `index.html`. Make sure you're
   saving it inside `v0-paddle`.
3. Paste this in:

   ```html
   <!doctype html>
   <html>
     <head>
       <meta charset="utf-8" />
       <title>Building Blocks — v0</title>
       <style>
         body {
           margin: 0;
           background: #222;
           display: flex;
           justify-content: center;
           align-items: center;
           height: 100vh;
         }
         canvas {
           background: #000;
           border: 2px solid #444;
         }
       </style>
     </head>
     <body>
       <canvas id="game" width="800" height="600"></canvas>
       <script type="module" src="/src/main.ts"></script>
     </body>
   </html>
   ```

4. Save (`cmd + S`).

What this file is doing:

- `<html>` and `<body>` are the wrappers every web page has.
- `<canvas>` is a rectangle you can draw on with code. We made it 800
  pixels wide and 600 tall, and gave it the id `game` so we can find
  it from JavaScript later.
- The `<style>` block makes the canvas sit in the middle of a dark
  gray page.
- The `<script>` tag says "load my code from `/src/main.ts`." You
  haven't written that file yet. You will.

## Step 6 — Create `package.json`

This file tells your project what tools it needs.

1. New file (`cmd + N`), save as `package.json`. Paste:

   ```json
   {
     "name": "v0-paddle",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     },
     "devDependencies": {
       "typescript": "^6.0.3",
       "vite": "^8.0.11"
     }
   }
   ```

2. Save.

What this file is doing:

- `"name"` is a label for your project.
- `"scripts"` lets you give short names to longer commands.
  `"dev": "vite"` means: when I type `npm run dev`, run the Vite tool.
- `"devDependencies"` lists the tools your project needs:
  - **TypeScript** — the language you'll write your game in. It's like
    JavaScript but with extra checks that catch mistakes before you
    run the code.
  - **Vite** — runs a tiny web server on your computer and reloads the
    page when you save changes.

## Step 7 — Install the tools

Node.js needs to actually download Vite and TypeScript. In Zed, open
the built-in terminal: **View** menu → **Terminal**, or press
``ctrl + ` `` (that's the key with `~` on it, above Tab).

A terminal panel opens at the bottom of Zed. Type:

```sh
npm install
```

Lots of text scrolls by. That's normal. When it's done, you get your
prompt back.

A new folder called `node_modules` appears in your file tree. That's
where Node.js stores all the tool code. You won't edit anything in
there. (Heads up: it's *huge*, with thousands of files. Don't be
alarmed.)

## Step 8 — Create `tsconfig.json`

This tells TypeScript what kind of code you're writing.

1. New file: `tsconfig.json`. Paste:

   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "lib": ["ES2022", "DOM", "DOM.Iterable"],
       "strict": true,
       "noEmit": true,
       "isolatedModules": true,
       "skipLibCheck": true
     },
     "include": ["src"]
   }
   ```

2. Save.

You don't need to understand every line. The short version: "the code
is in the `src` folder, and please be strict about catching mistakes."

## Step 9 — Create `src/game.ts` (the engine)

This is the **engine**. Think of it like a Lego baseplate: you'll
build everything on top of it. You won't change it. Later — once
you're more comfortable — we'll come back and look at how it works.
For now, just trust it.

1. In Zed's file tree, right-click in the `v0-paddle` folder and
   choose **New Folder**. Name it `src`.
2. Inside `src`, create a new file called `game.ts`. Paste this in:

   ```ts
   // The engine. You won't change this file (for now).
   // It sets up the canvas, runs your code 60 times per second,
   // and tracks which keys are being pressed.

   type Ctx = CanvasRenderingContext2D;

   const canvas = document.querySelector("#game") as HTMLCanvasElement | null;
   if (!canvas) {
     throw new Error("Could not find <canvas id='game'> in index.html.");
   }
   const ctx = canvas.getContext("2d");
   if (!ctx) {
     throw new Error("Could not get a 2D drawing context.");
   }

   export const WIDTH = canvas.width;
   export const HEIGHT = canvas.height;

   const keys = new Set<string>();
   window.addEventListener("keydown", (e) => keys.add(e.key));
   window.addEventListener("keyup", (e) => keys.delete(e.key));

   export function isKeyDown(key: string): boolean {
     return keys.has(key);
   }

   type UpdateFn = (dt: number) => void;
   type DrawFn = (ctx: Ctx) => void;

   export function start(update: UpdateFn, draw: DrawFn): void {
     let last = performance.now();
     function loop(now: number) {
       const dt = (now - last) / 1000;
       last = now;
       update(dt);
       ctx!.clearRect(0, 0, WIDTH, HEIGHT);
       draw(ctx!);
       requestAnimationFrame(loop);
     }
     requestAnimationFrame(loop);
   }

   export type { Ctx };
   ```

3. Save.

What this engine gives you (you'll use these in `main.ts`):

- `start(update, draw)` — kicks the game off. You hand it two of your
  functions, and it calls them 60 times per second.
- `isKeyDown(key)` — returns `true` if the given key is being held
  down right now.
- `WIDTH` and `HEIGHT` — the size of the canvas (800 and 600).
- `Ctx` — a *type* for the thing you draw with. You'll see what a
  type is in a minute.

You don't need to understand `requestAnimationFrame` or
`addEventListener` yet. The engine is doing the bookkeeping so you
don't have to.

## Step 10 — Create `src/main.ts` (your game)

**This** is the file where your game lives. From now on, this is where
you'll spend almost all of your time.

1. In `src`, create a new file `main.ts`. Type this in (try typing
   rather than pasting — the lines are short, and noticing each
   character helps you spot mistakes later):

   ```ts
   import { start, Ctx } from "./game";

   function update(dt: number) {
     // Nothing happens here yet.
   }

   function draw(ctx: Ctx) {
     ctx.fillStyle = "red";
     ctx.fillRect(100, 100, 30, 30);
   }

   start(update, draw);
   ```

2. Save.

What this file is doing:

- `import { start, Ctx } from "./game";` — borrows the `start` function
  and `Ctx` type from the engine. `./game` means "the file called
  `game` that's right next to me."
- `function update(dt: number) { ... }` — code that runs 60 times per
  second. `dt` is the number of seconds since the last time `update`
  ran (usually about `0.0166`). You'll use it later to move things
  smoothly.
- `function draw(ctx: Ctx) { ... }` — code that draws to the canvas,
  once after every `update`. `ctx` is the "brush" you draw with.
  - `ctx.fillStyle = "red";` — set the brush color to red.
  - `ctx.fillRect(100, 100, 30, 30);` — draw a filled rectangle. The
    arguments are: x position, y position, width, height. So: a 30×30
    rectangle whose top-left corner is 100 pixels from the left and
    100 pixels from the top.
- `start(update, draw);` — hand your two functions to the engine. The
  engine takes it from there.

::: tip Canvas coordinates
On the canvas, the point `(0, 0)` is at the **top-left** corner. Going
right makes `x` bigger. Going **down** makes `y` bigger. (That's the
opposite of math class, where bigger `y` means *up*.) So `(100, 100)`
means 100 pixels right, 100 pixels down.
:::

## Step 11 — Start the dev server

In Zed's terminal (the bottom panel from Step 7), type:

```sh
npm run dev
```

You'll see something like:

```
  VITE v8.0.11  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

Open that URL in your web browser. Any browser is fine — Safari,
Chrome, Firefox.

**You should see a black rectangle with a small red square inside it.**
That's your game.

## Step 12 — Change something

In Zed, open `main.ts`. Change `"red"` to `"blue"`. Save (`cmd + S`).

Look at your browser. **The square turned blue without you doing
anything else.** That's Vite's *hot reload* — it noticed you saved and
updated the page for you.

Try a few more changes:

- Other color names: `"yellow"`, `"green"`, `"pink"`, `"orange"`,
  `"white"`.
- Exact custom colors: `"#ff8800"` (orange), `"#88f"` (light blue).
  Search "html color picker" if you want to mix your own.
- Move the square: change `ctx.fillRect(100, 100, 30, 30)` to
  `ctx.fillRect(400, 300, 30, 30)`. It jumps to the middle.
- Resize it: try `ctx.fillRect(50, 50, 200, 100)`. Now it's a wide
  rectangle.
- Draw two: add a second `ctx.fillRect(...)` line below the first.

This is the loop you'll be in for every unit from now on: change
something, save, look at the browser, repeat.

## When you're done for the day

To stop the dev server, click in the terminal and press `ctrl + C`.

Next time: open Zed, open the same folder, open the terminal, type
`npm run dev` again. You're back where you left off.

## Troubleshooting

**`command not found: node`**
Node.js isn't installed correctly, or your terminal hasn't picked it
up yet. Close all terminal windows, open a fresh one, try again. If it
still doesn't work, re-run the installer from
[nodejs.org](https://nodejs.org).

**`Port 5173 is already in use`**
Another project is running on that port. Either find it and stop it,
or run `npm run dev -- --port 3000` to use a different port.

**The browser shows a blank screen**
Open the browser's developer tools (`cmd + option + I`) and look at
the **Console** tab for red error messages. They usually point to the
file and line that's broken.

**Red squiggly lines under your code in Zed**
That's TypeScript telling you something looks wrong. Hover the
squiggle to read the message. Common causes: a typo, a missing comma,
or brackets that don't match.

**`Cannot find module './game'`**
Make sure `game.ts` is inside the `src` folder. The path `./game`
means "a file called `game` right next to this one."

**Nothing draws**
Check that your canvas in `index.html` has `id="game"` (not `Game` or
`canvas`). Capitalization matters.

## What you just did

- Installed Node.js and Zed.
- Made a folder for your project.
- Created five files: `index.html`, `package.json`, `tsconfig.json`,
  `src/game.ts`, `src/main.ts`. (`npm install` also created
  `package-lock.json` and `node_modules/` for you.)
- Started a dev server.
- Saw a red square in your browser.
- Changed code and watched it update live.

A few new words you'll hear a lot:

- **Directory** / **folder** — same thing.
- **Terminal** — the place you type commands.
- **Library** — code other people wrote that you can use.
- **Canvas** — the rectangle on a web page you can draw on with code.
- **Dev server** — the program that turns your code into a working web
  page.
- **Hot reload** — the dev server updating your page automatically
  when you save.

## What's next

In Unit 1 you'll make the square **move** when you press the arrow
keys. You'll learn:

- How to remember where the square *is*, between frames.
- How to ask which key is being pressed right now.
- How to use the `update` function to change things over time.
- Why "pixels per second" is a better way to think about speed than
  "pixels per frame."
