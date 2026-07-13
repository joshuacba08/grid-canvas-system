import GridCanvasSystem from "grid-canvas-system";

import { createHowlerAssetAudio, createToneMusicAudio } from "../../../src/audio";
import { createArcadeAudio } from "../../../src/audio-arcade";

type DocsLocale = "en" | "es";

const copy = {
  en: {
    adapters: {
      asset: "Played a Howler asset from a generated WAV data URI.",
      initial: "Site dependencies are ready. Click a control to start audio.",
      note: "Triggered a one-shot lead note.",
      stop: "Stopped the looping theme.",
      theme: "Started the looping Tone sequence.",
    },
    arcade: {
      initial: "Click a control to unlock Web Audio.",
      loop: "Patrol loop running.",
      muteOff: "Audio unmuted.",
      muteOn: "Muted arcade audio.",
      pickup: "Played pickup SFX.",
      shoot: "Played shoot SFX.",
      stop: "Stopped the active loop.",
    },
  },
  es: {
    adapters: {
      asset: "Se reprodujo un asset de Howler desde un WAV generado en memoria.",
      initial:
        "Las dependencias del site estan listas. Haz click en un control para iniciar audio.",
      note: "Se disparo una nota lead de una sola vez.",
      stop: "Se detuvo el tema en loop.",
      theme: "Se inicio la secuencia en loop de Tone.",
    },
    arcade: {
      initial: "Haz click en un control para desbloquear Web Audio.",
      loop: "El loop patrol esta corriendo.",
      muteOff: "Audio activado otra vez.",
      muteOn: "Audio Arcade silenciado.",
      pickup: "Se reprodujo el SFX pickup.",
      shoot: "Se reprodujo el SFX shoot.",
      stop: "Se detuvo el loop activo.",
    },
  },
} as const;

function getLocale(root: HTMLElement): DocsLocale {
  return root.dataset.locale === "es" ? "es" : "en";
}

function createGrid(
  canvas: HTMLCanvasElement,
  colors: {
    accent: string;
    grid: string;
    text: string;
  },
): InstanceType<typeof GridCanvasSystem> {
  return new GridCanvasSystem(canvas.id, {
    width: 640,
    height: 320,
    cellSize: 20,
    majorStep: 40,
    backgroundColor: "#050607",
    gridColor: colors.grid,
    gridLabelColor: "rgba(0, 0, 0, 0)",
    coordinateLabelColor: colors.text,
    coordinateFont: '12px "Geist Pixel", monospace',
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
  });
}

function setStatus(root: HTMLElement, message: string): void {
  const node = root.querySelector<HTMLElement>("[data-docs-demo-status]");

  if (node !== null) {
    node.textContent = message;
  }
}

function createBeepWavDataUri({
  durationMs = 150,
  frequency = 660,
  sampleRate = 22050,
  volume = 0.35,
} = {}): string {
  const sampleCount = Math.max(1, Math.floor((sampleRate * durationMs) / 1000));
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  function writeText(offset: number, value: string): void {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  }

  writeText(0, "RIFF");
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, sampleCount * 2, true);

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = 1 - index / sampleCount;
    const sample =
      Math.sin(time * Math.PI * 2 * frequency) * envelope * volume * 0x7fff;

    view.setInt16(44 + index * 2, sample, true);
  }

  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return `data:audio/wav;base64,${btoa(binary)}`;
}

