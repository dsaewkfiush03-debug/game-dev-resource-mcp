import { checkLicense } from "./licenses.js";
import { getProvider, listProviders, type AssetProviderId, type ProviderAsset } from "./providers/index.js";

export type ProviderMode = "live-api" | "verified-catalog";

export interface UnifiedSearchOptions {
  query: string;
  categories?: string[];
  providers?: AssetProviderId[];
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
  kenney: "verified-catalog",
  quaternius: "verified-catalog"
};

function tokens(input: string): string[] {
  return Array.from(new Set(input.toLowerCase().trim().split(/\s+/).filter(Boolean)));
}

function contains(value: string | undefined, token: string): boolean {
  return (value ?? "").toLowerCase().includes(token);
}

export function scoreAsset(asset: ProviderAsset, query: string): { score: number; matchReasons: string[] } {
  const queryTokens = tokens(query);
  let score = 0;
  const reasons: string[] = [];

  for (const token of queryTokens) {
    if (contains(asset.name, token)) {
      score += 8;
      reasons.push(`name:${token}`);
    }
    if (asset.tags.some(tag => contains(tag, token))) {
      score += 5;
      reasons.push(`tag:${token}`);
    }
    if (asset.categories.some(category => contains(category, token))) {
      score += 4;
      reasons.push(`category:${token}`);
    }
    if (contains(asset.description, token)) {
      score += 2;
      reasons.push(`description:${token}`);
    }
  }

  if (asset.commercialUse === true) {
    score += 5;
    reasons.push("commercial-use-confirmed");
  }
  if (asset.attribution === false) {
    score += 2;
    reasons.push("no-asset-attribution-required");
  }
  if (asset.shareAlike === false) {
    score += 1;
    reasons.push("no-share-alike");
  }
  if (asset.licenseSource) {
    score += 1;
    reasons.push("license-source-present");
  }

  return { score, matchReasons: Array.from(new Set(reasons)) };
}

export function rankAssets(
  assets: ProviderAsset[],
  query: string,
  options: Pick<UnifiedSearchOptions, "commercialOnly" | "allowAttribution" | "allowShareAlike"> = {}
): RankedAsset[] {
  const commercialOnly = options.commercialOnly ?? true;
  const allowAttribution = options.allowAttribution ?? true;
  const allowShareAlike = options.allowShareAlike ?? false;

  return assets
    .filter(asset => !commercialOnly || asset.commercialUse === true)
    .filter(asset => allowAttribution || asset.attribution === false)
    .filter(asset => allowShareAlike || asset.shareAlike === false)
    .map(asset => {
      const licenseRule = checkLicense(asset.license);
      const ranked = scoreAsset(asset, query);
      return {
        ...asset,
        ...ranked,
        licenseRisk: licenseRule?.risk ?? "unknown",
        providerMode: MODE_BY_PROVIDER[asset.provider]
      };
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

  const settled = await Promise.allSettled(
    searchedProviders.map(async providerId => {
      const provider = getProvider(providerId);
      const results = await provider.search({
        query: options.query,
        categories: options.categories ?? [],
        limit: perProviderLimit
      });
      return { providerId, results };
    })
  );

  const assets: ProviderAsset[] = [];
  const errors: ProviderSearchError[] = [];

  settled.forEach((result, index) => {
    const provider = searchedProviders[index];
    if (result.status === "fulfilled") {
      assets.push(...result.value.results);
    } else {
      errors.push({
        provider,
        message: result.reason instanceof Error ? result.reason.message : String(result.reason)
      });
    }
  });

  const ranked = rankAssets(assets, options.query, options).slice(0, Math.max(1, Math.min(options.limit ?? 20, 100)));
  return { results: ranked, errors, searchedProviders };
}
