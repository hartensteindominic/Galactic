import { BankingError } from './banking';

export type RiskIssueSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskIssueSource =
  | 'internal-control-test'
  | 'incident'
  | 'customer-complaint-or-dispute'
  | 'independent-audit-or-assurance'
  | 'security-or-privacy-test'
  | 'vendor-or-provider-monitoring'
  | 'sponsor-program-finding'
  | 'regulator-or-examiner-finding'
  | 'financial-reconciliation'
  | 'legal-or-compliance-review'
  | 'management-self-identified';

export type RiskIssueState =
  | 'identified'
  | 'triaged'
  | 'remediation-in-progress'
  | 'pending-independent-verification'
  | 'verified-remediated'
  | 'risk-acceptance-proposed'
  | 'closed';

export type RiskIssueCandidate = {
  issueLabel: string;
  source: RiskIssueSource;
  severity: RiskIssueSeverity;
  proposedState: Exclude<RiskIssueState, 'closed'>;
  affectedProductsOrProcesses: string[];
  affectedControlIds: string[];
  jurisdictions: string[];
  description: string;
  customerImpact: string;
  financialImpact: string;
  legalComplianceSponsorImpact: string;
  immediateContainment: string;
  rootCauseOrHypothesis: string;
  remediationPlan: string;
  accountableHumanOwnerRole: string;
  independentVerifierRole: string;
  targetRemediationDate: string;
  evidenceReferences: string[];
  externalFindingReference?: string;
  residualRisk: string;
  customerRemediationAssessment: string;
  launchOrMoneyMovementImpact: string;
  reviewedAt: string;
};

const sourceRules: Record<RiskIssueSource, {
  externalClosureEvidencePotentiallyRequired: boolean;
  independentVerificationRequired: boolean;
  customerImpactAssessmentRequired: boolean;
}> = {
  'internal-control-test': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  incident: { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'customer-complaint-or-dispute': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'independent-audit-or-assurance': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'security-or-privacy-test': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'vendor-or-provider-monitoring': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'sponsor-program-finding': { externalClosureEvidencePotentiallyRequired: true, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'regulator-or-examiner-finding': { externalClosureEvidencePotentiallyRequired: true, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'financial-reconciliation': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'legal-or-compliance-review': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true },
  'management-self-identified': { externalClosureEvidencePotentiallyRequired: false, independentVerificationRequired: true, customerImpactAssessmentRequired: true }
};

function requiredString(value: unknown, field: string, maxLength = 4_000) {
  if (typeof value !== 'string') {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_INPUT', `${field} is required.`);
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_INPUT', `${field} is invalid.`);
  }
  return normalized;
}

function requiredList(value: unknown, field: string, maxItems = 30) {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxItems) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_INPUT', `${field} must contain 1-${maxItems} items.`);
  }
  return value.map((item, index) => requiredString(item, `${field}[${index}]`, 500));
}

function requiredDate(value: unknown, field: string) {
  const date = requiredString(value, field, 40);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_INPUT', `${field} must be YYYY-MM-DD.`);
  }
  return date;
}

