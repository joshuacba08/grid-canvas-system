import { libraryVersion } from "./siteRelease";

export type TutorialLocale = "en" | "es";
export type TutorialLevel = "basic" | "intermediate" | "advanced";

export interface TutorialResource {
  href: string;
  label: string;
}

export interface TutorialCodeBlock {
  code: string;
  language: "html" | "javascript" | "typescript";
  title: string;
}

export interface TutorialStep {
  body: string[];
  callout?: {
    text: string;
    title: string;
  };
  checklist?: string[];
  code?: string;
  codeBlocks?: TutorialCodeBlock[];
  codeTitle?: string;
  diagram?: {
    caption?: string;
    source: string;
    title: string;
  };
  expected?: {
    text: string;
    title?: string;
  };
  id: string;
  interactive?:
    | {
        description: string;
        example?: string;
        files?: {
          html: string;
          javascript: string;
        };
        kind: "playground";
        title: string;
      }
    | {
        description: string;
        kind: "audio-demo";
        title: string;
        variant: "adapters" | "arcade";
      }
    | {
        description: string;
        kind: "canvas-id";
        title: string;
      };
  milestone?: string;
  minutes: string;
  question?: string;
  resources?: TutorialResource[];
  title: string;
  why?: {
    text: string;
    title?: string;
  };
}

export interface TutorialTrack {
  audience: string;
  coverage: string[];
  duration: string;
  level: TutorialLevel;
  outcomes: string[];
  prerequisites: string[];
  project?: {
    deliverables: string[];
    description: string;
    label: string;
    title: string;
  };
  slug: TutorialLevel;
  steps: TutorialStep[];
  summary: string;
  title: string;
}

interface TutorialCoverageRow {
  feature: string;
  level: TutorialLevel;
  note: string;
}

interface TutorialLocaleContent {
  backHomeLabel: string;
  backToTutorialsLabel: string;
  coverageTitle: string;
  coverageTableHeaders: {
    feature: string;
    level: string;
    note: string;
  };
  coverageRows: TutorialCoverageRow[];
  ctaLabel: string;
  docsPath: string;
  emptyState: string;
  hub: {
    heroKicker: string;
    heroText: string;
    heroTitle: string;
    orderText: string;
    orderTitle: string;
    scopeText: string;
    scopeTitle: string;
  };
  lang: string;
  levelLabels: Record<TutorialLevel, string>;
  mobileMenuLabel: string;
  pageTitle: string;
  playgroundLabel: string;
  repoAria: string;
  searchPlaceholder: string;
  siteBadge: string;
  stepLabels: {
    audience: string;
    duration: string;
    interactive: string;
    openInPlayground: string;
    outcomes: string;
    prerequisites: string;
    resources: string;
    steps: string;
  };
  summaryLabel: string;
  topbarTitle: string;
  tracks: Record<TutorialLevel, TutorialTrack>;
  tutorialsPath: string;
  versionLabel: string;
}

const trackOrder: readonly TutorialLevel[] = ["basic", "intermediate", "advanced"];
const repoUrl = "https://github.com/joshuacba08/grid-canvas-system";

export function getTutorialBasePath(locale: TutorialLocale): string {
  return locale === "en" ? "/tutorials/" : `/${locale}/tutorials/`;
}

export function getTutorialTrackPath(
  locale: TutorialLocale,
  level: TutorialLevel,
): string {
  return `${getTutorialBasePath(locale)}${level}/`;
}

export function getTutorialAlternateLocale(locale: TutorialLocale): TutorialLocale {
  return locale === "en" ? "es" : "en";
}

export function getTrackOrder(): readonly TutorialLevel[] {
  return trackOrder;
}

