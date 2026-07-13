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
import {
  createAnimationLoop as createRuntimeAnimationLoop,
  createSpriteAnimator,
  createStateMachine,
  getMotionPreference,
  type CanvasRuntimeOptions,
  type MotionPreference,
  type StateTransitionEvent,
} from "grid-canvas-system/runtime";

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
const motionPreference: MotionPreference = getMotionPreference();
const runtimeOptions: CanvasRuntimeOptions = {
  canvas: grid.canvas,
  logicalHeight: 16,
  logicalWidth: 16,
  render: () => {},
};
const reactiveLoop = createRuntimeAnimationLoop({
  maxDeltaMs: 100,
  updateMs: () => {},
});
const typedMachine = createStateMachine<"idle" | "active">({
  initial: "idle",
  transitions: {
    active: ["idle"],
    idle: ["active"],
  },
});
const inferredAnimator = createSpriteAnimator({
  animations: {
    happy: ["happy-a", "happy-b"],
    idle: ["idle-a", "idle-b"],
    sleeping: ["sleep-a", "sleep-b"],
  },
  fps: 3,
  initial: "idle",
});
const inferredAnimation: "idle" | "happy" | "sleeping" = "happy";
const unsubscribeMachine = typedMachine.subscribe(
  (event: StateTransitionEvent<"idle" | "active">) => {
    event.to;
  },
);

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
void motionPreference;
void runtimeOptions;
reactiveLoop.destroy();
inferredAnimator.play(inferredAnimation);
unsubscribeMachine();
