import { createCanvas, loadImage } from "@napi-rs/canvas";
import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import GridCanvasSystem, { type GridCanvasSystemOptions } from "../src";

type BackingCanvas = ReturnType<typeof createCanvas>;

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = resolve(TEST_DIR, "__snapshots__");
const ARTIFACT_DIR = resolve(TEST_DIR, "__artifacts__");

const BASELINE_OPTIONS: GridCanvasSystemOptions = {
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

const HIDPI_OPTIONS: GridCanvasSystemOptions = {
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

const ENCAPSULATED_DRAWING_OPTIONS: GridCanvasSystemOptions = {
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

const PACMAN_OPTIONS: GridCanvasSystemOptions = {
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

const GHOST_OPTIONS: GridCanvasSystemOptions = {
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

const ASTEROID_OPTIONS: GridCanvasSystemOptions = {
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

const SHIP_OPTIONS: GridCanvasSystemOptions = {
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

const HUD_OPTIONS: GridCanvasSystemOptions = {
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

function attachBackingCanvas(element: HTMLCanvasElement): BackingCanvas {
  let width = element.width || 300;
  let height = element.height || 150;
  const backingCanvas = createCanvas(width, height);

  Object.defineProperties(element, {
    width: {
      configurable: true,
      get: () => width,
      set: (value: number) => {
        width = value;
        backingCanvas.width = value;
      },
    },
    height: {
      configurable: true,
      get: () => height,
      set: (value: number) => {
        height = value;
        backingCanvas.height = value;
      },
    },
  });

  Object.defineProperty(element, "getContext", {
    configurable: true,
    value: ((contextId: string) => {
      if (contextId !== "2d") {
        return null;
      }

      return backingCanvas.getContext("2d") as unknown as CanvasRenderingContext2D;
    }) satisfies HTMLCanvasElement["getContext"],
  });

  return backingCanvas;
}

function renderScenario(
  elementId: string,
  options: GridCanvasSystemOptions,
): {
  grid: GridCanvasSystem;
  backingCanvas: BackingCanvas;
} {
  document.body.innerHTML = `<canvas id="${elementId}"></canvas>`;
  const canvasElement = document.getElementById(elementId) as HTMLCanvasElement;
  const backingCanvas = attachBackingCanvas(canvasElement);
  const grid = new GridCanvasSystem(elementId, options);

  return { grid, backingCanvas };
}

function renderEncapsulatedDrawingScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-encapsulated-drawing",
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

function renderPacmanScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-pacman",
    PACMAN_OPTIONS,
  );

  grid.drawPacman(100, 100, 70, 1, {
    fillColor: "#FFFF00",
    strokeColor: "#000000",
    lineWidth: 2,
  });

  return backingCanvas;
}

function renderGhostScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-ghost",
    GHOST_OPTIONS,
  );

  grid.drawGhost(
    { x: 110, y: 115 },
    70,
    {
      feet: 5,
      fillColor: "#ff0000",
      strokeColor: "#ffffff",
    },
  );

  return backingCanvas;
}

function renderAsteroidScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-asteroid",
    ASTEROID_OPTIONS,
  );

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

function renderShipScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-ship",
    SHIP_OPTIONS,
  );

  grid.drawShip(
    { x: 110, y: 110 },
    70,
    {
      rotation: -Math.PI / 2,
      curve1: 0.45,
      curve2: 0.8,
      guide: true,
      fillColor: "#111111",
      strokeColor: "#ffffff",
      lineWidth: 2,
    },
  );

  return backingCanvas;
}

function renderProjectileScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-projectile",
    PACMAN_OPTIONS,
  );

  grid.drawProjectile(
    { x: 45, y: 70 },
    10,
    1,
    {
      strokeColor: "#ffffff",
    },
  );
  grid.drawProjectile(
    { x: 100, y: 100 },
    14,
    0.6,
    {
      strokeColor: "#ffffff",
    },
  );
  grid.drawProjectile(
    { x: 155, y: 135 },
    18,
    0.25,
    {
      strokeColor: "#ffffff",
      guide: true,
    },
  );

  return backingCanvas;
}