export const tutorialsContentByLocale: Record<TutorialLocale, TutorialLocaleContent> = {
  en: {
    backHomeLabel: "Back home",
    backToTutorialsLabel: "Back to tracks",
    coverageTitle: "Coverage map",
    coverageTableHeaders: {
      feature: "Capability",
      level: "Track",
      note: "What you practice",
    },
    coverageRows: [
      {
        feature: "Core canvas and grid configuration",
        level: "basic",
        note: "Sizing, HiDPI, labels, clear strategy and predictable scene setup.",
      },
      {
        feature: "Drawing primitives and HUD overlays",
        level: "basic",
        note: "Shapes, text, bars, messages and reusable scene decoration.",
      },
      {
        feature: "Pixel Sprite v2",
        level: "basic",
        note: "Compile, tint, flip, draw and hit-test sprites without revalidating each frame.",
      },
      {
        feature: "Pointer helpers and grid math",
        level: "basic",
        note: "Pointer tracking plus canvas/grid conversion and snapping.",
      },
      {
        feature: "Variable animation loop",
        level: "basic",
        note: "Frame update and draw separation for simple reactive scenes.",
      },
      {
        feature: "Fixed-step loops",
        level: "intermediate",
        note: "Deterministic updates for repeatable gameplay and simulation.",
      },
      {
        feature: "MassBody, particles and collisions",
        level: "intermediate",
        note: "Motion integration, impacts, trails and lightweight feedback systems.",
      },
      {
        feature: "Tilemaps",
        level: "intermediate",
        note: "Draw character maps, reuse compiled tiles and block movement with solid tiles.",
      },
      {
        feature: "Sprite animator and state machine",
        level: "intermediate",
        note: "Separate animation frame flow from gameplay state flow.",
      },
      {
        feature: "Scene manager",
        level: "advanced",
        note: "Move between menu, game, pause and results screens with explicit transitions.",
      },
      {
        feature: "Audio Arcade",
        level: "advanced",
        note: "Trigger browser-native SFX and loops with proper gesture gating.",
      },
      {
        feature: "Howler and Tone adapters",
        level: "advanced",
        note: "Wire the experimental adapter lane for assets, sequences and music cues.",
      },
      {
        feature: "Migration and packaging",
        level: "advanced",
        note: "Read the stable contract, migration notes and release verification workflow.",
      },
    ],
    ctaLabel: "Open tutorial",
    docsPath: "/docs/",
    emptyState: "No tutorial track found.",
    hub: {
      heroKicker: `Tutorials for v${libraryVersion}`,
      heroText:
        "Choose the path you need right now, follow each step in order and finish with something you can keep building on immediately.",
      heroTitle: "Codelab-style learning paths for the full library.",
      orderText:
        "Start with the basics, move into deterministic runtime patterns and finish with scenes, audio and release checks when your project needs them.",
      orderTitle: "Recommended order",
      scopeText:
        "Across the three tracks you will touch the whole 1.1 surface: core canvas setup, Pixel Sprite v2, runtime helpers, tilemaps, scene flow and the optional audio lanes.",
      scopeTitle: "100% capability scope",
    },
    lang: "en",
    levelLabels: {
      advanced: "Advanced",
      basic: "Basic",
      intermediate: "Intermediate",
    },
    mobileMenuLabel: "Open tutorial steps",
    pageTitle: "Tutorials / Grid Canvas System",
    playgroundLabel: "Playground",
    repoAria: "Open GitHub repository",
    searchPlaceholder: "Filter steps",
    siteBadge: "Tutorials",
    stepLabels: {
      audience: "Best for",
      duration: "Duration",
      interactive: "Try it live",
      openInPlayground: "Open in Playground",
      outcomes: "Outcomes",
      prerequisites: "Prerequisites",
      resources: "Resources",
      steps: "Steps",
    },
    summaryLabel: "Choose your path",
    topbarTitle: "Grid Canvas System",
    tracks: {
      basic: {
        audience:
          "Use this track if you want to learn the core canvas, drawing and sprite workflow quickly and leave with a first interactive scene.",
        coverage: [
          "Core canvas setup",
          "Drawing primitives",
          "HUD overlays",
          "Pixel Sprite v2",
          "Pointer + grid helpers",
          "Variable loop",
        ],
        duration: "45 min",
        level: "basic",
        outcomes: [
          "Initialize a crisp grid-first canvas with readable defaults.",
          "Render shapes, HUD overlays and compiled sprites efficiently.",
          "Turn pointer input into grid-aware interactions and a first moving scene.",
        ],
        prerequisites: [
          "Comfort with ES modules and a single canvas element.",
          "A dev server or the library playground available in the browser.",
        ],
        slug: "basic",
        steps: [
          {
            body: [
              "Start with the constructor and lock the grid rhythm before writing any scene logic. In the stable 1.1 line, the fastest win is still a canvas that exposes width, height, cellSize and majorStep clearly.",
              "Treat this step as your reusable bootstrap. Once the grid is stable, every later tutorial can layer motion, tiles or scenes on top without revisiting rendering setup.",
            ],
            checklist: [
              "Create a canvas element and initialize GridCanvasSystem with width, height and cellSize.",
              "Tune majorStep, backgroundColor and label colors so the grid remains legible during debugging.",
              "Call clearCanvas() once and verify the managed context draws a consistent board.",
            ],
            code: `import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607"
});

grid.clearCanvas();`,
            codeTitle: "Bootstrap the grid shell",
            id: "setup-grid",
            minutes: "8 min",
            resources: [
              { href: "/docs/#canvas-options", label: "Canvas options" },
              {
                href: "/playground/?example=pixel-sprite",
                label: "Playground starter",
              },
            ],
            title: "Set up a predictable canvas shell",
          },
          {
            body: [
              "Before gameplay state exists, rehearse the drawing layer. The stable surface deliberately keeps shapes and HUD helpers independent so you can validate composition without a scene system.",
              "Use one pass to draw primitives and another to overlay status information. That habit maps cleanly to every loop in the later tracks.",
            ],
            checklist: [
              "Place at least one shape helper such as drawPacman(), drawGhost() or drawShip().",
              "Add drawMessage(), drawValueLabel() or drawBarIndicator() for HUD feedback.",
              "Keep drawing order explicit: background, actors, then overlays.",
            ],
            code: `grid.drawShip({ x: 260, y: 180 }, 42, {
  rotation: -Math.PI / 2,
  fillColor: "#101722",
  strokeColor: "#e8f7ef"
});

grid.drawBarIndicator("HP", 18, 18, 100, 12, 72, 100, {
  fillColor: "#00d43b",
  textColor: "#e8f7ef"
});`,
            codeTitle: "Compose shapes and HUD overlays",
            id: "drawing-layer",
            minutes: "8 min",
            resources: [
              { href: "/docs/#arcade-primitives", label: "Arcade primitives" },
              { href: "/docs/#hud-overlays", label: "HUD overlays" },
            ],
            title: "Practice the drawing layer without gameplay state",
          },
          {
            body: [
              "Pixel Sprite v2 is one of the big reasons to stay on the 1.1 stable line. Compile repeated sprites once, then use drawCompiledPixelSprite() everywhere a loop would otherwise keep re-reading strings.",
              "This step also covers pure transforms and validation helpers. Bounds, tinting and hit testing stay available without introducing a scene graph.",
            ],
            checklist: [
              "Create a palette with createPixelPalette() and compile a sprite once.",
              "Render the compiled sprite and experiment with tint or horizontal flips.",
              "Read bounds or run hitTestPixelSprite() to prepare for interaction.",
            ],
            code: `const palette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#00D43B",
  "2": "#4DA9FF"
});

const player = GridCanvasSystem.compilePixelSprite([
  "00111100",
  "01122110",
  "11222211"
], palette);

grid.drawCompiledPixelSprite(player, {
  x: 120,
  y: 90,
  pixelSize: 8
});`,
            codeTitle: "Compile and draw sprite assets once",
            id: "pixel-sprite-v2",
            minutes: "10 min",
            resources: [
              { href: "/docs/#pixel-sprites", label: "Pixel Sprite v2 docs" },
              {
                href: `${repoUrl}/blob/main/scripts/benchmark-pixel-sprites.mjs`,
                label: "Sprite benchmark",
              },
            ],
            title: "Adopt compiled sprites for repeated drawing",
          },
          {
            body: [
              "Once visuals are stable, make the scene grid-aware. Pointer tracking plus canvasToGrid(), gridToCanvas() and snapPointToGrid() give you deterministic placement without raw DOM math leaking into the app.",
              "Keep this interaction layer separate from rendering. The same pointer data can later drive tile placement, selection and scene transitions.",
            ],
            checklist: [
              "Attach createPointerTracker() to the managed canvas.",
              "Translate the pointer position into a cell and snap the actor to that cell.",
              "Use point or rectangle hit tests before writing collision-specific logic.",
            ],
            code: `const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas);

const pointerPosition = pointer.position();

if (pointerPosition !== null) {
  const cell = GridCanvasSystem.runtime.canvasToGrid(pointerPosition, { cellSize: 20 });
  const snapped = GridCanvasSystem.runtime.gridToCanvas(cell, { cellSize: 20 });
  grid.drawCoordinate(snapped.x, snapped.y);
}`,
            codeTitle: "Turn pointer movement into grid-aware input",
            id: "grid-aware-input",
            interactive: {
              description:
                "Open a ready-made playground scene that tracks the pointer, snaps it to the grid and lets you inspect the helper calls used in this step.",
              example: "grid-input",
              kind: "playground",
              title: "See grid-aware input in action",
            },
            minutes: "8 min",
            resources: [
              {
                href: "/playground/?example=grid-input",
                label: "Pointer snapping recipe",
              },
              { href: "/docs/#input-motion", label: "Input and motion docs" },
            ],
            title: "Translate pointer input into cells and interactions",
          },
          {
            body: [
              "Close the basic track with the variable animation loop. The update/draw split keeps simple scenes readable and is enough for interfaces, toys and responsive experiments where strict determinism is not yet required.",
              "Once you are comfortable with this loop, the intermediate track will swap only the scheduler, not the rest of your mental model.",
            ],
            checklist: [
              "CreateAnimationLoop() with autoStart and separate update/draw callbacks.",
              "Move a sprite or primitive with elapsed seconds, then clear and redraw every frame.",
              "Pause here if your product does not need deterministic simulation yet.",
            ],
            code: `let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    time += elapsed;
  },
  draw() {
    grid.clearCanvas();
    grid.drawPacman(220, 160, 34, GridCanvasSystem.runtime.oscillate01(time, 2));
  }
});`,
            codeTitle: "Finish with a first live scene",
            id: "first-loop",
            interactive: {
              description:
                "Run the runtime playground example to see the same update/draw split animated before you adapt it to your own scene.",
              example: "runtime",
              kind: "playground",
              title: "Run the first loop live",
            },
            minutes: "11 min",
            resources: [
              { href: "/playground/?example=runtime", label: "Runtime playground" },
              {
                href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
                label: "Vanilla runtime example",
              },
            ],
            title: "Ship a first moving scene with the variable loop",
          },
        ],
        summary:
          "Learn the stable canvas shell, draw with confidence, adopt Pixel Sprite v2 and finish with a first input-driven loop you can extend right away.",
        title: "Basic: grid, sprites and first interaction",
      },
      intermediate: {
        audience:
          "Use this track once your first scene is working and you now need deterministic updates, tile-based space and reusable gameplay helpers.",
        coverage: [
          "Fixed-step loop",
          "MassBody motion",
          "Particles and trails",
          "Collision helpers",
          "Tilemaps",
          "Animator + state machine",
        ],
        duration: "60 min",
        level: "intermediate",
        outcomes: [
          "Switch from a variable loop to deterministic step-based updates.",
          "Build gameplay actors with reusable motion, collision and feedback helpers.",
          "Compose tilemaps plus animation/state helpers into a playable slice.",
        ],
        prerequisites: [
          "Completion of the Basic track or equivalent comfort with the core drawing APIs.",
          "Willingness to keep scene state in plain objects rather than framework stores.",
        ],
        slug: "intermediate",
        steps: [
          {
            body: [
              "Deterministic updates matter once collisions, AI or reproducible movement enter the scene. createFixedStepLoop() keeps update cadence stable while letting draw run independently.",
              "You do not have to rewrite your renderer. The contract is still update, clear and draw; only the scheduler changes.",
            ],
            checklist: [
              "Replace createAnimationLoop() with createFixedStepLoop().",
              "Choose a step such as 1 / 60 and move your simulation into the fixed update callback.",
              "Keep draw free of game rules so you can reason about determinism clearly.",
            ],
            code: `const loop = GridCanvasSystem.runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  update(step) {
    player.update(step);
  },
  draw() {
    grid.clearCanvas();
    renderScene();
  }
});`,
            codeTitle: "Move to deterministic time",
            id: "fixed-step",
            minutes: "10 min",
            resources: [
              {
                href: `${repoUrl}/blob/main/src/runtime/createFixedStepLoop.ts`,
                label: "Fixed-step runtime source",
              },
              { href: "/playground/?example=runtime", label: "Runtime sandbox" },
            ],
            title: "Swap the scheduler, keep the scene model",
          },
          {
            body: [
              "MassBody, collision helpers and particles are intentionally tiny. They give you enough structure for arcade movement while still leaving the game model in plain data.",
              "Use this step to move one actor, bounce or detect impacts, then emit feedback with particles or trails instead of baking effects into the actor type.",
            ],
            checklist: [
              "Drive one actor with MassBody or your own velocity object.",
              "Use hitTestCircleRectangle(), circlesIntersect() or rectangle tests for impacts.",
              "Emit createParticleBurst() or appendTrailPoint() as visual feedback.",
            ],
            code: `const body = new GridCanvasSystem.runtime.MassBody({
  x: 120,
  y: 180,
  radius: 20,
  xSpeed: 90,
  mass: 6
});

body.update(step, { width: 640, height: 360 });
particles = GridCanvasSystem.runtime.stepParticles(particles, step);`,
            codeTitle: "Motion, collisions and feedback",
            id: "motion-collision",
            minutes: "12 min",
            resources: [
              {
                href: "/playground/?example=collision-course",
                label: "Collision recipe",
              },
              { href: "/playground/?example=particles", label: "Particles recipe" },
            ],
            title: "Build moving actors and readable impact feedback",
          },
          {
            body: [
              "Animation frame flow and gameplay state flow are different concerns. The sprite animator selects frames; the state machine decides what transitions are legal.",
              "Keep them separate and you gain simpler tests plus clearer hooks for scene transitions later in the advanced track.",
            ],
            checklist: [
              "Define named animations for the sprite animator.",
              "Create a state machine that validates your allowed transitions.",
              "Drive animator.play() from the machine state instead of mixing both concerns.",
            ],
            code: `const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  animations: {
    idle: ["idleA", "idleB"],
    run: ["runA", "runB", "runC"]
  },
  fps: 8,
  initial: "idle"
});

const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: { idle: ["run"], run: ["idle"] }
});`,
            codeTitle: "Separate state flow from frame flow",
            id: "state-and-animation",
            minutes: "10 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
                label: "Grid Buddy example",
              },
              { href: "/docs/#state-sprites", label: "State and sprites docs" },
            ],
            title: "Use the animator and state machine as independent tools",
          },
          {
            body: [
              "Tilemaps enter once you need reusable spatial structure. drawTileMap() keeps rendering simple while hitTestTileMap() handles the first pass of solid-tile collisions.",
              "Compiled sprites work especially well here because one tile definition can be reused across the map without rebuilding pixels each frame.",
            ],
            checklist: [
              "Represent a map as characters and define a tileset.",
              "Render the tilemap with drawTileMap().",
              "Block movement or detect walls with hitTestTileMap().",
            ],
            code: `const wall = GridCanvasSystem.compilePixelSprite(["11", "11"], {
  "1": "#00D43B"
});

GridCanvasSystem.runtime.drawTileMap(
  ["111111", "100001", "101101", "111111"],
  { "1": wall },
  { grid, cellSize: 16 }
);`,
            codeTitle: "Promote spatial rules into tilemaps",
            id: "tilemaps",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/tilemap-maze`,
                label: "Maze-style demo",
              },
              {
                href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
                label: "Tilemap runtime source",
              },
            ],
            title: "Draw maps and use tiles for solid world logic",
          },
          {
            body: [
              "Finish the intermediate track by wiring these helpers into a compact gameplay slice. At this point your scene model should already look close to production: deterministic updates, explicit state, reusable tiles and layered drawing.",
              "This becomes the handoff point for scenes and audio. If your product stops here, you still have a robust 2D runtime without adopting a heavyweight engine.",
            ],
            checklist: [
              "Combine fixed-step updates, tile collisions and state helpers in one loop.",
              "Draw HUD plus world tiles in a stable order every frame.",
              "Capture one playable vertical slice before moving to scenes.",
            ],
            id: "vertical-slice",
            interactive: {
              description:
                "Open a fuller playground example and inspect how motion, collisions, projectiles and feedback come together in one deterministic slice.",
              example: "asteroid-dodge",
              kind: "playground",
              title: "Explore a complete gameplay slice",
            },
            minutes: "14 min",
            resources: [
              {
                href: "/playground/?example=asteroid-dodge",
                label: "Playable game recipe",
              },
              {
                href: `${repoUrl}/blob/main/docs/EXAMPLES.md`,
                label: "Examples guide",
              },
            ],
            title: "Assemble a deterministic gameplay vertical slice",
          },
        ],
        summary:
          "Move beyond toy loops by adopting deterministic time, tile-based world rules and reusable state helpers for real playable slices.",
        title: "Intermediate: deterministic runtime, tiles and game state",
      },
      advanced: {
        audience:
          "Use this track when your project is ready for multiple scenes, sound integration and a release workflow built around the stable contract.",
        coverage: [
          "Scene manager",
          "Audio Arcade",
          "Howler + Tone",
          "Public API contract",
          "Migration guide",
          "Packaging verification",
        ],
        duration: "70 min",
        level: "advanced",
        outcomes: [
          "Model an explicit menu/game/pause/results flow with scenes.",
          "Integrate both audio lanes with correct browser and dependency constraints.",
          "Ship against the stable contract and verify bundles, exports and migration notes.",
        ],
        prerequisites: [
          "Completion of the Basic and Intermediate tracks.",
          "Confidence reading the PUBLIC_API and MIGRATION notes alongside code.",
        ],
        slug: "advanced",
        steps: [
          {
            body: [
              "The scene manager keeps high-level flow out of the loop body. Use it when one scene should own enter, update, draw, exit and transition responsibilities explicitly.",
              "This is where the library stops pretending a single canvas function is enough. Keep scenes small and data-driven so each one can still be tested in isolation.",
            ],
            checklist: [
              "Define menu, game, pause and results scenes as plain objects.",
              "Handle scene-specific enter/exit side effects explicitly.",
              "Drive scene transitions from the manager instead of ad-hoc booleans.",
            ],
            code: `const scenes = GridCanvasSystem.runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu: { enter() {}, update() {}, draw() {} },
    game: { enter() {}, update() {}, draw() {} },
    pause: { enter() {}, update() {}, draw() {} }
  }
});

scenes.transition("game");`,
            codeTitle: "Scene flow as an explicit system",
            id: "scene-manager",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/scene-flow`,
                label: "Scene flow demo",
              },
              {
                href: `${repoUrl}/blob/main/src/runtime/createSceneManager.ts`,
                label: "Scene manager source",
              },
            ],
            title: "Promote your vertical slice into a scene-based app",
          },
          {
            body: [
              "Audio Arcade is the fast lane: no extra dependencies, immediate SFX and loop presets. Its real constraint is browser policy, so start playback from a user gesture and keep mute/loop flow explicit.",
              "The goal here is not realism. It is responsive arcade feedback that stays close to the rest of the runtime model.",
            ],
            callout: {
              text: "Treat the first click, tap or key press as the audio unlock gesture and surface that state clearly in UI.",
              title: "Browser note",
            },
            checklist: [
              "Create one controller per scene flow, not per button press.",
              "Trigger one-shot SFX from state changes or gameplay events.",
              "Stop or mute active loops when scenes pause or exit.",
            ],
            code: `import { createArcadeAudio } from "grid-canvas-system/audio-arcade";

const arcadeAudio = createArcadeAudio({ masterVolume: 0.7 });

await arcadeAudio.playShoot();
const loopId = await arcadeAudio.playLoop("danger");
arcadeAudio.stopLoop(loopId);`,
            codeTitle: "Gesture-safe arcade cues",
            id: "audio-arcade",
            interactive: {
              description:
                "Trigger the same browser-native arcade cues directly inside the tutorial so you can verify gesture gating, loops and mute flow without leaving the page.",
              kind: "audio-demo",
              title: "Try Audio Arcade inline",
              variant: "arcade",
            },
            minutes: "12 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
                label: "Audio Arcade example",
              },
              { href: "/docs/#audio-arcade", label: "Audio Arcade docs" },
            ],
            title: "Add instant browser-native arcade sound",
          },
          {
            body: [
              "The richer audio lane stays experimental in 1.1.0. Use it only when your project really needs sampled assets, synth notes or transport-driven sequences.",
              "Because these adapters load optional peers, keep the dependency boundary explicit and isolate the audio integration from the core canvas path.",
            ],
            checklist: [
              "Install only the peers you need for the project: howler, tone or both.",
              "Keep adapter factories async and separate from scene bootstrap.",
              "Wrap missing-peer failure with a friendly application message.",
            ],
            code: `import {
  createHowlerAssetAudio,
  createToneMusicAudio
} from "grid-canvas-system/audio";

const assets = await createHowlerAssetAudio({
  laser: { src: ["/audio/laser.wav"], volume: 0.45 }
});

const music = await createToneMusicAudio({
  bpm: 132,
  instruments: { lead: "synth", bass: "membrane" }
});`,
            codeTitle: "Experimental adapter lane",
            id: "audio-adapters",
            interactive: {
              description:
                "Test the Howler and Tone adapter flow inline to understand the difference between generated assets, note triggers and looped sequences.",
              kind: "audio-demo",
              title: "Try the adapter lane inline",
              variant: "adapters",
            },
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/audio`,
                label: "Adapter example",
              },
              {
                href: `${repoUrl}/blob/main/src/audio/internal/loaders.ts`,
                label: "Peer loading source",
              },
            ],
            title: "Integrate sampled or musical audio deliberately",
          },
          {
            body: [
              "Once the app flow is stable, lock what is truly public. The 1.1 line ships a PUBLIC_API contract and a MIGRATION guide so stable, experimental and legacy names are not mixed together by accident.",
              "Use these docs as part of code review. They are just as important as the runtime helpers because they define what you can promise to other teams.",
            ],
            checklist: [
              "Read the stable surface first and avoid legacy aliases in new code.",
              "Plan migration around compilePixelSprite(), fixed-step loops and scene helpers.",
              "Treat experimental audio as opt-in, not as a required part of the root API.",
            ],
            id: "contract-and-migration",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
                label: "Public API contract",
              },
              {
                href: `${repoUrl}/blob/main/docs/MIGRATION.md`,
                label: "Migration guide",
              },
            ],
            title: "Anchor your product on the stable contract",
          },
          {
            body: [
              "Close the advanced track with packaging and verification. A stable library is not only runtime code; it is also exports, generated types, smoke tests and release commands that keep consumers safe.",
              "This is the final step that turns the tutorial sequence into a release checklist for the current stable line.",
            ],
            checklist: [
              "Run unit tests, visual tests and build outputs together before release.",
              "Verify ESM, UMD and published type declarations match the contract docs.",
              "Use the examples guide as the smoke-test surface for public capabilities.",
            ],
            id: "release-hardening",
            minutes: "16 min",
            resources: [
              { href: `${repoUrl}/blob/main/CHANGELOG.md`, label: "Release notes" },
              {
                href: `${repoUrl}/blob/main/docs/EXAMPLES.md`,
                label: "Examples guide",
              },
              {
                href: `${repoUrl}/blob/main/.github/workflows/ci.yml`,
                label: "CI workflow",
              },
            ],
            title: "Verify the package surface before shipping",
          },
        ],
        summary:
          "Finish with scenes, sound and release verification so the project you build on top of the stable core is ready to grow without losing clarity.",
        title: "Advanced: scenes, audio and stable delivery",
      },
    },
    tutorialsPath: "/tutorials/",
    versionLabel: `Designed for v${libraryVersion}`,
  },
  es: {
    backHomeLabel: "Volver al inicio",
    backToTutorialsLabel: "Volver a las rutas",
    coverageTitle: "Mapa de cobertura",
    coverageTableHeaders: {
      feature: "Capacidad",
      level: "Nivel",
      note: "Que practicas",
    },
    coverageRows: [
      {
        feature: "Canvas base y configuracion de grilla",
        level: "basic",
        note: "Tamano, HiDPI, etiquetas, clear strategy y setup predecible.",
      },
      {
        feature: "Primitivas de dibujo y HUD",
        level: "basic",
        note: "Formas, texto, barras, mensajes y decoracion reusable.",
      },
      {
        feature: "Pixel Sprite v2",
        level: "basic",
        note: "Compilar, tintar, voltear, dibujar y hacer hit-test sin revalidar cada frame.",
      },
      {
        feature: "Puntero y matematicas de grilla",
        level: "basic",
        note: "Seguimiento de puntero mas conversion y snapping entre canvas y celdas.",
      },
      {
        feature: "Animation loop variable",
        level: "basic",
        note: "Separacion update/draw para escenas reactivas simples.",
      },
      {
        feature: "Fixed-step loops",
        level: "intermediate",
        note: "Updates deterministas para gameplay repetible y simulacion estable.",
      },
      {
        feature: "MassBody, particulas y colisiones",
        level: "intermediate",
        note: "Integracion de movimiento, impactos, trails y sistemas de feedback.",
      },
      {
        feature: "Tilemaps",
        level: "intermediate",
        note: "Dibujar mapas por caracteres, reutilizar tiles compilados y bloquear movimiento.",
      },
      {
        feature: "Sprite animator y state machine",
        level: "intermediate",
        note: "Separar flujo de frames del flujo de estado del gameplay.",
      },
      {
        feature: "Scene manager",
        level: "advanced",
        note: "Moverte entre menu, juego, pausa y resultados con transiciones explicitas.",
      },
      {
        feature: "Audio Arcade",
        level: "advanced",
        note: "Disparar SFX y loops nativos del navegador con bloqueo por gesto controlado.",
      },
      {
        feature: "Adapters de Howler y Tone",
        level: "advanced",
        note: "Conectar la via experimental para assets, secuencias y cues musicales.",
      },
      {
        feature: "Migracion y empaquetado",
        level: "advanced",
        note: "Leer el contrato publico, la migracion y el flujo de verificacion de release.",
      },
    ],
    ctaLabel: "Abrir tutorial",
    docsPath: "/es/docs/",
    emptyState: "No se encontro la ruta de tutorial.",
    hub: {
      heroKicker: `Aprende construyendo con v${libraryVersion}`,
      heroText:
        "Aqui no vienes a copiar una API y esperar que funcione. Cada ruta te da contexto, te acompana en una construccion real y te pide comprobar lo que acabas de crear.",
      heroTitle: "Construye tu primera escena. Entiende cada decision.",
      orderText:
        "Empieza conectando el canvas, consigue una escena viva y avanza a runtime, tiles, estados y audio cuando ya tengas una razon para necesitarlos.",
      orderTitle: "Una progresion con sentido",
      scopeText:
        "Tres proyectos guiados recorren la superficie 1.1 sin convertir el aprendizaje en una lista de metodos: canvas, sprites, input, runtime, tilemaps, escenas y audio.",
      scopeTitle: "De cero a sistema jugable",
    },
    lang: "es",
    levelLabels: {
      advanced: "Avanzado",
      basic: "Basico",
      intermediate: "Intermedio",
    },
    mobileMenuLabel: "Abrir pasos del tutorial",
    pageTitle: "Tutoriales / Grid Canvas System",
    playgroundLabel: "Playground",
    repoAria: "Abrir repositorio en GitHub",
    searchPlaceholder: "Filtrar pasos",
    siteBadge: "Tutoriales",
    stepLabels: {
      audience: "Ideal si quieres",
      duration: "Duracion",
      interactive: "Pruebalo en vivo",
      openInPlayground: "Abrir en Playground",
      outcomes: "Resultados",
      prerequisites: "Prerequisitos",
      resources: "Recursos",
      steps: "Pasos",
    },
    summaryLabel: "Elige lo proximo que quieres construir",
    topbarTitle: "Grid Canvas System",
    tracks: {
      basic: {
        audience:
          "Empiezas desde el HTML y quieres entender de verdad como una etiqueta canvas termina convertida en una escena interactiva.",
        coverage: [
          "HTML + canvas",
          "Constructor e ID",
          "Dibujo por capas",
          "Pixel art",
          "Puntero y celdas",
          "Animacion",
        ],
        duration: "55 min",
        level: "basic",
        outcomes: [
          "Conectar un elemento canvas real con el constructor usando un ID que puedas explicar.",
          "Dibujar una cabina espacial por capas y sumar una baliza en pixel art.",
          "Usar el puntero y un loop de animacion para convertir una imagen estatica en una escena viva.",
        ],
        prerequisites: [
          "Saber crear un archivo HTML y un modulo JavaScript.",
          "No necesitas experiencia previa con Canvas 2D ni con motores de juegos.",
        ],
        project: {
          deliverables: [
            "Una grilla nitida enlazada al DOM.",
            "Una nave con HUD y orden de dibujo claro.",
            "Una baliza pixel art seleccionable por celda.",
            "Un pulso animado que mantiene la escena viva.",
          ],
          description:
            "Vamos a crear una pequena consola de navegacion: una nave descansa sobre la grilla, una baliza responde al puntero y el HUD confirma que el sistema esta activo. Cada paso conserva lo anterior, asi que nunca trabajas con fragmentos sin contexto.",
          label: "Proyecto de esta ruta",
          title: "Baliza espacial interactiva",
        },
        slug: "basic",
        steps: [
          {
            body: [
              "Antes de dibujar una sola linea necesitamos responder una pregunta sencilla: ¿sobre que elemento del HTML va a trabajar la libreria? El navegador no crea una superficie de dibujo por intuicion. Debemos declarar un canvas y darle un nombre unico.",
              'Ese nombre es el atributo id. Cuando escribes new GridCanvasSystem("mi-escena"), la libreria usa document.getElementById("mi-escena") para encontrar el nodo. Si el texto no coincide, no existe conexion. Si el ID apunta a un div, la libreria lo encuentra, pero lo rechaza porque un div no tiene un contexto de dibujo 2D.',
              "Puedes envolver el canvas en un div para ordenar el layout. Lo importante es que el ID enviado al constructor pertenezca al canvas, no al contenedor.",
            ],
            checklist: [
              'Crea el canvas con id="mi-escena" dentro de tu HTML.',
              'Importa GridCanvasSystem y pasa exactamente "mi-escena" al constructor.',
              "Recarga la pagina y confirma que aparece una grilla de 640 x 360.",
            ],
            codeBlocks: [
              {
                code: `<main class="game-shell">
  <canvas
    id="mi-escena"
    aria-label="Baliza espacial interactiva"
  ></canvas>
</main>`,
                language: "html",
                title: "1. Declara la superficie de dibujo",
              },
              {
                code: `import GridCanvasSystem from "grid-canvas-system";

const grid = new GridCanvasSystem("mi-escena", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.24)",
  gridLabelColor: "#4da9ff"
});`,
                language: "typescript",
                title: "2. Conecta el constructor con ese ID",
              },
            ],
            diagram: {
              caption:
                "El ID es el puente. La libreria valida que el elemento exista y que realmente sea un HTMLCanvasElement antes de pedir su contexto 2D.",
              source: `flowchart LR
  A["HTML: canvas id = mi-escena"] --> B["Constructor: mi-escena"]
  B --> C["document.getElementById"]
  C --> D{"¿Existe y es canvas?"}
  D -->|Si| E["Configura tamano, HiDPI y grilla"]
  D -->|No existe| F["Error: canvas no encontrado"]
  D -->|Es un div| G["Error: el elemento no es canvas"]`,
              title: "Como viaja el ID desde tu HTML hasta la grilla",
            },
            expected: {
              text: "Una superficie oscura de 640 x 360 con lineas verdes y referencias azules. Si ves el error Canvas element with id ... not found, compara letra por letra el ID del HTML con el texto del constructor.",
            },
            id: "connect-canvas",
            interactive: {
              description:
                "Prueba las tres opciones. Dos fallan por la misma razon que fallarian en tu proyecto: el constructor busca un ID que no existe en el DOM.",
              kind: "canvas-id",
              title: "Encuentra el ID que completa la conexion",
            },
            milestone:
              "Ya puedes explicar de donde sale el canvas que administra la libreria y diagnosticar un ID roto.",
            minutes: "12 min",
            question: "¿Como sabe JavaScript en que parte de la pagina debe dibujar?",
            resources: [
              { href: "/es/docs/#canvas-options", label: "Opciones del canvas" },
              { href: "/es/docs/#quick-start", label: "Inicio rapido" },
            ],
            title: "Conecta el canvas del HTML con la libreria",
            why: {
              text: "Canvas es una API del navegador; GridCanvasSystem es la capa que la prepara y la hace mas comoda. El ID permite que ambas partes hablen del mismo elemento sin guardar referencias globales ni adivinar posiciones en el documento.",
              title: "El ID no es decorativo",
            },
          },
          {
            body: [
              "La grilla ya existe. Ahora vamos a darle una historia visual: una nave en el centro y un indicador de energia en la esquina. El orden importa porque Canvas pinta como una hoja de papel: cada llamada nueva queda encima de lo anterior.",
              "Por eso una escena suele seguir tres capas mentales: limpiar y recuperar el fondo, dibujar el mundo, y terminar con el HUD. Todavia no necesitamos un scene manager; solo un orden que podamos leer de arriba hacia abajo.",
            ],
            checklist: [
              "Limpia el frame con grid.clearCanvas() antes de dibujar.",
              "Dibuja la nave en el centro y activa el thruster.",
              "Agrega la barra ENERGY al final para que quede sobre la escena.",
            ],
            code: `grid.clearCanvas();

