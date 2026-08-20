# AGENTS.md

## Project purpose

Build a conservative, license-aware game-development resource layer for AI coding agents using MCP. V1 covers discovery, reusable-project selection, project adoption planning, license analysis, attribution manifests and narrowly scoped safe file installation.

## Non-negotiable rules

1. Do not treat `free`, `free download`, or `open source` as proof of commercial-use permission.
2. Do not mirror or commit third-party assets by default. Prefer metadata + canonical source URL.
3. Keep these rights separate: commercial use, modification, redistribution, attribution, share-alike/copy-left-like obligations.
4. Unknown, custom, missing, non-commercial, or conflicting licenses must fail closed to manual review/reject.
5. Never commit API keys, access tokens, cookies, or user credentials.
6. Preserve provenance: source URL and license source should accompany every verified entry.
7. Repository-level licenses do not automatically cover bundled third-party assets, media, dependencies or imported components.
8. Never upgrade `code-only` or `reference-only` project metadata to `whole-project` reuse based on model judgment, repository popularity or a permissive SPDX code license.
9. `bundledAssetStatus = needs-review` means bundled art/audio/fonts/media must be replaced or independently verified before shipping.
10. Changes to license classification or project reuse scope require evidence from an authoritative license or source page.
11. Adoption plans may output exact project paths only when those paths are explicitly recorded in maintained catalog metadata. Never invent directories from a repository name or project type.
12. `verify-or-source` means maintained metadata does not prove that a target subsystem/resource is covered; inspect before assuming it is absent or reusable.
13. Project adoption planning must remain non-mutating: never clone, execute, extract, install dependencies, delete user files or copy a whole project as part of planning.
14. Automatic downloads require an explicit trusted HTTPS host allowlist and provider-backed file metadata.
15. Never automatically execute, extract or install downloaded third-party content.
16. Never guess a download URL merely to make a workflow automatic.
17. Local installation must remain contained inside an explicit absolute project root.

## Engineering priorities

Correctness > coverage. Maintainability > cleverness. Safe degradation > aggressive automation. Tests should cover license classification, provider mapping, reuse-scope/bundled-asset boundaries, adoption decisions/actions, search filtering, installation containment and version consistency.

## V1 supported scope

- STDIO MCP server
- curated source registry
- live and verified-catalog asset providers
- cross-provider structured search
- verified reusable-project/starter discovery with explicit reuse scope
- deterministic project adoption manifests with license/resource-gap guidance
- GitHub project discovery and repository license inspection
- conservative license classification
- project-level attribution/credits generation
- provider-backed file planning
- explicit safe file installation for allowlisted providers

## Current installation boundary

Automatic file installation is intentionally limited to separately verified acquisition paths: Poly Haven provider files, individual Game Icons SVGs and individual Tabler Icons SVGs.

Catalog-only project/starter providers remain discovery/reference/planning sources. Do not add HTML scraping, arbitrary repository cloning, package-manager execution, shell execution or archive extraction to bypass this boundary.

## Out of scope unless explicitly approved

- hosting/mirroring third-party asset libraries
- arbitrary third-party code execution
- automatic dependency/package installation
- automatic whole-repository cloning/adoption
- mutating a user's project from the adoption-planning tool
- accounts/payments
- telemetry collection
- web UI or hosted SaaS infrastructure
