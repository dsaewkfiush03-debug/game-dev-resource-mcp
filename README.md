# GameDev Resource MCP

A license-aware **game-development resource search engine** for AI coding agents, with semantic query planning, relevance ranking, provider routing, reusable-project discovery and safe license-aware acquisition via Model Context Protocol (MCP).

## Why this exists

AI coding agents are good at finding things, but game-development resources are unusually easy to misuse: “free,” “open source,” “downloadable,” “commercial use,” “redistributable,” and “safe to copy the whole repository” are not equivalent.

GameDev Resource MCP keeps **provenance, licensing, project-reuse scope, adoption guidance, search metadata, stack planning, attribution and installation safety** together so an agent can reuse existing work without silently broadening license rights.

It is designed for Codex, Claude Code, Trae and other MCP-capable coding agents.

## What V1 can do

- Turn a game description into a practical **starter + art + audio + font + reusable code** stack with `recommend_stack`.
- Find verified reusable starters and complete-game references with `find_reusable_projects`.
- Turn one selected project into an actionable, non-mutating adoption manifest with `plan_project_adoption`.
- Measure real required-slot and depth-3 resource coverage with `benchmark_resource_coverage`.
- Distinguish `whole-project`, `code-only`, `reference-only` and `asset-only` reuse instead of treating a repository license as blanket clearance.
- Track bundled-media status separately as `none`, `same-license`, `separately-licensed` or `needs-review`.
- Emit keep/replace/review/remove actions, project/component license obligations and unresolved resource needs.
- Search multiple game-resource providers with one query.
- Expand game-development concepts through bounded semantic fallback while preserving explicit hard filters.
- Diversify fallback across subjects/themes/styles instead of spending the whole query budget on one synonym family.
- Prefer resources that cover several requested concepts (for example turret + enemy + cyberpunk + low-poly) over broad one-concept matches.
- Return search diagnostics (attempted queries, fallback level, provider pruning and suggested alternative queries) instead of an opaque zero-result response.
- Expose provider capability metadata so agents can see which sources cover 2D/3D/audio/font/code and engine-specific ecosystems.
- Search live CC0 materials/HDRIs/3D assets from Poly Haven and ambientCG.
- Search openly licensed images/audio through Openverse with per-item creator/license metadata.
- Search the Godot Asset Library live for addons/projects with per-item licenses.
- Search concrete verified Godot, Phaser and Raylib starter/project references.
- Search a conservative verified community starter catalog for Unity and Unreal; current entries are `code-only` / `needs-review`, not blanket whole-project clearance.
- Search GitHub live for reusable game systems and conservatively classify detected repository licenses.
- Search thousands of individual Game Icons and Tabler Icons SVGs instead of only category pages.
- Audit verified-catalog freshness with `audit_resource_verification`.
- Generate project-level `THIRD_PARTY_ASSETS.md` and `CREDITS.md` content.
- Safely install an explicitly selected Poly Haven file or individual Game Icons/Tabler SVG with host/path, size and filesystem checks.

## 5-minute setup

Requires Node.js 20+.

```bash
git clone https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp.git
cd game-dev-resource-mcp
npm ci
npm run build
```

Run the MCP server over STDIO:

```bash
node dist/index.js
```

### Codex CLI

```bash
codex mcp add game-dev-resource-mcp -- node /absolute/path/to/game-dev-resource-mcp/dist/index.js
codex mcp list
```

For Codex `config.toml`, Claude Code, Trae and generic MCP client examples, see [`docs/client-setup.md`](docs/client-setup.md).

`GITHUB_TOKEN` is optional and improves GitHub API rate limits. Never commit tokens or API keys.

## Recommended workflow

For a whole game, start from the strongest reusable base you can verify instead of assembling everything from zero:

