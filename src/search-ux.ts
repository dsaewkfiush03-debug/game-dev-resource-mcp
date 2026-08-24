import { searchAllAssets, type RankedAsset, type UnifiedSearchOptions } from "./search.js";

export type SearchResponseMode = "summary" | "full";

export interface SearchPageOptions extends UnifiedSearchOptions {
  offset?: number;
  responseMode?: SearchResponseMode;
  cacheTtlMs?: number;
}

interface CacheEntry {
  expiresAt: number;
  value: Awaited<ReturnType<typeof searchAllAssets>>;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_CACHE = new Map<string, CacheEntry>();

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return [...value].sort();
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableValue(item)])
  );
}

function cacheKey(options: UnifiedSearchOptions): string {
  return JSON.stringify(stableValue(options));
}

export function clearAssetSearchCache(): void {
  SEARCH_CACHE.clear();
}

export function compactAsset(asset: RankedAsset) {
  return {
    id: asset.id,
    name: asset.name,
    provider: asset.provider,
    sourceUrl: asset.sourceUrl,
    description: asset.description,
    license: asset.license,
    licenseRisk: asset.licenseRisk,
    score: asset.score,
    dimension: asset.dimension,
    style: asset.style,
    formats: asset.formats,
    assetTypes: asset.assetTypes,
    gameGenres: asset.gameGenres,
    reuseScope: asset.reuseScope,
    bundledAssetStatus: asset.bundledAssetStatus,
    matchReasons: asset.matchReasons.filter(reason =>
      reason.startsWith("semantic:")
      || reason.startsWith("semantic-direct:")
      || reason.startsWith("semantic-coverage:")
      || reason.startsWith("name:")
      || reason.startsWith("tag:")
    ).slice(0, 8)
  };
}

export async function searchAssetsPage(options: SearchPageOptions) {
  const offset = Math.max(0, Math.min(options.offset ?? 0, 99));
  const pageSize = Math.max(1, Math.min(options.limit ?? 20, 100 - offset));
  const fetchLimit = Math.min(100, offset + pageSize + 1);
  const responseMode = options.responseMode ?? "summary";
  const ttlMs = Math.max(0, Math.min(options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS, 60 * 60 * 1000));

  const { offset: _offset, responseMode: _responseMode, cacheTtlMs: _cacheTtlMs, ...searchOptions } = options;
  const expandedOptions: UnifiedSearchOptions = {
    ...searchOptions,
    limit: fetchLimit,
    minResultsBeforeFallback: Math.max(searchOptions.minResultsBeforeFallback ?? 0, fetchLimit)
  };

  const key = cacheKey(expandedOptions);
  const now = Date.now();
  const existing = SEARCH_CACHE.get(key);
  let cacheHit = false;
  let result: Awaited<ReturnType<typeof searchAllAssets>>;

  if (ttlMs > 0 && existing && existing.expiresAt > now) {
    cacheHit = true;
    result = existing.value;
  } else {
    if (existing) SEARCH_CACHE.delete(key);
    result = await searchAllAssets(expandedOptions);
    if (ttlMs > 0) SEARCH_CACHE.set(key, { expiresAt: now + ttlMs, value: result });
  }

  const pageResults = result.results.slice(offset, offset + pageSize);
  const hasMore = result.results.length > offset + pageSize;

  return {
    results: responseMode === "full" ? pageResults : pageResults.map(compactAsset),
    errors: result.errors,
    searchedProviders: result.searchedProviders,
    diagnostics: {
      ...result.diagnostics,
      cache: {
        hit: cacheHit,
        ttlSeconds: Math.round(ttlMs / 1000)
      }
    },
    pagination: {
      offset,
      limit: pageSize,
      returned: pageResults.length,
      hasMore,
      nextOffset: hasMore ? offset + pageResults.length : null
    },
    responseMode
  };
}
