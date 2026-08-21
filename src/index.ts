#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
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
import {
  auditResourceVerificationInputSchema,
  benchmarkResourceCoverageInputSchema,
  checkLicenseInputSchema,
  findGameAssetsInputSchema,
  findReusableProjectsInputSchema,
  generateAttributionInputSchema,
  generateProjectAttributionInputSchema,
  getAssetFilesInputSchema,
  inspectRepositoryInputSchema,
  installAssetFileInputSchema,
  listAssetProvidersInputSchema,
  planAssetInstallInputSchema,
  planProjectAdoptionInputSchema,
  recommendStackInputSchema,
  searchGameAssetsInputSchema,
  searchLiveAssetsInputSchema,
  searchOpenSourceProjectsInputSchema
} from "./tool-schemas.js";
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

server.registerTool("find_game_assets", {
  description: "Preferred tool for finding concrete game assets or reusable code across supported providers. Use it for ranked cross-provider search with semantic fallback, hard engine/dimension filters, and conservative license/reuse filtering. Do not use search_game_assets when you need individual asset results.",
  inputSchema: findGameAssetsInputSchema
}, async options => text({ query: options.query, ...(await searchAllAssets(options)), filters: { commercialOnly: options.commercialOnly, allowAttribution: options.allowAttribution, allowShareAlike: options.allowShareAlike, engines: options.engines, dimensions: options.dimensions, styles: options.styles, formats: options.formats, assetTypes: options.assetTypes, gameGenres: options.gameGenres, reuseScopes: options.reuseScopes, bundledAssetStatuses: options.bundledAssetStatuses, animated: options.animated } }));

server.registerTool("find_reusable_projects", {
  description: "Find reusable starters, project skeletons and complete-game references when the agent needs a project base rather than individual assets. Results keep whole-project, code-only and bundled-asset review boundaries explicit. For one-off art/audio/code needs, use find_game_assets instead.",
  inputSchema: findReusableProjectsInputSchema
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
  description: "Use after selecting a verified reusable-project candidate. Produces a read-only adoption manifest with project-base vs code-only guidance, keep/replace/review actions, license obligations and unresolved resource gaps. It never clones, executes, installs dependencies or mutates the target project.",
  inputSchema: planProjectAdoptionInputSchema
}, async options => text(await planProjectAdoption(options)));

server.registerTool("recommend_stack", {
  description: "Best starting point for a broad game idea or feature plan. Infers practical starter, art, audio, font and code slots; prefers verified reusable bases where available; and returns primary recommendations, alternatives, license summary and gaps. For one precise resource need, prefer find_game_assets.",
  inputSchema: recommendStackInputSchema
}, async options => {
  const { responseMode, ...recommendOptions } = options;
  const result = await recommendStack(recommendOptions);
  if (responseMode === "full") return text(result);
  const compactAsset = (asset: any) => asset ? ({
    id: asset.id, name: asset.name, provider: asset.provider, sourceUrl: asset.sourceUrl,
    license: asset.license, licenseRisk: asset.licenseRisk, score: asset.score,
    dimension: asset.dimension, style: asset.style, formats: asset.formats,
    reuseScope: asset.reuseScope, bundledAssetStatus: asset.bundledAssetStatus
  }) : undefined;
  return text({
    responseMode: "summary",
    inferred: result.inferred,
    complete: result.complete,
    requiredGaps: result.requiredGaps,
    slots: result.recommendations.map(item => ({
      slot: item.slot.id,
      label: item.slot.label,
      required: item.slot.required,
      status: item.primary ? "matched" : "gap",
      queryUsed: item.queryUsed,
      primary: compactAsset(item.primary),
      alternatives: item.alternatives.map(compactAsset),
      gap: item.gap,
      providerErrorCount: item.providerErrors.length
    })),
    licenseSummary: result.licenseSummary,
    notes: [
      "Summary mode omits verbose per-asset metadata. Request responseMode=full only when detailed provenance/ranking data is needed.",
      ...result.notes.slice(0, 3)
    ]
  });
});

server.registerTool("benchmark_resource_coverage", {
  description: "Maintainer/evaluation tool for measuring required-slot and candidate-depth coverage across maintained game scenarios. Use it to find provider/search gaps and regressions, not to answer a normal user's asset request. It can make many live-provider requests; smoke is the cheaper default.",
  inputSchema: benchmarkResourceCoverageInputSchema
}, async options => text(await runCoverageBenchmark(options)));

server.registerTool("search_game_assets", {
  description: "Search the local registry of game-development resource sources such as websites, catalogs, marketplaces and ecosystems. This returns source-level discovery records, not individual assets and not per-asset license clearance. Use find_game_assets for concrete ranked resources.",
  inputSchema: searchGameAssetsInputSchema
}, async ({ query, tags, commercialOnly }) => { let results = searchRegistry(query, tags); if (commercialOnly) results = results.filter(item => item.commercialUse === true); return text({ count: results.length, results }); });

server.registerTool("search_live_assets", {
  description: "Directly query one known provider, bypassing cross-provider routing and global ranking. Use this for provider-specific inspection/debugging or when the caller explicitly chose a source. For normal resource discovery across providers, prefer find_game_assets.",
  inputSchema: searchLiveAssetsInputSchema
}, async options => { const adapter = getProvider(options.provider); return text({ provider: adapter.name, providerMode: ["polyhaven", "ambientcg", "githubcode", "kaykit", "openverse", "godotassetlib", "gameicons", "tablericons"].includes(options.provider) ? "live-api" : "verified-catalog", results: await adapter.search(options) }); });

