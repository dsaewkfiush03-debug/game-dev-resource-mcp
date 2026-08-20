import { checkLicense } from "./licenses.js";
import { getProvider } from "./providers/index.js";
import type {
  AdoptionHint,
  AssetProviderId,
  BundledAssetStatus,
  ProviderAsset,
  ReuseScope
} from "./providers/types.js";
import { buildStackPlan, type RecommendStackOptions, type StackSlotId } from "./recommend.js";

export type AdoptionDecision =
  | "adopt-project-base"
  | "adopt-project-with-component-obligations"
  | "reuse-code-only"
  | "reference-only"
  | "not-a-project-base"
  | "manual-review-before-adoption";

export type AdoptionCoverage = "declared-in-candidate" | "verify-or-source";

export interface ProjectAdoptionOptions {
  provider: AssetProviderId;
  projectId: string;
  targetDescription: string;
  engine?: string;
  dimension?: "2D" | "3D";
  styles?: string[];
  gameGenres?: string[];
}

export interface AdoptionAction extends AdoptionHint {
  source: "catalog" | "policy";
}

export interface AdoptionLicenseObligation {
  scope: string;
  license: string;
  licenseSource: string;
  required: boolean;
  notes: string;
}

export interface AdoptionResourceNeed {
  slot: StackSlotId;
  label: string;
  required: boolean;
  rationale: string;
  coverage: AdoptionCoverage;
  queries: string[];
  providers: AssetProviderId[];
}

export interface AdoptionToolCall {
  tool: "find_game_assets" | "generate_project_attribution" | "inspect_repository";
  reason: string;
  arguments: Record<string, unknown>;
}

export interface ProjectAdoptionPlan {
  candidate: {
    provider: AssetProviderId;
    projectId: string;
    name: string;
    sourceUrl: string;
    engine: string[];
    license: string;
    licenseSource: string;
    verificationStatus?: string;
    verifiedAt?: string;
    reuseScope?: ReuseScope;
    bundledAssetStatus?: BundledAssetStatus;
    bundledAssetNotes?: string;
  };
  target: {
    description: string;
    inferredEngine?: string;
    inferredDimension?: "2D" | "3D";
    inferredStyles: string[];
    inferredGenres: string[];
    inferredThemes: string[];
  };
  decision: AdoptionDecision;
  allowedReuse: string[];
  forbiddenAssumptions: string[];
  actions: AdoptionAction[];
  licenseObligations: AdoptionLicenseObligation[];
  resourceNeeds: AdoptionResourceNeed[];
  nextToolCalls: AdoptionToolCall[];
  warnings: string[];
}

function preferredEngine(candidate: ProviderAsset, explicit?: string): string | undefined {
  if (explicit?.trim()) return explicit.trim().toLowerCase();
  const engines = candidate.engine ?? [];
  return engines.find(engine => !["web", "react", "nextjs"].includes(engine.toLowerCase())) ?? engines[0];
}

function decide(reuseScope: ReuseScope | undefined, bundledAssetStatus: BundledAssetStatus | undefined): AdoptionDecision {
  if (reuseScope === "whole-project") {
    if (bundledAssetStatus === "none" || bundledAssetStatus === "same-license") return "adopt-project-base";
    if (bundledAssetStatus === "separately-licensed") return "adopt-project-with-component-obligations";
    return "manual-review-before-adoption";
  }
  if (reuseScope === "code-only") return "reuse-code-only";
  if (reuseScope === "reference-only") return "reference-only";
  if (reuseScope === "asset-only") return "not-a-project-base";
  return "manual-review-before-adoption";
}

function allowedReuse(decision: AdoptionDecision): string[] {
  switch (decision) {
    case "adopt-project-base":
      return [
        "Use the maintained project structure as the starting codebase.",
        "Modify and redistribute covered project content subject to the stated license obligations.",
        "Retain verified reusable systems while replacing target-specific gameplay and presentation as needed."
      ];
    case "adopt-project-with-component-obligations":
      return [
        "Use the project as a base only while preserving each separately licensed component's obligations.",
        "Modify project code where the project license allows it."
      ];
    case "reuse-code-only":
      return [
        "Reuse the explicitly licensed source code and implementation structure.",
        "Port or adapt the reusable gameplay logic into the target project."
      ];
    case "reference-only":
      return ["Study architecture and behavior as an implementation reference."];
    case "not-a-project-base":
      return ["Use only the asset/media scope explicitly described by the resource record."];
    default:
      return ["Perform manual license/component review before adopting project content."];
  }
}

