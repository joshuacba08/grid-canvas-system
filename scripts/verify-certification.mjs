import { readFile } from "node:fs/promises";
import { candidateArtifacts } from "./candidate-artifacts.mjs";

const certification = JSON.parse(
  await readFile("docs/stability/certification.json", "utf8"),
);
const { version } = JSON.parse(await readFile("package.json", "utf8"));
if (certification.version !== version)
  throw new Error("Certification belongs to a different package version");
const required = [
  "ios-safari-physical",
  "android-chrome-physical",
  "webkit-web-audio",
  "complete-promise-review",
];
if (
  !Array.isArray(certification.requirements) ||
  required.some(
    (id) => certification.requirements.filter((item) => item.id === id).length !== 1,
  )
)
  throw new Error(
    "Certification must include each required acceptance gate exactly once",
  );
const pending = certification.requirements.filter(
  (item) =>
    item.status !== "passed" || !item.evidence || !item.reviewer || !item.environment,
);
if (pending.length)
  throw new Error(
    `Release certification incomplete: ${pending.map((item) => item.id).join(", ")}`,
  );
if (certification.status !== "passed")
  throw new Error("Certification must be explicitly marked passed after review");
if (
  JSON.stringify(certification.artifacts) !== JSON.stringify(await candidateArtifacts())
)
  throw new Error(
    "Certification evidence does not match the current built candidate artifacts",
  );
console.log("All recorded release certification requirements passed.");
