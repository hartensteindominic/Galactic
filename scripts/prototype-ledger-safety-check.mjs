import fs from 'node:fs';

const required = [
  ['lib/prototype-ledger.ts', 'databaseCredentialsConfigured: config.configured', 'ledger status must distinguish database credentials from verified schema'],
  ['lib/prototype-ledger.ts', 'persistentSchemaVerified: false', 'ledger status must not self-verify persistent schema'],
  ['lib/prototype-ledger.ts', 'targetMigrationHistoryVerified: false', 'ledger status must not self-verify target migration history'],
  ['lib/prototype-ledger.ts', 'persistentTransferIdempotencyAvailableInMigration: true', 'ledger status must expose idempotency implementation availability'],
  ['lib/prototype-ledger.ts', 'persistentTransferIdempotency: false', 'ledger status must keep persistent idempotency unverified until exercised'],
  ['lib/prototype-ledger.ts', 'persistentRuntimeExerciseVerified: false', 'ledger status must keep persistent runtime exercise unverified'],
  ['lib/prototype-ledger.ts', "'UNKNOWN_TENANT'", 'configured persistent ledger must reject unknown tenant'],
  ['lib/prototype-ledger.ts', "'UNKNOWN_PROTOTYPE_USER'", 'configured persistent ledger must reject unknown user'],
  ['lib/prototype-ledger.ts', "'NON_SIMULATED_ACCOUNT_REJECTED'", 'prototype ledger must reject non-simulated accounts'],
  ['lib/prototype-ledger.ts', "'TRANSACTION_ACCOUNT_BOUNDARY_REJECTED'", 'prototype ledger must reject transactions outside returned simulated account boundary'],
  ['lib/prototype-ledger.ts', 'responseBodyLogged: false', 'ledger database failures must explicitly avoid raw response-body logging'],
  ['scripts/prototype-ledger-runtime-check.mjs', 'Prototype ledger persistent fail-closed and log-sanitization runtime checks passed.', 'ledger fail-closed behavior must have runtime coverage'],
  ['package.json', 'scripts/prototype-ledger-runtime-check.mjs', 'ledger runtime checks must run in the CI safety suite']
];

const forbidden = [
  ['lib/prototype-ledger.ts', 'if (!tenant) return demoSnapshot', 'configured persistent mode must never replace an unknown tenant with memory demo data'],
  ['lib/prototype-ledger.ts', 'if (!profile) return demoSnapshot', 'configured persistent mode must never replace an unknown user with memory demo data'],
  ['lib/prototype-ledger.ts', '.filter((row) => row.simulated).map<PrototypeAccount>', 'configured persistent mode must reject rather than silently filter non-simulated accounts'],
  ['lib/prototype-ledger.ts', 'response.text()', 'ledger database failures must not read raw response bodies for logging'],
  ['lib/prototype-ledger.ts', 'detail.slice(', 'ledger database failures must not log truncated raw response details'],
  ['lib/prototype-ledger.ts', 'persistentTransferIdempotency: config.configured', 'database credentials alone must not count as verified persistent idempotency']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype ledger persistent-mode truth, isolation, and log-sanitization safety checks passed.');
