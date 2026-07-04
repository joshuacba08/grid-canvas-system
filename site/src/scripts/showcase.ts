import GridCanvasSystem from "grid-canvas-system";
import type { GridCanvasParticle } from "grid-canvas-system";

const canvas = document.getElementById("hero-canvas") as HTMLCanvasElement | null;

const actorSprite = [
  "00111100",
  "01122110",
  "11222211",
  "12233221",
  "11222211",
  "01111110",
  "00100100",
] as const;

const actorPalette = {
  0: "transparent",
  1: "#00d43b",
  2: "#e8f7ef",
  3: "#07110a",
};

const codeLines = [
  'import GridCanvasSystem from "grid-canvas-system";',
  'const grid = new GridCanvasSystem("canvas", { cellSize: 20 });',
  "grid.drawPixelSprite(sprite, { x, y, pixelSize: 8, palette });",
  "GridCanvasSystem.runtime.createAnimationLoop({ update, draw });",
  "const cell = GridCanvasSystem.runtime.canvasToGrid(pointer, gridOptions);",
  "const machine = GridCanvasSystem.runtime.createStateMachine(states);",
];

let activeLoop: ReturnType<typeof GridCanvasSystem.runtime.createAnimationLoop> | null =
  null;
let activePointer: ReturnType<
  typeof GridCanvasSystem.runtime.createPointerTracker
> | null = null;
let resizeTimer = 0;

function mountShowcase(): void {
  if (canvas === null || canvas.parentElement === null) {
    return;
  }

  activeLoop?.stop();
  activePointer?.destroy();

  const bounds = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(360, Math.round(bounds.width));
  const height = Math.max(420, Math.round(bounds.height));
  const grid = new GridCanvasSystem("hero-canvas", {
    width,
    height,
    backgroundColor: "#050607",
    gridColor: "rgba(0, 212, 59, 0.14)",
    gridLabelColor: "rgba(0, 0, 0, 0)",
    coordinateLabelColor: "#e8f7ef",
    coordinateFont: "12px ui-monospace, SFMono-Regular, Consolas, monospace",
    cellSize: 24,
    majorStep: 96,
    minorLineWidth: 0.6,
    majorLineWidth: 1.1,
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
  });
  const pointer = GridCanvasSystem.runtime.createPointerTracker(grid.canvas, {
    preventDefault: true,
  });
  const particles = GridCanvasSystem.runtime.createParticleBurst(
    { x: width * 0.82, y: height * 0.32 },
    28,
    {
      angle: Math.PI,
      spread: Math.PI * 1.4,
      speed: 58,
      speedJitter: 36,
      life: 1.8,
      lifeJitter: 1,
      size: 2,
      sizeJitter: 2,
      random: seededRandom(17),
    },
  );
  let particleState: GridCanvasParticle[] = particles;
  let trail = [
    { x: width * 0.18, y: height * 0.72 },
    { x: width * 0.24, y: height * 0.66 },
  ];
  let time = 0;
  let lastPaintAt = 0;
  const entranceEndsAt = performance.now() + 1600;

  activePointer = pointer;
  activeLoop = GridCanvasSystem.runtime.createAnimationLoop({
    autoStart: true,
    maxElapsed: 0.05,
    update(elapsed) {
      time += elapsed;
      const fallback = {
        x: width * 0.5 + Math.cos(time * 0.7) * width * 0.22,
        y: height * 0.48 + Math.sin(time * 0.9) * height * 0.18,
      };
      const target = pointer.position() ?? fallback;

      trail = GridCanvasSystem.runtime.appendTrailPoint(trail, target, 28);
      particleState = GridCanvasSystem.runtime.stepParticles(particleState, elapsed, {
        gravityY: -2,
        drag: 0.08,
      });

      if (particleState.length < 12) {
        particleState = [
          ...particleState,
          ...GridCanvasSystem.runtime.createParticleBurst(
            { x: width * 0.82, y: height * 0.32 },
            10,
            {
              angle: Math.PI,
              spread: Math.PI * 1.2,
              speed: 52,
              life: 1.6,
              size: 2,
              random: seededRandom(Math.round(time * 1000) + 3),
            },
          ),
        ];
      }
    },
    draw() {
      const now = performance.now();

      if (now < entranceEndsAt && now - lastPaintAt < 30) {
        return;
      }

      lastPaintAt = now;
      const pointerPosition = pointer.position();
      const target = pointerPosition ?? {
        x: width * 0.5 + Math.cos(time * 0.7) * width * 0.22,
        y: height * 0.48 + Math.sin(time * 0.9) * height * 0.18,
      };
      const cell = GridCanvasSystem.runtime.canvasToGrid(target, { cellSize: 24 });
      const snapped = GridCanvasSystem.runtime.snapPointToGrid(target, {
        cellSize: 24,
      });
      const pulse = GridCanvasSystem.runtime.oscillate01(time, 0.7);

      grid.clearCanvas();
      drawCodeField(grid, width, height, time);

      grid.drawPolyline(trail, {
        color: "rgba(77, 169, 255, 0.56)",
        lineWidth: 1.5,
      });

      particleState.forEach((particle, index) => {
        grid.drawProjectile(
          { x: particle.x, y: particle.y },
          Math.max(1, particle.size),
          Math.max(0.15, particle.life / Math.max(0.1, particle.maxLife)),
          {
            fillColor: index % 3 === 0 ? "#4da9ff" : "#00d43b",
            strokeColor: "rgba(232, 247, 239, 0.32)",
            lineWidth: 0.5,
          },
        );
      });

      grid.drawPolyline(
        [
          { x: snapped.x, y: snapped.y },
          { x: snapped.x + 24, y: snapped.y },
          { x: snapped.x + 24, y: snapped.y + 24 },
          { x: snapped.x, y: snapped.y + 24 },
        ],
        {
          closePath: true,
          color: pointerPosition === null ? "rgba(232, 247, 239, 0.26)" : "#ffb14a",
          lineWidth: 1.4,
        },
      );
      grid.drawPixelSprite(actorSprite, {
        x: snapped.x - 20,
        y: snapped.y - 48 - pulse * 8,
        pixelSize: 7,
        palette: actorPalette,
      });
      grid.drawPacman(width * 0.78, height * 0.66, 36, pulse, {
        direction: -Math.PI * 0.18,
        fillColor: "#ffb14a",
        strokeColor: "rgba(232, 247, 239, 0.7)",
        lineWidth: 1,
      });
      grid.drawGhost({ x: width * 0.9, y: height * 0.7 + Math.sin(time) * 8 }, 30, {
        fillColor: "rgba(77, 169, 255, 0.72)",
        strokeColor: "rgba(232, 247, 239, 0.64)",
        pupilColor: "#050607",
        lineWidth: 1,
      });
      grid.drawText(`cell ${cell.column}:${cell.row}`, 22, height - 58, {
        color: "#e8f7ef",
        font: "13px ui-monospace, SFMono-Regular, Consolas, monospace",
      });
      grid.drawBarIndicator("runtime", 22, height - 34, 120, 12, 72 + pulse * 20, 100, {
        fillColor: "#00d43b",
        strokeColor: "rgba(232, 247, 239, 0.66)",
        textColor: "#e8f7ef",
        font: "12px ui-monospace, SFMono-Regular, Consolas, monospace",
      });
    },
  });
}

