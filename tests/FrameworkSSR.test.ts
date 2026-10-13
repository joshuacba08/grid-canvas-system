// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createSSRApp, h } from "vue";
import { renderToString as renderVue } from "vue/server-renderer";
import { createCanvasRuntime } from "../src/runtime";

describe("framework SSR imports", () => {
  it("renders React and Vue canvas markup without creating browser runtimes", async () => {
    expect(typeof createCanvasRuntime).toBe("function");
    expect(renderToString(createElement("canvas", { width: 40 }))).toContain("<canvas");
    expect(
      await renderVue(createSSRApp({ render: () => h("canvas", { width: 40 }) })),
    ).toContain("<canvas");
    expect(typeof window).toBe("undefined");
  });
});
