import { codeToHtml } from "shiki";

export type DocsLocale = "en" | "es";

export interface DocsSnippet {
  code: string;
  highlighted: string;
  id: string;
  lang: string;
  title: string;
}

interface RawDocsSnippet extends Omit<DocsSnippet, "highlighted"> {
  key:
    | "install"
    | "firstScene"
    | "sprite"
    | "runtime"
    | "gameLoop"
    | "audioArcade"
    | "audioAdapters";
}

interface DocsNavigationGroup {
  label: string;
  links: Array<[string, string]>;
}

interface DocsShellConfig {
  alternateLabel: string;
  alternatePath: string;
  breadcrumbs: {
    current: string;
    root: string;
  };
  callout: {
    text: string;
    title: string;
  };
  copyPageLabel: string;
  currentPath: string;
  docsBadge: string;
  introKicker: string;
  introText: string;
  introTitle: string;
  lang: string;
  metaDescription: string;
  navigation: DocsNavigationGroup[];
  pageTitle: string;
  pagination: {
    backLabel: string;
    backText: string;
    nextLabel: string;
    nextText: string;
  };
  playgroundLabel: string;
  repoAria: string;
  searchEmpty: string;
  searchPlaceholder: string;
  tutorialsLabel: string;
  tutorialsPath: string;
  toc: Array<[string, string]>;
  tocLabel: string;
}

interface DocsMethodGroup {
  methods: Array<[string, string]>;
  name: string;
}

type DocsRecipe = [string, string, string];
type DocsErrorRow = [string, string];
type DocsApiGroup = [string, string];
type DocsPerformanceNote = [string, string];

export const repoUrl = "https://github.com/joshuacba08/grid-canvas-system";

const rawSnippets: readonly RawDocsSnippet[] = [
  {
    key: "install",
    id: "install-code",
    title: "Terminal",
    lang: "bash",
    code: `npm install grid-canvas-system

# or
pnpm add grid-canvas-system`,
  },
  {
    key: "firstScene",
    id: "first-scene-code",
    title: "main.ts",
    lang: "typescript",
    code: `import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  backgroundColor: "#050607"
});

grid.drawCoordinate(120, 80);`,
  },
  {
    key: "sprite",
    id: "sprite-code",
    title: "sprite.ts",
    lang: "typescript",
    code: `const sprite = [
  "00111100",
  "01122110",
  "11222211",
  "12233221",
  "00100100"
];

grid.drawPixelSprite(sprite, {
  x: 80,
  y: 60,
  pixelSize: 8,
  palette: {
    0: "transparent",
    1: "#00d43b",
    2: "#e8f7ef",
    3: "#050607"
  }
});`,
  },
  {
    key: "runtime",
    id: "runtime-code",
    title: "runtime.ts",
    lang: "typescript",
    code: `let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.05,
  update(elapsed) {
    time += elapsed;
  },
  draw() {
    grid.clearCanvas();
    grid.drawPacman(160, 110, 36,
      GridCanvasSystem.runtime.oscillate01(time, 2)
    );
  }
});`,
  },
  {
    key: "gameLoop",
    id: "game-loop-code",
    title: "game-loop.ts",
    lang: "typescript",
    code: `const keys = GridCanvasSystem.runtime.createKeyTracker(canvas);

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  maxElapsed: 0.04,
  update(elapsed) {
    player.y += readDirection(keys) * speed * elapsed;
    ball.x += ball.vx * elapsed;

    if (GridCanvasSystem.runtime.hitTestCircleRectangle(ball, paddle)) {
      ball.vx *= -1;
    }
  },
  draw() {
    grid.clearCanvas();
    drawCourt();
    drawActors();
    drawScore();
  }
});`,
  },
  {
    key: "audioArcade",
    id: "audio-arcade-code",
    title: "audio-arcade.ts",
    lang: "typescript",
    code: `import { createArcadeAudio } from "grid-canvas-system/audio-arcade";

const audio = createArcadeAudio({
  masterVolume: 0.72
});

playButton.addEventListener("click", async () => {
  await audio.playShoot();
  await audio.playLoop("patrol");
});`,
  },
  {
    key: "audioAdapters",
    id: "audio-adapters-code",
    title: "audio.ts",
    lang: "typescript",
    code: `import {
  createHowlerAssetAudio,
  createToneMusicAudio
} from "grid-canvas-system/audio";

const sfx = await createHowlerAssetAudio({
  coin: { src: ["/audio/coin.wav"], volume: 0.4 }
});

const music = await createToneMusicAudio({
  bpm: 132,
  instruments: { lead: "synth", kick: "membrane" }
});`,
  },
];

