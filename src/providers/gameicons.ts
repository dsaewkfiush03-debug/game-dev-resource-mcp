import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderFile, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const REPOSITORY = "game-icons/icons";
const BRANCH = "master";
const LICENSE_SOURCE = "https://github.com/game-icons/icons/blob/master/README.md";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;

export interface GithubTreeItem {
  path?: string;
  type?: string;
  size?: number;
  sha?: string;
}
interface GithubTreeResponse {
  tree?: GithubTreeItem[];
  truncated?: boolean;
}

let treePromise: Promise<GithubTreeItem[]> | undefined;

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

function iconParts(pathValue: string): { creator: string; slug: string } | undefined {
  const parts = pathValue.split("/").filter(Boolean);
  if (parts.length < 2 || !pathValue.toLowerCase().endsWith(".svg")) return undefined;
  const creator = parts[0];
  const filename = parts.at(-1) ?? "";
  const slug = filename.replace(/\.svg$/i, "");
  if (!creator || !slug) return undefined;
  return { creator, slug };
}

export function mapGameIconTreeItem(item: GithubTreeItem, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const pathValue = item.path?.trim();
  if (!pathValue || item.type !== "blob") return undefined;
  const parts = iconParts(pathValue);
  if (!parts) return undefined;
  const slugTokens = parts.slug.split(/[-_]+/).map(value => value.toLowerCase()).filter(Boolean);
  const creator = parts.creator;

  return {
    id: pathValue,
    name: titleFromSlug(parts.slug),
    provider: "gameicons",
    sourceUrl: `https://github.com/${REPOSITORY}/blob/${BRANCH}/${encodedPath(pathValue)}`,
    description: `Game icon by ${creator}.`,
    creator,
    creatorUrl: `https://github.com/${REPOSITORY}/tree/${BRANCH}/${encodeURIComponent(creator)}`,
    attributionText: `Icon by ${creator}, licensed under CC BY 3.0.`,
    categories: ["2D", "Icons"],
    tags: Array.from(new Set([...slugTokens, "icon", "ui", creator.toLowerCase()])),
    dimension: "2D",
    style: ["monochrome", "vector"],
    formats: ["svg"],
    assetTypes: ["icon", "ui"],
    license: "CC-BY-3.0",
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
  if (!response.ok) throw new Error(`GitHub Game Icons API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function loadTree(): Promise<GithubTreeItem[]> {
  treePromise ??= (async () => {
    const response = await githubJson(`/repos/${REPOSITORY}/git/trees/${BRANCH}?recursive=1`) as GithubTreeResponse;
    if (response.truncated) throw new Error("gameicons_tree_truncated");
    return (response.tree ?? []).filter(item => item.type === "blob" && item.path?.toLowerCase().endsWith(".svg"));
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
  const haystack = [asset.name, asset.creator ?? "", ...asset.tags, ...asset.categories, ...(asset.assetTypes ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).filter(Boolean).every(token => token === "icon" || token === "icons" || haystack.includes(token));
}

export const gameIconsProvider: AssetProvider = {
  id: "gameicons",
  name: "Game Icons",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const retrievedAt = new Date().toISOString();
    const tree = await loadTree();
    const results: ProviderAsset[] = [];
    for (const item of tree) {
      const asset = mapGameIconTreeItem(item, retrievedAt);
      if (asset && matches(asset, options)) results.push(asset);
      if (results.length >= limit) break;
    }
    return results;
  },
  async getFiles(assetId: string): Promise<ProviderFile[]> {
    const tree = await loadTree();
    const item = tree.find(entry => entry.path === assetId && entry.type === "blob");
    if (!item?.path) return [];
    return [{
      path: item.path,
      url: `https://raw.githubusercontent.com/${REPOSITORY}/${BRANCH}/${encodedPath(item.path)}`,
      size: item.size,
      format: "svg"
    }];
  }
};
