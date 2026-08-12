# GameDev Resource MCP

License-aware game development resource discovery for AI coding agents via MCP.

## Goal

Help Codex, Claude Code, Cursor, Trae and other MCP-capable agents discover reusable game-development assets and code **without treating “free” or “open source” as equivalent to commercially safe reuse**.

The project is registry-first: it stores source metadata, licensing posture, API/auth requirements and retrieval rules rather than mirroring large third-party asset collections.

## V0.3 tools

- `search_game_assets` — search the curated source registry.
- `search_live_assets` — search supported asset providers; providers may be live APIs or maintained verified catalogs.
- `get_asset_files` — return official provider-hosted file URLs/metadata when a provider supports file lookup.
- `list_asset_providers` — list providers and their operating mode.
- `search_open_source_projects` — search GitHub for reusable game-development repositories.
- `check_license` — classify common licenses conservatively.
- `inspect_repository` — inspect GitHub repository metadata and detected license.
- `generate_attribution` — generate a CREDITS/attribution entry.

## Asset providers

| Provider | Mode | License posture | Notes |
|---|---|---|---|
| Poly Haven | live API | CC0 | Live search plus official file metadata. API service attribution is tracked separately from asset attribution. |
| Kenney | verified catalog | CC0 | Maintained entries point to official asset pages; no brittle HTML scraping. |
| Quaternius | verified catalog | CC0 | Maintained entries point to official pack pages; no brittle HTML scraping. |

### Why two provider modes?

A stable public API is preferable when one exists. When a source does not expose a dependable public API, this project uses a maintained verified catalog rather than scraping website HTML. That trades coverage for stability and auditable provenance.

### Poly Haven service terms

Poly Haven assets are CC0, so the assets themselves do not require attribution. Use of Poly Haven's hosted live API has separate service-level requirements, including clear Poly Haven credit and a unique `User-Agent`. MCP results therefore expose `apiAttributionRequired` separately from the asset's `attribution` field.

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

Commercial-use permission does not automatically imply redistribution permission, and an open-source repository license does not automatically cover third-party art/audio bundled inside that repository.

## Current curated sources

Source-level entries include Kenney, Poly Haven, Quaternius, OpenGameArt and GitHub. Multi-license sources such as OpenGameArt and GitHub are deliberately marked as requiring per-item inspection.

The verified catalogs currently seed selected official Kenney and Quaternius packs. Coverage is intentionally incomplete: entries are added only when provenance and licensing can be verified from the original source.

## Safety / legal disclaimer

This project provides technical metadata and conservative automated classification, not legal advice. License detection can be incomplete or wrong, custom terms can override assumptions, and repositories may contain third-party assets under different terms. Before shipping a commercial game, verify the original license text and provenance of every incorporated resource.

## Roadmap

- expand verified Kenney and Quaternius catalogs
- add safe per-item OpenGameArt ingestion without aggressive scraping
- provenance snapshots and freshness checks
- automated attribution manifests
- engine-aware filters (Godot / Unity / Unreal / web)
- asset-format and style metadata
- contribution validation and CI

## Contributing

See `CONTRIBUTING.md`.

## License

Project source code is MIT licensed. Third-party resources discovered through this project retain their original licenses.
