import assert from "node:assert/strict";
import test from "node:test";
import { gameIconsProvider } from "./gameicons.js";
import { phaserProvider } from "./phaser.js";

test("Game Icons results require attribution", async () => {
  const [asset] = await gameIconsProvider.search({ query: "vehicle", limit: 5 });
  assert.equal(asset.license, "CC-BY-3.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, true);
});

test("Phaser starter templates are MIT and web focused", async () => {
  const [asset] = await phaserProvider.search({ query: "vite", engines: ["phaser"], limit: 5 });
  assert.equal(asset.license, "MIT");
  assert.equal(asset.commercialUse, true);
  assert.ok(asset.engine?.includes("web"));
  assert.ok(asset.assetTypes?.includes("starter"));
});
