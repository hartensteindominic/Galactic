import { BankingError } from './banking';

export type AssumptionDomain =
  | 'business-thesis'
  | 'unit-economics'
  | 'capital-planning'
  | 'three-year-bank-plan'
  | 'sponsor-diligence';

export type AssumptionEvidenceClass =
  | 'operator-scenario'
  | 'internal-operating-data'
  | 'provider-quote-or-contract'
  | 'external-authoritative-data'
  | 'qualified-human-analysis'
  | 'external-authority-record';

export type AssumptionEvidenceSlot = {
  id: string;
  domain: AssumptionDomain;
  label: string;
  status: 'evidence-missing';
  evidenceRequired: true;
  accountableHumanOwnerRequired: true;
  sensitivityRequired: true;
  qualifiedReviewRequiredForValidatedUse: true;
  evidenceAuthenticated: false;
  assumptionValidated: false;
  approvedForSponsorUse: false;
  approvedForBoardUse: false;
  approvedForCharterUse: false;
  expectation: string;
};

export type AssumptionEvidenceCandidate = {
  slotId: string;
  assumptionLabel: string;
  valueOrMethodology: string;
  unitsOrInterpretation: string;
  evidenceClass: AssumptionEvidenceClass;
  evidenceReference: string;
  evidenceAsOf: string;
  accountableHumanRole: string;
  qualifiedReviewerRole: string;
  sensitivityRangeOrMethod: string;
  downsideCase: string;
  dependencies: string;
  linkedDecisionOrProjection: string;
  knownLimitations: string;
  reviewedAt: string;
};

function slot(id: string, domain: AssumptionDomain, label: string, expectation: string): AssumptionEvidenceSlot {
  return {
    id,
    domain,
    label,
    status: 'evidence-missing',
    evidenceRequired: true,
    accountableHumanOwnerRequired: true,
    sensitivityRequired: true,
    qualifiedReviewRequiredForValidatedUse: true,
    evidenceAuthenticated: false,
    assumptionValidated: false,
    approvedForSponsorUse: false,
    approvedForBoardUse: false,
    approvedForCharterUse: false,
    expectation
  };
}

