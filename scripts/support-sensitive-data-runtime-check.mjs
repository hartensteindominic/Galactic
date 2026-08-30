import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/support-sensitive-data.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'support-sensitive-data.ts'
}).outputText;

const moduleShim = { exports: {} };
const sandbox = {
  module: moduleShim,
  exports: moduleShim.exports,
  console
};
vm.runInNewContext(transpiled, sandbox, { filename: 'support-sensitive-data.runtime.cjs' });

const { detectSupportSensitiveData, supportSensitiveDataControlStatus } = moduleShim.exports;
assert.equal(typeof detectSupportSensitiveData, 'function');
assert.equal(typeof supportSensitiveDataControlStatus, 'function');

function categories(input) {
  return new Set(detectSupportSensitiveData(input));
}

const syntheticTestCard = ['4242', '4242', '4242', '4242'].join('');
const invalidLongNumber = `${syntheticTestCard.slice(0, -1)}3`;
const syntheticInvalidSsn = ['000', '00', '0000'].join('-');
const syntheticRouting = ['021', '000', '021'].join('');
const syntheticApiToken = `sk-${'A'.repeat(20)}`;

assert.equal(categories(`card ${syntheticTestCard}`).has('payment-card'), true, 'Luhn-valid synthetic card pattern should be blocked');
assert.equal(categories(`reference ${invalidLongNumber}`).has('payment-card'), false, 'arbitrary long invalid number should not be treated as a payment card');
assert.equal(categories(`ssn ${syntheticInvalidSsn}`).has('ssn'), true, 'SSN-shaped value should be blocked');
assert.equal(categories(`routing number: ${syntheticRouting}`).has('account-or-routing-number'), true, 'context-qualified routing value should be blocked');
assert.equal(categories('verification code 123456').has('authentication-code'), true, 'OTP-shaped authentication code should be blocked');
assert.equal(categories('password=example-not-real').has('password-or-passcode'), true, 'assigned password-like value should be blocked');
assert.equal(categories(`token ${syntheticApiToken}`).has('api-or-private-key'), true, 'API-key-shaped value should be blocked');
assert.equal(categories('My card ends in 4242.').size, 0, 'masked last-four description should remain usable');
assert.equal(categories('My reference is 1234567890.').has('account-or-routing-number'), false, 'unqualified general number should not be treated as account/routing data');
assert.equal(categories('How do transfers work?').size, 0, 'ordinary support question should remain usable');

const status = supportSensitiveDataControlStatus();
assert.equal(status.clientPreflightDetectionAvailable, true);
assert.equal(status.serverRejectionRequired, true);
assert.equal(status.detectedValuesReturnedToClient, false);
assert.equal(status.detectionIsNotADataLossPreventionSystem, true);

console.log('Support sensitive-data runtime behavior checks passed.');
