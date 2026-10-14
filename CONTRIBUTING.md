# Contributing

Thanks for helping improve `grid-canvas-system`. Keep changes focused, readable, and
compatible with the library's small Canvas-first scope.

## Setup

Use Node.js 24 and pnpm 11, matching CI.

The stabilization reference pins Node 24.21.0 and pnpm 11.7.0. Run `pnpm exec playwright install chromium firefox webkit` once, then `pnpm run verify:release` for two consecutive automated checks. `pnpm run test:soak` runs the separate 30-minute test. Physical certification lives in `docs/stability/certification.json`; never mark it passed from emulation or skipped tests.

New package versions merged to main are published automatically after the shared release checks and soak pass. Prereleases use `next`; stable versions use `latest` and additionally require complete certification. See [publishing](./docs/PUBLISHING.md) for credentials, tag/manual triggers and release evidence.

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
