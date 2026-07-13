import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

const external = ["howler", "tone"];

const audioEntry = fileURLToPath(new URL("./src/audio/index.ts", import.meta.url));
const audioArcadeEntry = fileURLToPath(
  new URL("./src/audio-arcade/index.ts", import.meta.url),
);
const runtimeEntry = fileURLToPath(new URL("./src/runtime/index.ts", import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: false,
    lib: {
      entry: {
        "audio/index": audioEntry,
        "audio-arcade/index": audioArcadeEntry,
        "runtime/index": runtimeEntry,
      },
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external,
      output: {
        chunkFileNames: "chunks/[name]-[hash].js",
      },
    },
  },
});
