# Sprite Animator 1.1

`createSpriteAnimator()` now supports per-animation timing, loop and one-shot playback, completion events and cancellable subscriptions.

```ts
import { createSpriteAnimator } from "grid-canvas-system/runtime";

const animator = createSpriteAnimator({
  initial: "idle",
  animations: {
    idle: {
      frames: ["idle-1", "idle-2"],
      fps: 6,
      loop: true,
    },
    burst: {
      frames: ["burst-1", "burst-2", "burst-3"],
      fps: 12,
      loop: false,
    },
  },
});

animator.play("burst", {
  restart: true,
  onComplete() {
    animator.play("idle");
  },
});
```

Legacy shape remains supported:

```ts
createSpriteAnimator({
  initial: "idle",
  fps: 6,
  loop: true,
  animations: {
    idle: ["idle-1", "idle-2"],
  },
});
```

## Events

```ts
const unsubscribe = animator.subscribe((event) => {
  if (event.type === "frame") {
    draw(event.frame);
  }
});
```

Events are delivered in subscription order. Listener errors are isolated from animator state. `onComplete` only fires for `loop: false` animations and is cancelled when another animation replaces the current one.

## Controls

The animator exposes `play`, `pause`, `resume`, `stop`, `reset`, `destroy`, `getAnimation`, `getFrame`, `getFrameIndex`, `isPlaying`, `isPaused`, `isComplete` and `isDestroyed`.
