import { build } from "vite";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = await readFile("dist/grid-canvas-system.es.js", "utf8");
if (/AudioContext|Howler|Transport\.bpm/.test(root))
  throw new Error("Optional audio leaked into the root bundle");
const entry = "\0runtime-consumer";
const result = await build({
  configFile: false,
  logLevel: "silent",
  plugins: [
    {
      name: "runtime-consumer",
      resolveId(id) {
        if (id === "runtime-consumer" || id === entry) return entry;
      },
      load(id) {
        if (id === entry)
          return `export { createCanvasRuntime } from ${JSON.stringify(resolve("dist/runtime/index.js").replaceAll("\\", "/"))};`;
      },
    },
  ],
  build: {
    write: false,
    rollupOptions: { input: "runtime-consumer" },
    lib: { entry: "runtime-consumer", formats: ["es"] },
  },
});
const code = result[0].output
  .filter((item) => item.type === "chunk")
  .map((item) => item.code)
  .join("\n");
if (
  code.includes("initial must reference an existing scene") ||
  code.includes("tile sprite definitions require a palette")
)
  throw new Error("Unused runtime helpers were not tree-shaken");
console.log(
  `Runtime consumer bundle: ${Buffer.byteLength(code)} bytes; optional audio excluded and unused helpers removed.`,
);
