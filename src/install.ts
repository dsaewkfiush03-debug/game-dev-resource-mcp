import { createHash } from "node:crypto";
import { mkdir, open, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { getProvider, type AssetProviderId } from "./providers/index.js";
import type { ProviderFile } from "./providers/types.js";

const DEFAULT_MAX_BYTES = 128 * 1024 * 1024;
const ABSOLUTE_MAX_BYTES = 1024 * 1024 * 1024;
const DOWNLOAD_USER_AGENT = "game-dev-resource-mcp/0.9.0 (+https://github.com/dsaewkfiush03-debug/game-dev-resource-mcp)";

const TRUSTED_DOWNLOAD_HOSTS: Partial<Record<AssetProviderId, string[]>> = {
  polyhaven: ["dl.polyhaven.org"]
};

export interface InstallPlanOptions {
  provider: AssetProviderId;
  assetId: string;
  format?: string;
  resolution?: string;
  maxBytes?: number;
}

export interface AssetInstallRequest extends InstallPlanOptions {
  filePath: string;
  projectRoot: string;
  destinationDir?: string;
  overwrite?: boolean;
}

export interface InstallCandidate extends ProviderFile {
  autoInstallAllowed: boolean;
  blockedReason?: string;
}

export function safeProjectPath(projectRoot: string, relativePath: string): string {
  if (!path.isAbsolute(projectRoot)) throw new Error("projectRoot_must_be_absolute");
  if (path.isAbsolute(relativePath)) throw new Error("destination_must_be_relative");

  const root = path.resolve(projectRoot);
  const target = path.resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) throw new Error("destination_escapes_project_root");
  return target;
}

export function validateDownloadUrl(provider: AssetProviderId, rawUrl: string): URL {
  const url = new URL(rawUrl);
  if (url.protocol !== "https:") throw new Error("download_url_must_use_https");

  const allowedHosts = TRUSTED_DOWNLOAD_HOSTS[provider] ?? [];
  if (!allowedHosts.includes(url.hostname.toLowerCase())) throw new Error(`untrusted_download_host:${url.hostname}`);
  return url;
}

export function normalizedMaxBytes(value?: number): number {
  if (value === undefined) return DEFAULT_MAX_BYTES;
  if (!Number.isFinite(value) || value <= 0) throw new Error("maxBytes_must_be_positive");
  return Math.min(Math.floor(value), ABSOLUTE_MAX_BYTES);
}

function candidateAllowed(provider: AssetProviderId, file: ProviderFile, maxBytes: number): InstallCandidate {
  try {
    validateDownloadUrl(provider, file.url);
  } catch (error) {
    return { ...file, autoInstallAllowed: false, blockedReason: error instanceof Error ? error.message : String(error) };
  }

  if (file.size !== undefined && file.size > maxBytes) {
    return { ...file, autoInstallAllowed: false, blockedReason: `file_exceeds_max_bytes:${file.size}` };
  }

  return { ...file, autoInstallAllowed: true };
}

export async function planAssetInstall(options: InstallPlanOptions): Promise<{
  provider: AssetProviderId;
  assetId: string;
  autoInstallSupported: boolean;
  maxBytes: number;
  candidates: InstallCandidate[];
  reason?: string;
}> {
  const provider = getProvider(options.provider);
  const maxBytes = normalizedMaxBytes(options.maxBytes);
  if (!provider.getFiles) {
    return {
      provider: options.provider,
      assetId: options.assetId,
      autoInstallSupported: false,
      maxBytes,
      candidates: [],
      reason: "provider_does_not_expose_verified_file_urls"
    };
  }

  let files = await provider.getFiles(options.assetId);
  if (options.format) files = files.filter(file => file.format?.toLowerCase() === options.format?.toLowerCase());
  if (options.resolution) files = files.filter(file => file.resolution?.toLowerCase() === options.resolution?.toLowerCase());

  const candidates = files.map(file => candidateAllowed(options.provider, file, maxBytes));
  return {
    provider: options.provider,
    assetId: options.assetId,
    autoInstallSupported: candidates.some(candidate => candidate.autoInstallAllowed),
    maxBytes,
    candidates
  };
}

