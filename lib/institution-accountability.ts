import { BankingError } from './banking';

export type AccountableRoleActorClass =
  | 'human-individual'
  | 'human-committee'
  | 'independent-human-led-function'
  | 'regulated-partner-human-function';

export type InstitutionAccountabilityRole = {
  id: string;
  label: string;
  category: 'board-governance' | 'executive-management' | 'risk-compliance' | 'finance' | 'technology-security' | 'operations-customer' | 'independent-assurance' | 'regulated-partner';
  futureBankRole: true;
  assignmentStatus: 'unassigned';
  qualifiedHumanRequired: true;
  aiMayServeAsAccountableOwner: false;
  softwareMayServeAsAccountableOwner: false;
  assignmentVerified: false;
  qualificationsVerified: false;
  authorityVerified: false;
  independenceVerified: false;
  writtenDelegationVerified: false;
  boardOrGovernanceApprovalVerified: false;
  operatingEvidenceVerified: false;
  externalReviewVerified: false;
  expectation: string;
};

export type AccountabilityAssignmentCandidate = {
  roleId: string;
  actorClass: AccountableRoleActorClass;
  proposedRoleTitle: string;
  proposedOrganization: string;
  qualificationsSummary: string;
  authoritySummary: string;
  independenceSummary: string;
  evidenceReferences: string[];
  reviewerRole: string;
  reviewedAt: string;
};

function role(
  id: string,
  label: string,
  category: InstitutionAccountabilityRole['category'],
  expectation: string
): InstitutionAccountabilityRole {
  return {
    id,
    label,
    category,
    futureBankRole: true,
    assignmentStatus: 'unassigned',
    qualifiedHumanRequired: true,
    aiMayServeAsAccountableOwner: false,
    softwareMayServeAsAccountableOwner: false,
    assignmentVerified: false,
    qualificationsVerified: false,
    authorityVerified: false,
    independenceVerified: false,
    writtenDelegationVerified: false,
    boardOrGovernanceApprovalVerified: false,
    operatingEvidenceVerified: false,
    externalReviewVerified: false,
    expectation
  };
}

const roles: InstitutionAccountabilityRole[] = [
  role('proposed-bank-board', 'Proposed bank board of directors', 'board-governance', 'A future bank requires qualified human directors with real governance authority; software cannot constitute or act as the board.'),
  role('chief-executive', 'Chief executive / bank president', 'executive-management', 'A qualified human executive must have actual authority and responsibility for the proposed institution and its execution.'),
  role('bsa-aml-officer', 'BSA/AML compliance officer', 'risk-compliance', 'A qualified human BSA/AML officer must have actual authority, resources, competence, and access appropriate to the applicable bank program.'),
  role('consumer-compliance-officer', 'Consumer compliance owner', 'risk-compliance', 'A qualified human compliance owner must oversee applicable consumer-protection obligations and the compliance-management system.'),
  role('chief-risk-owner', 'Enterprise / bank risk owner', 'risk-compliance', 'A qualified human risk owner must oversee the risk framework and escalation appropriate to the institution’s size, complexity, and risk profile.'),
  role('finance-capital-owner', 'Finance / capital / liquidity owner', 'finance', 'A qualified human finance owner must be accountable for financial reporting, capital, liquidity, budgeting, and regulator-facing financial evidence as applicable.'),
  role('security-owner', 'Information security owner', 'technology-security', 'A qualified human security owner must be accountable for the security program, access governance, incident response, and control evidence.'),
  role('technology-operations-owner', 'Bank technology and operations owner', 'technology-security', 'A qualified human owner must be accountable for production banking systems, resilience, change management, operational controls, and provider dependencies.'),
  role('privacy-data-owner', 'Privacy and data-governance owner', 'technology-security', 'A qualified human owner must oversee applicable privacy, data classification, retention, deletion, data sharing, and evidence requirements.'),
  role('complaints-customer-protection-owner', 'Complaints and customer-protection owner', 'operations-customer', 'A qualified human owner must oversee complaints, escalations, customer remediation, root-cause analysis, and applicable response obligations.'),
  role('third-party-risk-owner', 'Third-party risk owner', 'risk-compliance', 'A qualified human owner must oversee due diligence, contracts, monitoring, concentration, contingency, and exit planning for critical third parties.'),
  role('business-continuity-owner', 'Business continuity / disaster recovery owner', 'operations-customer', 'A qualified human owner must oversee continuity planning, recovery objectives, exercises, restoration evidence, and remediation.'),
  role('internal-audit-function', 'Independent internal audit / assurance function', 'independent-assurance', 'Independent human-led assurance must be appropriately scoped and sufficiently independent from the activities it tests.'),
  role('sponsor-program-accountable-function', 'Sponsor-bank / regulated-program accountable function', 'regulated-partner', 'Before any sponsor-program launch, the actual regulated partner’s accountable human function and the contractual allocation of responsibilities must be known and approved.'),
  role('charter-application-coordinator', 'Charter application / regulator coordination owner', 'executive-management', 'A qualified human organizer or authorized professional must coordinate application evidence and regulator communications; software cannot file, attest, or speak as an organizer.'),
  role('ai-model-governance-owner', 'AI / model / automated-decision governance owner', 'risk-compliance', 'A qualified human owner must govern any material AI/model use and ensure automation never becomes the accountable regulated actor.')
];

