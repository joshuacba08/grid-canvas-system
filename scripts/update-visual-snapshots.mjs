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

const GHOST_OPTIONS = {
  width: 220,
  height: 220,
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

const ASTEROID_OPTIONS = {
  width: 220,
  height: 220,
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

const SHIP_OPTIONS = {
  width: 220,
  height: 220,
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

const HUD_OPTIONS = {
  width: 320,
  height: 180,
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

const PIXEL_SPRITE_OPTIONS = {
  width: 200,
  height: 160,
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
    // Keep the integration path without snapshotting platform-specific glyph rasterization.
    color: "rgba(255, 255, 255, 0)",
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

function renderGhostScenario() {
  const { backingCanvas, grid } = renderScenario("ghost", GHOST_OPTIONS);

  grid.drawGhost({ x: 110, y: 115 }, 70, {
    feet: 5,
    fillColor: "#ff0000",
    strokeColor: "#ffffff",
  });

  return backingCanvas;
}

function renderAsteroidScenario() {
  const { backingCanvas, grid } = renderScenario("asteroid", ASTEROID_OPTIONS);

  grid.drawAsteroid(
    { x: 110, y: 110 },
    70,
    [-0.3, 0.15, 0.45, -0.1, 0.25, -0.4, 0.3, 0.05, -0.2, 0.4, -0.15, 0.2],
    {
      noise: 0.45,
      rotation: -Math.PI / 8,
      guide: true,
      fillColor: "#111111",
      strokeColor: "#ffffff",
      lineWidth: 2,
    },
  );

  return backingCanvas;
}

function renderShipScenario() {
  const { backingCanvas, grid } = renderScenario("ship", SHIP_OPTIONS);

  grid.drawShip({ x: 110, y: 110 }, 70, {
    rotation: -Math.PI / 2,
    curve1: 0.45,
    curve2: 0.8,
    guide: true,
    fillColor: "#111111",
    strokeColor: "#ffffff",
    lineWidth: 2,
  });

  return backingCanvas;
}

function renderProjectileScenario() {
  const { backingCanvas, grid } = renderScenario("projectile", PACMAN_OPTIONS);

  grid.drawProjectile({ x: 45, y: 70 }, 10, 1, {
    strokeColor: "#ffffff",
  });
  grid.drawProjectile({ x: 100, y: 100 }, 14, 0.6, {
    strokeColor: "#ffffff",
  });
  grid.drawProjectile({ x: 155, y: 135 }, 18, 0.25, {
    strokeColor: "#ffffff",
    guide: true,
  });

  return backingCanvas;
}

function renderHudScenario() {
  const { backingCanvas, grid } = renderScenario("hud", HUD_OPTIONS);

  grid.drawShip({ x: 160, y: 112 }, 38, {
    rotation: -Math.PI / 2,
    curve1: 0.45,
    curve2: 0.8,
    thruster: true,
    fillColor: "#111111",
    strokeColor: "#ffffff",
    lineWidth: 2,
  });
  // Use glyph-independent bitmap output in visual snapshots.
  grid.drawBarIndicator("", 8, 8, 110, 12, 78, 100, {
    fillColor: "#22c55e",
    strokeColor: "#ffffff",
    textColor: "rgba(255, 255, 255, 0)",
    font: "12px sans-serif",
    labelGap: 8,
  });
  grid.drawValueLabel("score", 2450, 312, 18, {
    color: "rgba(255, 255, 255, 0)",
    font: "12px sans-serif",
    textAlign: "end",
  });
  grid.drawValueLabel("level", 3, 160, 18, {
    color: "rgba(255, 255, 255, 0)",
    font: "12px sans-serif",
    textAlign: "center",
  });
  grid.drawMessage(
    "GAME OVER",
    "Press space to play again",
    { x: 160, y: 62 },
    {
      color: "rgba(255, 255, 255, 0)",
      subColor: "rgba(212, 212, 212, 0)",
      mainFont: "28px sans-serif",
      subFont: "16px sans-serif",
    },
  );

  return backingCanvas;
}

function renderPixelSpriteScenario() {
  const { backingCanvas, grid } = renderScenario("pixel-sprite", PIXEL_SPRITE_OPTIONS);

  grid.drawPixelSprite(
    [
      "00111100",
      "01122110",
      "11222211",
      "12233221",
      "11222211",
      "01111110",
      "00100100",
    ],
    {
      x: 60,
      y: 45,
      pixelSize: 10,
      palette: {
        0: "transparent",
        1: "#38bdf8",
        2: "#f8fafc",
        3: "#0f172a",
      },
    },
  );

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

async function writeGhostSnapshot() {
  const snapshotUrl = new URL("ghost.png", SNAPSHOT_DIR);
  const backingCanvas = renderGhostScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writeAsteroidSnapshot() {
  const snapshotUrl = new URL("asteroid.png", SNAPSHOT_DIR);
  const backingCanvas = renderAsteroidScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writeShipSnapshot() {
  const snapshotUrl = new URL("ship.png", SNAPSHOT_DIR);
  const backingCanvas = renderShipScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writeProjectileSnapshot() {
  const snapshotUrl = new URL("projectile.png", SNAPSHOT_DIR);
  const backingCanvas = renderProjectileScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writeHudSnapshot() {
  const snapshotUrl = new URL("hud.png", SNAPSHOT_DIR);
  const backingCanvas = renderHudScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

async function writePixelSpriteSnapshot() {
  const snapshotUrl = new URL("pixel-sprite.png", SNAPSHOT_DIR);
  const backingCanvas = renderPixelSpriteScenario();

  await writeFile(snapshotUrl, backingCanvas.toBuffer("image/png"));
}

await mkdir(SNAPSHOT_DIR, { recursive: true });
await writeSnapshot("grid-baseline", BASELINE_OPTIONS);
await writeSnapshot("grid-hidpi", HIDPI_OPTIONS);
await writeEncapsulatedDrawingSnapshot();
await writePacmanSnapshot();
await writeGhostSnapshot();
await writeAsteroidSnapshot();
await writeShipSnapshot();
await writeProjectileSnapshot();
await writeHudSnapshot();
await writePixelSpriteSnapshot();
