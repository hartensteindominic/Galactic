import fs from 'node:fs';

const required = [
  ['lib/compliance-obligation-register.ts', "applicabilityStatus: 'unassessed'", 'compliance obligations must default to unassessed'],
  ['lib/compliance-obligation-register.ts', 'humanApplicabilityDecisionRequired: true', 'applicability must require a human decision'],
  ['lib/compliance-obligation-register.ts', 'qualifiedLegalComplianceReviewRequired: true', 'applicability must require qualified review'],
  ['lib/compliance-obligation-register.ts', 'accountableHumanRoleAssigned: false', 'register must not invent an accountable owner'],
  ['lib/compliance-obligation-register.ts', 'galacticObligationDetermined: false', 'register must not self-determine Galactic legal obligations'],
  ['lib/compliance-obligation-register.ts', 'softwareVerifiedLegalApplicability: false', 'candidate evaluator must not verify legal applicability'],
  ['lib/compliance-obligation-register.ts', 'softwareVerifiedRegulatoryInterpretation: false', 'candidate evaluator must not claim authoritative regulatory interpretation'],
  ['lib/compliance-obligation-register.ts', 'readinessPromotionAllowed: false', 'candidate evaluator must not auto-promote readiness'],
  ['lib/compliance-obligation-register.ts', 'softwareCanSelfCertifyCompliance: false', 'register must not self-certify compliance'],
  ['lib/compliance-obligation-register.ts', 'softwareCanSelfCertifyExaminationReadiness: false', 'register must not self-certify exam readiness'],
  ['lib/compliance-obligation-register.ts', 'productionComplianceManagementSystemOperating: false', 'production CMS must remain unclaimed'],
  ['lib/compliance-obligation-register.ts', 'productionBsaAmlProgramOperating: false', 'production BSA AML program must remain unclaimed'],
  ['lib/compliance-obligation-register.ts', 'productionOfacProgramOperating: false', 'production OFAC program must remain unclaimed'],
  ['lib/compliance-obligation-register.ts', "authority: 'OCC'", 'official OCC source must be registered'],
  ['lib/compliance-obligation-register.ts', "authority: 'FFIEC'", 'official FFIEC source must be registered'],
  ['lib/compliance-obligation-register.ts', "authority: 'OFAC'", 'official OFAC source must be registered'],
  ['app/api/prototype/compliance-applicability/route.ts', 'requirePrototypeOperator(request)', 'compliance applicability endpoint must require operator access'],
  ['app/api/prototype/compliance-applicability/route.ts', 'requireTrustedOrigin(request)', 'compliance applicability endpoint must enforce trusted origin'],
  ['app/api/prototype/compliance-applicability/route.ts', 'requireJsonRequest(request)', 'compliance applicability endpoint must require JSON'],
  ['app/api/prototype/compliance-applicability/route.ts', 'readJsonBodyLimited<ComplianceApplicabilityRequest>(request, 24_576)', 'compliance applicability endpoint must bound body size'],
  ['app/api/prototype/compliance-applicability/route.ts', 'resolveRequestBrand', 'compliance applicability endpoint must remain tenant-bound'],
  ['app/api/prototype/compliance-applicability/route.ts', 'persisted: false', 'compliance applicability endpoint must remain non-persistent'],
  ['scripts/compliance-obligation-register-runtime-check.mjs', 'Compliance obligation register unresolved-applicability, source coverage, human-review, and software-noncertification runtime checks passed.', 'compliance register must have executable runtime coverage'],
  ['package.json', 'scripts/compliance-obligation-register-runtime-check.mjs', 'compliance runtime coverage must run in CI']
];

const forbidden = [
  ['lib/compliance-obligation-register.ts', "applicabilityStatus: 'applicable'", 'register must not seed an applicable legal determination'],
  ['lib/compliance-obligation-register.ts', 'accountableHumanRoleAssigned: true', 'register must not invent assigned human ownership'],
  ['lib/compliance-obligation-register.ts', 'galacticObligationDetermined: true', 'register must not self-determine obligations'],
  ['lib/compliance-obligation-register.ts', 'softwareVerifiedLegalApplicability: true', 'software must not verify legal applicability'],
  ['lib/compliance-obligation-register.ts', 'softwareVerifiedRegulatoryInterpretation: true', 'software must not claim authoritative interpretation'],
  ['lib/compliance-obligation-register.ts', 'readinessPromotionAllowed: true', 'compliance candidate must not auto-promote readiness'],
  ['lib/compliance-obligation-register.ts', 'softwareCanSelfCertifyCompliance: true', 'register must not self-certify compliance'],
  ['lib/compliance-obligation-register.ts', 'softwareCanSelfCertifyExaminationReadiness: true', 'register must not self-certify examination readiness'],
  ['lib/compliance-obligation-register.ts', 'productionBsaAmlProgramOperating: true', 'register must not claim a live BSA AML program'],
  ['lib/compliance-obligation-register.ts', 'productionOfacProgramOperating: true', 'register must not claim a live OFAC program'],
  ['app/api/prototype/compliance-applicability/route.ts', 'await request.json()', 'compliance applicability endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/compliance-applicability/route.ts', 'persisted: true', 'compliance applicability endpoint must not claim persistence']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Compliance obligation register applicability, ownership, operator/request, source, non-persistence, and non-certification safety checks passed.');
