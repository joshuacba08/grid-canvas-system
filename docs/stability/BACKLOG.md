# Backlog de cierre del candidato

Las correcciones reproducidas GCS-001 a GCS-017 están descritas en [AUDIT.md](./AUDIT.md). Este backlog conserva los requisitos que impiden certificar o publicar el candidato; desplegar la web para obtener evidencia está autorizado.

| Orden | Prioridad           | Trabajo                        | Evidencia de cierre                                                                                                                                                            |
| ----- | ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Alta / aceptación   | Web Audio en WebKit compatible | Ejecutar todos los casos de `audio.spec.ts` en un entorno Linux/macOS compatible, sin omisiones ni reintentos; registrar versiones y adjuntar informe.                         |
| 2     | Alta / aceptación   | Safari físico en iPhone 14     | Completar [DEVICE_TESTS.md](./DEVICE_TESTS.md), revisar JSON y grabación del mismo commit candidato; registrar iOS/Safari y revisor.                                           |
| 3     | Alta / aceptación   | Chrome Android físico          | Dispositivo identificado, sistema/navegador registrados y los mismos escenarios con evidencia revisada.                                                                        |
| 4     | Alta / aceptación   | Revisión de todas las promesas | Revisar cada fila de `contract.json` contra las aserciones concretas. Añadir pruebas para cualquier laguna; no sustituir la revisión por la existencia de un archivo de tests. |
| 5     | Media / preparación | Promoción del candidato        | Dos controles completos consecutivos del artefacto final, todos los requisitos aceptados y documentación sincronizada. Mantener Experimental el audio hasta entonces.          |
| 6     | Posterior           | Publicación npm                | Acción separada, fuera del despliegue de esta web; no crear un tag de publicación con certificación pendiente.                                                                 |

Un fallo real descubierto durante estas comprobaciones vuelve al ciclo reproducción → corrección → verificación. Un fallo que desaparezca al repetir una ejecución conserva su informe y requiere investigación.
