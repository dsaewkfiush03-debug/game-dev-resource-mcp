import { godotDemosProvider } from "./godotdemos.js";
import { kenneyProvider } from "./kenney.js";
import { polyHavenProvider } from "./polyhaven.js";
import { quaterniusProvider } from "./quaternius.js";
import type { AssetProvider, AssetProviderId } from "./types.js";

const PROVIDERS: Record<AssetProviderId, AssetProvider> = {
  polyhaven: polyHavenProvider,
  kenney: kenneyProvider,
  quaternius: quaterniusProvider,
  godotdemos: godotDemosProvider
};

export function getProvider(id: AssetProviderId): AssetProvider {
  return PROVIDERS[id];
}

export function listProviders(): Array<{ id: AssetProviderId; name: string; mode: "live-api" | "verified-catalog" }> {
  return Object.values(PROVIDERS).map(provider => ({
    id: provider.id,
    name: provider.name,
    mode: provider.id === "polyhaven" ? "live-api" : "verified-catalog"
  }));
}

export type { AssetProviderId, ProviderAsset, ProviderSearchOptions } from "./types.js";
