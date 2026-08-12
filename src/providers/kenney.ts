import { createCc0CatalogProvider } from "./catalog.js";

export const kenneyProvider = createCc0CatalogProvider(
  "kenney",
  "Kenney",
  "https://kenney.nl/support",
  [
    { id: "rpg-base", name: "RPG Base", sourceUrl: "https://kenney.nl/assets/rpg-base", categories: ["2D"], tags: ["rpg", "tiles", "2d"] },
    { id: "platformer-characters", name: "Platformer Characters", sourceUrl: "https://kenney.nl/assets/platformer-characters", categories: ["2D"], tags: ["platformer", "characters", "2d"] },
    { id: "prototype-kit", name: "Prototype Kit", sourceUrl: "https://kenney.nl/assets/prototype-kit", categories: ["3D"], tags: ["prototype", "3d", "vehicle", "building", "character"] },
    { id: "tower-defense-top-down", name: "Tower Defense (Top-Down)", sourceUrl: "https://kenney.nl/assets/tower-defense-top-down", categories: ["2D"], tags: ["tower-defense", "top-down", "weapon", "2d"] },
    { id: "pixel-vehicle-pack", name: "Pixel Vehicle Pack", sourceUrl: "https://kenney.nl/assets/pixel-vehicle-pack", categories: ["2D"], tags: ["vehicle", "car", "pixel", "2d"] },
    { id: "car-kit", name: "Car Kit", sourceUrl: "https://kenney.nl/assets/car-kit", categories: ["3D", "Transport"], tags: ["vehicle", "car", "transport", "3d"] },
    { id: "pixel-platformer", name: "Pixel Platformer", sourceUrl: "https://kenney.nl/assets/pixel-platformer", categories: ["2D", "Pixel Platformer"], tags: ["platformer", "pixel", "tiles", "2d"] },
    { id: "blaster-kit", name: "Blaster Kit", sourceUrl: "https://kenney.nl/assets/blaster-kit", categories: ["3D"], tags: ["weapon", "blaster", "3d", "animation"] }
  ]
);