grid.drawShip({ x: 320, y: 190 }, 48, {
  rotation: -Math.PI / 2,
  fillColor: "#101722",
  strokeColor: "#e8f7ef",
  thruster: true,
  thrusterFillColor: "#ffb14a"
});

grid.drawBarIndicator("ENERGY", 20, 20, 120, 14, 72, 100, {
  fillColor: "#00d43b",
  strokeColor: "#e8f7ef",
  textColor: "#e8f7ef"
});`,
            codeTitle: "Dibuja mundo primero, interfaz despues",
            diagram: {
              caption:
                "No son capas DOM separadas. Es el orden de las llamadas de dibujo dentro del mismo canvas.",
              source: `flowchart LR
  A["clearCanvas: fondo + grilla"] --> B["drawShip: actor"]
  B --> C["drawBarIndicator: HUD"]
  C --> D["Frame visible"]`,
              title: "El orden de dibujo de un frame",
            },
            expected: {
              text: "Una nave clara aparece cerca del centro con una llama ambar, mientras ENERGY queda legible en la esquina superior izquierda.",
            },
            id: "draw-cockpit",
            interactive: {
              description:
                "Esta escena no pertenece al catalogo del Playground: el tutorial envia su propio HTML y JavaScript para que veas y edites exactamente el codigo de este paso.",
              files: {
                html: `<canvas id="canvas" aria-label="Cabina espacial por capas"></canvas>`,
                javascript: `const grid = new GridCanvasSystem("canvas", {
  width: 640,
  height: 360,
  cellSize: 20,
  majorStep: 40,
  backgroundColor: "#050607",
  gridColor: "rgba(0, 212, 59, 0.24)",
  gridLabelColor: "#4da9ff"
});

