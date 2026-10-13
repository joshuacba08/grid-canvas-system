import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  await page.goto("/");
  await page.waitForFunction(() => "library" in window);
  // The Windows WebKit build has no Web Audio. Do not manufacture a passing
  // audio result: record this platform limitation; Linux/macOS run these cases.
  const supported = await page.evaluate(
    () => "AudioContext" in window || "webkitAudioContext" in window,
  );
  test.skip(
    !supported,
    `Web Audio unavailable in ${testInfo.project.name} on ${process.platform}`,
  );
});

test("real Web Audio unlocks from a gesture, plays, suspends and disposes", async ({
  page,
}) => {
  await page.evaluate(() => {
    const api = (window as any).library;
    document.querySelector("button")!.addEventListener("click", async () => {
      try {
        const a = api.createArcadeAudio();
        const b = api.createArcadeAudio();
        await a.playShoot();
        await a.playPickup();
        await a.playExplosion();
        const id = await a.playLoop("patrol");
        a.stopLoop(id);
        await a.suspend();
        await a.resume();
        await a.dispose();
        await a.dispose();
        await b.playShoot();
        await b.dispose();
        (window as any).audioResult = "passed";
      } catch (error) {
        (window as any).audioResult =
          error instanceof Error ? error.stack : String(error);
      }
    });
  });
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).audioResult))
    .toBe("passed");
});

test("real Howler assets load and controller controls leave global audio untouched", async ({
  page,
}) => {
  await page.evaluate(() => {
    document.querySelector("button")!.addEventListener("click", async () => {
      try {
        const api = (window as any).library;
        const Howler = (window as any).peers.Howler;
        const original = Howler.volume();
        const a = await api.createHowlerAssetAudio({ tone: { src: "/test.wav" } });
        const b = await api.createHowlerAssetAudio({ tone: { src: "/test.wav" } });
        const first = a.play("tone");
        const second = b.play("tone");
        const soundB = Howler._howls[Howler._howls.length - 1];
        await new Promise<void>((resolve, reject) => {
          if (soundB.state() === "loaded") resolve();
          else {
            soundB.once("load", resolve);
            soundB.once("loaderror", (_id: unknown, error: unknown) => reject(error));
          }
        });
        a.setVolume(0.2);
        a.mute(true);
        a.stop();
        a.dispose();
        const isolated =
          Howler.volume() === original &&
          soundB.volume() === 1 &&
          !soundB._muted &&
          soundB.state() === "loaded";
        b.pause();
        b.play("tone");
        b.fade("tone", 1, 0.5, 30);
        b.unload();
        b.dispose();
        (window as any).audioResult = {
          isolated,
          first: typeof first,
          second: typeof second,
        };
      } catch (error) {
        (window as any).audioResult =
          error instanceof Error ? error.stack : String(error);
      }
    });
  });
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).audioResult))
    .toEqual({ isolated: true, first: "number", second: "number" });
});

test("real Howler reports a failed asset load", async ({ page }) => {
  await page.evaluate(async () => {
    const audio = await (window as any).library.createHowlerAssetAudio({
      missing: {
        src: "/missing.wav",
        onError: (error: Error) => {
          (window as any).loadError = error.message;
          audio.dispose();
        },
      },
    });
    audio.play("missing");
  });
  await expect
    .poll(() => page.evaluate(() => (window as any).loadError))
    .toContain("Audio load failed");
});

test("real Tone contexts isolate tempo, master volume and transport lifecycle", async ({
  page,
}) => {
  await page.evaluate(() => {
    document.querySelector("button")!.addEventListener("click", async () => {
      try {
        const api = (window as any).library;
        const Tone = (window as any).peers.Tone;
        const before = {
          bpm: Tone.getTransport().bpm.value,
          volume: Tone.getDestination().volume.value,
          state: Tone.getTransport().state,
        };
        const a = await api.createToneMusicAudio({ bpm: 100 });
        const b = await api.createToneMusicAudio({ bpm: 140 });
        a.registerSequence("loop", {
          loop: true,
          steps: [{ note: "C4", time: 0, duration: "8n" }],
        });
        b.registerSequence("loop", {
          loop: true,
          steps: [{ note: "E4", time: 0, duration: "8n" }],
        });
        await a.playSequence("loop");
        await b.playSequence("loop");
        await b.trigger("main", "G4", "8n");
        a.setBpm(90);
        a.setMasterVolume(0.1);
        a.stopSequence();
        a.dispose();
        a.dispose();
        await b.trigger("main", "A4", "8n");
        b.stopSequence();
        b.dispose();
        const after = {
          bpm: Tone.getTransport().bpm.value,
          volume: Tone.getDestination().volume.value,
          state: Tone.getTransport().state,
        };
        (window as any).audioResult =
          JSON.stringify(before) === JSON.stringify(after)
            ? "passed"
            : { before, after };
      } catch (error) {
        (window as any).audioResult =
          error instanceof Error ? error.stack : String(error);
      }
    });
  });
  await page.getByRole("button", { name: "Audio", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).audioResult))
    .toBe("passed");
});
