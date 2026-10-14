import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const identifier = "(?:0|[1-9][0-9]*|[0-9]*[a-zA-Z-][0-9a-zA-Z-]*)";
const versionPattern = new RegExp(
  `^(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)\\.(0|[1-9][0-9]*)(?:-(${identifier}(?:\\.${identifier})*))?$`,
);

export async function planNpmRelease({ manifest, ref, request = fetch }) {
  if (manifest.name !== "grid-canvas-system" || manifest.private !== false)
    throw new Error("Only the public grid-canvas-system package can be released");
  if (
    typeof manifest.version !== "string" ||
    manifest.version.trim() !== manifest.version ||
    !versionPattern.test(manifest.version)
  )
    throw new Error("Release version must be canonical SemVer without build metadata");
  if (ref !== "refs/heads/main" && ref !== `refs/tags/v${manifest.version}`)
    throw new Error("Release must use main or the matching package version tag");

  const response = await request(
    `https://registry.npmjs.org/${manifest.name}/${manifest.version}`,
    { signal: AbortSignal.timeout(30_000) },
  );
  if (response.status !== 404 && !response.ok)
    throw new Error(`npm registry check failed with HTTP ${response.status}`);
  if (response.ok) {
    const published = await response.json();
    if (published.name !== manifest.name || published.version !== manifest.version)
      throw new Error("Registry returned unexpected package metadata");
  }

  return {
    publish: response.status === 404,
    version: manifest.version,
    tag: manifest.version.includes("-") ? "next" : "latest",
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = JSON.parse(await readFile("package.json", "utf8"));
  const plan = await planNpmRelease({ manifest, ref: process.env.GITHUB_REF });
  const message = plan.publish
    ? `Will publish ${manifest.name}@${plan.version} to ${plan.tag}. Physical-device acceptance remains recorded separately.`
    : `${manifest.name}@${plan.version} is already published; nothing to publish.`;
  console.log(message);
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      Object.entries(plan)
        .map(([key, value]) => `${key}=${value}\n`)
        .join(""),
    );
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
}
