import assert from "node:assert/strict";
import test from "node:test";
import { checkLicense } from "../licenses.js";
import { mapGodotAsset, normalizeGodotLicense } from "./godotassetlib.js";
import { mapOpenverseItem, normalizeOpenverseLicense } from "./openverse.js";

test("Openverse license codes map to explicit license versions", () => {
  assert.equal(normalizeOpenverseLicense("cc0", "1.0"), "CC0-1.0");
  assert.equal(normalizeOpenverseLicense("pdm", "1.0"), "PDM-1.0");
  assert.equal(normalizeOpenverseLicense("by", "2.0"), "CC-BY-2.0");
  assert.equal(normalizeOpenverseLicense("by-sa", "4.0"), "CC-BY-SA-4.0");
  assert.equal(normalizeOpenverseLicense("by-nc", "3.0"), "CC-BY-NC-3.0");
});

test("Openverse CC BY media preserves creator source and attribution obligations", () => {
  const asset = mapOpenverseItem({
    id: "abc",
    title: "Road Texture",
    creator: "Example Artist",
    license: "by",
    license_version: "4.0",
    license_url: "https://creativecommons.org/licenses/by/4.0/",
    foreign_landing_url: "https://example.org/road",
    source: "example-source",
    filetype: "jpg",
    tags: [{ name: "road" }, { name: "asphalt" }]
  }, "2D", "2026-08-15T00:00:00.000Z");
  assert.equal(asset.provider, "openverse");
  assert.equal(asset.license, "CC-BY-4.0");
  assert.equal(asset.commercialUse, true);
  assert.equal(asset.attribution, true);
  assert.equal(asset.sourceUrl, "https://example.org/road");
  assert.ok(asset.tags.includes("road"));
});

test("Openverse noncommercial media is rejected from commercial search", () => {
  const asset = mapOpenverseItem({ id: "nc", title: "NC Sound", license: "by-nc", license_version: "3.0" }, "audio");
  assert.equal(asset.commercialUse, false);
  assert.equal(checkLicense(asset.license)?.risk, "reject");
});

test("Godot Asset Library license names normalize conservatively", () => {
  assert.equal(normalizeGodotLicense("MIT"), "MIT");
  assert.equal(normalizeGodotLicense("GPLv3"), "GPL-3.0");
  assert.equal(normalizeGodotLicense("Boost Software License"), "BSL-1.0");
  assert.equal(normalizeGodotLicense("Custom Weird License"), "Custom Weird License");
});

test("Godot live result maps license category and engine metadata", () => {
  const asset = mapGodotAsset({
    asset_id: "1234",
    title: "Inventory System",
    author: "dev",
    category: "Tools",
    godot_version: "4.7",
    cost: "MIT",
    support_level: "community"
  }, "2026-08-15T00:00:00.000Z");
  assert.equal(asset.provider, "godotassetlib");
  assert.equal(asset.license, "MIT");
  assert.equal(asset.commercialUse, true);
  assert.deepEqual(asset.engine, ["godot"]);
  assert.equal(asset.dimension, "code");
  assert.match(asset.sourceUrl, /\/asset\/1234$/);
});

test("public-domain and Boost rules are recognized", () => {
  assert.equal(checkLicense("PDM-1.0")?.risk, "safe");
  assert.equal(checkLicense("BSL-1.0")?.risk, "safe");
  assert.equal(checkLicense("CC-BY-2.0")?.risk, "attribution");
  assert.equal(checkLicense("CC-BY-NC-3.0")?.risk, "reject");
});
