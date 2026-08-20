import { recommendStack, type RecommendStackOptions, type StackRecommendationResult, type StackSlotId } from "./recommend.js";
import {
  COVERAGE_SCENARIOS,
  COVERAGE_SMOKE_SCENARIO_IDS,
  type CoverageScenario,
  type CoverageScenarioGroup
} from "./coverage-scenarios.js";

export type CoverageSuite = "smoke" | "full";

export interface CoverageBenchmarkOptions {
  suite?: CoverageSuite;
  scenarioIds?: string[];
  groups?: CoverageScenarioGroup[];
  perSlotLimit?: number;
  concurrency?: number;
}

export interface CoverageSlotMetric {
  slot: StackSlotId;
  requiredOccurrences: number;
  coveredOccurrences: number;
  coveragePercent: number;
  depth3Occurrences: number;
  depth3Percent: number;
  totalCandidates: number;
  averageCandidates: number;
  emptyProviderOccurrences: number;
  providerErrorOccurrences: number;
}

export interface CoverageScenarioResult {
  id: string;
  label: string;
  group: CoverageScenarioGroup;
  description: string;
  inferred: StackRecommendationResult["inferred"];
  requiredSlots: number;
  coveredRequiredSlots: number;
  coveragePercent: number;
  depth3RequiredSlots: number;
  depth3Percent: number;
  complete: boolean;
  gaps: Array<{
    slot: StackSlotId;
    label: string;
    providers: string[];
    reason?: string;
  }>;
  weakSlots: Array<{
    slot: StackSlotId;
    label: string;
    candidateCount: number;
    providers: string[];
  }>;
  providerErrorCount: number;
}

export interface CoverageBenchmarkResult {
  suite: CoverageSuite | "custom";
  generatedAt: string;
  scenarioCount: number;
  requiredSlots: number;
  coveredRequiredSlots: number;
  requiredSlotCoveragePercent: number;
  depth3RequiredSlots: number;
  depth3CoveragePercent: number;
  completeScenarios: number;
  completeScenarioPercent: number;
  unsupportedRequiredSlots: number;
  providerErrorCount: number;
  groupMetrics: Array<{
    group: CoverageScenarioGroup;
    scenarioCount: number;
    requiredSlots: number;
    coveredRequiredSlots: number;
    coveragePercent: number;
    depth3RequiredSlots: number;
    depth3Percent: number;
    completeScenarios: number;
  }>;
  slotMetrics: CoverageSlotMetric[];
  weakSlots: CoverageSlotMetric[];
  scenarios: CoverageScenarioResult[];
  notes: string[];
}

export type CoverageRecommendFn = (options: RecommendStackOptions) => Promise<StackRecommendationResult>;

function roundPercent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 100;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function candidateCount(recommendation: StackRecommendationResult["recommendations"][number]): number {
  return recommendation.primary ? 1 + recommendation.alternatives.length : 0;
}

export function selectCoverageScenarios(options: CoverageBenchmarkOptions = {}): CoverageScenario[] {
  const requestedIds = options.scenarioIds?.filter(Boolean) ?? [];
  let selected: CoverageScenario[];

  if (requestedIds.length > 0) {
    const wanted = new Set(requestedIds);
    selected = COVERAGE_SCENARIOS.filter(scenario => wanted.has(scenario.id));
  } else if ((options.suite ?? "smoke") === "full") {
    selected = [...COVERAGE_SCENARIOS];
  } else {
    const smoke = new Set<string>(COVERAGE_SMOKE_SCENARIO_IDS);
    selected = COVERAGE_SCENARIOS.filter(scenario => smoke.has(scenario.id));
  }

  if (options.groups?.length) {
    const groups = new Set(options.groups);
    selected = selected.filter(scenario => groups.has(scenario.group));
  }

  return selected;
}

