import assert from "node:assert/strict";
import test from "node:test";
import { mapGameIconTreeItem } from "./gameicons.js";
import { mapTablerIconTreeItem } from "./tablericons.js";
import { mapOpenverseItem } from "./openverse.js";

test("Game Icons mapping exposes individual SVG creator provenance", () => {
  const asset = mapGameIconTreeItem({ path: "andymeneely/police-badge.svg", type: "blob", size: 1466 });
  assert.ok(asset);
  assert.equal(asset.id, "andymeneely/police-badge.svg");
  assert.equal(asset.creator, "andymeneely");
  assert.equal(asset.license, "CC-BY-3.0");
  assert.equal(asset.attribution, true);
  assert.ok(asset.tags.includes("police"));
  assert.ok(asset.tags.includes("badge"));
});

test("Tabler outline icon maps to MIT per-icon metadata", () => {
  const asset = mapTablerIconTreeItem({ path: "car.svg", type: "blob", size: 900 }, "outline");
  assert.ok(asset);
  assert.equal(asset.id, "icons/outline/car.svg");
  assert.equal(asset.provider, "tablericons");
  assert.equal(asset.license, "MIT");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.creator, "Tabler Icons");
  assert.ok(asset.style?.includes("outline"));
});

test("Tabler filled icon retains filled variant", () => {
  const asset = mapTablerIconTreeItem({ path: "heart.svg", type: "blob", size: 700 }, "filled");
  assert.ok(asset);
  assert.equal(asset.id, "icons/filled/heart.svg");
  assert.ok(asset.tags.includes("filled"));
});

test("Openverse mapping exposes structured creator attribution fields", () => {
  const asset = mapOpenverseItem({
    id: "audio-1",
    title: "Engine sound",
    creator: "Example Creator",
    creator_url: "https://example.com/creator",
    attribution: "Engine sound by Example Creator",
    license: "by",
    license_version: "4.0",
    license_url: "https://creativecommons.org/licenses/by/4.0/",
    foreign_landing_url: "https://example.com/item"
  }, "audio");
  assert.equal(asset.creator, "Example Creator");
  assert.equal(asset.creatorUrl, "https://example.com/creator");
  assert.equal(asset.attributionText, "Engine sound by Example Creator");
});