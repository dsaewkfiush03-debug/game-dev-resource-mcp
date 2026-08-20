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

function score(asset: ProviderAsset, options: UnifiedSearchOptions): RankedAsset | undefined {
  const reasons: string[] = [];
  let value = 0;
  const queryTokens = tokens(options.query);
  const haystack = [asset.name, asset.description ?? "", ...asset.categories, ...asset.tags, ...(asset.engine ?? []), ...(asset.style ?? []), ...(asset.formats ?? []), ...(asset.assetTypes ?? []), ...(asset.gameGenres ?? [])].join(" ").toLowerCase();

  for (const token of queryTokens) {
    if (contains(asset.name, token)) { value += 8; reasons.push(`name:${token}`); }
    else if (asset.tags.some(tag => contains(tag, token))) { value += 5; reasons.push(`tag:${token}`); }
    else if (haystack.includes(token)) { value += 2; reasons.push(`metadata:${token}`); }
  }

  const filters: Array<[string, string[] | undefined, string[] | undefined]> = [
    ["category", asset.categories, options.categories],
    ["engine", asset.engine, options.engines],
    ["style", asset.style, options.styles],
    ["format", asset.formats, options.formats],
    ["type", asset.assetTypes, options.assetTypes],
    ["genre", asset.gameGenres, options.gameGenres]
  ];
  for (const [label, actual, wanted] of filters) {
    if (wanted?.length) {
      if (!valuesContain(actual, wanted)) return undefined;
      value += 10;
      reasons.push(`${label}:match`);
    }
  }

  if (!dimensionMatches(asset, options.dimensions)) return undefined;
  if (options.dimensions?.length) { value += 10; reasons.push("dimension:match"); }
  if (!enumMatches(asset.reuseScope, options.reuseScopes)) return undefined;
  if (options.reuseScopes?.length) { value += 10; reasons.push("reuse:match"); }
  if (!enumMatches(asset.bundledAssetStatus, options.bundledAssetStatuses)) return undefined;
  if (options.bundledAssetStatuses?.length) { value += 10; reasons.push("bundled-assets:match"); }
  if (options.animated !== undefined && asset.animated !== options.animated) return undefined;
  if (options.animated !== undefined) { value += 5; reasons.push("animated:match"); }

  const license = checkLicense(asset.license);
  const risk = license?.risk ?? "unknown";
  if ((options.commercialOnly ?? true) && asset.commercialUse !== true) return undefined;
  if (!(options.allowAttribution ?? true) && asset.attribution === true) return undefined;
  if (!(options.allowShareAlike ?? false) && asset.shareAlike === true) return undefined;
  if (risk === "reject") return undefined;
  if (risk === "safe") value += 18;
  else if (risk === "attribution") value += 12;
  else if (risk === "conditional") value += 4;

  if (asset.reuseScope === "whole-project") {
    value += 4;
    reasons.push("reuse:whole-project");
    if (asset.bundledAssetStatus === "none" || asset.bundledAssetStatus === "same-license") {
      value += 3;
      reasons.push("bundled-assets:verified-project-wide");
    }
  } else if (asset.reuseScope === "code-only") {
    value += 1;
    reasons.push("reuse:code-only");
  }

  const popularity = popularityBonus(asset.popularity);
  if (popularity > 0) { value += popularity; reasons.push(`popularity:+${popularity}`); }
  const freshness = freshnessBonus(asset.updatedAt, asset.retrievedAt);
  if (freshness.bonus > 0) { value += freshness.bonus; reasons.push(`freshness:+${freshness.bonus}`); }

  return {
    ...asset,
    score: value,
    matchReasons: reasons,
    licenseRisk: risk,
    providerMode: MODE_BY_PROVIDER[asset.provider]
  };
}

export async function searchAllAssets(options: UnifiedSearchOptions): Promise<{ results: RankedAsset[]; errors: ProviderSearchError[] }> {
  const requested = options.providers?.length ? options.providers : listProviders().map(item => item.id);
  const perProviderLimit = Math.max(1, Math.min(options.perProviderLimit ?? Math.max((options.limit ?? 20) * 2, 20), 100));
  const errors: ProviderSearchError[] = [];
  const groups = await Promise.all(requested.map(async providerId => {
    try {
      const provider = getProvider(providerId);
      return await provider.search({
        query: options.query,
        categories: options.categories,
        engines: options.engines,
        dimensions: options.dimensions,
        styles: options.styles,
        formats: options.formats,
        assetTypes: options.assetTypes,
        gameGenres: options.gameGenres,
        reuseScopes: options.reuseScopes,
        bundledAssetStatuses: options.bundledAssetStatuses,
        animated: options.animated,
        limit: perProviderLimit
      });
    } catch (error) {
      errors.push({ provider: providerId, message: error instanceof Error ? error.message : String(error) });
      return [];
    }
  }));

  const ranked = groups.flat()
    .map(asset => score(asset, options))
    .filter((asset): asset is RankedAsset => Boolean(asset))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  return { results: ranked.slice(0, Math.max(1, Math.min(options.limit ?? 20, 100))), errors };
}
