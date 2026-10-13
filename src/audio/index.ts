import {
  type HowlLike,
  type ToneInstrumentLike,
  type ToneContextLike,
  type ToneModuleLike,
  type TonePartLike,
  loadHowlerModule,
  loadToneModule,
} from "./internal/loaders";
import {
  assertNotDisposed,
  assertPositiveNumber,
  clampUnitVolume,
  linearVolumeToDecibels,
  normalizeMuteState,
} from "./internal/shared";

export interface HowlerAssetDefinition {
  onError?: (error: Error) => void;
  loop?: boolean;
  sprite?: Record<string, [number, number]>;
  src: string | readonly string[];
  volume?: number;
}

export type HowlerAssetMap = Record<string, HowlerAssetDefinition>;

export interface HowlerPlayOptions {
  loop?: boolean;
  sprite?: string;
  volume?: number;
}

export interface HowlerAssetAudioController {
  dispose(): void;
  fade(id: string, from: number, to: number, durationMs: number): void;
  mute(next?: boolean): boolean;
  pause(id?: string): void;
  play(id: string, options?: HowlerPlayOptions): number;
  setVolume(idOrValue: number | string, value?: number): number;
  stop(id?: string): void;
  unload(id?: string): void;
}

export type ToneInstrumentKind = "synth" | "amsynth" | "fmsynth" | "membrane";

export interface ToneMusicOptions {
  bpm?: number;
  instruments?: Record<string, ToneInstrumentKind>;
  masterVolume?: number;
}

export interface ToneSequenceStep {
  duration?: number | string;
  instrumentId?: string;
  note: readonly string[] | string | null;
  time: number | string;
  velocity?: number;
}

export interface ToneSequence {
  loop?: boolean;
  steps: ToneSequenceStep[];
}

export interface ToneMusicAudioController {
  dispose(): void;
  playSequence(id: string): Promise<string>;
  registerSequence(id: string, sequence: ToneSequence): ToneSequence;
  resume(): Promise<void>;
  setBpm(value: number): number;
  setMasterVolume(value: number): number;
  stopSequence(id?: string): void;
  trigger(
    instrumentId: string,
    note: readonly string[] | string,
    duration: number | string,
    time?: number | string,
  ): Promise<void>;
}

interface SequencePlaybackHandle {
  part: TonePartLike;
  sequence: ToneSequence;
}

export async function createHowlerAssetAudio(
  config: HowlerAssetMap,
): Promise<HowlerAssetAudioController> {
  if (config === null || typeof config !== "object" || Array.isArray(config))
    throw new Error("assets must be an object");
  for (const [id, asset] of Object.entries(config)) {
    const sources = typeof asset?.src === "string" ? [asset.src] : asset?.src;
    if (
      !Array.isArray(sources) ||
      sources.length === 0 ||
      sources.some((source) => typeof source !== "string" || !source.length)
    )
      throw new Error(`asset ${id} must contain non-empty sources`);
    if (asset.volume !== undefined) clampUnitVolume(asset.volume, "asset.volume");
  }
  const module = await loadHowlerModule();
  const assets = new Map(Object.entries(config));
  const loadedHowls = new Map<string, HowlLike>();
  let disposed = false;
  let muted = false;
  let controllerVolume: number | undefined;

  function ensureActive(): void {
    assertNotDisposed(disposed, "Howler asset audio controller");
  }

  function assertKnownAsset(id: string): HowlerAssetDefinition {
    const definition = assets.get(id);

    if (definition === undefined) {
      throw new Error(`Unknown Howler asset "${id}"`);
    }

    return definition;
  }

  function createHowl(definition: HowlerAssetDefinition): HowlLike {
    return new module.Howl({
      src: Array.isArray(definition.src) ? [...definition.src] : [definition.src],
      loop: definition.loop,
      sprite: definition.sprite,
      mute: muted,
      onloaderror: (_id, error) => {
        if (!disposed)
          definition.onError?.(new Error(`Audio load failed: ${String(error)}`));
      },
      onplayerror: (_id, error) => {
        if (!disposed)
          definition.onError?.(new Error(`Audio playback failed: ${String(error)}`));
      },
      volume:
        controllerVolume ??
        (definition.volume === undefined
          ? undefined
          : clampUnitVolume(definition.volume, "asset.volume")),
    });
  }

  function ensureHowl(id: string): HowlLike {
    const existing = loadedHowls.get(id);

    if (existing !== undefined) {
      return existing;
    }

    const nextHowl = createHowl(assertKnownAsset(id));
    loadedHowls.set(id, nextHowl);

    return nextHowl;
  }

  function getLoadedHowl(id: string): HowlLike | undefined {
    assertKnownAsset(id);
    return loadedHowls.get(id);
  }

  function unloadAll(): void {
    for (const [assetId, howl] of loadedHowls.entries()) {
      howl.unload();
      loadedHowls.delete(assetId);
    }
  }

  return {
    play(id, options = {}) {
      ensureActive();
      const volume =
        options.volume === undefined
          ? undefined
          : clampUnitVolume(options.volume, "volume");
      const howl = ensureHowl(id);
      const playbackId =
        options.sprite === undefined ? howl.play() : howl.play(options.sprite);

      if (volume !== undefined) {
        howl.volume(volume, playbackId);
      }

      if (options.loop !== undefined) {
        howl.loop(options.loop, playbackId);
      }

      return playbackId;
    },
    pause(id) {
      ensureActive();

      if (id !== undefined) {
        getLoadedHowl(id)?.pause();
        return;
      }

      for (const howl of loadedHowls.values()) {
        howl.pause();
      }
    },
    stop(id) {
      ensureActive();

      if (id !== undefined) {
        getLoadedHowl(id)?.stop();
        return;
      }

      for (const howl of loadedHowls.values()) howl.stop();
    },
    setVolume(idOrValue, value) {
      ensureActive();

      if (typeof idOrValue === "number") {
        const nextVolume = clampUnitVolume(idOrValue, "volume");

        controllerVolume = nextVolume;

        for (const howl of loadedHowls.values()) {
          howl.volume(nextVolume);
        }

        return nextVolume;
      }

      const nextVolume = clampUnitVolume(value ?? 1, "volume");
      ensureHowl(idOrValue).volume(nextVolume);

      return nextVolume;
    },
    mute(next) {
      ensureActive();
      muted = normalizeMuteState(next, muted);
      for (const howl of loadedHowls.values()) howl.mute(muted);

      return muted;
    },
    fade(id, from, to, durationMs) {
      ensureActive();
      if (!Number.isFinite(durationMs) || durationMs < 0)
        throw new Error("durationMs must be non-negative and finite");
      getLoadedHowl(id)?.fade(
        clampUnitVolume(from, "from"),
        clampUnitVolume(to, "to"),
        durationMs,
      );
    },
    unload(id) {
      ensureActive();

      if (id !== undefined) {
        const howl = getLoadedHowl(id);

        howl?.unload();
        loadedHowls.delete(id);

        return;
      }

      unloadAll();
    },
    dispose() {
      if (disposed) {
        return;
      }

      unloadAll();
      disposed = true;
    },
  };
}

