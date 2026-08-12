import { checkLicense } from "./licenses.js";

export interface ProjectResourceAttribution {
  name: string;
  sourceUrl: string;
  license: string;
  licenseUrl?: string;
  author?: string;
  modified?: boolean;
}

export function generateProjectAttribution(resources: ProjectResourceAttribution[]): {
  thirdPartyAssets: string;
  credits: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  const detailed: string[] = ["# Third-Party Assets", ""];
  const credits: string[] = ["# Credits", ""];

  for (const resource of resources) {
    const rule = checkLicense(resource.license);
    if (!rule) warnings.push(`${resource.name}: unknown/custom license; manual review required.`);
    else if (rule.risk === "conditional" || rule.risk === "reject") warnings.push(`${resource.name}: ${rule.risk} license (${resource.license}); manual review required.`);

    detailed.push(`## ${resource.name}`);
    if (resource.author) detailed.push(`- Author: ${resource.author}`);
    detailed.push(`- Source: ${resource.sourceUrl}`);
    detailed.push(`- License: ${resource.license}${resource.licenseUrl ? ` (${resource.licenseUrl})` : ""}`);
    detailed.push(`- Modified: ${resource.modified ? "Yes" : "No"}`);
    if (rule?.notes) detailed.push(`- Notes: ${rule.notes}`);
    detailed.push("");

    if (rule?.attribution === true || resource.author) {
      credits.push(`- ${resource.name}${resource.author ? ` — ${resource.author}` : ""} — ${resource.license} — ${resource.sourceUrl}`);
    }
  }

  if (credits.length === 2) credits.push("No attribution-required resources were supplied.");
  return { thirdPartyAssets: detailed.join("\n"), credits: credits.join("\n"), warnings };
}
