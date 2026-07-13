import { createAnimationLoop } from "./createAnimationLoop";
import { CanvasContextUnavailableError, RuntimeDestroyedError } from "./errors";
import type { ReducedMotionBehavior } from "./motionPreference";

export type PixelRatioOption = number | "auto";
export type Unsubscribe = () => void;

export interface CanvasResizeOptions {
  width: number;
  height: number;
  pixelRatio?: PixelRatioOption;
}

export interface CanvasRuntimeSize {
  logicalWidth: number;
  logicalHeight: number;
  cssWidth: number;
  cssHeight: number;
  bufferWidth: number;
  bufferHeight: number;
  pixelRatio: number;
}

export interface CanvasPointerEvent {
  x: number;
  y: number;
  originalEvent: PointerEvent;
}

export interface CanvasRuntimeOptions {
  canvas: HTMLCanvasElement;
  logicalWidth: number;
  logicalHeight: number;
  pixelRatio?: PixelRatioOption;
  maxPixelRatio?: number;
  imageSmoothing?: boolean;
  maxDeltaMs?: number;
  pauseWhenHidden?: boolean;
  reducedMotion?: ReducedMotionBehavior;
  update?: (deltaMs: number) => void;
  render: (context: CanvasRenderingContext2D) => void;
}

export interface CanvasRuntime {
  destroy(): void;
  getCanvas(): HTMLCanvasElement;
  getContext(): CanvasRenderingContext2D;
  getSize(): CanvasRuntimeSize;
  isDestroyed(): boolean;
  onPointerCancel(listener: (event: CanvasPointerEvent) => void): Unsubscribe;
  onPointerDown(listener: (event: CanvasPointerEvent) => void): Unsubscribe;
  onPointerMove(listener: (event: CanvasPointerEvent) => void): Unsubscribe;
  onPointerUp(listener: (event: CanvasPointerEvent) => void): Unsubscribe;
  pause(): void;
  renderOnce(): void;
  resize(options?: Partial<CanvasResizeOptions>): void;
  resizeToDisplaySize(): boolean;
  resume(): void;
  start(): void;
  stop(): void;
}

function resolvePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }

  return value;
}

function resolvePixelRatio(
  pixelRatio: PixelRatioOption | undefined,
  maxPixelRatio: number,
): number {
  const rawPixelRatio =
    pixelRatio === "auto" || pixelRatio === undefined
      ? typeof window === "undefined" || !Number.isFinite(window.devicePixelRatio)
        ? 1
        : window.devicePixelRatio
      : pixelRatio;

  return Math.min(resolvePositive(rawPixelRatio, "pixelRatio"), maxPixelRatio);
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new CanvasContextUnavailableError(
      "2D context is not available for the provided canvas.",
    );
  }

  return context;
}

