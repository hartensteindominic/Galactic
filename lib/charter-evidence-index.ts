import { BankingError } from './banking';

export type CharterEvidenceProofType =
  | 'internal-operating-data'
  | 'qualified-human-review'
  | 'external-authority-record';

export type CharterEvidenceClaim = {
  id: string;
  label: string;
  phase: 'fintech-proof' | 'charter-feasibility' | 'organizer-readiness' | 'application-readiness' | 'conditional-approval' | 'pre-opening' | 'chartered-operations';
  proofType: CharterEvidenceProofType;
  authorityCategory?: 'chartering-authority' | 'deposit-insurer' | 'federal-reserve' | 'state-authority' | 'other-applicable-authority';
  currentVerified: false;
  accountableHumanAssigned: false;
  currentEvidenceReference: null;
  currentExternalAuthorityRecordVerified: false;
  description: string;
};

export type CharterEvidenceCandidate = {
  claimId: string;
  accountableHumanRole: string;
  evidenceReference: string;
  qualifiedHumanReviewed: boolean;
  internalDataSource?: string;
  externalAuthority?: string;
  authorityRecordDate?: string;
};

export type CharterEvidenceCandidateEvaluation = {
  claimId: string;
  eligibleForHumanEvidenceReview: true;
  proofType: CharterEvidenceProofType;
  softwareVerifiedClaim: false;
  externalAuthorityRecordPresent: boolean;
  disclosure: string;
};

const CLAIMS: CharterEvidenceClaim[] = [
  {
    id: 'validated-business-thesis',
    label: 'Validated customer, problem, distribution, and revenue thesis',
    phase: 'fintech-proof',
    proofType: 'internal-operating-data',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires sourced customer/distribution/economic evidence and accountable human review; software completion alone is not product-market-fit evidence.'
  },
  {
    id: 'validated-unit-economics',
    label: 'Validated driver-based unit economics',
    phase: 'fintech-proof',
    proofType: 'internal-operating-data',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires sourced assumptions or actual operating data for acquisition, retained revenue, fraud, support, compliance, provider, servicing, retention, and other relevant costs.'
  },
  {
    id: 'charter-route-memo',
    label: 'Qualified charter-route and corporate-structure analysis',
    phase: 'charter-feasibility',
    proofType: 'qualified-human-review',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires accountable qualified legal/regulatory analysis for the actual ownership, products, activities, geography, and proposed institution.'
  },
  {
    id: 'regulator-prefiling-record',
    label: 'Relevant regulator pre-filing engagement record',
    phase: 'charter-feasibility',
    proofType: 'external-authority-record',
    authorityCategory: 'chartering-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires a real record of the applicable authority engagement; a drafted agenda or simulated meeting does not count.'
  },
  {
    id: 'organizer-board-management-package',
    label: 'Organizer, board, and executive-management qualification package',
    phase: 'organizer-readiness',
    proofType: 'qualified-human-review',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires named people, roles, experience, governance, conflicts, background materials, and applicable review evidence. AI cannot serve as the organizing group or accountable bank officer.'
  },
  {
    id: 'regulator-ready-business-plan',
    label: 'Regulator-ready bank business plan and financial projections',
    phase: 'organizer-readiness',
    proofType: 'qualified-human-review',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires a supported bank-level plan, projections, risk analysis, controls, funding/liquidity assumptions, downside cases, staffing, governance, and accountable review.'
  },
  {
    id: 'capital-source-funds-package',
    label: 'Capital plan, commitments, and source-of-funds evidence',
    phase: 'organizer-readiness',
    proofType: 'qualified-human-review',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires real capital evidence matched to the final proposal. The repository does not assume a universal dollar charter-capital requirement.'
  },
  {
    id: 'charter-application-receipt',
    label: 'Charter application filed/accepted record',
    phase: 'application-readiness',
    proofType: 'external-authority-record',
    authorityCategory: 'chartering-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires an authoritative filing/acceptance record from the applicable chartering authority. A completed draft does not count.'
  },
  {
    id: 'deposit-insurance-application-receipt',
    label: 'Deposit-insurance application filed/accepted record',
    phase: 'application-readiness',
    proofType: 'external-authority-record',
    authorityCategory: 'deposit-insurer',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires an authoritative record from the applicable deposit insurer. A draft application does not count.'
  },
  {
    id: 'other-required-regulatory-filings',
    label: 'Other applicable ownership/membership/control regulatory filings',
    phase: 'application-readiness',
    proofType: 'external-authority-record',
    authorityCategory: 'other-applicable-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Exact filings depend on the final structure and must be determined by qualified advisers and the relevant authorities rather than assumed by software.'
  },
  {
    id: 'conditional-charter-approval',
    label: 'Preliminary or conditional charter approval record',
    phase: 'conditional-approval',
    proofType: 'external-authority-record',
    authorityCategory: 'chartering-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires the actual applicable authority record and must preserve all outstanding conditions; conditional approval is not opening authority.'
  },
  {
    id: 'deposit-insurance-approval',
    label: 'Deposit-insurance approval record',
    phase: 'conditional-approval',
    proofType: 'external-authority-record',
    authorityCategory: 'deposit-insurer',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires authoritative deposit-insurance approval evidence. Approval conditions and effective date must be preserved exactly.'
  },
  {
    id: 'preopening-condition-evidence',
    label: 'Pre-opening conditions and examination/readiness evidence',
    phase: 'pre-opening',
    proofType: 'external-authority-record',
    authorityCategory: 'chartering-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires real evidence that applicable pre-opening conditions, examinations, staffing, systems, capital, policies, and controls have been satisfied or accepted.'
  },
  {
    id: 'opening-authorization',
    label: 'Final opening authorization record',
    phase: 'pre-opening',
    proofType: 'external-authority-record',
    authorityCategory: 'chartering-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires authoritative evidence that the institution is permitted to open; source code, a conditional approval, or a press release is not enough.'
  },
  {
    id: 'effective-charter-and-insurance',
    label: 'Effective charter and applicable deposit insurance',
    phase: 'chartered-operations',
    proofType: 'external-authority-record',
    authorityCategory: 'other-applicable-authority',
    currentVerified: false,
    accountableHumanAssigned: false,
    currentEvidenceReference: null,
    currentExternalAuthorityRecordVerified: false,
    description: 'Requires authoritative effective-status evidence before customer-facing bank or insured-deposit claims can be enabled.'
  }
];

