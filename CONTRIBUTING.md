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
- share-alike requirement
- API requirement and auth type
- useful discovery tags

Do not submit downloaded third-party asset files unless redistribution rights are explicit and repository maintainers have specifically accepted mirroring that source.

## License evidence

Prefer primary sources: the license text, the asset author's official site, or the repository's canonical LICENSE file. Blog posts and AI-generated summaries are not sufficient evidence for changing a license classification.

When rights are unclear, use `unknown` and explain the uncertainty rather than guessing.

## Development

```bash
npm install
npm run check
npm test
npm run build
```

## Security

Never include API keys, tokens, cookies, credentials, private URLs or proprietary assets in issues, commits or pull requests.
