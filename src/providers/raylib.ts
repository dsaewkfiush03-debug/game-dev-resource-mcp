import { createVerifiedCatalogProvider } from "./catalog.js";
import type { AdoptionHint } from "./types.js";

const VERIFIED_AT = "2026-08-16T00:00:00.000Z";
const GAME_COLLECTION = "https://github.com/raysan5/raylib-games";
const GAME_LICENSE = "https://github.com/raysan5/raylib-games/blob/master/LICENSE";
const CODE_ONLY_HINTS: AdoptionHint[] = [
  { action: "keep", targetType: "system", target: "licensed C source implementation", reason: "The upstream collection explicitly licenses game sources under zlib/libpng terms." },
  { action: "replace", targetType: "asset-category", target: "bundled or adjacent art, audio, fonts and other media", reason: "The source-specific license statement does not blanket-clear media.", required: true },
  { action: "review", targetType: "notice", target: "zlib origin/change notice requirements", reason: "Source redistributions must not misrepresent origin and altered source versions must be marked.", required: true }
];

export const raylibProvider = createVerifiedCatalogProvider(
  "raylib",
  "Raylib Official Project References",
  {
    license: "Zlib",
    licenseSource: "https://github.com/raysan5/raylib-game-template/blob/main/LICENSE",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false
  },
  [
    {
      id: "raylib-game-template",
      name: "Raylib Game Template",
      sourceUrl: "https://github.com/raysan5/raylib-game-template",
      description: "Official small-game starter structure in plain C with Make, CMake and Visual Studio project setup.",
      categories: ["Code", "Starter", "Template"],
      tags: ["raylib", "starter", "template", "c", "cmake", "makefile", "game"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c", "cmake", "makefile"],
      assetTypes: ["starter", "template", "code"],
      gameGenres: ["multiple"],
      reuseScope: "whole-project",
      bundledAssetStatus: "none",
      bundledAssetNotes: "The official template is intended to be copied as a project starting point. Replace placeholder screenshots/content when creating a real game.",
      adoptionHints: [
        { action: "keep", targetType: "path", target: "src/", reason: "Primary game-source structure in the official template." },
        { action: "keep", targetType: "path", target: "CMakeLists.txt", reason: "Official CMake starter configuration." },
        { action: "keep", targetType: "path", target: "projects/", reason: "Official IDE/project build configuration; keep only the environments the target project needs." },
        { action: "replace", targetType: "path", target: "screenshots/", reason: "Template placeholder/presentation content should be replaced with the new game's own material.", required: true },
        { action: "review", targetType: "notice", target: "LICENSE", reason: "Preserve the zlib notice requirements when redistributing source.", required: true }
      ]
    },
    {
      id: "raylib-games-collection",
      name: "Raylib Games Collection",
      sourceUrl: GAME_COLLECTION,
      licenseSource: GAME_LICENSE,
      description: "Official collection of game-jam and classic raylib games. The upstream README explicitly licenses game sources under zlib; bundled media is not blanket-approved by that statement.",
      categories: ["Code", "Complete Game", "Examples"],
      tags: ["raylib", "complete game", "game jam", "classic", "reference", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "example"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Upstream states that all game sources are zlib-licensed. Review each game's art/audio/media separately before redistributing them.",
      adoptionHints: CODE_ONLY_HINTS
    },
    {
      id: "raylib-classic-platformer",
      name: "Raylib Classic Platformer",
      sourceUrl: "https://github.com/raysan5/raylib-games/blob/master/classics/src/platformer.c",
      licenseSource: GAME_LICENSE,
      description: "Compact playable platformer implementation from the official raylib games collection.",
      categories: ["Code", "Complete Game", "2D"],
      tags: ["raylib", "platformer", "complete game", "movement", "collision", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "platformer-system"],
      gameGenres: ["platformer"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Reuse the source implementation under zlib; do not assume adjacent media shares that license.",
      adoptionHints: CODE_ONLY_HINTS
    },
    {
      id: "raylib-classic-asteroids",
      name: "Raylib Classic Asteroids",
      sourceUrl: "https://github.com/raysan5/raylib-games/blob/master/classics/src/asteroids.c",
      licenseSource: GAME_LICENSE,
      description: "Compact Asteroids-style complete game source useful for movement, shooting and entity-loop reference.",
      categories: ["Code", "Complete Game", "2D"],
      tags: ["raylib", "asteroids", "shooter", "complete game", "movement", "projectile", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "combat-system"],
      gameGenres: ["shooter", "arcade"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Reuse the source implementation under zlib; independently review any bundled media.",
      adoptionHints: CODE_ONLY_HINTS
    },
    {
      id: "raylib-classic-snake",
      name: "Raylib Classic Snake",
      sourceUrl: "https://github.com/raysan5/raylib-games/blob/master/classics/src/snake.c",
      licenseSource: GAME_LICENSE,
      description: "Small complete Snake implementation suitable as a minimal game-loop and input reference.",
      categories: ["Code", "Complete Game", "2D"],
      tags: ["raylib", "snake", "complete game", "arcade", "input", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "example"],
      gameGenres: ["arcade"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Source license is explicit; media reuse is intentionally not inferred.",
      adoptionHints: CODE_ONLY_HINTS
    },
    {
      id: "raylib-classic-tetris",
      name: "Raylib Classic Tetris",
      sourceUrl: "https://github.com/raysan5/raylib-games/blob/master/classics/src/tetris.c",
      licenseSource: GAME_LICENSE,
      description: "Small complete falling-block game implementation useful for grid logic and state-flow reference.",
      categories: ["Code", "Complete Game", "2D"],
      tags: ["raylib", "tetris", "falling blocks", "grid", "complete game", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "grid-system"],
      gameGenres: ["puzzle", "arcade"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Source reuse is zlib-scoped; do not infer rights for unrelated media or trademarks.",
      adoptionHints: CODE_ONLY_HINTS
    },
    {
      id: "raylib-retro-maze-3d",
      name: "Raylib Retro Maze 3D",
      sourceUrl: "https://github.com/raysan5/raylib-games/tree/master/retro_maze_3d",
      licenseSource: GAME_LICENSE,
      description: "A complete 3D maze game from the official raylib games collection, useful as a compact first-person/maze reference.",
      categories: ["Code", "Complete Game", "3D"],
      tags: ["raylib", "3d", "maze", "first person", "complete game", "game jam", "c"],
      engine: ["raylib"],
      dimension: "code",
      formats: ["c"],
      assetTypes: ["complete-game", "code", "3d-game"],
      gameGenres: ["adventure", "maze"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "The collection licenses sources under zlib. Audit this game's textures/audio before reusing them.",
      adoptionHints: CODE_ONLY_HINTS
    }
  ],
  { verificationStatus: "verified", verifiedAt: VERIFIED_AT }
);