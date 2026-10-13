import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createHowlerAssetAudio,
  createToneMusicAudio,
  type ToneSequence,
} from "../src/audio";
import * as audioLoaders from "../src/audio/internal/loaders";
import { createArcadeAudio } from "../src/audio-arcade";

class FakeAudioParam {
  public value = 0;

  cancelScheduledValues = vi.fn();
  exponentialRampToValueAtTime = vi.fn((value: number) => {
    this.value = value;
  });
  linearRampToValueAtTime = vi.fn((value: number) => {
    this.value = value;
  });
  setValueAtTime = vi.fn((value: number) => {
    this.value = value;
  });
}

class FakeAudioNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class FakeGainNode extends FakeAudioNode {
  gain = new FakeAudioParam();
}

class FakeOscillatorNode extends FakeAudioNode {
  detune = new FakeAudioParam();
  frequency = new FakeAudioParam();
  onended: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;
  type: OscillatorType = "sine";

  start = vi.fn();
  stop = vi.fn(() => {
    this.onended?.call(this as unknown as GlobalEventHandlers, new Event("ended"));
  });
}

class FakeAudioBuffer {
  private readonly channel = new Float32Array(this.length);

  constructor(private readonly length: number) {}

  getChannelData = vi.fn(() => this.channel);
}

class FakeBufferSourceNode extends FakeAudioNode {
  buffer: FakeAudioBuffer | null = null;
  loop = false;
  onended: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;
  playbackRate = new FakeAudioParam();

  start = vi.fn();
  stop = vi.fn(() => {
    this.onended?.call(this as unknown as GlobalEventHandlers, new Event("ended"));
  });
}

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];

  currentTime = 0;
  destination = new FakeAudioNode();
  sampleRate = 44100;
  state: AudioContextState = "suspended";

  bufferSources: FakeBufferSourceNode[] = [];
  gains: FakeGainNode[] = [];
  oscillators: FakeOscillatorNode[] = [];

  close = vi.fn(async () => {
    this.state = "closed";
  });
  createBuffer = vi.fn(
    (_channels: number, length: number) => new FakeAudioBuffer(length),
  );
  createBufferSource = vi.fn(() => {
    const node = new FakeBufferSourceNode();

    this.bufferSources.push(node);

    return node;
  });
  createGain = vi.fn(() => {
    const node = new FakeGainNode();

    this.gains.push(node);

    return node;
  });
  createOscillator = vi.fn(() => {
    const node = new FakeOscillatorNode();

    this.oscillators.push(node);

    return node;
  });
  resume = vi.fn(async () => {
    this.state = "running";
  });
  suspend = vi.fn(async () => {
    this.state = "suspended";
  });

  constructor() {
    FakeAudioContext.instances.push(this);
  }
}

class FakeHowl {
  playbackCounter = 0;

  constructor(
    public readonly options: {
      loop?: boolean;
      sprite?: Record<string, [number, number]>;
      src: string[];
      volume?: number;
    },
  ) {}

  fade = vi.fn();
  loop = vi.fn();
  mute = vi.fn();
  pause = vi.fn();
  play = vi.fn((sprite?: string) => {
    this.playbackCounter += 1;

    return sprite === undefined ? this.playbackCounter : this.playbackCounter + 100;
  });
  stop = vi.fn();
  unload = vi.fn();
  volume = vi.fn((value?: number) => value ?? this.options.volume ?? 1);
}

class FakeToneInstrument {
  toDestination = vi.fn(() => this);
  triggerAttackRelease = vi.fn();
  dispose = vi.fn();
}

class FakeTonePart {
  loop = false;
  loopEnd: number | string = 0;

  constructor(
    public readonly callback: (
      time: number | string,
      value: {
        duration?: number | string;
        instrumentId?: string;
        note: readonly string[] | string | null;
        time: number | string;
        velocity?: number;
      },
    ) => void,
    public readonly events: Array<{
      duration?: number | string;
      instrumentId?: string;
      note: readonly string[] | string | null;
      time: number | string;
      velocity?: number;
    }>,
  ) {}

  dispose = vi.fn();
  start = vi.fn(() => this);
  stop = vi.fn(() => this);
}

function parseToneTime(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  if (value === "8n") {
    return 0.5;
  }

  if (value === "4n") {
    return 1;
  }

  if (value === "1m") {
    return 4;
  }

  if (value.includes(":")) {
    const [bars = "0", quarters = "0", sixteenths = "0"] = value.split(":");

    return Number(bars) * 4 + Number(quarters) + Number(sixteenths) / 4;
  }

  return Number(value);
}

