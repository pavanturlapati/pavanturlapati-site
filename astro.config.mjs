import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://pavanturlapati.com",
  trailingSlash: "always",
  integrations: [sitemap()],
  // The Feed became Projects. Keep old links working.
  redirects: { "/feed/": "/projects/" },
});
