# Migration Guide

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
