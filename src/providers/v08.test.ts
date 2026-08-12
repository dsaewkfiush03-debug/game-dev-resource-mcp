import assert from "node:assert/strict";
import test from "node:test";
import { kenneyProvider } from "./kenney.js";

test("Kenney catalog exposes music resources", async () => {
  const results = await kenneyProvider.search({ query: "", dimensions: ["audio"], assetTypes: ["music"], limit: 20 });
  assert.ok(results.some(item => item.id === "music-jingles"));
  assert.ok(results.every(item => item.license === "CC0-1.0"));
});

test("Kenney catalog exposes sci-fi SFX", async () => {
  const results = await kenneyProvider.search({ query: "sci-fi", dimensions: ["audio"], assetTypes: ["sfx"], limit: 20 });
  assert.ok(results.some(item => item.id === "sci-fi-sounds"));
});

test("Kenney catalog exposes voiceover separately", async () => {
  const results = await kenneyProvider.search({ query: "", dimensions: ["audio"], assetTypes: ["voiceover"], limit: 20 });
  assert.deepEqual(results.map(item => item.id), ["voiceover-pack"]);
});
