import type { LicenseRule } from "./types.js";

export const LICENSE_RULES: LicenseRule[] = [
  { id: "CC0-1.0", aliases: ["CC0", "CC0 1.0"], risk: "safe", commercialUse: true, modification: true, redistribution: true, attribution: false, shareAlike: false, notes: "Public-domain dedication; preserve source metadata for traceability." },
  { id: "MIT", aliases: ["MIT License"], risk: "safe", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Retain copyright and license notice in substantial copies." },
  { id: "BSD-2-Clause", aliases: ["BSD 2-Clause"], risk: "safe", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Retain notices." },
  { id: "BSD-3-Clause", aliases: ["BSD 3-Clause"], risk: "safe", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Retain notices; non-endorsement clause applies." },
  { id: "Apache-2.0", aliases: ["Apache 2.0", "Apache License 2.0"], risk: "safe", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Retain license/NOTICE obligations and mark modified files where applicable." },
  { id: "CC-BY-4.0", aliases: ["CC BY 4.0", "Creative Commons Attribution 4.0"], risk: "attribution", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Attribution is required." },
  { id: "CC-BY-SA-4.0", aliases: ["CC BY-SA 4.0"], risk: "conditional", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: true, notes: "Share-alike obligations can affect derivative asset distribution; review before integration." },
  { id: "GPL-3.0", aliases: ["GPL-3.0-only", "GPLv3", "GNU GPL v3"], risk: "conditional", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: true, notes: "Copyleft obligations can affect distributed software; require project-level review." },
  { id: "LGPL-3.0", aliases: ["LGPL-3.0-only", "LGPLv3"], risk: "conditional", commercialUse: true, modification: true, redistribution: true, attribution: true, shareAlike: "depends", notes: "Linking and modification obligations require implementation-specific review." },
  { id: "CC-BY-NC-4.0", aliases: ["CC BY-NC 4.0", "NonCommercial"], risk: "reject", commercialUse: false, modification: true, redistribution: true, attribution: true, shareAlike: false, notes: "Non-commercial restriction is incompatible with commercial game use." },
  { id: "NO-LICENSE", aliases: ["none", "no license", "unlicensed"], risk: "reject", commercialUse: false, modification: false, redistribution: false, attribution: "depends", shareAlike: false, notes: "No permission should be assumed when copyright is present and no license is granted." }
];

export function checkLicense(input: string): LicenseRule | undefined {
  const normalized = input.trim().toLowerCase();
  return LICENSE_RULES.find(rule => rule.id.toLowerCase() === normalized || rule.aliases.some(alias => alias.toLowerCase() === normalized));
}
