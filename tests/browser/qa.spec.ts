import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("device QA page renders, receives input, destroys resources and exports evidence", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:43174/qa/");
  await expect(page.locator("#qa-status")).toContainText("Canvas listo");
  await page.locator("#device-model").fill("automated desktop fixture");
  await page.locator("#qa-canvas").click({ position: { x: 40, y: 40 } });
  await page.locator("#qa-start").click();
  await page.locator("#qa-destroy").click();
  await expect(page.locator("#qa-status")).toContainText("Recursos destruidos");
  const downloadEvent = page.waitForEvent("download");
  await page.locator("#qa-export").click();
  const download = await downloadEvent;
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  expect(data.version).toBe(manifest.version);
  expect(data.destroyed).toBe(true);
  expect(data.cleanupVerified).toBe(true);
  expect(data.pointerEvents).toBeGreaterThan(0);
  expect(data.errors).toEqual([]);
  expect(Object.values(data.observations)).not.toContain(true);
});

test("device QA page plays the three real audio controllers and exports their state", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:43174/qa/");
  const supported = await page.evaluate(() =>
    Boolean(window.AudioContext || (window as any).webkitAudioContext),
  );
  test.skip(
    !supported,
    `Web Audio unavailable in this environment on ${process.platform}`,
  );
  await page.locator("#qa-prepare").click();
  await expect(page.locator("#qa-play")).toBeEnabled();
  for (const id of ["arcade", "howler", "tone"]) {
    await page.locator(`#qa-${id}`).click();
    await expect(page.locator("#qa-status")).toContainText(
      `Señal de ${id} reproducida`,
    );
  }
  await page.locator("#qa-destroy").click();
  await expect(page.locator("#qa-status")).toContainText("Recursos destruidos");
  const event = page.waitForEvent("download");
  await page.locator("#qa-export").click();
  const download = await event;
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(data.audioSystems).toEqual({ arcade: true, howler: true, tone: true });
  expect(data.cleanupVerified).toBe(true);
  expect(data.errors).toEqual([]);
});
