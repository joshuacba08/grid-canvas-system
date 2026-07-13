export type MotionPreference = "reduce" | "no-preference";

export type ReducedMotionBehavior = "ignore" | "pause" | "lower-fps";

type MotionPreferenceWindow = Pick<Window, "matchMedia">;

export function getMotionPreference(
  targetWindow?: MotionPreferenceWindow,
): MotionPreference {
  const resolvedWindow =
    targetWindow ??
    (typeof window === "undefined" ? undefined : (window as MotionPreferenceWindow));

  if (resolvedWindow === undefined || typeof resolvedWindow.matchMedia !== "function") {
    return "no-preference";
  }

  return resolvedWindow.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "reduce"
    : "no-preference";
}