grid.clearCanvas();

grid.drawShip({ x: 320, y: 190 }, 48, {
  rotation: -Math.PI / 2,
  fillColor: "#101722",
  strokeColor: "#e8f7ef",
  thruster: true,
  thrusterFillColor: "#ffb14a"
});

grid.drawBarIndicator("ENERGY", 20, 20, 120, 14, 72, 100, {
  fillColor: "#00d43b",
  strokeColor: "#e8f7ef",
  textColor: "#e8f7ef"
});`,
              },
              kind: "playground",
              title: "Edita la cabina exacta de este paso",
            },
            milestone:
              "Tu canvas dejo de ser una grilla vacia: ya comunica mundo, actor y estado.",
            minutes: "8 min",
            question: "¿Que dibujamos primero para que nada importante quede tapado?",
            resources: [
              { href: "/es/docs/#arcade-primitives", label: "Primitivas arcade" },
              { href: "/es/docs/#hud-overlays", label: "HUD overlays" },
            ],
            title: "Construye la cabina visual por capas",
            why: {
              text: "Canvas no recuerda objetos como un DOM. Recuerda pixeles. Repetir un orden claro en cada frame evita rastros, HUD oculto y escenas donde no sabes que llamada produjo cada resultado.",
            },
          },
          {
            body: [
              "Nuestra cabina necesita algo que localizar. Crearemos una baliza como una pequena matriz de caracteres: cada caracter representa un color de la paleta y cada posicion se convierte en un bloque visible.",
              "La compilamos una vez porque su forma no cambia en cada frame. Despues podemos dibujarla muchas veces sin volver a validar todas las filas y colores.",
            ],
            checklist: [
              "Define una paleta con transparencia, verde y azul.",
              "Compila la matriz de la baliza una sola vez.",
              "Dibujala en x: 120, y: 100 con pixelSize: 8.",
            ],
            code: `const palette = GridCanvasSystem.createPixelPalette({
  "0": "transparent",
  "1": "#00d43b",
  "2": "#4da9ff"
});

