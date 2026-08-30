import fs from 'node:fs';

const required = [
  ['lib/prototype-readiness.ts', 'readyForLiveBanking: false', 'readiness must never claim the prototype is ready for live banking'],
  ['lib/prototype-readiness.ts', 'productionProviderWebhooksEnabled: false', 'readiness must keep production provider webhooks disabled'],
  ['lib/prototype-readiness.ts', 'doubleEntryAccountingAvailable', 'readiness must expose double-entry accounting availability'],
  ['lib/prototype-readiness.ts', 'emergencyMoneyMovementFreezeActive', 'readiness must expose emergency money-movement freeze posture'],
  ['lib/prototype-readiness.ts', 'emergencyFreezeFailsClosedByDefault: true', 'readiness must state the emergency freeze fails closed by default'],
  ['lib/prototype-readiness.ts', 'emergencyFreezeResponseTimeVerified: false', 'readiness must not claim emergency response-time testing before it occurs'],
  ['lib/prototype-readiness.ts', 'disasterRecoveryExerciseVerified: false', 'readiness must not claim disaster-recovery exercise completion before it occurs'],
  ['lib/prototype-readiness.ts', 'migrationRecoveryExerciseVerified: false', 'readiness must not claim ledger-recovery exercise completion before it occurs'],
  ['lib/prototype-ledger.ts', 'persistentTransferIdempotency', 'ledger status must report persistent transfer idempotency'],
  ['supabase/migrations/003_transfer_idempotency.sql', 'Duplicate simulated transfer request safely replayed. No second debit occurred.', 'persistent transfer retry must not double debit'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'Double-entry ledger records are append-only. Post a reversing journal instead.', 'double-entry journals must be append-only'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'create constraint trigger fintech_gl_lines_balanced', 'double-entry journal lines must have a deferred balance constraint'],
  ['supabase/migrations/004_double_entry_ledger.sql', "if v_sum <> 0 then", 'double-entry journal balance must fail closed when nonzero'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'reconcile_fintech_gl_profile', 'GL balances must be reconcilable against simulated account balances'],
  ['supabase/migrations/004_double_entry_ledger.sql', 'Prototype GL reconciliation cannot inspect non-simulated accounts.', 'GL reconciliation must reject non-simulated accounts'],
  ['lib/prototype-operations.ts', 'doubleEntryAvailableInBuild: true', 'operations status must expose double-entry build support'],
  ['lib/prototype-operations.ts', "'/rest/v1/rpc/reconcile_fintech_gl_profile'", 'persistent reconciliation must check the double-entry ledger'],
  ['lib/prototype-operations.ts', 'sanitizedAuditEvidenceAvailable: databaseConfigured', 'operations status must expose sanitized audit evidence readiness'],
  ['lib/prototype-operations.ts', 'select=id,actor_type,action,entity_type,entity_id,created_at', 'audit browser query must select only sanitized fields'],
  ['app/prototype/operations/operations-console.tsx', 'Layer 2 · Double-entry GL → account balance', 'operations UI must expose detailed GL reconciliation'],
  ['app/prototype/operations/operations-console.tsx', 'Raw metadata is deliberately not returned to this UI.', 'operations UI must disclose the audit metadata boundary'],
  ['app/prototype/prototype-network-guard.tsx', "headers.set('Idempotency-Key', crypto.randomUUID())", 'prototype transfer client must attach idempotency keys'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'This route is not a production Plaid or BaaS webhook verifier.', 'sandbox webhook route must disclose that it is not production verification'],
  ['app/prototype/operations/operations-console.tsx', 'Real banking rails remain off.', 'operations console must label real rails as off'],
  ['lib/prototype-transparency.ts', 'liveMoneyEnabled: false', 'transparency model must keep every prototype product live-money disabled'],
  ['lib/prototype-transparency.ts', 'Prototype transparency center.', 'transparency model must disclose that live program terms are not yet approved'],
  ['app/prototype/transparency/page.tsx', 'SIMULATION ONLY', 'transparency UI must display simulation-only status'],
  ['app/prototype/transparency/page.tsx', 'no pretending a partner-dependent feature is already live', 'transparency UI must reject premature live-feature claims'],
  ['lib/banking-provider-contract.ts', 'export interface BankingProviderAdapter', 'provider-neutral banking interface must exist'],
  ['lib/banking-provider-contract.ts', 'productionWebhooks: false', 'disabled provider must not claim production webhook capability'],
  ['lib/banking-provider-contract.ts', "'BANKING_PROVIDER_DISABLED'", 'disabled provider must fail closed'],
  ['lib/banking-provider-contract.ts', 'verifyAndParseWebhook', 'provider contract must require explicit webhook verification/parsing']
];

const forbidden = [
  ['lib/prototype-readiness.ts', 'readyForLiveBanking: true', 'prototype readiness must not claim live banking readiness'],
  ['lib/prototype-readiness.ts', 'productionProviderWebhooksEnabled: true', 'prototype readiness must not enable production provider webhooks'],
  ['lib/prototype-readiness.ts', 'emergencyFreezeResponseTimeVerified: true', 'prototype readiness must not claim emergency response-time verification'],
  ['lib/prototype-readiness.ts', 'disasterRecoveryExerciseVerified: true', 'prototype readiness must not claim disaster-recovery verification'],
  ['lib/prototype-readiness.ts', 'migrationRecoveryExerciseVerified: true', 'prototype readiness must not claim migration-recovery verification'],
  ['app/prototype/prototype-network-guard.tsx', 'SUPABASE_SECRET_KEY', 'network guard must not contain Supabase secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PLAID_SECRET', 'network guard must not contain Plaid secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'network guard must not contain webhook secrets'],
  ['app/prototype/operations/operations-console.tsx', 'SUPABASE_SECRET_KEY', 'operations UI must not contain Supabase secrets'],
  ['app/prototype/operations/operations-console.tsx', 'PLAID_SECRET', 'operations UI must not contain Plaid secrets'],
  ['app/prototype/operations/operations-console.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'operations UI must not contain webhook secrets'],
  ['app/prototype/operations/operations-console.tsx', 'event.metadata', 'operations UI must not render raw audit metadata'],
  ['app/prototype/transparency/page.tsx', 'BANKING_GATEWAY_API_KEY', 'transparency UI must never contain provider credentials'],
  ['app/prototype/transparency/page.tsx', 'PLAID_SECRET', 'transparency UI must never contain Plaid credentials'],
  ['app/prototype/transparency/page.tsx', 'SUPABASE_SECRET_KEY', 'transparency UI must never contain Supabase credentials']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('White-label prototype safety, transparency, audit, provider-contract and operational-readiness checks passed.');
