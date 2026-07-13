import { RuntimeDestroyedError } from "./errors";
import type { Unsubscribe } from "./createCanvasRuntime";

export interface StateTransitionEvent<TState extends string = string> {
  from: TState;
  to: TState;
  timestamp: number;
  metadata?: unknown;
}

export interface StateHistoryEntry<TState extends string = string> {
  from: TState;
  to: TState;
  timestamp: number;
  metadata?: unknown;
}

export interface StateLifecycleContext<TState extends string = string> {
  from: TState | null;
  to: TState;
  metadata?: unknown;
}

export interface StateDefinition<TState extends string = string> {
  onEnter?: (context: StateLifecycleContext<TState>) => void;
  onExit?: (context: StateLifecycleContext<TState>) => void;
}

export interface StateTransitionOptions {
  metadata?: unknown;
}

export interface GridCanvasStateMachineOptions<TState extends string = string> {
  initial: TState;
  transitions: Record<TState, readonly TState[]>;
  states?: Partial<Record<TState, StateDefinition<TState>>>;
  historyLimit?: number;
  now?: () => number;
}

export interface GridCanvasStateMachine<TState extends string = string> {
  canTransition(nextState: TState): boolean;
  destroy(): void;
  getHistory(): readonly StateHistoryEntry<TState>[];
  getState(): TState;
  isDestroyed(): boolean;
  reset(): void;
  subscribe(listener: (event: StateTransitionEvent<TState>) => void): Unsubscribe;
  transition(nextState: TState, options?: StateTransitionOptions): boolean;
}

function resolveTransitions<TState extends string>(
  transitions: Record<TState, readonly TState[]>,
): Record<TState, readonly TState[]> {
  if (
    transitions === null ||
    typeof transitions !== "object" ||
    Array.isArray(transitions)
  ) {
    throw new Error("transitions must be an object");
  }

  for (const [state, nextStates] of Object.entries(transitions)) {
    if (!Array.isArray(nextStates)) {
      throw new Error(`transitions.${state} must be an array`);
    }

    nextStates.forEach((nextState, index) => {
      if (typeof nextState !== "string" || nextState.length === 0) {
        throw new Error(`transitions.${state}[${index}] must be a non-empty string`);
      }

      if (!Object.prototype.hasOwnProperty.call(transitions, nextState)) {
        throw new Error(`transitions.${state} references unknown state "${nextState}"`);
      }
    });
  }

  return transitions;
}

function resolveHistoryLimit(value: number | undefined): number {
  if (value === undefined) {
    return 0;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("historyLimit must be a non-negative integer");
  }

  return value;
}

export function createStateMachine<TState extends string = string>(
  options: GridCanvasStateMachineOptions<TState>,
): GridCanvasStateMachine<TState> {
  const transitions = resolveTransitions(options.transitions);
  const initial = options.initial;
  const states: Partial<Record<TState, StateDefinition<TState>>> = options.states ?? {};
  const historyLimit = resolveHistoryLimit(options.historyLimit);
  const now = options.now ?? Date.now;
  const subscribers = new Set<(event: StateTransitionEvent<TState>) => void>();
  const history: StateHistoryEntry<TState>[] = [];
  let currentState = initial;
  let destroyed = false;

  if (!Object.prototype.hasOwnProperty.call(transitions, initial)) {
    throw new Error("initial must reference an existing state");
  }

  const assertActive = (): void => {
    if (destroyed) {
      throw new RuntimeDestroyedError("State machine has been destroyed.");
    }
  };

  const emit = (event: StateTransitionEvent<TState>): void => {
    for (const subscriber of [...subscribers]) {
      try {
        subscriber(event);
      } catch {
        // Listener failures are isolated from machine state.
      }
    }
  };

  const pushHistory = (event: StateTransitionEvent<TState>): void => {
    if (historyLimit === 0) {
      return;
    }

    history.push({ ...event });

    if (history.length > historyLimit) {
      history.splice(0, history.length - historyLimit);
    }
  };

  return {
    canTransition(nextState: TState): boolean {
      if (destroyed) {
        return false;
      }

      return transitions[currentState].includes(nextState);
    },
    destroy(): void {
      if (destroyed) {
        return;
      }

      destroyed = true;
      subscribers.clear();
      history.length = 0;
    },
    getHistory(): readonly StateHistoryEntry<TState>[] {
      return history.map((entry) => ({ ...entry }));
    },
    getState(): TState {
      return currentState;
    },
    isDestroyed(): boolean {
      return destroyed;
    },
    reset(): void {
      assertActive();
      currentState = initial;
      history.length = 0;
    },
    subscribe(listener): Unsubscribe {
      assertActive();
      subscribers.add(listener);

      return () => {
        subscribers.delete(listener);
      };
    },
    transition(
      nextState: TState,
      transitionOptions: StateTransitionOptions = {},
    ): boolean {
      assertActive();

      if (!this.canTransition(nextState)) {
        return false;
      }

      const from = currentState;
      const context: StateLifecycleContext<TState> = {
        from,
        to: nextState,
        metadata: transitionOptions.metadata,
      };

      states[from]?.onExit?.(context);
      currentState = nextState;
      states[nextState]?.onEnter?.(context);

      const event: StateTransitionEvent<TState> = {
        from,
        to: nextState,
        timestamp: now(),
        metadata: transitionOptions.metadata,
      };

      pushHistory(event);
      emit(event);

      return true;
    },
  };
}
