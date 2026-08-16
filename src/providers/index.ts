import { ambientCgProvider } from "./ambientcg.js";
import { gameIconsProvider } from "./gameicons.js";
import { githubCodeProvider } from "./githubcode.js";
import { godotAssetLibraryProvider } from "./godotassetlib.js";
import { godotDemosProvider } from "./godotdemos.js";
import { googleFontsProvider } from "./googlefonts.js";
import { kenneyProvider } from "./kenney.js";
import { openverseProvider } from "./openverse.js";
import { phaserProvider } from "./phaser.js";
import { polyHavenProvider } from "./polyhaven.js";
import { quaterniusProvider } from "./quaternius.js";
import { tablerIconsProvider } from "./tablericons.js";
import type { AssetProvider, AssetProviderId } from "./types.js";

const PROVIDERS: Record<AssetProviderId, AssetProvider> = {
  polyhaven: polyHavenProvider,
  ambientcg: ambientCgProvider,
  githubcode: githubCodeProvider,
  kenney: kenneyProvider,
  quaternius: quaterniusProvider,
  godotdemos: godotDemosProvider,
  gameicons: gameIconsProvider,
  tablericons: tablerIconsProvider,
  phaser: phaserProvider,
  googlefonts: googleFontsProvider,
  openverse: openverseProvider,
  godotassetlib: godotAssetLibraryProvider
};

export function getProvider(id: AssetProviderId): AssetProvider {
  return PROVIDERS[id];
}

export function listProviders(): Array<{ id: AssetProviderId; name: string; mode: "live-api" | "verified-catalog" }> {
  return Object.values(PROVIDERS).map(provider => ({
    id: provider.id,
    name: provider.name,
    mode: ["polyhaven", "ambientcg", "openverse", "godotassetlib", "githubcode", "gameicons", "tablericons"].includes(provider.id) ? "live-api" : "verified-catalog"
  }));
}

export type { AssetProviderId, ProviderAsset, ProviderSearchOptions } from "./types.js";