# Canvas Runtime 1.1

`createCanvasRuntime()` composes canvas sizing, HiDPI scaling, rendering, pointer events and an animation loop without binding the package to a UI framework.

```ts
import { createCanvasRuntime } from "grid-canvas-system/runtime";

const runtime = createCanvasRuntime({
  canvas,
  logicalWidth: 160,
  logicalHeight: 160,
  pixelRatio: "auto",
  maxPixelRatio: 2,
  imageSmoothing: false,
  maxDeltaMs: 100,
  pauseWhenHidden: true,
  update(deltaMs) {
    animator.update(deltaMs / 1000);
  },
  render(context) {
    context.clearRect(0, 0, 160, 160);
    drawFrame(context);
  },
});

runtime.renderOnce();
runtime.start();
```

## Sizing

- `logicalWidth` and `logicalHeight` are the coordinate system used by render callbacks.
- CSS size is applied to `canvas.style.width` and `canvas.style.height`.
- Buffer size is `logical size * pixelRatio`, capped by `maxPixelRatio`.
- `pixelRatio: "auto"` reads `window.devicePixelRatio` only when the runtime is created or resized.

Use explicit resize when the owning component knows the size:

```ts
runtime.resize({ width: 320, height: 240 });
```

Use display-size resize with `ResizeObserver`:

```ts
const observer = new ResizeObserver(() => {
  runtime.resizeToDisplaySize();
});

observer.observe(canvas);
```

## Lifecycle

`start`, `pause`, `resume`, `stop` and `destroy` are idempotent where possible. `destroy()` cancels RAF, removes pointer listeners created by the runtime and prevents later work.

Pointer listeners return `Unsubscribe` functions and report logical coordinates:

```ts
const unsubscribe = runtime.onPointerMove(({ x, y }) => {
  target.x = x;
  target.y = y;
});

unsubscribe();
```

## Reduced Motion

`getMotionPreference()` returns `"reduce"` or `"no-preference"` without touching browser globals during import. Animation loops and runtimes accept:

- `reducedMotion: "ignore"`: default behavior.
- `reducedMotion: "pause"`: start in a paused state when reduced motion is requested.
- `reducedMotion: "lower-fps"`: throttle frame callbacks while reduced motion is requested.
