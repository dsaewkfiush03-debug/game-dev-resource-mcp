import assert from "node:assert/strict";
import test from "node:test";
import { buildStackPlan } from "./recommend.js";

test("Chinese pixel road-survival description expands into art and gameplay-code slots", () => {
  const { inferred, slots } = buildStackPlan({
    description: "用 Godot 做一个 2D 像素公路求生游戏，玩家驾驶车辆、搜物资、和敌人战斗，有角色、枪械和背包。"
  });

  assert.equal(inferred.engine, "godot");
  assert.equal(inferred.dimension, "2D");
  assert.ok(inferred.styles.includes("pixel"));
  assert.ok(inferred.gameGenres.includes("survival"));
  assert.ok(inferred.themes.includes("road"));
  assert.ok(inferred.themes.includes("vehicle"));
  assert.ok(inferred.themes.includes("combat"));
  assert.ok(inferred.themes.includes("inventory"));

  const ids = slots.map(slot => slot.id);
  for (const required of ["starter", "environment", "vehicle", "vehicle-system", "character", "weapon", "combat-system", "inventory-system", "ui", "sfx", "font"]) {
    assert.ok(ids.includes(required as any), `missing slot ${required}`);
    assert.equal(slots.find(slot => slot.id === required)?.required, true);
  }

  const starter = slots.find(slot => slot.id === "starter");
  assert.equal(starter?.providers[0], "godotdemos", "verified whole-project demos should be preferred before live starter discovery");
  assert.ok(starter?.providers.includes("godotdemos"));
  assert.ok(starter?.providers.includes("godotassetlib"));
  assert.deepEqual(starter?.reuseScopes, ["whole-project", "code-only"]);
  assert.ok(starter?.queries.includes("godot 2d starter"));

  const environment = slots.find(slot => slot.id === "environment");
  assert.ok(environment?.providers.includes("openverse"));

  const sfx = slots.find(slot => slot.id === "sfx");
  assert.deepEqual(sfx?.providers, ["kenney", "openverse"]);

  const vehicle = slots.find(slot => slot.id === "vehicle");
  assert.deepEqual(vehicle?.dimensions, ["2D"]);
  assert.deepEqual(vehicle?.providers, ["kenney"]);
  assert.ok(vehicle?.queries.some(query => query.includes("pixel") && query.includes("vehicle")));

  for (const id of ["vehicle-system", "combat-system", "inventory-system"] as const) {
    const slot = slots.find(item => item.id === id);
    assert.ok(slot?.providers.includes("godotassetlib"));
    assert.ok(slot?.providers.includes("godotdemos"));
    assert.ok(slot?.providers.includes("githubcode"));
    assert.deepEqual(slot?.dimensions, ["code"]);
  }
});

test("3D planning includes KayKit and Tabler in appropriate slots", () => {
  const { slots } = buildStackPlan({ description: "Godot 3D low-poly survival RPG with characters and combat" });
  const environment = slots.find(slot => slot.id === "environment");
  const character = slots.find(slot => slot.id === "character");
  const ui = slots.find(slot => slot.id === "ui");
  const icons = slots.find(slot => slot.id === "icons");

  assert.ok(environment?.providers.includes("kaykit"));
  assert.ok(character?.providers.includes("kaykit"));
  assert.ok(ui?.providers.includes("tablericons"));
  assert.ok(icons?.providers.includes("tablericons"));
});

test("explicit networking save AI procedural and dialogue requirements create code slots", () => {
  const { inferred, slots } = buildStackPlan({
    description: "Godot 多人联网 PVP 生存游戏，需要存档、敌人 AI、程序化地图生成和对话系统"
  });
  for (const theme of ["networking", "save", "ai", "procedural", "dialogue"]) assert.ok(inferred.themes.includes(theme));
  for (const id of ["networking", "save-system", "ai-system", "procedural-generation", "dialogue-system"] as const) {
    const slot = slots.find(item => item.id === id);
    assert.equal(slot?.required, true);
    assert.ok(slot?.providers.includes("godotassetlib"));
    assert.ok(slot?.providers.includes("godotdemos"));
    assert.ok(slot?.providers.includes("githubcode"));
    assert.ok(slot?.queries.some(query => query.includes("godot")));
  }
});

test("CJK intent drives the font slot toward CJK search", () => {
  const { inferred, slots } = buildStackPlan({ description: "一个支持中文界面的科幻 RPG", dimension: "2D" });
  assert.ok(inferred.themes.includes("cjk"));
  const font = slots.find(slot => slot.id === "font");
  assert.ok(font?.queries.some(query => query.includes("cjk")));
  assert.deepEqual(font?.providers, ["googlefonts"]);
});

test("Phaser description selects the verified Phaser starter provider", () => {
  const { inferred, slots } = buildStackPlan({ description: "Build a browser game with Phaser and TypeScript", dimension: "2D" });
  assert.equal(inferred.engine, "phaser");
  const starter = slots.find(slot => slot.id === "starter");
  assert.deepEqual(starter?.providers, ["phaser"]);
  assert.deepEqual(starter?.reuseScopes, ["whole-project", "code-only"]);
  assert.ok(starter?.queries.some(query => query.includes("phaser")));
});

test("unsupported engine keeps a required starter gap instead of silently substituting another engine", () => {
  const { inferred, slots } = buildStackPlan({ description: "3D sci-fi survival game", engine: "unity" });
  assert.equal(inferred.engine, "unity");
  const starter = slots.find(slot => slot.id === "starter");
  assert.equal(starter?.required, true);
  assert.deepEqual(starter?.providers, []);
});

test("provider restrictions are honored during stack planning", () => {
  const { slots } = buildStackPlan({
    description: "Godot pixel RPG",
    providers: ["kenney", "googlefonts"]
  });

  const starter = slots.find(slot => slot.id === "starter");
  assert.deepEqual(starter?.providers, []);
  assert.deepEqual(slots.find(slot => slot.id === "font")?.providers, ["googlefonts"]);
  assert.deepEqual(slots.find(slot => slot.id === "ui")?.providers, ["kenney"]);
});