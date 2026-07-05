import type {
  GridCanvasPixelPalette,
  GridCanvasPixelSprite,
  GridCanvasPoint,
} from "../modules/vanilla/GridCanvasSystem";
import type { GridCanvasRectangleLike } from "../runtime/types";

export interface GridCanvasCompiledPixel {
  color: string;
  column: number;
  row: number;
}

export interface GridCanvasCompiledPixelSprite {
  height: number;
  pixels: readonly GridCanvasCompiledPixel[];
  width: number;
}

export interface GridCanvasCompiledPixelSpriteDrawOptions {
  opacity?: number;
  pixelSize: number;
  x: number;
  y: number;
}

export interface GridCanvasPixelSpriteGeometryOptions {
  palette?: GridCanvasPixelPalette;
  pixelSize: number;
  x: number;
  y: number;
}

type SpriteSource = GridCanvasCompiledPixelSprite | GridCanvasPixelSprite;

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

function isTransparentColor(color: string | null | undefined): boolean {
  return (
    color === null ||
    color === undefined ||
    (typeof color === "string" && color.toLowerCase() === "transparent")
  );
}

function resolveSprite(sprite: GridCanvasPixelSprite): GridCanvasPixelSprite {
  if (!Array.isArray(sprite) || sprite.length === 0) {
    throw new Error("sprite must contain at least one row");
  }

  const width = sprite[0]?.length ?? 0;

  if (width === 0) {
    throw new Error("sprite rows must contain at least one pixel");
  }

  sprite.forEach((row) => {
    if (typeof row !== "string" || row.length !== width) {
      throw new Error("sprite rows must have the same length");
    }
  });

  return sprite;
}

function resolvePalette(palette: GridCanvasPixelPalette): GridCanvasPixelPalette {
  if (palette === null || typeof palette !== "object" || Array.isArray(palette)) {
    throw new Error("palette must be an object");
  }

  return palette;
}

function resolvePaletteColor(
  palette: GridCanvasPixelPalette,
  pixelKey: string,
): string | null | undefined {
  if (!Object.prototype.hasOwnProperty.call(palette, pixelKey)) {
    throw new Error(`palette is missing color for "${pixelKey}"`);
  }

  const color = palette[pixelKey];

  if (isTransparentColor(color)) {
    return color;
  }

  if (typeof color !== "string") {
    throw new Error(`palette color for "${pixelKey}" must be a string`);
  }

  return color;
}

function isCompiledSprite(
  sprite: SpriteSource,
): sprite is GridCanvasCompiledPixelSprite {
  return (
    sprite !== null &&
    typeof sprite === "object" &&
    !Array.isArray(sprite) &&
    "pixels" in sprite &&
    "width" in sprite &&
    "height" in sprite &&
    Array.isArray(sprite.pixels) &&
    Number.isInteger(sprite.width) &&
    Number.isInteger(sprite.height)
  );
}

function resolveCompiledSprite(
  compiled: GridCanvasCompiledPixelSprite,
): GridCanvasCompiledPixelSprite {
  if (!isCompiledSprite(compiled)) {
    throw new Error("compiled sprite must contain width, height and pixels");
  }

  if (compiled.width <= 0 || compiled.height <= 0) {
    throw new Error("compiled sprite width and height must be positive integers");
  }

  compiled.pixels.forEach((pixel, index) => {
    if (
      pixel === null ||
      typeof pixel !== "object" ||
      !Number.isInteger(pixel.column) ||
      !Number.isInteger(pixel.row) ||
      typeof pixel.color !== "string"
    ) {
      throw new Error(`compiled sprite pixel ${index} is invalid`);
    }
  });

  return compiled;
}

function resolveGeometryOptions(
  options:
    GridCanvasPixelSpriteGeometryOptions | GridCanvasCompiledPixelSpriteDrawOptions,
): Required<GridCanvasCompiledPixelSpriteDrawOptions> {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  return {
    opacity: resolveUnit(
      "opacity" in options ? options.opacity : undefined,
      "options.opacity",
    ),
    pixelSize: resolvePositive(options.pixelSize, "options.pixelSize"),
    x: resolveFinite(options.x, "options.x"),
    y: resolveFinite(options.y, "options.y"),
  };
}

