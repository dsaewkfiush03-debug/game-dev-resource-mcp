import type { AssetDimension, AssetProviderId } from "./providers/types.js";

export interface ProviderCapability {
  provider: AssetProviderId;
  dimensions: AssetDimension[];
  strengths: string[];
  engines: string[];
  notes: string;
}

export const PROVIDER_CAPABILITIES: Record<AssetProviderId, ProviderCapability> = {
  polyhaven: { provider: "polyhaven", dimensions: ["3D"], strengths: ["pbr", "textures", "hdri", "models", "environment"], engines: ["generic"], notes: "CC0 PBR/HDRI/3D source." },
  ambientcg: { provider: "ambientcg", dimensions: ["3D"], strengths: ["pbr", "materials", "terrain", "decals", "hdri", "environment"], engines: ["generic"], notes: "CC0 materials/environment source." },
  githubcode: { provider: "githubcode", dimensions: ["code"], strengths: ["code", "systems", "frameworks", "starters", "plugins"], engines: ["generic", "godot", "unity", "unreal", "phaser", "raylib", "bevy", "urhox", "love2d", "defold"], notes: "Live GitHub repository discovery with repository-level SPDX screening." },
  kaykit: { provider: "kaykit", dimensions: ["3D"], strengths: ["low-poly", "stylized", "characters", "environment", "props"], engines: ["generic"], notes: "Official KayKit CC0 pack repositories." },
  kenney: { provider: "kenney", dimensions: ["2D", "3D", "audio"], strengths: ["2d", "3d", "ui", "vehicles", "tower-defense", "platformer", "rpg", "sfx"], engines: ["generic"], notes: "Verified CC0 game-focused catalog." },
  quaternius: { provider: "quaternius", dimensions: ["3D"], strengths: ["low-poly", "stylized", "characters", "vehicles", "weapons", "city", "environment"], engines: ["generic"], notes: "Verified CC0 low-poly/stylized 3D packs." },
  godotdemos: { provider: "godotdemos", dimensions: ["code"], strengths: ["starter", "complete-demo", "gameplay-systems"], engines: ["godot"], notes: "Official Godot demos with maintained reuse metadata." },
  gameicons: { provider: "gameicons", dimensions: ["2D"], strengths: ["icons", "ui", "skills", "items", "combat"], engines: ["generic"], notes: "Per-icon SVG index with CC BY attribution metadata." },
  tablericons: { provider: "tablericons", dimensions: ["2D"], strengths: ["icons", "ui", "interface"], engines: ["generic"], notes: "Large MIT SVG icon index." },
  phaser: { provider: "phaser", dimensions: ["code"], strengths: ["starter", "web", "2d-code"], engines: ["phaser", "web"], notes: "Verified official Phaser starter templates." },
  raylib: { provider: "raylib", dimensions: ["code"], strengths: ["starter", "complete-game", "c"], engines: ["raylib"], notes: "Verified raylib template and game references." },
  communitystarters: { provider: "communitystarters", dimensions: ["code"], strengths: ["starter", "template", "framework"], engines: ["unity", "unreal"], notes: "Conservatively verified Unity/Unreal community starters." },
  googlefonts: { provider: "googlefonts", dimensions: ["font"], strengths: ["font", "cjk", "pixel", "scifi", "fantasy", "horror"], engines: ["generic"], notes: "Curated fonts with per-font license evidence." },
  openverse: { provider: "openverse", dimensions: ["2D", "audio"], strengths: ["images", "audio", "music", "sound"], engines: ["generic"], notes: "Large open-media discovery source with per-item license metadata." },
  godotassetlib: { provider: "godotassetlib", dimensions: ["code"], strengths: ["plugin", "addon", "starter", "shader", "systems"], engines: ["godot"], notes: "Official Godot Asset Library API." }
};

export function providerSupportsDimensions(provider: AssetProviderId, dimensions: AssetDimension[] | undefined): boolean {
  if (!dimensions?.length) return true;
  return dimensions.some(dimension => PROVIDER_CAPABILITIES[provider].dimensions.includes(dimension));
}

export function canonicalEngine(engine: string): string {
  const normalized = engine.toLowerCase().trim();
  if (["urho", "urho3d", "urhox", "tapmaker"].includes(normalized)) return "urhox";
  if (["love", "love2d", "löve"].includes(normalized)) return "love2d";
  if (["ue", "ue5", "unrealengine", "unreal engine"].includes(normalized)) return "unreal";
  return normalized;
}

export function providerSupportsEngines(provider: AssetProviderId, engines: string[] | undefined): boolean {
  if (!engines?.length) return true;
  const supported = PROVIDER_CAPABILITIES[provider].engines.map(canonicalEngine);
  if (supported.includes("generic")) return true;
  return engines.map(canonicalEngine).some(engine => supported.includes(engine));
}

export function listProviderCapabilities(): ProviderCapability[] {
  return Object.values(PROVIDER_CAPABILITIES);
}
