import { BankingError } from './banking';
import type { VerifiedProviderEvent } from './banking-provider-contract';

const SHA256_HEX = /^[0-9a-f]{64}$/;

export function requireVerifiedProviderWebhookEvent(event: VerifiedProviderEvent) {
  if (!event.provider?.trim() || event.provider.length > 120) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook evidence is incomplete.');
  }
  if (!event.providerEventId?.trim() || event.providerEventId.length > 220) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook evidence is incomplete.');
  }
  if (!event.eventType?.trim() || event.eventType.length > 160) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook evidence is incomplete.');
  }
  if (!SHA256_HEX.test(event.rawPayloadDigest || '')) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook evidence is incomplete.');
  }

  const evidence = event.authenticity;
  if (!evidence ||
      evidence.rawBodyUsedForVerification !== true ||
      evidence.providerAuthenticityVerified !== true ||
      evidence.antiReplayVerified !== true ||
      evidence.providerEventIdentityVerified !== true) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook authenticity evidence is incomplete.');
  }
  if (!evidence.verificationScheme?.trim() || evidence.verificationScheme.length > 160) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook authenticity evidence is incomplete.');
  }
  if (!evidence.verifiedAt || !Number.isFinite(Date.parse(evidence.verifiedAt))) {
    throw new BankingError(502, 'INVALID_VERIFIED_PROVIDER_EVENT', 'Verified provider webhook authenticity evidence is incomplete.');
  }

  return event;
}

export function providerWebhookAuthenticityControlStatus() {
  return {
    providerNeutralContractDefined: true,
    rawBodyVerificationRequired: true,
    providerAuthenticityEvidenceRequired: true,
    antiReplayEvidenceRequired: true,
    providerEventIdentityEvidenceRequired: true,
    sha256PayloadDigestRequired: true,
    incompleteEvidenceFailsClosed: true,
    providerSpecificVerifierImplemented: false,
    providerSpecificSignatureSchemeSelected: false,
    providerSpecificHeaderMappingSelected: false,
    providerSpecificAntiReplayRuleSelected: false,
    keyRotationProcedureApproved: false,
    certificationExerciseVerified: false,
    productionWebhookEndpointEnabled: false,
    disclosure: 'The provider-neutral contract requires a future adapter to verify the raw request body, provider authenticity/signature, anti-replay rule, and provider event identity before an event can be accepted as verified. No provider-specific signature scheme, header mapping, key rotation procedure, certification exercise, or production webhook endpoint is selected or enabled yet.'
  } as const;
}
