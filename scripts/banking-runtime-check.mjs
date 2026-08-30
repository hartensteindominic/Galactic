import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/banking.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'banking.ts'
}).outputText;

const processShim = { env: {} };
let now = 1_800_000_000_000;
const DateShim = { now: () => now };
let calls = [];
let nextStatus = 200;
let nextData = { ok: true };

function fakeResponse(status, data) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data
  };
}

async function fakeFetch(url, init = {}) {
  calls.push({ url: String(url), init });
  return fakeResponse(nextStatus, nextData);
}

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  process: processShim,
  fetch: fakeFetch,
  Headers,
  Date: DateShim,
  Number,
  JSON,
  encodeURIComponent
}, { filename: 'banking.runtime.cjs' });

const {
  BankingError,
  bankingStatus,
  getBankingSummary,
  createTransfer,
  setCardFrozen
} = moduleShim.exports;

function resetEnv(values = {}) {
  processShim.env = { ...values };
  calls = [];
  nextStatus = 200;
  nextData = { ok: true };
}

function partnerEnv(extra = {}) {
  return {
    BANKING_MODE: 'partner',
    BANKING_GATEWAY_BASE_URL: 'https://banking-gateway.invalid/',
    BANKING_GATEWAY_API_KEY: 'server-only-gateway-key-for-runtime-test',
    BANKING_PROGRAM_ID: 'program-test-1',
    BANKING_PROVIDER_NAME: 'Test Provider',
    BANKING_PARTNER_BANK_NAME: 'Test Regulated Partner',
    BANKING_PARTNER_DISCLOSURE: 'Runtime-test partner disclosure.',
    ...extra
  };
}

resetEnv();
let status = bankingStatus();
assert.equal(status.mode, 'demo');
assert.equal(status.partnerConfigured, false);
assert.equal(status.liveWritesConfigured, false);
assert.equal(status.liveWritesEnabled, false);
assert.equal(status.moneyMovementEnabled, false);
assert.equal(status.emergencyFreezeActive, true);
assert.equal(status.protectiveWritesAvailable, false);
assert.match(status.disclosure, /No real deposits are held and no real money is moved/);

const demoSummary = await getBankingSummary('demo-nova');
assert.equal(demoSummary.mode, 'demo');
assert.equal(demoSummary.customerName, 'Nova Star');
assert.equal(calls.length, 0);

now += 1;
const demoTransfer = await createTransfer({
  userId: 'demo-nova',
  fromAccountId: 'demo-checking-4532',
  recipient: 'Alex',
  amount: 12.345
});
assert.equal(demoTransfer.status, 'simulated');
assert.equal(demoTransfer.amount, 12.35);
assert.equal(demoTransfer.recipient, 'Alex');
assert.match(demoTransfer.message, /No real money moved/);
assert.equal(calls.length, 0);

const demoCard = await setCardFrozen({ userId: 'demo-nova', cardId: 'demo-card-4532', frozen: true });
assert.equal(demoCard.status, 'simulated');
assert.equal(demoCard.frozen, true);
assert.match(demoCard.message, /No real card was changed/);
assert.equal(calls.length, 0);

