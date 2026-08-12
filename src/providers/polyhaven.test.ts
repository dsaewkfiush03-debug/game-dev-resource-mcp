import test from "node:test";
import assert from "node:assert/strict";
import { flattenPolyHavenFiles, mapPolyHavenAsset } from "./polyhaven.js";

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

test("flattens nested Poly Haven file metadata without downloading assets", () => {
  const files = flattenPolyHavenFiles({
    hdri: {
      "1k": {
        hdr: {
          url: "https://example.test/test_1k.hdr",
          size: 1234,
          md5: "abc123"
        }
      }
    }
  });

  assert.equal(files.length, 1);
  assert.deepEqual(files[0], {
    path: "hdri/1k/hdr",
    url: "https://example.test/test_1k.hdr",
    size: 1234,
    md5: "abc123",
    format: "hdr",
    resolution: "1k"
  });
});
