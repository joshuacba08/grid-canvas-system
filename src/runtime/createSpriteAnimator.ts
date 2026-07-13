import { RuntimeDestroyedError, UnknownAnimationError } from "./errors";
import type { Unsubscribe } from "./createCanvasRuntime";

export type SpriteAnimatorEventType =
  "play" | "pause" | "resume" | "frame" | "complete" | "stop";

export interface SpriteAnimation<TFrame> {
  frames: readonly TFrame[];
  fps?: number;
  loop?: boolean;
}

export interface PlayAnimationOptions {
  restart?: boolean;
  onComplete?: () => void;
}

export interface AnimationCompleteEvent<TAnimation extends string> {
  animation: TAnimation;
  elapsedMs: number;
}

export interface SpriteAnimatorEvent<TAnimation extends string, TFrame> {
  type: SpriteAnimatorEventType;
  animation: TAnimation;
  frame: TFrame;
  frameIndex: number;
  elapsedMs: number;
}

export interface GridCanvasSpriteAnimatorOptions<
  TAnimation extends string = string,
  TFrame = string,
> {
  animations: Record<TAnimation, readonly TFrame[] | SpriteAnimation<TFrame>>;
  initial: TAnimation;
  fps?: number;
  loop?: boolean;
}

export interface GridCanvasSpriteAnimator<
  TAnimation extends string = string,
  TFrame = string,
> {
  destroy(): void;
  getAnimation(): TAnimation;
  getCurrentAnimation(): TAnimation;
  getFrame(): TFrame;
  getFrameIndex(): number;
  isComplete(): boolean;
  isDestroyed(): boolean;
  isPaused(): boolean;
  isPlaying(): boolean;
  onComplete(
    listener: (event: AnimationCompleteEvent<TAnimation>) => void,
  ): Unsubscribe;
  pause(): void;
  play(animation: TAnimation, options?: PlayAnimationOptions): boolean;
  reset(): void;
  resume(): void;
  stop(): void;
  subscribe(
    listener: (event: SpriteAnimatorEvent<TAnimation, TFrame>) => void,
  ): Unsubscribe;
  update(elapsed: number): void;
}

type SpriteAnimationInput<TFrame> = readonly TFrame[] | SpriteAnimation<TFrame>;
type SpriteAnimationMap<TFrame = unknown> = Record<
  string,
  SpriteAnimationInput<TFrame>
>;
type AnimationKey<TAnimations> = Extract<keyof TAnimations, string>;
type FrameFromAnimation<TAnimation> = TAnimation extends readonly (infer TFrame)[]
  ? TFrame
  : TAnimation extends SpriteAnimation<infer TFrame>
    ? TFrame
    : never;
type AnimationFrameFromMap<TAnimations extends SpriteAnimationMap> = FrameFromAnimation<
  TAnimations[keyof TAnimations]
>;

