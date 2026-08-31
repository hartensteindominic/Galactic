import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class BankingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const source = fs.readFileSync('lib/prototype-schema-preflight.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-schema-preflight.ts'
}).outputText;

const processShim = { env: {} };
const moduleShim = { exports: {} };
const capturedErrors = [];
const fetchCalls = [];
let fetchHandler = async () => {
  throw new Error('Unexpected fetch');
};

vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console: {
    log: console.log,
    warn: console.warn,
    error: (...args) => capturedErrors.push(args)
  },
  process: processShim,
  Response,
  Set,
  Object,
  Array,
  JSON,
  fetch: (...args) => fetchHandler(...args),
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected schema-preflight runtime import: ${specifier}`);
  }
}, { filename: 'prototype-schema-preflight.runtime.cjs' });

const {
  prototypeSchemaPreflightControlStatus,
  expectedPrototypeSchemaResources,
  runPrototypeSchemaPreflight
} = moduleShim.exports;

const controls = prototypeSchemaPreflightControlStatus();
assert.equal(controls.implemented, true);
assert.equal(controls.readOnly, true);
assert.equal(controls.operatorAccessRequiredAtRoute, true);
assert.equal(controls.tenantContextRequiredAtRoute, true);
assert.equal(controls.expectedResourceCount, 16);
assert.equal(controls.usesPostgrestOpenApiObservation, true);
assert.equal(controls.invokesFinancialRpcs, false);
assert.equal(controls.mutatesDatabase, false);
assert.equal(controls.targetMigrationHistoryVerified, false);
assert.equal(controls.migrationsExecutedVerified, false);
assert.equal(controls.persistentRuntimeExerciseVerified, false);
assert.equal(controls.productionApprovalVerified, false);

const expected = expectedPrototypeSchemaResources();
assert.equal(expected.length, 16);
assert.equal(new Set(expected.map((resource) => resource.openApiPath)).size, 16);
assert.ok(expected.some((resource) => resource.name === 'simulate_fintech_transfer' && resource.kind === 'rpc'));
assert.ok(expected.some((resource) => resource.name === 'reconcile_fintech_profile' && resource.kind === 'rpc'));
assert.ok(expected.some((resource) => resource.name === 'reconcile_fintech_gl_profile' && resource.kind === 'rpc'));
assert.ok(expected.some((resource) => resource.name === 'fintech_cashflow_items' && resource.migrationId === '005'));

processShim.env = {};
await assert.rejects(
  () => runPrototypeSchemaPreflight(),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'SUPABASE_NOT_CONFIGURED'
);

const dbKey = 'server-only-preflight-key';
processShim.env = {
  SUPABASE_URL: 'https://prototype-db.invalid/',
  SUPABASE_SECRET_KEY: dbKey
};

function openApiResponse(paths) {
  return Response.json({ openapi: '3.0.0', paths });
}

fetchCalls.length = 0;
fetchHandler = async (url, init = {}) => {
  fetchCalls.push({
    url: String(url),
    method: String(init.method || 'GET').toUpperCase(),
    headers: Object.fromEntries(Object.entries(init.headers || {}).map(([key, value]) => [String(key).toLowerCase(), String(value)]))
  });
  return openApiResponse(Object.fromEntries(expected.map((resource) => [resource.openApiPath, { get: {} }])));
};

let result = await runPrototypeSchemaPreflight();
assert.equal(fetchCalls.length, 1);
assert.equal(fetchCalls[0].url, 'https://prototype-db.invalid/rest/v1/');
assert.equal(fetchCalls[0].method, 'GET');
assert.equal(fetchCalls[0].headers.apikey, dbKey);
assert.equal(fetchCalls[0].headers.authorization, `Bearer ${dbKey}`);
assert.equal(fetchCalls[0].headers.accept, 'application/openapi+json');
assert.equal(result.source, 'supabase-postgrest-openapi');
assert.equal(result.readOnlyObservation, true);
assert.equal(result.preflightExecuted, true);
assert.equal(result.expectedResourceCount, 16);
assert.equal(result.observedResourceCount, 16);
assert.equal(result.missingResourceCount, 0);
assert.equal(result.allExpectedResourcesObserved, true);
assert.equal(result.resources.every((resource) => resource.observed === true), true);
assert.equal(result.targetMigrationHistoryVerified, false);
assert.equal(result.migrationsExecutedVerified, false);
assert.equal(result.dataCorrectnessVerified, false);
assert.equal(result.reconciliationExerciseVerified, false);
assert.equal(result.transferIdempotencyExerciseVerified, false);
assert.equal(result.restoreExerciseVerified, false);
assert.equal(result.productionApprovalVerified, false);
assert.match(result.disclosure, /capability evidence only/i);

const missingPath = '/fintech_gl_lines';
fetchHandler = async () => openApiResponse(Object.fromEntries(
  expected.filter((resource) => resource.openApiPath !== missingPath).map((resource) => [resource.openApiPath, { get: {} }])
));
result = await runPrototypeSchemaPreflight();
assert.equal(result.allExpectedResourcesObserved, false);
assert.equal(result.observedResourceCount, 15);
assert.equal(result.missingResourceCount, 1);
assert.equal(result.missingResources[0].name, 'fintech_gl_lines');
assert.equal(result.missingResources[0].migrationId, '004');

const fakeBodySecret = 'FAKE_PREFLIGHT_PROVIDER_BODY_SECRET';
capturedErrors.length = 0;
fetchHandler = async () => new Response(`schema error ${fakeBodySecret}`, { status: 500 });
await assert.rejects(
  () => runPrototypeSchemaPreflight(),
  (error) => error instanceof BankingError && error.status === 502 && error.code === 'SCHEMA_PREFLIGHT_UNAVAILABLE' && !error.message.includes(fakeBodySecret)
);
const logged = JSON.stringify(capturedErrors);
assert.equal(logged.includes(fakeBodySecret), false);
assert.match(logged, /responseBodyLogged/);

fetchHandler = async () => new Response('not-json', { status: 200, headers: { 'content-type': 'application/json' } });
await assert.rejects(
  () => runPrototypeSchemaPreflight(),
  (error) => error instanceof BankingError && error.code === 'SCHEMA_PREFLIGHT_INVALID_RESPONSE'
);

fetchHandler = async () => Response.json({ paths: [] });
await assert.rejects(
  () => runPrototypeSchemaPreflight(),
  (error) => error instanceof BankingError && error.code === 'SCHEMA_PREFLIGHT_INVALID_RESPONSE'
);

console.log('Prototype schema preflight read-only capability-observation runtime checks passed.');
