const AUDIO_SUPPORT_ERROR =
  "grid-canvas-system audio addons require a browser with AudioContext support.";

export function ensureBrowserAudioSupport(): typeof AudioContext {
  const audioContextConstructor =
    (
      globalThis as typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).AudioContext ??
    (
      globalThis as typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (audioContextConstructor === undefined) {
    throw new Error(AUDIO_SUPPORT_ERROR);
  }

  return audioContextConstructor;
}

export function createAudioContext(): AudioContext {
  const AudioContextConstructor = ensureBrowserAudioSupport();

  return new AudioContextConstructor();
}

export function clampUnitVolume(value: number, label = "volume"): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }

  return Math.min(1, Math.max(0, value));
}

export function assertPositiveNumber(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number`);
  }

  return value;
}

export function normalizeMuteState(
  next: boolean | undefined,
  current: boolean,
): boolean {
  return typeof next === "boolean" ? next : !current;
}

export function assertNotDisposed(disposed: boolean, label: string): void {
  if (disposed) {
    throw new Error(`${label} has already been disposed`);
  }
}

export function createMissingPeerDependencyError(
  dependencyName: string,
  entrypoint: string,
): Error {
  return new Error(
    `"${dependencyName}" is required by ${entrypoint}. Install it with \`npm install ${dependencyName}\`.`,
  );
}

export function linearVolumeToDecibels(value: number): number {
  const volume = clampUnitVolume(value, "masterVolume");

  if (volume === 0) {
    return -80;
  }

  return 20 * Math.log10(volume);
}
