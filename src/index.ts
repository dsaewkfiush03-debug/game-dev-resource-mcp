#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { planProjectAdoption } from "./adoption.js";
import { generateProjectAttribution } from "./attribution.js";
import { runCoverageBenchmark } from "./coverage.js";
import { installAssetFile, planAssetInstall } from "./install.js";
import { listProviderCapabilities } from "./provider-capabilities.js";
import { checkLicense } from "./licenses.js";
import { recommendStack } from "./recommend.js";
import { searchRegistry } from "./registry.js";
import { getProvider, listProviders } from "./providers/index.js";
import { searchAllAssets } from "./search.js";
import { VERSION } from "./version.js";
import { assessVerification, summarizeVerification } from "./verification.js";

const server = new McpServer({ name: "game-dev-resource-mcp", version: VERSION });
function text(data: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }; }

async function githubJson(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": `game-dev-resource-mcp/${VERSION}`,
    "X-GitHub-Api-Version": "2026-03-10"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}

const providerId = z.enum(["polyhaven", "ambientcg", "githubcode", "kaykit", "kenney", "quaternius", "godotdemos", "gameicons", "tablericons", "phaser", "raylib", "communitystarters", "googlefonts", "openverse", "godotassetlib"]);
const projectProviderId = z.enum(["godotdemos", "phaser", "raylib", "communitystarters"]);
const dimension = z.enum(["2D", "3D", "audio", "font", "code", "mixed"]);
const reuseScope = z.enum(["whole-project", "code-only", "reference-only", "asset-only"]);
const bundledAssetStatus = z.enum(["none", "same-license", "separately-licensed", "needs-review"]);
const coverageGroup = z.enum(["godot", "phaser", "raylib", "unity", "unreal", "generic"]);

server.registerTool("find_game_assets", {
  description: "Search all supported providers, filter by license, project-reuse safety and game-development metadata, and return ranked results with explainable reasons.",
  inputSchema: z.object({ query: z.string().min(1), categories: z.array(z.string()).default([]), providers: z.array(providerId).optional(), engines: z.array(z.string()).default([]), dimensions: z.array(dimension).default([]), styles: z.array(z.string()).default([]), formats: z.array(z.string()).default([]), assetTypes: z.array(z.string()).default([]), gameGenres: z.array(z.string()).default([]), reuseScopes: z.array(reuseScope).default([]), bundledAssetStatuses: z.array(bundledAssetStatus).default([]), animated: z.boolean().optional(), commercialOnly: z.boolean().default(true), allowAttribution: z.boolean().default(true), allowShareAlike: z.boolean().default(false), limit: z.number().int().min(1).max(100).default(20), perProviderLimit: z.number().int().min(1).max(100).default(50) })
}, async options => text({ query: options.query, ...(await searchAllAssets(options)), filters: { commercialOnly: options.commercialOnly, allowAttribution: options.allowAttribution, allowShareAlike: options.allowShareAlike, engines: options.engines, dimensions: options.dimensions, styles: options.styles, formats: options.formats, assetTypes: options.assetTypes, gameGenres: options.gameGenres, reuseScopes: options.reuseScopes, bundledAssetStatuses: options.bundledAssetStatuses, animated: options.animated } }));

server.registerTool("find_reusable_projects", {
  description: "Find verified reusable game starters, complete-game references and project skeletons. Results explicitly distinguish whole-project reuse from code-only reuse and expose bundled-asset review status.",
  inputSchema: z.object({
    query: z.string().min(1),
    engines: z.array(z.string()).default([]),
    providers: z.array(providerId).optional(),
    reuseScopes: z.array(reuseScope).default(["whole-project", "code-only"]),
    bundledAssetStatuses: z.array(bundledAssetStatus).default([]),
    commercialOnly: z.boolean().default(true),
    allowAttribution: z.boolean().default(true),
    allowShareAlike: z.boolean().default(false),
    limit: z.number().int().min(1).max(50).default(20)
  })
}, async options => {
  const projectProviders = options.providers?.length ? options.providers : ["godotdemos", "phaser", "raylib", "communitystarters", "githubcode"] as const;
  const result = await searchAllAssets({
    query: options.query,
    providers: [...projectProviders],
    engines: options.engines,
    dimensions: ["code"],
    reuseScopes: options.reuseScopes,
    bundledAssetStatuses: options.bundledAssetStatuses,
    commercialOnly: options.commercialOnly,
    allowAttribution: options.allowAttribution,
    allowShareAlike: options.allowShareAlike,
    limit: options.limit,
    perProviderLimit: Math.max(options.limit, 30)
  });
  return text({
    query: options.query,
    ...result,
    guidance: {
      "whole-project": "Catalog evidence supports using the maintained project as a project-wide starting point, subject to its stated license obligations.",
      "code-only": "Reuse source structure/code only; bundled images, audio and other media require independent review or replacement.",
      "reference-only": "Use for implementation study until component licensing is reviewed.",
      "asset-only": "Reuse is scoped to asset/media content rather than project code."
    },
    discoveryNote: "verified-catalog results are maintained entries; githubcode results are live repository-level discoveries screened by detected SPDX license and remain code-only / bundled-assets-needs-review until independently inspected."
  });
});

