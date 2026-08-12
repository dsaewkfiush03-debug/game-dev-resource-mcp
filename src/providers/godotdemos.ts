import { createVerifiedCatalogProvider } from "./catalog.js";

export const godotDemosProvider = createVerifiedCatalogProvider(
  "godotdemos",
  "Godot Demo Projects",
  {
    license: "MIT",
    licenseSource: "https://github.com/godotengine/godot-demo-projects/blob/master/LICENSE.md",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: true,
    shareAlike: false
  },
  [
    { id: "godot-2d-demos", name: "Godot 2D Demo Collection", sourceUrl: "https://github.com/godotengine/godot-demo-projects/tree/master/2d", description: "Official Godot 2D demo projects and implementation examples.", categories: ["Code", "Starter", "2D"], tags: ["godot", "demo", "2d", "starter", "gameplay"], engine: ["godot"], dimension: "code", formats: ["gdscript", "tscn"], assetTypes: ["starter", "code", "example"], gameGenres: ["multiple"] },
    { id: "godot-3d-demos", name: "Godot 3D Demo Collection", sourceUrl: "https://github.com/godotengine/godot-demo-projects/tree/master/3d", description: "Official Godot 3D demo projects and implementation examples.", categories: ["Code", "Starter", "3D"], tags: ["godot", "demo", "3d", "starter", "gameplay"], engine: ["godot"], dimension: "code", formats: ["gdscript", "tscn"], assetTypes: ["starter", "code", "example"], gameGenres: ["multiple"] },
    { id: "godot-audio-demos", name: "Godot Audio Demo Collection", sourceUrl: "https://github.com/godotengine/godot-demo-projects/tree/master/audio", description: "Official Godot audio and sound-system demos.", categories: ["Code", "Audio"], tags: ["godot", "audio", "sound", "demo"], engine: ["godot"], dimension: "code", formats: ["gdscript", "tscn"], assetTypes: ["audio-system", "code", "example"] },
    { id: "godot-gui-demos", name: "Godot GUI Demo Collection", sourceUrl: "https://github.com/godotengine/godot-demo-projects/tree/master/gui", description: "Official Godot UI and Control-node demos.", categories: ["Code", "UI"], tags: ["godot", "gui", "ui", "control", "demo"], engine: ["godot"], dimension: "code", formats: ["gdscript", "tscn"], assetTypes: ["ui", "code", "example"] },
    { id: "godot-compute-demos", name: "Godot Compute Demo Collection", sourceUrl: "https://github.com/godotengine/godot-demo-projects/tree/master/compute", description: "Official Godot compute and GPU programming demos.", categories: ["Code", "Shader"], tags: ["godot", "compute", "gpu", "shader", "demo"], engine: ["godot"], dimension: "code", formats: ["gdscript", "glsl"], assetTypes: ["shader", "code", "example"] }
  ]
);
