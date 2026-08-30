import fs from 'node:fs';

const required = [
  ['lib/sponsor-diligence-pack.ts', "status: 'evidence-required'", 'diligence sections must default to evidence required'],
  ['lib/sponsor-diligence-pack.ts', 'humanAttestationRequired: true', 'diligence sections must require human attestation'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorReviewRequired: true', 'diligence sections must require sponsor review'],
  ['lib/sponsor-diligence-pack.ts', 'evidenceVerified: false', 'diligence evidence must default unverified'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorAccepted: false', 'diligence sections must default unaccepted'],
  ['lib/sponsor-diligence-pack.ts', 'selectedSponsorBank: null', 'pack must not invent a sponsor bank'],
  ['lib/sponsor-diligence-pack.ts', 'selectedBaasProvider: null', 'pack must not invent a BaaS provider'],
  ['lib/sponsor-diligence-pack.ts', 'automaticSubmissionEnabled: false', 'automatic sponsor submission must remain disabled'],
  ['lib/sponsor-diligence-pack.ts', 'softwareAttestationEnabled: false', 'software attestation must remain disabled'],
  ['lib/sponsor-diligence-pack.ts', 'applicantImpersonationEnabled: false', 'applicant impersonation must remain disabled'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorImpersonationEnabled: false', 'sponsor impersonation must remain disabled'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorProgramApprovalComplete: false', 'pack must not claim sponsor program approval'],
  ['lib/sponsor-diligence-pack.ts', 'liveCustomerDataApproved: false', 'pack must not approve live customer data'],
  ['lib/sponsor-diligence-pack.ts', 'readyForSponsorSubmission: false', 'pack must not self-promote to sponsor submission readiness'],
  ['lib/sponsor-diligence-pack.ts', 'readyForLiveProgram: false', 'pack must not self-promote to live readiness'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'requirePrototypeOperator(request)', 'sponsor diligence endpoint must require operator access'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'requireTrustedOrigin(request)', 'sponsor diligence endpoint must enforce trusted origin'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'requireJsonRequest(request)', 'sponsor diligence endpoint must require JSON'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'readJsonBodyLimited<SponsorDiligenceRequest>(request, 32_768)', 'sponsor diligence endpoint must bound request bodies'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'persisted: false', 'sponsor diligence endpoint must remain non-persistent'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'submitted: false', 'sponsor diligence endpoint must never claim submission'],
  ['app/api/prototype/status/route.ts', 'sponsorDiligence: sponsorDiligencePackStatus()', 'status API must expose sponsor diligence posture'],
  ['app/api/prototype/status/route.ts', 'no selected sponsor bank or BaaS provider', 'status API must disclose no sponsor selection'],
  ['lib/prototype-trust.ts', "id: 'sponsor-diligence-pack'", 'Trust Center must expose sponsor diligence evidence pack'],
  ['lib/prototype-trust.ts', 'No sponsor bank or BaaS provider is selected by this pack.', 'Trust Center must disclose no sponsor/provider selection'],
  ['lib/prototype-trust.ts', 'sponsorDiligenceReadyForLiveProgram: sponsorDiligence.readyForLiveProgram', 'Trust Center must expose diligence live-program readiness as false'],
  ['app/prototype/strategy/page.tsx', 'sponsorDiligence={sponsorDiligencePackStatus()}', 'Strategy page must pass sponsor diligence posture into protected workspace'],
  ['app/prototype/strategy/strategy-shell.tsx', '<SponsorDiligencePanel tenantKey={tenantKey} status={sponsorDiligence} />', 'Strategy shell must render sponsor diligence inside protected workspace'],
  ['app/prototype/strategy/sponsor-diligence-panel.tsx', 'No selected sponsor/program:', 'diligence UI must expose missing sponsor/program'],
  ['app/prototype/strategy/sponsor-diligence-panel.tsx', 'Structurally complete only · not submitted', 'diligence UI must never present structural completeness as submission'],
  ['app/prototype/strategy/sponsor-diligence-panel.tsx', 'Software may attest', 'diligence UI must expose software-attestation boundary'],
  ['docs/SPONSOR_DILIGENCE_RESPONSE_PACK.md', 'drafted response ≠ authenticated evidence ≠ human attestation ≠ sponsor review ≠ sponsor acceptance ≠ contract approval ≠ program approval', 'diligence docs must preserve evidence and approval stages'],
  ['docs/SPONSOR_DILIGENCE_RESPONSE_PACK.md', 'AI and software must not:', 'diligence docs must bound AI/software authority'],
  ['scripts/sponsor-diligence-pack-runtime-check.mjs', 'Sponsor diligence evidence, human-attestation, no-auto-submit, no-impersonation, and non-approval runtime checks passed.', 'sponsor diligence must have executable runtime coverage'],
  ['package.json', 'scripts/sponsor-diligence-pack-runtime-check.mjs', 'sponsor diligence runtime coverage must run in CI']
];

const forbidden = [
  ['lib/sponsor-diligence-pack.ts', 'evidenceVerified: true', 'pack must not pre-verify evidence'],
  ['lib/sponsor-diligence-pack.ts', 'humanAttestationVerified: true', 'pack must not invent human attestation'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorAccepted: true', 'pack must not invent sponsor acceptance'],
  ['lib/sponsor-diligence-pack.ts', 'automaticSubmissionEnabled: true', 'automatic submission must remain disabled'],
  ['lib/sponsor-diligence-pack.ts', 'softwareAttestationEnabled: true', 'software must not attest as a human'],
  ['lib/sponsor-diligence-pack.ts', 'applicantImpersonationEnabled: true', 'software must not impersonate the applicant'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorImpersonationEnabled: true', 'software must not impersonate the sponsor'],
  ['lib/sponsor-diligence-pack.ts', 'sponsorProgramApprovalComplete: true', 'pack must not claim program approval'],
  ['lib/sponsor-diligence-pack.ts', 'readyForSponsorSubmission: true', 'pack must not self-promote to submission readiness'],
  ['lib/sponsor-diligence-pack.ts', 'readyForLiveProgram: true', 'pack must not self-promote to live readiness'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'await request.json()', 'sponsor diligence endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'persisted: true', 'sponsor diligence endpoint must not claim persistence'],
  ['app/api/prototype/sponsor-diligence/route.ts', 'submitted: true', 'sponsor diligence endpoint must not claim submission'],
  ['app/prototype/strategy/sponsor-diligence-panel.tsx', 'defaultValue=', 'diligence UI must not hide default program facts or sponsor choices']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Sponsor diligence source/evidence, human-attestation, Trust/status/Strategy UI, operator/request, no-auto-submit, no-impersonation, and non-approval safety checks passed.');
