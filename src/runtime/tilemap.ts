import type {
  GridCanvasPixelPalette,
  GridCanvasPixelSprite,
  GridCanvasPoint,
} from "../modules/vanilla/GridCanvasSystem";
import type {
  GridCanvasCompiledPixelSprite,
  GridCanvasCompiledPixelSpriteDrawOptions,
} from "../drawing/pixelSprite";
import type { GridCanvasGridCell } from "./grid";
import type { GridCanvasRectangleLike } from "./types";

export type GridCanvasTileMap = readonly string[];

export type GridCanvasTileDefinition =
  | string
  | GridCanvasPixelSprite
  | GridCanvasCompiledPixelSprite
  | GridCanvasTileObjectDefinition
  | null
  | undefined;

export type GridCanvasTileSet = Record<string, GridCanvasTileDefinition>;

export interface GridCanvasTileObjectDefinition {
  color?: string;
  opacity?: number;
  palette?: GridCanvasPixelPalette;
  sprite?: GridCanvasCompiledPixelSprite | GridCanvasPixelSprite;
}

export interface GridCanvasTileMapOptions {
  origin?: GridCanvasPoint;
  tileSize: number;
}

export interface GridCanvasTileMapDrawRenderer {
  ctx: CanvasRenderingContext2D;
  drawCompiledPixelSprite(
    compiled: GridCanvasCompiledPixelSprite,
    options: GridCanvasCompiledPixelSpriteDrawOptions,
  ): void;
  drawPixelSprite(
    sprite: GridCanvasPixelSprite,
    options: {
      opacity?: number;
      palette: GridCanvasPixelPalette;
      pixelSize: number;
      x: number;
      y: number;
    },
  ): void;
}