const slots: AssumptionEvidenceSlot[] = [
  slot('target-customer-demand', 'business-thesis', 'Target customer and demand', 'Support the selected customer segment, frequency/severity of the problem, willingness to adopt/pay, and material counter-evidence with current research or operating data.'),
  slot('distribution-acquisition', 'business-thesis', 'Distribution and acquisition advantage', 'Support acquisition channels, conversion, CAC mechanics, channel durability, concentration, and realistic scaling assumptions with measured evidence.'),
  slot('non-interchange-revenue', 'business-thesis', 'Primary non-interchange revenue model', 'Support pricing, willingness to pay, attach/retention assumptions, contractual mechanics, and legal/program constraints without treating a brainstorm as validated revenue.'),
  slot('active-customer-base', 'unit-economics', 'Active customer count / activity basis', 'Define what active means, source the actual or scenario population, and distinguish measured users from forecast/scenario users.'),
  slot('retained-interchange', 'unit-economics', 'Retained interchange economics', 'Use exact program/network/provider economics when selected. Headline interchange is not automatically Galactic revenue.'),
  slot('provider-card-costs', 'unit-economics', 'Sponsor/provider/card/payment costs', 'Use current quotes, contracts, invoices, or explicit planning scenarios and identify minimums, tiers, reserves, pass-throughs, and variable/fixed components.'),
  slot('fraud-loss', 'unit-economics', 'Fraud and loss assumptions', 'Use actual operating data, comparable evidence, provider/program assumptions, or explicit scenario ranges; do not silently assume zero losses.'),
  slot('support-compliance-servicing-cost', 'unit-economics', 'Support, compliance-operations, and servicing cost', 'Support staffing/tooling/vendor/outsourcing assumptions and explain volume drivers, service levels, escalation coverage, and fixed-versus-variable treatment.'),
  slot('cac-onboarding', 'unit-economics', 'CAC and onboarding/identity cost', 'Support acquisition and onboarding cost with measured channel data, provider quotes, identity/KYC costs, incentives, and failed-onboarding treatment.'),
  slot('retention-lifetime', 'unit-economics', 'Retention and modeled customer lifetime', 'Support churn/retention cohorts or clearly labeled scenarios. Do not infer durable lifetime value from an arbitrary horizon.'),
  slot('growth-adoption', 'three-year-bank-plan', 'Customer / account / activity growth', 'Build evidence-backed base, upside, and downside growth assumptions with channel capacity, product eligibility, market constraints, and operational scaling dependencies.'),
  slot('deposit-funding', 'three-year-bank-plan', 'Deposit / funding mix and behavior', 'Use the actual approved business model and funding strategy; distinguish customer deposits, corporate cash, wholesale/funding sources, liquidity assumptions, and unapproved concepts.'),
  slot('revenue-projection', 'three-year-bank-plan', 'Revenue projection drivers', 'Trace each projected revenue line to customer/activity/pricing assumptions and reconcile those assumptions to the unit-economics model and selected program terms.'),
  slot('loss-expense-projection', 'three-year-bank-plan', 'Loss and expense projection drivers', 'Trace fraud, credit loss if applicable, provider, staffing, compliance, support, technology, occupancy, insurance, professional-services, and other expenses to explicit evidence or scenarios.'),
  slot('stable-profitability', 'three-year-bank-plan', 'Stable-profitability horizon', 'Support the expected profitability horizon with reconciled financial statements, capital/liquidity effects, downside sensitivity, and explicit dependencies rather than a target date alone.'),
  slot('planning-capital-target', 'capital-planning', 'Planning capital target', 'State the operator-entered planning target and its rationale. It is not a regulator-determined capital requirement or software conclusion of adequacy.'),
  slot('committed-capital-source', 'capital-planning', 'Capital commitments and source-of-funds evidence', 'Reference authenticated private commitments/source evidence and human review. An entered amount or file reference is not proof funds are committed, available, lawful, or acceptable.'),
  slot('pre-opening-burn', 'capital-planning', 'Pre-opening cost and burn assumptions', 'Support one-time organization costs, monthly fintech burn, bank-organization burn, staffing, professional services, systems, insurance, facilities, and contingency assumptions.'),
  slot('liquidity-contingency', 'capital-planning', 'Liquidity and contingency assumptions', 'Document proposal-specific liquidity sources, stresses, limits, contingency options, and governance. This registry does not calculate or approve regulatory liquidity adequacy.'),
  slot('sponsor-program-economics', 'sponsor-diligence', 'Sponsor-program commercial and reserve assumptions', 'Reference actual sponsor/provider commercial terms, reserves, minimums, settlement timing, loss allocation, termination costs, and material conditions only after an exact program is selected.'),
  slot('sponsor-program-scope', 'sponsor-diligence', 'Sponsor-program scope and responsibility assumptions', 'Trace product/customer/jurisdiction/data/money-flow assumptions to the actual proposed responsibility matrix, contracts, approval conditions, and sponsor feedback.'),
  slot('provider-exit-assumptions', 'sponsor-diligence', 'Provider exit / portability assumptions', 'Support data/statement access, termination rights, transition support, reserve/settlement behavior, portability, customer communications, and alternate-provider assumptions with actual contract/program evidence.')
];

