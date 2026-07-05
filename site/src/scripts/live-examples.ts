import GridCanvasSystem from "grid-canvas-system";
import type { GridCanvasAnimationLoop } from "grid-canvas-system";
import { createArcadeAudio } from "../../../src/audio-arcade";

interface LiveDemo {
  canvas: HTMLCanvasElement;
  loop: GridCanvasAnimationLoop;
}

type HomeLocale = "en" | "es" | "ja";

const demos: LiveDemo[] = [];
const visibleDemos = new Set<GridCanvasAnimationLoop>();
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const homeLocale: HomeLocale =
  document.documentElement.lang === "es"
    ? "es"
    : document.documentElement.lang === "ja"
      ? "ja"
      : "en";

const homeCopy = {
  en: {
    audio: {
      live: "LIVE",
      muted: "MUTED",
      ready: "retro SFX ready",
      statuses: {
        hidden: "Stopped the loop while the tab was hidden.",
        loop: "Patrol loop running.",
        muted: "Muted arcade audio.",
        pickup: "Played pickup SFX.",
        shoot: "Played shoot SFX.",
        stopped: "Stopped the active loop.",
        unmuted: "Audio unmuted.",
      },
      title: "AUDIO ARCADE",
    },
    buddy: {
      footer: "SPRITE + FSM",
      states: {
        happy: "HAPPY",
        idle: "IDLE",
        sleeping: "SLEEPING",
      },
    },
    hud: {
      subtitle: "runtime overlay helpers",
      title: "SYSTEM READY",
    },
    shapes: {
      asteroid: "ASTEROID",
      ghost: "GHOST",
      pacman: "PACMAN",
    },
  },
  es: {
    audio: {
      live: "ACTIVO",
      muted: "MUTE",
      ready: "SFX retro listos",
      statuses: {
        hidden: "Se detuvo el loop al ocultar la pestana.",
        loop: "Patrol loop corriendo.",
        muted: "Audio Arcade silenciado.",
        pickup: "Se reprodujo el SFX pickup.",
        shoot: "Se reprodujo el SFX shoot.",
        stopped: "Se detuvo el loop activo.",
        unmuted: "Audio reactivado.",
      },
      title: "AUDIO ARCADE",
    },
    buddy: {
      footer: "SPRITE + FSM",
      states: {
        happy: "FELIZ",
        idle: "CALMA",
        sleeping: "SIESTA",
      },
    },
    hud: {
      subtitle: "helpers de overlay runtime",
      title: "SISTEMA LISTO",
    },
    shapes: {
      asteroid: "ASTEROIDE",
      ghost: "FANTASMA",
      pacman: "PACMAN",
    },
  },
  ja: {
    audio: {
      live: "稼働中",
      muted: "ミュート",
      ready: "レトロSFX待機中",
      statuses: {
        hidden: "タブ非表示のためループを停止しました。",
        loop: "patrol loop を再生中です。",
        muted: "Audio Arcade をミュートしました。",
        pickup: "pickup SFX を再生しました。",
        shoot: "shoot SFX を再生しました。",
        stopped: "再生中のループを停止しました。",
        unmuted: "音声を再開しました。",
      },
      title: "AUDIO ARCADE",
    },
    buddy: {
      footer: "SPRITE + FSM",
      states: {
        happy: "楽しい",
        idle: "待機",
        sleeping: "睡眠",
      },
    },
    hud: {
      subtitle: "runtime overlay helpers",
      title: "SYSTEM READY",
    },
    shapes: {
      asteroid: "アステロイド",
      ghost: "ゴースト",
      pacman: "PACMAN",
    },
  },
} as const;

const spriteFrames = {
  idleA: [
    "00111100",
    "01222210",
    "12211221",
    "12122121",
    "12222221",
    "01211210",
    "00100100",
  ],
  idleB: [
    "00111100",
    "01222210",
    "12211221",
    "12122121",
    "12222221",
    "01111110",
    "00011000",
  ],
  happyA: [
    "00111100",
    "01222210",
    "12322321",
    "13211231",
    "12233221",
    "01222210",
    "00100100",
  ],
  happyB: [
    "00111100",
    "01222210",
    "12322321",
    "13211231",
    "12233221",
    "01111110",
    "00011000",
  ],
  sleepA: [
    "00111100",
    "01222210",
    "12444421",
    "14211241",
    "12222221",
    "01211210",
    "00100100",
  ],
  sleepB: [
    "00111100",
    "01222210",
    "12444421",
    "14211241",
    "12222221",
    "01111110",
    "00011000",
  ],
} as const;

