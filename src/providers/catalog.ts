import type { AssetProvider, AssetProviderId, ProviderAsset, ProviderSearchOptions, AssetDimension } from "./types.js";

export interface VerifiedCatalogEntry {
  id: string;
  name: string;
  sourceUrl: string;
  description?: string;
  categories: string[];
  tags: string[];
  engine?: string[];
  dimension?: AssetDimension;
  style?: string[];
  formats?: string[];
  assetTypes?: string[];
  gameGenres?: string[];
  resolution?: string;
  animated?: boolean;
}

export interface CatalogLicenseProfile {
  license: string;
  licenseSource: string;
  commercialUse: true;
  modification: true;
  redistribution: true;
  attribution: boolean;
  shareAlike: boolean;
}

function valuesMatch(entryValues: string[] | undefined, wanted: string[]): boolean {
  if (wanted.length === 0) return true;
  const values = (entryValues ?? []).map(value => value.toLowerCase());
  return wanted.every(filter => values.some(value => value.includes(filter.toLowerCase())));
}

function exactOptionalMatch<T>(actual: T | undefined, expected: T | undefined): boolean {
  return expected === undefined || actual === expected;
}

export function createVerifiedCatalogProvider(
  id: AssetProviderId,
  name: string,
  license: CatalogLicenseProfile,
  entries: VerifiedCatalogEntry[]
): AssetProvider {
  return {
    id,
    name,
    async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
      const {
        query,
        categories = [],
        engines = [],
        dimensions = [],
        styles = [],
        formats = [],
        assetTypes = [],
        gameGenres = [],
        animated,
        limit = 20
      } = options;
      const q = query.trim().toLowerCase();
      const retrievedAt = new Date().toISOString();

      return entries
        .filter(entry => {
          const haystack = [
            entry.name,
            entry.description ?? "",
            ...entry.categories,
            ...entry.tags,
            ...(entry.engine ?? []),
            entry.dimension ?? "",
            ...(entry.style ?? []),
            ...(entry.formats ?? []),
            ...(entry.assetTypes ?? []),
            ...(entry.gameGenres ?? []),
            entry.resolution ?? ""
          ].join(" ").toLowerCase();

          const queryMatches = !q || q.split(/\s+/).every(token => haystack.includes(token));
          return queryMatches
            && valuesMatch(entry.categories, categories)
            && valuesMatch(entry.engine, engines)
            && (dimensions.length === 0 || (entry.dimension ? dimensions.includes(entry.dimension) : false))
            && valuesMatch(entry.style, styles)
            && valuesMatch(entry.formats, formats)
            && valuesMatch(entry.assetTypes, assetTypes)
            && valuesMatch(entry.gameGenres, gameGenres)
            && exactOptionalMatch(entry.animated, animated);
        })
        .slice(0, Math.max(1, Math.min(limit, 100)))
        .map(entry => ({
          ...entry,
          provider: id,
          ...license,
          retrievedAt
        }));
    }
  };
}

export function createCc0CatalogProvider(
  id: AssetProviderId,
  name: string,
  licenseSource: string,
  entries: VerifiedCatalogEntry[]
): AssetProvider {
  return createVerifiedCatalogProvider(id, name, {
    license: "CC0-1.0",
    licenseSource,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false
  }, entries);
}
