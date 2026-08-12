import assert from "node:assert/strict";
import test from "node:test";
import { checkLicense } from "./licenses.js";

test("CC0 is classified as safe", () => {
  const rule = checkLicense("CC0");
  assert.equal(rule?.risk, "safe");
  assert.equal(rule?.commercialUse, true);
  assert.equal(rule?.attribution, false);
});

test("MIT requires retaining attribution/license notices", () => {
  const rule = checkLicense("MIT");
  assert.equal(rule?.risk, "safe");
  assert.equal(rule?.commercialUse, true);
  assert.equal(rule?.attribution, true);
});

test("non-commercial Creative Commons is rejected for commercial use", () => {
  const rule = checkLicense("CC BY-NC 4.0");
  assert.equal(rule?.risk, "reject");
  assert.equal(rule?.commercialUse, false);
});

test("unknown license returns undefined and must be reviewed manually", () => {
  assert.equal(checkLicense("CUSTOM-PROPRIETARY"), undefined);
});
