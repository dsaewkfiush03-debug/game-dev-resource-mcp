# Release notes

## v1.12.0

V1.12 is the first benchmark-driven expansion release: it separates retrieval failures from real resource gaps, removes avoidable GitHub API pressure, improves gameplay-code search depth and adds conservatively verified Unity/Unreal starter coverage.

### Provider reliability

- Adds provider/category error diagnostics to `benchmark_resource_coverage`.
- GitHub Code canonicalizes noisy fallback queries, coalesces/caches equivalent repository searches and serializes search requests to reduce GitHub Search API pressure.
- GitHub error messages preserve useful rate-limit response metadata.
- KayKit no longer uses the GitHub Search bucket; its official owner repositories are listed through the normal user-repository endpoint and cached in-process.
- The clean post-fix smoke run reached zero provider errors.

### Gameplay-code retrieval

- AI queries lead with ecosystem terminology such as `behavior tree` / `ai` instead of the over-constrained `enemy npc ai` phrase.
- Inventory, combat, vehicle, multiplayer, save, procedural-generation and dialogue slots similarly begin with broader ecosystem terms before narrower fallbacks.
- This raises candidate depth without relaxing repository-license filtering.

### Verified Unity / Unreal community starters

Adds `communitystarters`, a small verified catalog whose maintained entries have explicit root MIT licenses.

Unity entries:
- Team-on Unity Game Template;
- JCMG Unity Starter Template;
- MaiKuraki UnityStarter.

Unreal entries:
- StpGabriel Unreal Engine 5 Template;
- Motion Forge UE5 Game Starter Template.

These records are intentionally `code-only` / `needs-review`: root code/project structure may be reused under MIT, while imported packages, plugins, engine content and bundled media remain separate review/replacement targets. Unity/Unreal are now supported by the starter slot instead of producing an empty-provider gap.

### Live smoke benchmark

After reliability cleanup, the clean pre-expansion 12-scenario baseline was 93.3% required-slot coverage, 69.7% depth-3 coverage, 58.3% complete scenarios, 4 unsupported required slots and 0 provider errors.

The final V1.12 live smoke snapshot on 2026-08-20 reached:
- 100% required-slot coverage;
- 85.7% depth-3 coverage;
- 100% complete scenarios (12/12);
- 0 unsupported required slots;
- 0 provider errors.

This is a live smoke-suite snapshot, not a claim that the 39-scenario full suite is perfect.

### Release engineering

- package/runtime/lockfile version: `1.12.0`;
- deterministic tests cover GitHub query canonicalization, KayKit non-search indexing, provider-error diagnostics, broader code queries and verified Unity/Unreal starter boundaries;
- temporary live benchmark artifacts/workflows are removed before merge;
- Node 20/22 validation, npm tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.12 is additive. Existing license defaults, install allowlists and project-adoption safety boundaries are unchanged.

---


## v1.11.0

V1.11 adds a live resource-coverage benchmark so future provider/catalog expansion can be prioritized by measured game-development gaps instead of raw source counts.

### `benchmark_resource_coverage`

- Adds a dedicated MCP tool backed by the real `recommend_stack` pipeline.
- Adds 39 maintained scenarios across Godot, Phaser, Raylib, Unity, Unreal and engine-agnostic concepts.
- Adds a balanced 12-scenario smoke suite plus full-suite, group and explicit-scenario selection.
- Measures required-slot coverage separately from depth-3 candidate coverage.
- Keeps unsupported required slots in the denominator so missing providers remain visible.
- Reports live-provider/API errors separately from catalog/retrieval gaps.
- Aggregates group metrics, per-slot metrics, average candidate depth and a weakest-slot ranking.

### Measurement integrity

Benchmark scores reuse normal conservative commercial/license filters. Coverage must not be improved by accepting unknown/non-commercial rights, enabling share-alike by default, removing difficult scenarios, excluding no-provider required slots or lowering the depth target.

### Release engineering

- package/runtime version: `1.11.0`;
- npm lockfile refreshed by npm itself;
- deterministic offline tests cover suite selection, aggregation, one-result vs depth-3 health, unsupported providers, provider errors and injected benchmark execution;
- live third-party APIs are intentionally not required by CI;
- Node 20/22 validation, tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.11 is additive. Existing provider IDs, recommendation/adoption tools, installation allowlists and attribution workflows remain unchanged.

