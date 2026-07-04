# Grid System for Canvas

[![npm version](https://img.shields.io/npm/v/grid-canvas-system.svg)](https://www.npmjs.com/package/grid-canvas-system)
[![CI](https://github.com/joshuacba08/grid-canvas-system/actions/workflows/ci.yml/badge.svg)](https://github.com/joshuacba08/grid-canvas-system/actions/workflows/ci.yml)
[![license](https://img.shields.io/npm/l/grid-canvas-system.svg)](https://www.npmjs.com/package/grid-canvas-system)

This library is a tiny canvas engine for grids, pixel art, sprites and playful interactive systems.

In addition to the grid itself, the library now includes reusable drawing helpers, pixel sprite rendering, coordinate labels, line primitives, circular sectors, Pac-Man, ghosts, projectiles, configurable spaceship shapes, persistent asteroid shapes, HUD-style overlays, grid coordinate helpers, collision/motion utilities, keyboard and pointer tracking, lightweight scene helpers, sprite animation, state machines, and an optional animation runtime.

In my professional use, I have found this tool very useful for education and game development. Students or animators can position elements precisely and visualize their coordinates.

## Installation

To install the library, you can follow these steps:

### Installation via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/grid-canvas-system/dist/grid-canvas-system.umd.js"></script>
```

### Installation with NPM

```bash
npm install grid-canvas-system
```

### Installation with pnpm

```bash
pnpm install grid-canvas-system
```

## Usage

To use the library, you can follow these steps:

### Usage with CDN

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Canvas System</title>
  </head>

  <body>
    <canvas id="canvas"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/grid-canvas-system/dist/grid-canvas-system.umd.js"></script>
    <script>
      const newCanvas = new GridCanvasSystem("canvas");
      newCanvas.drawCoordinate(25, 60);
    </script>
  </body>
</html>
```

### Usage with NPM

```js
import GridCanvasSystem from "grid-canvas-system";

const newCanvas = new GridCanvasSystem("canvas");
```

## Layers

The library is now organized around three simple layers:

1. Core canvas layer: initialization, DOM validation, sizing, HiDPI setup, `canvas`, `ctx`, and `options`.
2. Drawing layer: grid configuration plus reusable drawing methods like `drawPixelSprite()`, `drawPacman()`, `drawShip()`, `drawProjectile()`, and HUD-style overlays.
3. Optional runtime layer: animation, sprite animation, state machines, input, grid coordinate conversion, simple physics, and scene helpers through `GridCanvasSystem.runtime`.

### Usage with options

```js
import GridCanvasSystem from "grid-canvas-system";

const newCanvas = new GridCanvasSystem("canvas", {
  width: 800,
  height: 500,
  backgroundColor: "#101820",
  gridColor: "#5eead4",
  gridLabelColor: "#5eead4",
  coordinateLabelColor: "#ccfbf1",
  gridLabelFont: "11px monospace",
  coordinateFont: "13px serif",
  gridLabelTextAlign: "start",
  coordinateTextAlign: "end",
  gridLabelTextBaseline: "alphabetic",
  coordinateTextBaseline: "top",
  cellSize: 20,
  majorStep: 100,
  minorLineWidth: 0.5,
  majorLineWidth: 1.25,
  devicePixelRatio: window.devicePixelRatio,
});
```

### Preferred encapsulated usage

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 800,
  height: 500,
});

grid.drawPolyline(
  [
    { x: 100, y: 200 },
    { x: 120, y: 300 },
    { x: 250, y: 150 },
  ],
  {
    color: "#ffffff",
    lineWidth: 2,
  },
);

grid.drawCoordinate(100, 200);
grid.drawCoordinate(120, 300);
grid.drawCoordinate(250, 150);
```

### Pixel art example

`drawPixelSprite()` draws declarative pixel art at absolute canvas coordinates. It is strict by design: rows must have the same length, `pixelSize` must be positive, and every sprite character must exist in the palette.

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 200,
  height: 160,
});

grid.drawPixelSprite(
  ["00111100", "01122110", "11222211", "12233221", "11222211", "01111110", "00100100"],
  {
    x: 60,
    y: 45,
    pixelSize: 10,
    palette: {
      0: "transparent",
      1: "#38bdf8",
      2: "#f8fafc",
      3: "#0f172a",
    },
  },
);
```

### Pac-Man example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 220,
  height: 220,
});

grid.drawPacman(110, 110, 70, 1, {
  fillColor: "#FFFF00",
  strokeColor: "#000000",
  lineWidth: 2,
});
```

### Spaceship example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 240,
  height: 240,
});

grid.drawShip({ x: 120, y: 120 }, 70, {
  rotation: -Math.PI / 2,
  curve1: 0.45,
  curve2: 0.8,
  guide: true,
});
```

### Asteroid example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 260,
  height: 260,
});

