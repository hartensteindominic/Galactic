import { BankingError } from './banking';

export type BankPlanSection = {
  id: string;
  label: string;
  category:
    | 'executive-summary'
    | 'business-market'
    | 'products-services'
    | 'management-governance'
    | 'records-systems-controls'
    | 'risk-compliance'
    | 'financial-management'
    | 'financial-projections'
    | 'capital-liquidity'
    | 'third-party-continuity'
    | 'monitoring-revision'
    | 'downside-scenarios';
  requiredForPlanningSkeleton: true;
  populated: false;
  validated: false;
  approved: false;
  expectation: string;
};

export type ThreeYearBankPlanCandidate = {
  planLabel: string;
  proposedInstitutionRole: string;
  proposedCharterRoute: string;
  targetMarketAndCustomers: string;
  businessAndRevenueModel: string;
  productsAndServices: string;
  distributionAndMarketing: string;
  managementAndGovernance: string;
  recordsSystemsAndControls: string;
  riskAndComplianceFramework: string;
  financialManagementApproach: string;
  projectionMethodology: string;
  projectionHorizonYears: number;
  stableProfitabilityExpectedWithinHorizon: boolean;
  capitalAndLiquidityApproach: string;
  thirdPartyAndContinuityApproach: string;
  monitoringAndRevisionApproach: string;
  downsideAndSensitivityScenarios: string;
  evidenceReferences: string[];
  accountablePlanOwnerRole: string;
  qualifiedReviewerRole: string;
  reviewedAt: string;
};

const sources = [
  {
    id: 'occ-charters-2026',
    authority: 'OCC',
    title: 'Comptroller’s Licensing Manual: Charters',
    canonicalUrl: 'https://occ.treas.gov/publications-and-resources/publications/comptrollers-licensing-manual/files/charters.pdf',
    reviewedAt: '2026-08-30',
    note: 'The current OCC charter booklet states that the organizing group’s business plan, including projections, risk analysis, and planned risk-management systems and controls, is critical to the charter decision. It states that the plan should cover the greater of three years or the period until stable profitability is expected.'
  },
  {
    id: 'occ-business-plan-guidelines-2026',
    authority: 'OCC',
    title: 'Business Plan Guidelines',
    canonicalUrl: 'https://occ.treas.gov/static/licensing/form-business-plan-v2.pdf',
    reviewedAt: '2026-08-30',
    note: 'The current OCC business-plan form calls for a comprehensive, realistic plan covering three years, market demand, customers, competition, economic conditions, risks, controls, and adequate capital for the risk profile.'
  },
  {
    id: 'fdic-de-novo-handbook-2025',
    authority: 'FDIC',
    title: 'Applying for Deposit Insurance – A Handbook for Organizers of De Novo Institutions',
    canonicalUrl: 'https://www.fdic.gov/regulations/applications/handbook.pdf',
    reviewedAt: '2026-08-30',
    note: 'The current FDIC organizer handbook describes a first-three-years business plan covering executive summary, business description, marketing, management, records/systems/controls, financial management, monitoring/revision, and financial projections, tailored to the proposal’s size, complexity, and risk profile.'
  }
] as const;

function section(id: string, label: string, category: BankPlanSection['category'], expectation: string): BankPlanSection {
  return { id, label, category, requiredForPlanningSkeleton: true, populated: false, validated: false, approved: false, expectation };
}

