import { BankingError } from './banking';

export type ComplianceApplicabilityStatus = 'unassessed' | 'applicable' | 'not-applicable' | 'deferred';
export type ComplianceSourceClass = 'regulator-handbook' | 'interagency-exam-manual' | 'agency-compliance-framework';

export type ComplianceSource = {
  id: string;
  authority: 'OCC' | 'FFIEC' | 'OFAC';
  title: string;
  sourceClass: ComplianceSourceClass;
  publicationOrVersion: string;
  canonicalUrl: string;
  reviewedAt: '2026-08-30';
  currentSourceChecked: true;
  createsGalacticApplicabilityByItself: false;
  note: string;
};

export type ComplianceObligationRecord = {
  id: string;
  domain:
    | 'compliance-management-system'
    | 'governance'
    | 'bsa-aml'
    | 'customer-identification'
    | 'sanctions'
    | 'third-party-risk'
    | 'complaints'
    | 'monitoring-audit'
    | 'training'
    | 'change-management';
  label: string;
  sourceIds: string[];
  candidateScope: 'future-bank-candidate';
  applicabilityStatus: 'unassessed';
  humanApplicabilityDecisionRequired: true;
  qualifiedLegalComplianceReviewRequired: true;
  accountableHumanRoleAssigned: false;
  accountableHumanRole: null;
  policyApproved: false;
  operatingEvidenceVerified: false;
  independentTestingVerified: false;
  sourceExpectation: string;
  galacticObligationDetermined: false;
};

export type ComplianceApplicabilityCandidate = {
  obligationId: string;
  proposedDecision: Exclude<ComplianceApplicabilityStatus, 'unassessed'>;
  entityRole: string;
  products: string[];
  jurisdictions: string[];
  rationale: string;
  sourceIds: string[];
  accountableRole: string;
  reviewerRole: string;
  reviewedAt: string;
  evidenceReference?: string;
};

const sources: ComplianceSource[] = [
  {
    id: 'occ-cms-2018',
    authority: 'OCC',
    title: 'Comptroller’s Handbook: Compliance Management Systems',
    sourceClass: 'regulator-handbook',
    publicationOrVersion: 'June 2018',
    canonicalUrl: 'https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/compliance-mgmt-systems/index-compliance-management-systems.html',
    reviewedAt: '2026-08-30',
    currentSourceChecked: true,
    createsGalacticApplicabilityByItself: false,
    note: 'Applies to OCC supervision of national banks and federal savings associations. Used here only as a future-bank control-design source unless and until the applicable charter and supervisory scope are determined.'
  },
  {
    id: 'occ-corporate-risk-governance-2019',
    authority: 'OCC',
    title: 'Comptroller’s Handbook: Corporate and Risk Governance',
    sourceClass: 'regulator-handbook',
    publicationOrVersion: 'July 2019',
    canonicalUrl: 'https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/corporate-risk-governance/index-corporate-and-risk-governance.html',
    reviewedAt: '2026-08-30',
    currentSourceChecked: true,
    createsGalacticApplicabilityByItself: false,
    note: 'Used as a future-bank governance design reference only. The current prototype is not represented as an OCC-supervised bank.'
  },
  {
    id: 'ffiec-bsa-aml-2026',
    authority: 'FFIEC',
    title: 'BSA/AML Examination Manual: Assessing the BSA/AML Compliance Program',
    sourceClass: 'interagency-exam-manual',
    publicationOrVersion: 'current manual pages reviewed August 30, 2026',
    canonicalUrl: 'https://bsaaml.ffiec.gov/manual/AssessingTheBSAAMLComplianceProgram/01',
    reviewedAt: '2026-08-30',
    currentSourceChecked: true,
    createsGalacticApplicabilityByItself: false,
    note: 'Used to model future bank BSA/AML governance evidence. It does not mean Galactic currently has a bank BSA/AML program obligation or that any such program is operating.'
  },
  {
    id: 'ofac-framework-2019',
    authority: 'OFAC',
    title: 'A Framework for OFAC Compliance Commitments',
    sourceClass: 'agency-compliance-framework',
    publicationOrVersion: 'May 2, 2019',
    canonicalUrl: 'https://ofac.treasury.gov/recent-actions/20190502_33',
    reviewedAt: '2026-08-30',
    currentSourceChecked: true,
    createsGalacticApplicabilityByItself: false,
    note: 'Used as a sanctions-compliance design reference. Exact obligations depend on the entity, activity, jurisdiction, counterparties, products, and applicable sanctions programs.'
  }
];