const shape = grid.createAsteroidShape(14);

grid.drawAsteroid({ x: 130, y: 130 }, 75, shape, {
  noise: 0.4,
  rotation: Math.PI / 10,
  guide: true,
});
```

### Ghost example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 240,
  height: 240,
});

grid.drawGhost({ x: 120, y: 130 }, 70, {
  feet: 5,
  fillColor: "#ff0000",
  strokeColor: "#ffffff",
});
```

### HUD example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 320,
  height: 180,
});

grid.drawShip({ x: 160, y: 112 }, 38, {
  rotation: -Math.PI / 2,
  curve1: 0.45,
  curve2: 0.8,
  thruster: true,
});

grid.drawBarIndicator("health", 8, 8, 110, 12, 78, 100);
grid.drawValueLabel("score", 2450, 312, 18, {
  textAlign: "end",
});
grid.drawMessage("GAME OVER", "Press space to play again", { x: 160, y: 62 });
```

### Runtime example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 420,
  height: 260,
});
const body = new GridCanvasSystem.runtime.MassBody({
  x: 210,
  y: 130,
  mass: 10,
  radius: 20,
});
const keys = GridCanvasSystem.runtime.createKeyTracker(grid.canvas, {
  autoFocus: true,
  preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
});
let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    time += elapsed;

    if (keys.isPressed("ArrowLeft")) body.angle -= Math.PI * 1.5 * elapsed;
    if (keys.isPressed("ArrowRight")) body.angle += Math.PI * 1.5 * elapsed;
    if (keys.isPressed("ArrowUp")) body.push(body.angle, 1200, elapsed);

    body.update(elapsed, {
      width: grid.options.width,
      height: grid.options.height,
    });
  },
  draw() {
    grid.clearCanvas();
    grid.drawPacman(
      body.x,
      body.y,
      body.radius,
      GridCanvasSystem.runtime.oscillate01(time, 2),
      {
        direction: body.angle,
      },
    );
  },
});
```

### Sprite animation and state machine example

```js
import GridCanvasSystem from "grid-canvas-system";

const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  animations: {
    idle: ["idle-1", "idle-2"],
    happy: ["happy-1", "happy-2"],
  },
  initial: "idle",
  fps: 6,
});

const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: {
    idle: ["happy"],
    happy: ["idle"],
  },
});

machine.transition("happy");
animator.play(machine.getState());
animator.update(1 / 60);

const frame = animator.getFrame();
```

### Grid coordinate helpers example

The drawing API uses absolute canvas coordinates. The runtime helpers make grid-cell conversion explicit when you want tile-like logic.

```js
import GridCanvasSystem from "grid-canvas-system";

const options = {
  cellSize: 20,
  origin: { x: 0, y: 0 },
};

const cell = GridCanvasSystem.runtime.canvasToGrid({ x: 42, y: 58 }, options);
// { column: 2, row: 2 }

const topLeft = GridCanvasSystem.runtime.gridToCanvas({ column: 2, row: 2 }, options);
// { x: 40, y: 40 }

const snapped = GridCanvasSystem.runtime.snapPointToGrid({ x: 42, y: 58 }, options);
// { x: 40, y: 40 }
```

