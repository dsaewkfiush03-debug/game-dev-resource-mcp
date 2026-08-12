# Install Layer (V0.9)

V0.9 adds a conservative installation layer for AI coding agents.

## Tools

### `plan_asset_install`

Resolves provider-hosted files and marks which exact files can be installed automatically. Planning never writes to disk.

### `install_asset_file`

Downloads one explicitly selected provider file into a local project directory.

## Current automatic-install support

| Provider | Automatic install | Reason |
|---|---:|---|
| Poly Haven | Yes | Official API exposes HTTPS file URLs, sizes and MD5 hashes. |
| Kenney | No | Verified catalog currently stores canonical asset pages, not a stable verified file API. |
| Quaternius | No | Verified catalog currently stores canonical pack pages only. |
| Game Icons | No | Attribution-aware catalog only; no automatic file acquisition yet. |
| Google Fonts | No | Catalog points to authoritative font sources; file acquisition is not automated yet. |
| Godot demos | No | Code repositories must not be automatically cloned/executed by the asset installer. |
| Phaser starters | No | Starter repositories must not be automatically cloned/executed by the asset installer. |

## Safety rules

Automatic installation requires all of the following:

1. the provider exposes explicit file metadata;
2. the selected file uses HTTPS;
3. the download hostname is in the provider allowlist;
4. the user/agent explicitly selects the provider file path returned by the planning step;
5. the destination remains under an absolute project root;
6. the download stays under the configured size limit (128 MiB default, 1 GiB hard maximum);
7. provider size metadata is checked when available;
8. provider MD5 metadata is checked when available;
9. downloaded content is never executed.

The default destination is:

```text
assets/vendor/<provider>/<asset-id>/
```

`destinationDir` can override this location, but it must remain relative to `projectRoot`.

## Recommended agent flow

```text
find_game_assets
  -> choose asset
  -> plan_asset_install
  -> choose one exact candidate.filePath
  -> install_asset_file
  -> generate_project_attribution
  -> integrate the installed file in the target engine/project
```

Installation is a file-acquisition operation, not legal clearance. Keep the original source and license metadata and review any project-specific obligations before release.
