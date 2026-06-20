import { createCanvas } from "@napi-rs/canvas";
import { JSDOM } from "jsdom";
import { mkdir, writeFile } from "node:fs/promises";

import GridCanvasSystem from "../dist/grid-canvas-system.es.js";

const SNAPSHOT_DIR = new URL("../tests/__snapshots__/", import.meta.url);

const BASELINE_OPTIONS = {
  width: 120,
  height: 60,
  backgroundColor: "#000000",
  gridColor: "#00ff00",
  gridLabelColor: "rgba(0, 0, 0, 0)",
  coordinateLabelColor: "#ffffff",
  gridLabelFont: "12px monospace",
  coordinateFont: "18px serif",
  cellSize: 20,
  majorStep: 40,
  minorLineWidth: 2,
  majorLineWidth: 4,
  devicePixelRatio: 1,
};

const HIDPI_OPTIONS = {
  width: 120,
  height: 60,
  backgroundColor: "#000000",
  gridColor: "#00ff00",
  gridLabelColor: "rgba(0, 0, 0, 0)",
  coordinateLabelColor: "#ffffff",
  gridLabelFont: "10px monospace",
  coordinateFont: "10px serif",
  cellSize: 10,
  majorStep: 20,
  minorLineWidth: 1,
  majorLineWidth: 2,
  devicePixelRatio: 2,
};

function installDomGlobals(window) {
  globalThis.window = window;
  globalThis.document = window.document;
  globalThis.HTMLCanvasElement = window.HTMLCanvasElement;
}

function attachBackingCanvas(element) {
  let width = element.width || 300;
  let height = element.height || 150;
  const backingCanvas = createCanvas(width, height);

  Object.defineProperties(element, {
    width: {
      configurable: true,
      get: () => width,
      set: (value) => {
        width = value;
        backingCanvas.width = value;
      },
    },
    height: {
      configurable: true,
      get: () => height,
      set: (value) => {
        height = value;
        backingCanvas.height = value;
      },
    },
  });

  Object.defineProperty(element, "getContext", {
    configurable: true,
    value: (contextId) => {
      if (contextId !== "2d") {
        return null;
      }

      return backingCanvas.getContext("2d");
    },
  });

  return backingCanvas;
}

function renderScenario(elementId, options) {
  const dom = new JSDOM(`<canvas id="${elementId}"></canvas>`);
  installDomGlobals(dom.window);

  const canvasElement = dom.window.document.getElementById(elementId);
  const backingCanvas = attachBackingCanvas(canvasElement);

  new GridCanvasSystem(elementId, options);

  return backingCanvas;
}

async function writeSnapshot(name, options) {
  const backingCanvas = renderScenario(name, options);
  const snapshotUrl = new URL(`${name}.png`, SNAPSHOT_DIR);

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

await mkdir(SNAPSHOT_DIR, { recursive: true });
await writeSnapshot("grid-baseline", BASELINE_OPTIONS);
await writeSnapshot("grid-hidpi", HIDPI_OPTIONS);
