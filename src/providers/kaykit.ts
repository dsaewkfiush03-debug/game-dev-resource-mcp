import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const ORG = "KayKit-Game-Assets";
const CREATOR = "Kay Lousberg";
const CREATOR_URL = "https://kaylousberg.com/";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;

interface GithubRepoRaw {
  name?: string;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  default_branch?: string;
  stargazers_count?: number;
  updated_at?: string;
  archived?: boolean;
  fork?: boolean;
  topics?: string[];
}
interface GithubSearchResponse { items?: GithubRepoRaw[] }

let repositoryPromise: Promise<GithubRepoRaw[]> | undefined;

function normalizedPackName(repoName: string): string {
  return repoName
    .replace(/^KayKit-/i, "KayKit - ")
    .replace(/-1\.0$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokensFromRepo(repo: GithubRepoRaw): string[] {
  const name = (repo.name ?? "").toLowerCase();
  const description = (repo.description ?? "").toLowerCase();
  const words = `${name} ${description}`.split(/[^a-z0-9]+/).filter(Boolean);
  return Array.from(new Set([...words, ...(repo.topics ?? []).map(topic => topic.toLowerCase()), "kaykit", "low-poly", "3d", "cc0"]));
}

function inferTypes(repo: GithubRepoRaw): string[] {
  const text = `${repo.name ?? ""} ${repo.description ?? ""}`.toLowerCase();
  const types = new Set<string>(["model", "prop"]);
  if (text.includes("character") || text.includes("skeleton")) types.add("character");
  if (["dungeon", "city", "medieval", "space", "restaurant", "furniture", "halloween", "prototype"].some(term => text.includes(term))) types.add("environment");
  if (text.includes("city")) types.add("building");
  if (text.includes("dungeon") || text.includes("medieval")) types.add("weapon");
  return Array.from(types);
}

function inferGenres(repo: GithubRepoRaw): string[] {
  const text = `${repo.name ?? ""} ${repo.description ?? ""}`.toLowerCase();
  const genres = new Set<string>();
  if (text.includes("dungeon") || text.includes("medieval") || text.includes("character") || text.includes("skeleton")) genres.add("rpg");
  if (text.includes("city")) { genres.add("simulation"); genres.add("strategy"); }
  if (text.includes("space")) genres.add("sci-fi");
  if (text.includes("halloween") || text.includes("skeleton")) genres.add("horror");
  return Array.from(genres);
}

export function mapKayKitRepository(repo: GithubRepoRaw, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const fullName = repo.full_name?.trim();
  const sourceUrl = repo.html_url?.trim();
  if (!fullName || !sourceUrl || repo.archived || repo.fork || !fullName.startsWith(`${ORG}/`)) return undefined;
  const branch = repo.default_branch?.trim() || "main";
  const tags = tokensFromRepo(repo);
  const types = inferTypes(repo);
  const animated = types.includes("character") ? true : undefined;

  return {
    id: fullName,
    name: normalizedPackName(repo.name ?? fullName.split("/").at(-1) ?? fullName),
    provider: "kaykit",
    sourceUrl,
    description: repo.description ?? undefined,
    creator: CREATOR,
    creatorUrl: CREATOR_URL,
    attributionText: "KayKit by Kay Lousberg — CC0; attribution appreciated but not required.",
    popularity: repo.stargazers_count,
    updatedAt: repo.updated_at,
    categories: ["3D", "KayKit", "Game Assets"],
    tags,
    engine: ["godot", "unity", "unreal"],
    dimension: "3D",
    style: ["low-poly", "stylized"],
    formats: ["gltf", "fbx", "obj"],
    assetTypes: types,
    gameGenres: inferGenres(repo),
    animated,
    license: "CC0-1.0",
    licenseSource: `${sourceUrl}/blob/${encodeURIComponent(branch)}/LICENSE.txt`,
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
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
  if (!response.ok) throw new Error(`GitHub KayKit API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function loadRepositories(): Promise<GithubRepoRaw[]> {
  repositoryPromise ??= (async () => {
    const query = encodeURIComponent(`org:${ORG} archived:false fork:false KayKit`);
    const response = await githubJson(`/search/repositories?q=${query}&sort=updated&order=desc&per_page=100`) as GithubSearchResponse;
    return (response.items ?? []).filter(repo => !repo.archived && !repo.fork && repo.full_name?.startsWith(`${ORG}/`));
  })();
  return repositoryPromise;
}

function valuesMatch(values: string[] | undefined, wanted: string[] | undefined): boolean {
  if (!wanted?.length) return true;
  const normalized = (values ?? []).map(value => value.toLowerCase());
  return wanted.every(filter => normalized.some(value => value.includes(filter.toLowerCase())));
}

function matches(asset: ProviderAsset, options: ProviderSearchOptions): boolean {
  if (options.dimensions?.length && !options.dimensions.includes("3D")) return false;
  if (!valuesMatch(asset.categories, options.categories)) return false;
  if (!valuesMatch(asset.engine, options.engines)) return false;
  if (!valuesMatch(asset.style, options.styles)) return false;
  if (!valuesMatch(asset.formats, options.formats)) return false;
  if (!valuesMatch(asset.assetTypes, options.assetTypes)) return false;
  if (!valuesMatch(asset.gameGenres, options.gameGenres)) return false;
  if (options.animated !== undefined && asset.animated !== options.animated) return false;

  const q = options.query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [asset.name, asset.description ?? "", ...asset.tags, ...(asset.assetTypes ?? []), ...(asset.gameGenres ?? [])].join(" ").toLowerCase();
  return q.split(/\s+/).filter(Boolean).every(token => ["3d", "asset", "assets", "model", "models"].includes(token) || haystack.includes(token));
}

export const kayKitProvider: AssetProvider = {
  id: "kaykit",
  name: "KayKit Game Assets",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const retrievedAt = new Date().toISOString();
    return (await loadRepositories())
      .map(repo => mapKayKitRepository(repo, retrievedAt))
      .filter((asset): asset is ProviderAsset => Boolean(asset))
      .filter(asset => matches(asset, options))
      .slice(0, limit);
  }
};
