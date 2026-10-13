import { chromium, firefox, webkit } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const browsers = {};
for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await engine.launch();
  try {
    browsers[name] = browser.version();
  } finally {
    await browser.close();
  }
}
await mkdir("tests/__artifacts__", { recursive: true });
await writeFile(
  "tests/__artifacts__/browser-versions.json",
  `${JSON.stringify({ node: process.version, platform: process.platform, playwright: "1.64.0", browsers }, null, 2)}\n`,
);
console.log("Browser versions:", browsers);
