import { searchAllAssets, type ProviderSearchError, type RankedAsset } from "./search.js";
import type { AssetDimension, AssetProviderId } from "./providers/types.js";

export type StackSlotId =
  | "starter"
  | "environment"
  | "vehicle"
  | "character"
  | "weapon"
  | "ui"
  | "icons"
  | "sfx"
  | "music"
  | "font"
  | "shader"
  | "vehicle-system"
  | "inventory-system"
  | "combat-system"
  | "networking"
  | "save-system"
  | "ai-system"
  | "procedural-generation"
  | "dialogue-system";

export interface RecommendStackOptions {
  description: string;
  engine?: string;
  dimension?: "2D" | "3D";
  styles?: string[];
  gameGenres?: string[];
  providers?: AssetProviderId[];
  commercialOnly?: boolean;
  allowAttribution?: boolean;
  allowShareAlike?: boolean;
  perSlotLimit?: number;
}

export interface StackSlotPlan {
  id: StackSlotId;
  label: string;
  required: boolean;
  rationale: string;
  queries: string[];
  providers: AssetProviderId[];
  dimensions?: AssetDimension[];
}

export interface StackSlotRecommendation {
  slot: StackSlotPlan;
  queryUsed: string;
  primary?: RankedAsset;
  alternatives: RankedAsset[];
  providerErrors: ProviderSearchError[];
  gap?: string;
}

export interface StackLicenseSummary {
  licenses: Record<string, number>;
  risks: Record<string, number>;
  attributionRequired: Array<{ slot: StackSlotId; name: string; license: string }>;
  serviceCredits: Array<{ slot: StackSlotId; name: string; provider: AssetProviderId }>;
}

export interface StackRecommendationResult {
  inferred: {
    engine?: string;
    dimension?: "2D" | "3D";
    styles: string[];
    gameGenres: string[];
    themes: string[];
  };
  complete: boolean;
  requiredGaps: StackSlotId[];
  recommendations: StackSlotRecommendation[];
  licenseSummary: StackLicenseSummary;
  notes: string[];
}

const STYLE_KEYWORDS: Array<[string, string[]]> = [
  ["pixel", ["pixel", "像素"]],
  ["cartoon", ["cartoon", "卡通"]],
  ["low-poly", ["low poly", "low-poly", "低多边形", "低模"]],
  ["sci-fi", ["sci-fi", "scifi", "science fiction", "科幻"]],
  ["medieval", ["medieval", "中世纪"]],
  ["fantasy", ["fantasy", "奇幻", "魔幻"]],
  ["horror", ["horror", "恐怖"]],
  ["military", ["military", "军事", "军用"]],
  ["retro", ["retro", "复古"]],
  ["stylized", ["stylized", "风格化"]],
  ["realistic", ["realistic", "写实"]]
];

const GENRE_KEYWORDS: Array<[string, string[]]> = [
  ["survival", ["survival", "生存", "求生"]],
  ["rpg", ["rpg", "role-playing", "角色扮演"]],
  ["roguelike", ["roguelike", "肉鸽", "类rogue", "类 rogue"]],
  ["racing", ["racing", "赛车", "竞速"]],
  ["shooter", ["shooter", "shooting", "射击"]],
  ["platformer", ["platformer", "平台跳跃", "横版"]],
  ["tower-defense", ["tower defense", "塔防"]],
  ["adventure", ["adventure", "冒险"]],
  ["strategy", ["strategy", "策略"]]
];

const THEME_KEYWORDS: Array<[string, string[]]> = [
  ["road", ["road", "highway", "公路", "道路"]],
  ["vehicle", ["vehicle", "car", "truck", "driving", "车辆", "汽车", "卡车", "驾驶"]],
  ["combat", ["combat", "weapon", "gun", "battle", "战斗", "武器", "枪", "枪械"]],
  ["character", ["character", "player", "hero", "角色", "人物", "主角"]],
  ["inventory", ["inventory", "loot", "crafting", "背包", "物资", "搜刮", "制作"]],
  ["networking", ["multiplayer", "networking", "networked", "pvp", "pve", "联机", "联网", "多人", "服务器", "同步"]],
  ["save", ["save system", "save game", "persistence", "persistent", "存档", "持久化"]],
  ["ai", ["enemy ai", "npc ai", "artificial intelligence", "behavior tree", "behaviour tree", "敌人ai", "敌人 ai", "npc ai", "行为树"]],
  ["procedural", ["procedural", "procgen", "procedural generation", "程序化", "随机生成", "地图生成"]],
  ["dialogue", ["dialogue", "dialog system", "conversation system", "对话系统", "对话", "剧情系统"]],
  ["nature", ["nature", "forest", "vegetation", "自然", "森林", "植被"]],
  ["space", ["space", "spaceship", "太空", "宇宙", "飞船"]],
  ["cjk", ["cjk", "chinese", "中文", "汉字", "简体中文", "繁体中文"]]
];

