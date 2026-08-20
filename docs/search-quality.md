# Search quality and fallback behavior

V1.15 changes cross-provider search from strict natural-language token matching toward a bounded semantic query plan designed for game-development terminology.

## Why this exists

A query such as:

```text
tower defense turret gun enemy 3D low poly
```

must not require one asset record to literally contain every word. Game-asset catalogs may describe the useful resource as `tank`, `cannon`, `artillery`, `sentry`, `weapon` or a pack name rather than `turret`.

V1.15 therefore separates explicit structured filters from soft search concepts.

## MCP entry points

Use `find_game_assets` for normal cross-provider discovery. It uses capability pruning, semantic fallback, unified relevance ranking and diagnostics.

`search_live_assets` intentionally remains a lower-level single-provider operation. It forwards one query to one provider and does not promise the same cross-provider semantic fallback behavior. This distinction keeps provider debugging/raw lookup possible while giving agents a higher-quality default discovery path.

## Hard constraints

The semantic fallback path never silently relaxes explicit structured constraints such as:

- dimension (`2D`, `3D`, `audio`, `font`, `code`);
- engine filters for engine-specific code;
- commercial-use policy;
- attribution policy;
- share-alike policy;
- reuse scope and bundled-asset status;
- explicitly requested provider subset.

If a user asks for `3D`, a relevant 2D pack can be mentioned only as an optional alternative by a higher-level agent. It does not satisfy the 3D search result.

## Soft semantic concepts

The query planner recognizes game-development concepts and bounded synonym families, including examples such as:

```text
turret -> turret, cannon, artillery, sentry, defense tower, tank turret, tank
weapon -> weapon, gun, cannon, rifle, blaster, artillery
enemy -> enemy, hostile, monster, creature, robot, zombie
low-poly -> low poly, low-poly, stylized, lowpoly
tower-defense -> tower defense, defense, fortress, fortification
```

It also maintains mappings for vehicles, characters, UI, icons, audio, music, fonts and gameplay-code concepts such as inventory, combat, AI, networking, save, procedural generation and dialogue.

## Progressive fallback

`find_game_assets` first tries the exact query. If the ranked result set is still shallow, it tries a bounded number of semantic/broader variants while preserving the structured filters.

The result includes diagnostics:

- whether fallback was used;
- attempted query variants;
- why each variant was attempted;
- raw assets returned by each attempt;
- cumulative relevant-result count;
- providers pruned by capability metadata;
- suggested alternative queries.

This makes a zero-result conclusion explainable rather than opaque.

## Relevance gate

A license-safe resource no longer ranks only because it has good license/provenance/popularity metadata. For a non-empty query, the result must have actual lexical or semantic relevance to the requested concept.

This specifically prevents unrelated packs from being used merely to fill a recommendation slot.

## Provider capability pruning

V1.15 maintains provider capability metadata for dimension, engine scope and strengths. Examples:

- Quaternius / KayKit: 3D, especially low-poly/stylized game art;
- Google Fonts: fonts;
- Game Icons / Tabler Icons: 2D icons/UI;
- Openverse: 2D images and audio;
- GitHub Code: engine/gameplay code discovery;
- Godot Asset Library: Godot-specific code/addons.

An explicit `3D` search therefore avoids calling providers that only expose fonts, icons or code.

`list_asset_providers` exposes the same capability matrix to MCP clients.

## Niche engines

V1.15 adds basic engine recognition/search aliases for:

- UrhoX / Urho3D / TapMaker -> `urhox`;
- LÖVE / Love2D -> `love2d`;
- Defold -> `defold`.

These engines do not automatically gain a maintained verified starter catalog. Instead, reusable-project discovery may include live GitHub Code candidates whose repository license is screened. Such results remain:

```text
reuseScope = code-only
bundledAssetStatus = needs-review
```

They are discovery candidates, not equivalent to maintained verified starters.

## Compact `recommend_stack`

The MCP-facing `recommend_stack` tool defaults to `responseMode = summary` to avoid dumping tens of kilobytes of raw result metadata into the agent context.

Summary mode keeps:

- inferred engine/dimension/style/genre;
- completion/gap status;
- one primary and compact alternatives per slot;
- provider, source URL, license, risk and score;
- reuse/bundled-asset status where relevant;
- license summary.

Use:

```text
responseMode = full
```

only when detailed per-asset provenance/ranking metadata is required.

## Regression case

The maintained tests include the real-world failure mode:

```text
tower defense turret gun enemy 3D low poly
```

with `dimensions = ["3D"]` against verified Kenney/Quaternius catalogs. The search must broaden semantically, return relevant 3D candidates when available, and never use the 2D Tower Defense/Pixel Platformer packs to satisfy the 3D constraint.
