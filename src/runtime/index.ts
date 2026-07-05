import { hitTestCircleRectangle, hitTestPoint, hitTestRectangle } from "./collision";
import { createAnimationLoop } from "./createAnimationLoop";
import { createFixedStepLoop } from "./createFixedStepLoop";
import { createKeyTracker, normalizeKeyIdentifier } from "./createKeyTracker";
import { createPointerTracker } from "./createPointerTracker";
import { createSceneManager } from "./createSceneManager";
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
import {
  drawTileMap,
  getTileAt,
  hitTestTileMap,
  setTileAt,
  tileToBounds,
} from "./tilemap";

export const GridCanvasRuntime = Object.freeze({
  angleToPoint,
  appendTrailPoint,
  circlesIntersect,
  canvasToGrid,
  createAnimationLoop,
  createFixedStepLoop,
  createKeyTracker,
  createParticleBurst,
  createPointerTracker,
  createSceneManager,
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
  drawTileMap,
  getTileAt,
  hitTestTileMap,
  setTileAt,
  tileToBounds,
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
export { createFixedStepLoop } from "./createFixedStepLoop";
export type {
  GridCanvasFixedStepLoop,
  GridCanvasFixedStepLoopOptions,
} from "./createFixedStepLoop";
export { createPointerTracker } from "./createPointerTracker";
export { createSceneManager } from "./createSceneManager";
export type {
  GridCanvasScene,
  GridCanvasSceneManager,
  GridCanvasSceneManagerOptions,
} from "./createSceneManager";
export { createSpriteAnimator } from "./createSpriteAnimator";
export { createStateMachine } from "./createStateMachine";
export {
  drawTileMap,
  getTileAt,
  hitTestTileMap,
  setTileAt,
  tileToBounds,
} from "./tilemap";
export type {
  GridCanvasTileDefinition,
  GridCanvasTileMap,
  GridCanvasTileMapDrawOptions,
  GridCanvasTileMapDrawRenderer,
  GridCanvasTileMapOptions,
  GridCanvasTileObjectDefinition,
  GridCanvasTileSet,
} from "./tilemap";
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
