# Changelog

All notable changes to `grid-canvas-system` are documented here.

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
