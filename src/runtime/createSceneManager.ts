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
  draw(context: TDrawContext): void;
  getScene(): GridCanvasScene<TDrawContext>;
  getSceneId(): string;
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

  if (!Object.prototype.hasOwnProperty.call(scenes, initial)) {
    throw new Error("initial must reference an existing scene");
  }

  scenes[initial].enter?.(null);

  return {
    draw(context: TDrawContext): void {
      scenes[currentSceneId].draw?.(context);
    },
    getScene(): GridCanvasScene<TDrawContext> {
      return scenes[currentSceneId];
    },
    getSceneId(): string {
      return currentSceneId;
    },
    reset(): void {
      if (currentSceneId !== initial) {
        scenes[currentSceneId].exit?.(initial);
        const previousSceneId = currentSceneId;
        currentSceneId = initial;
        scenes[currentSceneId].enter?.(previousSceneId);

        return;
      }

      scenes[currentSceneId].enter?.(currentSceneId);
    },
    transition(nextScene: string): boolean {
      const resolvedNextScene = resolveSceneId(nextScene, "nextScene");

      if (!Object.prototype.hasOwnProperty.call(scenes, resolvedNextScene)) {
        return false;
      }

      if (resolvedNextScene === currentSceneId) {
        return true;
      }

      const previousSceneId = currentSceneId;

      scenes[currentSceneId].exit?.(resolvedNextScene);
      currentSceneId = resolvedNextScene;
      scenes[currentSceneId].enter?.(previousSceneId);

      return true;
    },
    update(elapsed: number): void {
      if (!Number.isFinite(elapsed)) {
        throw new Error("elapsed must be a finite number");
      }

      scenes[currentSceneId].update?.(elapsed);
    },
  };
}