function requiredString(value: unknown, field: string, maxLength = 1_500) {
  if (typeof value !== 'string') throw new BankingError(400, 'INVALID_ACCOUNTABILITY_INPUT', `${field} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BankingError(400, 'INVALID_ACCOUNTABILITY_INPUT', `${field} is invalid.`);
  return normalized;
}

function requiredReferences(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) {
    throw new BankingError(400, 'INVALID_ACCOUNTABILITY_INPUT', 'evidenceReferences must contain 1-20 references.');
  }
  return value.map((item, index) => requiredString(item, `evidenceReferences[${index}]`, 500));
}

export function evaluateAccountabilityAssignmentCandidate(input: AccountabilityAssignmentCandidate) {
  const roleId = requiredString(input?.roleId, 'roleId', 120);
  const record = roles.find((item) => item.id === roleId);
  if (!record) throw new BankingError(400, 'UNKNOWN_ACCOUNTABILITY_ROLE', 'Unknown accountability role.');

  const allowedActorClasses: AccountableRoleActorClass[] = [
    'human-individual',
    'human-committee',
    'independent-human-led-function',
    'regulated-partner-human-function'
  ];
  if (!allowedActorClasses.includes(input?.actorClass)) {
    throw new BankingError(400, 'INVALID_ACCOUNTABILITY_ACTOR_CLASS', 'Accountable actor must be a permitted human or human-led governance class.');
  }

  const reviewedAt = requiredString(input.reviewedAt, 'reviewedAt', 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new BankingError(400, 'INVALID_ACCOUNTABILITY_INPUT', 'reviewedAt must be YYYY-MM-DD.');
  }

  const candidate = {
    roleId,
    actorClass: input.actorClass,
    proposedRoleTitle: requiredString(input.proposedRoleTitle, 'proposedRoleTitle', 200),
    proposedOrganization: requiredString(input.proposedOrganization, 'proposedOrganization', 300),
    qualificationsSummary: requiredString(input.qualificationsSummary, 'qualificationsSummary'),
    authoritySummary: requiredString(input.authoritySummary, 'authoritySummary'),
    independenceSummary: requiredString(input.independenceSummary, 'independenceSummary'),
    evidenceReferences: requiredReferences(input.evidenceReferences),
    reviewerRole: requiredString(input.reviewerRole, 'reviewerRole', 200),
    reviewedAt
  };

  return {
    candidate,
    structurallyCompleteForHumanGovernanceReview: true,
    assignmentVerified: false,
    qualificationsVerified: false,
    authorityVerified: false,
    independenceVerified: false,
    writtenDelegationVerified: false,
    boardOrGovernanceApprovalVerified: false,
    regulatorOrSponsorAcceptanceVerified: false,
    readinessPromotionAllowed: false,
    aiCanServeAsNamedAccountableOwner: false,
    softwareCanServeAsNamedAccountableOwner: false,
    humanGovernanceReviewRequired: true,
    disclosure: 'This evaluator checks only whether a proposed accountability-assignment package contains the fields needed for human governance review. It does not appoint a person, verify identity or qualifications, create legal authority, approve board action, satisfy independence requirements, establish employment or contractual responsibility, obtain sponsor/regulator acceptance, or make Galactic ready for live banking or a charter application.'
  } as const;
}

export function institutionAccountabilityStatus() {
  return {
    accountabilityModelAvailable: true,
    roleCount: roles.length,
    assignedRoleCount: 0,
    verifiedQualifiedRoleCount: 0,
    verifiedAuthorityRoleCount: 0,
    verifiedIndependentRoleCount: 0,
    verifiedOperatingRoleCount: 0,
    responsibilityMatrixAssigned: false,
    proposedBankBoardAssignedAndQualified: false,
    executiveManagementAssignedAndQualified: false,
    bsaAmlOfficerAssignedAndQualified: false,
    consumerComplianceOwnerAssignedAndQualified: false,
    riskOwnerAssignedAndQualified: false,
    financeCapitalOwnerAssignedAndQualified: false,
    securityOwnerAssignedAndQualified: false,
    independentAuditFunctionAssignedAndQualified: false,
    sponsorProgramAccountableFunctionVerified: false,
    charterApplicationCoordinatorAssignedAndQualified: false,
    aiMayServeAsAccountableOwner: false,
    softwareMayServeAsAccountableOwner: false,
    automatedAssignmentAllowed: false,
    automatedQualificationVerificationAllowed: false,
    automatedAuthorityCreationAllowed: false,
    readyForSponsorProgramResponsibilitySignoff: false,
    readyForCharterGovernanceSubmission: false,
    roles,
    disclosure: 'Institution-accountability planning only. Every role is intentionally unassigned. AI, Orbit, ChatGPT, autonomous agents, source code, CI, and software services cannot serve as the accountable bank board, bank officer, BSA/AML officer, compliance officer, risk officer, finance officer, internal audit function, organizer, regulator, or sponsor-bank accountable human. Actual people/functions, qualifications, authority, independence, delegations, approvals, contracts, and operating evidence require accountable human and external review.'
  } as const;
}
