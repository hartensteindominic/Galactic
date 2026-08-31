import { BankingError } from './banking';

export type ControlAssuranceDomain =
  | 'governance-accountability'
  | 'legal-compliance'
  | 'customer-protection'
  | 'financial-crime'
  | 'fraud-loss'
  | 'ledger-reconciliation'
  | 'provider-integrity'
  | 'security-access'
  | 'privacy-data'
  | 'support-complaints'
  | 'resilience-continuity'
  | 'financial-management'
  | 'third-party-risk'
  | 'testing-change-release';

export type ControlAssuranceRecord = {
  id: string;
  label: string;
  domain: ControlAssuranceDomain;
  accountableRoleIds: string[];
  complianceObligationIds: string[];
  sponsorDiligenceSectionIds: string[];
  launchGateIds: string[];
  assumptionEvidenceSlotIds: string[];
  status: 'design-reference-only';
  accountableOwnerVerified: false;
  controlDesignApproved: false;
  operatingEvidenceVerified: false;
  independentTestingVerified: false;
  remediationVerified: false;
  sponsorAccepted: false;
  boardOrGovernanceApproved: false;
  launchGateSatisfied: false;
  expectation: string;
};

export type ControlAssuranceCandidate = {
  controlId: string;
  selectedAccountableRoleId: string;
  controlScope: string;
  controlDescription: string;
  operatingEvidenceReferences: string[];
  testEvidenceReferences: string[];
  ownerAttestationReference: string;
  qualifiedReviewerRole: string;
  openIssuesAndExceptions: string;
  remediationOrFollowUp: string;
  evidenceAsOf: string;
  reviewedAt: string;
};

function record(
  id: string,
  label: string,
  domain: ControlAssuranceDomain,
  accountableRoleIds: string[],
  complianceObligationIds: string[],
  sponsorDiligenceSectionIds: string[],
  launchGateIds: string[],
  assumptionEvidenceSlotIds: string[],
  expectation: string
): ControlAssuranceRecord {
  return {
    id,
    label,
    domain,
    accountableRoleIds,
    complianceObligationIds,
    sponsorDiligenceSectionIds,
    launchGateIds,
    assumptionEvidenceSlotIds,
    status: 'design-reference-only',
    accountableOwnerVerified: false,
    controlDesignApproved: false,
    operatingEvidenceVerified: false,
    independentTestingVerified: false,
    remediationVerified: false,
    sponsorAccepted: false,
    boardOrGovernanceApproved: false,
    launchGateSatisfied: false,
    expectation
  };
}