---


## v1.10.0

V1.10 adds a deterministic project-adoption planner between reusable-project discovery and actual game implementation.

### `plan_project_adoption`

- Adds a dedicated MCP tool that takes a verified project provider/project ID plus a target game description.
- Produces an explicit adoption decision: project-base, project-base with component obligations, code-only reuse, reference-only, asset-only/not-a-base, or manual review.
- Returns allowed reuse boundaries, forbidden assumptions, keep/replace/review/remove actions, license obligations, resource gaps and suggested next MCP calls.
- Planning is non-mutating: it never clones, executes, extracts, installs dependencies, deletes files or copies a repository into the user's project.

### Adoption hints

- Verified project records can carry `adoptionHints` with target types `path`, `system`, `asset-category`, `dependency` and `notice`.
- Exact path guidance is emitted only when maintained metadata explicitly records that path.
- The Raylib game template now has maintained guidance for `src/`, `CMakeLists.txt`, `projects/`, `screenshots/` and the license notice.
- Godot/Phaser defaults stay system/category-level where project-specific paths have not been independently recorded.

### Resource-gap planning

- Reuses the existing deterministic stack planner after a starter has been selected.
- Removes the starter slot and reports remaining requirements as `declared-in-candidate` or `verify-or-source`.
- `verify-or-source` intentionally means catalog metadata does not prove coverage; it does not claim the project definitely lacks the feature.
- Required unresolved slots include suggested `find_game_assets` calls using the existing conservative commercial/license defaults.
- The plan also suggests `generate_project_attribution` so source/license provenance survives adoption.

### License boundaries

- Project/source license obligations are derived from the existing license rules.
- Explicit component licenses remain separate obligations.
- `code-only` continues to force bundled-media replacement or independent verification.
- `whole-project + separately-licensed` becomes a distinct adoption decision rather than being flattened into a generic safe flag.

### Release engineering

- package/runtime version: `1.10.0`;
- npm lockfile refreshed by npm itself;
- deterministic adoption tests cover whole-project, code-only, component-license and fail-closed behavior;
- Node 20/22 validation, tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.10 is additive. Existing MCP tools, provider IDs, project-reuse metadata, safe-install allowlists and attribution workflows remain available.

---


## v1.9.0

V1.9 adds a project-reuse safety layer so agents can start from verified open-source starters and complete-game references without treating a repository code license as blanket permission for every bundled asset.

### Reuse-scope model

Project records can now expose `reuseScope` as `whole-project`, `code-only`, `reference-only` or `asset-only`.

`bundledAssetStatus` separately records whether project media is absent, covered by the same license, separately licensed or still needs review. Search and ranking can filter on both fields, and whole-project candidates with a verified bundled-asset posture receive only a small bounded ranking bonus.

### `find_reusable_projects`

Adds a dedicated MCP tool for verified starter/project discovery. It defaults to the maintained Godot, Phaser and Raylib project providers and returns explicit guidance about what may be reused.

Project discovery does not clone repositories, execute code, install packages, extract archives or weaken the existing safe-install boundary.

### Raylib verified project provider

Adds the official Raylib game template as a `whole-project` zlib starter and selected references from the official `raysan5/raylib-games` collection.

The collection's upstream README explicitly licenses **game sources** under zlib/libpng terms, so complete-game references are conservatively modeled as `code-only` with bundled media marked `needs-review`.

### Godot and Phaser project boundaries

- Official Godot demos are modeled as `whole-project` / `same-license` because the upstream demo repository states that its demos are distributed under MIT.
- Official Phaser starters remain `code-only` / `needs-review` because template repositories include example media and this project does not infer asset rights from the code repository license.

### Stack planning

`recommend_stack` now recognizes Raylib and gives the starter slot explicit reusable-project semantics. Godot gameplay-code slots can use concrete official demos in addition to the Asset Library and GitHub code discovery.

### Agent safety rules

`AGENTS.md` now forbids upgrading `code-only` or `reference-only` results to `whole-project` using model judgment, popularity or a permissive SPDX identifier. A new `docs/project-reuse.md` documents the full adoption workflow.

### Release engineering

