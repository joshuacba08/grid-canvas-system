import { defineConfig } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const port = Number(process.env.GCS_SOAK_PORT ?? 43175);
const reportName = process.env.GCS_SOAK_REPORT ?? "soak-report";

export default defineConfig({
  testDir: "tests/browser",
  testMatch: "soak.spec.ts",
  metadata: {
    version: JSON.parse(readFileSync("package.json", "utf8")).version,
    runtimeSha256: createHash("sha256")
      .update(readFileSync("dist/runtime/index.js"))
      .digest("hex"),
    audioSha256: createHash("sha256")
      .update(readFileSync("dist/audio-arcade/index.js"))
      .digest("hex"),
  },
  retries: 0,
  workers: 1,
  timeout: 1_920_000,
  outputDir: `tests/__artifacts__/soak/${reportName}`,
  reporter: [
    ["list"],
    ["json", { outputFile: `tests/__artifacts__/${reportName}.json` }],
  ],
  use: {
    browserName: "chromium",
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node scripts/browser-server.mjs",
    env: { PORT: String(port), GCS_SOAK_SERVER: "1" },
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
  },
});
