# Resource source map

GameDev Resource MCP separates resource discovery into two safety tiers.

## Tier A — uniform or explicitly verified licensing

These sources can be represented with a known source-level license posture because the relevant code/assets are published under a uniform or clearly documented permissive/open license.

Examples currently registered include:

- Kenney — CC0 game asset packs.
- Poly Haven — CC0 HDRIs, textures and models.
- Quaternius — CC0 3D game asset packs.
- ambientCG — CC0 PBR materials, HDRIs and models.
- Tabler Icons — MIT SVG icon library.
- Heroicons — MIT icons.
- Feather Icons — MIT icons.
- Bootstrap Icons — MIT icons.
- Noto Fonts — OFL-oriented multilingual/CJK font ecosystem; verify exact family license/RFN before font modification.
- Godot Engine — MIT core engine.
- Phaser — MIT game framework.
- Bevy core — MIT OR Apache-2.0, with example asset licenses tracked separately.
- Babylon.js — Apache-2.0.
- three.js — MIT core package; copied examples/addons/assets can have extra notices.
- PixiJS — MIT.
- Matter.js — MIT.
- libGDX — Apache-2.0.
- raylib — zlib/libpng license; bundled dependencies retain their own notices.

A known source-level license does **not** mean every third-party file found in a repository inherits that license. Repository credits/notices still matter.

## Tier B — high-value discovery sources requiring per-item review

These sources are intentionally indexed because they contain a large amount of useful game-development material, but the site or ecosystem does not have one safe blanket license for every result.

- OpenGameArt
- Openverse
- Freesound
- itch.io Game Assets
- Sketchfab
- Godot Asset Library
- Unity Asset Store
- Epic Games Fab / Unreal ecosystem
- Unity official sample repositories
- Godot shader community sites
- Shadertoy
- Sonniss GDC Game Audio Bundles
- Pixabay media/audio
- Mixkit
- Khronos glTF Sample Assets
- Font Awesome Free (component licenses differ)
- GitHub game engines/frameworks
- GitHub game templates/starters
- GitHub shader/VFX repositories
- GitHub reusable game systems
- Bevy community assets/plugins

For Tier B, the registry acts as a **discovery route**, not a commercial-use approval. The agent should inspect the exact item/repository/license before adopting it.

## Search domains now covered

The source registry can route searches for:

- 2D sprites and tilesets
- 3D models and environments
- PBR materials and HDRIs
- vehicles and characters
- weapons and props
- UI and HUD assets
- icon libraries
- fonts including CJK/localization fonts
- SFX, ambience, Foley and music
- shaders and VFX
- game engines/frameworks
- physics/rendering libraries
- starters/templates
- plugins/addons
- inventory/combat/save/networking/pathfinding/procedural-generation code discovery

Chinese aliases are normalized for common requests such as `音效`, `字体`, `中文字体`, `着色器`, `背包`, `战斗`, `联网`, `车辆`, `公路`, `模板`, `插件`, `低模`, `科幻` and others.

## Safe workflow

```text
user need
  ↓
search_game_assets / recommend_stack / find_game_assets
  ↓
verified provider result OR discovery source
  ↓
exact item/repository inspection when required
  ↓
license check
  ↓
select resource
  ↓
plan/install only when acquisition is verified
  ↓
attribution manifest
```

The registry is intentionally allowed to be broad; automatic installation remains intentionally narrow.
