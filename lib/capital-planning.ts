import { BankingError } from './banking';

export type CapitalPlanningScenario = {
  label: string;
  planningTargetOpeningCapitalCents: number;
  documentedCommittedCapitalCents: number;
  documentedVerifiedSourceOfFundsCents: number;
  cashCurrentlyAvailableForProjectCents: number;
  plannedPreOpeningOneTimeCostsCents: number;
  monthlyFintechOperatingBurnCents: number;
  monthlyBankOrganizationPreOpeningBurnCents: number;
  modeledMonthsUntilOpening: number;
  internalContingencyReserveCents: number;
};

export type CapitalPlanningResult = {
  label: string;
  target: {
    planningTargetOpeningCapitalCents: number;
    targetSource: 'operator-entered-assumption';
    regulatorySufficiencyVerified: false;
  };
  funding: {
    documentedCommittedCapitalCents: number;
    documentedVerifiedSourceOfFundsCents: number;
    cashCurrentlyAvailableForProjectCents: number;
    commitmentCoverageBps: number | null;
    verifiedSourceCoverageBps: number | null;
    planningCapitalGapCents: number;
  };
  preOpening: {
    plannedPreOpeningOneTimeCostsCents: number;
    monthlyFintechOperatingBurnCents: number;
    monthlyBankOrganizationPreOpeningBurnCents: number;
    modeledMonthsUntilOpening: number;
    modeledOperatingBurnUntilOpeningCents: number;
    internalContingencyReserveCents: number;
    modeledTotalPreOpeningCashNeedCents: number;
    modeledCashGapBeforeOpeningCents: number;
    currentCashRunwayMonths: number | null;
  };
  limitations: {
    planningOnly: true;
    assumptionsValidated: false;
    regulatoryCapitalCalculationImplemented: false;
    riskWeightedAssetsModeled: false;
    leverageRatioModeled: false;
    liquidityRequirementModeled: false;
    depositFundingModelValidated: false;
    stressTestingApproved: false;
    sourceOfFundsAuthenticityVerifiedBySoftware: false;
    capitalPlanReviewedByQualifiedAdvisers: false;
    capitalPlanReviewedByRegulator: false;
    charterCapitalRequirementDetermined: false;
    approvedForFundraising: false;
    approvedForCharterApplication: false;
  };
  disclosure: string;
};

const MAX_MONEY_CENTS = 10_000_000_000_00;
const MAX_MONTHS = 120;

function finiteInteger(value: unknown, field: string, min: number, max: number) {
  if (!Number.isFinite(value) || !Number.isInteger(value) || Number(value) < min || Number(value) > max) {
    throw new BankingError(400, 'INVALID_CAPITAL_PLANNING_INPUT', `${field} must be an integer between ${min} and ${max}.`);
  }
  return Number(value);
}

function safeRound(value: number) {
  if (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER) {
    throw new BankingError(400, 'CAPITAL_PLANNING_OVERFLOW', 'Capital-planning scenario exceeds the supported calculation range.');
  }
  return Math.round(value);
}

function coverageBps(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return safeRound(numerator / denominator * 10_000);
}

