import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function quoteWindowsShellArgument(value) {
  return `"${String(value).replaceAll('"', '\\"')}"`;
}

function windowsShellCommand(command, args) {
  const commandToken =
    command.endsWith(".cmd") && !command.includes("\\")
      ? command
      : quoteWindowsShellArgument(command);

  return [commandToken, ...args.map(quoteWindowsShellArgument)].join(" ");
}

function run(command, args, cwd) {
  const result =
    process.platform === "win32"
      ? spawnSync(windowsShellCommand(command, args), {
          cwd,
          encoding: "utf8",
          shell: true,
          stdio: ["ignore", "pipe", "pipe"],
        })
      : spawnSync(command, args, {
          cwd,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });

  if (result.error !== undefined || result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(" ")}`,
        result.error instanceof Error ? result.error.message : undefined,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result.stdout;
}

const tempDir = await mkdtemp(join(tmpdir(), "grid-canvas-system-exports-"));

try {
  const packOutput = run(
    npmCommand,
    ["pack", "--json", "--pack-destination", tempDir],
    projectRoot,
  );
  const [packedPackage] = JSON.parse(packOutput);

  if (packedPackage === undefined || typeof packedPackage.filename !== "string") {
    throw new Error("npm pack did not report a package filename");
  }

  const smokeProject = join(tempDir, "smoke-project");
  const tarballPath = join(tempDir, packedPackage.filename);
  const verifyScriptPath = join(smokeProject, "verify.mjs");

  await mkdir(smokeProject, { recursive: true });
  await writeFile(
    join(smokeProject, "package.json"),
    JSON.stringify({ private: true, type: "module" }, null, 2),
  );

  run(
    npmCommand,
    ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarballPath],
    smokeProject,
  );

  await writeFile(
    verifyScriptPath,
    `import { createRequire } from "node:module";
import GridCanvasSystem from "grid-canvas-system";
import { createHowlerAssetAudio, createToneMusicAudio } from "grid-canvas-system/audio";
import { createArcadeAudio } from "grid-canvas-system/audio-arcade";

const require = createRequire(import.meta.url);
const packageJson = require("grid-canvas-system/package.json");

if (packageJson.name !== "grid-canvas-system") {
  throw new Error("package.json subpath did not resolve to grid-canvas-system");
}

if (typeof GridCanvasSystem !== "function") {
  throw new Error("default root export is not the GridCanvasSystem constructor");
}

if (typeof GridCanvasSystem.compilePixelSprite !== "function") {
  throw new Error("pixel sprite helpers are not exposed from the root export");
}

if (typeof GridCanvasSystem.runtime.createFixedStepLoop !== "function") {
  throw new Error("runtime.createFixedStepLoop is missing");
}

if (Object.prototype.hasOwnProperty.call(GridCanvasSystem, "createFixedStepLoop")) {
  throw new Error("new runtime helpers must not be mirrored as root legacy aliases");
}

const palette = GridCanvasSystem.createPixelPalette({ 0: "transparent", 1: "#fff" });
const compiled = GridCanvasSystem.compilePixelSprite(["10"], palette);
const tinted = GridCanvasSystem.tintPixelSprite(compiled, "#0f0");

if (GridCanvasSystem.flipPixelSpriteX(["10"])[0] !== "01" || GridCanvasSystem.flipPixelSpriteY(["10", "01"])[0] !== "01") {
  throw new Error("pixel sprite transforms failed");
}

if (!GridCanvasSystem.hitTestPixelSprite({ x: 0, y: 0 }, tinted, { x: 0, y: 0, pixelSize: 4 })) {
  throw new Error("pixel sprite hit test failed");
}

const bounds = GridCanvasSystem.getPixelSpriteBounds(tinted, { x: 2, y: 3, pixelSize: 4 });

if (bounds.width !== 8 || bounds.height !== 4 || bounds.x !== 2 || bounds.y !== 3) {
  throw new Error("pixel sprite bounds failed");
}

if (typeof createArcadeAudio !== "function") {
  throw new Error("audio-arcade subpath export is missing");
}

if (typeof createHowlerAssetAudio !== "function" || typeof createToneMusicAudio !== "function") {
  throw new Error("audio subpath exports are missing");
}
`,
  );

  run(process.execPath, [verifyScriptPath], smokeProject);
  console.log("Package exports verified from packed tarball.");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