### Pointer tracker example

```js
import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 320,
  height: 220,
});
const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas, {
  preventDefault: true,
});

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  draw() {
    grid.clearCanvas();

    const position = pointer.position();

    if (position !== null) {
      grid.drawCoordinate(position.x, position.y);
    }
  },
});
```

### Collision helpers example

```js
import GridCanvasSystem from "grid-canvas-system";

const pointHitsGhost = GridCanvasSystem.runtime.hitTestPoint(
  { x: 120, y: 130 },
  { x: 120, y: 130, radius: 24 },
);

const rectanglesOverlap = GridCanvasSystem.runtime.hitTestRectangle(
  { x: 20, y: 20, width: 40, height: 30 },
  { x: 50, y: 30, width: 60, height: 20 },
);

const shipTouchesWall = GridCanvasSystem.runtime.hitTestCircleRectangle(
  { x: 110, y: 110, radius: 18 },
  { x: 140, y: 80, width: 30, height: 80 },
);
```

### Scene helpers example

```js
import GridCanvasSystem from "grid-canvas-system";

let trail = [];

trail = GridCanvasSystem.runtime.appendTrailPoint(trail, { x: 140, y: 90 }, 12);

const particles = GridCanvasSystem.runtime.createParticleBurst({ x: 140, y: 90 }, 6, {
  angle: -Math.PI / 2,
  spread: Math.PI / 3,
  speed: 90,
  life: 0.8,
  size: 3,
});

const nextParticles = GridCanvasSystem.runtime.stepParticles(particles, 1 / 60, {
  gravityY: 40,
  drag: 0.15,
});

const hudSlots = GridCanvasSystem.runtime.layoutStack(
  { x: 312, y: 12 },
  [
    { width: 92, height: 16 },
    { width: 70, height: 16 },
  ],
  {
    align: "end",
    gap: 8,
  },
);
```

## Documentation

- [Documentation index](./docs/README.md)
- [Technical study](./docs/ESTUDIO_TECNICO.md)
- [Findings and improvements](./docs/HALLAZGOS_Y_MEJORAS.md)
- [Innovation and scaling research](./docs/INVESTIGACION_INNOVACION_ESCALADO.md)
- [Changelog](./CHANGELOG.md)

## Parameters

The library accepts the following parameters:

- `id`: The ID of the canvas where the grid will be drawn. (Required)
- `width`: The width of the canvas. (Optional, defaults to `400`)
- `height`: The height of the canvas. (Optional, defaults to `400`)
- `options`: Optional configuration object for styles, spacing, and HiDPI behavior.

Available options:

- `width`: Logical canvas width in CSS pixels. Defaults to `400`.
- `height`: Logical canvas height in CSS pixels. Defaults to `400`.
- `backgroundColor`: Canvas background color. Defaults to `#000000`.
- `gridColor`: Grid line color. Defaults to `#00FF00`.
- `gridLabelColor`: Grid label text color. Defaults to `#009900`.
- `coordinateLabelColor`: Coordinate label text color. Defaults to `#009900`.
- `labelColor`: Legacy alias that applies the same color to both kinds of labels.
- `gridLabelFont`: Grid label font. Defaults to `10px sans-serif`.
- `coordinateFont`: Coordinate label font. Defaults to `10px sans-serif`.
- `font`: Legacy alias that applies the same font to both kinds of labels.
- `gridLabelTextAlign`: Grid label alignment. Defaults to `start`.
- `coordinateTextAlign`: Default alignment for `drawCoordinate()`, `drawText()`, and text-based overlay helpers. Defaults to `start`.
- `gridLabelTextBaseline`: Grid label baseline. Defaults to `alphabetic`.
- `coordinateTextBaseline`: Default baseline for `drawCoordinate()`, `drawText()`, and text-based overlay helpers. Defaults to `alphabetic`.
- `cellSize`: Space between grid lines. Defaults to `10`.
- `majorStep`: Distance between emphasized lines and numeric labels. Defaults to `50`.
- `minorLineWidth`: Width of regular grid lines. Defaults to `0.25`.
- `majorLineWidth`: Width of emphasized grid lines. Defaults to `0.5`.
- `devicePixelRatio`: Pixel ratio used for HiDPI rendering. Defaults to `window.devicePixelRatio` when available.

