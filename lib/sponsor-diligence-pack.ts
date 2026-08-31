import { BankingError } from './banking';

export type SponsorDiligenceSection = {
  id: string;
  label: string;
  category:
    | 'business-qualifications'
    | 'financial-condition'
    | 'legal-compliance'
    | 'risk-controls'
    | 'information-security'
    | 'operational-resilience'
    | 'program-operations'
    | 'customer-protection'
    | 'third-party-risk'
    | 'continuity-termination';
  status: 'evidence-required';
  humanAttestationRequired: true;
  sponsorReviewRequired: true;
  evidenceVerified: false;
  humanAttestationVerified: false;
  sponsorAccepted: false;
  expectation: string;
};

export type SponsorDiligenceResponseCandidate = {
  sectionId: string;
  proposedProgramRole: string;
  responseSummary: string;
  evidenceReferences: string[];
  accountableHumanRole: string;
  attestingHumanRole: string;
  qualifiedReviewerRole: string;
  materialExceptions: string;
  remediationOrFollowUp: string;
  reviewedAt: string;
};

const officialSources = [
  {
    id: 'interagency-tprm-2023',
    authority: 'Federal Reserve / FDIC / OCC',
    title: 'Interagency Guidance on Third-Party Relationships: Risk Management',
    canonicalUrl: 'https://www.fdic.gov/news/financial-institution-letters/2023/fil23029.html',
    reviewedAt: '2026-08-30',
    note: 'Current interagency third-party-risk guidance describes planning, due diligence and selection, contract negotiation, ongoing monitoring, and termination. Use of a third party does not remove a banking organization’s responsibility to operate safely and soundly and in compliance with applicable law.'
  },
  {
    id: 'fintech-diligence-guide-2021',
    authority: 'Federal Reserve / FDIC / OCC',
    title: 'Conducting Due Diligence on Financial Technology Companies: A Guide for Community Banks',
    canonicalUrl: 'https://www.fdic.gov/news/financial-institution-letters/2021/fil21059.html',
    reviewedAt: '2026-08-30',
    note: 'The guide organizes fintech due diligence around business experience and qualifications, financial condition, legal and regulatory compliance, risk management and controls, information security, and operational resilience. The guide is voluntary and not exhaustive.'
  },
  {
    id: 'fdic-third-party-resources-2025',
    authority: 'FDIC',
    title: 'Third-Party Relationships supervisory resources',
    canonicalUrl: 'https://www.fdic.gov/resources/bankers/third-party-relationships/',
    reviewedAt: '2026-08-30',
    note: 'Current FDIC resource page continues to point banks to the interagency guidance and fintech due-diligence guide. It is a source index, not sponsor approval of Galactic.'
  }
] as const;

function section(
  id: string,
  label: string,
  category: SponsorDiligenceSection['category'],
  expectation: string
): SponsorDiligenceSection {
  return {
    id,
    label,
    category,
    status: 'evidence-required',
    humanAttestationRequired: true,
    sponsorReviewRequired: true,
    evidenceVerified: false,
    humanAttestationVerified: false,
    sponsorAccepted: false,
    expectation
  };
}

