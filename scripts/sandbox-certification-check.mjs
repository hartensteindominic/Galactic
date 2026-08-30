import fs from 'node:fs';

const certification = fs.readFileSync('lib/sandbox-certification.ts', 'utf8');
const route = fs.readFileSync('app/api/banking/sandbox-certification/route.ts', 'utf8');
const page = fs.readFileSync('app/sandbox-readiness/page.tsx', 'utf8');
const client = fs.readFileSync('app/sandbox-readiness/sandbox-certification-client.tsx', 'utf8');
const adapter = fs.readFileSync('lib/banking-provider-adapter.ts', 'utf8');
const ledger = fs.readFileSync('lib/financial-ledger.ts', 'utf8');
const providerSandbox = fs.readFileSync('lib/provider-sandbox.ts', 'utf8');
const persistence = fs.readFileSync('lib/banking-persistence-contract.ts', 'utf8');

const required = [
  [certification, "banking.mode === 'demo' && !banking.liveWritesEnabled", 'certification must require demo mode with live writes disabled'],
  [certification, 'externalNetworkCallsAllowed: false', 'certification must declare external provider network calls prohibited'],
  [certification, 'providerCredentialsAllowed: false', 'certification must declare provider credentials prohibited'],
  [certification, 'realMoneyAllowed: false', 'certification must declare real money prohibited'],
  [certification, 'createHmac', 'certification must sign and verify its synthetic webhook'],
  [certification, 'timingSafeEqual', 'webhook signature comparison must be timing-safe'],
  [certification, 'processedEventIds.has(event.id)', 'certification must deduplicate provider events'],
  [certification, 'createInboundAchPostedJournal', 'certification must use the shared double-entry journal builder'],
  [certification, 'reconcilePostedAmount', 'certification must use the shared reconciliation rules'],
  [certification, 'reconciliationMatched', 'certification must expose reconciliation evidence'],
  [certification, 'realMoneyMoved: false', 'certification must prove no real money moved'],
  [certification, 'providerCredentialsUsed: false', 'certification must prove no provider credentials were used'],
  [certification, 'externalNetworkCalled: false', 'certification must prove no external banking network was called'],

  [ledger, 'partner_settlement_cash', 'shared ledger must include settlement cash accounting'],
  [ledger, 'customer_deposit_liability', 'shared ledger must include customer deposit liability accounting'],
  [ledger, 'hasDebit === hasCredit', 'shared ledger must reject lines that are both debit/credit or neither'],
  [ledger, 'debitsCents === creditsCents', 'shared ledger must enforce balanced journal totals'],
  [ledger, "throw new BankingError(500, 'LEDGER_OUT_OF_BALANCE'", 'shared ledger must fail closed when a journal is out of balance'],
  [ledger, 'discrepancyCents', 'shared reconciliation must calculate discrepancies'],
  [ledger, 'input.eventCount === 1', 'shared reconciliation must require a single canonical processed event'],

  [route, 'requireJsonRequest', 'certification POST must require JSON'],
  [route, 'requireTrustedOrigin', 'certification POST must reject untrusted browser origins'],
  [route, 'requireBankingUser', 'certification POST must enforce the banking user boundary'],

  [adapter, 'BankingProviderAdapter', 'provider-neutral adapter boundary must exist'],
  [adapter, 'signedWebhooks', 'provider adapter capabilities must include signed webhooks'],
  [adapter, 'idempotency', 'provider adapter capabilities must include idempotency'],
  [adapter, 'reconciliationData', 'provider adapter capabilities must include reconciliation data'],

  [providerSandbox, 'BANKING_SANDBOX_PROVIDER_ENABLED', 'provider sandbox must use a dedicated sandbox-only enable gate'],
  [providerSandbox, 'sandbox.gatewayBaseUrl !== production.gatewayBaseUrl', 'sandbox gateway must be compared against production'],
  [providerSandbox, 'sandbox.apiKey !== production.apiKey', 'sandbox API key must be compared against production'],
  [providerSandbox, 'sandbox.programId !== production.programId', 'sandbox program ID must be compared against production'],
  [providerSandbox, 'credentialsIsolated = configured', 'sandbox isolation may only be true for a configured sandbox'],
  [providerSandbox, "throw new BankingError(503, 'SANDBOX_PROVIDER_NOT_ISOLATED'", 'future provider network calls must fail closed if sandbox credentials overlap production'],
  [providerSandbox, "throw new BankingError(409, 'SANDBOX_BLOCKED_BY_PRODUCTION'", 'provider sandbox networking must be blocked when production live writes are enabled'],

  [persistence, 'putEventIfAbsent', 'durable store must require atomic provider-event dedupe'],
  [persistence, 'appendJournalIfAbsent', 'durable store must require append-once ledger journals'],
  [persistence, 'saveReconciliation', 'durable store must persist reconciliation evidence'],
  [persistence, 'appendAuditEvent', 'durable store must persist banking audit events'],
  [persistence, 'transactional_processing', 'durability requirements must include transactional processing'],
  [persistence, 'backup_and_recovery_plan', 'durability requirements must include backup/recovery planning'],

  [page, 'Prove the banking loop before connecting a bank.', 'review page must explain the pre-provider certification purpose'],
  [page, 'Hard isolation from production', 'review page must state production isolation'],
  [page, 'Credentials isolated from production', 'review page must expose sandbox credential-isolation status'],
  [page, 'Production live writes remain off', 'review page must expose production/live isolation status'],
  [client, 'No real money moved', 'review UI must display zero-money evidence'],
  [client, 'Duplicate webhook rejected', 'review UI must display dedupe evidence'],
  [client, 'Reconciliation matched', 'review UI must display reconciliation evidence']
];

const forbidden = [
  [certification, 'fetch(', 'synthetic certification engine must never make an external network call'],
  [certification, 'process.env', 'synthetic certification engine must never read provider/environment secrets'],
  [certification, 'BANKING_GATEWAY_API_KEY', 'synthetic certification must never read banking provider credentials'],
  [certification, 'CRYPTO_GATEWAY_API_KEY', 'synthetic certification must never read crypto provider credentials'],
  [certification, 'PRIVATE_KEY', 'synthetic certification must never read private keys'],
  [ledger, 'fetch(', 'shared ledger domain must not call external networks'],
  [ledger, 'process.env', 'shared ledger domain must not read environment secrets'],
  [persistence, 'new Map(', 'durable persistence contract must not provide an in-memory production implementation'],
  [persistence, 'new Set(', 'durable persistence contract must not provide an in-memory production implementation'],
  [client, 'BANKING_GATEWAY_API_KEY', 'client certification UI must never expose banking credentials'],
  [client, 'BANKING_AUTH_GATEWAY_SECRET', 'client certification UI must never expose banking auth secrets'],
  [client, 'BANKING_SANDBOX_API_KEY', 'client certification UI must never expose provider sandbox credentials'],
  [page, 'BANKING_SANDBOX_API_KEY', 'server-rendered status page must never print provider sandbox API-key names/values to users']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Sandbox certification safety regression: ${label}`);
}

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Sandbox certification safety regression: ${label}`);
}

console.log('Galactic Trust zero-money sandbox, provider isolation, ledger, reconciliation and durability safety checks passed.');
