# `recommend_stack`

`recommend_stack` is the whole-game entry point for GameDev Resource MCP. It converts a broad game or feature description into a set of practical resource slots and resolves each slot through the existing license-aware search layer.

## Example

Input intent:

```text
用 Godot 做一个 2D 像素公路求生游戏，玩家驾驶车辆、搜物资、和敌人战斗，有角色、枪械和背包。
```

The planner can infer signals such as:

```text
engine: godot
dimension: 2D
styles: pixel
genres: survival
themes: road, vehicle, combat, character, inventory
```

It then creates relevant slots such as:

```text
starter/framework      required
environment            required
vehicle                required
character              required
weapon/combat art      required
UI                     required
icons                  optional
sound effects          required
music/jingles          optional
font                    required
```

## Input

Important inputs include:

- `description` — required free-form game/feature description;
- `engine` — optional explicit engine override;
- `dimension` — optional `2D` or `3D` override;
- `styles` — optional explicit style hints;
- `gameGenres` — optional explicit genre hints;
- `providers` — optional provider allowlist;
- `commercialOnly` — defaults to `true`;
- `allowAttribution` — defaults to `true`;
- `allowShareAlike` — defaults to `false`;
- `perSlotLimit` — number of candidates retained per slot.

Explicit structured inputs are combined with deterministic inference from the description.

## Output

The result contains:

### `inferred`

The engine, dimension, style, genre and theme signals recognized from the request.

### `recommendations`

One result per slot. A resolved slot contains:

- the slot definition and rationale;
- the search query that produced results;
- one `primary` resource;
- zero or more `alternatives`;
- provider errors that occurred while resolving the slot.

An unresolved slot contains a `gap` explanation instead of a primary resource.

### `requiredGaps`

Required slots that could not be resolved under the current provider and license constraints.

A gap is intentional information. It means the system did not find a supported result that passed the current rules; it must not be silently replaced with an unrelated engine/source.

### `licenseSummary`

A summary of primary selections only:

- license counts;
- risk counts;
- attribution-required selections;
- provider service-credit requirements such as Poly Haven live API credit.

Alternatives retain their own full license metadata but are not counted until selected.

## Deterministic planning

The planner uses explicit keyword/rule mappings rather than asking an LLM to infer legal rights.

It recognizes common English and Chinese terms for:

- Godot / Phaser / Unity / Unreal / web;
- 2D / 3D;
- pixel / cartoon / low-poly / sci-fi / medieval / retro / stylized / realistic;
- survival / RPG / roguelike / racing / shooter / platformer / tower defense / adventure / strategy;
- road / vehicle / combat / character / inventory / nature / space.

These mappings decide which resource slots and search queries are appropriate. They do **not** decide whether a license is legally safe.

## License behavior

Every slot is resolved through `searchAllAssets`, so the normal conservative license filters still apply.

Default posture:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

The recommendation layer never upgrades an unknown/custom license into an allowed license and never treats a high search score as legal clearance.

## Engine gaps

Verified starter providers currently exist for Godot and Phaser/web workflows.

For example, if the user explicitly requests Unity, the planner can still recommend compatible art/audio/font resources, but the required starter slot remains unresolved until a verified Unity starter provider is added. It does not substitute Godot or Phaser.

## Installation remains separate

A recommendation does not cause a download.

The safe workflow remains:

```text
recommend_stack
    ↓
choose a resource
    ↓
plan_asset_install
    ↓
choose an exact provider file
    ↓
install_asset_file
```

Automatic installation remains limited to providers that expose a stable, verifiable acquisition path and pass the installer safety policy.

## Legal boundary

`recommend_stack` is technical retrieval and workflow assistance, not legal advice. Verify original license text and provenance before shipping a commercial game.
