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

test("dual MIT or Apache licensing is recognized as permissive", () => {
  const rule = checkLicense("MIT OR Apache-2.0");
  assert.equal(rule?.risk, "safe");
  assert.equal(rule?.commercialUse, true);
  assert.equal(rule?.redistribution, true);
});

test("zlib license is recognized as commercially usable", () => {
  const rule = checkLicense("Zlib");
  assert.equal(rule?.risk, "safe");
  assert.equal(rule?.commercialUse, true);
  assert.equal(rule?.modification, true);
});

test("OpenGameArt attribution licenses permit commercial use with credit", () => {
  for (const id of ["OGA-BY-3.0", "OGA-BY-4.0", "CC-BY-3.0", "CC-BY-4.0"]) {
    const rule = checkLicense(id);
    assert.equal(rule?.commercialUse, true);
    assert.equal(rule?.attribution, true);
    assert.equal(rule?.risk, "attribution");
  }
});

test("share-alike and GPL families remain conditional", () => {
  for (const id of ["CC-BY-SA-3.0", "CC-BY-SA-4.0", "GPL-2.0", "GPL-3.0", "LGPL-2.1", "LGPL-3.0"]) {
    const rule = checkLicense(id);
    assert.equal(rule?.commercialUse, true);
    assert.equal(rule?.risk, "conditional");
  }
});

test("non-commercial Creative Commons is rejected for commercial use", () => {
  const rule = checkLicense("CC BY-NC 4.0");
  assert.equal(rule?.risk, "reject");
  assert.equal(rule?.commercialUse, false);
});

test("unknown license returns undefined and must be reviewed manually", () => {
  assert.equal(checkLicense("CUSTOM-PROPRIETARY"), undefined);
});