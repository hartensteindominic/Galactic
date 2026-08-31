import { BankingError } from './banking';

export type ProductChangeType =
  | 'new-financial-product'
  | 'material-product-change'
  | 'new-jurisdiction'
  | 'new-customer-segment'
  | 'new-money-flow'
  | 'new-provider-or-rail'
  | 'material-disclosure-or-pricing-change'
  | 'material-automation-or-ai-change';

export type LaunchGateCategory =
  | 'product-scope'
  | 'legal-compliance'
  | 'regulated-program'
  | 'human-governance'
  | 'customer-protection'
  | 'financial-crime'
  | 'fraud-loss'
  | 'finance-ledger'
  | 'provider-operations'
  | 'security'
  | 'privacy-data'
  | 'support-complaints'
  | 'resilience'
  | 'financial-management'
  | 'testing-monitoring'
  | 'release-change-control';

export type ProductLaunchGate = {
  id: string;
  label: string;
  category: LaunchGateCategory;
  requiredForLiveLaunch: true;
  status: 'blocked-unverified';
  accountableHumanRequired: true;
  qualifiedReviewRequired: true;
  evidenceVerified: false;
  humanApprovalVerified: false;
  externalApprovalVerified: false;
  operatingControlVerified: false;
  launchGateSatisfied: false;
  expectation: string;
};

export type ProductLaunchGateReview = {
  gateId: string;
  proposedDisposition: 'ready-for-human-review' | 'not-ready' | 'not-applicable-proposed';
  rationale: string;
  evidenceReferences: string[];
  accountableHumanRole: string;
  qualifiedReviewerRole: string;
  materialExceptions: string;
  remediationOrFollowUp: string;
};

export type ProductLaunchReviewCandidate = {
  changeLabel: string;
  changeType: ProductChangeType;
  proposedProductOrFeature: string;
  proposedEntityAndProgramRole: string;
  targetCustomers: string[];
  jurisdictions: string[];
  moneyFlowSummary: string;
  dataFlowSummary: string;
  providerDependencySummary: string;
  customerImpactSummary: string;
  rollbackOrDisableStrategy: string;
  gateReviews: ProductLaunchGateReview[];
  accountableLaunchOwnerRole: string;
  independentChallengeRole: string;
  reviewedAt: string;
};

function gate(id: string, label: string, category: LaunchGateCategory, expectation: string): ProductLaunchGate {
  return {
    id,
    label,
    category,
    requiredForLiveLaunch: true,
    status: 'blocked-unverified',
    accountableHumanRequired: true,
    qualifiedReviewRequired: true,
    evidenceVerified: false,
    humanApprovalVerified: false,
    externalApprovalVerified: false,
    operatingControlVerified: false,
    launchGateSatisfied: false,
    expectation
  };
}

