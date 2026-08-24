import assert from "node:assert/strict";
import test from "node:test";
import { clearAssetSearchCache, compactAsset, searchAssetsPage, type SearchPageOptions } from "./search-ux.js";
import type { RankedAsset } from "./search.js";

test("compact asset keeps agent-useful search fields while dropping verbose provenance internals", () => {
  const asset: RankedAsset = {
    id: "cyberpunk-kit",
    name: "Cyberpunk Game Kit",
    provider: "quaternius",
    sourceUrl: "https://example.test/cyberpunk",
    description: "Characters enemies turrets and neon props",
    categories: ["3D"],
    tags: ["cyberpunk", "turret", "enemy"],
    dimension: "3D",
    style: ["low-poly"],
    formats: ["FBX", "OBJ"],
    assetTypes: ["character", "weapon", "environment"],
    gameGenres: ["shooter"],
    license: "CC0-1.0",
    licenseSource: "https://example.test/license",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: false,
    shareAlike: false,
    retrievedAt: "2026-08-24T00:00:00Z",
    score: 59,
    matchReasons: ["semantic:turret:tag:turret", "semantic:enemy:tag:enemy", "license-source-present", "commercial-use-confirmed"],
    licenseRisk: "safe",
    providerMode: "verified-catalog"
  };
  const compact = compactAsset(asset);
  assert.equal(compact.id, "cyberpunk-kit");
  assert.equal(compact.license, "CC0-1.0");
  assert.ok(compact.matchReasons.every(reason => reason.startsWith("semantic:")));
  assert.equal("licenseSource" in compact, false);
  assert.equal("retrievedAt" in compact, false);
});

test("repeated identical cross-provider page search is served from the process cache", async () => {
  clearAssetSearchCache();
  const options: SearchPageOptions = {
    query: "cyberpunk turret enemy 3D low poly",
    providers: ["quaternius"],
    dimensions: ["3D"],
    commercialOnly: true,
    limit: 2,
    offset: 0,
    responseMode: "summary",
    cacheTtlMs: 60_000
  };
  const first = await searchAssetsPage(options);
  const second = await searchAssetsPage(options);
  assert.equal(first.diagnostics.cache.hit, false);
  assert.equal(second.diagnostics.cache.hit, true);
  assert.equal(second.pagination.offset, 0);
  assert.equal(second.pagination.limit, 2);
  assert.ok(second.results.length <= 2);
});

test("pagination exposes nextOffset without leaking results from before the requested offset", async () => {
  clearAssetSearchCache();
  const first = await searchAssetsPage({
    query: "weapon gun 3D",
    providers: ["quaternius"],
    dimensions: ["3D"],
    commercialOnly: true,
    limit: 2,
    offset: 0,
    responseMode: "summary"
  });
  assert.equal(first.pagination.offset, 0);
  assert.ok(first.results.length > 0);
  if (first.pagination.hasMore) {
    const second = await searchAssetsPage({
      query: "weapon gun 3D",
      providers: ["quaternius"],
      dimensions: ["3D"],
      commercialOnly: true,
      limit: 2,
      offset: first.pagination.nextOffset ?? 0,
      responseMode: "summary"
    });
    const firstIds = new Set(first.results.map(asset => asset.id));
    assert.ok(second.results.every(asset => !firstIds.has(asset.id)));
  }
});
