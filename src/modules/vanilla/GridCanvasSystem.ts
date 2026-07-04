export interface GridCanvasSystemOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  gridColor?: string;
  labelColor?: string;
  gridLabelColor?: string;
  coordinateLabelColor?: string;
  font?: string;
  gridLabelFont?: string;
  coordinateFont?: string;
  gridLabelTextAlign?: CanvasTextAlign;
  coordinateTextAlign?: CanvasTextAlign;
  gridLabelTextBaseline?: CanvasTextBaseline;
  coordinateTextBaseline?: CanvasTextBaseline;
  cellSize?: number;
  majorStep?: number;
  minorLineWidth?: number;
  majorLineWidth?: number;
  devicePixelRatio?: number;
}

export interface GridCanvasPoint {
  x: number;
  y: number;
}

export interface GridCanvasStrokeOptions {
  color?: string;
  strokeColor?: string;
  lineWidth?: number;
}

export interface GridCanvasPolylineOptions extends GridCanvasStrokeOptions {
  closePath?: boolean;
}

export interface GridCanvasTextOptions {
  color?: string;
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
}

export type GridCanvasPixelSprite = readonly string[];

export type GridCanvasPixelPalette = Record<string, string | null | undefined>;

export interface GridCanvasPixelSpriteDrawOptions {
  x: number;
  y: number;
  pixelSize: number;
  palette: GridCanvasPixelPalette;
}

export interface GridCanvasClearOptions {
  redrawGrid?: boolean;
}

export interface GridCanvasShapeOptions extends GridCanvasStrokeOptions {
  fillColor?: string;
}

export interface GridCanvasCircleSectorOptions extends GridCanvasShapeOptions {
  connectToCenter?: boolean;
}

export interface GridCanvasPacmanOptions extends GridCanvasShapeOptions {
  direction?: number;
  maxMouthAngle?: number;
}

export type GridCanvasAsteroidShape = number[];

export interface GridCanvasAsteroidOptions extends GridCanvasShapeOptions {
  noise?: number;
  guide?: boolean;
  guideColor?: string;
  guideLineWidth?: number;
  rotation?: number;
}

export interface GridCanvasGhostOptions extends GridCanvasShapeOptions {
  feet?: number;
  eyeColor?: string;
  pupilColor?: string;
  eyes?: boolean;
  rotation?: number;
}

export interface GridCanvasProjectileOptions extends GridCanvasShapeOptions {
  guide?: boolean;
  guideColor?: string;
  guideLineWidth?: number;
}

export interface GridCanvasShipOptions extends GridCanvasShapeOptions {
  angle?: number;
  curve1?: number;
  curve2?: number;
  guide?: boolean;
  guideColor?: string;
  guideFillColor?: string;
  guideLineWidth?: number;
  rotation?: number;
  thruster?: boolean;
  thrusterFillColor?: string;
  thrusterStrokeColor?: string;
  thrusterLineWidth?: number;
}

export interface GridCanvasValueLabelOptions extends GridCanvasTextOptions {
  digits?: number;
  separator?: string;
}

export interface GridCanvasBarIndicatorOptions extends GridCanvasStrokeOptions {
  fillColor?: string;
  trackColor?: string;
  textColor?: string;
  font?: string;
  labelGap?: number;
}

export interface GridCanvasMessageOptions {
  color?: string;
  subColor?: string;
  mainFont?: string;
  subFont?: string;
  textAlign?: CanvasTextAlign;
  lineGap?: number;
}

export interface GridCanvasSystemResolvedOptions {
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
  gridLabelColor: string;
  coordinateLabelColor: string;
  gridLabelFont: string;
  coordinateFont: string;
  gridLabelTextAlign: CanvasTextAlign;
  coordinateTextAlign: CanvasTextAlign;
  gridLabelTextBaseline: CanvasTextBaseline;
  coordinateTextBaseline: CanvasTextBaseline;
  cellSize: number;
  majorStep: number;
  minorLineWidth: number;
  majorLineWidth: number;
  devicePixelRatio: number;
}

const DEFAULT_OPTIONS: GridCanvasSystemResolvedOptions = {
  width: 400,
  height: 400,
  backgroundColor: "#000000",
  gridColor: "#00FF00",
  gridLabelColor: "#009900",
  coordinateLabelColor: "#009900",
  gridLabelFont: "10px sans-serif",
  coordinateFont: "10px sans-serif",
  gridLabelTextAlign: "start",
  coordinateTextAlign: "start",
  gridLabelTextBaseline: "alphabetic",
  coordinateTextBaseline: "alphabetic",
  cellSize: 10,
  majorStep: 50,
  minorLineWidth: 0.25,
  majorLineWidth: 0.5,
  devicePixelRatio: 1,
};

