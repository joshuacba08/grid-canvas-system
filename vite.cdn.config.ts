import { defineConfig } from "vite";

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: "src/cdn.ts",
      name: "GridCanvasSystem",
      fileName: () => "grid-canvas-system.umd.js",
      formats: ["umd"],
    },
  },
});