server.registerTool("get_asset_files", {
  description: "Resolve official provider-hosted file metadata for an already-selected Poly Haven, Game Icons or Tabler Icons asset. Use this after search when exact downloadable files are needed. It does not download, install, mirror or execute anything.",
  inputSchema: getAssetFilesInputSchema
}, async ({ provider, assetId, format, resolution, limit }) => { const adapter = getProvider(provider); if (!adapter.getFiles) return text({ provider, assetId, error: "file_lookup_not_supported" }); let files = await adapter.getFiles(assetId); if (format) files = files.filter(file => file.format?.toLowerCase() === format.toLowerCase()); if (resolution) files = files.filter(file => file.resolution?.toLowerCase() === resolution.toLowerCase()); return text({ provider: adapter.name, assetId, mirrored: false, files: files.slice(0, limit) }); });

server.registerTool("plan_asset_install", {
  description: "Read-only safety step before installation. Resolves provider-hosted files for a selected asset and reports which exact files satisfy the maintained automatic-install boundary and size constraints. It never writes to disk; call install_asset_file only after choosing an allowed file.",
  inputSchema: planAssetInstallInputSchema
}, async options => text(await planAssetInstall(options)));

server.registerTool("install_asset_file", {
  description: "Local write tool: download one explicitly selected, allowlisted provider file into a project. Use only after search/file lookup or plan_asset_install identifies the exact provider file. It validates host/path/redirect/filesystem/size constraints, does not execute content, and does not clone repositories or extract archives.",
  inputSchema: installAssetFileInputSchema
}, async request => text(await installAssetFile(request)));

server.registerTool("list_asset_providers", {
  description: "List provider IDs, provider modes and capability metadata such as dimensions, engines and strengths. Use it to understand routing or discover which provider can answer a constrained search; it does not search for assets.",
  inputSchema: listAssetProvidersInputSchema
}, async () => text({ providers: listProviders(), capabilities: listProviderCapabilities() }));

server.registerTool("audit_resource_verification", {
  description: "Maintainer audit for freshness of maintained verified-catalog evidence. Reports current, stale, needs-review and untracked records so source/license evidence can be rechecked. It never upgrades license rights and is not a substitute for find_game_assets.",
  inputSchema: auditResourceVerificationInputSchema
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
  description: "Search live GitHub repositories for reusable game-development source code. Use when broad GitHub code discovery is needed. Results are repository-level and do not clear bundled art/audio/fonts/dependencies; for maintained starter-project reuse guidance, prefer find_reusable_projects.",
  inputSchema: searchOpenSourceProjectsInputSchema
}, async ({ query, language, minStars, limit }) => { const qualifiers = [query, "archived:false", `stars:>=${minStars}`]; if (language) qualifiers.push(`language:${language}`); const data = await githubJson(`/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`) as any; return text({ results: (data.items ?? []).map((repo: any) => ({ fullName: repo.full_name, url: repo.html_url, description: repo.description, stars: repo.stargazers_count, language: repo.language, license: repo.license?.spdx_id ?? null, updatedAt: repo.updated_at })) }); });

server.registerTool("check_license", {
  description: "Classify a known license identifier using the project's conservative commercial-game policy. Use only when the license is already identified. It cannot infer missing rights, does not inspect a repository, and is technical guidance rather than legal advice.",
  inputSchema: checkLicenseInputSchema
}, async ({ license }) => text(checkLicense(license) ?? { license, risk: "unknown", action: "manual_review" }));

server.registerTool("inspect_repository", {
  description: "Inspect one public GitHub repository's metadata and detected repository-level license. Use owner/name exactly. This does not prove that bundled media, dependencies or separately licensed components share the repository license; use reusable-project metadata and manual review for those boundaries.",
  inputSchema: inspectRepositoryInputSchema
}, async ({ repository }) => { const repo = await githubJson(`/repos/${repository}`) as any; let license: any = null; try { license = await githubJson(`/repos/${repository}/license`) as any; } catch {} const spdx = license?.license?.spdx_id ?? repo.license?.spdx_id ?? null; return text({ repository: repo.full_name, url: repo.html_url, detectedLicense: spdx, licenseAssessment: spdx ? checkLicense(spdx) ?? { risk: "unknown" } : { risk: "unknown" } }); });

server.registerTool("generate_attribution", {
  description: "Generate conservative attribution/credits content for one adopted resource after its canonical source and license are known. Do not use it to guess missing provenance or license terms.",
  inputSchema: generateAttributionInputSchema
}, async resource => text(generateProjectAttribution([resource])));

server.registerTool("generate_project_attribution", {
  description: "Generate project-level THIRD_PARTY_ASSETS.md and CREDITS.md content for multiple adopted resources, preserving source/license metadata and warning on conditional or unknown licenses. Use after resource selection/adoption, not as a license-discovery tool.",
  inputSchema: generateProjectAttributionInputSchema
}, async ({ resources }) => text(generateProjectAttribution(resources)));

const transport = new StdioServerTransport();
await server.connect(transport);
