import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import GridCanvasSystem, {
  CanvasContextUnavailableError,
  CanvasTargetNotFoundError,
} from "../src";

interface MockCanvasContext {
  strokeStyle: string | CanvasGradient | CanvasPattern;
  fillStyle: string | CanvasGradient | CanvasPattern;
  globalAlpha: number;
  lineWidth: number;
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  setTransform: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  rotate: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  quadraticCurveTo: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  fillText: ReturnType<typeof vi.fn>;
  measureText: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
}

function createMockContext(): MockCanvasContext {
  return {
    strokeStyle: "",
    fillStyle: "",
    globalAlpha: 1,
    lineWidth: 0,
    font: "",
    textAlign: "start",
    textBaseline: "alphabetic",
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    rect: vi.fn(),
    quadraticCurveTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
    clearRect: vi.fn(),
  };
}

describe("GridCanvasSystem", () => {
  let mockContext: MockCanvasContext;

  beforeEach(() => {
    document.body.innerHTML =
      '<canvas id="canvas"></canvas><div id="not-canvas"></div>';
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
    expect(() => new GridCanvasSystem("missing-canvas")).toThrow(
      CanvasTargetNotFoundError,
    );
  });

  it("throws when the target element is not a canvas", () => {
    expect(() => new GridCanvasSystem("not-canvas")).toThrow(
      'Element with id "not-canvas" is not a canvas',
    );
    expect(() => new GridCanvasSystem("not-canvas")).toThrow(CanvasTargetNotFoundError);
  });

  it("throws when the 2d context cannot be created", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValueOnce(null);

    let thrown: unknown;

    try {
      new GridCanvasSystem("canvas");
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(CanvasContextUnavailableError);
    expect(thrown).toHaveProperty(
      "message",
      '2D context is not available for canvas "canvas"',
    );
  });

  it("supports direct HTMLCanvasElement construction", () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const grid = new GridCanvasSystem(canvas, {
      height: 80,
      width: 120,
    });

    expect(grid.canvas).toBe(canvas);
    expect(grid.options.width).toBe(120);
    expect(grid.options.height).toBe(80);
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
      gridLabelTextAlign: "center",
      coordinateTextAlign: "end",
      gridLabelTextBaseline: "middle",
      coordinateTextBaseline: "top",
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
    expect(grid.options.gridLabelTextAlign).toBe("center");
    expect(grid.options.coordinateTextAlign).toBe("end");
    expect(grid.options.gridLabelTextBaseline).toBe("middle");
    expect(grid.options.coordinateTextBaseline).toBe("top");
    expect(mockContext.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
  });

  it("supports independent text alignment and baseline for grid and coordinate labels", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 120,
      height: 60,
      cellSize: 20,
      majorStep: 40,
      gridLabelTextAlign: "center",
      gridLabelTextBaseline: "middle",
      coordinateTextAlign: "end",
      coordinateTextBaseline: "top",
    });

    expect(mockContext.textAlign).toBe("center");
    expect(mockContext.textBaseline).toBe("middle");

    mockContext.fillText.mockClear();

    grid.drawCoordinate(10, 20);

    expect(mockContext.textAlign).toBe("end");
    expect(mockContext.textBaseline).toBe("top");
    expect(mockContext.fillText).toHaveBeenCalledWith("(10,20)", 10, 20);
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
    expect(mockContext.textAlign).toBe("start");
    expect(mockContext.textBaseline).toBe("alphabetic");
    expect(mockContext.fillText).toHaveBeenCalledWith("(10,20)", 10, 20);
  });

  it("drawText supports explicit text styling overrides", () => {
    const grid = new GridCanvasSystem("canvas", {
      coordinateLabelColor: "#ffffff",
      coordinateFont: "14px serif",
    });

    mockContext.fillText.mockClear();

    grid.drawText("hello", 30, 40, {
      color: "#ff00ff",
      font: "18px monospace",
      textAlign: "center",
      textBaseline: "middle",
    });

    expect(mockContext.fillStyle).toBe("#ff00ff");
    expect(mockContext.font).toBe("18px monospace");
    expect(mockContext.textAlign).toBe("center");
    expect(mockContext.textBaseline).toBe("middle");
    expect(mockContext.fillText).toHaveBeenCalledWith("hello", 30, 40);
  });

  it("drawPixelSprite renders palette-mapped pixels and skips transparent entries", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.fillRect.mockClear();

    grid.drawPixelSprite(["012", "345"], {
      x: 10,
      y: 20,
      pixelSize: 4,
      palette: {
        0: null,
        1: undefined,
        2: "transparent",
        3: "#111111",
        4: "#222222",
        5: "#333333",
      },
    });

    expect(mockContext.fillRect).toHaveBeenCalledTimes(3);
    expect(mockContext.fillRect).toHaveBeenNthCalledWith(1, 10, 24, 4, 4);
    expect(mockContext.fillRect).toHaveBeenNthCalledWith(2, 14, 24, 4, 4);
    expect(mockContext.fillRect).toHaveBeenNthCalledWith(3, 18, 24, 4, 4);
    expect(mockContext.fillStyle).toBe("#333333");
  });

  it("drawPixelSprite validates sprite shape, pixel size and palette coverage", () => {
    const grid = new GridCanvasSystem("canvas");
    const options = {
      x: 0,
      y: 0,
      pixelSize: 2,
      palette: {
        0: "#ffffff",
      },
    };

    expect(() => grid.drawPixelSprite([], options)).toThrow(
      "sprite must contain at least one row",
    );
    expect(() => grid.drawPixelSprite(["0", "00"], options)).toThrow(
      "sprite rows must have the same length",
    );
    expect(() =>
      grid.drawPixelSprite(["0"], {
        ...options,
        pixelSize: 0,
      }),
    ).toThrow("options.pixelSize must be a positive finite number");
    expect(() => grid.drawPixelSprite(["1"], options)).toThrow(
      'palette is missing color for "1"',
    );
  });

  it("compiles, transforms, tints and hit-tests pixel sprites", () => {
    const palette = GridCanvasSystem.createPixelPalette({
      0: "transparent",
      1: "#00ff00",
      2: "#ff00ff",
    });
    const compiled = GridCanvasSystem.compilePixelSprite(["012", "120"], palette);

    expect(compiled).toEqual({
      height: 2,
      pixels: [
        { color: "#00ff00", column: 1, row: 0 },
        { color: "#ff00ff", column: 2, row: 0 },
        { color: "#00ff00", column: 0, row: 1 },
        { color: "#ff00ff", column: 1, row: 1 },
      ],
      width: 3,
    });
    expect(GridCanvasSystem.flipPixelSpriteX(["012", "120"])).toEqual(["210", "021"]);
    expect(GridCanvasSystem.flipPixelSpriteY(["012", "120"])).toEqual(["120", "012"]);
    expect(GridCanvasSystem.tintPixelSprite(compiled, "#ffffff").pixels[0].color).toBe(
      "#ffffff",
    );
    expect(
      GridCanvasSystem.getPixelSpriteBounds(compiled, {
        x: 10,
        y: 12,
        pixelSize: 4,
      }),
    ).toEqual({ x: 10, y: 12, width: 12, height: 8 });
    expect(
      GridCanvasSystem.hitTestPixelSprite({ x: 15, y: 13 }, compiled, {
        x: 10,
        y: 12,
        pixelSize: 4,
      }),
    ).toBe(true);
    expect(
      GridCanvasSystem.hitTestPixelSprite({ x: 11, y: 13 }, compiled, {
        x: 10,
        y: 12,
        pixelSize: 4,
      }),
    ).toBe(false);
  });

  it("getPixelSpriteBounds measures raw sprites without a palette", () => {
    expect(
      GridCanvasSystem.getPixelSpriteBounds(["012", "120"], {
        x: 1,
        y: 2,
        pixelSize: 3,
      }),
    ).toEqual({ x: 1, y: 2, width: 9, height: 6 });
  });

  it("hitTestPixelSprite requires transparency information for raw sprites", () => {
    expect(() =>
      GridCanvasSystem.hitTestPixelSprite({ x: 0, y: 0 }, ["012", "120"], {
        x: 0,
        y: 0,
        pixelSize: 3,
      }),
    ).toThrow(
      "hitTestPixelSprite requires a compiled sprite or a palette to resolve transparency",
    );
  });

  it("drawCompiledPixelSprite renders cached pixels with optional opacity", () => {
    const grid = new GridCanvasSystem("canvas");
    const compiled = GridCanvasSystem.compilePixelSprite(["10"], {
      0: "transparent",
      1: "#00ff00",
    });

    mockContext.fillRect.mockClear();
    grid.drawCompiledPixelSprite(compiled, {
      opacity: 0.5,
      pixelSize: 5,
      x: 20,
      y: 30,
    });

    expect(mockContext.globalAlpha).toBe(0.5);
    expect(mockContext.fillStyle).toBe("#00ff00");
    expect(mockContext.fillRect).toHaveBeenCalledTimes(1);
    expect(mockContext.fillRect).toHaveBeenCalledWith(20, 30, 5, 5);
  });

  it("drawLine provides an encapsulated drawing path without direct ctx access", () => {
    const grid = new GridCanvasSystem("canvas", {
      coordinateLabelColor: "#ffffff",
    });

    mockContext.beginPath.mockClear();
    mockContext.moveTo.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.stroke.mockClear();

    grid.drawLine(
      { x: 10, y: 20 },
      { x: 80, y: 30 },
      {
        color: "#abcdef",
        lineWidth: 3,
      },
    );

    expect(mockContext.beginPath).toHaveBeenCalledTimes(1);
    expect(mockContext.moveTo).toHaveBeenCalledWith(10, 20);
    expect(mockContext.lineTo).toHaveBeenCalledWith(80, 30);
    expect(mockContext.strokeStyle).toBe("#abcdef");
    expect(mockContext.lineWidth).toBe(3);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("drawCircleSector creates a managed wedge path", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.beginPath.mockClear();
    mockContext.moveTo.mockClear();
    mockContext.arc.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawCircleSector({ x: 50, y: 60 }, 30, Math.PI * 0.25, Math.PI * 1.5, {
      fillColor: "#ff0000",
      strokeColor: "#0000ff",
      lineWidth: 4,
    });

    expect(mockContext.beginPath).toHaveBeenCalledTimes(1);
    expect(mockContext.moveTo).toHaveBeenCalledWith(50, 60);
    expect(mockContext.arc).toHaveBeenCalledWith(
      50,
      60,
      30,
      Math.PI * 0.25,
      Math.PI * 1.5,
    );
    expect(mockContext.lineTo).toHaveBeenLastCalledWith(50, 60);
    expect(mockContext.fillStyle).toBe("#ff0000");
    expect(mockContext.fill).toHaveBeenCalledTimes(1);
    expect(mockContext.strokeStyle).toBe("#0000ff");
    expect(mockContext.lineWidth).toBe(4);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("polarToCartesian converts polar coordinates into canvas coordinates", () => {
    const grid = new GridCanvasSystem("canvas");

    const point = grid.polarToCartesian({ x: 100, y: 60 }, 50, Math.PI / 2);

    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(110);
  });

  it("createAsteroidShape returns persistent shape noise values", () => {
    const grid = new GridCanvasSystem("canvas");
    const sequence = [0, 0.25, 0.5, 0.75, 1];
    let index = 0;

    const shape = grid.createAsteroidShape(5, () => {
      const value = sequence[index];
      index += 1;

      return value;
    });

    expect(shape).toEqual([-0.5, -0.25, 0, 0.25, 0.5]);
  });

  it("drawAsteroid uses persistent shape data with managed transforms", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.save.mockClear();
    mockContext.restore.mockClear();
    mockContext.translate.mockClear();
    mockContext.rotate.mockClear();
    mockContext.beginPath.mockClear();
    mockContext.moveTo.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.arc.mockClear();
    mockContext.closePath.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawAsteroid({ x: 100, y: 120 }, 30, [0, 0.5, -0.5, 0.25], {
      noise: 0.4,
      rotation: Math.PI / 8,
      guide: true,
      fillColor: "#111111",
      strokeColor: "#ffffff",
      lineWidth: 3,
    });

    expect(mockContext.save).toHaveBeenCalledTimes(1);
    expect(mockContext.restore).toHaveBeenCalledTimes(1);
    expect(mockContext.translate).toHaveBeenCalledWith(100, 120);
    expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 8);
    expect(mockContext.moveTo).toHaveBeenCalledWith(30, 0);
    expect(mockContext.lineTo).toHaveBeenCalledTimes(3);
    expect(mockContext.closePath).toHaveBeenCalledTimes(1);
    expect(mockContext.fillStyle).toBe("#111111");
    expect(mockContext.strokeStyle).toBe("rgba(255, 255, 255, 0.7)");
    expect(mockContext.lineWidth).toBe(0.5);
    expect(mockContext.arc).toHaveBeenCalledTimes(3);
    expect(mockContext.arc).toHaveBeenNthCalledWith(1, 0, 0, 24, 0, Math.PI * 2);
    expect(mockContext.arc).toHaveBeenNthCalledWith(2, 0, 0, 30, 0, Math.PI * 2);
    expect(mockContext.arc).toHaveBeenNthCalledWith(3, 0, 0, 36, 0, Math.PI * 2);

    const [secondX, secondY] = mockContext.lineTo.mock.calls[0];
    const [thirdX, thirdY] = mockContext.lineTo.mock.calls[1];

    expect(secondX).toBeCloseTo(0);
    expect(secondY).toBeCloseTo(36);
    expect(thirdX).toBeCloseTo(-24);
    expect(thirdY).toBeCloseTo(0, 5);
  });

  it("drawPacman uses the sector primitive with default visual styling", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.arc.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawPacman(100, 120, 40, 1);

    expect(mockContext.arc).toHaveBeenCalledWith(
      100,
      120,
      40,
      Math.PI * 0.2,
      Math.PI * 1.8,
    );
    expect(mockContext.fillStyle).toBe("#FFFF00");
    expect(mockContext.strokeStyle).toBe("#000000");
    expect(mockContext.lineWidth).toBe(2);
    expect(mockContext.fill).toHaveBeenCalledTimes(1);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("drawPacman supports custom direction and stroke settings", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.arc.mockClear();
    mockContext.stroke.mockClear();

    grid.drawPacman(40, 50, 20, 0.5, {
      direction: Math.PI / 2,
      fillColor: "#ffee00",
      strokeColor: "#333333",
      lineWidth: 5,
      maxMouthAngle: Math.PI * 0.6,
    });

    expect(mockContext.arc).toHaveBeenCalledWith(
      40,
      50,
      20,
      Math.PI / 2 + Math.PI * 0.15,
      Math.PI / 2 + Math.PI * 1.85,
    );
    expect(mockContext.fillStyle).toBe("#ffee00");
    expect(mockContext.strokeStyle).toBe("#333333");
    expect(mockContext.lineWidth).toBe(5);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("drawProjectile renders a filled projectile whose default color fades with life", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.arc.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();
    mockContext.closePath.mockClear();

    grid.drawProjectile({ x: 70, y: 80 }, 12, 0.5);

    expect(mockContext.arc).toHaveBeenCalledWith(70, 80, 12, 0, Math.PI * 2);
    expect(mockContext.fillStyle).toBe("rgb(255, 255, 128)");
    expect(mockContext.strokeStyle).toBe("#FFFFFF");
    expect(mockContext.lineWidth).toBe(1);
    expect(mockContext.closePath).toHaveBeenCalledTimes(1);
    expect(mockContext.fill).toHaveBeenCalledTimes(1);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("drawGhost creates the ghost silhouette and eyes through the managed context", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.save.mockClear();
    mockContext.restore.mockClear();
    mockContext.translate.mockClear();
    mockContext.rotate.mockClear();
    mockContext.beginPath.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.arc.mockClear();
    mockContext.closePath.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawGhost({ x: 60, y: 80 }, 30, {
      feet: 5,
      fillColor: "#ff0000",
      strokeColor: "#ffffff",
      rotation: Math.PI / 6,
    });

    expect(mockContext.save).toHaveBeenCalledTimes(1);
    expect(mockContext.restore).toHaveBeenCalledTimes(1);
    expect(mockContext.translate).toHaveBeenCalledWith(60, 80);
    expect(mockContext.rotate).toHaveBeenCalledWith(Math.PI / 6);
    expect(mockContext.arc).toHaveBeenCalledTimes(10);
    expect(mockContext.closePath).toHaveBeenCalledTimes(1);
    expect(mockContext.fillStyle).toBe("#000000");
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
    expect(mockContext.fill).toHaveBeenCalledTimes(3);

    const [firstArcX, firstArcY, firstArcRadius, firstArcStart, firstArcEnd] =
      mockContext.arc.mock.calls[0];

    expect(firstArcX).toBeCloseTo(19.2);
    expect(firstArcY).toBeCloseTo(25.2);
    expect(firstArcRadius).toBeCloseTo(4.8);
    expect(firstArcStart).toBe(0);
    expect(firstArcEnd).toBe(Math.PI);
  });

  it("drawValueLabel formats numeric overlays without exposing ctx", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.fillText.mockClear();

    grid.drawValueLabel("fps", 59.456, 180, 24, {
      digits: 2,
      textAlign: "end",
      color: "#ffffff",
      font: "14px monospace",
    });

    expect(mockContext.fillStyle).toBe("#ffffff");
    expect(mockContext.font).toBe("14px monospace");
    expect(mockContext.textAlign).toBe("end");
    expect(mockContext.fillText).toHaveBeenCalledWith("fps: 59.46", 180, 24);
  });

  it("drawBarIndicator draws label, frame and fill ratio through the managed context", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.fillText.mockClear();
    mockContext.measureText.mockClear();
    mockContext.rect.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawBarIndicator("health", 10, 6, 100, 12, 75, 100, {
      fillColor: "#22c55e",
      strokeColor: "#ffffff",
      trackColor: "rgba(255, 255, 255, 0.2)",
      textColor: "#ffffff",
      font: "12px sans-serif",
      labelGap: 10,
      lineWidth: 2,
    });

    expect(mockContext.fillText).toHaveBeenCalledWith("health", 10, 17);
    expect(mockContext.measureText).toHaveBeenCalledWith("health");
    expect(mockContext.rect).toHaveBeenNthCalledWith(1, 68, 6, 100, 12);
    expect(mockContext.rect).toHaveBeenNthCalledWith(2, 68, 6, 75, 12);
    expect(mockContext.strokeStyle).toBe("#ffffff");
    expect(mockContext.lineWidth).toBe(2);
    expect(mockContext.fill).toHaveBeenCalledTimes(2);
    expect(mockContext.stroke).toHaveBeenCalledTimes(1);
  });

  it("drawMessage renders primary and secondary lines with independent fonts", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.fillText.mockClear();

    grid.drawMessage(
      "GAME OVER",
      "Press space to play again",
      { x: 120, y: 90 },
      {
        color: "#ffffff",
        subColor: "#cccccc",
        mainFont: "28px sans-serif",
        subFont: "16px sans-serif",
      },
    );

    expect(mockContext.textAlign).toBe("center");
    expect(mockContext.fillText).toHaveBeenNthCalledWith(1, "GAME OVER", 120, 90);
    expect(mockContext.fillText).toHaveBeenNthCalledWith(
      2,
      "Press space to play again",
      120,
      118,
    );
    expect(mockContext.fillStyle).toBe("#cccccc");
    expect(mockContext.font).toBe("16px sans-serif");
  });

  it("drawShip encapsulates translation, rotation and quadratic curves", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.save.mockClear();
    mockContext.restore.mockClear();
    mockContext.translate.mockClear();
    mockContext.rotate.mockClear();
    mockContext.beginPath.mockClear();
    mockContext.moveTo.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.quadraticCurveTo.mockClear();
    mockContext.arc.mockClear();
    mockContext.closePath.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawShip({ x: 80, y: 90 }, 30, {
      rotation: -Math.PI / 2,
      curve1: 0.4,
      curve2: 0.8,
      guide: true,
      fillColor: "#101010",
      strokeColor: "#ffffff",
      lineWidth: 4,
    });

    expect(mockContext.save).toHaveBeenCalledTimes(1);
    expect(mockContext.restore).toHaveBeenCalledTimes(1);
    expect(mockContext.translate).toHaveBeenCalledWith(80, 90);
    expect(mockContext.rotate).toHaveBeenCalledWith(-Math.PI / 2);
    expect(mockContext.moveTo).toHaveBeenNthCalledWith(1, 30, 0);
    expect(mockContext.quadraticCurveTo).toHaveBeenCalledTimes(3);
    expect(mockContext.closePath).toHaveBeenCalledTimes(1);
    expect(mockContext.arc).toHaveBeenCalledTimes(4);
    expect(mockContext.arc).toHaveBeenNthCalledWith(1, 0, 0, 30, 0, Math.PI * 2);

    const [firstControlX, firstControlY, firstEndX, firstEndY] =
      mockContext.quadraticCurveTo.mock.calls[0];
    const [rearControlX, rearControlY] = mockContext.quadraticCurveTo.mock.calls[1];

    expect(firstControlX).toBeCloseTo(Math.cos(Math.PI / 4) * 24);
    expect(firstControlY).toBeCloseTo(Math.sin(Math.PI / 4) * 24);
    expect(firstEndX).toBeCloseTo(Math.cos(Math.PI * 0.75) * 30);
    expect(firstEndY).toBeCloseTo(Math.sin(Math.PI * 0.75) * 30);
    expect(rearControlX).toBeCloseTo(-18);
    expect(rearControlY).toBeCloseTo(0);
  });

  it("drawShip can render a rear thruster flame before the hull", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.moveTo.mockClear();
    mockContext.quadraticCurveTo.mockClear();
    mockContext.fill.mockClear();
    mockContext.stroke.mockClear();

    grid.drawShip({ x: 80, y: 90 }, 30, {
      thruster: true,
      thrusterFillColor: "#ff3300",
      thrusterStrokeColor: "#ffee00",
    });

    expect(mockContext.moveTo).toHaveBeenNthCalledWith(
      1,
      Math.cos(Math.PI + Math.PI * 0.2) * 15,
      Math.sin(Math.PI + Math.PI * 0.2) * 15,
    );
    expect(mockContext.quadraticCurveTo).toHaveBeenNthCalledWith(
      1,
      -60,
      0,
      Math.cos(Math.PI - Math.PI * 0.2) * 15,
      Math.sin(Math.PI - Math.PI * 0.2) * 15,
    );
    expect(mockContext.fill).toHaveBeenCalledTimes(2);
    expect(mockContext.stroke).toHaveBeenCalledTimes(2);
  });

  it("drawPolyline can close the path in the encapsulated API", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.beginPath.mockClear();
    mockContext.moveTo.mockClear();
    mockContext.lineTo.mockClear();
    mockContext.closePath.mockClear();

    grid.drawPolyline(
      [
        { x: 10, y: 10 },
        { x: 40, y: 20 },
        { x: 20, y: 50 },
      ],
      {
        closePath: true,
      },
    );

    expect(mockContext.beginPath).toHaveBeenCalledTimes(1);
    expect(mockContext.moveTo).toHaveBeenCalledWith(10, 10);
    expect(mockContext.lineTo).toHaveBeenNthCalledWith(1, 40, 20);
    expect(mockContext.lineTo).toHaveBeenNthCalledWith(2, 20, 50);
    expect(mockContext.closePath).toHaveBeenCalledTimes(1);
  });

  it("drawPolyline safely ignores paths with fewer than two points", () => {
    const grid = new GridCanvasSystem("canvas");

    mockContext.beginPath.mockClear();
    mockContext.stroke.mockClear();

    grid.drawPolyline([{ x: 10, y: 10 }]);

    expect(mockContext.beginPath).not.toHaveBeenCalled();
    expect(mockContext.stroke).not.toHaveBeenCalled();
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

  it("clearCanvas can skip grid redraw for animation-oriented flows", () => {
    const grid = new GridCanvasSystem("canvas", {
      width: 120,
      height: 60,
      cellSize: 20,
      majorStep: 40,
    });

    mockContext.clearRect.mockClear();
    mockContext.stroke.mockClear();
    mockContext.fillText.mockClear();

    grid.clearCanvas({ redrawGrid: false });

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 120, 60);
    expect(mockContext.stroke).not.toHaveBeenCalled();
    expect(mockContext.fillText).not.toHaveBeenCalled();
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

  it("rejects invalid pacman mouthOpen values", () => {
    const grid = new GridCanvasSystem("canvas");

    expect(() => grid.drawPacman(20, 20, 10, 2)).toThrow(
      "mouthOpen must be a finite number between 0 and 1",
    );
  });

  it("rejects invalid asteroid segment counts and noise", () => {
    const grid = new GridCanvasSystem("canvas");

    expect(() => grid.createAsteroidShape(2)).toThrow(
      "segments must be greater than or equal to 3",
    );
    expect(() =>
      grid.drawAsteroid({ x: 50, y: 50 }, 20, [0, 0.1, -0.1], { noise: 2 }),
    ).toThrow("noise must be a finite number between 0 and 1");
  });
});
