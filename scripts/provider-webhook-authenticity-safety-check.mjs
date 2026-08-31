import fs from 'node:fs';

const required = [
  ['lib/banking-provider-contract.ts', 'rawBodyUsedForVerification: true', 'verified provider event contract must require raw-body verification evidence'],
  ['lib/banking-provider-contract.ts', 'providerAuthenticityVerified: true', 'verified provider event contract must require provider authenticity evidence'],
  ['lib/banking-provider-contract.ts', 'antiReplayVerified: true', 'verified provider event contract must require anti-replay evidence'],
  ['lib/banking-provider-contract.ts', 'providerEventIdentityVerified: true', 'verified provider event contract must require provider event identity evidence'],
  ['lib/banking-provider-contract.ts', 'receivedAt: string', 'provider webhook input must carry receive time for provider-specific anti-replay verification'],
  ['lib/provider-webhook-authenticity.ts', 'incompleteEvidenceFailsClosed: true', 'provider webhook evidence guard must fail closed'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificVerifierImplemented: false', 'provider-specific verifier must remain unimplemented until selected'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificSignatureSchemeSelected: false', 'provider-specific signature scheme must remain unselected'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificHeaderMappingSelected: false', 'provider-specific header mapping must remain unselected'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificAntiReplayRuleSelected: false', 'provider-specific anti-replay rule must remain unselected'],
  ['lib/provider-webhook-authenticity.ts', 'keyRotationProcedureApproved: false', 'provider webhook key rotation procedure must remain unapproved'],
  ['lib/provider-webhook-authenticity.ts', 'certificationExerciseVerified: false', 'provider webhook certification exercise must remain unverified'],
  ['lib/provider-webhook-authenticity.ts', 'productionWebhookEndpointEnabled: false', 'production provider webhook endpoint must remain disabled'],
  ['scripts/provider-webhook-authenticity-runtime-check.mjs', 'Provider-neutral webhook authenticity evidence runtime checks passed.', 'provider webhook authenticity contract must have executable runtime coverage'],
  ['package.json', 'scripts/provider-webhook-authenticity-runtime-check.mjs', 'provider webhook authenticity runtime check must run in CI']
];

const forbidden = [
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificVerifierImplemented: true', 'prototype must not self-implement a provider-specific verifier'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificSignatureSchemeSelected: true', 'prototype must not self-select a provider signature scheme'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificHeaderMappingSelected: true', 'prototype must not self-select provider signature headers'],
  ['lib/provider-webhook-authenticity.ts', 'providerSpecificAntiReplayRuleSelected: true', 'prototype must not self-select provider anti-replay semantics'],
  ['lib/provider-webhook-authenticity.ts', 'keyRotationProcedureApproved: true', 'prototype must not self-approve webhook key rotation'],
  ['lib/provider-webhook-authenticity.ts', 'certificationExerciseVerified: true', 'prototype must not self-certify webhook verification exercise'],
  ['lib/provider-webhook-authenticity.ts', 'productionWebhookEndpointEnabled: true', 'prototype must not self-enable production webhook endpoint']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Provider-neutral webhook authenticity contract and production-boundary safety checks passed.');
