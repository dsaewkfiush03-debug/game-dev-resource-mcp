## Summary

Describe what changed and why.

## Scope

- [ ] No unrelated refactor is mixed into this PR.
- [ ] No third-party asset files are mirrored unless redistribution was explicitly approved.
- [ ] No credentials, tokens, cookies, signed private URLs or proprietary assets are included.

## License / provenance changes

If this PR adds or changes a resource/provider/license rule:

- [ ] Canonical source URL is included.
- [ ] Authoritative license/source evidence is included.
- [ ] Commercial use, redistribution, attribution and share-alike/copy-left-like obligations are not conflated.
- [ ] Unknown/custom terms fail closed rather than being guessed.

## Automatic-install changes

If this PR changes installation behavior:

- [ ] Trusted HTTPS host allowlisting remains explicit.
- [ ] Project-root containment is tested.
- [ ] Size limits are enforced.
- [ ] Provider hashes are verified when available.
- [ ] Downloaded content is not executed or automatically extracted.

## Validation

- [ ] `npm run validate`
- [ ] `npm pack --dry-run`
- [ ] Tests added or updated for behavioral changes.
