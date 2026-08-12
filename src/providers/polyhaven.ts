import type { AssetProvider, ProviderAsset, ProviderFile, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.polyhaven.com";
const USER_AGENT = "game-dev-resource-mcp/0.2 (+https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp)";
const LICENSE_SOURCE = "https://polyhaven.com/license";

interface PolyHavenAssetRaw {
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  type?: number | string;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function assetTypeTags(type: PolyHavenAssetRaw["type"]): string[] {
  if (type === 0 || type === "hdris" || type === "hdri") return ["hdri"];
  if (type === 1 || type === "textures" || type === "texture") return ["texture", "pbr"];
  if (type === 2 || type === "models" || type === "model") return ["3d", "model"];
  return [];
}

async function apiJson(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Poly Haven API ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

export function mapPolyHavenAsset(id: string, raw: PolyHavenAssetRaw, retrievedAt = new Date().toISOString()): ProviderAsset {
  const category = normalizeText(raw.category);
  const tags = Array.from(new Set([...(raw.tags ?? []).map(tag => tag.toLowerCase()), ...assetTypeTags(raw.type)]));

  return {
    id,
    name: normalizeText(raw.name) || id,
    provider: "polyhaven",
    sourceUrl: `https://polyhaven.com/a/${encodeURIComponent(id)}`,
    description: normalizeText(raw.description) || undefined,
    categories: category ? category.split("/").map(part => part.trim()).filter(Boolean) : [],
    tags,
    license: "CC0-1.0",
    licenseSource: LICENSE_SOURCE,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    apiAttributionRequired: true,
    retrievedAt
  };
}

export function flattenPolyHavenFiles(value: unknown, path: string[] = []): ProviderFile[] {
  if (!value || typeof value !== "object") return [];
  const object = value as Record<string, unknown>;

  if (typeof object.url === "string") {
    const parts = path.filter(Boolean);
    return [{
      path: parts.join("/"),
      url: object.url,
      size: typeof object.size === "number" ? object.size : undefined,
      md5: typeof object.md5 === "string" ? object.md5 : undefined,
      format: parts.at(-1),
      resolution: parts.length >= 2 ? parts.at(-2) : undefined
    }];
  }

  return Object.entries(object).flatMap(([key, child]) => flattenPolyHavenFiles(child, [...path, key]));
}

export const polyHavenProvider: AssetProvider = {
  id: "polyhaven",
  name: "Poly Haven",
  async search({ query, categories = [], limit = 20 }: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const data = await apiJson("/assets") as Record<string, PolyHavenAssetRaw>;
    const q = query.trim().toLowerCase();
    const wantedCategories = categories.map(category => category.toLowerCase());
    const retrievedAt = new Date().toISOString();

    return Object.entries(data)
      .map(([id, raw]) => mapPolyHavenAsset(id, raw, retrievedAt))
      .filter(asset => {
        const haystack = [asset.name, asset.description ?? "", ...asset.categories, ...asset.tags].join(" ").toLowerCase();
        const queryMatches = !q || q.split(/\s+/).every(token => haystack.includes(token));
        const categoryMatches = wantedCategories.length === 0 || wantedCategories.every(category =>
          asset.categories.some(value => value.toLowerCase().includes(category)) || asset.tags.includes(category)
        );
        return queryMatches && categoryMatches;
      })
      .slice(0, Math.max(1, Math.min(limit, 100)));
  },
  async getFiles(assetId: string): Promise<ProviderFile[]> {
    const data = await apiJson(`/files/${encodeURIComponent(assetId)}`);
    return flattenPolyHavenFiles(data);
  }
};
