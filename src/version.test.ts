import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { VERSION } from "./version.js";

test("runtime version matches package version", async () => {
  const packageJsonUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(await readFile(packageJsonUrl, "utf8")) as { version: string };
  assert.equal(VERSION, packageJson.version);
  assert.match(VERSION, /^\d+\.\d+\.\d+$/);
});
