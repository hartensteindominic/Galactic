import { BankingError } from './banking';

export type UnitEconomicsScenario = {
  label: string;
  activeCustomers: number;
  monthlyDebitSpendPerActiveCustomerCents: number;
  retainedInterchangeBps: number;
  monthlySubscriptionRevenuePerActiveCustomerCents: number;
  monthlyOtherRevenuePerActiveCustomerCents: number;
  monthlySponsorProviderCostPerActiveCustomerCents: number;
  monthlyCardPaymentCostPerActiveCustomerCents: number;
  monthlyFraudLossPerActiveCustomerCents: number;
  monthlySupportCostPerActiveCustomerCents: number;
  monthlyComplianceOpsCostPerActiveCustomerCents: number;
  monthlyServicingCostPerActiveCustomerCents: number;
  monthlyOtherVariableCostPerActiveCustomerCents: number;
  acquisitionCostPerNewCustomerCents: number;
  onboardingIdentityCostPerNewCustomerCents: number;
  modeledCustomerLifetimeMonths: number;
};

export type UnitEconomicsResult = {
  label: string;
  perActiveCustomer: {
    monthlyRetainedInterchangeRevenueCents: number;
    monthlySubscriptionRevenueCents: number;
    monthlyOtherRevenueCents: number;
    monthlyTotalRevenueCents: number;
    monthlySponsorProviderCostCents: number;
    monthlyCardPaymentCostCents: number;
    monthlyFraudLossCents: number;
    monthlySupportCostCents: number;
    monthlyComplianceOpsCostCents: number;
    monthlyServicingCostCents: number;
    monthlyOtherVariableCostCents: number;
    monthlyTotalVariableCostCents: number;
    monthlyContributionCents: number;
    contributionMarginBps: number | null;
    upfrontAcquisitionAndOnboardingCostCents: number;
    simplePaybackMonths: number | null;
    modeledLifetimeContributionBeforeAcquisitionCents: number;
    modeledLifetimeContributionAfterAcquisitionCents: number;
  };
  portfolio: {
    activeCustomers: number;
    monthlyRevenueCents: number;
    monthlyVariableCostCents: number;
    monthlyContributionCents: number;
  };
  interpretation: {
    contributionPositive: boolean;
    acquisitionPaybackAvailable: boolean;
    modeledLifetimeContributionPositiveAfterAcquisition: boolean;
  };
  assumptions: UnitEconomicsScenario;
  limitations: {
    scenarioOnly: true;
    assumptionsValidated: false;
    excludesFixedCorporateOverhead: true;
    excludesCapitalAndLiquidityCosts: true;
    excludesCreditLossesUnlessEnteredAsOtherCost: true;
    excludesTaxes: true;
    excludesRegulatoryCapitalModel: true;
    approvedForFundraising: false;
    approvedForSponsorDiligence: false;
    approvedForCharterApplication: false;
  };
  disclosure: string;
};

const MAX_CUSTOMERS = 100_000_000;
const MAX_MONEY_CENTS = 100_000_000_00;
const MAX_BPS = 10_000;
const MAX_LIFETIME_MONTHS = 600;

function finiteInteger(value: unknown, field: string, min: number, max: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new BankingError(400, 'INVALID_UNIT_ECONOMICS_INPUT', `${field} must be an integer between ${min} and ${max}.`);
  }
  return Number(value);
}

