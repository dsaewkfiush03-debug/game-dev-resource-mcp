# AGENTS.md

## Project purpose

Build a conservative, license-aware discovery layer for game-development resources used by AI coding agents.

## Non-negotiable rules

1. Do not treat `free`, `free download`, or `open source` as proof of commercial-use permission.
2. Do not mirror or commit third-party assets by default. Prefer metadata + canonical source URL.
3. Keep these rights separate: commercial use, modification, redistribution, attribution, share-alike.
4. Unknown, custom, missing, non-commercial, or conflicting licenses must fail closed to manual review/reject.
5. Never commit API keys, access tokens, cookies, or user credentials.
6. Preserve provenance: source URL and license source should accompany every verified entry.
7. Repository-level licenses do not automatically cover bundled third-party assets.
8. Changes to license classification require evidence from an authoritative license or source page.

## Engineering priorities

Correctness > coverage. Maintainability > cleverness. Small provider interfaces > scraping-specific coupling. Tests should cover license classification and malformed provider responses.

## V0.1 scope

- stdio MCP server
- curated source registry
- GitHub project discovery
- repository license inspection
- conservative license classification
- attribution generation

Do not expand into asset hosting, package installation, web UI, accounts, payments, or telemetry without an explicit project decision.