- package/runtime version: `1.9.0`;
- npm lockfile refreshed by npm itself;
- deterministic V1.9 tests cover Raylib scope separation, Godot whole-project metadata, Phaser code-only metadata, whole-project filtering and Raylib starter planning;
- existing Node 20/22 validation, tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.9 is additive. Existing MCP tool names, provider IDs, installation allowlists and attribution workflows remain available.

---


## v1.8.0

V1.8 strengthens the two places where whole-game agents need better building blocks: broad coherent 3D art packs and concrete reusable starter/game references.

### Quaternius reverified expansion

- Expands the structured Quaternius catalog from a small selected set to 35+ high-value CC0 packs.
- Adds modern-city/road coverage through Downtown City MegaKit, Modular Streets and public-transport resources.
- Adds universal humanoid base characters, modular fantasy outfits and both Universal Animation Library generations.
- Adds fantasy props/medieval village, sci-fi essentials/modular sci-fi, zombie apocalypse, ultimate space, toon shooter, cyberpunk, fantasy RTS, platformer, pirate, survival, vehicle, interior and nature coverage.
- Records the actual V1.8 source/license review date as 2026-08-16.

### Concrete Godot starter/game references

The verified Godot demo provider no longer exposes only five broad collection links. It now also indexes concrete official projects such as:

- Dodge the Creeps;
- 2D Platformer / Physics Platformer / Role Playing Game / Pong / Isometric;
- finite-state-machine and 2D navigation/AStar examples;
- 3D Platformer / Squash the Creeps / Truck Town;
- 3D character, navigation, voxel, waypoints, procedural-material and particle examples.

These remain repository-level MIT code/demo references. They are discovery/starter candidates, not a new permission to automatically clone or execute third-party repositories.

### Phaser starter boundary

- Adds the official `phaserjs/create-game` project generator as a verified MIT starter/tool candidate.
- Keeps `phaserjs/examples` outside the commercial-safe catalog because MIT source-code licensing does not automatically clear the bundled example media.

### Expansion-safe tests

Legacy tests that assumed a provider would permanently return exactly one result were replaced with semantic assertions: the expected canonical resource must remain present and all returned records must satisfy the requested metadata/license constraints. This allows safe catalog growth without weakening license tests.

### Release engineering

- package/runtime version: `1.8.0`;
- npm lockfile refreshed by npm itself;
- offline v1.8 tests cover Quaternius scale/license/freshness, concrete Godot starters/systems and the Phaser starter boundary;
- Node 20/22 validation, tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.8 is additive. Existing provider IDs, MCP tool names, installation boundaries and attribution workflows are unchanged.

---

## v1.7.0

V1.7 expands the highest-value static catalog and introduces explicit verification-freshness tracking so the registry can grow without silently becoming stale.

### Major Kenney verified-catalog expansion

- Expands Kenney from roughly two dozen selected packs to 60+ structured packs.
- Adds broad 3D coverage for factory/industrial, platformer, modular dungeon/cave/space, city commercial/industrial/suburban/roads, modular buildings, racing, nature, fantasy and more.
- Adds broad 2D coverage for pixel/1-bit platformers, roguelike modern city/caves, top-down shooters/tanks, isometric vehicles, town/farm, RPG and production-support assets.
- Adds input prompts, mobile controls, light/VFX masks, skyboxes and development textures in addition to the existing UI/audio catalog.
- Keeps Kenney's source-level CC0 posture and records the actual V1.7 review date as 2026-08-16.

### Verification freshness metadata

Static verified-catalog entries may now carry:

```text
verificationStatus: verified | needs-review
verifiedAt: YYYY-MM-DD
```

The V1.7 review date is also applied to the curated Google Fonts catalog, Godot official demo collections and Phaser official starters because those sources were explicitly rechecked during this project cycle. Legacy catalogs that have not received a real review remain untracked rather than receiving fabricated timestamps.

### `audit_resource_verification`

Adds an MCP audit tool for maintained verified catalogs. It reports:

- `current`;
- `stale`;
- `needs-review`;
- `untracked`.

The stale threshold defaults to 365 days and can be changed by the caller. Provider-level summaries and an `attention` list make future maintenance work visible to agents.

Freshness is evidence quality, not a replacement license. A stale CC0/MIT/OFL record does not automatically become forbidden; it means the canonical source/license should be rechecked before relying on cached metadata for release decisions.

### Release engineering