const controls: ControlAssuranceRecord[] = [
  record(
    'governance-accountability',
    'Governance, accountability, authority, and segregation of duties',
    'governance-accountability',
    ['proposed-bank-board', 'chief-executive', 'chief-risk-owner'],
    ['cms-board-management-oversight', 'bsa-officer'],
    ['management-experience-qualifications', 'compliance-governance-ownership'],
    ['accountable-human-governance', 'release-change-control'],
    [],
    'Evidence should show real accountable humans, authority, delegation, escalation, conflicts/segregation, governance reporting, and actual approvals appropriate to the entity/program.'
  ),
  record(
    'legal-compliance-applicability',
    'Legal/compliance applicability and regulatory change management',
    'legal-compliance',
    ['consumer-compliance-officer', 'chief-risk-owner', 'charter-application-coordinator'],
    ['cms-policies-procedures', 'cms-change-management'],
    ['legal-regulatory-applicability', 'compliance-governance-ownership'],
    ['legal-compliance-applicability', 'sponsor-charter-program-scope'],
    ['sponsor-program-scope'],
    'Evidence should trace the exact product, role, customer, jurisdiction, claims, data and money flows to qualified applicability analysis, change tracking, ownership, and external/program conditions.'
  ),
  record(
    'customer-terms-marketing',
    'Customer terms, disclosures, pricing, eligibility, and marketing controls',
    'customer-protection',
    ['consumer-compliance-officer', 'complaints-customer-protection-owner'],
    ['cms-policies-procedures', 'cms-change-management', 'cms-complaint-response'],
    ['customer-protection-disclosures'],
    ['terms-disclosures-marketing', 'onboarding-identity-eligibility'],
    ['target-customer-demand', 'non-interchange-revenue'],
    'Evidence should prove approved versioned terms, fees/limits/eligibility, role/insurance wording, marketing substantiation, change control, and actual product behavior are consistent.'
  ),
  record(
    'bsa-aml-sanctions',
    'BSA/AML, customer identification, sanctions, training, and escalation',
    'financial-crime',
    ['bsa-aml-officer', 'consumer-compliance-officer'],
    ['bsa-written-program-board-approval', 'bsa-internal-controls', 'bsa-independent-testing', 'bsa-officer', 'bsa-training', 'cip-program', 'ofac-risk-based-program'],
    ['bsa-aml-kyc-sanctions'],
    ['bsa-aml-sanctions', 'onboarding-identity-eligibility'],
    ['cac-onboarding'],
    'Evidence should show actual program responsibility allocation, written controls, qualified human ownership, training, confidentiality, case/escalation authority, independent testing, and sponsor/program integration where applicable.'
  ),
  record(
    'fraud-loss-dispute',
    'Fraud, abuse, loss, disputes, error handling, and risk limits',
    'fraud-loss',
    ['chief-risk-owner', 'complaints-customer-protection-owner', 'technology-operations-owner'],
    ['cms-monitoring-audit', 'cms-complaint-response'],
    ['risk-management-internal-controls', 'complaints-support-remediation'],
    ['fraud-loss-controls', 'support-complaints-disputes'],
    ['fraud-loss'],
    'Evidence should show threat/loss scenarios, controls and limits, human review, liability/error handling, dispute/fraud workflows, monitoring thresholds, measured performance, and remediation.'
  ),
  record(
    'ledger-funds-reconciliation',
    'Funds flow, ledger, settlement, idempotency, and reconciliation',
    'ledger-reconciliation',
    ['finance-capital-owner', 'technology-operations-owner'],
    ['cms-monitoring-audit'],
    ['ledger-reconciliation-funds-flow'],
    ['funds-flow-ledger-reconciliation'],
    ['provider-card-costs', 'sponsor-program-economics'],
    'Evidence should connect authoritative transaction states, balances, settlement, double-entry journals, retry/idempotency, unknown outcomes, provider statements, reconciliation exceptions, and customer history.'
  ),
  record(
    'provider-integration-authenticity',
    'Provider semantics, authentication, webhook integrity, certification, and operational boundaries',
    'provider-integrity',
    ['technology-operations-owner', 'security-owner', 'third-party-risk-owner'],
    ['cms-third-party-oversight', 'cms-monitoring-audit'],
    ['provider-webhooks-integrations', 'third-party-inventory-diligence'],
    ['provider-integration-certification'],
    ['provider-card-costs', 'sponsor-program-scope'],
    'Evidence should show exact provider state mapping, authentication/signature/anti-replay, key rotation, limits, error semantics, certification, failure behavior, support/escalation, and responsible humans.'
  ),
  record(
    'security-access-sdlc',
    'Information security, privileged access, secrets, SDLC, and incident detection',
    'security-access',
    ['security-owner', 'technology-operations-owner'],
    ['cms-policies-procedures', 'cms-training', 'cms-monitoring-audit', 'cms-third-party-oversight'],
    ['information-security-access'],
    ['security-access-change'],
    [],
    'Evidence should show production identity/MFA, least privilege, privileged approvals, secrets/key management, secure SDLC/change controls, logging, vulnerability management, incident detection/response, and independent security review.'
  ),
  record(
    'privacy-data-governance',
    'Privacy, data inventory, purpose, sharing, retention, deletion, and restricted evidence',
    'privacy-data',
    ['privacy-data-owner', 'security-owner'],
    ['cms-policies-procedures', 'cms-third-party-oversight', 'cms-change-management'],
    ['privacy-data-governance'],
    ['privacy-data-retention'],
    ['sponsor-program-scope'],
    'Evidence should show the actual data map, purpose/authority, notices/consents where applicable, access, vendor sharing, retention/deletion, restricted evidence handling, logging boundaries, and approved production data flows.'
  ),
  record(
    'complaints-support-remediation',
    'Complaints, support, disputes, remediation, root cause, and escalation',
    'support-complaints',
    ['complaints-customer-protection-owner', 'consumer-compliance-officer'],
    ['cms-complaint-response', 'cms-monitoring-audit', 'cms-training'],
    ['complaints-support-remediation'],
    ['support-complaints-disputes'],
    ['support-compliance-servicing-cost'],
    'Evidence should show complaint recognition, staffed human ownership, applicable response/error timelines, disputes/fraud handoff, remediation, root-cause analysis, trend reporting, and auditability.'
  ),
  record(
    'resilience-continuity-recovery',
    'Incident response, continuity, disaster recovery, provider failure, and recovery reconciliation',
    'resilience-continuity',
    ['business-continuity-owner', 'technology-operations-owner', 'security-owner'],
    ['cms-policies-procedures', 'cms-change-management', 'cms-third-party-oversight'],
    ['operational-resilience-bcdr', 'termination-portability-exit'],
    ['incident-continuity-rollback'],
    ['provider-exit-assumptions'],
    'Evidence should show approved recovery objectives, exercised backup/restore, dependency/provider failure scenarios, incident roles, customer communications, fail-closed controls, recovery reconciliation, rollback, and remediation.'
  ),
  record(
    'financial-capital-liquidity',
    'Financial reporting, capital, liquidity, funding, reserves, and downside capacity',
    'financial-management',
    ['finance-capital-owner', 'chief-risk-owner'],
    ['cms-board-management-oversight', 'cms-monitoring-audit'],
    ['financial-condition-capital-runway', 'risk-management-internal-controls'],
    ['capital-liquidity-financial-impact'],
    ['planning-capital-target', 'committed-capital-source', 'pre-opening-burn', 'liquidity-contingency', 'deposit-funding', 'loss-expense-projection', 'stable-profitability'],
    'Evidence should reconcile financial statements, assumptions, funding, capital/liquidity/reserve strategy, loss/downside scenarios, source evidence, thresholds, governance, and proposal-specific external review.'
  ),
  record(
    'third-party-risk-exit',
    'Third-party due diligence, contracts, monitoring, concentration, termination, and exit',
    'third-party-risk',
    ['third-party-risk-owner', 'business-continuity-owner', 'technology-operations-owner'],
    ['cms-third-party-oversight', 'cms-monitoring-audit', 'cms-change-management'],
    ['third-party-inventory-diligence', 'termination-portability-exit', 'open-items-risk-acceptance'],
    ['provider-integration-certification', 'incident-continuity-rollback'],
    ['sponsor-program-economics', 'sponsor-program-scope', 'provider-exit-assumptions'],
    'Evidence should cover due diligence, contracts/SLAs/audit rights, subcontractors, concentration, ongoing monitoring, unresolved exceptions, termination/cure, data/statement access, settlement/reserves, transition support, and exercised exit scenarios.'
  ),
  record(
    'independent-testing-change-release',
    'Independent testing, issue remediation, change management, release approval, and post-launch monitoring',
    'testing-change-release',
    ['internal-audit-function', 'chief-risk-owner', 'technology-operations-owner'],
    ['cms-monitoring-audit', 'cms-change-management', 'bsa-independent-testing'],
    ['audit-evidence-exam-cooperation', 'open-items-risk-acceptance'],
    ['testing-monitoring-assurance', 'release-change-control'],
    [],
    'Evidence should show test scope/results, independence, findings, owners/deadlines, remediation validation, change records, staged release controls, authorized human approval, monitoring thresholds, rollback, and post-launch review.'
  )
];

