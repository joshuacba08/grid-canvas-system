import { InvalidStateTransitionError, RuntimeDestroyedError } from "./errors";

export interface GridCanvasScene<TDrawContext = unknown> {
  draw?: (context: TDrawContext) => void;
  enter?: (previousScene: string | null) => void;
  exit?: (nextScene: string) => void;
  update?: (elapsed: number) => void;
}

export interface GridCanvasSceneManagerOptions<TDrawContext = unknown> {
  initial: string;
  scenes: Record<string, GridCanvasScene<TDrawContext>>;
}

export interface GridCanvasSceneManager<TDrawContext = unknown> {
  destroy(): void;
  draw(context: TDrawContext): void;
  getScene(): GridCanvasScene<TDrawContext>;
  getSceneId(): string;
  isDestroyed(): boolean;
  reset(): void;
  transition(nextScene: string): boolean;
  update(elapsed: number): void;
}

function resolveSceneId(sceneId: string, name: string): string {
  if (typeof sceneId !== "string" || sceneId.length === 0) {
    throw new Error(`${name} must be a non-empty string`);
  }

  return sceneId;
}

function resolveScenes<TDrawContext>(
  scenes: Record<string, GridCanvasScene<TDrawContext>>,
): Record<string, GridCanvasScene<TDrawContext>> {
  if (scenes === null || typeof scenes !== "object" || Array.isArray(scenes)) {
    throw new Error("scenes must be an object");
  }

  if (Object.keys(scenes).length === 0) {
    throw new Error("scenes must contain at least one scene");
  }

  Object.entries(scenes).forEach(([sceneId, scene]) => {
    resolveSceneId(sceneId, "scene id");

    if (scene === null || typeof scene !== "object" || Array.isArray(scene)) {
      throw new Error(`scene "${sceneId}" must be an object`);
    }
  });

  return scenes;
}

export function createSceneManager<TDrawContext = unknown>(
  options: GridCanvasSceneManagerOptions<TDrawContext>,
): GridCanvasSceneManager<TDrawContext> {
  if (options === null || typeof options !== "object") {
    throw new Error("options must be an object");
  }

  const scenes = resolveScenes(options.scenes);
  const initial = resolveSceneId(options.initial, "initial");
  let currentSceneId = initial;
  let destroyed = false;
  let transitioning = false;
  let exiting = false;
  const assertActive = (): void => {
    if (destroyed) throw new RuntimeDestroyedError("Scene manager has been destroyed.");
  };
  const changeScene = (nextScene: string): void => {
    transitioning = true;
    const previous = currentSceneId;
    try {
      exiting = true;
      try {
        scenes[previous].exit?.(nextScene);
      } finally {
        exiting = false;
      }
      if (destroyed) return;
      currentSceneId = nextScene;
      scenes[nextScene].enter?.(previous);
    } finally {
      transitioning = false;
    }
  };

  if (!Object.prototype.hasOwnProperty.call(scenes, initial)) {
    throw new Error("initial must reference an existing scene");
  }

  scenes[initial].enter?.(null);

  return {
    destroy(): void {
      if (destroyed) return;
      destroyed = true;
      if (!exiting) scenes[currentSceneId].exit?.(currentSceneId);
    },
    draw(context: TDrawContext): void {
      assertActive();
      scenes[currentSceneId].draw?.(context);
    },
    getScene(): GridCanvasScene<TDrawContext> {
      return scenes[currentSceneId];
    },
    getSceneId(): string {
      return currentSceneId;
    },
    isDestroyed(): boolean {
      return destroyed;
    },
    reset(): void {
      assertActive();
      if (transitioning)
        throw new InvalidStateTransitionError(
          "Cannot reset during a scene transition.",
        );
      if (currentSceneId !== initial) {
        changeScene(initial);

        return;
      }

      transitioning = true;
      try {
        scenes[currentSceneId].enter?.(currentSceneId);
      } finally {
        transitioning = false;
      }
    },
    transition(nextScene: string): boolean {
      assertActive();
      if (transitioning) return false;
      const resolvedNextScene = resolveSceneId(nextScene, "nextScene");

      if (!Object.prototype.hasOwnProperty.call(scenes, resolvedNextScene)) {
        return false;
      }

      if (resolvedNextScene === currentSceneId) {
        return true;
      }

      changeScene(resolvedNextScene);

      return true;
    },
    update(elapsed: number): void {
      assertActive();
      if (!Number.isFinite(elapsed)) {
        throw new Error("elapsed must be a finite number");
      }

      scenes[currentSceneId].update?.(elapsed);
    },
  };
}
