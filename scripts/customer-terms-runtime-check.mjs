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

const source = fs.readFileSync('lib/customer-terms-control.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'customer-terms-control.ts'
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected customer-terms runtime import: ${specifier}`);
  }
}, { filename: 'customer-terms-control.runtime.cjs' });

const {
  getPrototypeCustomerTerms,
  customerTermsControlStatus,
  requireApprovedLiveCustomerTerms,
  getCustomerTermsForRuntime
} = moduleShim.exports;

const defaultTerms = getPrototypeCustomerTerms();
assert.equal(defaultTerms.tenantKey, 'galactic-trust');
assert.equal(defaultTerms.version, 'prototype-terms-v1');
assert.equal(defaultTerms.status, 'prototype-only');
assert.equal(defaultTerms.effectiveAt, null);
assert.equal(defaultTerms.liveTermsApproved, false);
assert.equal(defaultTerms.accountFeeLabel, '$0 demo fee');
assert.equal(defaultTerms.sandboxLinkFeeLabel, '$0 prototype charge');
assert.match(defaultTerms.depositInsuranceDisclosure, /not represented as insured deposits/i);
assert.match(defaultTerms.transferDisclosure, /synthetic ledger value/i);
assert.match(defaultTerms.cashflowDisclosure, /simulation-only planning estimate/i);
assert.match(defaultTerms.changingTermsDisclosure, /must not be invented/i);

const tenantTerms = getPrototypeCustomerTerms('orbit-demo');
assert.equal(tenantTerms.tenantKey, 'orbit-demo');
assert.equal(tenantTerms.version, defaultTerms.version);
assert.equal(tenantTerms.liveTermsApproved, false);

const runtimeDemo = getCustomerTermsForRuntime('demo', 'tenant-one');
assert.equal(runtimeDemo.tenantKey, 'tenant-one');
assert.equal(runtimeDemo.status, 'prototype-only');
assert.equal(runtimeDemo.liveTermsApproved, false);

assert.throws(
  () => requireApprovedLiveCustomerTerms(),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'APPROVED_CUSTOMER_TERMS_UNAVAILABLE'
);
assert.throws(
  () => getCustomerTermsForRuntime('partner', 'galactic-trust'),
  (error) => error instanceof BankingError && error.status === 503 && error.code === 'APPROVED_CUSTOMER_TERMS_UNAVAILABLE'
);

const status = customerTermsControlStatus();
assert.equal(status.controlledPrototypeTermsImplemented, true);
assert.equal(status.prototypeTermsVersion, 'prototype-terms-v1');
assert.equal(status.versionedLiveTermsRequired, true);
assert.equal(status.liveTermsAdapterImplemented, false);
assert.equal(status.liveTermsPublishingEnabled, false);
assert.equal(status.externalApprovalEvidenceVerified, false);
assert.equal(status.approvedCustomerTermsSourceOfTruthReady, false);
assert.equal(status.unsupportedLiveTermsFailClosed, true);

console.log('Customer terms runtime behavior checks passed.');
