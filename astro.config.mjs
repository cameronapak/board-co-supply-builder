// @ts-check
import { defineConfig, envField } from "astro/config";
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
  adapter: netlify(),
  env: {
    schema: {
      LIBSQL_DATABASE_URL: envField.string({ context: "server", access: "secret" }),
      LIBSQL_DATABASE_TOKEN: envField.string({ context: "server", access: "secret" }),
      S3_API_URL: envField.string({ context: "server", access: "secret" }),
      S3_ACCESS_KEY: envField.string({ context: "server", access: "secret" }),
      S3_SECRET_ACCESS_KEY: envField.string({ context: "server", access: "secret" }),
      SQUARESPACE_API_KEY: envField.string({ context: "server", access: "secret" }),
      SQUARESPACE_PRODUCT_ID: envField.string({ context: "server", access: "secret" })
    }
  }
});
