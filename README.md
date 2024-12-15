# Grid System for Canvas

This library allows you to create grids easily on an HTML5 canvas. The goal is to simplify the creation of a canvas with a grid that enables precise positioning of elements and keeps track of their coordinates.

Additionally, a function to draw a coordinate axis is included.

In my professional use, I have found this tool very useful for education and game development. Students or animators can position elements precisely and visualize their coordinates.

## Installation

To install the library, you can follow these steps:

### Installation via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/grid-canvas-system@0.0.1/dist/grid-canvas-system.umd.js"></script>
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
    <script src="https://cdn.jsdelivr.net/npm/grid-canvas-system@0.0.1/dist/grid-canvas-system.umd.js"></script>
  </head>

  <body>
    <canvas id="canvas"></canvas>
    <script>
      const newCanvas = new GridCanvasSystem("canvas");
    </script>
  </body>
</html>
```

### Usage with NPM

```js
import GridCanvasSystem from "grid-canvas-system";

const newCanvas = new GridCanvasSystem("canvas");
```

## Parameters

The library accepts the following parameters:

- `id`: The ID of the canvas where the grid will be drawn. (Required)
- `width`: The width of the canvas. (Optional, defaults to 400)
- `height`: The height of the canvas. (Optional, defaults to 400)

## Methods

The library has the following methods:

- `drawCoordinates()`: Draws a coordinate axis on the canvas.
