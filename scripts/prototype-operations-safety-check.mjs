import fs from 'node:fs';

const required = [
  ['lib/prototype-operations.ts', "responseBodyLogged: false", 'operations database failures must explicitly avoid raw response-body logging'],
  ['lib/prototype-operations.ts', 'databaseCredentialsConfigured: databaseConfigured', 'operations status must distinguish credentials from verified behavior'],
  ['lib/prototype-operations.ts', 'persistentSchemaVerified: false', 'operations status must not self-verify persistent schema'],
  ['lib/prototype-operations.ts', 'persistentReconciliationVerified: false', 'operations status must not self-verify reconciliation'],
  ['lib/prototype-operations.ts', 'reconciliationExerciseVerified: false', 'operations status must not self-certify reconciliation exercise'],
  ['lib/prototype-operations.ts', 'webhookInboxEnvironmentConfigured: webhookEnvironmentConfigured', 'operations status must distinguish webhook environment setup'],
  ['lib/prototype-operations.ts', 'webhookInboxConfigured: false', 'operations status must not self-verify webhook inbox behavior'],
  ['lib/prototype-operations.ts', 'webhookReplayExerciseVerified: false', 'operations status must not self-certify webhook replay exercise'],
  ['lib/prototype-operations.ts', 'sanitizedAuditPersistenceVerified: false', 'operations status must not self-certify audit persistence'],
  ['lib/prototype-operations.ts', 'operatorAuditPersistenceVerified: false', 'operations status must not self-certify operator audit persistence'],
  ['lib/prototype-operations.ts', 'persistentReconciliationEvidencePresent: latestReconciliations.length > 0', 'operations snapshot must distinguish stored rows from global verification'],
  ['lib/prototype-operations.ts', "Buffer.byteLength(serialized, 'utf8')", 'webhook payload limits must use UTF-8 byte length'],
  ['lib/prototype-operations.ts', "'WEBHOOK_REPLAY_CONFLICT'", 'reused webhook IDs with different content must fail closed'],
  ['lib/prototype-operations.ts', "'WEBHOOK_REPLAY_STATE_UNKNOWN'", 'unmatched duplicate webhook state must fail closed'],
  ['lib/prototype-operations.ts', 'payload_digest !== payloadDigest', 'webhook replay verification must compare stored payload digest'],
  ['lib/prototype-operations.ts', 'replay.event_type !== eventType', 'webhook replay verification must compare event type'],
  ['lib/prototype-operations.ts', 'Exact duplicate sandbox event ignored.', 'exact duplicate webhook events must be explicitly identified'],
  ['app/prototype/operations/operations-console.tsx', 'Environment configured ≠ persistent controls verified.', 'operations UI must distinguish environment setup from verified controls'],
  ['app/prototype/operations/operations-console.tsx', "hasReconciliationEvidence ? 'Evidence present' : 'Not exercised'", 'operations UI must not call absent reconciliation evidence healthy'],
  ['app/prototype/operations/operations-console.tsx', "? 'Environment configured' : 'Memory demo'", 'operations UI must label Supabase credentials as environment setup rather than persistent proof'],
  ['app/prototype/operations/operations-console.tsx', 'Stored rows do not mean a production provider webhook integration exists', 'operations UI must limit provider-event evidence claims'],
  ['app/prototype/operations/operations-console.tsx', 'green CI do not by themselves prove continuous production operation or readiness', 'operations UI must limit CI/evidence claims'],
  ['scripts/prototype-operations-runtime-check.mjs', 'Prototype operations webhook replay and log-sanitization runtime checks passed.', 'operations webhook behavior must have executable runtime coverage'],
  ['package.json', 'scripts/prototype-operations-runtime-check.mjs', 'operations webhook runtime checks must run in the CI safety suite']
];

const forbidden = [
  ['lib/prototype-operations.ts', 'response.text()', 'operations database failures must not read raw response bodies for logging'],
  ['lib/prototype-operations.ts', 'detail.slice(', 'operations database failures must not log truncated raw provider/database details'],
  ['lib/prototype-operations.ts', 'console.error(\'Prototype operations database request failed\', response.status, detail', 'operations database failures must not log raw response details'],
  ['lib/prototype-operations.ts', 'webhookInboxConfigured: databaseConfigured && webhookConfigured', 'credentials plus a secret must not count as verified webhook persistence'],
  ['lib/prototype-operations.ts', 'if (error instanceof BankingError && error.status === 404) return null', 'configured operations mode must not convert an unknown tenant into empty evidence'],
  ['app/prototype/operations/operations-console.tsx', "latestMismatch ? 'Attention' : 'Healthy'", 'operations UI must not label missing reconciliation evidence healthy'],
  ['app/prototype/operations/operations-console.tsx', "databaseConfigured ? 'Persistent' : 'Memory demo'", 'operations UI must not label database credentials as persistent proof'],
  ['app/prototype/operations/operations-console.tsx', "webhookInboxConfigured ? 'Ready'", 'operations UI must not label a configured secret as verified webhook readiness']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype operations replay-integrity, evidence-truth, UI-language, and database-log sanitization safety checks passed.');