export function evaluateRiskIssueCandidate(input: RiskIssueCandidate) {
  const allowedSources = Object.keys(sourceRules) as RiskIssueSource[];
  if (!allowedSources.includes(input?.source)) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_SOURCE', 'Unknown risk-issue source.');
  }
  const allowedSeverities: RiskIssueSeverity[] = ['low', 'medium', 'high', 'critical'];
  if (!allowedSeverities.includes(input?.severity)) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_SEVERITY', 'Unknown risk-issue severity.');
  }
  const allowedStates: Exclude<RiskIssueState, 'closed'>[] = [
    'identified',
    'triaged',
    'remediation-in-progress',
    'pending-independent-verification',
    'verified-remediated',
    'risk-acceptance-proposed'
  ];
  if (!allowedStates.includes(input?.proposedState)) {
    throw new BankingError(400, 'INVALID_RISK_ISSUE_STATE', 'Software review may not propose a closed issue state.');
  }

  const rules = sourceRules[input.source];
  const targetRemediationDate = requiredDate(input.targetRemediationDate, 'targetRemediationDate');
  const reviewedAt = requiredDate(input.reviewedAt, 'reviewedAt');
  const severityRequiresEnhancedGovernance = input.severity === 'high' || input.severity === 'critical';
  const externalFinding = input.source === 'sponsor-program-finding' || input.source === 'regulator-or-examiner-finding';

  const candidate = {
    issueLabel: requiredString(input.issueLabel, 'issueLabel', 300),
    source: input.source,
    severity: input.severity,
    proposedState: input.proposedState,
    affectedProductsOrProcesses: requiredList(input.affectedProductsOrProcesses, 'affectedProductsOrProcesses'),
    affectedControlIds: requiredList(input.affectedControlIds, 'affectedControlIds'),
    jurisdictions: requiredList(input.jurisdictions, 'jurisdictions'),
    description: requiredString(input.description, 'description'),
    customerImpact: requiredString(input.customerImpact, 'customerImpact'),
    financialImpact: requiredString(input.financialImpact, 'financialImpact'),
    legalComplianceSponsorImpact: requiredString(input.legalComplianceSponsorImpact, 'legalComplianceSponsorImpact'),
    immediateContainment: requiredString(input.immediateContainment, 'immediateContainment'),
    rootCauseOrHypothesis: requiredString(input.rootCauseOrHypothesis, 'rootCauseOrHypothesis'),
    remediationPlan: requiredString(input.remediationPlan, 'remediationPlan'),
    accountableHumanOwnerRole: requiredString(input.accountableHumanOwnerRole, 'accountableHumanOwnerRole', 250),
    independentVerifierRole: requiredString(input.independentVerifierRole, 'independentVerifierRole', 250),
    targetRemediationDate,
    evidenceReferences: requiredList(input.evidenceReferences, 'evidenceReferences', 40),
    externalFindingReference: input.externalFindingReference
      ? requiredString(input.externalFindingReference, 'externalFindingReference', 500)
      : null,
    residualRisk: requiredString(input.residualRisk, 'residualRisk'),
    customerRemediationAssessment: requiredString(input.customerRemediationAssessment, 'customerRemediationAssessment'),
    launchOrMoneyMovementImpact: requiredString(input.launchOrMoneyMovementImpact, 'launchOrMoneyMovementImpact'),
    reviewedAt
  };

  return {
    candidate,
    structurallyCompleteForHumanIssueReview: true,
    severityRequiresEnhancedGovernance,
    externalFinding,
    independentVerificationRequired: rules.independentVerificationRequired,
    externalClosureEvidencePotentiallyRequired: rules.externalClosureEvidencePotentiallyRequired,
    customerImpactAssessmentRequired: rules.customerImpactAssessmentRequired,
    evidenceAuthenticated: false,
    accountableOwnerAssignmentVerified: false,
    containmentEffectivenessVerified: false,
    rootCauseValidated: false,
    remediationImplementedVerified: false,
    independentVerificationCompleted: false,
    customerRemediationCompleted: false,
    residualRiskAcceptanceApproved: false,
    sponsorClosureAccepted: false,
    regulatorClosureAccepted: false,
    launchRestrictionCleared: false,
    moneyMovementRestrictionCleared: false,
    automaticRiskAcceptanceAllowed: false,
    automaticIssueClosureAllowed: false,
    softwareMayCloseIssue: false,
    softwareMayAcceptResidualRisk: false,
    softwareMayRepresentExternalFindingClosed: false,
    issueClosed: false,
    readinessPromotionAllowed: false,
    disclosure: 'Structural issue/remediation review only. Complete fields, a proposed verified-remediated state, evidence references, or a remediation plan do not authenticate evidence, verify implementation, validate root cause, complete independent testing, remediate customers, approve residual-risk acceptance, clear launch or money-movement restrictions, or close a sponsor/regulator finding. Software cannot close issues or accept risk on behalf of accountable humans or external authorities.'
  } as const;
}

export function riskIssueManagementStatus() {
  return {
    riskIssueManagementModelAvailable: true,
    productionIssueRepositoryConnected: false,
    recordedPrototypeIssueCount: 0,
    recordedOpenIssueCount: 0,
    recordedHighCriticalIssueCount: 0,
    recordedSponsorFindingCount: 0,
    recordedRegulatorFindingCount: 0,
    verifiedRemediatedIssueCount: 0,
    independentlyVerifiedIssueCount: 0,
    externallyClosedFindingCount: 0,
    productionIssueInventoryCompletenessVerified: false,
    productionIssueSeverityMethodApproved: false,
    productionRemediationSlaApproved: false,
    productionEscalationMatrixApproved: false,
    productionCustomerRemediationWorkflowOperating: false,
    productionIndependentVerificationWorkflowOperating: false,
    sponsorFindingClosureWorkflowVerified: false,
    regulatorFindingClosureWorkflowVerified: false,
    automaticRiskAcceptanceAllowed: false,
    automaticIssueClosureAllowed: false,
    softwareMayCloseIssue: false,
    softwareMayAcceptResidualRisk: false,
    softwareMayRepresentSponsorOrRegulatorClosure: false,
    unresolvedHighCriticalBlocksLaunchByDefault: true,
    unresolvedMoneyMovementOrLedgerIssueBlocksLiveFinancialActivityByDefault: true,
    greenCiCountsAsIssueRemediation: false,
    codeFixCountsAsIssueClosure: false,
    readyForProductionIssueManagement: false,
    disclosure: 'Issue/remediation governance schema only. Recorded prototype issue counts are not claims that no real issues exist because no production issue repository is connected and inventory completeness is unverified. Actual findings require accountable human ownership, severity, containment, root-cause work, remediation evidence, independent verification, customer remediation where applicable, residual-risk governance, and sponsor/regulator closure evidence where applicable. Green CI or a code fix alone never closes a governed issue.'
  } as const;
}
