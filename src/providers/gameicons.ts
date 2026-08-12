import { createVerifiedCatalogProvider } from "./catalog.js";

export const gameIconsProvider = createVerifiedCatalogProvider(
  "gameicons",
  "Game Icons",
  {
    license: "CC-BY-3.0",
    licenseSource: "https://github.com/game-icons/icons/blob/master/license.txt",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: true,
    shareAlike: false
  },
  [
    { id: "combat-icons", name: "Game Icons - Combat & Weapons", sourceUrl: "https://game-icons.net/tags/weapon.html", categories: ["2D", "Icons"], tags: ["weapon", "combat", "ui", "icon"], dimension: "2D", style: ["monochrome", "vector"], formats: ["svg", "png"], assetTypes: ["icon", "ui"], gameGenres: ["rpg", "action", "strategy"] },
    { id: "rpg-icons", name: "Game Icons - RPG", sourceUrl: "https://game-icons.net/tags/role-playing.html", categories: ["2D", "Icons"], tags: ["rpg", "skill", "item", "ui", "icon"], dimension: "2D", style: ["monochrome", "vector"], formats: ["svg", "png"], assetTypes: ["icon", "ui"], gameGenres: ["rpg"] },
    { id: "vehicle-icons", name: "Game Icons - Vehicles", sourceUrl: "https://game-icons.net/tags/vehicle.html", categories: ["2D", "Icons"], tags: ["vehicle", "car", "transport", "ui", "icon"], dimension: "2D", style: ["monochrome", "vector"], formats: ["svg", "png"], assetTypes: ["icon", "ui", "vehicle"], gameGenres: ["racing", "strategy", "simulation"] },
    { id: "resource-icons", name: "Game Icons - Resources & Inventory", sourceUrl: "https://game-icons.net/tags/mineral.html", categories: ["2D", "Icons"], tags: ["resource", "inventory", "item", "crafting", "icon"], dimension: "2D", style: ["monochrome", "vector"], formats: ["svg", "png"], assetTypes: ["icon", "ui", "item"], gameGenres: ["survival", "rpg", "strategy"] },
    { id: "status-icons", name: "Game Icons - Status & Effects", sourceUrl: "https://game-icons.net/tags/status.html", categories: ["2D", "Icons"], tags: ["status", "effect", "buff", "debuff", "icon"], dimension: "2D", style: ["monochrome", "vector"], formats: ["svg", "png"], assetTypes: ["icon", "ui"], gameGenres: ["rpg", "strategy"] }
  ]
);