function filenameFromUrl(url: URL): string {
  const decoded = decodeURIComponent(path.posix.basename(url.pathname));
  const filename = decoded.replace(/[\\/:*?"<>|\u0000-\u001F]/g, "_").trim();
  if (!filename || filename === "." || filename === "..") throw new Error("invalid_download_filename");
  return filename;
}

async function fileExists(target: string): Promise<boolean> {
  try { await stat(target); return true; } catch { return false; }
}

export async function installAssetFile(request: AssetInstallRequest): Promise<{
  provider: AssetProviderId;
  assetId: string;
  providerFilePath: string;
  installedPath: string;
  bytes: number;
  md5: string;
  hashVerified: boolean;
  sourceUrl: string;
  executed: false;
  serviceCredit?: string;
}> {
  const plan = await planAssetInstall(request);
  if (!plan.autoInstallSupported) throw new Error(plan.reason ?? "no_auto_install_candidate");

  const candidate = plan.candidates.find(file => file.path === request.filePath);
  if (!candidate) throw new Error("provider_file_path_not_found");
  if (!candidate.autoInstallAllowed) throw new Error(candidate.blockedReason ?? "candidate_not_auto_installable");

  const sourceUrl = validateDownloadUrl(request.provider, candidate.url);
  const destinationDir = request.destinationDir ?? path.posix.join("assets", "vendor", request.provider, request.assetId);
  const filename = filenameFromUrl(sourceUrl);
  const target = safeProjectPath(request.projectRoot, path.join(destinationDir, filename));
  const targetDir = path.dirname(target);
  await mkdir(targetDir, { recursive: true });

  if (!request.overwrite && await fileExists(target)) throw new Error("destination_file_exists");

  const temp = `${target}.download-${process.pid}-${Date.now()}`;
  const handle = await open(temp, "wx");
  const hash = createHash("md5");
  let bytes = 0;

  try {
    const response = await fetch(sourceUrl, { headers: { "User-Agent": DOWNLOAD_USER_AGENT } });
    if (!response.ok || !response.body) throw new Error(`download_failed:${response.status}`);

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > plan.maxBytes) throw new Error(`download_exceeds_max_bytes:${contentLength}`);
    if (candidate.size !== undefined && contentLength > 0 && contentLength !== candidate.size) throw new Error("content_length_mismatch");

    for await (const chunk of response.body as AsyncIterable<Uint8Array>) {
      bytes += chunk.byteLength;
      if (bytes > plan.maxBytes) throw new Error(`download_exceeds_max_bytes:${bytes}`);
      hash.update(chunk);
      await handle.write(chunk);
    }
  } catch (error) {
    await handle.close();
    await rm(temp, { force: true });
    throw error;
  }

  await handle.close();
  const md5 = hash.digest("hex");
  if (candidate.size !== undefined && bytes !== candidate.size) {
    await rm(temp, { force: true });
    throw new Error(`download_size_mismatch:${bytes}:${candidate.size}`);
  }
  if (candidate.md5 && md5.toLowerCase() !== candidate.md5.toLowerCase()) {
    await rm(temp, { force: true });
    throw new Error(`download_hash_mismatch:${md5}:${candidate.md5}`);
  }

  if (request.overwrite) await rm(target, { force: true });
  await rename(temp, target);

  return {
    provider: request.provider,
    assetId: request.assetId,
    providerFilePath: request.filePath,
    installedPath: path.relative(request.projectRoot, target),
    bytes,
    md5,
    hashVerified: Boolean(candidate.md5),
    sourceUrl: candidate.url,
    executed: false,
    serviceCredit: request.provider === "polyhaven" ? "Downloaded through the Poly Haven live API; the integration must clearly credit Poly Haven as the source." : undefined
  };
}