const launchGates: ProductLaunchGate[] = [
  gate('product-scope-business-case', 'Product scope, customer problem, economics, and authority boundary', 'product-scope', 'Define the exact product/change, customer need, economics, activities, entity/program role, jurisdictions, and what authority Galactic does and does not have.'),
  gate('legal-compliance-applicability', 'Legal and compliance applicability', 'legal-compliance', 'Qualified humans must determine the applicable legal/compliance framework for the exact product, role, customer, jurisdiction, marketing, data, and money flows.'),
  gate('sponsor-charter-program-scope', 'Sponsor / charter / regulated-program scope approval', 'regulated-program', 'The exact activity must fit an actually approved regulated program or legally effective institutional authority; generic sponsor relationships or future-charter plans do not satisfy this gate.'),
  gate('accountable-human-governance', 'Accountable human ownership and governance approval', 'human-governance', 'Identify qualified accountable owners, approval authority, segregation of duties, escalation, and any board/committee action required for the actual institution/program.'),
  gate('terms-disclosures-marketing', 'Customer terms, disclosures, pricing, fees, limits, and marketing', 'customer-protection', 'Customer-facing terms and claims must be versioned, accurate, approved for the exact program, and consistent with fees, limits, eligibility, sponsor/insurance role, and product behavior.'),
  gate('onboarding-identity-eligibility', 'Eligibility, onboarding, identity, and customer acceptance controls', 'customer-protection', 'Define and approve eligibility, onboarding, identity/KYC/KYB/CIP responsibilities as applicable, consent, account opening, exception handling, and customer-decision authority.'),
  gate('bsa-aml-sanctions', 'BSA/AML, sanctions, financial-crime, and escalation boundaries', 'financial-crime', 'Document applicable BSA/AML/sanctions responsibilities, provider/sponsor allocation, alert/case authority, confidentiality, escalation, training, testing, and evidence.'),
  gate('fraud-loss-controls', 'Fraud, abuse, loss, disputes, and risk limits', 'fraud-loss', 'Define fraud/loss threats, controls, limits, manual review, disputes, liability, exceptions, monitoring, and measured behavior for the exact product.'),
  gate('funds-flow-ledger-reconciliation', 'Funds flow, ledger, settlement, accounting, and reconciliation', 'finance-ledger', 'Map authoritative balances and states, settlement, double-entry accounting, idempotency, unknown outcomes, statements, reconciliation, exceptions, and customer transaction history.'),
  gate('provider-integration-certification', 'Provider/rail integration, semantics, webhook authenticity, and certification', 'provider-operations', 'Verify exact provider state mapping, errors, signatures, anti-replay, credentials, limits, certification, failure semantics, provider disappearance, and operational responsibility.'),
  gate('security-access-change', 'Security, access, secrets, SDLC, and privileged change controls', 'security', 'Verify production workforce identity, least privilege, secrets/key management, secure change path, logging, vulnerability/testing evidence, incident response, and high-risk approval controls.'),
  gate('privacy-data-retention', 'Privacy, data inventory, sharing, retention, deletion, and evidence handling', 'privacy-data', 'Approve the exact data inventory, purpose/authority, customer notice/consent where applicable, vendor sharing, access, retention/deletion, restricted evidence handling, and production data flows.'),
  gate('support-complaints-disputes', 'Support, complaints, errors, disputes, fraud cases, and remediation', 'support-complaints', 'Provide staffed human paths, complaint recognition, deadlines where applicable, disputes/errors, fraud handoff, remediation, root-cause analysis, escalation, and audit evidence.'),
  gate('incident-continuity-rollback', 'Incident response, continuity, provider failure, rollback, and customer communications', 'resilience', 'Exercise incident detection, money-movement freezes, provider failure, customer-status messaging, backup/restore, continuity, rollback/disable strategy, recovery reconciliation, and remediation.'),
  gate('capital-liquidity-financial-impact', 'Financial, capital, liquidity, reserve, and downside impact', 'financial-management', 'Assess the proposal-specific financial impact, funding, liquidity, capital/reserve implications, loss scenarios, accounting treatment, downside capacity, and financial reporting.'),
  gate('testing-monitoring-assurance', 'Testing, monitoring, independent challenge, metrics, and post-launch review', 'testing-monitoring', 'Define measurable acceptance criteria, testing in approved environments, monitoring/alerts, control evidence, independent challenge/testing as applicable, launch metrics, thresholds, and post-launch review.'),
  gate('release-change-control', 'Release approval, change record, staged rollout, kill switch, and rollback control', 'release-change-control', 'Use a controlled release record with dependencies, approvals, staged exposure, emergency controls, rollback/disable authority, post-release verification, and explicit human launch decision.'),
];

function requiredString(value: unknown, field: string, maxLength = 4_000) {
  if (typeof value !== 'string') throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', `${field} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', `${field} is invalid.`);
  return normalized;
}

function requiredList(value: unknown, field: string, maxItems = 30) {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxItems) {
    throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', `${field} must contain 1-${maxItems} items.`);
  }
  return value.map((item, index) => requiredString(item, `${field}[${index}]`, 500));
}

