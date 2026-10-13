import { afterEach, describe, expect, it, vi } from "vitest";
import { createCanvas } from "@napi-rs/canvas";
import GridCanvasSystem, { RuntimeDestroyedError } from "../src";
import {
  createCanvasRuntime,
  createAnimationLoop,
  createFixedStepLoop,
  createStateMachine,
  createSceneManager,
  createSpriteAnimator,
} from "../src/runtime";

afterEach(() => vi.restoreAllMocks());

function scheduler() {
  let id = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const requestFrame = (callback: FrameRequestCallback) => {
    pending.set(++id, callback);
    return id;
  };
  const cancelFrame = (handle: number) => {
    pending.delete(handle);
  };
  const tick = (time: number) => {
    const callbacks = [...pending.values()];
    pending.clear();
    for (const callback of callbacks) callback(time);
  };
  return { requestFrame, cancelFrame, tick, pending };
}

function canvasRuntime() {
  const canvas = document.createElement("canvas");
  const backing = createCanvas(100, 80);
  const context = backing.getContext("2d");
  Object.defineProperties(canvas, {
    width: {
      get: () => backing.width,
      set: (value) => {
        backing.width = value;
      },
    },
    height: {
      get: () => backing.height,
      set: (value) => {
        backing.height = value;
      },
    },
  });
  vi.spyOn(canvas, "getContext").mockReturnValue(
    context as unknown as CanvasRenderingContext2D,
  );
  const runtime = createCanvasRuntime({
    canvas,
    logicalWidth: 100,
    logicalHeight: 80,
    pixelRatio: 1,
    render: () => {},
  });
  return { canvas, context, runtime };
}

