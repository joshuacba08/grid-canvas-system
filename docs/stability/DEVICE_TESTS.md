# Aceptación en dispositivos físicos

Web de producción: https://grid-canvas-system-site.vercel.app/qa/

El usuario dispone de un iPhone 14 y ha solicitado comprobarlo después del despliegue. No se ha ejecutado ni acreditado esa prueba. Chrome Android físico también sigue pendiente; debe registrarse un dispositivo real.

1. Abre la página en Safari del iPhone. Anota el modelo, la versión de iOS y la versión de Safari; no uses la vista de un navegador integrado en otra aplicación.
2. Inicia la animación. Toca y arrastra por los bordes del canvas; interrumpe un toque con un gesto del sistema y comprueba que no queda un puntero activo.
3. Gira el dispositivo en ambos sentidos. Comprueba la nitidez, el tamaño y la posición del punto después del cambio.
4. Pulsa **Preparar audio** y después prueba **Web Audio**, **Howler** y **Tone** por separado. Comprueba también el botón que reproduce los tres.
5. Cambia de aplicación durante al menos diez segundos y vuelve. Comprueba que la animación reanuda sin saltos y que el audio puede volver a reproducirse mediante un gesto.
6. Pulsa **Destruir recursos**. Comprueba que no hay animación ni reproducción posterior. Recrea el canvas y repite la interacción.
7. Marca únicamente las observaciones que hayas comprobado y descarga el JSON. Conserva además una grabación breve y las versiones del sistema y del navegador.

Repite la misma secuencia en Chrome Android. La emulación Playwright no acredita estos dos escenarios físicos. La revisión debe asociar cada informe a la versión y al commit que aparecen en la página; si hay errores, abre un hallazgo antes de marcar el requisito como aceptado en `certification.json`.

La página registra métricas y observaciones, pero no valida automáticamente que los sonidos se escuchen ni que un dispositivo cumpla todo el contrato. La revisión del informe es necesaria.

Después de completar todos los requisitos, registra también los hashes del build aceptado en `certification.json.artifacts` usando `node scripts/candidate-artifacts.mjs`. La publicación rechaza evidencia de otro artefacto aunque tenga la misma versión. No cambies estados a `passed` sin revisar los informes.
