# Estudio tecnico de `grid-canvas-system`

## Resumen

`grid-canvas-system` es una libreria pequena enfocada en preparar un `canvas` HTML con una cuadricula visible y ofrecer una capa encapsulada de dibujo para sistemas visuales interactivos.

La implementacion actual sigue siendo simple y directa, pero ya incorpora una base bastante mas solida que la inicial: validacion de DOM, tipos publicados, configuracion visual, soporte HiDPI, helpers geometricos, pixel art declarativo, shapes reutilizables, overlays de HUD, un runtime ligero para animacion, sprite animation, maquinas de estado, conversion explicita entre grid/canvas, input de teclado y puntero, movimiento y helpers neutros de escena, pruebas automatizadas, snapshots PNG versionados y compatibilidad actualizada con `pnpm`.

## Estructura actual

```text
src/
  core/
    index.ts
  drawing/
    index.ts
  index.ts
  modules/
    vanilla/
      GridCanvasSystem.ts
  runtime/
    createAnimationLoop.ts
    createKeyTracker.ts
    createPointerTracker.ts
    createSpriteAnimator.ts
    createStateMachine.ts
    grid.ts
    index.ts
    MassBody.ts
    motion.ts
    scene.ts
    types.ts
examples/
  vanilla/
    asteroid/
      index.html
    drawLines/
      index.html
    ghost/
      index.html
    grid-buddy/
      index.html
    hud/
      index.html
    pacman/
      index.html
    projectile/
      index.html
    runtime/
      index.html
    spaceship/
      index.html
```

## Arquitectura

La libreria expone una clase principal, `GridCanvasSystem`, y consolida su uso en tres capas simples:

1. Capa core: inicializacion, validacion del DOM, ajuste del canvas, soporte HiDPI y contrato base (`canvas`, `ctx`, `options`).
2. Capa visual: configuracion de la cuadricula, pixel art y methods encapsulados de dibujo.
3. Capa runtime opcional: animacion, sprite animation, maquinas de estado, input, conversion grid/canvas, fisica ligera y helpers neutros de escena accesibles como `GridCanvasSystem.runtime`.

Archivo principal:

- `src/modules/vanilla/GridCanvasSystem.ts`

Barrels por capa:

- `src/core/index.ts`
- `src/drawing/index.ts`
- `src/runtime/index.ts`

Punto de entrada:

- `src/index.ts`

### Responsabilidades actuales de la clase

1. Buscar el `canvas` por `id`.
2. Validar que el elemento encontrado sea realmente un `HTMLCanvasElement`.
3. Obtener y validar el contexto 2D.
4. Definir ancho, alto y color de fondo.
5. Ajustar el `canvas` a `devicePixelRatio` manteniendo el tamano visual esperado.
6. Dibujar una cuadricula configurable.
7. Resaltar lineas mayores con una linea mas gruesa y una etiqueta numerica.
8. Permitir dibujar una etiqueta de coordenadas manualmente.
9. Exponer una capa de dibujo encapsulada para texto, pixel art, lineas, sectores y shapes reutilizables.
10. Exponer utilidades runtime reutilizables para bucles de animacion, sprite animation, maquinas de estado, seguimiento de teclado y puntero, conversion grid/canvas, movimiento y colisiones geometricas simples.
11. Limpiar el canvas y volver a dibujar la cuadricula.

## API publica real

### Constructor

```ts
new GridCanvasSystem(id: string, width?: number, height?: number)
new GridCanvasSystem(id: string, options?: GridCanvasSystemOptions)
```

Parametros:

- `id`: identificador del elemento DOM esperado.
- `width`: ancho del canvas. Si no se envia, usa `400`.
- `height`: alto del canvas. Si no se envia, usa `400`.

Firma alternativa:

- `options`: objeto de configuracion para dimensiones, colores, grosor de lineas, fuente y `devicePixelRatio`.

### Propiedades publicas

- `canvas: HTMLCanvasElement`
- `ctx: CanvasRenderingContext2D`
- `options: Readonly<GridCanvasSystemResolvedOptions>`

Ambas propiedades se exponen como `readonly`, lo que evita reasignaciones accidentales sobre las referencias principales de la instancia.

Esto es una decision deliberada de API: `canvas` y `ctx` funcionan como puntos de extension avanzados y forman parte del contrato publico soportado de la libreria. La libreria conserva una experiencia simple, pero deja espacio para que el consumidor dibuje manualmente sobre la cuadricula. El costo de esa flexibilidad es que, si el consumidor altera el estado del contexto, el resultado visual pasa a depender tambien de ese codigo externo.

### Metodos publicos