const beacon = GridCanvasSystem.compilePixelSprite([
  "00011000",
  "00122100",
  "01222210",
  "00122100",
  "00011000"
], palette);

grid.drawCompiledPixelSprite(beacon, {
  x: 120,
  y: 100,
  pixelSize: 8
});`,
            codeTitle: "De caracteres a una baliza visible",
            diagram: {
              caption:
                "La matriz describe la forma; la paleta decide el color; pixelSize decide cuanto crece cada caracter sobre el canvas.",
              source: `flowchart LR
  A["Matriz de caracteres"] --> C["compilePixelSprite"]
  B["Paleta de colores"] --> C
  C --> D["Sprite compilado"]
  D --> E["drawCompiledPixelSprite"]
  E --> F["Baliza en el canvas"]`,
              title: "Como se convierte texto en pixel art",
            },
            expected: {
              text: "Una baliza verde y azul aparece a la izquierda de la nave. Cambia pixelSize de 8 a 12 para comprobar que la forma se mantiene y solo cambia su escala.",
            },
            id: "build-beacon",
            milestone:
              "Ya sabes separar la descripcion de un sprite de la instruccion que lo dibuja.",
            minutes: "10 min",
            question: "¿Como podemos dibujar pixel art sin cargar una imagen externa?",
            resources: [
              { href: "/es/docs/#pixel-sprites", label: "Docs de Pixel Sprite v2" },
              {
                href: `${repoUrl}/blob/main/scripts/benchmark-pixel-sprites.mjs`,
                label: "Benchmark de sprites",
              },
            ],
            title: "Convierte una matriz en tu primera baliza pixel art",
            why: {
              text: "Separar datos y render te deja recolorear, voltear o reutilizar el mismo sprite. Compilar evita repetir validaciones dentro del loop que construiremos al final.",
            },
          },
          {
            body: [
              "Hasta ahora solo miramos la escena. Vamos a permitir que el puntero seleccione una celda. createPointerTracker() traduce mouse, touch o stylus a una posicion local dentro del canvas.",
              "Despues canvasToGrid() convierte pixeles en columna y fila. gridToCanvas() hace el viaje de vuelta para que podamos marcar exactamente el origen de esa celda.",
            ],
            checklist: [
              "Conecta createPointerTracker() a grid.canvas.",
              "Convierte la posicion a una celda usando el mismo cellSize: 20.",
              "Dibuja la coordenada ajustada y mueve el puntero por el ejemplo en vivo.",
            ],
            code: `const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas);

