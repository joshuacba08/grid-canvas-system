import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts", // Archivo principal de tu librería
      name: "GridCanvasSystem", // Nombre global para el formato UMD
      fileName: (format) => `grid-canvas-system.${format}.js`, // Nombres de salida
      formats: ["es", "umd"], // Formatos de salida: ES Modules y UMD
    },
    rollupOptions: {
      // Si tienes dependencias externas, exclúyelas aquí
      external: [],
      output: {
        globals: {
          // Configura nombres globales si tienes dependencias externas
        },
      },
    },
  },
});