function renderHudScenario(): BackingCanvas {
  const { grid, backingCanvas } = renderScenario(
    "visual-hud",
    HUD_OPTIONS,
  );

  grid.drawShip(
    { x: 160, y: 112 },
    38,
    {
      rotation: -Math.PI / 2,
      curve1: 0.45,
      curve2: 0.8,
      thruster: true,
      fillColor: "#111111",
      strokeColor: "#ffffff",
      lineWidth: 2,
    },
  );
  grid.drawBarIndicator("health", 8, 8, 110, 12, 78, 100, {
    fillColor: "#22c55e",
    strokeColor: "#ffffff",
    textColor: "#ffffff",
    font: "12px sans-serif",
    labelGap: 8,
  });
  grid.drawValueLabel("score", 2450, 312, 18, {
    color: "#ffffff",
    font: "12px sans-serif",
    textAlign: "end",
  });
  grid.drawValueLabel("level", 3, 160, 18, {
    color: "#ffffff",
    font: "12px sans-serif",
    textAlign: "center",
  });
  grid.drawMessage(
    "GAME OVER",
    "Press space to play again",
    { x: 160, y: 62 },
    {
      color: "#ffffff",
      subColor: "#d4d4d4",
      mainFont: "28px sans-serif",
      subFont: "16px sans-serif",
    },
  );

  return backingCanvas;
}

async function toPixelBuffer(pngBuffer: Buffer): Promise<Buffer> {
  const image = await loadImage(pngBuffer);
  const decodedCanvas = createCanvas(image.width, image.height);
  const decodedCtx = decodedCanvas.getContext("2d");

  decodedCtx.drawImage(image, 0, 0);

  return Buffer.from(
    decodedCtx.getImageData(0, 0, image.width, image.height).data,
  );
}

async function expectCanvasToMatchSnapshot(
  backingCanvas: BackingCanvas,
  snapshotName: string,
): Promise<void> {
  const actualPng = backingCanvas.toBuffer("image/png");
  const snapshotPath = resolve(SNAPSHOT_DIR, `${snapshotName}.png`);
  const expectedPng = readFileSync(snapshotPath);

  const actualPixels = await toPixelBuffer(actualPng);
  const expectedPixels = await toPixelBuffer(expectedPng);

  if (!actualPixels.equals(expectedPixels)) {
    const artifactPath = resolve(ARTIFACT_DIR, `${snapshotName}.actual.png`);
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, actualPng);
  }

  expect(actualPixels.equals(expectedPixels)).toBe(true);
}

describe("GridCanvasSystem visual snapshots", () => {
  it("matches the baseline grid snapshot", async () => {
    const { backingCanvas } = renderScenario("visual-grid-baseline", BASELINE_OPTIONS);

    await expectCanvasToMatchSnapshot(backingCanvas, "grid-baseline");
  });

  it("matches the hidpi grid snapshot", async () => {
    const { backingCanvas } = renderScenario("visual-grid-hidpi", HIDPI_OPTIONS);

    await expectCanvasToMatchSnapshot(backingCanvas, "grid-hidpi");
  });

  it("restores the baseline snapshot after custom coordinate drawing and clearCanvas", async () => {
    const { grid, backingCanvas } = renderScenario(
      "visual-grid-clear",
      BASELINE_OPTIONS,
    );

    const baselineSnapshot = readFileSync(
      resolve(SNAPSHOT_DIR, "grid-baseline.png"),
    );
    const baselinePixels = await toPixelBuffer(baselineSnapshot);

    grid.drawCoordinate(55, 25);
    const afterCoordinatePixels = await toPixelBuffer(
      backingCanvas.toBuffer("image/png"),
    );

    expect(afterCoordinatePixels.equals(baselinePixels)).toBe(false);

    grid.clearCanvas();

    await expectCanvasToMatchSnapshot(backingCanvas, "grid-baseline");
  });

  it("matches the encapsulated drawing snapshot", async () => {
    const backingCanvas = renderEncapsulatedDrawingScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "encapsulated-drawing");
  });

  it("matches the pacman snapshot", async () => {
    const backingCanvas = renderPacmanScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "pacman");
  });

  it("matches the ghost snapshot", async () => {
    const backingCanvas = renderGhostScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "ghost");
  });

  it("matches the asteroid snapshot", async () => {
    const backingCanvas = renderAsteroidScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "asteroid");
  });

  it("matches the ship snapshot", async () => {
    const backingCanvas = renderShipScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "ship");
  });

  it("matches the projectile snapshot", async () => {
    const backingCanvas = renderProjectileScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "projectile");
  });

  it("matches the hud snapshot", async () => {
    const backingCanvas = renderHudScenario();

    await expectCanvasToMatchSnapshot(backingCanvas, "hud");
  });
});
