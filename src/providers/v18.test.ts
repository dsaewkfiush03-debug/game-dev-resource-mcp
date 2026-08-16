import assert from "node:assert/strict";
import test from "node:test";
import { godotDemosProvider } from "./godotdemos.js";
import { phaserProvider } from "./phaser.js";
import { quaterniusProvider } from "./quaternius.js";

const VERIFIED_AT = "2026-08-16T00:00:00.000Z";

test("Quaternius v1.8 catalog has broad verified CC0 coverage", async () => {
  const assets = await quaterniusProvider.search({ query: "", limit: 100 });
  assert.ok(assets.length >= 35, `expected at least 35 Quaternius packs, got ${assets.length}`);
  assert.ok(assets.every(asset => asset.license === "CC0-1.0"));
  assert.ok(assets.every(asset => asset.commercialUse === true));
  assert.ok(assets.every(asset => asset.verificationStatus === "verified"));
  assert.ok(assets.every(asset => asset.verifiedAt === VERIFIED_AT));
});

test("Quaternius exposes modern city, apocalypse and universal animation resources", async () => {
  const city = await quaterniusProvider.search({ query: "city road", dimensions: ["3D"], limit: 30 });
  assert.ok(city.some(asset => ["downtown-city-megakit", "modular-streets"].includes(asset.id)));

  const zombie = await quaterniusProvider.search({ query: "zombie survival", dimensions: ["3D"], limit: 30 });
  assert.ok(zombie.some(asset => asset.id === "zombie-apocalypse-kit"));

  const animation = await quaterniusProvider.search({ query: "humanoid animation", dimensions: ["3D"], limit: 30 });
  assert.ok(animation.some(asset => ["universal-animation-library", "universal-animation-library-2"].includes(asset.id)));
});

test("Godot verified catalog exposes concrete 2D starter games", async () => {
  const assets = await godotDemosProvider.search({ query: "godot 2d starter", limit: 100 });
  const ids = assets.map(asset => asset.id);
  assert.ok(ids.includes("godot-2d-platformer"));
  assert.ok(ids.includes("godot-2d-rpg"));
  assert.ok(ids.includes("godot-dodge-the-creeps"));
  assert.ok(assets.every(asset => asset.license === "MIT"));
  assert.ok(assets.every(asset => asset.verificationStatus === "verified"));
  assert.ok(assets.every(asset => asset.verifiedAt === VERIFIED_AT));
});

test("Godot verified catalog exposes concrete vehicle, navigation and procedural references", async () => {
  const vehicle = await godotDemosProvider.search({ query: "vehicle driving", limit: 30 });
  assert.ok(vehicle.some(asset => asset.id === "godot-3d-truck-town"));

  const navigation = await godotDemosProvider.search({ query: "navigation pathfinding", limit: 30 });
  assert.ok(navigation.some(asset => ["godot-2d-navigation", "godot-2d-astar", "godot-3d-navigation", "godot-3d-navigation-chunks"].includes(asset.id)));

  const procedural = await godotDemosProvider.search({ query: "procedural generation", limit: 30 });
  assert.ok(procedural.some(asset => asset.id === "godot-3d-voxel"));
});

test("Phaser official catalog includes create-game but not mixed-license examples repository", async () => {
  const assets = await phaserProvider.search({ query: "phaser starter", limit: 30 });
  const createGame = assets.find(asset => asset.id === "create-game");
  assert.ok(createGame);
  assert.equal(createGame.license, "MIT");
  assert.equal(createGame.licenseSource, "https://github.com/phaserjs/create-game/blob/main/package.json");
  assert.equal(createGame.verificationStatus, "verified");
  assert.equal(createGame.verifiedAt, VERIFIED_AT);
  assert.ok(!assets.some(asset => asset.sourceUrl.includes("phaserjs/examples")));
});