const pointerPosition = pointer.position();

if (pointerPosition !== null) {
  const cell = GridCanvasSystem.runtime.canvasToGrid(pointerPosition, { cellSize: 20 });
  const snapped = GridCanvasSystem.runtime.gridToCanvas(cell, { cellSize: 20 });

  grid.drawCoordinate(snapped.x, snapped.y);
}`,
            codeTitle: "Del puntero a una celda estable",
            diagram: {
              caption:
                "La conversion evita colocar objetos en coordenadas arbitrarias cuando tu juego piensa en tiles o celdas.",
              source: `flowchart LR
  A["Puntero: x 137, y 92"] --> B["canvasToGrid"]
  B --> C["Celda: columna 6, fila 4"]
  C --> D["gridToCanvas"]
  D --> E["Origen ajustado: x 120, y 80"]`,
              title: "Pixeles, celdas y vuelta a pixeles",
            },
            expected: {
              text: "En el Playground, el marco ambar salta de celda en celda y nunca queda a medio camino. Esa estabilidad es la base de selectores, editores de mapas y movimiento por tiles.",
            },
            id: "select-grid-cell",
            interactive: {
              description:
                "Mueve el puntero sobre la grilla. Observa como una posicion continua termina convertida en una seleccion discreta y predecible.",
              example: "grid-input",
              kind: "playground",
              title: "Selecciona celdas con el puntero",
            },
            milestone:
              "Tu escena ya responde a una persona, no solo a instrucciones escritas en el codigo.",
            minutes: "10 min",
            question: "¿Como hacemos que un puntero libre respete la grilla?",
            resources: [
              {
                href: "/playground/?example=grid-input",
                label: "Receta de pointer snapping",
              },
              { href: "/es/docs/#input-motion", label: "Docs de input y movimiento" },
            ],
            title: "Haz que el puntero entienda la grilla",
            why: {
              text: "El navegador entrega coordenadas en pixeles, pero muchos sistemas de juego razonan en celdas. Centralizar esa conversion evita formulas repetidas y errores de borde.",
            },
          },
          {
            body: [
              "La ultima pieza es el tiempo. Una escena animada repite dos responsabilidades: update decide como cambia el estado y draw representa ese estado en el canvas.",
              "Usaremos un valor time para hacer pulsar la boca de Pacman como senal visual. En tu proyecto puedes aplicar el mismo patron al brillo de la baliza, la energia del motor o cualquier propiedad numerica.",
            ],
            checklist: [
              "Acumula elapsed dentro de update().",
              "Limpia y vuelve a dibujar toda la escena dentro de draw().",
              "Abre el ejemplo y comprueba que la animacion continua aunque no muevas el puntero.",
            ],
            code: `let time = 0;

