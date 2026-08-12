export type AssetProviderId = "polyhaven";

export interface ProviderSearchOptions {
  query: string;
  categories?: string[];
  limit?: number;
}

export interface ProviderAsset {
  id: string;
  name: string;
  provider: AssetProviderId;
  sourceUrl: string;
  description?: string;
  categories: string[];
  tags: string[];
  license: string;
  licenseSource: string;
  commercialUse: boolean | "unknown";
  modification: boolean | "unknown";
  redistribution: boolean | "unknown";
  attribution: boolean | "unknown";
  shareAlike: boolean | "unknown";
  apiAttributionRequired?: boolean;
  retrievedAt: string;
}

export interface AssetProvider {
  id: AssetProviderId;
  name: string;
  search(options: ProviderSearchOptions): Promise<ProviderAsset[]>;
}
