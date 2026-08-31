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

const source = fs.readFileSync('lib/prototype-ledger.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-ledger.ts'
}).outputText;

const processShim = { env: {} };
const moduleShim = { exports: {} };
const capturedErrors = [];
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
  Buffer,
  Headers,
  Request,
  Response,
  URL,
  Date,
  Number,
  Set,
  encodeURIComponent,
  fetch: (...args) => fetchHandler(...args),
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected prototype-ledger runtime import: ${specifier}`);
  }
}, { filename: 'prototype-ledger.runtime.cjs' });

const {
  prototypeLedgerStatus,
  getPrototypeSnapshot,
  recordSandboxLinkedAccounts
} = moduleShim.exports;

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

// Memory fallback is permitted only when no persistent database credentials are configured.
processShim.env = {};
let status = prototypeLedgerStatus();
assert.equal(status.configured, false);
assert.equal(status.databaseCredentialsConfigured, false);
assert.equal(status.source, 'memory');
assert.equal(status.liveMoneyEnabled, false);
assert.equal(status.persistentSchemaVerified, false);
assert.equal(status.targetMigrationHistoryVerified, false);
assert.equal(status.persistentTransferIdempotencyAvailableInMigration, true);
assert.equal(status.persistentTransferIdempotency, false);
assert.equal(status.persistentRuntimeExerciseVerified, false);

let snapshot = await getPrototypeSnapshot('galactic-trust', 'demo-nova');
assert.equal(snapshot.source, 'memory');
assert.equal(snapshot.tenantKey, 'galactic-trust');
assert.ok(snapshot.accounts.every((account) => account.simulated === true));

processShim.env = {
  SUPABASE_URL: 'https://prototype-db.invalid',
  SUPABASE_SECRET_KEY: 'server-only-prototype-key'
};
status = prototypeLedgerStatus();
assert.equal(status.configured, true);
assert.equal(status.databaseCredentialsConfigured, true);
assert.equal(status.source, 'supabase');
assert.equal(status.persistentSchemaVerified, false);
assert.equal(status.targetMigrationHistoryVerified, false);
assert.equal(status.persistentTransferIdempotency, false);
assert.match(status.disclosure, /remain unverified/i);

// Configured persistent mode must not silently substitute memory demo data for an unknown tenant.
fetchHandler = async (url) => {
  assert.match(String(url), /fintech_tenants/);
  return jsonResponse([]);
};
await assert.rejects(
  () => getPrototypeSnapshot('missing-tenant', 'demo-nova'),
  (error) => error instanceof BankingError && error.status === 404 && error.code === 'UNKNOWN_TENANT'
);

// Configured persistent mode must not silently substitute memory demo data for an unknown user.
let calls = 0;
fetchHandler = async (url) => {
  calls += 1;
  const value = String(url);
  if (value.includes('fintech_tenants')) return jsonResponse([{ id: 'tenant-001', tenant_key: 'galactic-trust', name: 'Galactic Trust' }]);
  if (value.includes('fintech_profiles')) return jsonResponse([]);
  throw new Error(`Unexpected unknown-user fetch: ${value}`);
};
await assert.rejects(
  () => getPrototypeSnapshot('galactic-trust', 'missing-user'),
  (error) => error instanceof BankingError && error.status === 404 && error.code === 'UNKNOWN_PROTOTYPE_USER'
);
assert.equal(calls, 2);

const validTenant = [{ id: 'tenant-001', tenant_key: 'galactic-trust', name: 'Galactic Trust' }];
const validProfile = [{ id: 'profile-001', external_user_id: 'demo-nova', display_name: 'Nova Star' }];
const validAccount = {
  id: 'account-001',
  label: 'Demo Checking',
  account_type: 'checking',
  routing_number: '000000000',
  account_last4: '4532',
  balance_cents: 123400,
  currency: 'USD',
  simulated: true
};
const validTransaction = {
  id: 'tx-001',
  account_id: 'account-001',
  direction: 'debit',
  amount_cents: 500,
  name: 'Synthetic Purchase',
  category: 'Shopping',
  status: 'posted',
  provider: 'prototype',
  occurred_at: '2026-08-30T12:00:00.000Z'
};

function snapshotFetch({ accounts = [validAccount], transactions = [validTransaction] } = {}) {
  return async (url) => {
    const value = String(url);
    if (value.includes('fintech_tenants')) return jsonResponse(validTenant);
    if (value.includes('fintech_profiles')) return jsonResponse(validProfile);
    if (value.includes('fintech_accounts')) return jsonResponse(accounts);
    if (value.includes('fintech_transactions')) return jsonResponse(transactions);
    throw new Error(`Unexpected snapshot fetch: ${value}`);
  };
}

// Any non-simulated account is a hard boundary violation instead of being silently filtered away.
fetchHandler = snapshotFetch({ accounts: [{ ...validAccount, simulated: false }], transactions: [] });
await assert.rejects(
  () => getPrototypeSnapshot('galactic-trust', 'demo-nova'),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'NON_SIMULATED_ACCOUNT_REJECTED'
);

// A transaction outside the returned simulated-account boundary also fails closed.
fetchHandler = snapshotFetch({ transactions: [{ ...validTransaction, account_id: 'outside-account' }] });
await assert.rejects(
  () => getPrototypeSnapshot('galactic-trust', 'demo-nova'),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'TRANSACTION_ACCOUNT_BOUNDARY_REJECTED'
);

// Valid persistent synthetic data is returned as Supabase-backed simulation data.
fetchHandler = snapshotFetch();
snapshot = await getPrototypeSnapshot('galactic-trust', 'demo-nova');
assert.equal(snapshot.source, 'supabase');
assert.equal(snapshot.totalBalanceCents, 123400);
assert.equal(snapshot.accounts.length, 1);
assert.equal(snapshot.transactions.length, 1);
assert.equal(snapshot.accounts[0].simulated, true);

// Sandbox linked-account persistence must also fail closed on tenant/user mismatches.
fetchHandler = async (url) => {
  const value = String(url);
  if (value.includes('fintech_tenants')) return jsonResponse([]);
  throw new Error(`Unexpected linked-account tenant fetch: ${value}`);
};
await assert.rejects(
  () => recordSandboxLinkedAccounts({
    tenantKey: 'missing-tenant',
    institutionName: 'Sandbox Bank',
    accounts: [{ providerAccountId: 'sandbox-account-1' }]
  }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_TENANT'
);

fetchHandler = async (url) => {
  const value = String(url);
  if (value.includes('fintech_tenants')) return jsonResponse(validTenant);
  if (value.includes('fintech_profiles')) return jsonResponse([]);
  throw new Error(`Unexpected linked-account user fetch: ${value}`);
};
await assert.rejects(
  () => recordSandboxLinkedAccounts({
    tenantKey: 'galactic-trust',
    userId: 'missing-user',
    institutionName: 'Sandbox Bank',
    accounts: [{ providerAccountId: 'sandbox-account-1' }]
  }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_PROTOTYPE_USER'
);

// Raw database response bodies must never be copied into server logs.
const fakeSecret = 'FAKE_LEDGER_DATABASE_SECRET_MUST_NOT_APPEAR';
capturedErrors.length = 0;
fetchHandler = async () => new Response(`database failure ${fakeSecret}`, { status: 500 });
await assert.rejects(
  () => getPrototypeSnapshot('galactic-trust', 'demo-nova'),
  (error) => error instanceof BankingError && error.status === 502 && error.code === 'PROTOTYPE_DATABASE_ERROR'
);
const logged = JSON.stringify(capturedErrors);
assert.equal(logged.includes(fakeSecret), false);
assert.match(logged, /responseBodyLogged/);

console.log('Prototype ledger persistent fail-closed and log-sanitization runtime checks passed.');
