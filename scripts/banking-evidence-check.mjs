import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const migration = read('db/migrations/004_banking_certification_evidence.sql');
const evidence = read('lib/provider-sandbox-evidence.ts');
const exportRoute = read('app/api/banking/provider-sandbox/evidence/route.ts');
const verifyRoute = read('app/api/banking/provider-sandbox/evidence/verify/route.ts');

const required = [
  [migration, 'banking_certification_evidence', 'certification evidence must have durable storage'],
  [migration, 'manifest_sha256', 'stored evidence must persist its SHA-256 digest'],
  [migration, 'hmac_sha256', 'stored evidence must persist its HMAC signature'],
  [migration, 'banking_certification_evidence_append_only', 'stored evidence must be append-only'],
  [migration, 'galactic_reject_append_only_mutation', 'evidence mutation must use the existing append-only database guard'],

  [evidence, 'BANKING_SANDBOX_EVIDENCE_SECRET', 'evidence signing must use a dedicated evidence secret'],
  [evidence, 'BANKING_SANDBOX_EVIDENCE_KEY_ID', 'evidence signing must use a non-secret key identifier'],
  [evidence, 'secret.length >= 32', 'evidence signing secret must have a minimum-length gate'],
  [evidence, "createHash('sha256')", 'evidence manifest must have a SHA-256 digest'],
  [evidence, "createHmac('sha256'", 'evidence manifest must have an HMAC-SHA256 signature'],
  [evidence, 'timingSafeEqual', 'evidence verification must use timing-safe signature comparison'],
  [evidence, 'Object.keys(value).sort()', 'evidence manifest must use deterministic object-key ordering'],
  [evidence, 'canonicalEvidenceJson', 'evidence hashing and signing must use canonical JSON'],
  [evidence, 'providerResourceSha256', 'raw provider resource identifiers must be replaced with hashes in evidence'],
  [evidence, 'rawProviderEventSha256', 'raw provider event identifiers must be replaced with hashes in evidence'],
  [evidence, 'containsSecrets: false', 'evidence manifest must explicitly state that secrets are excluded'],
  [evidence, 'containsRawProviderResourceIds: false', 'evidence manifest must explicitly state raw provider identifiers are excluded'],
  [evidence, 'containsRawWebhookBodies: false', 'evidence manifest must explicitly state raw webhook bodies are excluded'],
  [evidence, 'containsCustomerPii: false', 'evidence manifest must explicitly state customer PII is excluded'],
  [evidence, 'productionLiveMoneyAuthorized: false', 'evidence bundle must never imply production authorization'],
  [evidence, "verificationScope: 'galactic_internal_hmac'", 'HMAC verification scope must be labeled as internal, not third-party notarization'],
  [evidence, 'certification_evidence_generated', 'evidence generation must append audit evidence'],
  [evidence, 'galactic_schema_migrations', 'evidence must include applied migration checksums'],
  [evidence, 'getProviderSandboxOperationsSnapshot', 'evidence must include queue/reconciliation health snapshot'],
  [evidence, 'verifyStoredProviderSandboxEvidence', 'stored evidence must have a verification path'],

  [exportRoute, 'requireSandboxOperator', 'evidence export must require signed allowlisted operator auth'],
  [exportRoute, "keys.length !== 1 || keys[0] !== 'certificationRunId'", 'evidence export must accept only the certification run ID'],
  [verifyRoute, 'requireSandboxOperator', 'stored evidence verification must require signed allowlisted operator auth'],
  [verifyRoute, "keys.length !== 1 || keys[0] !== 'bundleId'", 'stored evidence verification must accept only the bundle ID']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Evidence regression: ${label}`);
}

const forbidden = [
  [evidence, 'BANKING_SANDBOX_API_KEY', 'evidence generator must not read the provider API key'],
  [evidence, 'BANKING_SANDBOX_WEBHOOK_SECRET', 'evidence generator must not read the provider webhook secret'],
  [evidence, 'BANKING_SANDBOX_OPERATOR_SECRET', 'evidence generator must not read the operator signing secret'],
  [evidence, 'rawBody', 'evidence generator must never load or export raw webhook bodies'],
  [exportRoute, 'requireBankingUser', 'evidence export must not use public/demo customer authentication'],
  [verifyRoute, 'requireBankingUser', 'evidence verification must not use public/demo customer authentication'],
  [migration, 'ON DELETE CASCADE', 'certification evidence must not cascade-delete'],
  [migration, 'DROP TABLE', 'certification evidence migration must not drop evidence tables']
];

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Evidence regression: ${label}`);
}

console.log('Galactic Trust certification evidence canonicalization, hashing, signing, privacy, append-only storage, and operator-control checks passed.');
