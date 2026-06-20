export interface GridCanvasSystemOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
  gridColor?: string;
  labelColor?: string;
  gridLabelColor?: string;
  coordinateLabelColor?: string;
  cellSize?: number;
  majorStep?: number;
  minorLineWidth?: number;
  majorLineWidth?: number;
  devicePixelRatio?: number;
  font?: string;
}

export interface GridCanvasSystemResolvedOptions {
  width: number;
  height: number;
  backgroundColor: string;
  gridColor: string;
  gridLabelColor: string;
  coordinateLabelColor: string;
  cellSize: number;
  majorStep: number;
  minorLineWidth: number;
  majorLineWidth: number;
  devicePixelRatio: number;
  font: string;
}

const DEFAULT_OPTIONS: GridCanvasSystemResolvedOptions = {
  width: 400,
  height: 400,
  backgroundColor: "#000000",
  gridColor: "#00FF00",
  gridLabelColor: "#009900",
  coordinateLabelColor: "#009900",
  cellSize: 10,
  majorStep: 50,
  minorLineWidth: 0.25,
  majorLineWidth: 0.5,
  devicePixelRatio: 1,
  font: "10px sans-serif",
};

class GridCanvasSystem {
  public readonly canvas: HTMLCanvasElement;
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
      font: inputOptions.font ?? DEFAULT_OPTIONS.font,
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
      font,
    } = this.options;

    this.ctx.save();
    this.applyBaselineTransform();
    this.ctx.strokeStyle = gridColor;
    this.ctx.fillStyle = gridLabelColor;
    this.ctx.font = font;

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

    this.ctx.restore();
  }

  drawCoordinate(x: number, y: number): void {
    this.ctx.save();
    this.applyBaselineTransform();
    this.ctx.fillStyle = this.options.coordinateLabelColor;
    this.ctx.font = this.options.font;
    this.ctx.fillText(`(${x},${y})`, x, y);
    this.ctx.restore();
  }

  clearCanvas(): void {
    this.ctx.save();
    this.applyBaselineTransform();
    this.ctx.clearRect(0, 0, this.options.width, this.options.height);
    this.ctx.restore();
    this.drawGridSystem();
  }
}

export default GridCanvasSystem;