describe("stabilization regressions", () => {
  it.each(["id", "id-options", "id-numeric", "element-options", "element-numeric"])(
    "supports the published constructor signature %s",
    (signature) => {
      const canvas = document.createElement("canvas");
      canvas.id = `contract-canvas-${signature}`;
      document.body.append(canvas);
      const context = createCanvas(80, 60).getContext("2d");
      vi.spyOn(canvas, "getContext").mockReturnValue(
        context as unknown as CanvasRenderingContext2D,
      );
      const target = signature.startsWith("id") ? canvas.id : canvas;
      const grid = signature.endsWith("numeric")
        ? new GridCanvasSystem(target, 80, 60)
        : signature === "id"
          ? new GridCanvasSystem(target)
          : new GridCanvasSystem(target, { width: 80, height: 60 });
      expect(grid.canvas).toBe(canvas);
      expect(grid.ctx).toBe(context);
      expect(grid.options.width).toBe(signature === "id" ? 400 : 80);
      expect(grid.options.height).toBe(signature === "id" ? 400 : 60);
      canvas.remove();
    },
  );

  it("delivers logical pointer up/cancel and removes their subscriptions on destruction", () => {
    const { canvas, runtime } = canvasRuntime();
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 200,
      height: 160,
    } as DOMRect);
    const up = vi.fn();
    const cancel = vi.fn();
    runtime.onPointerUp(up);
    runtime.onPointerCancel(cancel);
    const event = () => ({ clientX: 110, clientY: 100 });
    canvas.dispatchEvent(new MouseEvent("pointerup", event()));
    canvas.dispatchEvent(new MouseEvent("pointercancel", event()));
    expect(up).toHaveBeenCalledWith(expect.objectContaining({ x: 50, y: 40 }));
    expect(cancel).toHaveBeenCalledWith(expect.objectContaining({ x: 50, y: 40 }));
    runtime.destroy();
    canvas.dispatchEvent(new MouseEvent("pointerup", event()));
    canvas.dispatchEvent(new MouseEvent("pointercancel", event()));
    expect(up).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("preserves elapsed simulation time when reducing FPS and clamps the delivered delta", () => {
    const deltas: number[] = [];
    const loop = createAnimationLoop({
      ...scheduler(),
      reducedMotion: "lower-fps",
      reducedMotionFps: 15,
      windowRef: { matchMedia: () => ({ matches: true }) as MediaQueryList },
      updateMs: (dt) => deltas.push(dt),
    });
    for (let time = 0; time <= 1000; time += 10) loop.frame(time);
    expect(deltas.reduce((a, b) => a + b, 0)).toBeGreaterThanOrEqual(930);
    expect(deltas.length).toBeLessThanOrEqual(15);
    loop.destroy();
    const updateMs = vi.fn();
    const clamped = createAnimationLoop({
      ...scheduler(),
      reducedMotion: "lower-fps",
      reducedMotionFps: 15,
      maxDeltaMs: 30,
      windowRef: { matchMedia: () => ({ matches: true }) as MediaQueryList },
      updateMs,
    });
    clamped.frame(0);
    clamped.frame(70);
    expect(updateMs).toHaveBeenCalledWith(30, 70);
    clamped.destroy();
  });

  it("keeps bitmap and context state on no-op resize and rejects changes atomically", () => {
    const { context, runtime } = canvasRuntime();
    context.fillStyle = "#ff0000";
    context.fillRect(0, 0, 5, 5);
    context.globalAlpha = 0.4;
    context.translate(3, 4);
    const before = runtime.getSize();
    runtime.resize();
    expect([...context.getImageData(0, 0, 1, 1).data]).toEqual([255, 0, 0, 255]);
    expect(context.globalAlpha).toBeCloseTo(0.4, 1);
    expect(context.getTransform().e).toBe(3);
    for (const options of [
      { width: 200, height: -1 },
      { width: 200, pixelRatio: NaN },
    ]) {
      expect(() => runtime.resize(options)).toThrow();
      expect(runtime.getSize()).toEqual(before);
    }
    runtime.destroy();
  });

  it("detects fractional DPR changes even when the rounded bitmap size stays the same", () => {
    const { canvas, context, runtime } = canvasRuntime();
    const descriptor = Object.getOwnPropertyDescriptor(window, "devicePixelRatio")!;
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: 1,
      height: 1,
    } as DOMRect);
    try {
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        value: 1,
      });
      runtime.resize({ width: 1, height: 1, pixelRatio: "auto" });
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        value: 1.25,
      });
      expect(runtime.resizeToDisplaySize()).toBe(true);
      expect(runtime.getSize().bufferWidth).toBe(1);
      expect(runtime.getSize().pixelRatio).toBe(1.25);
      expect(context.getTransform().a).toBe(1.25);
    } finally {
      Object.defineProperty(window, "devicePixelRatio", descriptor);
      runtime.destroy();
    }
  });

  it("rejects non-finite display sizes without applying partial changes", () => {
    const { canvas, runtime } = canvasRuntime();
    const before = runtime.getSize();
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: NaN,
      height: 80,
    } as DOMRect);
    expect(() => runtime.resizeToDisplaySize()).toThrow("display width");
    expect(runtime.getSize()).toEqual(before);
    runtime.destroy();
  });

  it("restores context after render throws", () => {
    const canvas = document.createElement("canvas");
    const context = createCanvas(20, 20).getContext("2d");
    vi.spyOn(canvas, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const runtime = createCanvasRuntime({
      canvas,
      logicalWidth: 20,
      logicalHeight: 20,
      render: (ctx) => {
        ctx.translate(5, 5);
        throw new Error("render");
      },
    });
    expect(() => runtime.renderOnce()).toThrow("render");
    expect(context.getTransform().e).toBe(0);
    runtime.destroy();
  });

  it.each([
    createAnimationLoop,
    (options: Parameters<typeof createAnimationLoop>[0]) =>
      createFixedStepLoop({ ...options, step: 0.01 }),
  ])("stops callbacks and RAF when destroyed inside update", (factory) => {
    const frames = scheduler();
    const draw = vi.fn();
    const loop = factory({ ...frames, update: () => loop.destroy(), draw });
    loop.start();
    frames.tick(0);
    frames.tick(50);
    expect(loop.isDestroyed()).toBe(true);
    expect(frames.pending.size).toBe(0);
    expect(() => loop.start()).toThrow(RuntimeDestroyedError);
    loop.destroy();
    expect(draw.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("stops scheduling after callback failures", () => {
    const frames = scheduler();
    const loop = createAnimationLoop({
      ...frames,
      update: () => {
        throw new Error("update");
      },
    });
    loop.start();
    expect(() => frames.tick(0)).toThrow("update");
    expect(loop.isRunning()).toBe(false);
    expect(frames.pending.size).toBe(0);
    loop.destroy();
  });

  it("clears keyboard state on focus loss and removes blur handlers", () => {
    const canvas = document.createElement("canvas");
    const tracker = GridCanvasSystem.runtime.createKeyTracker(canvas);
    canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    window.dispatchEvent(new Event("blur"));
    expect(tracker.isPressed("ArrowLeft")).toBe(false);
    canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    canvas.dispatchEvent(new Event("blur"));
    expect(tracker.pressedKeys.size).toBe(0);
    tracker.destroy();
    tracker.destroy();
    canvas.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    expect(tracker.pressedKeys.size).toBe(0);
  });

  it("rejects nested state transitions and records committed state when enter fails", () => {
    let nested: boolean | undefined;
    const machine = createStateMachine({
      initial: "idle",
      transitions: { idle: ["active"], active: ["idle"] },
      historyLimit: 2,
      states: {
        idle: {
          onExit: () => {
            nested = machine.transition("active");
          },
        },
        active: {
          onEnter: () => {
            throw new Error("enter");
          },
        },
      },
    });
    expect(() => machine.transition("active")).toThrow("enter");
    expect(nested).toBe(false);
    expect(machine.getState()).toBe("active");
    expect(machine.getHistory()).toHaveLength(1);
    machine.reset();
    machine.destroy();
  });

  it("leaves state unchanged if exit fails and accepts transitions after the failure", () => {
    const exit = vi.fn().mockImplementationOnce(() => {
      throw new Error("exit");
    });
    const manager = createSceneManager({
      initial: "menu",
      scenes: { menu: { exit }, game: {} },
    });
    expect(() => manager.transition("game")).toThrow("exit");
    expect(manager.getSceneId()).toBe("menu");
    expect(manager.transition("game")).toBe(true);
    manager.destroy();
    manager.destroy();
    expect(manager.isDestroyed()).toBe(true);
    expect(() => manager.update(0)).toThrow(RuntimeDestroyedError);
  });

  it("does not repeat exit or enter the next scene when destroyed inside exit", () => {
    const enter = vi.fn();
    const exit = vi.fn(() => manager.destroy());
    const manager = createSceneManager({
      initial: "menu",
      scenes: { menu: { exit }, game: { enter } },
    });
    manager.transition("game");
    manager.destroy();
    expect(exit).toHaveBeenCalledExactlyOnceWith("game");
    expect(enter).not.toHaveBeenCalled();
    expect(manager.getSceneId()).toBe("menu");
    expect(manager.isDestroyed()).toBe(true);
  });

  it("does not complete a replacement animation after a frame subscriber switches playback", () => {
    const animator = createSpriteAnimator({
      initial: "once",
      animations: { once: { frames: ["a", "b"], fps: 10, loop: false }, idle: ["c"] },
    });
    const complete = vi.fn();
    animator.onComplete(complete);
    animator.subscribe((event) => {
      if (event.type === "frame") animator.play("idle");
    });
    animator.update(0.1);
    expect(animator.getAnimation()).toBe("idle");
    expect(animator.isPlaying()).toBe(true);
    expect(complete).not.toHaveBeenCalled();
    animator.destroy();
  });

  it("validates Unicode sprite geometry and compiled pixels outside bounds", () => {
    const sprite = GridCanvasSystem.compilePixelSprite(["🟦a", "aa"], {
      "🟦": "#00f",
      a: "#fff",
    });
    expect(sprite.width).toBe(2);
    expect(() =>
      GridCanvasSystem.getPixelSpriteBounds(
        { width: 1, height: 1, pixels: [{ column: 1, row: 0, color: "#fff" }] },
        { x: 0, y: 0, pixelSize: 1 },
      ),
    ).toThrow();
  });

  it("detects sub-micro tile rectangles and handles enormous outside bounds promptly", () => {
    expect(
      GridCanvasSystem.runtime.hitTestTileMap(
        { x: 0, y: 0, width: 1e-8, height: 1e-8 },
        ["1"],
        ["1"],
        { tileSize: 1 },
      ),
    ).toBe(true);
    expect(
      GridCanvasSystem.runtime.hitTestTileMap(
        { x: -1e12, y: -1e12, width: 2e12, height: 2e12 },
        ["1"],
        ["1"],
        { tileSize: 1 },
      ),
    ).toBe(true);
  });

  it("preserves grid, flip and collision properties across deterministic inputs", () => {
    const api = GridCanvasSystem.runtime;
    for (let index = -50; index <= 50; index++) {
      const cell = { column: index, row: index === 0 ? 0 : -index };
      const options = { cellSize: 4, origin: { x: -8, y: 12 } };
      expect(api.canvasToGrid(api.gridToCanvas(cell, options), options)).toEqual(cell);
      const a = { x: index, y: 0, width: 4, height: 3 };
      const b = { x: -index, y: 1, width: 8, height: 2 };
      expect(api.hitTestRectangle(a, b)).toBe(api.hitTestRectangle(b, a));
      const sprite = ["🟦ab", "ba🟦"];
      expect(
        GridCanvasSystem.flipPixelSpriteX(GridCanvasSystem.flipPixelSpriteX(sprite)),
      ).toEqual(sprite);
      expect(
        GridCanvasSystem.flipPixelSpriteY(GridCanvasSystem.flipPixelSpriteY(sprite)),
      ).toEqual(sprite);
    }
    expect(() =>
      api.circlesIntersect({ x: 0, y: 0, radius: -1 }, { x: 0, y: 0, radius: 2 }),
    ).toThrow();
  });

  it("leaves no frames or input callbacks after 100 lifecycles", () => {
    const frames = scheduler();
    for (let index = 0; index < 100; index++) {
      const loop = createAnimationLoop({ ...frames });
      const fixed = createFixedStepLoop({ ...frames, step: 1 / 60 });
      const { canvas, runtime } = canvasRuntime();
      const pointer = vi.fn();
      runtime.onPointerMove(pointer);
      loop.start();
      fixed.start();
      loop.destroy();
      fixed.destroy();
      runtime.destroy();
      canvas.dispatchEvent(new MouseEvent("pointermove", { clientX: 1, clientY: 1 }));
      expect(pointer).not.toHaveBeenCalled();
      expect(frames.pending.size).toBe(0);
    }
  });

  it("validates every tile and shape option before drawing any pixels", () => {
    const canvas = document.createElement("canvas");
    const context = createCanvas(40, 40).getContext("2d");
    vi.spyOn(canvas, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    const grid = new GridCanvasSystem(canvas, {
      width: 40,
      height: 40,
      devicePixelRatio: 1,
    });
    context.clearRect(0, 0, 40, 40);
    const operations = [
      () =>
        grid.drawCircleSector({ x: 10, y: 10 }, 8, 0, Math.PI, {
          strokeColor: "#fff",
          lineWidth: -1,
        }),
      () =>
        grid.drawShip({ x: 20, y: 20 }, 8, {
          guide: true,
          thruster: true,
          lineWidth: -1,
        }),
      () => grid.drawProjectile({ x: 20, y: 20 }, 8, 1, { guide: true, lineWidth: -1 }),
      () =>
        GridCanvasSystem.runtime.drawTileMap(
          ["ab"],
          { a: "#f00", b: ["x"] },
          { grid, tileSize: 10, palette: {} },
        ),
    ];
    for (const operation of operations) {
      expect(operation).toThrow();
      expect(
        [...context.getImageData(0, 0, 40, 40).data].some((value) => value !== 0),
      ).toBe(false);
    }
  });

  it("keeps MassBody unchanged when wrap bounds are invalid", () => {
    const body = new GridCanvasSystem.runtime.MassBody({ x: 1, y: 2, xSpeed: 4 });
    expect(() => body.update(1, { width: -1, height: 10 })).toThrow();
    expect(body.x).toBe(1);
    expect(body.y).toBe(2);
  });

  it("pointer tracker supports explicit logical coordinates and resets after capture loss", () => {
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 10,
      top: 20,
      width: 200,
      height: 100,
    } as DOMRect);
    const tracker = GridCanvasSystem.runtime.createPointerTracker(canvas, {
      logicalWidth: 100,
      logicalHeight: 50,
    });
    canvas.dispatchEvent(new MouseEvent("pointerdown", { clientX: 110, clientY: 70 }));
    expect(tracker.position()).toEqual({ x: 50, y: 25 });
    canvas.dispatchEvent(new Event("lostpointercapture"));
    expect(tracker.isDown()).toBe(false);
    window.dispatchEvent(new Event("blur"));
    expect(tracker.position()).toBeNull();
    tracker.destroy();
  });
});
