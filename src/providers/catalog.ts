import type {
  AssetProvider,
  AssetProviderId,
  ProviderAsset,
  ProviderSearchOptions,
  AssetDimension,
  VerificationStatus,
  ReuseScope,
  BundledAssetStatus,
  ComponentLicense
} from "./types.js";

export interface VerifiedCatalogEntry {
  id: string;
  name: string;
  sourceUrl: string;
  licenseSource?: string;
  description?: string;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
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
  reuseScope?: ReuseScope;
  bundledAssetStatus?: BundledAssetStatus;
  bundledAssetNotes?: string;
  componentLicenses?: ComponentLicense[];
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

export interface CatalogVerificationProfile {
  verificationStatus: VerificationStatus;
  verifiedAt: string;
}

export interface CatalogReuseDefaults {
  reuseScope?: ReuseScope;
  bundledAssetStatus?: BundledAssetStatus;
  bundledAssetNotes?: string;
  componentLicenses?: ComponentLicense[];
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
  entries: VerifiedCatalogEntry[],
  verification?: CatalogVerificationProfile,
  reuseDefaults?: CatalogReuseDefaults
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
        reuseScopes = [],
        bundledAssetStatuses = [],
        animated,
        limit = 20
      } = options;
      const q = query.trim().toLowerCase();
      const retrievedAt = new Date().toISOString();

      return entries
        .filter(entry => {
          const effectiveReuseScope = entry.reuseScope ?? reuseDefaults?.reuseScope;
          const effectiveBundledAssetStatus = entry.bundledAssetStatus ?? reuseDefaults?.bundledAssetStatus;
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
            entry.resolution ?? "",
            effectiveReuseScope ?? "",
            effectiveBundledAssetStatus ?? ""
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
            && (reuseScopes.length === 0 || (effectiveReuseScope ? reuseScopes.includes(effectiveReuseScope) : false))
            && (bundledAssetStatuses.length === 0 || (effectiveBundledAssetStatus ? bundledAssetStatuses.includes(effectiveBundledAssetStatus) : false))
            && exactOptionalMatch(entry.animated, animated);
        })
        .slice(0, Math.max(1, Math.min(limit, 100)))
        .map(entry => ({
          ...reuseDefaults,
          ...entry,
          provider: id,
          ...license,
          verificationStatus: entry.verificationStatus ?? verification?.verificationStatus,
          verifiedAt: entry.verifiedAt ?? verification?.verifiedAt,
          licenseSource: entry.licenseSource ?? license.licenseSource,
          reuseScope: entry.reuseScope ?? reuseDefaults?.reuseScope,
          bundledAssetStatus: entry.bundledAssetStatus ?? reuseDefaults?.bundledAssetStatus,
          bundledAssetNotes: entry.bundledAssetNotes ?? reuseDefaults?.bundledAssetNotes,
          componentLicenses: entry.componentLicenses ?? reuseDefaults?.componentLicenses,
          retrievedAt
        }));
    }
  };
}

export function createCc0CatalogProvider(
  id: AssetProviderId,
  name: string,
  licenseSource: string,
  entries: VerifiedCatalogEntry[],
  verification?: CatalogVerificationProfile,
  reuseDefaults?: CatalogReuseDefaults
): AssetProvider {
  return createVerifiedCatalogProvider(id, name, {
    license: "CC0-1.0",
    licenseSource,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false
  }, entries, verification, reuseDefaults);
}