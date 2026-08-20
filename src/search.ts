import { checkLicense } from "./licenses.js";
import { getProvider, listProviders, type AssetProviderId, type ProviderAsset } from "./providers/index.js";
import type { AssetDimension, BundledAssetStatus, ReuseScope } from "./providers/types.js";

export type ProviderMode = "live-api" | "verified-catalog";

export interface UnifiedSearchOptions {
  query: string;
  categories?: string[];
  providers?: AssetProviderId[];
  engines?: string[];
  dimensions?: AssetDimension[];
  styles?: string[];
  formats?: string[];
  assetTypes?: string[];
  gameGenres?: string[];
  reuseScopes?: ReuseScope[];
  bundledAssetStatuses?: BundledAssetStatus[];
  animated?: boolean;
  commercialOnly?: boolean;
  allowAttribution?: boolean;
  allowShareAlike?: boolean;
  limit?: number;
  perProviderLimit?: number;
}

export interface RankedAsset extends ProviderAsset {
  score: number;
  matchReasons: string[];
  licenseRisk: string;
  providerMode: ProviderMode;
}

export interface ProviderSearchError {
  provider: AssetProviderId;
  message: string;
}

const MODE_BY_PROVIDER: Record<AssetProviderId, ProviderMode> = {
  polyhaven: "live-api",
  ambientcg: "live-api",
  githubcode: "live-api",
  kaykit: "live-api",
  kenney: "verified-catalog",
  quaternius: "verified-catalog",
  godotdemos: "verified-catalog",
  gameicons: "live-api",
  tablericons: "live-api",
  phaser: "verified-catalog",
  raylib: "verified-catalog",
  communitystarters: "verified-catalog",
  googlefonts: "verified-catalog",
  openverse: "live-api",
  godotassetlib: "live-api"
};

function tokens(input: string): string[] {
  return Array.from(new Set(input.toLowerCase().trim().split(/\s+/).filter(Boolean)));
}

function contains(value: string | undefined, token: string): boolean {
  return (value ?? "").toLowerCase().includes(token);
}

function valuesContain(values: string[] | undefined, wanted: string[] | undefined): boolean {
  if (!wanted?.length) return true;
  const normalized = (values ?? []).map(value => value.toLowerCase());
  return wanted.every(filter => normalized.some(value => value.includes(filter.toLowerCase())));
}

function dimensionMatches(asset: ProviderAsset, wanted: AssetDimension[] | undefined): boolean {
  return !wanted?.length || (asset.dimension !== undefined && wanted.includes(asset.dimension));
}

function enumMatches<T extends string>(value: T | undefined, wanted: T[] | undefined): boolean {
  return !wanted?.length || (value !== undefined && wanted.includes(value));
}

function popularityBonus(popularity?: number): number {
  if (!Number.isFinite(popularity) || (popularity ?? 0) <= 0) return 0;
  return Math.min(6, Math.floor(Math.log10((popularity ?? 0) + 1) * 2));
}

function freshnessBonus(updatedAt?: string, retrievedAt?: string): { bonus: number; ageDays?: number } {
  if (!updatedAt || !retrievedAt) return { bonus: 0 };
  const updated = Date.parse(updatedAt);
  const retrieved = Date.parse(retrievedAt);
  if (!Number.isFinite(updated) || !Number.isFinite(retrieved) || updated > retrieved) return { bonus: 0 };
  const ageDays = Math.floor((retrieved - updated) / 86_400_000);
  if (ageDays <= 365) return { bonus: 3, ageDays };
  if (ageDays <= 1095) return { bonus: 2, ageDays };
  if (ageDays <= 1825) return { bonus: 1, ageDays };
  return { bonus: 0, ageDays };
}

function reuseBonus(asset: ProviderAsset): number {
  if (asset.reuseScope === "whole-project") {
    if (asset.bundledAssetStatus === "same-license" || asset.bundledAssetStatus === "none") return 4;
    return 2;
  }
  if (asset.reuseScope === "code-only") return 1;
  return 0;
}

