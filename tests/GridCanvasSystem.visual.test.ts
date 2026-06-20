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
});
