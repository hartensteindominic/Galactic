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

const source = fs.readFileSync('lib/banking-http.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'banking-http.ts'
}).outputText;

let idCounter = 0;
const logged = [];
const moduleShim = { exports: {} };
const consoleShim = {
  error: (...args) => logged.push(args),
  log: console.log,
  warn: console.warn
};

const NextResponse = {
  json(data, options = {}) {
    return {
      status: options.status ?? 200,
      headers: new Headers(options.headers),
      data
    };
  }
};

vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console: consoleShim,
  Headers,
  Error,
  crypto: {
    randomUUID() {
      idCounter += 1;
      return `00000000-0000-4000-8000-${String(idCounter).padStart(12, '0')}`;
    }
  },
  require(specifier) {
    if (specifier === 'next/server') return { NextResponse };
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected banking-http runtime import: ${specifier}`);
  }
}, { filename: 'banking-http.runtime.cjs' });

const { bankingJson, bankingErrorResponse } = moduleShim.exports;

const normal = bankingJson({ ok: true }, 201, {
  'X-Test': 'present',
  'Cache-Control': 'public, max-age=999'
});
assert.equal(normal.status, 201);
assert.equal(normal.data.ok, true);
assert.equal(normal.headers.get('X-Test'), 'present');
assert.equal(normal.headers.get('Cache-Control'), 'no-store, max-age=0');
assert.equal(normal.headers.get('Pragma'), 'no-cache');

const controlled = bankingErrorResponse(new BankingError(422, 'CONTROLLED_FAILURE', 'Safe controlled message.'));
assert.equal(controlled.status, 422);
assert.equal(controlled.data.ok, false);
assert.equal(controlled.data.error.code, 'CONTROLLED_FAILURE');
assert.equal(controlled.data.error.message, 'Safe controlled message.');
assert.equal(controlled.data.error.errorId, '00000000-0000-4000-8000-000000000001');
assert.equal(controlled.headers.get('X-Error-ID'), controlled.data.error.errorId);
assert.equal(controlled.headers.get('Cache-Control'), 'no-store, max-age=0');
assert.equal(logged.length, 0);

const syntheticSecret = 'provider-secret-TOP-SECRET-DO-NOT-LOG';
const internal = bankingErrorResponse(new Error(`Unexpected provider failure ${syntheticSecret}`));
assert.equal(internal.status, 500);
assert.equal(internal.data.ok, false);
assert.equal(internal.data.error.code, 'INTERNAL_ERROR');
assert.equal(internal.data.error.message, 'Banking service is temporarily unavailable.');
assert.equal(internal.data.error.errorId, '00000000-0000-4000-8000-000000000002');
assert.equal(internal.headers.get('X-Error-ID'), internal.data.error.errorId);
assert.equal(JSON.stringify(internal.data).includes(syntheticSecret), false);
assert.equal(JSON.stringify(internal.data).includes('Unexpected provider failure'), false);
assert.equal(logged.length, 1);
assert.equal(logged[0][0], 'Unexpected banking API error');
const loggedText = JSON.stringify(logged[0]);
assert.equal(loggedText.includes(syntheticSecret), false);
assert.equal(loggedText.includes('Unexpected provider failure'), false);
assert.equal(loggedText.includes('stack'), false);
assert.equal(logged[0][1].name, 'Error');
assert.equal(logged[0][1].errorId, internal.data.error.errorId);

const objectSecret = 'object-secret-NEVER-LOG';
const unknown = bankingErrorResponse({ payload: objectSecret });
assert.equal(unknown.status, 500);
assert.equal(unknown.data.error.code, 'INTERNAL_ERROR');
assert.notEqual(unknown.data.error.errorId, internal.data.error.errorId);
assert.equal(JSON.stringify(unknown.data).includes(objectSecret), false);
assert.equal(logged.length, 2);
assert.equal(logged[1][1].name, 'UnknownError');
assert.equal(JSON.stringify(logged[1]).includes(objectSecret), false);

console.log('Banking HTTP error sanitization runtime behavior checks passed.');
