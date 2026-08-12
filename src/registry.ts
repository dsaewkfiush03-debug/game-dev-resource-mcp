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
  }
];

export function searchRegistry(query: string, tags: string[] = []): ResourceRecord[] {
  const q = query.trim().toLowerCase();
  return REGISTRY.filter(item => {
    const text = [item.name, item.source, item.kind, item.license, ...item.tags, item.notes ?? ""].join(" ").toLowerCase();
    const queryMatch = !q || text.includes(q) || q.split(/\s+/).every(token => text.includes(token));
    const tagMatch = tags.length === 0 || tags.every(tag => item.tags.includes(tag.toLowerCase()));
    return queryMatch && tagMatch;
  });
}
