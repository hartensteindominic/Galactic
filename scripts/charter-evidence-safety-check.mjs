import fs from 'node:fs';

const required = [
  ['lib/charter-evidence-index.ts', 'automaticRegulatoryStatusPromotionEnabled: false', 'charter evidence must not auto-promote regulatory status'],
  ['lib/charter-evidence-index.ts', 'softwareCanVerifyExternalAuthorityRecords: false', 'software must not claim it can verify authority records'],
  ['lib/charter-evidence-index.ts', 'softwareCanMarkBankCharterEffective: false', 'software must not mark charter effective'],
  ['lib/charter-evidence-index.ts', 'softwareCanMarkFdicInsuranceEffective: false', 'software must not mark FDIC insurance effective'],
  ['lib/charter-evidence-index.ts', 'softwareCanAuthorizeCustomerFacingBankClaims: false', 'software must not authorize bank claims'],
  ['lib/charter-evidence-index.ts', 'accountableHumanAssignmentComplete: false', 'human accountability assignment must remain incomplete'],
  ['lib/charter-evidence-index.ts', 'regulatorEvidenceVerificationWorkflowOperating: false', 'regulator evidence verification workflow must remain unverified'],
  ['lib/charter-evidence-index.ts', 'verifiedClaimCount: 0', 'current charter evidence claim count must remain zero'],
  ['lib/charter-evidence-index.ts', 'softwareVerifiedClaim: false', 'candidate evaluator must not turn evidence shape into software verification'],
  ['lib/charter-evidence-index.ts', "'QUALIFIED_HUMAN_REVIEW_REQUIRED'", 'evidence candidates must require qualified human review'],
  ['lib/charter-evidence-index.ts', "'AUTHORITY_RECORD_DATE_REQUIRED'", 'external authority evidence must require a dated record'],
  ['lib/charter-evidence-index.ts', 'Software does not verify authenticity, legal sufficiency, regulator acceptance, approval status, or authority to operate.', 'candidate evaluation must disclose software nonverification'],
  ['scripts/charter-evidence-runtime-check.mjs', 'Charter evidence index human-review, external-authority, and software-nonverification runtime checks passed.', 'charter evidence index must have executable runtime coverage'],
  ['package.json', 'scripts/charter-evidence-runtime-check.mjs', 'charter evidence runtime check must run in CI']
];

const forbidden = [
  ['lib/charter-evidence-index.ts', 'automaticRegulatoryStatusPromotionEnabled: true', 'charter evidence must not auto-promote regulatory status'],
  ['lib/charter-evidence-index.ts', 'softwareCanVerifyExternalAuthorityRecords: true', 'software must not self-verify authority records'],
  ['lib/charter-evidence-index.ts', 'softwareCanMarkBankCharterEffective: true', 'software must not self-mark charter effective'],
  ['lib/charter-evidence-index.ts', 'softwareCanMarkFdicInsuranceEffective: true', 'software must not self-mark FDIC insurance effective'],
  ['lib/charter-evidence-index.ts', 'softwareCanAuthorizeCustomerFacingBankClaims: true', 'software must not authorize customer-facing bank claims'],
  ['lib/charter-evidence-index.ts', 'currentVerified: true', 'machine-readable index must not seed verified regulatory claims'],
  ['lib/charter-evidence-index.ts', 'accountableHumanAssigned: true', 'machine-readable index must not invent human ownership'],
  ['lib/charter-evidence-index.ts', 'currentExternalAuthorityRecordVerified: true', 'machine-readable index must not invent regulator evidence verification'],
  ['lib/charter-evidence-index.ts', 'softwareVerifiedClaim: true', 'candidate evaluator must never claim software verification']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Charter evidence non-promotion, human-review, authority-record, and software-nonverification safety checks passed.');
