import { createVerifiedCatalogProvider } from "./catalog.js";

const VERIFIED_AT = "2026-08-20T00:00:00.000Z";

export const communityStartersProvider = createVerifiedCatalogProvider(
  "communitystarters",
  "Verified Community Game Starters",
  {
    license: "MIT",
    licenseSource: "https://github.com/Team-on/UnityGameTemplate/blob/master/LICENSE",
    commercialUse: true,
    modification: true,
    redistribution: true,
    attribution: true,
    shareAlike: false
  },
  [
    {
      id: "team-on-unity-game-template",
      name: "Team-on Unity Game Template",
      sourceUrl: "https://github.com/Team-on/UnityGameTemplate",
      licenseSource: "https://github.com/Team-on/UnityGameTemplate/blob/master/LICENSE",
      description: "Reusable Unity game template with menu/settings/UI and project scaffolding. Root project license is MIT; bundled assets, plugins and dependencies require independent review before shipping.",
      categories: ["Code", "Starter", "Template", "Unity"],
      tags: ["unity", "starter", "template", "game template", "ui", "menu", "settings", "localization", "csharp"],
      engine: ["unity"],
      dimension: "code",
      formats: ["csharp", "unity"],
      assetTypes: ["starter", "template", "code", "ui"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "The repository README describes included popular assets/plugins. Reuse the MIT-covered project code/structure, but independently review third-party packages and bundled media.",
      adoptionHints: [
        { action: "keep", targetType: "system", target: "MIT-covered Unity project structure and reusable menu/settings code", reason: "The root repository license is MIT." },
        { action: "review", targetType: "dependency", target: "bundled plugins, packages and imported assets", reason: "Third-party components may retain separate licenses.", required: true },
        { action: "replace", targetType: "asset-category", target: "bundled media that lacks independently verified reuse metadata", reason: "The root code license is not treated as blanket asset clearance.", required: true }
      ]
    },
    {
      id: "jcmg-unity-starter-template",
      name: "JCMG Unity Starter Template",
      sourceUrl: "https://github.com/jeffcampbellmakesgames/UnityStarterTemplate",
      licenseSource: "https://github.com/jeffcampbellmakesgames/UnityStarterTemplate/blob/develop/LICENSE",
      description: "Unity starter template with lightweight architecture, UI configuration and development packages. Root repository is MIT; listed third-party plugins/packages remain separate review targets.",
      categories: ["Code", "Starter", "Template", "Unity"],
      tags: ["unity", "starter", "template", "architecture", "ui", "build", "debug", "csharp"],
      engine: ["unity"],
      dimension: "code",
      formats: ["csharp", "unity"],
      assetTypes: ["starter", "template", "code", "ui"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "Upstream documents multiple third-party packages/plugins. Preserve the root MIT notice and review each dependency before redistribution.",
      adoptionHints: [
        { action: "keep", targetType: "system", target: "MIT-covered starter architecture and project scaffolding", reason: "The root repository license is MIT." },
        { action: "review", targetType: "dependency", target: "all listed third-party Unity packages/plugins", reason: "Dependency licenses are separate from the root MIT license.", required: true }
      ]
    },
    {
      id: "maikuraki-unity-starter",
      name: "MaiKuraki UnityStarter",
      sourceUrl: "https://github.com/MaiKuraki/UnityStarter",
      licenseSource: "https://github.com/MaiKuraki/UnityStarter/blob/main/LICENSE",
      description: "Production-oriented modular Unity starter/framework with gameplay architecture, ability/tag concepts, runtime infrastructure and build tooling. Root repository is MIT; third-party and optional integration modules require separate review.",
      categories: ["Code", "Starter", "Framework", "Unity"],
      tags: ["unity", "starter", "framework", "gameplay framework", "ability system", "ai", "build", "tooling", "csharp"],
      engine: ["unity"],
      dimension: "code",
      formats: ["csharp", "unity"],
      assetTypes: ["starter", "template", "code", "framework", "ai-system", "combat-system"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "The project contains ThirdParty and optional integration areas. Treat the root MIT license as code/framework evidence, not blanket clearance for every integrated component.",
      adoptionHints: [
        { action: "keep", targetType: "system", target: "MIT-covered gameplay framework and project-owned build/tooling layers", reason: "The root repository license is MIT." },
        { action: "review", targetType: "dependency", target: "ThirdParty and optional integration modules", reason: "Integrated dependencies may carry separate licenses.", required: true }
      ]
    },
    {
      id: "stpgabriel-ue5-template",
      name: "StpGabriel Unreal Engine 5 Template",
      sourceUrl: "https://github.com/StpGabriel/unreal-engine-5-template",
      licenseSource: "https://github.com/StpGabriel/unreal-engine-5-template/blob/master/LICENSE",
      description: "Minimal Unreal Engine 5 Git project template with source/content/config/plugin layout and contribution structure. Root repository is MIT; Unreal Engine/runtime licensing and future imported content remain separate concerns.",
      categories: ["Code", "Starter", "Template", "Unreal"],
      tags: ["unreal", "ue5", "unreal engine", "starter", "template", "c++", "git lfs", "project structure"],
      engine: ["unreal"],
      dimension: "code",
      formats: ["cpp", "unreal"],
      assetTypes: ["starter", "template", "code"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "The repository template is MIT, but Unreal Engine itself and any imported Content/Fab assets remain governed by their own terms.",
      adoptionHints: [
        { action: "keep", targetType: "system", target: "MIT-covered repository/project layout and source scaffolding", reason: "The starter template root license is MIT." },
        { action: "review", targetType: "asset-category", target: "Content directory assets and future Fab imports", reason: "Engine marketplace/imported content must be licensed independently.", required: true }
      ]
    },
    {
      id: "motionforge-ue5-game-starter",
      name: "Motion Forge UE5 Game Starter Template",
      sourceUrl: "https://github.com/motionforge/Unreal-Engine-5-Game-Starter-Template",
      licenseSource: "https://github.com/motionforge/Unreal-Engine-5-Game-Starter-Template/blob/main/LICENSE",
      description: "Blueprint-oriented Unreal Engine 5 starter with HUD, communication, damage and example project structure. Root repository is MIT; upstream also references Creative Commons/built-in assets, so bundled media is kept in manual review scope.",
      categories: ["Code", "Starter", "Template", "Unreal"],
      tags: ["unreal", "ue5", "unreal engine", "starter", "template", "blueprint", "hud", "damage", "ui"],
      engine: ["unreal"],
      dimension: "code",
      formats: ["blueprint", "unreal"],
      assetTypes: ["starter", "template", "code", "ui", "combat-system"],
      gameGenres: ["multiple"],
      reuseScope: "code-only",
      bundledAssetStatus: "needs-review",
      bundledAssetNotes: "The root repository is MIT, while the README describes Creative Commons and Unreal built-in assets. Review exact asset provenance before shipping bundled media.",
      adoptionHints: [
        { action: "keep", targetType: "system", target: "MIT-covered Blueprint/project scaffolding", reason: "The root repository license is MIT." },
        { action: "review", targetType: "asset-category", target: "Creative Commons and Unreal built-in example assets", reason: "Exact bundled-media licenses are not flattened into the root MIT license.", required: true }
      ]
    }
  ],
  { verificationStatus: "verified", verifiedAt: VERIFIED_AT }
);
