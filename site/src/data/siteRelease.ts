export const libraryVersion = "0.4.1";

export const currentRelease = {
  version: libraryVersion,
  title: "Storytelling refresh and docs alignment",
  summary:
    "Refresh the landing narrative, tighten the footer and align the README with the current package, exports and release metadata.",
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
