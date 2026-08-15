import assert from "node:assert/strict";
import test from "node:test";
import { REGISTRY, searchRegistry } from "./registry.js";

test("expanded registry contains broad high-value sources", () => {
  assert.ok(REGISTRY.length >= 40, `expected at least 40 source records, got ${REGISTRY.length}`);
  for (const id of [
    "ambientcg", "godot-asset-library", "openverse", "freesound", "itchio-assets", "sketchfab",
    "unity-asset-store", "fab", "tabler-icons", "noto-fonts", "bevy-engine", "godot-engine",
    "phaser-engine", "babylonjs", "threejs", "pixijs", "matter-js", "libgdx", "raylib",
    "godot-shaders", "unity-official-samples", "unreal-samples"
  ]) {
    assert.ok(REGISTRY.some(item => item.id === id), `missing ${id}`);
  }
});

test("uniform CC0 source is classified explicitly", () => {
  const ambient = REGISTRY.find(item => item.id === "ambientcg");
  assert.ok(ambient);
  assert.equal(ambient.license, "CC0-1.0");
  assert.equal(ambient.commercialUse, true);
  assert.equal(ambient.attribution, false);
});

test("multi-license marketplaces fail closed", () => {
  for (const id of ["itchio-assets", "sketchfab", "godot-asset-library", "openverse", "freesound"]) {
    const item = REGISTRY.find(record => record.id === id);
    assert.ok(item, `missing ${id}`);
    assert.equal(item.license, "MULTIPLE");
    assert.equal(item.commercialUse, "unknown");
  }
});

test("custom-license marketplaces do not get blanket commercial approval", () => {
  for (const id of ["unity-asset-store", "fab", "pixabay-audio", "mixkit", "sonniss-gdc-audio"]) {
    const item = REGISTRY.find(record => record.id === id);
    assert.ok(item, `missing ${id}`);
    assert.equal(item.license, "CUSTOM");
    assert.equal(item.commercialUse, "unknown");
  }
});

test("verified permissive engine/framework sources retain explicit licenses", () => {
  const expected: Record<string, string> = {
    "godot-engine": "MIT",
    "phaser-engine": "MIT",
    "babylonjs": "Apache-2.0",
    "threejs": "MIT",
    "pixijs": "MIT",
    "matter-js": "MIT",
    "libgdx": "Apache-2.0"
  };
  for (const [id, license] of Object.entries(expected)) {
    const item = REGISTRY.find(record => record.id === id);
    assert.ok(item, `missing ${id}`);
    assert.equal(item.license, license);
    assert.equal(item.commercialUse, true);
  }
});

test("registry search surfaces specialized discovery sources", () => {
  assert.ok(searchRegistry("shader").some(item => item.id === "github-game-shaders"));
  assert.ok(searchRegistry("cjk").some(item => item.id === "noto-fonts"));
  assert.ok(searchRegistry("audio").some(item => item.id === "freesound"));
  assert.ok(searchRegistry("unity").some(item => item.id === "unity-asset-store"));
  assert.ok(searchRegistry("physics").some(item => item.id === "matter-js"));
});

test("Chinese game-development queries expand to English discovery tags", () => {
  assert.ok(searchRegistry("音效").some(item => item.id === "freesound"));
  assert.ok(searchRegistry("中文字体").some(item => item.id === "noto-fonts"));
  assert.ok(searchRegistry("着色器").some(item => item.id === "godot-shaders"));
  assert.ok(searchRegistry("背包").some(item => item.id === "github-game-systems"));
  assert.ok(searchRegistry("联网").some(item => item.id === "github-game-systems"));
  assert.ok(searchRegistry("车辆").some(item => item.id === "itchio-assets") || searchRegistry("车辆").some(item => item.id === "sketchfab"));
});
