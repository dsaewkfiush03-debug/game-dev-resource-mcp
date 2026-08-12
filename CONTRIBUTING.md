# Contributing

Contributions are welcome, especially new verified resource sources, provider adapters, tests and license-rule corrections.

## Resource-source submissions

A resource entry should include:

- canonical name
- canonical source URL
- resource kind
- explicit license identifier or `MULTIPLE`
- authoritative license/source page when available
- commercial-use status
- modification status
- redistribution status
- attribution requirement
- share-alike/copy-left-like requirement
- API requirement and auth type
- useful discovery tags and structured game-development metadata where known

Do not submit downloaded third-party asset files unless redistribution rights are explicit and repository maintainers have specifically accepted mirroring that source.

## License evidence

Prefer primary sources: the license text, the asset author's official site, or the repository's canonical LICENSE file. Blog posts and AI-generated summaries are not sufficient evidence for changing a license classification.

When rights are unclear, use `unknown` and explain the uncertainty rather than guessing.

## Automatic-install providers

A provider must not be enabled for automatic installation merely because a direct download link exists. Automatic installation requires:

- a stable official acquisition path;
- explicit HTTPS download-host allowlisting;
- provider-backed file metadata where practical;
- size limits;
- hash verification when the provider supplies a hash;
- tests for project-root containment and unsafe URLs.

Do not add arbitrary redirect chasing, HTML download-link scraping, automatic archive extraction, repository cloning, package-manager execution or shell execution as shortcuts around these requirements.

## Development

```bash
npm install
npm run validate
npm pack --dry-run
```

## Security

Never include API keys, tokens, cookies, credentials, private URLs or proprietary assets in issues, commits or pull requests.