class GridCanvasSystem {
  private static readonly DEFAULT_PACMAN_FILL = "#FFFF00";
  private static readonly DEFAULT_PACMAN_STROKE = "#000000";
  private static readonly DEFAULT_PACMAN_LINE_WIDTH = 2;
  private static readonly DEFAULT_PACMAN_MAX_MOUTH_ANGLE = Math.PI * 0.4;
  private static readonly DEFAULT_ASTEROID_FILL = "#111111";
  private static readonly DEFAULT_ASTEROID_STROKE = "#FFFFFF";
  private static readonly DEFAULT_ASTEROID_LINE_WIDTH = 2;
  private static readonly DEFAULT_ASTEROID_NOISE = 0.4;
  private static readonly DEFAULT_GHOST_FILL = "#FF0000";
  private static readonly DEFAULT_GHOST_STROKE = "#FFFFFF";
  private static readonly DEFAULT_GHOST_FEET = 4;
  private static readonly DEFAULT_PROJECTILE_STROKE = "#FFFFFF";
  private static readonly DEFAULT_PROJECTILE_LINE_WIDTH = 1;
  private static readonly DEFAULT_SHIP_FILL = "#111111";
  private static readonly DEFAULT_SHIP_STROKE = "#FFFFFF";
  private static readonly DEFAULT_SHIP_LINE_WIDTH = 2;
  private static readonly DEFAULT_SHIP_ANGLE = Math.PI * 0.5;
  private static readonly DEFAULT_SHIP_CURVE1 = 0.5;
  private static readonly DEFAULT_SHIP_CURVE2 = 0.75;
  private static readonly DEFAULT_THRUSTER_FILL = "#FF0000";
  private static readonly DEFAULT_THRUSTER_STROKE = "#FFFF00";
  private static readonly DEFAULT_BAR_TRACK = "rgba(255, 255, 255, 0.15)";
  private static readonly DEFAULT_MESSAGE_MAIN_FONT = "28px sans-serif";
  private static readonly DEFAULT_MESSAGE_SUB_FONT = "18px sans-serif";
  private static readonly DEFAULT_GUIDE_STROKE = "rgba(255, 255, 255, 0.7)";
  private static readonly DEFAULT_GUIDE_FILL = "rgba(255, 255, 255, 0.08)";
  private static readonly DEFAULT_GUIDE_LINE_WIDTH = 0.5;

  /**
   * Official public extension point for DOM integration and sizing workflows.
   * This reference is intended to remain part of the supported API.
   */
  public readonly canvas: HTMLCanvasElement;

  /**
   * Official public extension point for advanced drawing scenarios.
   * Consumers may draw directly on this context, but visual state mutations are
   * then part of the consumer-owned rendering contract.
   */
  public readonly ctx: CanvasRenderingContext2D;

  public readonly options: Readonly<GridCanvasSystemResolvedOptions>;

  constructor(id: string, width?: number, height?: number);
  constructor(id: string, options?: GridCanvasSystemOptions);
  constructor(
    id: string,
    widthOrOptions?: number | GridCanvasSystemOptions,
    height?: number,
  ) {
    const element = document.getElementById(id);
    if (element === null) {
      throw new Error(`Canvas element with id "${id}" not found`);
    }

    if (!(element instanceof HTMLCanvasElement)) {
      throw new Error(`Element with id "${id}" is not a canvas`);
    }

    const ctx = element.getContext("2d");
    if (ctx === null) {
      throw new Error(`2D context is not available for canvas "${id}"`);
    }

    this.canvas = element;
    this.ctx = ctx;
    this.options = Object.freeze(
      this.resolveOptions(widthOrOptions, height),
    );

    this.configureCanvas();
    this.drawGridSystem();
  }

  private resolveOptions(
    widthOrOptions?: number | GridCanvasSystemOptions,
    height?: number,
  ): GridCanvasSystemResolvedOptions {
    const inputOptions =
      typeof widthOrOptions === "number"
        ? { width: widthOrOptions, height }
        : (widthOrOptions ?? {});
    const sharedLabelColor =
      inputOptions.labelColor ?? DEFAULT_OPTIONS.gridLabelColor;
    const sharedFont =
      inputOptions.font ?? DEFAULT_OPTIONS.gridLabelFont;

    const resolvedOptions: GridCanvasSystemResolvedOptions = {
      width: this.resolveNonNegativeDimension(
        inputOptions.width,
        DEFAULT_OPTIONS.width,
        "width",
      ),
      height: this.resolveNonNegativeDimension(
        inputOptions.height,
        DEFAULT_OPTIONS.height,
        "height",
      ),
      backgroundColor:
        inputOptions.backgroundColor ?? DEFAULT_OPTIONS.backgroundColor,
      gridColor: inputOptions.gridColor ?? DEFAULT_OPTIONS.gridColor,
      gridLabelColor:
        inputOptions.gridLabelColor ?? sharedLabelColor,
      coordinateLabelColor:
        inputOptions.coordinateLabelColor ?? sharedLabelColor,
      gridLabelFont:
        inputOptions.gridLabelFont ?? sharedFont,
      coordinateFont:
        inputOptions.coordinateFont ?? sharedFont,
      gridLabelTextAlign:
        inputOptions.gridLabelTextAlign ?? DEFAULT_OPTIONS.gridLabelTextAlign,
      coordinateTextAlign:
        inputOptions.coordinateTextAlign ??
        DEFAULT_OPTIONS.coordinateTextAlign,
      gridLabelTextBaseline:
        inputOptions.gridLabelTextBaseline ??
        DEFAULT_OPTIONS.gridLabelTextBaseline,
      coordinateTextBaseline:
        inputOptions.coordinateTextBaseline ??
        DEFAULT_OPTIONS.coordinateTextBaseline,
      cellSize: this.resolvePositiveNumber(
        inputOptions.cellSize,
        DEFAULT_OPTIONS.cellSize,
        "cellSize",
      ),
      majorStep: this.resolvePositiveNumber(
        inputOptions.majorStep,
        DEFAULT_OPTIONS.majorStep,
        "majorStep",
      ),
      minorLineWidth: this.resolvePositiveNumber(
        inputOptions.minorLineWidth,
        DEFAULT_OPTIONS.minorLineWidth,
        "minorLineWidth",
      ),
      majorLineWidth: this.resolvePositiveNumber(
        inputOptions.majorLineWidth,
        DEFAULT_OPTIONS.majorLineWidth,
        "majorLineWidth",
      ),
      devicePixelRatio: this.resolvePositiveNumber(
        inputOptions.devicePixelRatio ?? this.getDevicePixelRatio(),
        DEFAULT_OPTIONS.devicePixelRatio,
        "devicePixelRatio",
      ),
    };

    if (resolvedOptions.majorStep < resolvedOptions.cellSize) {
      throw new Error("majorStep must be greater than or equal to cellSize");
    }

    if (resolvedOptions.majorStep % resolvedOptions.cellSize !== 0) {
      throw new Error("majorStep must be a multiple of cellSize");
    }

    return resolvedOptions;
  }

