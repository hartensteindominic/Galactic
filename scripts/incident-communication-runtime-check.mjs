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

function transpile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: file
  }).outputText;
}

const financialModule = { exports: {} };
vm.runInNewContext(transpile('lib/financial-intent-state.ts'), {
  module: financialModule,
  exports: financialModule.exports,
  console,
  Set,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected financial-intent runtime import: ${specifier}`);
  }
}, { filename: 'financial-intent-state.runtime.cjs' });

const incidentModule = { exports: {} };
vm.runInNewContext(transpile('lib/prototype-incident-status.ts'), {
  module: incidentModule,
  exports: incidentModule.exports,
  console,
  require(specifier) {
    if (specifier === './financial-intent-state') return financialModule.exports;
    throw new Error(`Unexpected incident-status runtime import: ${specifier}`);
  }
}, { filename: 'prototype-incident-status.runtime.cjs' });

const {
  buildPrototypeCustomerIncidentStatus,
  prototypeIncidentCommunicationControlStatus
} = incidentModule.exports;

function assertNoFalseTerminalClaim(status) {
  assert.equal(/\bfailed\b/i.test(status.headline), false, 'unknown status headline must not claim failure');
  assert.equal(/\bfailed\b/i.test(status.message), false, 'unknown status message must not claim failure');
  assert.equal(/\bcompleted\b/i.test(status.headline), false, 'unknown status headline must not claim completion');
  assert.equal(/\bcompleted\b/i.test(status.message), false, 'unknown status message must not claim completion');
}

let status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'created',
  moneyMovementFrozen: false
});
assert.equal(status.simulationOnly, true);
assert.equal(status.availability, 'prototype-only');
assert.equal(status.transactionStatus, 'not-submitted');
assert.equal(status.finalOutcomeKnown, false);
assert.equal(status.mayStillProcess, false);
assert.equal(status.replacementInstructionAllowed, false);
assert.equal(status.automaticReplacementAllowed, false);

status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'created',
  moneyMovementFrozen: true
});
assert.equal(status.availability, 'temporarily-unavailable');
assert.equal(status.transactionStatus, 'not-submitted');
assert.match(status.message, /No transaction outcome should be inferred/i);

for (const state of ['submitted', 'pending_unknown']) {
  status = buildPrototypeCustomerIncidentStatus({
    financialIntentState: state,
    moneyMovementFrozen: true
  });
  assert.equal(status.availability, 'temporarily-unavailable');
  assert.equal(status.transactionStatus, 'awaiting-confirmation');
  assert.equal(status.finalOutcomeKnown, false);
  assert.equal(status.mayStillProcess, true);
  assert.equal(status.replacementInstructionAllowed, false);
  assert.equal(status.automaticReplacementAllowed, false);
  assert.match(status.message, /already submitted may still be processing|may still be processing/i);
  assert.match(status.message, /Do not create a replacement instruction/i);
  assertNoFalseTerminalClaim(status);
}

status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'pending_unknown',
  moneyMovementFrozen: false
});
assert.equal(status.availability, 'prototype-only');
assert.equal(status.transactionStatus, 'awaiting-confirmation');
assertNoFalseTerminalClaim(status);

status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'succeeded',
  moneyMovementFrozen: true
});
assert.equal(status.availability, 'temporarily-unavailable');
assert.equal(status.transactionStatus, 'confirmed-completed');
assert.equal(status.finalOutcomeKnown, true);
assert.equal(status.mayStillProcess, false);
assert.equal(status.replacementInstructionAllowed, false);
assert.match(status.message, /authoritative simulated success evidence/i);

status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'failed',
  moneyMovementFrozen: true
});
assert.equal(status.transactionStatus, 'confirmed-failed');
assert.equal(status.finalOutcomeKnown, true);
assert.equal(status.replacementInstructionAllowed, true);
assert.match(status.message, /authoritative simulated failure evidence/i);

status = buildPrototypeCustomerIncidentStatus({
  financialIntentState: 'cancelled',
  moneyMovementFrozen: false
});
assert.equal(status.transactionStatus, 'cancelled-before-submission');
assert.equal(status.finalOutcomeKnown, true);
assert.equal(status.replacementInstructionAllowed, true);
assert.match(status.message, /cancelled before submission/i);

const controls = prototypeIncidentCommunicationControlStatus();
assert.equal(controls.explicitTemporaryUnavailableVsTransactionOutcome, true);
assert.equal(controls.unknownOutcomeDoesNotBecomeFailure, true);
assert.equal(controls.alreadySubmittedMayStillProcessDisclosed, true);
assert.equal(controls.replacementBlockedWhileOutcomeUnknown, true);
assert.equal(controls.automaticReplacementAllowed, false);
assert.equal(controls.productionCustomerStatusChannelConnected, false);
assert.equal(controls.approvedIncidentMessageWorkflowConnected, false);
assert.equal(controls.productionHumanSupportPathConnected, false);
assert.equal(controls.customerVisibleStatusTimingVerified, false);

console.log('Incident communication and unknown-transaction customer-status runtime checks passed.');
