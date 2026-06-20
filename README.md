# Grid System for Canvas

This library allows you to create grids easily on an HTML5 canvas. The goal is to simplify the creation of a canvas with a grid that enables precise positioning of elements and keeps track of their coordinates.

Additionally, a function to draw a coordinate axis is included.

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

- `drawCoordinate(x, y)`: Draws the coordinate label at the provided position.
- `clearCanvas()`: Clears the canvas.

## Advanced Usage

`canvas` and `ctx` are intentionally exposed as advanced extension points.

- `canvas` lets you integrate the instance with DOM or sizing logic outside the library.
- `ctx` lets you draw your own shapes on top of the grid.
- Both references are treated as part of the supported public API.
- If you mutate the rendering context state directly, the visual result becomes your responsibility.

## TypeScript

The package exports:

- `GridCanvasSystem`
- `GridCanvasSystemOptions`
- `GridCanvasSystemResolvedOptions`

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
      const newCanvas = new GridCanvasSystem("canvas");
      const { canvas, ctx } = newCanvas;

      ctx.beginPath();

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFFFFF";

      ctx.moveTo(100, 200);
      newCanvas.drawCoordinate(100, 200);

      ctx.lineTo(120, 300);
      newCanvas.drawCoordinate(120, 300);

      ctx.lineTo(250, 150);
      newCanvas.drawCoordinate(250, 150);

      ctx.closePath();

      ctx.stroke();
    </script>
  </body>
</html>
```

### Output

Image preview
![image](https://i.ibb.co/jHRJn7k/image.png)

## License

This project is licensed under the MIT License

## Author

- [Josue Oroya](https://www.linkedin.com/in/josue-oroya/)
