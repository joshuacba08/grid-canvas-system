export interface GridCanvasAnimationLoopOptions {
  update?: (elapsed: number, timestamp: number) => void;
  draw?: (elapsed: number, timestamp: number) => void;
  autoStart?: boolean;
  maxElapsed?: number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  cancelFrame?: (handle: number) => void;
}

export interface GridCanvasAnimationLoop {
  frame(timestamp: number): void;
  isRunning(): boolean;
  reset(): void;
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

export function createAnimationLoop(
  options: GridCanvasAnimationLoopOptions = {},
): GridCanvasAnimationLoop {
  const requestFrame = options.requestFrame ?? getDefaultRequestFrame();
  const cancelFrame = options.cancelFrame ?? getDefaultCancelFrame();
  const maxElapsed =
    options.maxElapsed === undefined
      ? Number.POSITIVE_INFINITY
      : resolveFinite(options.maxElapsed, 0, "maxElapsed");
  let frameHandle: number | null = null;
  let previousTimestamp: number | undefined;
  let running = false;

  const scheduleNextFrame = (): void => {
    frameHandle = requestFrame(onFrame);
  };

  const onFrame: FrameRequestCallback = (timestamp) => {
    if (!running) {
      return;
    }

    loop.frame(timestamp);

    if (running) {
      scheduleNextFrame();
    }
  };

  const loop: GridCanvasAnimationLoop = {
    frame(timestamp: number): void {
      const resolvedTimestamp = resolveFinite(timestamp, 0, "timestamp");

      if (previousTimestamp === undefined) {
        previousTimestamp = resolvedTimestamp;
      }

      const elapsedMilliseconds = Math.max(0, resolvedTimestamp - previousTimestamp);
      const clampedMilliseconds = Math.min(elapsedMilliseconds, maxElapsed * 1000);
      const elapsed = clampedMilliseconds / 1000;

      options.update?.(elapsed, resolvedTimestamp);
      options.draw?.(elapsed, resolvedTimestamp);

      previousTimestamp = resolvedTimestamp;
    },
    isRunning(): boolean {
      return running;
    },
    reset(): void {
      previousTimestamp = undefined;
    },
    start(): void {
      if (running) {
        return;
      }

      running = true;
      previousTimestamp = undefined;
      scheduleNextFrame();
    },
    stop(): void {
      if (!running) {
        return;
      }

      running = false;

      if (frameHandle !== null) {
        cancelFrame(frameHandle);
        frameHandle = null;
      }
    },
  };

  if (options.autoStart === true) {
    loop.start();
  }

  return loop;
}
