import { checkLicense } from "../licenses.js";
import { canonicalEngine } from "../provider-capabilities.js";
import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const API_VERSION = "2026-03-10";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;
const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
const SEARCH_ERROR_CACHE_TTL_MS = 30 * 1000;
const MAX_RATE_WAIT_MS = 75_000;
const RATE_RESET_PADDING_MS = 1500;
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

export interface GithubRateLimitSnapshot {
  resource?: string;
  remaining?: number;
  resetEpochSeconds?: number;
  retryAfterSeconds?: number;
}

const searchCache = new Map<string, SearchCacheEntry>();
let searchQueue: Promise<void> = Promise.resolve();
let searchRateState: GithubRateLimitSnapshot | undefined;

function boolOrUnknown(value: boolean | "depends"): boolean | "unknown" {
  return value === "depends" ? "unknown" : value;
}

function inferredEngines(repo: GithubRepoRaw): string[] {
  const text = [repo.full_name ?? "", repo.description ?? "", ...(repo.topics ?? [])].join(" ").toLowerCase();
  const engines: string[] = [];
  const add = (engine: string, terms: string[]) => {
    if (terms.some(term => text.includes(term))) engines.push(engine);
  };
  add("godot", ["godot"]);
  add("unity", ["unity"]);
  add("unreal", ["unreal", "ue5", "ue4"]);
  add("phaser", ["phaser"]);
  add("bevy", ["bevy"]);
  add("libgdx", ["libgdx"]);
  add("raylib", ["raylib"]);
  add("babylon", ["babylon"]);
  add("threejs", ["three.js", "threejs"]);
  add("pixi", ["pixijs", "pixi.js"]);
  add("urhox", ["urhox", "urho3d", "urho"]);
  add("love2d", ["love2d", "löve2d", "löve"]);
  add("defold", ["defold"]);
  return Array.from(new Set(engines));
}

function engineSearchTerm(engine: string): string {
  const canonical = canonicalEngine(engine);
  if (canonical === "urhox") return "urho3d";
  if (canonical === "love2d") return "love2d";
  return canonical;
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

export function githubRateLimitDelayMs(snapshot: GithubRateLimitSnapshot, nowMs = Date.now()): number {
  if ((snapshot.retryAfterSeconds ?? 0) > 0) {
    return Math.ceil((snapshot.retryAfterSeconds ?? 0) * 1000 + RATE_RESET_PADDING_MS);
  }
  if (snapshot.remaining === 0 && (snapshot.resetEpochSeconds ?? 0) > 0) {
    return Math.max(0, Math.ceil((snapshot.resetEpochSeconds ?? 0) * 1000 - nowMs + RATE_RESET_PADDING_MS));
  }
  return 0;
}

export function mapGithubCodeRepo(repo: GithubRepoRaw, retrievedAt = new Date().toISOString()): ProviderAsset | undefined {
  const fullName = repo.full_name?.trim();
  const sourceUrl = repo.html_url?.trim();
  if (!fullName || !sourceUrl) return undefined;

  const spdx = repo.license?.spdx_id?.trim() || "NO-LICENSE";
  const rule = checkLicense(spdx);
  const licenseSource = `${API_BASE}/repos/${fullName}/license`;
  const engines = inferredEngines(repo);
  const tags = Array.from(new Set([
    "code", "open-source", "github",
    ...(repo.topics ?? []).map(topic => topic.toLowerCase()),
    ...(repo.language ? [repo.language.toLowerCase()] : []),
    ...engines
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
    engine: engines,
    dimension: "code",
    formats: repo.language ? [repo.language.toLowerCase()] : undefined,
    assetTypes: ["code", "library", "plugin", "starter"],
    reuseScope: "code-only",
    bundledAssetStatus: "needs-review",
    bundledAssetNotes: "The detected repository license is evidence for repository code only. Bundled media, dependencies, generated content and imported assets require independent review before shipping.",
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

function parseNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function rateSnapshot(response: Response): GithubRateLimitSnapshot {
  return {
    resource: response.headers.get("x-ratelimit-resource") ?? undefined,
    remaining: parseNumber(response.headers.get("x-ratelimit-remaining")),
    resetEpochSeconds: parseNumber(response.headers.get("x-ratelimit-reset")),
    retryAfterSeconds: parseNumber(response.headers.get("retry-after"))
  };
}

function rateMetadata(snapshot: GithubRateLimitSnapshot): string {
  return [
    snapshot.resource ? `resource=${snapshot.resource}` : "",
    snapshot.remaining !== undefined ? `remaining=${snapshot.remaining}` : "",
    snapshot.resetEpochSeconds !== undefined ? `reset=${snapshot.resetEpochSeconds}` : "",
    snapshot.retryAfterSeconds !== undefined ? `retry-after=${snapshot.retryAfterSeconds}` : ""
  ].filter(Boolean).join(" ");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForKnownSearchBudget(): Promise<void> {
  if (!searchRateState) return;
  const delay = githubRateLimitDelayMs(searchRateState);
  if (delay <= 0) return;
  if (delay > MAX_RATE_WAIT_MS) {
    throw new Error(`GitHub Search rate limit reset is ${delay}ms away, exceeding the bounded wait window.`);
  }
  await sleep(delay);
  searchRateState = undefined;
}

async function githubSearchJson(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": USER_AGENT,
    "X-GitHub-Api-Version": API_VERSION
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await waitForKnownSearchBudget();
    const response = await fetch(`${API_BASE}${path}`, { headers });
    const snapshot = rateSnapshot(response);
    searchRateState = snapshot;

    if (response.ok) return response.json();

    const retryableLimit = response.status === 429 || (response.status === 403 && (snapshot.remaining === 0 || snapshot.retryAfterSeconds !== undefined));
    const delay = githubRateLimitDelayMs(snapshot);
    if (attempt < 2 && retryableLimit && delay > 0 && delay <= MAX_RATE_WAIT_MS) {
      await sleep(delay);
      searchRateState = undefined;
      continue;
    }

    const metadata = rateMetadata(snapshot);
    throw new Error(`GitHub API ${response.status}${metadata ? ` (${metadata})` : ""}: ${await response.text()}`);
  }

  throw new Error("GitHub Search request exhausted its bounded retry path.");
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
      return await githubSearchJson(path) as GithubSearchResponse;
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
      ...(options.engines ?? []).map(engineSearchTerm),
      ...(options.assetTypes ?? [])
        .map(value => value.trim().toLowerCase())
        .filter(value => !["code", "library", "plugin", "starter", "system", "addon"].includes(value))
    ].filter(Boolean);
    const canonicalTerms = Array.from(new Set(terms.join(" ").split(/\s+/).filter(Boolean))).join(" ");
    const qualifiers = [canonicalTerms, "archived:false", "fork:false", "stars:>=1"];
    const path = `/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`;
    const data = await cachedRepositorySearch(path);
    const retrievedAt = new Date().toISOString();
    return (data.items ?? [])
      .filter(repo => !repo.archived && !repo.fork)
      .map(repo => mapGithubCodeRepo(repo, retrievedAt))
      .filter((asset): asset is ProviderAsset => Boolean(asset));
  }
};