function normalized(input: string): string {
  return input.toLowerCase().replace(/[，。；：、]/g, " ");
}

function includesAny(text: string, terms: string[]): boolean {
  return terms.some(term => text.includes(term.toLowerCase()));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function inferMapped(text: string, mappings: Array<[string, string[]]>): string[] {
  return mappings.filter(([, keywords]) => includesAny(text, keywords)).map(([value]) => value);
}

function inferEngine(text: string, explicit?: string): string | undefined {
  if (explicit?.trim()) return explicit.trim().toLowerCase();
  if (includesAny(text, ["godot"])) return "godot";
  if (includesAny(text, ["phaser"])) return "phaser";
  if (includesAny(text, ["unity"])) return "unity";
  if (includesAny(text, ["unreal", "ue5", "虚幻"])) return "unreal";
  if (includesAny(text, ["web game", "browser game", "网页游戏", "html5"])) return "web";
  return undefined;
}

function inferDimension(text: string, explicit?: "2D" | "3D"): "2D" | "3D" | undefined {
  if (explicit) return explicit;
  if (includesAny(text, ["3d", "三维", "3维", "low-poly", "low poly", "低模", "低多边形"])) return "3D";
  if (includesAny(text, ["2d", "二维", "2维", "pixel", "像素", "sprite", "精灵图"])) return "2D";
  return undefined;
}

function artProviders(dimension: "2D" | "3D" | undefined): AssetProviderId[] {
  if (dimension === "2D") return ["kenney"];
  if (dimension === "3D") return ["quaternius", "kaykit", "kenney", "polyhaven", "ambientcg"];
  return ["kenney", "quaternius", "kaykit", "polyhaven", "ambientcg"];
}

function environmentProviders(dimension: "2D" | "3D" | undefined): AssetProviderId[] {
  const base = artProviders(dimension);
  return dimension === "2D" || dimension === undefined ? [...base, "openverse"] : base;
}

function codeProviders(engine: string | undefined): AssetProviderId[] {
  return engine === "godot" ? ["godotassetlib", "githubcode"] : ["githubcode"];
}

function filterAllowedProviders(slotProviders: AssetProviderId[], requested?: AssetProviderId[]): AssetProviderId[] {
  if (!requested?.length) return slotProviders;
  return slotProviders.filter(provider => requested.includes(provider));
}

function buildQueries(base: string, styles: string[], genres: string[], theme?: string): string[] {
  const strongestStyle = styles[0];
  const strongestGenre = genres[0];
  return unique([
    [strongestStyle, theme, base].filter(Boolean).join(" "),
    [strongestGenre, theme, base].filter(Boolean).join(" "),
    [theme, base].filter(Boolean).join(" "),
    theme ?? "",
    [strongestStyle, base].filter(Boolean).join(" "),
    base
  ]);
}

function buildCodeQueries(feature: string, engine?: string): string[] {
  return unique([
    [engine, feature, "system"].filter(Boolean).join(" "),
    [engine, feature, "plugin"].filter(Boolean).join(" "),
    [engine, feature, "addon"].filter(Boolean).join(" "),
    [feature, "game system"].join(" "),
    [feature, "library"].join(" "),
    feature
  ]);
}

export function buildStackPlan(options: RecommendStackOptions): {
  inferred: StackRecommendationResult["inferred"];
  slots: StackSlotPlan[];
} {
  const text = normalized(options.description);
  const engine = inferEngine(text, options.engine);
  const dimension = inferDimension(text, options.dimension);
  const styles = unique([...(options.styles ?? []).map(value => value.toLowerCase()), ...inferMapped(text, STYLE_KEYWORDS)]);
  const gameGenres = unique([...(options.gameGenres ?? []).map(value => value.toLowerCase()), ...inferMapped(text, GENRE_KEYWORDS)]);
  const themes = inferMapped(text, THEME_KEYWORDS);

  const slots: StackSlotPlan[] = [];
  const add = (slot: StackSlotPlan) => slots.push({ ...slot, providers: filterAllowedProviders(slot.providers, options.providers) });
  const artDims: AssetDimension[] | undefined = dimension ? [dimension] : undefined;
  const gameplayCodeProviders = codeProviders(engine);

  if (engine) {
    const providers: AssetProviderId[] = engine === "godot" ? ["godotassetlib", "godotdemos"] : engine === "phaser" || engine === "web" ? ["phaser"] : [];
    const starterQuery = engine === "godot" && dimension ? `${engine} ${dimension.toLowerCase()} starter` : `${engine} starter`;
    add({ id: "starter", label: "Starter / framework", required: true, rationale: `A ${engine} project needs a reusable starting point or implementation reference.`, queries: unique([starterQuery, `${engine} starter`, `${engine} template`, `${engine} code`]), providers, dimensions: ["code"] });
  }

  const environmentTheme = themes.includes("road") ? "road" : themes.includes("nature") ? "nature" : themes.includes("space") ? "space" : undefined;
  add({ id: "environment", label: "Environment", required: true, rationale: "Core world/environment art is needed for a coherent playable scene.", queries: buildQueries("environment", styles, gameGenres, environmentTheme), providers: environmentProviders(dimension), dimensions: artDims });

  if (themes.includes("vehicle") || gameGenres.includes("racing")) {
    add({ id: "vehicle", label: "Vehicles", required: true, rationale: "The game description explicitly depends on vehicles/driving.", queries: buildQueries("vehicle", styles, gameGenres), providers: artProviders(dimension), dimensions: artDims });
    add({ id: "vehicle-system", label: "Vehicle / driving system", required: true, rationale: "Vehicle gameplay needs reusable driving or vehicle-controller code, not only vehicle art.", queries: buildCodeQueries("vehicle driving", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("character") || gameGenres.some(genre => ["rpg", "platformer", "survival", "shooter", "adventure"].includes(genre))) {
    add({ id: "character", label: "Characters", required: true, rationale: "The described gameplay implies visible player/NPC characters.", queries: buildQueries("character", styles, gameGenres), providers: artProviders(dimension), dimensions: artDims });
  }

  if (themes.includes("combat") || gameGenres.includes("shooter")) {
    add({ id: "weapon", label: "Weapons / combat art", required: true, rationale: "Combat is explicitly present in the game description.", queries: buildQueries("weapon", styles, gameGenres), providers: artProviders(dimension), dimensions: artDims });
    add({ id: "combat-system", label: "Combat system", required: true, rationale: "Combat requires reusable gameplay code for damage, weapons or combat flow.", queries: buildCodeQueries("combat weapon", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("inventory")) {
    add({ id: "inventory-system", label: "Inventory / loot system", required: true, rationale: "Loot, inventory or crafting is explicitly present in the game description.", queries: buildCodeQueries("inventory loot", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("networking")) {
    add({ id: "networking", label: "Networking / multiplayer", required: true, rationale: "The game explicitly requires multiplayer or network synchronization.", queries: buildCodeQueries("multiplayer networking", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("save")) {
    add({ id: "save-system", label: "Save / persistence system", required: true, rationale: "Persistent progress or save-game behavior is explicitly requested.", queries: buildCodeQueries("save persistence", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("ai")) {
    add({ id: "ai-system", label: "Enemy / NPC AI", required: true, rationale: "Enemy or NPC behavior is explicitly part of the game design.", queries: buildCodeQueries("enemy npc ai", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("procedural")) {
    add({ id: "procedural-generation", label: "Procedural generation", required: true, rationale: "Procedural or random world/content generation is explicitly requested.", queries: buildCodeQueries("procedural generation", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  if (themes.includes("dialogue")) {
    add({ id: "dialogue-system", label: "Dialogue / conversation system", required: true, rationale: "Dialogue or narrative conversation tooling is explicitly requested.", queries: buildCodeQueries("dialogue conversation", engine), providers: gameplayCodeProviders, dimensions: ["code"] });
  }

  add({ id: "ui", label: "UI", required: true, rationale: "A production game needs menus, panels and HUD elements.", queries: buildQueries("ui", styles, gameGenres), providers: ["kenney", "gameicons", "tablericons"], dimensions: ["2D"] });

  const iconTheme = themes.includes("vehicle") ? "vehicle" : themes.includes("combat") ? "combat" : themes.includes("inventory") || gameGenres.includes("survival") ? "resource" : gameGenres.includes("rpg") ? "rpg" : undefined;
  add({ id: "icons", label: "Icons", required: false, rationale: "Icons improve HUD, inventory, skills and status communication.", queries: buildQueries("icon", [], gameGenres, iconTheme), providers: ["gameicons", "tablericons", "kenney"], dimensions: ["2D"] });

  const sfxTheme = styles.includes("sci-fi") ? "sci-fi" : themes.includes("combat") ? "impact" : "interface";
  add({ id: "sfx", label: "Sound effects", required: true, rationale: "Interaction and gameplay feedback require sound effects.", queries: unique([`${sfxTheme} sounds`, "game sound effect", "sounds", "audio"]), providers: ["kenney", "openverse"], dimensions: ["audio"] });

  add({ id: "music", label: "Music / jingles", required: false, rationale: "Music is optional for a first playable build but useful for presentation and pacing.", queries: unique([[styles[0], gameGenres[0], "game music"].filter(Boolean).join(" "), "game music", "music", "jingle"]), providers: ["kenney", "openverse"], dimensions: ["audio"] });

  const fontTheme = themes.includes("cjk") ? "cjk" : undefined;
  add({ id: "font", label: "Font", required: true, rationale: "A distributable game should use a font with explicit embedding/redistribution terms.", queries: buildQueries("font", styles, gameGenres, fontTheme), providers: ["googlefonts"], dimensions: ["font"] });

  if (engine === "godot" && (styles.includes("sci-fi") || dimension === "3D")) {
    add({ id: "shader", label: "Shader / GPU examples", required: false, rationale: "Godot 3D or sci-fi presentation can benefit from official/community shader and compute resources with explicit licenses.", queries: ["shader", "compute", "visual effect"], providers: ["godotassetlib", "godotdemos"], dimensions: ["code"] });
  }

  return { inferred: { engine, dimension, styles, gameGenres, themes }, slots };
}

async function searchSlot(slot: StackSlotPlan, options: RecommendStackOptions): Promise<StackSlotRecommendation> {
  if (slot.providers.length === 0) {
    return { slot, queryUsed: slot.queries[0] ?? "", alternatives: [], providerErrors: [], gap: "No currently supported provider matches this slot/engine constraint." };
  }

  const errors: ProviderSearchError[] = [];
  const limit = Math.max(1, Math.min(options.perSlotLimit ?? 3, 10));
  let lastQuery = slot.queries[0] ?? "";

  for (const query of slot.queries) {
    lastQuery = query;
    const result = await searchAllAssets({
      query,
      providers: slot.providers,
      dimensions: slot.dimensions,
      commercialOnly: options.commercialOnly ?? true,
      allowAttribution: options.allowAttribution ?? true,
      allowShareAlike: options.allowShareAlike ?? false,
      limit,
      perProviderLimit: Math.max(limit * 3, 10)
    });
    errors.push(...result.errors);
    if (result.results.length > 0) {
      return {
        slot,
        queryUsed: query,
        primary: result.results[0],
        alternatives: result.results.slice(1, limit),
        providerErrors: errors
      };
    }
  }

  return {
    slot,
    queryUsed: lastQuery,
    alternatives: [],
    providerErrors: errors,
    gap: "No result passed the current provider, metadata and license filters."
  };
}

function summarizeLicenses(recommendations: StackSlotRecommendation[]): StackLicenseSummary {
  const licenses: Record<string, number> = {};
  const risks: Record<string, number> = {};
  const attributionRequired: StackLicenseSummary["attributionRequired"] = [];
  const serviceCredits: StackLicenseSummary["serviceCredits"] = [];

  for (const recommendation of recommendations) {
    const asset = recommendation.primary;
    if (!asset) continue;
    licenses[asset.license] = (licenses[asset.license] ?? 0) + 1;
    risks[asset.licenseRisk] = (risks[asset.licenseRisk] ?? 0) + 1;
    if (asset.attribution === true) attributionRequired.push({ slot: recommendation.slot.id, name: asset.name, license: asset.license });
    if (asset.apiAttributionRequired) serviceCredits.push({ slot: recommendation.slot.id, name: asset.name, provider: asset.provider });
  }

  return { licenses, risks, attributionRequired, serviceCredits };
}

export async function recommendStack(options: RecommendStackOptions): Promise<StackRecommendationResult> {
  const { inferred, slots } = buildStackPlan(options);
  const recommendations = await Promise.all(slots.map(slot => searchSlot(slot, options)));
  const requiredGaps = recommendations.filter(item => item.slot.required && !item.primary).map(item => item.slot.id);

  const notes = [
    "Recommendations are retrieval results, not legal clearance. Verify original license/provenance before shipping.",
    "Only primary recommendations are counted in the license summary; alternatives retain their own license metadata.",
    "Automatic installation is a separate explicit step and remains limited to providers with a verified acquisition path.",
    "Openverse results retain per-item creator/source/license metadata; do not treat Openverse itself as the asset licensor.",
    "ambientCG search uses the current v3 API and treats ambientCG assets as CC0 according to the provider license page.",
    "KayKit official pack repositories are treated as CC0 based on the official asset collection/license files; individual repository provenance is retained.",
    "GitHub code results use repository-level detected SPDX licenses only; dependencies and bundled media require separate license review.",
    "When reliable provider metadata exists, popularity and update freshness are small ranking signals; they never override license filtering."
  ];
  if (inferred.engine && !["godot", "phaser", "web"].includes(inferred.engine)) {
    notes.push(`No verified starter provider is currently registered for engine '${inferred.engine}', so the starter slot may remain unresolved.`);
  }

  return {
    inferred,
    complete: requiredGaps.length === 0,
    requiredGaps,
    recommendations,
    licenseSummary: summarizeLicenses(recommendations),
    notes
  };
}