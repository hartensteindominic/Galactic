import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const migration = read('db/migrations/004_operator_request_replay_protection.sql');
const replay = read('lib/sandbox-operator-replay.ts');
const auth = read('lib/sandbox-operator-auth.ts');
const cli = read('scripts/provider-sandbox-operator.mjs');

const operatorRoutes = [
  'app/api/banking/provider-sandbox/certification/route.ts',
  'app/api/banking/provider-sandbox/recovery/route.ts',
  'app/api/banking/provider-sandbox/operations/route.ts',
  'app/api/banking/provider-sandbox/reconciliations/route.ts',
  'app/api/banking/provider-sandbox/reconciliations/resolve/route.ts',
  'app/api/banking/provider-sandbox/events/requeue/route.ts',
  'app/api/banking/provider-sandbox/reconcile-account/route.ts',
  'app/api/banking/provider-sandbox/reconcile-all-accounts/route.ts'
];

const required = [
  [migration, 'request_id text PRIMARY KEY', 'operator request IDs must be unique at the database layer'],
  [migration, 'request_hash_sha256 text NOT NULL', 'anti-replay records must retain only a request-body hash'],
  [migration, 'signature_timestamp_ms bigint NOT NULL', 'anti-replay records must bind to the signed timestamp'],
  [migration, 'expires_at timestamptz NOT NULL', 'anti-replay records must have an explicit retention boundary'],
  [migration, 'must never store the', 'migration must document secret/signature/raw-body exclusion'],

  [replay, 'REQUEST_RETENTION_MS = 24 * 60 * 60_000', 'consumed request IDs must remain durable beyond the five-minute signature window'],
  [replay, 'ON CONFLICT (request_id) DO NOTHING', 'replay protection must atomically reject reused request IDs'],
  [replay, 'SANDBOX_OPERATOR_REQUEST_REPLAYED', 'reused operator request IDs must fail closed'],
  [replay, 'providerSandboxDatabaseStatus', 'operator replay protection must require durable sandbox storage'],
  [replay, "'provider_sandbox'", 'operator replay records must be scoped to the provider sandbox environment'],

  [auth, "request.headers.get('x-galactic-sandbox-operator-request-id')", 'operator verifier must require a one-time request ID header'],
  [auth, '`${operatorId}.${requestId}.${timestamp}.${request.method.toUpperCase()}.${url.pathname}.${bodyHash}`', 'operator HMAC must bind the request ID, timestamp, method, path and body hash'],
  [auth, 'consumeSandboxOperatorRequest', 'verified operator requests must consume their request ID durably'],
  [auth, 'allowed.has(operatorId)', 'operator replay consumption must remain behind the allowlist check'],

  [cli, 'randomUUID()', 'operator CLI must generate a fresh request ID for each invocation'],
  [cli, "'x-galactic-sandbox-operator-request-id': requestId", 'operator CLI must send the one-time request ID header'],
  [cli, '`${operatorId}.${requestId}.${timestamp}.POST.${definition.path}.${bodyHash}`', 'operator CLI signature must bind the same one-time request ID'],
  [cli, 'requestId,', 'operator CLI may return the non-secret request ID as operational evidence']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Operator replay regression: ${label}`);
}

const authVerifyPosition = auth.indexOf('if (!safeHexEqual(normalized, expected))');
const allowlistPosition = auth.indexOf('if (!allowed.has(operatorId))');
const consumePosition = auth.indexOf('await consumeSandboxOperatorRequest');
if (!(authVerifyPosition >= 0 && allowlistPosition > authVerifyPosition && consumePosition > allowlistPosition)) {
  throw new Error('Operator replay regression: request ID must be consumed only after signature verification and operator allowlist authorization');
}

for (const routePath of operatorRoutes) {
  const route = read(routePath);
  if (!route.includes('await requireSandboxOperator(request, rawBody)')) {
    throw new Error(`Operator replay regression: ${routePath} must await durable operator replay protection`);
  }
}

const forbidden = [
  [migration, 'operator_signing_secret', 'operator replay table must never store the signing secret'],
  [migration, 'hmac_signature text', 'operator replay table must never store HMAC signatures'],
  [migration, 'raw_body text', 'operator replay table must never store raw admin request bodies'],
  [replay, 'BANKING_SANDBOX_OPERATOR_SECRET', 'replay persistence must not read or store the operator signing secret'],
  [replay, 'x-galactic-sandbox-operator-signature', 'replay persistence must not store request signatures'],
  [cli, 'console.log(operatorSecret', 'operator CLI must never print the signing secret'],
  [cli, 'console.error(operatorSecret', 'operator CLI must never print the signing secret']
];

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Operator replay regression: ${label}`);
}

console.log('Galactic Trust durable one-time operator request replay protection checks passed.');