function validateGateReviews(value: unknown) {
  if (!Array.isArray(value) || value.length !== launchGates.length) {
    throw new BankingError(400, 'PRODUCT_LAUNCH_GATE_COVERAGE_INCOMPLETE', `gateReviews must contain exactly ${launchGates.length} launch gates.`);
  }

  const seen = new Set<string>();
  return value.map((raw, index) => {
    if (!raw || typeof raw !== 'object') throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', `gateReviews[${index}] is invalid.`);
    const input = raw as ProductLaunchGateReview;
    const gateId = requiredString(input.gateId, `gateReviews[${index}].gateId`, 160);
    const known = launchGates.find((item) => item.id === gateId);
    if (!known) throw new BankingError(400, 'UNKNOWN_PRODUCT_LAUNCH_GATE', 'Unknown product launch gate.');
    if (seen.has(gateId)) throw new BankingError(400, 'DUPLICATE_PRODUCT_LAUNCH_GATE', 'Each launch gate may appear only once.');
    seen.add(gateId);
    if (!['ready-for-human-review', 'not-ready', 'not-applicable-proposed'].includes(input.proposedDisposition)) {
      throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', `gateReviews[${index}].proposedDisposition is invalid.`);
    }
    return {
      gateId,
      proposedDisposition: input.proposedDisposition,
      rationale: requiredString(input.rationale, `gateReviews[${index}].rationale`, 2_500),
      evidenceReferences: requiredList(input.evidenceReferences, `gateReviews[${index}].evidenceReferences`, 20),
      accountableHumanRole: requiredString(input.accountableHumanRole, `gateReviews[${index}].accountableHumanRole`, 250),
      qualifiedReviewerRole: requiredString(input.qualifiedReviewerRole, `gateReviews[${index}].qualifiedReviewerRole`, 250),
      materialExceptions: requiredString(input.materialExceptions, `gateReviews[${index}].materialExceptions`, 2_000),
      remediationOrFollowUp: requiredString(input.remediationOrFollowUp, `gateReviews[${index}].remediationOrFollowUp`, 2_000)
    };
  });
}

