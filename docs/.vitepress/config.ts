import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Building Blocks",
  description: "Learn to program by building a game.",
  base: "/building-blocks/",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Start here", link: "/unit-0" },
      { text: "What you'll know", link: "/what-youll-know" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/" },
          { text: "Unit 0 — Set up your workshop", link: "/unit-0" },
        ],
      },
      {
        text: "Track 1 — Procedural",
        collapsed: false,
        items: [
          { text: "Unit 1 — A square that moves", link: "/unit-1" },
          { text: "Unit 2 — A ball that bounces", link: "/unit-2" },
          { text: "Unit 3 — Bring back the paddle", link: "/unit-3" },
          { text: "Unit 4 — Lives and game over", link: "/unit-4" },
          { text: "Unit 5 — Score and sound", link: "/unit-5" },
          { text: "Unit 6 — Refactor", link: "/unit-6" },
          { text: "Unit 7 — A row of bricks", link: "/unit-7" },
          { text: "Unit 8 — Multiple rows", link: "/unit-8" },
          { text: "Unit 9 — Tough bricks", link: "/unit-9" },
          { text: "Unit 10 — Bricks that drift down", link: "/unit-10" },
          { text: "Unit 11 — Explosions when a brick dies", link: "/unit-11" },
          { text: "Unit 12 — Power-ups", link: "/unit-12" },
          { text: "Unit 13 — Load a level from a file", link: "/unit-13" },
          { text: "Unit 14 — Deploy and share", link: "/unit-14" },
        ],
      },
      {
        text: "Track 2 — Event-driven",
        collapsed: true,
        items: [
          { text: "Unit 1 — An event bus", link: "/track-2/unit-1" },
          { text: "Unit 2 — Events all the way down", link: "/track-2/unit-2" },
          { text: "Unit 3 — Game state as events", link: "/track-2/unit-3" },
          { text: "Unit 4 — Achievements", link: "/track-2/unit-4" },
        ],
      },
      {
        text: "Track 3 — Object-oriented",
        collapsed: true,
        items: [
          { text: "Unit 1 — Ball as a class", link: "/track-3/unit-1" },
          { text: "Unit 2 — Paddle and Brick classes", link: "/track-3/unit-2" },
          { text: "Unit 3 — Inheritance for brick types", link: "/track-3/unit-3" },
          { text: "Unit 4 — Multi-ball", link: "/track-3/unit-4" },
        ],
      },
      {
        text: "Track 4 — Functional",
        collapsed: true,
        items: [
          { text: "Unit 1 — State as data", link: "/track-4/unit-1" },
          { text: "Unit 2 — Composition", link: "/track-4/unit-2" },
          { text: "Unit 3 — Time travel", link: "/track-4/unit-3" },
          { text: "Unit 4 — Replay", link: "/track-4/unit-4" },
        ],
      },
      {
        text: "Track 5 — Reactive",
        collapsed: true,
        items: [
          { text: "Unit 1 — Signals", link: "/track-5/unit-1" },
          { text: "Unit 2 — A clicker", link: "/track-5/unit-2" },
          { text: "Unit 3 — Auto-clickers", link: "/track-5/unit-3" },
          { text: "Unit 4 — Save state", link: "/track-5/unit-4" },
        ],
      },
      {
        text: "Track 6 — Entity-Component-System",
        collapsed: true,
        items: [
          { text: "Unit 1 — Entities, components, systems", link: "/track-6/unit-1" },
          { text: "Unit 2 — The player ship", link: "/track-6/unit-2" },
          { text: "Unit 3 — A field of asteroids", link: "/track-6/unit-3" },
          { text: "Unit 4 — Collisions and lives", link: "/track-6/unit-4" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "What you'll know", link: "/what-youll-know" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jkakar/building-blocks" },
    ],
  },
});
