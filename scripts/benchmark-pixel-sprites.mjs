import { createCanvas } from "@napi-rs/canvas";
import { JSDOM } from "jsdom";
import { performance } from "node:perf_hooks";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cpus } from "node:os";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";

const libraryPath = resolve(
  process.argv.find((arg) => arg.startsWith("--library="))?.slice(10) ??
    "dist/grid-canvas-system.es.js",
);
const { default: GridCanvasSystem } = await import(pathToFileURL(libraryPath).href);
const check = process.argv.includes("--check");
const baselinePath = "docs/stability/performance-baseline.json";
const baseline = check ? JSON.parse(await readFile(baselinePath, "utf8")) : null;
const referencePath = resolve(
  "tests/__artifacts__/performance-reference/dist/grid-canvas-system.es.js",
);
let Reference;
if (check) {
  const hash = createHash("sha256")
    .update(await readFile(referencePath))
    .digest("hex");
  if (hash !== baseline.librarySha256)
    throw new Error("Unverified performance reference");
  Reference = (await import(pathToFileURL(referencePath).href)).default;
}

const ITERATIONS = 5_000;
const SPRITE = [
  "00111100",
  "01122110",
  "11222211",
  "12233221",
  "11222211",
  "01111110",
  "00100100",
];
const PALETTE = {
  0: "transparent",
  1: "#38bdf8",
  2: "#f8fafc",
  3: "#0f172a",
};

function installCanvasDom(Constructor = GridCanvasSystem) {
  const dom = new JSDOM('<canvas id="canvas"></canvas>');
  const canvasElement = dom.window.document.getElementById("canvas");
  const backingCanvas = createCanvas(240, 180);

  Object.defineProperties(canvasElement, {
    width: {
      configurable: true,
      get: () => backingCanvas.width,
      set: (value) => {
        backingCanvas.width = value;
      },
    },
    height: {
      configurable: true,
      get: () => backingCanvas.height,
      set: (value) => {
        backingCanvas.height = value;
      },
    },
  });

  Object.defineProperty(canvasElement, "getContext", {
    configurable: true,
    value: (contextId) => {
      if (contextId !== "2d") {
        return null;
      }

      return backingCanvas.getContext("2d");
    },
  });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLCanvasElement = dom.window.HTMLCanvasElement;

  return new Constructor("canvas", {
    backgroundColor: "#000000",
    cellSize: 20,
    devicePixelRatio: 1,
    gridColor: "#00ff00",
    height: 180,
    majorStep: 40,
    width: 240,
  });
}

function measure(label, callback) {
  const startedAt = performance.now();

  for (let index = 0; index < ITERATIONS; index += 1) {
    callback(index);
  }

  const elapsed = performance.now() - startedAt;
  const operationsPerSecond = Math.round((ITERATIONS / elapsed) * 1000);

  return {
    elapsed,
    label,
    operationsPerSecond,
  };
}

function operationsFor(Constructor) {
  const grid = installCanvasDom(Constructor);
  const compiledSprite = Constructor.compilePixelSprite(SPRITE, PALETTE);
  return {
    drawPixelSprite: (index) =>
      grid.drawPixelSprite(SPRITE, {
        palette: PALETTE,
        pixelSize: 4,
        x: (index % 40) * 2,
        y: (index % 30) * 2,
      }),
    drawCompiledPixelSprite: (index) =>
      grid.drawCompiledPixelSprite(compiledSprite, {
        pixelSize: 4,
        x: (index % 40) * 2,
        y: (index % 30) * 2,
      }),
  };
}
const candidateOperations = operationsFor(GridCanvasSystem);
const referenceOperations = Reference ? operationsFor(Reference) : null;
for (const operations of [candidateOperations, referenceOperations].filter(Boolean))
  for (const operation of Object.values(operations)) measure("warmup", operation);
const samples = { drawPixelSprite: [], drawCompiledPixelSprite: [] };
const referenceSamples = { drawPixelSprite: [], drawCompiledPixelSprite: [] };
for (let run = 0; run < 10; run++) {
  const names = ["drawPixelSprite", "drawCompiledPixelSprite"];
  if (run % 2) names.reverse();
  const sides = [[candidateOperations, samples]];
  if (referenceOperations) sides.push([referenceOperations, referenceSamples]);
  if (run % 2) sides.reverse();
  for (const name of names)
    for (const [operations, values] of sides)
      values[name].push(measure(name, operations[name]).elapsed);
}
const medianValues = (valuesByName) =>
  Object.fromEntries(
    Object.entries(valuesByName).map(([name, values]) => {
      const sorted = [...values].sort((a, b) => a - b);
      return [name, (sorted[4] + sorted[5]) / 2];
    }),
  );
const medians = medianValues(samples);
const referenceMedians = Reference ? medianValues(referenceSamples) : null;
async function compressedSizes(directory, prefix = "") {
  const sizes = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const key = `${prefix}${entry.name}`;
    if (entry.isDirectory())
      Object.assign(sizes, await compressedSizes(path, `${key}/`));
    else if (entry.name.endsWith(".js"))
      sizes[key] = gzipSync(await readFile(path)).length;
  }
  return sizes;
}
const sizes = await compressedSizes(dirname(libraryPath));
const report = {
  node: process.version,
  platform: process.platform,
  cpu: cpus()[0].model,
  iterations: ITERATIONS,
  repetitions: 10,
  warmup: 1,
  medians,
  samples,
  librarySha256: createHash("sha256")
    .update(await readFile(libraryPath))
    .digest("hex"),
  reference: Reference
    ? {
        sourceCommit: baseline.sourceCommit,
        librarySha256: baseline.librarySha256,
        medians: referenceMedians,
        samples: referenceSamples,
      }
    : null,
  gzipBytes: sizes,
  totalGzipBytes: Object.values(sizes).reduce((a, b) => a + b, 0),
};
await mkdir("tests/__artifacts__", { recursive: true });
if (process.argv.includes("--baseline")) {
  const sourceCommit = process.argv
    .find((arg) => arg.startsWith("--source-commit="))
    ?.slice(16);
  if (!/^[0-9a-f]{40}$/.test(sourceCommit ?? ""))
    throw new Error("Baseline requires --source-commit=<full Git commit>");
  report.sourceCommit = sourceCommit;
  await mkdir("docs/stability", { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(report, null, 2)}\n`);
} else {
  await writeFile(
    "tests/__artifacts__/performance.json",
    `${JSON.stringify(report, null, 2)}\n`,
  );
}
console.table(
  Object.entries(medians).map(([name, elapsedMs]) => ({
    operation: name,
    medianMs: elapsedMs.toFixed(2),
  })),
);
console.log(
  `Total compressed JS: ${report.totalGzipBytes} bytes; compiled speedup ${(medians.drawPixelSprite / medians.drawCompiledPixelSprite).toFixed(2)}x`,
);
if (check) {
  if (report.totalGzipBytes > baseline.totalGzipBytes * 1.05)
    throw new Error("Compressed package size exceeds the 5% budget");
  console.log("Paired baseline medians:", referenceMedians);
  for (const [name, median] of Object.entries(medians))
    if (median > referenceMedians[name] * 1.1)
      throw new Error(
        `${name} exceeds the 10% median time budget against the paired original commit`,
      );
}