The constructor throws an error when:

- the element does not exist;
- the element exists but is not a `canvas`;
- the 2D context cannot be created;
- `width` or `height` are invalid values;
- numeric options such as `cellSize` or `majorStep` are invalid;
- `majorStep` is not a multiple of `cellSize`.

## Methods

The library has the following methods:

- `drawText(text, x, y, options?)`: Draws text using the managed canvas state.
- `drawGhost(center, radius, options?)`: Draws a configurable ghost silhouette with optional feet and eyes.
- `drawProjectile(center, radius, life, options?)`: Draws a projectile with life-based default coloring.
- `polarToCartesian(center, radius, angle)`: Converts polar coordinates into a canvas point.
- `createAsteroidShape(segments, random?)`: Creates persistent asteroid shape data that can be reused across renders.
- `drawCircleSector(center, radius, startAngle, endAngle, options?)`: Draws a filled sector or wedge shape.
- `drawPacman(x, y, radius, mouthOpen, options?)`: Draws a Pac-Man shape over the managed grid.
- `drawAsteroid(center, radius, shape, options?)`: Draws a configurable asteroid from persisted shape data.
- `drawShip(center, radius, options?)`: Draws a configurable spaceship with optional guide overlays, rotation, and thruster flame.
- `drawValueLabel(label, value, x, y, options?)`: Draws a formatted numeric label for score, fps, level, or similar overlays.
- `drawBarIndicator(label, x, y, width, height, value, max, options?)`: Draws a label plus a proportional status bar.
- `drawMessage(mainText, subText, center, options?)`: Draws a two-line centered message overlay.
- `drawPixelSprite(sprite, options)`: Draws matrix/string-based pixel art with a strict palette and absolute canvas coordinates.
- `drawLine(start, end, options?)`: Draws a line without manipulating `ctx` directly.
- `drawPolyline(points, options?)`: Draws a polyline or closed path through a high-level API.
- `drawCoordinate(x, y, options?)`: Draws the coordinate label at the provided position.
- `clearCanvas(options?)`: Clears the canvas and can optionally skip redrawing the grid for animation-oriented flows.

## Runtime And Utilities

Static utilities exposed on the optional runtime layer `GridCanvasSystem.runtime`:

- `createAnimationLoop(options)`: Lightweight `requestAnimationFrame` loop with elapsed seconds.
- `createSpriteAnimator(options)`: Pure sprite animation helper that advances frame IDs by elapsed seconds.
- `createStateMachine(options)`: Small finite state machine helper with boolean transition results.
- `MassBody`: Reusable physics/movement body with `update`, `push`, `twist`, `speed`, and `movementAngle`.
- `createKeyTracker(target, options?)`: Tracks pressed keys on a specific target.
- `createPointerTracker(target, options?)`: Tracks pointer position and down state relative to a target.
- `canvasToGrid(point, options)`: Converts absolute canvas coordinates into `{ column, row }`.
- `gridToCanvas(cell, options)`: Converts a grid cell into its top-left absolute canvas point.
- `snapPointToGrid(point, options)`: Snaps a canvas point to the top-left of its containing grid cell.
- `appendTrailPoint(trail, point, maxPoints)`: Keeps a bounded point trail without mutating the original array.
- `createParticleBurst(origin, count, options?)`: Creates a simple particle burst with angle, spread, speed, size, and lifetime controls.
- `hitTestPoint(point, target)`: Checks a point against either a circle or an axis-aligned rectangle.
- `hitTestRectangle(a, b)`: Checks overlap between two axis-aligned rectangles.
- `hitTestCircleRectangle(circle, rectangle)`: Checks a circle against an axis-aligned rectangle.
- `layoutStack(origin, itemSizes, options?)`: Computes reusable positions for vertical or horizontal overlay stacks.
- `normalizeKeyIdentifier(key)`: Normalizes modern keys and legacy key codes.
- `stepParticles(particles, elapsed, options?)`: Advances simple particles with optional gravity and drag.
- `vectorFromAngle(angle, magnitude?)`: Converts an angle and magnitude to `{ x, y }`.
- `angleToPoint(from, to)`: Calculates the angle from one point to another.
- `oscillate01(time, frequency?)`: Produces a 0..1 oscillation useful for repeated animation cycles.
- `distanceBetweenPoints(a, b)`: Calculates Euclidean distance.
- `circlesIntersect(a, b)`: Detects circular collision overlap.
- `wrapPoint(point, bounds, radius?)`: Applies wrap-around positioning inside rectangular bounds.

