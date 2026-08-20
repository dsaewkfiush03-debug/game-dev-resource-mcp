export type CoverageScenarioGroup = "godot" | "phaser" | "raylib" | "unity" | "unreal" | "generic";

export interface CoverageScenario {
  id: string;
  label: string;
  group: CoverageScenarioGroup;
  description: string;
}

export const COVERAGE_SCENARIOS: CoverageScenario[] = [
  { id: "godot-pixel-road-survival", label: "Godot pixel road survival", group: "godot", description: "用 Godot 做一个 2D 像素公路求生游戏，有车辆驾驶、角色、枪械、背包、战斗、敌人 AI、存档和联网 PVP。" },
  { id: "godot-lowpoly-survival", label: "Godot low-poly survival", group: "godot", description: "Godot 3D low-poly survival game with vehicles, inventory, combat, enemy AI, save system and multiplayer networking." },
  { id: "godot-fantasy-rpg", label: "Godot fantasy RPG", group: "godot", description: "Godot 2D fantasy RPG with characters, inventory, combat, dialogue, save system and medieval environment." },
  { id: "godot-scifi-shooter", label: "Godot sci-fi shooter", group: "godot", description: "Godot 3D sci-fi shooter with weapons, enemy AI, networking, save system, shaders and space environment." },
  { id: "godot-pixel-roguelike", label: "Godot pixel roguelike", group: "godot", description: "Godot 2D pixel roguelike with procedural generation, combat, inventory, enemies and save persistence." },
  { id: "godot-racing", label: "Godot racing", group: "godot", description: "Godot 3D stylized racing game with cars, driving system, road environment, UI, sound effects and music." },
  { id: "godot-tower-defense", label: "Godot tower defense", group: "godot", description: "Godot 2D cartoon tower defense game with enemy AI, combat, UI, icons, save system and fantasy environment." },
  { id: "godot-horror-adventure", label: "Godot horror adventure", group: "godot", description: "Godot 3D horror adventure with realistic environment, characters, dialogue, AI, save system, ambient audio and shaders." },

  { id: "phaser-pixel-platformer", label: "Phaser pixel platformer", group: "phaser", description: "Phaser 2D pixel platformer with characters, combat, UI, sound effects, music and save persistence." },
  { id: "phaser-topdown-shooter", label: "Phaser top-down shooter", group: "phaser", description: "Phaser 2D top-down shooter with weapons, combat, enemy AI, UI, audio and save system." },
  { id: "phaser-tower-defense", label: "Phaser tower defense", group: "phaser", description: "Phaser browser tower defense with enemy AI, combat, UI, icons and fantasy environment." },
  { id: "phaser-multiplayer-arena", label: "Phaser multiplayer arena", group: "phaser", description: "Phaser 2D multiplayer arena shooter with networking, combat, weapons, characters and UI." },
  { id: "phaser-rpg", label: "Phaser web RPG", group: "phaser", description: "Phaser browser RPG with characters, inventory, dialogue, combat, save system and fantasy environment." },
  { id: "phaser-casual-puzzle", label: "Phaser casual puzzle", group: "phaser", description: "Phaser 2D casual puzzle game with clean UI, icons, sound effects, music and save persistence." },

  { id: "raylib-platformer", label: "Raylib platformer", group: "raylib", description: "raylib 2D platformer with characters, combat, UI, sound effects and save system." },
  { id: "raylib-arcade-shooter", label: "Raylib arcade shooter", group: "raylib", description: "raylib 2D retro arcade shooter with combat, weapons, enemy AI, sound effects and UI." },
  { id: "raylib-maze-3d", label: "Raylib 3D maze", group: "raylib", description: "raylib 3D retro maze adventure with environment, enemy AI, save system and ambient audio." },
  { id: "raylib-racing", label: "Raylib racing", group: "raylib", description: "raylib 3D racing game with vehicles, driving system, road environment, UI, audio and save system." },
  { id: "raylib-roguelike", label: "Raylib roguelike", group: "raylib", description: "raylib 2D roguelike with procedural generation, combat, inventory, enemy AI and save system." },
  { id: "raylib-space-game", label: "Raylib space game", group: "raylib", description: "raylib 2D space shooter with combat, weapons, space environment, AI, UI and sound effects." },

  { id: "unity-lowpoly-survival", label: "Unity low-poly survival", group: "unity", description: "Unity 3D low-poly survival game with characters, inventory, combat, enemy AI, save system and networking." },
  { id: "unity-fps", label: "Unity FPS", group: "unity", description: "Unity 3D realistic FPS with weapons, combat, enemy AI, networking, UI, sound effects and shaders." },
  { id: "unity-mobile-rpg", label: "Unity mobile RPG", group: "unity", description: "Unity 2D mobile fantasy RPG with inventory, dialogue, combat, save system, UI and characters." },
  { id: "unity-multiplayer-racing", label: "Unity multiplayer racing", group: "unity", description: "Unity 3D multiplayer racing game with cars, driving, networking, road environment, UI and audio." },

  { id: "unreal-scifi-fps", label: "Unreal sci-fi FPS", group: "unreal", description: "Unreal Engine 3D sci-fi FPS with weapons, combat, AI, multiplayer networking, shaders and space environment." },
  { id: "unreal-survival", label: "Unreal survival", group: "unreal", description: "Unreal Engine 3D realistic survival game with inventory, combat, enemy AI, save system, characters and environment." },
  { id: "unreal-driving", label: "Unreal driving", group: "unreal", description: "Unreal Engine 3D driving game with vehicles, roads, vehicle system, UI, audio and save system." },
  { id: "unreal-horror", label: "Unreal horror", group: "unreal", description: "Unreal Engine 3D horror adventure with realistic environment, characters, enemy AI, dialogue, save system and ambience." },

  { id: "generic-anime-rpg", label: "Anime RPG", group: "generic", description: "2D anime RPG with characters, fantasy environment, inventory, combat, dialogue, UI, music and Chinese font support." },
  { id: "generic-cyberpunk-city", label: "Cyberpunk city action", group: "generic", description: "3D cyberpunk city action game with vehicles, characters, weapons, combat, UI, shaders and electronic music." },
  { id: "generic-medieval-strategy", label: "Medieval strategy", group: "generic", description: "3D medieval strategy game with buildings, characters, enemy AI, UI, icons, save system and music." },
  { id: "generic-horror-2d", label: "2D horror", group: "generic", description: "2D horror adventure with characters, dialogue, save system, dark environment, ambient audio and UI." },
  { id: "generic-space-exploration", label: "Space exploration", group: "generic", description: "3D space exploration game with spacecraft, space environment, procedural generation, UI, ambient audio and save system." },
  { id: "generic-cjk-casual", label: "CJK casual game", group: "generic", description: "2D casual mobile game with cartoon UI, icons, sound effects, music and Chinese CJK fonts." },
  { id: "generic-voxel-procgen", label: "Voxel procgen", group: "generic", description: "3D voxel procedural survival game with world generation, inventory, combat, enemy AI and save persistence." },
  { id: "generic-city-builder", label: "City builder", group: "generic", description: "3D stylized city builder with roads, buildings, UI, icons, save system, procedural placement and ambient music." },
  { id: "generic-card-battler", label: "Card battler", group: "generic", description: "2D fantasy card battler with UI, icons, combat, characters, sound effects, music and save progression." },
  { id: "generic-farming-sim", label: "Farming sim", group: "generic", description: "2D pixel farming simulation with characters, inventory, dialogue, save system, nature environment, UI and music." },
  { id: "generic-tactical-military", label: "Tactical military", group: "generic", description: "3D military tactical game with weapons, characters, enemy AI, combat, networking, realistic environment and UI." }
];

export const COVERAGE_SMOKE_SCENARIO_IDS = [
  "godot-pixel-road-survival",
  "godot-fantasy-rpg",
  "phaser-pixel-platformer",
  "phaser-multiplayer-arena",
  "raylib-platformer",
  "raylib-racing",
  "unity-lowpoly-survival",
  "unity-fps",
  "unreal-scifi-fps",
  "unreal-survival",
  "generic-anime-rpg",
  "generic-cyberpunk-city"
] as const;