function normalizeScenario(input: UnitEconomicsScenario): UnitEconomicsScenario {
  const label = String(input.label || '').trim().slice(0, 120) || 'Untitled scenario';
  return {
    label,
    activeCustomers: finiteInteger(input.activeCustomers, 'activeCustomers', 0, MAX_CUSTOMERS),
    monthlyDebitSpendPerActiveCustomerCents: finiteInteger(input.monthlyDebitSpendPerActiveCustomerCents, 'monthlyDebitSpendPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    retainedInterchangeBps: finiteInteger(input.retainedInterchangeBps, 'retainedInterchangeBps', 0, MAX_BPS),
    monthlySubscriptionRevenuePerActiveCustomerCents: finiteInteger(input.monthlySubscriptionRevenuePerActiveCustomerCents, 'monthlySubscriptionRevenuePerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyOtherRevenuePerActiveCustomerCents: finiteInteger(input.monthlyOtherRevenuePerActiveCustomerCents, 'monthlyOtherRevenuePerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlySponsorProviderCostPerActiveCustomerCents: finiteInteger(input.monthlySponsorProviderCostPerActiveCustomerCents, 'monthlySponsorProviderCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyCardPaymentCostPerActiveCustomerCents: finiteInteger(input.monthlyCardPaymentCostPerActiveCustomerCents, 'monthlyCardPaymentCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyFraudLossPerActiveCustomerCents: finiteInteger(input.monthlyFraudLossPerActiveCustomerCents, 'monthlyFraudLossPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlySupportCostPerActiveCustomerCents: finiteInteger(input.monthlySupportCostPerActiveCustomerCents, 'monthlySupportCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyComplianceOpsCostPerActiveCustomerCents: finiteInteger(input.monthlyComplianceOpsCostPerActiveCustomerCents, 'monthlyComplianceOpsCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyServicingCostPerActiveCustomerCents: finiteInteger(input.monthlyServicingCostPerActiveCustomerCents, 'monthlyServicingCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    monthlyOtherVariableCostPerActiveCustomerCents: finiteInteger(input.monthlyOtherVariableCostPerActiveCustomerCents, 'monthlyOtherVariableCostPerActiveCustomerCents', 0, MAX_MONEY_CENTS),
    acquisitionCostPerNewCustomerCents: finiteInteger(input.acquisitionCostPerNewCustomerCents, 'acquisitionCostPerNewCustomerCents', 0, MAX_MONEY_CENTS),
    onboardingIdentityCostPerNewCustomerCents: finiteInteger(input.onboardingIdentityCostPerNewCustomerCents, 'onboardingIdentityCostPerNewCustomerCents', 0, MAX_MONEY_CENTS),
    modeledCustomerLifetimeMonths: finiteInteger(input.modeledCustomerLifetimeMonths, 'modeledCustomerLifetimeMonths', 0, MAX_LIFETIME_MONTHS)
  };
}

function safeRound(value: number) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new BankingError(400, 'UNIT_ECONOMICS_OVERFLOW', 'Unit-economics scenario exceeds the supported calculation range.');
  }
  return Math.round(value);
}

export function calculateUnitEconomics(input: UnitEconomicsScenario): UnitEconomicsResult {
  const scenario = normalizeScenario(input);
  const interchange = safeRound(
    scenario.monthlyDebitSpendPerActiveCustomerCents * scenario.retainedInterchangeBps / 10_000
  );
  const totalRevenue = safeRound(
    interchange
      + scenario.monthlySubscriptionRevenuePerActiveCustomerCents
      + scenario.monthlyOtherRevenuePerActiveCustomerCents
  );
  const totalVariableCost = safeRound(
    scenario.monthlySponsorProviderCostPerActiveCustomerCents
      + scenario.monthlyCardPaymentCostPerActiveCustomerCents
      + scenario.monthlyFraudLossPerActiveCustomerCents
      + scenario.monthlySupportCostPerActiveCustomerCents
      + scenario.monthlyComplianceOpsCostPerActiveCustomerCents
      + scenario.monthlyServicingCostPerActiveCustomerCents
      + scenario.monthlyOtherVariableCostPerActiveCustomerCents
  );
  const contribution = totalRevenue - totalVariableCost;
  const upfront = safeRound(
    scenario.acquisitionCostPerNewCustomerCents + scenario.onboardingIdentityCostPerNewCustomerCents
  );
  const contributionMarginBps = totalRevenue > 0
    ? safeRound(contribution / totalRevenue * 10_000)
    : null;
  const simplePaybackMonths = contribution > 0
    ? Number((upfront / contribution).toFixed(2))
    : null;
  const lifetimeBeforeAcquisition = safeRound(contribution * scenario.modeledCustomerLifetimeMonths);
  const lifetimeAfterAcquisition = safeRound(lifetimeBeforeAcquisition - upfront);

  return {
    label: scenario.label,
    perActiveCustomer: {
      monthlyRetainedInterchangeRevenueCents: interchange,
      monthlySubscriptionRevenueCents: scenario.monthlySubscriptionRevenuePerActiveCustomerCents,
      monthlyOtherRevenueCents: scenario.monthlyOtherRevenuePerActiveCustomerCents,
      monthlyTotalRevenueCents: totalRevenue,
      monthlySponsorProviderCostCents: scenario.monthlySponsorProviderCostPerActiveCustomerCents,
      monthlyCardPaymentCostCents: scenario.monthlyCardPaymentCostPerActiveCustomerCents,
      monthlyFraudLossCents: scenario.monthlyFraudLossPerActiveCustomerCents,
      monthlySupportCostCents: scenario.monthlySupportCostPerActiveCustomerCents,
      monthlyComplianceOpsCostCents: scenario.monthlyComplianceOpsCostPerActiveCustomerCents,
      monthlyServicingCostCents: scenario.monthlyServicingCostPerActiveCustomerCents,
      monthlyOtherVariableCostCents: scenario.monthlyOtherVariableCostPerActiveCustomerCents,
      monthlyTotalVariableCostCents: totalVariableCost,
      monthlyContributionCents: contribution,
      contributionMarginBps,
      upfrontAcquisitionAndOnboardingCostCents: upfront,
      simplePaybackMonths,
      modeledLifetimeContributionBeforeAcquisitionCents: lifetimeBeforeAcquisition,
      modeledLifetimeContributionAfterAcquisitionCents: lifetimeAfterAcquisition
    },
    portfolio: {
      activeCustomers: scenario.activeCustomers,
      monthlyRevenueCents: safeRound(totalRevenue * scenario.activeCustomers),
      monthlyVariableCostCents: safeRound(totalVariableCost * scenario.activeCustomers),
      monthlyContributionCents: safeRound(contribution * scenario.activeCustomers)
    },
    interpretation: {
      contributionPositive: contribution > 0,
      acquisitionPaybackAvailable: contribution > 0,
      modeledLifetimeContributionPositiveAfterAcquisition: lifetimeAfterAcquisition > 0
    },
    assumptions: scenario,
    limitations: {
      scenarioOnly: true,
      assumptionsValidated: false,
      excludesFixedCorporateOverhead: true,
      excludesCapitalAndLiquidityCosts: true,
      excludesCreditLossesUnlessEnteredAsOtherCost: true,
      excludesTaxes: true,
      excludesRegulatoryCapitalModel: true,
      approvedForFundraising: false,
      approvedForSponsorDiligence: false,
      approvedForCharterApplication: false
    },
    disclosure: 'Planning scenario only. Every input is an explicit assumption, not a market fact. Retained interchange must reflect the actual economics available to Galactic after network, issuer, sponsor, processor, program, and other contractual effects as applicable. The model excludes fixed corporate overhead, taxes, capital/liquidity costs, and credit losses unless explicitly represented. It is not an approved forecast, fundraising model, sponsor-bank submission, or bank-charter application financial plan.'
  };
}

export function unitEconomicsControlStatus() {
  return {
    driverBasedScenarioEngineImplemented: true,
    containsIndustryDefaultAssumptions: false,
    retainedInterchangeModeledSeparately: true,
    sponsorProviderCostsModeled: true,
    fraudLossesModeled: true,
    supportCostsModeled: true,
    complianceOperationsCostsModeled: true,
    acquisitionAndOnboardingCostsModeled: true,
    fixedCorporateOverheadModeled: false,
    capitalAndLiquidityCostsModeled: false,
    regulatoryCapitalModelImplemented: false,
    assumptionsValidated: false,
    approvedForFundraising: false,
    approvedForSponsorDiligence: false,
    approvedForCharterApplication: false,
    disclosure: 'The unit-economics engine is a scenario calculator, not a forecast. It ships with no industry-average CAC, interchange, fraud, retention, sponsor, support, compliance, or capital assumptions.'
  } as const;
}