For backward compatibility, those helpers also remain mirrored as direct static properties on `GridCanvasSystem`.

## Advanced Usage

The preferred path for common drawing is the encapsulated API: `drawText`, `drawPixelSprite`, `drawGhost`, `drawProjectile`, `polarToCartesian`, `createAsteroidShape`, `drawCircleSector`, `drawPacman`, `drawAsteroid`, `drawShip`, `drawValueLabel`, `drawBarIndicator`, `drawMessage`, `drawLine`, `drawPolyline`, `drawCoordinate`, and `clearCanvas()`.

`canvas` and `ctx` remain intentionally exposed as advanced extension points.

- `canvas` lets you integrate the instance with DOM or sizing logic outside the library.
- `ctx` lets you draw your own shapes on top of the grid.
- Both references are treated as part of the supported public API.
- If you mutate the rendering context state directly, the visual result becomes your responsibility.

## Why not Phaser, PixiJS or Konva?

Those projects are excellent when you need a full game framework, a high-performance renderer, or an interactive object model. `grid-canvas-system` is intentionally smaller: it focuses on learning-friendly Canvas scenes, grids, pixel art, lightweight runtime helpers, and examples that can be read in minutes. The goal is not to replace larger engines, but to make small playful visual systems easy to build without adopting a heavy architecture.

## TypeScript

The package exports:

- `GridCanvasAsteroidOptions`
- `GridCanvasAsteroidShape`
- `GridCanvasBarIndicatorOptions`
- `GridCanvasClearOptions`
- `GridCanvasCircleSectorOptions`
- `GridCanvasGhostOptions`
- `GridCanvasAnimationLoop`
- `GridCanvasAnimationLoopOptions`
- `GridCanvasBounds`
- `GridCanvasCircleLike`
- `GridCanvasCollisionTarget`
- `GridCanvasGridCell`
- `GridCanvasGridOptions`
- `GridCanvasParticle`
- `GridCanvasParticleBurstOptions`
- `GridCanvasParticleStepOptions`
- `GridCanvasKeyTracker`
- `GridCanvasKeyTrackerOptions`
- `GridCanvasPointerTracker`
- `GridCanvasPointerTrackerOptions`
- `GridCanvasMassBodyOptions`
- `GridCanvasMessageOptions`
- `GridCanvasPacmanOptions`
- `GridCanvasPixelPalette`
- `GridCanvasPixelSprite`
- `GridCanvasPixelSpriteDrawOptions`
- `GridCanvasProjectileOptions`
- `GridCanvasRectangleLike`
- `GridCanvasShipOptions`
- `GridCanvasSize`
- `GridCanvasStackAlign`
- `GridCanvasStackDirection`
- `GridCanvasStackLayoutOptions`
- `GridCanvasSpriteAnimator`
- `GridCanvasSpriteAnimatorOptions`
- `GridCanvasStateMachine`
- `GridCanvasStateMachineOptions`
- `GridCanvasSystem`
- `GridCanvasPoint`
- `GridCanvasShapeOptions`
- `GridCanvasStrokeOptions`
- `GridCanvasPolylineOptions`
- `GridCanvasSystemOptions`
- `GridCanvasSystemResolvedOptions`
- `GridCanvasTextOptions`
- `GridCanvasValueLabelOptions`

