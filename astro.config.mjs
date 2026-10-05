import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://pavanturlapati.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  // Renamed sections. Keep old links working, including individual posts.
  // The old blog and writing sections are now Articles; /journal/ is new.
  redirects: {
    "/feed/": "/projects/",
    "/watching/": "/hobbies/",
    "/blog/": "/articles/",
    "/blog/tag/[tag]": "/articles/tag/[tag]",
    "/blog/[slug]": "/articles/[slug]",
    "/writing/": "/articles/",
    "/writing/tag/[tag]": "/articles/tag/[tag]",
    "/writing/[slug]": "/articles/[slug]",
    "/notes/": "/opinion/",
    "/notes/[slug]": "/opinion/[slug]",
  },
});
