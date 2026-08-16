# Reusable project safety

GameDev Resource MCP treats **source-code licensing** and **whole-project reuse** as separate questions.

A repository can have a permissive code license while bundled art, audio, fonts, logos, sample media, dependencies or imported source files have different terms. V1.9 makes that boundary explicit instead of asking the coding agent to infer it.

## Reuse scopes

Each maintained project/starter candidate may expose a `reuseScope`:

| Scope | Meaning | Default agent behavior |
|---|---|---|
| `whole-project` | Maintained evidence supports using the project as a project-wide starting point under the stated obligations. | The project may be used as a base, while still preserving notices and checking dependencies/external services. |
| `code-only` | Source code/structure has an explicit reusable license, but bundled media is not blanket-cleared. | Reuse code; replace or independently verify art, audio, fonts and other media before shipping. |
| `reference-only` | Useful implementation reference, but component licensing is not sufficiently verified for direct copying. | Study the implementation; do not copy components until their licenses are reviewed. |
| `asset-only` | Reuse rights are scoped to assets/media rather than a complete code project. | Treat as an asset source, not a project skeleton. |

`reuseScope` is operational metadata, not a new license and not legal advice.

## Bundled asset status

Project records may also expose `bundledAssetStatus`:

| Status | Meaning |
|---|---|
| `none` | No material bundled asset set needs separate clearance for the intended starter use. |
| `same-license` | Maintained upstream evidence states the relevant project/demo content is covered by the same project-wide license. |
| `separately-licensed` | Bundled components have explicit separate licenses that must be preserved and followed. |
| `needs-review` | Bundled asset/media rights are not sufficiently established for blanket reuse. |

When `bundledAssetStatus = needs-review`, an agent must not silently upgrade the project to whole-project commercial clearance just because the repository reports MIT, Zlib, Apache, BSD or another permissive code license.

## Current verified project providers

### Godot official demos

The official `godotengine/godot-demo-projects` repository states that its demos are distributed under the repository MIT license. Maintained demo entries can therefore be modeled as `whole-project` / `same-license`, with the MIT notice obligation preserved.

This does not imply that unrelated Godot community projects or Asset Library submissions receive the same treatment.

### Phaser official starters

Official Phaser starter/template repositories are useful reusable code skeletons, but they include example media such as logos/background images. GameDev Resource MCP conservatively models them as `code-only` / `needs-review` rather than treating the repository MIT license as blanket asset clearance.

Replace or separately verify bundled media before release.

### Raylib official project references

The official `raysan5/raylib-game-template` explicitly presents itself as a reusable starter and is licensed under zlib/libpng terms, so the maintained template entry is `whole-project` with no substantive bundled asset set assumed for shipping.

The official `raysan5/raylib-games` README explicitly licenses **game sources** under zlib/libpng. Because that statement is source-specific, maintained complete-game references from that collection are `code-only` / `needs-review` for bundled media.

## MCP usage

Use `find_reusable_projects` when the goal is to find a project skeleton or complete-game implementation rather than an isolated asset:

```text
find_reusable_projects
  query: "2d platformer starter"
  engines: ["godot"]
  reuseScopes: ["whole-project", "code-only"]
```

To require the strongest maintained project-wide posture:

```text
find_reusable_projects
  query: "starter"
  reuseScopes: ["whole-project"]
  bundledAssetStatuses: ["none", "same-license"]
```

`find_game_assets` supports the same reuse filters for cross-provider searches.

## Safety boundary

V1.9 project discovery does **not** automatically:

- clone repositories;
- execute starter code;
- run package managers;
- install dependencies;
- extract archives;
- copy an entire repository into a user's project;
- convert `code-only` or `reference-only` into `whole-project` based on model judgment.

Discovery and adoption remain separate steps. Automatic file installation stays limited to separately allowlisted provider acquisition paths.

## Agent rule

When consuming a project result:

```text
repository/project candidate
    ↓
read reuseScope
    ↓
read bundledAssetStatus
    ↓
read source/project license
    ↓
read component licenses/notes when present
    ↓
choose what may actually be adopted
    ↓
preserve notices/attribution
```

Never infer broader rights from popularity, repository stars, framework ownership, a permissive code SPDX identifier or the fact that a project is publicly downloadable.
