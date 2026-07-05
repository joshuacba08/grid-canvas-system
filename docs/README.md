# Documentacion

Este directorio centraliza la documentacion tecnica de `grid-canvas-system`.

## Contenido

- [Estudio tecnico](./ESTUDIO_TECNICO.md): arquitectura actual, API publica, flujo de renderizado y estado del empaquetado.
- [Contrato de API publica](./PUBLIC_API.md): superficie Stable, Experimental y Legacy para `1.0.0`.
- [Guia de migracion](./MIGRATION.md): pasos recomendados desde `0.x` hacia `1.0.0`.
- [Ejemplos](./EXAMPLES.md): mapa de demos vanilla y flujo local para probarlos.
- [Hallazgos y mejoras](./HALLAZGOS_Y_MEJORAS.md): errores potenciales, inconsistencias y oportunidades de mejora priorizadas.
- [Investigacion de innovacion y escalado](./INVESTIGACION_INNOVACION_ESCALADO.md): posicionamiento, comparativa, gaps, roadmap y PRs recomendados para escalar la libreria.

## Objetivo

Usar esta carpeta como base para:

- documentar la API publica real de la libreria;
- dejar clara la separacion entre capa core, capa de dibujo y runtime opcional;
- documentar demos avanzadas como `Grid Buddy` como showcases sobre APIs genericas, no como logica del core;
- registrar decisiones de diseno;
- mantener un backlog tecnico claro antes de ampliar funcionalidades;
- dejar trazabilidad de las mejoras ya aplicadas.
