import assert from "node:assert/strict";
import test from "node:test";
import { aggregateCoverageResults, aggregateProviderErrors, runCoverageBenchmark, selectCoverageScenarios } from "./coverage.js";
import type { CoverageScenario } from "./coverage-scenarios.js";
import type { StackRecommendationResult, StackSlotId } from "./recommend.js";
import type { RankedAsset } from "./search.js";

function asset(id: string): RankedAsset {
  return {
    id,
    name: id,
    provider: "kenney",
    sourceUrl: `https://example.test/${id}`,
    categories: ["Test"],
    tags: ["test"],
    license: "CC0-1.0",
    licenseSource: "https://example.test/license",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    retrievedAt: "2026-08-20T00:00:00.000Z",
    score: 100,
    matchReasons: ["test"],
    licenseRisk: "safe",
    providerMode: "verified-catalog"
  };
}

function result(slots: Array<{ id: StackSlotId; candidates: number; providers?: string[]; errors?: number }>): StackRecommendationResult {
  const recommendations = slots.map(slot => ({
    slot: {
      id: slot.id,
      label: slot.id,
      required: true,
      rationale: "test",
      queries: [slot.id],
      providers: (slot.providers ?? ["kenney"]) as any[]
    },
    queryUsed: slot.id,
    primary: slot.candidates > 0 ? asset(`${slot.id}-1`) : undefined,
    alternatives: Array.from({ length: Math.max(0, slot.candidates - 1) }, (_, index) => asset(`${slot.id}-${index + 2}`)),
    providerErrors: Array.from({ length: slot.errors ?? 0 }, () => ({ provider: "kenney" as const, message: "temporary" })),
    gap: slot.candidates === 0 ? "No candidate passed the requested search and license filters." : undefined
  }));
  const gaps = recommendations.filter(item => !item.primary).map(item => item.slot.id);
  return {
    inferred: { engine: "godot", dimension: "2D", styles: [], gameGenres: [], themes: [] },
    complete: gaps.length === 0,
    requiredGaps: gaps,
    recommendations,
    licenseSummary: { licenses: {}, risks: {}, attributionRequired: [], serviceCredits: [] },
    notes: []
  };
}

const scenarioA: CoverageScenario = { id: "a", label: "A", group: "godot", description: "Godot test" };
const scenarioB: CoverageScenario = { id: "b", label: "B", group: "unity", description: "Unity test" };

test("coverage suites expose balanced smoke and full scenario sets", () => {
  const smoke = selectCoverageScenarios({ suite: "smoke" });
  const full = selectCoverageScenarios({ suite: "full" });
  assert.equal(smoke.length, 12);
  assert.equal(full.length, 39);
  assert.ok(new Set(smoke.map(item => item.group)).size >= 6);
  assert.ok(full.some(item => item.id === "godot-pixel-road-survival"));
  assert.ok(full.some(item => item.id === "unreal-scifi-fps"));
  assert.ok(full.some(item => item.id === "generic-cjk-casual"));
});

test("coverage aggregation counts one-candidate success separately from depth-3 health", () => {
  const summary = aggregateCoverageResults([
    { scenario: scenarioA, recommendation: result([
      { id: "environment", candidates: 3 },
      { id: "ui", candidates: 1 },
      { id: "font", candidates: 0 }
    ]) }
  ]);
  assert.equal(summary.requiredSlots, 3);
  assert.equal(summary.coveredRequiredSlots, 2);
  assert.equal(summary.requiredSlotCoveragePercent, 66.7);
  assert.equal(summary.depth3RequiredSlots, 1);
  assert.equal(summary.depth3CoveragePercent, 33.3);
  assert.equal(summary.completeScenarios, 0);
  assert.equal(summary.weakSlots[0]?.slot, "font");
});

test("unsupported provider slots remain visible in the denominator", () => {
  const summary = aggregateCoverageResults([
    { scenario: scenarioB, recommendation: result([
      { id: "starter", candidates: 0, providers: [] },
      { id: "environment", candidates: 3 }
    ]) }
  ]);
  assert.equal(summary.unsupportedRequiredSlots, 1);
  assert.equal(summary.requiredSlotCoveragePercent, 50);
  const starter = summary.slotMetrics.find(item => item.slot === "starter");
  assert.equal(starter?.emptyProviderOccurrences, 1);
  assert.equal(starter?.coveragePercent, 0);
});

test("provider errors are reported separately from permanent coverage metrics", () => {
  const summary = aggregateCoverageResults([
    { scenario: scenarioA, recommendation: result([
      { id: "environment", candidates: 0, errors: 2 },
      { id: "ui", candidates: 3 }
    ]) }
  ]);
  assert.equal(summary.providerErrorCount, 2);
  assert.equal(summary.providerErrors.length, 1);
  assert.equal(summary.providerErrors[0]?.provider, "kenney");
  assert.equal(summary.providerErrors[0]?.occurrences, 2);
  const environment = summary.slotMetrics.find(item => item.slot === "environment");
  assert.equal(environment?.providerErrorOccurrences, 1);
});

test("provider error diagnostics classify rate limits, HTTP failures, timeouts and network errors", () => {
  const diagnostics = aggregateProviderErrors([
    { provider: "githubcode", message: "GitHub API 403: rate limit exceeded" },
    { provider: "githubcode", message: "GitHub API 403: You have exceeded a secondary rate limit" },
    { provider: "githubcode", message: "GitHub API 500: internal server error" },
    { provider: "openverse", message: "request timed out after 10 seconds" },
    { provider: "openverse", message: "fetch failed: ECONNRESET" }
  ]);

  const github = diagnostics.find(item => item.provider === "githubcode");
  assert.equal(github?.occurrences, 3);
  assert.deepEqual(github?.categories.map(item => item.category), [
    "http-403-rate-limit",
    "http-403-secondary-rate-limit",
    "http-500"
  ]);

  const openverse = diagnostics.find(item => item.provider === "openverse");
  assert.equal(openverse?.occurrences, 2);
  assert.deepEqual(openverse?.categories.map(item => item.category), ["network", "timeout"]);
});

test("runCoverageBenchmark supports deterministic injected recommendation engines", async () => {
  let calls = 0;
  const summary = await runCoverageBenchmark({ scenarioIds: ["godot-pixel-road-survival"], perSlotLimit: 3 }, async options => {
    calls += 1;
    assert.equal(options.perSlotLimit, 3);
    return result([
      { id: "starter", candidates: 3 },
      { id: "environment", candidates: 3 }
    ]);
  });
  assert.equal(calls, 1);
  assert.equal(summary.suite, "custom");
  assert.equal(summary.scenarioCount, 1);
  assert.equal(summary.requiredSlotCoveragePercent, 100);
  assert.equal(summary.depth3CoveragePercent, 100);
});
