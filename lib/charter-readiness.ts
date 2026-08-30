export type CharterReadinessPhase =
  | 'fintech-proof'
  | 'charter-feasibility'
  | 'organizer-readiness'
  | 'application-readiness'
  | 'conditional-approval'
  | 'pre-opening'
  | 'chartered-operations';

export type CharterReadinessMilestone = {
  id: string;
  phase: CharterReadinessPhase;
  label: string;
  status: 'implemented-software' | 'future-internal-work' | 'external-evidence-required';
  complete: boolean;
  evidence: string;
};

const milestones: CharterReadinessMilestone[] = [
  {
    id: 'simulation-control-foundation',
    phase: 'fintech-proof',
    label: 'Simulation control foundation',
    status: 'implemented-software',
    complete: true,
    evidence: 'The prototype has fail-closed live-money boundaries, tenant isolation, ledger/reconciliation controls, controlled terms, and machine-readable readiness evidence.'
  },
  {
    id: 'charter-route-selection',
    phase: 'charter-feasibility',
    label: 'Select charter route and corporate structure with qualified advisers',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No national-bank, state-bank, federal-savings-association, trust-bank, acquisition, conversion, or holding-company route is represented as selected.'
  },
  {
    id: 'regulator-prefiling',
    phase: 'charter-feasibility',
    label: 'Regulator pre-filing engagement',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No OCC, state-chartering-authority, FDIC, or Federal Reserve pre-filing meeting or feedback is represented as completed.'
  },
  {
    id: 'organizing-group',
    phase: 'organizer-readiness',
    label: 'Qualified organizing group, board, and executive management',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No proposed bank board, executive management team, or regulator background/experience review is represented as complete.'
  },
  {
    id: 'three-year-business-plan',
    phase: 'organizer-readiness',
    label: 'Three-year de novo business plan and financial projections',
    status: 'future-internal-work',
    complete: false,
    evidence: 'Product and diligence documents exist, but no regulator-ready de novo bank business plan, market analysis, balance-sheet forecast, liquidity plan, or approved financial projections are represented as complete.'
  },
  {
    id: 'capital-plan',
    phase: 'organizer-readiness',
    label: 'Capital plan matched to proposed bank risk profile',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No universal charter capital number is assumed. No regulator-reviewed capital amount, committed capital raise, source-of-funds evidence, or opening capital approval is represented as complete.'
  },
  {
    id: 'bank-risk-governance',
    phase: 'application-readiness',
    label: 'Bank-level risk, compliance, audit, finance, and governance ownership',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'Software controls and draft governance documents do not substitute for qualified bank officers, independent risk management, internal audit, board governance, compliance ownership, or operating procedures.'
  },
  {
    id: 'charter-application',
    phase: 'application-readiness',
    label: 'Charter application filed and accepted for processing',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No charter application is represented as filed, accepted, or approved.'
  },
  {
    id: 'deposit-insurance-application',
    phase: 'application-readiness',
    label: 'Deposit insurance application filed and accepted for processing',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No FDIC deposit-insurance application is represented as filed, accepted, or approved.'
  },
  {
    id: 'conditional-approvals',
    phase: 'conditional-approval',
    label: 'Required preliminary/conditional regulatory approvals',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No preliminary conditional charter approval, deposit-insurance approval, Federal Reserve approval, or state approval is represented as obtained.'
  },
  {
    id: 'preopening-readiness',
    phase: 'pre-opening',
    label: 'Pre-opening conditions, systems, staffing, policies, capital, and examinations satisfied',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'No pre-opening examination, condition-satisfaction package, production banking stack, bank staffing model, or opening authorization is represented as complete.'
  },
  {
    id: 'chartered-operations',
    phase: 'chartered-operations',
    label: 'Charter effective and insured bank authorized to open',
    status: 'external-evidence-required',
    complete: false,
    evidence: 'Galactic Trust is not represented as a chartered bank, FDIC-insured depository institution, or authorized open bank.'
  }
];

export function charterReadinessStatus() {
  return {
    longTermGoal: 'future-chartered-bank',
    currentPhase: 'fintech-proof' as CharterReadinessPhase,
    currentOperatingPosture: 'simulation-only-fintech-prototype',
    roadmapDocumented: true,
    currentSoftwareCanSelfApproveCharter: false,
    charterRouteSelected: false,
    deNovoVsAcquisitionRouteSelected: false,
    nationalBankCharterSelected: false,
    stateBankCharterSelected: false,
    federalSavingsAssociationSelected: false,
    bankHoldingCompanyStructureSelected: false,
    regulatorPreFilingEngagementComplete: false,
    organizingGroupFormed: false,
    proposedBankBoardQualified: false,
    proposedExecutiveManagementQualified: false,
    regulatorReadyThreeYearBusinessPlanApproved: false,
    regulatorReviewedCapitalPlanApproved: false,
    committedOpeningCapitalVerified: false,
    bankLevelRiskManagementOperating: false,
    bankLevelComplianceProgramOperating: false,
    independentInternalAuditOperating: false,
    charterApplicationFiled: false,
    charterApplicationAccepted: false,
    charterPreliminaryConditionalApprovalReceived: false,
    depositInsuranceApplicationFiled: false,
    depositInsuranceApplicationAccepted: false,
    depositInsuranceApproved: false,
    federalReserveApplicationRequirementsDetermined: false,
    federalReserveApprovalReceived: false,
    preOpeningExaminationComplete: false,
    allPreOpeningConditionsSatisfied: false,
    openingAuthorizationReceived: false,
    bankCharterEffective: false,
    fdicInsuranceEffective: false,
    customerFacingBankClaimAuthorized: false,
    milestones,
    disclosure:
      'This is a long-term charter-readiness roadmap, not a charter application, legal conclusion, regulatory approval, deposit-insurance approval, capital approval, or authorization to operate or market Galactic Trust as a bank. The applicable charter route, regulators, applications, capital, governance, staffing, and opening conditions must be determined and evidenced with qualified legal/compliance advisers and the relevant authorities.'
  } as const;
}