export const docsSnippets = await Promise.all(
  rawSnippets.map(async (snippet) => ({
    ...snippet,
    highlighted: await codeToHtml(snippet.code, {
      lang: snippet.lang,
      theme: "vitesse-black",
    }),
  })),
);

export const docsSnippetMap = Object.fromEntries(
  docsSnippets.map(({ key, ...snippet }) => [key, snippet]),
) as Record<RawDocsSnippet["key"], DocsSnippet>;

export const docsShellByLocale: Record<DocsLocale, DocsShellConfig> = {
  en: {
    alternateLabel: "ES",
    alternatePath: "/es/docs/",
    breadcrumbs: {
      current: "Get started",
      root: "Docs",
    },
    callout: {
      title: "Good fit",
      text: "Teaching, pixel tools, small arcade sketches and interactive diagrams where direct access to canvas and ctx still matters.",
    },
    copyPageLabel: "Copy documentation page",
    currentPath: "/docs/",
    docsBadge: "Docs",
    introKicker: "Get started",
    introText:
      "Grid Canvas System is a small TypeScript-first layer over the Canvas 2D API. It gives you a readable grid, drawing primitives, optional audio add-ons and runtime helpers without hiding the canvas underneath.",
    introTitle: "Build your first Canvas scene.",
    lang: "en",
    metaDescription:
      "Guides and API orientation for grid-canvas-system, including optional audio add-ons.",
    navigation: [
      {
        label: "Start here",
        links: [
          ["Overview", "#overview"],
          ["Installation", "#installation"],
          ["Your first scene", "#first-scene"],
        ],
      },
      {
        label: "Core canvas",
        links: [
          ["Canvas options", "#canvas-options"],
          ["Redraw lifecycle", "#redraw-lifecycle"],
        ],
      },
      {
        label: "Drawing",
        links: [
          ["Pixel sprites", "#pixel-sprites"],
          ["Arcade primitives", "#arcade-primitives"],
          ["HUD overlays", "#hud-overlays"],
        ],
      },
      {
        label: "Audio",
        links: [
          ["Audio overview", "#audio-addons"],
          ["Audio Arcade", "#audio-arcade"],
          ["Howler and Tone", "#audio-adapters"],
        ],
      },
      {
        label: "Runtime",
        links: [
          ["Animation loop", "#animation-loop"],
          ["Input and motion", "#input-motion"],
          ["State and sprites", "#state-sprites"],
          ["Build a small game", "#game-architecture"],
        ],
      },
      {
        label: "Reference",
        links: [
          ["API map", "#api-reference"],
          ["Method reference", "#method-reference"],
          ["Recipes", "#recipes"],
          ["Errors", "#errors"],
          ["Performance", "#performance"],
          ["Tutorials", "/tutorials/"],
          ["Playground", "/playground/"],
          ["Live examples", "/#examples"],
          ["Release notes", `${repoUrl}/blob/main/CHANGELOG.md`],
        ],
      },
    ],
    pageTitle: "Documentation / Grid Canvas System",
    pagination: {
      backLabel: "Back",
      backText: "Landing page",
      nextLabel: "Next",
      nextText: "Playground",
    },
    playgroundLabel: "Playground",
    repoAria: "Open GitHub repository",
    searchEmpty: "No matching pages.",
    searchPlaceholder: "Filter docs",
    tutorialsLabel: "Tutorials",
    tutorialsPath: "/tutorials/",
    toc: [
      ["Overview", "#overview"],
      ["Installation", "#installation"],
      ["Your first scene", "#first-scene"],
      ["Canvas options", "#canvas-options"],
      ["Redraw lifecycle", "#redraw-lifecycle"],
      ["Pixel sprites", "#pixel-sprites"],
      ["Audio add-ons", "#audio-addons"],
      ["Audio Arcade", "#audio-arcade"],
      ["Howler and Tone", "#audio-adapters"],
      ["Animation loop", "#animation-loop"],
      ["Input and motion", "#input-motion"],
      ["Build a small game", "#game-architecture"],
      ["Playground", "#playground"],
      ["API map", "#api-reference"],
      ["Method reference", "#method-reference"],
      ["Errors", "#errors"],
      ["Performance", "#performance"],
    ],
    tocLabel: "On this page",
  },
  es: {
    alternateLabel: "EN",
    alternatePath: "/docs/",
    breadcrumbs: {
      current: "Primeros pasos",
      root: "Docs",
    },
    callout: {
      title: "Buen encaje",
      text: "Ensenanza, herramientas pixel, pequenos bocetos arcade y diagramas interactivos donde sigue importando tocar canvas y ctx directamente.",
    },
    copyPageLabel: "Copiar pagina de documentacion",
    currentPath: "/es/docs/",
    docsBadge: "Docs ES",
    introKicker: "Primeros pasos",
    introText:
      "Grid Canvas System es una capa pequena y TypeScript-first sobre la API 2D de Canvas. Te da una grilla legible, primitivas de dibujo, add-ons de audio opcionales y helpers de runtime sin esconder el canvas.",
    introTitle: "Construye tu primera escena en Canvas.",
    lang: "es",
    metaDescription:
      "Guias y orientacion de API para grid-canvas-system, incluidos los add-ons de audio opcionales.",
    navigation: [
      {
        label: "Empieza aqui",
        links: [
          ["Resumen", "#overview"],
          ["Instalacion", "#installation"],
          ["Primera escena", "#first-scene"],
        ],
      },
      {
        label: "Canvas base",
        links: [
          ["Opciones del canvas", "#canvas-options"],
          ["Ciclo de redibujado", "#redraw-lifecycle"],
        ],
      },
      {
        label: "Dibujo",
        links: [
          ["Sprites pixel", "#pixel-sprites"],
          ["Primitivas arcade", "#arcade-primitives"],
          ["HUD", "#hud-overlays"],
        ],
      },
      {
        label: "Audio",
        links: [
          ["Resumen de audio", "#audio-addons"],
          ["Audio Arcade", "#audio-arcade"],
          ["Howler y Tone", "#audio-adapters"],
        ],
      },
      {
        label: "Runtime",
        links: [
          ["Loop de animacion", "#animation-loop"],
          ["Input y movimiento", "#input-motion"],
          ["Estados y sprites", "#state-sprites"],
          ["Construir un juego", "#game-architecture"],
        ],
      },
      {
        label: "Referencia",
        links: [
          ["Mapa de API", "#api-reference"],
          ["Referencia de metodos", "#method-reference"],
          ["Recetas", "#recipes"],
          ["Errores", "#errors"],
          ["Performance", "#performance"],
          ["Tutoriales", "/es/tutorials/"],
          ["Playground", "/playground/"],
          ["Ejemplos en vivo", "/#examples"],
          ["Notas de version", `${repoUrl}/blob/main/CHANGELOG.md`],
        ],
      },
    ],
    pageTitle: "Documentacion / Grid Canvas System",
    pagination: {
      backLabel: "Volver",
      backText: "Pagina principal",
      nextLabel: "Siguiente",
      nextText: "Playground",
    },
    playgroundLabel: "Playground",
    repoAria: "Abrir repositorio en GitHub",
    searchEmpty: "No hay coincidencias.",
    searchPlaceholder: "Filtrar docs",
    tutorialsLabel: "Tutoriales",
    tutorialsPath: "/es/tutorials/",
    toc: [
      ["Resumen", "#overview"],
      ["Instalacion", "#installation"],
      ["Primera escena", "#first-scene"],
      ["Opciones del canvas", "#canvas-options"],
      ["Ciclo de redibujado", "#redraw-lifecycle"],
      ["Sprites pixel", "#pixel-sprites"],
      ["Add-ons de audio", "#audio-addons"],
      ["Audio Arcade", "#audio-arcade"],
      ["Howler y Tone", "#audio-adapters"],
      ["Loop de animacion", "#animation-loop"],
      ["Input y movimiento", "#input-motion"],
      ["Construir un juego", "#game-architecture"],
      ["Playground", "#playground"],
      ["Mapa de API", "#api-reference"],
      ["Referencia de metodos", "#method-reference"],
      ["Errores", "#errors"],
      ["Performance", "#performance"],
    ],
    tocLabel: "En esta pagina",
  },
};

