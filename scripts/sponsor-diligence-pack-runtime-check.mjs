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
vm.runInNewContext(transpile('lib/sponsor-diligence-pack.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected sponsor diligence runtime import: ${specifier}`);
  }
}, { filename: 'sponsor-diligence-pack.runtime.cjs' });

const { sponsorDiligencePackStatus, evaluateSponsorDiligenceResponseCandidate } = mod.exports;
const status = sponsorDiligencePackStatus();

assert.equal(status.packAvailable, true);
assert.equal(status.officialSourceCount, 3);
assert.equal(status.officialSourceBaselineReviewedAt, '2026-08-30');
assert.equal(status.sectionCount, 19);
assert.equal(status.completedSectionCount, 0);
assert.equal(status.evidenceVerifiedSectionCount, 0);
assert.equal(status.humanAttestedSectionCount, 0);
assert.equal(status.sponsorReviewedSectionCount, 0);
assert.equal(status.sponsorAcceptedSectionCount, 0);
assert.equal(status.selectedSponsorBank, null);
assert.equal(status.selectedBaasProvider, null);
assert.equal(status.exactProgramScopeApproved, false);
assert.equal(status.exactResponsibilityAllocationApproved, false);
assert.equal(status.contractsApproved, false);
assert.equal(status.dataFlowsApproved, false);
assert.equal(status.liveCustomerDataApproved, false);
assert.equal(status.productionProviderCertificationComplete, false);
assert.equal(status.sponsorProgramApprovalComplete, false);
assert.equal(status.automaticSubmissionEnabled, false);
assert.equal(status.softwareAttestationEnabled, false);
assert.equal(status.applicantImpersonationEnabled, false);
assert.equal(status.sponsorImpersonationEnabled, false);
assert.equal(status.readyForSponsorSubmission, false);
assert.equal(status.readyForLiveProgram, false);
assert.ok(status.sections.every((section) => section.status === 'evidence-required'));
assert.ok(status.sections.every((section) => section.humanAttestationRequired === true));
assert.ok(status.sections.every((section) => section.sponsorReviewRequired === true));
assert.ok(status.sections.every((section) => section.evidenceVerified === false));
assert.ok(status.sections.every((section) => section.sponsorAccepted === false));

const candidate = evaluateSponsorDiligenceResponseCandidate({
  sectionId: 'ledger-reconciliation-funds-flow',
  proposedProgramRole: 'Future sponsor-program candidate; exact sponsor, account structure, money flow, and responsibility allocation unresolved.',
  responseSummary: 'The prototype models tenant-bound simulated balances, double-entry journals, idempotent transfer intent, ambiguous outcomes, and reconciliation. Production sponsor statements, settlement, authoritative balances, and exact program semantics remain unverified.',
  evidenceReferences: ['repo-control-reference-only', 'private-diligence-room/reference-only'],
  accountableHumanRole: 'future program operations owner - unassigned',
  attestingHumanRole: 'authorized future program officer - unassigned',
  qualifiedReviewerRole: 'qualified sponsor-program operations/compliance reviewer',
  materialExceptions: 'No sponsor selected; no production provider statements; no external persistent exercise.',
  remediationOrFollowUp: 'Select approved program, map exact funds flow and statements, exercise reconciliation in certification, and obtain human/sponsor review.',
  reviewedAt: '2026-08-30'
});

assert.equal(candidate.structurallyCompleteForHumanDiligenceReview, true);
assert.equal(candidate.evidenceAuthenticated, false);
assert.equal(candidate.humanAttestationVerified, false);
assert.equal(candidate.legalComplianceSufficiencyVerified, false);
assert.equal(candidate.financialConditionVerified, false);
assert.equal(candidate.controlOperationVerified, false);
assert.equal(candidate.independentTestingVerified, false);
assert.equal(candidate.sponsorReviewed, false);
assert.equal(candidate.sponsorAccepted, false);
assert.equal(candidate.contractApproved, false);
assert.equal(candidate.programApproved, false);
assert.equal(candidate.liveCustomerDataApproved, false);
assert.equal(candidate.liveFinancialActivityApproved, false);
assert.equal(candidate.automaticSubmissionAllowed, false);
assert.equal(candidate.softwareMayAttestAsHuman, false);
assert.equal(candidate.softwareMayImpersonateApplicant, false);
assert.equal(candidate.softwareMayImpersonateSponsor, false);
assert.equal(candidate.readinessPromotionAllowed, false);

assert.throws(
  () => evaluateSponsorDiligenceResponseCandidate({ ...candidate.candidate, sectionId: 'unknown-section' }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_SPONSOR_DILIGENCE_SECTION'
);
assert.throws(
  () => evaluateSponsorDiligenceResponseCandidate({ ...candidate.candidate, evidenceReferences: [] }),
  (error) => error instanceof BankingError && error.code === 'INVALID_SPONSOR_DILIGENCE_INPUT'
);
assert.throws(
  () => evaluateSponsorDiligenceResponseCandidate({ ...candidate.candidate, reviewedAt: 'August 30 2026' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_SPONSOR_DILIGENCE_INPUT'
);

console.log('Sponsor diligence evidence, human-attestation, no-auto-submit, no-impersonation, and non-approval runtime checks passed.');
