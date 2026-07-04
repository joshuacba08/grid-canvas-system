import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";
import type { GridCanvasBounds, GridCanvasCircleLike } from "./types";

function resolveFinite(value: number, name: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }

  return value;
}

function resolvePoint(point: GridCanvasPoint, name: string): GridCanvasPoint {
  if (point === null || typeof point !== "object") {
    throw new Error(`${name} must be an object with finite x and y values`);
  }

  return {
    x: resolveFinite(point.x, `${name}.x`),
    y: resolveFinite(point.y, `${name}.y`),
  };
}

function resolveBounds(bounds: GridCanvasBounds): GridCanvasBounds {
  if (bounds === null || typeof bounds !== "object") {
    throw new Error("bounds must be an object with finite width and height");
  }

  const width = resolveFinite(bounds.width, "bounds.width");
  const height = resolveFinite(bounds.height, "bounds.height");

  if (width < 0 || height < 0) {
    throw new Error("bounds width and height must be non-negative");
  }

  return { width, height };
}

export function vectorFromAngle(angle: number, magnitude: number = 1): GridCanvasPoint {
  const resolvedAngle = resolveFinite(angle, "angle");
  const resolvedMagnitude = resolveFinite(magnitude, "magnitude");

  return {
    x: Math.cos(resolvedAngle) * resolvedMagnitude,
    y: Math.sin(resolvedAngle) * resolvedMagnitude,
  };
}

export function angleToPoint(from: GridCanvasPoint, to: GridCanvasPoint): number {
  const resolvedFrom = resolvePoint(from, "from");
  const resolvedTo = resolvePoint(to, "to");

  return Math.atan2(resolvedTo.y - resolvedFrom.y, resolvedTo.x - resolvedFrom.x);
}

export function oscillate01(time: number, frequency: number = 1): number {
  const resolvedTime = resolveFinite(time, "time");
  const resolvedFrequency = resolveFinite(frequency, "frequency");

  return Math.abs(Math.sin(Math.PI * 2 * resolvedFrequency * resolvedTime));
}

export function distanceBetweenPoints(a: GridCanvasPoint, b: GridCanvasPoint): number {
  const resolvedA = resolvePoint(a, "a");
  const resolvedB = resolvePoint(b, "b");

  return Math.hypot(resolvedB.x - resolvedA.x, resolvedB.y - resolvedA.y);
}

export function circlesIntersect(
  a: GridCanvasCircleLike,
  b: GridCanvasCircleLike,
): boolean {
  const resolvedA = {
    ...resolvePoint(a, "a"),
    radius: resolveFinite(a.radius, "a.radius"),
  };
  const resolvedB = {
    ...resolvePoint(b, "b"),
    radius: resolveFinite(b.radius, "b.radius"),
  };

  return (
    distanceBetweenPoints(resolvedA, resolvedB) <= resolvedA.radius + resolvedB.radius
  );
}

export function wrapPoint(
  point: GridCanvasPoint,
  bounds: GridCanvasBounds,
  radius: number = 0,
): GridCanvasPoint {
  const resolvedPoint = resolvePoint(point, "point");
  const resolvedBounds = resolveBounds(bounds);
  const resolvedRadius = resolveFinite(radius, "radius");
  let { x, y } = resolvedPoint;

  if (x - resolvedRadius > resolvedBounds.width) {
    x = -resolvedRadius;
  }

  if (x + resolvedRadius < 0) {
    x = resolvedBounds.width + resolvedRadius;
  }

  if (y - resolvedRadius > resolvedBounds.height) {
    y = -resolvedRadius;
  }

  if (y + resolvedRadius < 0) {
    y = resolvedBounds.height + resolvedRadius;
  }

  return { x, y };
}
