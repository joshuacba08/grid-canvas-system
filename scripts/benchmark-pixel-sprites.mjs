import { createCanvas } from "@napi-rs/canvas";
import { JSDOM } from "jsdom";
import { performance } from "node:perf_hooks";

import GridCanvasSystem from "../dist/grid-canvas-system.es.js";

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

function installCanvasDom() {
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

  return new GridCanvasSystem("canvas", {
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

const grid = installCanvasDom();
const compiledSprite = GridCanvasSystem.compilePixelSprite(SPRITE, PALETTE);

const rawResult = measure("drawPixelSprite", (index) => {
  grid.drawPixelSprite(SPRITE, {
    palette: PALETTE,
    pixelSize: 4,
    x: (index % 40) * 2,
    y: (index % 30) * 2,
  });
});
const compiledResult = measure("drawCompiledPixelSprite", (index) => {
  grid.drawCompiledPixelSprite(compiledSprite, {
    pixelSize: 4,
    x: (index % 40) * 2,
    y: (index % 30) * 2,
  });
});
const speedup =
  compiledResult.elapsed === 0 ? 0 : rawResult.elapsed / compiledResult.elapsed;

console.table([
  {
    elapsedMs: rawResult.elapsed.toFixed(2),
    op: rawResult.label,
    opsPerSecond: rawResult.operationsPerSecond,
  },
  {
    elapsedMs: compiledResult.elapsed.toFixed(2),
    op: compiledResult.label,
    opsPerSecond: compiledResult.operationsPerSecond,
  },
]);
console.log(`Compiled sprite draw speedup: ${speedup.toFixed(2)}x`);