- `drawText(text: string, x: number, y: number, options?: GridCanvasTextOptions)`: dibuja texto usando el estado gestionado por la libreria.
- `drawPixelSprite(sprite: GridCanvasPixelSprite, options: GridCanvasPixelSpriteDrawOptions)`: dibuja pixel art declarativo con coordenadas canvas absolutas, `pixelSize` positivo y paleta estricta.
- `drawGhost(center: GridCanvasPoint, radius: number, options?: GridCanvasGhostOptions)`: dibuja un fantasma parametrizable con pies y ojos.
- `drawProjectile(center: GridCanvasPoint, radius: number, life: number, options?: GridCanvasProjectileOptions)`: dibuja un proyectil circular con color por defecto dependiente de su vida restante.
- `polarToCartesian(center: GridCanvasPoint, radius: number, angle: number): GridCanvasPoint`: convierte coordenadas polares en un punto del canvas.
- `createAsteroidShape(segments: number, random?: () => number): GridCanvasAsteroidShape`: genera shape data persistente para asteroides irregulares.
- `drawCircleSector(center: GridCanvasPoint, radius: number, startAngle: number, endAngle: number, options?: GridCanvasCircleSectorOptions)`: dibuja una primitiva de sector circular reutilizable.
- `drawPacman(x: number, y: number, radius: number, mouthOpen: number, options?: GridCanvasPacmanOptions)`: dibuja un Pac-Man parametrizable sobre la cuadricula.
- `drawAsteroid(center: GridCanvasPoint, radius: number, shape: GridCanvasAsteroidShape, options?: GridCanvasAsteroidOptions)`: dibuja un asteroide parametrizable a partir de shape data persistente.
- `drawShip(center: GridCanvasPoint, radius: number, options?: GridCanvasShipOptions)`: dibuja una nave parametrizable con curvas cuadraticas, guias, rotacion encapsulada y thruster opcional.
- `drawValueLabel(label: string, value: number, x: number, y: number, options?: GridCanvasValueLabelOptions)`: dibuja un label numerico formateado para score, fps o level.
- `drawBarIndicator(label: string, x: number, y: number, width: number, height: number, value: number, max: number, options?: GridCanvasBarIndicatorOptions)`: dibuja una barra proporcional con etiqueta.
- `drawMessage(mainText: string, subText: string, center: GridCanvasPoint, options?: GridCanvasMessageOptions)`: dibuja un mensaje de dos lineas centrado.
- `drawLine(start: GridCanvasPoint, end: GridCanvasPoint, options?: GridCanvasStrokeOptions)`: dibuja una linea simple sin necesidad de tocar `ctx`.
- `drawPolyline(points: GridCanvasPoint[], options?: GridCanvasPolylineOptions)`: dibuja una polilinea o ruta cerrada mediante una API encapsulada.
- `drawCoordinate(x: number, y: number, options?: GridCanvasTextOptions)`: dibuja el texto `(${x},${y})` en la posicion recibida.
- `clearCanvas(options?: GridCanvasClearOptions)`: limpia el contenido actual y puede omitir el redibujado de la cuadricula para flujos de animacion.

### Utilidades runtime expuestas en `GridCanvasSystem.runtime`

- `createAnimationLoop(options: GridCanvasAnimationLoopOptions): GridCanvasAnimationLoop`: crea un bucle basado en `requestAnimationFrame` con `elapsed` en segundos.
- `createSpriteAnimator(options: GridCanvasSpriteAnimatorOptions): GridCanvasSpriteAnimator`: gestiona animaciones de sprites devolviendo el frame actual sin dibujar.
- `createStateMachine(options: GridCanvasStateMachineOptions): GridCanvasStateMachine`: gestiona estados y transiciones simples con retorno booleano.
- `MassBody`: clase reutilizable para posicion, velocidad, giro, empuje y wrap-around.
- `createKeyTracker(target, options?)`: rastrea teclas pulsadas sobre un `target` concreto.
- `createPointerTracker(target, options?)`: rastrea posicion de puntero y estado pulsado relativo al `target`.
- `canvasToGrid(point, options)`: convierte coordenadas canvas absolutas a celda `{ column, row }`.
- `gridToCanvas(cell, options)`: convierte una celda de grilla al punto canvas superior izquierdo.
- `snapPointToGrid(point, options)`: ajusta un punto canvas al origen de su celda.
- `hitTestPoint(point, target)`: detecta si un punto toca un circulo o un rectangulo axis-aligned.
- `hitTestRectangle(a, b)`: detecta solape entre dos rectangulos axis-aligned.
- `hitTestCircleRectangle(circle, rectangle)`: detecta contacto entre un circulo y un rectangulo axis-aligned.
- `appendTrailPoint(trail, point, maxPoints)`: mantiene un trail acotado sin mutar el array original.
- `createParticleBurst(origin, count, options?)`: genera particulas simples con control de angulo, spread, velocidad, tamano y vida.
- `stepParticles(particles, elapsed, options?)`: avanza particulas simples con gravedad y drag opcionales.
- `layoutStack(origin, itemSizes, options?)`: calcula posiciones reutilizables para stacks verticales u horizontales de overlays.
- `normalizeKeyIdentifier(key)`: normaliza `key` y `keyCode` legados.
- `vectorFromAngle(angle, magnitude?)`, `angleToPoint(from, to)`, `oscillate01(time, frequency?)`, `distanceBetweenPoints(a, b)`, `circlesIntersect(a, b)` y `wrapPoint(point, bounds, radius?)`: utilidades de movimiento, oscilacion y colision.