const sections: BankPlanSection[] = [
  section('executive-summary', 'Executive summary and institution thesis', 'executive-summary', 'Describe the proposed institution, customer need, strategy, legal/program role, and why the proposal has a reasonable path to safe and sound operation.'),
  section('market-customers-competition', 'Market, customers, competition, and economic conditions', 'business-market', 'Use evidence-backed market analysis, target customers, demand, competition, economic assumptions, and distribution strategy; do not use generic TAM claims as proof.'),
  section('products-services-revenue', 'Products, services, pricing, and revenue model', 'products-services', 'Describe each proposed activity, customer value, pricing/revenue mechanics, operational dependencies, and regulatory/program assumptions.'),
  section('management-board-governance', 'Management, board, governance, and accountability', 'management-governance', 'Identify qualified organizers, proposed directors, executive management, control owners, governance authorities, succession, and challenge/escalation mechanisms.'),
  section('records-systems-controls', 'Records, systems, information security, and internal controls', 'records-systems-controls', 'Describe core systems, books/records, ledger, reconciliation, access, change management, information security, monitoring, incident response, and control evidence.'),
  section('risk-compliance-audit', 'Risk, compliance, BSA/AML, sanctions, consumer protection, and audit', 'risk-compliance', 'Map risks and applicable obligations to qualified human owners, policies, monitoring, testing, complaints, remediation, and independent assurance.'),
  section('financial-management', 'Financial management and accounting', 'financial-management', 'Describe accounting, budgeting, finance ownership, management reporting, balance-sheet management, loss assumptions, and financial controls.'),
  section('three-year-projections', 'Three-year-or-longer financial projections', 'financial-projections', 'Provide internally consistent projection schedules and assumptions for the greater of three years or the period to expected stable profitability, subject to the applicable filing route and agency instructions.'),
  section('capital-liquidity', 'Capital, liquidity, funding, and source-of-funds plan', 'capital-liquidity', 'Build a proposal-specific capital and liquidity plan with authenticated source-of-funds evidence and downside capacity; no universal charter-capital number is assumed.'),
  section('third-party-continuity', 'Third-party dependencies, concentration, continuity, and exit', 'third-party-continuity', 'Describe critical providers, contractual responsibilities, due diligence, monitoring, data access, concentration, outage handling, exit, and customer continuity.'),
  section('monitoring-revision', 'Plan monitoring, variance governance, and revision', 'monitoring-revision', 'Define owners, management/board reporting, budget-versus-actual review, trigger thresholds, change governance, and how the plan will be revised without obscuring material deviations.'),
  section('downside-sensitivity', 'Downside, sensitivity, and contingency scenarios', 'downside-scenarios', 'Model plausible adverse scenarios, including slower growth, higher fraud/losses, higher provider costs, lower revenue, funding stress, provider disruption, control failure, and delayed profitability.')
];

function requiredString(value: unknown, field: string, maxLength = 4_000) {
  if (typeof value !== 'string') throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', `${field} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', `${field} is invalid.`);
  return normalized;
}

function requiredReferences(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 40) {
    throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', 'evidenceReferences must contain 1-40 references.');
  }
  return value.map((item, index) => requiredString(item, `evidenceReferences[${index}]`, 500));
}

