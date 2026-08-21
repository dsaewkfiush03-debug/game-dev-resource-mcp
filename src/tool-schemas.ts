import * as z from "zod/v4";

const providerId = z.enum([
  "polyhaven", "ambientcg", "githubcode", "kaykit", "kenney", "quaternius", "godotdemos",
  "gameicons", "tablericons", "phaser", "raylib", "communitystarters", "googlefonts", "openverse", "godotassetlib"
]);

const projectProviderId = z.enum(["godotdemos", "phaser", "raylib", "communitystarters"]);
const dimension = z.enum(["2D", "3D", "audio", "font", "code", "mixed"]);
const reuseScope = z.enum(["whole-project", "code-only", "reference-only", "asset-only"]);
const bundledAssetStatus = z.enum(["none", "same-license", "separately-licensed", "needs-review"]);
const coverageGroup = z.enum(["godot", "phaser", "raylib", "unity", "unreal", "generic"]);

const providerFilter = z.array(providerId).optional().describe(
  "Optional provider allowlist. Omit it to let the search route across all relevant providers. Use list_asset_providers to inspect provider capabilities first when routing matters."
);
const engineFilter = z.array(z.string()).default([]).describe(
  "Hard engine/framework filters such as Godot, Unity, Unreal, Raylib, Phaser, UrhoX, Love2D or Defold. Leave empty for engine-agnostic results."
);
const dimensionFilter = z.array(dimension).default([]).describe(
  "Hard resource-dimension filters: 2D, 3D, audio, font, code or mixed. Leave empty when dimension is not constrained."
);
const styleFilter = z.array(z.string()).default([]).describe(
  "Requested visual or content styles such as low-poly, pixel-art, cyberpunk or medieval. These guide semantic relevance; explicit incompatible dimensions remain filtered separately."
);
const formatFilter = z.array(z.string()).default([]).describe(
  "Requested file or resource formats such as glTF, FBX, PNG, SVG, WAV or OGG when the provider exposes format metadata."
);
const assetTypeFilter = z.array(z.string()).default([]).describe(
  "Requested resource roles/types such as character, environment, weapon, UI, icon, texture, music or sound effect."
);
const genreFilter = z.array(z.string()).default([]).describe(
  "Game-genre hints such as tower defense, survival, RPG, racing or platformer. Used for relevance planning and ranking."
);
const reuseScopeFilter = z.array(reuseScope).default([]).describe(
  "Allowed project/resource reuse scopes. whole-project means maintained evidence supports project-wide reuse; code-only and reference-only do not clear bundled media."
);
const bundledAssetStatusFilter = z.array(bundledAssetStatus).default([]).describe(
  "Allowed bundled-asset evidence states. needs-review means bundled media or dependencies are not sufficiently cleared for blanket reuse."
);
const commercialOnly = z.boolean().default(true).describe(
  "When true, reject resources that are known to prohibit commercial use or whose commercial-use rights cannot be established under the project's conservative rules."
);
const allowAttribution = z.boolean().default(true).describe(
  "When true, licenses that require attribution may pass if other policy constraints are satisfied. Set false to prefer resources with no attribution obligation."
);
const allowShareAlike = z.boolean().default(false).describe(
  "When false, reject share-alike/copyleft-like asset licenses covered by this filter. This does not replace project-specific legal review."
);

export const findGameAssetsInputSchema = z.object({
  query: z.string().min(1).describe("Natural-language description of the concrete asset, code component or resource you want to find."),
  categories: z.array(z.string()).default([]).describe("Optional provider/category filters such as models, textures, audio, fonts, icons or code where supported."),
  providers: providerFilter,
  engines: engineFilter,
  dimensions: dimensionFilter,
  styles: styleFilter,
  formats: formatFilter,
  assetTypes: assetTypeFilter,
  gameGenres: genreFilter,
  reuseScopes: reuseScopeFilter,
  bundledAssetStatuses: bundledAssetStatusFilter,
  animated: z.boolean().optional().describe("Optional hard filter for animated versus non-animated resources when provider metadata supports it."),
  commercialOnly,
  allowAttribution,
  allowShareAlike,
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of ranked results returned after cross-provider filtering and ranking."),
  perProviderLimit: z.number().int().min(1).max(100).default(50).describe("Maximum candidates requested from each provider before global filtering/ranking. Raise only when broader provider recall is needed.")
});

export const findReusableProjectsInputSchema = z.object({
  query: z.string().min(1).describe("Natural-language description of the reusable game starter, template, project skeleton or complete-game reference you need."),
  engines: engineFilter,
  providers: providerFilter,
  reuseScopes: z.array(reuseScope).default(["whole-project", "code-only"]).describe("Project reuse scopes to include. Defaults to whole-project and code-only; neither model judgment nor a repository license may silently upgrade code-only to whole-project."),
  bundledAssetStatuses: bundledAssetStatusFilter,
  commercialOnly,
  allowAttribution,
  allowShareAlike,
  limit: z.number().int().min(1).max(50).default(20).describe("Maximum number of reusable-project candidates to return.")
});