export function calculateCapitalPlanningScenario(input: CapitalPlanningScenario): CapitalPlanningResult {
  const scenario: CapitalPlanningScenario = {
    label: String(input.label || '').trim().slice(0, 120) || 'Untitled capital scenario',
    planningTargetOpeningCapitalCents: finiteInteger(input.planningTargetOpeningCapitalCents, 'planningTargetOpeningCapitalCents', 0, MAX_MONEY_CENTS),
    documentedCommittedCapitalCents: finiteInteger(input.documentedCommittedCapitalCents, 'documentedCommittedCapitalCents', 0, MAX_MONEY_CENTS),
    documentedVerifiedSourceOfFundsCents: finiteInteger(input.documentedVerifiedSourceOfFundsCents, 'documentedVerifiedSourceOfFundsCents', 0, MAX_MONEY_CENTS),
    cashCurrentlyAvailableForProjectCents: finiteInteger(input.cashCurrentlyAvailableForProjectCents, 'cashCurrentlyAvailableForProjectCents', 0, MAX_MONEY_CENTS),
    plannedPreOpeningOneTimeCostsCents: finiteInteger(input.plannedPreOpeningOneTimeCostsCents, 'plannedPreOpeningOneTimeCostsCents', 0, MAX_MONEY_CENTS),
    monthlyFintechOperatingBurnCents: finiteInteger(input.monthlyFintechOperatingBurnCents, 'monthlyFintechOperatingBurnCents', 0, MAX_MONEY_CENTS),
    monthlyBankOrganizationPreOpeningBurnCents: finiteInteger(input.monthlyBankOrganizationPreOpeningBurnCents, 'monthlyBankOrganizationPreOpeningBurnCents', 0, MAX_MONEY_CENTS),
    modeledMonthsUntilOpening: finiteInteger(input.modeledMonthsUntilOpening, 'modeledMonthsUntilOpening', 0, MAX_MONTHS),
    internalContingencyReserveCents: finiteInteger(input.internalContingencyReserveCents, 'internalContingencyReserveCents', 0, MAX_MONEY_CENTS)
  };

  const monthlyCombinedBurn = safeRound(
    scenario.monthlyFintechOperatingBurnCents + scenario.monthlyBankOrganizationPreOpeningBurnCents
  );
  const modeledOperatingBurnUntilOpening = safeRound(monthlyCombinedBurn * scenario.modeledMonthsUntilOpening);
  const modeledTotalPreOpeningCashNeed = safeRound(
    scenario.plannedPreOpeningOneTimeCostsCents
      + modeledOperatingBurnUntilOpening
      + scenario.internalContingencyReserveCents
  );
  const modeledCashGapBeforeOpening = Math.max(
    0,
    safeRound(modeledTotalPreOpeningCashNeed - scenario.cashCurrentlyAvailableForProjectCents)
  );
  const planningCapitalGap = Math.max(
    0,
    safeRound(scenario.planningTargetOpeningCapitalCents - scenario.documentedCommittedCapitalCents)
  );
  const currentCashRunwayMonths = monthlyCombinedBurn > 0
    ? Number((scenario.cashCurrentlyAvailableForProjectCents / monthlyCombinedBurn).toFixed(2))
    : null;

  return {
    label: scenario.label,
    target: {
      planningTargetOpeningCapitalCents: scenario.planningTargetOpeningCapitalCents,
      targetSource: 'operator-entered-assumption',
      regulatorySufficiencyVerified: false
    },
    funding: {
      documentedCommittedCapitalCents: scenario.documentedCommittedCapitalCents,
      documentedVerifiedSourceOfFundsCents: scenario.documentedVerifiedSourceOfFundsCents,
      cashCurrentlyAvailableForProjectCents: scenario.cashCurrentlyAvailableForProjectCents,
      commitmentCoverageBps: coverageBps(scenario.documentedCommittedCapitalCents, scenario.planningTargetOpeningCapitalCents),
      verifiedSourceCoverageBps: coverageBps(scenario.documentedVerifiedSourceOfFundsCents, scenario.documentedCommittedCapitalCents),
      planningCapitalGapCents: planningCapitalGap
    },
    preOpening: {
      plannedPreOpeningOneTimeCostsCents: scenario.plannedPreOpeningOneTimeCostsCents,
      monthlyFintechOperatingBurnCents: scenario.monthlyFintechOperatingBurnCents,
      monthlyBankOrganizationPreOpeningBurnCents: scenario.monthlyBankOrganizationPreOpeningBurnCents,
      modeledMonthsUntilOpening: scenario.modeledMonthsUntilOpening,
      modeledOperatingBurnUntilOpeningCents: modeledOperatingBurnUntilOpening,
      internalContingencyReserveCents: scenario.internalContingencyReserveCents,
      modeledTotalPreOpeningCashNeedCents: modeledTotalPreOpeningCashNeed,
      modeledCashGapBeforeOpeningCents: modeledCashGapBeforeOpening,
      currentCashRunwayMonths
    },
    limitations: {
      planningOnly: true,
      assumptionsValidated: false,
      regulatoryCapitalCalculationImplemented: false,
      riskWeightedAssetsModeled: false,
      leverageRatioModeled: false,
      liquidityRequirementModeled: false,
      depositFundingModelValidated: false,
      stressTestingApproved: false,
      sourceOfFundsAuthenticityVerifiedBySoftware: false,
      capitalPlanReviewedByQualifiedAdvisers: false,
      capitalPlanReviewedByRegulator: false,
      charterCapitalRequirementDetermined: false,
      approvedForFundraising: false,
      approvedForCharterApplication: false
    },
    disclosure: 'Planning arithmetic only. The opening-capital target is an operator-entered assumption, not a regulator-prescribed amount and not a software determination of capital adequacy. This calculation does not implement regulatory capital, risk-weighted assets, leverage ratios, liquidity requirements, validated deposit funding, approved stress testing, or source-of-funds authentication. Qualified advisers and the applicable authorities must determine and review the actual capital plan for the final proposal.'
  };
}

export function capitalPlanningControlStatus() {
  return {
    assumptionDrivenPlanningEngineImplemented: true,
    containsDefaultCharterCapitalAmount: false,
    operatorEnteredOpeningCapitalTargetRequired: true,
    regulatoryCapitalCalculationImplemented: false,
    riskWeightedAssetsModeled: false,
    leverageRatioModeled: false,
    liquidityRequirementModeled: false,
    sourceOfFundsAuthenticityVerifiedBySoftware: false,
    assumptionsValidated: false,
    capitalPlanReviewedByQualifiedAdvisers: false,
    capitalPlanReviewedByRegulator: false,
    charterCapitalRequirementDetermined: false,
    approvedForFundraising: false,
    approvedForCharterApplication: false,
    disclosure: 'The capital workbench performs planning arithmetic from explicit inputs and contains no default charter-capital requirement. It cannot determine regulatory capital adequacy or authenticate source-of-funds evidence.'
  } as const;
}
