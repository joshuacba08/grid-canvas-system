import { appendFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export async function waitForNpmRelease({
  name,
  version,
  tag,
  integrity,
  request = fetch,
  pause = (ms) => new Promise((done) => setTimeout(done, ms)),
  attempts = 40,
  delayMs = 5_000,
}) {
  const registry = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const response = await request(`${registry}/${encodeURIComponent(version)}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (response.ok) {
      const metadata = await response.json();
      if (metadata.name !== name || metadata.version !== version)
        throw new Error("Registry returned unexpected package metadata");
      if (metadata.dist?.integrity !== integrity)
        throw new Error(
          "Published tarball integrity differs from the release artifact",
        );
      const packageResponse = await request(registry, {
        signal: AbortSignal.timeout(10_000),
      });
      if (packageResponse.ok) {
        const packument = await packageResponse.json();
        if (packument["dist-tags"]?.[tag] === version) return metadata;
      } else if (packageResponse.status !== 404 && packageResponse.status < 500) {
        throw new Error(`npm dist-tag check failed: HTTP ${packageResponse.status}`);
      }
    } else if (response.status !== 404 && response.status < 500) {
      throw new Error(`npm publication check failed: HTTP ${response.status}`);
    }
    if (attempt < attempts) {
      console.log(
        `Waiting for npm processing: ${name}@${version} (${attempt}/${attempts})`,
      );
      await pause(delayMs);
    }
  }
  throw new Error(
    "npm accepted publication but registry visibility was not confirmed in time; inspect the registry before publishing again",
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = "tests/__artifacts__/npm-release";
  const [packed] = JSON.parse(await readFile(`${directory}/pack.json`, "utf8"));
  if (!packed?.integrity || packed.version !== process.env.RELEASE_VERSION)
    throw new Error("Missing or inconsistent packed release metadata");
  const metadata = await waitForNpmRelease({
    name: packed.name,
    version: packed.version,
    tag: process.env.RELEASE_TAG,
    integrity: packed.integrity,
  });
  await writeFile(
    `${directory}/registry.json`,
    `${JSON.stringify(metadata, null, 2)}\n`,
  );
  const message = `Published ${packed.name}@${packed.version} to ${process.env.RELEASE_TAG}; registry integrity matches the packed release.`;
  console.log(message);
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${message}\n`);
}
