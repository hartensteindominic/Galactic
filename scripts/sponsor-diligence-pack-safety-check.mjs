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
  ['docs/SPONSOR_DILIGENCE_RESPONSE_PACK.md', 'drafted response ≠ authenticated evidence ≠ human attestation ≠ sponsor review ≠ sponsor acceptance ≠ contract approval ≠ program approval', 'diligence docs must preserve evidence and approval stages'],
  ['docs/SPONSOR_DILIGENCE_RESPONSE_PACK.md', 'AI and software must not:', 'diligence docs must bound AI/software authority'],
  ['scripts/sponsor-diligence-pack-runtime-check.mjs', 'Sponsor diligence evidence, human-attestation, no-auto-submit, no-impersonation, and non-approval runtime checks passed.', 'sponsor diligence must have executable runtime coverage']
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
  ['app/api/prototype/sponsor-diligence/route.ts', 'submitted: true', 'sponsor diligence endpoint must not claim submission']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Sponsor diligence source/evidence, human-attestation, operator/request, no-auto-submit, no-impersonation, and non-approval safety checks passed.');
