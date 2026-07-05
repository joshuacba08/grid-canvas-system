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
  localeSelectLabel: string;
  metaDescription: string;
  menuButtonLabel: string;
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
  terminal: {
    headerSubtitle: string;
    headerTitle: string;
    phaseDone: string;
    phaseIdle: string;
    states: {
      done: string;
      pending: string;
      working: string;
    };
    steps: Array<{
      command: string;
      note: string;
    }>;
  };
  versionLabel: string;
}

const repoUrl = "https://github.com/joshuacba08/grid-canvas-system";

export const homeContentByLocale: Record<HomeLocale, HomeContent> = {
  en: {
    api: {
      kicker: "Quick Start Paths",
      lede:
        "Install it, draw something on day one, then layer runtime, pointer logic and audio only when the scene earns it.",
      title: "From first grid to playable scene in a few copyable steps.",
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
        name: "Grid-ready canvas",
        text: "Spin up a crisp HTML canvas with predictable sizing, HiDPI rendering and an always-readable grid.",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "Pixel sprites",
        text: "Render pixel art from simple matrices so sprites stay lightweight, editable and easy to ship.",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "Arcade primitives",
        text: "Drop in Pac-Man, ghosts, ships, asteroids, HUD pieces and other reusable shapes instead of rebuilding them.",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "Lightweight runtime",
        text: "Animate, switch states and drive scenes with a minimal runtime that adds motion without framework overhead.",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "Input and motion",
        text: "Wire keyboard, pointer, collisions, wrapping and small physics helpers for game-like interaction fast.",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "Audio add-ons",
        text: "Start with built-in retro cues, then plug in Howler or Tone when you want assets or generative music.",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "Grid coordinates",
        text: "Map clicks, touches and scene logic back to cells with explicit grid conversion and snapping helpers.",
      },
    ],
    capabilitiesSection: {
      kicker: "Why Teams Pick It",
      lede:
        "Everything here is tuned for small interactive scenes: strong canvas defaults, reusable drawing primitives and just enough runtime to make a prototype feel shippable.",
      title: "Grid-first by default. Playable in minutes.",
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
        text: "Go from install to first scene fast, with setup, runtime and audio paths explained clearly.",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "Try the API in the browser and tweak sprites, loops, HUD overlays and arcade cues live.",
      },
      {
        href: "/docs/#audio-addons",
        label: "Audio",
        text: "Pick the right audio lane: built-in arcade cues, Howler assets or Tone-powered music.",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "Study",
        text: "Dive into architecture and rendering decisions when you want the deeper technical picture.",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "Findings",
        text: "Review shipped improvements, current tradeoffs and the technical priorities ahead.",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "Research",
        text: "See the market positioning, product direction and how the library compares with larger engines.",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "Changelog",
        text: `Track everything new from 0.1.x to the current ${libraryVersion} release.`,
      },
    ],
    docsPath: "/docs/",
    docsSection: {
      kicker: "Learn & Evaluate",
      title: "Docs, playground and source all stay close to the product.",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "A compact character demo that shows how far sprites, state and persistence can go with very little code.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "A clean motion sandbox for loops, body movement and keyboard-driven interaction.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "Instant retro feedback and looping cues without bringing in a heavyweight audio stack.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "Ready-to-use overlays for scores, bars, status labels and centered scene messages.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Pixel Shapes",
        number: "05",
        text: "Arcade-flavored building blocks for fast prototypes, playful tools and visual experiments.",
      },
    ],
    examplesSection: {
      kicker: "Live Showcase",
      lede:
        "Each example proves a product promise in plain code: motion, sprites, HUD, audio and reusable arcade parts.",
      title: "See the library working like a product, not a pitch.",
    },
    footer: {
      right: "Grid-first canvas tooling for playful interactive products.",
    },
    hero: {
      actions: {
        docs: "Read docs",
        examples: "View examples",
        install: "npm install",
        playground: "Open playground",
      },
      copy: "A grid-first canvas library for pixel art, motion, input and arcade-ready interactive scenes.",
      eyebrow: `v${libraryVersion} / Grid-First Canvas Library`,
      panelFooter: ["ESM + UMD", "0 runtime deps"],
      panelLabel: "Runtime code preview",
      subcopy:
        "Start with a visible grid, ship the first prototype fast, and add runtime or audio only when the scene needs more range.",
    },
    htmlLang: "en",
    liveBadge: "Live",
    liveDemoSuffix: "live demo",
    localeLinks: [
      { href: "/", label: "English" },
      { href: "/es/", label: "Español" },
      { href: "/ja/", label: "日本語" },
    ],
    localeNavAria: "Home language selector",
    localeSelectLabel: "Language",
    metaDescription:
      "grid-canvas-system is a grid-first canvas library for pixel art, sprites, animation, input, collisions and audio-ready interactive scenes.",
    menuButtonLabel: "Toggle navigation menu",
    nav: {
      capabilities: "Capabilities",
      docs: "Docs",
      examples: "Examples",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System",
    peekStrip: ["Grid-first API", "Pixel sprites", "Light runtime", "Audio add-ons"],
    primaryNavAria: "Primary navigation",
    release: {
      kicker: "Release",
      timeline: [
        {
          summary:
            "Commercial home storytelling refresh, tighter footer design and README/version alignment.",
          version: libraryVersion,
        },
        {
          summary:
            "Built-in Audio Arcade presets, custom loops and optional Howler/Tone adapters for richer sound design.",
          version: "0.4.0",
        },
        {
          summary: "Grid-aware pointer tracking and explicit coordinate helpers for interactive scenes.",
          version: "0.3.0",
        },
        {
          summary: "Pixel sprites, sprite animation, state machines and the Grid Buddy showcase.",
          version: "0.2.0",
        },
        {
          summary: "The core grid canvas API, drawing primitives and snapshot-backed rendering confidence.",
          version: "0.1.x",
        },
      ],
      title: "Shipped with product discipline: positioning, docs and release metadata stay in sync.",
    },
    runtimeHint: "Focus canvas + arrow keys",
    sourceAriaPrefix: "Open source for",
    sourceTooltip: "View source",
    terminal: {
      headerSubtitle: "release workflow",
      headerTitle: "workspace.pipeline",
      phaseDone: "Cycle complete",
      phaseIdle: "Queued",
      states: {
        done: "Done",
        pending: "Queued",
        working: "Working",
      },
      steps: [
        {
          command: "pnpm add grid-canvas-system",
          note: "Install the core library and keep optional audio lanes available when your scene grows.",
        },
        {
          command: "pnpm test",
          note: "Check runtime, drawing and audio behavior before pushing a new scene.",
        },
        {
          command: "pnpm run test:visual",
          note: "Protect rendering output with snapshot coverage before shipping visual changes.",
        },
        {
          command: "pnpm run build",
          note: "Generate bundles and align the docs site with the current release.",
        },
      ],
    },
    versionLabel: "Current version",
  },
  es: {
    api: {
      kicker: "Rutas de arranque",
      lede:
        "Instalalo, dibuja algo desde el primer dia y suma runtime, puntero y audio solo cuando la escena pida mas.",
      title: "Del primer grid a una escena jugable en pocos pasos copiables.",
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
        name: "Canvas listo para grid",
        text: "Levanta un canvas HTML nitido con tamano predecible, render HiDPI y una grilla siempre legible.",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "Sprites pixel",
        text: "Renderiza pixel art desde matrices simples para que los sprites sigan livianos, editables y faciles de publicar.",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "Primitivas arcade",
        text: "Suma Pac-Man, fantasmas, naves, asteroides, HUD y otras formas reutilizables sin reconstruirlas cada vez.",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "Runtime liviano",
        text: "Anima, cambia de estado y mueve escenas con un runtime minimo que agrega vida sin sobrecarga de framework.",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "Input y movimiento",
        text: "Conecta teclado, puntero, colisiones, wrapping y helpers fisicos simples para interaccion tipo juego rapidamente.",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "Add-ons de audio",
        text: "Empieza con cues retro integrados y agrega Howler o Tone solo cuando quieras assets o musica generativa.",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "Coordenadas de grilla",
        text: "Lleva clicks, touch y logica de escena a celdas con helpers explicitos de conversion y snap.",
      },
    ],
    capabilitiesSection: {
      kicker: "Por que funciona",
      lede:
        "Todo esta pensado para escenas interactivas pequenas: buenos defaults de canvas, primitivas reutilizables y el runtime justo para que un prototipo se sienta listo para mostrar.",
      title: "Grid primero. Prototipo jugable en minutos.",
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
        text: "Pasa de la instalacion a la primera escena rapido, con setup, runtime y audio explicados con claridad.",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "Prueba la API en el navegador y ajusta sprites, loops, HUD y cues arcade en vivo.",
      },
      {
        href: "/es/docs/#audio-addons",
        label: "Audio",
        text: "Elige tu ruta de audio: cues integrados, assets con Howler o musica con Tone.",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "Estudio",
        text: "Profundiza en arquitectura y decisiones de render cuando quieras la mirada tecnica completa.",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "Hallazgos",
        text: "Revisa mejoras ya enviadas, compromisos actuales y prioridades tecnicas.",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "Investigacion",
        text: "Entiende el posicionamiento, la direccion de producto y la comparacion frente a motores mas grandes.",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "Changelog",
        text: `Sigue todo lo nuevo desde 0.1.x hasta la release actual ${libraryVersion}.`,
      },
    ],
    docsPath: "/es/docs/",
    docsSection: {
      kicker: "Aprende y valida",
      title: "Docs, playground y codigo fuente quedan cerca del producto.",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "Una demo compacta que muestra hasta donde llegan sprites, estado y persistencia con muy poco codigo.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "Un sandbox limpio para loops, movimiento de cuerpos e interaccion por teclado.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "Feedback retro instantaneo y loops listos sin cargar un stack de audio pesado.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "Overlays listos para score, barras, labels de estado y mensajes centrados.",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Formas Pixel",
        number: "05",
        text: "Bloques arcade reutilizables para prototipos rapidos, herramientas juguetonas y pruebas visuales.",
      },
    ],
    examplesSection: {
      kicker: "Showcase en vivo",
      lede:
        "Cada ejemplo prueba una promesa concreta: sprites, movimiento, HUD, audio y piezas arcade reutilizables.",
      title: "Mira la libreria trabajando como producto, no como discurso.",
    },
    footer: {
      right: "Herramientas canvas orientadas a grid para productos interactivos con personalidad.",
    },
    hero: {
      actions: {
        docs: "Leer docs",
        examples: "Ver ejemplos",
        install: "npm install",
        playground: "Abrir playground",
      },
      copy: "Una libreria canvas orientada a grid para pixel art, movimiento, input y escenas interactivas con sabor arcade.",
      eyebrow: `v${libraryVersion} / Libreria Canvas Grid-First`,
      panelFooter: ["ESM + UMD", "0 dependencias runtime"],
      panelLabel: "Preview de codigo runtime",
      subcopy:
        "Empieza con una grilla visible, saca un primer prototipo rapido y agrega runtime o audio solo cuando la escena necesite mas alcance.",
    },
    htmlLang: "es",
    liveBadge: "En vivo",
    liveDemoSuffix: "demo en vivo",
    localeLinks: [
      { href: "/", label: "English" },
      { href: "/es/", label: "Español" },
      { href: "/ja/", label: "日本語" },
    ],
    localeNavAria: "Selector de idioma de la home",
    localeSelectLabel: "Idioma",
    metaDescription:
      "grid-canvas-system es una libreria canvas grid-first para pixel art, sprites, animacion, input, colisiones y escenas interactivas con audio.",
    menuButtonLabel: "Abrir o cerrar navegacion",
    nav: {
      capabilities: "Capacidades",
      docs: "Docs",
      examples: "Ejemplos",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System / Inicio",
    peekStrip: ["API grid-first", "Sprites pixel", "Runtime liviano", "Add-ons de audio"],
    primaryNavAria: "Navegacion principal",
    release: {
      kicker: "Version",
      timeline: [
        {
          summary:
            "Refresh comercial de la home, footer mas compacto y alineacion del README con la version real.",
          version: libraryVersion,
        },
        {
          summary:
            "Audio Arcade integrado, loops personalizados y adapters opcionales de Howler y Tone para subir el nivel sonoro.",
          version: "0.4.0",
        },
        {
          summary: "Seguimiento de puntero y helpers de coordenadas para escenas interactivas con grid.",
          version: "0.3.0",
        },
        {
          summary: "Sprites pixel, animacion de sprites, state machine y el showcase Grid Buddy.",
          version: "0.2.0",
        },
        {
          summary: "API base de canvas con grilla, primitivas de dibujo y confianza de render con snapshots.",
          version: "0.1.x",
        },
      ],
      title: "Se entrega con disciplina de producto: posicionamiento, docs y metadatos avanzan juntos.",
    },
    runtimeHint: "Enfoca el canvas y usa las flechas",
    sourceAriaPrefix: "Abrir codigo fuente de",
    sourceTooltip: "Ver fuente",
    terminal: {
      headerSubtitle: "flujo de release",
      headerTitle: "workspace.pipeline",
      phaseDone: "Ciclo completo",
      phaseIdle: "En cola",
      states: {
        done: "Listo",
        pending: "En cola",
        working: "Activo",
      },
      steps: [
        {
          command: "pnpm add grid-canvas-system",
          note: "Instala la libreria base y deja abiertas las rutas opcionales de audio para cuando la escena crezca.",
        },
        {
          command: "pnpm test",
          note: "Valida runtime, dibujo y audio antes de mover una escena a release.",
        },
        {
          command: "pnpm run test:visual",
          note: "Protege el render con snapshots antes de publicar cambios visuales.",
        },
        {
          command: "pnpm run build",
          note: "Genera bundles y alinea el sitio con la version actual.",
        },
      ],
    },
    versionLabel: "Version actual",
  },
  ja: {
    api: {
      kicker: "スタートパス",
      lede:
        "導入してすぐ描き始め、必要になった時だけ runtime、pointer、audio を足せます。",
      title: "最初のグリッドから遊べるシーンまで、すぐ使える数ステップ。",
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
        name: "グリッド対応canvas",
        text: "予測しやすいサイズ、HiDPI 描画、見やすいグリッドを備えた HTML canvas をすぐに立ち上げられます。",
      },
      {
        code: "grid.drawPixelSprite(sprite, options)",
        name: "ピクセルスプライト",
        text: "シンプルな行列データからピクセルアートを描けるので、sprite を軽く保ったまま編集しやすくできます。",
      },
      {
        code: "drawPacman / drawShip / drawMessage",
        name: "アーケードプリミティブ",
        text: "Pac-Man、ghost、ship、asteroid、HUD などの再利用パーツを、そのままシーンへ持ち込めます。",
      },
      {
        code: "GridCanvasSystem.runtime.createAnimationLoop",
        name: "軽量runtime",
        text: "framework を抱え込まずに、loop、state 切替、scene の動きを最小限の runtime で組み立てられます。",
      },
      {
        code: "createKeyTracker / createPointerTracker",
        name: "入力と移動",
        text: "keyboard、pointer、collision、wrap、軽い物理 helper をつないで、ゲームらしい操作感を素早く作れます。",
      },
      {
        code: "createArcadeAudio / createHowlerAssetAudio",
        name: "音声アドオン",
        text: "まずは内蔵のレトロ cue を使い、asset 再生や generative music が必要になったら Howler や Tone を足せます。",
      },
      {
        code: "canvasToGrid / gridToCanvas / snapPointToGrid",
        name: "グリッド座標",
        text: "click や touch、scene のロジックをセル基準へ戻せる explicit な変換と snap helper を用意しています。",
      },
    ],
    capabilitiesSection: {
      kicker: "選ばれる理由",
      lede:
        "小さなインタラクティブシーン向けに設計されています。canvas の強い初期値、再利用しやすい描画プリミティブ、そして手触りを出すのに十分な runtime をまとめています。",
      title: "グリッドから始めて、数分で動く。",
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
        text: "導入から最初のシーンまでを素早く進められるように、setup、runtime、audio の道筋を整理しています。",
      },
      {
        href: "/playground/",
        label: "Playground",
        text: "ブラウザ上で API を試し、sprite、loop、HUD、arcade cue をその場で調整できます。",
      },
      {
        href: "/docs/#audio-addons",
        label: "音声",
        text: "内蔵 arcade cue、Howler asset、Tone の音楽生成から合う音声レーンを選べます。",
      },
      {
        href: `${repoUrl}/blob/main/docs/ESTUDIO_TECNICO.md`,
        label: "設計",
        text: "より深く知りたい時のために、architecture と rendering の判断を追えます。",
      },
      {
        href: `${repoUrl}/blob/main/docs/HALLAZGOS_Y_MEJORAS.md`,
        label: "改善",
        text: "出荷済みの改善、現在の tradeoff、次の技術優先度を確認できます。",
      },
      {
        href: `${repoUrl}/blob/main/docs/INVESTIGACION_INNOVACION_ESCALADO.md`,
        label: "調査",
        text: "市場での立ち位置、プロダクトの方向性、大きな engine との違いを見渡せます。",
      },
      {
        href: `${repoUrl}/blob/main/CHANGELOG.md`,
        label: "変更履歴",
        text: `0.1.x から現在の ${libraryVersion} までの更新を追えます。`,
      },
    ],
    docsPath: "/docs/",
    docsSection: {
      kicker: "学ぶ / 試す",
      title: "Docs、Playground、source がプロダクトのすぐ隣にあります。",
    },
    examples: [
      {
        href: `${repoUrl}/tree/main/examples/vanilla/grid-buddy`,
        id: "buddy",
        name: "Grid Buddy",
        number: "01",
        text: "少ないコードで sprite、state、persistence がどこまで届くかを見せるコンパクトなデモ。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/runtime`,
        id: "runtime",
        name: "Runtime",
        number: "02",
        text: "loop、body movement、keyboard 操作を素直に試せる motion sandbox。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/audio-arcade`,
        id: "audio-arcade",
        name: "Audio Arcade",
        number: "03",
        text: "重い audio stack なしで、即座にレトロな反応音と loop を入れられます。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla/hud`,
        id: "hud",
        name: "HUD",
        number: "04",
        text: "score、bar、status label、中央メッセージ向けの overlay をすぐ使えます。",
      },
      {
        href: `${repoUrl}/tree/main/examples/vanilla`,
        id: "shapes",
        name: "Pixel Shapes",
        number: "05",
        text: "素早い試作や遊びのある UI に使える arcade 系の再利用ブロック。",
      },
    ],
    examplesSection: {
      kicker: "ライブショーケース",
      lede:
        "各サンプルは sprite、motion、HUD、audio、arcade パーツという一つの約束を、平易なコードで証明します。",
      title: "説明より先に、ライブラリが動くところを見せます。",
    },
    footer: {
      right: "遊び心あるインタラクティブ製品向けの、グリッド起点の canvas ツール。",
    },
    hero: {
      actions: {
        docs: "Docsを読む",
        examples: "例を見る",
        install: "npm install",
        playground: "Playgroundを開く",
      },
      copy: "ピクセルアート、動き、入力、アーケード感のあるシーンを素早く形にする、グリッド起点の canvas ライブラリ。",
      eyebrow: `v${libraryVersion} / グリッド起点の Canvas ライブラリ`,
      panelFooter: ["ESM + UMD", "runtime依存 0"],
      panelLabel: "runtimeコードプレビュー",
      subcopy:
        "まずは見えるグリッドから始め、最初のプロトタイプを早く出し、必要になった時だけ runtime や audio を広げられます。",
    },
    htmlLang: "ja",
    liveBadge: "ライブ",
    liveDemoSuffix: "ライブデモ",
    localeLinks: [
      { href: "/", label: "English" },
      { href: "/es/", label: "Español" },
      { href: "/ja/", label: "日本語" },
    ],
    localeNavAria: "ホーム言語切替",
    localeSelectLabel: "言語",
    metaDescription:
      "grid-canvas-system は、グリッド、ピクセルアート、sprite、animation、input、collision、audio 対応シーン向けの canvas ライブラリです。",
    menuButtonLabel: "ナビゲーションメニューを切り替え",
    nav: {
      capabilities: "機能",
      docs: "Docs",
      examples: "例",
      playground: "Playground",
    },
    pageTitle: "Grid Canvas System / ホーム",
    peekStrip: ["グリッドAPI", "ピクセルスプライト", "軽量runtime", "音声アドオン"],
    primaryNavAria: "主要ナビゲーション",
    release: {
      kicker: "バージョン",
      timeline: [
        {
          summary:
            "ホームのストーリーテリング刷新、フッターの圧縮、README とバージョン表記の整合を行いました。",
          version: libraryVersion,
        },
        {
          summary: "内蔵 Audio Arcade preset、custom loop、Howler/Tone adapter で音の幅を広げました。",
          version: "0.4.0",
        },
        {
          summary: "grid 座標 helper と pointer tracking で操作系を強化。",
          version: "0.3.0",
        },
        {
          summary: "pixel sprite、animator、state machine、Grid Buddy を追加。",
          version: "0.2.0",
        },
        {
          summary: "grid canvas API、描画 primitive、visual snapshot の基盤を確立。",
          version: "0.1.x",
        },
      ],
      title: "ポジショニング、docs、リリース表記まで揃えて出荷するライブラリです。",
    },
    runtimeHint: "canvasを選んで矢印キー",
    sourceAriaPrefix: "ソースを開く",
    sourceTooltip: "ソースを見る",
    terminal: {
      headerSubtitle: "release workflow",
      headerTitle: "workspace.pipeline",
      phaseDone: "完了",
      phaseIdle: "待機中",
      states: {
        done: "完了",
        pending: "待機",
        working: "実行中",
      },
      steps: [
        {
          command: "pnpm add grid-canvas-system",
          note: "コアライブラリを導入し、必要になった時の audio レーンもそのまま広げられます。",
        },
        {
          command: "pnpm test",
          note: "runtime、drawing、audio の挙動を確認してから次のシーンへ進めます。",
        },
        {
          command: "pnpm run test:visual",
          note: "描画変更は snapshot で守りながら出荷できます。",
        },
        {
          command: "pnpm run build",
          note: "bundle を生成し、site を現在の release に揃えます。",
        },
      ],
    },
    versionLabel: "現在のバージョン",
  },
};
