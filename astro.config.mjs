import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://pavanturlapati.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  // Renamed sections. Keep old links working, including individual posts.
  redirects: {
    "/feed/": "/projects/",
    "/watching/": "/hobbies/",
    "/writing/": "/blog/",
    "/writing/tag/[tag]": "/blog/tag/[tag]",
    "/writing/[slug]": "/blog/[slug]",
    "/notes/": "/opinion/",
    "/notes/[slug]": "/opinion/[slug]",
  },
});
