# Resource source map

GameDev Resource MCP separates **source licensing**, **per-item licensing**, **API/service terms** and **automatic installation trust**. These are different questions.

## First-class direct providers

V1.4 directly searches these provider adapters:

### Live APIs

- Poly Haven — CC0 HDRIs, textures and models; separately verified automatic file acquisition exists.
- ambientCG — CC0 PBR materials, HDRIs, terrain, decals, atlases and models through the current v3 API.
- Openverse — open images/audio with per-item creator/source/license metadata.
- Godot Asset Library — Godot addons/projects with per-item license metadata.
- GitHub Open-Source Code — repositories with detected SPDX license metadata; missing/unknown licenses fail closed.

### Verified catalogs

- Kenney — CC0 game asset packs.
- Quaternius — CC0 3D packs.
- Game Icons — conservatively modeled as attribution-required game icons.
- Google Fonts — curated game-font families with exact family OFL provenance, including CJK choices.
- Godot official demos — MIT repository-level code examples.
- Phaser official starters — MIT starter templates.

A direct provider does **not** imply automatic installation. Search trust, license trust and acquisition trust remain separate layers.

## Tier A — uniform or explicitly verified source licensing

The broader registry also contains sources/ecosystems with a known source-level posture, including:

- ambientCG — CC0.
- Tabler Icons — MIT.
- Heroicons — MIT.
- Feather Icons — MIT.
- Bootstrap Icons — MIT.
- Noto Fonts — OFL-oriented multilingual/CJK ecosystem; verify exact family license/RFN before modification.
- Godot Engine — MIT core engine.
- Phaser — MIT framework.
- Bevy core — MIT OR Apache-2.0, with example assets tracked separately.
- Babylon.js — Apache-2.0.
- three.js — MIT core package; examples/addons/assets can carry extra notices.
- PixiJS — MIT.
- Matter.js — MIT.
- libGDX — Apache-2.0.
- raylib — zlib/libpng license; bundled dependencies retain their own notices.

A source-level license does **not** mean every third-party file in a repository inherits that license.

## Tier B — high-value discovery sources requiring per-item or service-term review

These sources contain substantial useful material but cannot be blanket-approved:

- OpenGameArt
- Freesound
- itch.io Game Assets
- Sketchfab
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
- GitHub community templates, shaders and reusable systems beyond exact inspected repositories
- Bevy community assets/plugins

For Tier B, a registry hit is a **discovery route**, not commercial-use approval.

### Freesound-specific boundary

Freesound is intentionally not a default live provider in the commercial workflow. Individual sounds carry their own Creative Commons licenses, but Freesound's free API access has separate non-commercial API-use terms. A commercial API agreement must be handled separately before enabling that API for a commercial automated workflow.

This is why “the media item is commercially licensed” and “the API may be used commercially” are tracked as separate concepts.

## Search domains covered

The source and provider layers can route/discover:

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
- vehicle/driving systems
- inventory/loot/crafting systems
- combat systems
- networking/multiplayer
- save/persistence
- enemy/NPC AI
- pathfinding
- procedural generation
- dialogue/conversation systems

Chinese aliases/intent rules cover common requests such as `音效`, `字体`, `中文字体`, `着色器`, `背包`, `战斗`, `联网`, `存档`, `AI`, `程序化`, `车辆`, `公路`, `模板`, `插件`, `低模`, `科幻`, `恐怖`, `奇幻` and others.

## Safe workflow

```text
user need
  ↓
recommend_stack / find_game_assets / search_game_assets
  ↓
first-class provider result OR broad discovery source
  ↓
exact item/repository inspection when required
  ↓
license + API/service-term check
  ↓
select resource
  ↓
plan/install only when acquisition is separately verified
  ↓
attribution manifest
```

The registry is intentionally broad; automatic installation remains intentionally narrow.
