# Investigacion para innovar y escalar `grid-canvas-system`

Fecha: 2026-07-04

## Resumen ejecutivo

`grid-canvas-system` no deberia intentar competir como otro Phaser, PixiJS, Konva o Fabric. La oportunidad mas clara esta en una posicion mas pequena y diferenciada:

> Un micro engine educativo y ludico para Canvas, grid-first, TypeScript-first, cero dependencias runtime, con pixel art, escenas pequenas, animacion determinista y ejemplos faciles de leer.

El valor no esta en tener todos los features de un game engine grande. Esta en que una persona pueda abrir un HTML, crear una grilla, dibujar sprites pixelados, animarlos, reaccionar a input y aprender como funciona un sistema visual vivo sin entrar a una arquitectura pesada.

La libreria ya tiene una base solida:

- Version publicada: `0.2.0`.
- Cero dependencias runtime.
- Bundle actual: `grid-canvas-system.es.js` cerca de 40.6 kB, UMD cerca de 30.0 kB.
- Paquete npm: cerca de 34.9 kB comprimido y 140.2 kB descomprimido.
- API actual: canvas/grid, drawing helpers, pixel sprites, HUD, animation loop, keyboard input, motion, collisions, particles, sprite animator, state machine.
- Tests actuales: unitarios, runtime y snapshots visuales.
- Publicacion npm por GitHub Actions con trusted publishing/OIDC.

La siguiente etapa debe enfocarse en hacer la libreria mas facil de adoptar, mas expresiva para experiencias visuales pequenas y mas robusta como paquete publicado.

## Estado actual observado

### Fortalezas

- API pequena y entendible.
- Contrato publico claro para `canvas`, `ctx` y `options`.
- Buen patron de crecimiento aditivo: cada helper nuevo vive en la capa adecuada.
- Tests visuales reales con snapshots PNG.
- Runtime ligero separado de dibujo.
- `Grid Buddy` demuestra una direccion atractiva sin contaminar el core.
- Publicacion automatizada por tags `v*` y validacion tag/version.

### Debilidades

- `package.json` todavia describe la libreria como "A library for creating canvas-based grids", lo que subvende la propuesta actual.
- No hay campo `exports`, por lo que el paquete aun depende de `main`, `module` y `types` clasicos.
- No hay workflow de CI para push/PR; solo hay publish en tag.
- No hay changelog ni release notes versionadas.
- Los ejemplos importan desde `dist`, lo que exige build local antes de abrirlos.
- Los ejemplos no estan incluidos en `files`, asi que npm publica `dist` y `docs`, pero no la galeria de ejemplos.
- Falta API de pointer/touch/mouse, aunque PixiJS y Konva muestran que interaccion e hit testing son parte central del valor en Canvas interactivo.
- Falta capa de escenas/camara/layers, pero debe agregarse con cuidado para no convertirse en un engine grande.
- Falta pipeline de assets o manifest simple para sprites, JSON e imagenes.
- Falta medicion de performance y benchmark minimo para cambios de render.

## Mapa competitivo

### PixiJS

PixiJS esta orientado a render de alto rendimiento con scene graph, containers, assets, sprites, eventos y ecosistema amplio. Sus docs destacan `Container` como base del scene graph y su sistema de assets como promesa/cache-aware/extensible. Tambien tiene eventos pointer/touch con hit testing y modos de interaccion.

Lectura para `grid-canvas-system`:

- Adoptar ideas pequenas, no la escala completa.
- Si se agrega escena, que sea "object-lite", no un scene graph profundo.
- Si se agregan assets, que sea un manifest simple para JSON/sprites/paletas.
- El input pointer deberia ser un helper neutral y testeable.

### Phaser

Phaser es un framework de juegos completo. Su Arcade Physics World gestiona cuerpos, colisiones, eventos y usa RTree para broad-phase collision. Esto es mucho mas grande que lo que conviene en esta libreria hoy.

Lectura para `grid-canvas-system`:

- No copiar Arcade Physics.
- Si se agrega broad-phase, empezar por una spatial grid simple, coherente con el nombre del proyecto.
- Mantener colisiones como helpers puros antes de crear un mundo fisico.

### Konva

Konva ofrece object model sobre Canvas: shapes, groups, eventos, drag, animacion, hit detection, state management e integraciones oficiales con React, Vue, Svelte y Angular.

Lectura para `grid-canvas-system`:

- No competir como editor/object model.
- Si se agrega interaccion, evitar objetos mutables complejos.
- Si se agregan wrappers de framework, que sean adaptadores opcionales despues de estabilizar core.

### Fabric.js

Fabric se enfoca en object model, interacciones, reordenamiento, serializacion/deserializacion y export a JSON/SVG/imagen.

Lectura para `grid-canvas-system`:

- La serializacion es valiosa, pero aqui deberia empezar con formatos simples: pixel sprites, tilemaps, escenas declarativas.
- No conviene agregar edicion visual tipo Fabric en el core.

### Excalibur

Excalibur se posiciona como game engine TypeScript "batteries included" para juegos 2D web. Tiene filosofia de sensible defaults y engine completo.

Lectura para `grid-canvas-system`:

- El diferencial no es "batteries included"; es "small batteries you can understand".
- Debe seguir siendo apto para educacion y ejemplos embebidos.

### p5.js

p5.js gana por comunidad, educacion, creatividad y accesibilidad. Su pagina se define como herramienta amigable para aprender a programar y hacer arte.

Lectura para `grid-canvas-system`:

- Hay espacio para una narrativa educativa.
- La documentacion deberia tener recetas y ejemplos guiados, no solo referencia API.
- El enfoque grid/pixel-art puede ser una puerta de entrada mas concreta que canvas libre.

## Oportunidad estrategica

### Posicionamiento recomendado

Tagline:

> A tiny TypeScript canvas engine for grids, pixel art, sprites and playful interactive systems.

Descripcion npm:

> Build small interactive Canvas scenes with grids, pixel art, sprites, animation, input, collisions and lightweight runtime helpers.

### Publico objetivo

- Docentes y estudiantes aprendiendo Canvas, coordenadas, animacion y colisiones.
- Devs frontend que quieren agregar una escena visual pequena sin meter Phaser/Pixi.
- Personas construyendo mascotas, avatares, HUDs, visualizaciones ludicas o mini demos.
- Makers que quieren pixel art programatico y escenas embebidas.

### No-publico objetivo

- Juegos grandes con assets complejos, sonido, tilemaps avanzados y fisica completa.
- Editores visuales tipo whiteboard o Canva.
- Renderers WebGL/WebGPU de alta performance.
- Apps que necesitan scene graph completo y framework bindings maduros desde el inicio.

## Pilares de producto

### 1. Core pequeno y estable

Todo feature nuevo debe pasar esta pregunta:

> Sirve para multiples experiencias visuales pequenas sin meter una opinion de producto cerrada?

Si la respuesta es no, va a ejemplos o demos.

### 2. APIs puras antes que objetos pesados

El patron actual funciona bien:

- Helpers puros en runtime.
- Dibujo encapsulado en la instancia.
- Demos que componen piezas.

Debe mantenerse.

### 3. Grid-first real

La libreria deberia aprovechar su nombre:

- Conversion canvas <-> grid.
- Snap a celda.
- Tilemaps simples.
- Spatial grid para broad-phase.
- Ejemplos de pathfinding, cellular automata, snake, pacman-like maze.

### 4. Pixel art como identidad visual

`drawPixelSprite()` abre una via clara. El siguiente salto no es solo mas sprites, sino herramientas:

- `compilePixelSprite()` para cache/render mas eficiente.
- Paletas reutilizables.
- Transformaciones basicas: flipX, flipY, scale, opacity.
- Sprites declarativos versionables.
- Export de sprite a image data o data URL.

### 5. Determinismo y aprendizaje

