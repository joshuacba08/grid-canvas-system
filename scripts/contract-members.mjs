// Operational members returned by public factories, including experimental audio.
export const operationalTypes = new Set([
  "CanvasRuntime",
  "GridCanvasAnimationLoop",
  "GridCanvasFixedStepLoop",
  "GridCanvasKeyTracker",
  "GridCanvasPointerTracker",
  "GridCanvasSceneManager",
  "GridCanvasSpriteAnimator",
  "GridCanvasStateMachine",
  "MassBody",
  "HowlerAssetAudioController",
  "ToneMusicAudioController",
  "ArcadeAudioController",
]);

export function operationalMembers(checker, symbol, ts) {
  if (!operationalTypes.has(symbol.name)) return [];
  const target =
    symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  return checker.getPropertiesOfType(checker.getDeclaredTypeOfSymbol(target));
}
