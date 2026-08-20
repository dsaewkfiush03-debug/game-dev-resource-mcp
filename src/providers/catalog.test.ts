import test from "node:test";
import assert from "node:assert/strict";
import { createVerifiedCatalogProvider } from "./catalog.js";
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

test("verified catalog entries can override the provider default license with a complete profile", async () => {
  const provider = createVerifiedCatalogProvider(
    "communitystarters",
    "Mixed License Fixture",
    {
      license: "MIT",
      licenseSource: "https://example.test/default-mit",
      commercialUse: true,
      modification: true,
      redistribution: true,
      attribution: true,
      shareAlike: false
    },
    [
      {
        id: "default-entry",
        name: "Default MIT Entry",
        sourceUrl: "https://example.test/default",
        categories: ["Code"],
        tags: ["starter"],
        dimension: "code"
      },
      {
        id: "cc0-entry",
        name: "CC0 Override Entry",
        sourceUrl: "https://example.test/cc0",
        categories: ["Code"],
        tags: ["starter"],
        dimension: "code",
        licenseProfile: {
          license: "CC0-1.0",
          licenseSource: "https://example.test/cc0-license",
          commercialUse: true,
          modification: true,
          redistribution: true,
          attribution: false,
          shareAlike: false
        }
      }
    ]
  );

  const results = await provider.search({ query: "", limit: 10 });
  const defaultEntry = results.find(item => item.id === "default-entry");
  const overrideEntry = results.find(item => item.id === "cc0-entry");
  assert.equal(defaultEntry?.license, "MIT");
  assert.equal(defaultEntry?.attribution, true);
  assert.equal(defaultEntry?.licenseSource, "https://example.test/default-mit");
  assert.equal(overrideEntry?.license, "CC0-1.0");
  assert.equal(overrideEntry?.attribution, false);
  assert.equal(overrideEntry?.licenseSource, "https://example.test/cc0-license");
  assert.ok(!("licenseProfile" in (overrideEntry ?? {})), "internal catalog license profile should not leak into provider results");
});
