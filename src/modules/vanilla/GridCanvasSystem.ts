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

export interface GridCanvasShipOptions extends GridCanvasShapeOptions {
  angle?: number;
  curve1?: number;
  curve2?: number;
  guide?: boolean;
  guideColor?: string;
  guideFillColor?: string;
  guideLineWidth?: number;
  rotation?: number;
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
  private static readonly DEFAULT_SHIP_FILL = "#111111";
  private static readonly DEFAULT_SHIP_STROKE = "#FFFFFF";
  private static readonly DEFAULT_SHIP_LINE_WIDTH = 2;
  private static readonly DEFAULT_SHIP_ANGLE = Math.PI * 0.5;
  private static readonly DEFAULT_SHIP_CURVE1 = 0.5;
  private static readonly DEFAULT_SHIP_CURVE2 = 0.75;
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

  private resolveUnitInterval(
    value: number,
    name: string,
  ): number {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`${name} must be a finite number between 0 and 1`);
    }

    return value;
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
    } = this.options;

    this.withManagedContext(() => {
      this.ctx.strokeStyle = gridColor;
      this.ctx.fillStyle = gridLabelColor;
      this.ctx.font = gridLabelFont;
      this.ctx.textAlign = "start";
      this.ctx.textBaseline = "alphabetic";

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
      this.ctx.textAlign = options?.textAlign ?? "start";
      this.ctx.textBaseline = options?.textBaseline ?? "alphabetic";

      this.ctx.fillText(text, resolvedX, resolvedY);
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

  clearCanvas(): void {
    this.withManagedContext(() => {
      this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    });
    this.drawGridSystem();
  }
}

export default GridCanvasSystem;
