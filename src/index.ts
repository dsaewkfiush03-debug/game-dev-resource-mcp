import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";
import { checkLicense } from "./licenses.js";
import { searchRegistry } from "./registry.js";
import { getProvider, listProviders } from "./providers/index.js";

const server = new McpServer({ name: "game-dev-resource-mcp", version: "0.2.0" });

function text(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

async function githubJson(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "game-dev-resource-mcp/0.2.0"
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

server.registerTool(
  "search_game_assets",
  {
    description: "Search the verified local registry of game-development resource sources. Results describe source, license posture, API requirements and tags; they do not imply that every item on a multi-license source is commercially usable.",
    inputSchema: z.object({
      query: z.string().default(""),
      tags: z.array(z.string()).default([]),
      commercialOnly: z.boolean().default(false)
    })
  },
  async ({ query, tags, commercialOnly }) => {
    let results = searchRegistry(query, tags);
    if (commercialOnly) results = results.filter(item => item.commercialUse === true);
    return text({ count: results.length, results });
  }
);

server.registerTool(
  "search_live_assets",
  {
    description: "Search a supported live asset provider. Provider results preserve source and license provenance. Live-API service terms can require attribution even when the underlying asset license does not.",
    inputSchema: z.object({
      provider: z.enum(["polyhaven"]).default("polyhaven"),
      query: z.string().default(""),
      categories: z.array(z.string()).default([]),
      limit: z.number().int().min(1).max(100).default(20)
    })
  },
  async ({ provider, query, categories, limit }) => {
    const adapter = getProvider(provider);
    const results = await adapter.search({ query, categories, limit });
    return text({
      provider: adapter.name,
      count: results.length,
      serviceNotice: provider === "polyhaven"
        ? "Poly Haven assets are CC0, but use of the live API requires clear Poly Haven credit and a unique User-Agent."
        : undefined,
      results
    });
  }
);

server.registerTool(
  "list_asset_providers",
  {
    description: "List currently supported live asset providers.",
    inputSchema: z.object({})
  },
  async () => text({ providers: listProviders() })
);

server.registerTool(
  "search_open_source_projects",
  {
    description: "Search GitHub repositories for reusable game-development code. An explicit repository license must still be inspected before reuse.",
    inputSchema: z.object({
      query: z.string().min(1),
      language: z.string().optional(),
      minStars: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(20).default(10)
    })
  },
  async ({ query, language, minStars, limit }) => {
    const qualifiers = [query, "archived:false", `stars:>=${minStars}`];
    if (language) qualifiers.push(`language:${language}`);
    const data = await githubJson(`/search/repositories?q=${encodeURIComponent(qualifiers.join(" "))}&sort=stars&order=desc&per_page=${limit}`) as any;
    const results = (data.items ?? []).map((repo: any) => ({
      fullName: repo.full_name,
      url: repo.html_url,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      license: repo.license?.spdx_id ?? null,
      updatedAt: repo.updated_at
    }));
    return text({ count: results.length, warning: "Repository search metadata is not a legal clearance. Run inspect_repository and check_license before reuse.", results });
  }
);

server.registerTool(
  "check_license",
  {
    description: "Classify a known license using conservative game-commercial-use rules.",
    inputSchema: z.object({ license: z.string().min(1) })
  },
  async ({ license }) => {
    const rule = checkLicense(license);
    if (!rule) return text({ license, risk: "unknown", action: "manual_review", message: "Unknown or custom license. Do not assume commercial-use or redistribution rights." });
    return text(rule);
  }
);

server.registerTool(
  "inspect_repository",
  {
    description: "Inspect a GitHub repository's public metadata and detected license. Accepts owner/name.",
    inputSchema: z.object({ repository: z.string().regex(/^[^/\s]+\/[^/\s]+$/) })
  },
  async ({ repository }) => {
    const repo = await githubJson(`/repos/${repository}`) as any;
    let license: any = null;
    try {
      license = await githubJson(`/repos/${repository}/license`) as any;
    } catch {
      license = null;
    }
    const spdx = license?.license?.spdx_id ?? repo.license?.spdx_id ?? null;
    const rule = spdx ? checkLicense(spdx) : undefined;
    return text({
      repository: repo.full_name,
      url: repo.html_url,
      archived: repo.archived,
      stars: repo.stargazers_count,
      defaultBranch: repo.default_branch,
      detectedLicense: spdx,
      licenseUrl: license?.html_url ?? null,
      licenseAssessment: rule ?? { risk: "unknown", action: "manual_review" },
      warning: spdx ? "Automated license detection does not verify third-party assets embedded in the repository." : "No detectable license. Do not assume reuse permission."
    });
  }
);

server.registerTool(
  "generate_attribution",
  {
    description: "Generate a conservative attribution/CREDITS entry for a resource after its license has been identified.",
    inputSchema: z.object({
      name: z.string().min(1),
      author: z.string().optional(),
      sourceUrl: z.string().url(),
      license: z.string().min(1),
      licenseUrl: z.string().url().optional(),
      modified: z.boolean().default(false)
    })
  },
  async ({ name, author, sourceUrl, license, licenseUrl, modified }) => {
    const rule = checkLicense(license);
    const lines = [
      `- ${name}`,
      author ? `  - Author: ${author}` : null,
      `  - Source: ${sourceUrl}`,
      `  - License: ${license}${licenseUrl ? ` (${licenseUrl})` : ""}`,
      `  - Modified: ${modified ? "Yes" : "No"}`
    ].filter(Boolean);
    return text({ attribution: lines.join("\n"), licenseAssessment: rule ?? { risk: "unknown", action: "manual_review" } });
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
