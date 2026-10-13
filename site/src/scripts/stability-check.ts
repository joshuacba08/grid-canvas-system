import GridCanvasSystem from "grid-canvas-system";
import { createArcadeAudio } from "../../../src/audio-arcade";
import { createHowlerAssetAudio, createToneMusicAudio } from "../../../src/audio";

const root = document.querySelector<HTMLElement>("[data-qa-version]")!;
const canvas = document.querySelector<HTMLCanvasElement>("#qa-canvas")!;
const status = document.querySelector<HTMLOutputElement>("#qa-status")!;
const metrics = document.querySelector<HTMLElement>("#qa-metrics")!;
const playButton = document.querySelector<HTMLButtonElement>("#qa-play")!;
const individualAudioButtons = ["arcade", "howler", "tone"].map((id) =>
  document.querySelector<HTMLButtonElement>(`#qa-${id}`)!,
);
const audioSystems = { arcade: false, howler: false, tone: false };
const errors: string[] = [];
const visibility: { hidden: boolean; at: string }[] = [];
let frames = 0;
let pointerEvents = 0;
let lastPointer = { x: 20, y: 40 };
let resizeEvents = 0;
let runtime: ReturnType<typeof GridCanvasSystem.runtime.createCanvasRuntime>;
let observer: ResizeObserver;
let arcade: ReturnType<typeof createArcadeAudio> | undefined;
let howler: Awaited<ReturnType<typeof createHowlerAssetAudio>> | undefined;
let tone: Awaited<ReturnType<typeof createToneMusicAudio>> | undefined;
let audioPlayed = false;
let cleanupVerified = false;
let preparePending = false;
let generation = 0;

function report() {
  return {
    version: root.dataset.qaVersion,
    commit: root.dataset.qaCommit,
    date: new Date().toISOString(),
    model: document.querySelector<HTMLInputElement>("#device-model")!.value,
    userAgent: navigator.userAgent,
    maxTouchPoints: navigator.maxTouchPoints,
    viewport: { width: innerWidth, height: innerHeight },
    pixelRatio: devicePixelRatio,
    reducedMotion: GridCanvasSystem.runtime.getMotionPreference(),
    size: runtime?.getSize(),
    frames,
    pointerEvents,
    lastPointer,
    resizeEvents,
    audioPlayed,
    audioSystems,
    destroyed: runtime?.isDestroyed(),
    cleanupVerified,
    visibility,
    errors,
    observations: Object.fromEntries(
      [...document.querySelectorAll<HTMLInputElement>("[data-observed]")].map(
        (input) => [input.dataset.observed, input.checked],
      ),
    ),
  };
}
function refresh(message: string) {
  status.textContent = message;
  metrics.textContent = JSON.stringify(report(), null, 2);
}
function failure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  errors.push(message);
  refresh(message);
}

function mount() {
  if (runtime && !runtime.isDestroyed()) runtime.destroy();
  observer?.disconnect();
  cleanupVerified = false;
  const grid = new GridCanvasSystem(canvas, {
    width: 320,
    height: 180,
    devicePixelRatio: Math.min(devicePixelRatio, 3),
  });
  const sprite = GridCanvasSystem.compilePixelSprite(["aba", "bab", "aba"], {
    a: "#5eead4",
    b: "#facc15",
  });
  runtime = GridCanvasSystem.runtime.createCanvasRuntime({
    canvas,
    logicalWidth: 320,
    logicalHeight: 180,
    maxPixelRatio: 3,
    imageSmoothing: false,
    pauseWhenHidden: true,
    reducedMotion: "lower-fps",
    render(ctx) {
      const size = runtime.getSize();
      ctx.clearRect(0, 0, size.logicalWidth, size.logicalHeight);
      grid.drawCompiledPixelSprite(sprite, {
        x: 20 + Math.sin(frames / 40) * 10,
        y: 30,
        pixelSize: 12,
      });
      ctx.fillStyle = "#fb7185";
      ctx.fillRect(lastPointer.x - 3, lastPointer.y - 3, 6, 6);
      frames++;
    },
  });
  for (const subscribe of [
    runtime.onPointerDown,
    runtime.onPointerMove,
    runtime.onPointerUp,
    runtime.onPointerCancel,
  ]) {
    subscribe((event) => {
      pointerEvents++;
      lastPointer = { x: event.x, y: event.y };
      refresh(`Puntero: ${event.x.toFixed(1)}, ${event.y.toFixed(1)}`);
    });
  }
  canvas.style.width = "100%";
  canvas.style.height = "180px";
  observer = new ResizeObserver(() => {
    if (!runtime.isDestroyed() && runtime.resizeToDisplaySize()) {
      resizeEvents++;
      runtime.renderOnce();
      refresh("Canvas adaptado al tamaño visible.");
    }
  });
  observer.observe(canvas);
  runtime.resizeToDisplaySize();
  runtime.renderOnce();
  refresh("Canvas listo. Puedes tocarlo e iniciar la animación.");
}

