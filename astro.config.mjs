import { defineConfig } from "astro/config";
import { locationConfig } from "./scripts/location.mjs";
export default defineConfig({
  ...locationConfig(),
  output: "static",
  devToolbar: { enabled: false },
  vite: { server: { allowedHosts: ["terminal.local"] } },
  trailingSlash: "always",
  build: { format: "directory" },
});
