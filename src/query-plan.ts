export interface SearchConceptDefinition {
  id: string;
  priority: number;
  triggers: string[];
  expansions: string[];
}

export interface SearchConceptMatch {
  id: string;
  priority: number;
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
    triggers: ["turret", "炮塔", "机枪塔", "防御塔"],
    expansions: ["turret", "cannon", "artillery", "sentry", "defense tower", "gun emplacement", "tank turret", "tank"]
  },
  {
    id: "tower-defense",
    priority: 55,
    triggers: ["tower defense", "tower-defense", "塔防", "defense game"],
    expansions: ["tower defense", "defense", "fortress", "fortification", "defensive"]
  },
  {
    id: "weapon",
    priority: 80,
    triggers: ["weapon", "gun", "rifle", "cannon", "枪", "武器", "火炮"],
    expansions: ["weapon", "gun", "cannon", "rifle", "blaster", "artillery"]
  },
  {
    id: "enemy",
    priority: 75,
    triggers: ["enemy", "hostile", "monster", "敌人", "敌军", "怪物"],
    expansions: ["enemy", "hostile", "monster", "creature", "robot", "zombie", "opponent"]
  },
  {
    id: "vehicle",
    priority: 80,
    triggers: ["vehicle", "car", "truck", "tank", "车辆", "汽车", "卡车", "坦克"],
    expansions: ["vehicle", "car", "truck", "tank", "armored vehicle"]
  },
  {
    id: "character",
    priority: 75,
    triggers: ["character", "player", "hero", "npc", "角色", "人物", "主角"],
    expansions: ["character", "hero", "player", "npc", "human", "soldier"]
  },
  {
    id: "environment",
    priority: 65,
    triggers: ["environment", "world", "map", "terrain", "环境", "场景", "地图", "地形"],
    expansions: ["environment", "terrain", "world", "map", "level", "scenery"]
  },
  {
    id: "low-poly",
    priority: 35,
    triggers: ["low poly", "low-poly", "lowpoly", "低多边形", "低模"],
    expansions: ["low poly", "low-poly", "stylized", "lowpoly"]
  },
  {
    id: "ui",
    priority: 70,
    triggers: ["ui", "hud", "interface", "界面", "hud", "菜单"],
    expansions: ["ui", "hud", "interface", "menu", "panel"]
  },
  {
    id: "icon",
    priority: 65,
    triggers: ["icon", "icons", "图标"],
    expansions: ["icon", "icons", "symbol", "glyph"]
  },
  {
    id: "audio",
    priority: 65,
    triggers: ["sfx", "sound effect", "sound", "audio", "音效", "声音"],
    expansions: ["sound effect", "sfx", "audio", "impact", "interface sound"]
  },
  {
    id: "music",
    priority: 65,
    triggers: ["music", "bgm", "soundtrack", "音乐", "背景音乐"],
    expansions: ["music", "bgm", "soundtrack", "jingle", "ambient music"]
  },
  {
    id: "font",
    priority: 65,
    triggers: ["font", "typeface", "字体"],
    expansions: ["font", "typeface"]
  },
  {
    id: "inventory",
    priority: 80,
    triggers: ["inventory", "loot", "backpack", "背包", "物品栏", "搜刮"],
    expansions: ["inventory", "loot", "item system", "backpack"]
  },
  {
    id: "combat",
    priority: 80,
    triggers: ["combat", "damage", "battle", "战斗", "伤害"],
    expansions: ["combat", "damage", "battle", "weapon system"]
  },
  {
    id: "ai",
    priority: 80,
    triggers: ["enemy ai", "npc ai", "behavior tree", "behaviour tree", "人工智能", "行为树", "敌人ai", "敌人 ai"],
    expansions: ["behavior tree", "ai", "enemy ai", "npc ai", "finite state machine", "fsm"]
  },
  {
    id: "networking",
    priority: 80,
    triggers: ["networking", "multiplayer", "pvp", "netcode", "联网", "联机", "多人"],
    expansions: ["multiplayer", "networking", "netcode", "replication", "client server"]
  },
  {
    id: "save",
    priority: 75,
    triggers: ["save system", "save game", "persistence", "存档", "持久化"],
    expansions: ["save", "persistence", "save game", "serialization"]
  },
  {
    id: "procedural",
    priority: 75,
    triggers: ["procedural", "procgen", "procedural generation", "程序化", "随机生成"],
    expansions: ["procedural generation", "procgen", "random generation", "level generation"]
  },
  {
    id: "dialogue",
    priority: 70,
    triggers: ["dialogue", "conversation", "对话", "剧情"],
    expansions: ["dialogue", "conversation", "dialog system", "narrative"]
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

  const add = (candidate: string, reason: string, level: SearchQueryVariant["level"]) => {
    const normalized = normalizeSearchText(candidate);
    if (!normalized || seen.has(normalized) || variants.length >= Math.max(1, maxVariants)) return;
    seen.add(normalized);
    variants.push({ query: candidate.trim(), reason, level });
  };

  add(originalQuery, "original query", "exact");

  for (const concept of concepts) {
    add(concept.expansions[0], `focus on core concept '${concept.id}'`, "semantic");
    for (const synonym of concept.expansions.slice(1, 4)) {
      add(synonym, `semantic expansion of '${concept.id}'`, "semantic");
    }
    if (variants.length >= maxVariants) break;
  }

  if (variants.length < Math.min(maxVariants, 4)) {
    for (const token of fallbackTokens(query)) {
      add(token, "broadened keyword fallback", "broad");
      if (variants.length >= maxVariants) break;
    }
  }

  const suggestions = variants
    .filter(variant => variant.level !== "exact")
    .slice(0, 6)
    .map(variant => variant.query);

  return { originalQuery, normalizedQuery, concepts, variants, suggestions };
}
