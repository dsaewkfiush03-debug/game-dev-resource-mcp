# MCP client setup

GameDev Resource MCP is a local STDIO MCP server. The recommended setup runs it directly from the GitHub repository through `npx`, so users do not need to clone/build the repository or maintain an absolute `dist/index.js` path.

## Requirements

- Node.js 20+
- npm / npx
- Git

`GITHUB_TOKEN` is optional. It improves GitHub API rate limits for repository search/inspection. Never commit tokens.

## Codex CLI / ChatGPT desktop / Codex IDE

Codex hosts that share MCP configuration can register the server with one command:

```bash
codex mcp add game-dev-resource-mcp -- npx -y github:dsaewkfiush03-debug/game-dev-resource-mcp
```

Verify:

```bash
codex mcp list
```

Forward an existing environment variable when you want authenticated GitHub API limits:

```bash
codex mcp add game-dev-resource-mcp --env GITHUB_TOKEN="$GITHUB_TOKEN" -- npx -y github:dsaewkfiush03-debug/game-dev-resource-mcp
```

### `config.toml`

Add this to `~/.codex/config.toml` or a trusted project's `.codex/config.toml`:

```toml
[mcp_servers.game-dev-resource-mcp]
command = "npx"
args = ["-y", "github:dsaewkfiush03-debug/game-dev-resource-mcp"]
env_vars = ["GITHUB_TOKEN"]
default_tools_approval_mode = "writes"
```

`default_tools_approval_mode = "writes"` is recommended because `install_asset_file` can write one selected resource file into the local project while discovery/planning tools are read-only in effect.

## Claude Code

Use a local STDIO MCP configuration with `npx` as the command:

```json
{
  "mcpServers": {
    "game-dev-resource-mcp": {
      "command": "npx",
      "args": ["-y", "github:dsaewkfiush03-debug/game-dev-resource-mcp"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

If you do not use authenticated GitHub requests, omit the `env` block.

Client configuration syntax can change; verify against the current client documentation for managed environments.

## Trae

Configure a custom STDIO MCP server:

- Name: `game-dev-resource-mcp`
- Command: `npx`
- Arguments: `-y`, `github:dsaewkfiush03-debug/game-dev-resource-mcp`
- Optional environment: `GITHUB_TOKEN`

## Generic MCP clients

Use this shape when the client accepts JSON-style local server configuration:

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

## Why GitHub-source execution works

The package declares `game-dev-resource-mcp` as its executable and uses npm's `prepare` lifecycle to compile TypeScript before a Git dependency is packed and installed. That makes the repository directly executable through `npx` without committing generated `dist/` files.

The first run may need to fetch/build the package. npm can reuse its cache on later runs.

For a production environment that requires strict reproducibility, pin the GitHub package spec to a reviewed tag or commit instead of following the repository default branch.

Example shape:

```text
github:dsaewkfiush03-debug/game-dev-resource-mcp#<tag-or-commit>
```

## Manual pinned checkout

If you prefer a local checkout:

```bash
git clone https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp.git
cd game-dev-resource-mcp
npm ci
npm run build
```

Run the MCP server over STDIO:

```bash
node /absolute/path/to/game-dev-resource-mcp/dist/index.js
```

Codex example:

```bash
codex mcp add game-dev-resource-mcp -- node /absolute/path/to/game-dev-resource-mcp/dist/index.js
```

## Recommended approval policy

Treat these as discovery/read/planning operations:

- `recommend_stack`
- `find_game_assets`
- `find_reusable_projects`
- `plan_project_adoption`
- `benchmark_resource_coverage`
- `search_game_assets`
- `search_live_assets`
- `get_asset_files`
- `plan_asset_install`
- `list_asset_providers`
- `audit_resource_verification`
- `search_open_source_projects`
- `check_license`
- `inspect_repository`
- `generate_attribution`
- `generate_project_attribution`

Treat this as a local write operation:

- `install_asset_file`

The installer never executes downloaded content, never extracts archives, never clones repositories and only allows explicitly trusted provider acquisition paths.
