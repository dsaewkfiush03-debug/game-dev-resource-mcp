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

const ofl = (folder: string) => `https://github.com/google/fonts/blob/main/ofl/${folder}/OFL.txt`;

export const googleFontsProvider = createVerifiedCatalogProvider(
  "googlefonts",
  "Google Fonts",
  LICENSE,
  [
    {
      id: "press-start-2p", name: "Press Start 2P", sourceUrl: "https://fonts.google.com/specimen/Press+Start+2P", licenseSource: ofl("pressstart2p"),
      description: "Pixel-display font suited to retro game UI, HUDs and menus.", categories: ["Font", "UI"], tags: ["pixel", "retro", "arcade", "ui", "font"], dimension: "font", style: ["pixel", "retro", "arcade"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["arcade", "retro", "platformer"]
    },
    {
      id: "pixelify-sans", name: "Pixelify Sans", sourceUrl: "https://fonts.google.com/specimen/Pixelify+Sans", licenseSource: ofl("pixelifysans"),
      description: "Variable pixel-style sans font useful for modern pixel-game interfaces.", categories: ["Font", "UI"], tags: ["pixel", "sans", "ui", "font", "variable"], dimension: "font", style: ["pixel", "modern"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["pixel", "indie", "rpg"]
    },
    {
      id: "silkscreen", name: "Silkscreen", sourceUrl: "https://fonts.google.com/specimen/Silkscreen", licenseSource: ofl("silkscreen"),
      description: "Compact bitmap-inspired display family for pixel HUDs and retro menus.", categories: ["Font", "UI"], tags: ["pixel", "bitmap", "retro", "arcade", "font"], dimension: "font", style: ["pixel", "retro"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["arcade", "retro", "platformer"]
    },
    {
      id: "vt323", name: "VT323", sourceUrl: "https://fonts.google.com/specimen/VT323", licenseSource: ofl("vt323"),
      description: "Terminal-style monospaced display font for CRT, hacking and retro interfaces.", categories: ["Font", "UI"], tags: ["terminal", "crt", "retro", "monospace", "hacking", "font"], dimension: "font", style: ["retro", "terminal"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["retro", "sci-fi", "simulation"]
    },
    {
      id: "orbitron", name: "Orbitron", sourceUrl: "https://fonts.google.com/specimen/Orbitron", licenseSource: ofl("orbitron"),
      description: "Geometric futuristic display family for sci-fi HUDs, vehicles and space interfaces.", categories: ["Font", "UI"], tags: ["sci-fi", "futuristic", "space", "hud", "vehicle", "font"], dimension: "font", style: ["sci-fi", "futuristic"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["sci-fi", "space", "racing", "shooter"]
    },
    {
      id: "oxanium", name: "Oxanium", sourceUrl: "https://fonts.google.com/specimen/Oxanium", licenseSource: ofl("oxanium"),
      description: "Angular technology-oriented family suitable for sci-fi and competitive game UI.", categories: ["Font", "UI"], tags: ["sci-fi", "tech", "esports", "hud", "font"], dimension: "font", style: ["sci-fi", "modern"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["sci-fi", "shooter", "racing"]
    },
    {
      id: "rajdhani", name: "Rajdhani", sourceUrl: "https://fonts.google.com/specimen/Rajdhani", licenseSource: ofl("rajdhani"),
      description: "Squared condensed family that works well for industrial, futuristic and tactical interfaces.", categories: ["Font", "UI"], tags: ["industrial", "sci-fi", "condensed", "tactical", "font"], dimension: "font", style: ["sci-fi", "industrial"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["shooter", "sci-fi", "strategy"]
    },
    {
      id: "chakra-petch", name: "Chakra Petch", sourceUrl: "https://fonts.google.com/specimen/Chakra+Petch", licenseSource: ofl("chakrapetch"),
      description: "Technical squared family for cyber, sci-fi and machine-themed interfaces.", categories: ["Font", "UI"], tags: ["tech", "cyber", "sci-fi", "machine", "font"], dimension: "font", style: ["sci-fi", "technical"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["sci-fi", "shooter", "simulation"]
    },
    {
      id: "audiowide", name: "Audiowide", sourceUrl: "https://fonts.google.com/specimen/Audiowide", licenseSource: ofl("audiowide"),
      description: "Wide futuristic display face useful for racing titles, logos and sci-fi headings.", categories: ["Font", "Display"], tags: ["sci-fi", "racing", "vehicle", "futuristic", "display", "font"], dimension: "font", style: ["sci-fi", "futuristic"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["racing", "sci-fi", "arcade"]
    },
    {
      id: "black-ops-one", name: "Black Ops One", sourceUrl: "https://fonts.google.com/specimen/Black+Ops+One", licenseSource: ofl("blackopsone"),
      description: "Stencil-like military display face for tactical, war and shooter presentation.", categories: ["Font", "Display"], tags: ["military", "stencil", "tactical", "war", "shooter", "font"], dimension: "font", style: ["military", "stencil"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["shooter", "strategy", "action"]
    },
    {
      id: "creepster", name: "Creepster", sourceUrl: "https://fonts.google.com/specimen/Creepster", licenseSource: ofl("creepster"),
      description: "Horror display font suited to monster, zombie and Halloween-styled titles.", categories: ["Font", "Display"], tags: ["horror", "monster", "zombie", "scary", "font"], dimension: "font", style: ["horror"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["horror", "survival", "action"]
    },
    {
      id: "cinzel", name: "Cinzel", sourceUrl: "https://fonts.google.com/specimen/Cinzel", licenseSource: ofl("cinzel"),
      description: "Classical inscription-inspired family useful for fantasy, historical and prestige RPG interfaces.", categories: ["Font", "Display"], tags: ["fantasy", "historical", "classical", "rpg", "font"], dimension: "font", style: ["fantasy", "classical"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["rpg", "strategy", "adventure"]
    },
    {
      id: "noto-sans-sc", name: "Noto Sans SC", sourceUrl: "https://fonts.google.com/noto/specimen/Noto+Sans+SC", licenseSource: ofl("notosanssc"),
      description: "Simplified Chinese sans-serif family for game UI, subtitles, menus and localization.", categories: ["Font", "UI", "CJK"], tags: ["cjk", "chinese", "simplified chinese", "中文", "sans", "ui", "localization", "font"], dimension: "font", style: ["clean", "modern"], formats: ["ttf", "otf"], assetTypes: ["font", "ui"], gameGenres: ["general", "rpg", "strategy"]
    },
    {
      id: "noto-serif-sc", name: "Noto Serif SC", sourceUrl: "https://fonts.google.com/noto/specimen/Noto+Serif+SC", licenseSource: ofl("notoserifsc"),
      description: "Simplified Chinese serif family for narrative, historical, fantasy and localization-heavy games.", categories: ["Font", "CJK"], tags: ["cjk", "chinese", "simplified chinese", "中文", "serif", "narrative", "localization", "font"], dimension: "font", style: ["serif", "classical"], formats: ["ttf", "otf"], assetTypes: ["font", "ui"], gameGenres: ["rpg", "strategy", "adventure"]
    },
    {
      id: "dotgothic16", name: "DotGothic16", sourceUrl: "https://fonts.google.com/specimen/DotGothic16", licenseSource: ofl("dotgothic16"),
      description: "CJK-capable dot-style Japanese display font useful for retro East Asian UI and pixel presentation.", categories: ["Font", "CJK", "UI"], tags: ["cjk", "japanese", "pixel", "dot", "retro", "font"], dimension: "font", style: ["pixel", "retro"], formats: ["ttf"], assetTypes: ["font", "ui"], gameGenres: ["retro", "arcade", "rpg"]
    }
  ]
);
