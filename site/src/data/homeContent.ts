import { libraryVersion } from "./siteRelease";

export type HomeLocale = "en" | "es" | "ja";

interface LocaleLink {
  href: string;
  label: string;
}

interface HomeCapability {
  code: string;
  name: string;
  text: string;
}

interface HomeDocLink {
  href: string;
  label: string;
  text: string;
}

interface HomeExample {
  href: string;
  id: "audio-arcade" | "buddy" | "hud" | "runtime" | "shapes";
  name: string;
  number: string;
  text: string;
}

interface HomeContent {
  api: {
    kicker: string;
    lede: string;
    title: string;
  };
  audioControls: {
    initialStatus: string;
    loop: string;
    mute: string;
    pickup: string;
    shoot: string;
    stop: string;
  };
  brandAria: string;
  buddyControls: {
    feed: string;
    nap: string;
    play: string;
  };
  capabilities: HomeCapability[];
  capabilitiesSection: {
    kicker: string;
    lede: string;
    title: string;
  };
  codeBlockTitles: {
    audioArcade: string;
    install: string;
    pixelSprite: string;
    pointerGrid: string;
    runtime: string;
  };
  docs: HomeDocLink[];
  docsPath: string;
  docsSection: {
    kicker: string;
    title: string;
  };
  examples: HomeExample[];
  examplesSection: {
    kicker: string;
    lede: string;
    title: string;
  };
  footer: {
    right: string;
  };
  hero: {
    actions: {
      docs: string;
      examples: string;
      install: string;
      playground: string;
    };
    copy: string;
    eyebrow: string;
    panelFooter: [string, string];
    panelLabel: string;
    subcopy: string;
  };
  htmlLang: string;
  liveBadge: string;
  liveDemoSuffix: string;
  localeLinks: LocaleLink[];
  localeNavAria: string;
  metaDescription: string;
  nav: {
    capabilities: string;
    docs: string;
    examples: string;
    playground: string;
  };
  pageTitle: string;
  peekStrip: string[];
  primaryNavAria: string;
  release: {
    kicker: string;
    title: string;
    timeline: Array<{ summary: string; version: string }>;
  };
  runtimeHint: string;
  sourceAriaPrefix: string;
  sourceTooltip: string;
}

const repoUrl = "https://github.com/joshuacba08/grid-canvas-system";

