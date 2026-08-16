import { checkLicense } from "../licenses.js";
import { VERSION } from "../version.js";
import type { AssetProvider, ProviderAsset, ProviderSearchOptions } from "./types.js";

const API_BASE = "https://api.github.com";
const API_VERSION = "2026-03-10";
const USER_AGENT = `game-dev-resource-mcp/${VERSION}`;

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

function boolOrUnknown(value: boolean | "depends"): boolean | "unknown" {
  return value === "depends" ? "unknown" : value;
}

function inferredEngines(repo: GithubRepoRaw): string[] {
  const text = [repo.full_name ?? "", repo.description ?? "", ...(repo.topics ?? [])].join(" ").toLowerCase();
  return ["godot", "unity", "unreal", "phaser", "bevy", "libgdx", "raylib", "babylon", "threejs", "pixi"]
    .filter(engine => text.includes(engine));
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
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}

export const githubCodeProvider: AssetProvider = {
  id: "githubcode",
  name: "GitHub Open-Source Code",
  async search(options: ProviderSearchOptions): Promise<ProviderAsset[]> {
    const limit = Math.max(1, Math.min(options.limit ?? 20, 50));
    const terms = [
      options.query.trim(),
      ...(options.engines ?? []).map(value => value.trim()),
      ...(options.assetTypes ?? []).filter(value => !["code", "library", "plugin", "starter"].includes(value.toLowerCase()))
    ].filter(Boolean);
    const qualifiers = [terms.join(" "), "archived:false", "fork:false", "stars:>=3"];
    const path = `/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`;
    const data = await githubJson(path) as GithubSearchResponse;
    const retrievedAt = new Date().toISOString();
    return (data.items ?? [])
      .filter(repo => !repo.archived && !repo.fork)
      .map(repo => mapGithubCodeRepo(repo, retrievedAt))
      .filter((asset): asset is ProviderAsset => Boolean(asset));
  }
};
