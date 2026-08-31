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
vm.runInNewContext(transpile('lib/product-launch-governance.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected product launch runtime import: ${specifier}`);
  }
}, { filename: 'product-launch-governance.runtime.cjs' });

const { productLaunchGovernanceStatus, evaluateProductLaunchReviewCandidate } = mod.exports;
const status = productLaunchGovernanceStatus();

assert.equal(status.launchGovernanceModelAvailable, true);
assert.equal(status.requiredGateCount, 17);
assert.equal(status.satisfiedGateCount, 0);
assert.equal(status.evidenceVerifiedGateCount, 0);
assert.equal(status.humanApprovedGateCount, 0);
assert.equal(status.externallyApprovedGateCount, 0);
assert.equal(status.operatingControlVerifiedGateCount, 0);
assert.equal(status.defaultRiskClassification, 'unclassified');
assert.equal(status.defaultLaunchState, 'blocked-unverified');
assert.equal(status.automaticLaunchEnablementAllowed, false);
assert.equal(status.automaticLiveWriteEnablementAllowed, false);
assert.equal(status.automaticLegalApprovalAllowed, false);
assert.equal(status.automaticSponsorProgramApprovalAllowed, false);
assert.equal(status.softwareReleaseApprovalAllowed, false);
assert.equal(status.greenCiCountsAsLaunchApproval, false);
assert.equal(status.completedPlanningDraftCountsAsLaunchApproval, false);
assert.equal(status.selectedSponsorRelationshipCountsAsBlanketApproval, false);
assert.equal(status.conditionalCharterApprovalCountsAsOpeningAuthority, false);
assert.equal(status.launchApproved, false);
assert.equal(status.liveFinancialActivityApproved, false);
assert.equal(status.productionLaunchProcessApproved, false);
assert.equal(status.productionChangeManagementProcessOperating, false);
assert.equal(status.productionPostLaunchMonitoringOperating, false);
assert.ok(status.gates.every((gate) => gate.status === 'blocked-unverified'));
assert.ok(status.gates.every((gate) => gate.launchGateSatisfied === false));
assert.ok(status.gates.every((gate) => gate.accountableHumanRequired === true));

const gateReviews = status.gates.map((gate) => ({
  gateId: gate.id,
  proposedDisposition: 'ready-for-human-review',
  rationale: `Planning rationale for ${gate.label}; no substantive approval is asserted.`,
  evidenceReferences: [`private-evidence/${gate.id}/reference-only`],
  accountableHumanRole: 'future accountable human role - unassigned',
  qualifiedReviewerRole: 'qualified reviewer role - unassigned',
  materialExceptions: 'External/manual evidence and approval remain outstanding.',
  remediationOrFollowUp: 'Complete the real evidence, human review, testing, and external approval workflow as applicable.'
}));

const candidate = evaluateProductLaunchReviewCandidate({
  changeLabel: 'Future financial product change planning draft',
  changeType: 'new-financial-product',
  proposedProductOrFeature: 'Planning-only example; no live product or rail selected.',
  proposedEntityAndProgramRole: 'Simulation-only fintech prototype; exact regulated program and legal role unresolved.',
  targetCustomers: ['future target segment - requires evidence'],
  jurisdictions: ['future jurisdiction - requires applicability review'],
  moneyFlowSummary: 'No live money flow; future authoritative funds-flow design requires approved program evidence.',
  dataFlowSummary: 'No live customer data approved; future data map requires privacy/security/program review.',
  providerDependencySummary: 'No selected sponsor or provider for this product review.',
  customerImpactSummary: 'No live customer impact; customer protections require actual product/program evidence.',
  rollbackOrDisableStrategy: 'Future production release must have a tested fail-closed disable/rollback path and human authority.',
  gateReviews,
  accountableLaunchOwnerRole: 'future authorized launch owner - unassigned',
  independentChallengeRole: 'future qualified independent challenge role - unassigned',
  reviewedAt: '2026-08-30'
});

assert.equal(candidate.structurallyCompleteForHumanLaunchReview, true);
assert.equal(candidate.requiredGateCount, 17);
assert.equal(candidate.proposedNotReadyCount, 0);
assert.equal(candidate.proposedNotApplicableCount, 0);
assert.equal(candidate.everyGateHasHumanOwnerAndEvidenceReference, true);
assert.equal(candidate.evidenceAuthenticated, false);
assert.equal(candidate.legalComplianceApplicabilityApproved, false);
assert.equal(candidate.sponsorOrRegulatedProgramScopeApproved, false);
assert.equal(candidate.accountableHumanAssignmentsVerified, false);
assert.equal(candidate.customerTermsAndMarketingApproved, false);
assert.equal(candidate.financialCrimeControlsApproved, false);
assert.equal(candidate.fraudLossControlsVerified, false);
assert.equal(candidate.ledgerAndReconciliationVerified, false);
assert.equal(candidate.providerCertificationVerified, false);
assert.equal(candidate.securityPrivacyControlsVerified, false);
assert.equal(candidate.supportComplaintControlsVerified, false);
assert.equal(candidate.incidentContinuityRollbackVerified, false);
assert.equal(candidate.financialCapitalLiquidityImpactApproved, false);
assert.equal(candidate.independentTestingVerified, false);
assert.equal(candidate.humanReleaseApprovalVerified, false);
assert.equal(candidate.externalApprovalVerified, false);
assert.equal(candidate.automaticLaunchEnablementAllowed, false);
assert.equal(candidate.automaticLiveWriteEnablementAllowed, false);
assert.equal(candidate.softwareMayApproveLegalLaunch, false);
assert.equal(candidate.softwareMayApproveSponsorScope, false);
assert.equal(candidate.softwareMayActAsReleaseApprover, false);
assert.equal(candidate.launchApproved, false);
assert.equal(candidate.liveFinancialActivityApproved, false);
assert.equal(candidate.readinessPromotionAllowed, false);

const notApplicable = evaluateProductLaunchReviewCandidate({
  ...candidate.candidate,
  gateReviews: candidate.candidate.gateReviews.map((review, index) => index === 1 ? { ...review, proposedDisposition: 'not-applicable-proposed' } : review)
});
assert.equal(notApplicable.proposedNotApplicableCount, 1);
assert.equal(notApplicable.legalComplianceApplicabilityApproved, false);
assert.equal(notApplicable.launchApproved, false);

assert.throws(
  () => evaluateProductLaunchReviewCandidate({ ...candidate.candidate, gateReviews: candidate.candidate.gateReviews.slice(0, -1) }),
  (error) => error instanceof BankingError && error.code === 'PRODUCT_LAUNCH_GATE_COVERAGE_INCOMPLETE'
);
assert.throws(
  () => evaluateProductLaunchReviewCandidate({ ...candidate.candidate, gateReviews: [...candidate.candidate.gateReviews.slice(0, -1), candidate.candidate.gateReviews[0]] }),
  (error) => error instanceof BankingError && error.code === 'DUPLICATE_PRODUCT_LAUNCH_GATE'
);
assert.throws(
  () => evaluateProductLaunchReviewCandidate({ ...candidate.candidate, changeType: 'ship-it' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_PRODUCT_LAUNCH_CHANGE_TYPE'
);

console.log('Product launch governance 17-gate coverage, proposed-not-applicable, no-auto-launch, no-live-writes, and non-approval runtime checks passed.');
