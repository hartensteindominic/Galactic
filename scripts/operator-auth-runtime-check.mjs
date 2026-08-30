import assert from 'node:assert/strict';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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

const source = fs.readFileSync('lib/prototype-operator-auth.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-operator-auth.ts'
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
  Date: DateShim,
  decodeURIComponent,
  encodeURIComponent,
  Number,
  Math,
  require(specifier) {
    if (specifier === 'node:crypto') return { createHmac, randomBytes, timingSafeEqual };
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected operator-auth runtime import: ${specifier}`);
  }
}, { filename: 'prototype-operator-auth.runtime.cjs' });

const {
  prototypeOperatorAccessStatus,
  createPrototypeOperatorSession,
  operatorSessionCookie,
  clearOperatorSessionCookie,
  requirePrototypeOperator
} = moduleShim.exports;

function req(cookie = '') {
  return new Request('https://galactic.example/prototype/operations', {
    headers: cookie ? { cookie } : {}
  });
}

function cookieHeaderFromSession(value) {
  return `gt_prototype_operator=${encodeURIComponent(value)}`;
}

processShim.env = {};
let status = prototypeOperatorAccessStatus();
assert.equal(status.configured, false);
assert.equal(status.weakSecretConfigured, false);
assert.equal(status.persistentConfigured, false);
assert.equal(status.required, false);
assert.equal(status.failClosedIfPersistentWithoutSecret, true);
assert.equal(status.minimumSecretLength, 32);
assert.equal(status.sessionTtlHours, 8);
assert.deepEqual(requirePrototypeOperator(req()), { mode: 'open-memory-demo', authenticated: false });

processShim.env = {
  SUPABASE_URL: 'https://prototype.invalid',
  SUPABASE_SECRET_KEY: 'server-only-prototype-database-secret'
};
status = prototypeOperatorAccessStatus();
assert.equal(status.persistentConfigured, true);
assert.equal(status.required, true);
assert.equal(status.configured, false);
assert.throws(
  () => requirePrototypeOperator(req()),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'OPERATOR_ACCESS_NOT_CONFIGURED'
);
assert.throws(
  () => createPrototypeOperatorSession('anything'),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'OPERATOR_ACCESS_NOT_CONFIGURED'
);

processShim.env.PROTOTYPE_OPERATOR_ACCESS_SECRET = 'too-short-for-operator-access';
status = prototypeOperatorAccessStatus();
assert.equal(status.configured, false);
assert.equal(status.weakSecretConfigured, true);
assert.equal(status.required, true);
assert.throws(
  () => requirePrototypeOperator(req()),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'OPERATOR_ACCESS_SECRET_TOO_WEAK'
);
assert.throws(
  () => createPrototypeOperatorSession('too-short-for-operator-access'),
  (error) => error instanceof BankingError && error.code === 'OPERATOR_ACCESS_SECRET_TOO_WEAK'
);

const secretA = 'operator-access-secret-A-0123456789abcdef';
assert.ok(secretA.length >= 32);
processShim.env.PROTOTYPE_OPERATOR_ACCESS_SECRET = secretA;
processShim.env.NODE_ENV = 'test';
status = prototypeOperatorAccessStatus();
assert.equal(status.configured, true);
assert.equal(status.weakSecretConfigured, false);
assert.equal(status.required, true);

assert.throws(
  () => createPrototypeOperatorSession('wrong-secret-with-sameish-length-012345'),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'INVALID_OPERATOR_ACCESS'
);
assert.throws(
  () => createPrototypeOperatorSession(''),
  (error) => error instanceof BankingError && error.code === 'INVALID_OPERATOR_ACCESS'
);

const session = createPrototypeOperatorSession(secretA);
assert.equal(session.expiresAt, now + 8 * 60 * 60 * 1000);
assert.equal(session.value.split('.').length, 4);

const cookie = operatorSessionCookie(session.value, session.expiresAt);
assert.match(cookie, /^gt_prototype_operator=/);
assert.match(cookie, /Path=\//);
assert.match(cookie, /HttpOnly/);
assert.match(cookie, /SameSite=Strict/);
assert.match(cookie, /Max-Age=28800/);
assert.equal(cookie.includes('Secure'), false);

const authenticated = requirePrototypeOperator(req(cookieHeaderFromSession(session.value)));
assert.equal(authenticated.mode, 'authenticated');
assert.equal(authenticated.authenticated, true);
assert.equal(authenticated.expiresAt, session.expiresAt);

assert.throws(
  () => requirePrototypeOperator(req()),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'OPERATOR_AUTH_REQUIRED'
);

const tokenParts = session.value.split('.');
const tampered = `${tokenParts[0]}.${tokenParts[1]}.${tokenParts[2]}.${'0'.repeat(tokenParts[3].length)}`;
assert.throws(
  () => requirePrototypeOperator(req(cookieHeaderFromSession(tampered))),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'INVALID_OPERATOR_SESSION'
);

now = session.expiresAt;
assert.throws(
  () => requirePrototypeOperator(req(cookieHeaderFromSession(session.value))),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'EXPIRED_OPERATOR_SESSION'
);

now = session.expiresAt - 1000;
const secretB = 'operator-access-secret-B-abcdef0123456789';
assert.ok(secretB.length >= 32);
processShim.env.PROTOTYPE_OPERATOR_ACCESS_SECRET = secretB;
assert.throws(
  () => requirePrototypeOperator(req(cookieHeaderFromSession(session.value))),
  (error) => error instanceof BankingError && error.status === 401 && error.code === 'INVALID_OPERATOR_SESSION'
);

processShim.env.PROTOTYPE_OPERATOR_ACCESS_SECRET = secretA;
processShim.env.NODE_ENV = 'production';
const productionSession = createPrototypeOperatorSession(secretA);
const productionCookie = operatorSessionCookie(productionSession.value, productionSession.expiresAt);
assert.match(productionCookie, /HttpOnly/);
assert.match(productionCookie, /SameSite=Strict/);
assert.match(productionCookie, /; Secure$/);
const clearCookie = clearOperatorSessionCookie();
assert.match(clearCookie, /Max-Age=0/);
assert.match(clearCookie, /HttpOnly/);
assert.match(clearCookie, /SameSite=Strict/);
assert.match(clearCookie, /; Secure$/);

console.log('Operator authentication runtime behavior checks passed.');
