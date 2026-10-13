import { expect, test } from "@playwright/test";

test("real React StrictMode, Vue, Angular and custom elements clean up on unmount", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.addScriptTag({
    type: "module",
    url: "/tests/__artifacts__/browser/framework-fixture.js",
  });
  await expect
    .poll(() => page.evaluate(() => "exerciseFrameworks" in window))
    .toBe(true);
  const result = await page.evaluate(() => (window as any).exerciseFrameworks());
  expect(result.count).toBeGreaterThanOrEqual(4);
  expect(result.destroyed).toBe(true);
  expect(errors).toEqual([]);
});
