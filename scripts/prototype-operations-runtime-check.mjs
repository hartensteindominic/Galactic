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

const processShim = {
  env: {
    SUPABASE_URL: 'https://prototype-db.invalid',
    SUPABASE_SECRET_KEY: 'server-only-db-key',
    PROTOTYPE_WEBHOOK_SECRET: 'prototype-webhook-secret-0123456789'
  }
};
const moduleShim = { exports: {} };
let fetchHandler = async () => {
  throw new Error('Unexpected fetch');
};
const capturedErrors = [];
const consoleShim = {
  log: console.log,
  warn: console.warn,
  error: (...args) => capturedErrors.push(args)
};

vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console: consoleShim,
  process: processShim,
  Buffer,
  Headers,
  Request,
  Response,
  URL,
  encodeURIComponent,
  fetch: (...args) => fetchHandler(...args),
  require(specifier) {
    if (specifier === 'node:crypto') return { createHash, timingSafeEqual };
    if (specifier === './banking') return { BankingError };
    if (specifier === './prototype-ledger') {
      return {
        getPrototypeSnapshot: async () => ({ accounts: [] })
      };
    }
    throw new Error(`Unexpected prototype-operations runtime import: ${specifier}`);
  }
}, { filename: 'prototype-operations.runtime.cjs' });

const {
  verifyPrototypeWebhookSecret,
  recordPrototypeProviderEvent
} = moduleShim.exports;

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function digest(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function tenantResponse() {
  return jsonResponse([{ id: 'tenant-001' }]);
}

assert.equal(verifyPrototypeWebhookSecret('prototype-webhook-secret-0123456789'), true);
assert.equal(verifyPrototypeWebhookSecret('prototype-webhook-secret-0123456788'), false);
assert.equal(verifyPrototypeWebhookSecret(''), false);

let calls = [];
fetchHandler = async (url, init = {}) => {
  calls.push({ url: String(url), method: String(init.method || 'GET').toUpperCase(), body: init.body || '' });
  if (calls.length === 1) return tenantResponse();
  if (calls.length === 2) {
    return jsonResponse([{ id: 'event-row-1', provider_event_id: 'evt-new', status: 'received' }]);
  }
  throw new Error('Unexpected new-event fetch');
};

let result = await recordPrototypeProviderEvent({
  tenantKey: 'galactic-trust',
  providerEventId: 'evt-new',
  eventType: 'sandbox.sync',
  payload: { cursor: 'abc', count: 2 }
});
assert.equal(result.duplicate, false);
assert.equal(result.providerEventId, 'evt-new');
assert.equal(calls.length, 2);
assert.equal(calls[1].method, 'POST');

const replayPayload = { cursor: 'same', count: 1 };
calls = [];
fetchHandler = async (url, init = {}) => {
  calls.push({ url: String(url), method: String(init.method || 'GET').toUpperCase() });
  if (calls.length === 1) return tenantResponse();
  if (calls.length === 2) return jsonResponse([]);
  if (calls.length === 3) {
    return jsonResponse([{
      provider_event_id: 'evt-duplicate',
      event_type: 'sandbox.sync',
      payload_digest: digest(replayPayload),
      status: 'received'
    }]);
  }
  throw new Error('Unexpected duplicate-event fetch');
};
result = await recordPrototypeProviderEvent({
  tenantKey: 'galactic-trust',
  providerEventId: 'evt-duplicate',
  eventType: 'sandbox.sync',
  payload: replayPayload
});
assert.equal(result.duplicate, true);
assert.match(result.message, /Exact duplicate/);
assert.equal(calls.length, 3);

calls = [];
fetchHandler = async () => {
  calls.push(calls.length + 1);
  if (calls.length === 1) return tenantResponse();
  if (calls.length === 2) return jsonResponse([]);
  return jsonResponse([{
    provider_event_id: 'evt-conflict',
    event_type: 'sandbox.sync',
    payload_digest: digest({ changed: true }),
    status: 'received'
  }]);
};
await assert.rejects(
  () => recordPrototypeProviderEvent({
    tenantKey: 'galactic-trust',
    providerEventId: 'evt-conflict',
    eventType: 'sandbox.sync',
    payload: { changed: false }
  }),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'WEBHOOK_REPLAY_CONFLICT'
);

calls = [];
fetchHandler = async () => {
  calls.push(calls.length + 1);
  if (calls.length === 1) return tenantResponse();
  if (calls.length === 2) return jsonResponse([]);
  return jsonResponse([]);
};
await assert.rejects(
  () => recordPrototypeProviderEvent({
    tenantKey: 'galactic-trust',
    providerEventId: 'evt-unknown',
    eventType: 'sandbox.sync',
    payload: { same: true }
  }),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'WEBHOOK_REPLAY_STATE_UNKNOWN'
);

const multibytePayload = '🛰️'.repeat(30000);
calls = [];
fetchHandler = async () => {
  calls.push(calls.length + 1);
  return tenantResponse();
};
await assert.rejects(
  () => recordPrototypeProviderEvent({
    tenantKey: 'galactic-trust',
    providerEventId: 'evt-too-large',
    eventType: 'sandbox.large',
    payload: multibytePayload
  }),
  (error) => error instanceof BankingError && error.status === 413 && error.code === 'EVENT_TOO_LARGE'
);
assert.equal(calls.length, 1, 'payload byte rejection should occur before provider-event insert');

const fakeSecret = 'FAKE_DATABASE_SECRET_MUST_NOT_APPEAR';
capturedErrors.length = 0;
fetchHandler = async () => new Response(`database failure ${fakeSecret}`, { status: 500 });
await assert.rejects(
  () => recordPrototypeProviderEvent({
    tenantKey: 'galactic-trust',
    providerEventId: 'evt-db-error',
    eventType: 'sandbox.error',
    payload: null
  }),
  (error) => error instanceof BankingError && error.status === 502 && error.code === 'PROTOTYPE_OPERATIONS_ERROR'
);
const logged = JSON.stringify(capturedErrors);
assert.equal(logged.includes(fakeSecret), false, 'raw database response body must not reach server logs');
assert.match(logged, /responseBodyLogged/);

console.log('Prototype operations webhook replay and log-sanitization runtime checks passed.');
