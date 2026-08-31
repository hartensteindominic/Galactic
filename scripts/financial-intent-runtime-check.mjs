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

const source = fs.readFileSync('lib/financial-intent-state.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'financial-intent-state.ts'
}).outputText;

const moduleShim = { exports: {} };
const sandbox = {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  Set,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected runtime import: ${specifier}`);
  }
};
vm.runInNewContext(transpiled, sandbox, { filename: 'financial-intent-state.runtime.cjs' });

const {
  financialIntentStatus,
  transitionFinancialIntent,
  requireAuthoritativeTerminalState,
  requireSafeReplacementEligibility,
  financialIntentControlStatus
} = moduleShim.exports;

assert.equal(transitionFinancialIntent('created', 'submit'), 'submitted');
assert.equal(transitionFinancialIntent('submitted', 'provider_acknowledged'), 'submitted');
assert.equal(transitionFinancialIntent('submitted', 'response_ambiguous'), 'pending_unknown');
assert.equal(transitionFinancialIntent('pending_unknown', 'response_ambiguous'), 'pending_unknown');
assert.equal(transitionFinancialIntent('pending_unknown', 'provider_acknowledged'), 'pending_unknown');

const unknownStatus = financialIntentStatus('pending_unknown');
assert.equal(unknownStatus.terminal, false);
assert.equal(unknownStatus.outcomeAuthoritative, false);
assert.equal(unknownStatus.replacementIntentAllowed, false);
assert.equal(unknownStatus.automaticReplacementAllowed, false);
assert.match(unknownStatus.customerStatus, /final status is not yet confirmed/);

assert.throws(
  () => requireAuthoritativeTerminalState('pending_unknown'),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'FINANCIAL_INTENT_OUTCOME_UNKNOWN'
);
assert.throws(
  () => requireSafeReplacementEligibility('pending_unknown'),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'REPLACEMENT_BLOCKED_WHILE_OUTCOME_UNKNOWN'
);
assert.throws(
  () => requireSafeReplacementEligibility('submitted'),
  (error) => error instanceof BankingError && error.code === 'REPLACEMENT_BLOCKED_WHILE_OUTCOME_UNKNOWN'
);

assert.equal(transitionFinancialIntent('pending_unknown', 'provider_confirmed_success'), 'succeeded');
const successStatus = financialIntentStatus('succeeded');
assert.equal(successStatus.terminal, true);
assert.equal(successStatus.outcomeAuthoritative, true);
assert.equal(successStatus.replacementIntentAllowed, false);
assert.equal(requireAuthoritativeTerminalState('succeeded'), 'succeeded');
assert.throws(
  () => requireSafeReplacementEligibility('succeeded'),
  (error) => error instanceof BankingError && error.code === 'REPLACEMENT_BLOCKED_AFTER_SUCCESS'
);

assert.equal(transitionFinancialIntent('submitted', 'provider_confirmed_failure'), 'failed');
assert.equal(requireAuthoritativeTerminalState('failed'), 'failed');
assert.equal(requireSafeReplacementEligibility('failed'), true);
assert.equal(transitionFinancialIntent('created', 'cancel_before_submission'), 'cancelled');
assert.equal(requireSafeReplacementEligibility('cancelled'), true);

assert.throws(
  () => transitionFinancialIntent('succeeded', 'response_ambiguous'),
  (error) => error instanceof BankingError && error.status === 409 && error.code === 'INVALID_FINANCIAL_INTENT_TRANSITION'
);
assert.throws(
  () => transitionFinancialIntent('created', 'provider_confirmed_success'),
  (error) => error instanceof BankingError && error.code === 'INVALID_FINANCIAL_INTENT_TRANSITION'
);

const controls = financialIntentControlStatus();
assert.equal(controls.explicitUnknownState, true);
assert.equal(controls.timeoutIsNotFailure, true);
assert.equal(controls.automaticReplacementAllowed, false);
assert.equal(controls.replacementBlockedWhileUnknown, true);
assert.equal(controls.authoritativeTerminalEvidenceRequired, true);
assert.equal(controls.productionProviderStateMappingVerified, false);

console.log('Financial intent runtime behavior checks passed.');