const spritePalette = {
  0: "transparent",
  1: "#00d43b",
  2: "#e8f7ef",
  3: "#ffb14a",
  4: "#4da9ff",
};

function createGrid(canvas: HTMLCanvasElement): InstanceType<typeof GridCanvasSystem> {
  return new GridCanvasSystem(canvas.id, {
    width: 520,
    height: 260,
    backgroundColor: "#050607",
    gridColor: "rgba(0, 212, 59, 0.12)",
    gridLabelColor: "rgba(0, 0, 0, 0)",
    coordinateLabelColor: "#e8f7ef",
    coordinateFont: '12px "Geist Pixel", monospace',
    cellSize: 20,
    majorStep: 40,
    minorLineWidth: 0.6,
    majorLineWidth: 1,
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
  });
}

function registerDemo(canvas: HTMLCanvasElement, loop: GridCanvasAnimationLoop): void {
  loop.frame(0);
  demos.push({ canvas, loop });
}

function mountBuddy(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#demo-buddy");

  if (canvas === null) {
    return;
  }

  const grid = createGrid(canvas);
  const animator = GridCanvasSystem.runtime.createSpriteAnimator({
    animations: {
      idle: ["idleA", "idleB"],
      happy: ["happyA", "happyB"],
      sleeping: ["sleepA", "sleepB"],
    },
    initial: "idle",
    fps: 3,
  });
  const machine = GridCanvasSystem.runtime.createStateMachine({
    initial: "idle",
    transitions: {
      idle: ["happy", "sleeping"],
      happy: ["idle", "sleeping"],
      sleeping: ["idle", "happy"],
    },
  });
  const stats = {
    hunger: 34,
    energy: 78,
    happiness: 72,
  };
  let moodTime = 0;
  let time = 0;

  const setMood = (next: "idle" | "happy" | "sleeping", duration: number): void => {
    if (machine.getState() !== next) {
      machine.transition(next);
    }

    moodTime = duration;
    animator.play(next);
  };

  const loop = GridCanvasSystem.runtime.createAnimationLoop({
    maxElapsed: 0.08,
    update(elapsed) {
      time += elapsed;
      moodTime = Math.max(0, moodTime - elapsed);

      if (machine.getState() === "sleeping") {
        stats.energy = Math.min(100, stats.energy + elapsed * 7);
      } else {
        stats.energy = Math.max(0, stats.energy - elapsed * 0.45);
      }

      stats.hunger = Math.min(100, stats.hunger + elapsed * 0.4);

      if (moodTime === 0 && machine.getState() !== "idle") {
        setMood("idle", 0);
      }

      animator.update(elapsed);
    },
    draw() {
      const bob = machine.getState() === "sleeping" ? 0 : Math.sin(time * 4) * 3;
      const stateLabelKey = machine.getState() as keyof typeof homeCopy.en.buddy.states;

      grid.clearCanvas();
      grid.drawBarIndicator("HNG", 18, 22, 84, 10, stats.hunger, 100, {
        fillColor: "#ff5c7a",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawBarIndicator("NRG", 18, 44, 84, 10, stats.energy, 100, {
        fillColor: "#4da9ff",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawBarIndicator("JOY", 18, 66, 84, 10, stats.happiness, 100, {
        fillColor: "#ffb14a",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawPixelSprite(
        spriteFrames[animator.getFrame() as keyof typeof spriteFrames],
        {
          x: 326,
          y: 76 + bob,
          pixelSize: 13,
          palette: spritePalette,
        },
      );
      grid.drawText(homeCopy[homeLocale].buddy.states[stateLabelKey], 438, 24, {
        color: machine.getState() === "happy" ? "#ffb14a" : "#00d43b",
        font: '12px "Geist Pixel", monospace',
        textAlign: "end",
      });
      grid.drawText(homeCopy[homeLocale].buddy.footer, 18, 236, {
        color: "rgba(232, 247, 239, 0.5)",
        font: '11px "Geist Pixel", monospace',
      });
    },
  });

  document
    .querySelectorAll<HTMLButtonElement>("[data-buddy-action]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.buddyAction;

        if (action === "feed") {
          stats.hunger = Math.max(0, stats.hunger - 24);
          stats.happiness = Math.min(100, stats.happiness + 8);
          setMood("happy", 2.2);
        } else if (action === "play") {
          stats.energy = Math.max(0, stats.energy - 10);
          stats.happiness = Math.min(100, stats.happiness + 18);
          setMood("happy", 2.2);
        } else {
          setMood("sleeping", 3.4);
        }
      });
    });

  registerDemo(canvas, loop);
}

function mountRuntime(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#demo-runtime");

  if (canvas === null) {
    return;
  }

  const grid = createGrid(canvas);
  const body = new GridCanvasSystem.runtime.MassBody({
    x: 150,
    y: 126,
    mass: 9,
    radius: 25,
    xSpeed: 62,
    ySpeed: 28,
    rotationSpeed: 0.28,
  });
  const keys = GridCanvasSystem.runtime.createKeyTracker(canvas, {
    preventDefaultKeys: ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"],
  });
  let time = 0;
  let trail: Array<{ x: number; y: number }> = [];

  const loop = GridCanvasSystem.runtime.createAnimationLoop({
    maxElapsed: 0.06,
    update(elapsed) {
      time += elapsed;

      if (keys.isPressed("ArrowLeft")) body.angle -= Math.PI * elapsed;
      if (keys.isPressed("ArrowRight")) body.angle += Math.PI * elapsed;
      if (keys.isPressed("ArrowUp")) body.push(body.angle, 780, elapsed);
      if (keys.isPressed("ArrowDown")) body.push(body.angle + Math.PI, 560, elapsed);

      body.update(elapsed, { width: 520, height: 260 });
      trail = GridCanvasSystem.runtime.appendTrailPoint(
        trail,
        { x: body.x, y: body.y },
        18,
      );
    },
    draw() {
      grid.clearCanvas();
      grid.drawPolyline(trail, {
        color: "rgba(77, 169, 255, 0.5)",
        lineWidth: 2,
      });
      grid.drawPacman(
        body.x,
        body.y,
        body.radius,
        GridCanvasSystem.runtime.oscillate01(time, 2.5),
        {
          direction: body.angle,
          fillColor: "#ffb14a",
          strokeColor: "#e8f7ef",
          lineWidth: 1,
        },
      );
      grid.drawText(`x:${Math.round(body.x)} y:${Math.round(body.y)}`, 18, 24, {
        color: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawBarIndicator("SPD", 365, 18, 82, 10, Math.min(body.speed(), 160), 160, {
        fillColor: "#00d43b",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
    },
  });

  registerDemo(canvas, loop);
}

function mountHud(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#demo-hud");

  if (canvas === null) {
    return;
  }

  const grid = createGrid(canvas);
  let time = 0;

  const loop = GridCanvasSystem.runtime.createAnimationLoop({
    maxElapsed: 0.08,
    update(elapsed) {
      time += elapsed;
    },
    draw() {
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 0.55);
      const score = 2450 + Math.floor(time * 22);

      grid.clearCanvas();
      grid.drawShip({ x: 260, y: 172 }, 44, {
        rotation: -Math.PI / 2 + Math.sin(time * 0.7) * 0.08,
        curve1: 0.45,
        curve2: 0.8,
        thruster: true,
        fillColor: "#101722",
        strokeColor: "#e8f7ef",
        lineWidth: 2,
      });
      grid.drawBarIndicator("HP", 18, 18, 100, 11, 64 + pulse * 30, 100, {
        fillColor: "#00d43b",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawValueLabel("SCORE", score, 502, 27, {
        color: "#e8f7ef",
        font: '12px "Geist Pixel", monospace',
        textAlign: "end",
      });
      grid.drawValueLabel("LVL", 3, 18, 238, {
        color: "#4da9ff",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawMessage(
        homeCopy[homeLocale].hud.title,
        homeCopy[homeLocale].hud.subtitle,
        { x: 260, y: 72 },
        {
          color: "#e8f7ef",
          subColor: "#9ca8a0",
          mainFont: '20px "Geist Pixel", monospace',
          subFont: '11px "Geist Pixel", monospace',
          lineGap: 22,
        },
      );
    },
  });

  registerDemo(canvas, loop);
}

function mountAudioArcade(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#demo-audio-arcade");

  if (canvas === null) {
    return;
  }

  const grid = createGrid(canvas);
  const status = document.querySelector<HTMLElement>("[data-home-audio-status]");
  let audio: ReturnType<typeof createArcadeAudio> | undefined;
  let audioError: string | undefined;
  let activeLoopId: string | undefined;
  let activePreset = "none";
  let muted = false;
  let time = 0;
  let flash = 0;

  function setStatus(message: string): void {
    if (status !== null) {
      status.textContent = message;
    }
  }

  function ensureAudio() {
    if (audio !== undefined) {
      return audio;
    }

    if (audioError !== undefined) {
      throw new Error(audioError);
    }

    try {
      audio = createArcadeAudio({
        masterVolume: 0.72,
      });

      return audio;
    } catch (error) {
      audioError = error instanceof Error ? error.message : String(error);
      throw error;
    }
  }

  const loop = GridCanvasSystem.runtime.createAnimationLoop({
    maxElapsed: 0.08,
    update(elapsed) {
      time += elapsed;
      flash = Math.max(0, flash - elapsed * 2.5);
    },
    draw() {
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 2.4);

      grid.clearCanvas();
      grid.drawBarIndicator("VOL", 18, 18, 86, 10, muted ? 0 : 72, 100, {
        fillColor: muted ? "#ff5c7a" : "#4da9ff",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawBarIndicator("LOOP", 18, 40, 86, 10, activePreset === "none" ? 0 : 100, 100, {
        fillColor: "#00d43b",
        strokeColor: "#e8f7ef",
        textColor: "#e8f7ef",
        font: '11px "Geist Pixel", monospace',
      });
      grid.drawShip({ x: 262, y: 156 }, 42, {
        rotation: -Math.PI / 2,
        curve1: 0.4,
        curve2: 0.82,
        thruster: activePreset !== "none",
        fillColor: "#101722",
        strokeColor: "#e8f7ef",
        lineWidth: 2,
      });
      grid.drawProjectile({ x: 262 + flash * 150, y: 88 }, 7 + flash * 7, 0.72, {
        fillColor: "#4da9ff",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawGhost({ x: 138, y: 154 + Math.sin(time * 2) * 5 }, 28 + pulse * 2, {
        feet: 5,
        fillColor: muted ? "#ff5c7a" : "#00d43b",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawMessage(
        homeCopy[homeLocale].audio.title,
        activePreset === "none"
          ? homeCopy[homeLocale].audio.ready
          : `loop ${activePreset}`,
        {
          x: 260,
          y: 40,
        },
      );
      grid.drawText(muted ? homeCopy[homeLocale].audio.muted : homeCopy[homeLocale].audio.live, 486, 24, {
        color: muted ? "#ff5c7a" : "#00d43b",
        font: '11px "Geist Pixel", monospace',
        textAlign: "end",
      });
    },
  });

  document
    .querySelectorAll<HTMLButtonElement>("[data-home-audio-action]")
    .forEach((button) => {
      button.addEventListener("click", async () => {
        const action = button.dataset.homeAudioAction;

        try {
          const controller = ensureAudio();

          if (action === "shoot") {
            await controller.playShoot();
            flash = 1;
            setStatus(homeCopy[homeLocale].audio.statuses.shoot);
            return;
          }

          if (action === "pickup") {
            await controller.playPickup();
            flash = 0.65;
            setStatus(homeCopy[homeLocale].audio.statuses.pickup);
            return;
          }

          if (action === "loop") {
            if (activeLoopId !== undefined) {
              controller.stopLoop(activeLoopId);
            }

            activeLoopId = await controller.playLoop("patrol");
            activePreset = "patrol";
            flash = 0.45;
            setStatus(homeCopy[homeLocale].audio.statuses.loop);
            return;
          }

          if (action === "stop") {
            if (activeLoopId !== undefined) {
              controller.stopLoop(activeLoopId);
              activeLoopId = undefined;
            }

            activePreset = "none";
            setStatus(homeCopy[homeLocale].audio.statuses.stopped);
            return;
          }

          muted = controller.mute();
          setStatus(
            muted
              ? homeCopy[homeLocale].audio.statuses.muted
              : homeCopy[homeLocale].audio.statuses.unmuted,
          );
        } catch (error) {
          setStatus(error instanceof Error ? error.message : String(error));
        }
      });
    });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" || activeLoopId === undefined) {
      return;
    }

    audio?.stopLoop(activeLoopId);
    activeLoopId = undefined;
    activePreset = "none";
    setStatus(homeCopy[homeLocale].audio.statuses.hidden);
  });

  window.addEventListener("beforeunload", () => {
    void audio?.dispose();
  });

  registerDemo(canvas, loop);
}

function mountShapes(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#demo-shapes");

  if (canvas === null) {
    return;
  }

  const grid = createGrid(canvas);
  const asteroid = grid.createAsteroidShape(12);
  let time = 0;

  const loop = GridCanvasSystem.runtime.createAnimationLoop({
    maxElapsed: 0.08,
    update(elapsed) {
      time += elapsed;
    },
    draw() {
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 1.8);
      const projectileX = 32 + ((time * 86) % 456);

      grid.clearCanvas();
      grid.drawPacman(92, 126, 42, pulse, {
        direction: 0,
        fillColor: "#ffb14a",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawGhost({ x: 254, y: 128 + Math.sin(time * 2) * 8 }, 38, {
        feet: 5,
        fillColor: "#4da9ff",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawAsteroid({ x: 414, y: 126 }, 35, asteroid, {
        noise: 0.28,
        rotation: time * 0.32,
        fillColor: "#101722",
        strokeColor: "#00d43b",
        lineWidth: 2,
      });
      grid.drawProjectile({ x: projectileX, y: 218 }, 6 + pulse * 3, 0.72, {
        fillColor: "#ff5c7a",
        strokeColor: "#e8f7ef",
        lineWidth: 1,
      });
      grid.drawText(homeCopy[homeLocale].shapes.pacman, 92, 34, {
        color: "rgba(232, 247, 239, 0.55)",
        font: '10px "Geist Pixel", monospace',
        textAlign: "center",
      });
      grid.drawText(homeCopy[homeLocale].shapes.ghost, 254, 34, {
        color: "rgba(232, 247, 239, 0.55)",
        font: '10px "Geist Pixel", monospace',
        textAlign: "center",
      });
      grid.drawText(homeCopy[homeLocale].shapes.asteroid, 414, 34, {
        color: "rgba(232, 247, 239, 0.55)",
        font: '10px "Geist Pixel", monospace',
        textAlign: "center",
      });
    },
  });

  registerDemo(canvas, loop);
}

mountBuddy();
mountRuntime();
mountHud();
mountAudioArcade();
mountShapes();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const demo = demos.find(({ canvas }) => canvas === entry.target);

      if (demo === undefined) {
        return;
      }

      if (entry.isIntersecting) {
        visibleDemos.add(demo.loop);

        if (!reduceMotion && document.visibilityState === "visible") {
          demo.loop.start();
        }
      } else {
        visibleDemos.delete(demo.loop);
        demo.loop.stop();
      }
    });
  },
  { threshold: 0.12 },
);

demos.forEach(({ canvas }) => observer.observe(canvas));

document.addEventListener("visibilitychange", () => {
  visibleDemos.forEach((loop) => {
    if (document.visibilityState === "visible" && !reduceMotion) {
      loop.start();
    } else {
      loop.stop();
    }
  });
});
