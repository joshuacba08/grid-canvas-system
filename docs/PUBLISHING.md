# Publishing to npm

The [Publish to npm workflow](https://github.com/joshuacba08/grid-canvas-system/actions/workflows/publish.yml) publishes new versions after automated acceptance. It runs on pushes to main, tags named v*, and manual dispatch from main or a matching version tag. The checked-out commit must belong to main's history. Pull requests cannot publish.

## Credentials and channels

Store a token with publish permission for grid-canvas-system in the repository secret NPM_TOKEN. The workflow passes it as NODE_AUTH_TOKEN only to npm authentication and publishing steps. Builds and tests never receive it.

- Stable versions such as 1.2.0 publish to latest. Install with npm install grid-canvas-system.
- Explicit prereleases publish to next. They are used only when that version is intentionally prepared as a prerelease.

The workflow uses npm publish --access public --provenance on a GitHub-hosted runner. Provenance links the package to its source and build; it does not certify functionality. See [npm's provenance documentation](https://docs.npmjs.com/generating-provenance-statements/) and [GitHub's publishing guide](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

## Release process

1. Update the root package.json version, lockfile when applicable, changelog and versioned documentation.
2. Merge to main. The workflow detects the unpublished version, checks authentication and runs two complete quality passes without retries: unit tests, build, types, installed package, bundles, dependency audit, contract inventory, website, real browsers and performance.
3. It builds and verifies the installed tarball's exports and strict consumer types again, records the physical acceptance status, packs and publishes with the selected channel.
4. Review the quality-evidence and npm-release artifacts. The latter contains the tarball, pack metadata and registry receipt. Confirm the registry version and dist-tag.

A matching tag (for example v1.2.0) or manual workflow dispatch triggers the same process. The version and tag must agree. Existing versions are skipped without rebuilding, republishing or moving dist-tags. Registry errors fail the workflow instead of being treated as a missing version. Publishing workflows are serialized.

The manual soak input additionally runs the 30-minute real-time session. That session is already recorded for the stabilization binaries in [VALIDATION.json](./stability/VALIDATION.json); it remains available for future runtime changes. Normal continuous publication does not repeat that 30-minute session automatically.

If authentication fails, correct the repository secret or npm permissions, then dispatch again. Investigate quality failures before rerunning. Published versions are immutable: subsequent package changes require a new version.

## Acceptance status

Version 1.2.0 is published to latest at the user's explicit request. Physical Safari on iPhone, Chrome on Android, and the complete promise review remain pending in [certification.json](./stability/certification.json). Publication does not mark them passed, and audio remains Experimental. The separate verify:certification command still rejects incomplete evidence and is used to assess the full stabilization objective.
