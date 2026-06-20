import { afterEach, describe, expect, it, vi } from "vitest";

import GridCanvasSystem from "../src";

const {
  angleToPoint,
  circlesIntersect,
  createAnimationLoop,
  createKeyTracker,
  distanceBetweenPoints,
  MassBody,
  normalizeKeyIdentifier,
  oscillate01,
  vectorFromAngle,
  wrapPoint,
} = GridCanvasSystem;

describe("runtime and utility exports", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides vector, angle, oscillation and collision helpers", () => {
    const vector = vectorFromAngle(Math.PI / 2, 10);

    expect(vector.x).toBeCloseTo(0);
    expect(vector.y).toBeCloseTo(10);
    expect(angleToPoint({ x: 0, y: 0 }, { x: 0, y: 5 })).toBeCloseTo(
      Math.PI / 2,
    );
    expect(oscillate01(0.25)).toBeCloseTo(1);
    expect(distanceBetweenPoints({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
    expect(
      circlesIntersect(
        { x: 0, y: 0, radius: 10 },
        { x: 15, y: 0, radius: 6 },
      ),
    ).toBe(true);
    expect(
      wrapPoint({ x: 120, y: 50 }, { width: 100, height: 100 }, 10),
    ).toEqual({ x: -10, y: 50 });
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
});
