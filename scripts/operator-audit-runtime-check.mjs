import assert from 'node:assert/strict';
import { createHash, timingSafeEqual } from 'node:crypto';
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

const source = fs.readFileSync('lib/prototype-operations.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-operations.ts'
}).outputText;

const processShim = { env: {} };
let calls = [];
let tenantRows = [{ id: 'tenant-1' }];

function response(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
    json: async () => data
  };
}

async function fakeFetch(url, init = {}) {
  calls.push({ url: String(url), init });
  if (String(url).includes('/rest/v1/fintech_tenants')) return response(200, tenantRows);
  if (String(url).includes('/rest/v1/fintech_audit_events')) return response(201, [{ id: 'audit-1' }]);
  throw new Error(`Unexpected operator-audit runtime URL: ${url}`);
}

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  process: processShim,
  Buffer,
  Headers,
  fetch: fakeFetch,
  encodeURIComponent,
  JSON,
  require(specifier) {
    if (specifier === 'node:crypto') return { createHash, timingSafeEqual };
    if (specifier === './banking') return { BankingError };
    if (specifier === './prototype-ledger') {
      return { getPrototypeSnapshot: async () => { throw new Error('Snapshot should not be used in operator audit runtime test.'); } };
    }
    throw new Error(`Unexpected operator-audit runtime import: ${specifier}`);
  }
}, { filename: 'prototype-operations.operator-audit.runtime.cjs' });

const { recordPrototypeOperatorAuditEvent, prototypeOperationsStatus } = moduleShim.exports;
assert.equal(typeof recordPrototypeOperatorAuditEvent, 'function');

calls = [];
const memoryResult = await recordPrototypeOperatorAuditEvent({
  tenantKey: 'galactic-trust',
  action: 'operator.session_started',
  entityType: 'operator_session'
});
assert.equal(memoryResult.persisted, false);
assert.equal(memoryResult.mode, 'memory');
assert.equal(calls.length, 0);

const configuredSecret = 'server-only-supabase-test-secret-never-audit-this';
processShim.env.SUPABASE_URL = 'https://prototype.invalid';
processShim.env.SUPABASE_SECRET_KEY = configuredSecret;

calls = [];
const reconciliationResult = await recordPrototypeOperatorAuditEvent({
  tenantKey: 'galactic-trust',
  action: 'operator.reconciliation_requested',
  entityType: 'profile',
  entityId: 'demo-nova',
  resultStatus: 'balanced',
  reconciliationSource: 'supabase'
});
assert.equal(reconciliationResult.persisted, true);
assert.equal(reconciliationResult.mode, 'supabase');
assert.equal(calls.length, 2);
assert.match(calls[0].url, /fintech_tenants/);
assert.match(calls[1].url, /fintech_audit_events/);

const auditBody = JSON.parse(calls[1].init.body);
assert.deepEqual(Object.keys(auditBody).sort(), ['action', 'actor_type', 'entity_id', 'entity_type', 'metadata', 'tenant_id']);
assert.equal(auditBody.tenant_id, 'tenant-1');
assert.equal(auditBody.actor_type, 'operator');
assert.equal(auditBody.action, 'operator.reconciliation_requested');
assert.equal(auditBody.entity_type, 'profile');
assert.equal(auditBody.entity_id, 'demo-nova');
assert.deepEqual(
  Object.keys(auditBody.metadata).sort(),
  ['reconciliation_source', 'result_status', 'simulation_only']
);
assert.equal(auditBody.metadata.simulation_only, true);
assert.equal(auditBody.metadata.result_status, 'balanced');
assert.equal(auditBody.metadata.reconciliation_source, 'supabase');
assert.equal(JSON.stringify(auditBody).includes(configuredSecret), false);
assert.equal(JSON.stringify(auditBody).includes('accessSecret'), false);
assert.equal(JSON.stringify(auditBody).toLowerCase().includes('ip_address'), false);

calls = [];
const sessionResult = await recordPrototypeOperatorAuditEvent({
  tenantKey: 'galactic-trust',
  action: 'operator.session_started',
  entityType: 'operator_session'
});
assert.equal(sessionResult.persisted, true);
const sessionAuditBody = JSON.parse(calls[1].init.body);
assert.equal(sessionAuditBody.action, 'operator.session_started');
assert.equal(sessionAuditBody.entity_id, null);
assert.deepEqual(Object.keys(sessionAuditBody.metadata), ['simulation_only']);

calls = [];
tenantRows = [];
await assert.rejects(
  () => recordPrototypeOperatorAuditEvent({
    tenantKey: 'unknown-tenant',
    action: 'operator.session_ended',
    entityType: 'operator_session'
  }),
  (error) => error instanceof BankingError && error.status === 404 && error.code === 'UNKNOWN_TENANT'
);

const status = prototypeOperationsStatus();
assert.equal(status.databaseConfigured, true);
assert.equal(status.sanitizedAuditEvidenceAvailable, true);
assert.equal(status.operatorAuditEvidenceAvailable, true);
assert.equal(status.realProviderWebhooksEnabled, false);
assert.equal(status.liveMoneyEnabled, false);

console.log('Operator audit runtime behavior checks passed.');
