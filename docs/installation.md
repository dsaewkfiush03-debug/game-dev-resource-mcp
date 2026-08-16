# Safe asset installation

GameDev Resource MCP separates **discovery** from **automatic installation**.

A provider can be searchable without being trusted for automatic downloads. Live API access alone is not sufficient to enter the installer allowlist.

## Current automatic-install support

| Provider | Search | Automatic install |
|---|---|---|
| Poly Haven | Yes | Yes, explicit allowlisted provider files only |
| ambientCG | Yes | No |
| Openverse | Yes | No |
| Godot Asset Library | Yes | No |
| GitHub Open-Source Code | Yes | No |
| Verified catalog providers | Yes | No |

## Workflow

1. Search with `find_game_assets` or `recommend_stack`.
2. Select an exact resource.
3. Use `plan_asset_install`.
4. Select an exact provider file returned by that plan.
5. Call `install_asset_file` with an absolute project root.
6. Generate/update third-party attribution records separately.

`plan_asset_install` performs no writes.

## Installer security boundaries

`install_asset_file` currently enforces:

- absolute `projectRoot`;
- lexical project-root containment;
- relative destination paths only;
- pre-existing symbolic-link/junction component checks inside the destination path;
- allowlisted HTTPS provider download hosts;
- manual redirect handling with every redirect target revalidated against the same provider host allowlist;
- at most three redirects;
- default 128 MiB per-file size limit;
- hard 1 GiB maximum;
- provider size checks when metadata exists;
- provider MD5 verification when supplied;
- explicit overwrite permission;
- temporary-file write followed by rename only after validation;
- no execution of downloaded data;
- no archive extraction;
- no package-manager or shell invocation;
- no automatic repository cloning.

The installer checks destination link components before and after directory creation and again before final placement. This reduces the risk that a pre-existing symlink/junction under the project redirects writes outside the intended project tree.

## Redirect policy

Downloads use manual redirect handling. An initial allowlisted URL cannot redirect the installer to an arbitrary HTTPS host: every redirect target must independently pass `validateDownloadUrl` for the same provider.

## Why ambientCG and other live providers are not auto-installed yet

Search metadata and license confidence are different from acquisition confidence. Before enabling automatic installation for another provider, the project must verify stable official file endpoints, redirect/CDN behavior, size/integrity metadata where available, and a narrow host allowlist.

## Trust model

These checks reduce accidental and agent-driven unsafe writes. They are not a sandbox against a hostile local process that can concurrently mutate the filesystem during installation.

Downloaded third-party content retains its original license and provenance. Installation is not legal clearance.
