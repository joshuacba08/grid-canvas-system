import { hitTestCircleRectangle, hitTestPoint, hitTestRectangle } from "./collision";
import { createAnimationLoop } from "./createAnimationLoop";
import { createKeyTracker, normalizeKeyIdentifier } from "./createKeyTracker";
import { createPointerTracker } from "./createPointerTracker";
import { createSpriteAnimator } from "./createSpriteAnimator";
import { createStateMachine } from "./createStateMachine";
import { canvasToGrid, gridToCanvas, snapPointToGrid } from "./grid";
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
  canvasToGrid,
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
});

export { hitTestCircleRectangle, hitTestPoint, hitTestRectangle } from "./collision";
export {
  appendTrailPoint,
  createParticleBurst,
  layoutStack,
  stepParticles,
} from "./scene";
export { canvasToGrid, gridToCanvas, snapPointToGrid } from "./grid";
export type { GridCanvasGridCell, GridCanvasGridOptions } from "./grid";
export { createPointerTracker } from "./createPointerTracker";
export { createSpriteAnimator } from "./createSpriteAnimator";
export { createStateMachine } from "./createStateMachine";
export type {
  GridCanvasAnimationLoop,
  GridCanvasAnimationLoopOptions,
} from "./createAnimationLoop";
export type {
  GridCanvasKeyTracker,
  GridCanvasKeyTrackerOptions,
} from "./createKeyTracker";
export type {
  GridCanvasPointerTracker,
  GridCanvasPointerTrackerOptions,
} from "./createPointerTracker";
export type {
  GridCanvasSpriteAnimator,
  GridCanvasSpriteAnimatorOptions,
} from "./createSpriteAnimator";
export type {
  GridCanvasStateMachine,
  GridCanvasStateMachineOptions,
} from "./createStateMachine";
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
