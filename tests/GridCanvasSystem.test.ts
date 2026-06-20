import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GridCanvasSystem from "../src";

interface MockCanvasContext {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  lineWidth: number;
  font: string;
  setTransform: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
}

function createMockContext(): MockCanvasContext {
  return {
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    font: "",
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    clearRect: vi.fn(),
  };
}

describe("GridCanvasSystem", () => {
  let mockContext: MockCanvasContext;

  beforeEach(() => {
    document.body.innerHTML = '<canvas id="canvas"></canvas><div id="not-canvas"></div>';
    mockContext = createMockContext();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => mockContext as unknown as CanvasRenderingContext2D,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when the canvas element does not exist", () => {
    expect(() => new GridCanvasSystem("missing-canvas")).toThrow(
      'Canvas element with id "missing-canvas" not found',
    );
  });

  it("throws when the target element is not a canvas", () => {
    expect(() => new GridCanvasSystem("not-canvas")).toThrow(
      'Element with id "not-canvas" is not a canvas',
    );
  });

  it("throws when the 2d context cannot be created", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValueOnce(null);

    expect(() => new GridCanvasSystem("canvas")).toThrow(
      '2D context is not available for canvas "canvas"',
    );
  });

  it("supports the legacy numeric constructor signature", () => {
    const grid = new GridCanvasSystem("canvas", 320, 180);

    expect(grid.options.width).toBe(320);
    expect(grid.options.height).toBe(180);
    expect(grid.canvas.style.width).toBe("320px");
    expect(grid.canvas.style.height).toBe("180px");
  });

  it("supports visual options and hidpi scaling", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 200,
      height: 100,
      backgroundColor: "red",
      gridColor: "#123456",
      labelColor: "#abcdef",
      cellSize: 20,
      majorStep: 40,
      minorLineWidth: 1,
      majorLineWidth: 2,
      devicePixelRatio: 2,
      font: "12px monospace",
    });

    expect(grid.options.devicePixelRatio).toBe(2);
    expect(grid.canvas.width).toBe(400);
    expect(grid.canvas.height).toBe(200);
    expect(grid.canvas.style.width).toBe("200px");
    expect(grid.canvas.style.height).toBe("100px");
    expect(grid.canvas.style.backgroundColor).toBe("red");
    expect(mockContext.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it("drawCoordinate uses the configured baseline transform and label style", () => {
    const grid = new GridCanvasSystem("canvas", {
      labelColor: "#ffffff",
      font: "14px serif",
      devicePixelRatio: 2,
    });

    mockContext.fillText.mockClear();
    mockContext.save.mockClear();
    mockContext.restore.mockClear();
    mockContext.setTransform.mockClear();

    grid.drawCoordinate(10, 20);

    expect(mockContext.save).toHaveBeenCalledTimes(1);
    expect(mockContext.restore).toHaveBeenCalledTimes(1);
    expect(mockContext.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(mockContext.fillStyle).toBe("#ffffff");
    expect(mockContext.font).toBe("14px serif");
    expect(mockContext.fillText).toHaveBeenCalledWith("(10,20)", 10, 20);
  });

  it("clearCanvas clears using logical dimensions and redraws the grid", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 120,
      height: 60,
      cellSize: 20,
      majorStep: 40,
      devicePixelRatio: 2,
    });

    mockContext.clearRect.mockClear();
    mockContext.stroke.mockClear();

    grid.clearCanvas();

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 120, 60);
    expect(mockContext.stroke).toHaveBeenCalled();
  });

  it("rejects invalid majorStep values", () => {
    expect(
      () =>
        new GridCanvasSystem("canvas", {
          cellSize: 30,
          majorStep: 50,
        }),
    ).toThrow("majorStep must be a multiple of cellSize");
  });
});