function cleanText(value: string, field: string, max: number) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.length > max) {
    throw new BankingError(400, 'INVALID_CHARTER_EVIDENCE', `${field} is required and must be ${max} characters or fewer.`);
  }
  return normalized;
}

function validDateOnly(value: string | undefined) {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function evaluateCharterEvidenceCandidate(input: CharterEvidenceCandidate): CharterEvidenceCandidateEvaluation {
  const claim = CLAIMS.find((candidate) => candidate.id === input.claimId);
  if (!claim) throw new BankingError(404, 'UNKNOWN_CHARTER_EVIDENCE_CLAIM', 'Unknown charter evidence claim.');

  cleanText(input.accountableHumanRole, 'accountableHumanRole', 160);
  cleanText(input.evidenceReference, 'evidenceReference', 400);

  if (!input.qualifiedHumanReviewed) {
    throw new BankingError(409, 'QUALIFIED_HUMAN_REVIEW_REQUIRED', 'Charter evidence cannot advance without accountable qualified-human review.');
  }

  if (claim.proofType === 'internal-operating-data') {
    cleanText(input.internalDataSource || '', 'internalDataSource', 300);
  }

  let externalAuthorityRecordPresent = false;
  if (claim.proofType === 'external-authority-record') {
    cleanText(input.externalAuthority || '', 'externalAuthority', 200);
    if (!validDateOnly(input.authorityRecordDate)) {
      throw new BankingError(400, 'AUTHORITY_RECORD_DATE_REQUIRED', 'A valid authority record date is required for external regulatory evidence.');
    }
    externalAuthorityRecordPresent = true;
  }

  return {
    claimId: claim.id,
    eligibleForHumanEvidenceReview: true,
    proofType: claim.proofType,
    softwareVerifiedClaim: false,
    externalAuthorityRecordPresent,
    disclosure: 'Passing this evidence-shape check only means the candidate contains the minimum fields for accountable human review. Software does not verify authenticity, legal sufficiency, regulator acceptance, approval status, or authority to operate.'
  };
}

export function charterEvidenceIndexStatus() {
  return {
    machineReadableEvidenceIndexAvailable: true,
    automaticRegulatoryStatusPromotionEnabled: false,
    softwareCanVerifyExternalAuthorityRecords: false,
    softwareCanMarkBankCharterEffective: false,
    softwareCanMarkFdicInsuranceEffective: false,
    softwareCanAuthorizeCustomerFacingBankClaims: false,
    evidenceRepositoryConnected: false,
    accountableHumanAssignmentComplete: false,
    qualifiedExternalReviewWorkflowOperating: false,
    regulatorEvidenceVerificationWorkflowOperating: false,
    verifiedClaimCount: 0,
    claims: CLAIMS.map((claim) => ({ ...claim })),
    disclosure: 'Evidence index for planning and diligence preparation only. Every current claim is unverified. Exact application evidence, accountable roles, legal sufficiency, record retention, and regulator requirements must be determined for the actual charter path and independently reviewed.'
  } as const;
}
