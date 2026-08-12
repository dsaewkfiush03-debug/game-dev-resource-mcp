import type { AssetProvider, AssetProviderId, ProviderAsset, ProviderSearchOptions } from "./types.js";

export interface VerifiedCatalogEntry {
  id: string;
  name: string;
  sourceUrl: string;
  description?: string;
  categories: string[];
  tags: string[];
}

export function createCc0CatalogProvider(
  id: AssetProviderId,
  name: string,
  licenseSource: string,
  entries: VerifiedCatalogEntry[]
): AssetProvider {
  return {
    id,
    name,
    async search({ query, categories = [], limit = 20 }: ProviderSearchOptions): Promise<ProviderAsset[]> {
      const q = query.trim().toLowerCase();
      const wanted = categories.map(value => value.toLowerCase());
      const retrievedAt = new Date().toISOString();

      return entries
        .filter(entry => {
          const haystack = [entry.name, entry.description ?? "", ...entry.categories, ...entry.tags].join(" ").toLowerCase();
          const queryMatches = !q || q.split(/\s+/).every(token => haystack.includes(token));
          const categoryMatches = wanted.length === 0 || wanted.every(category =>
            entry.categories.some(value => value.toLowerCase().includes(category)) || entry.tags.includes(category)
          );
          return queryMatches && categoryMatches;
        })
        .slice(0, Math.max(1, Math.min(limit, 100)))
        .map(entry => ({
          ...entry,
          provider: id,
          license: "CC0-1.0",
          licenseSource,
          commercialUse: true,
          modification: true,
          redistribution: true,
          attribution: false,
          shareAlike: false,
          retrievedAt
        }));
    }
  };
}
