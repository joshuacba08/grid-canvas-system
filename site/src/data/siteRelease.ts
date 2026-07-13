export const libraryVersion = "1.1.0";

export const currentRelease = {
  version: libraryVersion,
  title: "Reactive canvas runtime and interaction primitives",
  summary:
    "Adds createCanvasRuntime, v2 animation loop lifecycle, reduced-motion handling, sprite one-shots, generic state machines and the runtime subpath export.",
} as const;

export interface ReleaseNote {
  version: string;
  summary: string;
}

export const changelogCardText = `Release notes from 0.1.x through the current ${libraryVersion} release.`;

export const releaseTimeline: readonly ReleaseNote[] = [
  {
    version: currentRelease.version,
    summary:
      "Reactive canvas runtime, logical pointer events, lifecycle cleanup, reduced motion, sprite animator v2, state machine v2 and package subpath exports.",
  },
  {
    version: "1.0.0",
    summary:
      "Stable public API, compiled sprites, fixed-step loops, scene manager, tilemaps and export smoke tests.",
  },
  {
    version: "0.9.0",
    summary:
      "Public API and migration docs, type smoke tests and frozen names with legacy aliases separated.",
  },
  {
    version: "0.8.0",
    summary:
      "Simple tilemaps with drawing and hit-testing helpers plus a maze-style demo.",
  },
  {
    version: "0.7.0",
    summary:
      "Scene manager with enter/update/draw/exit/transition and a menu/game/pause/game-over demo.",
  },
  {
    version: "0.6.0",
    summary:
      "Deterministic fixed-step loop alongside the untouched variable animation loop.",
  },
  {
    version: "0.5.0",
    summary:
      "Pixel Sprite v2: compiled sprites, pure transforms, tinting, bounds, hit-testing and a benchmark.",
  },
  {
    version: "0.4.2",
    summary:
      "Synchronized release metadata, packed-tarball export smoke test in CI and the public contract docs.",
  },
  {
    version: "0.4.1",
    summary:
      "Commercial home storytelling refresh, tighter footer design and README/version alignment.",
  },
  {
    version: "0.4.0",
    summary:
      "Audio Arcade presets, custom loops, Howler and Tone adapters, plus vanilla audio demos.",
  },
  {
    version: "0.3.0",
    summary: "Grid coordinate helpers and pointer tracking.",
  },
  {
    version: "0.2.0",
    summary: "Pixel sprites, animator, state machine and Grid Buddy.",
  },
  {
    version: "0.1.x",
    summary: "Core canvas/grid API, drawing helpers and visual snapshots.",
  },
] as const;
