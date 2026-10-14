# Backlog de certificación

Las correcciones reproducidas GCS-001 a GCS-017 están descritas en [AUDIT.md](./AUDIT.md). Este backlog conserva los requisitos pendientes para certificar el 100 % del contrato. El usuario ha autorizado expresamente publicar 1.2.0 en npm `latest` sin marcar esos requisitos como aprobados.

| Orden | Prioridad           | Trabajo                        | Evidencia de cierre                                                                                                                                                            |
| ----- | ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Cerrado             | Web Audio en WebKit compatible | CI 38398357239: Ubuntu 24.04, WebKit 27.2 y salida PulseAudio virtual; dos controles de 190 casos sin omisiones ni reintentos.                                                 |
| 2     | Alta / aceptación   | Safari físico en iPhone 14     | Completar [DEVICE_TESTS.md](./DEVICE_TESTS.md), revisar JSON y grabación del mismo commit candidato; registrar iOS/Safari y revisor.                                           |
| 3     | Alta / aceptación   | Chrome Android físico          | Dispositivo identificado, sistema/navegador registrados y los mismos escenarios con evidencia revisada.                                                                        |
| 4     | Alta / aceptación   | Revisión de todas las promesas | Revisar cada fila de `contract.json` contra las aserciones concretas. Añadir pruebas para cualquier laguna; no sustituir la revisión por la existencia de un archivo de tests. |
| 5     | Media / preparación | Certificación completa         | Dos controles completos consecutivos del artefacto final, todos los requisitos aceptados y documentación sincronizada. Mantener Experimental el audio hasta entonces.          |
| 6     | Autorizado          | Publicación npm                | Publicar 1.2.0 en latest por petición expresa del usuario; conservar la aceptación pendiente y el audio Experimental.                                                          |

Un fallo real descubierto durante estas comprobaciones vuelve al ciclo reproducción → corrección → verificación. Un fallo que desaparezca al repetir una ejecución conserva su informe y requiere investigación.
