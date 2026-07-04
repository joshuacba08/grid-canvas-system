export interface GridCanvasStateMachineOptions {
  initial: string;
  transitions: Record<string, readonly string[]>;
}

export interface GridCanvasStateMachine {
  canTransition(nextState: string): boolean;
  getState(): string;
  reset(): void;
  transition(nextState: string): boolean;
}

function resolveTransitions(
  transitions: Record<string, readonly string[]>,
): Record<string, readonly string[]> {
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

export function createStateMachine(
  options: GridCanvasStateMachineOptions,
): GridCanvasStateMachine {
  const transitions = resolveTransitions(options.transitions);
  const initial = options.initial;
  let currentState = initial;

  if (!Object.prototype.hasOwnProperty.call(transitions, initial)) {
    throw new Error("initial must reference an existing state");
  }

  return {
    canTransition(nextState: string): boolean {
      return transitions[currentState].includes(nextState);
    },
    getState(): string {
      return currentState;
    },
    reset(): void {
      currentState = initial;
    },
    transition(nextState: string): boolean {
      if (!this.canTransition(nextState)) {
        return false;
      }

      currentState = nextState;

      return true;
    },
  };
}
