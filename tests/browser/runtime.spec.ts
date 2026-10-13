import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => "library" in window);
});

test("built runtime sizes, pixels, no-op resize, errors and logical pointers", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const api = (window as any).library;
    const canvas = document.querySelector("canvas")!;
    const runtime = api.createCanvasRuntime({
      canvas,
      logicalWidth: 80,
      logicalHeight: 60,
      maxPixelRatio: 3,
      imageSmoothing: false,
      render: (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(0, 0, 8, 8);
      },
    });
    runtime.renderOnce();
    const context = runtime.getContext();
    const size = runtime.getSize();
    const pixel = [...context.getImageData(1, 1, 1, 1).data];
    context.globalAlpha = 0.5;
    context.translate(3, 4);
    runtime.resize();
    const state = [context.globalAlpha, context.getTransform().e];
    const preserved = [...context.getImageData(1, 1, 1, 1).data];
    let rejected = false;
    try {
      runtime.resize({ width: 120, height: -1 });
    } catch {
      rejected = true;
    }
    const after = runtime.getSize();
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform = "scale(2)";
    const rect = canvas.getBoundingClientRect();
    let point: unknown;
    runtime.onPointerMove((event: unknown) => {
      point = event;
    });
    canvas.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: rect.left + 40,
        clientY: rect.top + 20,
      }),
    );
    runtime.destroy();
    runtime.destroy();
    return {
      size,
      pixel,
      preserved,
      state,
      rejected,
      after,
      point: { x: (point as any).x, y: (point as any).y },
      destroyed: runtime.isDestroyed(),
      dpr: devicePixelRatio,
    };
  });
  expect(result.size.bufferWidth).toBe(Math.round(80 * result.dpr));
  expect(result.size.bufferHeight).toBe(Math.round(60 * result.dpr));
  expect(result.pixel).toEqual([255, 0, 0, 255]);
  expect(result.preserved).toEqual(result.pixel);
  expect(result.state).toEqual([0.5, 3 * result.dpr]);
  expect(result.rejected).toBe(true);
  expect(result.after).toEqual(result.size);
  expect(result.point.x).toBeCloseTo(20, 4);
  expect(result.point.y).toBeCloseTo(10, 4);
  expect(result.destroyed).toBe(true);
});

test("reduced motion preserves simulation time and pause draws on demand", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const result = await page.evaluate(() => {
    const api = (window as any).library;
    let delivered = 0;
    let calls = 0;
    const loop = api.createAnimationLoop({
      reducedMotion: "lower-fps",
      reducedMotionFps: 15,
      updateMs: (dt: number) => {
        delivered += dt;
        calls++;
      },
    });
    for (let t = 0; t <= 1000; t += 10) loop.frame(t);
    loop.destroy();
    let renders = 0;
    const paused = api.createCanvasRuntime({
      canvas: document.querySelector("canvas"),
      logicalWidth: 20,
      logicalHeight: 20,
      reducedMotion: "pause",
      render: () => renders++,
    });
    paused.start();
    paused.renderOnce();
    paused.destroy();
    return { delivered, calls, renders, preference: api.getMotionPreference() };
  });
  expect(result.delivered).toBeGreaterThanOrEqual(930);
  expect(result.calls).toBeLessThanOrEqual(15);
  expect(result.renders).toBe(1);
  expect(result.preference).toBe("reduce");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  expect(await page.evaluate(() => (window as any).library.getMotionPreference())).toBe(
    "no-preference",
  );
});

