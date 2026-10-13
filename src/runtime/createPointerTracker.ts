import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";

export interface GridCanvasPointerTrackerOptions {
  capture?: boolean;
  preventDefault?: boolean;
  logicalWidth?: number;
  logicalHeight?: number;
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
  getBoundingClientRect?: () => Pick<DOMRect, "left" | "top"> &
    Partial<Pick<DOMRect, "width" | "height">>;
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
    !Number.isFinite(pointerEvent.clientX) ||
    typeof pointerEvent.clientY !== "number" ||
    !Number.isFinite(pointerEvent.clientY)
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
  options: GridCanvasPointerTrackerOptions,
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
    x:
      (clientPoint.x - rect.left) *
      (options.logicalWidth !== undefined && (rect.width ?? 0) > 0
        ? options.logicalWidth / rect.width!
        : 1),
    y:
      (clientPoint.y - rect.top) *
      (options.logicalHeight !== undefined && (rect.height ?? 0) > 0
        ? options.logicalHeight / rect.height!
        : 1),
  };
}

export function createPointerTracker(
  target: EventTarget,
  options: GridCanvasPointerTrackerOptions = {},
): GridCanvasPointerTracker {
  const resolvedTarget = resolveTarget(target);
  for (const [name, value] of Object.entries({
    logicalWidth: options.logicalWidth,
    logicalHeight: options.logicalHeight,
  })) {
    if (value !== undefined && (!Number.isFinite(value) || value <= 0))
      throw new Error(`${name} must be positive and finite`);
  }
  let down = false;
  let currentPosition: GridCanvasPoint | null = null;
  const blur = (): void => {
    down = false;
    currentPosition = null;
  };
  const ownerWindow =
    (target as { ownerDocument?: Document }).ownerDocument?.defaultView ??
    (typeof window === "undefined" ? undefined : window);

  const updatePosition = (event: Event): void => {
    const nextPosition = resolveRelativePoint(resolvedTarget, event, options);

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
  resolvedTarget.addEventListener("lostpointercapture", pointercancel, options.capture);
  ownerWindow?.addEventListener("blur", blur);

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
      resolvedTarget.removeEventListener(
        "lostpointercapture",
        pointercancel,
        options.capture,
      );
      ownerWindow?.removeEventListener("blur", blur);
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
