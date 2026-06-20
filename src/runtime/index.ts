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
  MassBody,
  normalizeKeyIdentifier,
  oscillate01,
  vectorFromAngle,
  wrapPoint,
});

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
  GridCanvasVelocity,
} from "./types";