function obligation(
  id: string,
  domain: ComplianceObligationRecord['domain'],
  label: string,
  sourceIds: string[],
  sourceExpectation: string
): ComplianceObligationRecord {
  return {
    id,
    domain,
    label,
    sourceIds,
    candidateScope: 'future-bank-candidate',
    applicabilityStatus: 'unassessed',
    humanApplicabilityDecisionRequired: true,
    qualifiedLegalComplianceReviewRequired: true,
    accountableHumanRoleAssigned: false,
    accountableHumanRole: null,
    policyApproved: false,
    operatingEvidenceVerified: false,
    independentTestingVerified: false,
    sourceExpectation,
    galacticObligationDetermined: false
  };
}

const obligations: ComplianceObligationRecord[] = [
  obligation('cms-board-management-oversight', 'compliance-management-system', 'Board and management compliance oversight', ['occ-cms-2018', 'occ-corporate-risk-governance-2019'], 'OCC CMS materials identify board/management oversight as a core component of bank consumer-compliance risk management.'),
  obligation('cms-policies-procedures', 'compliance-management-system', 'Compliance policies and procedures', ['occ-cms-2018'], 'OCC CMS materials identify policies and procedures as a core compliance-program component.'),
  obligation('cms-training', 'training', 'Consumer-compliance training', ['occ-cms-2018'], 'OCC CMS materials identify consumer-compliance training as a compliance-program component.'),
  obligation('cms-monitoring-audit', 'monitoring-audit', 'Compliance monitoring and audit', ['occ-cms-2018'], 'OCC CMS materials identify monitoring and audit as a compliance-program component.'),
  obligation('cms-complaint-response', 'complaints', 'Consumer complaint response', ['occ-cms-2018'], 'OCC CMS materials identify consumer complaint response as a compliance-program component.'),
  obligation('cms-change-management', 'change-management', 'Regulatory and product change management', ['occ-cms-2018'], 'OCC CMS materials identify change management as part of board and management oversight.'),
  obligation('cms-third-party-oversight', 'third-party-risk', 'Compliance oversight of third parties', ['occ-cms-2018', 'occ-corporate-risk-governance-2019'], 'OCC materials identify third-party oversight as part of bank governance and compliance management.'),
  obligation('bsa-written-program-board-approval', 'bsa-aml', 'Written BSA/AML program and board approval', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual describes a written BSA/AML compliance program approved by the bank board and noted in board minutes.'),
  obligation('bsa-internal-controls', 'bsa-aml', 'BSA/AML internal controls', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual identifies internal controls as a minimum BSA/AML program element.'),
  obligation('bsa-independent-testing', 'monitoring-audit', 'BSA/AML independent testing', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual identifies independent testing as a minimum BSA/AML program element.'),
  obligation('bsa-officer', 'governance', 'Qualified BSA compliance officer', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual expects a bank board to designate a qualified BSA compliance officer with appropriate authority, independence, resources, and competence.'),
  obligation('bsa-training', 'training', 'BSA/AML training', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual identifies training for appropriate personnel as a minimum BSA/AML program element.'),
  obligation('cip-program', 'customer-identification', 'Customer Identification Program', ['ffiec-bsa-aml-2026'], 'The FFIEC bank examination manual describes a written CIP incorporated into the bank BSA/AML compliance program for covered banks.'),
  obligation('ofac-risk-based-program', 'sanctions', 'Risk-based sanctions compliance program', ['ofac-framework-2019'], 'OFAC’s framework describes essential components of a risk-based sanctions compliance program for organizations subject to relevant U.S. sanctions requirements.')
];

function requiredString(value: unknown, field: string, maxLength = 500) {
  if (typeof value !== 'string') throw new BankingError(400, 'INVALID_COMPLIANCE_APPLICABILITY_INPUT', `${field} is required.`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BankingError(400, 'INVALID_COMPLIANCE_APPLICABILITY_INPUT', `${field} is invalid.`);
  return normalized;
}

function requiredStringList(value: unknown, field: string, maxItems = 20) {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new BankingError(400, 'INVALID_COMPLIANCE_APPLICABILITY_INPUT', `${field} must contain 1-${maxItems} items.`);
  }
  return value.map((entry, index) => requiredString(entry, `${field}[${index}]`, 200));
}

export function evaluateComplianceApplicabilityCandidate(input: ComplianceApplicabilityCandidate) {
  const obligationId = requiredString(input?.obligationId, 'obligationId', 120);
  const record = obligations.find((item) => item.id === obligationId);
  if (!record) throw new BankingError(400, 'UNKNOWN_COMPLIANCE_OBLIGATION', 'Unknown compliance obligation.');

  if (!['applicable', 'not-applicable', 'deferred'].includes(input?.proposedDecision)) {
    throw new BankingError(400, 'INVALID_COMPLIANCE_APPLICABILITY_INPUT', 'proposedDecision is invalid.');
  }

  const sourceIds = requiredStringList(input.sourceIds, 'sourceIds', 10);
  const unknownSource = sourceIds.find((id) => !sources.some((source) => source.id === id));
  if (unknownSource) throw new BankingError(400, 'UNKNOWN_COMPLIANCE_SOURCE', 'Unknown compliance source.');

  const missingRecordSource = record.sourceIds.find((id) => !sourceIds.includes(id));
  if (missingRecordSource) {
    throw new BankingError(400, 'COMPLIANCE_SOURCE_COVERAGE_INCOMPLETE', 'Candidate does not include every source currently linked to this obligation record.');
  }

  const reviewedAt = requiredString(input.reviewedAt, 'reviewedAt', 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reviewedAt)) {
    throw new BankingError(400, 'INVALID_COMPLIANCE_APPLICABILITY_INPUT', 'reviewedAt must be YYYY-MM-DD.');
  }

  const candidate = {
    obligationId,
    proposedDecision: input.proposedDecision,
    entityRole: requiredString(input.entityRole, 'entityRole', 200),
    products: requiredStringList(input.products, 'products'),
    jurisdictions: requiredStringList(input.jurisdictions, 'jurisdictions'),
    rationale: requiredString(input.rationale, 'rationale', 2_000),
    sourceIds,
    accountableRole: requiredString(input.accountableRole, 'accountableRole', 200),
    reviewerRole: requiredString(input.reviewerRole, 'reviewerRole', 200),
    reviewedAt,
    evidenceReference: input.evidenceReference ? requiredString(input.evidenceReference, 'evidenceReference', 500) : null
  };

  return {
    candidate,
    structurallyCompleteForQualifiedReview: true,
    softwareVerifiedLegalApplicability: false,
    softwareVerifiedRegulatoryInterpretation: false,
    softwareVerifiedAccountableOwnerAssignment: false,
    softwareVerifiedPolicyApproval: false,
    softwareVerifiedOperatingCompliance: false,
    softwareVerifiedIndependentTesting: false,
    readinessPromotionAllowed: false,
    qualifiedHumanReviewRequired: true,
    externalCounselOrQualifiedComplianceReviewRequiredAsApplicable: true,
    disclosure: 'This evaluator checks only whether an applicability-review package is structurally complete. It does not determine law, legal applicability, regulatory interpretation, licensing, regulator expectations, policy sufficiency, owner qualification, operating compliance, examination readiness, or whether Galactic may offer a financial product.'
  } as const;
}

export function complianceObligationRegisterStatus() {
  return {
    sourceRegistryAvailable: true,
    sourceRegistryReviewedAt: '2026-08-30',
    officialSourceCount: sources.length,
    obligationRegisterAvailable: true,
    obligationCount: obligations.length,
    unresolvedApplicabilityCount: obligations.length,
    applicableObligationCount: 0,
    notApplicableObligationCount: 0,
    deferredObligationCount: 0,
    accountableOwnerAssignedCount: 0,
    approvedPolicyCount: 0,
    verifiedOperatingEvidenceCount: 0,
    verifiedIndependentTestingCount: 0,
    qualifiedLegalComplianceApplicabilityReviewComplete: false,
    complianceResponsibilityMatrixAssigned: false,
    productionComplianceManagementSystemOperating: false,
    productionBsaAmlProgramOperating: false,
    productionOfacProgramOperating: false,
    productionComplaintProgramOperating: false,
    productionComplianceTrainingOperating: false,
    productionComplianceMonitoringOperating: false,
    productionIndependentComplianceAuditOperating: false,
    softwareCanDetermineLegalApplicability: false,
    softwareCanInterpretLawAuthoritatively: false,
    softwareCanAssignNamedComplianceOfficer: false,
    softwareCanApprovePolicies: false,
    softwareCanApproveBoardMinutes: false,
    softwareCanSelfCertifyCompliance: false,
    softwareCanSelfCertifyExaminationReadiness: false,
    examinationReady: false,
    sources,
    obligations,
    disclosure: 'Machine-readable compliance planning only. The register uses current official supervisory/compliance sources as design references, but every Galactic applicability decision remains unassessed until the actual entity role, charter/partner structure, products, customers, jurisdictions, vendors, and activities are reviewed by accountable qualified humans. The register is not legal advice, a compliance certification, a BSA/AML or OFAC program, a board approval, an audit, an examination result, or permission to launch live financial services.'
  } as const;
}
