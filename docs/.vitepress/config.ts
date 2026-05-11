import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Building Blocks",
  description: "Learn to program by building a game.",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Start here", link: "/unit-0" },
      { text: "Roadmap", link: "/roadmap" },
    ],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/" },
          { text: "Unit 0 — Set up your workshop", link: "/unit-0" },
          { text: "Unit 1 — A square that moves", link: "/unit-1" },
        ],
      },
      {
        text: "Planning",
        items: [{ text: "Roadmap", link: "/roadmap" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jkakar/building-blocks" },
    ],
  },
});