export function scoreAsset(asset: ProviderAsset, query: string): { score: number; matchReasons: string[] } {
  const queryTokens = tokens(query);
  let score = 0;
  const reasons: string[] = [];
  const metadata = [
    ...(asset.engine ?? []),
    asset.dimension ?? "",
    ...(asset.style ?? []),
    ...(asset.formats ?? []),
    ...(asset.assetTypes ?? []),
    ...(asset.gameGenres ?? []),
    asset.resolution ?? "",
    asset.reuseScope ?? "",
    asset.bundledAssetStatus ?? ""
  ];

  for (const token of queryTokens) {
    if (contains(asset.name, token)) { score += 8; reasons.push(`name:${token}`); }
    if (asset.tags.some(tag => contains(tag, token))) { score += 5; reasons.push(`tag:${token}`); }
    if (asset.categories.some(category => contains(category, token))) { score += 4; reasons.push(`category:${token}`); }
    if (metadata.some(value => contains(value, token))) { score += 4; reasons.push(`metadata:${token}`); }
    if (contains(asset.description, token)) { score += 2; reasons.push(`description:${token}`); }
  }

  if (asset.commercialUse === true) { score += 5; reasons.push("commercial-use-confirmed"); }
  if (asset.attribution === false) { score += 2; reasons.push("no-asset-attribution-required"); }
  if (asset.shareAlike === false) { score += 1; reasons.push("no-share-alike"); }
  if (asset.licenseSource) { score += 1; reasons.push("license-source-present"); }
  if (asset.creator) { score += 1; reasons.push("creator-provenance-present"); }

  const reuse = reuseBonus(asset);
  if (reuse > 0) {
    score += reuse;
    reasons.push(`reuse-scope:${asset.reuseScope}`);
    if (asset.bundledAssetStatus) reasons.push(`bundled-assets:${asset.bundledAssetStatus}`);
  }

  const popularity = popularityBonus(asset.popularity);
  if (popularity > 0) { score += popularity; reasons.push(`popularity:${asset.popularity}`); }

  const freshness = freshnessBonus(asset.updatedAt, asset.retrievedAt);
  if (freshness.bonus > 0) { score += freshness.bonus; reasons.push(`freshness:${freshness.ageDays}d`); }

  return { score, matchReasons: Array.from(new Set(reasons)) };
}

export function rankAssets(assets: ProviderAsset[], query: string, options: UnifiedSearchOptions = { query }): RankedAsset[] {
  const commercialOnly = options.commercialOnly ?? true;
  const allowAttribution = options.allowAttribution ?? true;
  const allowShareAlike = options.allowShareAlike ?? false;

  return assets
    .filter(asset => !commercialOnly || asset.commercialUse === true)
    .filter(asset => allowAttribution || asset.attribution === false)
    .filter(asset => allowShareAlike || asset.shareAlike === false)
    .filter(asset => valuesContain(asset.engine, options.engines))
    .filter(asset => dimensionMatches(asset, options.dimensions))
    .filter(asset => valuesContain(asset.style, options.styles))
    .filter(asset => valuesContain(asset.formats, options.formats))
    .filter(asset => valuesContain(asset.assetTypes, options.assetTypes))
    .filter(asset => valuesContain(asset.gameGenres, options.gameGenres))
    .filter(asset => enumMatches(asset.reuseScope, options.reuseScopes))
    .filter(asset => enumMatches(asset.bundledAssetStatus, options.bundledAssetStatuses))
    .filter(asset => options.animated === undefined || asset.animated === options.animated)
    .map(asset => {
      const licenseRule = checkLicense(asset.license);
      const ranked = scoreAsset(asset, query);
      return { ...asset, ...ranked, licenseRisk: licenseRule?.risk ?? "unknown", providerMode: MODE_BY_PROVIDER[asset.provider] };
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
}

export async function searchAllAssets(options: UnifiedSearchOptions): Promise<{
  results: RankedAsset[];
  errors: ProviderSearchError[];
  searchedProviders: AssetProviderId[];
}> {
  const available = listProviders().map(provider => provider.id);
  const searchedProviders = options.providers?.length ? options.providers : available;
  const perProviderLimit = Math.max(1, Math.min(options.perProviderLimit ?? 50, 100));

  const settled = await Promise.allSettled(searchedProviders.map(async providerId => {
    const provider = getProvider(providerId);
    const results = await provider.search({
      query: options.query,
      categories: options.categories ?? [],
      engines: options.engines ?? [],
      dimensions: options.dimensions ?? [],
      styles: options.styles ?? [],
      formats: options.formats ?? [],
      assetTypes: options.assetTypes ?? [],
      gameGenres: options.gameGenres ?? [],
      reuseScopes: options.reuseScopes ?? [],
      bundledAssetStatuses: options.bundledAssetStatuses ?? [],
      animated: options.animated,
      limit: perProviderLimit
    });
    return { providerId, results };
  }));

  const assets: ProviderAsset[] = [];
  const errors: ProviderSearchError[] = [];
  settled.forEach((result, index) => {
    const provider = searchedProviders[index];
    if (result.status === "fulfilled") assets.push(...result.value.results);
    else errors.push({ provider, message: result.reason instanceof Error ? result.reason.message : String(result.reason) });
  });

  const ranked = rankAssets(assets, options.query, options).slice(0, Math.max(1, Math.min(options.limit ?? 20, 100)));
  return { results: ranked, errors, searchedProviders };
}
