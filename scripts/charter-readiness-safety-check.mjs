import fs from 'node:fs';

const required = [
  ['lib/charter-readiness.ts', "longTermGoal: 'future-chartered-bank'", 'long-term charter goal must be explicit'],
  ['lib/charter-readiness.ts', "currentPhase: 'fintech-proof'", 'current charter-readiness phase must remain fintech proof'],
  ['lib/charter-readiness.ts', "currentOperatingPosture: 'simulation-only-fintech-prototype'", 'current operating posture must remain simulation-only'],
  ['lib/charter-readiness.ts', 'currentSoftwareCanSelfApproveCharter: false', 'software must not self-approve charter status'],
  ['lib/charter-readiness.ts', 'businessModelThesisDefined: false', 'business-model thesis must remain unclaimed until evidenced'],
  ['lib/charter-readiness.ts', 'targetCustomerSegmentValidated: false', 'target customer must remain unvalidated'],
  ['lib/charter-readiness.ts', 'distributionAdvantageValidated: false', 'distribution advantage must remain unvalidated'],
  ['lib/charter-readiness.ts', 'primaryNonInterchangeRevenueModelValidated: false', 'non-interchange revenue must remain unvalidated'],
  ['lib/charter-readiness.ts', 'driverBasedUnitEconomicsModelBuilt: false', 'unit-economics model must remain unclaimed until built'],
  ['lib/charter-readiness.ts', 'providerExitContinuityPlanApproved: false', 'provider exit plan must remain unapproved'],
  ['lib/charter-readiness.ts', 'charterApplicationFiled: false', 'charter filing must remain unclaimed'],
  ['lib/charter-readiness.ts', 'depositInsuranceApproved: false', 'deposit insurance approval must remain unclaimed'],
  ['lib/charter-readiness.ts', 'openingAuthorizationReceived: false', 'opening authority must remain unclaimed'],
  ['lib/charter-readiness.ts', 'bankCharterEffective: false', 'effective bank charter must remain unclaimed'],
  ['lib/charter-readiness.ts', 'fdicInsuranceEffective: false', 'effective FDIC insurance must remain unclaimed'],
  ['lib/charter-readiness.ts', 'customerFacingBankClaimAuthorized: false', 'customer-facing bank claim authority must remain false'],
  ['lib/charter-readiness.ts', 'No universal charter capital number is assumed', 'charter readiness must reject universal capital-number assumptions'],
  ['lib/prototype-readiness.ts', 'charterReadiness,', 'prototype readiness must expose charter control posture'],
  ['lib/prototype-readiness.ts', 'businessModelThesisValidatedForCharterPath: false', 'prototype readiness must keep business-model validation false'],
  ['lib/prototype-readiness.ts', 'readyToFileCharterApplication: false', 'prototype readiness must not claim filing readiness'],
  ['lib/prototype-readiness.ts', 'readyToOpenCharteredBank: false', 'prototype readiness must not claim opening readiness'],
  ['lib/prototype-trust.ts', "id: 'future-charter-roadmap'", 'Trust Center must expose future-charter control'],
  ['lib/prototype-trust.ts', "status: 'external-approval-required'", 'Trust Center charter goal must visibly require external approval'],
  ['lib/prototype-trust.ts', 'No charter route, business-model proof, regulator-ready bank plan, capital approval', 'Trust Center must limit charter-roadmap claims'],
  ['app/api/prototype/status/route.ts', 'charterReadiness: charterReadinessStatus()', 'general prototype status must expose charter control posture'],
  ['app/api/prototype/status/route.ts', 'future-chartered-bank field is a long-term strategic goal', 'status disclosure must state charter field is only a goal'],
  ['docs/FINTECH_TO_CHARTER_ROADMAP.md', 'never hard-code a universal dollar amount as “the capital required to get a bank charter.”', 'charter roadmap must prohibit universal capital claims'],
  ['docs/FINTECH_TO_CHARTER_ROADMAP.md', 'A generic “better neobank UX” is not treated as a sufficient charter thesis.', 'charter roadmap must require a differentiated business thesis'],
  ['docs/FINTECH_TO_CHARTER_ROADMAP.md', 'None of those states may be collapsed into “we are a bank.”', 'application milestones must not collapse into bank status'],
  ['docs/SPONSOR_BANK_READINESS_CHECKLIST.md', 'Sponsor-program readiness is therefore treated as a learning and operating-evidence stage', 'sponsor readiness must remain distinct from charter approval'],
  ['docs/SPONSOR_BANK_READINESS_CHECKLIST.md', 'Exercise migrations `001`–`005`', 'sponsor checklist must reference all five current migrations'],
  ['scripts/charter-readiness-runtime-check.mjs', 'Future bank charter readiness goal and external-approval truth boundaries passed runtime checks.', 'charter readiness must have executable runtime coverage'],
  ['package.json', 'scripts/charter-readiness-runtime-check.mjs', 'charter readiness runtime test must run in CI']
];

const forbidden = [
  ['lib/charter-readiness.ts', 'businessModelThesisDefined: true', 'repository must not self-certify the business model thesis'],
  ['lib/charter-readiness.ts', 'driverBasedUnitEconomicsModelBuilt: true', 'repository must not self-certify unit economics'],
  ['lib/charter-readiness.ts', 'providerExitContinuityPlanApproved: true', 'repository must not self-approve provider exit continuity'],
  ['lib/charter-readiness.ts', 'charterApplicationFiled: true', 'repository must not claim a charter application has been filed'],
  ['lib/charter-readiness.ts', 'depositInsuranceApproved: true', 'repository must not claim deposit insurance approval'],
  ['lib/charter-readiness.ts', 'openingAuthorizationReceived: true', 'repository must not claim opening authorization'],
  ['lib/charter-readiness.ts', 'bankCharterEffective: true', 'repository must not claim an effective bank charter'],
  ['lib/charter-readiness.ts', 'fdicInsuranceEffective: true', 'repository must not claim effective FDIC insurance'],
  ['lib/charter-readiness.ts', 'customerFacingBankClaimAuthorized: true', 'repository must not authorize customer-facing bank claims'],
  ['lib/prototype-readiness.ts', 'readyToFileCharterApplication: true', 'readiness must not self-certify charter filing readiness'],
  ['lib/prototype-readiness.ts', 'readyToOpenCharteredBank: true', 'readiness must not self-certify bank opening readiness'],
  ['lib/prototype-trust.ts', 'bankCharterEffective: true', 'Trust Center must not claim an effective charter'],
  ['app/api/prototype/status/route.ts', 'bankCharterEffective: true', 'status API must not claim an effective charter'],
  ['docs/FINTECH_TO_CHARTER_ROADMAP.md', '$50M–$200M', 'roadmap must not hard-code an unsupported universal charter-capital range'],
  ['docs/FINTECH_TO_CHARTER_ROADMAP.md', 'charter approved ✅', 'roadmap must not present approval as completed']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Future charter goal, business-model proof, cross-surface truth, sponsor-vs-charter separation, capital-claim, and regulatory-authority safety checks passed.');
