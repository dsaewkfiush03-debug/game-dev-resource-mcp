# GameDev Resource MCP

License-aware game-development resource discovery, **reusable project selection**, stack recommendation and safe asset installation for AI coding agents via Model Context Protocol (MCP).

## Why this exists

AI coding agents are good at finding things, but game-development resources are unusually easy to misuse: “free,” “open source,” “downloadable,” “commercial use,” “redistributable,” and “safe to copy the whole repository” are not equivalent.

GameDev Resource MCP gives agents a conservative resource layer that keeps **provenance, licensing, project-reuse scope, search metadata, stack planning, attribution and installation safety** together.

It is designed for Codex, Claude Code, Trae and other MCP-capable coding agents.

## What V1 can do

- Turn a game description into a practical **starter + art + audio + font + reusable code** stack with `recommend_stack`.
- Find verified reusable starters and complete-game references with `find_reusable_projects`.
- Distinguish `whole-project`, `code-only`, `reference-only` and `asset-only` reuse instead of treating a repository license as blanket clearance.
- Track bundled-media status separately as `none`, `same-license`, `separately-licensed` or `needs-review`.
- Search multiple game-resource providers with one query.
- Search live CC0 materials/HDRIs/3D assets from Poly Haven and ambientCG.
- Search openly licensed images/audio through Openverse with per-item creator/license metadata.
- Search the Godot Asset Library live for addons/projects with per-item licenses.
- Search concrete verified Godot starter/game/system demos such as 2D RPG/platformer, 3D platformer, Truck Town, navigation and voxel references.
- Search verified Raylib starter and complete-game source references.
- Search GitHub live for reusable game systems and conservatively classify detected repository licenses.
- Search thousands of individual Game Icons and Tabler Icons SVGs instead of only category pages.
- Filter by commercial-use posture, attribution/share-alike obligations, engine, dimension, style, format, asset type, genre, reuse scope and bundled-asset status.
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

For a whole game, first look for an existing reusable base instead of assembling everything from zero:

```text
user game description
    ↓
find_reusable_projects / recommend_stack
    ↓
project reuse scope + bundled-asset status
    ↓
choose a verified starter/reference when appropriate
    ↓
fill missing art + audio + font + gameplay-code slots
    ↓
license summary + gaps
    ↓
select exact resources
    ↓
plan_asset_install / install_asset_file when supported
    ↓
generate_project_attribution
    ↓
engine-specific integration by the coding agent
```

For a single known asset/code need, call `find_game_assets` directly.

See [`docs/project-reuse.md`](docs/project-reuse.md) for project-level reuse semantics and [`docs/end-to-end-example.md`](docs/end-to-end-example.md) for the asset workflow.

## Reusable project safety

V1.9 adds explicit project-level metadata because **repository/source-code licensing does not automatically clear bundled art, audio, fonts, logos, sample media or dependencies**.

### `reuseScope`

| Value | Meaning |
|---|---|
| `whole-project` | Maintained evidence supports using the project as a project-wide starting point under its stated obligations. |
| `code-only` | Reuse code/structure; bundled media must be replaced or independently verified. |
| `reference-only` | Study the implementation; do not directly copy components until licensing is reviewed. |
| `asset-only` | Reuse is scoped to media/assets rather than a project skeleton. |

### `bundledAssetStatus`

| Value | Meaning |
|---|---|
| `none` | No material bundled asset set needs separate clearance for intended starter use. |
| `same-license` | Upstream evidence covers the relevant project/demo content under the same project license. |
| `separately-licensed` | Components have explicit separate licenses that must be followed. |
| `needs-review` | Bundled media is not sufficiently established for blanket reuse. |

An agent must never upgrade `code-only` or `reference-only` to `whole-project` using model judgment alone.

## `recommend_stack`

`recommend_stack` converts a broad game description into deterministic resource slots. It recognizes common English and Chinese game-development terms and can infer engine, 2D/3D, style, genre and feature intent.

Typical slots include:

- verified starter / reusable project;
- environment;
- vehicles;
- characters;
- weapons/combat art;
- UI and icons;
- sound effects and music;
- fonts including CJK/Chinese choices;
- shader/GPU examples;
- vehicle/driving system;
- inventory/loot/crafting;
- combat;
- networking/multiplayer;
- save/persistence;
- enemy/NPC AI;
- procedural generation;
- dialogue/conversation.

The planner does **not** invent license rights. Every slot is resolved through provider metadata and the same conservative license filters used by direct search. If a requested engine has no verified starter provider, the starter slot remains unresolved instead of silently substituting another engine.