const sections: SponsorDiligenceSection[] = [
  section('legal-entity-ownership-control', 'Legal entity, ownership, control, and organization', 'business-qualifications', 'Identify actual legal entities, ownership/control, organizers, governance, affiliates, jurisdictions, and material organizational changes with private authoritative evidence.'),
  section('management-experience-qualifications', 'Management experience and qualifications', 'business-qualifications', 'Provide accountable human management roles, relevant experience, qualifications, background-review references, succession, and conflicts without committing sensitive records to the public repository.'),
  section('business-model-program-scope', 'Business model and proposed program scope', 'business-qualifications', 'Describe target customers, problem, products, distribution, revenue mechanics, program role, geography, money/data flows, and activities requiring sponsor approval.'),
  section('financial-condition-capital-runway', 'Financial condition, funding, capital, and runway', 'financial-condition', 'Provide current financial condition, funding sources, burn/runway, forecasts, downside capacity, insurance, and source evidence. Scenario outputs alone are not verified financial condition.'),
  section('legal-regulatory-applicability', 'Legal and regulatory applicability analysis', 'legal-compliance', 'Map products, roles, jurisdictions, marketing, customer types, and activities to qualified legal/compliance analysis. Software does not determine applicability.'),
  section('compliance-governance-ownership', 'Compliance governance and accountable ownership', 'legal-compliance', 'Identify accountable humans/functions, policy ownership, escalation, training, monitoring, complaints, independent testing, and sponsor responsibility allocation for applicable obligations.'),
  section('bsa-aml-kyc-sanctions', 'BSA/AML, KYC/KYB/CIP, sanctions, and fraud boundaries', 'legal-compliance', 'Document the actual sponsor/program allocation, provider roles, escalation, alert/case authority, confidentiality, testing, and certification requirements. No live program is implied.'),
  section('risk-management-internal-controls', 'Risk management and internal controls', 'risk-controls', 'Describe risk inventory, appetite/limits, segregation of duties, approvals, exception management, monitoring, control testing, remediation, and reporting appropriate to the program.'),
  section('ledger-reconciliation-funds-flow', 'Funds flow, ledger, reconciliation, and transaction integrity', 'program-operations', 'Provide program diagrams and authoritative sources of truth for balances, settlement, idempotency, unknown outcomes, provider statements, GL, exceptions, and customer transaction history.'),
  section('customer-protection-disclosures', 'Customer protection, terms, disclosures, and marketing', 'customer-protection', 'Provide controlled terms, fee/limit/eligibility sources, role and deposit-insurance wording, marketing approvals, error/dispute processes, and evidence that public claims match the approved program.'),
  section('complaints-support-remediation', 'Complaints, support, disputes, and remediation', 'customer-protection', 'Describe complaint recognition, human ownership, response/escalation, dispute/fraud handoff, remediation, root-cause analysis, reporting, and production case tooling.'),
  section('privacy-data-governance', 'Privacy, data inventory, retention, and data sharing', 'legal-compliance', 'Provide approved data maps, classifications, purpose/authority, vendor sharing, retention/deletion, customer notices, access, evidence handling, and restricted-data controls.'),
  section('information-security-access', 'Information security, access, and security assurance', 'information-security', 'Provide security governance, workforce identity, phishing-resistant MFA as appropriate, least privilege, secrets/key management, logging, vulnerability management, secure SDLC, testing, incident response, and independent review evidence.'),
  section('operational-resilience-bcdr', 'Operational resilience, BCP, disaster recovery, and incident response', 'operational-resilience', 'Provide RTO/RPO decisions, backup/restore evidence, dependency failure scenarios, incident roles, exercises, customer communications, recovery reconciliation, and remediation.'),
  section('third-party-inventory-diligence', 'Third-party inventory, due diligence, contracts, and monitoring', 'third-party-risk', 'Provide critical-vendor inventory, data/activity scope, due diligence, contracts, SLAs, audit/access rights, monitoring, concentration risk, subcontractors, and unresolved exceptions.'),
  section('provider-webhooks-integrations', 'Provider integration, webhook authenticity, and certification evidence', 'program-operations', 'Provide exact selected-provider state mapping, signature/authenticity requirements, anti-replay, key rotation, certification results, error semantics, and fail-closed behavior.'),
  section('termination-portability-exit', 'Termination, data portability, wind-down, and customer continuity', 'continuity-termination', 'Provide termination/cure rights, data/statement access, settlement and reserves, pending instructions, customer communications, alternate-program assumptions, migration governance, and exercised exit scenarios.'),
  section('audit-evidence-exam-cooperation', 'Audit, evidence retention, and examination/cooperation readiness', 'risk-controls', 'Define evidence repositories, access, retention, audit/assurance scope, findings/remediation, sponsor information requests, regulatory cooperation, and responsible human owners.'),
  section('open-items-risk-acceptance', 'Open items, exceptions, remediation, and risk acceptance', 'risk-controls', 'Maintain a dated list of unresolved items, owners, deadlines, dependencies, compensating controls, approved risk acceptance where permitted, and launch-blocking conditions.')
];

