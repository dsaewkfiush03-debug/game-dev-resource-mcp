# End-to-end example

This example shows the intended agent workflow from a vague game-development request to a safely installed resource with attribution metadata preserved.

## User request

> Find a commercially usable 3D stone-wall texture for my game, prefer CC0, and install a 2K file into the current project.

## 1. Search across providers

Call `find_game_assets` with constraints such as:

```json
{
  "query": "stone wall texture",
  "dimensions": ["3D"],
  "assetTypes": ["texture"],
  "commercialOnly": true,
  "allowAttribution": true,
  "allowShareAlike": false
}
```

The agent should inspect `sourceUrl`, `license`, `licenseSource`, `licenseRisk`, `providerMode`, `score` and `matchReasons` before selecting a resource.

## 2. Resolve exact downloadable files

If the chosen provider exposes verified file metadata, call `plan_asset_install`:

```json
{
  "provider": "polyhaven",
  "assetId": "<selected-id>",
  "resolution": "2k"
}
```

The plan returns exact provider file paths, official URLs, size/hash metadata and `autoInstallAllowed`.

Do not guess a provider file path. Pick one of the returned candidates.

## 3. Install one explicit file

Call `install_asset_file` only after choosing a candidate:

```json
{
  "provider": "polyhaven",
  "assetId": "<selected-id>",
  "filePath": "<exact-path-from-plan>",
  "projectRoot": "/absolute/path/to/game-project",
  "destinationDir": "assets/vendor/polyhaven/stone-wall",
  "overwrite": false
}
```

The installer:

- requires an absolute project root;
- prevents destination traversal outside the project;
- downloads only from allowlisted HTTPS hosts;
- enforces size limits;
- validates provider size metadata;
- validates MD5 when available;
- never executes or extracts downloaded content.

## 4. Preserve provenance and attribution

Record the selected resource with `generate_project_attribution`:

```json
{
  "resources": [
    {
      "name": "<resource-name>",
      "sourceUrl": "<canonical-source-url>",
      "license": "CC0-1.0",
      "licenseUrl": "https://polyhaven.com/license",
      "modified": false
    }
  ]
}
```

Write the returned `thirdPartyAssets` content to `THIRD_PARTY_ASSETS.md` and the returned `credits` content to `CREDITS.md` in the game project when appropriate.

Poly Haven assets themselves are CC0, but use of its live API has separate service-level source-credit requirements. Preserve that distinction.

## 5. Engine integration

After installation, the coding agent can import the file using the target engine's normal workflow. This MCP deliberately does not execute engine importers, shell scripts, package managers or archive installers.

For catalog-only resources such as Kenney, Quaternius, Game Icons, Google Fonts, Godot demos and Phaser starters, use the canonical source page and licensing metadata. Automatic file installation remains disabled until a provider exposes a sufficiently verifiable acquisition path.