function createFakeHowlerModule() {
  const instances: FakeHowl[] = [];
  const Howler = {
    mute: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
  };

  function HowlConstructor(
    this: unknown,
    options: {
      loop?: boolean;
      sprite?: Record<string, [number, number]>;
      src: string[];
      volume?: number;
    },
  ) {
    const instance = new FakeHowl(options);

    instances.push(instance);

    return instance;
  }

  return {
    module: {
      Howl: HowlConstructor as unknown as audioLoaders.HowlerModuleLike["Howl"],
      Howler,
    },
    instances,
    Howler,
  };
}

function createFakeToneModule() {
  const createdParts: FakeTonePart[] = [];
  const synths: FakeToneInstrument[] = [];
  const amSynths: FakeToneInstrument[] = [];
  const fmSynths: FakeToneInstrument[] = [];
  const membraneSynths: FakeToneInstrument[] = [];
  const Transport = {
    bpm: { value: 120 },
    cancel: vi.fn(),
    start: vi.fn(() => {
      Transport.state = "started";
    }),
    state: "stopped",
    stop: vi.fn(() => {
      Transport.state = "stopped";
    }),
  };
  const Destination = { volume: { value: 0 } };
  const start = vi.fn(async () => {});
  const contexts: audioLoaders.ToneContextLike[] = [];
  function Context() {
    const transport =
      contexts.length === 0
        ? Transport
        : {
            bpm: { value: 120 },
            state: "stopped",
            cancel: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
          };
    const context = {
      now: () => 0,
      transport,
      destination: contexts.length === 0 ? Destination : { volume: { value: 0 } },
      resume: start,
      dispose: vi.fn(),
    };
    contexts.push(context);
    return context;
  }

  function createInstrument(store: FakeToneInstrument[]) {
    return function Instrument(this: unknown) {
      const instrument = new FakeToneInstrument();

      store.push(instrument);

      return instrument;
    };
  }

  function PartConstructor(
    this: unknown,
    options: { callback: FakeTonePart["callback"]; events: FakeTonePart["events"] },
  ) {
    const part = new FakeTonePart(options.callback, options.events);

    createdParts.push(part);

    return part;
  }

  return {
    module: {
      Context: Context as unknown as audioLoaders.ToneModuleLike["Context"],
      PolySynth: function (options: { voice: new () => FakeToneInstrument }) {
        return new options.voice();
      } as unknown as audioLoaders.ToneModuleLike["PolySynth"],
      TimeClass: class {
        constructor(
          _context: unknown,
          public value: number | string,
        ) {}
        toSeconds() {
          return parseToneTime(this.value);
        }
      },
      AMSynth: createInstrument(
        amSynths,
      ) as unknown as audioLoaders.ToneModuleLike["AMSynth"],
      Destination,
      FMSynth: createInstrument(
        fmSynths,
      ) as unknown as audioLoaders.ToneModuleLike["FMSynth"],
      MembraneSynth: createInstrument(
        membraneSynths,
      ) as unknown as audioLoaders.ToneModuleLike["MembraneSynth"],
      Part: PartConstructor as unknown as audioLoaders.ToneModuleLike["Part"],
      Synth: createInstrument(
        synths,
      ) as unknown as audioLoaders.ToneModuleLike["Synth"],
      Time: (value: number | string) => ({
        toSeconds: () => parseToneTime(value),
      }),
      Transport,
      start,
    },
    createdParts,
    synths,
    amSynths,
    fmSynths,
    membraneSynths,
    Transport,
    contexts,
  };
}

