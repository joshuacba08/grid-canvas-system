import GridCanvasSystem from "./core";
import { GridCanvasRuntime } from "./runtime";

const GridCanvasSystemLibrary = Object.assign(GridCanvasSystem, {
  ...GridCanvasRuntime,
  runtime: GridCanvasRuntime,
});

export default GridCanvasSystemLibrary;
export type {
  GridCanvasClearOptions,
  GridCanvasSystemOptions,
  GridCanvasSystemResolvedOptions,
} from "./core";
export type {
  GridCanvasAsteroidOptions,
  GridCanvasAsteroidShape,
  GridCanvasBarIndicatorOptions,
  GridCanvasCircleSectorOptions,
  GridCanvasGhostOptions,
  GridCanvasMessageOptions,
  GridCanvasPacmanOptions,
  GridCanvasPoint,
  GridCanvasPolylineOptions,
  GridCanvasProjectileOptions,
  GridCanvasShapeOptions,
  GridCanvasShipOptions,
  GridCanvasStrokeOptions,
  GridCanvasTextOptions,
  GridCanvasValueLabelOptions,
} from "./drawing";
export type {
  GridCanvasAnimationLoop,
  GridCanvasAnimationLoopOptions,
  GridCanvasKeyTracker,
  GridCanvasKeyTrackerOptions,
  GridCanvasMassBodyOptions,
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
} from "./runtime";
