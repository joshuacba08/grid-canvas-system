# Migration Guide

## From 1.1.0 to 1.2.0

Existing constructors, helper names and legacy aliases remain available. CDN users can again call `new GridCanvasSystem(...)`; `.default` remains a compatibility alias. Fixed-step loops and scene managers add `destroy()`/`isDestroyed()`; destroy invokes the active scene's exit hook once with its own id.

Reduced-FPS callbacks now receive accumulated simulation time, so remove application workarounds that multiplied elapsed time to compensate. Repeated resize preserves pixels and display-size resize preserves responsive CSS. Pointer tracker logical dimensions are optional; default coordinates remain CSS-relative.

Audio controls now affect their controller's own sounds/context. Use Howler/Tone global APIs explicitly if the application intentionally controls audio outside the addon. Howler asset definitions can provide `onError(error)` for loading/playback failures. Audio remains Experimental until physical-device and WebKit certification completes.

Strict NodeNext/Bundler consumers can compile the installed declarations without skipLibCheck. See [audit](./stability/AUDIT.md) for evidence and pending certification.

## From 1.0.0 to 1.1.0

`1.1.0` is backward-compatible. The update adds a reactive runtime layer for long-lived canvas components while keeping the grid-first drawing API intact.

### Canvas creation

Constructor by ID still works:

```js
const grid = new GridCanvasSystem("canvas");
```

You can now pass an element directly:

```js
const canvas = document.querySelector("canvas");
const grid = new GridCanvasSystem(canvas, { width: 160, height: 160 });
```

When integrating with SSR frameworks, import the package at module scope but create instances only after the browser canvas exists.

### Runtime subpath

New runtime-first code can import from the subpath:

```js
import {
  createCanvasRuntime,
  createSpriteAnimator,
  createStateMachine,
} from "grid-canvas-system/runtime";
```

The same helpers remain available through `GridCanvasSystem.runtime`.

### Animation loop

Existing second-based callbacks remain valid:

```js
GridCanvasSystem.runtime.createAnimationLoop({
  update(elapsed) {},
  draw(elapsed) {},
});
```

For component runtimes, prefer millisecond callbacks and lifecycle controls:

```js
const loop = GridCanvasSystem.runtime.createAnimationLoop({
  maxDeltaMs: 100,
  pauseWhenHidden: true,
  updateMs(deltaMs) {},
});

loop.start();
loop.pause();
loop.resume();
loop.destroy();
```

### Sprite animator

Legacy animation maps still work. Use the new per-animation shape when a sequence needs a different FPS or one-shot behavior:

```js
const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  initial: "idle",
  animations: {
    idle: { frames: ["idle-1", "idle-2"], fps: 6, loop: true },
    burst: { frames: ["burst-1", "burst-2"], fps: 12, loop: false },
  },
});
```

### State machine

Boolean transitions remain. Add `subscribe`, hooks and `historyLimit` when you need observable state changes:

```js
const unsubscribe = machine.subscribe(({ from, to }) => {
  animator.play(to);
});
```

### Cleanup

For framework components, keep every unsubscribe function, disconnect observers, and call `runtime.destroy()` during unmount.

## From 0.x to 1.0.0

`1.0.0` is designed as a stable contract release. Existing `0.4.x` code should keep working unless it depended on unpublished internals.

## Recommended Updates

### Prefer runtime namespace for helpers

Old direct aliases still work:

```js
GridCanvasSystem.createAnimationLoop({ update, draw });
GridCanvasSystem.canvasToGrid(point, options);
```

Prefer the runtime namespace in new code:

```js
GridCanvasSystem.runtime.createAnimationLoop({ update, draw });
GridCanvasSystem.runtime.canvasToGrid(point, options);
```

New helpers only live in `GridCanvasSystem.runtime`:

```js
GridCanvasSystem.runtime.createFixedStepLoop({ step: 1 / 60, update, draw });
GridCanvasSystem.runtime.createSceneManager({ initial: "menu", scenes });
GridCanvasSystem.runtime.drawTileMap(map, tileset, { grid, tileSize: 24 });
```

### Move repeated sprites to Pixel Sprite v2

`drawPixelSprite()` remains stable for simple one-off drawing:

```js
grid.drawPixelSprite(sprite, { x, y, pixelSize, palette });
```

For animation loops, compile once:

```js
const palette = GridCanvasSystem.createPixelPalette({
  0: "transparent",
  1: "#38bdf8",
});
const compiled = GridCanvasSystem.compilePixelSprite(sprite, palette);

grid.drawCompiledPixelSprite(compiled, { x, y, pixelSize });
```

Use `getPixelSpriteBounds()` and `hitTestPixelSprite()` for pointer and collision logic instead of duplicating sprite math in app code.

### Keep audio imports on subpaths

Audio remains outside the root package:

```js
import { createArcadeAudio } from "grid-canvas-system/audio-arcade";
import { createHowlerAssetAudio } from "grid-canvas-system/audio";
```

These subpaths are usable in `1.0.0`, but classified as Experimental.

### Use tilemaps for simple grid worlds

Tilemaps are character rows plus a tileset:

```js
const map = ["111", "102", "111"];
const nextMap = GridCanvasSystem.runtime.setTileAt(map, { column: 1, row: 1 }, "0");
```

`setTileAt()` returns a new map and does not mutate the input.

## No Required Removals

No public legacy API is removed in `1.0.0`. The release mainly freezes naming, documents stability levels, adds smoke tests for package exports and expands the runtime in a namespace-first way.
