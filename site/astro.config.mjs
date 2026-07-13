import mdx from "@astrojs/mdx";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx()],
  vite: {
    build: {
      // Monaco is intentionally isolated to the Playground route.
      chunkSizeWarningLimit: 4000,
    },
    optimizeDeps: {
      include: ["howler", "tone"],
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
