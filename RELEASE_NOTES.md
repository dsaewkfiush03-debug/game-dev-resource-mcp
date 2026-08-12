# GameDev Resource MCP v1.0.0

First stable release of the license-aware game-development resource layer for MCP-capable coding agents.

## Highlights

### Cross-provider resource discovery

- Unified `find_game_assets` search across supported providers.
- Structured filters for engine, dimension, style, format, asset type, genre and animation state.
- Explainable ranking with `score` and `matchReasons`.
- Partial provider failures do not discard successful results from other providers.

### License-aware by design

- Separates commercial use, modification, redistribution, attribution and share-alike/copy-left-like obligations.
- Recognizes common game-development licenses including CC0, MIT, BSD, Apache-2.0, CC BY, CC BY-SA, GPL/LGPL, OpenGameArt attribution licenses and SIL OFL 1.1.
- Unknown, custom, missing and non-commercial licenses fail closed to manual review/rejection.
- Repository-level licenses are not assumed to cover every bundled asset.

### Verified providers

- Poly Haven — live API, CC0 assets, official file metadata.
- Kenney — verified CC0 catalog covering 2D, 3D, UI, vehicles and audio.
- Quaternius — verified CC0 3D catalog.
- Game Icons — attribution-aware verified icon catalog.
- Google Fonts — verified OFL game-suitable fonts.
- Godot official demos — MIT code/starter examples.
- Phaser official starters — MIT web-game templates.

### Project attribution manifests

`generate_project_attribution` creates content for:

- `THIRD_PARTY_ASSETS.md`
- `CREDITS.md`

and surfaces warnings for unknown or conditional licenses.

### Safe asset installation

V1 introduces:

- `plan_asset_install`
- `install_asset_file`

Automatic installation is intentionally limited to providers with sufficiently verifiable official file acquisition metadata. In v1.0.0, that means Poly Haven.

The installer:

- requires explicit file selection;
- restricts downloads to allowlisted HTTPS hosts;
- prevents project-root path traversal;
- enforces file-size limits;
- checks provider-reported sizes;
- verifies MD5 when available;
- never executes or extracts downloaded content.

## MCP tools in v1.0.0

- `find_game_assets`
- `search_game_assets`
- `search_live_assets`
- `get_asset_files`
- `plan_asset_install`
- `install_asset_file`
- `list_asset_providers`
- `search_open_source_projects`
- `inspect_repository`
- `check_license`
- `generate_attribution`
- `generate_project_attribution`

## Compatibility

- Node.js 20+
- Local STDIO MCP transport
- Designed for Codex, Claude Code, Trae and generic MCP clients that support local STDIO servers.

## Breaking-change policy

v1.0.0 establishes the initial stable tool names and core result shapes. Future breaking changes should use a new major version or a clearly documented migration path.

## Known limitations

- Verified catalog coverage is intentionally incomplete.
- Automatic installation is currently Poly Haven only.
- OpenGameArt and arbitrary GitHub repositories still require per-item/per-repository inspection.
- No automatic archive extraction, package installation, code execution or repository cloning.
- License classification is technical assistance, not legal advice.
