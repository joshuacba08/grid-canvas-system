import {
  assertNotDisposed,
  assertPositiveNumber,
  clampUnitVolume,
  createAudioContext,
  normalizeMuteState,
} from "../audio/internal/shared";

export type ArcadeSfxPreset = "shoot" | "pickup" | "explosion";
export type ArcadeLoopPreset = "patrol" | "danger" | "victory";
export type ArcadeVoice = "pulse" | "triangle" | "noise";

export interface ArcadeAudioOptions {
  masterVolume?: number;
  muted?: boolean;
}

export interface ArcadeSfxOptions {
  detune?: number;
  volume?: number;
}

export interface ArcadeLoopOptions {
  id?: string;
  volume?: number;
}

export interface ArcadeSequenceStep {
  beats: number;
  note: number | null;
}

export interface ArcadeSequenceChannel {
  steps: ArcadeSequenceStep[];
  voice: ArcadeVoice;
  volume?: number;
}

export interface ArcadeSequence {
  bpm: number;
  channels: ArcadeSequenceChannel[];
  loop?: boolean;
}

export interface ArcadeAudioController {
  dispose(): Promise<void>;
  mute(next?: boolean): boolean;
  playExplosion(overrides?: ArcadeSfxOptions): Promise<void>;
  playLoop(
    presetOrSequence: ArcadeLoopPreset | ArcadeSequence,
    options?: ArcadeLoopOptions,
  ): Promise<string>;
  playPickup(overrides?: ArcadeSfxOptions): Promise<void>;
  playPreset(name: ArcadeSfxPreset, overrides?: ArcadeSfxOptions): Promise<void>;
  playShoot(overrides?: ArcadeSfxOptions): Promise<void>;
  resume(): Promise<void>;
  setMasterVolume(value: number): number;
  stopAll(): void;
  stopLoop(id?: string): boolean;
  suspend(): Promise<void>;
}

interface ScheduledArcadeVoice {
  duration: number;
  endNote?: number;
  note: number;
  offset: number;
  type: ArcadeVoice;
  volume: number;
}

interface LoopHandle {
  id: string;
  sequence: ArcadeSequence;
  sources: Set<AudioScheduledSourceNode>;
  timeoutId: ReturnType<typeof setTimeout> | null;
  volume: number;
}

const MIN_GAIN = 0.0001;

const LOOP_PRESETS: Record<ArcadeLoopPreset, ArcadeSequence> = {
  patrol: {
    bpm: 132,
    loop: true,
    channels: [
      {
        voice: "pulse",
        volume: 0.32,
        steps: [
          { note: 440, beats: 0.5 },
          { note: null, beats: 0.25 },
          { note: 659.25, beats: 0.5 },
          { note: null, beats: 0.25 },
          { note: 523.25, beats: 0.5 },
          { note: null, beats: 0.25 },
          { note: 659.25, beats: 0.5 },
          { note: null, beats: 0.25 },
        ],
      },
      {
        voice: "triangle",
        volume: 0.24,
        steps: [
          { note: 110, beats: 1 },
          { note: 146.83, beats: 1 },
          { note: 98, beats: 1 },
          { note: 146.83, beats: 1 },
        ],
      },
    ],
  },
  danger: {
    bpm: 150,
    loop: true,
    channels: [
      {
        voice: "pulse",
        volume: 0.28,
        steps: [
          { note: 329.63, beats: 0.5 },
          { note: 349.23, beats: 0.5 },
          { note: 392, beats: 0.5 },
          { note: 349.23, beats: 0.5 },
          { note: 329.63, beats: 0.5 },
          { note: 293.66, beats: 0.5 },
          { note: 261.63, beats: 0.5 },
          { note: 293.66, beats: 0.5 },
        ],
      },
      {
        voice: "noise",
        volume: 0.18,
        steps: [
          { note: 240, beats: 0.25 },
          { note: null, beats: 0.25 },
          { note: 240, beats: 0.25 },
          { note: null, beats: 0.25 },
          { note: 240, beats: 0.25 },
          { note: null, beats: 0.25 },
          { note: 240, beats: 0.25 },
          { note: null, beats: 0.25 },
        ],
      },
    ],
  },
  victory: {
    bpm: 164,
    loop: true,
    channels: [
      {
        voice: "pulse",
        volume: 0.28,
        steps: [
          { note: 523.25, beats: 0.5 },
          { note: 659.25, beats: 0.5 },
          { note: 783.99, beats: 0.5 },
          { note: 1046.5, beats: 1 },
          { note: 783.99, beats: 0.5 },
          { note: 659.25, beats: 0.5 },
          { note: 523.25, beats: 0.5 },
          { note: 659.25, beats: 1 },
        ],
      },
      {
        voice: "triangle",
        volume: 0.22,
        steps: [
          { note: 130.81, beats: 1 },
          { note: 164.81, beats: 1 },
          { note: 196, beats: 1 },
          { note: 261.63, beats: 1 },
        ],
      },
    ],
  },
};

