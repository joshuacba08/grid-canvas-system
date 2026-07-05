export const libraryVersion = "0.4.0";

export const currentRelease = {
  version: libraryVersion,
  title: "Audio addons and retro arcade sound",
  summary:
    "Add browser-native arcade SFX plus optional Howler and Tone adapters without losing the lightweight Canvas workflow.",
} as const;

export interface ReleaseNote {
  version: string;
  summary: string;
}

export const changelogCardText = `Release notes from 0.1.x through the current ${libraryVersion} audio expansion.`;

export const releaseTimeline: readonly ReleaseNote[] = [
  {
    version: currentRelease.version,
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