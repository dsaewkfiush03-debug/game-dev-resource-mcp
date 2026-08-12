# GameDev Resource MCP

License-aware game development resource discovery and safe asset installation for AI coding agents via Model Context Protocol (MCP).

## Why this exists

AI coding agents are good at finding things, but game-development resources are unusually easy to misuse: “free,” “open source,” “downloadable,” “commercial use,” and “redistributable” are not equivalent.

GameDev Resource MCP gives agents a conservative resource layer that keeps **provenance, licensing, search metadata, attribution and installation safety** together.

It is designed for Codex, Claude Code, Trae and other MCP-capable coding agents.

## What V1 can do

- Search multiple game-resource providers with one query.
- Filter by commercial-use posture and license obligations.
- Filter by engine, 2D/3D/audio/font/code, style, format, asset type, genre and animation state.
- Search GitHub for reusable game-development projects and inspect detected repository licenses.
- Generate project-level `THIRD_PARTY_ASSETS.md` and `CREDITS.md` content.
- Resolve official provider-hosted files where supported.
- Safely install an explicitly selected file into a local project with path, host, size and hash checks.

## 5-minute setup

Requires Node.js 20+.

```bash
git clone https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp.git
cd game-dev-resource-mcp
npm install
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

`GITHUB_TOKEN` is optional and only improves GitHub API rate limits. Never commit tokens or API keys.

## Recommended workflow

```text
user request
    ↓
find_game_assets
    ↓
license + metadata filtering
    ↓
select resource
    ↓
plan_asset_install (when supported)
    ↓
install_asset_file (explicit file only)
    ↓
generate_project_attribution
    ↓
engine-specific integration by the coding agent
```

See [`docs/end-to-end-example.md`](docs/end-to-end-example.md) for a complete example.

## MCP tools

| Tool | Purpose |
|---|---|
| `find_game_assets` | Preferred cross-provider search with ranking and license filters. |
| `search_game_assets` | Search the curated source registry. |
| `search_live_assets` | Search one provider directly. |
| `get_asset_files` | Resolve official provider-hosted file metadata where available. |
| `plan_asset_install` | Plan a safe installation without writing to disk. |
| `install_asset_file` | Download one explicitly selected verified file into a local project. |
| `list_asset_providers` | List provider modes. |
| `search_open_source_projects` | Search GitHub for reusable game-development repositories. |
| `inspect_repository` | Inspect repository metadata and detected license. |
| `check_license` | Classify common licenses conservatively. |
| `generate_attribution` | Generate attribution for one resource. |
| `generate_project_attribution` | Generate project-level third-party asset and credits manifests. |

## Providers

| Provider | Mode | Typical content | License posture | Auto-install |
|---|---|---|---|---|
| Poly Haven | Live API | HDRIs, textures, 3D models | CC0 assets | Yes, for allowlisted official file URLs |
| Kenney | Verified catalog | 2D, 3D, UI, vehicles, audio | CC0 | No |
| Quaternius | Verified catalog | 3D characters, vehicles, environments | CC0 | No |
| Game Icons | Verified catalog | Game/UI icons | Conservatively treated as CC BY 3.0 | No |
| Google Fonts | Verified catalog | Game-suitable fonts | SIL OFL 1.1 | No |
| Godot demos | Verified catalog | Code, shaders, starter demos | MIT at repository level | No |
| Phaser starters | Verified catalog | Web-game starter templates | MIT code templates | No |

OpenGameArt and arbitrary GitHub repositories remain **per-item/per-repository review sources**, not blanket-whitelisted providers.

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

Search scores are retrieval heuristics, **not legal clearance**.

## License model

The project tracks these separately rather than collapsing them into one “safe” flag:

- commercial use
- modification
- redistribution
- attribution
- share-alike / copyleft-like obligations
- canonical source URL
- license source URL
- API/service-level obligations

Examples of recognized licenses include CC0, MIT, BSD, Apache-2.0, CC BY, CC BY-SA, GPL/LGPL families, OpenGameArt attribution licenses and SIL OFL 1.1.

Unknown, custom, missing or non-commercial licenses fail closed to manual review/rejection.

Repository-level licenses must not be assumed to cover independently licensed bundled assets.

## Safe installation

V1 automatic installation is intentionally narrow. **Only Poly Haven currently exposes a sufficiently verifiable automatic acquisition path.**

`install_asset_file`:

- requires an absolute project root;
- prevents path traversal outside the project;
- only accepts allowlisted HTTPS download hosts;
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

This does not replace legal review, but it makes provenance and release obligations much harder to lose during AI-driven development.

## Development

```bash
npm run check
npm test
npm run build
```

Or run all release validation steps:

```bash
npm run validate
```

CI runs the same validation path on Node.js 22.

## Design principles

1. Correctness over coverage.
2. Registry first; asset hosting last.
3. Primary-source licensing evidence over AI inference.
4. Commercial use and redistribution are separate questions.
5. Unknown rights fail closed.
6. Never store secrets.
7. Never execute downloaded third-party content as part of asset installation.

See [`AGENTS.md`](AGENTS.md) and [`CONTRIBUTING.md`](CONTRIBUTING.md).

## V1 scope and limitations

V1 is a practical foundation, not a universal asset index. Verified catalog coverage is intentionally incomplete. Some providers expose only canonical source links because a stable, safe public acquisition API is not available.

The project provides technical metadata and conservative automated classification, **not legal advice**. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Release notes

See [`RELEASE_NOTES.md`](RELEASE_NOTES.md).

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
