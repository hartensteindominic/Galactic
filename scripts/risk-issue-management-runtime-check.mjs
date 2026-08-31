import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class BankingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function transpile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file
  }).outputText;
}

const mod = { exports: {} };
vm.runInNewContext(transpile('lib/risk-issue-management.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected risk issue runtime import: ${specifier}`);
  }
}, { filename: 'risk-issue-management.runtime.cjs' });

const { riskIssueManagementStatus, evaluateRiskIssueCandidate } = mod.exports;
const status = riskIssueManagementStatus();
assert.equal(status.riskIssueManagementModelAvailable, true);
assert.equal(status.productionIssueRepositoryConnected, false);
assert.equal(status.recordedPrototypeIssueCount, 0);
assert.equal(status.productionIssueInventoryCompletenessVerified, false);
assert.equal(status.productionIssueSeverityMethodApproved, false);
assert.equal(status.productionRemediationSlaApproved, false);
assert.equal(status.productionIndependentVerificationWorkflowOperating, false);
assert.equal(status.automaticRiskAcceptanceAllowed, false);
assert.equal(status.automaticIssueClosureAllowed, false);
assert.equal(status.softwareMayCloseIssue, false);
assert.equal(status.softwareMayAcceptResidualRisk, false);
assert.equal(status.softwareMayRepresentSponsorOrRegulatorClosure, false);
assert.equal(status.unresolvedHighCriticalBlocksLaunchByDefault, true);
assert.equal(status.unresolvedMoneyMovementOrLedgerIssueBlocksLiveFinancialActivityByDefault, true);
assert.equal(status.greenCiCountsAsIssueRemediation, false);
assert.equal(status.codeFixCountsAsIssueClosure, false);
assert.equal(status.readyForProductionIssueManagement, false);

const base = {
  issueLabel: 'Illustrative reconciliation control finding',
  source: 'financial-reconciliation',
  severity: 'high',
  proposedState: 'remediation-in-progress',
  affectedProductsOrProcesses: ['simulated transfer reconciliation'],
  affectedControlIds: ['ledger-reconciliation'],
  jurisdictions: ['United States - scope requires qualified review'],
  description: 'Example package for runtime verification only.',
  customerImpact: 'No customer-impact conclusion is made by software; assessment remains required.',
  financialImpact: 'No financial-impact conclusion is made by software; quantified review remains required.',
  legalComplianceSponsorImpact: 'Applicability and sponsor impact remain subject to qualified review.',
  immediateContainment: 'Example containment narrative; effectiveness is not verified by software.',
  rootCauseOrHypothesis: 'Example root-cause hypothesis; not validated.',
  remediationPlan: 'Example remediation plan with independent verification still required.',
  accountableHumanOwnerRole: 'future accountable operations/control owner - unassigned',
  independentVerifierRole: 'independent qualified verifier - unassigned',
  targetRemediationDate: '2026-12-31',
  evidenceReferences: ['private-finding-evidence-reference'],
  residualRisk: 'Residual risk requires human governance assessment.',
  customerRemediationAssessment: 'Customer remediation needs formal assessment before closure.',
  launchOrMoneyMovementImpact: 'Treat as a blocker until approved verification and launch governance clear it.',
  reviewedAt: '2026-08-30'
};

const highIssue = evaluateRiskIssueCandidate(base);
assert.equal(highIssue.structurallyCompleteForHumanIssueReview, true);
assert.equal(highIssue.severityRequiresEnhancedGovernance, true);
assert.equal(highIssue.externalFinding, false);
assert.equal(highIssue.independentVerificationRequired, true);
assert.equal(highIssue.evidenceAuthenticated, false);
assert.equal(highIssue.accountableOwnerAssignmentVerified, false);
assert.equal(highIssue.containmentEffectivenessVerified, false);
assert.equal(highIssue.rootCauseValidated, false);
assert.equal(highIssue.remediationImplementedVerified, false);
assert.equal(highIssue.independentVerificationCompleted, false);
assert.equal(highIssue.customerRemediationCompleted, false);
assert.equal(highIssue.residualRiskAcceptanceApproved, false);
assert.equal(highIssue.launchRestrictionCleared, false);
assert.equal(highIssue.moneyMovementRestrictionCleared, false);
assert.equal(highIssue.automaticRiskAcceptanceAllowed, false);
assert.equal(highIssue.automaticIssueClosureAllowed, false);
assert.equal(highIssue.softwareMayCloseIssue, false);
assert.equal(highIssue.issueClosed, false);
assert.equal(highIssue.readinessPromotionAllowed, false);

const regulatorFinding = evaluateRiskIssueCandidate({
  ...base,
  source: 'regulator-or-examiner-finding',
  severity: 'critical',
  proposedState: 'pending-independent-verification',
  externalFindingReference: 'private-authority-finding-reference'
});
assert.equal(regulatorFinding.externalFinding, true);
assert.equal(regulatorFinding.externalClosureEvidencePotentiallyRequired, true);
assert.equal(regulatorFinding.regulatorClosureAccepted, false);
assert.equal(regulatorFinding.softwareMayRepresentExternalFindingClosed, false);
assert.equal(regulatorFinding.issueClosed, false);

const sponsorFinding = evaluateRiskIssueCandidate({
  ...base,
  source: 'sponsor-program-finding',
  severity: 'medium',
  proposedState: 'verified-remediated',
  externalFindingReference: 'private-sponsor-finding-reference'
});
assert.equal(sponsorFinding.externalFinding, true);
assert.equal(sponsorFinding.sponsorClosureAccepted, false);
assert.equal(sponsorFinding.remediationImplementedVerified, false);
assert.equal(sponsorFinding.independentVerificationCompleted, false);
assert.equal(sponsorFinding.issueClosed, false);

assert.throws(
  () => evaluateRiskIssueCandidate({ ...base, proposedState: 'closed' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_RISK_ISSUE_STATE'
);
assert.throws(
  () => evaluateRiskIssueCandidate({ ...base, source: 'verified-by-ai' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_RISK_ISSUE_SOURCE'
);
assert.throws(
  () => evaluateRiskIssueCandidate({ ...base, severity: 'emergency' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_RISK_ISSUE_SEVERITY'
);

console.log('Risk issue remediation inventory-truth, no-auto-close, high-critical governance, external-finding, verification, and non-promotion runtime checks passed.');