- package/runtime version: `1.7.0`;
- npm lockfile refreshed by npm itself;
- expanded Kenney coverage and verification assessments are covered by deterministic tests;
- existing Node 20/22 validation, tarball clean-install and MCP binary smoke start remain required.

### Compatibility

V1.7 is additive. Existing provider IDs, search tools, stack planning, installation and attribution workflows remain available.

---

## v1.5.0

V1.5 turns icon discovery from a small category-level catalog into a per-icon resource layer and extends the safe installer to exact official SVG files.

### Game Icons live per-icon provider

- Replaces five broad Game Icons category entries with the official `game-icons/icons` Git tree.
- Indexes individual SVG paths and derives searchable icon names/tags from filenames.
- Preserves the author directory as structured `creator` metadata.
- Adds `creatorUrl` and `attributionText` so CC BY attribution can flow into downstream project credits.
- Keeps the conservative CC BY 3.0 commercial-use model used by the project.
- Exposes an exact official raw SVG file through `get_asset_files` after the asset ID has been validated against the indexed repository tree.

### Tabler Icons live provider

- Adds `tablericons` as a first-class live provider using the official `tabler/tabler-icons` repository.
- Indexes both outline and filled SVG trees.
- Preserves variant metadata (`outline` / `filled`) as searchable style/tags.
- Uses the repository MIT license and creator provenance.
- Exposes exact individual SVG files for safe installation.

### Structured creator provenance

`ProviderAsset` now supports:

- `creator`
- `creatorUrl`
- `attributionText`

Openverse also populates these fields when supplied by the upstream API. Its User-Agent now uses the shared runtime `VERSION` instead of a stale hard-coded version.

### Safe icon installation

Automatic installation now supports:

- Poly Haven verified provider files;
- individual Game Icons SVGs;
- individual Tabler Icons SVGs.

`raw.githubusercontent.com` is not trusted as a whole. The installer applies provider-specific path rules:

```text
Game Icons: /game-icons/icons/master/...
Tabler Icons: /tabler/tabler-icons/main/icons/...
```

A file from another repository is rejected even when it uses the same raw GitHub hostname. Existing redirect revalidation, size limits, project-root containment and symlink/junction protections remain active.

### Deterministic validation

CI does not require live icon repository access for unit tests. Fixed tree-item fixtures validate:

- Game Icons creator/license mapping;
- Tabler outline/filled mapping;
- Openverse structured creator attribution;
- exact raw GitHub path allowlisting.

### Release engineering

- package/runtime version: `1.5.0`;
- npm lockfile refreshed by npm itself;
- Node 20/22 validation, packed-tarball clean install and MCP binary smoke start remain required.

### Compatibility

V1.5 is additive at the MCP-tool level. The `gameicons` provider ID is preserved, but it now returns individual live-indexed icons instead of five static collection entries.

---

## v1.4.0

V1.4 expands both sides of the resource stack: high-quality live 3D/PBR discovery and reusable gameplay-code discovery.

### ambientCG v3 live provider

- Adds `ambientcg` to unified search and `search_live_assets`.
- Uses the current ambientCG v3 API rather than the retired v2 API.
- Covers materials/PBR textures, HDRIs, terrain, decals, atlases, plain images, brushes, Substance resources and 3D models.
- Maps ambientCG assets as CC0 based on the provider's official license and preserves canonical source metadata.
- Adds query fallback so theme-driven searches such as `road environment` can fall back to `road`, which is important because ambientCG v3 treats multiple query terms as logical AND.
- Adds ambientCG to 3D art/environment candidates in `recommend_stack`.

Automatic installation is intentionally **not** enabled for ambientCG yet; live discovery and trusted acquisition remain separate concerns.

### GitHub reusable game-code live provider

- Adds `githubcode` as a first-class live provider instead of keeping GitHub code only behind a separate compatibility tool.
- Searches non-archived, non-fork repositories with a minimum star floor and current GitHub REST API versioning.
- Preserves detected SPDX repository license metadata and maps known licenses through the existing conservative license engine.
- Repositories with no detected explicit license fail closed as `NO-LICENSE`.
- Repository-level license detection is explicitly not treated as clearance for dependencies or bundled media/assets.

The legacy `search_open_source_projects` MCP tool remains available for compatibility.