export const docsApiGroupsByLocale: Record<DocsLocale, DocsApiGroup[]> = {
  en: [
    ["Core", "constructor, canvas, ctx, options, clearCanvas"],
    ["Drawing", "raw and compiled sprites, shapes, lines, text, HUD"],
    ["Audio", "arcade cues, loops, optional Howler and Tone adapters"],
    ["Runtime", "variable and fixed loops, input, motion, state, scenes, tilemaps"],
  ],
  es: [
    ["Base", "constructor, canvas, ctx, options, clearCanvas"],
    ["Dibujo", "sprites crudos y compilados, formas, lineas, texto, HUD"],
    ["Audio", "cues arcade, loops, adapters opcionales de Howler y Tone"],
    [
      "Runtime",
      "loops variables y fijos, input, movimiento, estado, escenas y tilemaps",
    ],
  ],
};

export const docsMethodGroupsByLocale: Record<DocsLocale, DocsMethodGroup[]> = {
  en: [
    {
      name: "Core",
      methods: [
        [
          "new GridCanvasSystem(id, options?)",
          "Create and validate a managed 2D canvas.",
        ],
        [
          "clearCanvas(options?)",
          "Clear the frame and optionally redraw the configured grid.",
        ],
        [
          "canvas / ctx / options",
          "Supported escape hatches and resolved configuration.",
        ],
      ],
    },
    {
      name: "Drawing",
      methods: [
        [
          "drawPixelSprite(sprite, options)",
          "Render strict palette-based pixel matrices.",
        ],
        [
          "drawCompiledPixelSprite(compiled, options)",
          "Render a precompiled pixel sprite repeatedly.",
        ],
        ["drawLine(start, end, options?)", "Draw a managed line segment."],
        ["drawPolyline(points, options?)", "Draw an open or closed path."],
        [
          "drawPacman(x, y, radius, mouth, options?)",
          "Draw an animated circular sector character.",
        ],
        [
          "drawGhost(center, radius, options?)",
          "Draw configurable feet, eyes and rotation.",
        ],
        [
          "drawShip(center, radius, options?)",
          "Draw a curved ship with guides and thruster.",
        ],
        [
          "drawAsteroid(center, radius, shape, options?)",
          "Reuse deterministic asteroid shape data.",
        ],
        ["drawBarIndicator(...)", "Draw a labeled proportional status bar."],
        [
          "drawMessage(main, sub, center, options?)",
          "Draw a centered two-line overlay.",
        ],
      ],
    },
    {
      name: "Audio",
      methods: [
        [
          "createArcadeAudio(options?)",
          "Create browser-native retro SFX and looping 8-bit cues.",
        ],
        [
          "playShoot / playPickup / playExplosion",
          "Trigger the built-in arcade one-shot presets.",
        ],
        [
          "playLoop / stopLoop / mute / dispose",
          "Control looping cues and browser audio lifecycle.",
        ],
        [
          "createHowlerAssetAudio(config)",
          "Load asset playback and sprite-based SFX through Howler.",
        ],
        [
          "createToneMusicAudio(options?)",
          "Trigger synth notes or registered sequences through Tone.",
        ],
      ],
    },
    {
      name: "Runtime",
      methods: [
        [
          "createAnimationLoop(options)",
          "Run update and draw callbacks with elapsed seconds.",
        ],
        [
          "createFixedStepLoop(options)",
          "Run deterministic updates at a fixed simulation step.",
        ],
        [
          "createSceneManager(options)",
          "Coordinate enter, update, draw, exit and transition hooks.",
        ],
        [
          "createSpriteAnimator(options)",
          "Advance named frame IDs independently of rendering.",
        ],
        ["createStateMachine(options)", "Validate explicit state transitions."],
        [
          "createKeyTracker(target, options?)",
          "Track normalized keys on an explicit target.",
        ],
        [
          "createPointerTracker(target, options?)",
          "Track canvas-relative pointer state.",
        ],
        ["canvasToGrid / gridToCanvas", "Convert between absolute points and cells."],
        [
          "drawTileMap / hitTestTileMap",
          "Draw simple character maps and test solid tile collisions.",
        ],
        [
          "hitTestPoint / hitTestRectangle / hitTestCircleRectangle",
          "Test common point, rectangle and mixed-shape collision targets.",
        ],
        ["circlesIntersect(a, b)", "Test overlap between two circular actors."],
        [
          "createParticleBurst / stepParticles",
          "Create and advance lightweight particles.",
        ],
        ["MassBody", "Integrate force, velocity, rotation and wrapping."],
      ],
    },
  ],
  es: [
    {
      name: "Base",
      methods: [
        [
          "new GridCanvasSystem(id, options?)",
          "Crea y valida un canvas 2D administrado.",
        ],
        [
          "clearCanvas(options?)",
          "Limpia el frame y puede redibujar la grilla configurada.",
        ],
        [
          "canvas / ctx / options",
          "Puntos de escape soportados y configuracion resuelta.",
        ],
      ],
    },
    {
      name: "Dibujo",
      methods: [
        [
          "drawPixelSprite(sprite, options)",
          "Renderiza matrices pixel con paletas estrictas.",
        ],
        [
          "drawCompiledPixelSprite(compiled, options)",
          "Renderiza un sprite pixel compilado de forma repetida.",
        ],
        ["drawLine(start, end, options?)", "Dibuja un segmento de linea administrado."],
        ["drawPolyline(points, options?)", "Dibuja una ruta abierta o cerrada."],
        [
          "drawPacman(x, y, radius, mouth, options?)",
          "Dibuja un personaje de sector circular animado.",
        ],
        [
          "drawGhost(center, radius, options?)",
          "Dibuja pies, ojos y rotacion configurables.",
        ],
        [
          "drawShip(center, radius, options?)",
          "Dibuja una nave curva con guias y thruster.",
        ],
        [
          "drawAsteroid(center, radius, shape, options?)",
          "Reutiliza datos deterministas de asteroides.",
        ],
        ["drawBarIndicator(...)", "Dibuja una barra proporcional con etiqueta."],
        [
          "drawMessage(main, sub, center, options?)",
          "Dibuja un overlay centrado de dos lineas.",
        ],
      ],
    },
    {
      name: "Audio",
      methods: [
        [
          "createArcadeAudio(options?)",
          "Crea SFX retro nativos del navegador y cues 8-bit en loop.",
        ],
        [
          "playShoot / playPickup / playExplosion",
          "Dispara los presets arcade integrados.",
        ],
        [
          "playLoop / stopLoop / mute / dispose",
          "Controla loops y el ciclo de vida del audio en navegador.",
        ],
        [
          "createHowlerAssetAudio(config)",
          "Carga reproduccion de assets y audio sprites con Howler.",
        ],
        [
          "createToneMusicAudio(options?)",
          "Dispara notas sintetizadas o secuencias registradas con Tone.",
        ],
      ],
    },
    {
      name: "Runtime",
      methods: [
        [
          "createAnimationLoop(options)",
          "Ejecuta callbacks de update y draw con segundos transcurridos.",
        ],
        [
          "createFixedStepLoop(options)",
          "Ejecuta updates deterministas con un paso de simulacion fijo.",
        ],
        [
          "createSceneManager(options)",
          "Coordina enter, update, draw, exit y transition entre escenas.",
        ],
        [
          "createSpriteAnimator(options)",
          "Avanza IDs de frames sin depender del render.",
        ],
        ["createStateMachine(options)", "Valida transiciones de estado explicitas."],
        [
          "createKeyTracker(target, options?)",
          "Sigue teclas normalizadas sobre un target explicito.",
        ],
        [
          "createPointerTracker(target, options?)",
          "Sigue el puntero relativo al canvas.",
        ],
        ["canvasToGrid / gridToCanvas", "Convierte entre puntos absolutos y celdas."],
        [
          "drawTileMap / hitTestTileMap",
          "Dibuja mapas de caracteres y prueba colisiones contra tiles solidos.",
        ],
        [
          "hitTestPoint / hitTestRectangle / hitTestCircleRectangle",
          "Prueba colisiones comunes de punto, rectangulo y formas mixtas.",
        ],
        [
          "circlesIntersect(a, b)",
          "Prueba superposicion entre dos actores circulares.",
        ],
        ["createParticleBurst / stepParticles", "Crea y avanza particulas ligeras."],
        ["MassBody", "Integra fuerza, velocidad, rotacion y wrapping."],
      ],
    },
  ],
};

