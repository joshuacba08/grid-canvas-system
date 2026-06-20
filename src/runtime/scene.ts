import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";
import { vectorFromAngle } from "./motion";
import type {
  GridCanvasParticle,
  GridCanvasParticleBurstOptions,
  GridCanvasParticleStepOptions,
  GridCanvasSize,
  GridCanvasStackAlign,
  GridCanvasStackDirection,
  GridCanvasStackLayoutOptions,
} from "./types";

const DEFAULT_PARTICLE_SPEED = 80;
const DEFAULT_PARTICLE_LIFE = 0.6;
const DEFAULT_PARTICLE_SIZE = 2;

function resolveFiniteNumber(
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

function resolveNonNegativeNumber(
  value: number | undefined,
  fallback: number,
  name: string,
): number {
  const resolvedValue = resolveFiniteNumber(value, fallback, name);

  if (resolvedValue < 0) {
    throw new Error(`${name} must be greater than or equal to 0`);
  }

  return resolvedValue;
}

function resolveInteger(
  value: number,
  minimum: number,
  name: string,
): number {
  if (!Number.isInteger(value) || value < minimum) {
    throw new Error(`${name} must be an integer greater than or equal to ${minimum}`);
  }

  return value;
}

function resolvePoint(
  point: GridCanvasPoint,
  name: string,
): GridCanvasPoint {
  return {
    x: resolveFiniteNumber(point.x, 0, `${name}.x`),
    y: resolveFiniteNumber(point.y, 0, `${name}.y`),
  };
}

function resolveSize(
  size: GridCanvasSize,
  name: string,
): GridCanvasSize {
  return {
    width: resolveNonNegativeNumber(size.width, 0, `${name}.width`),
    height: resolveNonNegativeNumber(size.height, 0, `${name}.height`),
  };
}

function resolveRandomValue(
  random: () => number,
): number {
  const value = random();

  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error("random must return a finite number between 0 and 1");
  }

  return value;
}

function applySignedJitter(
  baseValue: number,
  jitter: number,
  random: () => number,
): number {
  if (jitter === 0) {
    return baseValue;
  }

  return baseValue + ((resolveRandomValue(random) * 2) - 1) * jitter;
}

function resolveCrossAxisOffset(
  size: number,
  align: GridCanvasStackAlign,
): number {
  switch (align) {
    case "center":
      return -size / 2;
    case "end":
      return -size;
    default:
      return 0;
  }
}

export function appendTrailPoint(
  trail: GridCanvasPoint[],
  point: GridCanvasPoint,
  maxPoints: number,
): GridCanvasPoint[] {
  const resolvedMaxPoints = resolveInteger(maxPoints, 1, "maxPoints");
  const resolvedTrail = trail.map((entry, index) =>
    resolvePoint(entry, `trail[${index}]`),
  );
  const resolvedPoint = resolvePoint(point, "point");

  return [...resolvedTrail, resolvedPoint].slice(-resolvedMaxPoints);
}

export function createParticleBurst(
  origin: GridCanvasPoint,
  count: number,
  options?: GridCanvasParticleBurstOptions,
): GridCanvasParticle[] {
  const resolvedOrigin = resolvePoint(origin, "origin");
  const resolvedCount = resolveInteger(count, 0, "count");
  const resolvedAngle = resolveFiniteNumber(options?.angle, 0, "angle");
  const resolvedSpread = resolveNonNegativeNumber(
    options?.spread,
    Math.PI * 2,
    "spread",
  );
  const resolvedSpeed = resolveNonNegativeNumber(
    options?.speed,
    DEFAULT_PARTICLE_SPEED,
    "speed",
  );
  const resolvedSpeedJitter = resolveNonNegativeNumber(
    options?.speedJitter,
    0,
    "speedJitter",
  );
  const resolvedLife = resolveNonNegativeNumber(
    options?.life,
    DEFAULT_PARTICLE_LIFE,
    "life",
  );
  const resolvedLifeJitter = resolveNonNegativeNumber(
    options?.lifeJitter,
    0,
    "lifeJitter",
  );
  const resolvedSize = resolveNonNegativeNumber(
    options?.size,
    DEFAULT_PARTICLE_SIZE,
    "size",
  );
  const resolvedSizeJitter = resolveNonNegativeNumber(
    options?.sizeJitter,
    0,
    "sizeJitter",
  );
  const random = options?.random ?? Math.random;

  return Array.from({ length: resolvedCount }, () => {
    const direction =
      resolvedAngle -
      resolvedSpread / 2 +
      resolvedSpread * resolveRandomValue(random);
    const magnitude = Math.max(
      0,
      applySignedJitter(resolvedSpeed, resolvedSpeedJitter, random),
    );
    const life = Math.max(
      0,
      applySignedJitter(resolvedLife, resolvedLifeJitter, random),
    );
    const size = Math.max(
      0,
      applySignedJitter(resolvedSize, resolvedSizeJitter, random),
    );
    const velocity = vectorFromAngle(direction, magnitude);

    return {
      x: resolvedOrigin.x,
      y: resolvedOrigin.y,
      xSpeed: velocity.x,
      ySpeed: velocity.y,
      life,
      maxLife: life,
      size,
    };
  });
}

