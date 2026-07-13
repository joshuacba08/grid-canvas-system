// @vitest-environment node
import { describe, expect, it } from "vitest";

import GridCanvasSystem, { CanvasTargetNotFoundError } from "../src";

describe("SSR-safe imports", () => {
  it("can import the package without browser globals", () => {
    expect(typeof GridCanvasSystem).toBe("function");
    expect(typeof GridCanvasSystem.runtime.createCanvasRuntime).toBe("function");
  });

  it("throws an explicit domain error when resolving an id without document", () => {
    expect(() => new GridCanvasSystem("canvas")).toThrow(CanvasTargetNotFoundError);
  });
});
