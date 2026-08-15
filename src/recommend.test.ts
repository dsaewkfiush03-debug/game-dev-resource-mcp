import assert from "node:assert/strict";
import test from "node:test";
import { buildStackPlan } from "./recommend.js";

test("Chinese pixel road-survival description expands into practical required slots", () => {
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

  const ids = slots.map(slot => slot.id);
  for (const required of ["starter", "environment", "vehicle", "character", "weapon", "ui", "sfx", "font"]) {
    assert.ok(ids.includes(required as any), `missing slot ${required}`);
    assert.equal(slots.find(slot => slot.id === required)?.required, true);
  }

  const starter = slots.find(slot => slot.id === "starter");
  assert.deepEqual(starter?.providers, ["godotassetlib", "godotdemos"]);
  assert.ok(starter?.queries.includes("godot 2d starter"));

  const environment = slots.find(slot => slot.id === "environment");
  assert.ok(environment?.providers.includes("openverse"));

  const sfx = slots.find(slot => slot.id === "sfx");
  assert.deepEqual(sfx?.providers, ["kenney", "openverse"]);

  const vehicle = slots.find(slot => slot.id === "vehicle");
  assert.deepEqual(vehicle?.dimensions, ["2D"]);
  assert.deepEqual(vehicle?.providers, ["kenney"]);
  assert.ok(vehicle?.queries.some(query => query.includes("pixel") && query.includes("vehicle")));
});

test("Phaser description selects the verified Phaser starter provider", () => {
  const { inferred, slots } = buildStackPlan({ description: "Build a browser game with Phaser and TypeScript", dimension: "2D" });
  assert.equal(inferred.engine, "phaser");
  const starter = slots.find(slot => slot.id === "starter");
  assert.deepEqual(starter?.providers, ["phaser"]);
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