# Estudio tecnico de `grid-canvas-system`

## Resumen

`grid-canvas-system` es una libreria pequena enfocada en un caso de uso puntual: preparar un `canvas` HTML con una cuadricula visible y ofrecer utilidades basicas para dibujar etiquetas de coordenadas.

La implementacion actual sigue siendo simple y directa, pero ya incorpora una base bastante mas solida que la inicial: validacion de DOM, tipos publicados, configuracion visual, soporte HiDPI, pruebas automatizadas, snapshots PNG versionados y compatibilidad actualizada con `pnpm`.

## Estructura actual

```text
src/
  index.ts
  modules/
    vanilla/
      GridCanvasSystem.ts
examples/
  vanilla/
    drawLines/
      index.html
```

## Arquitectura

La libreria expone una unica clase: `GridCanvasSystem`.

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
9. Limpiar el canvas y volver a dibujar la cuadricula.

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
- `drawLine(start: GridCanvasPoint, end: GridCanvasPoint, options?: GridCanvasStrokeOptions)`: dibuja una linea simple sin necesidad de tocar `ctx`.
- `drawPolyline(points: GridCanvasPoint[], options?: GridCanvasPolylineOptions)`: dibuja una polilinea o ruta cerrada mediante una API encapsulada.
- `drawCoordinate(x: number, y: number, options?: GridCanvasTextOptions)`: dibuja el texto `(${x},${y})` en la posicion recibida.
- `clearCanvas()`: limpia el contenido actual y vuelve a dibujar la cuadricula.

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
   `drawText()`, `drawLine()`, `drawPolyline()`, `drawCoordinate()` y `clearCanvas()`.
2. Capa avanzada basada en `canvas` y `ctx`:
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

La siguiente etapa natural seria separar la libreria en tres capas:

1. Inicializacion y validacion del canvas.
2. Configuracion visual de la cuadricula.
3. Utilidades de dibujo adicionales.

Con eso se podria mantener la simplicidad actual sin cerrar la puerta a una API mas solida y reutilizable.
