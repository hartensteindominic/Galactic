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

const capitalModule = { exports: {} };
vm.runInNewContext(transpile('lib/capital-planning.ts'), {
  module: capitalModule,
  exports: capitalModule.exports,
  console,
  Number,
  Math,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected capital planning runtime import: ${specifier}`);
  }
}, { filename: 'capital-planning.runtime.cjs' });

const { calculateCapitalPlanningScenario, capitalPlanningControlStatus } = capitalModule.exports;

const base = {
  label: 'Internal planning test',
  planningTargetOpeningCapitalCents: 100000000,
  documentedCommittedCapitalCents: 60000000,
  documentedVerifiedSourceOfFundsCents: 30000000,
  cashCurrentlyAvailableForProjectCents: 24000000,
  plannedPreOpeningOneTimeCostsCents: 12000000,
  monthlyFintechOperatingBurnCents: 2000000,
  monthlyBankOrganizationPreOpeningBurnCents: 1000000,
  modeledMonthsUntilOpening: 6,
  internalContingencyReserveCents: 6000000
};

const result = calculateCapitalPlanningScenario(base);
assert.equal(result.target.planningTargetOpeningCapitalCents, 100000000);
assert.equal(result.target.targetSource, 'operator-entered-assumption');
assert.equal(result.target.regulatorySufficiencyVerified, false);
assert.equal(result.funding.commitmentCoverageBps, 6000);
assert.equal(result.funding.verifiedSourceCoverageBps, 5000);
assert.equal(result.funding.planningCapitalGapCents, 40000000);
assert.equal(result.preOpening.modeledOperatingBurnUntilOpeningCents, 18000000);
assert.equal(result.preOpening.modeledTotalPreOpeningCashNeedCents, 36000000);
assert.equal(result.preOpening.modeledCashGapBeforeOpeningCents, 12000000);
assert.equal(result.preOpening.currentCashRunwayMonths, 8);
assert.equal(result.limitations.planningOnly, true);
assert.equal(result.limitations.assumptionsValidated, false);
assert.equal(result.limitations.regulatoryCapitalCalculationImplemented, false);
assert.equal(result.limitations.riskWeightedAssetsModeled, false);
assert.equal(result.limitations.leverageRatioModeled, false);
assert.equal(result.limitations.liquidityRequirementModeled, false);
assert.equal(result.limitations.sourceOfFundsAuthenticityVerifiedBySoftware, false);
assert.equal(result.limitations.capitalPlanReviewedByQualifiedAdvisers, false);
assert.equal(result.limitations.capitalPlanReviewedByRegulator, false);
assert.equal(result.limitations.charterCapitalRequirementDetermined, false);
assert.equal(result.limitations.approvedForFundraising, false);
assert.equal(result.limitations.approvedForCharterApplication, false);

const zeroTarget = calculateCapitalPlanningScenario({
  ...base,
  planningTargetOpeningCapitalCents: 0,
  documentedCommittedCapitalCents: 0,
  documentedVerifiedSourceOfFundsCents: 0,
  monthlyFintechOperatingBurnCents: 0,
  monthlyBankOrganizationPreOpeningBurnCents: 0,
  modeledMonthsUntilOpening: 0,
  plannedPreOpeningOneTimeCostsCents: 0,
  internalContingencyReserveCents: 0
});
assert.equal(zeroTarget.funding.commitmentCoverageBps, null);
assert.equal(zeroTarget.funding.verifiedSourceCoverageBps, null);
assert.equal(zeroTarget.preOpening.currentCashRunwayMonths, null);

for (const invalid of [
  { ...base, planningTargetOpeningCapitalCents: -1 },
  { ...base, documentedCommittedCapitalCents: 1.5 },
  { ...base, modeledMonthsUntilOpening: 121 },
  { ...base, cashCurrentlyAvailableForProjectCents: -1 },
  { ...base, planningTargetOpeningCapitalCents: 1000000000001 }
]) {
  assert.throws(
    () => calculateCapitalPlanningScenario(invalid),
    (error) => error instanceof BankingError && error.status === 400 && error.code === 'INVALID_CAPITAL_PLANNING_INPUT'
  );
}

const boundedMaximum = calculateCapitalPlanningScenario({
  ...base,
  planningTargetOpeningCapitalCents: 1000000000000,
  documentedCommittedCapitalCents: 1000000000000,
  documentedVerifiedSourceOfFundsCents: 1000000000000,
  cashCurrentlyAvailableForProjectCents: 1000000000000,
  plannedPreOpeningOneTimeCostsCents: 1000000000000,
  monthlyFintechOperatingBurnCents: 1000000000000,
  monthlyBankOrganizationPreOpeningBurnCents: 1000000000000,
  modeledMonthsUntilOpening: 120,
  internalContingencyReserveCents: 1000000000000
});
assert.equal(Number.isSafeInteger(boundedMaximum.preOpening.modeledOperatingBurnUntilOpeningCents), true);
assert.equal(Number.isSafeInteger(boundedMaximum.preOpening.modeledTotalPreOpeningCashNeedCents), true);
assert.equal(Number.isSafeInteger(boundedMaximum.preOpening.modeledCashGapBeforeOpeningCents), true);
assert.equal(Number.isFinite(boundedMaximum.preOpening.currentCashRunwayMonths), true);

const controls = capitalPlanningControlStatus();
assert.equal(controls.assumptionDrivenPlanningEngineImplemented, true);
assert.equal(controls.containsDefaultCharterCapitalAmount, false);
assert.equal(controls.operatorEnteredOpeningCapitalTargetRequired, true);
assert.equal(controls.regulatoryCapitalCalculationImplemented, false);
assert.equal(controls.riskWeightedAssetsModeled, false);
assert.equal(controls.leverageRatioModeled, false);
assert.equal(controls.liquidityRequirementModeled, false);
assert.equal(controls.sourceOfFundsAuthenticityVerifiedBySoftware, false);
assert.equal(controls.assumptionsValidated, false);
assert.equal(controls.capitalPlanReviewedByQualifiedAdvisers, false);
assert.equal(controls.capitalPlanReviewedByRegulator, false);
assert.equal(controls.charterCapitalRequirementDetermined, false);
assert.equal(controls.approvedForFundraising, false);
assert.equal(controls.approvedForCharterApplication, false);

console.log('Assumption-driven capital planning, gap/runway arithmetic, bounded-maximum, invalid-input, and regulatory-capital boundary runtime checks passed.');
