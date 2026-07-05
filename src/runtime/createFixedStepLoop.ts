export interface GridCanvasFixedStepLoopOptions {
  autoStart?: boolean;
  cancelFrame?: (handle: number) => void;
  draw?: (alpha: number, timestamp: number) => void;
  maxElapsed?: number;
  maxUpdatesPerFrame?: number;
  requestFrame?: (callback: FrameRequestCallback) => number;
  step: number;
  update?: (step: number, timestamp: number) => void;
}

export interface GridCanvasFixedStepLoop {
  frame(timestamp: number): void;
  isRunning(): boolean;
  reset(): void;
  start(): void;
  stop(): void;
}

function resolveFinite(value: number, name: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }

  return value;
}

function resolvePositive(value: number, name: string): number {
  const resolvedValue = resolveFinite(value, name);

  if (resolvedValue <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }

  return resolvedValue;
}

function resolvePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
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

export function createFixedStepLoop(
  options: GridCanvasFixedStepLoopOptions,
): GridCanvasFixedStepLoop {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  const step = resolvePositive(options.step, "step");
  const maxElapsed =
    options.maxElapsed === undefined
      ? Number.POSITIVE_INFINITY
      : resolvePositive(options.maxElapsed, "maxElapsed");
  const maxUpdatesPerFrame = resolvePositiveInteger(
    options.maxUpdatesPerFrame ?? 5,
    "maxUpdatesPerFrame",
  );
  const requestFrame = options.requestFrame ?? getDefaultRequestFrame();
  const cancelFrame = options.cancelFrame ?? getDefaultCancelFrame();
  let accumulator = 0;
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

  const loop: GridCanvasFixedStepLoop = {
    frame(timestamp: number): void {
      const resolvedTimestamp = resolveFinite(timestamp, "timestamp");

      if (previousTimestamp === undefined) {
        previousTimestamp = resolvedTimestamp;
      }

      const elapsedMilliseconds = Math.max(0, resolvedTimestamp - previousTimestamp);
      const elapsedSeconds = Math.min(elapsedMilliseconds / 1000, maxElapsed);
      let updatesThisFrame = 0;

      accumulator += elapsedSeconds;

      while (accumulator >= step && updatesThisFrame < maxUpdatesPerFrame) {
        options.update?.(step, resolvedTimestamp);
        accumulator -= step;
        updatesThisFrame += 1;
      }

      if (accumulator >= step) {
        // The update cap was reached with time to spare. Drop the whole steps we
        // could not simulate (spiral-of-death guard) but keep the sub-step
        // remainder so the interpolation alpha stays meaningful and we do not
        // bank a full extra update for the next frame.
        accumulator %= step;
      }

      options.draw?.(Math.min(1, accumulator / step), resolvedTimestamp);
      previousTimestamp = resolvedTimestamp;
    },
    isRunning(): boolean {
      return running;
    },
    reset(): void {
      accumulator = 0;
      previousTimestamp = undefined;
    },
    start(): void {
      if (running) {
        return;
      }

      running = true;
      accumulator = 0;
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
