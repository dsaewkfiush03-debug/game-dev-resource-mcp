import type {
  AssetProvider,
  AssetProviderId,
  ProviderAsset,
  ProviderSearchOptions,
  AssetDimension,
  VerificationStatus,
  ReuseScope,
  BundledAssetStatus,
  ComponentLicense,
  AdoptionHint
} from "./types.js";

export interface CatalogLicenseProfile {
  license: string;
  licenseSource: string;
  commercialUse: true;
  modification: true;
  redistribution: true;
  attribution: boolean;
  shareAlike: boolean;
}

export interface VerifiedCatalogEntry {
  id: string;
  name: string;
  sourceUrl: string;
  licenseSource?: string;
  licenseProfile?: CatalogLicenseProfile;
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
  adoptionHints?: AdoptionHint[];
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
  adoptionHints?: AdoptionHint[];
}

const PROVIDER_REUSE_DEFAULTS: Partial<Record<AssetProviderId, CatalogReuseDefaults>> = {
  godotdemos: {
    reuseScope: "whole-project",
    bundledAssetStatus: "same-license",
    bundledAssetNotes: "The Godot demo repository states that demos are distributed under the repository MIT license. Preserve the MIT notice when reusing a demo.",
    adoptionHints: [
      { action: "keep", targetType: "system", target: "project structure and demonstrated gameplay systems", reason: "Official demo metadata supports whole-project reuse under the repository MIT license." },
      { action: "review", targetType: "dependency", target: "external services, plugins or dependencies introduced after adoption", reason: "The demo license does not automatically clear dependencies added by the adopting project.", required: true }
    ]
  },
  phaser: {
    reuseScope: "code-only",
    bundledAssetStatus: "needs-review",
    bundledAssetNotes: "Phaser starter repositories are useful code/templates, but example images/logos are not blanket-approved by this project. Replace or independently verify bundled media before shipping.",
    adoptionHints: [
      { action: "keep", targetType: "system", target: "starter source structure and build configuration", reason: "The maintained Phaser starter is intended as a reusable code skeleton under MIT." },
      { action: "replace", targetType: "asset-category", target: "example images, logos and bundled presentation media", reason: "Bundled media is not blanket-cleared by this catalog entry.", required: true }
    ]
  }
};

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
  const effectiveDefaults = reuseDefaults ?? PROVIDER_REUSE_DEFAULTS[id];
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
          const effectiveReuseScope = entry.reuseScope ?? effectiveDefaults?.reuseScope;
          const effectiveBundledAssetStatus = entry.bundledAssetStatus ?? effectiveDefaults?.bundledAssetStatus;
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
        .map(entry => {
          const effectiveLicense = entry.licenseProfile ?? license;
          const { licenseProfile: _licenseProfile, ...entryData } = entry;
          return {
            ...effectiveDefaults,
            ...entryData,
            provider: id,
            ...effectiveLicense,
            verificationStatus: entry.verificationStatus ?? verification?.verificationStatus,
            verifiedAt: entry.verifiedAt ?? verification?.verifiedAt,
            licenseSource: entry.licenseSource ?? effectiveLicense.licenseSource,
            reuseScope: entry.reuseScope ?? effectiveDefaults?.reuseScope,
            bundledAssetStatus: entry.bundledAssetStatus ?? effectiveDefaults?.bundledAssetStatus,
            bundledAssetNotes: entry.bundledAssetNotes ?? effectiveDefaults?.bundledAssetNotes,
            componentLicenses: entry.componentLicenses ?? effectiveDefaults?.componentLicenses,
            adoptionHints: entry.adoptionHints ?? effectiveDefaults?.adoptionHints,
            retrievedAt
          };
        });
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
