import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderAsset } from "./providers/index.js";
import { rankAssets, scoreAsset } from "./search.js";

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
  retrievedAt: "2026-08-12T00:00:00.000Z",
  ...overrides
});

test("name and tag matches outrank description-only matches", () => {
  const strong = base({ name: "Pixel Vehicle Pack", tags: ["car", "vehicle", "pixel"] });
  const weak = base({ name: "Misc Pack", description: "Contains a pixel vehicle" });
  assert.ok(scoreAsset(strong, "pixel vehicle").score > scoreAsset(weak, "pixel vehicle").score);
});

test("commercial-only filtering removes unknown commercial rights", () => {
  const safe = base({ id: "safe", name: "Safe Car" });
  const unknown = base({ id: "unknown", name: "Unknown Car", commercialUse: "unknown" });
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

test("ranking returns explanation and provider mode", () => {
  const [result] = rankAssets([base({ name: "Pixel Car", tags: ["vehicle"] })], "pixel car");
  assert.equal(result.providerMode, "verified-catalog");
  assert.equal(result.licenseRisk, "safe");
  assert.ok(result.matchReasons.includes("commercial-use-confirmed"));
});
