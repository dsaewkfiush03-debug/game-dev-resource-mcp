import assert from "node:assert/strict";
import test from "node:test";
import type { ProviderAsset } from "./providers/types.js";
import { assessVerification, summarizeVerification, verificationAgeDays } from "./verification.js";

const asset = (overrides: Partial<ProviderAsset> = {}): ProviderAsset => ({
  id: "fixture",
  name: "Fixture",
  provider: "kenney",
  sourceUrl: "https://example.com/fixture",
  categories: ["2D"],
  tags: ["fixture"],
  license: "CC0-1.0",
  licenseSource: "https://example.com/license",
  commercialUse: true,
  modification: true,
  redistribution: true,
  attribution: false,
  shareAlike: false,
  retrievedAt: "2026-08-16T00:00:00.000Z",
  ...overrides
});

test("verification age is deterministic against the retrieval/reference time", () => {
  assert.equal(verificationAgeDays("2026-08-15", "2026-08-16T00:00:00Z"), 1);
  assert.equal(verificationAgeDays(undefined, "2026-08-16T00:00:00Z"), undefined);
});

test("recent verified resources are current", () => {
  const result = assessVerification(asset({ verificationStatus: "verified", verifiedAt: "2026-08-01" }), 365);
  assert.equal(result.assessment, "current");
});

test("old verification becomes stale without changing license rights", () => {
  const result = assessVerification(asset({ verificationStatus: "verified", verifiedAt: "2024-01-01" }), 365);
  assert.equal(result.assessment, "stale");
  assert.equal(result.license, "CC0-1.0");
});

test("needs-review overrides date freshness", () => {
  const result = assessVerification(asset({ verificationStatus: "needs-review", verifiedAt: "2026-08-16" }), 365);
  assert.equal(result.assessment, "needs-review");
});

test("missing verification metadata is untracked", () => {
  assert.equal(assessVerification(asset(), 365).assessment, "untracked");
});

test("verification summaries keep all assessment buckets", () => {
  const items = [
    assessVerification(asset({ id: "a", verificationStatus: "verified", verifiedAt: "2026-08-16" })),
    assessVerification(asset({ id: "b", verificationStatus: "verified", verifiedAt: "2020-01-01" })),
    assessVerification(asset({ id: "c", verificationStatus: "needs-review", verifiedAt: "2026-08-16" })),
    assessVerification(asset({ id: "d" }))
  ];
  assert.deepEqual(summarizeVerification(items), { current: 1, stale: 1, "needs-review": 1, untracked: 1 });
});