await assert.rejects(
  () => createTransfer({ userId: 'demo-nova', fromAccountId: ' ', recipient: 'Alex', amount: 10 }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'SOURCE_ACCOUNT_REQUIRED'
);
await assert.rejects(
  () => createTransfer({ userId: 'demo-nova', fromAccountId: 'acct', recipient: 'Alex', amount: 0 }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'INVALID_AMOUNT'
);
await assert.rejects(
  () => createTransfer({ userId: 'demo-nova', fromAccountId: 'acct', recipient: 'Alex', amount: 10000.01 }),
  (error) => error instanceof BankingError && error.code === 'INVALID_AMOUNT'
);
await assert.rejects(
  () => createTransfer({ userId: 'demo-nova', fromAccountId: 'acct', recipient: ' ', amount: 10 }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'RECIPIENT_REQUIRED'
);
await assert.rejects(
  () => setCardFrozen({ userId: 'demo-nova', cardId: '', frozen: true }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'CARD_REQUIRED'
);

resetEnv({ BANKING_MODE: 'partner' });
status = bankingStatus();
assert.equal(status.mode, 'partner');
assert.equal(status.partnerConfigured, false);
assert.equal(status.liveWritesEnabled, false);
assert.equal(status.moneyMovementEnabled, false);
await assert.rejects(
  () => getBankingSummary('user-1'),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'PARTNER_NOT_CONFIGURED'
);

resetEnv(partnerEnv());
status = bankingStatus();
assert.equal(status.partnerConfigured, true);
assert.equal(status.liveWritesConfigured, false);
assert.equal(status.liveWritesEnabled, false);
assert.equal(status.emergencyFreezeActive, true);
assert.equal(status.moneyMovementEnabled, false);
assert.equal(status.protectiveWritesAvailable, false);
assert.equal(status.disclosure, 'Runtime-test partner disclosure.');

nextData = {
  mode: 'partner',
  customerName: 'Synthetic Partner User',
  totalBalance: 0,
  accounts: [],
  transactions: [],
  cards: []
};
const partnerSummary = await getBankingSummary('user-1');
assert.equal(partnerSummary.mode, 'partner');
assert.equal(calls.length, 1);
assert.equal(calls[0].init.method, 'GET');
assert.equal(calls[0].init.cache, 'no-store');
assert.equal(new Headers(calls[0].init.headers).get('X-Galactic-Program-Id'), 'program-test-1');

calls = [];
await assert.rejects(
  () => createTransfer({
    userId: 'user-1',
    fromAccountId: 'acct-1',
    recipient: 'Alex',
    amount: 25,
    idempotencyKey: 'idem-1'
  }),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'LIVE_WRITES_DISABLED'
);
assert.equal(calls.length, 0);

resetEnv(partnerEnv({ BANKING_ENABLE_LIVE_WRITES: 'true' }));
status = bankingStatus();
assert.equal(status.liveWritesConfigured, true);
assert.equal(status.emergencyFreezeActive, true);
assert.equal(status.liveWritesEnabled, false);
assert.equal(status.moneyMovementEnabled, false);
assert.equal(status.protectiveWritesAvailable, true);

await assert.rejects(
  () => createTransfer({
    userId: 'user-1',
    fromAccountId: 'acct-1',
    recipient: 'Alex',
    amount: 25,
    idempotencyKey: 'idem-frozen'
  }),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'MONEY_MOVEMENT_FROZEN'
);
assert.equal(calls.length, 0);

nextData = { id: 'card-1', frozen: true, status: 'ok' };
const protectiveFreeze = await setCardFrozen({ userId: 'user-1', cardId: 'card-1', frozen: true });
assert.equal(protectiveFreeze.frozen, true);
assert.equal(calls.length, 1);
assert.equal(calls[0].init.method, 'PATCH');
assert.match(calls[0].url, /\/v1\/cards\/card-1$/);

resetEnv(partnerEnv({ BANKING_ENABLE_LIVE_WRITES: 'true', BANKING_EMERGENCY_FREEZE: 'false' }));
status = bankingStatus();
assert.equal(status.liveWritesConfigured, true);
assert.equal(status.emergencyFreezeActive, false);
assert.equal(status.liveWritesEnabled, true);
assert.equal(status.moneyMovementEnabled, true);
assert.equal(status.protectiveWritesAvailable, true);

await assert.rejects(
  () => createTransfer({
    userId: 'user-1',
    fromAccountId: 'acct-1',
    recipient: 'Alex',
    amount: 25
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'IDEMPOTENCY_REQUIRED'
);
assert.equal(calls.length, 0);

nextData = { id: 'provider-transfer-1', status: 'submitted' };
const liveTransfer = await createTransfer({
  userId: 'user-1',
  fromAccountId: 'acct-1',
  recipient: ' Alex ',
  amount: 25.126,
  memo: 'test',
  idempotencyKey: 'idem-live-1'
});
assert.equal(liveTransfer.id, 'provider-transfer-1');
assert.equal(calls.length, 1);
assert.equal(calls[0].init.method, 'POST');
assert.match(calls[0].url, /\/v1\/transfers$/);
const headers = new Headers(calls[0].init.headers);
assert.equal(headers.get('Idempotency-Key'), 'idem-live-1');
assert.equal(headers.get('X-Galactic-Program-Id'), 'program-test-1');
assert.equal(headers.get('Authorization'), 'Bearer server-only-gateway-key-for-runtime-test');
const transferBody = JSON.parse(calls[0].init.body);
assert.equal(transferBody.userId, 'user-1');
assert.equal(transferBody.fromAccountId, 'acct-1');
assert.equal(transferBody.recipient, 'Alex');
assert.equal(transferBody.amount, 25.13);

calls = [];
nextStatus = 500;
nextData = { error: 'synthetic failure' };
await assert.rejects(
  () => getBankingSummary('user-1'),
  (error) => {
    assert.equal(error instanceof BankingError, true);
    assert.equal(error.status, 502);
    assert.equal(error.code, 'PARTNER_GATEWAY_ERROR');
    assert.equal(error.message.includes('server-only-gateway-key-for-runtime-test'), false);
    return true;
  }
);

console.log('Banking live-write and emergency-freeze runtime behavior checks passed.');