function policyActions(candidate: ProviderAsset, decision: AdoptionDecision): AdoptionAction[] {
  const actions: AdoptionAction[] = [];

  if (decision === "adopt-project-base") {
    actions.push({
      action: "keep",
      targetType: "system",
      target: "verified project structure and reusable gameplay systems",
      reason: "The maintained project record supports whole-project starter use under the stated obligations.",
      source: "policy"
    });
  }

  if (decision === "reuse-code-only") {
    actions.push(
      {
        action: "keep",
        targetType: "system",
        target: "explicitly licensed source code and implementation structure",
        reason: "The candidate is intentionally scoped to code reuse.",
        source: "policy"
      },
      {
        action: "replace",
        targetType: "asset-category",
        target: "bundled art, audio, fonts, logos and other media unless separately verified",
        reason: "Code-only reuse does not establish blanket rights for bundled media.",
        required: true,
        source: "policy"
      }
    );
  }

  if (candidate.bundledAssetStatus === "needs-review") {
    actions.push({
      action: "review",
      targetType: "asset-category",
      target: "all bundled or adjacent third-party media",
      reason: candidate.bundledAssetNotes ?? "Bundled asset licensing has not been blanket-cleared.",
      required: true,
      source: "policy"
    });
  } else if (candidate.bundledAssetStatus === "separately-licensed") {
    actions.push({
      action: "review",
      targetType: "notice",
      target: "component-specific license and attribution obligations",
      reason: "Bundled components use separate licenses and must retain their own obligations.",
      required: true,
      source: "policy"
    });
  }

  return actions;
}

function licenseObligations(candidate: ProviderAsset): AdoptionLicenseObligation[] {
  const obligations: AdoptionLicenseObligation[] = [];
  const rule = checkLicense(candidate.license);
  obligations.push({
    scope: "project/source",
    license: candidate.license,
    licenseSource: candidate.licenseSource,
    required: true,
    notes: rule?.notes ?? "License rule is not fully modeled; review the canonical license source before redistribution."
  });

  for (const component of candidate.componentLicenses ?? []) {
    const componentRule = checkLicense(component.license);
    obligations.push({
      scope: component.scope,
      license: component.license,
      licenseSource: component.licenseSource,
      required: true,
      notes: component.notes ?? componentRule?.notes ?? "Review this component's canonical license before redistribution."
    });
  }

  return obligations;
}

const SLOT_ASSET_TYPES: Partial<Record<StackSlotId, string[]>> = {
  environment: ["environment", "world-system", "map-system"],
  vehicle: ["vehicle"],
  character: ["character", "character-controller"],
  weapon: ["weapon"],
  ui: ["ui"],
  icons: ["icon"],
  sfx: ["audio", "sfx"],
  music: ["music", "audio"],
  font: ["font"],
  shader: ["shader"],
  "vehicle-system": ["vehicle-system"],
  "inventory-system": ["inventory-system"],
  "combat-system": ["combat-system"],
  networking: ["networking"],
  "save-system": ["save-system"],
  "ai-system": ["ai-system"],
  "procedural-generation": ["procedural-generation"],
  "dialogue-system": ["dialogue-system"]
};

function declaredCoverage(candidate: ProviderAsset, slot: StackSlotId): boolean {
  const wanted = SLOT_ASSET_TYPES[slot] ?? [];
  if (wanted.length === 0) return false;
  const assetTypes = (candidate.assetTypes ?? []).map(value => value.toLowerCase());
  return wanted.some(type => assetTypes.includes(type));
}

function resourceNeeds(candidate: ProviderAsset, stackOptions: RecommendStackOptions): {
  inferred: ReturnType<typeof buildStackPlan>["inferred"];
  needs: AdoptionResourceNeed[];
} {
  const stack = buildStackPlan(stackOptions);
  const needs = stack.slots
    .filter(slot => slot.id !== "starter")
    .map(slot => ({
      slot: slot.id,
      label: slot.label,
      required: slot.required,
      rationale: slot.rationale,
      coverage: declaredCoverage(candidate, slot.id) ? "declared-in-candidate" as const : "verify-or-source" as const,
      queries: slot.queries,
      providers: slot.providers
    }));
  return { inferred: stack.inferred, needs };
}

