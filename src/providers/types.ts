export type AssetProviderId = "polyhaven" | "kenney" | "quaternius" | "kaykit" | "godotdemos" | "gameicons" | "tablericons" | "phaser" | "raylib" | "googlefonts" | "openverse" | "godotassetlib" | "ambientcg" | "githubcode";
export type AssetDimension = "2D" | "3D" | "audio" | "font" | "code" | "mixed";
export type VerificationStatus = "verified" | "needs-review";
export type ReuseScope = "whole-project" | "code-only" | "reference-only" | "asset-only";
export type BundledAssetStatus = "none" | "same-license" | "separately-licensed" | "needs-review";
export type AdoptionHintAction = "keep" | "replace" | "review" | "remove";
export type AdoptionHintTarget = "path" | "system" | "asset-category" | "dependency" | "notice";

export interface ComponentLicense {
  scope: string;
  license: string;
  licenseSource: string;
  commercialUse: boolean | "unknown";
  attribution: boolean | "unknown";
  shareAlike: boolean | "unknown";
  notes?: string;
}

export interface AdoptionHint {
  action: AdoptionHintAction;
  targetType: AdoptionHintTarget;
  target: string;
  reason: string;
  required?: boolean;
}

export interface ProviderSearchOptions {
  query: string;
  categories?: string[];
  engines?: string[];
  dimensions?: AssetDimension[];
  styles?: string[];
  formats?: string[];
  assetTypes?: string[];
  gameGenres?: string[];
  reuseScopes?: ReuseScope[];
  bundledAssetStatuses?: BundledAssetStatus[];
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
  popularity?: number;
  updatedAt?: string;
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