export function summarizeCoverageScenario(
  scenario: CoverageScenario,
  recommendation: StackRecommendationResult
): CoverageScenarioResult {
  const required = recommendation.recommendations.filter(item => item.slot.required);
  const covered = required.filter(item => Boolean(item.primary));
  const depth3 = required.filter(item => candidateCount(item) >= 3);
  const gaps = required
    .filter(item => !item.primary)
    .map(item => ({
      slot: item.slot.id,
      label: item.slot.label,
      providers: item.slot.providers,
      reason: item.gap
    }));
  const weakSlots = required
    .map(item => ({
      slot: item.slot.id,
      label: item.slot.label,
      candidateCount: candidateCount(item),
      providers: item.slot.providers
    }))
    .filter(item => item.candidateCount < 3)
    .sort((a, b) => a.candidateCount - b.candidateCount || a.slot.localeCompare(b.slot));
  const providerErrorCount = recommendation.recommendations.reduce((sum, item) => sum + item.providerErrors.length, 0);

  return {
    id: scenario.id,
    label: scenario.label,
    group: scenario.group,
    description: scenario.description,
    inferred: recommendation.inferred,
    requiredSlots: required.length,
    coveredRequiredSlots: covered.length,
    coveragePercent: roundPercent(covered.length, required.length),
    depth3RequiredSlots: depth3.length,
    depth3Percent: roundPercent(depth3.length, required.length),
    complete: recommendation.complete,
    gaps,
    weakSlots,
    providerErrorCount
  };
}

function aggregateSlotMetrics(
  scenarioPairs: Array<{ result: CoverageScenarioResult; recommendation: StackRecommendationResult }>
): CoverageSlotMetric[] {
  const metrics = new Map<StackSlotId, Omit<CoverageSlotMetric, "coveragePercent" | "depth3Percent" | "averageCandidates">>();

  for (const { recommendation } of scenarioPairs) {
    for (const item of recommendation.recommendations.filter(entry => entry.slot.required)) {
      const current = metrics.get(item.slot.id) ?? {
        slot: item.slot.id,
        requiredOccurrences: 0,
        coveredOccurrences: 0,
        depth3Occurrences: 0,
        totalCandidates: 0,
        emptyProviderOccurrences: 0,
        providerErrorOccurrences: 0
      };
      const count = candidateCount(item);
      current.requiredOccurrences += 1;
      if (count >= 1) current.coveredOccurrences += 1;
      if (count >= 3) current.depth3Occurrences += 1;
      current.totalCandidates += count;
      if (item.slot.providers.length === 0) current.emptyProviderOccurrences += 1;
      if (item.providerErrors.length > 0) current.providerErrorOccurrences += 1;
      metrics.set(item.slot.id, current);
    }
  }

  return Array.from(metrics.values())
    .map(item => ({
      ...item,
      coveragePercent: roundPercent(item.coveredOccurrences, item.requiredOccurrences),
      depth3Percent: roundPercent(item.depth3Occurrences, item.requiredOccurrences),
      averageCandidates: Math.round((item.totalCandidates / Math.max(1, item.requiredOccurrences)) * 100) / 100
    }))
    .sort((a, b) => a.slot.localeCompare(b.slot));
}

