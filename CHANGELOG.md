# Changelog

All notable changes to `grid-canvas-system` are documented here.

## 1.1.0

### Added

- Added `GridCanvasSystem.runtime.createCanvasRuntime()` and the `grid-canvas-system/runtime` subpath.
- Added direct `HTMLCanvasElement` support for `new GridCanvasSystem(canvas, options)` while keeping id-based constructors.
- Added domain errors for canvas target, canvas context, destroyed runtime, invalid transitions and unknown animations.
- Added DPR-aware runtime resizing, `resizeToDisplaySize()`, `renderOnce()`, image smoothing control and logical pointer events.
- Added animation loop lifecycle controls: `pause`, `resume`, `destroy`, visibility pause, `maxDeltaMs` and reduced-motion behavior.
- Added Sprite Animator v2 events, per-animation FPS/loop config, one-shot completion callbacks and cleanup.
- Added State Machine v2 subscriptions, metadata, lifecycle hooks and bounded history.
- Added runtime, sprite animator, state machine and framework integration documentation plus an interactive vanilla example.

### Changed

- Extended runtime helpers without removing legacy APIs or direct aliases that existed before `1.0.0`.
- Kept the package SSR-safe at import time; browser APIs are resolved during instance/runtime creation.
- Updated package exports, type smoke tests and package export verification for the new runtime subpath.

## 1.0.0

### Added

- Added Pixel Sprite v2 helpers: `createPixelPalette`, `compilePixelSprite`, `flipPixelSpriteX`, `flipPixelSpriteY`, `tintPixelSprite`, `getPixelSpriteBounds`, and `hitTestPixelSprite`.
- Added `grid.drawCompiledPixelSprite()` for reusable compiled pixel art with optional opacity.
- Added `GridCanvasSystem.runtime.createFixedStepLoop()` for deterministic update steps.
- Added `GridCanvasSystem.runtime.createSceneManager()` for menu/game/pause/game-over style scene flows.
- Added simple runtime tilemaps with `drawTileMap`, `getTileAt`, `setTileAt`, `tileToBounds`, and `hitTestTileMap`.
- Added package export smoke verification that packs the package, installs the tarball in a temporary project, and imports root, audio, audio-arcade, and package metadata subpaths.
- Added public API and migration docs plus new vanilla examples for compiled sprites and tilemap scenes.

### Changed

- Classified the root canvas, drawing, pixel sprite, runtime and tilemap APIs as the stable `1.0.0` contract.
- Kept audio subpaths published and typed, while documenting them as Experimental.
- Kept legacy runtime aliases on `GridCanvasSystem`, but new runtime helpers now live only under `GridCanvasSystem.runtime`.

> The `0.4.2` through `0.9.0` entries below track the incremental milestones that led to the stable `1.0.0` release.

## 0.9.0

### Added

- Added `docs/PUBLIC_API.md` and `docs/MIGRATION.md`, officially classifying the Stable, Experimental, and Legacy surfaces.
- Added TypeScript type smoke tests (`tsconfig.types-smoke.json`, `tests/types/`) for the root export, runtime namespace, and subpaths.

### Changed

- Froze the final public names and separated legacy aliases: existing runtime helpers stay mirrored on `GridCanvasSystem.*`, while new helpers live only under `GridCanvasSystem.runtime.*`.

## 0.8.0

### Added

- Added simple runtime tilemaps with `drawTileMap`, plus `getTileAt`, `setTileAt`, `tileToBounds`, and `hitTestTileMap`.
- Added a maze-style vanilla demo with tile-based collisions against solid tiles.

## 0.7.0

### Added

- Added `GridCanvasSystem.runtime.createSceneManager()` with `enter`, `update`, `draw`, `exit`, and `transition` lifecycle hooks.
- Added a menu/game/pause/game-over demo that keeps audio decoupled from the core.

## 0.6.0

### Added

- Added `GridCanvasSystem.runtime.createFixedStepLoop()` for deterministic fixed-step updates with `maxUpdatesPerFrame`.

### Changed

- Kept `createAnimationLoop` intact and documented when to choose a variable loop versus a fixed-step loop.

## 0.5.0

### Added

- Added Pixel Sprite v2: `compilePixelSprite(sprite, palette)` and the `GridCanvasCompiledPixelSprite` type.
- Added `grid.drawCompiledPixelSprite(compiled, options)` supporting `x`, `y`, `pixelSize`, and `opacity`.
- Added pure helpers `createPixelPalette`, `flipPixelSpriteX`, `flipPixelSpriteY`, and `tintPixelSprite`.
- Added `getPixelSpriteBounds` and `hitTestPixelSprite` for interaction and demos.
- Added a compiled-sprite demo, docs, and a benchmark comparing compiled sprites against `drawPixelSprite`.

## 0.4.2

### Added

- Added `scripts/verify-package-exports.mjs` to validate imports from the packed tarball: root, `audio`, `audio-arcade`, and `package.json`.
- Wired the exports smoke test into CI after `pnpm run build` and `npm pack --dry-run`.

### Changed

- Synchronized release metadata across `package.json`, README, changelog, site, and docs.
- Documented the initial public contract (Stable, Experimental, Legacy) without removing existing APIs.

## 0.4.1

### Changed

- Refreshed the home storytelling across English, Spanish, and Japanese to position the package more clearly as a product library.
- Redesigned the home footer with stronger release, navigation, and call-to-action blocks, then tightened its vertical footprint.
- Updated the README to match the shipped API, current workspace tooling, and the active `0.4.1` release narrative.

## 0.4.0

### Added

- Added the `grid-canvas-system/audio-arcade` subpath addon with retro sound effects, mute/volume controls, and lightweight looping 8-bit sequences.
- Added the `grid-canvas-system/audio` subpath addon with async `howler` and `tone` adapters for asset playback and generative music.
- Added build support for audio subpath bundles and published type declarations for both addons.
- Added vanilla audio demos plus automated coverage for the new audio APIs.

## 0.3.0

### Added

- Added `canvasToGrid()`, `gridToCanvas()`, and `snapPointToGrid()` runtime helpers for explicit grid/canvas coordinate conversion.
- Added `createPointerTracker()` for pointer position and down-state tracking relative to a target.
- Added unit coverage for grid coordinate helpers and pointer tracking.
- Documented the new runtime helpers in README and technical docs.

## 0.2.1

### Changed

- Improved npm package metadata with clearer positioning for small interactive Canvas scenes.
- Added package `exports` while keeping `main`, `module`, and `types` for compatibility.
- Marked the package as side-effect free for bundlers.
- Added CI for tests, visual snapshots, build, and package dry-run verification.
- Added project roadmap and innovation research docs.
- Added README badges and positioning guidance.

## 0.2.0

### Added

- Added `drawPixelSprite()` for declarative pixel-art sprites with strict palettes.
- Added `createSpriteAnimator()` and `createStateMachine()` runtime helpers.
- Added the `Grid Buddy` vanilla demo as an advanced showcase built on generic APIs.
- Added unit coverage and a visual snapshot for pixel sprites.

## 0.1.x

### Added

- Established the initial canvas/grid API, drawing primitives, HUD helpers, animation loop, keyboard input, motion helpers, simple collisions, particles, visual snapshots, and npm publishing workflow.
