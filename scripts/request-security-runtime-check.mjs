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

const source = fs.readFileSync('lib/request-security.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'request-security.ts'
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  Request,
  Headers,
  TextEncoder,
  URL,
  JSON,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected request-security runtime import: ${specifier}`);
  }
}, { filename: 'request-security.runtime.cjs' });

const {
  requireJsonRequest,
  readJsonBodyLimited,
  requireTrustedOrigin,
  safeClientIp
} = moduleShim.exports;

function request(body = '', headers = {}, url = 'https://galactic.example/api/test') {
  return new Request(url, {
    method: body ? 'POST' : 'GET',
    headers,
    ...(body ? { body } : {})
  });
}

requireJsonRequest(request('{}', { 'content-type': 'application/json' }));
requireJsonRequest(request('{}', { 'content-type': 'Application/JSON; charset=utf-8' }));
assert.throws(
  () => requireJsonRequest(request('{}', { 'content-type': 'text/plain' })),
  (error) => error instanceof BankingError && error.status === 415 && error.code === 'JSON_REQUIRED'
);
assert.throws(
  () => requireJsonRequest(request('{}')),
  (error) => error instanceof BankingError && error.status === 415 && error.code === 'JSON_REQUIRED'
);

const parsed = await readJsonBodyLimited(request('{"amount":25}', { 'content-type': 'application/json' }), 64);
assert.equal(parsed.amount, 25);

await assert.rejects(
  () => readJsonBodyLimited(request('{broken', { 'content-type': 'application/json' }), 64),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'INVALID_JSON'
);

const oversized = JSON.stringify({ note: 'x'.repeat(80) });
await assert.rejects(
  () => readJsonBodyLimited(request(oversized, { 'content-type': 'application/json' }), 32),
  (error) => error instanceof BankingError && error.status === 413 && error.code === 'REQUEST_BODY_TOO_LARGE'
);

const emojiBody = JSON.stringify({ note: '💫💫' });
const emojiCharacters = emojiBody.length;
const emojiBytes = new TextEncoder().encode(emojiBody).byteLength;
assert.ok(emojiBytes > emojiCharacters, 'fixture must prove byte length differs from JS string length');
await assert.rejects(
  () => readJsonBodyLimited(request(emojiBody, { 'content-type': 'application/json' }), emojiCharacters),
  (error) => error instanceof BankingError && error.status === 413 && error.code === 'REQUEST_BODY_TOO_LARGE'
);

requireTrustedOrigin(request('', {}));
requireTrustedOrigin(request('', { origin: 'https://galactic.example' }));
assert.throws(
  () => requireTrustedOrigin(request('', { origin: 'https://attacker.example' })),
  (error) => error instanceof BankingError && error.status === 403 && error.code === 'UNTRUSTED_ORIGIN'
);

assert.equal(
  safeClientIp(request('', { 'x-forwarded-for': ' 203.0.113.10 , 198.51.100.20' })),
  '203.0.113.10'
);
assert.equal(safeClientIp(request('', {})), 'unknown');
const longIpLikeValue = 'a'.repeat(120);
assert.equal(safeClientIp(request('', { 'x-forwarded-for': longIpLikeValue })).length, 80);

console.log('Request security runtime behavior checks passed.');
