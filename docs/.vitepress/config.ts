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
      { text: "Roadmap", link: "/roadmap" },
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
        text: "v0 — paddle, ball, lives",
        items: [
          { text: "Unit 1 — A square that moves", link: "/unit-1" },
          { text: "Unit 2 — A ball that bounces", link: "/unit-2" },
          { text: "Unit 3 — Bring back the paddle", link: "/unit-3" },
          { text: "Unit 4 — Lives and game over", link: "/unit-4" },
        ],
      },
      {
        text: "v0+ — polish",
        items: [
          { text: "Unit 5 — Score and sound", link: "/unit-5" },
          { text: "Unit 6 — Refactor", link: "/unit-6" },
        ],
      },
      {
        text: "v1 — bricks",
        items: [
          { text: "Unit 7 — A row of bricks", link: "/unit-7" },
          { text: "Unit 8 — Multiple rows", link: "/unit-8" },
        ],
      },
      {
        text: "v2 — brick types",
        items: [{ text: "Unit 9 — Tough bricks", link: "/unit-9" }],
      },
      {
        text: "v3 — falling bricks",
        items: [
          { text: "Unit 10 — Bricks that drift down", link: "/unit-10" },
        ],
      },
      {
        text: "v4 — particles",
        items: [
          { text: "Unit 11 — Explosions when a brick dies", link: "/unit-11" },
        ],
      },
      {
        text: "v5 — power-ups",
        items: [{ text: "Unit 12 — Power-ups", link: "/unit-12" }],
      },
      {
        text: "v6 — levels from text",
        items: [
          { text: "Unit 13 — Load a level from a file", link: "/unit-13" },
        ],
      },
      {
        text: "Ship it",
        items: [{ text: "Unit 14 — Deploy and share", link: "/unit-14" }],
      },
      {
        text: "Planning",
        items: [
          { text: "Roadmap", link: "/roadmap" },
          { text: "What you'll know", link: "/what-youll-know" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jkakar/building-blocks" },
    ],
  },
});