### Gameplay-code stack planning

`recommend_stack` now creates required code slots when the game description explicitly asks for:

- vehicle/driving systems;
- inventory/loot/crafting;
- combat/weapon systems;
- multiplayer/network synchronization;
- save/persistence;
- enemy/NPC AI;
- procedural generation;
- dialogue/conversation systems.

For Godot, these slots search the official Godot Asset Library plus GitHub code. Other engines use GitHub code discovery while the verified starter rule remains conservative: an unsupported engine does not receive an arbitrary GitHub repository as a silently substituted starter.

### Verified game-font expansion

The Google Fonts verified catalog expands from 2 to 15 game-oriented families, including:

- pixel/retro: Press Start 2P, Pixelify Sans, Silkscreen, VT323;
- sci-fi/technical: Orbitron, Oxanium, Rajdhani, Chakra Petch, Audiowide;
- military: Black Ops One;
- horror: Creepster;
- fantasy/classical: Cinzel;
- CJK/localization: Noto Sans SC, Noto Serif SC, DotGothic16.

Each curated family now retains its own exact Google Fonts repository `OFL.txt` provenance rather than only pointing at the top-level OFL directory.

### Search intent improvements

V1.4 adds deterministic recognition for additional Chinese/English intent including:

- CJK / 中文 / 汉字;
- fantasy / 奇幻;
- horror / 恐怖;
- military / 军事;
- networking / PVP / 联网 / 多人;
- save / persistence / 存档;
- enemy/NPC AI / 行为树;
- procedural generation / 随机生成 / 地图生成;
- dialogue / 对话系统.

### Freesound boundary

Freesound remains a discovery source, not a default commercial live provider. Its individual sounds have per-item Creative Commons licenses, but use of the free Freesound API has separate non-commercial API terms. A separate commercial API agreement would be required before making it part of the default commercial live-provider path.

### Release engineering

- package/runtime version: `1.4.0`;
- npm lockfile refreshed by npm itself;
- new provider behavior uses fixed-fixture unit tests rather than depending on ambientCG/GitHub network availability during CI;
- existing Node 20/22 validation, npm tarball clean-install and MCP binary smoke tests remain required.

### Compatibility

V1.4 is additive. Existing MCP tool names, verified catalogs, live providers, installation boundaries and attribution workflows remain available.

---

## v1.3.0

V1.3 turns two major V1.2 discovery routes into first-class live providers.

### Openverse live image/audio search

- Adds `openverse` to `find_game_assets`, `search_live_assets` and `recommend_stack`.
- Searches Openverse images and/or audio according to requested dimensions.
- Preserves per-item creator, original landing URL, indexed source, tags, file type, license code/version, license URL and attribution text.
- Supports CC0, Public Domain Mark, CC BY, CC BY-SA, NonCommercial and NoDerivatives variants conservatively.
- NonCommercial media is rejected by default commercial search.
- Mature results are excluded.
- Openverse is treated as an aggregator, not as the asset licensor; provenance stays attached to the original item/source.

`recommend_stack` now uses Openverse as an additional source for sound effects, music and 2D environment/reference media. It intentionally does not use general Openverse images as a replacement for dedicated character, vehicle or weapon sprite/model providers.

### Godot Asset Library live search

- Adds `godotassetlib` using the official Godot Asset Library API.
- Searches official/featured/community assets using the current Godot-version filter.
- Defaults to Godot `4.7` compatibility and supports a `GODOT_VERSION` environment override.
- Maps the Asset Library `cost` field as the per-item license, as defined by the official API.
- Known MIT/GPL/LGPL/Apache/CC0/BSD/Zlib/Boost license strings are normalized; unknown/custom licenses remain fail-closed.
- `recommend_stack` now searches the live Godot Asset Library for Godot starter/template and shader/plugin slots while retaining official demo collections as fallback/reference sources.

### License model additions

- `PDM-1.0` / Public Domain Mark.
- `BSL-1.0` / Boost Software License.
- Dynamic version-aware Creative Commons classification for common CC BY / BY-SA / BY-NC / BY-ND combinations across supported historical versions.

### Provider topology

V1.3 exposes 9 direct providers:

- Live API: Poly Haven, Openverse, Godot Asset Library.
- Verified catalog: Kenney, Quaternius, Godot Demos, Game Icons, Phaser starters, Google Fonts.