La libreria puede diferenciarse con ejemplos reproducibles:

- Fixed timestep.
- Seeded random.
- Replay de input.
- Estado serializable.
- Snapshots visuales.

Esto conecta con educacion, testing y demos confiables.

### 6. Performance progresiva

No hace falta WebGL. Si la libreria sigue en Canvas 2D, puede escalar con:

- Dirty rectangles.
- Render cache por sprite.
- OffscreenCanvas cuando exista soporte.
- Batching simple de `fillRect` por color para pixel art.
- Benchmarks de render por escenario.

MDN documenta que `OffscreenCanvas` permite renderizar fuera del DOM y usar workers para evitar trabajo pesado en el main thread, asi que debe tratarse como mejora progresiva, no requisito base.

## Gaps tecnicos priorizados

### P0: Empaquetado y adopcion

1. Actualizar `description` y `keywords`.
2. Agregar `exports` con entrada principal y tipos.
3. Agregar `sideEffects: false` si se valida que el paquete no ejecuta efectos al importar.
4. Agregar workflow `ci.yml` para `npm test`, `npm run test:visual` y `npm run build` en push/PR.
5. Agregar `CHANGELOG.md`.
6. Agregar README badges: npm version, CI, license.
7. Decidir si `examples/` debe publicarse en npm o solo en GitHub/GitHub Pages.

### P1: API grid/input

1. `canvasToGrid(point, options?)`.
2. `gridToCanvas(cell, options?)`.
3. `snapPointToGrid(point, options?)`.
4. `createPointerTracker(canvas, options?)`.
5. `hitTestPixelSprite(point, sprite, options?)` o helper equivalente.

Estos features desbloquean editores pequenos, demos tactiles, mascotas reactivas y juegos simples.

### P1: Sprite pipeline

1. `compilePixelSprite(sprite, palette)` para validar una vez.
2. `drawCompiledPixelSprite(compiled, options)`.
3. Batching por color para reducir cambios de `fillStyle`.
4. `flipX`, `flipY`, `opacity`.
5. Paletas oficiales: `arcade`, `terminal`, `buddy`, `pastel`, `mono`.

### P2: Runtime de escenas

Agregar una capa minima, no un engine completo:

```ts
const scene = createScene({
  update(elapsed) {},
  draw(grid) {},
  enter?() {},
  exit?() {}
});

const scenes = createSceneManager({
  initial: "menu",
  scenes: { menu, game, pause }
});
```

Debe seguir siendo opcional y puro.

### P2: Camara y layers

1. `createCamera({ x, y, zoom })`.
2. Helpers para world <-> screen.
3. `withCamera(grid, camera, render)`.
4. Layers conceptuales en demos, no necesariamente multiples canvas al inicio.

### P2: Tilemaps

1. `drawTileMap(map, tileset, options)`.
2. `getTileAt(point)`.
3. `tileToBounds(cell)`.
4. Collision helpers para tiles solidos.

Esto conecta directamente con grillas, pixel art y mini juegos.

### P3: Performance y worker path

1. Benchmark script con escenarios: grid, pixel sprite, particles, tilemap.
2. Medir FPS/tiempo de frame con `performance.now()`.
3. Investigar `OffscreenCanvas` como feature detect:

```ts
const supportsOffscreen = typeof OffscreenCanvas !== "undefined";
```

4. No mover el core a workers. Ofrecer helpers o docs para casos pesados.

### P3: Galeria y docs

1. Publicar ejemplos con GitHub Pages.
2. Crear pagina simple "Examples Gallery".
3. Agregar recetas:
   - Pixel sprite.
   - Keyboard movement.
   - Pointer interaction.
   - State machine.
   - Grid Buddy.
   - Snake.
   - Cellular automata.
   - Pathfinding.
4. Agregar "Why not Phaser/Pixi/Konva?" en README o docs.

## Roadmap recomendado

### Fase 1: Pulir paquete y descubrimiento

Objetivo: que la libreria se vea seria y facil de adoptar.

