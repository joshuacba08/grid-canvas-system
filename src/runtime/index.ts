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

export const GridCanvasRuntime = Object.freeze({
  angleToPoint,
  circlesIntersect,
  createAnimationLoop,
  createKeyTracker,
  distanceBetweenPoints,
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
  MassBody,
  normalizeKeyIdentifier,
  oscillate01,
  vectorFromAngle,
  wrapPoint,
});

export {
  hitTestCircleRectangle,
  hitTestPoint,
  hitTestRectangle,
} from "./collision";
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
  GridCanvasRectangleLike,
  GridCanvasVelocity,
} from "./types";
