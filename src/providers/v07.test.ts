import assert from "node:assert/strict";
import test from "node:test";
import { generateProjectAttribution } from "../attribution.js";
import { checkLicense } from "../licenses.js";
import { googleFontsProvider } from "./googlefonts.js";

test("OFL 1.1 is commercially usable with notice obligations", () => {
  const rule = checkLicense("OFL-1.1");
  assert.equal(rule?.commercialUse, true);
  assert.equal(rule?.attribution, true);
});

test("Google Fonts provider filters pixel fonts", async () => {
  const results = await googleFontsProvider.search({ query: "pixel", dimensions: ["font"], limit: 10 });
  assert.ok(results.some(item => item.id === "press-start-2p"));
  assert.ok(results.every(item => item.license === "OFL-1.1"));
});

test("project attribution emits detailed and credits manifests", () => {
  const result = generateProjectAttribution([
    { name: "Game Icon", author: "Example", sourceUrl: "https://example.com/icon", license: "CC-BY-3.0" },
    { name: "CC0 Asset", sourceUrl: "https://example.com/cc0", license: "CC0-1.0" }
  ]);
  assert.match(result.thirdPartyAssets, /Game Icon/);
  assert.match(result.credits, /Game Icon/);
  assert.doesNotMatch(result.credits, /CC0 Asset/);
});
