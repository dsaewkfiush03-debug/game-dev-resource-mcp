import test from "node:test";
import assert from "node:assert/strict";
import { mapPolyHavenAsset } from "./polyhaven.js";

test("maps Poly Haven assets to conservative provider records", () => {
  const asset = mapPolyHavenAsset(
    "test_asset",
    {
      name: "Test Rock",
      description: "A rock asset",
      category: "Nature/Rocks",
      tags: ["Stone", "Outdoor"],
      type: 2
    },
    "2026-08-12T00:00:00.000Z"
  );

  assert.equal(asset.provider, "polyhaven");
  assert.equal(asset.license, "CC0-1.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, false);
  assert.equal(asset.apiAttributionRequired, true);
  assert.deepEqual(asset.categories, ["Nature", "Rocks"]);
  assert.ok(asset.tags.includes("3d"));
  assert.ok(asset.tags.includes("model"));
});
