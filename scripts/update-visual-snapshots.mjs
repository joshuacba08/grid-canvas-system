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

const ENCAPSULATED_DRAWING_OPTIONS = {
  width: 140,
  height: 80,
  backgroundColor: "#000000",
  gridColor: "#00ff00",
  gridLabelColor: "rgba(0, 0, 0, 0)",
  coordinateLabelColor: "#ffffff",
  gridLabelFont: "10px monospace",
  coordinateFont: "12px serif",
  cellSize: 20,
  majorStep: 40,
  minorLineWidth: 2,
  majorLineWidth: 4,
  devicePixelRatio: 1,
};

const PACMAN_OPTIONS = {
  width: 200,
  height: 200,
  backgroundColor: "#000000",
  gridColor: "#00ff00",
  gridLabelColor: "rgba(0, 0, 0, 0)",
  coordinateLabelColor: "#ffffff",
  gridLabelFont: "10px monospace",
  coordinateFont: "12px serif",
  cellSize: 20,
  majorStep: 40,
  minorLineWidth: 2,
  majorLineWidth: 4,
  devicePixelRatio: 1,
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

  const grid = new GridCanvasSystem(elementId, options);

  return { backingCanvas, grid };
}

function renderEncapsulatedDrawingScenario() {
  const { backingCanvas, grid } = renderScenario(
    "encapsulated-drawing",
    ENCAPSULATED_DRAWING_OPTIONS,
  );

  grid.drawPolyline(
    [
      { x: 20, y: 50 },
      { x: 60, y: 20 },
      { x: 110, y: 40 },
    ],
    {
      color: "#ffffff",
      lineWidth: 3,
    },
  );
  grid.drawLine(
    { x: 110, y: 40 },
    { x: 120, y: 60 },
    {
      color: "#ffffff",
      lineWidth: 3,
    },
  );
  grid.drawCoordinate(60, 20, {
    color: "#ffffff",
    font: "12px serif",
  });

  return backingCanvas;
}

function renderPacmanScenario() {
  const { backingCanvas, grid } = renderScenario("pacman", PACMAN_OPTIONS);

  grid.drawPacman(100, 100, 70, 1, {
    fillColor: "#FFFF00",
    strokeColor: "#000000",
    lineWidth: 2,
  });

  return backingCanvas;
}

async function writeSnapshot(name, options) {
  const { backingCanvas } = renderScenario(name, options);
  const snapshotUrl = new URL(`${name}.png`, SNAPSHOT_DIR);

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writeEncapsulatedDrawingSnapshot() {
  const snapshotUrl = new URL("encapsulated-drawing.png", SNAPSHOT_DIR);
  const backingCanvas = renderEncapsulatedDrawingScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writePacmanSnapshot() {
  const snapshotUrl = new URL("pacman.png", SNAPSHOT_DIR);
  const backingCanvas = renderPacmanScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

await mkdir(SNAPSHOT_DIR, { recursive: true });
await writeSnapshot("grid-baseline", BASELINE_OPTIONS);
await writeSnapshot("grid-hidpi", HIDPI_OPTIONS);
await writeEncapsulatedDrawingSnapshot();
await writePacmanSnapshot();
