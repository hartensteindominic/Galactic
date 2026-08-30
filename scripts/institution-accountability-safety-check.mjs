import fs from 'node:fs';

const required = [
  ['lib/institution-accountability.ts', "assignmentStatus: 'unassigned'", 'institution roles must default to unassigned'],
  ['lib/institution-accountability.ts', 'qualifiedHumanRequired: true', 'institution roles must require qualified humans'],
  ['lib/institution-accountability.ts', 'aiMayServeAsAccountableOwner: false', 'AI must never be an accountable institution owner'],
  ['lib/institution-accountability.ts', 'softwareMayServeAsAccountableOwner: false', 'software must never be an accountable institution owner'],
  ['lib/institution-accountability.ts', "role('bsa-aml-officer'", 'future BSA AML accountability must be represented'],
  ['lib/institution-accountability.ts', "role('proposed-bank-board'", 'future bank board accountability must be represented'],
  ['lib/institution-accountability.ts', "role('internal-audit-function'", 'independent audit accountability must be represented'],
  ['lib/institution-accountability.ts', 'automatedAssignmentAllowed: false', 'automated assignment must be prohibited'],
  ['lib/institution-accountability.ts', 'automatedQualificationVerificationAllowed: false', 'software must not verify qualifications automatically'],
  ['lib/institution-accountability.ts', 'readyForCharterGovernanceSubmission: false', 'accountability model must not claim charter submission readiness'],
  ['app/api/prototype/accountability/route.ts', 'requirePrototypeOperator(request)', 'accountability endpoint must require operator access'],
  ['app/api/prototype/accountability/route.ts', 'requireTrustedOrigin(request)', 'accountability endpoint must require trusted origin'],
  ['app/api/prototype/accountability/route.ts', 'requireJsonRequest(request)', 'accountability endpoint must require JSON'],
  ['app/api/prototype/accountability/route.ts', 'readJsonBodyLimited<AccountabilityRequest>(request, 24_576)', 'accountability endpoint must bound request bodies'],
  ['app/api/prototype/accountability/route.ts', 'persisted: false', 'accountability endpoint must remain non-persistent'],
  ['app/api/prototype/status/route.ts', 'institutionAccountability: institutionAccountabilityStatus()', 'status API must expose institution accountability posture'],
  ['app/api/prototype/status/route.ts', 'AI, Orbit, ChatGPT, autonomous agents, code, and software services cannot act as the bank board', 'status disclosure must reject AI/software regulated accountability'],
  ['scripts/institution-accountability-runtime-check.mjs', 'Institution accountability unassigned-human-owner, no-AI-owner, evidence, and non-promotion runtime checks passed.', 'accountability must have executable runtime coverage'],
  ['package.json', 'scripts/institution-accountability-runtime-check.mjs', 'accountability runtime coverage must run in CI']
];

const forbidden = [
  ['lib/institution-accountability.ts', "assignmentStatus: 'assigned'", 'institution roles must not be preassigned'],
  ['lib/institution-accountability.ts', 'aiMayServeAsAccountableOwner: true', 'AI must not serve as accountable owner'],
  ['lib/institution-accountability.ts', 'softwareMayServeAsAccountableOwner: true', 'software must not serve as accountable owner'],
  ['lib/institution-accountability.ts', 'automatedAssignmentAllowed: true', 'automated assignment must remain disabled'],
  ['lib/institution-accountability.ts', 'readyForCharterGovernanceSubmission: true', 'accountability model must not self-approve charter governance'],
  ['app/api/prototype/accountability/route.ts', 'await request.json()', 'accountability endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/accountability/route.ts', 'persisted: true', 'accountability endpoint must not claim persistence']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Institution accountability human-owner, no-AI-owner, status, operator/request, non-persistence, and non-promotion safety checks passed.');
