import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderFile, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const REPOSITORY = "tabler/tabler-icons";
const BRANCH = "main";
const LICENSE_SOURCE = "https://github.com/tabler/tabler-icons/blob/main/LICENSE";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;

type Variant = "outline" | "filled";

interface GithubContentItem {
  name?: string;
  path?: string;
  type?: string;
  sha?: string;
}
export interface TablerTreeItem {
  path?: string;
  type?: string;
  size?: number;
  sha?: string;
}
interface GithubTreeResponse {
  tree?: TablerTreeItem[];
  truncated?: boolean;
}

let treePromise: Promise<Array<{ variant: Variant; item: TablerTreeItem }>> | undefined;

function titleFromSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function encodedPath(pathValue: string): string {
  return pathValue.split("/").map(segment => encodeURIComponent(segment)).join("/");
}

export function mapTablerIconTreeItem(item: TablerTreeItem, variant: Variant, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const relativePath = item.path?.trim();
  if (!relativePath || item.type !== "blob" || !relativePath.toLowerCase().endsWith(".svg")) return undefined;
  const filename = relativePath.split("/").at(-1) ?? "";
  const slug = filename.replace(/\.svg$/i, "");
  if (!slug) return undefined;
  const fullPath = `icons/${variant}/${relativePath}`;
  const tokens = slug.split(/[-_]+/).map(value => value.toLowerCase()).filter(Boolean);

  return {
    id: fullPath,
    name: titleFromSlug(slug),
    provider: "tablericons",
    sourceUrl: `https://github.com/${REPOSITORY}/blob/${BRANCH}/${encodedPath(fullPath)}`,
    description: `Tabler Icons ${variant} SVG icon.`,
    creator: "Tabler Icons",
    creatorUrl: "https://github.com/tabler/tabler-icons",
    attributionText: "Tabler Icons, MIT License.",
    categories: ["2D", "Icons"],
    tags: Array.from(new Set([...tokens, "icon", "ui", variant, "tabler"])),
    dimension: "2D",
    style: [variant, "vector"],
    formats: ["svg"],
    assetTypes: ["icon", "ui"],
    license: "MIT",
    licenseSource: LICENSE_SOURCE,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: true,
    shareAlike: false,
    retrievedAt
  };
}

async function githubJson(pathValue: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": "2026-03-10"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${API_BASE}${pathValue}`, { headers });
  if (!response.ok) throw new Error(`GitHub Tabler Icons API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function loadTree(): Promise<Array<{ variant: Variant; item: TablerTreeItem }>> {
  treePromise ??= (async () => {
    const contents = await githubJson(`/repos/${REPOSITORY}/contents/icons?ref=${BRANCH}`) as GithubContentItem[];
    const result: Array<{ variant: Variant; item: TablerTreeItem }> = [];
    for (const variant of ["outline", "filled"] as const) {
      const directory = contents.find(item => item.type === "dir" && item.name === variant);
      if (!directory?.sha) throw new Error(`tablericons_missing_${variant}_tree`);
      const response = await githubJson(`/repos/${REPOSITORY}/git/trees/${directory.sha}?recursive=1`) as GithubTreeResponse;
      if (response.truncated) throw new Error(`tablericons_${variant}_tree_truncated`);
      for (const item of response.tree ?? []) {
        if (item.type === "blob" && item.path?.toLowerCase().endsWith(".svg")) result.push({ variant, item });
      }
    }
    return result;
  })();
  return treePromise;
}

function valuesMatch(values: string[] | undefined, wanted: string[] | undefined): boolean {
  if (!wanted?.length) return true;
  const normalized = (values ?? []).map(value => value.toLowerCase());
  return wanted.every(filter => normalized.some(value => value.includes(filter.toLowerCase())));
}

function matches(asset: ProviderAsset, options: ProviderSearchOptions): boolean {
  if (options.dimensions?.length && !options.dimensions.includes("2D")) return false;
  if (!valuesMatch(asset.categories, options.categories)) return false;
  if (!valuesMatch(asset.style, options.styles)) return false;
  if (!valuesMatch(asset.formats, options.formats)) return false;
  if (!valuesMatch(asset.assetTypes, options.assetTypes)) return false;

  const q = options.query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [asset.name, ...asset.tags, ...asset.categories, ...(asset.assetTypes ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).filter(Boolean).every(token => token === "icon" || token === "icons" || haystack.includes(token));
}

export const tablerIconsProvider: AssetProvider = {
  id: "tablericons",
  name: "Tabler Icons",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const retrievedAt = new Date().toISOString();
    const tree = await loadTree();
    const results: ProviderAsset[] = [];
    for (const entry of tree) {
      const asset = mapTablerIconTreeItem(entry.item, entry.variant, retrievedAt);
      if (asset && matches(asset, options)) results.push(asset);
      if (results.length >= limit) break;
    }
    return results;
  },
  async getFiles(assetId: string): Promise<ProviderFile[]> {
    const tree = await loadTree();
    const match = tree.find(entry => `icons/${entry.variant}/${entry.item.path}` === assetId && entry.item.type === "blob");
    if (!match?.item.path) return [];
    const fullPath = `icons/${match.variant}/${match.item.path}`;
    return [{
      path: fullPath,
      url: `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/${encodedPath(fullPath)}`,
      size: match.item.size,
      format: "svg"
    }];
  }
};
