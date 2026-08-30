import { BankingError } from './banking';

export type BusinessModelThesisDraft = {
  targetCustomerSegment: string;
  painfulFinancialProblem: string;
  differentiatedMechanism: string;
  distributionAdvantage: string;
  primaryRevenueBeyondInterchange: string;
  evidencePlan: string;
};

export type BusinessModelThesisEvaluation = {
  structurallyCompleteDraft: true;
  thesisStatement: string;
  fields: BusinessModelThesisDraft;
  validation: {
    customerSegmentValidated: false;
    painfulProblemValidated: false;
    mechanismValidated: false;
    distributionAdvantageValidated: false;
    revenueModelValidated: false;
    evidencePlanExecuted: false;
    marketValidated: false;
  };
  readiness: {
    approvedForPublicClaim: false;
    approvedForInvestorForecast: false;
    approvedForSponsorDiligence: false;
    approvedForCharterBusinessPlan: false;
  };
  disclosure: string;
};

const MIN_FIELD_LENGTH = 12;
const MAX_FIELD_LENGTH = 700;

function requiredText(value: unknown, field: keyof BusinessModelThesisDraft) {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ');
  if (normalized.length < MIN_FIELD_LENGTH || normalized.length > MAX_FIELD_LENGTH) {
    throw new BankingError(
      400,
      'INCOMPLETE_BUSINESS_MODEL_THESIS',
      `${field} must be between ${MIN_FIELD_LENGTH} and ${MAX_FIELD_LENGTH} characters.`
    );
  }
  return normalized;
}

export function evaluateBusinessModelThesis(input: BusinessModelThesisDraft): BusinessModelThesisEvaluation {
  const fields: BusinessModelThesisDraft = {
    targetCustomerSegment: requiredText(input.targetCustomerSegment, 'targetCustomerSegment'),
    painfulFinancialProblem: requiredText(input.painfulFinancialProblem, 'painfulFinancialProblem'),
    differentiatedMechanism: requiredText(input.differentiatedMechanism, 'differentiatedMechanism'),
    distributionAdvantage: requiredText(input.distributionAdvantage, 'distributionAdvantage'),
    primaryRevenueBeyondInterchange: requiredText(input.primaryRevenueBeyondInterchange, 'primaryRevenueBeyondInterchange'),
    evidencePlan: requiredText(input.evidencePlan, 'evidencePlan')
  };

  return {
    structurallyCompleteDraft: true,
    thesisStatement: `Galactic Trust is being designed for ${fields.targetCustomerSegment}, addressing ${fields.painfulFinancialProblem} through ${fields.differentiatedMechanism}, with distribution through ${fields.distributionAdvantage}, and a planned primary revenue source beyond interchange of ${fields.primaryRevenueBeyondInterchange}.`,
    fields,
    validation: {
      customerSegmentValidated: false,
      painfulProblemValidated: false,
      mechanismValidated: false,
      distributionAdvantageValidated: false,
      revenueModelValidated: false,
      evidencePlanExecuted: false,
      marketValidated: false
    },
    readiness: {
      approvedForPublicClaim: false,
      approvedForInvestorForecast: false,
      approvedForSponsorDiligence: false,
      approvedForCharterBusinessPlan: false
    },
    disclosure: 'This evaluator checks only whether the strategy draft is specific enough to contain all required fields. It does not validate customer demand, market size, distribution, defensibility, pricing, revenue, unit economics, regulatory feasibility, sponsor acceptance, or charter feasibility. Execute the evidence plan and attach real evidence before treating any part as validated.'
  };
}

export function businessModelThesisControlStatus() {
  return {
    structuredWorkbenchImplemented: true,
    requiresSpecificCustomerProblemMechanismDistributionRevenueAndEvidencePlan: true,
    shipsWithDefaultTargetCustomer: false,
    shipsWithDefaultRevenueModel: false,
    marketValidationAutomated: false,
    customerSegmentValidated: false,
    painfulProblemValidated: false,
    distributionAdvantageValidated: false,
    primaryRevenueBeyondInterchangeValidated: false,
    evidencePlanExecuted: false,
    approvedForPublicClaim: false,
    approvedForInvestorForecast: false,
    approvedForSponsorDiligence: false,
    approvedForCharterBusinessPlan: false,
    disclosure: 'The workbench can create a structured strategy draft but cannot validate the market. It intentionally ships with no default niche or revenue thesis.'
  } as const;
}