describe("audio addons", () => {
  const originalAudioContext = globalThis.AudioContext;

  beforeEach(() => {
    vi.useFakeTimers();
    FakeAudioContext.instances = [];
    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: FakeAudioContext,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    if (originalAudioContext === undefined) {
      delete (globalThis as typeof globalThis & { AudioContext?: typeof AudioContext })
        .AudioContext;
      return;
    }

    Object.defineProperty(globalThis, "AudioContext", {
      configurable: true,
      value: originalAudioContext,
      writable: true,
    });
  });

  it("exposes the new audio entrypoints without affecting the root runtime surface", async () => {
    const audioModule = await import("../src/audio");
    const arcadeModule = await import("../src/audio-arcade");

    expect(audioModule.createHowlerAssetAudio).toBeTypeOf("function");
    expect(audioModule.createToneMusicAudio).toBeTypeOf("function");
    expect(arcadeModule.createArcadeAudio).toBeTypeOf("function");
  });

  it("plays arcade presets, auto-resumes audio and manages loops", async () => {
    const arcadeAudio = createArcadeAudio({
      masterVolume: 0.6,
    });

    await arcadeAudio.playShoot();
    await arcadeAudio.playPickup({
      volume: 0.5,
    });
    await arcadeAudio.playExplosion();

    const audioContext = FakeAudioContext.instances[0];

    expect(audioContext.resume).toHaveBeenCalled();
    expect(audioContext.oscillators).toHaveLength(4);
    expect(audioContext.bufferSources).toHaveLength(1);

    const loopId = await arcadeAudio.playLoop("patrol", {
      volume: 0.5,
    });

    expect(loopId).toMatch(/^arcade-loop-/);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    expect(arcadeAudio.stopLoop(loopId)).toBe(true);

    await arcadeAudio.dispose();
    expect(audioContext.close).toHaveBeenCalled();
  });

  it("supports the general preset API and rejects unknown names before playback", async () => {
    const audio = createArcadeAudio();
    const context = FakeAudioContext.instances[0];
    await expect(audio.playPreset("missing" as any)).rejects.toThrow();
    expect(context.resume).not.toHaveBeenCalled();
    await audio.playPreset("shoot");
    expect(context.oscillators.length).toBeGreaterThan(0);
    audio.stopAll();
    await audio.dispose();
  });

  it("accepts custom arcade sequences and clears timers with stopAll", async () => {
    const arcadeAudio = createArcadeAudio();

    await arcadeAudio.playLoop({
      bpm: 120,
      loop: true,
      channels: [
        {
          voice: "pulse",
          steps: [
            { note: 330, beats: 0.5 },
            { note: null, beats: 0.5 },
          ],
        },
        {
          voice: "triangle",
          volume: 0.2,
          steps: [{ note: 110, beats: 1 }],
        },
        {
          voice: "noise",
          steps: [{ note: 180, beats: 0.25 }],
        },
      ],
    });

    const audioContext = FakeAudioContext.instances[0];

    expect(audioContext.oscillators).toHaveLength(2);
    expect(audioContext.bufferSources).toHaveLength(1);

    arcadeAudio.stopAll();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("creates a Howler adapter, reuses loaded assets and exposes playback controls", async () => {
    const fakeHowler = createFakeHowlerModule();

    vi.spyOn(audioLoaders, "loadHowlerModule").mockResolvedValue(
      fakeHowler.module as unknown as audioLoaders.HowlerModuleLike,
    );

    const assetAudio = await createHowlerAssetAudio({
      laser: {
        src: ["data:audio/wav;base64,AAAA"],
        volume: 0.4,
      },
    });

    const playbackId = assetAudio.play("laser", {
      volume: 0.75,
    });

    expect(playbackId).toBe(1);
    expect(fakeHowler.instances).toHaveLength(1);
    expect(fakeHowler.instances[0].volume).toHaveBeenCalledWith(0.75, 1);

    assetAudio.setVolume("laser", 0.5);
    assetAudio.fade("laser", 0.2, 0.7, 120);
    assetAudio.mute(true);
    assetAudio.stop("laser");
    assetAudio.unload("laser");
    assetAudio.dispose();

    expect(fakeHowler.instances[0].mute).toHaveBeenCalledWith(true);
    expect(fakeHowler.Howler.mute).not.toHaveBeenCalled();
    expect(fakeHowler.instances[0].fade).toHaveBeenCalledWith(0.2, 0.7, 120);
    expect(fakeHowler.instances[0].stop).toHaveBeenCalled();
    expect(fakeHowler.instances[0].unload).toHaveBeenCalled();
  });

  it("surfaces an explicit install error when Howler is unavailable", async () => {
    vi.spyOn(audioLoaders, "loadHowlerModule").mockRejectedValue(
      new Error(
        '"howler" is required by `grid-canvas-system/audio`. Install it with `npm install howler`.',
      ),
    );

    await expect(
      createHowlerAssetAudio({
        click: {
          src: ["./click.wav"],
        },
      }),
    ).rejects.toThrow("npm install howler");
  });

  it("creates a Tone adapter, triggers notes and registers loopable sequences", async () => {
    const fakeTone = createFakeToneModule();

    vi.spyOn(audioLoaders, "loadToneModule").mockResolvedValue(
      fakeTone.module as unknown as audioLoaders.ToneModuleLike,
    );

    const toneAudio = await createToneMusicAudio({
      bpm: 144,
      masterVolume: 0.5,
      instruments: {
        lead: "synth",
        bass: "membrane",
      },
    });
    const sequence: ToneSequence = {
      loop: true,
      steps: [
        {
          instrumentId: "lead",
          note: "C4",
          time: 0,
          duration: "8n",
        },
        {
          instrumentId: "bass",
          note: "C2",
          time: "0:1:0",
          duration: "4n",
        },
      ],
    };

    toneAudio.registerSequence("theme", sequence);
    await toneAudio.trigger("lead", "E4", "8n");
    await toneAudio.playSequence("theme");

    expect(fakeTone.module.start).toHaveBeenCalledTimes(2);
    expect(fakeTone.Transport.bpm.value).toBe(144);
    expect(fakeTone.synths[0].triggerAttackRelease).toHaveBeenCalledWith(
      "E4",
      "8n",
      expect.any(Number),
      undefined,
    );
    expect(fakeTone.createdParts).toHaveLength(1);
    expect(fakeTone.createdParts[0].loop).toBe(true);
    expect(fakeTone.createdParts[0].loopEnd).toBeGreaterThan(1);

    toneAudio.stopSequence("theme");
    toneAudio.dispose();

    expect(fakeTone.Transport.stop).toHaveBeenCalled();
    expect(fakeTone.Transport.cancel).toHaveBeenCalledWith(0);
    expect(fakeTone.synths[0].dispose).toHaveBeenCalled();
    expect(fakeTone.membraneSynths[0].dispose).toHaveBeenCalled();
  });

  it("surfaces an explicit install error when Tone is unavailable", async () => {
    vi.spyOn(audioLoaders, "loadToneModule").mockRejectedValue(
      new Error(
        '"tone" is required by `grid-canvas-system/audio`. Install it with `npm install tone`.',
      ),
    );

    await expect(createToneMusicAudio()).rejects.toThrow("npm install tone");
  });

  it("isolates Howler controllers and validates volume before starting playback", async () => {
    const fake = createFakeHowlerModule();
    vi.spyOn(audioLoaders, "loadHowlerModule").mockResolvedValue(fake.module);
    const a = await createHowlerAssetAudio({ sound: { src: "a.wav" } });
    const b = await createHowlerAssetAudio({ sound: { src: "b.wav" } });
    a.play("sound");
    b.play("sound");
    a.mute(true);
    a.stop();
    a.setVolume(0.2);
    expect(fake.instances[1].mute).not.toHaveBeenCalled();
    expect(fake.instances[1].stop).not.toHaveBeenCalled();
    expect(fake.Howler.stop).not.toHaveBeenCalled();
    expect(fake.Howler.volume).not.toHaveBeenCalled();
    expect(() => a.play("sound", { volume: NaN })).toThrow();
    expect(fake.instances[0].play).toHaveBeenCalledTimes(1);
    a.dispose();
    b.dispose();
  });

  it("isolates Tone tempo, destination volume and disposal in owned contexts", async () => {
    const fake = createFakeToneModule();
    vi.spyOn(audioLoaders, "loadToneModule").mockResolvedValue(fake.module);
    const a = await createToneMusicAudio({ bpm: 90 });
    const b = await createToneMusicAudio({ bpm: 140 });
    a.setBpm(100);
    a.setMasterVolume(0.1);
    a.dispose();
    expect(fake.contexts[1].transport.bpm.value).toBe(140);
    expect(fake.contexts[1].transport.stop).not.toHaveBeenCalled();
    expect(fake.contexts[1].dispose).not.toHaveBeenCalled();
    b.dispose();
  });

  it("cleans up one-shot loop timers and disconnects stopped sources", async () => {
    const audio = createArcadeAudio();
    const context = FakeAudioContext.instances[0];
    const id = await audio.playLoop({
      bpm: 120,
      loop: false,
      channels: [{ voice: "pulse", steps: [{ beats: 1, note: 440 }] }],
    });
    context.currentTime = 1;
    vi.advanceTimersByTime(1000);
    expect(audio.stopLoop(id)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    expect(context.oscillators[0].disconnect).toHaveBeenCalled();
    const dispose = audio.dispose;
    await dispose();
    await dispose();
  });

  it("rejects invalid loop input before resume and scheduling", async () => {
    const audio = createArcadeAudio();
    await expect(audio.playLoop("missing" as any)).rejects.toThrow(
      "Unknown arcade loop",
    );
    expect(FakeAudioContext.instances[0].resume).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    await audio.dispose();
  });

  it("does not create Tone parts or trigger notes after dispose during resume", async () => {
    const fake = createFakeToneModule();
    vi.spyOn(audioLoaders, "loadToneModule").mockResolvedValue(fake.module);
    let finish!: () => void;
    fake.module.start.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const audio = await createToneMusicAudio();
    audio.registerSequence("s", { steps: [{ time: 0, note: "C4" }] });
    const playback = audio.playSequence("s");
    audio.dispose();
    finish();
    await expect(playback).rejects.toThrow("disposed");
    expect(fake.createdParts).toHaveLength(0);
  });

  it("does not schedule arcade sources after dispose during resume", async () => {
    const audio = createArcadeAudio();
    const context = FakeAudioContext.instances[0];
    let finish!: () => void;
    context.resume.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    const playback = audio.playShoot();
    await audio.dispose();
    finish();
    await expect(playback).rejects.toThrow("disposed");
    expect(context.oscillators).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
