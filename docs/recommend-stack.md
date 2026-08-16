# `recommend_stack`

`recommend_stack` is the whole-game entry point for GameDev Resource MCP. It converts a broad game or feature description into practical **media + reusable code** resource slots and resolves each slot through the same license-aware search layer.

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

It then creates slots such as:

```text
starter/framework        required
environment              required
vehicle art              required
vehicle/driving system   required
character                 required
weapon/combat art        required
combat system             required
inventory/loot system     required
UI                        required
icons                     optional
sound effects             required
music/jingles             optional
font                      required
```

If the description also requests multiplayer, persistence, AI, procedural generation or dialogue, additional required code slots are created.

## Gameplay-code slots

V1.4 can create these code slots when explicitly implied by the request:

| Slot | Typical triggers |
|---|---|
| `vehicle-system` | vehicle, car, truck, driving, 车辆, 驾驶 |
| `inventory-system` | inventory, loot, crafting, 背包, 物资, 搜刮, 制作 |
| `combat-system` | combat, weapon, gun, battle, 战斗, 武器, 枪械 |
| `networking` | multiplayer, networking, PVP/PVE, 联机, 联网, 多人, 同步 |
| `save-system` | save game, persistence, 存档, 持久化 |
| `ai-system` | enemy/NPC AI, behavior tree, 敌人 AI, 行为树 |
| `procedural-generation` | procedural/procgen, 程序化, 随机生成, 地图生成 |
| `dialogue-system` | dialogue/conversation, 对话, 对话系统, 剧情系统 |

For Godot, reusable gameplay-code slots can search both the live Godot Asset Library and the GitHub code provider. Other engines use GitHub code discovery unless a more specific verified provider exists.

The starter rule remains stricter: a requested engine without a verified starter provider keeps an unresolved starter gap rather than accepting an arbitrary repository as a silent substitute.

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
- provider service-credit requirements where relevant.

Alternatives retain their own full license metadata but are not counted until selected.

## Deterministic planning

The planner uses explicit keyword/rule mappings rather than asking an LLM to infer legal rights.

It recognizes common English and Chinese terms for:

- Godot / Phaser / Unity / Unreal / web;
- 2D / 3D;
- pixel / cartoon / low-poly / sci-fi / fantasy / horror / military / medieval / retro / stylized / realistic;
- survival / RPG / roguelike / racing / shooter / platformer / tower defense / adventure / strategy;
- road / vehicle / combat / character / inventory / networking / save / AI / procedural generation / dialogue / nature / space / CJK.

These mappings decide which resource slots and search queries are appropriate. They do **not** decide whether a license is legally safe.

## Provider behavior

The stack planner reuses the same providers as targeted search. Relevant V1.4 examples:

- 3D environment/art can search Quaternius, Kenney, Poly Haven and ambientCG;
- 2D environment/reference media may also use Openverse;
- sound/music can use Kenney and Openverse;
- fonts use the verified Google Fonts game catalog, including CJK choices;
- Godot starter/shader/code slots can use Godot Asset Library and official demos as appropriate;
- generic gameplay-code slots can use GitHub repository search with detected SPDX license metadata.

GitHub repository-level license detection does **not** validate dependencies or independently licensed bundled media.

## License behavior

Every slot is resolved through `searchAllAssets`, so the normal conservative license filters still apply.

Default posture:

```text
commercialOnly = true
allowAttribution = true
allowShareAlike = false
```

The recommendation layer never upgrades an unknown/custom/missing license into an allowed license and never treats a high search score as legal clearance.

## Engine gaps

Verified starter providers currently exist for Godot and Phaser/web workflows.

For example, if the user explicitly requests Unity, the planner can still recommend compatible art/audio/font resources and can discover reusable GitHub code, but the required starter slot remains unresolved until a verified Unity starter provider is added. It does not substitute Godot or Phaser.

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

`recommend_stack` is technical retrieval and workflow assistance, not legal advice. Verify original license text, dependencies and provenance before shipping a commercial game.
