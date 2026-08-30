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
vm.runInNewContext(transpile('lib/control-assurance-map.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected control assurance runtime import: ${specifier}`);
  }
}, { filename: 'control-assurance-map.runtime.cjs' });

const { controlAssuranceMapStatus, evaluateControlAssuranceCandidate } = mod.exports;
const status = controlAssuranceMapStatus();

assert.equal(status.mapAvailable, true);
assert.equal(status.controlCount, 14);
assert.equal(status.designReferenceCount, 14);
assert.equal(status.accountableOwnerVerifiedCount, 0);
assert.equal(status.controlDesignApprovedCount, 0);
assert.equal(status.operatingEvidenceVerifiedCount, 0);
assert.equal(status.independentTestingVerifiedCount, 0);
assert.equal(status.remediationVerifiedCount, 0);
assert.equal(status.sponsorAcceptedCount, 0);
assert.equal(status.boardOrGovernanceApprovedCount, 0);
assert.equal(status.launchGateSatisfiedCount, 0);
assert.equal(status.softwareMayActAsControlOwner, false);
assert.equal(status.softwareMayActAsIndependentTester, false);
assert.equal(status.softwareMayCloseFindings, false);
assert.equal(status.automaticOperatingEffectivenessPromotionEnabled, false);
assert.equal(status.automaticLaunchGatePromotionEnabled, false);
assert.equal(status.productionControlAssuranceProgramOperating, false);
assert.ok(status.controls.every((control) => control.status === 'design-reference-only'));
assert.ok(status.controls.every((control) => control.operatingEvidenceVerified === false));
assert.ok(status.controls.every((control) => control.independentTestingVerified === false));
assert.ok(status.controls.every((control) => control.launchGateSatisfied === false));
assert.ok(status.controls.every((control) => control.accountableRoleIds.length > 0));
assert.ok(status.controls.every((control) => control.launchGateIds.length > 0));

const candidate = evaluateControlAssuranceCandidate({
  controlId: 'ledger-funds-reconciliation',
  selectedAccountableRoleId: 'finance-capital-owner',
  controlScope: 'Simulation-only ledger and reconciliation control scope; production sponsor/program scope unresolved.',
  controlDescription: 'Prototype uses explicit transaction state, double-entry journals, idempotency, and separate reconciliation layers. Production exercise and provider-statement evidence remain external.',
  operatingEvidenceReferences: ['repo-runtime-check/reference-only', 'private-exercise/reference-only'],
  testEvidenceReferences: ['ci-safety-suite/reference-only'],
  ownerAttestationReference: 'private-human-attestation/reference-only',
  qualifiedReviewerRole: 'future qualified finance/control assurance reviewer - unassigned',
  openIssuesAndExceptions: 'Persistent external exercise, provider statement reconciliation, and accountable owner verification remain open.',
  remediationOrFollowUp: 'Execute in approved environment, authenticate evidence, assign qualified owner, independently test, reconcile provider statements, and verify remediation.',
  evidenceAsOf: '2026-08-30',
  reviewedAt: '2026-08-30'
});

assert.equal(candidate.structurallyCompleteForHumanAssuranceReview, true);
assert.equal(candidate.mappedAccountableRole, true);
assert.ok(candidate.linkedSponsorDiligenceSectionCount > 0);
assert.ok(candidate.linkedLaunchGateCount > 0);
assert.equal(candidate.accountableOwnerVerified, false);
assert.equal(candidate.ownerAttestationAuthenticated, false);
assert.equal(candidate.controlDesignApproved, false);
assert.equal(candidate.operatingEvidenceAuthenticated, false);
assert.equal(candidate.operatingEffectivenessVerified, false);
assert.equal(candidate.testEvidenceAuthenticated, false);
assert.equal(candidate.independentTestingVerified, false);
assert.equal(candidate.issuesAndExceptionsResolved, false);
assert.equal(candidate.remediationVerified, false);
assert.equal(candidate.qualifiedReviewCompleted, false);
assert.equal(candidate.sponsorAccepted, false);
assert.equal(candidate.boardOrGovernanceApproved, false);
assert.equal(candidate.launchGateSatisfied, false);
assert.equal(candidate.softwareMayActAsControlOwner, false);
assert.equal(candidate.softwareMayActAsIndependentTester, false);
assert.equal(candidate.softwareMayCloseFindings, false);
assert.equal(candidate.readinessPromotionAllowed, false);

assert.throws(
  () => evaluateControlAssuranceCandidate({ ...candidate.candidate, controlId: 'unknown-control' }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_CONTROL_ASSURANCE_RECORD'
);
assert.throws(
  () => evaluateControlAssuranceCandidate({ ...candidate.candidate, selectedAccountableRoleId: 'bsa-aml-officer' }),
  (error) => error instanceof BankingError && error.code === 'ACCOUNTABLE_ROLE_NOT_MAPPED_TO_CONTROL'
);
assert.throws(
  () => evaluateControlAssuranceCandidate({ ...candidate.candidate, operatingEvidenceReferences: [] }),
  (error) => error instanceof BankingError && error.code === 'INVALID_CONTROL_ASSURANCE_INPUT'
);

console.log('Control assurance map ownership linkage, evidence/test separation, open-findings, no-auto-closure, and non-promotion runtime checks passed.');
