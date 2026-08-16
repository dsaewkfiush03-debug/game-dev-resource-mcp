import type { AssetProviderId, ProviderAsset, VerificationStatus } from "./providers/types.js";

export type VerificationAssessment = "current" | "stale" | "needs-review" | "untracked";

export interface VerificationAuditItem {
  provider: AssetProviderId;
  id: string;
  name: string;
  assessment: VerificationAssessment;
  verificationStatus?: VerificationStatus;
  verifiedAt?: string;
  ageDays?: number;
  sourceUrl: string;
  license: string;
}

export function verificationAgeDays(verifiedAt: string | undefined, asOf: string): number | undefined {
  if (!verifiedAt) return undefined;
  const verified = Date.parse(verifiedAt);
  const reference = Date.parse(asOf);
  if (!Number.isFinite(verified) || !Number.isFinite(reference) || verified > reference) return undefined;
  return Math.floor((reference - verified) / 86_400_000);
}

export function assessVerification(asset: ProviderAsset, staleAfterDays = 365, asOf = asset.retrievedAt): VerificationAuditItem {
  const ageDays = verificationAgeDays(asset.verifiedAt, asOf);
  let assessment: VerificationAssessment;
  if (asset.verificationStatus === "needs-review") assessment = "needs-review";
  else if (!asset.verificationStatus || !asset.verifiedAt || ageDays === undefined) assessment = "untracked";
  else if (ageDays > staleAfterDays) assessment = "stale";
  else assessment = "current";

  return {
    provider: asset.provider,
    id: asset.id,
    name: asset.name,
    assessment,
    verificationStatus: asset.verificationStatus,
    verifiedAt: asset.verifiedAt,
    ageDays,
    sourceUrl: asset.sourceUrl,
    license: asset.license
  };
}

export function summarizeVerification(items: VerificationAuditItem[]): Record<VerificationAssessment, number> {
  const summary: Record<VerificationAssessment, number> = { current: 0, stale: 0, "needs-review": 0, untracked: 0 };
  for (const item of items) summary[item.assessment] += 1;
  return summary;
}
