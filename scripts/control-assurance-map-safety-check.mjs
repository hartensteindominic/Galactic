import fs from 'node:fs';

const required = [
  ['lib/control-assurance-map.ts', "status: 'design-reference-only'", 'control assurance records must start as design references only'],
  ['lib/control-assurance-map.ts', 'accountableOwnerVerified: false', 'control owners must default unverified'],
  ['lib/control-assurance-map.ts', 'operatingEvidenceVerified: false', 'operating evidence must default unverified'],
  ['lib/control-assurance-map.ts', 'independentTestingVerified: false', 'independent testing must default unverified'],
  ['lib/control-assurance-map.ts', 'remediationVerified: false', 'remediation must default unverified'],
  ['lib/control-assurance-map.ts', 'sponsorAccepted: false', 'sponsor acceptance must default false'],
  ['lib/control-assurance-map.ts', 'boardOrGovernanceApproved: false', 'board/governance approval must default false'],
  ['lib/control-assurance-map.ts', 'launchGateSatisfied: false', 'launch gate satisfaction must default false'],
  ['lib/control-assurance-map.ts', 'softwareMayActAsControlOwner: false', 'software must not act as control owner'],
  ['lib/control-assurance-map.ts', 'softwareMayActAsIndependentTester: false', 'software must not act as independent tester'],
  ['lib/control-assurance-map.ts', 'softwareMayCloseFindings: false', 'software must not close findings'],
  ['lib/control-assurance-map.ts', 'automaticOperatingEffectivenessPromotionEnabled: false', 'operating effectiveness must not auto-promote'],
  ['lib/control-assurance-map.ts', 'automaticLaunchGatePromotionEnabled: false', 'launch gates must not auto-promote'],
  ['app/api/prototype/control-assurance/route.ts', 'requirePrototypeOperator(request)', 'control assurance endpoint must require operator access'],
  ['app/api/prototype/control-assurance/route.ts', 'requireTrustedOrigin(request)', 'control assurance endpoint must enforce trusted origin'],
  ['app/api/prototype/control-assurance/route.ts', 'requireJsonRequest(request)', 'control assurance endpoint must require JSON'],
  ['app/api/prototype/control-assurance/route.ts', 'readJsonBodyLimited<ControlAssuranceRequest>(request, 32_768)', 'control assurance endpoint must bound request bodies'],
  ['app/api/prototype/control-assurance/route.ts', 'persisted: false', 'control assurance endpoint must remain non-persistent'],
  ['app/api/prototype/control-assurance/route.ts', 'findingClosed: false', 'control assurance endpoint must not close findings'],
  ['app/api/prototype/control-assurance/route.ts', 'launchGateChanged: false', 'control assurance endpoint must not change launch gates'],
  ['docs/CONTROL_ASSURANCE_AND_EVIDENCE_MAP.md', 'control designed ≠ owner verified ≠ control operating ≠ evidence authenticated ≠ independently tested ≠ findings remediated ≠ sponsor/board accepted ≠ launch gate satisfied', 'assurance docs must preserve evidence and approval stages'],
  ['docs/CONTROL_ASSURANCE_AND_EVIDENCE_MAP.md', 'AI/software may not:', 'assurance docs must bound AI/software authority'],
  ['scripts/control-assurance-map-runtime-check.mjs', 'Control assurance map ownership linkage, evidence/test separation, open-findings, no-auto-closure, and non-promotion runtime checks passed.', 'control assurance must have executable runtime coverage']
];

const forbidden = [
  ['lib/control-assurance-map.ts', "status: 'operating-effective'", 'controls must not default operating effective'],
  ['lib/control-assurance-map.ts', 'accountableOwnerVerified: true', 'control owner must not self-verify'],
  ['lib/control-assurance-map.ts', 'operatingEvidenceVerified: true', 'operating evidence must not self-verify'],
  ['lib/control-assurance-map.ts', 'independentTestingVerified: true', 'independent testing must not self-verify'],
  ['lib/control-assurance-map.ts', 'remediationVerified: true', 'remediation must not self-verify'],
  ['lib/control-assurance-map.ts', 'launchGateSatisfied: true', 'assurance map must not satisfy launch gates'],
  ['lib/control-assurance-map.ts', 'softwareMayActAsControlOwner: true', 'software must not own controls'],
  ['lib/control-assurance-map.ts', 'softwareMayActAsIndependentTester: true', 'software must not be independent tester'],
  ['lib/control-assurance-map.ts', 'softwareMayCloseFindings: true', 'software must not close findings'],
  ['app/api/prototype/control-assurance/route.ts', 'await request.json()', 'control assurance endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/control-assurance/route.ts', 'persisted: true', 'control assurance endpoint must not claim persistence'],
  ['app/api/prototype/control-assurance/route.ts', 'findingClosed: true', 'control assurance endpoint must not claim finding closure'],
  ['app/api/prototype/control-assurance/route.ts', 'launchGateChanged: true', 'control assurance endpoint must not mutate launch gates']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Control assurance ownership/evidence/testing/remediation, operator/request, no-auto-closure, and non-promotion safety checks passed.');
