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

  it("keeps canvas and ctx as official public extension points", () => {
    const grid = new GridCanvasSystem("canvas");
    const domCanvas = document.getElementById("canvas");

    expect(grid.canvas).toBe(domCanvas);
    expect(grid.ctx).toBe(mockContext);
  });

  it("keeps compatibility with the legacy labelColor option", () => {
    const grid = new GridCanvasSystem("canvas", {
      labelColor: "#fedcba",
    });

    expect(grid.options.gridLabelColor).toBe("#fedcba");
    expect(grid.options.coordinateLabelColor).toBe("#fedcba");
  });

  it("keeps compatibility with the legacy font option", () => {
    const grid = new GridCanvasSystem("canvas", {
      font: "16px fantasy",
    });

    expect(grid.options.gridLabelFont).toBe("16px fantasy");
    expect(grid.options.coordinateFont).toBe("16px fantasy");
  });

  it("supports visual options and hidpi scaling", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 200,
      height: 100,
      backgroundColor: "red",
      gridColor: "#123456",
      gridLabelColor: "#abcdef",
      coordinateLabelColor: "#654321",
      gridLabelFont: "11px monospace",
      coordinateFont: "13px serif",
      cellSize: 20,
      majorStep: 40,
      minorLineWidth: 1,
      majorLineWidth: 2,
      devicePixelRatio: 2,
    });

    expect(grid.options.devicePixelRatio).toBe(2);
    expect(grid.canvas.width).toBe(400);
    expect(grid.canvas.height).toBe(200);
    expect(grid.canvas.style.width).toBe("200px");
    expect(grid.canvas.style.height).toBe("100px");
    expect(grid.canvas.style.backgroundColor).toBe("red");
    expect(grid.options.gridLabelColor).toBe("#abcdef");
    expect(grid.options.coordinateLabelColor).toBe("#654321");
    expect(grid.options.gridLabelFont).toBe("11px monospace");
    expect(grid.options.coordinateFont).toBe("13px serif");
    expect(mockContext.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it("drawCoordinate uses the configured baseline transform and coordinate label style", () => {
    const grid = new GridCanvasSystem("canvas", {
      gridLabelColor: "#00ff00",
      coordinateLabelColor: "#ffffff",
      gridLabelFont: "12px monospace",
      coordinateFont: "14px serif",
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

  it("draws major grid labels using the grid label color", () => {
    new GridCanvasSystem("canvas", {
      width: 120,
      height: 60,
      cellSize: 20,
      majorStep: 40,
      gridLabelColor: "#112233",
      gridLabelFont: "15px cursive",
    });

    expect(mockContext.fillStyle).toBe("#112233");
    expect(mockContext.font).toBe("15px cursive");
    expect(mockContext.fillText.mock.calls).toEqual([
      ["0", 0, 10],
      ["40", 40, 10],
      ["80", 80, 10],
      ["0", 0, 10],
      ["40", 0, 50],
    ]);
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

  it("clearCanvas redraws the expected number of grid lines and labels", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 120,
      height: 60,
      cellSize: 20,
      majorStep: 40,
    });

    mockContext.clearRect.mockClear();
    mockContext.stroke.mockClear();
    mockContext.fillText.mockClear();

    grid.clearCanvas();

    expect(mockContext.stroke).toHaveBeenCalledTimes(9);
    expect(mockContext.fillText).toHaveBeenCalledTimes(5);
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
