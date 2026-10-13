import { expect, test } from "@playwright/test";

test("30 minutes of rendering, resize, scenes and real audio followed by teardown", async ({
  page,
  browser,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
  await page.goto("/");
  await page.waitForFunction(() => "library" in window);
  await page.evaluate(() => {
    document.querySelector("button")!.addEventListener("click", async () => {
      try {
        const api = (window as any).library;
        let frames = 0;
        const arcade = api.createArcadeAudio();
        await arcade.resume();
        await arcade.playLoop("patrol");
        const tone = await api.createToneMusicAudio();
        await tone.resume();
        tone.registerSequence("theme", {
          loop: true,
          steps: [{ note: "E4", time: 0, duration: "8n" }],
        });
        await tone.playSequence("theme");
        const howler = await api.createHowlerAssetAudio({ beep: { src: "/test.wav" } });
        const scene = api.createSceneManager({
          initial: "a",
          scenes: { a: {}, b: {} },
        });
        const runtime = api.createCanvasRuntime({
          canvas: document.querySelector("canvas"),
          logicalWidth: 100,
          logicalHeight: 80,
          render: (ctx: CanvasRenderingContext2D) => {
            ctx.clearRect(0, 0, 120, 100);
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(frames++ % 80, 0, 8, 8);
          },
        });
        runtime.start();
        (window as any).soak = {
          api,
          runtime,
          scene,
          arcade,
          tone,
          howler,
          frames: () => frames,
        };
      } catch (error) {
        (window as any).soakError = String(error);
      }
    });
  });
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean((window as any).soak) || (window as any).soakError),
    )
    .toBe(true);
  const started = Date.now();
  let cycles = 0;
  while (Date.now() - started < 30 * 60 * 1000) {
    await page.evaluate(async (index) => {
      const s = (window as any).soak;
      s.runtime.resize({ width: index % 2 ? 100 : 120, height: index % 2 ? 80 : 100 });
      s.scene.transition(index % 2 ? "a" : "b");
      await s.arcade.playShoot();
      await s.tone.trigger("main", "C4", "32n");
      s.howler.play("beep");
      s.runtime.pause();
      s.runtime.renderOnce();
      s.runtime.resume();
    }, cycles++);
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
    if (cycles % 300 === 0)
      console.log(
        `Soak: ${Math.round((Date.now() - started) / 60000)} min, ${cycles} cycles`,
      );
  }
  const result = await page.evaluate(async () => {
    const s = (window as any).soak;
    s.runtime.destroy();
    s.scene.destroy();
    s.howler.dispose();
    s.tone.dispose();
    await s.arcade.dispose();
    const frames = s.frames();
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    return {
      stopped: s.frames() === frames,
      frames,
      destroyed: s.runtime.isDestroyed() && s.scene.isDestroyed(),
    };
  });
  expect(result.stopped).toBe(true);
  expect(result.destroyed).toBe(true);
  expect(errors).toEqual([]);
  await testInfo.attach("soak-evidence", {
    body: JSON.stringify(
      {
        elapsedMs: Date.now() - started,
        cycles,
        ...result,
        browser: await browser.version(),
        node: process.version,
        errors,
      },
      null,
      2,
    ),
    contentType: "application/json",
  });
});
