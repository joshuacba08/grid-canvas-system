// Maintainer tool: regenerates the API inventory, never certification results.
import { mkdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import ts from "typescript";
import GridCanvasSystem from "../dist/grid-canvas-system.es.js";
import { operationalMembers } from "./contract-members.mjs";

const paths = [
  "dist/index.d.ts",
  "dist/runtime/index.d.ts",
  "dist/audio/index.d.ts",
  "dist/audio-arcade/index.d.ts",
];
const program = ts.createProgram(paths, {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  target: ts.ScriptTarget.ES2022,
  strict: true,
  skipLibCheck: false,
});
const checker = program.getTypeChecker();
const apis = [];
const recordedMembers = new Set();
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
function row(id, expectation, tests, environment, source = "docs/PUBLIC_API.md") {
  apis.push({ id, expectation, environment, source, tests, status: "test-linked" });
}
for (const path of paths) {
  for (const symbol of checker.getExportsOfModule(
    checker.getSymbolAtLocation(program.getSourceFile(path)),
  )) {
    const name = symbol.name;
    row(
      `${path}:${name}`,
      `El export ${name} resuelve desde el tarball; sus declaraciones compilan en NodeNext y Bundler sin skipLibCheck.`,
      ["tests/types/package-smoke.ts", "scripts/verify-package-exports.mjs"],
      "Node 24 / TypeScript 5.6.3",
      path,
    );
    for (const member of operationalMembers(checker, symbol, ts)) {
      const id = `member:${name}.${member.name}`;
      if (recordedMembers.has(id)) continue;
      recordedMembers.add(id);
      const audio = name.endsWith("Controller");
      row(
        id,
        `El miembro ${name}.${member.name} conserva su firma, comportamiento y ciclo de vida documentados; revisar aserciones de entradas, resultados y errores aplicables.`,
        audio
          ? ["tests/AudioAddons.test.ts", "tests/browser/audio.spec.ts"]
          : [
              "tests/RuntimePrimitives.test.ts",
              "tests/Stabilization.test.ts",
              "tests/browser/runtime.spec.ts",
            ],
        audio
          ? "Web Audio / Howler / Tone en navegadores compatibles"
          : "Node / DOM / navegadores",
        relative(
          process.cwd(),
          resolve(member.declarations?.[0]?.getSourceFile().fileName ?? path),
        ).replaceAll("\\", "/"),
      );
    }
  }
}
for (const name of methods)
  row(
    `instance:${name}`,
    `Mantener el comportamiento, configuración y validaciones documentados de ${name}; restaurar el contexto tras el dibujo.`,
    [
      "tests/GridCanvasSystem.test.ts",
      "tests/GridCanvasSystem.visual.test.ts",
      "tests/Stabilization.test.ts",
    ],
    "Canvas Node / navegadores",
    "README.md",
  );
for (const name of Object.keys(GridCanvasSystem.runtime))
  row(
    `runtime:${name}`,
    `Cumplir las entradas, unidades, resultados y ciclo de vida documentados de ${name}.`,
    ["tests/RuntimePrimitives.test.ts", "tests/Stabilization.test.ts"],
    "Node / DOM / navegadores",
  );
for (const name of [
  "compilePixelSprite",
  "createPixelPalette",
  "flipPixelSpriteX",
  "flipPixelSpriteY",
  "getPixelSpriteBounds",
  "hitTestPixelSprite",
  "tintPixelSprite",
])
  row(
    `static:${name}`,
    `Validar y transformar sprites sin modificar los datos de entrada; respetar geometría y transparencia.`,
    ["tests/GridCanvasSystem.test.ts", "tests/Stabilization.test.ts"],
    "Node / navegadores",
  );
for (const name of Object.keys(GridCanvasSystem).filter(
  (name) => name in GridCanvasSystem.runtime,
))
  row(
    `legacy:${name}`,
    `El alias ${name} conserva identidad y comportamiento con GridCanvasSystem.runtime.${name}.`,
    ["tests/RuntimePrimitives.test.ts"],
    "ESM / UMD",
  );
for (const signature of [
  "id",
  "id-options",
  "id-width-height",
  "element-options",
  "element-width-height",
])
  row(
    `constructor:${signature}`,
    `El constructor ${signature} crea un canvas con las dimensiones y opciones documentadas; rechaza destinos inválidos.`,
    ["tests/GridCanvasSystem.test.ts"],
    "DOM / navegadores",
  );
for (const name of ["canvas", "ctx", "options"])
  row(
    `field:${name}`,
    `${name} sigue disponible como propiedad pública; options conserva los valores resueltos.`,
    ["tests/GridCanvasSystem.test.ts"],
    "DOM / navegadores",
  );
const capabilities = [
  [
    "cdn",
    "Constructor global UMD y helpers, sin .default obligatorio",
    "tests/browser/product.spec.ts",
  ],
  [
    "package",
    "Imports ESM, subpaths y tipos desde el tarball instalado",
    "scripts/verify-package-exports.mjs",
  ],
  [
    "ssr",
    "Imports seguros sin globals del navegador y render SSR React/Vue",
    "tests/FrameworkSSR.test.ts",
  ],
  [
    "hidpi",
    "Buffer, pixels y coordenadas lógicas en DPR 1, 1.25, 2 y 3",
    "tests/browser/runtime.spec.ts",
  ],
  [
    "resize",
    "No-op conserva bitmap; errores no cambian tamaño; ResizeObserver y canvas oculto",
    "tests/browser/runtime.spec.ts",
  ],
  [
    "time",
    "FPS reducido conserva tiempo y aplica el límite al delta entregado",
    "tests/Stabilization.test.ts",
  ],
  [
    "cleanup",
    "100 ciclos sin RAF ni listeners efectivos después de destroy",
    "tests/browser/runtime.spec.ts",
  ],
  [
    "audio",
    "Web Audio, Howler y Tone reales; aislamiento, carga fallida y cleanup",
    "tests/browser/audio.spec.ts",
  ],
  [
    "frameworks",
    "React StrictMode, Vue, Angular y Custom Elements destruyen al desmontar",
    "tests/browser/frameworks.spec.ts",
  ],
  [
    "examples",
    "Todas las demos vanilla cargan el build candidato y dibujan",
    "tests/browser/product.spec.ts",
  ],
  [
    "website",
    "Web multilingüe, documentación, tutoriales y playground ejecutables",
    "tests/browser/product.spec.ts",
  ],
  [
    "tree-shaking",
    "Audio fuera del root y runtime consumidor elimina helpers sin uso",
    "scripts/verify-bundles.mjs",
  ],
  [
    "performance",
    "Diez repeticiones tras calentamiento; medianas +10% y gzip total +5%",
    "scripts/benchmark-pixel-sprites.mjs",
  ],
  [
    "soak",
    "30 minutos reales con resize, escenas, audio y teardown",
    "tests/browser/soak.spec.ts",
  ],
];
await mkdir("docs/stability", { recursive: true });
await writeFile(
  "docs/stability/contract.json",
  `${JSON.stringify(
    {
      interpretation:
        "test-linked acredita trazabilidad; no implica que todas las ramas o todos los entornos estén certificados. Ver AUDIT.md y certification.json.",
      apis,
      capabilities: capabilities.map(([id, expectation, test]) => ({
        id,
        expectation,
        source: "README.md / docs / site / examples",
        test,
        status: "test-linked",
      })),
    },
    null,
    2,
  )}\n`,
);
console.log(`Generated ${apis.length} API rows; certification results unchanged.`);
