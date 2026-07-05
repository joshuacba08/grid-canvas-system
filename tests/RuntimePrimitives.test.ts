import { afterEach, describe, expect, it, vi } from "vitest";

import GridCanvasSystem from "../src";

const runtime = GridCanvasSystem.runtime;
const {
  angleToPoint,
  appendTrailPoint,
  canvasToGrid,
  circlesIntersect,
  createAnimationLoop,
  createKeyTracker,
  createParticleBurst,
  createPointerTracker,
  createSpriteAnimator,
  createStateMachine,
  distanceBetweenPoints,
  gridToCanvas,
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
  layoutStack,
  MassBody,
  normalizeKeyIdentifier,
  oscillate01,
  snapPointToGrid,
  stepParticles,
  vectorFromAngle,
  wrapPoint,
} = GridCanvasSystem;

describe("runtime and utility exports", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("groups the optional runtime layer under GridCanvasSystem.runtime without breaking direct aliases", () => {
    expect(runtime.createAnimationLoop).toBe(createAnimationLoop);
    expect(runtime.createKeyTracker).toBe(createKeyTracker);
    expect(runtime.createPointerTracker).toBe(createPointerTracker);
    expect(runtime.appendTrailPoint).toBe(appendTrailPoint);
    expect(runtime.createParticleBurst).toBe(createParticleBurst);
    expect(runtime.createSpriteAnimator).toBe(createSpriteAnimator);
    expect(runtime.createStateMachine).toBe(createStateMachine);
    expect(runtime.canvasToGrid).toBe(canvasToGrid);
    expect(runtime.gridToCanvas).toBe(gridToCanvas);
    expect(runtime.snapPointToGrid).toBe(snapPointToGrid);
    expect(runtime.hitTestPoint).toBe(hitTestPoint);
    expect(runtime.hitTestRectangle).toBe(hitTestRectangle);
    expect(runtime.hitTestCircleRectangle).toBe(hitTestCircleRectangle);
    expect(runtime.layoutStack).toBe(layoutStack);
    expect(runtime.MassBody).toBe(MassBody);
    expect(runtime.stepParticles).toBe(stepParticles);
    expect(runtime.wrapPoint).toBe(wrapPoint);
    expect(runtime.createFixedStepLoop).toBeTypeOf("function");
    expect(runtime.createSceneManager).toBeTypeOf("function");
    expect(runtime.drawTileMap).toBeTypeOf("function");
    expect(
      Object.prototype.hasOwnProperty.call(GridCanvasSystem, "createFixedStepLoop"),
    ).toBe(false);
    expect(
      Object.prototype.hasOwnProperty.call(GridCanvasSystem, "createSceneManager"),
    ).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(GridCanvasSystem, "drawTileMap")).toBe(
      false,
    );
  });

  it("provides vector, angle, oscillation and collision helpers", () => {
    const vector = vectorFromAngle(Math.PI / 2, 10);

    expect(vector.x).toBeCloseTo(0);
    expect(vector.y).toBeCloseTo(10);
    expect(angleToPoint({ x: 0, y: 0 }, { x: 0, y: 5 })).toBeCloseTo(Math.PI / 2);
    expect(oscillate01(0.25)).toBeCloseTo(1);
    expect(distanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(
      circlesIntersect({ x: 0, y: 0, radius: 10 }, { x: 15, y: 0, radius: 6 }),
    ).toBe(true);
    expect(wrapPoint({ x: 120, y: 50 }, { width: 100, height: 100 }, 10)).toEqual({
      x: -10,
      y: 50,
    });
  });

  it("converts between absolute canvas points and grid cells", () => {
    const options = {
      cellSize: 16,
      origin: { x: 8, y: 4 },
    };

    expect(canvasToGrid({ x: 40, y: 36 }, options)).toEqual({
      column: 2,
      row: 2,
    });
    expect(canvasToGrid({ x: 7, y: 3 }, options)).toEqual({
      column: -1,
      row: -1,
    });
    expect(gridToCanvas({ column: 3, row: 2 }, options)).toEqual({
      x: 56,
      y: 36,
    });
    expect(snapPointToGrid({ x: 47, y: 42 }, options)).toEqual({
      x: 40,
      y: 36,
    });
    expect(() => canvasToGrid({ x: 0, y: 0 }, { cellSize: 0 })).toThrow(
      "cellSize must be a positive finite number",
    );
    expect(() => gridToCanvas({ column: 0.5, row: 0 }, { cellSize: 16 })).toThrow(
      "cell.column must be an integer",
    );
  });

  it("createSpriteAnimator advances frames, plays known animations and rejects missing animations", () => {
    const animator = createSpriteAnimator({
      animations: {
        idle: ["idle-1", "idle-2", "idle-3"],
        happy: ["happy-1"],
      },
      initial: "idle",
      fps: 2,
    });

    expect(animator.getCurrentAnimation()).toBe("idle");
    expect(animator.getFrame()).toBe("idle-1");

    animator.update(0.49);
    expect(animator.getFrame()).toBe("idle-1");

    animator.update(0.01);
    expect(animator.getFrame()).toBe("idle-2");

    animator.update(1);
    expect(animator.getFrame()).toBe("idle-1");
    expect(animator.play("missing")).toBe(false);
    expect(animator.getCurrentAnimation()).toBe("idle");
    expect(animator.play("happy")).toBe(true);
    expect(animator.getCurrentAnimation()).toBe("happy");
    expect(animator.getFrame()).toBe("happy-1");

    animator.reset();
    expect(animator.getCurrentAnimation()).toBe("idle");
    expect(animator.getFrame()).toBe("idle-1");

    const oneShot = createSpriteAnimator({
      animations: {
        burst: ["burst-1", "burst-2"],
      },
      initial: "burst",
      fps: 1,
      loop: false,
    });

    oneShot.update(10);
    expect(oneShot.getFrame()).toBe("burst-2");
    expect(() =>
      createSpriteAnimator({
        animations: {
          idle: ["idle-1"],
        },
        initial: "missing",
        fps: 1,
      }),
    ).toThrow("initial must reference an existing animation");
  });

  it("createStateMachine exposes simple transition checks, transitions and reset", () => {
    const machine = createStateMachine({
      initial: "idle",
      transitions: {
        idle: ["happy", "hungry"],
        happy: ["idle"],
        hungry: ["idle"],
      },
    });

    expect(machine.getState()).toBe("idle");
    expect(machine.canTransition("happy")).toBe(true);
    expect(machine.canTransition("sleeping")).toBe(false);
    expect(machine.transition("sleeping")).toBe(false);
    expect(machine.getState()).toBe("idle");
    expect(machine.transition("happy")).toBe(true);
    expect(machine.getState()).toBe("happy");
    expect(machine.canTransition("hungry")).toBe(false);

    machine.reset();
    expect(machine.getState()).toBe("idle");
    expect(() =>
      createStateMachine({
        initial: "missing",
        transitions: {
          idle: [],
        },
      }),
    ).toThrow("initial must reference an existing state");
  });

  it("provides minimal point, rectangle, and circle-rectangle collision helpers", () => {
    expect(
      hitTestPoint({ x: 15, y: 15 }, { x: 10, y: 10, width: 20, height: 20 }),
    ).toBe(true);
    expect(
      hitTestPoint({ x: 35, y: 35 }, { x: 10, y: 10, width: 20, height: 20 }),
    ).toBe(false);
    expect(hitTestPoint({ x: 8, y: 5 }, { x: 5, y: 5, radius: 3 })).toBe(true);
    expect(
      hitTestRectangle(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 4, width: 8, height: 8 },
      ),
    ).toBe(true);
    expect(
      hitTestRectangle(
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 11, y: 0, width: 8, height: 8 },
      ),
    ).toBe(false);
    expect(
      hitTestCircleRectangle(
        { x: 15, y: 15, radius: 5 },
        { x: 20, y: 10, width: 12, height: 12 },
      ),
    ).toBe(true);
    expect(
      hitTestCircleRectangle(
        { x: 4, y: 4, radius: 2 },
        { x: 20, y: 10, width: 12, height: 12 },
      ),
    ).toBe(false);
  });

  it("provides simple trail, particle and overlay layout helpers", () => {
    expect(
      appendTrailPoint(
        [
          { x: 0, y: 0 },
          { x: 10, y: 10 },
        ],
        { x: 20, y: 20 },
        2,
      ),
    ).toEqual([
      { x: 10, y: 10 },
      { x: 20, y: 20 },
    ]);

    const burst = createParticleBurst({ x: 5, y: 6 }, 2, {
      angle: Math.PI / 2,
      spread: 0,
      speed: 10,
      life: 1,
      size: 3,
      random: () => 0.5,
    });

    expect(burst).toHaveLength(2);
    expect(burst[0].x).toBe(5);
    expect(burst[0].y).toBe(6);
    expect(burst[0].xSpeed).toBeCloseTo(0);
    expect(burst[0].ySpeed).toBeCloseTo(10);
    expect(burst[0].life).toBe(1);
    expect(burst[0].maxLife).toBe(1);
    expect(burst[0].size).toBe(3);

    const steppedParticles = stepParticles(burst, 0.25, {
      gravityY: 8,
      drag: 0.2,
    });

    expect(steppedParticles).toHaveLength(2);
    expect(steppedParticles[0].x).toBeCloseTo(5);
    expect(steppedParticles[0].y).toBeCloseTo(8.85);
    expect(steppedParticles[0].xSpeed).toBeCloseTo(0);
    expect(steppedParticles[0].ySpeed).toBeCloseTo(11.4);
    expect(steppedParticles[0].life).toBeCloseTo(0.75);
    expect(steppedParticles[0].maxLife).toBe(1);
    expect(steppedParticles[0].size).toBe(3);

    expect(
      layoutStack(
        { x: 100, y: 12 },
        [
          { width: 80, height: 16 },
          { width: 40, height: 12 },
        ],
        {
          gap: 6,
          align: "end",
        },
      ),
    ).toEqual([
      { x: 20, y: 12 },
      { x: 60, y: 34 },
    ]);
  });

  it("MassBody updates, wraps and responds to push/twist forces", () => {
    const body = new MassBody({
      x: 96,
      y: 20,
      mass: 10,
      radius: 5,
      angle: 0,
      xSpeed: 20,
      ySpeed: 0,
      rotationSpeed: Math.PI,
    });

    body.update(0.5, { width: 100, height: 100 });

    expect(body.x).toBe(-5);
    expect(body.y).toBe(20);
    expect(body.angle).toBeCloseTo(Math.PI / 2);

    body.push(Math.PI / 2, 20, 1);
    body.twist(5, 2);

    expect(body.xSpeed).toBeCloseTo(20);
    expect(body.ySpeed).toBeCloseTo(2);
    expect(body.rotationSpeed).toBeCloseTo(Math.PI + 1);
    expect(body.speed()).toBeCloseTo(Math.hypot(20, 2));
    expect(body.movementAngle()).toBeCloseTo(Math.atan2(2, 20));
  });

  it("createAnimationLoop schedules frames with elapsed seconds and supports stop/reset", () => {
    const update = vi.fn();
    const draw = vi.fn();
    const callbacks: FrameRequestCallback[] = [];
    const cancelled: number[] = [];
    let nextHandle = 1;

    const loop = createAnimationLoop({
      update,
      draw,
      requestFrame: (callback) => {
        callbacks.push(callback);

        return nextHandle++;
      },
      cancelFrame: (handle) => {
        cancelled.push(handle);
      },
    });

    expect(loop.isRunning()).toBe(false);

    loop.start();

    expect(loop.isRunning()).toBe(true);
    expect(callbacks).toHaveLength(1);

    callbacks.shift()?.(1000);

    expect(update).toHaveBeenNthCalledWith(1, 0, 1000);
    expect(draw).toHaveBeenNthCalledWith(1, 0, 1000);
    expect(callbacks).toHaveLength(1);

    callbacks.shift()?.(1016);

    expect(update).toHaveBeenNthCalledWith(2, 0.016, 1016);
    expect(draw).toHaveBeenNthCalledWith(2, 0.016, 1016);

    loop.stop();

    expect(loop.isRunning()).toBe(false);
    expect(cancelled).toEqual([3]);

    loop.reset();
    loop.frame(2000);

    expect(update).toHaveBeenNthCalledWith(3, 0, 2000);
  });

  it("createAnimationLoop can clamp large elapsed values", () => {
    const update = vi.fn();
    const loop = createAnimationLoop({
      maxElapsed: 0.1,
      update,
      requestFrame: () => 1,
      cancelFrame: () => {},
    });

    loop.frame(0);
    loop.frame(5000);

    expect(update).toHaveBeenNthCalledWith(2, 0.1, 5000);
  });

  it("createFixedStepLoop runs deterministic updates and exposes interpolation alpha", () => {
    const updates: number[] = [];
    const draws: number[] = [];
    const loop = runtime.createFixedStepLoop({
      draw: (alpha) => draws.push(alpha),
      maxUpdatesPerFrame: 3,
      requestFrame: vi.fn(() => 1),
      step: 1 / 60,
      update: (step) => updates.push(step),
    });

    loop.frame(0);
    loop.frame(1000 / 60);
    loop.frame(1000 / 60 + 1000 / 120);

    expect(updates).toEqual([1 / 60]);
    expect(draws[0]).toBe(0);
    expect(draws[1]).toBe(0);
    expect(draws[2]).toBeCloseTo(0.5);
    expect(() =>
      runtime.createFixedStepLoop({
        step: 0,
      }),
    ).toThrow("step must be a positive finite number");
  });

  it("createFixedStepLoop caps updates and carries the sub-step remainder", () => {
    const updates: number[] = [];
    const draws: number[] = [];
    const step = 1 / 60;
    const loop = runtime.createFixedStepLoop({
      draw: (alpha) => draws.push(alpha),
      maxUpdatesPerFrame: 3,
      requestFrame: vi.fn(() => 1),
      step,
      update: () => updates.push(step),
    });

    loop.frame(0);
    // A huge frame gap: 5 whole steps plus a 0.5-step remainder in seconds.
    loop.frame(step * 5.5 * 1000);

    // Updates are capped at maxUpdatesPerFrame instead of spiralling.
    expect(updates).toHaveLength(3);
    // The remainder is preserved, so alpha is not pinned to 1.
    expect(draws[1]).toBeCloseTo(0.5);

    // The next frame with no elapsed time must not run a banked extra update.
    loop.frame(step * 5.5 * 1000);
    expect(updates).toHaveLength(3);
    expect(draws[2]).toBeCloseTo(0.5);
  });

  it("createSceneManager transitions, updates and draws small scene flows", () => {
    const events: string[] = [];
    const manager = runtime.createSceneManager<string>({
      initial: "menu",
      scenes: {
        game: {
          draw: (context) => events.push(`draw:${context}`),
          enter: (previous) => events.push(`enter-game:${previous}`),
          exit: (next) => events.push(`exit-game:${next}`),
          update: (elapsed) => events.push(`update:${elapsed}`),
        },
        menu: {
          enter: (previous) => events.push(`enter-menu:${previous}`),
          exit: (next) => events.push(`exit-menu:${next}`),
        },
      },
    });

    expect(manager.getSceneId()).toBe("menu");
    expect(manager.transition("game")).toBe(true);
    manager.update(0.25);
    manager.draw("canvas");
    expect(manager.transition("missing")).toBe(false);
    manager.reset();

    expect(events).toEqual([
      "enter-menu:null",
      "exit-menu:game",
      "enter-game:menu",
      "update:0.25",
      "draw:canvas",
      "exit-game:menu",
      "enter-menu:game",
    ]);
  });

  it("tilemap helpers read, write, bound, draw and hit-test simple maps", () => {
    const map = ["111", "102", "111"] as const;
    const ctx = {
      fillRect: vi.fn(),
      fillStyle: "",
      restore: vi.fn(),
      save: vi.fn(),
    };
    const grid = {
      ctx,
      drawCompiledPixelSprite: vi.fn(),
      drawPixelSprite: vi.fn(),
    };

    expect(
      runtime.getTileAt({ x: 33, y: 17 }, map, {
        tileSize: 16,
      }),
    ).toBe("2");
    expect(runtime.setTileAt(map, { column: 1, row: 1 }, "9")).toEqual([
      "111",
      "192",
      "111",
    ]);
    expect(
      runtime.tileToBounds(
        { column: 2, row: 1 },
        {
          origin: { x: 4, y: 8 },
          tileSize: 16,
        },
      ),
    ).toEqual({ x: 36, y: 24, width: 16, height: 16 });
    expect(
      runtime.hitTestTileMap({ x: 2, y: 2, width: 12, height: 12 }, map, ["1"], {
        tileSize: 16,
      }),
    ).toBe(true);
    runtime.drawTileMap(
      map,
      {
        "1": "#123456",
        "2": ["1"],
      },
      {
        grid,
        palette: { "1": "#abcdef" },
        tileSize: 16,
      },
    );

    expect(ctx.fillRect).toHaveBeenCalled();
    expect(grid.drawPixelSprite).toHaveBeenCalledWith(["1"], {
      opacity: undefined,
      palette: { "1": "#abcdef" },
      pixelSize: 16,
      x: 32,
      y: 16,
    });
  });

  it("drawTileMap fits non-square sprites inside the tile", () => {
    const ctx = {
      fillRect: vi.fn(),
      fillStyle: "",
      restore: vi.fn(),
      save: vi.fn(),
    };
    const grid = {
      ctx,
      drawCompiledPixelSprite: vi.fn(),
      drawPixelSprite: vi.fn(),
    };
    // A 2-wide, 4-tall compiled sprite rendered into a 16px tile: width would
    // suggest pixelSize 8, but height must clamp it to 4 so it never overflows.
    const tallSprite = {
      height: 4,
      pixels: [{ color: "#ffffff", column: 0, row: 0 }],
      width: 2,
    };

    runtime.drawTileMap(["A"], { A: tallSprite }, { grid, tileSize: 16 });

    expect(grid.drawCompiledPixelSprite).toHaveBeenCalledWith(tallSprite, {
      opacity: undefined,
      pixelSize: 4,
      x: 0,
      y: 0,
    });
  });

  it("createKeyTracker tracks pressed keys and prevents default only for configured keys", () => {
    document.body.innerHTML = '<canvas id="canvas"></canvas>';
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const focusSpy = vi.spyOn(canvas, "focus");
    const tracker = createKeyTracker(canvas, {
      autoFocus: true,
      preventDefaultKeys: ["ArrowLeft", 32],
    });
    const leftDown = new KeyboardEvent("keydown", {
      key: "ArrowLeft",
      cancelable: true,
    });
    const leftUp = new KeyboardEvent("keyup", {
      key: "ArrowLeft",
      cancelable: true,
    });
    const letterDown = new KeyboardEvent("keydown", {
      key: "a",
      cancelable: true,
    });

    canvas.dispatchEvent(leftDown);

    expect(focusSpy).toHaveBeenCalledTimes(1);
    expect(canvas.tabIndex).toBe(0);
    expect(tracker.isPressed("ArrowLeft")).toBe(true);
    expect(leftDown.defaultPrevented).toBe(true);
    expect(normalizeKeyIdentifier(37)).toBe("ArrowLeft");

    canvas.dispatchEvent(letterDown);

    expect(tracker.isPressed("a")).toBe(true);
    expect(letterDown.defaultPrevented).toBe(false);

    canvas.dispatchEvent(leftUp);

    expect(tracker.isPressed("ArrowLeft")).toBe(false);
    tracker.destroy();
    expect(tracker.pressedKeys.size).toBe(0);
  });

  it("createPointerTracker tracks relative pointer position and can clean up listeners", () => {
    document.body.innerHTML = '<canvas id="canvas"></canvas>';
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;

    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      bottom: 120,
      height: 100,
      left: 10,
      right: 210,
      top: 20,
      width: 200,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    } as DOMRect);

    const tracker = createPointerTracker(canvas, {
      preventDefault: true,
    });
    const pointerdown = new MouseEvent("pointerdown", {
      cancelable: true,
      clientX: 25,
      clientY: 45,
    });
    const pointermove = new MouseEvent("pointermove", {
      cancelable: true,
      clientX: 30,
      clientY: 50,
    });
    const pointerup = new MouseEvent("pointerup", {
      cancelable: true,
      clientX: 32,
      clientY: 54,
    });

    expect(tracker.position()).toBeNull();

    canvas.dispatchEvent(pointerdown);

    expect(tracker.isDown()).toBe(true);
    expect(tracker.position()).toEqual({ x: 15, y: 25 });
    expect(pointerdown.defaultPrevented).toBe(true);

    canvas.dispatchEvent(pointermove);

    expect(tracker.position()).toEqual({ x: 20, y: 30 });
    expect(pointermove.defaultPrevented).toBe(true);

    const copy = tracker.position();

    if (copy !== null) {
      copy.x = 999;
    }

    expect(tracker.position()).toEqual({ x: 20, y: 30 });

    canvas.dispatchEvent(pointerup);

    expect(tracker.isDown()).toBe(false);
    expect(tracker.position()).toEqual({ x: 22, y: 34 });

    tracker.destroy();

    expect(tracker.isDown()).toBe(false);
    expect(tracker.position()).toBeNull();

    canvas.dispatchEvent(
      new MouseEvent("pointerdown", {
        clientX: 80,
        clientY: 80,
      }),
    );

    expect(tracker.isDown()).toBe(false);
    expect(tracker.position()).toBeNull();
  });
});
