# AGENTS.md

## Project purpose

Build a conservative, license-aware game-development resource search engine for AI coding agents using MCP. The core product is high-quality discovery: understand game-development search intent, route to suitable providers, preserve provenance/license boundaries, rank relevant candidates well, and degrade safely when exact matches are unavailable.

The project may expose reusable-project planning, attribution, coverage auditing and narrowly scoped safe installation, but it should not expand into an engine import/conversion platform or a general game-development framework.

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
10. Verified community starters with a root MIT license remain `code-only` / `needs-review` unless independent project-wide evidence clears bundled media and dependencies. Benchmark coverage is never evidence for broader reuse rights.
11. Changes to license classification or project reuse scope require evidence from an authoritative license or source page.
12. Adoption plans may output exact project paths only when those paths are explicitly recorded in maintained catalog metadata. Never invent directories from a repository name or project type.
13. `verify-or-source` means maintained metadata does not prove that a target subsystem/resource is covered; inspect before assuming it is absent or reusable.
14. Project adoption planning must remain non-mutating: never clone, execute, extract, install dependencies, delete user files or copy a whole project as part of planning.
15. Coverage benchmarks must reuse the same conservative license/search filters as normal recommendations. Never improve benchmark scores by accepting unknown/non-commercial licenses or changing default share-alike posture.
16. Do not hide weak coverage by removing difficult benchmark scenarios, excluding required slots with no providers, lowering the depth target below three, or counting discovery-only registry entries as successful provider candidates.
17. Recommendation fallback depth may broaden a query only after preserving the first/specific matches and must deduplicate candidates; depth filling must not reorder a broader fallback ahead of a more specific valid result.
18. Never add or relabel a resource solely to improve benchmark depth. If a candidate's license differs from a provider-wide license profile, extend the data model first or leave the benchmark shallow rather than misclassifying the candidate.
19. Treat live-provider errors as a separate reliability signal; do not silently convert an API/network failure into either a successful result or a permanent catalog gap.
20. Semantic fallback may expand soft concepts such as `turret -> cannon/artillery/tank`, but it must preserve explicit hard filters such as dimension, engine-specific-code constraints, commercial-use policy, attribution policy, share-alike policy and reuse scope.
21. Zero-result or shallow searches must expose attempted fallback queries and suggested alternatives. Never silently relax a hard filter to manufacture a match.
22. Use provider capability metadata to avoid querying providers that cannot satisfy an explicit dimension/engine constraint. Provider pruning is an efficiency mechanism, not license evidence.
23. After license eligibility is enforced, semantic/query relevance must outrank popularity, freshness or other metadata bonuses. Do not use permissive licensing as a relevance substitute.
24. Bounded semantic fallback should distribute query budget across detected game-development concepts before deeply expanding one synonym family; preserve the original query and hard filters.
25. Candidate-count/depth benchmarks are not evidence of search relevance. Protect real query/ranking regressions separately.
26. Engine filters constrain engine-specific code and resources that explicitly declare an engine. Generic media assets with no engine tag (for example FBX/glTF/PNG/WAV resources) must not be rejected merely because the current project has an engine context.
27. Do not build engine-specific model conversion, import automation or compatibility orchestration unless explicitly approved. The search engine may carry engine context for routing/filtering, but the coding agent owns integration into the target project.
28. Automatic downloads require an explicit trusted HTTPS host allowlist and provider-backed file metadata.
29. Never automatically execute, extract or install downloaded third-party content.
30. Never guess a download URL merely to make a workflow automatic.
31. Local installation must remain contained inside an explicit absolute project root.

## Engineering priorities

Search relevance > raw result count. Correctness > coverage. Maintainability > cleverness. Safe degradation > aggressive automation.

Tests should cover license classification, provider mapping, reuse-scope/bundled-asset boundaries, adoption decisions/actions, benchmark aggregation/integrity, search relevance/fallback diagnostics, real query ordering, installation containment and version consistency.

Resource expansion should be driven by real search/adoption evidence. Prefer fixing weak relevant-match quality, query understanding and provider routing before adding redundant providers to already healthy categories.

## V1 supported scope

- STDIO MCP server
- curated source registry
- live and verified-catalog asset providers
- cross-provider structured/semantic search with explicit diagnostics
- provider capability routing/pruning
- verified reusable-project/starter discovery plus conservative live GitHub code discovery
- deterministic project adoption manifests with license/resource-gap guidance
- live resource-coverage benchmarking across maintained game scenarios
- real search/ranking regression tests
- GitHub project discovery and repository license inspection
- conservative license classification
- project-level attribution/credits generation
- provider-backed file planning
- explicit safe file installation for allowlisted providers

## Current installation boundary

Automatic file installation is intentionally limited to separately verified acquisition paths: Poly Haven provider files, individual Game Icons SVGs and individual Tabler Icons SVGs.

Catalog-only project/starter providers remain discovery/reference/planning sources. Do not add HTML scraping, arbitrary repository cloning, package-manager execution, shell execution or archive extraction to bypass this boundary.

## Out of scope unless explicitly approved

- engine-specific asset conversion/import pipelines
- hosting/mirroring third-party asset libraries
- arbitrary third-party code execution
- automatic dependency/package installation
- automatic whole-repository cloning/adoption
- mutating a user's project from the adoption-planning tool
- changing license policy merely to improve benchmark scores
- accounts/payments
- telemetry collection
- web UI or hosted SaaS infrastructure
