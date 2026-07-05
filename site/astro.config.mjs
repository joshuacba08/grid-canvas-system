import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  integrations: [mdx()],
  vite: {
    build: {
      // Monaco is intentionally isolated to the Playground route.
      chunkSizeWarningLimit: 4000,
    },
    resolve: {
      alias: {
        "grid-canvas-system": fileURLToPath(
          new URL("../src/index.ts", import.meta.url),
        ),
      },
    },
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
});
