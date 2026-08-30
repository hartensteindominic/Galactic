import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const auth = read('lib/sandbox-operator-auth.ts');
const store = read('lib/postgres-banking-store.ts');
const operations = read('lib/provider-sandbox-operations.ts');
const adapter = read('lib/banking-provider-adapter.ts');
const gatewayAdapter = read('lib/gateway-banking-sandbox-adapter.ts');
const requeueRoute = read('app/api/banking/provider-sandbox/events/requeue/route.ts');
const accountReconcileRoute = read('app/api/banking/provider-sandbox/reconcile-account/route.ts');
const reconciliationRoute = read('app/api/banking/provider-sandbox/reconciliations/resolve/route.ts');
const environmentChecklist = read('docs/sponsor-bank/SANDBOX-ENVIRONMENT-CHECKLIST.md');

const required = [
  [auth, 'BANKING_SANDBOX_OPERATOR_IDS', 'operator authentication must require an explicit server-side ID allowlist'],
  [auth, 'secretConfigured && allowlistConfigured', 'operator auth readiness must require both secret and allowlist'],
  [auth, 'allowed.has(operatorId)', 'signed operators must also be present in the allowlist'],
  [auth, 'SANDBOX_OPERATOR_NOT_ALLOWED', 'non-allowlisted signed operators must fail closed'],
  [auth, 'operatorIdsExposed: false', 'operator status must not expose allowlist identities'],

  [store, 'requeueTerminalEvent', 'Postgres store must implement explicit terminal-event requeue'],
  [store, "status = 'failed'", 'terminal-event requeue must require failed state'],
  [store, 'attempt_count >= $3', 'terminal-event requeue must require exhausted automatic attempts'],
  [store, 'attempt_count = 0', 'manual requeue must start a new bounded retry cycle'],

  [operations, 'EVENT_NOT_TERMINAL', 'manual requeue must reject non-terminal events'],
  [operations, 'EVENT_REQUEUE_REASON_INVALID', 'manual requeue must require a bounded justification'],
  [operations, 'terminal_provider_event_requeued', 'manual requeue must append audit evidence'],
  [operations, 'previousAttemptCount', 'manual requeue audit must record the prior attempt count'],
  [operations, 'previousFailureCode', 'manual requeue audit must record the prior failure code'],
  [operations, 'resolveReconciliation', 'reconciliation resolution must use the dedicated metadata operation'],
  [operations, 'reconciliation_resolved', 'reconciliation resolution must append audit evidence'],

  [adapter, 'getAccountBalance(accountId: string)', 'provider adapter must expose account-balance reconciliation data'],
  [gatewayAdapter, '/balance', 'private gateway adapter must retrieve provider sandbox account balance'],
  [operations, 'getInternalAccountLedgerBalance', 'account reconciliation must reconstruct the internal ledger balance'],
  [operations, "events.status = 'processed'", 'account reconciliation must use processed provider events only'],
  [operations, "lines.account = 'customer_deposit_liability'", 'account reconciliation must use customer-liability ledger lines'],
  [operations, 'getProviderResourceLink', 'account reconciliation must resolve the provider account through durable mapping'],
  [operations, 'adapter.getAccountBalance', 'account reconciliation must retrieve the provider-side balance'],
  [operations, "scope: 'account_balance'", 'account reconciliation must persist an account-balance reconciliation record'],
  [operations, 'sandbox_account_balance_reconciled', 'account reconciliation must append audit evidence'],
  [operations, 'discrepancyCents', 'account reconciliation must explicitly calculate discrepancy cents'],

  [requeueRoute, 'requireSandboxOperator', 'terminal-event requeue endpoint must require signed operator auth'],
  [requeueRoute, 'INVALID_REQUEST_FIELDS', 'terminal-event requeue endpoint must reject extra fields'],
  [accountReconcileRoute, 'requireSandboxOperator', 'account reconciliation endpoint must require signed operator auth'],
  [accountReconcileRoute, "keys.length !== 1 || keys[0] !== 'accountResourceId'", 'account reconciliation endpoint must accept only accountResourceId'],
  [reconciliationRoute, 'requireSandboxOperator', 'reconciliation resolution endpoint must require signed operator auth'],
  [reconciliationRoute, 'INVALID_REQUEST_FIELDS', 'reconciliation resolution endpoint must reject extra fields'],

  [environmentChecklist, 'BANKING_SANDBOX_OPERATOR_IDS', 'sandbox environment checklist must document operator allowlist configuration'],
  [environmentChecklist, 'Do not use a customer/demo identity as a sandbox operator.', 'sandbox docs must separate customer and operator identities'],
  [environmentChecklist, 'processed', 'sandbox docs must require processed events for account reconciliation'],
  [environmentChecklist, 'never edit posted journal lines to force a match', 'sandbox docs must prohibit ledger edits to resolve reconciliation']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Operator-control regression: ${label}`);
}

const forbidden = [
  [requeueRoute, 'requireBankingUser', 'terminal requeue must not use public demo customer authentication'],
  [requeueRoute, 'appendJournal', 'terminal requeue endpoint must never edit ledger journals'],
  [accountReconcileRoute, 'requireBankingUser', 'account reconciliation must not use public demo customer authentication'],
  [accountReconcileRoute, 'appendJournal', 'account reconciliation endpoint must never edit ledger journals'],
  [accountReconcileRoute, 'amountCents', 'account reconciliation endpoint must not accept a caller-supplied balance amount'],
  [reconciliationRoute, 'requireBankingUser', 'reconciliation resolution must not use public demo customer authentication'],
  [reconciliationRoute, 'appendJournal', 'reconciliation resolution must never edit ledger journals'],
  [auth, 'console.log(secret', 'operator signing secret must never be logged'],
  [auth, 'operatorIds: [', 'operator status must not return allowlist identities']
];

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Operator-control regression: ${label}`);
}

console.log('Galactic Trust operator allowlist, terminal-event recovery, account reconciliation, and audited discrepancy controls passed.');