export function evaluateThreeYearBankPlanCandidate(input: ThreeYearBankPlanCandidate) {
  if (!Number.isInteger(input?.projectionHorizonYears) || input.projectionHorizonYears < 3 || input.projectionHorizonYears > 10) {
    throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', 'projectionHorizonYears must be an integer from 3 through 10.');
  }
  if (typeof input.stableProfitabilityExpectedWithinHorizon !== 'boolean') {
    throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', 'stableProfitabilityExpectedWithinHorizon must be a boolean.');
  }

  const reviewedAt = requiredString(input.reviewedAt, 'reviewedAt', 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new BankingError(400, 'INVALID_BANK_PLAN_INPUT', 'reviewedAt must be YYYY-MM-DD.');
  }

  const candidate = {
    planLabel: requiredString(input.planLabel, 'planLabel', 200),
    proposedInstitutionRole: requiredString(input.proposedInstitutionRole, 'proposedInstitutionRole'),
    proposedCharterRoute: requiredString(input.proposedCharterRoute, 'proposedCharterRoute'),
    targetMarketAndCustomers: requiredString(input.targetMarketAndCustomers, 'targetMarketAndCustomers'),
    businessAndRevenueModel: requiredString(input.businessAndRevenueModel, 'businessAndRevenueModel'),
    productsAndServices: requiredString(input.productsAndServices, 'productsAndServices'),
    distributionAndMarketing: requiredString(input.distributionAndMarketing, 'distributionAndMarketing'),
    managementAndGovernance: requiredString(input.managementAndGovernance, 'managementAndGovernance'),
    recordsSystemsAndControls: requiredString(input.recordsSystemsAndControls, 'recordsSystemsAndControls'),
    riskAndComplianceFramework: requiredString(input.riskAndComplianceFramework, 'riskAndComplianceFramework'),
    financialManagementApproach: requiredString(input.financialManagementApproach, 'financialManagementApproach'),
    projectionMethodology: requiredString(input.projectionMethodology, 'projectionMethodology'),
    projectionHorizonYears: input.projectionHorizonYears,
    stableProfitabilityExpectedWithinHorizon: input.stableProfitabilityExpectedWithinHorizon,
    capitalAndLiquidityApproach: requiredString(input.capitalAndLiquidityApproach, 'capitalAndLiquidityApproach'),
    thirdPartyAndContinuityApproach: requiredString(input.thirdPartyAndContinuityApproach, 'thirdPartyAndContinuityApproach'),
    monitoringAndRevisionApproach: requiredString(input.monitoringAndRevisionApproach, 'monitoringAndRevisionApproach'),
    downsideAndSensitivityScenarios: requiredString(input.downsideAndSensitivityScenarios, 'downsideAndSensitivityScenarios'),
    evidenceReferences: requiredReferences(input.evidenceReferences),
    accountablePlanOwnerRole: requiredString(input.accountablePlanOwnerRole, 'accountablePlanOwnerRole', 200),
    qualifiedReviewerRole: requiredString(input.qualifiedReviewerRole, 'qualifiedReviewerRole', 200),
    reviewedAt
  };

  return {
    candidate,
    structurallyCompleteDraft: true,
    projectionHorizonAtLeastThreeYears: true,
    stableProfitabilityHorizonRequirementSatisfied: input.stableProfitabilityExpectedWithinHorizon,
    marketEvidenceValidated: false,
    managementQualificationsVerified: false,
    financialProjectionAssumptionsValidated: false,
    projectionSchedulesReconciledToAccountingRecords: false,
    capitalAdequacyDetermined: false,
    liquidityAdequacyDetermined: false,
    riskFrameworkApproved: false,
    complianceApplicabilityApproved: false,
    boardApproved: false,
    qualifiedExternalReviewComplete: false,
    regulatorReviewed: false,
    regulatorAccepted: false,
    approvedForCharterApplication: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural planning output only. Completing the narrative fields does not validate the market, management, financial assumptions, capital, liquidity, risk, compliance, board approval, filing route, or regulator acceptance. Actual projections must be built from evidenced assumptions and reconciled schedules. If stable profitability is not expected within the entered horizon, the plan horizon is not sufficient for the OCC planning principle reflected in the current charter booklet.'
  } as const;
}

export function threeYearBankPlanStatus() {
  return {
    planningSkeletonAvailable: true,
    officialSourceCount: sources.length,
    sourceRegistryReviewedAt: '2026-08-30',
    minimumPlanningHorizonYears: 3,
    mustExtendThroughExpectedStableProfitabilityIfLonger: true,
    containsDefaultRevenueAssumptions: false,
    containsDefaultGrowthAssumptions: false,
    containsDefaultDepositAssumptions: false,
    containsDefaultCapitalRequirement: false,
    containsDefaultProfitabilityDate: false,
    containsDefaultLossAssumptions: false,
    requiredSectionCount: sections.length,
    populatedSectionCount: 0,
    validatedSectionCount: 0,
    approvedSectionCount: 0,
    marketEvidenceValidated: false,
    managementPlanValidated: false,
    financialProjectionModelValidated: false,
    balanceSheetProjectionValidated: false,
    incomeProjectionValidated: false,
    liquidityProjectionValidated: false,
    capitalProjectionValidated: false,
    downsideScenariosValidated: false,
    boardApproved: false,
    qualifiedExternalReviewComplete: false,
    regulatorReviewed: false,
    regulatorAccepted: false,
    readyForCharterApplication: false,
    sources,
    sections,
    disclosure: 'Regulator-oriented planning skeleton only. It is not a business plan submitted to or accepted by the OCC, FDIC, Federal Reserve, a state authority, or any other regulator. It contains no invented market, growth, deposit, revenue, loss, capital, liquidity, or profitability assumptions. Actual filing requirements depend on the selected charter/corporate structure, deposit-insurance path, ownership, activities, jurisdictions, and regulator instructions.'
  } as const;
}
