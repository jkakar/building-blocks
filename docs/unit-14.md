# Unit 14 — Deploy and share

You've built a working brick-breaker — paddle, ball, lives,
score, sound, bricks of multiple kinds, falling bricks, particle
explosions, power-ups, level files. The whole thing runs on your
computer at `http://localhost:5173`. Time for the last step:
put it on the web at a real URL, and send the link to a friend.

## What you'll learn

- The difference between **dev mode** and a **production build**.
- What's in the `dist/` folder.
- How **static hosting** works (basically: someone else's
  computer serving the files in your `dist/` folder).
- How to put your game on the web in two minutes, without an
  account, using Netlify Drop.

## Step 1 — Build for production

Open Zed's terminal in your project folder (the one with
`package.json`). Type:

```sh
npm run build
```

Watch the output. Vite prints something like:

```
✓ built in 245ms

dist/index.html                 0.54 kB │ gzip: 0.31 kB
dist/assets/index-CbO6zmK9.js   8.42 kB │ gzip: 3.21 kB
```

A new folder called `dist/` appeared in your project. That's the
**production build**.

In Zed's file tree, expand `dist/`. You'll see:

- `index.html` — the same web page from your project, but with
  small changes (the `/src/main.ts` reference now points at the
  built JavaScript file).
- `assets/index-<random>.js` — *all* of your code, bundled into a
  single file, minified (whitespace and long variable names
  stripped to make the file smaller).

That's it. The whole game in two files (plus maybe a few more
if you added images or sounds in `public/`).

::: tip Dev vs. production
**Dev mode** (`npm run dev`) is what you've been using. It runs a
local web server, watches your files, and reloads the page when
you save. It does *not* combine everything into one file —
because making changes fast is more important than making the
files small.

**Production** (`npm run build`) is the opposite: take your
project and pack it into the smallest possible set of files,
ready to serve to anyone. The dev server doesn't run; instead,
you upload `dist/` somewhere and the files sit there waiting for
visitors.
:::

## Step 2 — Preview the production build locally

Before sending it to the world, check it works. In your terminal:

```sh
npm run preview
```

This runs a tiny server that serves your built `dist/` folder.
Open the URL it prints (probably `http://localhost:4173`). The
game should look and play identically to dev mode.

If you see a blank page or errors, fix them before deploying. Run
`npm run build` again after any code change — `dist/` doesn't
rebuild on its own.

When you're done previewing, stop the preview server with
`ctrl + C`.

## Step 3 — Deploy to Netlify Drop

This is the moment. Open [app.netlify.com/drop](https://app.netlify.com/drop)
in your browser. You'll see a big dashed-line area that says
*"Drag and drop your site folder here."*

In Finder, navigate to your project's `dist/` folder.

**Drag the `dist/` folder onto that area.** Don't drag the
*contents* of `dist/` — drag the folder itself.

Wait a few seconds. Netlify uploads it and gives you a URL like
`https://random-words-12345.netlify.app`. **Click it.** Your game
is live on the public internet. Anyone with that URL can play it.

Send the link to a friend, a family member, or grandma. They click
it, they play your game.

## Step 4 — Re-deploy after changes

When you change your code and want to update the live version:

1. Save your changes.
2. Run `npm run build` again. (This rebuilds `dist/`.)
3. Go back to Netlify Drop.
4. Drag the new `dist/` onto the drop zone again.

You'll get a *new* URL each time (because Netlify Drop is the
no-account version). If you want to keep the *same* URL across
updates, you'd need to sign up for a Netlify account and connect
a "site." That's beyond this unit — but it's how real projects
do it.

## Step 5 — Try other hosts

Netlify Drop is the fastest. If you want to try alternatives:

- **Vercel** ([vercel.com](https://vercel.com)) — similar to
  Netlify. Requires an account, but the deploys can be automatic
  (push to GitHub, site updates).
- **Cloudflare Pages** ([pages.cloudflare.com](https://pages.cloudflare.com))
  — similar story.
- **GitHub Pages** — free, included with any GitHub repo. Slightly
  more setup; requires the build output to be on a `gh-pages`
  branch or in a `docs/` folder.

All of them do the same job: serve the files in your `dist/`
folder at a URL. The differences are *how* you tell them to
do it.

## On your own

### Challenge 1 — Add a favicon

Right now the browser tab for your game shows a generic globe
icon. Make a small image (32×32 pixels) and save it as
`public/favicon.ico` (or `.png`) in your project. Rebuild and
redeploy. The tab now shows your image.

<details><summary>Hint</summary>

The Vite scaffold puts everything in `public/` at the *root* of
the served site — so a file at `public/favicon.ico` is served at
`/favicon.ico`. The browser looks for `/favicon.ico` automatically
when loading a page; if it finds your file, it uses it as the tab
icon.

(Some browsers cache favicons aggressively; if you don't see the
new one, try a hard refresh — `cmd + shift + R`.)

</details>

### Challenge 2 — A custom domain

If you (or a grown-up) own a domain name like `mygame.com`, you
can point it at your Netlify deploy. This step is more "tooling"
than "programming," and the exact instructions depend on where
your domain is registered.

<details><summary>Hint</summary>

You'll need a free Netlify account (Netlify Drop is anonymous;
custom domains require an account so they can verify ownership).
After signing up and re-deploying, the Netlify dashboard has a
**Domain settings** section. The general flow is: add the domain,
copy the DNS records Netlify gives you, and paste them into your
domain registrar's settings. After 5 minutes to a few hours, your
domain resolves to your Netlify site.

Ask a grown-up for this one. DNS is fiddly.

</details>

## What you just did

- Built your game for production.
- Looked at the contents of `dist/` and understood what each file
  is.
- Deployed to the public web via Netlify Drop.
- Got a real URL you can send to anyone.

New words:

- **Build** — the process of turning your project into a small,
  fast set of files ready to serve.
- **`dist/`** — short for *distribution*. The folder Vite creates
  with the built files.
- **Production** — the version you ship to users (small, fast,
  optimized).
- **Static hosting** — a service that serves files (like your
  `dist/`) at a URL. The server doesn't run any of your code —
  it just hands the files to whoever asks.

## What's next

You've done it. v0 through v6, plus deployment. Your project is
on the web, your friends can play it, and you understand every
line of code in it.

A few places to go from here:

- **Synthesis stretches** (see the [Roadmap](/roadmap)) — take
  everything you've learned and make a *variation* of the game.
  Different controls, different game mode, different goal. No
  walkthrough — just an idea and what you already know.
- **Other game ideas.** The engine in `game.ts` works for any
  2D game, not just brick-breaker. Try Snake, Pong, a top-down
  shooter, an asteroid dodge, a maze. Same Canvas, same `update`
  and `draw`, totally different game.
- **Learn more JavaScript / TypeScript.** You've used the
  highlights — variables, `if`, loops, arrays, objects,
  functions. There's a lot more (classes, modules, async,
  generics, …) waiting whenever you're curious.
- **Show someone.** Show a teacher. Show a sibling. Show
  Grandma. The thing on screen is *yours*. You built every line.
