export type LicenseRisk = "safe" | "attribution" | "conditional" | "reject" | "unknown";

export interface ResourceRecord {
  id: string;
  name: string;
  kind: "asset" | "audio" | "code" | "tool" | "project";
  source: string;
  sourceUrl: string;
  license: string;
  licenseSource?: string;
  commercialUse: boolean | "unknown";
  modification: boolean | "unknown";
  redistribution: boolean | "unknown";
  attribution: boolean | "unknown";
  shareAlike: boolean | "unknown";
  apiRequired: boolean;
  authType?: "none" | "api_key" | "oauth" | "account" | "unknown";
  tags: string[];
  notes?: string;
}

export interface LicenseRule {
  id: string;
  aliases: string[];
  risk: LicenseRisk;
  commercialUse: boolean | "depends";
  modification: boolean | "depends";
  redistribution: boolean | "depends";
  attribution: boolean | "depends";
  shareAlike: boolean | "depends";
  notes: string;
}