GridCanvasSystem.runtime.createAnimationLoop({
  autoStart: true,
  update(elapsed) {
    time += elapsed;
  },
  draw() {
    grid.clearCanvas();
    const pulse = GridCanvasSystem.runtime.oscillate01(time, 2);

    grid.drawPacman(320, 190, 34, pulse, {
      fillColor: "#00d43b",
      strokeColor: "#e8f7ef"
    });
  }
});`,
            codeTitle: "Separa el paso del tiempo del dibujo",
            diagram: {
              caption:
                "El navegador pide un nuevo frame, update cambia los datos y draw reconstruye la imagen. Despues el ciclo comienza otra vez.",
              source: `flowchart LR
  A["Nuevo frame"] --> B["update(elapsed)"]
  B --> C["Estado actualizado"]
  C --> D["draw()"]
  D --> E["Canvas visible"]
  E --> A`,
              title: "El ciclo que mantiene viva la escena",
            },
            expected: {
              text: "La figura pulsa de forma continua y la grilla permanece limpia. Si aparecen rastros, comprueba que clearCanvas() sea la primera llamada dentro de draw().",
            },
            id: "animate-scene",
            interactive: {
              description:
                "Observa la escena durante unos segundos y despues cambia la velocidad. La idea importante no es el personaje: es que update y draw tienen trabajos distintos.",
              example: "runtime",
              kind: "playground",
              title: "Pon en marcha tu primer loop",
            },
            milestone:
              "Completaste una escena con superficie, capas, pixel art, input y tiempo. Ya tienes una base real para crear.",
            minutes: "15 min",
            question:
              "¿Como redibujamos sin mezclar el paso del tiempo con la presentacion?",
            resources: [
              { href: "/playground/?example=runtime", label: "Runtime en Playground" },
              {
                href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
                label: "Ejemplo vanilla runtime",
              },
            ],
            title: "Da vida a la escena con un loop legible",
            why: {
              text: "Separar update y draw te permite cambiar la logica sin reordenar el render, pausar la escena y migrar mas adelante a un fixed-step sin abandonar el modelo mental que acabas de aprender.",
            },
          },
        ],
        summary:
          "Construye una baliza espacial desde el HTML hasta la animacion y entiende por que existe cada linea antes de agregar la siguiente.",
        title: "Basico: de un canvas vacio a una escena viva",
      },
      intermediate: {
        audience:
          "Ideal si ya armaste una primera escena y ahora quieres updates deterministas, espacio basado en tiles y helpers de gameplay reutilizables.",
        coverage: [
          "Fixed-step loop",
          "Movimiento con MassBody",
          "Particulas y trails",
          "Helpers de colision",
          "Tilemaps",
          "Animator + state machine",
        ],
        duration: "60 min",
        level: "intermediate",
        outcomes: [
          "Cambiar de un loop variable a updates por pasos deterministas.",
          "Construir actores de gameplay con movimiento, colision y feedback reusable.",
          "Combinar tilemaps y helpers de animacion/estado en una slice jugable.",
        ],
        prerequisites: [
          "Completar la ruta basica o sentirse comodo con la API de dibujo y canvas.",
          "Aceptar que el estado de escena siga viviendo en objetos simples y no en un framework.",
        ],
        slug: "intermediate",
        steps: [
          {
            body: [
              "Los updates deterministas importan cuando aparecen colisiones, IA o movimiento reproducible. createFixedStepLoop() mantiene estable la cadencia de update mientras draw corre independiente.",
              "No hace falta reescribir el renderer. El contrato sigue siendo update, clear y draw; lo unico que cambia es el scheduler.",
            ],
            checklist: [
              "Reemplaza createAnimationLoop() por createFixedStepLoop().",
              "Elige un step como 1 / 60 y mueve la simulacion al callback fijo.",
              "Mantener draw libre de reglas de juego para razonar con claridad sobre el determinismo.",
            ],
            code: `const loop = GridCanvasSystem.runtime.createFixedStepLoop({
  autoStart: true,
  step: 1 / 60,
  update(step) {
    player.update(step);
  },
  draw() {
    grid.clearCanvas();
    renderScene();
  }
});`,
            codeTitle: "Tiempo determinista",
            id: "fixed-step",
            minutes: "10 min",
            resources: [
              {
                href: `${repoUrl}/blob/main/src/runtime/createFixedStepLoop.ts`,
                label: "Source del fixed-step",
              },
              { href: "/playground/?example=runtime", label: "Sandbox runtime" },
            ],
            title: "Cambia el scheduler, no el modelo mental",
          },
          {
            body: [
              "MassBody, los helpers de colision y las particulas son pequenos a proposito. Te dan estructura suficiente para movimiento arcade sin dejar de trabajar con datos planos.",
              "Usa este paso para mover un actor, detectar impactos y emitir feedback visual con particulas o trails en lugar de esconder efectos dentro del actor.",
            ],
            checklist: [
              "Mueve un actor con MassBody o una estructura propia de velocidad.",
              "Usa hitTestCircleRectangle(), circlesIntersect() o pruebas rectangulares para impactos.",
              "Emite createParticleBurst() o appendTrailPoint() como feedback visual.",
            ],
            code: `const body = new GridCanvasSystem.runtime.MassBody({
  x: 120,
  y: 180,
  radius: 20,
  xSpeed: 90,
  mass: 6
});

body.update(step, { width: 640, height: 360 });
particles = GridCanvasSystem.runtime.stepParticles(particles, step);`,
            codeTitle: "Movimiento, colision y feedback",
            id: "motion-collision",
            minutes: "12 min",
            resources: [
              {
                href: "/playground/?example=collision-course",
                label: "Receta de colision",
              },
              { href: "/playground/?example=particles", label: "Receta de particulas" },
            ],
            title: "Construye actores con movimiento y feedback legible",
          },
          {
            body: [
              "El flujo de frames y el flujo de estado son problemas diferentes. El sprite animator decide frames; la state machine decide transiciones legales.",
              "Mantenerlos separados simplifica tests y deja puntos de enganche mas claros para transiciones de escena en la ruta avanzada.",
            ],
            checklist: [
              "Define animaciones nombradas para el sprite animator.",
              "Crea una state machine que valide las transiciones permitidas.",
              "Dispara animator.play() desde el estado de la maquina y no al reves.",
            ],
            code: `const animator = GridCanvasSystem.runtime.createSpriteAnimator({
  animations: {
    idle: ["idleA", "idleB"],
    run: ["runA", "runB", "runC"]
  },
  fps: 8,
  initial: "idle"
});

const machine = GridCanvasSystem.runtime.createStateMachine({
  initial: "idle",
  transitions: { idle: ["run"], run: ["idle"] }
});`,
            codeTitle: "Frames y estado como capas separadas",
            id: "state-and-animation",
            minutes: "10 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
                label: "Ejemplo Grid Buddy",
              },
              { href: "/es/docs/#state-sprites", label: "Docs de estados y sprites" },
            ],
            title: "Usa animator y state machine como herramientas independientes",
          },
          {
            body: [
              "Los tilemaps entran cuando necesitas una estructura espacial reusable. drawTileMap() mantiene el render simple mientras hitTestTileMap() resuelve la primera pasada de colisiones contra tiles solidos.",
              "Los sprites compilados brillan aqui porque una definicion de tile puede reutilizarse por todo el mapa sin reconstruir pixeles cada frame.",
            ],
            checklist: [
              "Representa el mapa como caracteres y define un tileset.",
              "Renderiza el tilemap con drawTileMap().",
              "Bloquea movimiento o detecta paredes con hitTestTileMap().",
            ],
            code: `const wall = GridCanvasSystem.compilePixelSprite(["11", "11"], {
  "1": "#00D43B"
});