function wavData() {
  const samples = 2205;
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) =>
    [...value].forEach((char, index) =>
      view.setUint8(offset + index, char.charCodeAt(0)),
    );
  text(0, "RIFF");
  view.setUint32(4, bytes.length - 8, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 22050, true);
  view.setUint32(28, 44100, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples * 2, true);
  for (let i = 0; i < samples; i++)
    view.setInt16(
      44 + i * 2,
      Math.round(Math.sin((i * 440 * Math.PI * 2) / 22050) * 3000),
      true,
    );
  return `data:audio/wav;base64,${btoa(String.fromCharCode(...bytes))}`;
}

async function cleanup() {
  generation++;
  observer.disconnect();
  runtime.destroy();
  howler?.dispose();
  tone?.dispose();
  await arcade?.dispose();
  arcade = undefined;
  tone = undefined;
  howler = undefined;
  playButton.disabled = true;
  individualAudioButtons.forEach((button) => (button.disabled = true));
  const stoppedAt = frames;
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );
  cleanupVerified = frames === stoppedAt;
  refresh("Recursos destruidos. El canvas debe permanecer quieto y en silencio.");
}
document.querySelector("#qa-start")!.addEventListener("click", () => {
  if (!runtime.isDestroyed()) {
    runtime.start();
    refresh("Animación iniciada.");
  }
});
document.querySelector("#qa-pause")!.addEventListener("click", () => {
  if (!runtime.isDestroyed()) {
    runtime.pause();
    refresh("Animación pausada.");
  }
});
document.querySelector("#qa-recreate")!.addEventListener("click", mount);
document.querySelector("#qa-destroy")!.addEventListener("click", () => {
  void cleanup().catch(failure);
});
document.querySelector("#qa-prepare")!.addEventListener("click", async () => {
  if (preparePending || arcade || tone || howler) return;
  preparePending = true;
  const currentGeneration = generation;
  let nextArcade: ReturnType<typeof createArcadeAudio> | undefined;
  let nextHowler: Awaited<ReturnType<typeof createHowlerAssetAudio>> | undefined;
  let nextTone: Awaited<ReturnType<typeof createToneMusicAudio>> | undefined;
  try {
    refresh("Preparando audio…");
    nextArcade = createArcadeAudio({ masterVolume: 0.3 });
    nextHowler = await createHowlerAssetAudio({
      beep: { src: wavData(), onError: failure },
    });
    nextTone = await createToneMusicAudio({ masterVolume: 0.3 });
    if (currentGeneration !== generation) {
      nextHowler.dispose();
      nextTone.dispose();
      await nextArcade.dispose();
      return;
    }
    arcade = nextArcade;
    howler = nextHowler;
    tone = nextTone;
    playButton.disabled = false;
    individualAudioButtons.forEach((button) => (button.disabled = false));
    refresh("Audio preparado. Pulsa reproducir para desbloquearlo con un nuevo gesto.");
  } catch (error) {
    nextHowler?.dispose();
    nextTone?.dispose();
    await nextArcade?.dispose();
    failure(error);
  } finally {
    preparePending = false;
  }
});
playButton.addEventListener("click", async () => {
  if (!arcade || !tone || !howler) return;
  try {
    howler.play("beep");
    await Promise.all([arcade.playShoot(), tone.trigger("main", ["C4", "E4"], "8n")]);
    audioPlayed = true;
    refresh(
      "Señales reproducidas. Confirma personalmente que has escuchado los tres sistemas.",
    );
  } catch (error) {
    failure(error);
  }
});
individualAudioButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!arcade || !howler || !tone) return;
    try {
      const system = button.id.slice(3) as keyof typeof audioSystems;
      if (system === "arcade") await arcade.playShoot();
      if (system === "howler") howler.play("beep");
      if (system === "tone") await tone.trigger("main", ["C4", "E4"], "8n");
      audioSystems[system] = true;
      refresh(`Señal de ${system} reproducida. Confirma que se escucha.`);
    } catch (error) {
      failure(error);
    }
  });
});
document.querySelector("#qa-export")!.addEventListener("click", () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report(), null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `grid-canvas-${root.dataset.qaVersion}-device.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.addEventListener("visibilitychange", () => {
  visibility.push({ hidden: document.hidden, at: new Date().toISOString() });
  refresh(
    document.hidden ? "Aplicación en segundo plano." : "Aplicación visible de nuevo.",
  );
});
window.addEventListener("pagehide", () => {
  void cleanup().catch(failure);
});
mount();
