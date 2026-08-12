import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { generateProjectAttribution } from "./attribution.js";
import { checkLicense } from "./licenses.js";
import { searchRegistry } from "./registry.js";
import { getProvider, listProviders } from "./providers/index.js";
import { searchAllAssets } from "./search.js";

const server = new McpServer({ name: "game-dev-resource-mcp", version: "0.7.0" });
function text(data: unknown) { return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] }; }

async function githubJson(path: string) {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "game-dev-resource-mcp/0.7.0" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  return response.json();
}

const providerId = z.enum(["polyhaven", "kenney", "quaternius", "godotdemos", "gameicons", "phaser", "googlefonts"]);
const dimension = z.enum(["2D", "3D", "audio", "font", "code", "mixed"]);

server.registerTool("find_game_assets", {
  description: "Search all supported providers, filter by license and game-development metadata, and return ranked results with explainable reasons.",
  inputSchema: z.object({ query: z.string().min(1), categories: z.array(z.string()).default([]), providers: z.array(providerId).optional(), engines: z.array(z.string()).default([]), dimensions: z.array(dimension).default([]), styles: z.array(z.string()).default([]), formats: z.array(z.string()).default([]), assetTypes: z.array(z.string()).default([]), gameGenres: z.array(z.string()).default([]), animated: z.boolean().optional(), commercialOnly: z.boolean().default(true), allowAttribution: z.boolean().default(true), allowShareAlike: z.boolean().default(false), limit: z.number().int().min(1).max(100).default(20), perProviderLimit: z.number().int().min(1).max(100).default(50) })
}, async options => text({ query: options.query, ...(await searchAllAssets(options)), filters: { commercialOnly: options.commercialOnly, allowAttribution: options.allowAttribution, allowShareAlike: options.allowShareAlike, engines: options.engines, dimensions: options.dimensions, styles: options.styles, formats: options.formats, assetTypes: options.assetTypes, gameGenres: options.gameGenres, animated: options.animated } }));

server.registerTool("search_game_assets", {
  description: "Search the local registry of game-development resource sources.",
  inputSchema: z.object({ query: z.string().default(""), tags: z.array(z.string()).default([]), commercialOnly: z.boolean().default(false) })
}, async ({ query, tags, commercialOnly }) => {
  let results = searchRegistry(query, tags); if (commercialOnly) results = results.filter(item => item.commercialUse === true); return text({ count: results.length, results });
});

server.registerTool("search_live_assets", {
  description: "Search one supported provider. Providers may be live APIs or maintained verified catalogs.",
  inputSchema: z.object({ provider: providerId.default("polyhaven"), query: z.string().default(""), categories: z.array(z.string()).default([]), engines: z.array(z.string()).default([]), dimensions: z.array(dimension).default([]), styles: z.array(z.string()).default([]), formats: z.array(z.string()).default([]), assetTypes: z.array(z.string()).default([]), gameGenres: z.array(z.string()).default([]), animated: z.boolean().optional(), limit: z.number().int().min(1).max(100).default(20) })
}, async options => { const adapter = getProvider(options.provider); return text({ provider: adapter.name, providerMode: options.provider === "polyhaven" ? "live-api" : "verified-catalog", results: await adapter.search(options) }); });

server.registerTool("get_asset_files", {
  description: "Return official provider-hosted download links and file metadata without mirroring the asset.",
  inputSchema: z.object({ provider: z.enum(["polyhaven"]).default("polyhaven"), assetId: z.string().min(1), format: z.string().optional(), resolution: z.string().optional(), limit: z.number().int().min(1).max(200).default(100) })
}, async ({ provider, assetId, format, resolution, limit }) => { const adapter = getProvider(provider); if (!adapter.getFiles) return text({ provider, assetId, error: "file_lookup_not_supported" }); let files = await adapter.getFiles(assetId); if (format) files = files.filter(file => file.format?.toLowerCase() === format.toLowerCase()); if (resolution) files = files.filter(file => file.resolution?.toLowerCase() === resolution.toLowerCase()); return text({ provider: adapter.name, assetId, mirrored: false, files: files.slice(0, limit) }); });

server.registerTool("list_asset_providers", { description: "List supported providers and whether each is a live API or verified catalog.", inputSchema: z.object({}) }, async () => text({ providers: listProviders() }));

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
