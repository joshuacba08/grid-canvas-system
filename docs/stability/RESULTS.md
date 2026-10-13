# Informe de cumplimiento del candidato 1.2.0-rc.1

Estado: **candidato preparado; certificación completa pendiente**. Se conserva la compatibilidad 1.x. El audio sigue siendo Experimental y el paquete npm no se ha publicado.

La evidencia reproducible y los hashes del artefacto están en [VALIDATION.json](./VALIDATION.json). Referencia local: Windows, Node 24.21.0, pnpm 11.7.0, TypeScript 5.6.3 y Playwright 1.64.0; Chromium 156.0.8078.4, Firefox 157.0 y WebKit 27.2.

| Control                                      | Resultado                                                                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dos controles integrales consecutivos        | Pasan los 22 pasos, sin reintentos automáticos                                                                                                                |
| Unidad, propiedades, gráficos, SSR y errores | 120 pruebas en 7 archivos pasan en cada control                                                                                                               |
| Navegadores                                  | 185 casos pasan; 5 casos de audio se omiten por falta de Web Audio en Windows WebKit                                                                          |
| Producto                                     | 16 demos vanilla y las 14 plantillas del playground se ejecutan contra el candidato; web multilingüe y patrones React/Vue/Angular/Custom Elements comprobados |
| Distribución y tipos                         | Constructor UMD, ESM, subpaths, SSR y consumidor del tarball instalado; NodeNext/Bundler sin `skipLibCheck`                                                   |
| Recursos                                     | 100 ciclos de creación/destrucción; sesión final de 30 minutos, 1.767 ciclos y 109.776 frames, sin errores; animación detenida tras destruir                  |
| Rendimiento                                  | Comparación pareada con el commit original: -1,82 % para sprites raw y -1,13 % para compilados en la segunda pasada; presupuesto +10 % satisfecho             |
| Tamaño                                       | JavaScript distribuido: 49.079 bytes gzip frente a 47.460, +3,41 %; presupuesto +5 % satisfecho                                                               |
| Dependencias                                 | Auditoría del workspace sin avisos conocidos en la fecha del informe                                                                                          |
| Inventario                                   | 385 filas de API y 14 capacidades enlazadas con pruebas; la trazabilidad no acredita por sí sola cada aserción del contrato                                   |

Las comparaciones iniciales con medianas históricas fallaron bajo carga de otras sesiones de navegador. Se conservó la evidencia y se investigó ejecutando también el original; el control final alterna original/candidato con el mismo hardware, proceso, herramientas y diez muestras. Los umbrales no se elevaron. Una nueva prueba de Pac-Man inicialmente muestreaba una esquina transparente; se corrigió para comprobar el canvas completo tras inspeccionar la imagen. No se actualizaron snapshots para ocultar diferencias.

Quedan abiertos Safari físico en el iPhone 14 del usuario, Chrome Android físico, Web Audio en un WebKit compatible y la revisión final de las aserciones de todas las promesas. Estos requisitos tienen criterios de cierre en [BACKLOG.md](./BACKLOG.md) y bloquean `verify:certification`. La publicación exige evidencia revisada del mismo artefacto.

La web puede desplegarse para reunir esa evidencia. La página [de pruebas en dispositivo](https://grid-canvas-system-site.vercel.app/qa/) permite comprobar cada audio por separado y descargar un informe con versión y commit; consulta [DEVICE_TESTS.md](./DEVICE_TESTS.md). El despliegue de la web no publica el paquete npm ni acredita el 100 % del contrato.
