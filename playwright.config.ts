import { defineConfig, devices } from "@playwright/test";

const evidenceDirectory = `tests/__artifacts__/browser-runs/${Date.now()}`;

export default defineConfig({
  testDir: "tests/browser",
  testIgnore: "**/soak.spec.ts",
  retries: 0,
  outputDir: evidenceDirectory,
  snapshotPathTemplate: "{testDir}/snapshots/{projectName}/{arg}{ext}",
  workers: 3,
  timeout: 30_000,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/browser-report.json" }],
    ["json", { outputFile: `${evidenceDirectory}/report.json` }],
  ],
  use: {
    baseURL: "http://127.0.0.1:43173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "node scripts/browser-server.mjs",
      env: { PORT: "43173" },
      url: "http://127.0.0.1:43173",
      reuseExistingServer: false,
    },
    {
      command: "node scripts/browser-server.mjs --site",
      env: { PORT: "43174" },
      url: "http://127.0.0.1:43174",
      reuseExistingServer: false,
    },
  ],
  projects: [
    ...(["chromium", "firefox", "webkit"] as const).flatMap((browserName) =>
      [1, 1.25, 2, 3].map((deviceScaleFactor) => ({
        name: `${browserName}-dpr-${deviceScaleFactor}`,
        testMatch: deviceScaleFactor === 1 ? /.*\.spec\.ts/ : /runtime\.spec\.ts/,
        use: { browserName, deviceScaleFactor, viewport: { width: 900, height: 700 } },
      })),
    ),
    {
      name: "mobile-chromium",
      testMatch: /runtime\.spec\.ts/,
      use: { ...devices["Pixel 5"], browserName: "chromium" },
    },
    {
      name: "mobile-webkit",
      testMatch: /runtime\.spec\.ts/,
      use: { ...devices["iPhone 12"], browserName: "webkit" },
    },
  ],
});
