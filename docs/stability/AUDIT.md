# Auditoría de estabilización — 1.2.0-rc.1

El candidato conserva el contrato 1.x y añade controles de ciclo de vida. No está publicado ni certificado al 100 %. El audio conserva su clasificación Experimental hasta completar la evidencia pendiente.

## Inventario y aceptación

[contract.json](./contract.json) inventaría 385 superficies públicas y 14 capacidades: exports y tipos, constructor, propiedades, métodos, miembros de los controladores retornados, helpers, aliases legacy y promesas de producto. Cada fila identifica origen, entorno, comportamiento esperado y pruebas vinculadas. `test-linked` significa trazabilidad; no acredita por sí mismo cobertura exhaustiva de entradas, ramas o dispositivos.

`verify:contract` detecta exports publicados sin inventariar, pruebas ausentes y errores de declaraciones. La revisión final compara cada afirmación con sus aserciones efectivas; las lagunas deben conservarse como pendientes.

## Hallazgos

| ID      | Prioridad | Reproducción / impacto                                                                                               | Corrección y evidencia                                                                            |
| ------- | --------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GCS-001 | Alta      | UMD expone objeto; el constructor CDN documentado falla.                                                             | Entrada CDN con constructor y alias .default; VM/tarball/navegador.                               |
| GCS-002 | Alta      | 1 s con lower-fps entrega aproximadamente 233 ms.                                                                    | Delta acumulado y clamp al entregar; reloj determinista y navegador.                              |
| GCS-003 | Alta      | Resize idéntico borra pixels; opciones inválidas aplican cambios parciales.                                          | No-op preserva bitmap/contexto; validación antes de commit; Canvas real.                          |
| GCS-004 | Alta      | skipLibCheck oculta imports inválidos para NodeNext.                                                                 | Normalización de declaraciones y consumidor instalado estricto en NodeNext/Bundler.               |
| GCS-005 | Alta      | Controles de audio afectan a otros consumidores globales.                                                            | Howler por instancia y Tone con contexto/transport/destination propios; dos controladores reales. |
| GCS-006 | Alta      | Dispose durante resume permite crear recursos posteriormente.                                                        | Revalidación tras await; pruebas de carrera con timers/contextos controlados.                     |
| GCS-007 | Alta      | Tone monofónico rechaza notas superpuestas/chords.                                                                   | PolySynth por instrumento; dependencias reales.                                                   |
| GCS-008 | Media     | Input conserva teclas/down al perder foco/captura.                                                                   | Limpieza blur/visibility/capture y dimensiones lógicas opcionales.                                |
| GCS-009 | Media     | Destroy/stop dentro de update deja callbacks/RAF posteriores.                                                        | Guardas entre callbacks y ciclo de vida fixed-step; detener RAF ante excepciones.                 |
| GCS-010 | Media     | Reentrancia interrumpe transiciones o completa una animación reemplazada.                                            | Guardas y revisión de playback; historia refleja commits; pruebas de hooks/subscribers.           |
| GCS-011 | Media     | Unicode usa longitud UTF-16 y se aceptan pixels fuera de bounds.                                                     | Code points y validación de límites; propiedades de flip/geometría.                               |
| GCS-012 | Media     | Epsilon fijo pierde rectángulos diminutos; bounds enormes iteran excesivamente.                                      | Límites half-open con ceil y clamp al mapa.                                                       |
| GCS-013 | Media     | Opciones/tile inválidos fallan después de dibujar parcialmente.                                                      | Prevalidación de stroke/guías y tiles; bitmap intacto en los errores comprobados.                 |
| GCS-014 | Media     | Helpers sin uso se conservan y faltan gates de web/navegador.                                                        | Namespace puro, prueba de tree shaking y workflow compartido.                                     |
| GCS-015 | Media     | Demos fallan al cargar sin Web Audio.                                                                                | Estado visible, controles deshabilitados y error de soporte explícito.                            |
| GCS-016 | Media     | Un cambio de DPR fraccionario se pierde si el buffer redondeado no cambia; un rect no finito aplica estado inválido. | Detectar DPR efectivo y validar medidas visibles antes de commit; dos regresiones de resize.      |
| GCS-017 | Alta      | Resoluciones antiguas de web, frameworks de prueba y herramientas tienen avisos críticos/altos.                      | Versiones corregidas fijadas, auditoría del workspace y nueva ejecución de todos los controles.   |

