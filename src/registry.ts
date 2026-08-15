import { EXPANDED_REGISTRY } from "./registry-expanded.js";
import type { ResourceRecord } from "./types.js";

export const REGISTRY: ResourceRecord[] = [
  {
    id: "kenney-assets",
    name: "Kenney game assets",
    kind: "asset",
    source: "Kenney",
    sourceUrl: "https://kenney.nl/assets",
    license: "CC0-1.0",
    licenseSource: "https://kenney.nl/support",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    apiRequired: false,
    authType: "none",
    tags: ["2d", "3d", "ui", "audio", "game-assets"],
    notes: "Curated source entry. Individual packs should retain source metadata even when attribution is not required."
  },
  {
    id: "poly-haven",
    name: "Poly Haven",
    kind: "asset",
    source: "Poly Haven",
    sourceUrl: "https://polyhaven.com/",
    license: "CC0-1.0",
    licenseSource: "https://polyhaven.com/license",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    apiRequired: false,
    authType: "none",
    tags: ["3d", "textures", "hdris", "models", "pbr"]
  },
  {
    id: "quaternius",
    name: "Quaternius",
    kind: "asset",
    source: "Quaternius",
    sourceUrl: "https://quaternius.com/",
    license: "CC0-1.0",
    licenseSource: "https://quaternius.com/faq.html",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    apiRequired: false,
    authType: "none",
    tags: ["3d", "low-poly", "characters", "environment", "game-assets"]
  },
  {
    id: "opengameart",
    name: "OpenGameArt",
    kind: "asset",
    source: "OpenGameArt",
    sourceUrl: "https://opengameart.org/",
    license: "MULTIPLE",
    licenseSource: "https://opengameart.org/content/faq",
    commercialUse: "unknown",
    modification: "unknown",
    redistribution: "unknown",
    attribution: "unknown",
    shareAlike: "unknown",
    apiRequired: false,
    authType: "none",
    tags: ["2d", "3d", "audio", "sprites", "tilesets"],
    notes: "License varies per asset. Never infer commercial eligibility from the site alone; inspect the asset license."
  },
  {
    id: "github",
    name: "GitHub open-source game projects",
    kind: "project",
    source: "GitHub",
    sourceUrl: "https://github.com/",
    license: "MULTIPLE",
    commercialUse: "unknown",
    modification: "unknown",
    redistribution: "unknown",
    attribution: "unknown",
    shareAlike: "unknown",
    apiRequired: false,
    authType: "none",
    tags: ["code", "framework", "starter", "engine", "game"],
    notes: "Every repository must be inspected for an explicit license before reuse."
  },
  ...EXPANDED_REGISTRY
];

const QUERY_ALIASES: Record<string, string[]> = {
  "像素": ["pixel", "2d", "sprites"],
  "车辆": ["vehicle", "car", "transport"],
  "汽车": ["vehicle", "car"],
  "公路": ["road", "street", "environment"],
  "道路": ["road", "street", "environment"],
  "界面": ["ui", "interface", "icons"],
  "图标": ["icons", "svg", "ui"],
  "角色": ["character", "sprites", "3d"],
  "人物": ["character", "sprites", "3d"],
  "武器": ["weapon", "combat"],
  "音效": ["audio", "sfx", "foley"],
  "音乐": ["music", "audio"],
  "背景音乐": ["music", "audio"],
  "字体": ["font", "typography"],
  "中文字体": ["font", "cjk", "chinese"],
  "着色器": ["shader", "vfx", "rendering"],
  "特效": ["vfx", "shader", "effects"],
  "背包": ["inventory", "loot", "code"],
  "战斗": ["combat", "weapon", "code"],
  "联网": ["networking", "multiplayer", "code"],
  "多人": ["networking", "multiplayer", "code"],
  "存档": ["save", "persistence", "code"],
  "寻路": ["pathfinding", "ai", "code"],
  "程序化": ["procedural", "generation", "code"],
  "开源模板": ["starter", "template", "boilerplate"],
  "模板": ["starter", "template"],
  "插件": ["plugin", "addon", "code"],
  "商用": ["commercial"],
  "低模": ["low-poly", "3d"],
  "科幻": ["sci-fi", "space"],
  "生存": ["survival", "game-development"]
};

function expandedQueryTokens(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const expanded = [...rawTokens];
  for (const [key, aliases] of Object.entries(QUERY_ALIASES)) {
    if (normalized.includes(key)) expanded.push(...aliases);
  }
  return Array.from(new Set(expanded));
}

export function searchRegistry(query: string, tags: string[] = []): ResourceRecord[] {
  const q = query.trim().toLowerCase();
  const expandedTokens = expandedQueryTokens(q);
  const normalizedTags = tags.map(tag => tag.toLowerCase());

  return REGISTRY.filter(item => {
    const text = [item.name, item.source, item.kind, item.license, ...item.tags, item.notes ?? ""].join(" ").toLowerCase();
    const directMatch = !q || text.includes(q) || q.split(/\s+/).every(token => text.includes(token));
    const aliasMatch = expandedTokens.some(token => text.includes(token));
    const queryMatch = !q || directMatch || aliasMatch;
    const tagMatch = normalizedTags.length === 0 || normalizedTags.every(tag => item.tags.includes(tag));
    return queryMatch && tagMatch;
  });
}