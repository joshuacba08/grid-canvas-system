const LEGACY_KEY_MAP: Record<number, string> = {
  32: " ",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
};

export interface GridCanvasKeyTrackerOptions {
  autoFocus?: boolean;
  capture?: boolean;
  preventDefaultKeys?: Array<number | string>;
}

export interface GridCanvasKeyTracker {
  destroy(): void;
  focus(): void;
  isPressed(key: number | string): boolean;
  pressedKeys: ReadonlySet<string>;
}

function normalizeKeyIdentifier(key: number | string): string {
  if (typeof key === "number") {
    return LEGACY_KEY_MAP[key] ?? key.toString();
  }

  return key;
}

function resolveTarget(target: EventTarget): EventTarget & {
  addEventListener: typeof window.addEventListener;
  removeEventListener: typeof window.removeEventListener;
} {
  if (
    target === null ||
    typeof target !== "object" ||
    !("addEventListener" in target) ||
    !("removeEventListener" in target)
  ) {
    throw new Error("target must support addEventListener and removeEventListener");
  }

  return target as EventTarget & {
    addEventListener: typeof window.addEventListener;
    removeEventListener: typeof window.removeEventListener;
  };
}

export function createKeyTracker(
  target: EventTarget,
  options: GridCanvasKeyTrackerOptions = {},
): GridCanvasKeyTracker {
  const resolvedTarget = resolveTarget(target);
  const preventDefaultKeys = new Set(
    (options.preventDefaultKeys ?? []).map(normalizeKeyIdentifier),
  );
  const pressedKeys = new Set<string>();
  const clearKeys = (): void => pressedKeys.clear();
  const ownerDocument = (target as { ownerDocument?: Document }).ownerDocument;
  const targetWindow =
    ownerDocument?.defaultView ?? (typeof window === "undefined" ? undefined : window);
  const targetDocument =
    ownerDocument ?? (typeof document === "undefined" ? undefined : document);
  const visibilityChange = (): void => {
    if (targetDocument?.hidden) clearKeys();
  };

  const keydown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    const key = normalizeKeyIdentifier(keyboardEvent.key ?? keyboardEvent.keyCode);

    pressedKeys.add(key);

    if (preventDefaultKeys.has(key)) {
      keyboardEvent.preventDefault();
    }
  };

  const keyup = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    const key = normalizeKeyIdentifier(keyboardEvent.key ?? keyboardEvent.keyCode);

    pressedKeys.delete(key);

    if (preventDefaultKeys.has(key)) {
      keyboardEvent.preventDefault();
    }
  };

  resolvedTarget.addEventListener("keydown", keydown, options.capture);
  resolvedTarget.addEventListener("keyup", keyup, options.capture);
  resolvedTarget.addEventListener("blur", clearKeys, options.capture);
  targetWindow?.addEventListener("blur", clearKeys);
  targetDocument?.addEventListener("visibilitychange", visibilityChange);

  const focus = (): void => {
    if ("focus" in resolvedTarget && typeof resolvedTarget.focus === "function") {
      if (
        "tabIndex" in resolvedTarget &&
        typeof resolvedTarget.tabIndex === "number" &&
        resolvedTarget.tabIndex < 0
      ) {
        resolvedTarget.tabIndex = 0;
      }

      resolvedTarget.focus();
    }
  };

  if (options.autoFocus === true) {
    focus();
  }

  return {
    destroy(): void {
      resolvedTarget.removeEventListener("keydown", keydown, options.capture);
      resolvedTarget.removeEventListener("keyup", keyup, options.capture);
      resolvedTarget.removeEventListener("blur", clearKeys, options.capture);
      targetWindow?.removeEventListener("blur", clearKeys);
      targetDocument?.removeEventListener("visibilitychange", visibilityChange);
      pressedKeys.clear();
    },
    focus,
    isPressed(key: number | string): boolean {
      return pressedKeys.has(normalizeKeyIdentifier(key));
    },
    pressedKeys,
  };
}

export { normalizeKeyIdentifier };
