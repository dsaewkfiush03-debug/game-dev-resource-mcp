# GameDev Resource MCP

[![CI](https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**A license-aware game-development resource search engine for AI coding agents.**

GameDev Resource MCP gives Codex, Claude Code, Trae and other MCP-capable agents one place to search for **game assets, reusable starter projects, and game-development code** while keeping provenance, commercial-use rules, attribution requirements and bundled-asset risks visible.

It does **not** host or relicense third-party assets. It helps an agent find relevant resources, understand what can safely be reused, and keep source/license evidence attached to the recommendation.

## What it does

| Need | MCP tool | Result |
|---|---|---|
| “Find everything I need for this game idea” | `recommend_stack` | Starter/project + art + audio + font + code stack, alternatives, gaps and license summary |
| “Find commercially usable low-poly 3D enemies” | `find_game_assets` | Ranked cross-provider results with semantic fallback and license filters |
| “Find a reusable Godot/Phaser/Raylib/Unity/Unreal project” | `find_reusable_projects` | Project candidates with explicit reuse scope and bundled-asset status |
| “Can I actually build on this project?” | `plan_project_adoption` | Keep/replace/review actions, license obligations and unresolved resource needs |
| “Where did this asset come from?” | search + attribution tools | Creator/source/license metadata and project-level credits |
| “Install the selected file safely” | `plan_asset_install` / `install_asset_file` | Narrow allowlisted acquisition with path/size/hash checks where supported |

The project currently integrates **15 providers** across 2D, 3D, audio, fonts, icons, starter projects and reusable code.

## Why this exists

Game-development resources are unusually easy for coding agents to misuse. These statements are **not equivalent**:

- “free”;
- “open source”;
- “downloadable”;
- “commercial use allowed”;
- “redistribution allowed”;
- “the repository is MIT licensed”;
- “every bundled image, sound, font and dependency is also cleared for reuse.”

GameDev Resource MCP keeps those distinctions explicit. Search relevance can broaden through semantic fallback, but hard constraints such as commercial-use policy, attribution/share-alike policy, dimension, engine-specific code scope and project reuse scope remain hard filters.

## One-command Codex setup

Requires **Node.js 20+**, npm and Git.

```bash
codex mcp add game-dev-resource-mcp -- npx -y github:dsaewkfiush03-debug/game-dev-resource-mcp
```

Verify the server is registered:

```bash
codex mcp list
```

That is the recommended install path. The package builds automatically when npm installs it from GitHub, so users do not need to clone the repository or manage an absolute `dist/index.js` path.

If you already expose a `GITHUB_TOKEN`, forward it for higher GitHub API limits:

```bash
codex mcp add game-dev-resource-mcp --env GITHUB_TOKEN="$GITHUB_TOKEN" -- npx -y github:dsaewkfiush03-debug/game-dev-resource-mcp
```

`GITHUB_TOKEN` is optional. Never commit tokens or API keys.

### Generic MCP client configuration

For clients that accept a JSON-style STDIO server configuration:

```json
{
  "mcpServers": {
    "game-dev-resource-mcp": {
      "command": "npx",
      "args": ["-y", "github:dsaewkfiush03-debug/game-dev-resource-mcp"]
    }
  }
}
```

Codex config, Claude Code, Trae and manual source-install examples are in [`docs/client-setup.md`](docs/client-setup.md).

## Try these prompts

After adding the MCP server, ask your coding agent for something concrete:

```text
Find commercially usable low-poly 3D turret, enemy and environment assets.
Prefer CC0 where possible and explain any attribution obligations.
```

```text
I am building a Godot 2D survival game with inventory, combat, save/load,
UI, sound and music. Recommend a starter/resource stack and identify gaps.
```

```text
Find reusable Raylib project bases for a 2D action game.
Do not assume the repository license clears bundled media.
```

```text
Find a reusable project for my game, then produce an adoption plan showing
what I can keep, what should be replaced, and what still needs verification.
```

## Recommended agent workflow

For a whole game or large feature, start from the strongest reusable base that can be verified instead of assembling everything from zero:

```text
user game description
        ↓
recommend_stack / find_reusable_projects
        ↓
choose project candidate
        ↓
plan_project_adoption
        ↓
keep / replace / review actions
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

For one known asset/code need, call `find_game_assets` directly.

## Search quality

The search layer is designed for coding-agent queries rather than exact catalog keywords.

- **Bounded semantic fallback** expands game-development concepts without removing hard constraints.
- **Provider capability routing** avoids calling sources that cannot satisfy explicit dimension/engine needs.
- **Multi-concept ranking** prefers candidates that cover more of the actual request instead of broad but weak matches.
- **Diagnostics** expose attempted queries, fallback level, provider pruning and suggested alternatives instead of returning an opaque zero-result response.
- **Real regressions** protect practical queries such as UrhoX 3D tower-defense searches, cyberpunk low-poly asset ranking and medieval environment ranking.

See [`docs/search-quality.md`](docs/search-quality.md).

## Reusable-project safety

A repository license does not automatically clear bundled art, audio, fonts, logos, sample media or dependencies.

GameDev Resource MCP models project reuse separately:

| `reuseScope` | Meaning |
|---|---|
| `whole-project` | Maintained evidence supports project-wide starter use under the stated obligations |
| `code-only` | Reuse code/structure; bundled media must be replaced or independently verified |
| `reference-only` | Study the implementation; direct copying remains blocked pending review |
| `asset-only` | Reuse is scoped to media/assets rather than a project skeleton |

And bundled content separately:

| `bundledAssetStatus` | Meaning |
|---|---|
| `none` | No material bundled asset set needs separate clearance for intended starter use |
| `same-license` | Maintained evidence covers relevant project/demo content under the same license |
| `separately-licensed` | Components have explicit separate licenses that must be followed |
| `needs-review` | Bundled media is not sufficiently established for blanket reuse |

An agent must never upgrade `code-only` or `reference-only` to `whole-project` using model judgment alone.

See [`docs/project-reuse.md`](docs/project-reuse.md) and [`docs/project-adoption.md`](docs/project-adoption.md).

## MCP tools

| Tool | Purpose |
|---|---|
| `recommend_stack` | Turn a game description into a starter + media + code stack with license summary and gaps |
| `find_game_assets` | Preferred targeted cross-provider search with relevance, license and reuse filters |
| `find_reusable_projects` | Find starter/complete-game references and expose reuse scope plus bundled-asset status |
| `plan_project_adoption` | Turn one selected project into a non-mutating adoption manifest |
| `benchmark_resource_coverage` | Benchmark required-slot/depth-3 coverage and rank weak resource categories |
| `search_game_assets` | Search the broader source registry |
| `search_live_assets` | Search one provider directly |
| `get_asset_files` | Resolve official provider-hosted file metadata where available |
| `plan_asset_install` | Plan a safe installation without writing to disk |
| `install_asset_file` | Download one explicitly selected verified file into a local project |
| `list_asset_providers` | List provider modes and capability metadata |
| `audit_resource_verification` | Audit freshness of maintained verified catalogs |
| `search_open_source_projects` | Compatibility tool for targeted GitHub repository search |
| `inspect_repository` | Inspect repository metadata and detected license |
| `check_license` | Classify common licenses conservatively |
| `generate_attribution` | Generate attribution for one resource |
| `generate_project_attribution` | Generate project-level third-party asset and credits manifests |

## Providers

| Provider | Mode | Typical content | License/reuse posture | Auto-install |
|---|---|---|---|---|
| Poly Haven | Live API | HDRIs, PBR textures, 3D models | CC0 | Yes, allowlisted official files |
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
| Godot demos | Verified catalog | Concrete 2D/3D games and system demos | Maintained entries `whole-project` / `same-license` under repository MIT evidence | No |
| Phaser starters | Verified catalog | Official web-game templates + `create-game` | Conservatively `code-only` / `needs-review` for media | No |
| Raylib projects | Verified catalog | Official game template + complete-game source references | Template can be whole-project; game references remain source-specific | No |
| Verified Community Starters | Verified catalog | Unity and Unreal community templates | Conservatively `code-only` / `needs-review` for bundled media/dependencies | No |

The broader discovery registry also contains marketplaces and community libraries such as OpenGameArt, itch.io, Sketchfab, Fab, Unity Asset Store and Freesound. Those are **discovery sources, not blanket commercial-use approvals**.

## License model

Default cross-provider filtering is conservative:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

The project tracks commercial use, modification, redistribution, attribution, share-alike, creator provenance, source/license URLs, `reuseScope`, `bundledAssetStatus`, component licenses and service-level obligations separately.

Recognized licenses include CC0, Public Domain Mark, MIT, MIT/Apache dual licensing, BSD, Apache-2.0, Zlib, Boost, CC BY, CC BY-SA, GPL/LGPL families, OpenGameArt attribution licenses and SIL OFL 1.1. Unknown, custom, missing or non-commercial licenses fail closed to manual review/rejection.

Search/ranking signals never override license filtering.

## Coverage benchmark

The maintained benchmark contains **39 representative game scenarios** across Godot, Phaser, Raylib, Unity, Unreal and engine-agnostic concepts.

The timestamped V1.13 full run on 2026-08-20 reported:

- 39/39 complete scenarios;
- 357/357 required slots covered (100%);
- 353/357 required slots with at least three candidates (98.9% depth-3);
- 0 unsupported required slots;
- 0 provider errors.

V1.14 then specifically closed the remaining shallow Unreal starter-depth gap with an accurately modeled CC0 entry instead of relabeling it as MIT.

Benchmark scores measure retrieval health. They do **not** override license rules or prove semantic relevance/engine compatibility by themselves.

See [`docs/coverage-benchmark.md`](docs/coverage-benchmark.md).

## Safe installation boundary

Automatic acquisition is intentionally narrow. Current allowlisted paths are:

- Poly Haven verified provider files;
- individual Game Icons SVGs from `game-icons/icons`;
- individual Tabler SVGs from `tabler/tabler-icons/icons`.

`install_asset_file` validates provider-specific hosts/paths, blocks path traversal, rejects pre-existing symlink/junction destination components, validates redirects, enforces size/hash checks where available, does not overwrite unless explicitly requested, and never executes downloaded content, extracts archives, runs package managers or automatically clones third-party repositories.

See [`docs/installation.md`](docs/installation.md).

## Attribution

After selecting resources, `generate_project_attribution` can generate project-level content for:

```text
THIRD_PARTY_ASSETS.md
CREDITS.md
```

Preserve creator and source/license metadata when passing adopted resources into the attribution workflow.

## Manual source install

If you prefer a pinned local checkout instead of the one-command GitHub runner:

```bash
git clone https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp.git
cd game-dev-resource-mcp
npm ci
npm run build
node dist/index.js
```

Then point your MCP client at the absolute path to `dist/index.js`.

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

## Scope and limitations

This project is a resource discovery, evaluation and adoption-planning layer. It deliberately does not become an engine asset-conversion/import platform. The coding agent remains responsible for integrating selected resources into the target project.

Some sources expose only canonical links because a stable safe acquisition API is unavailable or service terms are unsuitable for automated commercial workflows.

The project provides technical metadata and conservative automated classification, **not legal advice**. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Release notes

See [`RELEASE_NOTES.md`](RELEASE_NOTES.md).

## Contributing

Provider fixes, search-quality regressions, license-evidence improvements and reproducible real-agent failure cases are especially useful. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

If the project helps your coding-agent workflow, starring the repository makes it easier for other developers to discover.

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
