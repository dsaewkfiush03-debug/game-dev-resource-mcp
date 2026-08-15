import type { LicenseRule } from "../types.js";
import { checkLicense } from "../licenses.js";
import type { AssetDimension, AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.openverse.org/v1";
const USER_AGENT = "game-dev-resource-mcp/1.3.0 (+https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp)";

interface OpenverseTag { name?: string }
interface OpenverseItem {
  id?: string;
  title?: string;
  creator?: string;
  creator_url?: string;
  license?: string;
  license_version?: string;
  license_url?: string;
  foreign_landing_url?: string;
  url?: string;
  source?: string;
  category?: string;
  filetype?: string;
  tags?: OpenverseTag[];
  attribution?: string;
  mature?: boolean;
}
interface OpenverseSearchResponse { results?: OpenverseItem[] }

function boolOrUnknown(value: boolean | "depends"): boolean | "unknown" {
  return value === "depends" ? "unknown" : value;
}

export function normalizeOpenverseLicense(code?: string, version?: string): string {
  const c = (code ?? "").trim().toLowerCase();
  const v = (version ?? "").trim() || "4.0";
  if (c === "cc0") return "CC0-1.0";
  if (c === "pdm") return "PDM-1.0";
  if (c === "by") return `CC-BY-${v}`;
  if (c === "by-sa") return `CC-BY-SA-${v}`;
  if (c === "by-nc") return `CC-BY-NC-${v}`;
  if (c === "by-nc-sa") return `CC-BY-NC-SA-${v}`;
  if (c === "by-nd") return `CC-BY-ND-${v}`;
  if (c === "by-nc-nd") return `CC-BY-NC-ND-${v}`;
  return c ? `OPENVERSE:${c}${version ? `-${version}` : ""}` : "NO-LICENSE";
}

function rightsFor(license: string): Pick<ProviderAsset, "commercialUse" | "modification" | "redistribution" | "attribution" | "shareAlike"> {
  const known: LicenseRule | undefined = checkLicense(license);
  if (known) {
    return {
      commercialUse: boolOrUnknown(known.commercialUse),
      modification: boolOrUnknown(known.modification),
      redistribution: boolOrUnknown(known.redistribution),
      attribution: boolOrUnknown(known.attribution),
      shareAlike: boolOrUnknown(known.shareAlike)
    };
  }

  const upper = license.toUpperCase();
  if (upper.includes("-NC-")) {
    return { commercialUse: false, modification: "unknown", redistribution: true, attribution: true, shareAlike: upper.includes("-SA-") };
  }
  if (upper.includes("-ND-")) {
    return { commercialUse: true, modification: false, redistribution: true, attribution: true, shareAlike: false };
  }
  return { commercialUse: "unknown", modification: "unknown", redistribution: "unknown", attribution: "unknown", shareAlike: "unknown" };
}

export function mapOpenverseItem(item: OpenverseItem, dimension: "2D" | "audio", retrievedAt = new Date().toISOString()): ProviderAsset {
  const license = normalizeOpenverseLicense(item.license, item.license_version);
  const rights = rightsFor(license);
  const tags = Array.from(new Set((item.tags ?? []).map(tag => tag.name?.trim().toLowerCase()).filter((value): value is string => Boolean(value))));
  const source = item.source?.trim();
  const creator = item.creator?.trim();
  const description = [creator ? `Creator: ${creator}.` : "", source ? `Indexed source: ${source}.` : "", item.attribution?.trim() ?? ""].filter(Boolean).join(" ");

  return {
    id: item.id ?? `${dimension}-${item.title ?? "untitled"}`,
    name: item.title?.trim() || "Untitled Openverse media",
    provider: "openverse",
    sourceUrl: item.foreign_landing_url || item.url || `https://openverse.org/search/?q=${encodeURIComponent(item.title ?? "")}`,
    description: description || undefined,
    categories: [dimension === "audio" ? "Audio" : "2D", ...(item.category ? [item.category] : []), ...(source ? [source] : [])],
    tags,
    dimension,
    formats: item.filetype ? [item.filetype.toLowerCase()] : undefined,
    assetTypes: dimension === "audio" ? ["audio", "sfx", "music", "ambience"] : ["image", "reference", "texture", "background"],
    license,
    licenseSource: item.license_url || item.foreign_landing_url || "https://openverse.org/",
    ...rights,
    retrievedAt
  };
}

async function apiJson(path: string): Promise<OpenverseSearchResponse> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json", "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`Openverse API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<OpenverseSearchResponse>;
}

async function searchMedia(kind: "images" | "audio", options: ProviderSearchOptions, limit: number): Promise<ProviderAsset[]> {
  const params = new URLSearchParams({ q: options.query || "game", page_size: String(Math.max(1, Math.min(limit, 100))), page: "1" });
  const data = await apiJson(`/${kind}/?${params.toString()}`);
  const dimension = kind === "audio" ? "audio" : "2D";
  const retrievedAt = new Date().toISOString();
  return (data.results ?? [])
    .filter(item => item.mature !== true)
    .map(item => mapOpenverseItem(item, dimension, retrievedAt));
}

function wantsDimension(dimensions: AssetDimension[] | undefined, wanted: AssetDimension): boolean {
  return !dimensions?.length || dimensions.includes(wanted);
}

export const openverseProvider: AssetProvider = {
  id: "openverse",
  name: "Openverse",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const tasks: Array<Promise<ProviderAsset[]>> = [];
    if (wantsDimension(options.dimensions, "2D")) tasks.push(searchMedia("images", options, limit));
    if (wantsDimension(options.dimensions, "audio")) tasks.push(searchMedia("audio", options, limit));
    if (tasks.length === 0) return [];
    const settled = await Promise.allSettled(tasks);
    const results = settled.flatMap(result => result.status === "fulfilled" ? result.value : []);
    if (results.length === 0 && settled.every(result => result.status === "rejected")) {
      const first = settled.find(result => result.status === "rejected") as PromiseRejectedResult | undefined;
      throw first?.reason instanceof Error ? first.reason : new Error(String(first?.reason ?? "Openverse search failed"));
    }
    return results.slice(0, limit);
  }
};
