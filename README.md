# GameDev Resource MCP

License-aware game development resource discovery for AI coding agents via MCP.

## Goal

Help Codex, Claude Code, Cursor, Trae and other MCP-capable agents discover reusable game-development assets and code **without treating “free” or “open source” as equivalent to commercially safe reuse**.

The project is registry-first: it stores source metadata, licensing posture, API/auth requirements and retrieval rules rather than mirroring large third-party asset collections.

## V0.2 tools

- `search_game_assets` — search the curated resource-source registry.
- `search_live_assets` — search supported live asset-provider APIs while preserving source and license provenance.
- `list_asset_providers` — list live providers currently implemented.
- `search_open_source_projects` — search GitHub for reusable game-development repositories.
- `check_license` — classify common licenses conservatively.
- `inspect_repository` — inspect GitHub repository metadata and detected license.
- `generate_attribution` — generate a CREDITS/attribution entry.

## Live providers

### Poly Haven

Poly Haven is the first live asset provider. The adapter searches the public `/assets` API and returns normalized asset metadata for HDRIs, textures and 3D models.

Important distinction:

- Poly Haven assets are CC0, so the assets themselves do not require attribution.
- Use of Poly Haven's hosted live API requires clear credit to Poly Haven in the integrating product/service.
- Requests use a unique `User-Agent` as required by the API service terms.

The MCP response exposes `apiAttributionRequired: true` separately from the asset's `attribution: false` so agents do not confuse service terms with asset-license obligations.

## Install

Requires Node.js 20+.

```bash
npm install
npm run build
```

Run over stdio:

```bash
npm start
```

For development:

```bash
npm run dev
```

## MCP configuration example

After building the project, configure an MCP client to launch:

```json
{
  "mcpServers": {
    "game-dev-resource-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/game-dev-resource-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "optional-user-token"
      }
    }
  }
}
```

`GITHUB_TOKEN` is optional. It only improves GitHub API rate limits. Never commit tokens or API keys to this repository.

## License model

The registry tracks these fields independently:

- commercial use
- modification
- redistribution
- attribution
- share-alike
- API requirement / authentication type
- source URL
- license source

Provider results can additionally track service-level obligations such as `apiAttributionRequired` separately from the underlying asset license.

This matters because commercial-use permission does not automatically imply redistribution permission, and an open-source code license does not automatically cover third-party art/audio contained in the same repository.

## Current curated sources

Source-level entries currently include Kenney, Poly Haven, Quaternius, OpenGameArt and GitHub. Multi-license sources are deliberately marked as requiring per-item inspection.

## Safety / legal disclaimer

This project provides technical metadata and conservative automated classification, not legal advice. License detection can be incomplete or wrong, custom terms can override assumptions, and repositories may contain third-party assets under different terms. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Roadmap

- additional provider adapters for major asset sources
- per-item verified registry entries
- provenance snapshots and freshness checks
- automated attribution manifests
- engine-aware filters (Godot / Unity / Unreal / web)
- asset-format and style metadata
- contribution validation and CI

## Contributing

See `CONTRIBUTING.md`.

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