server.registerTool("plan_project_adoption", {
  description: "Turn one verified reusable project into a conservative adoption manifest: decide project-base vs code-only use, carry path/system hints, list license obligations, identify target resource gaps and emit recommended next MCP calls. This tool never clones or executes the project.",
  inputSchema: z.object({
    provider: projectProviderId,
    projectId: z.string().min(1),
    targetDescription: z.string().min(3),
    engine: z.string().optional(),
    dimension: z.enum(["2D", "3D"]).optional(),
    styles: z.array(z.string()).default([]),
    gameGenres: z.array(z.string()).default([])
  })
}, async options => text(await planProjectAdoption(options)));

server.registerTool("recommend_stack", {
  description: "Turn a game description into a deterministic resource stack: infer practical asset/code slots, prefer verified reusable starters where available, return primary recommendations, alternatives, license summary and unresolved gaps.",
  inputSchema: z.object({
    description: z.string().min(3),
    engine: z.string().optional(),
    dimension: z.enum(["2D", "3D"]).optional(),
    styles: z.array(z.string()).default([]),
    gameGenres: z.array(z.string()).default([]),
    providers: z.array(providerId).optional(),
    commercialOnly: z.boolean().default(true),
    allowAttribution: z.boolean().default(true),
    allowShareAlike: z.boolean().default(false),
    perSlotLimit: z.number().int().min(1).max(10).default(3)
  })
}, async options => text(await recommendStack(options)));

server.registerTool("benchmark_resource_coverage", {
  description: "Run a live resource-coverage benchmark across representative game concepts. Reports required-slot coverage, depth-3 candidate coverage, unsupported provider gaps, provider errors and the weakest resource slots. Smoke uses 12 balanced scenarios; full uses all 39 scenarios.",
  inputSchema: z.object({
    suite: z.enum(["smoke", "full"]).default("smoke"),
    scenarioIds: z.array(z.string().min(1)).optional(),
    groups: z.array(coverageGroup).optional(),
    perSlotLimit: z.number().int().min(3).max(10).default(3),
    concurrency: z.number().int().min(1).max(4).default(2)
  })
}, async options => text(await runCoverageBenchmark(options)));

server.registerTool("search_game_assets", {
  description: "Search the local registry of game-development resource sources.",
  inputSchema: z.object({ query: z.string().default(""), tags: z.array(z.string()).default([]), commercialOnly: z.boolean().default(false) })
}, async ({ query, tags, commercialOnly }) => { let results = searchRegistry(query, tags); if (commercialOnly) results = results.filter(item => item.commercialUse === true); return text({ count: results.length, results }); });

server.registerTool("search_live_assets", {
  description: "Search one supported provider. Providers may be live APIs or maintained verified catalogs.",
  inputSchema: z.object({ provider: providerId.default("polyhaven"), query: z.string().default(""), categories: z.array(z.string()).default([]), engines: z.array(z.string()).default([]), dimensions: z.array(dimension).default([]), styles: z.array(z.string()).default([]), formats: z.array(z.string()).default([]), assetTypes: z.array(z.string()).default([]), gameGenres: z.array(z.string()).default([]), reuseScopes: z.array(reuseScope).default([]), bundledAssetStatuses: z.array(bundledAssetStatus).default([]), animated: z.boolean().optional(), limit: z.number().int().min(1).max(100).default(20) })
}, async options => { const adapter = getProvider(options.provider); return text({ provider: adapter.name, providerMode: ["polyhaven", "ambientcg", "githubcode", "kaykit", "openverse", "godotassetlib", "gameicons", "tablericons"].includes(options.provider) ? "live-api" : "verified-catalog", results: await adapter.search(options) }); });

server.registerTool("get_asset_files", {
  description: "Return official provider-hosted download links and file metadata without mirroring the asset.",
  inputSchema: z.object({ provider: z.enum(["polyhaven", "gameicons", "tablericons"]).default("polyhaven"), assetId: z.string().min(1), format: z.string().optional(), resolution: z.string().optional(), limit: z.number().int().min(1).max(200).default(100) })
}, async ({ provider, assetId, format, resolution, limit }) => { const adapter = getProvider(provider); if (!adapter.getFiles) return text({ provider, assetId, error: "file_lookup_not_supported" }); let files = await adapter.getFiles(assetId); if (format) files = files.filter(file => file.format?.toLowerCase() === format.toLowerCase()); if (resolution) files = files.filter(file => file.resolution?.toLowerCase() === resolution.toLowerCase()); return text({ provider: adapter.name, assetId, mirrored: false, files: files.slice(0, limit) }); });