export const docsRecipesByLocale: Record<DocsLocale, DocsRecipe[]> = {
  en: [
    [
      "Prototype retro feedback",
      "Unlock browser audio and test the audio-arcade addon directly in the Playground.",
      "audio-arcade",
    ],
    [
      "Build Grid Pong",
      "Connect pointer input, paddle AI, collisions, scoring and match states.",
      "grid-pong",
    ],
    [
      "Make an action game",
      "Combine keyboard and touch input with projectiles, lives and particles.",
      "asteroid-dodge",
    ],
    [
      "Animate a sprite",
      "Combine a sprite animator, state machine and drawPixelSprite().",
      "grid-buddy",
    ],
    ["Build a game HUD", "Compose score, health and centered status messages.", "hud"],
    [
      "Snap pointer input",
      "Track a pointer and convert its position into a grid cell.",
      "grid-input",
    ],
    [
      "Explore collision response",
      "Move a circle through walls and collect circular targets.",
      "collision-course",
    ],
    [
      "Create a particle burst",
      "Advance short-lived scene particles with gravity and drag.",
      "particles",
    ],
  ],
  es: [
    [
      "Prototipa feedback retro",
      "Desbloquea el audio del navegador y prueba audio-arcade directo en el Playground.",
      "audio-arcade",
    ],
    [
      "Construye Grid Pong",
      "Conecta input por puntero, IA de pala, colisiones, score y estados de partida.",
      "grid-pong",
    ],
    [
      "Haz un juego de accion",
      "Combina teclado y touch con proyectiles, vidas y particulas.",
      "asteroid-dodge",
    ],
    [
      "Anima un sprite",
      "Combina sprite animator, state machine y drawPixelSprite().",
      "grid-buddy",
    ],
    ["Construye un HUD", "Compone score, salud y mensajes de estado centrados.", "hud"],
    [
      "Ajusta el puntero a la grilla",
      "Sigue el puntero y convierte su posicion a una celda.",
      "grid-input",
    ],
    [
      "Explora respuesta a colisiones",
      "Mueve un circulo entre muros y recoge objetivos circulares.",
      "collision-course",
    ],
    [
      "Crea una rafaga de particulas",
      "Avanza particulas de vida corta con gravedad y drag.",
      "particles",
    ],
  ],
};

