import { RuntimeDestroyedError } from "./errors";
import { getMotionPreference } from "./motionPreference";
import type { ReducedMotionBehavior } from "./motionPreference";

export interface GridCanvasAnimationLoopOptions {
  update?: (elapsed: number, timestamp: number) => void;
  draw?: (elapsed: number, timestamp: number) => void;
  updateMs?: (deltaMs: number, timestamp: number) => void;
  drawMs?: (deltaMs: number, timestamp: number) => void;
  autoStart?: boolean;
  maxElapsed?: number;
  maxDeltaMs?: number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
  pauseWhenHidden?: boolean;
  documentRef?: Document;
  windowRef?: Pick<Window, "matchMedia">;
  reducedMotion?: ReducedMotionBehavior;
  reducedMotionFps?: number;
}

export interface GridCanvasAnimationLoop {
  destroy(): void;
  frame(timestamp: number): void;
  isDestroyed(): boolean;
  isPaused(): boolean;
  isRunning(): boolean;
  pause(): void;
  reset(): void;
  resume(): void;
  start(): void;
  stop(): void;
}

function resolveFinite(
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

function resolvePositive(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const resolvedValue = resolveFinite(value, fallback, name);

  if (resolvedValue <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }

  return resolvedValue;
}

function getDefaultRequestFrame(): (callback: FrameRequestCallback) => number {
  if (
    typeof window === "undefined" ||
    typeof window.requestAnimationFrame !== "function"
  ) {
    throw new Error(
      "requestFrame must be provided when requestAnimationFrame is unavailable",
    );
  }

  return window.requestAnimationFrame.bind(window);
}

function getDefaultCancelFrame(): (handle: number) => void {
  if (
    typeof window === "undefined" ||
    typeof window.cancelAnimationFrame !== "function"
  ) {
    return () => {};
  }

  return window.cancelAnimationFrame.bind(window);
}

function getDefaultDocument(): Document | undefined {
  return typeof document === "undefined" ? undefined : document;
}

export function createAnimationLoop(
  options: GridCanvasAnimationLoopOptions = {},
): GridCanvasAnimationLoop {
  const requestFrame = options.requestFrame ?? getDefaultRequestFrame();
  const cancelFrame = options.cancelFrame ?? getDefaultCancelFrame();
  const maxDeltaMs =
    options.maxDeltaMs === undefined
      ? options.maxElapsed === undefined
        ? Number.POSITIVE_INFINITY
        : resolveFinite(options.maxElapsed, 0, "maxElapsed") * 1000
      : resolvePositive(options.maxDeltaMs, 100, "maxDeltaMs");
  if (maxDeltaMs < 0) {
    throw new Error("maxElapsed must be non-negative");
  }
  const reducedMotion = options.reducedMotion ?? "ignore";
  const reducedMotionFrameMs =
    1000 / resolvePositive(options.reducedMotionFps, 15, "reducedMotionFps");
  const documentRef =
    options.pauseWhenHidden === true
      ? (options.documentRef ?? getDefaultDocument())
      : undefined;
  let frameHandle: number | null = null;
  let previousTimestamp: number | undefined;
  let running = false;
  let paused = false;
  let destroyed = false;
  let pausedByVisibility = false;
  let lowerFpsAccumulator = 0;

  const assertNotDestroyed = (): void => {
    if (destroyed) {
      throw new RuntimeDestroyedError("Animation loop has been destroyed.");
    }
  };

  const cancelScheduledFrame = (): void => {
    if (frameHandle !== null) {
      cancelFrame(frameHandle);
      frameHandle = null;
    }
  };

  const shouldPauseForReducedMotion = (): boolean =>
    reducedMotion === "pause" && getMotionPreference(options.windowRef) === "reduce";

  const scheduleNextFrame = (): void => {
    if (frameHandle === null && running && !paused && !destroyed) {
      frameHandle = requestFrame(onFrame);
    }
  };

  const onFrame: FrameRequestCallback = (timestamp) => {
    frameHandle = null;

    if (!running || paused || destroyed) {
      return;
    }

    try {
      loop.frame(timestamp);
    } catch (error) {
      loop.stop();
      throw error;
    }
    scheduleNextFrame();
  };

  const onVisibilityChange = (): void => {
    if (documentRef === undefined) {
      return;
    }

    if (documentRef.hidden) {
      if (running && !paused) {
        loop.pause();
        pausedByVisibility = true;
      }

      return;
    }

    if (pausedByVisibility) {
      pausedByVisibility = false;
      loop.resume();
    }
  };

  const loop: GridCanvasAnimationLoop = {
    destroy(): void {
      if (destroyed) {
        return;
      }

      running = false;
      paused = false;
      destroyed = true;
      pausedByVisibility = false;
      previousTimestamp = undefined;
      lowerFpsAccumulator = 0;
      cancelScheduledFrame();
      documentRef?.removeEventListener("visibilitychange", onVisibilityChange);
    },
    frame(timestamp: number): void {
      if (destroyed || paused) {
        return;
      }

      const resolvedTimestamp = resolveFinite(timestamp, 0, "timestamp");

      if (previousTimestamp === undefined) {
        previousTimestamp = resolvedTimestamp;
      }

      const elapsedMilliseconds = Math.max(0, resolvedTimestamp - previousTimestamp);
      previousTimestamp = resolvedTimestamp;
      let deliveredMilliseconds = elapsedMilliseconds;

      if (
        reducedMotion === "lower-fps" &&
        getMotionPreference(options.windowRef) === "reduce"
      ) {
        lowerFpsAccumulator += elapsedMilliseconds;

        if (lowerFpsAccumulator < reducedMotionFrameMs) {
          return;
        }

        deliveredMilliseconds = lowerFpsAccumulator;
        lowerFpsAccumulator = 0;
      } else {
        deliveredMilliseconds += lowerFpsAccumulator;
        lowerFpsAccumulator = 0;
      }

      const clampedMilliseconds = Math.min(deliveredMilliseconds, maxDeltaMs);
      const elapsed = clampedMilliseconds / 1000;
      const wasRunning = running;
      const callbacks = [
        () => options.update?.(elapsed, resolvedTimestamp),
        () => options.updateMs?.(clampedMilliseconds, resolvedTimestamp),
        () => options.draw?.(elapsed, resolvedTimestamp),
        () => options.drawMs?.(clampedMilliseconds, resolvedTimestamp),
      ];
      for (const callback of callbacks) {
        if (destroyed || paused || (wasRunning && !running)) break;
        callback();
      }
    },
    isDestroyed(): boolean {
      return destroyed;
    },
    isPaused(): boolean {
      return paused;
    },
    isRunning(): boolean {
      return running;
    },
    pause(): void {
      pausedByVisibility = false;
      if (destroyed || !running || paused) {
        return;
      }

      paused = true;
      lowerFpsAccumulator = 0;
      cancelScheduledFrame();
    },
    reset(): void {
      assertNotDestroyed();
      previousTimestamp = undefined;
      lowerFpsAccumulator = 0;
    },
    resume(): void {
      assertNotDestroyed();

      if (!running || !paused || documentRef?.hidden || shouldPauseForReducedMotion()) {
        return;
      }

      paused = false;
      previousTimestamp = undefined;
      scheduleNextFrame();
    },
    start(): void {
      assertNotDestroyed();

      if (running && !paused) {
        return;
      }

      running = true;
      previousTimestamp = undefined;
      lowerFpsAccumulator = 0;

      pausedByVisibility = documentRef?.hidden === true;
      if (shouldPauseForReducedMotion() || pausedByVisibility) {
        paused = true;
        return;
      }

      paused = false;
      scheduleNextFrame();
    },
    stop(): void {
      if (destroyed) {
        return;
      }

      running = false;
      paused = false;
      pausedByVisibility = false;
      previousTimestamp = undefined;
      lowerFpsAccumulator = 0;
      cancelScheduledFrame();
    },
  };

  documentRef?.addEventListener("visibilitychange", onVisibilityChange);

  if (options.autoStart === true) {
    loop.start();
  }

  return loop;
}