```text
user game description
        ↓
find_reusable_projects / recommend_stack
        ↓
choose project candidate
        ↓
plan_project_adoption
        ↓
decision + keep/replace/review actions
        ↓
license obligations + resource gaps
        ↓
find_game_assets for unresolved slots
        ↓
plan_asset_install / install_asset_file when supported
        ↓
engine-specific implementation by the coding agent
        ↓
generate_project_attribution
```

For a single known asset/code need, call `find_game_assets` directly.

See [`docs/search-quality.md`](docs/search-quality.md), [`docs/project-reuse.md`](docs/project-reuse.md), [`docs/project-adoption.md`](docs/project-adoption.md), [`docs/community-starters.md`](docs/community-starters.md), [`docs/coverage-benchmark.md`](docs/coverage-benchmark.md) and [`docs/end-to-end-example.md`](docs/end-to-end-example.md).

## Reusable project safety

Project/source-code licensing does not automatically clear bundled art, audio, fonts, logos, sample media or dependencies.

### `reuseScope`

| Value | Meaning |
|---|---|
| `whole-project` | Maintained evidence supports using the project as a project-wide starting point under its stated obligations. |
| `code-only` | Reuse code/structure; bundled media must be replaced or independently verified. |
| `reference-only` | Study the implementation; direct copying remains blocked until component licensing is reviewed. |
| `asset-only` | Reuse is scoped to media/assets rather than a project skeleton. |

### `bundledAssetStatus`

| Value | Meaning |
|---|---|
| `none` | No material bundled asset set needs separate clearance for intended starter use. |
| `same-license` | Maintained upstream evidence covers relevant project/demo content under the same project license. |
| `separately-licensed` | Components have explicit separate licenses that must be followed. |
| `needs-review` | Bundled media is not sufficiently established for blanket reuse. |

An agent must never upgrade `code-only` or `reference-only` to `whole-project` using model judgment alone.

## `plan_project_adoption`

V1.10 turns a selected reusable project into a conservative implementation manifest.

Example:

```text
plan_project_adoption
  provider: raylib
  projectId: raylib-game-template
  targetDescription: "2D road survival game with vehicles, combat and inventory"
```

The result includes:

- an adoption decision such as `adopt-project-base` or `reuse-code-only`;
- allowed reuse boundaries and forbidden assumptions;
- `keep`, `replace`, `review` and `remove` actions;
- path-level actions only where maintained catalog evidence explicitly records the path;
- project and component license obligations;
- target resource slots inferred from the game description;
- `declared-in-candidate` versus `verify-or-source` coverage;
- suggested next MCP calls for unresolved required slots;
- a suggested project-attribution call.

`verify-or-source` deliberately means “maintained metadata does not prove coverage.” It does **not** mean the project definitely lacks that subsystem.

The planner never clones, executes, installs dependencies, extracts archives, deletes files or mutates the user's project.

## `recommend_stack`

`recommend_stack` converts a broad game description into deterministic resource slots. It recognizes common English and Chinese game-development terms and can infer engine, 2D/3D, style, genre and feature intent.

Typical slots include starter/reusable project, environment, vehicles, characters, weapons, UI, icons, sound, music, fonts, shaders, driving, inventory, combat, networking, save, AI, procedural generation and dialogue.

The planner does **not** invent license rights. Every slot is resolved through provider metadata and the same conservative license filters used by direct search. If a requested engine has no verified starter provider, the starter slot remains unresolved instead of silently substituting another engine.

V1.15 recognizes UrhoX/Urho3D/TapMaker, LÖVE/Love2D and Defold as explicit engine intents for code discovery. These engines do not automatically gain a verified starter catalog; GitHub discoveries remain `code-only / needs-review`.

The MCP-facing tool defaults to `responseMode = summary` so a normal recommendation does not dump tens of kilobytes of raw metadata into an agent context. Use `responseMode = full` when detailed per-asset provenance/ranking fields are required.

## `benchmark_resource_coverage`

V1.11 adds a maintained coverage benchmark so provider expansion can be driven by measured gaps instead of intuition.

