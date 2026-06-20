import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";

export interface GridCanvasBounds {
  width: number;
  height: number;
}

export interface GridCanvasSize {
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

export interface GridCanvasParticle
  extends GridCanvasPoint, GridCanvasVelocity {
  life: number;
  maxLife: number;
  size: number;
}

export interface GridCanvasParticleBurstOptions {
  angle?: number;
  spread?: number;
  speed?: number;
  speedJitter?: number;
  life?: number;
  lifeJitter?: number;
  size?: number;
  sizeJitter?: number;
  random?: () => number;
}

export interface GridCanvasParticleStepOptions {
  gravityX?: number;
  gravityY?: number;
  drag?: number;
}

export type GridCanvasStackDirection = "vertical" | "horizontal";

export type GridCanvasStackAlign = "start" | "center" | "end";

export interface GridCanvasStackLayoutOptions {
  direction?: GridCanvasStackDirection;
  gap?: number;
  align?: GridCanvasStackAlign;
}
