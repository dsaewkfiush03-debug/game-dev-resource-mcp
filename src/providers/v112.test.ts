import assert from "node:assert/strict";
import test from "node:test";
import { buildCodeQueries, buildStackPlan } from "../recommend.js";
import { communityStartersProvider } from "./communitystarters.js";

test("AI code queries lead with behavior-tree and broad AI terminology", () => {
  const queries = buildCodeQueries("enemy npc ai", "godot");
  assert.equal(queries[0], "godot behavior tree");
  assert.equal(queries[1], "godot ai");
  assert.ok(queries.includes("behavior tree"));
});

test("inventory and combat queries start broad enough to return multiple ecosystem candidates", () => {
  assert.equal(buildCodeQueries("inventory loot", "unity")[0], "unity inventory");
  assert.equal(buildCodeQueries("combat weapon", "unreal")[0], "unreal combat");
  assert.equal(buildCodeQueries("multiplayer networking", "phaser")[0], "phaser multiplayer");
});

test("verified community starters expose Unity code-only candidates", async () => {
  const results = await communityStartersProvider.search({
    query: "unity starter",
    engines: ["unity"],
    dimensions: ["code"],
    reuseScopes: ["code-only"],
    limit: 20
  });
  assert.ok(results.length >= 3);
  assert.ok(results.every(asset => asset.license === "MIT"));
  assert.ok(results.every(asset => asset.commercialUse === true));
  assert.ok(results.every(asset => asset.reuseScope === "code-only"));
  assert.ok(results.every(asset => asset.bundledAssetStatus === "needs-review"));
  assert.ok(results.some(asset => asset.id === "team-on-unity-game-template"));
  assert.ok(results.some(asset => asset.id === "maikuraki-unity-starter"));
});

test("verified community starters expose three Unreal candidates without flattening mixed licenses", async () => {
  const results = await communityStartersProvider.search({
    query: "unreal starter",
    engines: ["unreal"],
    dimensions: ["code"],
    reuseScopes: ["code-only"],
    limit: 20
  });
  assert.ok(results.length >= 3);
  assert.ok(results.every(asset => asset.commercialUse === true));
  assert.ok(results.every(asset => asset.reuseScope === "code-only"));
  assert.ok(results.every(asset => asset.bundledAssetStatus === "needs-review"));
  assert.ok(results.some(asset => asset.id === "stpgabriel-ue5-template" && asset.license === "MIT"));
  assert.ok(results.some(asset => asset.id === "motionforge-ue5-game-starter" && asset.license === "MIT"));
  const cobra = results.find(asset => asset.id === "cobracode-ue5-2d-sidescroller");
  assert.ok(cobra);
  assert.equal(cobra.license, "CC0-1.0");
  assert.equal(cobra.attribution, false);
  assert.ok(cobra.licenseSource.includes("CobraCodeDev/TP_2DSideScrollerBP"));
});

test("Unity and Unreal stack plans no longer have an empty starter-provider gap", () => {
  const unity = buildStackPlan({ description: "Unity 3D survival game" });
  const unityStarter = unity.slots.find(slot => slot.id === "starter");
  assert.deepEqual(unityStarter?.providers, ["communitystarters"]);
  assert.deepEqual(unityStarter?.reuseScopes, ["whole-project", "code-only"]);

  const unreal = buildStackPlan({ description: "Unreal Engine 3D shooter" });
  const unrealStarter = unreal.slots.find(slot => slot.id === "starter");
  assert.deepEqual(unrealStarter?.providers, ["communitystarters"]);
  assert.deepEqual(unrealStarter?.reuseScopes, ["whole-project", "code-only"]);
});

test("Unity and Unreal gameplay code can draw from verified starter metadata plus GitHub", () => {
  const unity = buildStackPlan({ description: "Unity 3D game with enemy AI and combat" });
  const unityAi = unity.slots.find(slot => slot.id === "ai-system");
  assert.deepEqual(unityAi?.providers, ["communitystarters", "githubcode"]);

  const unreal = buildStackPlan({ description: "Unreal Engine shooter with combat" });
  const unrealCombat = unreal.slots.find(slot => slot.id === "combat-system");
  assert.deepEqual(unrealCombat?.providers, ["communitystarters", "githubcode"]);
});
