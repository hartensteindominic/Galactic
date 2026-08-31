import assert from 'node:assert/strict';
import { createHmac, timingSafeEqual } from 'node:crypto';
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

const source = fs.readFileSync('lib/banking-auth.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'banking-auth.ts'
}).outputText;

let now = 1_800_000_000_000;
const DateShim = { now: () => now };
const processShim = { env: {} };
const moduleShim = { exports: {} };

vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  process: processShim,
  Buffer,
  Request,
  Number,
  Math,
  Date: DateShim,
  require(specifier) {
    if (specifier === 'node:crypto') return { createHmac, timingSafeEqual };
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected banking-auth runtime import: ${specifier}`);
  }
}, { filename: 'banking-auth.runtime.cjs' });

const { requireBankingUser } = moduleShim.exports;

function req(headers = {}) {
  return new Request('https://galactic.example/api/banking/summary', { headers });
}

function signedHeaders(secret, userId, timestamp) {
  const timestampText = String(timestamp);
  const signature = createHmac('sha256', secret)
    .update(`${userId}.${timestampText}`)
    .digest('hex');
  return {
    'x-galactic-auth-user': userId,
    'x-galactic-auth-timestamp': timestampText,
    'x-galactic-auth-signature': signature
  };
}

processShim.env = {};
assert.equal(requireBankingUser(req()), 'demo-nova');
assert.equal(requireBankingUser(req({ 'x-galactic-auth-user': 'ignored-user' })), 'demo-nova');

processShim.env = { BANKING_MODE: 'partner' };
assert.throws(
  () => requireBankingUser(req()),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'AUTH_NOT_CONFIGURED'
);

const secretA = 'banking-auth-secret-A-0123456789abcdef';
processShim.env.BANKING_AUTH_GATEWAY_SECRET = secretA;
assert.throws(
  () => requireBankingUser(req()),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'AUTH_REQUIRED'
);
assert.throws(
  () => requireBankingUser(req({
    'x-galactic-auth-user': 'user-1',
    'x-galactic-auth-timestamp': String(now)
  })),
  (error) => error instanceof BankingError && error.code === 'AUTH_REQUIRED'
);
assert.throws(
  () => requireBankingUser(req({
    'x-galactic-auth-user': 'user-1',
    'x-galactic-auth-timestamp': 'not-a-number',
    'x-galactic-auth-signature': 'abc'
  })),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'INVALID_AUTH'
);

const fiveMinutes = 5 * 60 * 1000;
const exactOld = now - fiveMinutes;
assert.equal(requireBankingUser(req(signedHeaders(secretA, 'user-exact-old', exactOld))), 'user-exact-old');
const exactFuture = now + fiveMinutes;
assert.equal(requireBankingUser(req(signedHeaders(secretA, 'user-exact-future', exactFuture))), 'user-exact-future');

assert.throws(
  () => requireBankingUser(req(signedHeaders(secretA, 'user-old', now - fiveMinutes - 1))),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'EXPIRED_AUTH'
);
assert.throws(
  () => requireBankingUser(req(signedHeaders(secretA, 'user-future', now + fiveMinutes + 1))),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'EXPIRED_AUTH'
);

const valid = signedHeaders(secretA, 'customer-123', now);
assert.equal(requireBankingUser(req(valid)), 'customer-123');

const padded = {
  'x-galactic-auth-user': '  customer-trimmed  ',
  'x-galactic-auth-timestamp': `  ${now}  `,
  'x-galactic-auth-signature': `  ${createHmac('sha256', secretA).update(`customer-trimmed.${now}`).digest('hex')}  `
};
assert.equal(requireBankingUser(req(padded)), 'customer-trimmed');

const wrongLengthSignature = { ...valid, 'x-galactic-auth-signature': 'deadbeef' };
assert.throws(
  () => requireBankingUser(req(wrongLengthSignature)),
  (error) => error instanceof BankingError && error.code === 'INVALID_AUTH'
);
const sameLengthWrongSignature = { ...valid, 'x-galactic-auth-signature': '0'.repeat(64) };
assert.throws(
  () => requireBankingUser(req(sameLengthWrongSignature)),
  (error) => error instanceof BankingError && error.code === 'INVALID_AUTH'
);

processShim.env.BANKING_AUTH_GATEWAY_SECRET = 'banking-auth-secret-B-abcdef0123456789';
assert.throws(
  () => requireBankingUser(req(valid)),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'INVALID_AUTH'
);

const rotated = signedHeaders(processShim.env.BANKING_AUTH_GATEWAY_SECRET, 'customer-123', now);
assert.equal(requireBankingUser(req(rotated)), 'customer-123');

console.log('Signed banking authentication runtime behavior checks passed.');