const SFX_PRESETS: Record<ArcadeSfxPreset, ScheduledArcadeVoice[]> = {
  shoot: [
    {
      type: "pulse",
      note: 880,
      endNote: 220,
      duration: 0.08,
      offset: 0,
      volume: 0.28,
    },
  ],
  pickup: [
    {
      type: "triangle",
      note: 659.25,
      endNote: 880,
      duration: 0.07,
      offset: 0,
      volume: 0.22,
    },
    {
      type: "pulse",
      note: 880,
      endNote: 1174.66,
      duration: 0.09,
      offset: 0.06,
      volume: 0.2,
    },
  ],
  explosion: [
    {
      type: "noise",
      note: 180,
      duration: 0.26,
      offset: 0,
      volume: 0.3,
    },
    {
      type: "triangle",
      note: 140,
      endNote: 60,
      duration: 0.24,
      offset: 0,
      volume: 0.14,
    },
  ],
};

export function createArcadeAudio(
  options: ArcadeAudioOptions = {},
): ArcadeAudioController {
  const audioContext = createAudioContext();
  const masterGain = audioContext.createGain();
  const loopHandles = new Map<string, LoopHandle>();
  const activeSources = new Set<AudioScheduledSourceNode>();
  const noiseBuffer = createNoiseBuffer(audioContext, 0.5);
  let disposed = false;
  let loopCounter = 0;
  let masterVolume = clampUnitVolume(options.masterVolume ?? 0.8, "masterVolume");
  let muted = options.muted ?? false;
  let lastLoopId: string | undefined;

  masterGain.connect(audioContext.destination);
  applyMasterGain();

  function ensureActive(): void {
    assertNotDisposed(disposed, "Arcade audio controller");
  }

  function applyMasterGain(): void {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setValueAtTime(muted ? 0 : masterVolume, audioContext.currentTime);
  }

  async function ensureRunning(): Promise<void> {
    ensureActive();

    if (audioContext.state !== "running") {
      await audioContext.resume();
    }
  }

  function trackSource<T extends AudioScheduledSourceNode>(
    source: T,
    loopSources?: Set<AudioScheduledSourceNode>,
  ): T {
    activeSources.add(source);
    loopSources?.add(source);

    const previousOnEnded = source.onended;

    source.onended = (event) => {
      activeSources.delete(source);
      loopSources?.delete(source);
      previousOnEnded?.call(source, event);
    };

    return source;
  }

  function scheduleOscillatorVoice(
    note: number,
    duration: number,
    startTime: number,
    volume: number,
    voice: Extract<ArcadeVoice, "pulse" | "triangle">,
    endNote?: number,
    detune?: number,
    loopSources?: Set<AudioScheduledSourceNode>,
  ): void {
    const oscillator = trackSource(audioContext.createOscillator(), loopSources);
    const gainNode = audioContext.createGain();
    const oscillatorType: OscillatorType = voice === "pulse" ? "square" : "triangle";

    oscillator.type = oscillatorType;
    oscillator.frequency.setValueAtTime(note, startTime);
    oscillator.detune.setValueAtTime(detune ?? 0, startTime);

    if (endNote !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(1, endNote),
        startTime + duration,
      );
    }

    gainNode.gain.setValueAtTime(MIN_GAIN, startTime);
    gainNode.gain.linearRampToValueAtTime(Math.max(MIN_GAIN, volume), startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  function scheduleNoiseVoice(
    note: number,
    duration: number,
    startTime: number,
    volume: number,
    loopSources?: Set<AudioScheduledSourceNode>,
  ): void {
    const source = trackSource(audioContext.createBufferSource(), loopSources);
    const gainNode = audioContext.createGain();

    source.buffer = noiseBuffer;
    source.playbackRate.setValueAtTime(Math.max(0.2, note / 220), startTime);

    gainNode.gain.setValueAtTime(Math.max(MIN_GAIN, volume), startTime);
    gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, startTime + duration);

    source.connect(gainNode);
    gainNode.connect(masterGain);

    source.start(startTime);
    source.stop(startTime + duration + 0.02);
  }

  async function playPreset(
    name: ArcadeSfxPreset,
    overrides: ArcadeSfxOptions = {},
  ): Promise<void> {
    ensureActive();
    await ensureRunning();

    const volumeScale = clampUnitVolume(overrides.volume ?? 1, "volume");
    const detune = overrides.detune ?? 0;
    const startTime = audioContext.currentTime + 0.01;

    for (const voice of SFX_PRESETS[name]) {
      const volume = clampUnitVolume(voice.volume * volumeScale, "volume");
      const scheduledTime = startTime + voice.offset;

      if (voice.type === "noise") {
        scheduleNoiseVoice(voice.note, voice.duration, scheduledTime, volume);
        continue;
      }

      scheduleOscillatorVoice(
        voice.note,
        voice.duration,
        scheduledTime,
        volume,
        voice.type,
        voice.endNote,
        detune,
      );
    }
  }

  function cloneSequence(sequence: ArcadeSequence): ArcadeSequence {
    return {
      bpm: sequence.bpm,
      loop: sequence.loop ?? true,
      channels: sequence.channels.map((channel) => ({
        voice: channel.voice,
        volume: channel.volume,
        steps: channel.steps.map((step) => ({
          beats: step.beats,
          note: step.note,
        })),
      })),
    };
  }

  function validateSequence(sequence: ArcadeSequence): ArcadeSequence {
    assertPositiveNumber(sequence.bpm, "sequence.bpm");

    if (sequence.channels.length === 0) {
      throw new Error("sequence.channels must contain at least one channel");
    }

    for (const channel of sequence.channels) {
      if (channel.steps.length === 0) {
        throw new Error("sequence channel steps must not be empty");
      }

      if (channel.volume !== undefined) {
        clampUnitVolume(channel.volume, "channel.volume");
      }

      for (const step of channel.steps) {
        assertPositiveNumber(step.beats, "step.beats");

        if (step.note !== null) {
          assertPositiveNumber(step.note, "step.note");
        }
      }
    }

    return sequence;
  }

  function sequenceCycleDuration(sequence: ArcadeSequence): number {
    const secondsPerBeat = 60 / sequence.bpm;
    let duration = 0;

    for (const channel of sequence.channels) {
      const channelDuration = channel.steps.reduce(
        (total, step) => total + step.beats * secondsPerBeat,
        0,
      );

      duration = Math.max(duration, channelDuration);
    }

    return duration;
  }

  function scheduleLoopCycle(handle: LoopHandle, startTime: number): void {
    const secondsPerBeat = 60 / handle.sequence.bpm;
    const cycleDuration = sequenceCycleDuration(handle.sequence);

    for (const channel of handle.sequence.channels) {
      let offset = 0;
      const channelVolume = clampUnitVolume(
        (channel.volume ?? 0.25) * handle.volume,
        "volume",
      );

      for (const step of channel.steps) {
        const duration = step.beats * secondsPerBeat;

        if (step.note !== null) {
          if (channel.voice === "noise") {
            scheduleNoiseVoice(
              step.note,
              duration,
              startTime + offset,
              channelVolume,
              handle.sources,
            );
          } else {
            scheduleOscillatorVoice(
              step.note,
              duration,
              startTime + offset,
              channelVolume,
              channel.voice,
              undefined,
              0,
              handle.sources,
            );
          }
        }

        offset += duration;
      }
    }

    if (handle.sequence.loop === false || !loopHandles.has(handle.id)) {
      return;
    }

    handle.timeoutId = setTimeout(
      () => {
        if (!loopHandles.has(handle.id) || disposed) {
          return;
        }

        scheduleLoopCycle(handle, startTime + cycleDuration);
      },
      Math.max(0, (cycleDuration - 0.02) * 1000),
    );
  }

  function safeStopSource(source: AudioScheduledSourceNode): void {
    try {
      source.stop();
    } catch {
      // Ignore already-stopped scheduled sources.
    }
  }

  function stopLoopInternal(loopId: string): boolean {
    const handle = loopHandles.get(loopId);

    if (handle === undefined) {
      return false;
    }

    if (handle.timeoutId !== null) {
      clearTimeout(handle.timeoutId);
    }

    for (const source of handle.sources) {
      safeStopSource(source);
      activeSources.delete(source);
    }

    handle.sources.clear();
    loopHandles.delete(loopId);

    if (lastLoopId === loopId) {
      const loopIds = Array.from(loopHandles.keys());
      lastLoopId = loopIds.length === 0 ? undefined : loopIds[loopIds.length - 1];
    }

    return true;
  }

  return {
    async resume() {
      await ensureRunning();
    },
    async suspend() {
      ensureActive();

      if (audioContext.state === "running") {
        await audioContext.suspend();
      }
    },
    async dispose() {
      if (disposed) {
        return;
      }

      this.stopAll();
      disposed = true;
      masterGain.disconnect();

      if (audioContext.state !== "closed") {
        await audioContext.close();
      }
    },
    setMasterVolume(value) {
      ensureActive();
      masterVolume = clampUnitVolume(value, "masterVolume");
      applyMasterGain();

      return masterVolume;
    },
    mute(next) {
      ensureActive();
      muted = normalizeMuteState(next, muted);
      applyMasterGain();

      return muted;
    },
    async playShoot(overrides) {
      await playPreset("shoot", overrides);
    },
    async playPickup(overrides) {
      await playPreset("pickup", overrides);
    },
    async playExplosion(overrides) {
      await playPreset("explosion", overrides);
    },
    async playPreset(name, overrides) {
      await playPreset(name, overrides);
    },
    async playLoop(presetOrSequence, options = {}) {
      ensureActive();
      await ensureRunning();

      const resolvedSequence =
        typeof presetOrSequence === "string"
          ? cloneSequence(LOOP_PRESETS[presetOrSequence])
          : cloneSequence(presetOrSequence);
      const sequence = validateSequence(resolvedSequence);
      const loopId = options.id ?? `arcade-loop-${++loopCounter}`;
      const volume = clampUnitVolume(options.volume ?? 1, "volume");

      stopLoopInternal(loopId);

      const handle: LoopHandle = {
        id: loopId,
        sequence,
        sources: new Set<AudioScheduledSourceNode>(),
        timeoutId: null,
        volume,
      };

      loopHandles.set(loopId, handle);
      lastLoopId = loopId;
      scheduleLoopCycle(handle, audioContext.currentTime + 0.02);

      return loopId;
    },
    stopLoop(id) {
      ensureActive();
      const loopId = id ?? lastLoopId;

      if (loopId === undefined) {
        return false;
      }

      return stopLoopInternal(loopId);
    },
    stopAll() {
      ensureActive();

      for (const loopId of [...loopHandles.keys()]) {
        stopLoopInternal(loopId);
      }

      for (const source of [...activeSources]) {
        safeStopSource(source);
      }

      activeSources.clear();
    },
  };
}

function createNoiseBuffer(
  context: AudioContext,
  durationSeconds: number,
): AudioBuffer {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * durationSeconds));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);

  for (let index = 0; index < channel.length; index += 1) {
    channel[index] = Math.random() * 2 - 1;
  }

  return buffer;
}
