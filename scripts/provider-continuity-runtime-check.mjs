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
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file
  }).outputText;
}

const moduleBox = { exports: {} };
vm.runInNewContext(transpile('lib/provider-continuity.ts'), {
  module: moduleBox,
  exports: moduleBox.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected provider continuity import: ${specifier}`);
  }
}, { filename: 'provider-continuity.runtime.cjs' });

const { evaluateProviderContinuityEvent, providerContinuityControlStatus } = moduleBox.exports;

const base = {
  trigger: 'provider-outage',
  actor: 'system-detection',
  authoritativeProviderStatusKnown: false,
  customerFundsAccessImpactKnown: false,
  approvedMigrationPlanExists: false,
  destinationProviderApproved: false,
  authoritativeBalanceExportAvailable: false,
  reconciliationCompleted: false,
  customerCommunicationApproved: false
};

const outageUnknown = evaluateProviderContinuityEvent(base);
assert.equal(outageUnknown.state, 'customer-protection-only');
assert.equal(outageUnknown.newFinancialInstructionsAllowed, false);
assert.equal(outageUnknown.protectiveActionsAllowed, true);
assert.equal(outageUnknown.automaticProviderSwitchAllowed, false);
assert.equal(outageUnknown.automaticInstructionReroutingAllowed, false);
assert.equal(outageUnknown.automaticCustomerFundsMigrationAllowed, false);
assert.equal(outageUnknown.existingUnknownInstructionsRemainUnknown, true);
assert.equal(outageUnknown.replacementInstructionsAutomaticallyCreated, false);

const outageKnown = evaluateProviderContinuityEvent({ ...base, authoritativeProviderStatusKnown: true });
assert.equal(outageKnown.state, 'provider-unavailable');
assert.equal(outageKnown.newFinancialInstructionsAllowed, false);

const termination = evaluateProviderContinuityEvent({
  ...base,
  trigger: 'contract-termination-notice',
  actor: 'authorized-operator',
  authoritativeProviderStatusKnown: true
});
assert.equal(termination.state, 'migration-preparation');
assert.equal(termination.automaticProviderSwitchAllowed, false);

const partialMigration = evaluateProviderContinuityEvent({
  ...base,
  trigger: 'contract-termination-notice',
  actor: 'approved-human-governance',
  authoritativeProviderStatusKnown: true,
  approvedMigrationPlanExists: true,
  destinationProviderApproved: true
});
assert.equal(partialMigration.state, 'migration-preparation');
assert.equal(partialMigration.automaticCustomerFundsMigrationAllowed, false);

const completePlanningPackage = evaluateProviderContinuityEvent({
  ...base,
  trigger: 'contract-termination-notice',
  actor: 'approved-human-governance',
  authoritativeProviderStatusKnown: true,
  customerFundsAccessImpactKnown: true,
  approvedMigrationPlanExists: true,
  destinationProviderApproved: true,
  authoritativeBalanceExportAvailable: true,
  reconciliationCompleted: true,
  customerCommunicationApproved: true
});
assert.equal(completePlanningPackage.state, 'exit-in-progress');
assert.equal(completePlanningPackage.newFinancialInstructionsAllowed, false);
assert.equal(completePlanningPackage.automaticProviderSwitchAllowed, false);
assert.equal(completePlanningPackage.automaticInstructionReroutingAllowed, false);
assert.equal(completePlanningPackage.automaticCustomerFundsMigrationAllowed, false);
assert.equal(completePlanningPackage.productionMigrationExecutionImplemented, false);
assert.equal(completePlanningPackage.productionProviderContinuityPlanApproved, false);

const controls = providerContinuityControlStatus();
assert.equal(controls.providerExitStateModelImplemented, true);
assert.equal(controls.automaticProviderSwitchEnabled, false);
assert.equal(controls.automaticFinancialInstructionReroutingEnabled, false);
assert.equal(controls.automaticCustomerFundsMigrationEnabled, false);
assert.equal(controls.unknownInstructionReplacementEnabled, false);
assert.equal(controls.providerOutageBlocksNewInstructionsInModel, true);
assert.equal(controls.protectiveActionsRemainAvailableInModel, true);
assert.equal(controls.productionMigrationExecutionImplemented, false);
assert.equal(controls.providerContractTerminationTermsReviewed, false);
assert.equal(controls.providerDataPortabilityVerified, false);
assert.equal(controls.alternateProviderProgramApproved, false);
assert.equal(controls.productionProviderContinuityPlanApproved, false);
assert.equal(controls.providerExitExerciseVerified, false);

console.log('Provider continuity outage, termination, migration-evidence, no-reroute, and no-automatic-funds-migration runtime checks passed.');
