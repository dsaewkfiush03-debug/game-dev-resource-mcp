import { createCc0CatalogProvider } from "./catalog.js";

export const quaterniusProvider = createCc0CatalogProvider(
  "quaternius",
  "Quaternius",
  "https://quaternius.com/faq.html",
  [
    { id: "modular-medieval-buildings", name: "Modular Medieval Building Pack", sourceUrl: "https://quaternius.com/packs/modularmedievalbuildings.html", categories: ["3D", "Environment"], tags: ["medieval", "building", "modular", "3d"] },
    { id: "modular-platformer", name: "Modular Platformer Pack", sourceUrl: "https://quaternius.com/packs/modularplatformer.html", categories: ["3D", "Platformer"], tags: ["platformer", "modular", "environment", "3d"] },
    { id: "modular-scifi-megakit", name: "Modular Sci-Fi Megakit", sourceUrl: "https://quaternius.com/packs/modularscifimegakit.html", categories: ["3D", "Sci-Fi"], tags: ["sci-fi", "modular", "environment", "3d", "gltf"] },
    { id: "rpg-essentials", name: "RPG Essentials Pack", sourceUrl: "https://quaternius.com/packs/rpg.html", categories: ["3D", "RPG"], tags: ["rpg", "3d", "fbx", "obj", "blend"] }
  ]
);
