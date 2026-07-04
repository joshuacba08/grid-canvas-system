# Contributing

Thanks for helping improve `grid-canvas-system`. Keep changes focused, readable, and
compatible with the library's small Canvas-first scope.

## Setup

Use Node.js 24 and pnpm 11, matching CI.

```bash
pnpm install --frozen-lockfile
pnpm build
```

## Development workflow

1. Create a branch for one focused change.
2. Follow the existing public API and validation patterns.
3. Add or update tests when behavior changes.
4. Run the local checks before opening a pull request.

```bash
pnpm run format
pnpm run format:check
pnpm test
pnpm run test:visual
pnpm run build
pnpm run site:build
```

Do not edit or commit generated `dist/`, `.astro/`, or `tests/__artifacts__/` files.
Only update visual snapshots intentionally with `pnpm run test:visual:update` and
inspect the resulting images before committing them.

## Pull requests

Explain the user-visible behavior, note any API compatibility impact, and include the
commands you ran. Prefer small pull requests over unrelated refactors bundled with a
feature.

Examples should remain framework-free and readable without build-tool knowledge. See
[docs/EXAMPLES.md](./docs/EXAMPLES.md) for the local demo workflow.
