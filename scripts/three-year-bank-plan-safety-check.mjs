import fs from 'node:fs';

const required = [
  ['lib/three-year-bank-plan.ts', 'minimumPlanningHorizonYears: 3', 'planning skeleton must require at least three years'],
  ['lib/three-year-bank-plan.ts', 'mustExtendThroughExpectedStableProfitabilityIfLonger: true', 'planning skeleton must extend through expected stable profitability if longer'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultRevenueAssumptions: false', 'bank plan must not contain default revenue assumptions'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultDepositAssumptions: false', 'bank plan must not contain default deposit assumptions'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultCapitalRequirement: false', 'bank plan must not invent a universal capital requirement'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultProfitabilityDate: false', 'bank plan must not invent a profitability date'],
  ['lib/three-year-bank-plan.ts', 'financialProjectionAssumptionsValidated: false', 'structural draft must not validate projections'],
  ['lib/three-year-bank-plan.ts', 'capitalAdequacyDetermined: false', 'structural draft must not determine capital adequacy'],
  ['lib/three-year-bank-plan.ts', 'liquidityAdequacyDetermined: false', 'structural draft must not determine liquidity adequacy'],
  ['lib/three-year-bank-plan.ts', 'boardApproved: false', 'structural draft must not claim board approval'],
  ['lib/three-year-bank-plan.ts', 'regulatorReviewed: false', 'structural draft must not claim regulator review'],
  ['lib/three-year-bank-plan.ts', 'regulatorAccepted: false', 'structural draft must not claim regulator acceptance'],
  ['lib/three-year-bank-plan.ts', 'approvedForCharterApplication: false', 'structural draft must not claim charter application approval'],
  ['lib/three-year-bank-plan.ts', "authority: 'OCC'", 'current OCC source must be registered'],
  ['lib/three-year-bank-plan.ts', "authority: 'FDIC'", 'current FDIC source must be registered'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'requirePrototypeOperator(request)', 'three-year bank plan endpoint must require operator access'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'requireTrustedOrigin(request)', 'three-year bank plan endpoint must enforce trusted origin'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'requireJsonRequest(request)', 'three-year bank plan endpoint must require JSON'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'readJsonBodyLimited<ThreeYearBankPlanRequest>(request, 65_536)', 'three-year bank plan endpoint must bound request bodies'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'persisted: false', 'three-year bank plan endpoint must remain non-persistent'],
  ['docs/REGULATOR_READY_THREE_YEAR_BANK_PLAN.md', 'No invented numbers rule', 'bank plan documentation must prohibit invented assumptions'],
  ['docs/REGULATOR_READY_THREE_YEAR_BANK_PLAN.md', 'AI may draft, structure, compare, calculate, detect inconsistency, and summarize evidence', 'bank plan documentation must bound AI authority'],
  ['scripts/three-year-bank-plan-runtime-check.mjs', 'Three-year bank plan no-default, horizon, evidence, structural-only, and non-approval runtime checks passed.', 'three-year plan must have executable runtime coverage']
];

const forbidden = [
  ['lib/three-year-bank-plan.ts', 'containsDefaultRevenueAssumptions: true', 'bank plan must not seed revenue assumptions'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultDepositAssumptions: true', 'bank plan must not seed deposit assumptions'],
  ['lib/three-year-bank-plan.ts', 'containsDefaultCapitalRequirement: true', 'bank plan must not invent universal capital'],
  ['lib/three-year-bank-plan.ts', 'financialProjectionAssumptionsValidated: true', 'bank plan must not self-validate projections'],
  ['lib/three-year-bank-plan.ts', 'capitalAdequacyDetermined: true', 'bank plan must not determine capital adequacy'],
  ['lib/three-year-bank-plan.ts', 'liquidityAdequacyDetermined: true', 'bank plan must not determine liquidity adequacy'],
  ['lib/three-year-bank-plan.ts', 'boardApproved: true', 'bank plan must not self-approve at board level'],
  ['lib/three-year-bank-plan.ts', 'regulatorAccepted: true', 'bank plan must not claim regulator acceptance'],
  ['lib/three-year-bank-plan.ts', 'approvedForCharterApplication: true', 'bank plan must not self-approve charter application use'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'await request.json()', 'three-year bank plan endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/three-year-bank-plan/route.ts', 'persisted: true', 'three-year bank plan endpoint must not claim persistence']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Three-year bank plan horizon, no-default, official-source, operator/request, documentation, non-persistence, and non-approval safety checks passed.');
