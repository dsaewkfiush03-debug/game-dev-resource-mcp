import { createVerifiedCatalogProvider } from "./catalog.js";

const LICENSE = {
  license: "OFL-1.1",
  licenseSource: "https://github.com/google/fonts/tree/main/ofl",
  commercialUse: true as const,
  modification: true as const,
  redistribution: true as const,
  attribution: true,
  shareAlike: false
};

export const googleFontsProvider = createVerifiedCatalogProvider(
  "googlefonts",
  "Google Fonts",
  LICENSE,
  [
    {
      id: "press-start-2p",
      name: "Press Start 2P",
      sourceUrl: "https://fonts.google.com/specimen/Press+Start+2P",
      description: "Pixel-display font suited to retro game UI, HUDs and menus.",
      categories: ["Font", "UI"],
      tags: ["pixel", "retro", "arcade", "ui", "font"],
      dimension: "font",
      style: ["pixel", "retro", "arcade"],
      formats: ["ttf"],
      assetTypes: ["font", "ui"],
      gameGenres: ["arcade", "retro", "platformer"]
    },
    {
      id: "pixelify-sans",
      name: "Pixelify Sans",
      sourceUrl: "https://fonts.google.com/specimen/Pixelify+Sans",
      description: "Variable pixel-style sans font useful for modern pixel-game interfaces.",
      categories: ["Font", "UI"],
      tags: ["pixel", "sans", "ui", "font", "variable"],
      dimension: "font",
      style: ["pixel", "modern"],
      formats: ["ttf"],
      assetTypes: ["font", "ui"],
      gameGenres: ["pixel", "indie", "rpg"]
    }
  ]
);
