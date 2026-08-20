import { checkLicense } from "../licenses.js";
import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const API_VERSION = "2026-03-10";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
const SEARCH_ERROR_CACHE_TTL_MS = 30 * 1000;
const GENERIC_CODE_QUERY_TOKENS = new Set(["system", "plugin", "addon", "game", "library"]);

interface GithubRepoRaw {
  id?: number;
  full_name?: string;
  html_url?: string;
  description?: string | null;
  stargazers_count?: number;
  language?: string | null;
  topics?: string[];
  default_branch?: string;
  archived?: boolean;
  fork?: boolean;
  updated_at?: string;
  license?: { spdx_id?: string | null } | null;
}

interface GithubSearchResponse { items?: GithubRepoRaw[] }
interface SearchCacheEntry {
  expiresAt: number;
  promise: Promise<GithubSearchResponse>;
}

const searchCache = new Map<string, SearchCacheEntry>();
let searchQueue: Promise<void> = Promise.resolve();

function boolOrUnknown(value: boolean | "depends"): boolean | "unknown" {
  return value === "depends" ? "unknown" : value;
}

function inferredEngines(repo: GithubRepoRaw): string[] {
  const text = [repo.full_name ?? "", repo.description ?? "", ...(repo.topics ?? [])].join(" ").toLowerCase();
  return ["godot", "unity", "unreal", "phaser", "bevy", "libgdx", "raylib", "babylon", "threejs", "pixi"]
    .filter(engine => text.includes(engine));
}

export function normalizeGithubCodeQuery(query: string): string {
  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9+.#_-]+/g, " ")
    .split(/\s+/)
    .map(token => token.trim())
    .filter(Boolean)
    .filter(token => !GENERIC_CODE_QUERY_TOKENS.has(token));
  return Array.from(new Set(tokens)).join(" ");
}

export function mapGithubCodeRepo(repo: GithubRepoRaw, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const fullName = repo.full_name?.trim();
  const sourceUrl = repo.html_url?.trim();
  if (!fullName || !sourceUrl) return undefined;

  const spdx = repo.license?.spdx_id?.trim() || "NO-LICENSE";
  const rule = checkLicense(spdx);
  const licenseSource = `${API_BASE}/repos/${fullName}/license`;
  const tags = Array.from(new Set([
    "code", "open-source", "github",
    ...(repo.topics ?? []).map(topic => topic.toLowerCase()),
    ...(repo.language ? [repo.language.toLowerCase()] : []),
    ...inferredEngines(repo)
  ]));

  return {
    id: fullName,
    name: fullName,
    provider: "githubcode",
    sourceUrl,
    description: repo.description ?? undefined,
    popularity: repo.stargazers_count,
    updatedAt: repo.updated_at,
    categories: ["Code", "GitHub"],
    tags,
    engine: inferredEngines(repo),
    dimension: "code",
    formats: repo.language ? [repo.language.toLowerCase()] : undefined,
    assetTypes: ["code", "library", "plugin", "starter"],
    license: rule?.id ?? spdx,
    licenseSource,
    commercialUse: rule ? boolOrUnknown(rule.commercialUse) : "unknown",
    modification: rule ? boolOrUnknown(rule.modification) : "unknown",
    redistribution: rule ? boolOrUnknown(rule.redistribution) : "unknown",
    attribution: rule ? boolOrUnknown(rule.attribution) : "unknown",
    shareAlike: rule ? boolOrUnknown(rule.shareAlike) : "unknown",
    retrievedAt
  };
}

async function githubJson(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": API_VERSION
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`${API_BASE}${path}`, { headers });
  if (!response.ok) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");
    const resource = response.headers.get("x-ratelimit-resource");
    const retryAfter = response.headers.get("retry-after");
    const metadata = [
      resource ? `resource=${resource}` : "",
      remaining ? `remaining=${remaining}` : "",
      reset ? `reset=${reset}` : "",
      retryAfter ? `retry-after=${retryAfter}` : ""
    ].filter(Boolean).join(" ");
    throw new Error(`GitHub API ${response.status}${metadata ? ` (${metadata})` : ""}: ${await response.text()}`);
  }
  return response.json();
}

async function enqueueSearch<T>(work: () => Promise<T>): Promise<T> {
  let release!: () => void;
  const predecessor = searchQueue;
  searchQueue = new Promise<void>(resolve => { release = resolve; });
  await predecessor;
  try {
    return await work();
  } finally {
    release();
  }
}

function cachedRepositorySearch(path: string): Promise<GithubSearchResponse> {
  const now = Date.now();
  const existing = searchCache.get(path);
  if (existing && existing.expiresAt > now) return existing.promise;

  const entry: SearchCacheEntry = {
    expiresAt: now + SEARCH_CACHE_TTL_MS,
    promise: Promise.resolve({})
  };
  entry.promise = enqueueSearch(async () => {
    try {
      return await githubJson(path) as GithubSearchResponse;
    } catch (error) {
      entry.expiresAt = Date.now() + SEARCH_ERROR_CACHE_TTL_MS;
      throw error;
    }
  });
  searchCache.set(path, entry);
  return entry.promise;
}

export const githubCodeProvider: AssetProvider = {
  id: "githubcode",
  name: "GitHub Open-Source Code",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
    const normalizedQuery = normalizeGithubCodeQuery(options.query);
    const terms = [
      normalizedQuery,
      ...(options.engines ?? []).map(value => value.trim().toLowerCase()),
      ...(options.assetTypes ?? [])
        .map(value => value.trim().toLowerCase())
        .filter(value => !["code", "library", "plugin", "starter", "system", "addon"].includes(value))
    ].filter(Boolean);
    const canonicalTerms = Array.from(new Set(terms.join(" ").split(/\s+/).filter(Boolean))).join(" ");
    const qualifiers = [canonicalTerms, "archived:false", "fork:false", "stars:>=3"];
    const path = `/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`;
    const data = await cachedRepositorySearch(path);
    const retrievedAt = new Date().toISOString();
    return (data.items ?? [])
      .filter(repo => !repo.archived && !repo.fork)
      .map(repo => mapGithubCodeRepo(repo, retrievedAt))
      .filter((asset): asset is ProviderAsset => Boolean(asset));
  }
};
