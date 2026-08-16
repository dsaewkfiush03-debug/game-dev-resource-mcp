import assert from "node:assert/strict";
import test from "node:test";
import { kenneyProvider } from "./kenney.js";
import { quaterniusProvider } from "./quaternius.js";
import { godotDemosProvider } from "./godotdemos.js";

test("Kenney catalog filters pixel UI metadata", async () => {
  const results = await kenneyProvider.search({ query: "", dimensions: ["2D"], styles: ["pixel"], assetTypes: ["ui"], limit: 50 });
  assert.ok(results.some(item => item.id === "pixel-ui-pack"));
  assert.ok(results.every(item => item.dimension === "2D"));
});

test("Quaternius catalog filters animated characters", async () => {
  const results = await quaterniusProvider.search({ query: "", assetTypes: ["character"], animated: true, limit: 50 });
  assert.ok(results.some(item => item.id === "rpg-characters"));
  assert.ok(results.every(item => item.animated === true));
});

test("Godot demos filter by engine and shader type without assuming a fixed catalog size", async () => {
  const results = await godotDemosProvider.search({ query: "", engines: ["godot"], assetTypes: ["shader"], limit: 50 });
  assert.ok(results.some(item => item.id === "godot-compute-demos"));
  assert.ok(results.every(item => item.engine?.includes("godot")));
  assert.ok(results.every(item => item.assetTypes?.includes("shader")));
  assert.ok(results.every(item => item.license === "MIT"));
  assert.ok(results.every(item => item.attribution === true));
});
