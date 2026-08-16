# GameDev Resource MCP

License-aware game development resource discovery, stack recommendation and safe asset installation for AI coding agents via Model Context Protocol (MCP).

## Why this exists

AI coding agents are good at finding things, but game-development resources are unusually easy to misuse: “free,” “open source,” “downloadable,” “commercial use,” and “redistributable” are not equivalent.

GameDev Resource MCP gives agents a conservative resource layer that keeps **provenance, licensing, search metadata, stack planning, attribution and installation safety** together.

It is designed for Codex, Claude Code, Trae and other MCP-capable coding agents.

## What V1 can do

- Turn a game description into a practical **art + audio + font + reusable code** stack with `recommend_stack`.
- Search multiple game-resource providers with one query.
- Search live CC0 materials/HDRIs/3D assets from Poly Haven and ambientCG.
- Search openly licensed images/audio through Openverse with per-item creator/license metadata.
- Search the Godot Asset Library live for addons/projects with per-item licenses.
- Search GitHub live for reusable game systems and conservatively classify detected repository licenses.
- Search thousands of individual Game Icons and Tabler Icons SVGs instead of only category pages.
- Preserve creator/attribution metadata for per-item resources where the upstream source exposes it.
- Filter by commercial-use posture and license obligations.
- Filter by engine, 2D/3D/audio/font/code, style, format, asset type, genre and animation state.
- Generate project-level `THIRD_PARTY_ASSETS.md` and `CREDITS.md` content.
- Resolve official provider-hosted files where supported.
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
```

Then verify:

```bash
codex mcp list
```

For Codex `config.toml`, Claude Code, Trae and generic MCP client examples, see [`docs/client-setup.md`](docs/client-setup.md).

`GITHUB_TOKEN` is optional and improves GitHub API rate limits. Never commit tokens or API keys.

## Recommended workflow

For a whole game or feature idea, start with `recommend_stack`:

```text
user game description
    ↓
recommend_stack
    ↓
art + audio + font + gameplay-code slots
    ↓
primary candidates + alternatives + gaps
    ↓
license summary
    ↓
select resources
    ↓
plan_asset_install (when supported)
    ↓
install_asset_file (explicit file only)
    ↓
generate_project_attribution
    ↓
