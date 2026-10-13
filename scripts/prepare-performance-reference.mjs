import { readFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve, join, relative, isAbsolute } from "node:path";

const root = process.cwd();
const baseline = JSON.parse(
  await readFile("docs/stability/performance-baseline.json", "utf8"),
);
const directory = resolve(root, "tests/__artifacts__/performance-reference");
const library = join(directory, "dist/grid-canvas-system.es.js");
const boundary = relative(resolve(root, "tests/__artifacts__"), directory);
if (boundary.startsWith("..") || isAbsolute(boundary))
  throw new Error("Invalid reference workspace");
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
let existing;
try {
  existing = await readFile(library);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (existing) {
  if (sha(existing) !== baseline.librarySha256)
    throw new Error("Cached performance reference differs from the accepted baseline");
} else {
  function run(command, args, cwd = root) {
    const result = spawnSync(command, args, { cwd, stdio: "inherit" });
    if (result.error || result.status !== 0)
      throw new Error(`Reference preparation failed: ${command}`);
  }
  if (!/^[0-9a-f]{40}$/.test(baseline.sourceCommit))
    throw new Error("Baseline requires a pinned Git commit");
  await mkdir(directory, { recursive: true });
  const archive = resolve(root, "tests/__artifacts__/performance-reference.tar");
  run("git", ["archive", "--format=tar", `--output=${archive}`, baseline.sourceCommit]);
  run("tar", ["-xf", archive, "-C", directory]);
  // Dependencies resolve from the parent workspace; no install, symlink or cleanup
  // touches the user's node_modules. The source commit's build config is reviewed.
  run(
    process.execPath,
    [resolve(root, "node_modules/vite/bin/vite.js"), "build"],
    directory,
  );
  if (sha(await readFile(library)) !== baseline.librarySha256)
    throw new Error("Rebuilt reference does not match the accepted baseline artifact");
}
console.log(`Performance reference verified: ${baseline.sourceCommit}`);