The broader 40+ source/ecosystem registry from V1.2 remains available through `search_game_assets` for sources that require per-item/manual review.

### Installation boundary unchanged

Neither Openverse nor Godot Asset Library is automatically installed. Live search does not imply trusted acquisition. Automatic installation remains limited to providers whose download path is separately allowlisted and validated.

### Validation

Provider mapping tests use fixed fixtures rather than depending on third-party API availability during CI. Existing Node 20/22 validation, npm tarball clean-install and MCP binary smoke tests remain in place.

### Compatibility

V1.3 is additive. Existing tools and V1.2 source discovery behavior remain available.

---

## v1.2.0

V1.2 expands GameDev Resource MCP from a small curated source registry into a broad game-development discovery map while keeping the existing verified-provider and fail-closed licensing model.

### Major resource-source expansion

The source registry now contains 40+ high-value game-development sources and ecosystem routes spanning:

- 2D sprites, tilesets and UI;
- 3D models, characters, vehicles and environments;
- PBR materials and HDRIs;
- icon libraries;
- fonts and CJK/localization fonts;
- SFX, ambience, Foley and music sources;
- shaders and VFX;
- engines and rendering frameworks;
- physics libraries;
- plugins/addons;
- starters/templates;
- reusable inventory, combat, save, networking, pathfinding and procedural-generation code discovery.

Newly represented sources/ecosystems include ambientCG, Openverse, Freesound, Godot Asset Library, itch.io Game Assets, Sketchfab, Unity Asset Store, Epic Games Fab, Sonniss, Pixabay, Mixkit, Khronos glTF Sample Assets, Tabler Icons, Heroicons, Feather Icons, Bootstrap Icons, Noto Fonts, Bevy, Babylon.js, three.js, PixiJS, Matter.js, libGDX, raylib, Godot shader discovery, Shadertoy and additional GitHub game-development discovery routes.

### Two-tier safety model

V1.2 deliberately distinguishes between:

1. **Uniform/verified source licensing** — sources whose relevant core content has a known source-level open/permissive license, such as CC0, MIT, Apache-2.0, OFL or Zlib.
2. **Per-item review sources** — large marketplaces, community libraries and aggregators where license rights vary by item or repository.

Per-item sources are discovery routes, not blanket commercial-use approvals. `MULTIPLE` and `CUSTOM` sources remain unknown/fail-closed until the exact item license is inspected.

See `docs/resource-sources.md` for the source map and safety boundary.

### Chinese query expansion

`search_game_assets` now expands common Chinese game-development requests into useful English discovery tags, including terms such as:

- `音效`
- `音乐`
- `字体` / `中文字体`
- `着色器` / `特效`
- `背包`
- `战斗`
- `联网` / `多人`
- `存档`
- `寻路`
- `程序化`
- `车辆`
- `公路`
- `模板`
- `插件`
- `低模`
- `科幻`

This lets Chinese-language agents discover the same broad source registry without requiring the user to translate domain terms manually.

### License-rule expansion

V1.2 adds explicit recognition for:

- `MIT OR Apache-2.0` dual permissive licensing;
- `Zlib` / zlib-libpng licensing.

These are used by newly indexed permissive code ecosystems such as Bevy and raylib.

### Installation boundary unchanged

The registry is much broader, but automatic installation remains intentionally narrow. A resource appearing in the registry does **not** mean the MCP may automatically download, extract or execute it.

`install_asset_file` still requires a verified provider acquisition path, trusted HTTPS host, explicit file selection, path containment and size/hash checks where supported.

### Release engineering

- package/runtime version: `1.2.0`;
- npm lockfile refreshed by npm itself;
- expanded registry and Chinese query behavior covered by tests;
- existing Node 20/22, `npm ci`, tarball clean-install and MCP binary smoke tests remain in place.

### Compatibility

V1.2 is additive. Existing V1 provider search, `recommend_stack`, installation and attribution workflows remain available.

---

## v1.1.0

V1.1 adds a deterministic game-resource stack recommendation layer on top of the existing license-aware search system.

### `recommend_stack`

A coding agent can now provide a whole-game or feature description instead of searching one resource category at a time.

`recommend_stack`:

- infers practical signals such as engine, 2D/3D, style, genre and game themes;
- understands common English and Chinese game-development terms;
- expands the request into required and optional resource slots;
- searches each slot through the existing verified providers and conservative license filters;
- returns a primary recommendation plus alternatives for each resolved slot;
- preserves provider errors without discarding successful slots;
- reports unresolved required gaps explicitly;
- summarizes licenses, license risks, attribution requirements and provider service credits for primary selections.

Typical slots include starter/framework references, environment art, vehicles, characters, weapons/combat art, UI, icons, sound effects, music, fonts and relevant shader examples.

If a requested engine has no verified starter provider, V1.1 leaves that required slot unresolved rather than silently recommending a different engine.

### Safety model

The recommendation layer does not invent commercial-use or redistribution rights. It reuses `find_game_assets` / `searchAllAssets` provider metadata and the same conservative defaults:

- `commercialOnly: true`
- `allowAttribution: true`
- `allowShareAlike: false`

Recommendations remain retrieval assistance, not legal clearance.

### Release engineering

- package/runtime version: `1.1.0`;
- npm lockfile refreshed by npm itself;
- package-smoke version validation now reads the package version dynamically rather than hard-coding `1.0.0`;
- existing Node 20/22, `npm ci`, tarball clean-install and MCP binary smoke tests remain in place.

### Compatibility

V1.1 is additive. Existing V1 tool names and existing search/install workflows remain available.

---

## v1.0.0

First stable release of the license-aware game-development resource layer for MCP-capable coding agents.

### Cross-provider resource discovery

- Unified `find_game_assets` search across supported providers.
- Structured filters for engine, dimension, style, format, asset type, genre and animation state.
- Explainable ranking with `score` and `matchReasons`.
- Partial provider failures do not discard successful results from other providers.

### License-aware by design

- Separates commercial use, modification, redistribution, attribution and share-alike/copy-left-like obligations.
- Recognizes common game-development licenses including CC0, MIT, BSD, Apache-2.0, CC BY, CC BY-SA, GPL/LGPL, OpenGameArt attribution licenses and SIL OFL 1.1.
- Unknown, custom, missing and non-commercial licenses fail closed to manual review/rejection.
- Repository-level licenses are not assumed to cover every bundled asset.

### Verified providers

- Poly Haven — live API, CC0 assets, official file metadata.
- Kenney — verified CC0 catalog covering 2D, 3D, UI, vehicles and audio.
- Quaternius — verified CC0 3D catalog.
- Game Icons — attribution-aware verified icon catalog.
- Google Fonts — verified OFL game-suitable fonts.
- Godot official demos — MIT code/starter examples.
- Phaser official starters — MIT web-game templates.

### Project attribution manifests

`generate_project_attribution` creates content for:

- `THIRD_PARTY_ASSETS.md`
- `CREDITS.md`

and surfaces warnings for unknown or conditional licenses.

### Safe asset installation

V1 introduces:

- `plan_asset_install`
- `install_asset_file`

Automatic installation is intentionally limited to providers with sufficiently verifiable official file acquisition metadata. In v1.0.0, that means Poly Haven.

The installer:

- requires explicit file selection;
- restricts downloads to allowlisted HTTPS hosts;
- prevents project-root path traversal;
- enforces file-size limits;
- checks provider-reported sizes;
- verifies MD5 when available;
- never executes or extracts downloaded content.

### MCP tools in v1.0.0

- `find_game_assets`
- `search_game_assets`
- `search_live_assets`
- `get_asset_files`
- `plan_asset_install`
- `install_asset_file`
- `list_asset_providers`
- `search_open_source_projects`
- `inspect_repository`
- `check_license`
- `generate_attribution`
- `generate_project_attribution`

### Compatibility

- Node.js 20+
- Local STDIO MCP transport
- Designed for Codex, Claude Code, Trae and generic MCP clients that support local STDIO servers.

### Breaking-change policy

v1.0.0 establishes the initial stable tool names and core result shapes. Future breaking changes should use a new major version or a clearly documented migration path.

### Known limitations

- Verified catalog coverage is intentionally incomplete.
- Automatic installation is currently Poly Haven only.
- OpenGameArt and arbitrary GitHub repositories still require per-item/per-repository inspection.
- No automatic archive extraction, package installation, code execution or repository cloning.
- License classification is technical assistance, not legal advice.
