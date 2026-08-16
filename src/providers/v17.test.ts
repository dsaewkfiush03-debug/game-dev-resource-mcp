import assert from "node:assert/strict";
import test from "node:test";
import { createCc0CatalogProvider } from "./catalog.js";
import { kenneyProvider } from "./kenney.js";

test("Kenney verified catalog now has broad multi-domain coverage", async () => {
  const assets = await kenneyProvider.search({ query: "", limit: 100 });
  assert.ok(assets.length >= 60, `expected at least 60 Kenney packs, got ${assets.length}`);
  assert.ok(assets.every(asset => asset.license === "CC0-1.0"));
  assert.ok(assets.every(asset => asset.verificationStatus === "verified"));
  assert.ok(assets.every(asset => asset.verifiedAt === "2026-08-16"));
});

test("Kenney catalog exposes modern city roads and buildings", async () => {
  const roads = await kenneyProvider.search({ query: "city road", dimensions: ["3D"], limit: 20 });
  assert.ok(roads.some(asset => asset.id === "city-kit-roads"));
  const buildings = await kenneyProvider.search({ query: "city building", dimensions: ["3D"], limit: 20 });
  assert.ok(buildings.some(asset => asset.assetTypes?.includes("building")));
});

test("Kenney catalog exposes cave dungeon and space environment packs", async () => {
  const cave = await kenneyProvider.search({ query: "cave", dimensions: ["3D"], limit: 20 });
  assert.ok(cave.some(asset => asset.id === "modular-cave-kit"));
  const dungeon = await kenneyProvider.search({ query: "dungeon", dimensions: ["3D"], limit: 20 });
  assert.ok(dungeon.some(asset => asset.id === "modular-dungeon-kit"));
  const space = await kenneyProvider.search({ query: "space", dimensions: ["3D"], limit: 20 });
  assert.ok(space.some(asset => asset.id === "modular-space-kit"));
});

test("Kenney catalog exposes production-support UI and VFX assets", async () => {
  const prompts = await kenneyProvider.search({ query: "input prompt", dimensions: ["2D"], limit: 20 });
  assert.ok(prompts.some(asset => asset.id === "input-prompts"));
  const lights = await kenneyProvider.search({ query: "light vfx", dimensions: ["2D"], limit: 20 });
  assert.ok(lights.some(asset => asset.id === "light-masks"));
});

test("catalog entries may override provider verification metadata", async () => {
  const provider = createCc0CatalogProvider(
    "kenney",
    "Fixture",
    "https://example.com/license",
    [{
      id: "fixture",
      name: "Fixture",
      sourceUrl: "https://example.com/fixture",
      verificationStatus: "needs-review",
      verifiedAt: "2024-01-01",
      categories: ["2D"],
      tags: ["fixture"]
    }],
    { verificationStatus: "verified", verifiedAt: "2026-08-16" }
  );
  const [asset] = await provider.search({ query: "fixture" });
  assert.equal(asset.verificationStatus, "needs-review");
  assert.equal(asset.verifiedAt, "2024-01-01");
});