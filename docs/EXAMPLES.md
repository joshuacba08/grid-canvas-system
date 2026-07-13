# Running the examples

The `examples/vanilla` directory contains framework-free HTML demos. Each example
imports the local ESM bundle from `dist`, so build the library before opening them.

## Start locally

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm dev
```

The `audio` example also needs the optional peer dependencies:

```bash
pnpm add tone howler
```

Vite prints the local URL, usually `http://localhost:5173`. Open an example through
that server instead of double-clicking the HTML file:

```text
http://localhost:5173/examples/vanilla/sprite-state/
http://localhost:5173/examples/vanilla/sprite-v2/
http://localhost:5173/examples/vanilla/collisions/
http://localhost:5173/examples/vanilla/runtime/
http://localhost:5173/examples/vanilla/interactive-character/
http://localhost:5173/examples/vanilla/tilemap-scene/
http://localhost:5173/examples/vanilla/grid-buddy/
http://localhost:5173/examples/vanilla/audio-arcade/
http://localhost:5173/examples/vanilla/audio/
```

Re-run `pnpm build` after changing library source. Vite serves the example files, but
it does not rebuild the package bundle used by them.

## Example map

| Example                        | Focus                                                    |
| ------------------------------ | -------------------------------------------------------- |
| `sprite-state`                 | Minimal sprite, animator, and state-machine composition  |
| `sprite-v2`                    | Compiled sprites, transforms, tinting, bounds and hits   |
| `collisions`                   | Keyboard/touch movement and collision response           |
| `runtime`                      | Animation loop, keyboard input, and `MassBody` motion    |
| `interactive-character`        | Canvas runtime, DPR, resize, pointer and cleanup flow    |
| `tilemap-scene`                | Fixed-step loop, scene manager and tilemap collisions    |
| `grid-buddy`                   | Advanced multi-state showcase with stats and persistence |
| `audio-arcade`                 | Built-in retro SFX and lightweight 8-bit loop presets    |
| `audio`                        | Optional `howler` asset playback and `tone` music        |
| `hud`                          | Labels, bars, and centered messages                      |
| `pacman`, `ghost`, `spaceship` | Individual arcade drawing primitives                     |
| `asteroid`, `projectile`       | Reusable shapes and animated projectiles                 |
| `drawLines`                    | Lines, polylines, and coordinate labels                  |

The documentation website has a separate Monaco-based Playground with editable
examples:

```bash
pnpm run site:dev
```

Then open `http://localhost:4321/playground/`.

## Adding an example

Create `examples/vanilla/<name>/index.html` and keep it self-contained. Import the
local bundle with:

```js
import GridCanvasSystem from "../../../dist/grid-canvas-system.es.js";
```

Use semantic controls, provide short visible instructions for interaction, and keep
the example focused on one concept. Add it to the map above and the README example
list. Advanced product-like behavior belongs in a showcase; foundational APIs should
also have a smaller teaching example.
