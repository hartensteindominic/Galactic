import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const schema = read('db/migrations/001_banking_core.sql');
const integrity = read('db/migrations/002_banking_ledger_integrity.sql');
const claims = read('db/migrations/003_banking_event_claims.sql');
const store = read('lib/postgres-banking-store.ts');
const database = read('lib/banking-sandbox-database.ts');
const migrationRunner = read('scripts/run-banking-sandbox-migrations.mjs');
const adapterContract = read('lib/banking-provider-adapter.ts');
const gatewayAdapter = read('lib/gateway-banking-sandbox-adapter.ts');
const webhookRoute = read('app/api/banking/provider-sandbox/webhook/route.ts');
const operatorAuth = read('lib/sandbox-operator-auth.ts');
const operatorRoute = read('app/api/banking/provider-sandbox/certification/route.ts');
const recoveryRoute = read('app/api/banking/provider-sandbox/recovery/route.ts');
const operationsRoute = read('app/api/banking/provider-sandbox/operations/route.ts');
const reconciliationListRoute = read('app/api/banking/provider-sandbox/reconciliations/route.ts');
const reconciliationResolveRoute = read('app/api/banking/provider-sandbox/reconciliations/resolve/route.ts');
const certificationRunner = read('lib/provider-sandbox-certification-runner.ts');
const recovery = read('lib/provider-sandbox-recovery.ts');
const operations = read('lib/provider-sandbox-operations.ts');
const processor = read('lib/provider-sandbox-event-processor.ts');
const ledger = read('lib/financial-ledger.ts');
const readinessPage = read('app/sandbox-readiness/page.tsx');
const envExample = read('.env.example');