- `smoke` runs 12 balanced scenarios across Godot, Phaser, Raylib, Unity, Unreal and generic game concepts.
- `full` runs all 39 maintained scenarios.
- required-slot coverage measures whether at least one candidate passed the current search/license filters.
- depth-3 coverage measures whether a required slot has at least three candidates and is therefore healthier than a one-result edge case.
- required slots with no configured providers stay in the denominator.
- live-provider errors are reported separately from persistent catalog gaps.

Benchmark scores never override or relax license rules, and depth alone does not prove semantic relevance or engine compatibility. In the V1.13 timestamped 39-scenario full run (2026-08-20), required-slot coverage was 100%, depth-3 coverage 98.9%, all 39 scenarios were complete, unsupported required slots were 0 and provider errors were 0. V1.14 adds per-entry verified-catalog license profiles and accurately adds a CC0 Unreal starter, closing the previously shallow Unreal starter depth without relabeling it as MIT. See [`docs/coverage-benchmark.md`](docs/coverage-benchmark.md).

## MCP tools

| Tool | Purpose |
|---|---|
| `recommend_stack` | Turn a game description into a multi-category starter + media + code stack with license summary and gaps. |
| `find_reusable_projects` | Find verified starters/complete-game references and expose project reuse scope plus bundled-asset status. |
| `plan_project_adoption` | Turn one selected project into a non-mutating adoption manifest with actions, obligations and resource gaps. |
| `benchmark_resource_coverage` | Benchmark required-slot/depth-3 coverage and rank weak resource categories. |
| `find_game_assets` | Preferred targeted cross-provider search with ranking, license and reuse filters. |
| `search_game_assets` | Search the broad source registry. |
| `search_live_assets` | Search one provider directly. |
| `get_asset_files` | Resolve official provider-hosted file metadata where available. |
| `plan_asset_install` | Plan a safe installation without writing to disk. |
| `install_asset_file` | Download one explicitly selected verified file into a local project. |
| `list_asset_providers` | List provider modes. |
| `audit_resource_verification` | Audit freshness of maintained verified catalogs. |
| `search_open_source_projects` | Compatibility tool for targeted GitHub repository search. |
| `inspect_repository` | Inspect repository metadata and detected license. |
| `check_license` | Classify common licenses conservatively. |
| `generate_attribution` | Generate attribution for one resource. |
| `generate_project_attribution` | Generate project-level third-party asset and credits manifests. |

## Providers

| Provider | Mode | Typical content | License/reuse posture | Auto-install |
|---|---|---|---|---|
| Poly Haven | Live API | HDRIs, PBR textures, 3D models | CC0 assets | Yes, allowlisted official files |
| ambientCG | Live API | PBR materials, HDRIs, terrain, decals, atlases, 3D models | CC0 | No |
| Openverse | Live API | Open images and audio | Per-item CC/public-domain metadata | No |
| Godot Asset Library | Live API | Godot addons, tools, projects, shaders | Per-item license | No |
| GitHub Open-Source Code | Live API | Inventory, combat, networking, AI, save, procedural and other code | Detected repository SPDX; bundled components remain separate | No |
| KayKit | Live official index | CC0 3D packs | Official CC0 pack repositories | No |
| Game Icons | Live official index | Individual game/UI SVG icons | CC BY 3.0 + creator attribution | Yes, exact official-repo SVG only |
| Tabler Icons | Live official index | Individual outline/filled SVG icons | MIT | Yes, exact official-repo SVG only |
| Kenney | Verified catalog | 60+ 2D/3D/UI/VFX/audio packs | CC0 | No |
| Quaternius | Verified catalog | 35+ structured 3D packs | CC0 | No |
| Google Fonts | Verified catalog | Game-oriented fonts including CJK | SIL OFL 1.1 per family | No |
| Godot demos | Verified catalog | Concrete 2D/3D games and system demos | MIT; maintained entries `whole-project` / `same-license` | No |
| Phaser starters | Verified catalog | Official web-game templates + `create-game` | MIT code/templates; conservatively `code-only` / `needs-review` media | No |
| Raylib projects | Verified catalog | Official game template + complete-game source references | Template `whole-project`; game references `code-only` under source-specific zlib statement | No |
| Verified Community Starters | Verified catalog | Unity and Unreal community project templates | Root MIT verified; conservatively `code-only` / `needs-review` for bundled media/dependencies | No |