## MCP tools

| Tool | Purpose |
|---|---|
| `recommend_stack` | Turn a game description into a multi-category starter + media + code stack with license summary and gaps. |
| `find_reusable_projects` | Find verified starters/complete-game references and expose project reuse scope plus bundled-asset status. |
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
| Kenney | Verified catalog | 60+ 2D/3D/UI/VFX/audio packs | CC0, reverified 2026-08-16 | No |
| Quaternius | Verified catalog | 35+ structured 3D packs | CC0, reverified 2026-08-16 | No |
| Google Fonts | Verified catalog | 15 game-oriented fonts including CJK | SIL OFL 1.1 per family | No |
| Godot demos | Verified catalog | Concrete 2D/3D games and system demos | MIT; maintained entries `whole-project` / `same-license` | No |
| Phaser starters | Verified catalog | Official web-game templates + `create-game` | MIT code/templates; conservatively `code-only` / `needs-review` media | No |
| Raylib projects | Verified catalog | Official game template + complete-game source references | Template `whole-project`; game collection references `code-only` under source-specific zlib statement | No |

The broader source registry also contains marketplaces and community libraries such as OpenGameArt, itch.io, Sketchfab, Fab, Unity Asset Store, Freesound and others. Those are **discovery sources**, not blanket commercial-use approvals.

Freesound is intentionally not a default live provider for commercial workflows: its free API has separate non-commercial API terms even though individual sounds have their own Creative Commons licenses.

## Verification freshness

Verified static catalogs can carry `verificationStatus` and `verifiedAt`. `audit_resource_verification` reports `current`, `stale`, `needs-review` and `untracked` entries.

A stale record is **not automatically unusable**. It means cached source/license evidence is old enough to recheck. The audit never fabricates newer rights or dates.

See [`docs/verification.md`](docs/verification.md).

## Search model

`find_game_assets` supports structured filters including:

- `providers`
- `categories`
- `engines`
- `dimensions`
- `styles`
- `formats`
- `assetTypes`
- `gameGenres`
- `reuseScopes`
- `bundledAssetStatuses`
- `animated`
- `commercialOnly`
- `allowAttribution`
- `allowShareAlike`

Default license filtering is conservative:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

Search scores and stack recommendations are retrieval heuristics, **not legal clearance**. Whole-project candidates with verified project-wide/bundled-asset posture receive only a small ranking bonus; quality signals never override license filters.

## License and provenance model

The project tracks these separately rather than collapsing them into one “safe” flag:

- commercial use;
- modification;
- redistribution;
- attribution;
- share-alike / copyleft-like obligations;
- creator / creator URL / attribution text;
- canonical source URL;
- license source URL;
- project `reuseScope`;
- `bundledAssetStatus` and notes;
- component licenses when explicitly modeled;
- API/service-level obligations.

Recognized licenses include CC0, Public Domain Mark, MIT, MIT/Apache dual licensing, BSD, Apache-2.0, Zlib, Boost, CC BY, CC BY-SA, GPL/LGPL families, OpenGameArt attribution licenses and SIL OFL 1.1.

Unknown, custom, missing or non-commercial licenses fail closed to manual review/rejection.

## Safe installation

Automatic installation remains intentionally narrow. Current allowlisted acquisition paths are:

- Poly Haven verified provider files;
- individual Game Icons SVGs from `game-icons/icons`;
- individual Tabler SVGs from `tabler/tabler-icons/icons`.

`raw.githubusercontent.com` is **not** trusted globally. The installer validates provider-specific repository path prefixes in addition to hostname.

`install_asset_file`:

- requires an absolute project root;
- prevents path traversal outside the project;
- rejects pre-existing symlink/junction destination components;
- validates every redirect target;
- enforces per-file size limits;
- validates provider size/hash metadata where available;
- does not overwrite unless explicitly requested;
- never executes downloaded content;
- never extracts archives;
- never runs package managers or shell commands;
- never automatically clones third-party repositories.

Project discovery in V1.9 does **not** change this installation boundary.

See [`docs/installation.md`](docs/installation.md).

## Attribution manifests

After adopting resources, use `generate_project_attribution` to create content for:

```text
THIRD_PARTY_ASSETS.md
CREDITS.md
```

Preserve creator and attribution metadata when passing adopted resources into the attribution workflow.

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
6. Unknown rights fail closed.
7. Never store secrets.
8. Never execute downloaded third-party content as part of asset installation.
9. Recommendation reuses the same conservative license filters as direct search.
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
