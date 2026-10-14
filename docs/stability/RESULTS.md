# Informe de cumplimiento de 1.2.0

Estado: **versión 1.2.0 para npm `latest`; certificación completa pendiente**. Se conserva la compatibilidad 1.x. El audio sigue siendo Experimental. El usuario pidió expresamente publicar la versión actual en `latest` conservando los requisitos de aceptación pendientes. La publicación se gestiona con [el workflow de npm](../PUBLISHING.md).

Publicación confirmada el 14 de octubre de 2026: [npm 1.2.0](https://www.npmjs.com/package/grid-canvas-system/v/1.2.0), con `latest` apuntando a esta versión. [PUBLICATION.json](./PUBLICATION.json) registra integridad, procedencia, dos pasadas completas de 134 pruebas de unidad y 190 casos de navegador, y comprobaciones del paquete descargado y del CDN. Los seis hashes JavaScript coinciden con los del informe histórico y su sesión de 30 minutos.

La evidencia reproducible y los hashes del artefacto están en [VALIDATION.json](./VALIDATION.json). Referencia local: Windows, Node 24.21.0, pnpm 11.7.0, TypeScript 5.6.3 y Playwright 1.64.0; Chromium 156.0.8078.4, Firefox 157.0 y WebKit 27.2.

| Control                                      | Resultado                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dos controles integrales consecutivos        | Pasan los 22 pasos, sin reintentos automáticos                                                                                                                |
| Unidad, propiedades, gráficos, SSR y errores | 120 pruebas en 7 archivos pasan en cada control                                                                                                               |
| Navegadores                                  | Windows: 185 casos pasan y 5 se omiten por falta de Web Audio en WebKit. Linux CI: 190 casos pasan sin omisiones                                              |
| Producto                                     | 16 demos vanilla y las 14 plantillas del playground se ejecutan contra el candidato; web multilingüe y patrones React/Vue/Angular/Custom Elements comprobados |
| Distribución y tipos                         | Constructor UMD, ESM, subpaths, SSR y consumidor del tarball instalado; NodeNext/Bundler sin `skipLibCheck`                                                   |
| Recursos                                     | 100 ciclos de creación/destrucción; sesión final de 30 minutos, 1.767 ciclos y 109.776 frames, sin errores; animación detenida tras destruir                  |
| Rendimiento                                  | Comparación pareada con el commit original: -1,82 % para sprites raw y -1,13 % para compilados en la segunda pasada; presupuesto +10 % satisfecho             |
| Tamaño                                       | JavaScript distribuido: 49.079 bytes gzip frente a 47.460, +3,41 %; presupuesto +5 % satisfecho                                                               |
| Dependencias                                 | Auditoría del workspace sin avisos conocidos en la fecha del informe                                                                                          |
| Inventario                                   | 385 filas de API y 14 capacidades enlazadas con pruebas; la trazabilidad no acredita por sí sola cada aserción del contrato                                   |

Las comparaciones iniciales con medianas históricas fallaron bajo carga de otras sesiones de navegador. Se conservó la evidencia y se investigó ejecutando también el original; el control final alterna original/candidato con el mismo hardware, proceso, herramientas y diez muestras. Los umbrales no se elevaron. Una nueva prueba de Pac-Man inicialmente muestreaba una esquina transparente; se corrigió para comprobar el canvas completo tras inspeccionar la imagen. No se actualizaron snapshots para ocultar diferencias.

La primera ejecución en Linux detectó bloqueos de `AudioContext.resume()` en Firefox sin salida de audio. Tras configurar un sink PulseAudio virtual, [CI pasó dos controles completos](https://github.com/joshuacba08/grid-canvas-system/actions/runs/38398357239), con 120 pruebas de unidad y 190 casos de navegador en cada ejecución, incluyendo todo el audio de WebKit 27.2, sin omisiones ni reintentos. Se conservan las trazas del fallo inicial. Los navegadores y los tres sistemas de audio ejecutan sus APIs reales con esa salida virtual.

Quedan abiertos Safari físico en el iPhone 14 del usuario, Chrome Android físico y la revisión final de las aserciones de todas las promesas. Estos requisitos tienen criterios de cierre en [BACKLOG.md](./BACKLOG.md) y bloquean `verify:certification`. La publicación solicitada por el usuario no cambia sus resultados ni acredita el 100 % del contrato.

La web puede desplegarse para reunir esa evidencia. La página [de pruebas en dispositivo](https://grid-canvas-system-site.vercel.app/qa/) permite comprobar cada audio por separado y descargar un informe con versión y commit; consulta [DEVICE_TESTS.md](./DEVICE_TESTS.md). El despliegue de la web no publica el paquete npm ni acredita el 100 % del contrato.