export const planProjectAdoptionInputSchema = z.object({
  provider: projectProviderId.describe("Verified project provider that returned the selected candidate: godotdemos, phaser, raylib or communitystarters."),
  projectId: z.string().min(1).describe("Exact project identifier returned by find_reusable_projects or another verified project-provider result. Do not invent an ID."),
  targetDescription: z.string().min(3).describe("Description of the game you are building and the systems/resources the adopted project should help provide."),
  engine: z.string().optional().describe("Target engine/framework when it should be enforced explicitly rather than inferred from the selected project."),
  dimension: z.enum(["2D", "3D"]).optional().describe("Target visual dimension when it should be enforced explicitly."),
  styles: z.array(z.string()).default([]).describe("Target visual/content styles used to identify likely replacement or sourcing needs."),
  gameGenres: genreFilter
});

export const recommendStackInputSchema = z.object({
  description: z.string().min(3).describe("Broad game or feature description from which the planner should infer starter, art, audio, font, code and other practical resource slots."),
  engine: z.string().optional().describe("Target engine/framework. Set this when starter/code recommendations must stay in a specific ecosystem."),
  dimension: z.enum(["2D", "3D"]).optional().describe("Target game dimension. Set this when 2D/3D must remain a hard constraint."),
  styles: z.array(z.string()).default([]).describe("Visual/content style hints such as low-poly, pixel-art, cyberpunk or medieval."),
  gameGenres: genreFilter,
  providers: providerFilter,
  commercialOnly,
  allowAttribution,
  allowShareAlike,
  perSlotLimit: z.number().int().min(1).max(10).default(3).describe("Number of candidates retained per inferred resource slot. Higher values increase output size."),
  responseMode: z.enum(["summary", "full"]).default("summary").describe("summary returns compact agent-friendly recommendations; full includes detailed per-resource provenance and ranking metadata.")
});

export const benchmarkResourceCoverageInputSchema = z.object({
  suite: z.enum(["smoke", "full"]).default("smoke").describe("Benchmark suite. smoke covers 12 balanced scenarios; full covers all maintained scenarios and makes more live-provider requests."),
  scenarioIds: z.array(z.string().min(1)).optional().describe("Optional exact maintained scenario IDs to run. Omit to use the selected suite."),
  groups: z.array(coverageGroup).optional().describe("Optional scenario-group filter: godot, phaser, raylib, unity, unreal or generic."),
  perSlotLimit: z.number().int().min(3).max(10).default(3).describe("Candidate depth measured for each required slot. The default of 3 supports depth-3 coverage reporting."),
  concurrency: z.number().int().min(1).max(4).default(2).describe("Maximum benchmark concurrency. Keep low to reduce provider rate-limit pressure.")
});

export const searchGameAssetsInputSchema = z.object({
  query: z.string().default("").describe("Text used to search the local registry of resource sources, not individual asset records. Use find_game_assets when you need concrete assets."),
  tags: z.array(z.string()).default([]).describe("Registry-source tags used to narrow which websites/catalogs/ecosystems may be relevant."),
  commercialOnly: z.boolean().default(false).describe("When true, only registry sources marked as supporting commercial-use discovery are returned. This is source-level metadata, not per-asset clearance.")
});

export const searchLiveAssetsInputSchema = z.object({
  provider: providerId.default("polyhaven").describe("Single provider to query directly. Use find_game_assets instead when you want cross-provider routing, license filtering and global ranking."),
  query: z.string().default("").describe("Provider-specific natural-language search query."),
  categories: z.array(z.string()).default([]).describe("Provider/category filters where supported."),
  engines: engineFilter,
  dimensions: dimensionFilter,
  styles: styleFilter,
  formats: formatFilter,
  assetTypes: assetTypeFilter,
  gameGenres: genreFilter,
  reuseScopes: reuseScopeFilter,
  bundledAssetStatuses: bundledAssetStatusFilter,
  animated: z.boolean().optional().describe("Optional animated/non-animated filter where provider metadata supports it."),
  limit: z.number().int().min(1).max(100).default(20).describe("Maximum results returned from the selected provider.")
});

export const getAssetFilesInputSchema = z.object({
  provider: z.enum(["polyhaven", "gameicons", "tablericons"]).default("polyhaven").describe("Provider that owns the already-selected asset. File lookup is intentionally limited to providers with maintained official-file resolution."),
  assetId: z.string().min(1).describe("Exact asset identifier returned by a supported provider search. Do not pass a display name or arbitrary URL."),
  format: z.string().optional().describe("Optional exact format preference used to filter provider-reported files."),
  resolution: z.string().optional().describe("Optional provider-specific resolution preference such as 1k, 2k or 4k where supported."),
  limit: z.number().int().min(1).max(200).default(100).describe("Maximum provider file records returned. This tool does not download or write files.")
});