engine-specific integration by the coding agent
```

For a single known need, call `find_game_assets` directly.

See [`docs/end-to-end-example.md`](docs/end-to-end-example.md) for a complete example.

## `recommend_stack`

`recommend_stack` converts a broad game description into deterministic resource slots.

Typical media/resource slots include:

- starter/framework examples;
- environment;
- vehicles;
- characters;
- weapons/combat art;
- UI and icons;
- sound effects;
- music/jingles;
- fonts, including verified CJK/Chinese options;
- shader/GPU examples where relevant.

V1.4+ also creates reusable gameplay-code slots when the description explicitly requires them:

- vehicle/driving system;
- inventory/loot/crafting system;
- combat system;
- networking/multiplayer;
- save/persistence system;
- enemy/NPC AI;
- procedural generation;
- dialogue/conversation system.

The planner recognizes common English and Chinese game-development terms, including engine, 2D/3D, pixel, sci-fi, fantasy, horror, military, low-poly, survival, RPG, road/vehicle, combat, inventory, networking, save, AI, procedural generation, dialogue and CJK/Chinese UI intent.

It does **not** use model judgment to invent license rights. Each slot is resolved through the same provider metadata and conservative license filters used by `find_game_assets`.

The result includes:

- inferred engine/dimension/style/genre/theme signals;
- required versus optional slots;
- a primary recommendation and alternatives per resolved slot;
- provider failures without discarding other successful slots;
- unresolved required gaps;
- a license/risk summary for primary selections;
- asset attribution and provider service-credit requirements where known.

If a requested engine has no verified starter provider, the starter slot remains unresolved instead of silently substituting a different engine. Gameplay-code discovery may still search GitHub, but repository-level licensing does not prove dependency or bundled-media licensing.

## MCP tools

| Tool | Purpose |
|---|---|
| `recommend_stack` | Turn a game description into a multi-category media + code resource stack with license summary and gaps. |
| `find_game_assets` | Preferred targeted cross-provider search with ranking and license filters. |
| `search_game_assets` | Search the broad source registry. |
| `search_live_assets` | Search one provider directly. |
| `get_asset_files` | Resolve official provider-hosted file metadata where available. |
| `plan_asset_install` | Plan a safe installation without writing to disk. |
| `install_asset_file` | Download one explicitly selected verified file into a local project. |
| `list_asset_providers` | List provider modes. |
| `search_open_source_projects` | Compatibility tool for targeted GitHub repository search. |
| `inspect_repository` | Inspect repository metadata and detected license. |
| `check_license` | Classify common licenses conservatively. |
| `generate_attribution` | Generate attribution for one resource. |
| `generate_project_attribution` | Generate project-level third-party asset and credits manifests. |

## Providers

| Provider | Mode | Typical content | License posture | Auto-install |
|---|---|---|---|---|
| Poly Haven | Live API | HDRIs, PBR textures, 3D models | CC0 assets | Yes, for allowlisted official file URLs |
| ambientCG | Live API | PBR materials, HDRIs, terrain, decals, atlases, 3D models | CC0 | No |
| Openverse | Live API | Open images and audio | Per-item CC/public-domain metadata with creator provenance where available | No |
| Godot Asset Library | Live API | Godot addons, tools, projects, shaders | Per-item license | No |
| GitHub Open-Source Code | Live API | Inventory, combat, networking, AI, save, procedural and other code | Detected repository SPDX license; fail closed when unknown/missing | No |
| Game Icons | Live API/index | Individual game/UI SVG icons | Conservatively CC BY 3.0 with creator attribution metadata | Yes, exact official-repo SVG only |
| Tabler Icons | Live API/index | Individual outline/filled SVG icons | MIT | Yes, exact official-repo SVG only |
| Kenney | Verified catalog | 2D, 3D, UI, vehicles, audio | CC0 | No |
| Quaternius | Verified catalog | 3D characters, vehicles, environments | CC0 | No |
| Google Fonts | Verified catalog | 15 game-oriented fonts including CJK/Chinese | SIL OFL 1.1 with per-family license provenance | No |
| Godot demos | Verified catalog | Code, shaders, starter demos | MIT at repository level | No |
| Phaser starters | Verified catalog | Web-game starter templates | MIT code templates | No |

Game Icons and Tabler Icons are indexed from their official GitHub repository trees. This means searches operate on individual SVG filenames/metadata rather than five broad category links.

The broader source registry also contains marketplaces and community libraries such as OpenGameArt, itch.io, Sketchfab, Fab, Unity Asset Store, Freesound and others. Those are **discovery sources**, not blanket commercial-use approvals.

Freesound is intentionally not a default live provider for commercial workflows: using the free Freesound API has separate non-commercial API terms even though individual sounds have their own Creative Commons licenses. A commercial API agreement would need to be handled separately.

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

Search scores and stack recommendations are retrieval heuristics, **not legal clearance**.

## License and provenance model

The project tracks these separately rather than collapsing them into one “safe” flag:

- commercial use
- modification
- redistribution
- attribution
- share-alike / copyleft-like obligations
- creator / creator URL when available
- attribution text when upstream exposes or requires it
- canonical source URL
- license source URL
- API/service-level obligations

Recognized licenses include CC0, Public Domain Mark, MIT, MIT/Apache dual licensing, BSD, Apache-2.0, Zlib, Boost, CC BY, CC BY-SA, GPL/LGPL families, OpenGameArt attribution licenses and SIL OFL 1.1.

Unknown, custom, missing or non-commercial licenses fail closed to manual review/rejection.

Repository-level licenses must not be assumed to cover dependencies or independently licensed bundled assets/media.

## Safe installation

V1 automatic installation remains intentionally narrow. Current allowlisted acquisition paths are:

- Poly Haven verified provider files;
- individual Game Icons SVGs from `game-icons/icons`;
- individual Tabler SVGs from `tabler/tabler-icons/icons`.

`raw.githubusercontent.com` is **not** trusted globally. The installer validates both hostname and provider-specific repository path prefixes.

`install_asset_file`:

- requires an absolute project root;
- prevents path traversal outside the project;
- rejects pre-existing symlink/junction destination components;
- only accepts allowlisted HTTPS download hosts and provider-specific paths;
- manually validates every redirect target;
- defaults to a 128 MiB per-file limit;
- enforces a 1 GiB hard maximum;
- validates provider size metadata;
- validates MD5 when available;
- does not overwrite unless explicitly requested;
- never executes downloaded content;
- never extracts archives;
- never runs package managers or shell commands;
- never automatically clones third-party repositories.

See [`docs/installation.md`](docs/installation.md).

## Attribution manifests

After adopting resources, use `generate_project_attribution` to create content for:

```text
THIRD_PARTY_ASSETS.md
CREDITS.md
```

When a provider result includes `creator` or `attributionText`, the coding agent should preserve that provenance when passing adopted resources into the attribution workflow.

This does not replace legal review, but it makes provenance and release obligations much harder to lose during AI-driven development.

## Development

```bash
npm ci
npm run validate
```

CI validates Node.js 20 and 22, then packs the npm tarball, installs it into a clean temporary project and smoke-starts the installed MCP binary.

## Design principles

1. Correctness over coverage.
2. Registry first; asset hosting last.
3. Primary-source licensing evidence over AI inference.
4. Commercial use and redistribution are separate questions.
5. Unknown rights fail closed.
6. Never store secrets.
7. Never execute downloaded third-party content as part of asset installation.
8. Recommendation must reuse the same conservative license filters as direct search.
9. Repository-level license detection is evidence about that repository, not automatic clearance for dependencies or bundled media.
10. Shared download/CDN hosts require provider-specific path restrictions, not host-only trust.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## V1 scope and limitations

V1 is a practical foundation, not a universal asset index. Provider and verified-catalog coverage continues to expand. Some sources expose only canonical links because a stable, safe public acquisition API is not available or API terms are not suitable for the default commercial workflow.

The project provides technical metadata and conservative automated classification, **not legal advice**. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Release notes

See [`RELEASE_NOTES.md`](RELEASE_NOTES.md).

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
