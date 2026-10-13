import { readdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import ts from "typescript";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
async function visitDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visitDirectory(path);
      continue;
    }
    if (!entry.name.endsWith(".d.ts")) continue;
    const text = await readFile(path, "utf8");
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const literals = [];
    function visit(node) {
      if (
        ts.isStringLiteral(node) &&
        node.text.startsWith(".") &&
        !/\.[cm]?js$/.test(node.text)
      ) {
        const parent = node.parent;
        if (
          ts.isImportDeclaration(parent) ||
          ts.isExportDeclaration(parent) ||
          (ts.isLiteralTypeNode(parent) && ts.isImportTypeNode(parent.parent))
        )
          literals.push(node);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
    let result = text;
    for (const literal of literals.reverse()) {
      const target = resolve(dirname(path), literal.text);
      const specifier = (await exists(`${target}.d.ts`))
        ? `${literal.text}.js`
        : (await exists(join(target, "index.d.ts")))
          ? `${literal.text}/index.js`
          : undefined;
      if (!specifier)
        throw new Error(`Unresolved declaration import ${literal.text} in ${path}`);
      result =
        result.slice(0, literal.getStart(source) + 1) +
        specifier +
        result.slice(literal.getEnd() - 1);
    }
    if (result !== text) await writeFile(path, result);
  }
}
await visitDirectory("dist");