export async function createToneMusicAudio(
  options: ToneMusicOptions = {},
): Promise<ToneMusicAudioController> {
  const module = await loadToneModule();
  const sequences = new Map<string, ToneSequence>();
  const activePlaybacks = new Map<string, SequencePlaybackHandle>();
  const instruments = new Map<string, ToneInstrumentLike>();
  const instrumentKinds = options.instruments ?? { main: "synth" };
  let disposed = false;
  let masterVolume = clampUnitVolume(options.masterVolume ?? 0.8, "masterVolume");
  let bpm = assertPositiveNumber(options.bpm ?? 120, "bpm");

  if (Object.keys(instrumentKinds).length === 0) {
    throw new Error("Tone music audio requires at least one instrument");
  }

  for (const kind of Object.values(instrumentKinds)) {
    if (!["synth", "amsynth", "fmsynth", "membrane"].includes(kind))
      throw new Error(`Unknown Tone instrument kind "${kind}"`);
  }
  const context = new module.Context();
  const transport = context.transport;

  for (const [instrumentId, kind] of Object.entries(instrumentKinds)) {
    instruments.set(instrumentId, createToneInstrument(module, kind, context));
  }

  transport.bpm.value = bpm;
  context.destination.volume.value = linearVolumeToDecibels(masterVolume);

  const defaultInstrumentId = Array.from(instruments.keys())[0];

  function ensureActive(): void {
    assertNotDisposed(disposed, "Tone music audio controller");
  }

  function resolveInstrument(instrumentId: string): ToneInstrumentLike {
    const instrument = instruments.get(instrumentId);

    if (instrument === undefined) {
      throw new Error(`Unknown Tone instrument "${instrumentId}"`);
    }

    return instrument;
  }

  function resolveTimeToSeconds(value: number | string): number {
    const seconds =
      typeof value === "number"
        ? value
        : new module.TimeClass(context, value).toSeconds();
    if (!Number.isFinite(seconds) || seconds < 0)
      throw new Error("sequence time must be finite and non-negative");
    return seconds;
  }

  function triggerNote(
    instrumentId: string,
    note: readonly string[] | string,
    duration: number | string,
    time?: number | string,
    velocity?: number,
  ): void {
    const requestedTime =
      time === undefined ? context.now() : resolveTimeToSeconds(time);
    resolveInstrument(instrumentId).triggerAttackRelease(
      note,
      duration,
      requestedTime,
      velocity,
    );
  }

  async function resumeTransport(): Promise<void> {
    ensureActive();
    await context.resume();
    ensureActive();
  }

  function stopAllSequences(): void {
    for (const [sequenceId, handle] of activePlaybacks.entries()) {
      handle.part.stop(0);
      handle.part.dispose();
      activePlaybacks.delete(sequenceId);
    }

    transport.stop();
    transport.cancel(0);
  }

  return {
    async resume() {
      await resumeTransport();
    },
    setBpm(value) {
      ensureActive();
      bpm = assertPositiveNumber(value, "bpm");
      transport.bpm.value = bpm;

      return bpm;
    },
    setMasterVolume(value) {
      ensureActive();
      masterVolume = clampUnitVolume(value, "masterVolume");
      context.destination.volume.value = linearVolumeToDecibels(masterVolume);

      return masterVolume;
    },
    async trigger(instrumentId, note, duration, time) {
      ensureActive();
      resolveInstrument(instrumentId);
      await resumeTransport();
      triggerNote(instrumentId, note, duration, time);
    },
    registerSequence(id, sequence) {
      ensureActive();
      if (
        typeof id !== "string" ||
        !id.length ||
        !Array.isArray(sequence?.steps) ||
        !sequence.steps.length
      )
        throw new Error("sequence requires an id and non-empty steps");
      for (const step of sequence.steps) {
        resolveInstrument(step.instrumentId ?? defaultInstrumentId);
        resolveTimeToSeconds(step.time);
        assertPositiveNumber(
          resolveTimeToSeconds(step.duration ?? "8n"),
          "step.duration",
        );
        if (
          step.velocity !== undefined &&
          (!Number.isFinite(step.velocity) || step.velocity < 0 || step.velocity > 1)
        )
          throw new Error("step.velocity must be between 0 and 1");
      }
      sequences.set(id, {
        loop: sequence.loop ?? false,
        steps: sequence.steps.map((step) => ({
          duration: step.duration,
          instrumentId: step.instrumentId,
          note: Array.isArray(step.note) ? [...step.note] : step.note,
          time: step.time,
          velocity: step.velocity,
        })),
      });

      const registered = sequences.get(id) as ToneSequence;
      return {
        ...registered,
        steps: registered.steps.map((step) => ({
          ...step,
          note: Array.isArray(step.note) ? [...step.note] : step.note,
        })),
      };
    },
    async playSequence(id) {
      ensureActive();
      await resumeTransport();

      const sequence = sequences.get(id);

      if (sequence === undefined) {
        throw new Error(`Unknown Tone sequence "${id}"`);
      }

      const activeHandle = activePlaybacks.get(id);

      if (activeHandle !== undefined) {
        activeHandle.part.stop(0);
        activeHandle.part.dispose();
        activePlaybacks.delete(id);
      }

      const part = new module.Part({
        context,
        callback: (time, event) => {
          if (disposed || event.note === null) {
            return;
          }

          triggerNote(
            event.instrumentId ?? defaultInstrumentId,
            event.note,
            event.duration ?? "8n",
            time,
            event.velocity,
          );
        },
        events: sequence.steps,
      });

      part.loop = sequence.loop ?? false;

      if (part.loop) {
        part.loopEnd = Math.max(
          ...sequence.steps.map((step) => {
            const start = resolveTimeToSeconds(step.time);
            const duration = resolveTimeToSeconds(step.duration ?? "8n");

            return start + duration;
          }),
          resolveTimeToSeconds("1m"),
        );
      }

      part.start(transport.seconds ?? 0);
      activePlaybacks.set(id, {
        part,
        sequence,
      });

      if (transport.state !== "started") {
        transport.start();
      }

      return id;
    },
    stopSequence(id) {
      ensureActive();

      if (id !== undefined) {
        const handle = activePlaybacks.get(id);

        if (handle === undefined) {
          return;
        }

        handle.part.stop(0);
        handle.part.dispose();
        activePlaybacks.delete(id);

        if (activePlaybacks.size === 0) {
          transport.stop();
          transport.cancel(0);
        }

        return;
      }

      stopAllSequences();
    },
    dispose() {
      if (disposed) {
        return;
      }

      stopAllSequences();

      for (const instrument of instruments.values()) {
        instrument.dispose();
      }

      instruments.clear();
      sequences.clear();
      disposed = true;
      context.dispose();
    },
  };
}

function createToneInstrument(
  module: ToneModuleLike,
  kind: ToneInstrumentKind,
  context: ToneContextLike,
): ToneInstrumentLike {
  switch (kind) {
    case "amsynth":
      return new module.PolySynth({ context, voice: module.AMSynth }).toDestination();
    case "fmsynth":
      return new module.PolySynth({ context, voice: module.FMSynth }).toDestination();
    case "membrane":
      return new module.PolySynth({
        context,
        voice: module.MembraneSynth,
      }).toDestination();
    case "synth":
    default:
      return new module.PolySynth({ context, voice: module.Synth }).toDestination();
  }
}
