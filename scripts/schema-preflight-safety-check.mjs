import fs from 'node:fs';

const required = [
  ['lib/prototype-schema-preflight.ts', 'readOnly: true', 'schema preflight must remain read-only'],
  ['lib/prototype-schema-preflight.ts', 'expectedResourceCount: EXPECTED_SCHEMA_RESOURCES.length', 'schema preflight must expose expected resource count'],
  ['lib/prototype-schema-preflight.ts', 'usesPostgrestOpenApiObservation: true', 'schema preflight must use PostgREST schema observation'],
  ['lib/prototype-schema-preflight.ts', 'invokesFinancialRpcs: false', 'schema preflight must not invoke financial RPCs'],
  ['lib/prototype-schema-preflight.ts', 'mutatesDatabase: false', 'schema preflight must not mutate database'],
  ['lib/prototype-schema-preflight.ts', "method: 'GET'", 'schema preflight network request must remain GET-only'],
  ['lib/prototype-schema-preflight.ts', "Accept: 'application/openapi+json'", 'schema preflight must request OpenAPI description'],
  ['lib/prototype-schema-preflight.ts', 'responseBodyLogged: false', 'schema preflight errors must not log raw database response body'],
  ['lib/prototype-schema-preflight.ts', 'targetMigrationHistoryVerified: false', 'schema preflight must not verify migration history'],
  ['lib/prototype-schema-preflight.ts', 'migrationsExecutedVerified: false', 'schema preflight must not self-verify migration execution'],
  ['lib/prototype-schema-preflight.ts', 'dataCorrectnessVerified: false', 'schema preflight must not self-verify data correctness'],
  ['lib/prototype-schema-preflight.ts', 'reconciliationExerciseVerified: false', 'schema preflight must not self-verify reconciliation exercise'],
  ['lib/prototype-schema-preflight.ts', 'transferIdempotencyExerciseVerified: false', 'schema preflight must not self-verify idempotency exercise'],
  ['lib/prototype-schema-preflight.ts', 'restoreExerciseVerified: false', 'schema preflight must not self-verify restore exercise'],
  ['lib/prototype-schema-preflight.ts', 'productionApprovalVerified: false', 'schema preflight must not self-approve production'],
  ['app/api/prototype/schema-preflight/route.ts', 'requirePrototypeOperator(request)', 'schema preflight route must require operator access'],
  ['app/api/prototype/schema-preflight/route.ts', 'resolveRequestBrand', 'schema preflight route must remain tenant host-bound'],
  ['app/api/prototype/schema-preflight/route.ts', 'runPrototypeSchemaPreflight()', 'schema preflight route must use centralized read-only preflight'],
  ['app/api/prototype/schema-preflight/route.ts', 'Observed table/RPC paths do not prove migration execution/order, data correctness, recovery', 'schema preflight API must limit capability-evidence claims'],
  ['app/api/prototype/status/route.ts', 'schemaPreflight: prototypeSchemaPreflightControlStatus()', 'general prototype status must expose only schema preflight control posture'],
  ['app/api/prototype/status/route.ts', 'read-only schema capability observation do not prove Supabase migration execution/order, data correctness, recovery, or production approval', 'general prototype status must limit schema observation claims'],
  ['app/prototype/operations/operations-console.tsx', 'Run read-only preflight', 'Operations UI must require an explicit operator action for schema observation'],
  ['app/prototype/operations/operations-console.tsx', '16 expected table/RPC paths from migrations 001–005', 'Operations UI must explain the exact schema capability scope'],
  ['app/prototype/operations/operations-console.tsx', 'Capability evidence only.', 'Operations UI must label schema results as capability evidence'],
  ['app/prototype/operations/operations-console.tsx', 'Even 16/16 observed does not mean migrations were executed in order', 'Operations UI must not turn complete capability observation into migration verification'],
  ['app/prototype/operations/operations-console.tsx', 'Not run in this browser session.', 'Operations UI must show that preflight is not auto-exercised'],
  ['scripts/schema-preflight-runtime-check.mjs', 'Prototype schema preflight read-only capability-observation runtime checks passed.', 'schema preflight must have executable runtime coverage'],
  ['package.json', 'scripts/schema-preflight-runtime-check.mjs', 'schema preflight runtime coverage must run in CI']
];

const forbidden = [
  ['lib/prototype-schema-preflight.ts', "method: 'POST'", 'schema preflight must never invoke POST'],
  ['lib/prototype-schema-preflight.ts', '/rest/v1/rpc/', 'schema preflight must not directly invoke an RPC endpoint'],
  ['lib/prototype-schema-preflight.ts', 'targetMigrationHistoryVerified: true', 'schema preflight must not self-certify migration history'],
  ['lib/prototype-schema-preflight.ts', 'migrationsExecutedVerified: true', 'schema preflight must not self-certify migration execution'],
  ['lib/prototype-schema-preflight.ts', 'dataCorrectnessVerified: true', 'schema preflight must not self-certify data correctness'],
  ['lib/prototype-schema-preflight.ts', 'reconciliationExerciseVerified: true', 'schema preflight must not self-certify reconciliation exercise'],
  ['lib/prototype-schema-preflight.ts', 'transferIdempotencyExerciseVerified: true', 'schema preflight must not self-certify idempotency exercise'],
  ['lib/prototype-schema-preflight.ts', 'restoreExerciseVerified: true', 'schema preflight must not self-certify restore exercise'],
  ['lib/prototype-schema-preflight.ts', 'productionApprovalVerified: true', 'schema preflight must not self-certify production approval'],
  ['app/api/prototype/schema-preflight/route.ts', 'productionApprovalVerified: true', 'schema preflight API must not claim production approval'],
  ['app/prototype/operations/operations-console.tsx', 'Migrations verified', 'Operations UI must not claim schema preflight verifies migrations'],
  ['app/prototype/operations/operations-console.tsx', 'Production ready', 'Operations UI must not claim schema preflight makes production ready']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype schema preflight read-only, operator/tenant boundary, UI, status API, and approval-truth safety checks passed.');
