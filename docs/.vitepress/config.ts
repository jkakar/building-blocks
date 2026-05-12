import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Building Blocks",
  description: "Learn to program by building a game.",
  base: "/building-blocks/",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Start here", link: "/procedural/unit-0" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/" },
          {
            text: "Unit 0 — Set up your workshop",
            link: "/procedural/unit-0",
          },
        ],
      },
      {
        text: "Course 1 — Procedural",
        collapsed: false,
        items: [
          {
            text: "What you'll know",
            link: "/procedural/what-youll-know",
          },
          { text: "Unit 1 — A square that moves", link: "/procedural/unit-1" },
          { text: "Unit 2 — A ball that bounces", link: "/procedural/unit-2" },
          { text: "Unit 3 — Bring back the paddle", link: "/procedural/unit-3" },
          { text: "Unit 4 — Lives and game over", link: "/procedural/unit-4" },
          { text: "Unit 5 — Score and sound", link: "/procedural/unit-5" },
          { text: "Unit 6 — Refactor", link: "/procedural/unit-6" },
          { text: "Unit 7 — A row of bricks", link: "/procedural/unit-7" },
          { text: "Unit 8 — Multiple rows", link: "/procedural/unit-8" },
          { text: "Unit 9 — Tough bricks", link: "/procedural/unit-9" },
          {
            text: "Unit 10 — Bricks that drift down",
            link: "/procedural/unit-10",
          },
          {
            text: "Unit 11 — Explosions when a brick dies",
            link: "/procedural/unit-11",
          },
          { text: "Unit 12 — Power-ups", link: "/procedural/unit-12" },
          {
            text: "Unit 13 — Load a level from a file",
            link: "/procedural/unit-13",
          },
          { text: "Unit 14 — Deploy and share", link: "/procedural/unit-14" },
        ],
      },
      {
        text: "Course 2 — Event-driven",
        collapsed: true,
        items: [
          {
            text: "What you'll know",
            link: "/event-driven/what-youll-know",
          },
          { text: "Unit 1 — An event bus", link: "/event-driven/unit-1" },
          {
            text: "Unit 2 — Events all the way down",
            link: "/event-driven/unit-2",
          },
          {
            text: "Unit 3 — Game state as events",
            link: "/event-driven/unit-3",
          },
          { text: "Unit 4 — Achievements", link: "/event-driven/unit-4" },
        ],
      },
      {
        text: "Course 3 — Object-oriented",
        collapsed: true,
        items: [
          {
            text: "What you'll know",
            link: "/object-oriented/what-youll-know",
          },
          { text: "Unit 1 — Ball as a class", link: "/object-oriented/unit-1" },
          {
            text: "Unit 2 — Paddle and Brick classes",
            link: "/object-oriented/unit-2",
          },
          {
            text: "Unit 3 — Inheritance for brick types",
            link: "/object-oriented/unit-3",
          },
          { text: "Unit 4 — Multi-ball", link: "/object-oriented/unit-4" },
        ],
      },
      {
        text: "Course 4 — Functional",
        collapsed: true,
        items: [
          {
            text: "What you'll know",
            link: "/functional/what-youll-know",
          },
          { text: "Unit 1 — State as data", link: "/functional/unit-1" },
          { text: "Unit 2 — Composition", link: "/functional/unit-2" },
          { text: "Unit 3 — Time travel", link: "/functional/unit-3" },
          { text: "Unit 4 — Replay", link: "/functional/unit-4" },
        ],
      },
      {
        text: "Course 5 — Reactive",
        collapsed: true,
        items: [
          {
            text: "What you'll know",
            link: "/reactive/what-youll-know",
          },
          { text: "Unit 1 — Signals", link: "/reactive/unit-1" },
          { text: "Unit 2 — A clicker", link: "/reactive/unit-2" },
          { text: "Unit 3 — Auto-clickers", link: "/reactive/unit-3" },
          { text: "Unit 4 — Save state", link: "/reactive/unit-4" },
        ],
      },
      {
        text: "Course 6 — Entity-Component-System",
        collapsed: true,
        items: [
          {
            text: "What you'll know",
            link: "/entity-component-system/what-youll-know",
          },
          {
            text: "Unit 1 — Entities, components, systems",
            link: "/entity-component-system/unit-1",
          },
          {
            text: "Unit 2 — The player ship",
            link: "/entity-component-system/unit-2",
          },
          {
            text: "Unit 3 — A field of asteroids",
            link: "/entity-component-system/unit-3",
          },
          {
            text: "Unit 4 — Collisions and lives",
            link: "/entity-component-system/unit-4",
          },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jkakar/building-blocks" },
    ],
  },
});