export const docsErrorRowsByLocale: Record<DocsLocale, DocsErrorRow[]> = {
  en: [
    [
      "Canvas not found",
      "The constructor ID must reference an existing canvas element.",
    ],
    ["Invalid grid rhythm", "majorStep must be an exact multiple of cellSize."],
    ["Irregular sprite", "Every sprite row must have the same character count."],
    ["Unknown palette key", "Every non-empty sprite character needs a palette entry."],
    [
      "Audio still locked",
      "Web Audio needs a click, tap or key press before playback can start.",
    ],
    [
      "Missing peer dependency",
      "Install howler and tone only in applications that use grid-canvas-system/audio.",
    ],
    ["Invalid transition", "transition() returns false and keeps the current state."],
  ],
  es: [
    [
      "Canvas no encontrado",
      "El ID del constructor debe apuntar a un canvas existente.",
    ],
    ["Ritmo de grilla invalido", "majorStep debe ser un multiplo exacto de cellSize."],
    [
      "Sprite irregular",
      "Cada fila del sprite debe tener la misma cantidad de caracteres.",
    ],
    [
      "Clave de paleta desconocida",
      "Cada caracter no vacio del sprite necesita una entrada en la paleta.",
    ],
    [
      "Audio aun bloqueado",
      "Web Audio necesita click, toque o teclado antes de poder reproducir.",
    ],
    [
      "Peer dependency faltante",
      "Instala howler y tone solo en apps que usen grid-canvas-system/audio.",
    ],
    ["Transicion invalida", "transition() devuelve false y mantiene el estado actual."],
  ],
};

export const docsPerformanceNotesByLocale: Record<DocsLocale, DocsPerformanceNote[]> = {
  en: [
    ["Cap DPR", "Use a lower devicePixelRatio for large animated canvases."],
    ["Reuse shapes", "Create asteroid data and static palettes outside draw()."],
    ["Pause hidden loops", "Stop animation when previews leave the viewport."],
    ["Clamp elapsed", "Set maxElapsed to avoid jumps after an inactive tab resumes."],
  ],
  es: [
    ["Limita DPR", "Usa un devicePixelRatio menor en canvases animados grandes."],
    [
      "Reutiliza formas",
      "Crea datos de asteroides y paletas estaticas fuera de draw().",
    ],
    [
      "Pausa loops ocultos",
      "Deten la animacion cuando los previews salgan del viewport.",
    ],
    [
      "Limita elapsed",
      "Configura maxElapsed para evitar saltos tras volver desde una pestana inactiva.",
    ],
  ],
};