Las correcciones no retiran nombres, firmas ni aliases anteriores. Los consumidores que dependían de controlar otros sonidos mediante un addon deben usar explícitamente las APIs globales de sus dependencias. Un fallo de exit deja el estado anterior; un fallo de enter deja el estado nuevo, reflejado en historia/eventos. Destroy de escenas llama exit con el id actual una sola vez.

## Verificación

La auditoría de dependencias también forma parte del control completo. Se han actualizado Astro/MDX, Mermaid/Shiki, Angular/Vue, Vite y Vitest, y se fijan resoluciones transitivas corregidas en `pnpm-workspace.yaml`. El informe final distingue la auditoría del workspace de las pruebas funcionales: ausencia de avisos conocidos en esa fecha no certifica ausencia de errores.

Referencia: Node 24.21.0, pnpm 11.7.0, TypeScript 5.6.3 y Playwright 1.64.0. Herramientas y fixtures están fijados en manifiesto/lockfile. La matriz incluye Chromium, Firefox, WebKit, DPR 1/1.25/2/3, movimiento reducido y perfiles móviles emulados. Se validan React 19.2.0, Vue 3.5.44 y Angular 20.3.33.

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install chromium firefox webkit
pnpm run verify:release
pnpm run test:soak
pnpm run verify:certification
```

`verify:release` ejecuta dos pasadas consecutivas sin reintentos: formato, tests, build, tipos, tarball, bundles, inventario, web, navegadores y rendimiento. Los snapshots existentes se conservan; las nuevas referencias por motor muestran cuadrantes rojos/verdes y sus 1.600 pixels se verifican por RGBA exacto. No se aprueba automáticamente una diferencia visual.

La línea base de rendimiento procede del commit `90719e6ade310f47731c64adf683fbc7f6707b61`. El control reconstruye ese commit con las mismas herramientas y verifica el hash del artefacto original. Cada muestra incluye 5.000 dibujos, calentamiento y diez repeticiones alternando tanto el orden de operaciones como original/candidato dentro del mismo proceso. El límite temporal del 10 % se aplica a esa comparación pareada, también en CI. Las medianas históricas se conservan como contexto. El presupuesto gzip del 5 % es el total de JavaScript distribuido. Las mediciones y la sesión larga se guardan como artefactos.

Se conservaron dos fallos de comparación con las medianas históricas mientras arrancaban o corrían otras sesiones de navegador. La medición del código original bajo esa carga también varió; la comparación pareada elimina esa diferencia de condiciones sin elevar los límites ni reintentar automáticamente una prueba fallida.

## Pendientes de certificación

1. **Safari iOS y Chrome Android físicos:** registrar modelo, sistema, navegador, versión candidata, fecha y evidencia de touch, orientación, audio, background/resume y teardown. La emulación no cubre este requisito.
2. **Web Audio en WebKit compatible — cerrado:** Windows WebKit no expone AudioContext en el entorno observado. Sus omisiones locales se conservan; [CI Linux](https://github.com/joshuacba08/grid-canvas-system/actions/runs/38398357239) ejecuta WebKit 27.2 con una salida PulseAudio virtual y pasa todos los casos en dos controles completos sin omisiones ni reintentos.
3. **Revisión completa de promesas:** verificar las aserciones vinculadas a cada fila; cerrar lagunas con pruebas o evidencia adicional. Una fila o un test existente no sustituye esta revisión.

[certification.json](./certification.json) registra estos requisitos como pendientes. La publicación exige `verify:certification` y falla mientras falte evidencia revisada. No se promociona audio ni se anuncia cumplimiento total por pruebas omitidas.

El [backlog ordenado](./BACKLOG.md) recoge los criterios de cierre. La [guía de dispositivos](./DEVICE_TESTS.md) permite reunir la evidencia pendiente desde la web de producción sin publicar el paquete npm.

El [informe de cumplimiento](./RESULTS.md) recoge resultados comprobados, omisiones, incidencias investigadas y hashes en [VALIDATION.json](./VALIDATION.json).