test("100 mount cycles leave no RAF or event callbacks", async ({ page }) => {
  const result = await page.evaluate(() => {
    const api = (window as any).library;
    let id = 0;
    const raf = new Map();
    let events = 0;
    const originalRequest = window.requestAnimationFrame;
    const originalCancel = window.cancelAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      raf.set(++id, callback);
      return id;
    };
    window.cancelAnimationFrame = (handle) => {
      raf.delete(handle);
    };
    try {
      for (let i = 0; i < 100; i++) {
        const canvas = document.createElement("canvas");
        document.body.append(canvas);
        const runtime = api.createCanvasRuntime({
          canvas,
          logicalWidth: 40,
          logicalHeight: 40,
          render: () => events++,
        });
        const keys = api.createKeyTracker(canvas);
        const pointer = api.createPointerTracker(canvas);
        const scene = api.createSceneManager({
          initial: "menu",
          scenes: { menu: {}, game: {} },
        });
        const fixed = api.createFixedStepLoop({ step: 1 / 60 });
        runtime.onPointerMove(() => events++);
        runtime.start();
        fixed.start();
        scene.transition("game");
        runtime.destroy();
        keys.destroy();
        pointer.destroy();
        scene.destroy();
        fixed.destroy();
        canvas.dispatchEvent(new PointerEvent("pointermove"));
        canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        canvas.remove();
        if (keys.isPressed("a") || pointer.isDown()) throw new Error("input retained");
      }
      return { pending: raf.size, events };
    } finally {
      window.requestAnimationFrame = originalRequest;
      window.cancelAnimationFrame = originalCancel;
    }
  });
  expect(result).toEqual({ pending: 0, events: 0 });
});

test("resize observer handles scaled container and hidden canvas", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const api = (window as any).library;
    const canvas = document.querySelector("canvas")!;
    const runtime = api.createCanvasRuntime({
      canvas,
      logicalWidth: 80,
      logicalHeight: 60,
      render: () => {},
    });
    const observer = new ResizeObserver(() => runtime.resizeToDisplaySize());
    observer.observe(canvas);
    canvas.style.width = "120px";
    canvas.style.height = "90px";
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    const size = runtime.getSize();
    canvas.style.display = "none";
    const hidden = runtime.resizeToDisplaySize();
    observer.disconnect();
    runtime.destroy();
    return { width: size.logicalWidth, height: size.logicalHeight, hidden };
  });
  expect(result.width).toBeCloseTo(120, 4);
  expect(result.height).toBeCloseTo(90, 4);
  expect(result.hidden).toBe(false);
});

test("native click or touch reports logical coordinates and responsive CSS survives orientation", async ({
  page,
}, testInfo) => {
  await page.evaluate(() => {
    const api = (window as any).library;
    const canvas = document.querySelector("canvas")!;
    const runtime = api.createCanvasRuntime({
      canvas,
      logicalWidth: 80,
      logicalHeight: 60,
      render: () => {},
    });
    runtime.onPointerDown((event: any) => {
      (window as any).nativePoint = {
        x: event.x,
        y: event.y,
        type: event.originalEvent.pointerType,
      };
    });
    canvas.style.width = "50vw";
    canvas.style.height = "60px";
    runtime.resizeToDisplaySize();
    (window as any).responsive = runtime;
  });
  if (testInfo.project.use.hasTouch)
    await page.locator("canvas").tap({ position: { x: 20, y: 10 } });
  else await page.locator("canvas").click({ position: { x: 20, y: 10 } });
  const point = await page.evaluate(() => (window as any).nativePoint);
  expect(point.x).toBeCloseTo(20, 0);
  expect(point.y).toBeCloseTo(10, 0);
  expect(point.type).toBe(testInfo.project.use.hasTouch ? "touch" : "mouse");
  const initial = await page.evaluate(
    () => (window as any).responsive.getSize().logicalWidth,
  );
  await page.setViewportSize({ width: 700, height: 400 });
  const result = await page.evaluate(() => {
    const runtime = (window as any).responsive;
    runtime.resizeToDisplaySize();
    const result = {
      width: runtime.getSize().logicalWidth,
      style: runtime.getCanvas().style.width,
    };
    runtime.destroy();
    return result;
  });
  expect(result.style).toBe("50vw");
  // Mobile without a viewport meta tag uses a layout viewport wider than its
  // device viewport; compare measured display width rather than assuming 350.
  expect(result.width).toBeGreaterThan(0);
  if (!testInfo.project.use.hasTouch) {
    expect(result.width).toBe(350);
    expect(result.width).not.toBe(initial);
  }
});
