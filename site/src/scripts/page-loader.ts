import GridCanvasSystem from "grid-canvas-system";

const loader = document.querySelector<HTMLElement>("[data-page-loader]");
const canvas = document.querySelector<HTMLCanvasElement>("[data-page-loader-canvas]");
const percent = document.querySelector<HTMLElement>("[data-page-loader-percent]");

if (loader !== null && canvas !== null) {
  const loaderElement = loader;
  const canvasElement = canvas;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const startedAt = performance.now();
  const minVisibleMs = prefersReducedMotion ? 650 : 1350;
  const maxAssetWaitMs = 5600;
  let activeLoop: ReturnType<
    typeof GridCanvasSystem.runtime.createAnimationLoop
  > | null = null;
  let grid: InstanceType<typeof GridCanvasSystem> | null = null;
  let progressValue = 4;
  let readyToFinish = false;
  let finished = false;
  let sceneWidth = 0;
  let sceneHeight = 0;

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ms);
    });
  }

  function waitForWindowLoad(): Promise<void> {
    if (document.readyState === "complete") {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    });
  }

  async function waitForFonts(): Promise<void> {
    if (!("fonts" in document)) {
      return;
    }

    const fontLoads: Promise<FontFace[]>[] = [
      document.fonts.load('16px "Geist Pixel"'),
    ];

    if (document.documentElement.lang.toLowerCase().startsWith("ja")) {
      fontLoads.push(document.fonts.load('16px "Noto Sans JP"'));
    }

    try {
      await Promise.race([
        Promise.all([...fontLoads, document.fonts.ready]),
        delay(maxAssetWaitMs),
      ]);
    } catch {
      // Font loading should never strand the page behind the loader.
    }
  }

  function syncGrid(): void {
    const width = Math.max(320, Math.round(canvasElement.clientWidth || 320));
    const height = Math.max(180, Math.round(canvasElement.clientHeight || 190));

    if (grid !== null && width === sceneWidth && height === sceneHeight) {
      return;
    }

    sceneWidth = width;
    sceneHeight = height;
    grid = new GridCanvasSystem(canvasElement.id, {
      width,
      height,
      backgroundColor: "#050607",
      gridColor: "rgba(0, 212, 59, 0.13)",
      gridLabelColor: "rgba(0, 0, 0, 0)",
      coordinateLabelColor: "rgba(232, 247, 239, 0)",
      cellSize: 24,
      majorStep: 96,
      minorLineWidth: 0.6,
      majorLineWidth: 1.1,
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    });
  }

  function updateProgress(): void {
    if (finished) {
      return;
    }

    const elapsedMs = performance.now() - startedAt;
    const idleTarget = Math.min(92, 8 + elapsedMs / (prefersReducedMotion ? 18 : 42));
    const target = readyToFinish ? 100 : idleTarget;
    const distance = Math.max(0, target - progressValue);
    const step = readyToFinish
      ? Math.max(0.8, distance * 0.18)
      : Math.max(0.08, distance * 0.045);

    progressValue = Math.min(target, progressValue + step);
    updateLoaderDom();

    if (readyToFinish && progressValue >= 99.7) {
      finishLoader();
    }
  }

  function updateLoaderDom(): void {
    const visibleProgress = Math.min(100, Math.floor(progressValue));

    if (percent !== null) {
      percent.textContent = `${visibleProgress}%`;
    }
  }

  function drawLoader(): void {
    syncGrid();

    if (grid === null) {
      return;
    }

    const time = (performance.now() - startedAt) / 1000;
    const width = sceneWidth;
    const height = sceneHeight;
    const ratio = Math.min(1, progressValue / 100);
    const easedRatio = 1 - Math.pow(1 - ratio, 2);
    const laneY = height * 0.56;
    const startX = Math.max(64, width * 0.22);
    const endX = Math.min(width - 64, width * 0.78);
    const pacmanRadius = Math.max(24, Math.min(54, Math.min(width, height) * 0.065));
    const pacmanX = startX + (endX - startX) * easedRatio;
    const mouth = prefersReducedMotion
      ? 0.42
      : 0.2 + Math.abs(Math.sin(time * 9)) * 0.78;
    const pelletCount = Math.max(9, Math.floor(width / 48));

    grid.clearCanvas();
    grid.drawPolyline(
      [
        { x: startX - 12, y: laneY },
        { x: endX + 12, y: laneY },
      ],
      {
        color: "rgba(232, 247, 239, 0.18)",
        lineWidth: 1,
      },
    );

    for (let index = 0; index < pelletCount; index += 1) {
      const pelletRatio = pelletCount === 1 ? 1 : index / (pelletCount - 1);
      const x = startX + (endX - startX) * pelletRatio;

      if (x < pacmanX - pacmanRadius * 0.5) {
        continue;
      }

      grid.drawProjectile({ x, y: laneY }, 3.4, 0.88, {
        fillColor: index % 4 === 0 ? "#4da9ff" : "#e8f7ef",
        strokeColor: "rgba(0, 212, 59, 0.5)",
        lineWidth: 0.5,
      });
    }

    if (ratio < 0.98) {
      grid.drawGhost(
        {
          x: Math.max(startX - pacmanRadius, pacmanX - pacmanRadius * 4.2),
          y: laneY + Math.sin(time * 4) * 4,
        },
        pacmanRadius * 0.78,
        {
          fillColor: "rgba(77, 169, 255, 0.76)",
          strokeColor: "rgba(232, 247, 239, 0.62)",
          pupilColor: "#050607",
          lineWidth: 1,
        },
      );
    }

    grid.drawPacman(pacmanX, laneY, pacmanRadius, mouth, {
      direction: 0,
      fillColor: "#ffb14a",
      strokeColor: "rgba(232, 247, 239, 0.72)",
      lineWidth: 1,
    });
  }

  function finishLoader(): void {
    if (finished) {
      return;
    }

    finished = true;
    progressValue = 100;
    updateLoaderDom();
    document.documentElement.dataset.pageLoader = "complete";

    window.setTimeout(
      () => {
        loaderElement.dataset.state = "leaving";
        document.body.classList.remove("grid-loader-active");
        document.body.classList.add("grid-loader-ready");

        window.requestAnimationFrame(() => {
          document.dispatchEvent(new CustomEvent("grid-loader:complete"));
        });

        window.setTimeout(
          () => {
            activeLoop?.stop();
            window.removeEventListener("resize", syncGrid);
            loaderElement.remove();
            document.body.classList.remove("grid-loader-ready");
          },
          prefersReducedMotion ? 80 : 460,
        );
      },
      prefersReducedMotion ? 60 : 180,
    );
  }

  window.addEventListener("resize", syncGrid);
  syncGrid();
  updateLoaderDom();

  activeLoop = GridCanvasSystem.runtime.createAnimationLoop({
    autoStart: true,
    maxElapsed: 0.05,
    update: updateProgress,
    draw: drawLoader,
  });

  void Promise.all([
    Promise.race([waitForWindowLoad(), delay(maxAssetWaitMs)]),
    waitForFonts(),
    delay(minVisibleMs),
  ]).then(() => {
    readyToFinish = true;
  });
}

export {};
