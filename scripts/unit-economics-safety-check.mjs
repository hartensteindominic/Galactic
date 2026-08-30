import fs from 'node:fs';

const required = [
  ['lib/unit-economics.ts', 'containsIndustryDefaultAssumptions: false', 'unit economics must ship without industry-average assumptions'],
  ['lib/unit-economics.ts', 'retainedInterchangeModeledSeparately: true', 'retained interchange must be modeled separately'],
  ['lib/unit-economics.ts', 'monthlySponsorProviderCostPerActiveCustomerCents', 'sponsor/provider costs must be explicit inputs'],
  ['lib/unit-economics.ts', 'monthlyFraudLossPerActiveCustomerCents', 'fraud losses must be explicit inputs'],
  ['lib/unit-economics.ts', 'monthlySupportCostPerActiveCustomerCents', 'support costs must be explicit inputs'],
  ['lib/unit-economics.ts', 'monthlyComplianceOpsCostPerActiveCustomerCents', 'compliance operations costs must be explicit inputs'],
  ['lib/unit-economics.ts', 'acquisitionCostPerNewCustomerCents', 'customer acquisition cost must be explicit input'],
  ['lib/unit-economics.ts', 'onboardingIdentityCostPerNewCustomerCents', 'onboarding/identity cost must be explicit input'],
  ['lib/unit-economics.ts', 'scenarioOnly: true', 'unit economics outputs must stay scenario-only'],
  ['lib/unit-economics.ts', 'assumptionsValidated: false', 'scenario assumptions must remain unvalidated by default'],
  ['lib/unit-economics.ts', 'approvedForFundraising: false', 'unit economics must not self-approve fundraising use'],
  ['lib/unit-economics.ts', 'approvedForSponsorDiligence: false', 'unit economics must not self-approve sponsor diligence use'],
  ['lib/unit-economics.ts', 'approvedForCharterApplication: false', 'unit economics must not self-approve charter application use'],
  ['lib/unit-economics.ts', 'Every input is an explicit assumption, not a market fact.', 'unit economics disclosure must distinguish assumptions from market facts'],
  ['app/api/prototype/unit-economics/route.ts', 'requirePrototypeOperator(request)', 'unit economics route must require operator access'],
  ['app/api/prototype/unit-economics/route.ts', 'requireTrustedOrigin(request)', 'unit economics route must require trusted origin'],
  ['app/api/prototype/unit-economics/route.ts', 'requireJsonRequest(request)', 'unit economics route must require JSON'],
  ['app/api/prototype/unit-economics/route.ts', 'readJsonBodyLimited<UnitEconomicsRequest>(request, 16_384)', 'unit economics route must bound request body'],
  ['app/api/prototype/unit-economics/route.ts', 'resolveRequestBrand', 'unit economics route must remain tenant-bound'],
  ['app/api/prototype/unit-economics/route.ts', 'persisted: false', 'unit economics scenario must not be persisted by the endpoint'],
  ['scripts/unit-economics-runtime-check.mjs', 'Scenario-based fintech unit economics calculation, payback, invalid-input, overflow, and approval-boundary runtime checks passed.', 'unit economics must have executable runtime coverage'],
  ['package.json', 'scripts/unit-economics-runtime-check.mjs', 'unit economics runtime test must run in CI']
];

const forbidden = [
  ['lib/unit-economics.ts', 'containsIndustryDefaultAssumptions: true', 'unit economics must not claim baked-in market assumptions'],
  ['lib/unit-economics.ts', 'assumptionsValidated: true', 'unit economics must not self-validate assumptions'],
  ['lib/unit-economics.ts', 'approvedForFundraising: true', 'unit economics must not self-approve fundraising use'],
  ['lib/unit-economics.ts', 'approvedForSponsorDiligence: true', 'unit economics must not self-approve sponsor use'],
  ['lib/unit-economics.ts', 'approvedForCharterApplication: true', 'unit economics must not self-approve charter use'],
  ['app/api/prototype/unit-economics/route.ts', 'await request.json()', 'unit economics route must not bypass bounded JSON reader'],
  ['app/api/prototype/unit-economics/route.ts', 'persisted: true', 'unit economics route must not claim scenario persistence']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Unit economics assumption, operator/request boundary, non-persistence, and fundraising/sponsor/charter approval safety checks passed.');
