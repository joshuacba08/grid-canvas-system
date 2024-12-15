import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "GridCanvasSystem",
      fileName: (format) => `grid-canvas-system.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
