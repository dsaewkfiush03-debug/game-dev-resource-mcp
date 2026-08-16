import assert from "node:assert/strict";
import test from "node:test";
import { godotDemosProvider } from "./godotdemos.js";
import { phaserProvider } from "./phaser.js";
import { raylibProvider } from "./raylib.js";
import { buildStackPlan } from "../recommend.js";
import { searchAllAssets } from "../search.js";

const VERIFIED_AT = "2026-08-16T00:00:00.000Z";

test("Raylib provider separates whole-project template reuse from code-only game references", async () => {
  const assets = await raylibProvider.search({ query: "", limit: 100 });
  assert.ok(assets.length >= 6);
  assert.ok(assets.every(asset => asset.license === "Zlib"));
  assert.ok(assets.every(asset => asset.commercialUse === true));
  assert.ok(assets.every(asset => asset.verificationStatus === "verified"));
  assert.ok(assets.every(asset => asset.verifiedAt === VERIFIED_AT));

  const template = assets.find(asset => asset.id === "raylib-game-template");
  assert.ok(template);
  assert.equal(template.reuseScope, "whole-project");
  assert.equal(template.bundledAssetStatus, "none");

  const collection = assets.find(asset => asset.id === "raylib-games-collection");
  assert.ok(collection);
  assert.equal(collection.reuseScope, "code-only");
  assert.equal(collection.bundledAssetStatus, "needs-review");
});

test("Godot official demos expose whole-project reuse metadata", async () => {
  const results = await godotDemosProvider.search({ query: "platformer", reuseScopes: ["whole-project"], limit: 20 });
  assert.ok(results.some(asset => asset.id === "godot-2d-platformer"));
  assert.ok(results.every(asset => asset.reuseScope === "whole-project"));
  assert.ok(results.every(asset => asset.bundledAssetStatus === "same-license"));
});

test("Phaser starters remain code-only because bundled media is not blanket-approved", async () => {
  const results = await phaserProvider.search({ query: "starter", reuseScopes: ["code-only"], limit: 20 });
  assert.ok(results.length >= 1);
  assert.ok(results.every(asset => asset.reuseScope === "code-only"));
  assert.ok(results.every(asset => asset.bundledAssetStatus === "needs-review"));
});

test("unified search can require whole-project reusable starters", async () => {
  const result = await searchAllAssets({
    query: "starter",
    providers: ["godotdemos", "phaser", "raylib"],
    dimensions: ["code"],
    reuseScopes: ["whole-project"],
    commercialOnly: true,
    limit: 50
  });
  assert.ok(result.results.some(asset => asset.provider === "godotdemos"));
  assert.ok(result.results.some(asset => asset.id === "raylib-game-template"));
  assert.ok(!result.results.some(asset => asset.provider === "phaser"));
  assert.ok(result.results.every(asset => asset.reuseScope === "whole-project"));
});

test("Raylib descriptions receive a verified starter slot", () => {
  const plan = buildStackPlan({ description: "raylib 2D platformer game" });
  assert.equal(plan.inferred.engine, "raylib");
  const starter = plan.slots.find(slot => slot.id === "starter");
  assert.ok(starter);
  assert.deepEqual(starter.providers, ["raylib"]);
  assert.deepEqual(starter.reuseScopes, ["whole-project", "code-only"]);
});