# Release notes

## v1.1.0

V1.1 adds a deterministic game-resource stack recommendation layer on top of the existing license-aware search system.

### `recommend_stack`

A coding agent can now provide a whole-game or feature description instead of searching one resource category at a time.

`recommend_stack`:

- infers practical signals such as engine, 2D/3D, style, genre and game themes;
- understands common English and Chinese game-development terms;
- expands the request into required and optional resource slots;
- searches each slot through the existing verified providers and conservative license filters;
- returns a primary recommendation plus alternatives for each resolved slot;
- preserves provider errors without discarding successful slots;
- reports unresolved required gaps explicitly;
- summarizes licenses, license risks, attribution requirements and provider service credits for primary selections.

Typical slots include starter/framework references, environment art, vehicles, characters, weapons/combat art, UI, icons, sound effects, music, fonts and relevant shader examples.

If a requested engine has no verified starter provider, V1.1 leaves that required slot unresolved rather than silently recommending a different engine.

### Safety model

The recommendation layer does not invent commercial-use or redistribution rights. It reuses `find_game_assets` / `searchAllAssets` provider metadata and the same conservative defaults:

- `commercialOnly: true`
- `allowAttribution: true`
- `allowShareAlike: false`

Recommendations remain retrieval assistance, not legal clearance.

### Release engineering

- package/runtime version: `1.1.0`;
- npm lockfile refreshed by npm itself;
- package-smoke version validation now reads the package version dynamically rather than hard-coding `1.0.0`;
- existing Node 20/22, `npm ci`, tarball clean-install and MCP binary smoke tests remain in place.

### Compatibility

V1.1 is additive. Existing V1 tool names and existing search/install workflows remain available.

---

## v1.0.0

First stable release of the license-aware game-development resource layer for MCP-capable coding agents.

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

### MCP tools in v1.0.0

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

### Compatibility

- Node.js 20+
- Local STDIO MCP transport
- Designed for Codex, Claude Code, Trae and generic MCP clients that support local STDIO servers.

### Breaking-change policy

v1.0.0 establishes the initial stable tool names and core result shapes. Future breaking changes should use a new major version or a clearly documented migration path.

### Known limitations

- Verified catalog coverage is intentionally incomplete.
- Automatic installation is currently Poly Haven only.
- OpenGameArt and arbitrary GitHub repositories still require per-item/per-repository inspection.
- No automatic archive extraction, package installation, code execution or repository cloning.
- License classification is technical assistance, not legal advice.
