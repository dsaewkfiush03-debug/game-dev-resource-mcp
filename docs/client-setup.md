# MCP client setup

Build the server first:

```bash
npm install
npm run build
```

The server uses local STDIO transport:

```bash
node /absolute/path/to/game-dev-resource-mcp/dist/index.js
```

`GITHUB_TOKEN` is optional. It improves GitHub API rate limits for repository search/inspection. Do not commit tokens.

## Codex CLI / ChatGPT desktop / Codex IDE

OpenAI's Codex MCP configuration supports local STDIO servers. The CLI, ChatGPT desktop app and Codex IDE extension share MCP configuration for the same Codex host.

### CLI

```bash
codex mcp add game-dev-resource-mcp -- node /absolute/path/to/game-dev-resource-mcp/dist/index.js
```

Forward an existing environment variable when you want authenticated GitHub API limits:

```bash
codex mcp add game-dev-resource-mcp --env GITHUB_TOKEN="$GITHUB_TOKEN" -- node /absolute/path/to/game-dev-resource-mcp/dist/index.js
```

Verify:

```bash
codex mcp list
```

### `config.toml`

Add this to `~/.codex/config.toml` or a trusted project's `.codex/config.toml`:

```toml
[mcp_servers.game-dev-resource-mcp]
command = "node"
args = ["/absolute/path/to/game-dev-resource-mcp/dist/index.js"]
env_vars = ["GITHUB_TOKEN"]
default_tools_approval_mode = "writes"
```

`default_tools_approval_mode = "writes"` is recommended because `install_asset_file` writes to the local project while the discovery/planning tools are read-only in effect.

Official Codex MCP documentation (verified 2026-08-12):
`https://learn.chatgpt.com/docs/extend/mcp?surface=cli`

## Claude Code

Add the local STDIO server using Claude Code's MCP configuration mechanism. A typical local-server configuration is:

```json
{
  "mcpServers": {
    "game-dev-resource-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/game-dev-resource-mcp/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

Client configuration syntax can change; verify against the current Claude Code MCP documentation before publishing installation instructions for a managed environment.

## Trae

Configure a custom MCP server using STDIO transport:

- Name: `game-dev-resource-mcp`
- Command: `node`
- Arguments: `/absolute/path/to/game-dev-resource-mcp/dist/index.js`
- Optional environment: `GITHUB_TOKEN`

Trae also supports other MCP transports, but this project currently ships a local STDIO server.

## Generic MCP clients

Use this shape when the client accepts JSON-style local server configuration:

```json
{
  "mcpServers": {
    "game-dev-resource-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/game-dev-resource-mcp/dist/index.js"]
    }
  }
}
```

## Recommended approval policy

Treat these as discovery/read operations:

- `find_game_assets`
- `search_game_assets`
- `search_live_assets`
- `get_asset_files`
- `plan_asset_install`
- `list_asset_providers`
- `search_open_source_projects`
- `check_license`
- `inspect_repository`
- `generate_attribution`
- `generate_project_attribution`

Treat this as a local write operation:

- `install_asset_file`

The installer never executes downloaded content, never extracts archives, never clones repositories and only allows explicitly trusted HTTPS download hosts.