function mountAudioArcadeDemo(): void {
  const root = document.querySelector<HTMLElement>("[data-docs-demo='audio-arcade']");

  if (root === null) {
    return;
  }

  const canvas = root.querySelector<HTMLCanvasElement>("#docs-audio-arcade-canvas");

  if (canvas === null) {
    return;
  }

  const locale = getLocale(root);
  const messages = copy[locale].arcade;
  const grid = createGrid(canvas, {
    accent: "#4da9ff",
    grid: "rgba(77, 169, 255, 0.14)",
    text: "#dbeafe",
  });
  const audio = createArcadeAudio({ masterVolume: 0.72 });
  let activeLoopId: string | undefined;
  let activePreset = "none";
  let muted = false;
  let flash = 0;
  let time = 0;

  setStatus(root, messages.initial);

  GridCanvasSystem.runtime.createAnimationLoop({
    autoStart: true,
    maxElapsed: 0.05,
    update(elapsed) {
      flash = Math.max(0, flash - elapsed * 2.3);
      time += elapsed;
    },
    draw() {
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 2.2);

      grid.clearCanvas();
      grid.drawBarIndicator("VOL", 18, 18, 88, 10, muted ? 0 : 72, 100, {
        fillColor: muted ? "#ff5c7a" : "#4da9ff",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawBarIndicator(
        "LOOP",
        18,
        40,
        88,
        10,
        activePreset === "none" ? 0 : 100,
        100,
        {
          fillColor: "#00d43b",
          strokeColor: "#e8f7ef",
          textColor: "#e8f7ef",
          font: '11px "Geist Pixel", monospace',
        },
      );
      grid.drawShip({ x: 318, y: 184 }, 44, {
        rotation: -Math.PI / 2,
        curve1: 0.42,
        curve2: 0.82,
        thruster: activePreset !== "none",
        fillColor: "#101722",
        strokeColor: "#e8f7ef",
        lineWidth: 2,
      });
      grid.drawGhost({ x: 154, y: 178 + Math.sin(time * 2) * 5 }, 28 + pulse * 2, {
        feet: 5,
        fillColor: muted ? "#ff5c7a" : "#00d43b",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawProjectile({ x: 320 + flash * 180, y: 96 }, 8 + flash * 6, 0.74, {
        fillColor: "#4da9ff",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawMessage(
        "AUDIO ARCADE",
        activePreset === "none" ? "browser-native cues" : "patrol loop active",
        { x: 320, y: 44 },
      );
    },
  });

  root
    .querySelectorAll<HTMLButtonElement>("[data-docs-audio-arcade-action]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.docsAudioArcadeAction;

        try {
          if (action === "shoot") {
            flash = 1;
            setStatus(root, messages.shoot);
            await audio.playShoot();
            return;
          }

          if (action === "pickup") {
            flash = 0.7;
            setStatus(root, messages.pickup);
            await audio.playPickup();
            return;
          }

          if (action === "loop") {
            if (activeLoopId !== undefined) {
              audio.stopLoop(activeLoopId);
            }

            activePreset = "patrol";
            setStatus(root, messages.loop);
            activeLoopId = await audio.playLoop("patrol");
            return;
          }

          if (action === "stop") {
            if (activeLoopId !== undefined) {
              audio.stopLoop(activeLoopId);
              activeLoopId = undefined;
            }

            activePreset = "none";
            setStatus(root, messages.stop);
            return;
          }

          muted = audio.mute();
          setStatus(root, muted ? messages.muteOn : messages.muteOff);
        } catch (error) {
          if (action === "loop") {
            activeLoopId = undefined;
            activePreset = "none";
          }

          setStatus(root, error instanceof Error ? error.message : String(error));
        }
      });
    });

  window.addEventListener("beforeunload", () => {
    void audio.dispose();
  });
}

function mountAudioAdaptersDemo(): void {
  const root = document.querySelector<HTMLElement>("[data-docs-demo='audio-adapters']");

  if (root === null) {
    return;
  }

  const canvas = root.querySelector<HTMLCanvasElement>("#docs-audio-adapters-canvas");

  if (canvas === null) {
    return;
  }

  const locale = getLocale(root);
  const messages = copy[locale].adapters;
  const grid = createGrid(canvas, {
    accent: "#34d399",
    grid: "rgba(52, 211, 153, 0.15)",
    text: "#d1fae5",
  });
  let assetAudio: Awaited<ReturnType<typeof createHowlerAssetAudio>> | undefined;
  let toneAudio: Awaited<ReturnType<typeof createToneMusicAudio>> | undefined;
  let assetFlash = 0;
  let noteFlash = 0;
  let themeRunning = false;
  let time = 0;

  setStatus(root, messages.initial);

  async function ensureAssetAudio() {
    if (assetAudio !== undefined) {
      return assetAudio;
    }

    assetAudio = await createHowlerAssetAudio({
      beep: {
        src: [createBeepWavDataUri()],
        volume: 0.42,
      },
    });

    return assetAudio;
  }

  async function ensureToneAudio() {
    if (toneAudio !== undefined) {
      return toneAudio;
    }

    toneAudio = await createToneMusicAudio({
      bpm: 132,
      masterVolume: 0.65,
      instruments: {
        kick: "membrane",
        lead: "synth",
      },
    });

    toneAudio.registerSequence("theme", {
      loop: true,
      steps: [
        { instrumentId: "lead", note: "C4", time: 0, duration: "8n" },
        { instrumentId: "lead", note: "E4", time: "0:1:0", duration: "8n" },
        { instrumentId: "lead", note: "G4", time: "0:2:0", duration: "8n" },
        { instrumentId: "kick", note: "C2", time: "0:3:0", duration: "4n" },
      ],
    });

    return toneAudio;
  }

  GridCanvasSystem.runtime.createAnimationLoop({
    autoStart: true,
    maxElapsed: 0.05,
    update(elapsed) {
      time += elapsed;
      assetFlash = Math.max(0, assetFlash - elapsed * 2.2);
      noteFlash = Math.max(0, noteFlash - elapsed * 2.2);
    },
    draw() {
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 1.8);

      grid.clearCanvas();
      grid.drawBarIndicator(
        "SFX",
        18,
        18,
        88,
        10,
        assetAudio === undefined ? 0 : 100,
        100,
        {
          fillColor: "#34d399",
          strokeColor: "#e8f7ef",
          textColor: "#e8f7ef",
          font: '11px "Geist Pixel", monospace',
        },
      );
      grid.drawBarIndicator("SEQ", 18, 40, 88, 10, themeRunning ? 100 : 0, 100, {
        fillColor: "#ffb14a",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawGhost({ x: 162, y: 182 + Math.sin(time * 2) * 5 }, 26 + assetFlash * 4, {
        feet: 5,
        fillColor: "#10b981",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawPacman(468, 178, 34 + pulse * 2, 0.78, {
        fillColor: "#facc15",
        strokeColor: "#082f49",
        lineWidth: 2,
      });
      grid.drawProjectile({ x: 314, y: 110 - noteFlash * 22 }, 8 + noteFlash * 8, 0.8, {
        fillColor: "#4da9ff",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawMessage(
        "HOWLER + TONE",
        themeRunning ? "asset playback + live sequence" : "async adapter factories",
        { x: 320, y: 48 },
      );
    },
  });

  root
    .querySelectorAll<HTMLButtonElement>("[data-docs-audio-adapter-action]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.docsAudioAdapterAction;

        try {
          if (action === "asset") {
            assetFlash = 1;
            setStatus(root, messages.asset);
            const audio = await ensureAssetAudio();

            audio.play("beep");
            return;
          }

          if (action === "theme") {
            themeRunning = true;
            setStatus(root, messages.theme);
            const music = await ensureToneAudio();

            await music.playSequence("theme");
            return;
          }

          if (action === "note") {
            noteFlash = 1;
            setStatus(root, messages.note);
            const music = await ensureToneAudio();

            await music.trigger("lead", "A4", "8n");
            return;
          }

          toneAudio?.stopSequence("theme");
          themeRunning = false;
          setStatus(root, messages.stop);
        } catch (error) {
          if (action === "theme") {
            themeRunning = false;
          }

          setStatus(root, error instanceof Error ? error.message : String(error));
        }
      });
    });

  window.addEventListener("beforeunload", () => {
    assetAudio?.dispose();
    toneAudio?.dispose();
  });
}

mountAudioArcadeDemo();
mountAudioAdaptersDemo();
