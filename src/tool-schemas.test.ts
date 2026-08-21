import assert from "node:assert/strict";
import test from "node:test";
import * as z from "zod/v4";
import { toolInputSchemas } from "./tool-schemas.js";

function assertPropertyDescriptions(schema: any, path: string): void {
  if (!schema || typeof schema !== "object") return;

  if (schema.properties && typeof schema.properties === "object") {
    for (const [name, propertySchema] of Object.entries(schema.properties)) {
      const property = propertySchema as any;
      assert.equal(
        typeof property.description,
        "string",
        `${path}.${name} must expose a JSON Schema description`
      );
      assert.ok(property.description.trim().length >= 12, `${path}.${name} description is too short`);
      assertPropertyDescriptions(property, `${path}.${name}`);
    }
  }

  if (schema.items) assertPropertyDescriptions(schema.items, `${path}[]`);
}

test("all public MCP input fields expose meaningful JSON Schema descriptions", () => {
  assert.equal(Object.keys(toolInputSchemas).length, 17);

  for (const [toolName, inputSchema] of Object.entries(toolInputSchemas)) {
    const jsonSchema = z.toJSONSchema(inputSchema, { io: "input" }) as any;
    assert.equal(jsonSchema.type, "object", `${toolName} must expose an object input schema`);
    assertPropertyDescriptions(jsonSchema, toolName);
  }
});

test("tool schemas preserve safety-relevant defaults", () => {
  const assetSearch = z.toJSONSchema(toolInputSchemas.find_game_assets, { io: "input" }) as any;
  assert.equal(assetSearch.properties.commercialOnly.default, true);
  assert.equal(assetSearch.properties.allowAttribution.default, true);
  assert.equal(assetSearch.properties.allowShareAlike.default, false);

  const installer = z.toJSONSchema(toolInputSchemas.install_asset_file, { io: "input" }) as any;
  assert.equal(installer.properties.overwrite.default, false);

  const stack = z.toJSONSchema(toolInputSchemas.recommend_stack, { io: "input" }) as any;
  assert.equal(stack.properties.responseMode.default, "summary");
});
