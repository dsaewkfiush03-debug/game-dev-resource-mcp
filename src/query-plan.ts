export type SearchConceptRole = "subject" | "modifier" | "system";

export interface SearchConceptDefinition {
  id: string;
  priority: number;
  role: SearchConceptRole;
  triggers: string[];
  expansions: string[];
}

export interface SearchConceptMatch {
  id: string;
  priority: number;
  role: SearchConceptRole;
  matched: string[];
  expansions: string[];
}

export interface SearchQueryVariant {
  query: string;
  reason: string;
  level: "exact" | "semantic" | "broad";
}

export interface SearchQueryPlan {
  originalQuery: string;
  normalizedQuery: string;
  concepts: SearchConceptMatch[];
  variants: SearchQueryVariant[];
  suggestions: string[];
}

const CONCEPTS: SearchConceptDefinition[] = [
  {
    id: "turret",
    priority: 100,
    role: "subject",
    triggers: ["turret", "炮塔", "机枪塔", "防御塔"],
    expansions: ["turret", "cannon", "artillery", "sentry", "defense tower", "gun emplacement", "tank turret", "tank"]
  },
  {
    id: "weapon",
    priority: 80,
    role: "subject",
    triggers: ["weapon", "gun", "rifle", "cannon", "枪", "武器", "火炮"],
    expansions: ["weapon", "gun", "cannon", "rifle", "blaster", "artillery"]
  },
  {
    id: "enemy",
    priority: 78,
    role: "subject",
    triggers: ["enemy", "hostile", "monster", "creature", "zombie", "敌人", "敌军", "怪物", "僵尸"],
    expansions: ["enemy", "monster", "creature", "robot", "zombie", "hostile", "opponent"]
  },
  {
    id: "vehicle",
    priority: 80,
    role: "subject",
    triggers: ["vehicle", "car", "truck", "tank", "车辆", "汽车", "卡车", "坦克"],
    expansions: ["vehicle", "car", "truck", "tank", "armored vehicle", "rover"]
  },
  {
    id: "character",
    priority: 76,
    role: "subject",
    triggers: ["character", "player", "hero", "npc", "角色", "人物", "主角"],
    expansions: ["character", "hero", "player", "npc", "human", "soldier"]
  },
  {
    id: "environment",
    priority: 68,
    role: "subject",
    triggers: ["environment", "world", "map", "terrain", "scene", "环境", "场景", "地图", "地形"],
    expansions: ["environment", "terrain", "world", "map", "level", "scenery"]
  },
  {
    id: "building",
    priority: 70,
    role: "subject",
    triggers: ["building", "buildings", "house", "houses", "structure", "architecture", "village", "建筑", "房屋", "村庄"],
    expansions: ["building", "house", "structure", "architecture", "village", "modular building"]
  },
  {
    id: "road",
    priority: 72,
    role: "subject",
    triggers: ["road", "roads", "highway", "street", "道路", "公路", "街道"],
    expansions: ["road", "street", "highway", "asphalt", "road kit", "street props"]
  },
  {
    id: "loot",
    priority: 74,
    role: "subject",
    triggers: ["loot", "pickup", "pickups", "resource", "resources", "chest", "drop", "掉落", "战利品", "拾取物", "资源"],
    expansions: ["loot", "pickup", "item", "resource", "chest", "collectible"]
  },
  {
    id: "spaceship",
    priority: 82,
    role: "subject",
    triggers: ["spaceship", "space ship", "spacecraft", "starship", "飞船", "宇宙飞船"],
    expansions: ["spaceship", "spacecraft", "starship", "space ship", "sci-fi ship", "fighter ship"]
  },
  {
    id: "ui",
    priority: 72,
    role: "system",
    triggers: ["ui", "hud", "interface", "menu", "界面", "菜单"],
    expansions: ["ui", "hud", "interface", "menu", "panel"]
  },
  {
    id: "icon",
    priority: 68,
    role: "system",
    triggers: ["icon", "icons", "图标"],
    expansions: ["icon", "icons", "symbol", "glyph"]
  },
  {
    id: "audio",
    priority: 68,
    role: "system",
    triggers: ["sfx", "sound effect", "sound", "audio", "音效", "声音"],
    expansions: ["sound effect", "sfx", "audio", "impact", "interface sound"]
  },
  {
    id: "music",
    priority: 68,
    role: "system",
    triggers: ["music", "bgm", "soundtrack", "音乐", "背景音乐"],
    expansions: ["music", "bgm", "soundtrack", "jingle", "ambient music"]
  },
  {
    id: "font",
    priority: 68,
    role: "system",
    triggers: ["font", "typeface", "字体"],
    expansions: ["font", "typeface"]
  },
  {
    id: "inventory",
    priority: 82,
    role: "system",
    triggers: ["inventory", "backpack", "item system", "背包", "物品栏", "搜刮"],
    expansions: ["inventory", "item system", "loot system", "backpack"]
  },
  {
    id: "combat",
    priority: 82,
    role: "system",
    triggers: ["combat", "damage", "battle", "战斗", "伤害"],
    expansions: ["combat", "damage", "battle", "weapon system"]
  },
  {
    id: "ai",
    priority: 82,
    role: "system",
    triggers: ["enemy ai", "npc ai", "behavior tree", "behaviour tree", "人工智能", "行为树", "敌人ai", "敌人 ai"],
    expansions: ["behavior tree", "ai", "enemy ai", "npc ai", "finite state machine", "fsm"]
  },
  {
    id: "networking",
    priority: 82,
    role: "system",
    triggers: ["networking", "multiplayer", "pvp", "netcode", "联网", "联机", "多人"],
    expansions: ["multiplayer", "networking", "netcode", "replication", "client server"]
  },
  {
    id: "save",
    priority: 76,
    role: "system",
    triggers: ["save system", "save game", "persistence", "存档", "持久化"],
    expansions: ["save", "persistence", "save game", "serialization"]
  },
  {
    id: "procedural",
    priority: 76,
    role: "system",
    triggers: ["procedural", "procgen", "procedural generation", "程序化", "随机生成"],
    expansions: ["procedural generation", "procgen", "random generation", "level generation"]
  },
  {
    id: "dialogue",
    priority: 72,
    role: "system",
    triggers: ["dialogue", "conversation", "对话", "剧情"],
    expansions: ["dialogue", "conversation", "dialog system", "narrative"]
  },
  {
    id: "tower-defense",
    priority: 58,
    role: "modifier",
    triggers: ["tower defense", "tower-defense", "塔防", "defense game"],
    expansions: ["tower defense", "defense", "fortress", "fortification", "defensive"]
  },
  {
    id: "low-poly",
    priority: 45,
    role: "modifier",
    triggers: ["low poly", "low-poly", "lowpoly", "低多边形", "低模"],
    expansions: ["low poly", "low-poly", "stylized", "lowpoly"]
  },
  {
    id: "cyberpunk",
    priority: 62,
    role: "modifier",
    triggers: ["cyberpunk", "cyber punk", "赛博朋克"],
    expansions: ["cyberpunk", "cyber punk", "neon sci-fi", "futuristic city"]
  },
  {
    id: "sci-fi",
    priority: 60,
    role: "modifier",
    triggers: ["sci-fi", "sci fi", "science fiction", "科幻"],
    expansions: ["sci-fi", "science fiction", "futuristic", "space"]
  },
  {
    id: "fantasy",
    priority: 58,
    role: "modifier",
    triggers: ["fantasy", "magic", "magical", "魔法", "奇幻"],
    expansions: ["fantasy", "magic", "medieval fantasy", "spell", "enchanted"]
  },
  {
    id: "medieval",
    priority: 58,
    role: "modifier",
    triggers: ["medieval", "middle ages", "中世纪"],
    expansions: ["medieval", "village", "castle", "knight", "fantasy medieval"]
  },
  {
    id: "post-apocalyptic",
    priority: 60,
    role: "modifier",
    triggers: ["post apocalyptic", "post-apocalyptic", "apocalypse", "wasteland", "末日", "废土"],
    expansions: ["apocalypse", "wasteland", "ruined city", "survival", "zombie"]
  },
  {
    id: "urban",
    priority: 54,
    role: "modifier",
    triggers: ["urban", "city", "downtown", "modern city", "都市", "城市"],
    expansions: ["urban", "city", "downtown", "street", "modern"]
  },
  {
    id: "nature",
    priority: 54,
    role: "modifier",
    triggers: ["nature", "forest", "vegetation", "woods", "自然", "森林", "植被"],
    expansions: ["nature", "forest", "vegetation", "tree", "plant"]
  },
  {
    id: "dungeon",
    priority: 56,
    role: "modifier",
    triggers: ["dungeon", "ruins", "cave", "地牢", "遗迹", "洞穴"],
    expansions: ["dungeon", "ruins", "cave", "underground", "modular ruins"]
  }
];

