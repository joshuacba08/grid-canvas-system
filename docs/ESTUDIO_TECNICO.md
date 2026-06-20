# Estudio tecnico de `grid-canvas-system`

## Resumen

`grid-canvas-system` es una libreria pequena enfocada en preparar un `canvas` HTML con una cuadricula visible y ofrecer una capa encapsulada de dibujo para casos comunes.

La implementacion actual sigue siendo simple y directa, pero ya incorpora una base bastante mas solida que la inicial: validacion de DOM, tipos publicados, configuracion visual, soporte HiDPI, helpers geometricos, shapes reutilizables, overlays de HUD, un runtime ligero para animacion y movimiento, pruebas automatizadas, snapshots PNG versionados y compatibilidad actualizada con `pnpm`.

## Estructura actual

```text
src/
  index.ts
  modules/
    vanilla/
      GridCanvasSystem.ts
  runtime/
    createAnimationLoop.ts
    createKeyTracker.ts
    MassBody.ts
    motion.ts
    types.ts
examples/
  vanilla/
    asteroid/
      index.html
    drawLines/
      index.html
    ghost/
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

La libreria expone una clase principal, `GridCanvasSystem`, y una capa adicional de utilidades runtime montadas como propiedades estaticas sobre el export principal para animacion, movimiento, input y fisica ligera.

Archivo principal:

- `src/modules/vanilla/GridCanvasSystem.ts`

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
9. Exponer una capa de dibujo encapsulada para texto, lineas, sectores y shapes reutilizables.
10. Exponer utilidades runtime reutilizables para bucles de animacion, seguimiento de teclado, movimiento y colision circular.
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

### Utilidades runtime expuestas en el export principal

- `createAnimationLoop(options: GridCanvasAnimationLoopOptions): GridCanvasAnimationLoop`: crea un bucle basado en `requestAnimationFrame` con `elapsed` en segundos.
- `MassBody`: clase reutilizable para posicion, velocidad, giro, empuje y wrap-around.
- `createKeyTracker(target, options?)`: rastrea teclas pulsadas sobre un `target` concreto.
- `normalizeKeyIdentifier(key)`: normaliza `key` y `keyCode` legados.
- `vectorFromAngle(angle, magnitude?)`, `angleToPoint(from, to)`, `oscillate01(time, frequency?)`, `distanceBetweenPoints(a, b)`, `circlesIntersect(a, b)` y `wrapPoint(point, bounds, radius?)`: utilidades de movimiento, oscilacion y colision.

### Configuracion visual relevante

- `gridColor`: color de lineas de la cuadricula.
- `gridLabelColor`: color de las etiquetas numericas de la cuadricula.
- `coordinateLabelColor`: color de las coordenadas dibujadas con `drawCoordinate()`.
- `gridLabelFont`: fuente de las etiquetas numericas de la cuadricula.
- `coordinateFont`: fuente de las coordenadas dibujadas con `drawCoordinate()`.
- `font`: alias de compatibilidad que aplica la misma fuente a ambos tipos de etiqueta.

## Capas de uso

La libreria ofrece dos capas complementarias:

1. Capa encapsulada recomendada para el uso comun:
   `drawText()`, `drawGhost()`, `drawProjectile()`, `polarToCartesian()`, `createAsteroidShape()`, `drawCircleSector()`, `drawPacman()`, `drawAsteroid()`, `drawShip()`, `drawValueLabel()`, `drawBarIndicator()`, `drawMessage()`, `drawLine()`, `drawPolyline()`, `drawCoordinate()` y `clearCanvas()`.
2. Capa runtime ligera:
   `createAnimationLoop()`, `MassBody`, `createKeyTracker()` y utilidades de movimiento/colision.
3. Capa avanzada basada en `canvas` y `ctx`:
   pensada para integraciones y dibujo manual mas libre.

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
- `files`: globs explicitos para `dist/**/*.js`, `dist/**/*.d.ts` y `docs`

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

### Verificacion realizada

Se valido localmente que:

- `npm install --no-package-lock` instala las dependencias sin modificar el lockfile del proyecto.
- `pnpm install --frozen-lockfile` funciona con la configuracion actual del repositorio.
- `npm run build` compila correctamente y genera los bundles junto con las declaraciones TypeScript en `dist/`.
- `npm test` ejecuta correctamente la bateria de pruebas.
- `npm run test:visual` compara el render actual contra snapshots PNG versionados.

## Fortalezas actuales

- API pequena y facil de entender.
- Codigo compacto y con una responsabilidad bastante acotada.
- Validaciones mas claras sobre el elemento DOM y el contexto 2D.
- Tipos TypeScript listos para consumidores del paquete.
- API configurable sin romper compatibilidad con la firma anterior.
- Capa encapsulada para dibujo comun sin depender de `ctx` directamente.
- Primitive reutilizable para sectores circulares y una shape oficial construida sobre ella.
- Helper geometrico reutilizable para convertir angulos y radios en puntos del canvas.
- Shape oficial de fantasma inspirada en el chapter 8, configurable sin tocar `ctx`.
- Shape oficial de asteroide basada en shape data persistente y ruido configurable.
- Shape oficial de proyectil con color por vida restante.
- Shape oficial de nave con rotacion encapsulada, curvas cuadraticas configurables y thruster opcional.
- Overlays reutilizables para HUD y estados de escena.
- Runtime ligero reutilizable para `requestAnimationFrame`, input acotado al canvas, movimiento y colisiones circulares.
- Colores separados entre etiquetas de cuadricula y coordenadas del usuario.
- Fuentes separadas entre etiquetas de cuadricula y coordenadas del usuario.
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
- Aun no existe una estrategia de diffs visuales mas avanzada que destaque exactamente que region cambio cuando falla un snapshot.

## Recomendacion de evolucion

La siguiente etapa natural seria consolidar la libreria en tres capas:

1. Inicializacion y validacion del canvas.
2. Configuracion visual de la cuadricula y shapes reutilizables.
3. Runtime ligero opcional para animacion, input y fisica simple.

Con eso se podria mantener la simplicidad actual sin cerrar la puerta a una API mas solida y reutilizable.