function requiredString(value: unknown, field: string, maxLength = 3_000) {
  if (typeof value !== 'string') {
    throw new BankingError(400, 'INVALID_SPONSOR_DILIGENCE_INPUT', `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new BankingError(400, 'INVALID_SPONSOR_DILIGENCE_INPUT', `${field} is invalid.`);
  }
  return normalized;
}

function requiredReferences(value: unknown) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 40) {
    throw new BankingError(400, 'INVALID_SPONSOR_DILIGENCE_INPUT', 'evidenceReferences must contain 1-40 references.');
  }
  return value.map((item, index) => requiredString(item, `evidenceReferences[${index}]`, 500));
}

export function evaluateSponsorDiligenceResponseCandidate(input: SponsorDiligenceResponseCandidate) {
  const sectionId = requiredString(input?.sectionId, 'sectionId', 160);
  const record = sections.find((item) => item.id === sectionId);
  if (!record) throw new BankingError(400, 'UNKNOWN_SPONSOR_DILIGENCE_SECTION', 'Unknown sponsor diligence section.');

  const reviewedAt = requiredString(input.reviewedAt, 'reviewedAt', 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new BankingError(400, 'INVALID_SPONSOR_DILIGENCE_INPUT', 'reviewedAt must be YYYY-MM-DD.');
  }

  const candidate = {
    sectionId,
    proposedProgramRole: requiredString(input.proposedProgramRole, 'proposedProgramRole', 1_000),
    responseSummary: requiredString(input.responseSummary, 'responseSummary'),
    evidenceReferences: requiredReferences(input.evidenceReferences),
    accountableHumanRole: requiredString(input.accountableHumanRole, 'accountableHumanRole', 200),
    attestingHumanRole: requiredString(input.attestingHumanRole, 'attestingHumanRole', 200),
    qualifiedReviewerRole: requiredString(input.qualifiedReviewerRole, 'qualifiedReviewerRole', 200),
    materialExceptions: requiredString(input.materialExceptions, 'materialExceptions'),
    remediationOrFollowUp: requiredString(input.remediationOrFollowUp, 'remediationOrFollowUp'),
    reviewedAt
  };

  return {
    candidate,
    structurallyCompleteForHumanDiligenceReview: true,
    evidenceAuthenticated: false,
    humanAttestationVerified: false,
    legalComplianceSufficiencyVerified: false,
    financialConditionVerified: false,
    controlOperationVerified: false,
    independentTestingVerified: false,
    sponsorReviewed: false,
    sponsorAccepted: false,
    contractApproved: false,
    programApproved: false,
    liveCustomerDataApproved: false,
    liveFinancialActivityApproved: false,
    automaticSubmissionAllowed: false,
    softwareMayAttestAsHuman: false,
    softwareMayImpersonateApplicant: false,
    softwareMayImpersonateSponsor: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural sponsor-diligence drafting only. Software can organize a response and evidence references but cannot authenticate evidence, attest as a human, verify legal/compliance sufficiency, verify financial condition, prove a control is operating, approve a contract, submit as the applicant, impersonate a sponsor, obtain program approval, authorize live customer data, or authorize financial activity.'
  } as const;
}

export function sponsorDiligencePackStatus() {
  return {
    packAvailable: true,
    officialSourceCount: officialSources.length,
    officialSourceBaselineReviewedAt: '2026-08-30',
    sectionCount: sections.length,
    completedSectionCount: 0,
    evidenceVerifiedSectionCount: 0,
    humanAttestedSectionCount: 0,
    sponsorReviewedSectionCount: 0,
    sponsorAcceptedSectionCount: 0,
    selectedSponsorBank: null,
    selectedBaasProvider: null,
    exactProgramScopeApproved: false,
    exactResponsibilityAllocationApproved: false,
    contractsApproved: false,
    dataFlowsApproved: false,
    liveCustomerDataApproved: false,
    productionProviderCertificationComplete: false,
    sponsorProgramApprovalComplete: false,
    automaticSubmissionEnabled: false,
    softwareAttestationEnabled: false,
    applicantImpersonationEnabled: false,
    sponsorImpersonationEnabled: false,
    readyForSponsorSubmission: false,
    readyForLiveProgram: false,
    officialSources,
    sections,
    disclosure: 'Machine-readable sponsor diligence preparation only. No sponsor bank or BaaS provider is selected by this module, no response is represented as complete, authenticated, attested, reviewed, accepted, contracted, or approved, and nothing is submitted automatically. The actual sponsor may request different or additional information based on the proposed relationship and risk profile.'
  } as const;
}
