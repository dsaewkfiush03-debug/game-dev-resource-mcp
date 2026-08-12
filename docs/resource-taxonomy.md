# Resource taxonomy

V0.5 adds structured game-development metadata so AI agents can search beyond free-text tags.

## Fields

- `engine`: intended or pre-integrated engines such as Godot, Unity or Unreal.
- `dimension`: `2D`, `3D`, `audio`, `font`, `code`, or `mixed`.
- `style`: visual or production style such as pixel, low-poly, stylized, sci-fi or medieval.
- `formats`: source or delivery formats such as PNG, WAV, FBX, OBJ, glTF, Blend, GDScript or GLSL.
- `assetTypes`: functional role such as character, vehicle, UI, SFX, tileset, shader, starter or environment.
- `gameGenres`: useful genre associations such as RPG, racing, platformer, shooter or adventure.
- `resolution`: known source resolution/tile resolution when material to use.
- `animated`: whether the entry explicitly includes animation.

## Search semantics

`find_game_assets` accepts these dimensions as optional filters. Multiple values within one field are treated conservatively: a result must satisfy the requested metadata filters rather than receiving a purely cosmetic ranking bonus.

Free-text query matching still considers name, tags, categories, description and structured metadata. Structured metadata matches receive an explainable `metadata:<token>` ranking reason.

## Provenance policy

Structured metadata is only added when it can be established from the original publisher/source or from the resource itself. Unknown fields should remain absent rather than guessed.

Provider-level repository licenses do not erase narrower third-party asset terms. Agents should still verify item-specific notices before shipping a commercial game.