export function evaluateProductLaunchReviewCandidate(input: ProductLaunchReviewCandidate) {
  const allowedChangeTypes: ProductChangeType[] = [
    'new-financial-product',
    'material-product-change',
    'new-jurisdiction',
    'new-customer-segment',
    'new-money-flow',
    'new-provider-or-rail',
    'material-disclosure-or-pricing-change',
    'material-automation-or-ai-change'
  ];
  if (!allowedChangeTypes.includes(input?.changeType)) {
    throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_CHANGE_TYPE', 'Unknown or missing product change type.');
  }

  const reviewedAt = requiredString(input.reviewedAt, 'reviewedAt', 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new BankingError(400, 'INVALID_PRODUCT_LAUNCH_INPUT', 'reviewedAt must be YYYY-MM-DD.');
  }

  const gateReviews = validateGateReviews(input.gateReviews);
  const proposedNotReadyCount = gateReviews.filter((item) => item.proposedDisposition === 'not-ready').length;
  const proposedNotApplicableCount = gateReviews.filter((item) => item.proposedDisposition === 'not-applicable-proposed').length;

  const candidate = {
    changeLabel: requiredString(input.changeLabel, 'changeLabel', 250),
    changeType: input.changeType,
    proposedProductOrFeature: requiredString(input.proposedProductOrFeature, 'proposedProductOrFeature'),
    proposedEntityAndProgramRole: requiredString(input.proposedEntityAndProgramRole, 'proposedEntityAndProgramRole'),
    targetCustomers: requiredList(input.targetCustomers, 'targetCustomers'),
    jurisdictions: requiredList(input.jurisdictions, 'jurisdictions'),
    moneyFlowSummary: requiredString(input.moneyFlowSummary, 'moneyFlowSummary'),
    dataFlowSummary: requiredString(input.dataFlowSummary, 'dataFlowSummary'),
    providerDependencySummary: requiredString(input.providerDependencySummary, 'providerDependencySummary'),
    customerImpactSummary: requiredString(input.customerImpactSummary, 'customerImpactSummary'),
    rollbackOrDisableStrategy: requiredString(input.rollbackOrDisableStrategy, 'rollbackOrDisableStrategy'),
    gateReviews,
    accountableLaunchOwnerRole: requiredString(input.accountableLaunchOwnerRole, 'accountableLaunchOwnerRole', 250),
    independentChallengeRole: requiredString(input.independentChallengeRole, 'independentChallengeRole', 250),
    reviewedAt
  };

  return {
    candidate,
    structurallyCompleteForHumanLaunchReview: true,
    requiredGateCount: launchGates.length,
    proposedNotReadyCount,
    proposedNotApplicableCount,
    everyGateHasHumanOwnerAndEvidenceReference: true,
    evidenceAuthenticated: false,
    legalComplianceApplicabilityApproved: false,
    sponsorOrRegulatedProgramScopeApproved: false,
    accountableHumanAssignmentsVerified: false,
    customerTermsAndMarketingApproved: false,
    financialCrimeControlsApproved: false,
    fraudLossControlsVerified: false,
    ledgerAndReconciliationVerified: false,
    providerCertificationVerified: false,
    securityPrivacyControlsVerified: false,
    supportComplaintControlsVerified: false,
    incidentContinuityRollbackVerified: false,
    financialCapitalLiquidityImpactApproved: false,
    independentTestingVerified: false,
    humanReleaseApprovalVerified: false,
    externalApprovalVerified: false,
    automaticLaunchEnablementAllowed: false,
    automaticLiveWriteEnablementAllowed: false,
    softwareMayApproveLegalLaunch: false,
    softwareMayApproveSponsorScope: false,
    softwareMayActAsReleaseApprover: false,
    launchApproved: false,
    liveFinancialActivityApproved: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural launch-governance review only. Complete fields and proposed gate dispositions do not authenticate evidence, establish legal applicability, approve sponsor/program scope, verify accountable humans, approve terms, prove financial-crime/fraud/security/privacy/accounting/support/resilience controls, validate capital or liquidity impact, prove independent testing, create a human release decision, enable production financial writes, or authorize live launch.'
  } as const;
}

export function productLaunchGovernanceStatus() {
  return {
    launchGovernanceModelAvailable: true,
    requiredGateCount: launchGates.length,
    satisfiedGateCount: 0,
    evidenceVerifiedGateCount: 0,
    humanApprovedGateCount: 0,
    externallyApprovedGateCount: 0,
    operatingControlVerifiedGateCount: 0,
    defaultRiskClassification: 'unclassified',
    defaultLaunchState: 'blocked-unverified',
    automaticLaunchEnablementAllowed: false,
    automaticLiveWriteEnablementAllowed: false,
    automaticLegalApprovalAllowed: false,
    automaticSponsorProgramApprovalAllowed: false,
    softwareReleaseApprovalAllowed: false,
    greenCiCountsAsLaunchApproval: false,
    completedPlanningDraftCountsAsLaunchApproval: false,
    selectedSponsorRelationshipCountsAsBlanketApproval: false,
    conditionalCharterApprovalCountsAsOpeningAuthority: false,
    launchApproved: false,
    liveFinancialActivityApproved: false,
    productionLaunchProcessApproved: false,
    productionChangeManagementProcessOperating: false,
    productionPostLaunchMonitoringOperating: false,
    gates: launchGates,
    disclosure: 'Fail-closed product/change launch governance for planning. Every gate begins blocked and unverified. Software may organize evidence and detect missing fields, but live launch requires the actual accountable humans, qualified reviews, external/program approvals where applicable, exercised controls, and an intentional authorized release decision. CI/build success alone never approves a financial product or production money movement.'
  } as const;
}