  private getDevicePixelRatio(): number {
    if (typeof window === "undefined" || window.devicePixelRatio === undefined) {
      return DEFAULT_OPTIONS.devicePixelRatio;
    }

    return window.devicePixelRatio;
  }

  private configureCanvas(): void {
    const { width, height, devicePixelRatio, backgroundColor } = this.options;
    const scaledWidth = Math.round(width * devicePixelRatio);
    const scaledHeight = Math.round(height * devicePixelRatio);

    this.canvas.width = scaledWidth;
    this.canvas.height = scaledHeight;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.canvas.style.backgroundColor = backgroundColor;
    this.applyBaselineTransform();
  }

  private applyBaselineTransform(): void {
    this.ctx.setTransform(
      this.options.devicePixelRatio,
      0,
      0,
      this.options.devicePixelRatio,
      0,
      0,
    );
  }

  private withManagedContext(render: () => void): void {
    this.ctx.save();
    this.applyBaselineTransform();

    try {
      render();
    } finally {
      this.ctx.restore();
    }
  }

  private resolveNonNegativeDimension(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isFinite(resolvedValue) || resolvedValue < 0) {
      throw new Error(`${name} must be a non-negative finite number`);
    }

    return resolvedValue;
  }

  private resolvePositiveNumber(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isFinite(resolvedValue) || resolvedValue <= 0) {
      throw new Error(`${name} must be a positive finite number`);
    }

    return resolvedValue;
  }

  private resolveNonNegativeNumber(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isFinite(resolvedValue) || resolvedValue < 0) {
      throw new Error(`${name} must be a non-negative finite number`);
    }

    return resolvedValue;
  }

  private resolveInteger(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isInteger(resolvedValue) || resolvedValue <= 0) {
      throw new Error(`${name} must be a positive integer`);
    }

    return resolvedValue;
  }

  private resolveNonNegativeInteger(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isInteger(resolvedValue) || resolvedValue < 0) {
      throw new Error(`${name} must be a non-negative integer`);
    }

    return resolvedValue;
  }

  private resolveFiniteNumber(
    value: number | undefined,
    fallback: number,
    name: string,
  ): number {
    const resolvedValue = value ?? fallback;

    if (!Number.isFinite(resolvedValue)) {
      throw new Error(`${name} must be a finite number`);
    }

    return resolvedValue;
  }

  private resolvePoint(
    point: GridCanvasPoint,
    name: string,
  ): GridCanvasPoint {
    if (point === null || typeof point !== "object") {
      throw new Error(`${name} must be an object with finite x and y values`);
    }

    return {
      x: this.resolveFiniteNumber(point.x, 0, `${name}.x`),
      y: this.resolveFiniteNumber(point.y, 0, `${name}.y`),
    };
  }

  private resolveShape(
    shape: GridCanvasAsteroidShape,
    name: string,
  ): GridCanvasAsteroidShape {
    if (!Array.isArray(shape)) {
      throw new Error(`${name} must be an array of finite numbers`);
    }

    if (shape.length < 3) {
      throw new Error(`${name} must contain at least three points`);
    }

    return shape.map((value, index) =>
      this.resolveFiniteNumber(value, 0, `${name}[${index}]`),
    );
  }

  private resolveUnitInterval(
    value: number,
    name: string,
  ): number {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be a finite number between 0 and 1`);
    }

    return value;
  }

  private resolvePixelSprite(
    sprite: GridCanvasPixelSprite,
  ): GridCanvasPixelSprite {
    if (!Array.isArray(sprite) || sprite.length === 0) {
      throw new Error("sprite must contain at least one row");
    }

    const width = sprite[0]?.length ?? 0;

    if (width === 0) {
      throw new Error("sprite rows must not be empty");
    }

    sprite.forEach((row, index) => {
      if (typeof row !== "string") {
        throw new Error(`sprite[${index}] must be a string`);
      }

      if (row.length !== width) {
        throw new Error("sprite rows must have the same length");
      }
    });

    return sprite;
  }

  private resolvePixelPalette(
    palette: GridCanvasPixelPalette | undefined,
  ): GridCanvasPixelPalette {
    if (
      palette === undefined ||
      palette === null ||
      typeof palette !== "object"
    ) {
      throw new Error("options.palette must be an object");
    }

    return palette;
  }

  private resolveFontSize(
    font: string,
    fallback: number,
  ): number {
    const match = font.match(/(\d+(?:\.\d+)?)px/i);

    if (match === null) {
      return fallback;
    }

    const size = Number.parseFloat(match[1]);

    return Number.isFinite(size) ? size : fallback;
  }

  private drawGridSystem(): void {
    const {
      width,
      height,
      cellSize,
      majorStep,
      gridColor,
      gridLabelColor,
      minorLineWidth,
      majorLineWidth,
      gridLabelFont,
      gridLabelTextAlign,
      gridLabelTextBaseline,
    } = this.options;

    this.withManagedContext(() => {
      this.ctx.strokeStyle = gridColor;
      this.ctx.fillStyle = gridLabelColor;
      this.ctx.font = gridLabelFont;
      this.ctx.textAlign = gridLabelTextAlign;
      this.ctx.textBaseline = gridLabelTextBaseline;

      for (let x = 0; x < width; x += cellSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, height);
        this.ctx.lineWidth = x % majorStep === 0 ? majorLineWidth : minorLineWidth;
        this.ctx.stroke();
        if (x % majorStep === 0) this.ctx.fillText(x.toString(), x, 10);
      }

      for (let y = 0; y < height; y += cellSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(width, y);
        this.ctx.lineWidth = y % majorStep === 0 ? majorLineWidth : minorLineWidth;
        this.ctx.stroke();
        if (y % majorStep === 0) this.ctx.fillText(y.toString(), 0, y + 10);
      }
    });
  }

  drawText(
    text: string,
    x: number,
    y: number,
    options?: GridCanvasTextOptions,
  ): void {
    const resolvedX = this.resolveFiniteNumber(x, 0, "x");
    const resolvedY = this.resolveFiniteNumber(y, 0, "y");

    this.withManagedContext(() => {
      this.ctx.fillStyle = options?.color ?? this.options.coordinateLabelColor;
      this.ctx.font = options?.font ?? this.options.coordinateFont;
      this.ctx.textAlign =
        options?.textAlign ?? this.options.coordinateTextAlign;
      this.ctx.textBaseline =
        options?.textBaseline ?? this.options.coordinateTextBaseline;

      this.ctx.fillText(text, resolvedX, resolvedY);
    });
  }

  drawPixelSprite(
    sprite: GridCanvasPixelSprite,
    options: GridCanvasPixelSpriteDrawOptions,
  ): void {
    const resolvedSprite = this.resolvePixelSprite(sprite);
    const resolvedX = this.resolveFiniteNumber(options?.x, 0, "options.x");
    const resolvedY = this.resolveFiniteNumber(options?.y, 0, "options.y");
    const resolvedPixelSize = this.resolvePositiveNumber(
      options?.pixelSize,
      1,
      "options.pixelSize",
    );
    const palette = this.resolvePixelPalette(options?.palette);

    this.withManagedContext(() => {
      for (let rowIndex = 0; rowIndex < resolvedSprite.length; rowIndex += 1) {
        const row = resolvedSprite[rowIndex];

        for (let columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
          const pixelKey = row[columnIndex];

          if (!Object.prototype.hasOwnProperty.call(palette, pixelKey)) {
            throw new Error(`palette is missing color for "${pixelKey}"`);
          }

          const color = palette[pixelKey];

          if (color === null || color === undefined) {
            continue;
          }

          if (typeof color !== "string") {
            throw new Error(`palette color for "${pixelKey}" must be a string`);
          }

          if (color.toLowerCase() === "transparent") {
            continue;
          }

          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            resolvedX + columnIndex * resolvedPixelSize,
            resolvedY + rowIndex * resolvedPixelSize,
            resolvedPixelSize,
            resolvedPixelSize,
          );
        }
      }
    });
  }

  polarToCartesian(
    center: GridCanvasPoint,
    radius: number,
    angle: number,
  ): GridCanvasPoint {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolveFiniteNumber(radius, 0, "radius");
    const resolvedAngle = this.resolveFiniteNumber(angle, 0, "angle");

    return {
      x: resolvedCenter.x + Math.cos(resolvedAngle) * resolvedRadius,
      y: resolvedCenter.y + Math.sin(resolvedAngle) * resolvedRadius,
    };
  }

  createAsteroidShape(
    segments: number,
    random: () => number = Math.random,
  ): GridCanvasAsteroidShape {
    const resolvedSegments = this.resolveInteger(segments, 3, "segments");

    if (resolvedSegments < 3) {
      throw new Error("segments must be greater than or equal to 3");
    }

    const shape: GridCanvasAsteroidShape = [];

    for (let index = 0; index < resolvedSegments; index += 1) {
      const randomValue = random();

      if (
        !Number.isFinite(randomValue) ||
        randomValue < 0 ||
        randomValue > 1
      ) {
        throw new Error(
          "random must return a finite number between 0 and 1",
        );
      }

      shape.push(randomValue - 0.5);
    }

    return shape;
  }

  drawCircleSector(
    center: GridCanvasPoint,
    radius: number,
    startAngle: number,
    endAngle: number,
    options?: GridCanvasCircleSectorOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolvePositiveNumber(radius, 1, "radius");
    const resolvedStartAngle = this.resolveFiniteNumber(
      startAngle,
      0,
      "startAngle",
    );
    const resolvedEndAngle = this.resolveFiniteNumber(
      endAngle,
      0,
      "endAngle",
    );
    const fillColor = options?.fillColor ?? this.options.coordinateLabelColor;
    const strokeColor = options?.strokeColor ?? options?.color;
    const shouldConnectToCenter = options?.connectToCenter ?? true;

    this.withManagedContext(() => {
      this.ctx.beginPath();

      if (shouldConnectToCenter) {
        this.ctx.moveTo(resolvedCenter.x, resolvedCenter.y);
      }

      this.ctx.arc(
        resolvedCenter.x,
        resolvedCenter.y,
        resolvedRadius,
        resolvedStartAngle,
        resolvedEndAngle,
      );

      if (shouldConnectToCenter) {
        this.ctx.lineTo(resolvedCenter.x, resolvedCenter.y);
      }

      this.ctx.fillStyle = fillColor;
      this.ctx.fill();

      if (strokeColor !== undefined) {
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = this.resolvePositiveNumber(
          options?.lineWidth,
          1,
          "lineWidth",
        );
        this.ctx.stroke();
      }
    });
  }

  drawPacman(
    x: number,
    y: number,
    radius: number,
    mouthOpen: number,
    options?: GridCanvasPacmanOptions,
  ): void {
    const resolvedMouthOpen = this.resolveUnitInterval(mouthOpen, "mouthOpen");
    const resolvedDirection = this.resolveFiniteNumber(
      options?.direction,
      0,
      "direction",
    );
    const resolvedMaxMouthAngle = this.resolvePositiveNumber(
      options?.maxMouthAngle,
      GridCanvasSystem.DEFAULT_PACMAN_MAX_MOUTH_ANGLE,
      "maxMouthAngle",
    );
    const halfMouthAngle = (resolvedMaxMouthAngle * resolvedMouthOpen) / 2;

    this.drawCircleSector(
      { x, y },
      radius,
      resolvedDirection + halfMouthAngle,
      resolvedDirection + Math.PI * 2 - halfMouthAngle,
      {
        fillColor:
          options?.fillColor ?? GridCanvasSystem.DEFAULT_PACMAN_FILL,
        strokeColor:
          options?.strokeColor ?? options?.color ?? GridCanvasSystem.DEFAULT_PACMAN_STROKE,
        lineWidth:
          options?.lineWidth ?? GridCanvasSystem.DEFAULT_PACMAN_LINE_WIDTH,
        connectToCenter: true,
      },
    );
  }

  drawProjectile(
    center: GridCanvasPoint,
    radius: number,
    life: number,
    options?: GridCanvasProjectileOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolvePositiveNumber(radius, 1, "radius");
    const resolvedLife = this.resolveUnitInterval(life, "life");
    const guideColor =
      options?.guideColor ?? GridCanvasSystem.DEFAULT_GUIDE_STROKE;
    const guideLineWidth = this.resolvePositiveNumber(
      options?.guideLineWidth,
      GridCanvasSystem.DEFAULT_GUIDE_LINE_WIDTH,
      "guideLineWidth",
    );

    this.withManagedContext(() => {
      if (options?.guide === true) {
        this.ctx.strokeStyle = guideColor;
        this.ctx.lineWidth = guideLineWidth;
        this.ctx.beginPath();
        this.ctx.arc(
          resolvedCenter.x,
          resolvedCenter.y,
          resolvedRadius,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
      }

      this.ctx.fillStyle =
        options?.fillColor ??
        `rgb(255, 255, ${Math.round(resolvedLife * 255)})`;
      this.ctx.strokeStyle =
        options?.strokeColor ??
        options?.color ??
        GridCanvasSystem.DEFAULT_PROJECTILE_STROKE;
      this.ctx.lineWidth = this.resolvePositiveNumber(
        options?.lineWidth,
        GridCanvasSystem.DEFAULT_PROJECTILE_LINE_WIDTH,
        "lineWidth",
      );
      this.ctx.beginPath();
      this.ctx.arc(
        resolvedCenter.x,
        resolvedCenter.y,
        resolvedRadius,
        0,
        Math.PI * 2,
      );
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });
  }

  drawGhost(
    center: GridCanvasPoint,
    radius: number,
    options?: GridCanvasGhostOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolvePositiveNumber(radius, 1, "radius");
    const resolvedFeet = this.resolveInteger(
      options?.feet,
      GridCanvasSystem.DEFAULT_GHOST_FEET,
      "feet",
    );
    const resolvedRotation = this.resolveFiniteNumber(
      options?.rotation,
      0,
      "rotation",
    );
    const headRadius = resolvedRadius * 0.8;
    const footRadius = headRadius / resolvedFeet;
    const eyeColor = options?.eyeColor ?? "#FFFFFF";
    const pupilColor = options?.pupilColor ?? "#000000";
    const shouldDrawEyes = options?.eyes ?? true;

    this.withManagedContext(() => {
      this.ctx.translate(resolvedCenter.x, resolvedCenter.y);
      this.ctx.rotate(resolvedRotation);
      this.ctx.strokeStyle =
        options?.strokeColor ??
        options?.color ??
        GridCanvasSystem.DEFAULT_GHOST_STROKE;
      this.ctx.fillStyle =
        options?.fillColor ?? GridCanvasSystem.DEFAULT_GHOST_FILL;
      this.ctx.lineWidth = this.resolvePositiveNumber(
        options?.lineWidth,
        resolvedRadius * 0.05,
        "lineWidth",
      );
      this.ctx.beginPath();

      for (let foot = 0; foot < resolvedFeet; foot += 1) {
        this.ctx.arc(
          (2 * footRadius * (resolvedFeet - foot)) - headRadius - footRadius,
          resolvedRadius - footRadius,
          footRadius,
          0,
          Math.PI,
        );
      }

      this.ctx.lineTo(-headRadius, resolvedRadius - footRadius);
      this.ctx.arc(
        0,
        headRadius - resolvedRadius,
        headRadius,
        Math.PI,
        Math.PI * 2,
      );
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      if (shouldDrawEyes) {
        const eyeRadius = resolvedRadius * 0.18;
        const pupilRadius = eyeRadius * 0.45;
        const eyeY = -resolvedRadius * 0.15;
        const leftEyeX = -resolvedRadius * 0.28;
        const rightEyeX = resolvedRadius * 0.05;
        const pupilOffsetX = pupilRadius * 0.2;
        const pupilOffsetY = pupilRadius * 0.3;

        this.ctx.fillStyle = eyeColor;
        this.ctx.beginPath();
        this.ctx.arc(leftEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        this.ctx.arc(rightEyeX, eyeY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = pupilColor;
        this.ctx.beginPath();
        this.ctx.arc(
          leftEyeX + pupilOffsetX,
          eyeY + pupilOffsetY,
          pupilRadius,
          0,
          Math.PI * 2,
        );
        this.ctx.arc(
          rightEyeX + pupilOffsetX,
          eyeY + pupilOffsetY,
          pupilRadius,
          0,
          Math.PI * 2,
        );
        this.ctx.fill();
      }
    });
  }

  drawValueLabel(
    label: string,
    value: number,
    x: number,
    y: number,
    options?: GridCanvasValueLabelOptions,
  ): void {
    const digits = this.resolveNonNegativeInteger(
      options?.digits,
      0,
      "digits",
    );
    const resolvedValue = this.resolveFiniteNumber(value, 0, "value");
    const separator = options?.separator ?? ": ";

    this.drawText(
      `${label}${separator}${resolvedValue.toFixed(digits)}`,
      x,
      y,
      options,
    );
  }

  drawBarIndicator(
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    value: number,
    max: number,
    options?: GridCanvasBarIndicatorOptions,
  ): void {
    const resolvedX = this.resolveFiniteNumber(x, 0, "x");
    const resolvedY = this.resolveFiniteNumber(y, 0, "y");
    const resolvedWidth = this.resolvePositiveNumber(width, 1, "width");
    const resolvedHeight = this.resolvePositiveNumber(height, 1, "height");
    const resolvedValue = this.resolveFiniteNumber(value, 0, "value");
    const resolvedMax = this.resolvePositiveNumber(max, 1, "max");
    const labelGap = this.resolveNonNegativeNumber(
      options?.labelGap,
      6,
      "labelGap",
    );
    const lineWidth = this.resolvePositiveNumber(
      options?.lineWidth,
      1,
      "lineWidth",
    );
    const ratio = Math.min(
      1,
      Math.max(0, resolvedValue / resolvedMax),
    );
    const font =
      options?.font ?? `${Math.max(Math.round(resolvedHeight), 10)}px sans-serif`;
    const strokeColor =
      options?.strokeColor ?? options?.color ?? this.options.coordinateLabelColor;
    const fillColor =
      options?.fillColor ?? this.options.coordinateLabelColor;
    const textColor = options?.textColor ?? strokeColor;
    const trackColor =
      options?.trackColor ?? GridCanvasSystem.DEFAULT_BAR_TRACK;

    this.withManagedContext(() => {
      this.ctx.font = font;
      this.ctx.textAlign = "start";
      this.ctx.textBaseline = "alphabetic";
      this.ctx.fillStyle = textColor;
      this.ctx.fillText(label, resolvedX, resolvedY + resolvedHeight - 1);

      const labelWidth = this.ctx.measureText(label).width;
      const barX = resolvedX + labelWidth + labelGap;

      this.ctx.fillStyle = trackColor;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = lineWidth;
      this.ctx.beginPath();
      this.ctx.rect(barX, resolvedY, resolvedWidth, resolvedHeight);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = fillColor;
      this.ctx.beginPath();
      this.ctx.rect(barX, resolvedY, resolvedWidth * ratio, resolvedHeight);
      this.ctx.fill();
    });
  }

  drawMessage(
    mainText: string,
    subText: string,
    center: GridCanvasPoint,
    options?: GridCanvasMessageOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const mainFont =
      options?.mainFont ?? GridCanvasSystem.DEFAULT_MESSAGE_MAIN_FONT;
    const subFont =
      options?.subFont ?? GridCanvasSystem.DEFAULT_MESSAGE_SUB_FONT;
    const lineGap = this.resolveNonNegativeNumber(
      options?.lineGap,
      this.resolveFontSize(mainFont, 28),
      "lineGap",
    );
    const mainColor = options?.color ?? this.options.coordinateLabelColor;
    const subColor = options?.subColor ?? mainColor;

    this.withManagedContext(() => {
      this.ctx.textAlign = options?.textAlign ?? "center";
      this.ctx.textBaseline = "alphabetic";
      this.ctx.fillStyle = mainColor;
      this.ctx.font = mainFont;
      this.ctx.fillText(mainText, resolvedCenter.x, resolvedCenter.y);
      this.ctx.fillStyle = subColor;
      this.ctx.font = subFont;
      this.ctx.fillText(
        subText,
        resolvedCenter.x,
        resolvedCenter.y + lineGap,
      );
    });
  }

  drawAsteroid(
    center: GridCanvasPoint,
    radius: number,
    shape: GridCanvasAsteroidShape,
    options?: GridCanvasAsteroidOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolvePositiveNumber(radius, 1, "radius");
    const resolvedShape = this.resolveShape(shape, "shape");
    const resolvedRotation = this.resolveFiniteNumber(
      options?.rotation,
      0,
      "rotation",
    );
    const resolvedNoise =
      options?.noise === undefined
        ? GridCanvasSystem.DEFAULT_ASTEROID_NOISE
        : this.resolveUnitInterval(options.noise, "noise");
    const guideColor =
      options?.guideColor ?? GridCanvasSystem.DEFAULT_GUIDE_STROKE;
    const guideLineWidth = this.resolvePositiveNumber(
      options?.guideLineWidth,
      GridCanvasSystem.DEFAULT_GUIDE_LINE_WIDTH,
      "guideLineWidth",
    );
    const radii = resolvedShape.map((shapeValue) =>
      resolvedRadius + resolvedRadius * resolvedNoise * shapeValue,
    );
    const minGuideRadius = Math.min(...radii);
    const maxGuideRadius = Math.max(...radii);

    this.withManagedContext(() => {
      this.ctx.translate(resolvedCenter.x, resolvedCenter.y);
      this.ctx.rotate(resolvedRotation);
      this.ctx.fillStyle =
        options?.fillColor ?? GridCanvasSystem.DEFAULT_ASTEROID_FILL;
      this.ctx.strokeStyle =
        options?.strokeColor ??
        options?.color ??
        GridCanvasSystem.DEFAULT_ASTEROID_STROKE;
      this.ctx.lineWidth = this.resolvePositiveNumber(
        options?.lineWidth,
        GridCanvasSystem.DEFAULT_ASTEROID_LINE_WIDTH,
        "lineWidth",
      );

      const firstPoint = this.polarToCartesian(
        { x: 0, y: 0 },
        radii[0],
        0,
      );

      this.ctx.beginPath();
      this.ctx.moveTo(firstPoint.x, firstPoint.y);

      for (let index = 1; index < resolvedShape.length; index += 1) {
        const angle = (Math.PI * 2 * index) / resolvedShape.length;
        const point = this.polarToCartesian(
          { x: 0, y: 0 },
          radii[index],
          angle,
        );

        this.ctx.lineTo(point.x, point.y);
      }

      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      if (options?.guide === true) {
        this.ctx.strokeStyle = guideColor;
        this.ctx.lineWidth = guideLineWidth;

        for (const guideRadius of [
          minGuideRadius,
          resolvedRadius,
          maxGuideRadius,
        ]) {
          this.ctx.beginPath();
          this.ctx.arc(0, 0, guideRadius, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      }
    });
  }

  drawShip(
    center: GridCanvasPoint,
    radius: number,
    options?: GridCanvasShipOptions,
  ): void {
    const resolvedCenter = this.resolvePoint(center, "center");
    const resolvedRadius = this.resolvePositiveNumber(radius, 1, "radius");
    const resolvedRotation = this.resolveFiniteNumber(
      options?.rotation,
      0,
      "rotation",
    );
    const resolvedAngle = this.resolvePositiveNumber(
      options?.angle,
      GridCanvasSystem.DEFAULT_SHIP_ANGLE,
      "angle",
    );
    const halfAngle = resolvedAngle / 2;
    const curve1 = this.resolveFiniteNumber(
      options?.curve1,
      GridCanvasSystem.DEFAULT_SHIP_CURVE1,
      "curve1",
    );
    const curve2 = this.resolveFiniteNumber(
      options?.curve2,
      GridCanvasSystem.DEFAULT_SHIP_CURVE2,
      "curve2",
    );
    const guideColor =
      options?.guideColor ?? GridCanvasSystem.DEFAULT_GUIDE_STROKE;
    const guideFillColor =
      options?.guideFillColor ?? GridCanvasSystem.DEFAULT_GUIDE_FILL;
    const guideLineWidth = this.resolvePositiveNumber(
      options?.guideLineWidth,
      GridCanvasSystem.DEFAULT_GUIDE_LINE_WIDTH,
      "guideLineWidth",
    );
    const lowerRear = this.polarToCartesian(
      { x: 0, y: 0 },
      resolvedRadius,
      Math.PI - halfAngle,
    );
    const upperRear = this.polarToCartesian(
      { x: 0, y: 0 },
      resolvedRadius,
      Math.PI + halfAngle,
    );
    const lowerSideControl = this.polarToCartesian(
      { x: 0, y: 0 },
      resolvedRadius * curve2,
      halfAngle,
    );
    const upperSideControl = this.polarToCartesian(
      { x: 0, y: 0 },
      resolvedRadius * curve2,
      Math.PI * 2 - halfAngle,
    );
    const rearControl = {
      x: resolvedRadius * curve1 - resolvedRadius,
      y: 0,
    };

    this.withManagedContext(() => {
      this.ctx.translate(resolvedCenter.x, resolvedCenter.y);
      this.ctx.rotate(resolvedRotation);

      if (options?.guide === true) {
        this.ctx.strokeStyle = guideColor;
        this.ctx.fillStyle = guideFillColor;
        this.ctx.lineWidth = guideLineWidth;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, resolvedRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      }

      if (options?.thruster === true) {
        this.ctx.fillStyle =
          options?.thrusterFillColor ?? GridCanvasSystem.DEFAULT_THRUSTER_FILL;
        this.ctx.strokeStyle =
          options?.thrusterStrokeColor ??
          GridCanvasSystem.DEFAULT_THRUSTER_STROKE;
        this.ctx.lineWidth = this.resolvePositiveNumber(
          options?.thrusterLineWidth,
          Math.max(1, resolvedRadius * 0.06),
          "thrusterLineWidth",
        );
        this.ctx.beginPath();
        this.ctx.moveTo(
          Math.cos(Math.PI + halfAngle * 0.8) * (resolvedRadius / 2),
          Math.sin(Math.PI + halfAngle * 0.8) * (resolvedRadius / 2),
        );
        this.ctx.quadraticCurveTo(
          -resolvedRadius * 2,
          0,
          Math.cos(Math.PI - halfAngle * 0.8) * (resolvedRadius / 2),
          Math.sin(Math.PI - halfAngle * 0.8) * (resolvedRadius / 2),
        );
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      }

      this.ctx.fillStyle =
        options?.fillColor ?? GridCanvasSystem.DEFAULT_SHIP_FILL;
      this.ctx.strokeStyle =
        options?.strokeColor ??
        options?.color ??
        GridCanvasSystem.DEFAULT_SHIP_STROKE;
      this.ctx.lineWidth = this.resolvePositiveNumber(
        options?.lineWidth,
        GridCanvasSystem.DEFAULT_SHIP_LINE_WIDTH,
        "lineWidth",
      );
      this.ctx.beginPath();
      this.ctx.moveTo(resolvedRadius, 0);
      this.ctx.quadraticCurveTo(
        lowerSideControl.x,
        lowerSideControl.y,
        lowerRear.x,
        lowerRear.y,
      );
      this.ctx.quadraticCurveTo(
        rearControl.x,
        rearControl.y,
        upperRear.x,
        upperRear.y,
      );
      this.ctx.quadraticCurveTo(
        upperSideControl.x,
        upperSideControl.y,
        resolvedRadius,
        0,
      );
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      if (options?.guide === true) {
        this.ctx.strokeStyle = guideColor;
        this.ctx.fillStyle = guideColor;
        this.ctx.lineWidth = guideLineWidth;

        this.ctx.beginPath();
        this.ctx.moveTo(-resolvedRadius, 0);
        this.ctx.lineTo(0, 0);
        this.ctx.stroke();

        const controlPoints = [rearControl, lowerSideControl, upperSideControl];

        for (const controlPoint of controlPoints) {
          this.ctx.beginPath();
          this.ctx.arc(
            controlPoint.x,
            controlPoint.y,
            resolvedRadius / 40,
            0,
            Math.PI * 2,
          );
          this.ctx.fill();
        }
      }
    });
  }

  drawLine(
    start: GridCanvasPoint,
    end: GridCanvasPoint,
    options?: GridCanvasStrokeOptions,
  ): void {
    this.drawPolyline([start, end], options);
  }

  drawPolyline(
    points: GridCanvasPoint[],
    options?: GridCanvasPolylineOptions,
  ): void {
    if (points.length < 2) {
      return;
    }

    const resolvedPoints = points.map((point, index) =>
      this.resolvePoint(point, `points[${index}]`),
    );

    this.withManagedContext(() => {
      this.ctx.beginPath();
      this.ctx.moveTo(resolvedPoints[0].x, resolvedPoints[0].y);

      for (let index = 1; index < resolvedPoints.length; index += 1) {
        this.ctx.lineTo(resolvedPoints[index].x, resolvedPoints[index].y);
      }

      if (options?.closePath === true) {
        this.ctx.closePath();
      }

      this.ctx.strokeStyle =
        options?.strokeColor ??
        options?.color ??
        this.options.coordinateLabelColor;
      this.ctx.lineWidth = this.resolvePositiveNumber(
        options?.lineWidth,
        1,
        "lineWidth",
      );
      this.ctx.stroke();
    });
  }

  drawCoordinate(
    x: number,
    y: number,
    options?: GridCanvasTextOptions,
  ): void {
    this.drawText(`(${x},${y})`, x, y, {
      color: options?.color ?? this.options.coordinateLabelColor,
      font: options?.font ?? this.options.coordinateFont,
      textAlign: options?.textAlign,
      textBaseline: options?.textBaseline,
    });
  }

  clearCanvas(options?: GridCanvasClearOptions): void {
    this.withManagedContext(() => {
      this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    });

    if (options?.redrawGrid !== false) {
      this.drawGridSystem();
    }
  }
}

export default GridCanvasSystem;
