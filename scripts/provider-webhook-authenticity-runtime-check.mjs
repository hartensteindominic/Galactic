import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class BankingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function transpile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: file
  }).outputText;
}

const providerModule = { exports: {} };
vm.runInNewContext(transpile('lib/banking-provider-contract.ts'), {
  module: providerModule,
  exports: providerModule.exports,
  console,
  Headers,
  Uint8Array,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected provider contract runtime import: ${specifier}`);
  }
}, { filename: 'banking-provider-contract.runtime.cjs' });

const authenticityModule = { exports: {} };
vm.runInNewContext(transpile('lib/provider-webhook-authenticity.ts'), {
  module: authenticityModule,
  exports: authenticityModule.exports,
  console,
  Date,
  Number,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected authenticity runtime import: ${specifier}`);
  }
}, { filename: 'provider-webhook-authenticity.runtime.cjs' });

const { disabledBankingProvider } = providerModule.exports;
const { requireVerifiedProviderWebhookEvent, providerWebhookAuthenticityControlStatus } = authenticityModule.exports;

const valid = {
  provider: 'future-provider',
  providerEventId: 'evt-123',
  eventType: 'payment.updated',
  occurredAt: '2026-08-30T15:00:00.000Z',
  resourceId: 'payment-123',
  rawPayloadDigest: 'a'.repeat(64),
  authenticity: {
    rawBodyUsedForVerification: true,
    providerAuthenticityVerified: true,
    antiReplayVerified: true,
    providerEventIdentityVerified: true,
    verificationScheme: 'provider-specific-certification-scheme',
    verifiedAt: '2026-08-30T15:00:01.000Z'
  }
};

assert.equal(requireVerifiedProviderWebhookEvent(valid), valid);

for (const mutation of [
  (event) => { event.provider = ''; },
  (event) => { event.providerEventId = ''; },
  (event) => { event.eventType = ''; },
  (event) => { event.rawPayloadDigest = 'not-sha256'; },
  (event) => { event.authenticity.rawBodyUsedForVerification = false; },
  (event) => { event.authenticity.providerAuthenticityVerified = false; },
  (event) => { event.authenticity.antiReplayVerified = false; },
  (event) => { event.authenticity.providerEventIdentityVerified = false; },
  (event) => { event.authenticity.verificationScheme = ''; },
  (event) => { event.authenticity.verifiedAt = 'not-a-date'; }
]) {
  const copy = JSON.parse(JSON.stringify(valid));
  mutation(copy);
  assert.throws(
    () => requireVerifiedProviderWebhookEvent(copy),
    (error) => error instanceof BankingError && error.status === 502 && error.code === 'INVALID_VERIFIED_PROVIDER_EVENT'
  );
}

const controls = providerWebhookAuthenticityControlStatus();
assert.equal(controls.providerNeutralContractDefined, true);
assert.equal(controls.rawBodyVerificationRequired, true);
assert.equal(controls.providerAuthenticityEvidenceRequired, true);
assert.equal(controls.antiReplayEvidenceRequired, true);
assert.equal(controls.providerEventIdentityEvidenceRequired, true);
assert.equal(controls.sha256PayloadDigestRequired, true);
assert.equal(controls.incompleteEvidenceFailsClosed, true);
assert.equal(controls.providerSpecificVerifierImplemented, false);
assert.equal(controls.providerSpecificSignatureSchemeSelected, false);
assert.equal(controls.providerSpecificHeaderMappingSelected, false);
assert.equal(controls.providerSpecificAntiReplayRuleSelected, false);
assert.equal(controls.keyRotationProcedureApproved, false);
assert.equal(controls.certificationExerciseVerified, false);
assert.equal(controls.productionWebhookEndpointEnabled, false);

const disabled = disabledBankingProvider();
assert.equal(disabled.capabilities().productionWebhooks, false);
await assert.rejects(
  () => disabled.verifyAndParseWebhook({
    rawBody: new Uint8Array([123, 125]),
    headers: new Headers(),
    receivedAt: '2026-08-30T15:00:00.000Z'
  }),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'BANKING_PROVIDER_DISABLED'
);

console.log('Provider-neutral webhook authenticity evidence runtime checks passed.');
