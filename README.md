# Grid System for Canvas

This library allows you to create managed grids on an HTML5 canvas and then draw on top of them through a small high-level API.

In addition to the grid itself, the library now includes reusable drawing helpers, coordinate labels, line primitives, circular sectors, Pac-Man, and a configurable spaceship shape.

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

grid.drawShip(
  { x: 120, y: 120 },
  70,
  {
    rotation: -Math.PI / 2,
    curve1: 0.45,
    curve2: 0.8,
    guide: true,
  },
);
```

## Documentation

- [Documentation index](./docs/README.md)
- [Technical study](./docs/ESTUDIO_TECNICO.md)
- [Findings and improvements](./docs/HALLAZGOS_Y_MEJORAS.md)

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
- `polarToCartesian(center, radius, angle)`: Converts polar coordinates into a canvas point.
- `drawCircleSector(center, radius, startAngle, endAngle, options?)`: Draws a filled sector or wedge shape.
- `drawPacman(x, y, radius, mouthOpen, options?)`: Draws a Pac-Man shape over the managed grid.
- `drawShip(center, radius, options?)`: Draws a configurable spaceship with optional guide overlays and rotation.
- `drawLine(start, end, options?)`: Draws a line without manipulating `ctx` directly.
- `drawPolyline(points, options?)`: Draws a polyline or closed path through a high-level API.
- `drawCoordinate(x, y, options?)`: Draws the coordinate label at the provided position.
- `clearCanvas()`: Clears the canvas.

## Advanced Usage

The preferred path for common drawing is the encapsulated API: `drawText`, `polarToCartesian`, `drawCircleSector`, `drawPacman`, `drawShip`, `drawLine`, `drawPolyline`, `drawCoordinate`, and `clearCanvas()`.

`canvas` and `ctx` remain intentionally exposed as advanced extension points.

- `canvas` lets you integrate the instance with DOM or sizing logic outside the library.
- `ctx` lets you draw your own shapes on top of the grid.
- Both references are treated as part of the supported public API.
- If you mutate the rendering context state directly, the visual result becomes your responsibility.

## TypeScript

The package exports:

- `GridCanvasCircleSectorOptions`
- `GridCanvasPacmanOptions`
- `GridCanvasShipOptions`
- `GridCanvasSystem`
- `GridCanvasPoint`
- `GridCanvasShapeOptions`
- `GridCanvasStrokeOptions`
- `GridCanvasPolylineOptions`
- `GridCanvasSystemOptions`
- `GridCanvasSystemResolvedOptions`
- `GridCanvasTextOptions`

## Testing

```bash
npm test
```

```bash
npm run test:visual
```

```bash
npm run test:visual:update
```

```bash
pnpm install --frozen-lockfile
pnpm test
```

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
        }
      );

      grid.drawCoordinate(100, 200);
      grid.drawCoordinate(120, 300);
      grid.drawCoordinate(250, 150);
    </script>
  </body>
</html>
```

See also:

- [Pac-Man example](./examples/vanilla/pacman/index.html)
- [Spaceship example](./examples/vanilla/spaceship/index.html)

### Output

Image preview
![image](https://i.ibb.co/jHRJn7k/image.png)

## Ideas

- Build reusable shapes like Pac-Man on top of `drawCircleSector()`.
- Reuse `polarToCartesian()` and `drawShip()` to prototype Asteroids-style actors.
- Combine `drawPacman()` with loops or randomization to generate simple scenes.
- Use the encapsulated API for most drawing, and drop to `ctx` only for advanced custom work.

## License

This project is licensed under the MIT License

## Author

- [Josue Oroya](https://www.linkedin.com/in/josue-oroya/)