function drawCodeField(
  grid: InstanceType<typeof GridCanvasSystem>,
  width: number,
  height: number,
  time: number,
): void {
  const top = Math.max(72, height * 0.16);

  codeLines.forEach((line, index) => {
    const x = 26 + (index % 2) * width * 0.08;
    const y = top + index * 30;
    const alpha = 0.08 + (index % 3) * 0.035;

    grid.drawText(line, x, y, {
      color: `rgba(232, 247, 239, ${alpha})`,
      font: "14px ui-monospace, SFMono-Regular, Consolas, monospace",
    });
  });

  grid.drawText("GRID CANVAS SYSTEM", width * 0.52, height * 0.24, {
    color: "rgba(0, 212, 59, 0.18)",
    font: `${Math.max(30, Math.min(88, width * 0.08))}px ui-monospace, SFMono-Regular, Consolas, monospace`,
    textAlign: "center",
  });
  grid.drawText(
    `tick ${Math.floor(time * 60)
      .toString()
      .padStart(5, "0")}`,
    width - 26,
    42,
    {
      color: "rgba(77, 169, 255, 0.44)",
      font: "13px ui-monospace, SFMono-Regular, Consolas, monospace",
      textAlign: "end",
    },
  );
}

function seededRandom(seed: number): () => number {
  let state = seed % 2147483647;

  if (state <= 0) {
    state += 2147483646;
  }

  return () => {
    state = (state * 16807) % 2147483647;

    return (state - 1) / 2147483646;
  };
}

if (canvas !== null) {
  mountShowcase();

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(mountShowcase, 180);
  });
}
