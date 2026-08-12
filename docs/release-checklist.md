# Release checklist

Use this checklist for stable releases.

## Versioning

- [ ] Update `src/version.ts`.
- [ ] Update `package.json` version.
- [ ] Confirm `src/version.test.ts` passes.
- [ ] Update `RELEASE_NOTES.md`.

## Validation

- [ ] `npm run check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm pack --dry-run`
- [ ] GitHub Actions is green on the release PR.

## Documentation

- [ ] README reflects current tools and providers.
- [ ] Client setup examples match current MCP client behavior.
- [ ] End-to-end example reflects current safe-install flow.
- [ ] Known limitations are explicit.

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