The broader source registry also contains marketplaces and community libraries such as OpenGameArt, itch.io, Sketchfab, Fab, Unity Asset Store, Freesound and others. Those are **discovery sources**, not blanket commercial-use approvals.

## Verification freshness

Verified static catalogs can carry `verificationStatus` and `verifiedAt`. `audit_resource_verification` reports `current`, `stale`, `needs-review` and `untracked` entries.

A stale record is not automatically unusable. It means cached source/license evidence is old enough to recheck. See [`docs/verification.md`](docs/verification.md).

## Search and license model

`find_game_assets` can filter by provider, category, engine, dimension, style, format, asset type, genre, animation, reuse scope, bundled-asset status and license posture.

Default license filtering is conservative:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

The project tracks commercial use, modification, redistribution, attribution, share-alike, creator provenance, source/license URLs, `reuseScope`, `bundledAssetStatus`, component licenses and service-level obligations separately.

Recognized licenses include CC0, Public Domain Mark, MIT, MIT/Apache dual licensing, BSD, Apache-2.0, Zlib, Boost, CC BY, CC BY-SA, GPL/LGPL families, OpenGameArt attribution licenses and SIL OFL 1.1. Unknown, custom, missing or non-commercial licenses fail closed to manual review/rejection.

Search/ranking signals never override license filtering.

## Safe installation

Automatic installation remains intentionally narrow. Current allowlisted acquisition paths are:

- Poly Haven verified provider files;
- individual Game Icons SVGs from `game-icons/icons`;
- individual Tabler SVGs from `tabler/tabler-icons/icons`.

`raw.githubusercontent.com` is not trusted globally. The installer validates provider-specific repository path prefixes in addition to hostname.

`install_asset_file` prevents path traversal, rejects pre-existing symlink/junction destination components, validates every redirect target, enforces size/hash checks where available, does not overwrite unless explicitly requested, and never executes downloaded content, extracts archives, runs package managers or automatically clones third-party repositories.

Project discovery and adoption planning do **not** change this installation boundary. See [`docs/installation.md`](docs/installation.md).

## Attribution manifests

After adopting resources, use `generate_project_attribution` to create content for:

```text
THIRD_PARTY_ASSETS.md
CREDITS.md
```

Preserve creator and source/license metadata when passing adopted resources into the attribution workflow.

## Development

```bash
npm ci
npm run validate
```

CI validates Node.js 20 and 22, packs the npm tarball, installs it into a clean temporary project and smoke-starts the installed MCP binary.

## Design principles

1. Correctness over coverage.
2. Registry first; asset hosting last.
3. Primary-source licensing evidence over AI inference.
4. Commercial use and redistribution are separate questions.
5. Repository code licensing and whole-project/bundled-media clearance are separate questions.
6. Adoption planning is separate from project mutation or code execution.
7. Exact project paths require explicit maintained evidence; never invent directory structure.
8. Unknown rights fail closed.
9. Recommendation and adoption reuse the same conservative metadata/license boundaries.
10. `code-only` / `reference-only` must never be silently upgraded to `whole-project`.
11. Shared download/CDN hosts require provider-specific path restrictions, not host-only trust.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## V1 scope and limitations

V1 is a practical foundation, not a universal asset or open-source-game index. Coverage continues to expand, and some sources expose only canonical links because a stable safe acquisition API is unavailable or service terms are unsuitable for automated commercial workflows.

The project provides technical metadata and conservative automated classification, **not legal advice**. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Release notes

See [`RELEASE_NOTES.md`](RELEASE_NOTES.md).

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
