import type { LicenseRule } from "../types.js";
import { checkLicense } from "../licenses.js";
import type { AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://godotengine.org/asset-library/api";
const DEFAULT_GODOT_VERSION = "4.7";
const USER_AGENT = "game-dev-resource-mcp/1.3.0 (+https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp)";

interface GodotAssetListItem {
  asset_id?: string;
  title?: string;
  author?: string;
  category?: string;
  godot_version?: string;
  rating?: string;
  cost?: string;
  support_level?: string;
  icon_url?: string;
  version_string?: string;
  modify_date?: string;
}
interface GodotAssetListResponse { result?: GodotAssetListItem[] }

function boolOrUnknown(value: boolean | "depends"): boolean | "unknown" {
  return value === "depends" ? "unknown" : value;
}

export function normalizeGodotLicense(input?: string): string {
  const raw = (input ?? "").trim();
  const normalized = raw.toLowerCase().replace(/\s+/g, " ");
  if (!raw) return "NO-LICENSE";
  if (normalized === "mit" || normalized === "mit license") return "MIT";
  if (["gplv3", "gpl v3", "gpl-3.0", "gpl 3.0"].includes(normalized)) return "GPL-3.0";
  if (["gplv2", "gpl v2", "gpl-2.0", "gpl 2.0"].includes(normalized)) return "GPL-2.0";
  if (["lgplv3", "lgpl v3", "lgpl-3.0", "lgpl 3.0"].includes(normalized)) return "LGPL-3.0";
  if (["lgplv2.1", "lgpl v2.1", "lgpl-2.1", "lgpl 2.1"].includes(normalized)) return "LGPL-2.1";
  if (["apache 2.0", "apache-2.0", "apache license 2.0"].includes(normalized)) return "Apache-2.0";
  if (["cc0", "cc0 1.0"].includes(normalized)) return "CC0-1.0";
  if (["bsd 2-clause", "bsd-2-clause"].includes(normalized)) return "BSD-2-Clause";
  if (["bsd 3-clause", "bsd-3-clause"].includes(normalized)) return "BSD-3-Clause";
  if (["zlib", "zlib/libpng"].includes(normalized)) return "Zlib";
  if (["boost", "boost software license", "bsl-1.0"].includes(normalized)) return "BSL-1.0";
  return raw;
}

function rightsFor(license: string): Pick<ProviderAsset, "commercialUse" | "modification" | "redistribution" | "attribution" | "shareAlike"> {
  const rule: LicenseRule | undefined = checkLicense(license);
  if (!rule) return { commercialUse: "unknown", modification: "unknown", redistribution: "unknown", attribution: "unknown", shareAlike: "unknown" };
  return {
    commercialUse: boolOrUnknown(rule.commercialUse),
    modification: boolOrUnknown(rule.modification),
    redistribution: boolOrUnknown(rule.redistribution),
    attribution: boolOrUnknown(rule.attribution),
    shareAlike: boolOrUnknown(rule.shareAlike)
  };
}

export function mapGodotAsset(item: GodotAssetListItem, retrievedAt = new Date().toISOString()): ProviderAsset {
  const id = item.asset_id?.trim() || "unknown";
  const license = normalizeGodotLicense(item.cost);
  const category = item.category?.trim() || "Godot Asset";
  const tags = Array.from(new Set([
    "godot",
    "addon",
    category.toLowerCase(),
    item.support_level?.toLowerCase() ?? "",
    item.godot_version ? `godot-${item.godot_version}` : ""
  ].filter(Boolean)));

  return {
    id,
    name: item.title?.trim() || `Godot Asset ${id}`,
    provider: "godotassetlib",
    sourceUrl: `https://godotengine.org/asset-library/asset/${encodeURIComponent(id)}`,
    description: [item.author ? `Author: ${item.author}.` : "", item.support_level ? `Support: ${item.support_level}.` : "", item.godot_version ? `Godot ${item.godot_version}.` : ""].filter(Boolean).join(" ") || undefined,
    categories: [category, "Code", "Godot"],
    tags,
    engine: ["godot"],
    dimension: "code",
    formats: ["godot"],
    assetTypes: ["plugin", "addon", "code", category.toLowerCase().includes("template") ? "starter" : "example"],
    license,
    licenseSource: `https://godotengine.org/asset-library/asset/${encodeURIComponent(id)}`,
    ...rightsFor(license),
    retrievedAt
  };
}

async function apiJson(path: string): Promise<GodotAssetListResponse> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Godot Asset Library API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<GodotAssetListResponse>;
}

export const godotAssetLibraryProvider: AssetProvider = {
  id: "godotassetlib",
  name: "Godot Asset Library",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    if (options.engines?.length && !options.engines.some(engine => engine.toLowerCase().includes("godot"))) return [];
    if (options.dimensions?.length && !options.dimensions.includes("code")) return [];

    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const params = new URLSearchParams({
      type: "any",
      support: "official+featured+community",
      filter: options.query,
      godot_version: process.env.GODOT_VERSION?.trim() || DEFAULT_GODOT_VERSION,
      max_results: String(limit),
      page: "0",
      sort: "updated",
      reverse: "true"
    });
    const data = await apiJson(`/asset?${params.toString()}`);
    const retrievedAt = new Date().toISOString();
    return (data.result ?? []).map(item => mapGodotAsset(item, retrievedAt));
  }
};
