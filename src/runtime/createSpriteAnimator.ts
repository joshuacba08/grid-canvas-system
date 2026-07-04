export interface GridCanvasSpriteAnimatorOptions {
  animations: Record<string, readonly string[]>;
  initial: string;
  fps: number;
  loop?: boolean;
}

export interface GridCanvasSpriteAnimator {
  getCurrentAnimation(): string;
  getFrame(): string;
  play(animation: string): boolean;
  reset(): void;
  update(elapsed: number): void;
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

function resolveNonNegative(value: number, name: string): number {
  const resolvedValue = resolveFinite(value, name);

  if (resolvedValue < 0) {
    throw new Error(`${name} must be greater than or equal to 0`);
  }

  return resolvedValue;
}

function resolveAnimations(
  animations: Record<string, readonly string[]>,
): Record<string, readonly string[]> {
  if (
    animations === null ||
    typeof animations !== "object" ||
    Array.isArray(animations)
  ) {
    throw new Error("animations must be an object");
  }

  for (const [name, frames] of Object.entries(animations)) {
    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error(`animations.${name} must contain at least one frame`);
    }

    frames.forEach((frame, index) => {
      if (typeof frame !== "string" || frame.length === 0) {
        throw new Error(`animations.${name}[${index}] must be a non-empty string`);
      }
    });
  }

  return animations;
}

export function createSpriteAnimator(
  options: GridCanvasSpriteAnimatorOptions,
): GridCanvasSpriteAnimator {
  const animations = resolveAnimations(options.animations);
  const fps = resolvePositive(options.fps, "fps");
  const loop = options.loop ?? true;
  const secondsPerFrame = 1 / fps;
  let currentAnimation = options.initial;
  let frameIndex = 0;
  let elapsedInFrame = 0;

  if (!Object.prototype.hasOwnProperty.call(animations, currentAnimation)) {
    throw new Error("initial must reference an existing animation");
  }

  const resetPlayback = (animation: string): void => {
    currentAnimation = animation;
    frameIndex = 0;
    elapsedInFrame = 0;
  };

  return {
    getCurrentAnimation(): string {
      return currentAnimation;
    },
    getFrame(): string {
      return animations[currentAnimation][frameIndex];
    },
    play(animation: string): boolean {
      if (!Object.prototype.hasOwnProperty.call(animations, animation)) {
        return false;
      }

      if (animation !== currentAnimation) {
        resetPlayback(animation);
      }

      return true;
    },
    reset(): void {
      resetPlayback(options.initial);
    },
    update(elapsed: number): void {
      const resolvedElapsed = resolveNonNegative(elapsed, "elapsed");

      elapsedInFrame += resolvedElapsed;

      const elapsedFrames = Math.floor(elapsedInFrame / secondsPerFrame);

      if (elapsedFrames === 0) {
        return;
      }

      elapsedInFrame -= elapsedFrames * secondsPerFrame;

      const frames = animations[currentAnimation];

      if (loop) {
        frameIndex = (frameIndex + elapsedFrames) % frames.length;
        return;
      }

      frameIndex = Math.min(frames.length - 1, frameIndex + elapsedFrames);
    },
  };
}
