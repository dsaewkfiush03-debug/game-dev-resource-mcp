import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { normalizedMaxBytes, planAssetInstall, safeProjectPath, validateDownloadUrl } from "./install.js";

const root = path.resolve("/tmp/game-dev-resource-mcp-test-project");

test("safeProjectPath keeps installs inside the project root", () => {
  const target = safeProjectPath(root, path.join("assets", "vendor", "pack", "file.png"));
  assert.ok(target.startsWith(root));
});

test("safeProjectPath rejects traversal outside project root", () => {
  assert.throws(() => safeProjectPath(root, path.join("..", "outside.txt")), /destination_escapes_project_root/);
});

test("safeProjectPath rejects an absolute destination", () => {
  assert.throws(() => safeProjectPath(root, path.resolve("/tmp/outside.txt")), /destination_must_be_relative/);
});

test("validateDownloadUrl accepts Poly Haven official download host", () => {
  const url = validateDownloadUrl("polyhaven", "https://dl.polyhaven.org/file/ph-assets/example.zip");
  assert.equal(url.hostname, "dl.polyhaven.org");
});

test("validateDownloadUrl rejects insecure or untrusted hosts", () => {
  assert.throws(() => validateDownloadUrl("polyhaven", "http://dl.polyhaven.org/file.zip"), /download_url_must_use_https/);
  assert.throws(() => validateDownloadUrl("polyhaven", "https://example.com/file.zip"), /untrusted_download_host/);
});

test("normalizedMaxBytes applies a default and absolute cap", () => {
  assert.equal(normalizedMaxBytes(), 128 * 1024 * 1024);
  assert.equal(normalizedMaxBytes(2 * 1024 * 1024 * 1024), 1024 * 1024 * 1024);
  assert.throws(() => normalizedMaxBytes(0), /maxBytes_must_be_positive/);
});

test("catalog-only providers return a manual install plan instead of guessing downloads", async () => {
  const plan = await planAssetInstall({ provider: "kenney", assetId: "pixel-vehicle-pack" });
  assert.equal(plan.autoInstallSupported, false);
  assert.equal(plan.reason, "provider_does_not_expose_verified_file_urls");
  assert.deepEqual(plan.candidates, []);
});
