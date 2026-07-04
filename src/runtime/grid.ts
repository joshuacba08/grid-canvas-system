import type { GridCanvasPoint } from "../modules/vanilla/GridCanvasSystem";

export interface GridCanvasGridCell {
  column: number;
  row: number;
}

export interface GridCanvasGridOptions {
  cellSize: number;
  origin?: GridCanvasPoint;
}

function resolveFinite(value: number, name: string): number {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }

  return value;
}

function resolvePositive(value: number, name: string): number {
  const resolvedValue = resolveFinite(value, name);

  if (resolvedValue <= 0) {
    throw new Error(`${name} must be a positive finite number`);
  }

  return resolvedValue;
}

function resolvePoint(
  point: GridCanvasPoint | undefined,
  name: string,
): GridCanvasPoint {
  if (point === undefined) {
    return { x: 0, y: 0 };
  }

  if (point === null || typeof point !== "object") {
    throw new Error(`${name} must be an object with finite x and y values`);
  }

  return {
    x: resolveFinite(point.x, `${name}.x`),
    y: resolveFinite(point.y, `${name}.y`),
  };
}

function resolveOptions(options: GridCanvasGridOptions): Required<GridCanvasGridOptions> {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  return {
    cellSize: resolvePositive(options.cellSize, "cellSize"),
    origin: resolvePoint(options.origin, "origin"),
  };
}

function resolveCell(cell: GridCanvasGridCell): GridCanvasGridCell {
  if (cell === null || typeof cell !== "object") {
    throw new Error("cell must be an object with integer column and row values");
  }

  if (!Number.isInteger(cell.column)) {
    throw new Error("cell.column must be an integer");
  }

  if (!Number.isInteger(cell.row)) {
    throw new Error("cell.row must be an integer");
  }

  return {
    column: cell.column,
    row: cell.row,
  };
}

export function canvasToGrid(
  point: GridCanvasPoint,
  options: GridCanvasGridOptions,
): GridCanvasGridCell {
  const resolvedPoint = resolvePoint(point, "point");
  const { cellSize, origin } = resolveOptions(options);

  return {
    column: Math.floor((resolvedPoint.x - origin.x) / cellSize),
    row: Math.floor((resolvedPoint.y - origin.y) / cellSize),
  };
}

export function gridToCanvas(
  cell: GridCanvasGridCell,
  options: GridCanvasGridOptions,
): GridCanvasPoint {
  const resolvedCell = resolveCell(cell);
  const { cellSize, origin } = resolveOptions(options);

  return {
    x: origin.x + resolvedCell.column * cellSize,
    y: origin.y + resolvedCell.row * cellSize,
  };
}

export function snapPointToGrid(
  point: GridCanvasPoint,
  options: GridCanvasGridOptions,
): GridCanvasPoint {
  return gridToCanvas(canvasToGrid(point, options), options);
}
