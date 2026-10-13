# Public API Contract

This document defines the public surface for the unpublished `grid-canvas-system@1.2.0-rc.1` candidate, extending the stable `1.x` contract.

## Stable

Stable APIs are expected to remain source-compatible through the `1.x` line.

### Root package

- Default export: `GridCanvasSystem`.
- Instance fields: `canvas`, `ctx`, `options`.
- Constructor signatures:
  - `new GridCanvasSystem(id)`
  - `new GridCanvasSystem(id, options)`
  - `new GridCanvasSystem(id, width, height)`
  - `new GridCanvasSystem(canvasElement, options)`
  - `new GridCanvasSystem(canvasElement, width, height)`
- Instance drawing methods:
  - `clearCanvas`
  - `drawAsteroid`
  - `drawBarIndicator`
  - `drawCircleSector`
  - `drawCompiledPixelSprite`
  - `drawCoordinate`
  - `drawGhost`
  - `drawLine`
  - `drawMessage`
  - `drawPacman`
  - `drawPixelSprite`
  - `drawPolyline`
  - `drawProjectile`
  - `drawShip`
  - `drawText`
  - `drawValueLabel`
  - `polarToCartesian`
  - `createAsteroidShape`

### Pixel Sprite v2

- `createPixelPalette(palette)`
- `compilePixelSprite(sprite, palette)`
- `flipPixelSpriteX(sprite)`
- `flipPixelSpriteY(sprite)`
- `tintPixelSprite(compiled, color)`
- `getPixelSpriteBounds(spriteOrCompiled, options)`
- `hitTestPixelSprite(point, spriteOrCompiled, options)`

### Runtime

Use new runtime helpers through `GridCanvasSystem.runtime`.

- `createAnimationLoop(options)`
- `createCanvasRuntime(options)`
- `createFixedStepLoop(options)`
- `createKeyTracker(target, options?)`
- `createPointerTracker(target, options?)`
- `createSceneManager(options)`
- `createSpriteAnimator(options)`
- `createStateMachine(options)`
- `MassBody`
- `canvasToGrid(point, options)`
- `gridToCanvas(cell, options)`
- `snapPointToGrid(point, options)`
- `drawTileMap(map, tileset, options)`
- `getTileAt(point, map, options)`
- `setTileAt(map, cell, value)`
- `tileToBounds(cell, options)`
- `hitTestTileMap(rect, map, solidTiles, options)`
- `appendTrailPoint(trail, point, maxPoints)`
- `createParticleBurst(origin, count, options?)`
- `stepParticles(particles, elapsed, options?)`
- `layoutStack(origin, itemSizes, options?)`
- `hitTestPoint(point, target)`
- `hitTestRectangle(a, b)`
- `hitTestCircleRectangle(circle, rectangle)`
- `vectorFromAngle(angle, magnitude?)`
- `angleToPoint(from, to)`
- `distanceBetweenPoints(a, b)`
- `circlesIntersect(a, b)`
- `oscillate01(time, frequency?)`
- `wrapPoint(point, bounds, radius?)`
- `normalizeKeyIdentifier(key)`
- `getMotionPreference(targetWindow?)`

### Runtime subpath

`grid-canvas-system/runtime` is a public tree-shakeable subpath for runtime primitives:

- `createCanvasRuntime`
- `createAnimationLoop`
- `createSpriteAnimator`
- `createStateMachine`
- `createPointerTracker`
- `getMotionPreference`
- Runtime errors: `CanvasTargetNotFoundError`, `CanvasContextUnavailableError`, `RuntimeDestroyedError`, `InvalidStateTransitionError`, `UnknownAnimationError`
- Public runtime types: `CanvasRuntime`, `CanvasRuntimeOptions`, `CanvasRuntimeSize`, `CanvasPointerEvent`, `Unsubscribe`, `SpriteAnimation`, `SpriteAnimatorEvent`, `StateTransitionEvent`, `StateHistoryEntry`

### Runtime 1.1 audit

| API actual                      | Estado        | Acción                                               |
| ------------------------------- | ------------- | ---------------------------------------------------- |
| Constructor por ID              | Soportado     | Mantener durante `1.x`                               |
| Constructor por elemento canvas | Nuevo estable | Añadir sin reemplazar ID                             |
| Animation loop actual           | Soportado     | Extender con pause/resume/destroy                    |
| Sprite animator actual          | Soportado     | Normalizar con formato por animación                 |
| State machine actual            | Soportado     | Añadir eventos, hooks e historial                    |
| Pointer helpers                 | Soportado     | Mantener tracker y añadir eventos lógicos en runtime |
| Destroy actual                  | Parcial       | Unificar en runtime, loop, animator y machine        |
| Runtime exports                 | Estable       | Añadir subpath `grid-canvas-system/runtime`          |

## Experimental

Experimental APIs are published and typed, but may receive non-breaking polish or broader adapter coverage before being promoted.

- `grid-canvas-system/audio-arcade`
- `grid-canvas-system/audio`

Audio is intentionally kept out of the root bundle. Browser autoplay behavior, adapter breadth and richer examples will continue to mature after `1.0.0`.

## Legacy

Legacy APIs remain supported through `1.x` to protect existing projects.

- Direct root aliases for runtime helpers shipped before `1.0.0`, such as `GridCanvasSystem.createAnimationLoop`, `GridCanvasSystem.createKeyTracker`, `GridCanvasSystem.canvasToGrid`, `GridCanvasSystem.MassBody`, collision helpers and motion helpers.
- Constructor aliases `labelColor` and `font`.
- The numeric constructor signature `new GridCanvasSystem(id, width, height)`.

New runtime helpers added for `1.0.0` are not mirrored as direct root aliases. Use `GridCanvasSystem.runtime.createFixedStepLoop`, `GridCanvasSystem.runtime.createSceneManager` and `GridCanvasSystem.runtime.drawTileMap`.

## Outside 1.0.0

The current contract does not include framework-specific bindings, WebGL, ECS, a visual editor, multiplayer, advanced physics, camera controls or a complex asset manager. Framework integration uses the generic runtime lifecycle. Camera controls remain a roadmap item.

## Stabilization candidate contracts

- Fixed-step loops and scene managers expose idempotent `destroy()` and readable `isDestroyed()`. Fixed-step `start()` and `reset()` reject later use; `stop()` remains harmless and manual `frame()` does nothing. Scene mutation/update/draw methods reject later use, while getters remain readable.
- Scene destruction invokes the current scene's `exit(currentSceneId)` once. The caller remains responsible for resources created outside these helpers.
- State/scene transitions reject nested transitions with `false`. Reset inside a transition throws `InvalidStateTransitionError`. An exit failure leaves the old state; an enter failure leaves the new state. State history and events reflect a committed transition even if enter throws.
- Animator frame subscribers may replace or destroy playback; the interrupted animation cannot complete the replacement. Completion events describe the completed animation and precede user completion callbacks.
- Runtime `resize()` validates all dimensions/DPR before committing. An unchanged size preserves the bitmap and context state.
- Reduced-FPS updates receive accumulated time since the previous delivered update, limited by `maxDeltaMs`. Delta discarded by that limit is intentionally not simulated.
- Pointer tracker coordinates remain CSS-relative by default; optional `logicalWidth`/`logicalHeight` map scaled display dimensions to a logical coordinate system.
- Howler controllers affect only their own sounds. Asset definitions may provide `onError(error)` for load/playback errors. Tone controllers own independent contexts, transports and output volumes, with polyphonic voices for overlapping notes/chords.
- Audio is still Experimental pending the certification checklist. See [audit](./stability/AUDIT.md) and [inventory](./stability/contract.json).
