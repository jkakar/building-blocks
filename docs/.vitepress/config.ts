import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Bricks",
  description: "Learn to program by building a game.",
  cleanUrls: true,
  themeConfig: {
    nav: [{ text: "Start here", link: "/unit-0" }],
    sidebar: [
      {
        text: "Getting started",
        items: [
          { text: "Welcome", link: "/" },
          { text: "Unit 0 — Set up your workshop", link: "/unit-0" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jkakar/bricks" },
    ],
  },
});
