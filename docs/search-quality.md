# Search quality and fallback behavior

GameDev Resource MCP is intentionally positioned as a license-aware game-development resource search engine for AI coding agents. V1.15 introduced bounded semantic fallback; V1.16 improves query diversity and relevance ranking so the first few results are more likely to match the user's actual game-development intent.

## Why this exists

A query such as:

```text
tower defense turret gun enemy 3D low poly
```

must not require one asset record to literally contain every word. Game-asset catalogs may describe the useful resource as `tank`, `cannon`, `artillery`, `sentry`, `weapon` or a pack name rather than `turret`.

At the same time, semantic fallback must not become an excuse to return merely legal but unrelated content. The search layer therefore separates hard structured filters from soft concepts and ranks resources by how much of the requested intent they actually cover.

## MCP entry points

Use `find_game_assets` for normal cross-provider discovery. It uses capability pruning, semantic fallback, unified relevance ranking and diagnostics.

`search_live_assets` intentionally remains a lower-level single-provider operation. It forwards one query to one provider and does not promise the same cross-provider semantic fallback behavior. This keeps provider debugging/raw lookup possible while giving agents a higher-quality default discovery path.

## Hard constraints

Semantic fallback never silently relaxes explicit structured constraints such as:

- dimension (`2D`, `3D`, `audio`, `font`, `code`);
- engine filters for engine-specific code;
- commercial-use policy;
- attribution policy;
- share-alike policy;
- reuse scope and bundled-asset status;
- explicitly requested provider subset.

Generic media without an engine tag remains eligible when an engine is supplied, because engine context must not discard ordinary FBX/glTF/PNG/WAV-style assets merely for lacking an engine label. Engine-specific code and explicitly engine-tagged resources remain strictly filtered.

If a user asks for `3D`, a relevant 2D pack may be mentioned only as an optional alternative by a higher-level agent. It does not satisfy the 3D search result.

## Game-development concept map

The query planner recognizes bounded game-development synonym families. Examples include:

```text
turret -> turret, cannon, artillery, sentry, defense tower, tank turret, tank
weapon -> weapon, gun, cannon, rifle, blaster, artillery
enemy -> enemy, monster, creature, robot, zombie, hostile
building -> building, house, structure, architecture, village, modular building
road -> road, street, highway, asphalt, road kit
loot -> loot, pickup, item, resource, chest, collectible
spaceship -> spaceship, spacecraft, starship, sci-fi ship
```

Theme/style modifiers include:

```text
low-poly
cyberpunk
sci-fi
fantasy
medieval
post-apocalyptic
urban
nature
dungeon
tower-defense
```

The map also covers vehicles, characters, environment, UI, icons, audio, music, fonts and gameplay-code concepts such as inventory, combat, AI, networking, save, procedural generation and dialogue.

This is a maintained domain vocabulary, not an unrestricted language model inference layer. New mappings should be backed by real search failures or clear game-development usage.

## V1.16 query diversity

V1.15 could spend most of a small fallback budget expanding one high-priority term. V1.16 changes the plan so detected concepts receive a focused chance before deeper synonyms consume the remaining budget.

For a query like:

```text
cyberpunk low poly turret enemy
```

variants can include:

```text
exact query
-> turret
-> cyberpunk turret
-> low poly turret
-> enemy
-> cyberpunk
-> low poly
-> cannon / other bounded synonyms if budget remains
```

This improves recall without firing an unbounded number of provider requests.

## Modifier + subject combinations

When a query contains a concrete subject plus a style/theme modifier, the planner creates focused combinations such as:

```text
low poly turret
cyberpunk environment
medieval building
post-apocalyptic vehicle
```

These are useful for verified catalogs that still perform relatively strict token matching internally. They also reduce semantic drift compared with immediately broadening a specific request to a generic word such as `weapon` or `environment`.

## Relevance ranking

A result must have lexical or semantic relevance to a non-empty query. License, popularity and freshness metadata alone cannot make an unrelated resource pass.

V1.16 adds two additional ranking signals:

1. **Concept priority** — direct/high-priority concepts such as `turret` or `spaceship` matter more than broad style modifiers.
2. **Concept coverage** — a resource matching several requested concepts is preferred over a resource matching only one broad concept.

For example, for:

```text
cyberpunk turret enemy low poly
```

a kit containing a turret, enemies and cyberpunk/low-poly metadata should rank above a generic gun pack even if both are commercially safe.

Direct matches to the user's triggering concept receive a small additional boost over loose synonym-only matches. Popularity and freshness remain bounded secondary signals.

## Quality-aware fallback stopping

Search does not stop merely because a multi-concept query accumulated a few weak one-concept results. For queries with several detected concepts, the top result must meet a small semantic-coverage target before fallback stops early.

Diagnostics expose this per attempt through:

```text
topSemanticCoverage
qualityTargetMet
```

The fallback remains bounded by `maxQueryVariants`; quality checking never turns into unrestricted retrying.

## Diagnostics

`find_game_assets` returns diagnostics including:

- whether fallback was used;
- attempted query variants;
- why each variant was attempted;
- raw assets returned by each attempt;
- cumulative relevant-result count;
- top-result semantic concept coverage;
- whether the quality target was met;
- providers pruned by capability metadata;
- suggested alternative queries.

This makes zero-result and shallow-result conclusions explainable rather than opaque.

## Provider capability pruning

Capability metadata is used to avoid obviously irrelevant providers before making live calls. Examples:

- Quaternius / KayKit: 3D, especially low-poly/stylized game art;
- Google Fonts: fonts;
- Game Icons / Tabler Icons: 2D icons/UI;
- Openverse: 2D images and audio;
- GitHub Code: engine/gameplay code discovery;
- Godot Asset Library: Godot-specific code/addons.

An explicit `3D` search therefore avoids calling providers that only expose fonts, icons or code.

`list_asset_providers` exposes the same capability matrix to MCP clients.

## Niche-engine search context

The search layer recognizes basic aliases for:

- UrhoX / Urho3D / TapMaker -> `urhox`;
- LÖVE / Love2D -> `love2d`;
- Defold -> `defold`.

This exists to improve search routing and code discovery. The project does not aim to become an engine import/conversion/compatibility platform.

Reusable-project discovery may include live GitHub Code candidates whose repository license is screened. Such results remain:

```text
reuseScope = code-only
bundledAssetStatus = needs-review
```

They are discovery candidates, not equivalent to maintained verified starters.

## Compact `recommend_stack`

The MCP-facing `recommend_stack` tool defaults to `responseMode = summary` to avoid dumping tens of kilobytes of raw result metadata into an agent context.

Summary mode keeps inferred intent, completion/gap status, primary/alternative candidates, source/provider/license/risk/score and reuse metadata. Use `responseMode = full` only when detailed per-asset provenance/ranking metadata is required.

## Maintained regression cases

The deterministic test suite includes real search patterns rather than only toy keyword checks.

### UrhoX low-poly tower defense

```text
tower defense turret gun enemy 3D low poly
engines = ["urhox"]
dimensions = ["3D"]
```

The search must recover relevant generic 3D art through semantic fallback and must not use 2D Tower Defense / Pixel Platformer packs to satisfy the request.

### Cyberpunk turret

```text
cyberpunk turret enemy 3D low poly
```

Against the maintained Quaternius catalog, the direct multi-concept Cyberpunk Game Kit must rank first.

### Medieval village

```text
medieval village building 3D low poly
```

Against the maintained Quaternius catalog, Medieval Village MegaKit must rank first.

These regressions protect practical relevance, not only raw candidate counts.
