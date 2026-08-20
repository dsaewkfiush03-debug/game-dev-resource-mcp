import assert from "node:assert/strict";
import test from "node:test";
import { mapAmbientCgAsset } from "./ambientcg.js";
import { githubRateLimitDelayMs, mapGithubCodeRepo, normalizeGithubCodeQuery } from "./githubcode.js";
import { googleFontsProvider } from "./googlefonts.js";

test("ambientCG material maps to CC0 3D PBR metadata", () => {
  const asset = mapAmbientCgAsset({
    id: "Road012",
    title: "Road 012",
    type: "Material",
    tags: ["road", "asphalt"]
  }, "2026-08-16T00:00:00.000Z");
  assert.ok(asset);
  assert.equal(asset.provider, "ambientcg");
  assert.equal(asset.license, "CC0-1.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, false);
  assert.equal(asset.dimension, "3D");
  assert.ok(asset.assetTypes?.includes("material"));
  assert.ok(asset.tags.includes("pbr"));
  assert.ok(asset.tags.includes("road"));
});

test("ambientCG decal remains a 2D texture-class resource", () => {
  const asset = mapAmbientCgAsset({ id: "Decal001", title: "Warning Decal", type: "Decal" });
  assert.ok(asset);
  assert.equal(asset.dimension, "2D");
  assert.ok(asset.assetTypes?.includes("decal"));
  assert.ok(asset.assetTypes?.includes("texture"));
});

test("GitHub code provider canonicalizes fallback query noise", () => {
  assert.equal(normalizeGithubCodeQuery("Godot inventory loot system"), "godot inventory loot");
  assert.equal(normalizeGithubCodeQuery("godot inventory loot plugin"), "godot inventory loot");
  assert.equal(normalizeGithubCodeQuery("GODOT inventory loot addon library"), "godot inventory loot");
  assert.equal(normalizeGithubCodeQuery("combat weapon game system"), "combat weapon");
});

test("GitHub Search rate-limit delay waits for reset or Retry-After without inventing a delay", () => {
  const now = 1_000_000;
  assert.equal(githubRateLimitDelayMs({ remaining: 12, resetEpochSeconds: 2000 }, now), 0);
  assert.equal(githubRateLimitDelayMs({ remaining: 0, resetEpochSeconds: 1002 }, now), 3500);
  assert.equal(githubRateLimitDelayMs({ remaining: 0, retryAfterSeconds: 3 }, now), 4500);
});

test("GitHub code provider maps a detected MIT repository conservatively", () => {
  const asset = mapGithubCodeRepo({
    id: 1,
    full_name: "example/godot-inventory",
    html_url: "https://github.com/example/godot-inventory",
    description: "Inventory system for Godot",
    stargazers_count: 120,
    language: "GDScript",
    topics: ["godot", "inventory"],
    license: { spdx_id: "MIT" }
  }, "2026-08-16T00:00:00.000Z");
  assert.ok(asset);
  assert.equal(asset.provider, "githubcode");
  assert.equal(asset.dimension, "code");
  assert.equal(asset.license, "MIT");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, true);
  assert.equal(asset.reuseScope, "code-only");
  assert.equal(asset.bundledAssetStatus, "needs-review");
  assert.ok(asset.engine?.includes("godot"));
});

test("GitHub code provider recognizes UrhoX/Urho3D niche-engine repositories", () => {
  const asset = mapGithubCodeRepo({
    id: 3,
    full_name: "example/urho3d-lua-starter",
    html_url: "https://github.com/example/urho3d-lua-starter",
    description: "Lua starter and tower defense experiments for Urho3D",
    stargazers_count: 8,
    language: "Lua",
    topics: ["urho3d", "lua", "tower-defense"],
    license: { spdx_id: "MIT" }
  });
  assert.ok(asset);
  assert.ok(asset.engine?.includes("urhox"));
  assert.ok(asset.formats?.includes("lua"));
  assert.equal(asset.reuseScope, "code-only");
  assert.equal(asset.bundledAssetStatus, "needs-review");
});

test("GitHub code provider fails closed when no license is detected", () => {
  const asset = mapGithubCodeRepo({
    id: 2,
    full_name: "example/unlicensed-game-code",
    html_url: "https://github.com/example/unlicensed-game-code",
    description: "Useful code with no explicit license",
    license: null
  });
  assert.ok(asset);
  assert.equal(asset.license, "NO-LICENSE");
  assert.equal(asset.commercialUse, false);
  assert.equal(asset.modification, false);
});

test("expanded Google Fonts catalog covers CJK horror military and sci-fi game UI", async () => {
  const cjk = await googleFontsProvider.search({ query: "cjk font", dimensions: ["font"], limit: 20 });
  assert.ok(cjk.some(asset => asset.id === "noto-sans-sc"));
  assert.ok(cjk.every(asset => asset.license === "OFL-1.1"));
  assert.ok(cjk.every(asset => asset.licenseSource.includes("OFL.txt")));

  const horror = await googleFontsProvider.search({ query: "horror font", limit: 20 });
  assert.ok(horror.some(asset => asset.id === "creepster"));

  const military = await googleFontsProvider.search({ query: "military font", limit: 20 });
  assert.ok(military.some(asset => asset.id === "black-ops-one"));

  const sciFi = await googleFontsProvider.search({ query: "sci-fi font", limit: 20 });
  assert.ok(sciFi.some(asset => asset.id === "orbitron"));
  assert.ok(sciFi.some(asset => asset.id === "oxanium"));
});
