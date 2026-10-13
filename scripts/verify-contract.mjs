import { access, readFile } from "node:fs/promises";
import GridCanvasSystem from "../dist/grid-canvas-system.es.js";
import ts from "typescript";
import { operationalMembers } from "./contract-members.mjs";

const contract = JSON.parse(await readFile("docs/stability/contract.json", "utf8"));
const declarations = [
  "dist/index.d.ts",
  "dist/runtime/index.d.ts",
  "dist/audio/index.d.ts",
  "dist/audio-arcade/index.d.ts",
];
const program = ts.createProgram(declarations, {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  strict: true,
  skipLibCheck: false,
  target: ts.ScriptTarget.ES2022,
});
const checker = program.getTypeChecker();
const actual = [];
for (const path of declarations) {
  const symbol = checker.getSymbolAtLocation(program.getSourceFile(path));
  for (const exported of checker.getExportsOfModule(symbol)) {
    actual.push(`${path}:${exported.name}`);
    for (const member of operationalMembers(checker, exported, ts))
      actual.push(`member:${exported.name}.${member.name}`);
  }
}
for (const name of Object.keys(GridCanvasSystem.runtime))
  actual.push(`runtime:${name}`);
const methods = [
  "clearCanvas",
  "drawAsteroid",
  "drawBarIndicator",
  "drawCircleSector",
  "drawCompiledPixelSprite",
  "drawCoordinate",
  "drawGhost",
  "drawLine",
  "drawMessage",
  "drawPacman",
  "drawPixelSprite",
  "drawPolyline",
  "drawProjectile",
  "drawShip",
  "drawText",
  "drawValueLabel",
  "polarToCartesian",
  "createAsteroidShape",
];
for (const name of methods) actual.push(`instance:${name}`);
const inventory = new Map(contract.apis.map((item) => [item.id, item]));
if (inventory.size !== contract.apis.length)
  throw new Error("Duplicate contract identifiers");
for (const id of actual)
  if (!inventory.has(id)) throw new Error(`Published API missing from contract: ${id}`);
for (const item of contract.apis) {
  if (!item.expectation || !item.environment || !item.source || !item.tests?.length)
    throw new Error(`Incomplete contract row ${item.id}`);
  for (const path of item.tests) await access(path);
}
const diagnostics = ts.getPreEmitDiagnostics(program);
for (const item of contract.capabilities) {
  if (!item.id || !item.expectation || !item.source || !item.test)
    throw new Error("Incomplete capability row");
  await access(item.test);
}
if (diagnostics.length)
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (value) => value,
      getNewLine: () => "\n",
    }),
  );
console.log(
  `Contract inventory: ${contract.apis.length} API rows and ${contract.capabilities.length} capability rows. Test links are traceability, not a 100% behavior certificate.`,
);