function requiredString(value: unknown, field: string, maxLength = 4_000) {
  if (typeof value !== 'string') throw new BankingError(400, 'INVALID_CONTROL_ASSURANCE_INPUT', `${field} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BankingError(400, 'INVALID_CONTROL_ASSURANCE_INPUT', `${field} is invalid.`);
  return normalized;
}

function requiredReferences(value: unknown, field: string, maxItems = 30) {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxItems) {
    throw new BankingError(400, 'INVALID_CONTROL_ASSURANCE_INPUT', `${field} must contain 1-${maxItems} references.`);
  }
  return value.map((item, index) => requiredString(item, `${field}[${index}]`, 500));
}

function requiredDate(value: unknown, field: string) {
  const normalized = requiredString(value, field, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) throw new BankingError(400, 'INVALID_CONTROL_ASSURANCE_INPUT', `${field} must be YYYY-MM-DD.`);
  return normalized;
}

export function evaluateControlAssuranceCandidate(input: ControlAssuranceCandidate) {
  const controlId = requiredString(input?.controlId, 'controlId', 160);
  const control = controls.find((item) => item.id === controlId);
  if (!control) throw new BankingError(400, 'UNKNOWN_CONTROL_ASSURANCE_RECORD', 'Unknown control assurance record.');

  const selectedAccountableRoleId = requiredString(input.selectedAccountableRoleId, 'selectedAccountableRoleId', 160);
  if (!control.accountableRoleIds.includes(selectedAccountableRoleId)) {
    throw new BankingError(400, 'ACCOUNTABLE_ROLE_NOT_MAPPED_TO_CONTROL', 'Selected accountable role is not mapped to this control domain.');
  }

  const candidate = {
    controlId,
    selectedAccountableRoleId,
    controlScope: requiredString(input.controlScope, 'controlScope'),
    controlDescription: requiredString(input.controlDescription, 'controlDescription'),
    operatingEvidenceReferences: requiredReferences(input.operatingEvidenceReferences, 'operatingEvidenceReferences'),
    testEvidenceReferences: requiredReferences(input.testEvidenceReferences, 'testEvidenceReferences'),
    ownerAttestationReference: requiredString(input.ownerAttestationReference, 'ownerAttestationReference', 500),
    qualifiedReviewerRole: requiredString(input.qualifiedReviewerRole, 'qualifiedReviewerRole', 250),
    openIssuesAndExceptions: requiredString(input.openIssuesAndExceptions, 'openIssuesAndExceptions', 2_500),
    remediationOrFollowUp: requiredString(input.remediationOrFollowUp, 'remediationOrFollowUp', 2_500),
    evidenceAsOf: requiredDate(input.evidenceAsOf, 'evidenceAsOf'),
    reviewedAt: requiredDate(input.reviewedAt, 'reviewedAt')
  };

  return {
    candidate,
    structurallyCompleteForHumanAssuranceReview: true,
    mappedAccountableRole: true,
    linkedComplianceObligationCount: control.complianceObligationIds.length,
    linkedSponsorDiligenceSectionCount: control.sponsorDiligenceSectionIds.length,
    linkedLaunchGateCount: control.launchGateIds.length,
    linkedAssumptionEvidenceSlotCount: control.assumptionEvidenceSlotIds.length,
    accountableOwnerVerified: false,
    ownerAttestationAuthenticated: false,
    controlDesignApproved: false,
    operatingEvidenceAuthenticated: false,
    operatingEffectivenessVerified: false,
    testEvidenceAuthenticated: false,
    independentTestingVerified: false,
    issuesAndExceptionsResolved: false,
    remediationVerified: false,
    qualifiedReviewCompleted: false,
    sponsorAccepted: false,
    boardOrGovernanceApproved: false,
    launchGateSatisfied: false,
    softwareMayActAsControlOwner: false,
    softwareMayActAsIndependentTester: false,
    softwareMayCloseFindings: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural control-assurance package only. Mapped IDs and evidence references do not verify the accountable human, authenticate evidence or attestations, approve control design, prove operating effectiveness, establish test independence, close findings, verify remediation, obtain sponsor/board acceptance, satisfy a launch gate, or authorize live financial activity.'
  } as const;
}

export function controlAssuranceMapStatus() {
  return {
    mapAvailable: true,
    controlCount: controls.length,
    designReferenceCount: controls.length,
    accountableOwnerVerifiedCount: 0,
    controlDesignApprovedCount: 0,
    operatingEvidenceVerifiedCount: 0,
    independentTestingVerifiedCount: 0,
    remediationVerifiedCount: 0,
    sponsorAcceptedCount: 0,
    boardOrGovernanceApprovedCount: 0,
    launchGateSatisfiedCount: 0,
    softwareMayActAsControlOwner: false,
    softwareMayActAsIndependentTester: false,
    softwareMayCloseFindings: false,
    automaticOperatingEffectivenessPromotionEnabled: false,
    automaticLaunchGatePromotionEnabled: false,
    productionControlAssuranceProgramOperating: false,
    controls,
    disclosure: 'Machine-readable control-to-owner-to-obligation-to-diligence-to-launch-to-evidence map only. Every control begins as a design reference, not an approved or operating control. Actual ownership, operating evidence, test independence/results, issue remediation, sponsor/board acceptance, and launch-gate satisfaction require authenticated evidence and accountable human/external review.'
  } as const;
}
