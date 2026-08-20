import assert from "node:assert/strict";
import test from "node:test";
import { kayKitRepositoryListPath, mapKayKitRepository } from "./kaykit.js";
import { quaterniusProvider } from "./quaternius.js";

test("KayKit official repository maps to CC0 3D pack metadata", () => {
  const asset = mapKayKitRepository({
    name: "KayKit-Character-Pack-Adventures-1.0",
    full_name: "KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0",
    html_url: "https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0",
    description: "KayKit Character Pack Adventures",
    default_branch: "main",
    stargazers_count: 315,
    updated_at: "2026-07-10T00:00:00Z",
    archived: false,
    fork: false,
    topics: ["game-assets", "characters"]
  }, "2026-08-16T00:00:00.000Z");

  assert.ok(asset);
  assert.equal(asset.provider, "kaykit");
  assert.equal(asset.license, "CC0-1.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, false);
  assert.equal(asset.creator, "Kay Lousberg");
  assert.equal(asset.popularity, 315);
  assert.equal(asset.updatedAt, "2026-07-10T00:00:00Z");
  assert.equal(asset.dimension, "3D");
  assert.ok(asset.assetTypes?.includes("character"));
  assert.equal(asset.animated, true);
  assert.ok(asset.licenseSource.endsWith("/LICENSE.txt"));
});

test("KayKit indexing uses the owner repository-list endpoint instead of GitHub search", () => {
  const path = kayKitRepositoryListPath();
  assert.ok(path.startsWith("/users/KayKit-Game-Assets/repos?"));
  assert.ok(path.includes("type=owner"));
  assert.ok(path.includes("per_page=100"));
  assert.ok(!path.includes("/search/"));
});

test("KayKit mapper rejects repositories outside the official owner account", () => {
  const asset = mapKayKitRepository({
    name: "KayKit-Fork",
    full_name: "random-user/KayKit-Fork",
    html_url: "https://github.com/random-user/KayKit-Fork",
    archived: false,
    fork: false
  });
  assert.equal(asset, undefined);
});

test("KayKit mapper rejects archived and fork repositories", () => {
  const base = {
    name: "KayKit-Test-1.0",
    full_name: "KayKit-Game-Assets/KayKit-Test-1.0",
    html_url: "https://github.com/KayKit-Game-Assets/KayKit-Test-1.0"
  };
  assert.equal(mapKayKitRepository({ ...base, archived: true, fork: false }), undefined);
  assert.equal(mapKayKitRepository({ ...base, archived: false, fork: true }), undefined);
});

test("Quaternius catalog includes current Downtown City MegaKit", async () => {
  const results = await quaterniusProvider.search({ query: "downtown city", dimensions: ["3D"], limit: 10 });
  const city = results.find(asset => asset.id === "downtown-city-megakit");
  assert.ok(city);
  assert.equal(city.license, "CC0-1.0");
  assert.ok(city.tags.includes("road"));
  assert.ok(city.assetTypes?.includes("building"));
  assert.ok(city.engine?.includes("godot"));
});
