import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";

export interface GridCanvasBounds {
  width: number;
  height: number;
}

export interface GridCanvasVelocity {
  xSpeed: number;
  ySpeed: number;
}

export interface GridCanvasCircleLike extends GridCanvasPoint {
  radius: number;
}

export interface GridCanvasRectangleLike extends GridCanvasPoint {
  width: number;
  height: number;
}

export type GridCanvasCollisionTarget =
  | GridCanvasCircleLike
  | GridCanvasRectangleLike;
