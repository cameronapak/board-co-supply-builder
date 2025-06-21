// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",
  vite: {
    plugins: [tailwindcss()]
  },
  // This makes it where `/admin` and `/admin/` both work.
  trailingSlash: "ignore",
  adapter: netlify()
});
