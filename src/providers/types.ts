export type AssetProviderId = "polyhaven" | "kenney" | "quaternius" | "godotdemos" | "gameicons" | "tablericons" | "phaser" | "googlefonts" | "openverse" | "godotassetlib" | "ambientcg" | "githubcode";
export type AssetDimension = "2D" | "3D" | "audio" | "font" | "code" | "mixed";

export interface ProviderSearchOptions {
  query: string;
  categories?: string[];
  engines?: string[];
  dimensions?: AssetDimension[];
  styles?: string[];
  formats?: string[];
  assetTypes?: string[];
  gameGenres?: string[];
  animated?: boolean;
  limit?: number;
}

export interface ProviderAsset {
  id: string;
  name: string;
  provider: AssetProviderId;
  sourceUrl: string;
  description?: string;
  creator?: string;
  creatorUrl?: string;
  attributionText?: string;
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

export interface ProviderFile {
  path: string;
  url: string;
  size?: number;
  md5?: string;
  format?: string;
  resolution?: string;
}

export interface AssetProvider {
  id: AssetProviderId;
  name: string;
  search(options: ProviderSearchOptions): Promise<ProviderAsset[]>;
  getFiles?(assetId: string): Promise<ProviderFile[]>;
}