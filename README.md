# building-blocks

Learning materials for a course that teaches programming by building a
brick-breaker game, one version at a time.

## Repo layout

- `docs/` — [VitePress](https://vitepress.dev) source for the materials
  site that learners read.
- `scaffold/v<n>/` — working reference projects for each game version.
  Each unit walks learners through creating these files themselves; the
  copies under `scaffold/` exist so we can verify the code actually runs
  and so the site can link to a known-good version.

## Working on the materials

```sh
npm install
npm run docs:dev      # local dev server with hot reload
npm run docs:build    # build the static site to docs/.vitepress/dist
```

## Trying a scaffold

```sh
cd scaffold/v0
npm install
npm run dev
```

Open the URL Vite prints. You should see a red square on a black canvas.
