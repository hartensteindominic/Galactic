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

const economicsModule = { exports: {} };
vm.runInNewContext(transpile('lib/unit-economics.ts'), {
  module: economicsModule,
  exports: economicsModule.exports,
  console,
  Number,
  Math,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected unit economics runtime import: ${specifier}`);
  }
}, { filename: 'unit-economics.runtime.cjs' });

const { calculateUnitEconomics, unitEconomicsControlStatus } = economicsModule.exports;

const base = {
  label: 'Test scenario',
  activeCustomers: 1000,
  monthlyDebitSpendPerActiveCustomerCents: 100000,
  retainedInterchangeBps: 100,
  monthlySubscriptionRevenuePerActiveCustomerCents: 500,
  monthlyOtherRevenuePerActiveCustomerCents: 250,
  monthlySponsorProviderCostPerActiveCustomerCents: 200,
  monthlyCardPaymentCostPerActiveCustomerCents: 150,
  monthlyFraudLossPerActiveCustomerCents: 100,
  monthlySupportCostPerActiveCustomerCents: 100,
  monthlyComplianceOpsCostPerActiveCustomerCents: 100,
  monthlyServicingCostPerActiveCustomerCents: 50,
  monthlyOtherVariableCostPerActiveCustomerCents: 50,
  acquisitionCostPerNewCustomerCents: 5000,
  onboardingIdentityCostPerNewCustomerCents: 1000,
  modeledCustomerLifetimeMonths: 24
};

const positive = calculateUnitEconomics(base);
assert.equal(positive.perActiveCustomer.monthlyRetainedInterchangeRevenueCents, 1000);
assert.equal(positive.perActiveCustomer.monthlyTotalRevenueCents, 1750);
assert.equal(positive.perActiveCustomer.monthlyTotalVariableCostCents, 750);
assert.equal(positive.perActiveCustomer.monthlyContributionCents, 1000);
assert.equal(positive.perActiveCustomer.contributionMarginBps, 5714);
assert.equal(positive.perActiveCustomer.upfrontAcquisitionAndOnboardingCostCents, 6000);
assert.equal(positive.perActiveCustomer.simplePaybackMonths, 6);
assert.equal(positive.perActiveCustomer.modeledLifetimeContributionBeforeAcquisitionCents, 24000);
assert.equal(positive.perActiveCustomer.modeledLifetimeContributionAfterAcquisitionCents, 18000);
assert.equal(positive.portfolio.monthlyRevenueCents, 1750000);
assert.equal(positive.portfolio.monthlyVariableCostCents, 750000);
assert.equal(positive.portfolio.monthlyContributionCents, 1000000);
assert.equal(positive.interpretation.contributionPositive, true);
assert.equal(positive.interpretation.acquisitionPaybackAvailable, true);
assert.equal(positive.interpretation.modeledLifetimeContributionPositiveAfterAcquisition, true);
assert.equal(positive.limitations.scenarioOnly, true);
assert.equal(positive.limitations.assumptionsValidated, false);
assert.equal(positive.limitations.approvedForFundraising, false);
assert.equal(positive.limitations.approvedForSponsorDiligence, false);
assert.equal(positive.limitations.approvedForCharterApplication, false);

const negative = calculateUnitEconomics({
  ...base,
  label: 'Negative contribution',
  monthlyFraudLossPerActiveCustomerCents: 2000
});
assert.equal(negative.perActiveCustomer.monthlyContributionCents, -900);
assert.equal(negative.perActiveCustomer.simplePaybackMonths, null);
assert.equal(negative.interpretation.contributionPositive, false);
assert.equal(negative.interpretation.acquisitionPaybackAvailable, false);
assert.equal(negative.interpretation.modeledLifetimeContributionPositiveAfterAcquisition, false);

const zeroRevenue = calculateUnitEconomics({
  ...base,
  monthlyDebitSpendPerActiveCustomerCents: 0,
  retainedInterchangeBps: 0,
  monthlySubscriptionRevenuePerActiveCustomerCents: 0,
  monthlyOtherRevenuePerActiveCustomerCents: 0,
  monthlySponsorProviderCostPerActiveCustomerCents: 0,
  monthlyCardPaymentCostPerActiveCustomerCents: 0,
  monthlyFraudLossPerActiveCustomerCents: 0,
  monthlySupportCostPerActiveCustomerCents: 0,
  monthlyComplianceOpsCostPerActiveCustomerCents: 0,
  monthlyServicingCostPerActiveCustomerCents: 0,
  monthlyOtherVariableCostPerActiveCustomerCents: 0
});
assert.equal(zeroRevenue.perActiveCustomer.contributionMarginBps, null);
assert.equal(zeroRevenue.perActiveCustomer.simplePaybackMonths, null);

for (const invalid of [
  { ...base, activeCustomers: -1 },
  { ...base, activeCustomers: 1.5 },
  { ...base, retainedInterchangeBps: 10001 },
  { ...base, monthlyFraudLossPerActiveCustomerCents: -1 },
  { ...base, modeledCustomerLifetimeMonths: 601 }
]) {
  assert.throws(
    () => calculateUnitEconomics(invalid),
    (error) => error instanceof BankingError && error.status === 400 && error.code === 'INVALID_UNIT_ECONOMICS_INPUT'
  );
}

assert.throws(
  () => calculateUnitEconomics({
    ...base,
    activeCustomers: 100000000,
    monthlyDebitSpendPerActiveCustomerCents: 10000000000,
    retainedInterchangeBps: 10000,
    monthlySubscriptionRevenuePerActiveCustomerCents: 10000000000,
    monthlyOtherRevenuePerActiveCustomerCents: 10000000000
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'UNIT_ECONOMICS_OVERFLOW'
);

const controls = unitEconomicsControlStatus();
assert.equal(controls.driverBasedScenarioEngineImplemented, true);
assert.equal(controls.containsIndustryDefaultAssumptions, false);
assert.equal(controls.retainedInterchangeModeledSeparately, true);
assert.equal(controls.sponsorProviderCostsModeled, true);
assert.equal(controls.fraudLossesModeled, true);
assert.equal(controls.supportCostsModeled, true);
assert.equal(controls.complianceOperationsCostsModeled, true);
assert.equal(controls.acquisitionAndOnboardingCostsModeled, true);
assert.equal(controls.fixedCorporateOverheadModeled, false);
assert.equal(controls.capitalAndLiquidityCostsModeled, false);
assert.equal(controls.regulatoryCapitalModelImplemented, false);
assert.equal(controls.assumptionsValidated, false);
assert.equal(controls.approvedForFundraising, false);
assert.equal(controls.approvedForSponsorDiligence, false);
assert.equal(controls.approvedForCharterApplication, false);

console.log('Scenario-based fintech unit economics calculation, payback, invalid-input, overflow, and approval-boundary runtime checks passed.');
