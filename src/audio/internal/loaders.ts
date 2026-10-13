import { createMissingPeerDependencyError } from "./shared";

export interface HowlLike {
  fade(from: number, to: number, durationMs: number, playbackId?: number): void;
  loop(loop?: boolean, playbackId?: number): boolean | void;
  mute(muted: boolean, playbackId?: number): void;
  pause(playbackId?: number): void;
  play(sprite?: string): number;
  rate?(rate: number, playbackId?: number): number | void;
  stop(playbackId?: number): void;
  unload(): void;
  volume(volume?: number, playbackId?: number): number | void;
}

export interface HowlerGlobalLike {
  mute(muted: boolean): void;
  stop(): void;
  volume?(volume: number): number | void;
}

export interface HowlerModuleLike {
  Howl: new (options: {
    loop?: boolean;
    sprite?: Record<string, [number, number]>;
    src: string[];
    volume?: number;
    mute?: boolean;
    onloaderror?: (id: number, error: unknown) => void;
    onplayerror?: (id: number, error: unknown) => void;
  }) => HowlLike;
  Howler: HowlerGlobalLike;
}

export interface TonePartLike {
  loop: boolean;
  loopEnd: number | string;
  dispose(): void;
  start(time?: number): this;
  stop(time?: number): this;
}

export interface ToneInstrumentLike {
  dispose(): void;
  toDestination(): this;
  triggerAttackRelease(
    note: string | readonly string[],
    duration: number | string,
    time?: number | string,
    velocity?: number,
  ): void;
}

export interface ToneTimeLike {
  toSeconds(): number;
}

export interface ToneModuleLike {
  PolySynth: new (options: {
    context: ToneContextLike;
    voice: new (options?: { context: ToneContextLike }) => ToneInstrumentLike;
  }) => ToneInstrumentLike;
  Context: new () => ToneContextLike;
  TimeClass: new (context: ToneContextLike, value: number | string) => ToneTimeLike;
  AMSynth: new (options?: { context: ToneContextLike }) => ToneInstrumentLike;
  Destination: {
    volume: {
      value: number;
    };
  };
  FMSynth: new (options?: { context: ToneContextLike }) => ToneInstrumentLike;
  MembraneSynth: new (options?: { context: ToneContextLike }) => ToneInstrumentLike;
  Part: new (options: {
    context: ToneContextLike;
    callback: (
      time: number | string,
      value: {
        duration?: number | string;
        instrumentId?: string;
        note: readonly string[] | string | null;
        time: number | string;
        velocity?: number;
      },
    ) => void;
    events: Array<{
      duration?: number | string;
      instrumentId?: string;
      note: readonly string[] | string | null;
      time: number | string;
      velocity?: number;
    }>;
  }) => TonePartLike;
  Synth: new (options?: { context: ToneContextLike }) => ToneInstrumentLike;
  Time(value: number | string): ToneTimeLike;
  Transport: {
    bpm: {
      value: number;
    };
    cancel(after?: number): void;
    start(time?: number): void;
    state?: string;
    stop(time?: number): void;
  };
  start(): Promise<void>;
}

export interface ToneContextLike {
  now(): number;
  transport: ToneModuleLike["Transport"] & { seconds?: number };
  destination: ToneModuleLike["Destination"];
  resume(): Promise<void>;
  dispose(): unknown;
}

export async function loadHowlerModule(): Promise<HowlerModuleLike> {
  try {
    return (await import("howler")) as unknown as HowlerModuleLike;
  } catch (error) {
    if (!isMissingModule(error, "howler")) throw error;
    throw createMissingPeerDependencyError("howler", "`grid-canvas-system/audio`");
  }
}

export async function loadToneModule(): Promise<ToneModuleLike> {
  try {
    return (await import("tone")) as unknown as ToneModuleLike;
  } catch (error) {
    if (!isMissingModule(error, "tone")) throw error;
    throw createMissingPeerDependencyError("tone", "`grid-canvas-system/audio`");
  }
}

function isMissingModule(error: unknown, dependency: string): boolean {
  const value = error as { code?: string; message?: string };
  return (
    ["ERR_MODULE_NOT_FOUND", "MODULE_NOT_FOUND"].includes(value?.code ?? "") ||
    (typeof value?.message === "string" &&
      value.message.includes(dependency) &&
      /Cannot find|module specifier/.test(value.message))
  );
}
