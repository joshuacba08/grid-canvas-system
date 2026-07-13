# State Machine 1.1

`createStateMachine<TState>()` provides a small typed transition helper with subscriptions, lifecycle hooks and bounded history.

```ts
import { createStateMachine } from "grid-canvas-system/runtime";

type Mode = "idle" | "active" | "complete";

const machine = createStateMachine<Mode>({
  initial: "idle",
  transitions: {
    idle: ["active"],
    active: ["complete", "idle"],
    complete: ["idle"],
  },
  historyLimit: 20,
});

const unsubscribe = machine.subscribe(({ from, to }) => {
  console.log(`${from} -> ${to}`);
});
```

## Lifecycle Hooks

For a valid transition, the order is:

1. Validate transition.
2. Run `onExit` on the previous state.
3. Update internal state.
4. Run `onEnter` on the new state.
5. Store history, then notify subscribers.

```ts
const machine = createStateMachine({
  initial: "idle",
  transitions,
  states: {
    active: {
      onEnter() {
        animator.play("active");
      },
    },
  },
});
```

Invalid transitions return `false` and do not change state. A same-state transition is invalid unless it is explicitly listed in that state's transition array.

## Cleanup

`destroy()` clears subscribers and history. `getHistory()` returns a copy, capped by `historyLimit`; `historyLimit: 0` disables history.