GridCanvasSystem.runtime.drawTileMap(
  ["111111", "100001", "101101", "111111"],
  { "1": wall },
  { grid, cellSize: 16 }
);`,
            codeTitle: "Tiles reutilizables",
            id: "tilemaps",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/tilemap-maze`,
                label: "Demo tipo maze",
              },
              {
                href: `${repoUrl}/blob/main/src/runtime/tilemap.ts`,
                label: "Source de tilemap",
              },
            ],
            title: "Dibuja mapas y usa tiles como reglas espaciales",
          },
          {
            body: [
              "Cierra la ruta intermedia uniendo todo en una slice jugable. A esta altura tu modelo deberia parecerse bastante a produccion: updates deterministas, estado explicito, tiles reusables y dibujo por capas.",
              "Este es el punto de handoff hacia escenas y audio. Si tu producto termina aqui, igualmente tendras un runtime 2D robusto y pequeno.",
            ],
            checklist: [
              "Combina fixed-step, colisiones con tiles y helpers de estado en un solo loop.",
              "Dibuja HUD y mundo en un orden estable cada frame.",
              "Captura una vertical slice jugable antes de pasar a scenes.",
            ],
            id: "vertical-slice",
            interactive: {
              description:
                "Abre una vertical slice jugable en el Playground para ver como movimiento, colisiones, disparos y feedback caben en un mismo flujo determinista.",
              example: "asteroid-dodge",
              kind: "playground",
              title: "Explora una slice jugable completa",
            },
            minutes: "14 min",
            resources: [
              { href: "/playground/?example=asteroid-dodge", label: "Receta jugable" },
              {
                href: `${repoUrl}/blob/main/docs/EXAMPLES.md`,
                label: "Guia de ejemplos",
              },
            ],
            title: "Arma una vertical slice determinista",
          },
        ],
        summary:
          "Pasa de demos aislados a slices jugables con tiempo determinista, tiles reutilizables y un flujo de estado que aguanta mas complejidad.",
        title: "Intermedio: runtime determinista, tiles y estado de juego",
      },
      advanced: {
        audience:
          "Ideal si tu proyecto ya pide multiples escenas, sonido y una forma clara de salir a release sin romper el contrato estable.",
        coverage: [
          "Scene manager",
          "Audio Arcade",
          "Howler + Tone",
          "Contrato publico",
          "Migracion",
          "Verificacion de empaquetado",
        ],
        duration: "70 min",
        level: "advanced",
        outcomes: [
          "Modelar un flujo explicito de menu, juego, pausa y resultados con scenes.",
          "Integrar ambas vias de audio con las restricciones correctas de navegador y dependencias.",
          "Publicar alineado con el contrato estable, los exports y el flujo de verificacion.",
        ],
        prerequisites: [
          "Completar las rutas Basica e Intermedia.",
          "Sentirte comodo leyendo PUBLIC_API y MIGRATION junto con el codigo.",
        ],
        slug: "advanced",
        steps: [
          {
            body: [
              "El scene manager saca el flujo de alto nivel fuera del loop principal. Usalo cuando una escena deba aduenarse de enter, update, draw, exit y transition de forma explicita.",
              "Aqui la libreria deja de fingir que una sola funcion basta. Mantener scenes pequenas y data-driven ayuda a seguir testeandolas en aislamiento.",
            ],
            checklist: [
              "Define escenas de menu, juego, pausa y resultados como objetos simples.",
              "Maneja enter y exit con side effects explicitos.",
              "Dispara transitions desde el manager y no desde booleans dispersos.",
            ],
            code: `const scenes = GridCanvasSystem.runtime.createSceneManager({
  initial: "menu",
  scenes: {
    menu: { enter() {}, update() {}, draw() {} },
    game: { enter() {}, update() {}, draw() {} },
    pause: { enter() {}, update() {}, draw() {} }
  }
});

scenes.transition("game");`,
            codeTitle: "Flujo de escenas explicito",
            id: "scene-manager",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/scene-flow`,
                label: "Demo de scene flow",
              },
              {
                href: `${repoUrl}/blob/main/src/runtime/createSceneManager.ts`,
                label: "Source de scene manager",
              },
            ],
            title: "Promueve tu vertical slice a una app guiada por escenas",
          },
          {
            body: [
              "Audio Arcade es la via rapida: sin dependencias extra, SFX inmediatos y loops preset. La restriccion real es la politica del navegador, por eso el playback debe arrancar desde un gesto del usuario y el flujo de mute/loop debe ser explicito.",
              "La meta aqui no es realismo. Es feedback arcade veloz que siga el mismo modelo simple del runtime visual.",
            ],
            callout: {
              text: "Trata el primer click, tap o keypress como el gesto que desbloquea audio y reflejalo en la UI.",
              title: "Nota de navegador",
            },
            checklist: [
              "Crea un controller por flujo de escena, no por boton.",
              "Dispara one-shot SFX desde cambios de estado o eventos de gameplay.",
              "Deten o silencia loops activos cuando una escena se pausa o sale.",
            ],
            code: `import { createArcadeAudio } from "grid-canvas-system/audio-arcade";

const arcadeAudio = createArcadeAudio({ masterVolume: 0.7 });

await arcadeAudio.playShoot();
const loopId = await arcadeAudio.playLoop("danger");
arcadeAudio.stopLoop(loopId);`,
            codeTitle: "Cues arcade con gesto del usuario",
            id: "audio-arcade",
            interactive: {
              description:
                "Dispara los mismos cues arcade desde el tutorial para comprobar el gesto de desbloqueo, los loops y el mute sin salir de la pagina.",
              kind: "audio-demo",
              title: "Prueba Audio Arcade inline",
              variant: "arcade",
            },
            minutes: "12 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
                label: "Ejemplo Audio Arcade",
              },
              { href: "/es/docs/#audio-arcade", label: "Docs de Audio Arcade" },
            ],
            title: "Suma feedback sonoro inmediato al flujo de juego",
          },
          {
            body: [
              "La via de audio mas rica sigue siendo experimental en 1.1.0. Usala solo cuando el proyecto realmente necesite assets sampleados, notas sintetizadas o secuencias gobernadas por transport.",
              "Como estos adapters cargan peers opcionales, deja explicito el limite de dependencias y aisla la integracion de audio del camino base de canvas.",
            ],
            checklist: [
              "Instala solo los peers que necesites: howler, tone o ambos.",
              "Mantener las factories async fuera del bootstrap visual principal.",
              "Envuelve el fallo por peer faltante con un mensaje amigable para la app.",
            ],
            code: `import {
  createHowlerAssetAudio,
  createToneMusicAudio
} from "grid-canvas-system/audio";

const assets = await createHowlerAssetAudio({
  laser: { src: ["/audio/laser.wav"], volume: 0.45 }
});

const music = await createToneMusicAudio({
  bpm: 132,
  instruments: { lead: "synth", bass: "membrane" }
});`,
            codeTitle: "Via experimental de adapters",
            id: "audio-adapters",
            interactive: {
              description:
                "Prueba el flujo de Howler y Tone inline para sentir la diferencia entre assets generados, disparo de notas y secuencias en loop.",
              kind: "audio-demo",
              title: "Prueba la via de adapters inline",
              variant: "adapters",
            },
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/tree/main/examples/vanilla/audio`,
                label: "Ejemplo de adapters",
              },
              {
                href: `${repoUrl}/blob/main/src/audio/internal/loaders.ts`,
                label: "Source de carga de peers",
              },
            ],
            title: "Integra audio sampleado o musical con cuidado",
          },
          {
            body: [
              "Con el flujo estable, toca congelar lo que realmente es publico. La linea 1.1 trae PUBLIC_API y MIGRATION para que las superficies stable, experimental y legacy no se mezclen por accidente.",
              "Usa esos documentos como parte del code review. Son tan importantes como el runtime porque definen lo que puedes prometer a otros equipos.",
            ],
            checklist: [
              "Lee primero la superficie estable y evita aliases legacy en codigo nuevo.",
              "Planifica migracion alrededor de compilePixelSprite(), fixed-step loops y scene helpers.",
              "Trata el audio experimental como opt-in y no como parte del root API.",
            ],
            id: "contract-and-migration",
            minutes: "14 min",
            resources: [
              {
                href: `${repoUrl}/blob/main/docs/PUBLIC_API.md`,
                label: "Contrato de API publica",
              },
              {
                href: `${repoUrl}/blob/main/docs/MIGRATION.md`,
                label: "Guia de migracion",
              },
            ],
            title: "Ancla el producto en el contrato estable",
          },
          {
            body: [
              "Cierra la ruta avanzada con empaquetado y verificacion. Una libreria estable no es solo runtime: tambien son exports, tipos generados, smoke tests y comandos de release que protegen a los consumidores.",
              "Este es el paso final que convierte la secuencia de tutoriales en checklist de release para la linea estable actual.",
            ],
            checklist: [
              "Ejecuta juntos unit tests, visual tests y build outputs antes de publicar.",
              "Verifica que ESM, UMD y los tipos publicados coincidan con el contrato.",
              "Usa la guia de ejemplos como smoke-test de las capacidades publicas.",
            ],
            id: "release-hardening",
            minutes: "16 min",
            resources: [
              { href: `${repoUrl}/blob/main/CHANGELOG.md`, label: "Notas de version" },
              {
                href: `${repoUrl}/blob/main/docs/EXAMPLES.md`,
                label: "Guia de ejemplos",
              },
              {
                href: `${repoUrl}/blob/main/.github/workflows/ci.yml`,
                label: "Workflow de CI",
              },
            ],
            title: "Verifica la superficie del paquete antes de publicar",
          },
        ],
        summary:
          "Cierra la linea estable con scenes, audio y verificacion de release para que tu proyecto crezca sin perder la claridad de una libreria pequena.",
        title: "Avanzado: escenas, audio y entrega estable",
      },
    },
    tutorialsPath: "/es/tutorials/",
    versionLabel: `Disenado para v${libraryVersion}`,
  },
};