const NOISE_TOKENS = new Set([
  "2d", "3d", "asset", "assets", "pack", "game", "games", "for", "with", "and", "the", "a", "an"
]);

export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[，。；：、]/g, " ")
    .replace(/[_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function phrasePresent(text: string, phrase: string): boolean {
  return text.includes(normalizeSearchText(phrase));
}

export function detectSearchConcepts(query: string): SearchConceptMatch[] {
  const normalized = normalizeSearchText(query);
  return CONCEPTS
    .map(definition => {
      const matched = definition.triggers.filter(trigger => phrasePresent(normalized, trigger));
      if (matched.length === 0) return undefined;
      return {
        id: definition.id,
        priority: definition.priority,
        role: definition.role,
        matched,
        expansions: definition.expansions
      } satisfies SearchConceptMatch;
    })
    .filter((value): value is SearchConceptMatch => Boolean(value))
    .sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

function fallbackTokens(query: string): string[] {
  return Array.from(new Set(
    normalizeSearchText(query)
      .split(/\s+/)
      .filter(Boolean)
      .filter(token => !NOISE_TOKENS.has(token))
      .filter(token => token.length >= 3)
  ));
}

export function semanticExpansionTerms(query: string): Array<{ concept: string; terms: string[] }> {
  return detectSearchConcepts(query).map(match => ({ concept: match.id, terms: match.expansions }));
}

export function planSearchQuery(query: string, maxVariants = 8): SearchQueryPlan {
  const originalQuery = query.trim();
  const normalizedQuery = normalizeSearchText(query);
  const concepts = detectSearchConcepts(query);
  const variants: SearchQueryVariant[] = [];
  const seen = new Set<string>();
  const limit = Math.max(1, maxVariants);

  const add = (candidate: string, reason: string, level: SearchQueryVariant["level"]) => {
    const normalized = normalizeSearchText(candidate);
    if (!normalized || seen.has(normalized) || variants.length >= limit) return;
    seen.add(normalized);
    variants.push({ query: candidate.trim(), reason, level });
  };

  add(originalQuery, "original query", "exact");

  const subjects = concepts.filter(concept => concept.role === "subject");
  const modifiers = concepts.filter(concept => concept.role === "modifier");
  const systems = concepts.filter(concept => concept.role === "system");
  const core = subjects[0] ?? systems[0] ?? concepts[0];

  if (core) {
    add(core.expansions[0], `focus on core concept '${core.id}'`, "semantic");
    for (const modifier of modifiers.slice(0, 2)) {
      add(`${modifier.expansions[0]} ${core.expansions[0]}`, `combine modifier '${modifier.id}' with core concept '${core.id}'`, "semantic");
    }
  }

  // Give each detected concept one focused chance before spending the budget on synonyms
  // of the highest-priority concept. This keeps fallback diverse for natural-language queries.
  for (const concept of concepts) {
    add(concept.expansions[0], `focus on concept '${concept.id}'`, "semantic");
    if (variants.length >= limit) break;
  }

  // Then deepen the strongest concepts in round-robin order so one concept cannot monopolize
  // the whole fallback budget.
  for (let synonymIndex = 1; synonymIndex <= 3 && variants.length < limit; synonymIndex += 1) {
    for (const concept of concepts) {
      const synonym = concept.expansions[synonymIndex];
      if (synonym) add(synonym, `semantic expansion of '${concept.id}'`, "semantic");
      if (variants.length >= limit) break;
    }
  }

  if (variants.length < limit) {
    for (const token of fallbackTokens(query)) {
      add(token, "broadened keyword fallback", "broad");
      if (variants.length >= limit) break;
    }
  }

  const suggestions = variants
    .filter(variant => variant.level !== "exact")
    .slice(0, 8)
    .map(variant => variant.query);

  return { originalQuery, normalizedQuery, concepts, variants, suggestions };
}