export function createCanvasRuntime(options: CanvasRuntimeOptions): CanvasRuntime {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  const canvas = options.canvas;
  const context = getCanvasContext(canvas);
  const maxPixelRatio = resolvePositive(options.maxPixelRatio ?? 2, "maxPixelRatio");
  const imageSmoothing = options.imageSmoothing;
  let logicalWidth = resolvePositive(options.logicalWidth, "logicalWidth");
  let logicalHeight = resolvePositive(options.logicalHeight, "logicalHeight");
  let pixelRatioOption = options.pixelRatio ?? "auto";
  let pixelRatio = resolvePixelRatio(pixelRatioOption, maxPixelRatio);
  let destroyed = false;
  const pointerSubscriptions: Array<{
    listener: EventListener;
    type: string;
  }> = [];

  const assertActive = (): void => {
    if (destroyed) {
      throw new RuntimeDestroyedError("Canvas runtime has been destroyed.");
    }
  };

  const buildSize = (): CanvasRuntimeSize => ({
    logicalWidth,
    logicalHeight,
    cssWidth: logicalWidth,
    cssHeight: logicalHeight,
    bufferWidth: canvas.width,
    bufferHeight: canvas.height,
    pixelRatio,
  });

  const applyCanvasSize = (): boolean => {
    pixelRatio = resolvePixelRatio(pixelRatioOption, maxPixelRatio);
    const bufferWidth = Math.round(logicalWidth * pixelRatio);
    const bufferHeight = Math.round(logicalHeight * pixelRatio);
    const changed =
      canvas.width !== bufferWidth ||
      canvas.height !== bufferHeight ||
      canvas.style.width !== `${logicalWidth}px` ||
      canvas.style.height !== `${logicalHeight}px`;

    canvas.width = bufferWidth;
    canvas.height = bufferHeight;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (imageSmoothing !== undefined) {
      context.imageSmoothingEnabled = imageSmoothing;
    }

    return changed;
  };

  const renderFrame = (): void => {
    context.save();
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (imageSmoothing !== undefined) {
      context.imageSmoothingEnabled = imageSmoothing;
    }

    try {
      options.render(context);
    } finally {
      context.restore();
    }
  };

  const loop = createAnimationLoop({
    drawMs: renderFrame,
    maxDeltaMs: options.maxDeltaMs,
    pauseWhenHidden: options.pauseWhenHidden,
    reducedMotion: options.reducedMotion,
    updateMs: options.update,
  });

  const subscribePointer = (
    type: string,
    listener: (event: CanvasPointerEvent) => void,
  ): Unsubscribe => {
    assertActive();

    const eventListener: EventListener = (event) => {
      const pointerEvent = event as PointerEvent;
      const rect = canvas.getBoundingClientRect();
      const widthScale = rect.width > 0 ? logicalWidth / rect.width : 1;
      const heightScale = rect.height > 0 ? logicalHeight / rect.height : 1;

      listener({
        x: (pointerEvent.clientX - rect.left) * widthScale,
        y: (pointerEvent.clientY - rect.top) * heightScale,
        originalEvent: pointerEvent,
      });
    };

    canvas.addEventListener(type, eventListener);
    pointerSubscriptions.push({ listener: eventListener, type });

    return () => {
      canvas.removeEventListener(type, eventListener);
      const index = pointerSubscriptions.findIndex(
        (subscription) =>
          subscription.listener === eventListener && subscription.type === type,
      );

      if (index >= 0) {
        pointerSubscriptions.splice(index, 1);
      }
    };
  };

  applyCanvasSize();

  return {
    destroy(): void {
      if (destroyed) {
        return;
      }

      loop.destroy();

      for (const subscription of pointerSubscriptions.splice(0)) {
        canvas.removeEventListener(subscription.type, subscription.listener);
      }

      destroyed = true;
    },
    getCanvas(): HTMLCanvasElement {
      return canvas;
    },
    getContext(): CanvasRenderingContext2D {
      return context;
    },
    getSize(): CanvasRuntimeSize {
      return buildSize();
    },
    isDestroyed(): boolean {
      return destroyed;
    },
    onPointerCancel(listener): Unsubscribe {
      return subscribePointer("pointercancel", listener);
    },
    onPointerDown(listener): Unsubscribe {
      return subscribePointer("pointerdown", listener);
    },
    onPointerMove(listener): Unsubscribe {
      return subscribePointer("pointermove", listener);
    },
    onPointerUp(listener): Unsubscribe {
      return subscribePointer("pointerup", listener);
    },
    pause(): void {
      assertActive();
      loop.pause();
    },
    renderOnce(): void {
      assertActive();
      renderFrame();
    },
    resize(resizeOptions: Partial<CanvasResizeOptions> = {}): void {
      assertActive();

      if (resizeOptions.width !== undefined) {
        logicalWidth = resolvePositive(resizeOptions.width, "width");
      }

      if (resizeOptions.height !== undefined) {
        logicalHeight = resolvePositive(resizeOptions.height, "height");
      }

      if (resizeOptions.pixelRatio !== undefined) {
        pixelRatioOption = resizeOptions.pixelRatio;
      }

      applyCanvasSize();
    },
    resizeToDisplaySize(): boolean {
      assertActive();

      const rect = canvas.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) {
        return false;
      }

      const nextLogicalWidth = rect.width;
      const nextLogicalHeight = rect.height;
      const nextPixelRatio = resolvePixelRatio(pixelRatioOption, maxPixelRatio);
      const nextBufferWidth = Math.round(nextLogicalWidth * nextPixelRatio);
      const nextBufferHeight = Math.round(nextLogicalHeight * nextPixelRatio);
      const changed =
        canvas.width !== nextBufferWidth ||
        canvas.height !== nextBufferHeight ||
        logicalWidth !== nextLogicalWidth ||
        logicalHeight !== nextLogicalHeight;

      if (!changed) {
        return false;
      }

      logicalWidth = nextLogicalWidth;
      logicalHeight = nextLogicalHeight;
      applyCanvasSize();

      return true;
    },
    resume(): void {
      assertActive();
      loop.resume();
    },
    start(): void {
      assertActive();
      loop.start();
    },
    stop(): void {
      assertActive();
      loop.stop();
    },
  };
}
