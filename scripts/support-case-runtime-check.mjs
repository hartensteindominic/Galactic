import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/support-case-state.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'support-case-state.ts'
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  Set
}, { filename: 'support-case-state.runtime.cjs' });

const {
  isMaterialSupportCase,
  canTransitionSupportCase,
  canAutomationCloseSupportCase,
  supportCaseControlStatus
} = moduleShim.exports;

for (const kind of ['complaint', 'fraud-dispute', 'identity', 'credit', 'aml-sanctions', 'legal-regulatory']) {
  assert.equal(isMaterialSupportCase(kind), true, `${kind} must require material-case handling`);
}
assert.equal(isMaterialSupportCase('privacy'), false);
assert.equal(isMaterialSupportCase('general'), false);

assert.equal(canTransitionSupportCase('detected', 'handoff_required', 'automation'), true);
assert.equal(canTransitionSupportCase('detected', 'handoff_required', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('detected', 'human_acknowledged', 'automation'), false);
assert.equal(canTransitionSupportCase('handoff_required', 'human_acknowledged', 'automation'), false);
assert.equal(canTransitionSupportCase('handoff_required', 'human_acknowledged', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('human_acknowledged', 'in_review', 'automation'), false);
assert.equal(canTransitionSupportCase('human_acknowledged', 'in_review', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('human_acknowledged', 'resolved', 'automation'), false);
assert.equal(canTransitionSupportCase('human_acknowledged', 'resolved', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('human_acknowledged', 'closed_no_action', 'automation'), false);
assert.equal(canTransitionSupportCase('human_acknowledged', 'closed_no_action', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('in_review', 'resolved', 'automation'), false);
assert.equal(canTransitionSupportCase('in_review', 'resolved', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('in_review', 'closed_no_action', 'automation'), false);
assert.equal(canTransitionSupportCase('in_review', 'closed_no_action', 'authorized-human'), true);
assert.equal(canTransitionSupportCase('resolved', 'in_review', 'authorized-human'), false);
assert.equal(canTransitionSupportCase('resolved', 'closed_no_action', 'authorized-human'), false);
assert.equal(canTransitionSupportCase('closed_no_action', 'resolved', 'authorized-human'), false);
assert.equal(canAutomationCloseSupportCase(), false);

const status = supportCaseControlStatus();
assert.equal(status.explicitCaseStateModelImplemented, true);
assert.equal(status.materialCasesRequireHumanHandoff, true);
assert.equal(status.automationMayDetectAndRoute, true);
assert.equal(status.automationMayAcknowledgeAsHuman, false);
assert.equal(status.automationMayResolveCase, false);
assert.equal(status.automationMayCloseCase, false);
assert.equal(status.humanAcknowledgementRequiredBeforeReview, true);
assert.equal(status.approvedProductionCaseSystemConnected, false);
assert.equal(status.approvedProductionResponseDeadlinesConfigured, false);
assert.equal(status.productionHumanHandoffExercised, false);
assert.match(status.disclosure, /does not operate a production complaint\/dispute case-management system/i);

console.log('Support case runtime behavior checks passed.');