server.registerTool("plan_asset_install", {
  description: "Resolve provider-hosted files for an asset and mark which exact files are safe for automatic installation. Planning never writes to disk.",
  inputSchema: z.object({ provider: providerId, assetId: z.string().min(1), format: z.string().optional(), resolution: z.string().optional(), maxBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional() })
}, async options => text(await planAssetInstall(options)));

server.registerTool("install_asset_file", {
  description: "Download one explicitly selected provider file into a local project directory. Only trusted HTTPS download hosts are allowed; size/hash checks are enforced and downloaded content is never executed.",
  inputSchema: z.object({ provider: providerId, assetId: z.string().min(1), filePath: z.string().min(1), projectRoot: z.string().min(1), destinationDir: z.string().optional(), overwrite: z.boolean().default(false), format: z.string().optional(), resolution: z.string().optional(), maxBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional() })
}, async request => text(await installAssetFile(request)));

server.registerTool("list_asset_providers", { description: "List supported providers, modes and capability metadata (dimensions, engines and strengths) used to plan searches.", inputSchema: z.object({}) }, async () => text({ providers: listProviders(), capabilities: listProviderCapabilities() }));

server.registerTool("audit_resource_verification", {
  description: "Audit verification freshness for maintained verified catalogs. Reports current, stale, needs-review and untracked entries without changing license rights.",
  inputSchema: z.object({
    staleAfterDays: z.number().int().min(1).max(3650).default(365),
    providers: z.array(providerId).optional()
  })
}, async ({ staleAfterDays, providers }) => {
  const catalogs = listProviders().filter(provider => provider.mode === "verified-catalog");
  const selected = providers?.length ? catalogs.filter(provider => providers.includes(provider.id)) : catalogs;
  const allItems = [];
  const providerAudits = [];
  for (const meta of selected) {
    const assets = await getProvider(meta.id).search({ query: "", limit: 100 });
    const items = assets.map(asset => assessVerification(asset, staleAfterDays));
    allItems.push(...items);
    providerAudits.push({ provider: meta.id, name: meta.name, count: items.length, summary: summarizeVerification(items) });
  }
  const attention = allItems.filter(item => item.assessment !== "current");
  return text({
    staleAfterDays,
    providerCount: selected.length,
    assetCount: allItems.length,
    summary: summarizeVerification(allItems),
    providers: providerAudits,
    attention
  });
});

server.registerTool("search_open_source_projects", {
  description: "Search GitHub repositories for reusable game-development code. Inspect the explicit repository license before reuse.",
  inputSchema: z.object({ query: z.string().min(1), language: z.string().optional(), minStars: z.number().int().min(0).default(0), limit: z.number().int().min(1).max(20).default(10) })
}, async ({ query, language, minStars, limit }) => { const qualifiers = [query, "archived:false", `stars:>=${minStars}`]; if (language) qualifiers.push(`language:${language}`); const data = await githubJson(`/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`) as any; return text({ results: (data.items ?? []).map((repo: any) => ({ fullName: repo.full_name, url: repo.html_url, description: repo.description, stars: repo.stargazers_count, language: repo.language, license: repo.license?.spdx_id ?? null, updatedAt: repo.updated_at })) }); });

server.registerTool("check_license", { description: "Classify a known license using conservative commercial-game rules.", inputSchema: z.object({ license: z.string().min(1) }) }, async ({ license }) => text(checkLicense(license) ?? { license, risk: "unknown", action: "manual_review" }));

server.registerTool("inspect_repository", {
  description: "Inspect a GitHub repository's public metadata and detected license. Accepts owner/name.", inputSchema: z.object({ repository: z.string().regex(/^[^/\s]+\/[^/\s]+$/) })
}, async ({ repository }) => { const repo = await githubJson(`/repos/${repository}`) as any; let license: any = null; try { license = await githubJson(`/repos/${repository}/license`) as any; } catch {} const spdx = license?.license?.spdx_id ?? repo.license?.spdx_id ?? null; return text({ repository: repo.full_name, url: repo.html_url, detectedLicense: spdx, licenseAssessment: spdx ? checkLicense(spdx) ?? { risk: "unknown" } : { risk: "unknown" } }); });

server.registerTool("generate_attribution", {
  description: "Generate a conservative CREDITS entry after a resource license has been identified.", inputSchema: z.object({ name: z.string().min(1), author: z.string().optional(), sourceUrl: z.string().url(), license: z.string().min(1), licenseUrl: z.string().url().optional(), modified: z.boolean().default(false) })
}, async resource => text(generateProjectAttribution([resource])));

server.registerTool("generate_project_attribution", {
  description: "Generate project-level THIRD_PARTY_ASSETS.md and CREDITS.md content for multiple adopted resources, with warnings for conditional or unknown licenses.",
  inputSchema: z.object({ resources: z.array(z.object({ name: z.string().min(1), author: z.string().optional(), sourceUrl: z.string().url(), license: z.string().min(1), licenseUrl: z.string().url().optional(), modified: z.boolean().default(false) })).min(1) })
}, async ({ resources }) => text(generateProjectAttribution(resources)));

const transport = new StdioServerTransport();
await server.connect(transport);
