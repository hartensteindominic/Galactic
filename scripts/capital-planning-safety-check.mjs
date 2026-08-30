import fs from 'node:fs';

const required = [
  ['lib/capital-planning.ts', "targetSource: 'operator-entered-assumption'", 'capital target must be explicitly operator-entered'],
  ['lib/capital-planning.ts', 'regulatorySufficiencyVerified: false', 'planning target must not be labeled regulator sufficient'],
  ['lib/capital-planning.ts', 'containsDefaultCharterCapitalAmount: false', 'capital workbench must contain no default charter-capital amount'],
  ['lib/capital-planning.ts', 'regulatoryCapitalCalculationImplemented: false', 'capital workbench must not claim regulatory-capital calculation'],
  ['lib/capital-planning.ts', 'riskWeightedAssetsModeled: false', 'capital workbench must not claim RWA modeling'],
  ['lib/capital-planning.ts', 'leverageRatioModeled: false', 'capital workbench must not claim leverage-ratio modeling'],
  ['lib/capital-planning.ts', 'liquidityRequirementModeled: false', 'capital workbench must not claim liquidity-requirement modeling'],
  ['lib/capital-planning.ts', 'sourceOfFundsAuthenticityVerifiedBySoftware: false', 'capital workbench must not authenticate source-of-funds evidence'],
  ['lib/capital-planning.ts', 'capitalPlanReviewedByQualifiedAdvisers: false', 'capital workbench must not self-certify adviser review'],
  ['lib/capital-planning.ts', 'capitalPlanReviewedByRegulator: false', 'capital workbench must not self-certify regulator review'],
  ['lib/capital-planning.ts', 'charterCapitalRequirementDetermined: false', 'capital workbench must not determine charter capital requirement'],
  ['lib/capital-planning.ts', 'approvedForCharterApplication: false', 'capital workbench must not self-approve charter application use'],
  ['app/api/prototype/capital-planning/route.ts', 'requirePrototypeOperator(request)', 'capital planning route must require operator access'],
  ['app/api/prototype/capital-planning/route.ts', 'requireTrustedOrigin(request)', 'capital planning route must require trusted origin'],
  ['app/api/prototype/capital-planning/route.ts', 'requireJsonRequest(request)', 'capital planning route must require JSON'],
  ['app/api/prototype/capital-planning/route.ts', 'readJsonBodyLimited<CapitalPlanningRequest>(request, 16_384)', 'capital planning route must bound request body'],
  ['app/api/prototype/capital-planning/route.ts', 'resolveRequestBrand', 'capital planning route must remain tenant-bound'],
  ['app/api/prototype/capital-planning/route.ts', 'persisted: false', 'capital planning route must remain non-persistent'],
  ['app/prototype/strategy/capital-planning-panel.tsx', 'Planning target ≠ capital adequacy', 'Strategy Lab must visibly separate planning target from capital adequacy'],
  ['app/prototype/strategy/capital-planning-panel.tsx', 'Software does not authenticate this evidence.', 'Strategy Lab must disclose source-of-funds nonauthentication'],
  ['app/prototype/strategy/capital-planning-panel.tsx', 'Regulatory sufficiency: not verified', 'Strategy Lab must visibly keep regulatory sufficiency unverified'],
  ['app/prototype/strategy/capital-planning-panel.tsx', 'Not modeled or verified:', 'Strategy Lab must expose capital model limitations'],
  ['app/prototype/strategy/strategy-shell.tsx', '<CapitalPlanningPanel tenantKey={tenantKey} />', 'capital workbench must remain inside protected Strategy Lab workspace'],
  ['app/api/prototype/status/route.ts', 'capitalPlanning: capitalPlanningControlStatus()', 'general status API must expose safe capital-planning posture'],
  ['app/api/prototype/status/route.ts', 'capital-planning workbench contains no default charter-capital amount', 'status disclosure must limit capital-planning claims'],
  ['scripts/capital-planning-runtime-check.mjs', 'Assumption-driven capital planning, gap/runway arithmetic, invalid-input/overflow, and regulatory-capital boundary runtime checks passed.', 'capital planning must have executable runtime coverage'],
  ['package.json', 'scripts/capital-planning-runtime-check.mjs', 'capital planning runtime coverage must run in CI']
];

const forbidden = [
  ['lib/capital-planning.ts', 'regulatorySufficiencyVerified: true', 'capital workbench must never self-certify regulatory sufficiency'],
  ['lib/capital-planning.ts', 'containsDefaultCharterCapitalAmount: true', 'capital workbench must never claim a default charter-capital amount'],
  ['lib/capital-planning.ts', 'regulatoryCapitalCalculationImplemented: true', 'capital workbench must not self-implement regulatory capital without approved scope'],
  ['lib/capital-planning.ts', 'sourceOfFundsAuthenticityVerifiedBySoftware: true', 'capital workbench must not self-authenticate source of funds'],
  ['lib/capital-planning.ts', 'capitalPlanReviewedByRegulator: true', 'capital workbench must not claim regulator review'],
  ['lib/capital-planning.ts', 'charterCapitalRequirementDetermined: true', 'capital workbench must not claim charter capital requirement determined'],
  ['lib/capital-planning.ts', 'approvedForCharterApplication: true', 'capital workbench must not self-approve charter use'],
  ['app/api/prototype/capital-planning/route.ts', 'await request.json()', 'capital planning route must not bypass bounded body reader'],
  ['app/api/prototype/capital-planning/route.ts', 'persisted: true', 'capital planning route must not claim persistence'],
  ['app/prototype/strategy/capital-planning-panel.tsx', 'defaultValue=', 'capital workbench UI must not hide a default charter-capital assumption']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Capital planning no-default, protected-Strategy-Lab, status, operator/request, non-persistence, source-of-funds, and regulatory-adequacy safety checks passed.');
