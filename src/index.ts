import GridCanvasSystem from "./modules/vanilla/GridCanvasSystem";
import { createAnimationLoop } from "./runtime/createAnimationLoop";
import { createKeyTracker, normalizeKeyIdentifier } from "./runtime/createKeyTracker";
import { MassBody } from "./runtime/MassBody";
import {
  angleToPoint,
  circlesIntersect,
  distanceBetweenPoints,
  oscillate01,
  vectorFromAngle,
  wrapPoint,
} from "./runtime/motion";

const GridCanvasSystemLibrary = Object.assign(GridCanvasSystem, {
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

export default GridCanvasSystemLibrary;
export type {
  GridCanvasClearOptions,
  GridCanvasAsteroidOptions,
  GridCanvasAsteroidShape,
  GridCanvasCircleSectorOptions,
  GridCanvasGhostOptions,
  GridCanvasMessageOptions,
  GridCanvasPacmanOptions,
  GridCanvasPoint,
  GridCanvasProjectileOptions,
  GridCanvasShapeOptions,
  GridCanvasShipOptions,
  GridCanvasBarIndicatorOptions,
  GridCanvasPolylineOptions,
  GridCanvasStrokeOptions,
  GridCanvasSystemOptions,
  GridCanvasSystemResolvedOptions,
  GridCanvasTextOptions,
  GridCanvasValueLabelOptions,
} from "./modules/vanilla/GridCanvasSystem";
export type {
  GridCanvasAnimationLoop,
  GridCanvasAnimationLoopOptions,
} from "./runtime/createAnimationLoop";
export type {
  GridCanvasKeyTracker,
  GridCanvasKeyTrackerOptions,
} from "./runtime/createKeyTracker";
export type { GridCanvasMassBodyOptions } from "./runtime/MassBody";
export type {
  GridCanvasBounds,
  GridCanvasCircleLike,
  GridCanvasVelocity,
} from "./runtime/types";
