import test from "node:test";
import assert from "node:assert/strict";
import { kenneyProvider } from "./kenney.js";
import { quaterniusProvider } from "./quaternius.js";

test("Kenney verified catalog returns CC0 commercial-safe entries", async () => {
  const results = await kenneyProvider.search({ query: "vehicle", limit: 10 });
  assert.ok(results.length >= 1);
  assert.ok(results.every(item => item.license === "CC0-1.0"));
  assert.ok(results.every(item => item.commercialUse === true));
  assert.ok(results.some(item => item.id === "pixel-vehicle-pack" || item.id === "car-kit"));
});

test("Quaternius verified catalog filters sci-fi entries without assuming a fixed catalog size", async () => {
  const results = await quaterniusProvider.search({ query: "sci-fi", limit: 50 });
  assert.ok(results.length >= 1);
  assert.ok(results.some(item => item.id === "modular-scifi-megakit"));
  assert.ok(results.every(item => item.tags.some(tag => tag.toLowerCase().includes("sci-fi")) || item.style?.some(style => style.toLowerCase().includes("sci-fi"))));
  assert.ok(results.every(item => item.license === "CC0-1.0"));
  assert.ok(results.every(item => item.attribution === false));
});
