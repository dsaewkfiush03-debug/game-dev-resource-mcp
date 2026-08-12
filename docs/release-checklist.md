# Release checklist

Use this checklist for stable releases.

## Versioning

- [ ] Update `src/version.ts`.
- [ ] Update `package.json` version.
- [ ] Confirm `src/version.test.ts` passes.
- [ ] Update `RELEASE_NOTES.md`.

## Dependency reproducibility

- [ ] `package-lock.json` is committed and matches `package.json`.
- [ ] CI installs repository dependencies with `npm ci`.
- [ ] Dependabot is enabled for npm and GitHub Actions.

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm pack --dry-run`
- [ ] Node 20 compatibility CI is green.
- [ ] Node 22 CI is green.
- [ ] The packed tarball installs into a clean temporary project.
- [ ] The installed MCP binary survives a smoke start.
- [ ] GitHub Actions is green on the release PR.

## Documentation

- [ ] README reflects current tools and providers.
- [ ] Client setup examples match current MCP client behavior.
- [ ] End-to-end example reflects current safe-install flow.
- [ ] Known limitations are explicit.
- [ ] `SECURITY.md`, issue templates and PR template remain current.

## License/provenance

- [ ] New providers have primary-source license evidence.
- [ ] Commercial use, redistribution, attribution and share-alike are modeled separately.
- [ ] Unknown/custom licenses fail closed.
- [ ] No third-party assets are accidentally committed to this repository.
- [ ] No secrets, tokens or cookies are committed.

## Installation safety

- [ ] Automatic-download hosts are explicit allowlists.
- [ ] HTTPS is required.
- [ ] Project-root containment tests pass.
- [ ] Download size limits remain enforced.
- [ ] Hash verification is retained where provider metadata supports it.
- [ ] No downloaded content is executed automatically.

## Publish

- [ ] Merge the validated release PR to `main`.
- [ ] Create annotated tag `vX.Y.Z` at the merged commit.
- [ ] Create GitHub Release from `RELEASE_NOTES.md`.
- [ ] If publishing to npm, inspect `npm pack --dry-run` output before `npm publish`.
