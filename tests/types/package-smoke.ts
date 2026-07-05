import GridCanvasSystem, {
  type GridCanvasCompiledPixelSprite,
  type GridCanvasFixedStepLoop,
  type GridCanvasSceneManager,
  type GridCanvasTileMap,
  type GridCanvasTileSet,
} from "grid-canvas-system";
import {
  createHowlerAssetAudio,
  createToneMusicAudio,
  type HowlerAssetAudioController,
  type ToneMusicAudioController,
} from "grid-canvas-system/audio";
import {
  createArcadeAudio,
  type ArcadeAudioController,
} from "grid-canvas-system/audio-arcade";

const grid = new GridCanvasSystem("canvas");
const palette = GridCanvasSystem.createPixelPalette({
  0: "transparent",
  1: "#ffffff",
});
const compiled: GridCanvasCompiledPixelSprite = GridCanvasSystem.compilePixelSprite(
  ["10"],
  palette,
);
const fixedLoop: GridCanvasFixedStepLoop = GridCanvasSystem.runtime.createFixedStepLoop(
  {
    step: 1 / 60,
    update: () => {},
  },
);
const sceneManager: GridCanvasSceneManager<void> =
  GridCanvasSystem.runtime.createSceneManager({
    initial: "menu",
    scenes: {
      menu: {
        draw: () => {},
      },
    },
  });
const map: GridCanvasTileMap = ["10"];
const tileset: GridCanvasTileSet = {
  1: compiled,
};
const arcadeAudio: ArcadeAudioController = createArcadeAudio();
const howlerAudio: Promise<HowlerAssetAudioController> = createHowlerAssetAudio({
  coin: {
    src: ["/coin.wav"],
  },
});
const toneAudio: Promise<ToneMusicAudioController> = createToneMusicAudio();

grid.drawCompiledPixelSprite(compiled, {
  pixelSize: 8,
  x: 0,
  y: 0,
});
GridCanvasSystem.runtime.drawTileMap(map, tileset, {
  grid,
  tileSize: 8,
});
GridCanvasSystem.runtime.getTileAt({ x: 1, y: 1 }, map, {
  tileSize: 8,
});
sceneManager.draw(undefined);
fixedLoop.stop();
arcadeAudio.stopAll();
void howlerAudio;
void toneAudio;
