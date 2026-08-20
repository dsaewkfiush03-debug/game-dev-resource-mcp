import assert from "node:assert/strict";
import test from "node:test";
import { listProviderCapabilities } from "./provider-capabilities.js";
import { planSearchQuery } from "./query-plan.js";
import type { ProviderAsset } from "./providers/index.js";
import { rankAssets, scoreAsset, searchAllAssets } from "./search.js";

const base = (overrides: Partial<ProviderAsset>): ProviderAsset => ({
  id: "asset",
  name: "Asset",
  provider: "kenney",
  sourceUrl: "https://example.com/asset",
  categories: [],
  tags: [],
  license: "CC0-1.0",
  licenseSource: "https://example.com/license",
  commercialUse: true,
  modification: true,
  redistribution: true,
  attribution: false,
  shareAlike: false,
  retrievedAt: "2026-08-16T00:00:00.000Z",
  ...overrides
});

test("name and tag matches outrank description-only matches", () => {
  const strong = base({ name: "Pixel Vehicle Pack", tags: ["car", "vehicle", "pixel"] });
  const weak = base({ name: "Misc Pack", description: "Contains a pixel vehicle" });
  assert.ok(scoreAsset(strong, "pixel vehicle").score > scoreAsset(weak, "pixel vehicle").score);
});

test("commercial-only filtering removes unknown commercial rights", () => {
  const safe = base({ id: "safe", name: "Safe Car" });
  const unknown = base({ id: "unknown", name: "Unknown Car", commercialUse: "unknown", popularity: 100000, updatedAt: "2026-08-15T00:00:00Z" });
  const results = rankAssets([unknown, safe], "car", { query: "car", commercialOnly: true });
  assert.deepEqual(results.map(item => item.id), ["safe"]);
});

test("share-alike assets are excluded by default", () => {
  const cc0 = base({ id: "cc0", name: "Car CC0" });
  const shareAlike = base({ id: "sa", name: "Car SA", shareAlike: true, attribution: true, license: "CC-BY-SA-4.0" });
  const defaultResults = rankAssets([shareAlike, cc0], "car");
  assert.deepEqual(defaultResults.map(item => item.id), ["cc0"]);

  const allowedResults = rankAssets([shareAlike, cc0], "car", { query: "car", allowShareAlike: true });
  assert.equal(allowedResults.length, 2);
});

test("popularity and freshness are bounded ranking signals", () => {
  const established = base({ id: "established", name: "Vehicle Pack", popularity: 1000, updatedAt: "2026-07-01T00:00:00Z" });
  const plain = base({ id: "plain", name: "Vehicle Pack" });
  const ranked = rankAssets([plain, established], "vehicle");
  assert.equal(ranked[0].id, "established");
  assert.ok(ranked[0].matchReasons.some(reason => reason.startsWith("popularity:")));
  assert.ok(ranked[0].matchReasons.some(reason => reason.startsWith("freshness:")));
  assert.ok(scoreAsset(established, "vehicle").score - scoreAsset(plain, "vehicle").score <= 9);
});

test("old resources remain eligible even when they receive no freshness bonus", () => {
  const old = base({ id: "old", name: "Vehicle Pack", updatedAt: "2015-01-01T00:00:00Z" });
  const results = rankAssets([old], "vehicle");
  assert.equal(results.length, 1);
  assert.equal(results[0].id, "old");
  assert.equal(results[0].matchReasons.some(reason => reason.startsWith("freshness:")), false);
});

test("ranking returns explanation and provider mode", () => {
  const [result] = rankAssets([base({ name: "Pixel Car", tags: ["vehicle"] })], "pixel car");
  assert.equal(result.providerMode, "verified-catalog");
  assert.equal(result.licenseRisk, "safe");
  assert.ok(result.matchReasons.includes("commercial-use-confirmed"));
});

test("semantic query planning expands turret concepts instead of requiring every natural-language token", () => {
  const plan = planSearchQuery("tower defense turret gun enemy 3D low poly", 8);
  assert.equal(plan.variants[0].level, "exact");
  assert.ok(plan.concepts.some(concept => concept.id === "turret"));
  assert.ok(plan.concepts.some(concept => concept.id === "tower-defense"));
  assert.ok(plan.variants.some(variant => ["turret", "cannon", "artillery", "weapon"].includes(variant.query)));
});

test("semantic scoring recognizes a tank or cannon as related to a turret request", () => {
  const tank = base({ id: "tank", name: "Low Poly Tank", provider: "quaternius", dimension: "3D", style: ["low-poly"], tags: ["tank", "military"], assetTypes: ["vehicle", "weapon"] });
  const unrelated = base({ id: "platformer", name: "1-Bit Platformer", dimension: "2D", tags: ["platformer"] });
  const query = "tower defense turret gun enemy 3D low poly";
  const ranked = rankAssets([unrelated, tank], query, { query, dimensions: ["3D"], commercialOnly: true });
  assert.deepEqual(ranked.map(item => item.id), ["tank"]);
  assert.ok(ranked[0].matchReasons.some(reason => reason.startsWith("semantic:turret:")));
});

test("real 3D tower-defense-style query broadens within verified 3D catalogs without returning 2D packs", async () => {
  const result = await searchAllAssets({
    query: "tower defense turret gun enemy 3D low poly",
    providers: ["kenney", "quaternius"],
    dimensions: ["3D"],
    commercialOnly: true,
    limit: 3,
    perProviderLimit: 20,
    maxQueryVariants: 6
  });
  assert.ok(result.results.length >= 1);
  assert.ok(result.results.every(asset => asset.dimension === "3D"));
  assert.ok(result.results.every(asset => asset.id !== "tower-defense-top-down" && asset.id !== "pixel-platformer"));
  assert.equal(result.diagnostics.fallbackUsed, true);
  assert.ok(result.diagnostics.attemptedQueries.length >= 2);
});

test("provider capability matrix prunes irrelevant dimensions", () => {
  const capabilities = listProviderCapabilities();
  const fonts = capabilities.find(item => item.provider === "googlefonts");
  const quaternius = capabilities.find(item => item.provider === "quaternius");
  assert.deepEqual(fonts?.dimensions, ["font"]);
  assert.deepEqual(quaternius?.dimensions, ["3D"]);
});
