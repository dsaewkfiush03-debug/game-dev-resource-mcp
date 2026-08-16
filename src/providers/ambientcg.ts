import { VERSION } from "../version.js";
import type { AssetDimension, AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://ambientcg.com/api/v3";
const LICENSE_SOURCE = "https://docs.ambientcg.com/license/";
const USER_AGENT = `game-dev-resource-mcp/${VERSION} (+https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp)`;

interface AmbientCgRawAsset {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
  tags?: unknown[];
  shortDescription?: string;
  longDescription?: string;
  technique?: string;
  dimensions?: unknown;
}

interface AmbientCgResponse {
  assets?: AmbientCgRawAsset[];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function stringTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(item => {
    if (typeof item === "string") return [item.trim().toLowerCase()];
    if (item && typeof item === "object") {
      const object = item as Record<string, unknown>;
      const candidate = text(object.name) || text(object.tag) || text(object.title);
      return candidate ? [candidate.toLowerCase()] : [];
    }
    return [];
  }).filter(Boolean);
}

function typeMetadata(typeRaw: string): {
  dimension: AssetDimension;
  assetTypes: string[];
  tags: string[];
} {
  const type = typeRaw.toLowerCase();
  switch (type) {
    case "3d-model": return { dimension: "3D", assetTypes: ["model", "prop"], tags: ["3d", "model"] };
    case "material": return { dimension: "3D", assetTypes: ["material", "texture"], tags: ["pbr", "material", "texture"] };
    case "hdri":
    case "hdri-element": return { dimension: "3D", assetTypes: ["hdri", "environment"], tags: ["hdri", "environment", "lighting"] };
    case "terrain": return { dimension: "3D", assetTypes: ["terrain", "environment"], tags: ["terrain", "environment"] };
    case "decal": return { dimension: "2D", assetTypes: ["decal", "texture"], tags: ["decal", "texture"] };
    case "atlas": return { dimension: "2D", assetTypes: ["atlas", "texture"], tags: ["atlas", "texture"] };
    case "plain-image": return { dimension: "2D", assetTypes: ["image", "texture"], tags: ["image", "texture"] };
    case "brush": return { dimension: "2D", assetTypes: ["brush", "texture"], tags: ["brush", "texture"] };
    case "substance": return { dimension: "3D", assetTypes: ["material", "texture"], tags: ["substance", "material", "texture"] };
    default: return { dimension: "mixed", assetTypes: ["asset"], tags: [] };
  }
}

export function mapAmbientCgAsset(raw: AmbientCgRawAsset, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const id = text(raw.id);
  if (!id) return undefined;
  const type = text(raw.type);
  const metadata = typeMetadata(type);
  const tags = Array.from(new Set([
    ...stringTags(raw.tags),
    ...metadata.tags,
    ...(text(raw.technique) ? [text(raw.technique).toLowerCase()] : [])
  ]));

  return {
    id,
    name: text(raw.title) || id,
    provider: "ambientcg",
    sourceUrl: text(raw.url) || `https://ambientcg.com/a/${encodeURIComponent(id)}`,
    description: text(raw.shortDescription) || text(raw.longDescription) || undefined,
    categories: type ? [type] : [],
    tags,
    dimension: metadata.dimension,
    assetTypes: metadata.assetTypes,
    license: "CC0-1.0",
    licenseSource: LICENSE_SOURCE,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    retrievedAt
  };
}

async function apiJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json", "User-Agent": USER_AGENT }
  });
  if (!response.ok) throw new Error(`ambientCG API ${response.status}: ${await response.text()}`);
  return response.json();
}

function containsAll(asset: ProviderAsset, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [asset.name, asset.description ?? "", ...asset.categories, ...asset.tags, ...(asset.assetTypes ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).every(token => haystack.includes(token));
}

function matchesWanted(asset: ProviderAsset, options: ProviderSearchOptions): boolean {
  const wantedCategories = (options.categories ?? []).map(v => v.toLowerCase());
  const wantedDimensions = options.dimensions ?? [];
  const wantedTypes = (options.assetTypes ?? []).map(v => v.toLowerCase());
  return (wantedCategories.length === 0 || wantedCategories.every(wanted => asset.categories.some(v => v.toLowerCase().includes(wanted)) || asset.tags.some(v => v.includes(wanted))))
    && (wantedDimensions.length === 0 || (asset.dimension !== undefined && wantedDimensions.includes(asset.dimension)))
    && (wantedTypes.length === 0 || wantedTypes.every(wanted => (asset.assetTypes ?? []).some(v => v.toLowerCase().includes(wanted)) || asset.tags.some(v => v.includes(wanted))));
}

export const ambientCgProvider: AssetProvider = {
  id: "ambientcg",
  name: "ambientCG",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const params = new URLSearchParams({
      q: options.query.trim(),
      sort: "popular",
      limit: String(Math.min(Math.max(limit * 3, 30), 300)),
      include: "type,title,url,tags,shortDescription,dimensions,technique"
    });
    const data = await apiJson(`/assets?${params.toString()}`) as AmbientCgResponse;
    const retrievedAt = new Date().toISOString();
    return (data.assets ?? [])
      .map(raw => mapAmbientCgAsset(raw, retrievedAt))
      .filter((asset): asset is ProviderAsset => Boolean(asset))
      .filter(asset => containsAll(asset, options.query) && matchesWanted(asset, options))
      .slice(0, limit);
  }
};
