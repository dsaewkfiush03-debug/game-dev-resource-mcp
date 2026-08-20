import assert from "node:assert/strict";
import test from "node:test";
import { buildProjectAdoptionPlan, planProjectAdoption } from "./adoption.js";
import type { ProviderAsset } from "./providers/types.js";

function fixture(overrides: Partial<ProviderAsset> = {}): ProviderAsset {
  return {
    id: "fixture-project",
    name: "Fixture Project",
    provider: "raylib",
    sourceUrl: "https://example.test/project",
    categories: ["Code", "Starter"],
    tags: ["starter"],
    engine: ["raylib"],
    dimension: "code",
    formats: ["c"],
    assetTypes: ["starter", "code"],
    gameGenres: [],
    reuseScope: "whole-project",
    bundledAssetStatus: "none",
    license: "Zlib",
    licenseSource: "https://example.test/license",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    retrievedAt: "2026-08-20T00:00:00.000Z",
    ...overrides
  };
}

test("whole-project adoption produces a project-base decision and target resource plan", async () => {
  const plan = await planProjectAdoption({
    provider: "raylib",
    projectId: "raylib-game-template",
    targetDescription: "raylib 2D road survival game with vehicles, combat and inventory"
  });

  assert.equal(plan.decision, "adopt-project-base");
  assert.equal(plan.candidate.reuseScope, "whole-project");
  assert.equal(plan.candidate.bundledAssetStatus, "none");
  assert.ok(plan.actions.some(action => action.targetType === "path" && action.target === "src/" && action.action === "keep"));
  assert.ok(plan.actions.some(action => action.targetType === "path" && action.target === "screenshots/" && action.action === "replace"));
  assert.ok(plan.licenseObligations.some(item => item.license === "Zlib" && item.notes.includes("origin")));
  assert.ok(plan.resourceNeeds.some(item => item.slot === "vehicle" && item.required));
  assert.ok(plan.resourceNeeds.some(item => item.slot === "combat-system" && item.required));
  assert.ok(plan.nextToolCalls.some(call => call.tool === "find_game_assets"));
  assert.ok(plan.nextToolCalls.some(call => call.tool === "generate_project_attribution"));
});

test("code-only project forces media replacement and preserves declared subsystem coverage", async () => {
  const plan = await planProjectAdoption({
    provider: "raylib",
    projectId: "raylib-classic-asteroids",
    targetDescription: "raylib 2D arcade shooter with combat"
  });

  assert.equal(plan.decision, "reuse-code-only");
  assert.equal(plan.candidate.bundledAssetStatus, "needs-review");
  assert.ok(plan.actions.some(action => action.action === "replace" && action.targetType === "asset-category" && action.required));
  assert.ok(plan.actions.some(action => action.action === "review" && action.targetType === "asset-category" && action.required));
  const combat = plan.resourceNeeds.find(item => item.slot === "combat-system");
  assert.equal(combat?.coverage, "declared-in-candidate");
  assert.ok(!plan.nextToolCalls.some(call => call.tool === "find_game_assets" && String(call.reason).includes("Combat system")));
});

test("Phaser starter adoption stays code-only and carries provider-level replacement guidance", async () => {
  const plan = await planProjectAdoption({
    provider: "phaser",
    projectId: "template-vite",
    targetDescription: "Phaser browser platformer with combat"
  });

  assert.equal(plan.decision, "reuse-code-only");
  assert.equal(plan.candidate.bundledAssetStatus, "needs-review");
  assert.ok(plan.actions.some(action => action.source === "catalog" && action.action === "replace" && action.target.includes("example images")));
});

test("separately licensed whole-project candidates require component obligations", () => {
  const plan = buildProjectAdoptionPlan(fixture({
    bundledAssetStatus: "separately-licensed",
    componentLicenses: [{
      scope: "music",
      license: "CC-BY-4.0",
      licenseSource: "https://example.test/music-license",
      commercialUse: true,
      attribution: true,
      shareAlike: false
    }]
  }), "raylib 2D arcade game");

  assert.equal(plan.decision, "adopt-project-with-component-obligations");
  assert.ok(plan.licenseObligations.some(item => item.scope === "music" && item.license === "CC-BY-4.0"));
  assert.ok(plan.actions.some(action => action.targetType === "notice" && action.required));
});

test("candidate without project reuse metadata is rejected instead of guessed", () => {
  assert.throws(() => buildProjectAdoptionPlan(fixture({ reuseScope: undefined }), "raylib game"), /candidate_is_not_a_reusable_project/);
});