export const homeContentByLocale: Record<HomeLocale, HomeContent> = {
  en: {
    api: {
      kicker: "API Lanes",
      lede:
        "Each lane maps to a documented public API. The landing page uses the same local source through Astro, so the showcase evolves with the library.",
      title: "Copyable paths from blank canvas to moving scene.",
    },
    audioControls: {
      initialStatus: "Click a control to unlock browser audio.",
      loop: "Loop",
      mute: "Mute",
      pickup: "Pickup",
      shoot: "Shoot",
      stop: "Stop",
    },
    brandAria: "Grid Canvas System home",
    buddyControls: {
      feed: "Feed",
      nap: "Nap",
      play: "Play",
    },
    capabilities: [
      {
        code: 'new GridCanvasSystem("canvas", { cellSize: 20 })',
        name: "Grid-first canvas",
        text: "Initialize an HTML canvas with predictable sizing, HiDPI rendering, visible grid lines and coordinate labels.",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "Pixel sprites",
        text: "Draw matrix-based pixel art with strict palettes, transparent cells and absolute canvas coordinates.",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "Arcade shapes",
        text: "Compose Pac-Man, ghosts, projectiles, spaceships, asteroids, sectors, lines, polylines and HUD overlays.",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "Runtime helpers",
        text: "Run animation loops, sprite animators and finite state machines without adopting a full game framework.",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "Input and motion",
        text: "Track keyboard and pointer state, convert angles, wrap bodies, test collisions and keep trails or particles alive.",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "Audio add-ons",
        text: "Trigger browser-native retro SFX and looping cues, or opt into Howler and Tone adapters for assets and generative music.",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "Grid coordinates",
        text: "Convert canvas points to cells, cells to canvas points and snap interactions to a grid explicitly.",
      },
    ],
    capabilitiesSection: {
      kicker: "Capability Matrix",
      lede:
        "The package keeps the core direct and adds reusable primitives only when they unlock many demos: drawing, motion, state, input, particles, grid-aware interaction and optional audio cues.",
      title: "Small surface, enough runtime to feel alive.",
    },
    codeBlockTitles: {
      audioArcade: "Audio Arcade",
      install: "Install",
      pixelSprite: "Pixel Sprite",
      pointerGrid: "Pointer Grid",
      runtime: "Runtime",
    },
    docs: [
      {
        href: "/docs/",
        label: "Guides",
        text: "Install paths, audio setup, runtime concepts and getting-started guides in English and Spanish.",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "Edit and run pixel sprites, runtime loops, HUD scenes and browser-native audio arcade cues with Monaco.",
      },
      {
        href: "/docs/#audio-addons",
        label: "Audio",
        text: "Choose between zero-dependency arcade cues and optional Howler or Tone adapters.",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "Study",
        text: "Architecture, public API, rendering flow, packaging and verification notes.",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "Findings",
        text: "Applied improvements, remaining risks and the current technical backlog.",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "Research",
        text: "Innovation strategy, market positioning, comparison with larger engines and scaling roadmap.",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "Changelog",
        text: `Release notes from 0.1.x through the current ${libraryVersion} audio expansion.`,
      },
    ],
    docsPath: "/docs/",
    docsSection: {
      kicker: "Documentation Map",
      title: "Everything useful stays one click from the package.",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "A tiny companion built with pixel sprites, animator, state machine and local persistence.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "A moving actor driven by MassBody, keyboard input and requestAnimationFrame.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "Retro sound effects, a looping patrol cue and mute control through the new browser-native addon.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "Value labels, status bars and centered messages for game-like overlays.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Pixel Shapes",
        number: "05",
        text: "Pac-Man, ghost, projectile, asteroid and spaceship primitives.",
      },
    ],
    examplesSection: {
      kicker: "Example Gallery",
      lede:
        "Vanilla examples remain the reference path: CDN-friendly, framework-free and now able to show runtime, drawing and browser-native audio patterns close to the source.",
      title: "Readable demos before framework ceremony.",
    },
    footer: {
      right: "A tiny canvas engine for playful interactive systems.",
    },
    hero: {
      actions: {
        docs: "Read docs",
        examples: "View examples",
        install: "npm install",
        playground: "Open playground",
      },
      copy: "Build small interactive Canvas scenes with grids, pixel art, sprites, animation, input, collisions and audio-ready add-ons.",
      eyebrow: `v${libraryVersion} / Tiny Canvas Engine`,
      panelFooter: ["ESM + UMD", "0 runtime deps"],
      panelLabel: "Runtime code preview",
      subcopy:
        "Start with browser-native arcade feedback, then opt into asset or music adapters only when a scene needs them.",
    },
    htmlLang: "en",
    liveBadge: "Live",
    liveDemoSuffix: "live demo",
    localeLinks: [
      { href: "/", label: "EN" },
      { href: "/es/", label: "ES" },
      { href: "/ja/", label: "JA" },
    ],
    localeNavAria: "Home language selector",
    metaDescription:
      "grid-canvas-system is a tiny Canvas engine for grids, pixel art, sprites, animation, input, collisions and playful interactive systems.",
    nav: {
      capabilities: "Capabilities",
      docs: "Docs",
      examples: "Examples",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System",
    peekStrip: ["Grid helpers", "Pixel sprites", "State machines", "Visual snapshots"],
    primaryNavAria: "Primary navigation",
    release: {
      kicker: "Release",
      timeline: [
        {
          summary: "Audio Arcade presets, custom loops, Howler and Tone adapters, plus vanilla audio demos.",
          version: libraryVersion,
        },
        {
          summary: "Grid coordinate helpers and pointer tracking.",
          version: "0.3.0",
        },
        {
          summary: "Pixel sprites, animator, state machine and Grid Buddy.",
          version: "0.2.0",
        },
        {
          summary: "Core canvas/grid API, drawing helpers and visual snapshots.",
          version: "0.1.x",
        },
      ],
      title: "Audio add-ons and retro arcade sound with CI, visual tests and docs in sync.",
    },
    runtimeHint: "Focus canvas + arrow keys",
    sourceAriaPrefix: "Open source for",
    sourceTooltip: "View source",
  },
  es: {
    api: {
      kicker: "Rutas de API",
      lede:
        "Cada ruta corresponde a una API publica documentada. La landing usa la misma fuente local en Astro, asi que el showcase evoluciona junto con la libreria.",
      title: "Caminos copiables desde un canvas vacio hasta una escena en movimiento.",
    },
    audioControls: {
      initialStatus: "Haz click en un control para desbloquear el audio del navegador.",
      loop: "Loop",
      mute: "Silencio",
      pickup: "Pickup",
      shoot: "Shoot",
      stop: "Detener",
    },
    brandAria: "Inicio de Grid Canvas System",
    buddyControls: {
      feed: "Dar comida",
      nap: "Dormir",
      play: "Jugar",
    },
    capabilities: [
      {
        code: 'new GridCanvasSystem("canvas", { cellSize: 20 })',
        name: "Canvas con grilla primero",
        text: "Inicializa un canvas HTML con tamano predecible, render HiDPI, lineas de grilla visibles y etiquetas de coordenadas.",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "Sprites pixel",
        text: "Dibuja pixel art matricial con paletas estrictas, celdas transparentes y coordenadas absolutas de canvas.",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "Formas arcade",
        text: "Compone Pac-Man, fantasmas, proyectiles, naves, asteroides, sectores, lineas, polilineas y overlays de HUD.",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "Helpers de runtime",
        text: "Ejecuta animation loops, sprite animators y maquinas de estado sin adoptar un framework completo.",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "Input y movimiento",
        text: "Sigue teclado y puntero, convierte angulos, aplica wrapping, prueba colisiones y mantiene trails o particulas.",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "Add-ons de audio",
        text: "Dispara SFX retro nativos del navegador y cues en loop, o suma adapters de Howler y Tone para assets y musica generativa.",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "Coordenadas de grilla",
        text: "Convierte puntos de canvas a celdas, celdas a canvas y ajusta interacciones a la grilla de forma explicita.",
      },
    ],
    capabilitiesSection: {
      kicker: "Matriz de capacidades",
      lede:
        "El paquete mantiene el nucleo directo y suma primitivas reutilizables solo cuando destraban muchos demos: dibujo, movimiento, estado, input, particulas, interaccion con grilla y audio opcional.",
      title: "Superficie pequena, runtime suficiente para sentirse vivo.",
    },
    codeBlockTitles: {
      audioArcade: "Audio Arcade",
      install: "Instalacion",
      pixelSprite: "Sprite Pixel",
      pointerGrid: "Puntero y grilla",
      runtime: "Runtime",
    },
    docs: [
      {
        href: "/es/docs/",
        label: "Guias",
        text: "Instalacion, setup de audio, conceptos de runtime y guia inicial en espanol e ingles.",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "Edita y corre sprites pixel, loops de runtime, escenas HUD y cues arcade de audio nativo con Monaco.",
      },
      {
        href: "/es/docs/#audio-addons",
        label: "Audio",
        text: "Elige entre cues arcade sin dependencias y adapters opcionales de Howler o Tone.",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "Estudio",
        text: "Arquitectura, API publica, flujo de render, empaquetado y notas de verificacion.",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "Hallazgos",
        text: "Mejoras aplicadas, riesgos pendientes y backlog tecnico actual.",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "Investigacion",
        text: "Estrategia de innovacion, posicionamiento, comparacion con motores grandes y roadmap de escalado.",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "Changelog",
        text: `Notas de version desde 0.1.x hasta la expansion de audio en ${libraryVersion}.`,
      },
    ],
    docsPath: "/es/docs/",
    docsSection: {
      kicker: "Mapa de documentacion",
      title: "Todo lo util queda a un click del paquete.",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "Un companero pequeno construido con sprites pixel, animator, state machine y persistencia local.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "Un actor en movimiento controlado por MassBody, teclado y requestAnimationFrame.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "Efectos retro, un patrol loop y mute desde el nuevo addon nativo del navegador.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "Etiquetas de valor, barras de estado y mensajes centrados para overlays tipo juego.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Formas Pixel",
        number: "05",
        text: "Primitivas de Pac-Man, fantasma, proyectil, asteroide y nave.",
      },
    ],
    examplesSection: {
      kicker: "Galeria de ejemplos",
      lede:
        "Los ejemplos vanilla siguen siendo la ruta de referencia: compatibles con CDN, sin framework y ahora capaces de mostrar runtime, dibujo y patrones de audio nativo del navegador cerca del codigo fuente.",
      title: "Demos legibles antes de la ceremonia del framework.",
    },
    footer: {
      right: "Un motor Canvas pequeno para sistemas interactivos y juguetones.",
    },
    hero: {
      actions: {
        docs: "Leer docs",
        examples: "Ver ejemplos",
        install: "npm install",
        playground: "Abrir playground",
      },
      copy: "Construye escenas Canvas pequenas e interactivas con grillas, pixel art, sprites, animacion, input, colisiones y add-ons de audio.",
      eyebrow: `v${libraryVersion} / Motor Canvas Ligero`,
      panelFooter: ["ESM + UMD", "0 dependencias runtime"],
      panelLabel: "Preview de codigo runtime",
      subcopy:
        "Empieza con feedback arcade nativo del navegador y suma adapters de assets o musica solo cuando la escena lo necesite.",
    },
    htmlLang: "es",
    liveBadge: "En vivo",
    liveDemoSuffix: "demo en vivo",
    localeLinks: [
      { href: "/", label: "EN" },
      { href: "/es/", label: "ES" },
      { href: "/ja/", label: "JA" },
    ],
    localeNavAria: "Selector de idioma de la home",
    metaDescription:
      "grid-canvas-system es un motor Canvas pequeno para grillas, pixel art, sprites, animacion, input, colisiones y sistemas interactivos.",
    nav: {
      capabilities: "Capacidades",
      docs: "Docs",
      examples: "Ejemplos",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System / Inicio",
    peekStrip: ["Helpers de grilla", "Sprites pixel", "Maquinas de estado", "Snapshots visuales"],
    primaryNavAria: "Navegacion principal",
    release: {
      kicker: "Version",
      timeline: [
        {
          summary: "Presets de Audio Arcade, loops personalizados, adapters de Howler y Tone, mas demos vanilla de audio.",
          version: libraryVersion,
        },
        {
          summary: "Helpers de coordenadas de grilla y seguimiento de puntero.",
          version: "0.3.0",
        },
        {
          summary: "Sprites pixel, animator, state machine y Grid Buddy.",
          version: "0.2.0",
        },
        {
          summary: "API base de canvas/grilla, helpers de dibujo y snapshots visuales.",
          version: "0.1.x",
        },
      ],
      title: "Audio retro y add-ons de sonido con CI, tests visuales y docs sincronizadas.",
    },
    runtimeHint: "Enfoca el canvas y usa las flechas",
    sourceAriaPrefix: "Abrir codigo fuente de",
    sourceTooltip: "Ver fuente",
  },
  ja: {
    api: {
      kicker: "APIレーン",
      lede:
        "各レーンは公開APIに対応しています。ランディングページも同じローカルソースを使うので、ショーケースはライブラリと一緒に進化します。",
      title: "空のcanvasから動くシーンまで、そのまま使える導線。",
    },
    audioControls: {
      initialStatus: "操作するとブラウザ音声が有効になります。",
      loop: "ループ",
      mute: "ミュート",
      pickup: "取得",
      shoot: "発射",
      stop: "停止",
    },
    brandAria: "Grid Canvas System ホーム",
    buddyControls: {
      feed: "エサ",
      nap: "休む",
      play: "遊ぶ",
    },
    capabilities: [
      {
        code: 'new GridCanvasSystem("canvas", { cellSize: 20 })',
        name: "グリッド中心のcanvas",
        text: "サイズ、HiDPI描画、グリッド線、座標ラベルを予測しやすい形で持つHTML canvasを初期化します。",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "ピクセルスプライト",
        text: "厳密なパレット、透明セル、絶対座標を使ってマトリクス型のピクセルアートを描画します。",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "アーケード図形",
        text: "Pac-Man、ゴースト、弾、宇宙船、アステロイド、セクタ、ライン、ポリライン、HUDを組み合わせられます。",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "runtimeヘルパー",
        text: "フルゲームフレームワークなしで animation loop、sprite animator、state machine を使えます。",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "入力と移動",
        text: "キーボードとポインタを追跡し、角度変換、wrap、衝突判定、trailやparticleの更新を行います。",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "音声アドオン",
        text: "ブラウザネイティブなレトロSFXとループを使うか、HowlerとToneのadapterでasset再生や音楽生成を追加できます。",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "グリッド座標",
        text: "canvas上の点とセルを相互変換し、操作位置を明示的にグリッドへスナップできます。",
      },
    ],
    capabilitiesSection: {
      kicker: "機能マトリクス",
      lede:
        "コアは直接的なまま保ち、多くのデモを解放する時だけ再利用可能なプリミティブを追加します。描画、移動、状態、入力、particle、グリッド操作、そして任意の音声です。",
      title: "小さな表面積、でも十分に生きているruntime。",
    },
    codeBlockTitles: {
      audioArcade: "Audio Arcade",
      install: "導入",
      pixelSprite: "ピクセルスプライト",
      pointerGrid: "ポインタとグリッド",
      runtime: "Runtime",
    },
    docs: [
      {
        href: "/docs/",
        label: "ガイド",
        text: "導入、音声セットアップ、runtimeの考え方、そして英語とスペイン語のgetting-startedガイド。",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "ピクセルスプライト、runtime loop、HUD、ブラウザネイティブなaudio arcade cueをMonacoで編集して実行できます。",
      },
      {
        href: "/docs/#audio-addons",
        label: "音声",
        text: "依存なしのarcade cueと、任意のHowler/Tone adapterを選べます。",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "設計",
        text: "アーキテクチャ、公開API、描画フロー、配布、検証メモ。",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "改善",
        text: "適用済みの改善、残るリスク、現在の技術バックログ。",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "調査",
        text: "イノベーション戦略、市場ポジショニング、大規模エンジンとの比較、拡張ロードマップ。",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "変更履歴",
        text: `0.1.x から ${libraryVersion} のaudio拡張までのリリースノート。`,
      },
    ],
    docsPath: "/docs/",
    docsSection: {
      kicker: "ドキュメントマップ",
      title: "必要なものへ、パッケージからすぐに届く。",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "ピクセルスプライト、animator、state machine、local persistenceで作った小さな相棒。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "MassBody、キーボード入力、requestAnimationFrameで動くアクター。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "レトロ効果音、patrol loop、mute制御を新しいブラウザネイティブaddonで提供。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "値ラベル、ステータスバー、中央メッセージでゲーム風overlayを構成。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Pixel Shapes",
        number: "05",
        text: "Pac-Man、ghost、projectile、asteroid、spaceship のプリミティブ。",
      },
    ],
    examplesSection: {
      kicker: "サンプルギャラリー",
      lede:
        "Vanillaサンプルは今も参照経路です。CDNでも使え、フレームワーク不要で、runtime・描画・ブラウザ音声のパターンをソースの近くで確認できます。",
      title: "フレームワークの前に、読みやすいデモ。",
    },
    footer: {
      right: "遊び心のあるインタラクティブシステム向けの小さなCanvasエンジン。",
    },
    hero: {
      actions: {
        docs: "Docsを読む",
        examples: "例を見る",
        install: "npm install",
        playground: "Playgroundを開く",
      },
      copy: "グリッド、ピクセルアート、スプライト、アニメーション、入力、衝突判定、音声アドオン付きの小さなCanvasシーンを作れます。",
      eyebrow: `v${libraryVersion} / 軽量Canvasエンジン`,
      panelFooter: ["ESM + UMD", "runtime依存 0"],
      panelLabel: "runtimeコードプレビュー",
      subcopy:
        "まずはブラウザネイティブなアーケード音を使い、必要になったらassetやmusic adapterを追加します。",
    },
    htmlLang: "ja",
    liveBadge: "ライブ",
    liveDemoSuffix: "ライブデモ",
    localeLinks: [
      { href: "/", label: "EN" },
      { href: "/es/", label: "ES" },
      { href: "/ja/", label: "JA" },
    ],
    localeNavAria: "ホーム言語切替",
    metaDescription:
      "grid-canvas-system は、グリッド、ピクセルアート、スプライト、アニメーション、入力、衝突判定に向いた小さなCanvasエンジンです。",
    nav: {
      capabilities: "機能",
      docs: "Docs",
      examples: "例",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System / ホーム",
    peekStrip: ["グリッド補助", "ピクセルスプライト", "状態機械", "ビジュアルスナップショット"],
    primaryNavAria: "主要ナビゲーション",
    release: {
      kicker: "バージョン",
      timeline: [
        {
          summary: "Audio Arcadeのpreset、カスタムloop、Howler/Tone adapter、そしてvanilla audio demoを追加。",
          version: libraryVersion,
        },
        {
          summary: "グリッド座標helperとpointer trackingを追加。",
          version: "0.3.0",
        },
        {
          summary: "ピクセルスプライト、animator、state machine、Grid Buddyを追加。",
          version: "0.2.0",
        },
        {
          summary: "canvas/grid API、描画helper、visual snapshotを確立。",
          version: "0.1.x",
        },
      ],
      title: "レトロ音声アドオンをCI、ビジュアルテスト、ドキュメントと一緒に公開。",
    },
    runtimeHint: "canvasを選んで矢印キー",
    sourceAriaPrefix: "ソースを開く",
    sourceTooltip: "ソースを見る",
  },
};