Tareas:

- Actualizar `package.json` metadata.
- Agregar `exports`.
- Agregar CI de test/build en push/PR.
- Agregar changelog.
- Agregar badges.
- Agregar docs de release.
- Revisar `npm pack --dry-run` en CI o script.

Entrega esperada: `v0.2.1` o `v0.3.0` segun alcance.

### Fase 2: Hacer la grilla realmente util

Objetivo: convertir el grid en API productiva, no solo fondo visual.

Tareas:

- Helpers canvas/grid/snap.
- Pointer tracker.
- Hit testing para sprites o rectangulos basados en celda.
- Ejemplo `pointer-grid`.
- Tests unitarios y visuales.

Entrega esperada: `v0.3.0`.

### Fase 3: Pixel art y sprites v2

Objetivo: convertir pixel art en identidad fuerte.

Tareas:

- `compilePixelSprite`.
- `drawCompiledPixelSprite`.
- Flip/opacity.
- Paletas reutilizables.
- Ejemplo `pixel-lab`.
- Benchmark de sprite rendering.

Entrega esperada: `v0.4.0`.

### Fase 4: Mini scene runtime

Objetivo: organizar demos y juegos pequenos sin framework pesado.

Tareas:

- `createScene`.
- `createSceneManager`.
- Fixed timestep opcional.
- Seeded random.
- Demo `snake` o `cellular-automata`.

Entrega esperada: `v0.5.0`.

### Fase 5: Tilemaps y juegos de grilla

Objetivo: desbloquear mini juegos y simulaciones grid-first.

Tareas:

- `drawTileMap`.
- Tile collision helpers.
- Simple maze/pathfinding demo.
- Upgrade de Pac-Man demo hacia un maze real.

Entrega esperada: `v0.6.0`.

### Fase 6: Galeria publica y adopcion

Objetivo: que el proyecto sea descubrible y convincente.

Tareas:

- GitHub Pages o docs site simple.
- Galeria visual de ejemplos.
- GIF/PNG preview por ejemplo.
- "Copy-paste starter" para CDN y npm.
- Release notes con screenshots.

Entrega esperada: crecimiento de usuarios, no solo features.

## Primeros 10 PRs recomendados

Estado: los primeros cinco bloques ya quedaron implementados entre `0.2.1` y `0.3.0`.

1. `[done] chore: improve package metadata and exports`
2. `[done] ci: add test and build workflow`
3. `[done] docs: add changelog and roadmap`
4. `[done] feat: add grid coordinate helpers`
5. `[done] feat: add pointer tracker`
6. `feat: add compiled pixel sprites`
7. `feat: add palette utilities`
8. `feat: add fixed-step loop helper`
9. `feat: add scene manager`
10. `docs: add examples gallery`

## APIs candidatas

### Grid helpers

Implementado en `0.3.0`.

```ts
GridCanvasSystem.runtime.canvasToGrid(
  { x: 42, y: 58 },
  { cellSize: 20 }
);

GridCanvasSystem.runtime.gridToCanvas(
  { column: 2, row: 3 },
  { cellSize: 20 }
);

GridCanvasSystem.runtime.snapPointToGrid(
  { x: 42, y: 58 },
  { cellSize: 20 }
);
```

### Pointer tracker

Implementado en `0.3.0`.

```ts
const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas, {
  preventDefault: true
});

pointer.position();
pointer.isDown();
pointer.destroy();
```

### Compiled pixel sprite

```ts
const blob = GridCanvasSystem.runtime.compilePixelSprite(sprite, palette);

grid.drawCompiledPixelSprite(blob, {
  x: 60,
  y: 45,
  pixelSize: 8,
  flipX: true
});
```

### Scene manager

```ts
const manager = GridCanvasSystem.runtime.createSceneManager({
  initial: "buddy",
  scenes: {
    buddy: {
      update(elapsed) {},
      draw(grid) {}
    }
  }
});
```

## Criterios de aceptacion para escalar

Antes de meter un feature al core:

