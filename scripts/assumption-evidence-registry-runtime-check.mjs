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

const mod = { exports: {} };
vm.runInNewContext(transpile('lib/assumption-evidence-registry.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected assumption evidence runtime import: ${specifier}`);
  }
}, { filename: 'assumption-evidence-registry.runtime.cjs' });

const { assumptionEvidenceRegistryStatus, evaluateAssumptionEvidenceCandidate } = mod.exports;
const status = assumptionEvidenceRegistryStatus();

assert.equal(status.registryAvailable, true);
assert.equal(status.slotCount, 22);
assert.equal(status.businessThesisSlotCount, 3);
assert.equal(status.unitEconomicsSlotCount, 7);
assert.equal(status.capitalPlanningSlotCount, 4);
assert.equal(status.threeYearBankPlanSlotCount, 5);
assert.equal(status.sponsorDiligenceSlotCount, 3);
assert.equal(status.evidenceMissingSlotCount, 22);
assert.equal(status.evidenceAuthenticatedSlotCount, 0);
assert.equal(status.validatedAssumptionCount, 0);
assert.equal(status.approvedForSponsorUseCount, 0);
assert.equal(status.approvedForBoardUseCount, 0);
assert.equal(status.approvedForCharterUseCount, 0);
assert.equal(status.persistentEvidenceRepositoryConnected, false);
assert.equal(status.automaticEvidenceAuthenticationEnabled, false);
assert.equal(status.automaticAssumptionValidationEnabled, false);
assert.equal(status.automaticReadinessPromotionEnabled, false);
assert.equal(status.approvedForInvestorForecasts, false);
assert.equal(status.approvedForSponsorDiligence, false);
assert.equal(status.approvedForBoardPlan, false);
assert.equal(status.approvedForCharterApplication, false);
assert.ok(status.slots.every((item) => item.status === 'evidence-missing'));
assert.ok(status.slots.every((item) => item.evidenceAuthenticated === false));
assert.ok(status.slots.every((item) => item.assumptionValidated === false));
assert.ok(status.slots.every((item) => item.approvedForCharterUse === false));

const scenario = evaluateAssumptionEvidenceCandidate({
  slotId: 'retained-interchange',
  assumptionLabel: 'Illustrative retained interchange scenario',
  valueOrMethodology: 'Operator-entered scenario only; exact selected-program economics are not yet available.',
  unitsOrInterpretation: 'Basis points retained after program/network/provider economics, once known.',
  evidenceClass: 'operator-scenario',
  evidenceReference: 'scenario-reference-only',
  evidenceAsOf: '2026-08-30',
  accountableHumanRole: 'future finance/program owner - unassigned',
  qualifiedReviewerRole: 'qualified finance/program reviewer',
  sensitivityRangeOrMethod: 'Run low/base/high scenarios once supported ranges are sourced.',
  downsideCase: 'Lower retained economics and higher provider minimums.',
  dependencies: 'Selected sponsor/program, network, card program, volume tiers, reserves, and contract terms.',
  linkedDecisionOrProjection: 'Unit economics and three-year revenue projection.',
  knownLimitations: 'No provider selected and no commercial terms authenticated.',
  reviewedAt: '2026-08-30'
});

assert.equal(scenario.structurallyCompleteForEvidenceReview, true);
assert.equal(scenario.scenarioOnly, true);
assert.equal(scenario.evidenceAuthenticated, false);
assert.equal(scenario.evidenceCurrentEnoughForDecisionVerified, false);
assert.equal(scenario.accountableOwnerAssignmentVerified, false);
assert.equal(scenario.qualifiedReviewCompleted, false);
assert.equal(scenario.assumptionValidated, false);
assert.equal(scenario.methodologyApproved, false);
assert.equal(scenario.sensitivityValidated, false);
assert.equal(scenario.downsideCaseValidated, false);
assert.equal(scenario.linkedFinancialSchedulesReconciled, false);
assert.equal(scenario.approvedForInvestorUse, false);
assert.equal(scenario.approvedForSponsorUse, false);
assert.equal(scenario.approvedForBoardUse, false);
assert.equal(scenario.approvedForCharterUse, false);
assert.equal(scenario.readinessPromotionAllowed, false);

const external = evaluateAssumptionEvidenceCandidate({
  ...scenario.candidate,
  slotId: 'provider-card-costs',
  assumptionLabel: 'Future exact provider quote',
  evidenceClass: 'provider-quote-or-contract',
  evidenceReference: 'private-provider-quote-reference'
});
assert.equal(external.scenarioOnly, false);
assert.equal(external.evidenceAuthenticated, false);
assert.equal(external.assumptionValidated, false);
assert.equal(external.approvedForSponsorUse, false);

assert.throws(
  () => evaluateAssumptionEvidenceCandidate({ ...scenario.candidate, slotId: 'unknown-slot' }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_ASSUMPTION_EVIDENCE_SLOT'
);
assert.throws(
  () => evaluateAssumptionEvidenceCandidate({ ...scenario.candidate, evidenceClass: 'verified-by-ai' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_ASSUMPTION_EVIDENCE_CLASS'
);
assert.throws(
  () => evaluateAssumptionEvidenceCandidate({ ...scenario.candidate, evidenceAsOf: 'today' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_ASSUMPTION_EVIDENCE_INPUT'
);

console.log('Assumption evidence no-default, missing-evidence, scenario-vs-source, non-authentication, non-validation, and non-promotion runtime checks passed.');
