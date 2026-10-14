# Publishing to npm

The [Publish to npm workflow](https://github.com/joshuacba08/grid-canvas-system/actions/workflows/publish.yml) publishes a new public package version after automated acceptance. It runs on pushes to `main`, tags named `v*`, and manual dispatch from `main` or a matching version tag. The checked-out commit must belong to main's history. Pull requests cannot publish.

## Credentials and release channels

Store a token with publish permission for `grid-canvas-system` in the repository secret `NPM_TOKEN`. If the package requires two-factor authentication, the token must support unattended publishing under npm's current policy. The workflow passes the secret as `NODE_AUTH_TOKEN` only to npm authentication and publishing steps; builds and tests never receive it. No token is committed to the repository.

- Prereleases such as `1.2.0-rc.1` publish to `next`. Install with `npm install grid-canvas-system@next` or pin the full version. They retain any pending certification and Experimental audio status.
- Stable versions such as `1.2.0` publish to `latest` only after `pnpm run verify:certification` accepts the reviewed evidence for that version's built artifacts. Install with `npm install grid-canvas-system`.

The workflow uses `npm publish --access public --provenance` on a GitHub-hosted runner. Provenance links the package to its source and build; it does not certify functionality. See [npm's provenance documentation](https://docs.npmjs.com/generating-provenance-statements/) and [GitHub's publishing guide](https://docs.github.com/en/actions/tutorials/publish-packages/publish-nodejs-packages).

## Release process

1. Update the root `package.json` version, lockfile when applicable, changelog and versioned documentation. Prepare certification evidence for a stable release.
2. Merge to `main`. The workflow detects the unpublished version, checks npm authentication, runs two complete quality passes without retries, and completes the 30-minute soak.
3. It builds and verifies the installed tarball's exports and strict consumer types again, applies the stable certification gate where applicable, packs and publishes the package with the selected channel.
4. Review the `quality-evidence` and `npm-release` workflow artifacts. The latter contains the tarball, npm pack metadata and registry receipt. Confirm the registry version and dist-tag.

A matching tag (for example `v1.2.0-rc.1`) or manual workflow dispatch can trigger the same process. The package version and tag must agree. Existing registry versions are skipped without rebuilding, republishing or moving dist-tags. Registry errors fail the workflow instead of being treated as a missing version. Publishing workflows are serialized to prevent concurrent releases.

If authentication fails, correct the repository secret or npm permissions, then dispatch the workflow again. If a quality check fails, investigate and fix the cause before rerunning; retries do not constitute acceptance. Published versions are immutable: subsequent package changes require a new version.

## Current certification

The stabilization candidate is `1.2.0-rc.1`. Physical Safari on iPhone, Chrome on Android, and the complete promise review remain pending in [certification.json](./stability/certification.json). Prerelease distribution was explicitly requested to make the newest candidate available while that work continues. It does not replace these acceptance requirements or promote audio to stable.
