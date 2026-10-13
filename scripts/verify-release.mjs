import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const checks = [
  "format:check",
  "test",
  "build",
  "verify:types",
  "verify:package-exports",
  "verify:bundles",
  "verify:dependencies",
  "verify:contract",
  "site:build",
  "test:browser",
  "verify:performance",
];
const runs = [];
await mkdir("tests/__artifacts__", { recursive: true });
if (Number(process.versions.node.split(".")[0]) !== 24)
  throw new Error("Release verification requires Node 24");
for (let iteration = 1; iteration <= 2; iteration++) {
  for (const check of checks) {
    const started = Date.now();
    const result =
      process.platform === "win32"
        ? spawnSync(`pnpm.cmd run ${check}`, { stdio: "inherit", shell: true })
        : spawnSync("pnpm", ["run", check], { stdio: "inherit" });
    runs.push({
      iteration,
      check,
      passed: result.status === 0,
      elapsedMs: Date.now() - started,
    });
    await writeFile(
      "tests/__artifacts__/release-checks.json",
      `${JSON.stringify({ node: process.version, runs }, null, 2)}\n`,
    );
    if (result.error || result.status !== 0)
      throw new Error(`Release check failed: ${check}; no retries performed`);
  }
}
console.log(
  "Two consecutive automated release checks passed. Physical-device certification is a separate required gate.",
);