function nextToolCalls(candidate: ProviderAsset, needs: AdoptionResourceNeed[]): AdoptionToolCall[] {
  const calls: AdoptionToolCall[] = [];
  for (const need of needs.filter(item => item.required && item.coverage === "verify-or-source")) {
    calls.push({
      tool: "find_game_assets",
      reason: `Find or verify the required ${need.label} slot after adopting the project base.`,
      arguments: {
        query: need.queries[0] ?? need.label,
        providers: need.providers,
        commercialOnly: true,
        allowAttribution: true,
        allowShareAlike: false,
        limit: 5
      }
    });
  }

  calls.push({
    tool: "generate_project_attribution",
    reason: "Preserve the adopted project's source/license provenance in release documentation.",
    arguments: {
      resources: [{
        name: candidate.name,
        sourceUrl: candidate.sourceUrl,
        license: candidate.license,
        licenseUrl: candidate.licenseSource,
        modified: true
      }]
    }
  });
  return calls;
}

export function buildProjectAdoptionPlan(
  candidate: ProviderAsset,
  targetDescription: string,
  options: Omit<ProjectAdoptionOptions, "provider" | "projectId" | "targetDescription"> = {}
): ProjectAdoptionPlan {
  if (candidate.dimension !== "code" || !candidate.reuseScope) {
    throw new Error("candidate_is_not_a_reusable_project");
  }

  const engine = preferredEngine(candidate, options.engine);
  const { inferred, needs } = resourceNeeds(candidate, {
    description: targetDescription,
    engine,
    dimension: options.dimension,
    styles: options.styles,
    gameGenres: options.gameGenres
  });
  const decision = decide(candidate.reuseScope, candidate.bundledAssetStatus);
  const actions: AdoptionAction[] = [
    ...policyActions(candidate, decision),
    ...(candidate.adoptionHints ?? []).map(hint => ({ ...hint, source: "catalog" as const }))
  ];

  return {
    candidate: {
      provider: candidate.provider,
      projectId: candidate.id,
      name: candidate.name,
      sourceUrl: candidate.sourceUrl,
      engine: candidate.engine ?? [],
      license: candidate.license,
      licenseSource: candidate.licenseSource,
      verificationStatus: candidate.verificationStatus,
      verifiedAt: candidate.verifiedAt,
      reuseScope: candidate.reuseScope,
      bundledAssetStatus: candidate.bundledAssetStatus,
      bundledAssetNotes: candidate.bundledAssetNotes
    },
    target: {
      description: targetDescription,
      inferredEngine: inferred.engine,
      inferredDimension: inferred.dimension,
      inferredStyles: inferred.styles,
      inferredGenres: inferred.gameGenres,
      inferredThemes: inferred.themes
    },
    decision,
    allowedReuse: allowedReuse(decision),
    forbiddenAssumptions: [
      "Do not treat a repository or source-code license as blanket clearance for bundled media unless the maintained record says so.",
      "Do not invent project paths or claim a subsystem is present unless catalog metadata or repository inspection establishes it.",
      "Do not automatically clone, execute, extract or install the selected project as part of this planning step.",
      "Do not treat popularity, stars or public downloadability as license evidence."
    ],
    actions,
    licenseObligations: licenseObligations(candidate),
    resourceNeeds: needs,
    nextToolCalls: nextToolCalls(candidate, needs),
    warnings: [
      "This is a conservative technical adoption plan, not legal clearance.",
      "A resourceNeed marked verify-or-source means the selected candidate does not explicitly declare that slot in maintained metadata; inspect the project before assuming it is absent.",
      "Path-level actions are emitted only when the maintained catalog explicitly records those paths.",
      "Project adoption remains separate from automatic file installation and repository execution."
    ]
  };
}

export async function planProjectAdoption(options: ProjectAdoptionOptions): Promise<ProjectAdoptionPlan> {
  const provider = getProvider(options.provider);
  const assets = await provider.search({ query: "", dimensions: ["code"], limit: 100 });
  const candidate = assets.find(asset => asset.id === options.projectId);
  if (!candidate) throw new Error(`project_candidate_not_found:${options.provider}:${options.projectId}`);
  return buildProjectAdoptionPlan(candidate, options.targetDescription, options);
}