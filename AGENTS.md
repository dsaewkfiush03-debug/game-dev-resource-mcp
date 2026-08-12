# AGENTS.md

## Project purpose

Build a conservative, license-aware game-development resource layer for AI coding agents using MCP. V1 covers discovery, license analysis, attribution manifests and narrowly scoped safe file installation.

## Non-negotiable rules

1. Do not treat `free`, `free download`, or `open source` as proof of commercial-use permission.
2. Do not mirror or commit third-party assets by default. Prefer metadata + canonical source URL.
3. Keep these rights separate: commercial use, modification, redistribution, attribution, share-alike/copy-left-like obligations.
4. Unknown, custom, missing, non-commercial, or conflicting licenses must fail closed to manual review/reject.
5. Never commit API keys, access tokens, cookies, or user credentials.
6. Preserve provenance: source URL and license source should accompany every verified entry.
7. Repository-level licenses do not automatically cover bundled third-party assets.
8. Changes to license classification require evidence from an authoritative license or source page.
9. Automatic downloads require an explicit trusted HTTPS host allowlist and provider-backed file metadata.
10. Never automatically execute, extract or install downloaded third-party content.
11. Never guess a download URL merely to make a workflow automatic.
12. Local installation must remain contained inside an explicit absolute project root.

## Engineering priorities

Correctness > coverage. Maintainability > cleverness. Safe degradation > aggressive automation. Tests should cover license classification, provider mapping, search filtering, installation containment and version consistency.

## V1 supported scope

- STDIO MCP server
- curated source registry
- live and verified-catalog asset providers
- cross-provider structured search
- GitHub project discovery and repository license inspection
- conservative license classification
- project-level attribution/credits generation
- provider-backed file planning
- explicit safe file installation for allowlisted providers

## Current installation boundary

Poly Haven is currently the only automatic-install provider because its official API exposes direct file URLs plus file metadata suitable for validation.

Catalog-only providers stay manual until they expose a stable, verifiable acquisition path. Do not add HTML scraping, redirect chasing, arbitrary repository cloning, package-manager execution, shell execution or archive extraction to bypass this boundary.

## Out of scope unless explicitly approved

- hosting/mirroring third-party asset libraries
- arbitrary code execution
- automatic dependency/package installation
- accounts/payments
- telemetry collection
- web UI or hosted SaaS infrastructure