const required = [
  [schema, 'UNIQUE (provider, environment, raw_provider_event_id)', 'provider event dedupe must be database-enforced'],
  [schema, 'event_id text NOT NULL UNIQUE', 'one journal per canonical event must be database-enforced'],
  [schema, "'ach_return_receivable'", 'schema must support the full ledger account vocabulary'],
  [schema, '(debit_cents > 0 AND credit_cents = 0)', 'ledger lines must contain exactly one debit or credit side'],
  [integrity, 'DEFERRABLE INITIALLY DEFERRED', 'journal balance must be checked at transaction commit'],
  [integrity, 'galactic_assert_banking_journal_balanced', 'database must independently validate balanced journals'],
  [integrity, 'banking_ledger_journals_append_only', 'posted journals must be append-only'],
  [integrity, 'banking_ledger_lines_append_only', 'posted journal lines must be append-only'],
  [integrity, 'banking_audit_events_append_only', 'audit history must be append-only'],
  [claims, "'processing'", 'event lifecycle must include an explicit processing state'],
  [claims, 'processing_token text', 'processing leases must have ownership tokens'],
  [claims, 'processing_started_at timestamptz', 'processing leases must have timestamps'],
  [claims, 'attempt_count integer NOT NULL DEFAULT 0', 'provider events must persist attempt counts'],
  [claims, 'next_attempt_at timestamptz', 'failed events must persist retry scheduling'],
  [claims, 'banking_provider_events_processing_lease_check', 'database must enforce processing lease consistency'],

  [store, 'ON CONFLICT (provider, environment, raw_provider_event_id) DO NOTHING', 'Postgres store must atomically dedupe provider events'],
  [store, "canonical_event ->> 'resourceId'", 'Postgres store must find prior processed events by provider resource'],
  [store, 'PROVIDER_EVENT_CONFLICT', 'same provider event ID with different data must fail closed'],
  [store, 'LEDGER_EVENT_CONFLICT', 'same event with different journal must fail closed'],
  [store, 'claimEventForProcessing', 'known events must require an atomic processing claim'],
  [store, 'claimNextRecoverableEvent', 'recovery workers must atomically claim recoverable events'],
  [store, 'FOR UPDATE SKIP LOCKED', 'concurrent recovery workers must skip already locked events'],
  [store, 'attempt_count < $5', 'event claiming must enforce bounded attempts in SQL'],
  [store, 'processing_started_at <= $4::timestamptz', 'stale processing leases must be reclaimable'],
  [store, "status = 'processing' AND processing_token = $2", 'completion/failure must require lease ownership'],
  [store, 'EVENT_PROCESSING_LEASE_LOST', 'lost lease ownership must fail closed'],
  [store, "await client.query('BEGIN')", 'store transaction must begin explicitly'],
  [store, "await client.query('COMMIT')", 'store transaction must commit explicitly'],
  [store, "await client.query('ROLLBACK')", 'store transaction must rollback failures'],

  [database, "process.env.BANKING_SANDBOX_DATABASE_ENABLED === 'true'", 'sandbox database must have a dedicated enable gate'],
  [database, "sslEnabled = process.env.BANKING_SANDBOX_DATABASE_SSL !== 'false'", 'sandbox database encryption must default on'],
  [database, 'rejectUnauthorized: true', 'Postgres TLS must validate certificates by default'],
  [database, 'production_live_writes_enabled', 'sandbox database must remain blocked by production live writes'],
  [database, 'connectionStringExposed: false', 'database status must never expose connection strings'],

  [migrationRunner, 'BANKING_SANDBOX_DATABASE_ENABLED must be true', 'migration runner must require explicit database enablement'],
  [migrationRunner, 'production banking live-write flag is enabled', 'migration runner must refuse when production live writes are requested'],
  [migrationRunner, "createHash('sha256')", 'migration history must be checksum protected'],
  [migrationRunner, 'Migration checksum changed after application', 'changed applied migrations must fail closed'],
  [migrationRunner, "await client.query('ROLLBACK')", 'migration failures must rollback'],

  [adapterContract, 'idempotencyKey: string', 'provider write contract must require idempotency keys'],
  [adapterContract, 'startKyc', 'provider adapter must expose an explicit sandbox KYC operation'],
  [gatewayAdapter, 'Idempotency-Key', 'gateway adapter must send idempotency keys'],
  [gatewayAdapter, "createHmac('sha256'", 'gateway webhook must use HMAC SHA-256'],
  [gatewayAdapter, '5 * 60_000', 'gateway webhook signature must have a bounded replay window'],
  [gatewayAdapter, 'timingSafeEqual', 'gateway webhook signature comparison must be timing safe'],
  [gatewayAdapter, "update(`${envelope.timestamp}.${envelope.rawBody}`)", 'gateway webhook must sign timestamp plus exact raw body'],

  [webhookRoute, 'MAX_WEBHOOK_BYTES', 'webhook endpoint must enforce a body-size limit'],
  [webhookRoute, 'WEBHOOK_SIGNATURE_REQUIRED', 'webhook endpoint must require signature headers'],
  [webhookRoute, 'adapter.verifyWebhook', 'webhook endpoint must verify the provider signature'],
  [webhookRoute, 'captureAndProcessProviderSandboxEvent', 'verified webhook must enter the durable processor'],
  [webhookRoute, 'getProviderSandboxBankingStore', 'webhook processing must use durable sandbox storage'],

  [operatorAuth, 'secret.length >= 32', 'operator signing secret must have a minimum strength gate'],
  [operatorAuth, "createHash('sha256').update(rawBody)", 'operator auth must bind the signature to request body'],
  [operatorAuth, 'request.method.toUpperCase()', 'operator auth must bind the signature to HTTP method'],
  [operatorAuth, 'url.pathname', 'operator auth must bind the signature to request path'],
  [operatorAuth, '5 * 60_000', 'operator signatures must expire'],
  [operatorRoute, 'requireSandboxOperator', 'provider certification route must require operator HMAC auth'],
  [operatorRoute, 'CERTIFICATION_PARAMETERS_NOT_ALLOWED', 'provider certification scenario must not accept custom parameters'],
  [recoveryRoute, 'requireSandboxOperator', 'recovery endpoint must require operator HMAC auth'],
  [recoveryRoute, 'RECOVERY_PARAMETERS_NOT_ALLOWED', 'recovery endpoint must use a fixed bounded scenario'],
  [operationsRoute, 'requireSandboxOperator', 'operations snapshot must require operator HMAC auth'],
  [operationsRoute, 'OPERATIONS_PARAMETERS_NOT_ALLOWED', 'operations snapshot must reject custom parameters'],
  [reconciliationListRoute, 'requireSandboxOperator', 'open reconciliation listing must require operator HMAC auth'],
  [reconciliationResolveRoute, 'requireSandboxOperator', 'reconciliation resolution must require operator HMAC auth'],
  [reconciliationResolveRoute, 'INVALID_REQUEST_FIELDS', 'reconciliation resolution must reject extra request fields'],

  [certificationRunner, 'const amountCents = 2500', 'provider certification amount must remain a fixed $25 sandbox amount'],
  [certificationRunner, "sandboxScenario: 'approve'", 'provider certification KYC scenario must remain fixed'],
  [certificationRunner, 'putProviderResourceLink', 'provider resources must be durably mapped'],
  [certificationRunner, 'realMoneyMoved: false', 'provider certification must explicitly state no real money moved'],

  [processor, 'PROVIDER_EVENT_MAX_ATTEMPTS = 5', 'event processing retries must have a hard maximum'],
  [processor, 'PROVIDER_EVENT_LEASE_MS = 2 * 60_000', 'event processing leases must have a finite stale threshold'],
  [processor, 'claimEventForProcessing', 'webhook processing must claim a lease before handling an event'],
  [processor, 'processingToken: record.processingToken', 'event completion/failure must pass its lease token'],
  [processor, 'retryAtForAttempt', 'processing failures must schedule bounded retry backoff'],
  [processor, 'ACH_RETURN_WITHOUT_POSTED_EVENT', 'ACH returns must require a prior posted event'],
  [processor, 'ACH_RETURN_AMOUNT_MISMATCH', 'ACH return amount must match the prior posted event'],
  [processor, 'createInboundAchReturnedJournal', 'ACH returns must post a compensating journal'],
  [processor, 'markEventFailed', 'processing failures must enter a recoverable failed state'],
  [processor, 'store.transaction', 'event processing must use durable transactions'],

  [recovery, 'RECOVERY_BATCH_LIMIT = 10', 'recovery batch size must be fixed and bounded'],
  [recovery, 'claimNextRecoverableEvent', 'recovery worker must use atomic claim selection'],
  [recovery, 'processClaimedProviderSandboxEvent', 'recovery worker must use the same leased processing path'],

  [operations, "status = 'processing' AND processing_started_at <= $2::timestamptz", 'operations snapshot must expose stale processing leases'],
  [operations, 'terminal_failed', 'operations snapshot must expose terminal failures separately'],
  [operations, 'open_discrepancies', 'operations snapshot must expose unresolved reconciliation count'],
  [operations, 'LIMIT 25', 'open reconciliation listing must have a hard result limit'],
  [operations, 'resolutionNoteLength', 'reconciliation resolution audit must avoid copying the resolution note into audit metadata'],
  [operations, 'resolveReconciliation', 'reconciliation resolution must use the dedicated persistence operation'],
  [operations, 'appendAuditEvent', 'reconciliation resolution must append audit evidence'],

  [ledger, 'Customer deposit liability decrease for returned inbound ACH', 'return journal must reverse the customer liability'],
  [ledger, 'Settlement cash asset decrease for returned inbound ACH', 'return journal must reverse settlement cash'],

  [readinessPage, 'Operator signing configured', 'reviewer UI must expose safe operator-auth readiness'],
  [readinessPage, 'Durable store available', 'reviewer UI must expose safe durable-store readiness'],
  [envExample, 'BANKING_SANDBOX_OPERATOR_SECRET', 'environment template must document operator signing configuration'],
  [envExample, 'BANKING_SANDBOX_DATABASE_ENABLED=false', 'environment template must default sandbox database access off']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Durable banking regression: ${label}`);
}

const idempotencyHeaderCount = (gatewayAdapter.match(/Idempotency-Key/g) || []).length;
if (idempotencyHeaderCount < 4) {
  throw new Error('Durable banking regression: all four provider sandbox write operations must send idempotency keys');
}

const postHandlerPosition = webhookRoute.indexOf('export async function POST');
const verifyPosition = webhookRoute.indexOf('const verified = await adapter.verifyWebhook', postHandlerPosition);
const normalizePosition = webhookRoute.indexOf('const canonicalEvent = await adapter.normalizeWebhook', postHandlerPosition);
const processPosition = webhookRoute.indexOf('const result = await captureAndProcessProviderSandboxEvent', postHandlerPosition);
if (!(postHandlerPosition >= 0 && verifyPosition > postHandlerPosition && normalizePosition > verifyPosition && processPosition > normalizePosition)) {
  throw new Error('Durable banking regression: webhook must verify signature before normalization and processing');
}

const forbidden = [
  [schema, 'DROP TABLE', 'core migration must not drop banking tables'],
  [schema, 'TRUNCATE', 'core migration must not truncate banking data'],
  [schema, 'ON DELETE CASCADE', 'ledger data must not cascade-delete'],
  [integrity, 'DISABLE TRIGGER', 'integrity migration must not disable ledger guards'],
  [claims, 'DISABLE TRIGGER', 'claim migration must not disable database guards'],
  [migrationRunner, 'console.log(databaseUrl', 'migration runner must never print the database URL'],
  [operatorRoute, 'requireBankingUser', 'provider sandbox certification must not rely on public demo-user auth'],
  [recoveryRoute, 'requireBankingUser', 'provider sandbox recovery must not rely on public demo-user auth'],
  [operationsRoute, 'requireBankingUser', 'provider sandbox operations must not rely on public demo-user auth'],
  [reconciliationListRoute, 'requireBankingUser', 'reconciliation listing must not rely on public demo-user auth'],
  [reconciliationResolveRoute, 'requireBankingUser', 'reconciliation resolution must not rely on public demo-user auth'],
  [reconciliationResolveRoute, 'appendJournal', 'reconciliation resolution must never change ledger journals'],
  [operations, 'SELECT canonical_event', 'operations endpoints must not expose canonical provider event payloads'],
  [webhookRoute, 'requireBankingUser', 'server-to-server webhook must use provider signatures, not customer auth'],
  [readinessPage, 'BANKING_SANDBOX_API_KEY', 'reviewer page must never render sandbox API-key identifiers or values'],
  [readinessPage, 'BANKING_SANDBOX_DATABASE_URL', 'reviewer page must never render sandbox database URLs'],
  [readinessPage, 'BANKING_SANDBOX_OPERATOR_SECRET', 'reviewer page must never render operator secret identifiers or values']
];

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Durable banking regression: ${label}`);
}

console.log('Galactic Trust durable banking SQL, leases, recovery, operational visibility, reconciliation controls, operator auth, webhook and return accounting checks passed.');
