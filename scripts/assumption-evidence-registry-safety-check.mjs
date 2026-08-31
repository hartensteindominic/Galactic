import fs from 'node:fs';

const required = [
  ['lib/assumption-evidence-registry.ts', "status: 'evidence-missing'", 'assumption evidence slots must default missing'],
  ['lib/assumption-evidence-registry.ts', 'evidenceAuthenticated: false', 'evidence must not be pre-authenticated'],
  ['lib/assumption-evidence-registry.ts', 'assumptionValidated: false', 'assumptions must not be pre-validated'],
  ['lib/assumption-evidence-registry.ts', 'approvedForSponsorUse: false', 'assumptions must not be pre-approved for sponsor use'],
  ['lib/assumption-evidence-registry.ts', 'approvedForBoardUse: false', 'assumptions must not be pre-approved for board use'],
  ['lib/assumption-evidence-registry.ts', 'approvedForCharterUse: false', 'assumptions must not be pre-approved for charter use'],
  ['lib/assumption-evidence-registry.ts', 'automaticEvidenceAuthenticationEnabled: false', 'automatic evidence authentication must be disabled'],
  ['lib/assumption-evidence-registry.ts', 'automaticAssumptionValidationEnabled: false', 'automatic assumption validation must be disabled'],
  ['lib/assumption-evidence-registry.ts', 'automaticReadinessPromotionEnabled: false', 'automatic readiness promotion must be disabled'],
  ['lib/assumption-evidence-registry.ts', "'operator-scenario'", 'registry must explicitly distinguish scenario inputs'],
  ['lib/assumption-evidence-registry.ts', "'provider-quote-or-contract'", 'registry must explicitly distinguish provider evidence class'],
  ['lib/assumption-evidence-registry.ts', "'external-authority-record'", 'registry must explicitly distinguish external authority records'],
  ['app/api/prototype/assumption-evidence/route.ts', 'requirePrototypeOperator(request)', 'assumption evidence endpoint must require operator access'],
  ['app/api/prototype/assumption-evidence/route.ts', 'requireTrustedOrigin(request)', 'assumption evidence endpoint must enforce trusted origin'],
  ['app/api/prototype/assumption-evidence/route.ts', 'requireJsonRequest(request)', 'assumption evidence endpoint must require JSON'],
  ['app/api/prototype/assumption-evidence/route.ts', 'readJsonBodyLimited<AssumptionEvidenceRequest>(request, 32_768)', 'assumption evidence endpoint must bound request bodies'],
  ['app/api/prototype/assumption-evidence/route.ts', 'persisted: false', 'assumption evidence endpoint must remain non-persistent'],
  ['docs/ASSUMPTION_EVIDENCE_REGISTRY.md', 'assumption entered ≠ evidence referenced ≠ evidence authenticated ≠ owner verified ≠ methodology validated ≠ sensitivity validated ≠ financial schedules reconciled ≠ sponsor/board/regulator approved.', 'documentation must preserve evidence stages'],
  ['docs/ASSUMPTION_EVIDENCE_REGISTRY.md', 'A blank evidence slot is preferable to a polished but unsupported number.', 'documentation must prefer missing evidence to invented assumptions'],
  ['scripts/assumption-evidence-registry-runtime-check.mjs', 'Assumption evidence no-default, missing-evidence, scenario-vs-source, non-authentication, non-validation, and non-promotion runtime checks passed.', 'assumption registry must have executable runtime coverage']
];

const forbidden = [
  ['lib/assumption-evidence-registry.ts', "status: 'validated'", 'evidence slots must not be prevalidated'],
  ['lib/assumption-evidence-registry.ts', 'evidenceAuthenticated: true', 'registry must not auto-authenticate evidence'],
  ['lib/assumption-evidence-registry.ts', 'assumptionValidated: true', 'registry must not auto-validate assumptions'],
  ['lib/assumption-evidence-registry.ts', 'approvedForSponsorUse: true', 'registry must not auto-approve sponsor assumptions'],
  ['lib/assumption-evidence-registry.ts', 'approvedForBoardUse: true', 'registry must not auto-approve board assumptions'],
  ['lib/assumption-evidence-registry.ts', 'approvedForCharterUse: true', 'registry must not auto-approve charter assumptions'],
  ['lib/assumption-evidence-registry.ts', 'automaticEvidenceAuthenticationEnabled: true', 'automatic evidence authentication must remain disabled'],
  ['lib/assumption-evidence-registry.ts', 'automaticAssumptionValidationEnabled: true', 'automatic assumption validation must remain disabled'],
  ['lib/assumption-evidence-registry.ts', 'automaticReadinessPromotionEnabled: true', 'automatic readiness promotion must remain disabled'],
  ['app/api/prototype/assumption-evidence/route.ts', 'await request.json()', 'assumption evidence endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/assumption-evidence/route.ts', 'persisted: true', 'assumption evidence endpoint must not claim persistence']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Assumption evidence missing-by-default, scenario/source distinction, operator/request, no-auto-authentication, non-validation, and non-promotion safety checks passed.');