export const planAssetInstallInputSchema = z.object({
  provider: providerId.describe("Provider that returned the selected asset. Planning succeeds only for maintained automatic-install acquisition paths."),
  assetId: z.string().min(1).describe("Exact provider asset identifier to resolve into candidate installable files."),
  format: z.string().optional().describe("Optional desired file format."),
  resolution: z.string().optional().describe("Optional desired provider-specific resolution."),
  maxBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional().describe("Optional maximum allowed file size in bytes, capped at 1 GiB. Planning does not write to disk.")
});

export const installAssetFileInputSchema = z.object({
  provider: providerId.describe("Provider that owns the selected asset. Automatic installation remains restricted to explicitly supported provider/file paths."),
  assetId: z.string().min(1).describe("Exact provider asset identifier previously inspected or planned."),
  filePath: z.string().min(1).describe("Exact provider file path selected from get_asset_files or plan_asset_install. Arbitrary URLs are not accepted."),
  projectRoot: z.string().min(1).describe("Absolute or client-resolved root directory of the local project. The installer enforces containment beneath this root."),
  destinationDir: z.string().optional().describe("Optional destination directory relative to projectRoot. Path traversal and unsafe filesystem components are rejected."),
  overwrite: z.boolean().default(false).describe("Whether an existing destination file may be replaced. Defaults to false."),
  format: z.string().optional().describe("Optional desired file format used when resolving/validating the selected provider file."),
  resolution: z.string().optional().describe("Optional desired provider-specific resolution used when resolving/validating the selected provider file."),
  maxBytes: z.number().int().positive().max(1024 * 1024 * 1024).optional().describe("Optional maximum allowed download size in bytes, capped at 1 GiB.")
});

export const listAssetProvidersInputSchema = z.object({});

export const auditResourceVerificationInputSchema = z.object({
  staleAfterDays: z.number().int().min(1).max(3650).default(365).describe("Age threshold in days after which maintained verification evidence is reported as stale and should be rechecked."),
  providers: providerFilter.describe("Optional provider allowlist for the audit. Only maintained verified catalogs are audited; live providers are excluded.")
});

export const searchOpenSourceProjectsInputSchema = z.object({
  query: z.string().min(1).describe("GitHub repository search terms for reusable game-development source code or systems."),
  language: z.string().optional().describe("Optional GitHub language filter such as C++, C#, TypeScript, Rust or GDScript."),
  minStars: z.number().int().min(0).default(0).describe("Minimum GitHub star count used only as a repository-search filter; stars are not license or safety evidence."),
  limit: z.number().int().min(1).max(20).default(10).describe("Maximum GitHub repositories returned.")
});

export const checkLicenseInputSchema = z.object({
  license: z.string().min(1).describe("Known license identifier/name such as MIT, Apache-2.0, CC0-1.0, CC-BY-4.0 or GPL-3.0. Do not use this tool to infer a missing or unknown license from content.")
});

export const inspectRepositoryInputSchema = z.object({
  repository: z.string().regex(/^[^/\s]+\/[^/\s]+$/).describe("Public GitHub repository in exact owner/name form, for example raylib-extras/raylib-game-template.")
});

const attributionResourceSchema = z.object({
  name: z.string().min(1).describe("Human-readable resource name used in generated attribution output."),
  author: z.string().optional().describe("Creator/author name when known from the original source."),
  sourceUrl: z.string().url().describe("Canonical source URL for the adopted resource."),
  license: z.string().min(1).describe("Known license identifier/name for the adopted resource. Unknown rights should remain unknown rather than guessed."),
  licenseUrl: z.string().url().optional().describe("Canonical license text or authoritative license page when available."),
  modified: z.boolean().default(false).describe("Whether the resource was modified after adoption, used when generating attribution notes.")
});

export const generateAttributionInputSchema = attributionResourceSchema;

export const generateProjectAttributionInputSchema = z.object({
  resources: z.array(attributionResourceSchema).min(1).describe("Adopted resources with known source/license metadata to include in THIRD_PARTY_ASSETS.md and CREDITS.md output.")
});

export const toolInputSchemas = {
  find_game_assets: findGameAssetsInputSchema,
  find_reusable_projects: findReusableProjectsInputSchema,
  plan_project_adoption: planProjectAdoptionInputSchema,
  recommend_stack: recommendStackInputSchema,
  benchmark_resource_coverage: benchmarkResourceCoverageInputSchema,
  search_game_assets: searchGameAssetsInputSchema,
  search_live_assets: searchLiveAssetsInputSchema,
  get_asset_files: getAssetFilesInputSchema,
  plan_asset_install: planAssetInstallInputSchema,
  install_asset_file: installAssetFileInputSchema,
  list_asset_providers: listAssetProvidersInputSchema,
  audit_resource_verification: auditResourceVerificationInputSchema,
  search_open_source_projects: searchOpenSourceProjectsInputSchema,
  check_license: checkLicenseInputSchema,
  inspect_repository: inspectRepositoryInputSchema,
  generate_attribution: generateAttributionInputSchema,
  generate_project_attribution: generateProjectAttributionInputSchema
} as const;
