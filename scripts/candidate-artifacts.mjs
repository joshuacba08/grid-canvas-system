import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

export async function candidateArtifacts(directory = "dist") {
  const artifacts = {};
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) Object.assign(artifacts, await candidateArtifacts(path));
    else if (entry.name.endsWith(".js")) {
      artifacts[path.replaceAll("\\", "/")] = createHash("sha256")
        .update(await readFile(path))
        .digest("hex");
    }
  }
  return Object.fromEntries(
    Object.entries(artifacts).sort(([a], [b]) => a.localeCompare(b)),
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1])
  console.log(JSON.stringify(await candidateArtifacts(), null, 2));
