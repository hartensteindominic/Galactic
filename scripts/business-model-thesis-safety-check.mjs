import fs from 'node:fs';

const required = [
  ['lib/business-model-thesis.ts', 'structurallyCompleteDraft: true', 'thesis evaluator may only claim structural completeness'],
  ['lib/business-model-thesis.ts', 'customerSegmentValidated: false', 'thesis evaluator must not validate customer segment'],
  ['lib/business-model-thesis.ts', 'painfulProblemValidated: false', 'thesis evaluator must not validate customer problem'],
  ['lib/business-model-thesis.ts', 'distributionAdvantageValidated: false', 'thesis evaluator must not validate distribution advantage'],
  ['lib/business-model-thesis.ts', 'revenueModelValidated: false', 'thesis evaluator must not validate revenue model'],
  ['lib/business-model-thesis.ts', 'marketValidated: false', 'thesis evaluator must not claim market validation'],
  ['lib/business-model-thesis.ts', 'approvedForPublicClaim: false', 'thesis draft must not self-approve public claims'],
  ['lib/business-model-thesis.ts', 'approvedForInvestorForecast: false', 'thesis draft must not self-approve investor forecast use'],
  ['lib/business-model-thesis.ts', 'approvedForSponsorDiligence: false', 'thesis draft must not self-approve sponsor diligence use'],
  ['lib/business-model-thesis.ts', 'approvedForCharterBusinessPlan: false', 'thesis draft must not self-approve charter-plan use'],
  ['lib/business-model-thesis.ts', 'shipsWithDefaultTargetCustomer: false', 'workbench must not invent target customer'],
  ['lib/business-model-thesis.ts', 'shipsWithDefaultRevenueModel: false', 'workbench must not invent revenue model'],
  ['app/api/prototype/business-thesis/route.ts', 'requirePrototypeOperator(request)', 'business thesis route must require operator access'],
  ['app/api/prototype/business-thesis/route.ts', 'requireTrustedOrigin(request)', 'business thesis route must enforce trusted origin'],
  ['app/api/prototype/business-thesis/route.ts', 'requireJsonRequest(request)', 'business thesis route must require JSON'],
  ['app/api/prototype/business-thesis/route.ts', 'readJsonBodyLimited<BusinessThesisRequest>(request, 16_384)', 'business thesis route must bound body size'],
  ['app/api/prototype/business-thesis/route.ts', 'resolveRequestBrand', 'business thesis route must remain tenant-bound'],
  ['app/api/prototype/business-thesis/route.ts', 'persisted: false', 'business thesis endpoint must remain non-persistent'],
  ['app/prototype/strategy/business-thesis-panel.tsx', 'No defaults · no validation claim', 'Strategy Lab must visibly state thesis workbench has no defaults/validation claim'],
  ['app/prototype/strategy/business-thesis-panel.tsx', 'The workbench starts blank', 'Strategy Lab thesis workbench must visibly start blank'],
  ['app/prototype/strategy/business-thesis-panel.tsx', 'Still unvalidated', 'Strategy Lab must show unvalidated status after structuring a draft'],
  ['app/prototype/strategy/business-thesis-panel.tsx', 'Not approved for public claims, investor forecasts, sponsor diligence, or a charter business plan.', 'Strategy Lab must limit thesis use'],
  ['app/prototype/strategy/strategy-shell.tsx', '<BusinessThesisPanel tenantKey={tenantKey} />', 'protected Strategy Lab must render thesis workbench inside operator gate'],
  ['app/api/prototype/status/route.ts', 'businessThesis: businessModelThesisControlStatus()', 'general status API must expose business-thesis control posture'],
  ['app/api/prototype/status/route.ts', 'business-thesis workbench can create only a structurally complete draft', 'status disclosure must limit thesis claims'],
  ['scripts/business-model-thesis-runtime-check.mjs', 'Business-model thesis structural-completeness, normalization, no-default, and validation-boundary runtime checks passed.', 'business thesis must have executable runtime coverage'],
  ['package.json', 'scripts/business-model-thesis-runtime-check.mjs', 'business thesis runtime coverage must run in CI']
];

const forbidden = [
  ['lib/business-model-thesis.ts', 'customerSegmentValidated: true', 'workbench must not self-validate customer segment'],
  ['lib/business-model-thesis.ts', 'painfulProblemValidated: true', 'workbench must not self-validate customer problem'],
  ['lib/business-model-thesis.ts', 'distributionAdvantageValidated: true', 'workbench must not self-validate distribution advantage'],
  ['lib/business-model-thesis.ts', 'revenueModelValidated: true', 'workbench must not self-validate revenue model'],
  ['lib/business-model-thesis.ts', 'marketValidated: true', 'workbench must not self-validate the market'],
  ['lib/business-model-thesis.ts', 'approvedForCharterBusinessPlan: true', 'workbench must not self-approve charter use'],
  ['app/api/prototype/business-thesis/route.ts', 'await request.json()', 'business thesis route must not bypass bounded body reader'],
  ['app/api/prototype/business-thesis/route.ts', 'persisted: true', 'business thesis route must not claim persistence'],
  ['app/prototype/strategy/business-thesis-panel.tsx', 'defaultValue=', 'Strategy thesis UI must not hide a default niche/revenue thesis']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Business-model thesis structural-only, no-default, protected-Strategy-Lab, status, operator/request, non-persistence, and validation-approval safety checks passed.');
