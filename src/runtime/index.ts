import {
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
} from "./collision";
import { createAnimationLoop } from "./createAnimationLoop";
import { createKeyTracker, normalizeKeyIdentifier } from "./createKeyTracker";
import { MassBody } from "./MassBody";
import {
  angleToPoint,
  circlesIntersect,
  distanceBetweenPoints,
  oscillate01,
  vectorFromAngle,
  wrapPoint,
} from "./motion";
import {
  appendTrailPoint,
  createParticleBurst,
  layoutStack,
  stepParticles,
} from "./scene";

export const GridCanvasRuntime = Object.freeze({
  angleToPoint,
  appendTrailPoint,
  circlesIntersect,
  createAnimationLoop,
  createKeyTracker,
  createParticleBurst,
  distanceBetweenPoints,
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
  layoutStack,
  MassBody,
  normalizeKeyIdentifier,
  oscillate01,
  stepParticles,
  vectorFromAngle,
  wrapPoint,
});

export {
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
} from "./collision";
export {
  appendTrailPoint,
  createParticleBurst,
  layoutStack,
  stepParticles,
} from "./scene";
export type {
  GridCanvasAnimationLoop,
  GridCanvasAnimationLoopOptions,
} from "./createAnimationLoop";
export type {
  GridCanvasKeyTracker,
  GridCanvasKeyTrackerOptions,
} from "./createKeyTracker";
export type { GridCanvasMassBodyOptions } from "./MassBody";
export type {
  GridCanvasBounds,
  GridCanvasCircleLike,
  GridCanvasCollisionTarget,
  GridCanvasParticle,
  GridCanvasParticleBurstOptions,
  GridCanvasParticleStepOptions,
  GridCanvasRectangleLike,
  GridCanvasSize,
  GridCanvasStackAlign,
  GridCanvasStackDirection,
  GridCanvasStackLayoutOptions,
  GridCanvasVelocity,
} from "./types";