Por compatibilidad, estas utilidades tambien siguen disponibles como propiedades estaticas directas del export principal.

### Configuracion visual relevante

- `gridColor`: color de lineas de la cuadricula.
- `gridLabelColor`: color de las etiquetas numericas de la cuadricula.
- `coordinateLabelColor`: color de las coordenadas dibujadas con `drawCoordinate()`.
- `gridLabelFont`: fuente de las etiquetas numericas de la cuadricula.
- `coordinateFont`: fuente de las coordenadas dibujadas con `drawCoordinate()`.
- `font`: alias de compatibilidad que aplica la misma fuente a ambos tipos de etiqueta.
- `gridLabelTextAlign`: alineacion de las etiquetas numericas de la cuadricula.
- `coordinateTextAlign`: alineacion por defecto para `drawCoordinate()`, `drawText()` y overlays basados en texto.
- `gridLabelTextBaseline`: baseline de las etiquetas numericas de la cuadricula.
- `coordinateTextBaseline`: baseline por defecto para `drawCoordinate()`, `drawText()` y overlays basados en texto.

## Capas de uso

La libreria queda consolidada alrededor de tres capas:

1. Capa de inicializacion y validacion del canvas:
   constructor, resolucion de opciones, `canvas`, `ctx`, `options` y soporte HiDPI.
2. Capa visual de cuadricula y shapes reutilizables:
   `drawText()`, `drawPixelSprite()`, `drawGhost()`, `drawProjectile()`, `polarToCartesian()`, `createAsteroidShape()`, `drawCircleSector()`, `drawPacman()`, `drawAsteroid()`, `drawShip()`, `drawValueLabel()`, `drawBarIndicator()`, `drawMessage()`, `drawLine()`, `drawPolyline()`, `drawCoordinate()` y `clearCanvas()`.
3. Capa runtime ligera opcional:
   `GridCanvasSystem.runtime.createAnimationLoop()`, `GridCanvasSystem.runtime.createSpriteAnimator()`, `GridCanvasSystem.runtime.createStateMachine()`, `GridCanvasSystem.runtime.MassBody`, `GridCanvasSystem.runtime.createKeyTracker()`, `GridCanvasSystem.runtime.createPointerTracker()`, helpers de coordenadas grid/canvas y utilidades de movimiento/colision.

`canvas` y `ctx` siguen disponibles como extension points avanzados dentro de la primera capa, pero la recomendacion para uso comun sigue siendo permanecer en la capa visual encapsulada.

## Flujo de renderizado

1. El constructor obtiene el elemento DOM.
2. Verifica que el elemento sea un `canvas`.
3. Obtiene el contexto 2D y valida que no sea `null`.
4. Resuelve la configuracion final a partir de defaults y opciones del usuario.
5. Ajusta `canvas.width` y `canvas.height` en pixeles fisicos.
6. Ajusta `style.width` y `style.height` en pixeles logicos.
7. Aplica el `backgroundColor`.
8. Fija una transformacion base usando `devicePixelRatio`.
9. Ejecuta `drawGridSystem()`.
10. `drawGridSystem()` dibuja lineas verticales y horizontales segun `cellSize`.
11. Cada `majorStep` anade un marcador numerico usando `fillText`.

## Estado del empaquetado

`package.json` define:

- `main`: `dist/grid-canvas-system.umd.js`
- `module`: `dist/grid-canvas-system.es.js`
- `types`: `dist/index.d.ts`
- `exports`: entrada principal con tipos y build ESM, mas acceso a `./package.json`.
- `sideEffects`: `false` para facilitar tree-shaking en bundlers.
- `files`: globs explicitos para `CHANGELOG.md`, `dist/**/*.js`, `dist/**/*.d.ts` y `docs`

La build se genera en dos pasos:

1. Vite produce los bundles `es` y `umd`.
2. TypeScript emite los archivos `.d.ts` en `dist/`.

Pruebas automatizadas:

- Vitest con entorno `jsdom`.
- Validaciones de constructor.
- Compatibilidad de la firma antigua.
- Configuracion visual e inicializacion HiDPI.
- Comportamiento base de `drawCoordinate()` y `clearCanvas()`.
- Verificacion visual real de lineas de cuadricula y restauracion del bitmap tras `clearCanvas()`.
- Comparacion contra snapshots PNG versionados en el repositorio.
- Cobertura de primitives reutilizables, overlays y del render de Pac-Man.
- Cobertura del render de fantasmas y del nuevo runtime ligero.
- Cobertura del render de asteroides persistentes y sus guias de ruido.
- Cobertura del helper geometrico polar-cartesiano, del render de la nave y de su thruster opcional.
- Cobertura de snapshots PNG para proyectiles y HUD arcade.
- Cobertura de helpers de deteccion para punto, rectangulo y circulo vs rectangulo.
- Artefactos `expected`, `actual` y `diff` cuando falla un snapshot visual.
- Cobertura de helpers neutros de escena para trails, particulas simples y layout de overlays.
- Cobertura de `drawPixelSprite()`, `createSpriteAnimator()`, `createStateMachine()`, helpers de coordenadas grid/canvas y `createPointerTracker()`.
- Snapshot visual dedicado para pixel art declarativo.

### Verificacion realizada

Se valido localmente que:

- `npm install --no-package-lock` instala las dependencias sin modificar el lockfile del proyecto.
- `pnpm install --frozen-lockfile` funciona con la configuracion actual del repositorio.
- `npm run build` compila correctamente y genera los bundles junto con las declaraciones TypeScript en `dist/`.
- `npm test` ejecuta correctamente la bateria de pruebas.
- `npm run test:visual` compara el render actual contra snapshots PNG versionados.
- Si `npm run test:visual` detecta una regresion, genera artefactos comparativos explicitos en `tests/__artifacts__/`.

## Fortalezas actuales

- API pequena y facil de entender.
- Codigo compacto y con una responsabilidad bastante acotada.
- Validaciones mas claras sobre el elemento DOM y el contexto 2D.
- Tipos TypeScript listos para consumidores del paquete.
- API configurable sin romper compatibilidad con la firma anterior.
- Capa encapsulada para dibujo comun sin depender de `ctx` directamente.
- Pixel art declarativo con paletas estrictas y snapshot visual dedicado.
- Primitive reutilizable para sectores circulares y una shape oficial construida sobre ella.
- Helper geometrico reutilizable para convertir angulos y radios en puntos del canvas.
- Shape oficial de fantasma inspirada en el chapter 8, configurable sin tocar `ctx`.
- Shape oficial de asteroide basada en shape data persistente y ruido configurable.
- Shape oficial de proyectil con color por vida restante.
- Shape oficial de nave con rotacion encapsulada, curvas cuadraticas configurables y thruster opcional.
- Overlays reutilizables para HUD y estados de escena.
- Runtime ligero para animaciones de sprites y maquinas de estado simples sin acoplar dibujo ni logica especifica de mascotas.
- Runtime ligero reutilizable para `requestAnimationFrame`, input acotado al canvas por teclado o puntero, conversion grid/canvas, movimiento y deteccion geometrica simple entre puntos, rectangulos y circulos.
- Helpers neutros de escena para trails acotados, bursts de particulas y layout de overlays.
- Colores separados entre etiquetas de cuadricula y coordenadas del usuario.
- Fuentes separadas entre etiquetas de cuadricula y coordenadas del usuario.
- Alineacion y baseline separados entre etiquetas de cuadricula y texto/coords del usuario.
- Soporte HiDPI para mejorar nitidez en pantallas de alta densidad.
- Metodos internos que preservan mejor el estado del contexto.
- Pruebas automatizadas para regresiones basicas.
- Prueba visual real sobre el render del canvas.
- Snapshots PNG versionados para detectar regresiones visuales completas.
- Ejemplo de uso sencillo para CDN.
- Build de libreria ya configurada para `es` y `umd`.
- Flujo reproducible con `npm` y `pnpm`.

## Limites actuales

- Solo existe una implementacion "vanilla".
- La libreria mezcla inicializacion del canvas con decisiones visuales fijas.
- Los diffs visuales siguen siendo pixel-perfect; aun no existe una comparacion perceptual o con tolerancias.

## Recomendacion de evolucion

La siguiente etapa natural es mejorar rendimiento y ergonomia sin cambiar la arquitectura:

1. Compilar sprites de pixel art para evitar validar matrices en cada frame animado.
2. Agregar utilidades de paleta para recolorear sprites sin duplicar matrices.
3. Incorporar un loop fixed-step opcional para escenas donde la simulacion deba ser mas estable.

Con eso se mantiene la simplicidad actual mientras la libreria gana capacidad para demos mas ambiciosas.
