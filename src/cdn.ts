import GridCanvasSystem, {
  CanvasContextUnavailableError,
  CanvasTargetNotFoundError,
  InvalidStateTransitionError,
  RuntimeDestroyedError,
  UnknownAnimationError,
} from "./index";

// The browser global is the constructor documented by every script-tag example.
// Keep .default for consumers of the former namespace-shaped UMD bundle.
export default Object.assign(GridCanvasSystem, {
  CanvasContextUnavailableError,
  CanvasTargetNotFoundError,
  InvalidStateTransitionError,
  RuntimeDestroyedError,
  UnknownAnimationError,
  default: GridCanvasSystem,
});