function aggregateGroups(results: CoverageScenarioResult[]): CoverageBenchmarkResult["groupMetrics"] {
  const groups = new Map<CoverageScenarioGroup, CoverageBenchmarkResult["groupMetrics"][number]>();
  for (const result of results) {
    const current = groups.get(result.group) ?? {
      group: result.group,
      scenarioCount: 0,
      requiredSlots: 0,
      coveredRequiredSlots: 0,
      coveragePercent: 0,
      depth3RequiredSlots: 0,
      depth3Percent: 0,
      completeScenarios: 0
    };
    current.scenarioCount += 1;
    current.requiredSlots += result.requiredSlots;
    current.coveredRequiredSlots += result.coveredRequiredSlots;
    current.depth3RequiredSlots += result.depth3RequiredSlots;
    if (result.complete) current.completeScenarios += 1;
    groups.set(result.group, current);
  }

  return Array.from(groups.values())
    .map(item => ({
      ...item,
      coveragePercent: roundPercent(item.coveredRequiredSlots, item.requiredSlots),
      depth3Percent: roundPercent(item.depth3RequiredSlots, item.requiredSlots)
    }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

export function aggregateCoverageResults(
  scenarioPairs: Array<{ scenario: CoverageScenario; recommendation: StackRecommendationResult }>,
  suite: CoverageSuite | "custom" = "custom"
): CoverageBenchmarkResult {
  const normalizedPairs = scenarioPairs.map(pair => ({
    result: summarizeCoverageScenario(pair.scenario, pair.recommendation),
    recommendation: pair.recommendation
  }));
  const scenarios = normalizedPairs.map(pair => pair.result);
  const requiredSlots = scenarios.reduce((sum, item) => sum + item.requiredSlots, 0);
  const coveredRequiredSlots = scenarios.reduce((sum, item) => sum + item.coveredRequiredSlots, 0);
  const depth3RequiredSlots = scenarios.reduce((sum, item) => sum + item.depth3RequiredSlots, 0);
  const completeScenarios = scenarios.filter(item => item.complete).length;
  const providerErrorCount = scenarios.reduce((sum, item) => sum + item.providerErrorCount, 0);
  const unsupportedRequiredSlots = scenarioPairs.reduce((sum, pair) => sum + pair.recommendation.recommendations.filter(item => item.slot.required && item.slot.providers.length === 0).length, 0);
  const slotMetrics = aggregateSlotMetrics(normalizedPairs);
  const weakSlots = [...slotMetrics]
    .filter(item => item.coveragePercent < 100 || item.depth3Percent < 100)
    .sort((a, b) => a.coveragePercent - b.coveragePercent || a.depth3Percent - b.depth3Percent || a.averageCandidates - b.averageCandidates)
    .slice(0, 12);

  return {
    suite,
    generatedAt: new Date().toISOString(),
    scenarioCount: scenarios.length,
    requiredSlots,
    coveredRequiredSlots,
    requiredSlotCoveragePercent: roundPercent(coveredRequiredSlots, requiredSlots),
    depth3RequiredSlots,
    depth3CoveragePercent: roundPercent(depth3RequiredSlots, requiredSlots),
    completeScenarios,
    completeScenarioPercent: roundPercent(completeScenarios, scenarios.length),
    unsupportedRequiredSlots,
    providerErrorCount,
    groupMetrics: aggregateGroups(scenarios),
    slotMetrics,
    weakSlots,
    scenarios,
    notes: [
      "Required-slot coverage means at least one candidate passed the current search and license filters.",
      "Depth-3 coverage means at least three candidates were returned for a required slot; it is a stronger proxy for healthy resource choice.",
      "Unsupported required slots remain in the denominator so missing engine/provider coverage is visible instead of hidden.",
      "Live-provider failures are reported separately because temporary API/network errors can depress a run without representing a permanent catalog gap.",
      "Benchmark scores are retrieval/coverage metrics, not legal clearance or asset-quality guarantees."
    ]
  };
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  const runners = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) return;
      results[current] = await worker(items[current]);
    }
  });
  await Promise.all(runners);
  return results;
}

export async function runCoverageBenchmark(
  options: CoverageBenchmarkOptions = {},
  recommend: CoverageRecommendFn = recommendStack
): Promise<CoverageBenchmarkResult> {
  const scenarios = selectCoverageScenarios(options);
  if (scenarios.length === 0) throw new Error("coverage_benchmark_has_no_matching_scenarios");
  const perSlotLimit = Math.max(3, Math.min(options.perSlotLimit ?? 3, 10));
  const concurrency = Math.max(1, Math.min(options.concurrency ?? 2, 4));
  const pairs = await mapWithConcurrency(scenarios, concurrency, async scenario => ({
    scenario,
    recommendation: await recommend({ description: scenario.description, perSlotLimit })
  }));
  const suite: CoverageSuite | "custom" = options.scenarioIds?.length || options.groups?.length ? "custom" : (options.suite ?? "smoke");
  return aggregateCoverageResults(pairs, suite);
}