function requiredString(value: unknown, field: string, maxLength = 4_000) {
  if (typeof value !== 'string') {
    throw new BankingError(400, 'INVALID_ASSUMPTION_EVIDENCE_INPUT', `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new BankingError(400, 'INVALID_ASSUMPTION_EVIDENCE_INPUT', `${field} is invalid.`);
  }
  return normalized;
}

function requiredDate(value: unknown, field: string) {
  const normalized = requiredString(value, field, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    throw new BankingError(400, 'INVALID_ASSUMPTION_EVIDENCE_INPUT', `${field} must be YYYY-MM-DD.`);
  }
  return normalized;
}

export function evaluateAssumptionEvidenceCandidate(input: AssumptionEvidenceCandidate) {
  const slotId = requiredString(input?.slotId, 'slotId', 160);
  const record = slots.find((item) => item.id === slotId);
  if (!record) throw new BankingError(400, 'UNKNOWN_ASSUMPTION_EVIDENCE_SLOT', 'Unknown assumption evidence slot.');

  const allowedClasses: AssumptionEvidenceClass[] = [
    'operator-scenario',
    'internal-operating-data',
    'provider-quote-or-contract',
    'external-authoritative-data',
    'qualified-human-analysis',
    'external-authority-record'
  ];
  if (!allowedClasses.includes(input?.evidenceClass)) {
    throw new BankingError(400, 'INVALID_ASSUMPTION_EVIDENCE_CLASS', 'Unknown assumption evidence class.');
  }

  const candidate = {
    slotId,
    assumptionLabel: requiredString(input.assumptionLabel, 'assumptionLabel', 300),
    valueOrMethodology: requiredString(input.valueOrMethodology, 'valueOrMethodology'),
    unitsOrInterpretation: requiredString(input.unitsOrInterpretation, 'unitsOrInterpretation', 500),
    evidenceClass: input.evidenceClass,
    evidenceReference: requiredString(input.evidenceReference, 'evidenceReference', 500),
    evidenceAsOf: requiredDate(input.evidenceAsOf, 'evidenceAsOf'),
    accountableHumanRole: requiredString(input.accountableHumanRole, 'accountableHumanRole', 200),
    qualifiedReviewerRole: requiredString(input.qualifiedReviewerRole, 'qualifiedReviewerRole', 200),
    sensitivityRangeOrMethod: requiredString(input.sensitivityRangeOrMethod, 'sensitivityRangeOrMethod', 1_500),
    downsideCase: requiredString(input.downsideCase, 'downsideCase', 1_500),
    dependencies: requiredString(input.dependencies, 'dependencies', 1_500),
    linkedDecisionOrProjection: requiredString(input.linkedDecisionOrProjection, 'linkedDecisionOrProjection', 1_500),
    knownLimitations: requiredString(input.knownLimitations, 'knownLimitations', 1_500),
    reviewedAt: requiredDate(input.reviewedAt, 'reviewedAt')
  };

  return {
    candidate,
    structurallyCompleteForEvidenceReview: true,
    scenarioOnly: input.evidenceClass === 'operator-scenario',
    evidenceAuthenticated: false,
    evidenceCurrentEnoughForDecisionVerified: false,
    accountableOwnerAssignmentVerified: false,
    qualifiedReviewCompleted: false,
    assumptionValidated: false,
    methodologyApproved: false,
    sensitivityValidated: false,
    downsideCaseValidated: false,
    linkedFinancialSchedulesReconciled: false,
    approvedForInvestorUse: false,
    approvedForSponsorUse: false,
    approvedForBoardUse: false,
    approvedForCharterUse: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural assumption-evidence review only. A reference, scenario, quote, analysis, or authority record is not authenticated or validated merely because it is entered here. Software cannot verify the accountable owner, evidence authenticity/currentness, methodology, sensitivity, downside case, reconciliation, board/sponsor/regulator acceptance, or approve the assumption for investor, sponsor, board, or charter use.'
  } as const;
}

export function assumptionEvidenceRegistryStatus() {
  return {
    registryAvailable: true,
    slotCount: slots.length,
    businessThesisSlotCount: slots.filter((item) => item.domain === 'business-thesis').length,
    unitEconomicsSlotCount: slots.filter((item) => item.domain === 'unit-economics').length,
    capitalPlanningSlotCount: slots.filter((item) => item.domain === 'capital-planning').length,
    threeYearBankPlanSlotCount: slots.filter((item) => item.domain === 'three-year-bank-plan').length,
    sponsorDiligenceSlotCount: slots.filter((item) => item.domain === 'sponsor-diligence').length,
    evidenceMissingSlotCount: slots.length,
    evidenceAuthenticatedSlotCount: 0,
    validatedAssumptionCount: 0,
    approvedForSponsorUseCount: 0,
    approvedForBoardUseCount: 0,
    approvedForCharterUseCount: 0,
    persistentEvidenceRepositoryConnected: false,
    automaticEvidenceAuthenticationEnabled: false,
    automaticAssumptionValidationEnabled: false,
    automaticReadinessPromotionEnabled: false,
    approvedForInvestorForecasts: false,
    approvedForSponsorDiligence: false,
    approvedForBoardPlan: false,
    approvedForCharterApplication: false,
    slots,
    disclosure: 'Machine-readable assumption-evidence schema only. Every seeded evidence slot starts missing and unvalidated. The registry does not contain market defaults or silently populate product, growth, revenue, deposit, loss, capital, liquidity, provider, or profitability assumptions. Actual evidence belongs in an approved private repository; this public-repo model should store only non-sensitive references and status metadata.'
  } as const;
}
