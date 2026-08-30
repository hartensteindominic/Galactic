import fs from 'node:fs';

const required = [
  ['lib/prototype-readiness.ts', 'readyForLiveBanking: false', 'readiness must never claim the prototype is ready for live banking'],
  ['lib/prototype-readiness.ts', 'productionProviderWebhooksEnabled: false', 'readiness must keep production provider webhooks disabled'],
  ['lib/prototype-readiness.ts', 'doubleEntryAccountingAvailable', 'readiness must expose double-entry accounting availability'],
  ['lib/prototype-ledger.ts', 'persistentTransferIdempotency', 'ledger status must report persistent transfer idempotency'],
  ['supabase/migrations/003_transfer_idempotency.sql', 'Duplicate simulated transfer request safely replayed. No second debit occurred.', 'persistent transfer retry must not double debit'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'Double-entry ledger records are append-only. Post a reversing journal instead.', 'double-entry journals must be append-only'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'create constraint trigger fintech_gl_lines_balanced', 'double-entry journal lines must have a deferred balance constraint'],
  ['supabase/migrations/004_double_entry_ledger.sql', "if v_sum <> 0 then", 'double-entry journal balance must fail closed when nonzero'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'reconcile_fintech_gl_profile', 'GL balances must be reconcilable against simulated account balances'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'Prototype GL reconciliation cannot inspect non-simulated accounts.', 'GL reconciliation must reject non-simulated accounts'],
  ['lib/prototype-operations.ts', 'doubleEntryAvailableInBuild: true', 'operations status must expose double-entry build support'],
  ['lib/prototype-operations.ts', "'/rest/v1/rpc/reconcile_fintech_gl_profile'", 'persistent reconciliation must check the double-entry ledger'],
  ['app/prototype/prototype-network-guard.tsx', "headers.set('Idempotency-Key', crypto.randomUUID())", 'prototype transfer client must attach idempotency keys'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'This route is not a production Plaid or BaaS webhook verifier.', 'sandbox webhook route must disclose that it is not production verification'],
  ['app/prototype/operations/operations-console.tsx', 'Real banking rails remain off.', 'operations console must label real rails as off']
];

const forbidden = [
  ['lib/prototype-readiness.ts', 'readyForLiveBanking: true', 'prototype readiness must not claim live banking readiness'],
  ['lib/prototype-readiness.ts', 'productionProviderWebhooksEnabled: true', 'prototype readiness must not enable production provider webhooks'],
  ['app/prototype/prototype-network-guard.tsx', 'SUPABASE_SECRET_KEY', 'network guard must not contain Supabase secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PLAID_SECRET', 'network guard must not contain Plaid secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'network guard must not contain webhook secrets'],
  ['app/prototype/operations/operations-console.tsx', 'SUPABASE_SECRET_KEY', 'operations UI must not contain Supabase secrets'],
  ['app/prototype/operations/operations-console.tsx', 'PLAID_SECRET', 'operations UI must not contain Plaid secrets'],
  ['app/prototype/operations/operations-console.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'operations UI must not contain webhook secrets']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('White-label prototype safety checks passed.');
