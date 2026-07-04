import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";
import type {
  GridCanvasCircleLike,
  GridCanvasCollisionTarget,
  GridCanvasRectangleLike,
} from "./types";

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

function resolveCircle(
  circle: GridCanvasCircleLike,
  name: string,
): GridCanvasCircleLike {
  const radius = resolveFinite(circle.radius, `${name}.radius`);

  if (radius < 0) {
    throw new Error(`${name}.radius must be a non-negative finite number`);
  }

  return {
    ...resolvePoint(circle, name),
    radius,
  };
}

function resolveRectangle(
  rectangle: GridCanvasRectangleLike,
  name: string,
): GridCanvasRectangleLike {
  if (rectangle === null || typeof rectangle !== "object") {
    throw new Error(
      `${name} must be an object with finite x, y, width, and height values`,
    );
  }

  const width = resolveFinite(rectangle.width, `${name}.width`);
  const height = resolveFinite(rectangle.height, `${name}.height`);

  if (width < 0 || height < 0) {
    throw new Error(
      `${name}.width and ${name}.height must be non-negative finite numbers`,
    );
  }

  return {
    x: resolveFinite(rectangle.x, `${name}.x`),
    y: resolveFinite(rectangle.y, `${name}.y`),
    width,
    height,
  };
}

function isCircleTarget(
  target: GridCanvasCollisionTarget,
): target is GridCanvasCircleLike {
  return "radius" in target;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function hitTestPoint(
  point: GridCanvasPoint,
  target: GridCanvasCollisionTarget,
): boolean {
  const resolvedPoint = resolvePoint(point, "point");

  if (isCircleTarget(target)) {
    const resolvedCircle = resolveCircle(target, "target");
    const dx = resolvedPoint.x - resolvedCircle.x;
    const dy = resolvedPoint.y - resolvedCircle.y;

    return dx * dx + dy * dy <= resolvedCircle.radius * resolvedCircle.radius;
  }

  const resolvedRectangle = resolveRectangle(target, "target");

  return (
    resolvedPoint.x >= resolvedRectangle.x &&
    resolvedPoint.x <= resolvedRectangle.x + resolvedRectangle.width &&
    resolvedPoint.y >= resolvedRectangle.y &&
    resolvedPoint.y <= resolvedRectangle.y + resolvedRectangle.height
  );
}

export function hitTestRectangle(
  a: GridCanvasRectangleLike,
  b: GridCanvasRectangleLike,
): boolean {
  const resolvedA = resolveRectangle(a, "a");
  const resolvedB = resolveRectangle(b, "b");

  return (
    resolvedA.x <= resolvedB.x + resolvedB.width &&
    resolvedA.x + resolvedA.width >= resolvedB.x &&
    resolvedA.y <= resolvedB.y + resolvedB.height &&
    resolvedA.y + resolvedA.height >= resolvedB.y
  );
}

export function hitTestCircleRectangle(
  circle: GridCanvasCircleLike,
  rectangle: GridCanvasRectangleLike,
): boolean {
  const resolvedCircle = resolveCircle(circle, "circle");
  const resolvedRectangle = resolveRectangle(rectangle, "rectangle");
  const closestX = clamp(
    resolvedCircle.x,
    resolvedRectangle.x,
    resolvedRectangle.x + resolvedRectangle.width,
  );
  const closestY = clamp(
    resolvedCircle.y,
    resolvedRectangle.y,
    resolvedRectangle.y + resolvedRectangle.height,
  );
  const dx = resolvedCircle.x - closestX;
  const dy = resolvedCircle.y - closestY;

  return dx * dx + dy * dy <= resolvedCircle.radius * resolvedCircle.radius;
}
