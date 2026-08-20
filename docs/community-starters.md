# Verified community starters

The verified community-starter catalog provides a deliberately conservative set of Unity and Unreal project starters.

The purpose is to eliminate hard starter gaps without pretending that a permissive repository license automatically clears every imported package, sample image, audio file, plugin or engine-provided asset.

All maintained entries are currently modeled as:

```text
reuseScope = code-only
bundledAssetStatus = needs-review
```

That means an agent may reuse the explicitly licensed project code and structure, but must independently review or replace bundled media and third-party integrations before shipping.

V1.14 also makes this catalog **mixed-license aware**: the provider has a default MIT profile, while a verified entry can carry its own complete license profile when upstream uses a different license. The catalog must preserve the entry's real license rather than flattening it into the provider default.

## Unity starters

### Team-on Unity Game Template

- source: `Team-on/UnityGameTemplate`
- root license: MIT
- intended use: Unity starter/template, project scaffolding, menus/settings/UI patterns
- boundary: upstream describes included assets/plugins; those components remain separate review targets

### JCMG Unity Starter Template

- source: `jeffcampbellmakesgames/UnityStarterTemplate`
- verified branch: `develop`
- root license: MIT
- intended use: lightweight project architecture, UI/configuration and development scaffolding
- boundary: third-party Unity packages/plugins documented by upstream are not flattened into the root MIT license

### MaiKuraki UnityStarter

- source: `MaiKuraki/UnityStarter`
- root license: MIT
- intended use: modular gameplay/framework architecture and project tooling
- boundary: ThirdParty and optional integration areas require component-level review

## Unreal starters

### StpGabriel Unreal Engine 5 Template

- source: `StpGabriel/unreal-engine-5-template`
- verified branch: `master`
- root license: MIT
- intended use: Unreal project/repository layout and source scaffolding
- boundary: Unreal Engine itself and imported Content/Fab assets retain their own terms

### Motion Forge UE5 Game Starter Template

- source: `motionforge/Unreal-Engine-5-Game-Starter-Template`
- root license: MIT
- intended use: Blueprint/project scaffolding, HUD/communication/damage examples
- boundary: upstream references Creative Commons and Unreal built-in assets; bundled media remains in manual review scope

### Cobra Code UE5 2D Side Scroller Template

- source: `CobraCodeDev/TP_2DSideScrollerBP`
- root license: CC0-1.0
- intended use: Unreal Engine 5 Blueprint 2D side-scroller/project template
- repository shape: includes a real `.uproject`, `Config` and `Content` structure
- upstream media note: README describes the included art assets as public domain
- boundary: Unreal Engine/runtime licensing and any downstream imported packages/content remain separate concerns

This entry is intentionally stored with a **per-entry CC0 profile** rather than being mislabeled as MIT merely because the surrounding provider defaults to MIT.

## Why these are not `whole-project`

A permissive root license is strong evidence for reuse of the repository's own content covered by that grant, but it is not sufficient evidence that every future component of a game project has the same origin or license.

Unity and Unreal projects commonly contain package dependencies, engine-provided content, marketplace/Fab content, sample media, generated files or imported assets. These starters therefore remain `code-only / needs-review` unless project-wide evidence is independently established for the exact version being adopted.

## Agent workflow

```text
find_reusable_projects
        ↓
select Unity/Unreal candidate
        ↓
read the candidate's own license metadata
        ↓
plan_project_adoption
        ↓
reuse explicitly licensed project/code structure
        ↓
review dependencies + bundled media
        ↓
replace or separately verify unsafe/unknown components
        ↓
find_game_assets for remaining resource slots
        ↓
generate_project_attribution
```

The verified community starter provider never clones, executes or installs these repositories automatically.

## Verification date

The V1.12 MIT starters and the V1.14 CC0 Unreal starter were reviewed on 2026-08-20. Future verification audits may mark them stale if their source/license evidence is not rechecked within the configured freshness window.
