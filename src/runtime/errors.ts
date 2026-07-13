export class CanvasTargetNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanvasTargetNotFoundError";
  }
}

export class CanvasContextUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanvasContextUnavailableError";
  }
}

export class RuntimeDestroyedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RuntimeDestroyedError";
  }
}

export class InvalidStateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStateTransitionError";
  }
}

export class UnknownAnimationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownAnimationError";
  }
}
