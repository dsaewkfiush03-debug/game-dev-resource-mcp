import { polyHavenProvider } from "./polyhaven.js";
import type { AssetProvider, AssetProviderId } from "./types.js";

const PROVIDERS: Record<AssetProviderId, AssetProvider> = {
  polyhaven: polyHavenProvider
};

export function getProvider(id: AssetProviderId): AssetProvider {
  return PROVIDERS[id];
}

export function listProviders(): Array<{ id: AssetProviderId; name: string }> {
  return Object.values(PROVIDERS).map(provider => ({ id: provider.id, name: provider.name }));
}

export type { AssetProviderId, ProviderAsset, ProviderSearchOptions } from "./types.js";
