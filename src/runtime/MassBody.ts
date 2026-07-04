import { wrapPoint } from "./motion";
import type { GridCanvasBounds } from "./types";

export interface GridCanvasMassBodyOptions {
  x?: number;
  y?: number;
  mass?: number;
  radius?: number;
  angle?: number;
  xSpeed?: number;
  ySpeed?: number;
  rotationSpeed?: number;
}

function resolveFinite(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const resolvedValue = value ?? fallback;

  if (!Number.isFinite(resolvedValue)) {
    throw new Error(`${name} must be a finite number`);
  }

  return resolvedValue;
}

function resolvePositive(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const resolvedValue = value ?? fallback;

  if (!Number.isFinite(resolvedValue) || resolvedValue <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }

  return resolvedValue;
}

function normalizeAngle(angle: number): number {
  const fullTurn = Math.PI * 2;
  const normalized = angle % fullTurn;

  return normalized < 0 ? normalized + fullTurn : normalized;
}

export class MassBody {
  x: number;
  y: number;
  mass: number;
  radius: number;
  angle: number;
  xSpeed: number;
  ySpeed: number;
  rotationSpeed: number;

  constructor(options?: GridCanvasMassBodyOptions) {
    this.x = resolveFinite(options?.x, 0, "x");
    this.y = resolveFinite(options?.y, 0, "y");
    this.mass = resolvePositive(options?.mass, 1, "mass");
    this.radius = resolvePositive(options?.radius, 50, "radius");
    this.angle = normalizeAngle(resolveFinite(options?.angle, 0, "angle"));
    this.xSpeed = resolveFinite(options?.xSpeed, 0, "xSpeed");
    this.ySpeed = resolveFinite(options?.ySpeed, 0, "ySpeed");
    this.rotationSpeed = resolveFinite(options?.rotationSpeed, 0, "rotationSpeed");
  }

  update(elapsed: number, bounds?: GridCanvasBounds): void {
    const resolvedElapsed = resolveFinite(elapsed, 0, "elapsed");

    this.x += this.xSpeed * resolvedElapsed;
    this.y += this.ySpeed * resolvedElapsed;
    this.angle = normalizeAngle(this.angle + this.rotationSpeed * resolvedElapsed);

    if (bounds !== undefined) {
      const wrapped = wrapPoint({ x: this.x, y: this.y }, bounds, this.radius);

      this.x = wrapped.x;
      this.y = wrapped.y;
    }
  }

  push(angle: number, force: number, elapsed: number): void {
    const resolvedAngle = resolveFinite(angle, 0, "angle");
    const resolvedForce = resolveFinite(force, 0, "force");
    const resolvedElapsed = resolveFinite(elapsed, 0, "elapsed");

    this.xSpeed +=
      (resolvedElapsed * Math.cos(resolvedAngle) * resolvedForce) / this.mass;
    this.ySpeed +=
      (resolvedElapsed * Math.sin(resolvedAngle) * resolvedForce) / this.mass;
  }

  twist(force: number, elapsed: number): void {
    const resolvedForce = resolveFinite(force, 0, "force");
    const resolvedElapsed = resolveFinite(elapsed, 0, "elapsed");

    this.rotationSpeed += (resolvedElapsed * resolvedForce) / this.mass;
  }

  speed(): number {
    return Math.hypot(this.xSpeed, this.ySpeed);
  }

  movementAngle(): number {
    return Math.atan2(this.ySpeed, this.xSpeed);
  }
}
