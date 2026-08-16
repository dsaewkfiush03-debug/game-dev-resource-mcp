import { createVerifiedCatalogProvider } from "./catalog.js";

export const phaserProvider = createVerifiedCatalogProvider(
  "phaser",
  "Phaser Official Starters",
  {
    license: "MIT",
    licenseSource: "https://github.com/phaserjs/template-vite/blob/main/LICENSE",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: true,
    shareAlike: false
  },
  [
    { id: "create-game", name: "Phaser Create Game CLI", sourceUrl: "https://github.com/phaserjs/create-game", licenseSource: "https://github.com/phaserjs/create-game/blob/main/package.json", description: "Official Phaser project generator for creating new games from supported framework/bundler templates.", categories: ["Code", "Starter", "Tool"], tags: ["phaser", "web", "starter", "template", "generator", "cli", "create-game", "javascript", "typescript", "vite"], engine: ["phaser", "web"], dimension: "code", style: ["starter"], formats: ["javascript", "typescript"], assetTypes: ["starter", "tool", "code", "template-generator"], gameGenres: [] },
    { id: "template-vite", name: "Phaser Vite Template", sourceUrl: "https://github.com/phaserjs/template-vite", categories: ["Code", "Starter"], tags: ["phaser", "vite", "web", "starter", "javascript"], engine: ["phaser", "web"], dimension: "code", style: ["starter"], formats: ["javascript"], assetTypes: ["starter", "code"], gameGenres: [] },
    { id: "template-vite-ts", name: "Phaser Vite TypeScript Template", sourceUrl: "https://github.com/phaserjs/template-vite-ts", categories: ["Code", "Starter"], tags: ["phaser", "vite", "web", "starter", "typescript"], engine: ["phaser", "web"], dimension: "code", style: ["starter"], formats: ["typescript"], assetTypes: ["starter", "code"], gameGenres: [] },
    { id: "template-react-ts", name: "Phaser React TypeScript Template", sourceUrl: "https://github.com/phaserjs/template-react-ts", categories: ["Code", "Starter"], tags: ["phaser", "react", "vite", "typescript", "starter"], engine: ["phaser", "web", "react"], dimension: "code", style: ["starter"], formats: ["typescript", "react"], assetTypes: ["starter", "code", "ui"], gameGenres: [] },
    { id: "template-nextjs", name: "Phaser Next.js TypeScript Template", sourceUrl: "https://github.com/phaserjs/template-nextjs", categories: ["Code", "Starter"], tags: ["phaser", "nextjs", "typescript", "starter", "web"], engine: ["phaser", "web", "nextjs"], dimension: "code", style: ["starter"], formats: ["typescript", "nextjs"], assetTypes: ["starter", "code"], gameGenres: [] }
  ],
  { verificationStatus: "verified", verifiedAt: "2026-08-16T00:00:00.000Z" }
);
