import { expect, test } from "@playwright/test";
import { readdirSync } from "node:fs";
import { playgroundExamples } from "../../site/src/data/playgroundExamples";

test("CDN script exposes the documented constructor and its helpers", async ({
  page,
}) => {
  await page.goto("/");
  await page.addScriptTag({ url: "/dist/grid-canvas-system.umd.js" });
  const result = await page.evaluate(() => {
    const Constructor = (window as any).GridCanvasSystem;
    const grid = new Constructor("canvas", { width: 80, height: 60 });
    grid.drawCoordinate(20, 20);
    grid.clearCanvas();
    return {
      width: grid.options.width,
      runtime: typeof Constructor.runtime.createCanvasRuntime,
      error: typeof Constructor.RuntimeDestroyedError,
      alias: Constructor.default === Constructor,
    };
  });
  expect(result).toEqual({
    width: 80,
    runtime: "function",
    error: "function",
    alias: true,
  });
});

test("controlled pixel sprite has exact RGBA output and a reviewed browser snapshot", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => "library" in window);
  const pixels = await page.evaluate(() => {
    const Constructor = (window as any).library.GridCanvasSystem;
    const grid = new Constructor("canvas", {
      width: 40,
      height: 40,
      devicePixelRatio: 1,
    });
    grid.clearCanvas({ redrawGrid: false });
    grid.ctx.fillStyle = "#000000";
    grid.ctx.fillRect(0, 0, 40, 40);
    grid.drawCompiledPixelSprite(
      Constructor.compilePixelSprite(["ab", "ba"], { a: "#ff0000", b: "#00ff00" }),
      { x: 0, y: 0, pixelSize: 20 },
    );
    return [...grid.ctx.getImageData(0, 0, 40, 40).data];
  });
  for (let y = 0; y < 40; y++)
    for (let x = 0; x < 40; x++) {
      const red = x < 20 === y < 20;
      expect(pixels.slice((y * 40 + x) * 4, (y * 40 + x + 1) * 4)).toEqual(
        red ? [255, 0, 0, 255] : [0, 255, 0, 255],
      );
    }
  expect(await page.locator("canvas").screenshot()).toMatchSnapshot(
    "controlled-pixels.png",
    { maxDiffPixels: 0, threshold: 0 },
  );
});

for (const example of readdirSync("examples/vanilla", { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)) {
  test(`example ${example} loads the candidate and renders`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(
      "https://cdn.jsdelivr.net/npm/grid-canvas-system/**",
      async (route) => {
        await route.fulfill({
          response: await page.request.get(
            "http://127.0.0.1:43173/dist/grid-canvas-system.umd.js",
          ),
        });
      },
    );
    await page.goto(`/examples/vanilla/${example}/index.html`);
    await expect(page.locator("canvas").first()).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator("canvas")
          .first()
          .evaluate((canvas) =>
            [
              ...(canvas as HTMLCanvasElement)
                .getContext("2d")!
                .getImageData(0, 0, 40, 40).data,
            ].some((value) => value !== 0),
          ),
      )
      .toBe(true);
    expect(errors).toEqual([]);
  });
}

test("built multilingual website, docs, tutorials and playground load", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/es/",
    "/ja/",
    "/docs/",
    "/es/docs/",
    "/tutorials/basic/",
    "/es/tutorials/pacman/",
    "/ja/tutorials/pacman/",
    "/playground/",
  ]) {
    const response = await page.goto(`http://127.0.0.1:43174${path}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main").first()).toBeVisible();
  }
  expect(errors).toEqual([]);
});

for (const example of playgroundExamples) {
  test(`playground ${example.id} executes the published template`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:43174/playground/?example=${example.id}`);
    await expect(page.locator("[data-playground-status] b")).toHaveText("Running");
    const preview = page.frameLocator("[data-preview-frame]");
    await expect(preview.locator("canvas")).toBeVisible();
    await expect
      .poll(() =>
        preview.locator("canvas").evaluate((canvas) => {
          const element = canvas as HTMLCanvasElement;
          const ctx = element.getContext("2d")!;
          return ctx
            .getImageData(0, 0, element.width, element.height)
            .data.some((byte, index) => index % 4 !== 3 && byte !== 0);
        }),
      )
      .toBe(true);
    if (example.id === "audio-arcade") {
      const supported = await page.evaluate(() =>
        Boolean(window.AudioContext || (window as any).webkitAudioContext),
      );
      if (supported) {
        await preview.locator("#audio-shoot").click();
        await expect(preview.locator("#audio-status")).toHaveText("Played shoot SFX.");
        await preview.locator("#audio-loop").click();
        await expect(preview.locator("#audio-status")).toHaveText(
          "Patrol loop running.",
        );
        await preview.locator("#audio-stop").click();
        await expect(preview.locator("#audio-status")).toHaveText(
          "Stopped the active loop.",
        );
      } else {
        await expect(preview.locator("#audio-status")).toContainText("unavailable");
        await expect(preview.locator("#audio-shoot")).toBeDisabled();
      }
    }
    await page.locator("[data-run-code]").click();
    await expect(page.locator("[data-playground-status] b")).toHaveText("Running");
    expect(errors).toEqual([]);
  });
}