interface ResolvedAnimation<TFrame> {
  frames: readonly TFrame[];
  fps: number;
  loop: boolean;
  secondsPerFrame: number;
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

function isAnimationDefinition<TFrame>(
  value: readonly TFrame[] | SpriteAnimation<TFrame>,
): value is SpriteAnimation<TFrame> {
  return !Array.isArray(value);
}

function resolveAnimations<TAnimation extends string, TFrame>(
  animations: Record<TAnimation, readonly TFrame[] | SpriteAnimation<TFrame>>,
  defaultFps: number,
  defaultLoop: boolean,
): Record<TAnimation, ResolvedAnimation<TFrame>> {
  if (
    animations === null ||
    typeof animations !== "object" ||
    Array.isArray(animations)
  ) {
    throw new Error("animations must be an object");
  }

  const resolvedEntries = Object.entries(animations).map(([name, value]) => {
    const definition = value as readonly TFrame[] | SpriteAnimation<TFrame>;
    const frames = isAnimationDefinition(definition) ? definition.frames : definition;

    if (!Array.isArray(frames) || frames.length === 0) {
      throw new Error(`animations.${name} must contain at least one frame`);
    }

    const fps = resolvePositive(
      isAnimationDefinition(definition) ? (definition.fps ?? defaultFps) : defaultFps,
      `animations.${name}.fps`,
    );

    return [
      name,
      {
        frames,
        fps,
        loop: isAnimationDefinition(definition)
          ? (definition.loop ?? defaultLoop)
          : defaultLoop,
        secondsPerFrame: 1 / fps,
      },
    ] as const;
  });

  return Object.fromEntries(resolvedEntries) as unknown as Record<
    TAnimation,
    ResolvedAnimation<TFrame>
  >;
}

export function createSpriteAnimator<
  const TAnimations extends SpriteAnimationMap,
>(options: {
  animations: TAnimations;
  fps?: number;
  initial: AnimationKey<TAnimations>;
  loop?: boolean;
}): GridCanvasSpriteAnimator<
  AnimationKey<TAnimations>,
  AnimationFrameFromMap<TAnimations>
>;
export function createSpriteAnimator<
  TAnimation extends string = string,
  TFrame = string,
>(
  options: GridCanvasSpriteAnimatorOptions<TAnimation, TFrame>,
): GridCanvasSpriteAnimator<TAnimation, TFrame>;
export function createSpriteAnimator(
  options: GridCanvasSpriteAnimatorOptions<string, unknown>,
): GridCanvasSpriteAnimator<string, unknown> {
  const defaultFps = resolvePositive(options.fps ?? 1, "fps");
  const defaultLoop = options.loop ?? true;
  const animations = resolveAnimations(options.animations, defaultFps, defaultLoop);
  let currentAnimation = options.initial;
  let frameIndex = 0;
  let elapsedInFrame = 0;
  let elapsedInAnimationMs = 0;
  let playing = true;
  let paused = false;
  let complete = false;
  let destroyed = false;
  let playCompleteCallback: (() => void) | undefined;
  const subscribers = new Set<(event: SpriteAnimatorEvent<string, unknown>) => void>();
  const completeSubscribers = new Set<
    (event: AnimationCompleteEvent<string>) => void
  >();

  if (!Object.prototype.hasOwnProperty.call(animations, currentAnimation)) {
    throw new Error("initial must reference an existing animation");
  }

  const assertActive = (): void => {
    if (destroyed) {
      throw new RuntimeDestroyedError("Sprite animator has been destroyed.");
    }
  };

  const getResolvedAnimation = (): ResolvedAnimation<unknown> =>
    animations[currentAnimation];

  const getCurrentFrame = (): unknown => getResolvedAnimation().frames[frameIndex];

  const emit = (type: SpriteAnimatorEventType): void => {
    if (subscribers.size === 0) {
      return;
    }

    const event: SpriteAnimatorEvent<string, unknown> = {
      type,
      animation: currentAnimation,
      frame: getCurrentFrame(),
      frameIndex,
      elapsedMs: elapsedInAnimationMs,
    };

    for (const subscriber of [...subscribers]) {
      try {
        subscriber(event);
      } catch {
        // Listener failures are isolated from animator state.
      }
    }
  };

  const emitComplete = (): void => {
    const event = {
      animation: currentAnimation,
      elapsedMs: elapsedInAnimationMs,
    };
    const callback = playCompleteCallback;

    playCompleteCallback = undefined;

    try {
      callback?.();
    } catch {
      // Completion callback failures are isolated from animator state.
    }

    for (const subscriber of [...completeSubscribers]) {
      try {
        subscriber(event);
      } catch {
        // Listener failures are isolated from animator state.
      }
    }

    emit("complete");
  };

  const resetPlayback = (animation: string): void => {
    currentAnimation = animation;
    frameIndex = 0;
    elapsedInFrame = 0;
    elapsedInAnimationMs = 0;
    playing = true;
    paused = false;
    complete = false;
  };

  const ensureKnownAnimation = (animation: string): boolean => {
    if (Object.prototype.hasOwnProperty.call(animations, animation)) {
      return true;
    }

    return false;
  };

  return {
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      playing = false;
      paused = false;
      playCompleteCallback = undefined;
      subscribers.clear();
      completeSubscribers.clear();
    },
    getAnimation(): string {
      return currentAnimation;
    },
    getCurrentAnimation(): string {
      return currentAnimation;
    },
    getFrame(): unknown {
      return getCurrentFrame();
    },
    getFrameIndex(): number {
      return frameIndex;
    },
    isComplete(): boolean {
      return complete;
    },
    isDestroyed(): boolean {
      return destroyed;
    },
    isPaused(): boolean {
      return paused;
    },
    isPlaying(): boolean {
      return playing && !paused && !complete;
    },
    onComplete(listener): Unsubscribe {
      assertActive();
      completeSubscribers.add(listener);

      return () => {
        completeSubscribers.delete(listener);
      };
    },
    pause(): void {
      assertActive();

      if (!playing || paused || complete) {
        return;
      }

      paused = true;
      emit("pause");
    },
    play(animation: string, playOptions: PlayAnimationOptions = {}): boolean {
      assertActive();

      if (!ensureKnownAnimation(animation)) {
        return false;
      }

      const shouldRestart =
        animation !== currentAnimation ||
        playOptions.restart === true ||
        complete ||
        !playing;

      playCompleteCallback = playOptions.onComplete;

      if (shouldRestart) {
        resetPlayback(animation);
      } else {
        playing = true;
        paused = false;
      }

      emit("play");

      return true;
    },
    reset(): void {
      assertActive();
      playCompleteCallback = undefined;
      resetPlayback(options.initial);
      emit("play");
    },
    resume(): void {
      assertActive();

      if (!playing || !paused || complete) {
        return;
      }

      paused = false;
      emit("resume");
    },
    stop(): void {
      assertActive();

      playing = false;
      paused = false;
      complete = false;
      frameIndex = 0;
      elapsedInFrame = 0;
      elapsedInAnimationMs = 0;
      playCompleteCallback = undefined;
      emit("stop");
    },
    subscribe(listener): Unsubscribe {
      assertActive();
      subscribers.add(listener);

      return () => {
        subscribers.delete(listener);
      };
    },
    update(elapsed: number): void {
      assertActive();

      if (!playing || paused || complete) {
        return;
      }

      const resolvedElapsed = resolveNonNegative(elapsed, "elapsed");
      const animation = getResolvedAnimation();

      elapsedInFrame += resolvedElapsed;
      elapsedInAnimationMs += resolvedElapsed * 1000;

      const elapsedFrames = Math.floor(elapsedInFrame / animation.secondsPerFrame);

      if (elapsedFrames === 0) {
        return;
      }

      elapsedInFrame -= elapsedFrames * animation.secondsPerFrame;

      if (animation.loop) {
        frameIndex = (frameIndex + elapsedFrames) % animation.frames.length;
        emit("frame");
        return;
      }

      const nextFrameIndex = Math.min(
        animation.frames.length - 1,
        frameIndex + elapsedFrames,
      );

      if (nextFrameIndex !== frameIndex) {
        frameIndex = nextFrameIndex;
        emit("frame");
      }

      if (frameIndex === animation.frames.length - 1 && !complete) {
        complete = true;
        playing = false;
        emitComplete();
      }
    },
  };
}

export { UnknownAnimationError };