- Debe servir a por lo menos 3 ejemplos distintos.
- Debe poder testearse sin navegador real o con snapshot visual estable.
- Debe mantener cero dependencias runtime salvo decision explicita.
- Debe tener nombres genericos, no nombres de mascota/juego especifico.
- Debe documentarse con un snippet minimo.
- Debe ser compatible con la API `0.x` existente salvo cambio deliberado.

## Metricas recomendadas

Tecnicas:

- Bundle ESM bajo 60 kB mientras se pueda.
- Package comprimido bajo 75 kB en fase `0.x`.
- Mantener cero dependencias runtime.
- `npm test`, `npm run test:visual` y `npm run build` en CI.
- Cada primitive visual relevante con snapshot.

Producto:

- 10 ejemplos oficiales.
- 5 recetas copy-paste.
- Una demo estrella mantenida: `Grid Buddy`.
- Una demo educativa por concepto: input, collisions, particles, state machine, tilemap.
- README con preview visual.

Adopcion:

- Mejorar descripcion/keywords en npm.
- Publicar galeria.
- Medir descargas mensuales, estrellas y issues, pero sin obsesionarse con descargas npm porque incluyen automatizaciones.

## Riesgos

### Riesgo 1: convertirse en un game engine grande

Mitigacion:

- Cada feature grande empieza como helper puro o ejemplo.
- No agregar ECS, fisica completa, audio o asset pipeline complejo todavia.

### Riesgo 2: API monolitica en `GridCanvasSystem`

Mitigacion:

- Mantener dibujo en instancia.
- Mantener runtime en `GridCanvasSystem.runtime`.
- Si crecen muchas APIs, agregar subpath exports antes que monorepo.

### Riesgo 3: demos dependen de `dist`

Mitigacion:

- Agregar un dev examples runner con Vite que importe desde `src`.
- Mantener ejemplos CDN/build para usuarios finales.

### Riesgo 4: performance de pixel art por `fillRect` celda a celda

Mitigacion:

- `compilePixelSprite`.
- Batching por color.
- Render cache con `OffscreenCanvas` o canvas auxiliar.

### Riesgo 5: documentacion dispersa

Mitigacion:

- Convertir docs en sitio o galeria.
- Mantener README corto y docs profundas en `docs/`.

## Recomendacion final

La innovacion mas fuerte para `grid-canvas-system` no es agregar mas formas ni copiar engines grandes. Es construir una libreria con esta promesa:

> Aprender y crear pequenos mundos visuales interactivos en Canvas, con grillas, pixel art y runtime ligero, sin arquitectura pesada.

El siguiente movimiento deberia ser:

1. Pulir empaquetado y CI.
2. Convertir la grilla en API util con conversiones y pointer input.
3. Convertir pixel art en sistema compilable/cacheable.
4. Agregar scene manager minimo.
5. Publicar galeria de ejemplos.

Con eso, `grid-canvas-system` puede crecer desde utilidad de grilla hacia micro engine con personalidad propia, sin perder su mayor virtud: ser pequeno, claro y facil de entender.

## Fuentes consultadas

- PixiJS Events / Interaction: https://pixijs.com/8.x/guides/components/events
- PixiJS Container / scene graph: https://pixijs.com/8.x/guides/components/scene-objects/container
- PixiJS Assets: https://pixijs.com/8.x/guides/components/assets
- Phaser Arcade Physics World: https://docs.phaser.io/api-documentation/class/physics-arcade-world
- Konva Getting Started: https://konvajs.org/docs/index.html
- Fabric.js Core Concepts: https://fabricjs.com/docs/core-concepts/
- Excalibur docs: https://excaliburjs.com/docs/
- p5.js homepage/reference: https://p5js.org/ and https://p5js.org/reference/
- MDN OffscreenCanvas: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
- MDN requestAnimationFrame: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Node.js package entry points / exports: https://nodejs.org/api/packages.html
- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- Vite library mode: https://vite.dev/guide/build
