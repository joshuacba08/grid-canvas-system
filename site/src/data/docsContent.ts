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
    | "canvasRuntime"
    | "spriteAnimator"
    | "stateMachine"
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
    key: "canvasRuntime",
    id: "canvas-runtime-code",
    title: "canvas-runtime.ts",
    lang: "typescript",
    code: `import { createCanvasRuntime } from "grid-canvas-system/runtime";

const canvas = document.querySelector<HTMLCanvasElement>("#scene");

if (canvas === null) {
  throw new Error("Canvas #scene not found");
}

const runtime = createCanvasRuntime({
  canvas,
  logicalWidth: 320,
  logicalHeight: 180,
  pixelRatio: "auto",
  maxPixelRatio: 2,
  pauseWhenHidden: true,
  reducedMotion: "lower-fps",
  update(deltaMs) {
    actor.update(deltaMs);
  },
  render(ctx) {
    drawScene(ctx, actor);
  }
});

const unsubscribe = runtime.onPointerMove(({ x, y }) => {
  actor.target = { x, y };
});

runtime.resizeToDisplaySize();
runtime.start();

export function cleanup() {
  unsubscribe();
  runtime.destroy();
}`,
  },
  {
    key: "spriteAnimator",
    id: "sprite-animator-code",
    title: "sprite-animator.ts",
    lang: "typescript",
    code: `const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  initial: "idle",
  animations: {
    idle: { frames: ["idleA", "idleB"], fps: 4, loop: true },
    wave: { frames: ["waveA", "waveB", "waveC"], fps: 10, loop: false }
  }
});

animator.play("wave", {
  restart: true,
  onComplete() {
    animator.play("idle");
  }
});

const offFrame = animator.subscribe((event) => {
  if (event.type === "frame") {
    redraw(event.frame);
  }
});`,
  },
  {
    key: "stateMachine",
    id: "state-machine-code",
    title: "state-machine.ts",
    lang: "typescript",
    code: `const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: {
    idle: ["tracking"],
    tracking: ["idle", "acting"],
    acting: ["idle"]
  },
  states: {
    acting: {
      onEnter({ metadata }) {
        console.log("acting", metadata);
      }
    }
  },
  historyLimit: 8
});

const offState = machine.subscribe((event) => {
  animator.play(event.to === "acting" ? "wave" : "idle");
});

machine.transition("tracking", {
  metadata: { source: "pointer" }
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
          ["Canvas runtime", "#canvas-runtime"],
          ["Animation loop", "#animation-loop"],
          ["Input and motion", "#input-motion"],
          ["State and sprites", "#state-sprites"],
          ["Framework cleanup", "#framework-cleanup"],
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
      ["Canvas runtime", "#canvas-runtime"],
      ["Animation loop", "#animation-loop"],
      ["Input and motion", "#input-motion"],
      ["State and sprites", "#state-sprites"],
      ["Framework cleanup", "#framework-cleanup"],
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
          ["Runtime canvas", "#canvas-runtime"],
          ["Loop de animacion", "#animation-loop"],
          ["Input y movimiento", "#input-motion"],
          ["Estados y sprites", "#state-sprites"],
          ["Cleanup en frameworks", "#framework-cleanup"],
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
      ["Runtime canvas", "#canvas-runtime"],
      ["Loop de animacion", "#animation-loop"],
      ["Input y movimiento", "#input-motion"],
      ["Estados y sprites", "#state-sprites"],
      ["Cleanup en frameworks", "#framework-cleanup"],
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
    [
      "Runtime",
      "canvas runtime, loop lifecycle, reduced motion, input, state, scenes, tilemaps",
    ],
  ],
  es: [
    ["Base", "constructor, canvas, ctx, options, clearCanvas"],
    ["Dibujo", "sprites crudos y compilados, formas, lineas, texto, HUD"],
    ["Audio", "cues arcade, loops, adapters opcionales de Howler y Tone"],
    [
      "Runtime",
      "runtime canvas, lifecycle de loops, reduced motion, input, estado, escenas y tilemaps",
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
          "createCanvasRuntime(options)",
          "Manage a 2D canvas with logical size, DPR, resize, pointer events and cleanup.",
        ],
        [
          "createAnimationLoop(options)",
          "Run update/draw callbacks with legacy seconds or v2 millisecond callbacks and lifecycle controls.",
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
          "Advance legacy or v2 animation definitions, one-shots and frame events independently of rendering.",
        ],
        [
          "createStateMachine(options)",
          "Validate generic transitions with metadata, hooks, subscriptions and bounded history.",
        ],
        [
          "getMotionPreference(window?)",
          "Read prefers-reduced-motion lazily without touching window during import.",
        ],
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
          "createCanvasRuntime(options)",
          "Administra canvas 2D con tamano logico, DPR, resize, eventos de puntero y cleanup.",
        ],
        [
          "createAnimationLoop(options)",
          "Ejecuta callbacks legacy en segundos o callbacks v2 en milisegundos con controles de lifecycle.",
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
          "Avanza animaciones legacy o v2, one-shots y eventos de frame sin depender del render.",
        ],
        [
          "createStateMachine(options)",
          "Valida transiciones genericas con metadata, hooks, suscripciones e historial limitado.",
        ],
        [
          "getMotionPreference(window?)",
          "Lee prefers-reduced-motion sin tocar window durante el import.",
        ],
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
      "Use the 1.1 canvas runtime",
      "Resize with DPR, subscribe to logical pointer coordinates and destroy cleanly on unmount.",
      "canvas-runtime",
    ],
    [
      "Play a one-shot animation",
      "Use Sprite Animator v2 to play an action once and return to idle on completion.",
      "sprite-one-shot",
    ],
    [
      "Connect state to animation",
      "Subscribe to State Machine v2 transitions and keep rendering independent from state flow.",
      "state-machine-sync",
    ],
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
      "Usa el runtime canvas 1.1",
      "Redimensiona con DPR, suscribete a coordenadas logicas de puntero y destruye limpio en unmount.",
      "canvas-runtime",
    ],
    [
      "Reproduce una animacion one-shot",
      "Usa Sprite Animator v2 para ejecutar una accion una vez y volver a idle al completar.",
      "sprite-one-shot",
    ],
    [
      "Conecta estado y animacion",
      "Suscribete a transiciones de State Machine v2 y manten el render separado del flujo de estado.",
      "state-machine-sync",
    ],
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
      "Canvas target missing",
      "CanvasTargetNotFoundError means the ID is wrong or the element is not a canvas.",
    ],
    [
      "2D context unavailable",
      "CanvasContextUnavailableError means the browser could not create a canvas 2D context.",
    ],
    [
      "Runtime destroyed",
      "RuntimeDestroyedError protects lifecycle bugs after destroy().",
    ],
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
      "Canvas target faltante",
      "CanvasTargetNotFoundError indica que el ID es incorrecto o el elemento no es canvas.",
    ],
    [
      "Contexto 2D no disponible",
      "CanvasContextUnavailableError indica que el navegador no pudo crear un contexto 2D.",
    ],
    [
      "Runtime destruido",
      "RuntimeDestroyedError protege bugs de lifecycle despues de destroy().",
    ],
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
    [
      "Destroy on unmount",
      "Call destroy() to release RAF handles and pointer listeners.",
    ],
    [
      "Respect reduced motion",
      'Use reducedMotion: "pause" or "lower-fps" for user preference aware loops.',
    ],
    ["Reuse shapes", "Create asteroid data and static palettes outside draw()."],
    ["Pause hidden loops", "Stop animation when previews leave the viewport."],
    ["Clamp elapsed", "Set maxElapsed to avoid jumps after an inactive tab resumes."],
  ],
  es: [
    ["Limita DPR", "Usa un devicePixelRatio menor en canvases animados grandes."],
    ["Destruye en unmount", "Llama destroy() para liberar RAF y listeners de puntero."],
    [
      "Respeta reduced motion",
      'Usa reducedMotion: "pause" o "lower-fps" para loops sensibles a la preferencia del usuario.',
    ],
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
