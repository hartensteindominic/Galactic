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

const source = fs.readFileSync('lib/plaid-sandbox.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'plaid-sandbox.ts'
}).outputText;

const processShim = { env: {} };
const moduleShim = { exports: {} };
const capturedErrors = [];
const persistedCalls = [];
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
  Headers,
  Request,
  Response,
  Date,
  Math,
  Promise,
  JSON,
  fetch: (...args) => fetchHandler(...args),
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    if (specifier === './prototype-ledger') {
      return {
        recordSandboxLinkedAccounts: async (input) => {
          persistedCalls.push(input);
          return { persisted: true };
        }
      };
    }
    throw new Error(`Unexpected Plaid sandbox runtime import: ${specifier}`);
  }
}, { filename: 'plaid-sandbox.runtime.cjs' });

const { plaidSandboxStatus, connectOneClickSandboxBank } = moduleShim.exports;

// No credentials: explicit local synthetic fallback only.
processShim.env = {};
let status = plaidSandboxStatus();
assert.equal(status.configured, false);
assert.equal(status.credentialsConfigured, false);
assert.equal(status.environment, 'disabled');
assert.equal(status.sandboxConnectionExerciseVerified, false);
assert.equal(status.sandboxPersistenceExerciseVerified, false);
assert.equal(status.productionProviderApproved, false);
assert.equal(status.productionWebhookVerificationEnabled, false);
assert.equal(status.liveBankLinkingEnabled, false);

let result = await connectOneClickSandboxBank({ tenantKey: 'galactic-trust' });
assert.equal(result.mode, 'local_mock');
assert.equal(result.persisted, false);
assert.match(result.disclosure, /configuration alone does not verify that exercise/i);

// Credentials configure the sandbox environment, but do not self-verify exercise or approval.
const clientId = 'sandbox-client-id-test';
const plaidSecret = 'sandbox-secret-test-value';
processShim.env = {
  PLAID_CLIENT_ID: clientId,
  PLAID_SECRET: plaidSecret,
  PLAID_ENV: 'sandbox',
  PLAID_SANDBOX_INSTITUTION_ID: 'ins_test'
};
status = plaidSandboxStatus();
assert.equal(status.configured, true);
assert.equal(status.credentialsConfigured, true);
assert.equal(status.environment, 'sandbox');
assert.equal(status.sandboxConnectionExerciseVerified, false);
assert.equal(status.sandboxPersistenceExerciseVerified, false);
assert.equal(status.productionProviderApproved, false);
assert.equal(status.productionWebhookVerificationEnabled, false);
assert.equal(status.liveBankLinkingEnabled, false);
assert.match(status.disclosure, /does not prove the sandbox connection/i);

// A provider-supplied error body must not become client error text or server log text.
const fakeProviderSecret = 'FAKE_PROVIDER_BODY_SECRET_MUST_NOT_APPEAR';
capturedErrors.length = 0;
fetchHandler = async () => new Response(JSON.stringify({
  error_message: `provider detail ${fakeProviderSecret}`
}), { status: 400, headers: { 'content-type': 'application/json' } });
await assert.rejects(
  () => connectOneClickSandboxBank({ tenantKey: 'galactic-trust' }),
  (error) => error instanceof BankingError &&
    error.status === 502 &&
    error.code === 'PLAID_SANDBOX_ERROR' &&
    error.message === 'Plaid Sandbox could not complete the synthetic account-link request.' &&
    !error.message.includes(fakeProviderSecret)
);
const loggedFailure = JSON.stringify(capturedErrors);
assert.equal(loggedFailure.includes(fakeProviderSecret), false);
assert.match(loggedFailure, /responseBodyLogged/);

// Successful synthetic flow uses server-side credentials/tokens but returns none of them to the caller.
const accessToken = 'sandbox-access-token-must-stay-server-side';
const publicToken = 'sandbox-public-token';
const fetchCalls = [];
persistedCalls.length = 0;
fetchHandler = async (url, init = {}) => {
  const call = {
    url: String(url),
    headers: Object.fromEntries(new Headers(init.headers).entries()),
    body: String(init.body || '')
  };
  fetchCalls.push(call);

  if (call.url.endsWith('/sandbox/public_token/create')) {
    return Response.json({ public_token: publicToken });
  }
  if (call.url.endsWith('/item/public_token/exchange')) {
    return Response.json({ access_token: accessToken, item_id: 'item-test' });
  }
  if (call.url.endsWith('/accounts/get')) {
    return Response.json({
      item: { institution_id: 'ins_test' },
      accounts: [{
        account_id: 'acct-1',
        name: 'Plaid Sandbox Checking',
        mask: '1234',
        subtype: 'checking',
        type: 'depository',
        balances: { current: 123.45, available: 120, iso_currency_code: 'USD' }
      }]
    });
  }
  if (call.url.endsWith('/transactions/get')) {
    return Response.json({
      transactions: [{
        transaction_id: 'tx-1',
        account_id: 'acct-1',
        name: 'Sandbox Merchant',
        amount: 12.34,
        date: '2026-08-29',
        pending: false,
        category: ['Shops']
      }]
    });
  }
  throw new Error(`Unexpected Plaid URL: ${call.url}`);
};

result = await connectOneClickSandboxBank({ tenantKey: 'galactic-trust', userId: 'demo-nova' });
assert.equal(result.mode, 'plaid_sandbox');
assert.equal(result.persisted, true);
assert.equal(result.accounts.length, 1);
assert.equal(result.transactions.length, 1);
assert.equal(result.transactions[0].amountCents, -1234);
assert.equal(persistedCalls.length, 1);
assert.equal(persistedCalls[0].tenantKey, 'galactic-trust');
assert.equal(persistedCalls[0].accounts[0].providerAccountId, 'acct-1');

const returned = JSON.stringify(result);
assert.equal(returned.includes(accessToken), false, 'access token must not be returned');
assert.equal(returned.includes(publicToken), false, 'public token must not be returned');
assert.equal(returned.includes(plaidSecret), false, 'Plaid secret must not be returned');
assert.equal(returned.includes(clientId), false, 'Plaid client ID must not be returned');
assert.match(result.disclosure, /access token is used server-side/i);
assert.match(result.disclosure, /not production provider approval/i);

assert.ok(fetchCalls.every((call) => call.headers['plaid-client-id'] === clientId));
assert.ok(fetchCalls.every((call) => call.headers['plaid-secret'] === plaidSecret));

console.log('Plaid Sandbox privacy, generic-error, token-boundary, and readiness runtime checks passed.');
