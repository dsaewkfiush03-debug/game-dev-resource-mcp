import assert from "node:assert/strict";
import test from "node:test";
import { mapGameIconTreeItem } from "./gameicons.js";
import { phaserProvider } from "./phaser.js";

test("Game Icons per-icon mapping preserves creator and attribution", () => {
  const asset = mapGameIconTreeItem({ path: "delapouite/car-wheel.svg", type: "blob", size: 1234 }, "2026-08-16T00:00:00.000Z");
  assert.ok(asset);
  assert.equal(asset.license, "CC-BY-3.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, true);
  assert.equal(asset.creator, "delapouite");
  assert.match(asset.attributionText ?? "", /delapouite/i);
  assert.equal(asset.formats?.[0], "svg");
});

test("Phaser starter templates are MIT and web focused", async () => {
  const [asset] = await phaserProvider.search({ query: "vite", engines: ["phaser"], limit: 5 });
  assert.equal(asset.license, "MIT");
  assert.equal(asset.commercialUse, true);
  assert.ok(asset.engine?.includes("web"));
  assert.ok(asset.assetTypes?.includes("starter"));
});