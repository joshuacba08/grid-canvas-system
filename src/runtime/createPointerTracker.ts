import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";

export interface GridCanvasPointerTrackerOptions {
  capture?: boolean;
  preventDefault?: boolean;
}

export interface GridCanvasPointerTracker {
  destroy(): void;
  isDown(): boolean;
  position(): GridCanvasPoint | null;
}

type PointerTarget = EventTarget & {
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  getBoundingClientRect?: () => Pick<DOMRect, "left" | "top">;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
};

function resolveTarget(target: EventTarget): PointerTarget {
  if (
    target === null ||
    typeof target !== "object" ||
    !("addEventListener" in target) ||
    !("removeEventListener" in target)
  ) {
    throw new Error("target must support addEventListener and removeEventListener");
  }

  return target as PointerTarget;
}

function readClientPoint(event: Event): GridCanvasPoint | null {
  const pointerEvent = event as Event & {
    clientX?: unknown;
    clientY?: unknown;
  };

  if (
    typeof pointerEvent.clientX !== "number" ||
    typeof pointerEvent.clientY !== "number"
  ) {
    return null;
  }

  return {
    x: pointerEvent.clientX,
    y: pointerEvent.clientY,
  };
}

function resolveRelativePoint(
  target: PointerTarget,
  event: Event,
): GridCanvasPoint | null {
  const clientPoint = readClientPoint(event);

  if (clientPoint === null) {
    return null;
  }

  if (typeof target.getBoundingClientRect !== "function") {
    return clientPoint;
  }

  const rect = target.getBoundingClientRect();

  return {
    x: clientPoint.x - rect.left,
    y: clientPoint.y - rect.top,
  };
}

export function createPointerTracker(
  target: EventTarget,
  options: GridCanvasPointerTrackerOptions = {},
): GridCanvasPointerTracker {
  const resolvedTarget = resolveTarget(target);
  let down = false;
  let currentPosition: GridCanvasPoint | null = null;

  const updatePosition = (event: Event): void => {
    const nextPosition = resolveRelativePoint(resolvedTarget, event);

    if (nextPosition !== null) {
      currentPosition = nextPosition;
    }

    if (options.preventDefault === true && event.cancelable) {
      event.preventDefault();
    }
  };

  const pointerdown = (event: Event): void => {
    down = true;
    updatePosition(event);
  };

  const pointermove = (event: Event): void => {
    updatePosition(event);
  };

  const pointerup = (event: Event): void => {
    down = false;
    updatePosition(event);
  };

  const pointercancel = (event: Event): void => {
    down = false;
    updatePosition(event);
  };

  const pointerleave = (event: Event): void => {
    down = false;
    updatePosition(event);
  };

  resolvedTarget.addEventListener("pointerdown", pointerdown, options.capture);
  resolvedTarget.addEventListener("pointermove", pointermove, options.capture);
  resolvedTarget.addEventListener("pointerup", pointerup, options.capture);
  resolvedTarget.addEventListener("pointercancel", pointercancel, options.capture);
  resolvedTarget.addEventListener("pointerleave", pointerleave, options.capture);

  return {
    destroy(): void {
      resolvedTarget.removeEventListener("pointerdown", pointerdown, options.capture);
      resolvedTarget.removeEventListener("pointermove", pointermove, options.capture);
      resolvedTarget.removeEventListener("pointerup", pointerup, options.capture);
      resolvedTarget.removeEventListener(
        "pointercancel",
        pointercancel,
        options.capture,
      );
      resolvedTarget.removeEventListener("pointerleave", pointerleave, options.capture);
      down = false;
      currentPosition = null;
    },
    isDown(): boolean {
      return down;
    },
    position(): GridCanvasPoint | null {
      if (currentPosition === null) {
        return null;
      }

      return {
        x: currentPosition.x,
        y: currentPosition.y,
      };
    },
  };
}