function resolveSpriteDimensions(sprite: SpriteSource): {
  height: number;
  width: number;
} {
  if (isCompiledSprite(sprite)) {
    const resolvedCompiled = resolveCompiledSprite(sprite);

    return { height: resolvedCompiled.height, width: resolvedCompiled.width };
  }

  const resolvedSprite = resolveSprite(sprite);

  return { height: resolvedSprite.length, width: resolvedSprite[0].length };
}

function compileForGeometry(
  sprite: SpriteSource,
  options: GridCanvasPixelSpriteGeometryOptions,
): GridCanvasCompiledPixelSprite {
  if (isCompiledSprite(sprite)) {
    return resolveCompiledSprite(sprite);
  }

  const resolvedSprite = resolveSprite(sprite);

  if (options.palette === undefined) {
    throw new Error(
      "hitTestPixelSprite requires a compiled sprite or a palette to resolve transparency",
    );
  }

  return compilePixelSprite(resolvedSprite, options.palette);
}

export function createPixelPalette(
  palette: GridCanvasPixelPalette,
): GridCanvasPixelPalette {
  return { ...resolvePalette(palette) };
}

export function compilePixelSprite(
  sprite: GridCanvasPixelSprite,
  palette: GridCanvasPixelPalette,
): GridCanvasCompiledPixelSprite {
  const resolvedSprite = resolveSprite(sprite);
  const resolvedPalette = resolvePalette(palette);
  const pixels: GridCanvasCompiledPixel[] = [];

  resolvedSprite.forEach((row, rowIndex) => {
    Array.from(row).forEach((pixelKey, columnIndex) => {
      const color = resolvePaletteColor(resolvedPalette, pixelKey);

      if (isTransparentColor(color)) {
        return;
      }

      pixels.push({
        color: color as string,
        column: columnIndex,
        row: rowIndex,
      });
    });
  });

  return {
    height: resolvedSprite.length,
    pixels,
    width: resolvedSprite[0].length,
  };
}

export function flipPixelSpriteX(sprite: GridCanvasPixelSprite): GridCanvasPixelSprite {
  return resolveSprite(sprite).map((row) => Array.from(row).reverse().join(""));
}

export function flipPixelSpriteY(sprite: GridCanvasPixelSprite): GridCanvasPixelSprite {
  return [...resolveSprite(sprite)].reverse();
}

export function tintPixelSprite(
  compiled: GridCanvasCompiledPixelSprite,
  color: string,
): GridCanvasCompiledPixelSprite {
  if (typeof color !== "string" || color.length === 0) {
    throw new Error("color must be a non-empty string");
  }

  const resolvedCompiled = resolveCompiledSprite(compiled);

  return {
    height: resolvedCompiled.height,
    pixels: resolvedCompiled.pixels.map((pixel) => ({
      ...pixel,
      color,
    })),
    width: resolvedCompiled.width,
  };
}

export function getPixelSpriteBounds(
  sprite: SpriteSource,
  options: GridCanvasPixelSpriteGeometryOptions,
): GridCanvasRectangleLike {
  const resolvedOptions = resolveGeometryOptions(options);
  const { height, width } = resolveSpriteDimensions(sprite);

  return {
    height: height * resolvedOptions.pixelSize,
    width: width * resolvedOptions.pixelSize,
    x: resolvedOptions.x,
    y: resolvedOptions.y,
  };
}

export function hitTestPixelSprite(
  point: GridCanvasPoint,
  sprite: SpriteSource,
  options: GridCanvasPixelSpriteGeometryOptions,
): boolean {
  if (point === null || typeof point !== "object") {
    throw new Error("point must be an object with finite x and y values");
  }

  const resolvedPoint = {
    x: resolveFinite(point.x, "point.x"),
    y: resolveFinite(point.y, "point.y"),
  };
  const resolvedOptions = resolveGeometryOptions(options);
  const compiled = compileForGeometry(sprite, options);
  const localColumn = Math.floor(
    (resolvedPoint.x - resolvedOptions.x) / resolvedOptions.pixelSize,
  );
  const localRow = Math.floor(
    (resolvedPoint.y - resolvedOptions.y) / resolvedOptions.pixelSize,
  );

  if (
    localColumn < 0 ||
    localColumn >= compiled.width ||
    localRow < 0 ||
    localRow >= compiled.height
  ) {
    return false;
  }

  return compiled.pixels.some(
    (pixel) => pixel.column === localColumn && pixel.row === localRow,
  );
}

export { resolveCompiledSprite, resolveGeometryOptions };
