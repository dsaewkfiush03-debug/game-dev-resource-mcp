# Verified community starters

V1.12 adds a small, deliberately conservative verified catalog for Unity and Unreal project starters.

The purpose is to eliminate the previous hard `starter` gap for these engines without pretending that a permissive root repository license automatically clears every imported package, sample image, audio file, plugin or engine-provided asset.

All maintained entries in this provider are currently modeled as:

```text
reuseScope = code-only
bundledAssetStatus = needs-review
```

That means an agent may reuse the explicitly licensed project code and structure, but must independently review or replace bundled media and third-party integrations before shipping.

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

## Why these are not `whole-project`

A root MIT license is strong evidence for reuse of the repository's own software, but it is not sufficient evidence that every file inside a game project has the same origin or license.

Unity and Unreal projects commonly contain package dependencies, engine-provided content, marketplace/Fab content, sample media, generated files or imported assets. V1.12 therefore keeps these starters at `code-only / needs-review` unless project-wide evidence is independently established.

## Agent workflow

```text
find_reusable_projects
        ↓
select Unity/Unreal candidate
        ↓
plan_project_adoption
        ↓
reuse root code/project structure
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

The maintained entries introduced in V1.12 were reviewed on 2026-08-20. Future verification audits may mark them stale if their source/license evidence is not rechecked within the configured freshness window.
