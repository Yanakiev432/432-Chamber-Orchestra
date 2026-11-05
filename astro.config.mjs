import { defineConfig } from "astro/config";

const site = process.env.PUBLIC_SITE_URL || "https://432hz-orchestra.com";

export default defineConfig({
  site,
  output: "static",
  trailingSlash: "always",
});