export interface GridCanvasTileMapDrawOptions extends GridCanvasTileMapOptions {
  grid: GridCanvasTileMapDrawRenderer;
  palette?: GridCanvasPixelPalette;
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

function resolveUnit(value: number | undefined, name: string): number {
  const resolvedValue = value ?? 1;

  if (!Number.isFinite(resolvedValue) || resolvedValue < 0 || resolvedValue > 1) {
    throw new Error(`${name} must be a finite number between 0 and 1`);
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

function resolveOptions(
  options: GridCanvasTileMapOptions,
): Required<GridCanvasTileMapOptions> {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  return {
    origin: resolvePoint(options.origin, "origin"),
    tileSize: resolvePositive(options.tileSize, "tileSize"),
  };
}

function resolveMap(map: GridCanvasTileMap): readonly string[] {
  if (!Array.isArray(map) || map.length === 0) {
    throw new Error("map must contain at least one row");
  }

  const width = Array.from(map[0] ?? "").length;

  if (width === 0) {
    throw new Error("map rows must contain at least one tile");
  }

  map.forEach((row) => {
    if (typeof row !== "string" || Array.from(row).length !== width) {
      throw new Error("map rows must have the same length");
    }
  });

  return map;
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

  return cell;
}

function resolveRectangle(rect: GridCanvasRectangleLike): GridCanvasRectangleLike {
  if (rect === null || typeof rect !== "object") {
    throw new Error("rect must be an object with finite x, y, width and height values");
  }

  return {
    height: resolvePositive(rect.height, "rect.height"),
    width: resolvePositive(rect.width, "rect.width"),
    x: resolveFinite(rect.x, "rect.x"),
    y: resolveFinite(rect.y, "rect.y"),
  };
}

function isCompiledSprite(
  value: GridCanvasTileDefinition,
): value is GridCanvasCompiledPixelSprite {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "pixels" in value &&
    Array.isArray(value.pixels)
  );
}

function isTileObjectDefinition(
  value: GridCanvasTileDefinition,
): value is GridCanvasTileObjectDefinition {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function drawColorTile(
  grid: GridCanvasTileMapDrawRenderer,
  color: string,
  bounds: GridCanvasRectangleLike,
  opacity?: number,
): void {
  grid.ctx.save();

  try {
    const currentAlpha = Number.isFinite(grid.ctx.globalAlpha)
      ? grid.ctx.globalAlpha
      : 1;

    grid.ctx.globalAlpha = currentAlpha * resolveUnit(opacity, "tile.opacity");
    grid.ctx.fillStyle = color;
    grid.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  } finally {
    grid.ctx.restore();
  }
}

function drawSpriteTile(
  grid: GridCanvasTileMapDrawRenderer,
  sprite: GridCanvasCompiledPixelSprite | GridCanvasPixelSprite,
  bounds: GridCanvasRectangleLike,
  opacity: number | undefined,
  palette: GridCanvasPixelPalette | undefined,
): void {
  if (isCompiledSprite(sprite)) {
    grid.drawCompiledPixelSprite(sprite, {
      opacity,
      pixelSize: Math.min(bounds.width / sprite.width, bounds.height / sprite.height),
      x: bounds.x,
      y: bounds.y,
    });

    return;
  }

  if (palette === undefined) {
    throw new Error("tile sprite definitions require a palette");
  }

  const spriteWidth = Array.from(sprite[0] ?? "").length;

  if (spriteWidth === 0) {
    throw new Error("tile sprite rows must contain at least one pixel");
  }

  grid.drawPixelSprite(sprite, {
    opacity,
    palette,
    pixelSize: Math.min(bounds.width / spriteWidth, bounds.height / sprite.length),
    x: bounds.x,
    y: bounds.y,
  });
}

export function tileToBounds(
  cell: GridCanvasGridCell,
  options: GridCanvasTileMapOptions,
): GridCanvasRectangleLike {
  const resolvedCell = resolveCell(cell);
  const { origin, tileSize } = resolveOptions(options);

  return {
    height: tileSize,
    width: tileSize,
    x: origin.x + resolvedCell.column * tileSize,
    y: origin.y + resolvedCell.row * tileSize,
  };
}

export function getTileAt(
  point: GridCanvasPoint,
  map: GridCanvasTileMap,
  options: GridCanvasTileMapOptions,
): string | null {
  const resolvedMap = resolveMap(map);
  const { origin, tileSize } = resolveOptions(options);
  const resolvedPoint = resolvePoint(point, "point");
  const column = Math.floor((resolvedPoint.x - origin.x) / tileSize);
  const row = Math.floor((resolvedPoint.y - origin.y) / tileSize);

  if (row < 0 || row >= resolvedMap.length) {
    return null;
  }

  const mapRow = Array.from(resolvedMap[row]);

  if (column < 0 || column >= mapRow.length) {
    return null;
  }

  return mapRow[column];
}

export function setTileAt(
  map: GridCanvasTileMap,
  cell: GridCanvasGridCell,
  value: string,
): GridCanvasTileMap {
  const resolvedMap = resolveMap(map);
  const resolvedCell = resolveCell(cell);

  if (typeof value !== "string" || Array.from(value).length !== 1) {
    throw new Error("value must be a single tile character");
  }

  if (resolvedCell.row < 0 || resolvedCell.row >= resolvedMap.length) {
    return [...resolvedMap];
  }

  const rows = resolvedMap.map((row) => Array.from(row));
  const targetRow = rows[resolvedCell.row];

  if (resolvedCell.column < 0 || resolvedCell.column >= targetRow.length) {
    return resolvedMap.map((row) => row);
  }

  targetRow[resolvedCell.column] = value;

  return rows.map((row) => row.join(""));
}

export function hitTestTileMap(
  rect: GridCanvasRectangleLike,
  map: GridCanvasTileMap,
  solidTiles: Iterable<string>,
  options: GridCanvasTileMapOptions,
): boolean {
  const resolvedRect = resolveRectangle(rect);
  const resolvedMap = resolveMap(map);
  const { origin, tileSize } = resolveOptions(options);
  const solidTileSet = new Set(solidTiles);
  const startColumn = Math.floor((resolvedRect.x - origin.x) / tileSize);
  const endColumn = Math.floor(
    (resolvedRect.x + resolvedRect.width - 0.000001 - origin.x) / tileSize,
  );
  const startRow = Math.floor((resolvedRect.y - origin.y) / tileSize);
  const endRow = Math.floor(
    (resolvedRect.y + resolvedRect.height - 0.000001 - origin.y) / tileSize,
  );

  for (let row = startRow; row <= endRow; row += 1) {
    if (row < 0 || row >= resolvedMap.length) {
      continue;
    }

    const mapRow = Array.from(resolvedMap[row]);

    for (let column = startColumn; column <= endColumn; column += 1) {
      if (column < 0 || column >= mapRow.length) {
        continue;
      }

      if (solidTileSet.has(mapRow[column])) {
        return true;
      }
    }
  }

  return false;
}

export function drawTileMap(
  map: GridCanvasTileMap,
  tileset: GridCanvasTileSet,
  options: GridCanvasTileMapDrawOptions,
): void {
  const resolvedMap = resolveMap(map);
  const { grid, palette } = options;

  if (grid === null || typeof grid !== "object") {
    throw new Error("options.grid must be a GridCanvasSystem-like renderer");
  }

  if (tileset === null || typeof tileset !== "object" || Array.isArray(tileset)) {
    throw new Error("tileset must be an object");
  }

  resolvedMap.forEach((row, rowIndex) => {
    Array.from(row).forEach((tile, columnIndex) => {
      const definition = tileset[tile];

      if (definition === null || definition === undefined) {
        return;
      }

      const bounds = tileToBounds({ column: columnIndex, row: rowIndex }, options);

      if (typeof definition === "string") {
        drawColorTile(grid, definition, bounds);

        return;
      }

      if (Array.isArray(definition) || isCompiledSprite(definition)) {
        drawSpriteTile(grid, definition, bounds, undefined, palette);

        return;
      }

      if (!isTileObjectDefinition(definition)) {
        return;
      }

      if (definition.color !== undefined) {
        drawColorTile(grid, definition.color, bounds, definition.opacity);
      }

      if (definition.sprite !== undefined) {
        drawSpriteTile(
          grid,
          definition.sprite,
          bounds,
          definition.opacity,
          definition.palette ?? palette,
        );
      }
    });
  });
}