## Testing

Format the complete workspace before running the test suite:

```bash
pnpm run format
pnpm run format:check
```

```bash
npm test
```

```bash
npm run test:visual
```

```bash
npm run test:visual:update
```

When a visual snapshot fails, the test runner now writes `expected`, `actual`, and `diff` PNG artifacts into `tests/__artifacts__/` to make regressions easier to inspect.

```bash
pnpm install --frozen-lockfile
pnpm test
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the development workflow, formatting
contract, and pull-request checklist.

## Examples

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Grid Canvas System</title>
  </head>

  <body>
    <canvas id="canvas"></canvas>
    <script src="https://cdn.jsdelivr.net/npm/grid-canvas-system/dist/grid-canvas-system.umd.js"></script>
    <script>
      const grid = new GridCanvasSystem("canvas");

      grid.drawPolyline(
        [
          { x: 100, y: 200 },
          { x: 120, y: 300 },
          { x: 250, y: 150 },
        ],
        {
          color: "#FFFFFF",
          lineWidth: 2,
        },
      );

      grid.drawCoordinate(100, 200);
      grid.drawCoordinate(120, 300);
      grid.drawCoordinate(250, 150);
    </script>
  </body>
</html>
```

See also:

- [Example setup and authoring guide](./docs/EXAMPLES.md)
- [Asteroid example](./examples/vanilla/asteroid/index.html)
- [Ghost example](./examples/vanilla/ghost/index.html)
- [Grid Buddy example](./examples/vanilla/grid-buddy/index.html)
- [HUD example](./examples/vanilla/hud/index.html)
- [Pac-Man example](./examples/vanilla/pacman/index.html)
- [Projectile example](./examples/vanilla/projectile/index.html)
- [Runtime example](./examples/vanilla/runtime/index.html)
- [Sprite animator and state machine example](./examples/vanilla/sprite-state/index.html)
- [Spaceship example](./examples/vanilla/spaceship/index.html)

### Output

Image preview
![image](https://i.ibb.co/jHRJn7k/image.png)

## Ideas

- Build reusable shapes like Pac-Man on top of `drawCircleSector()`.
- Add arcade overlays with `drawBarIndicator()`, `drawValueLabel()`, and `drawMessage()`.
- Draw declarative pixel characters with `drawPixelSprite()`.
- Combine `createSpriteAnimator()` and `createStateMachine()` for small reactive actors.
- Use Grid Buddy as a showcase for a Tamagotchi-like companion built on generic APIs, not as core pet logic.
- Convert between canvas points and grid cells with `canvasToGrid()`, `gridToCanvas()`, and `snapPointToGrid()`.
- Use `createPointerTracker()` for click, drag, hover, or tap-driven scenes without wiring raw DOM listeners each time.
- Generate persistent asteroid `shape` data once and redraw it with different `noise` values.
- Drive small scenes with `MassBody` plus `createAnimationLoop()` instead of hand-rolled timers.
- Reuse `polarToCartesian()` and `drawShip()` to prototype Asteroids-style actors.
- Use `drawProjectile()` together with `MassBody` or your own motion state for lightweight shooter prototypes.
- Use `createKeyTracker()` to scope keyboard input to the canvas instead of the whole page.
- Combine `drawPacman()` with loops or randomization to generate simple scenes.
- Use `clearCanvas({ redrawGrid: false })` as a simpler base for custom animation loops.
- Use the encapsulated API for most drawing, and drop to `ctx` only for advanced custom work.

## License

This project is licensed under the MIT License

## Author

- [Josue Oroya](https://www.linkedin.com/in/josue-oroya/)