export function stepParticles(
  particles: GridCanvasParticle[],
  elapsed: number,
  options?: GridCanvasParticleStepOptions,
): GridCanvasParticle[] {
  const resolvedElapsed = resolveNonNegativeNumber(elapsed, 0, "elapsed");
  const resolvedGravityX = resolveFiniteNumber(
    options?.gravityX,
    0,
    "gravityX",
  );
  const resolvedGravityY = resolveFiniteNumber(
    options?.gravityY,
    0,
    "gravityY",
  );
  const resolvedDrag = resolveNonNegativeNumber(options?.drag, 0, "drag");
  const dragFactor = Math.max(0, 1 - resolvedDrag * resolvedElapsed);

  return particles.flatMap((particle, index) => {
    const resolvedParticle = {
      ...resolvePoint(particle, `particles[${index}]`),
      xSpeed: resolveFiniteNumber(
        particle.xSpeed,
        0,
        `particles[${index}].xSpeed`,
      ),
      ySpeed: resolveFiniteNumber(
        particle.ySpeed,
        0,
        `particles[${index}].ySpeed`,
      ),
      life: resolveNonNegativeNumber(
        particle.life,
        0,
        `particles[${index}].life`,
      ),
      maxLife: resolveNonNegativeNumber(
        particle.maxLife,
        0,
        `particles[${index}].maxLife`,
      ),
      size: resolveNonNegativeNumber(
        particle.size,
        0,
        `particles[${index}].size`,
      ),
    };
    const nextLife = resolvedParticle.life - resolvedElapsed;

    if (nextLife <= 0) {
      return [];
    }

    const nextXSpeed =
      (resolvedParticle.xSpeed + resolvedGravityX * resolvedElapsed) *
      dragFactor;
    const nextYSpeed =
      (resolvedParticle.ySpeed + resolvedGravityY * resolvedElapsed) *
      dragFactor;

    return [
      {
        ...resolvedParticle,
        x: resolvedParticle.x + nextXSpeed * resolvedElapsed,
        y: resolvedParticle.y + nextYSpeed * resolvedElapsed,
        xSpeed: nextXSpeed,
        ySpeed: nextYSpeed,
        life: nextLife,
      },
    ];
  });
}

export function layoutStack(
  origin: GridCanvasPoint,
  itemSizes: GridCanvasSize[],
  options?: GridCanvasStackLayoutOptions,
): GridCanvasPoint[] {
  const resolvedOrigin = resolvePoint(origin, "origin");
  const direction: GridCanvasStackDirection =
    options?.direction ?? "vertical";
  const align: GridCanvasStackAlign = options?.align ?? "start";
  const gap = resolveNonNegativeNumber(options?.gap, 0, "gap");
  let currentX = resolvedOrigin.x;
  let currentY = resolvedOrigin.y;

  return itemSizes.map((itemSize, index) => {
    const resolvedSize = resolveSize(itemSize, `itemSizes[${index}]`);

    if (direction === "horizontal") {
      const point = {
        x: currentX,
        y:
          resolvedOrigin.y +
          resolveCrossAxisOffset(resolvedSize.height, align),
      };

      currentX += resolvedSize.width + gap;

      return point;
    }

    const point = {
      x:
        resolvedOrigin.x +
        resolveCrossAxisOffset(resolvedSize.width, align),
      y: currentY,
    };

    currentY += resolvedSize.height + gap;

    return point;
  });
}
