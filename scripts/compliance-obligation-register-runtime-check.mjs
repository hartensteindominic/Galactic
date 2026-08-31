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
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: file
  }).outputText;
}

const complianceModule = { exports: {} };
vm.runInNewContext(transpile('lib/compliance-obligation-register.ts'), {
  module: complianceModule,
  exports: complianceModule.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected compliance register runtime import: ${specifier}`);
  }
}, { filename: 'compliance-obligation-register.runtime.cjs' });

const { complianceObligationRegisterStatus, evaluateComplianceApplicabilityCandidate } = complianceModule.exports;

const status = complianceObligationRegisterStatus();
assert.equal(status.sourceRegistryAvailable, true);
assert.equal(status.sourceRegistryReviewedAt, '2026-08-30');
assert.equal(status.officialSourceCount, 4);
assert.equal(status.obligationRegisterAvailable, true);
assert.equal(status.obligationCount, 14);
assert.equal(status.unresolvedApplicabilityCount, 14);
assert.equal(status.applicableObligationCount, 0);
assert.equal(status.accountableOwnerAssignedCount, 0);
assert.equal(status.approvedPolicyCount, 0);
assert.equal(status.verifiedOperatingEvidenceCount, 0);
assert.equal(status.verifiedIndependentTestingCount, 0);
assert.equal(status.qualifiedLegalComplianceApplicabilityReviewComplete, false);
assert.equal(status.complianceResponsibilityMatrixAssigned, false);
assert.equal(status.productionComplianceManagementSystemOperating, false);
assert.equal(status.productionBsaAmlProgramOperating, false);
assert.equal(status.productionOfacProgramOperating, false);
assert.equal(status.softwareCanDetermineLegalApplicability, false);
assert.equal(status.softwareCanInterpretLawAuthoritatively, false);
assert.equal(status.softwareCanSelfCertifyCompliance, false);
assert.equal(status.softwareCanSelfCertifyExaminationReadiness, false);
assert.equal(status.examinationReady, false);
assert.ok(status.sources.every((source) => source.currentSourceChecked === true));
assert.ok(status.sources.every((source) => source.createsGalacticApplicabilityByItself === false));
assert.ok(status.obligations.every((record) => record.applicabilityStatus === 'unassessed'));
assert.ok(status.obligations.every((record) => record.accountableHumanRoleAssigned === false));
assert.ok(status.obligations.every((record) => record.galacticObligationDetermined === false));

const candidate = evaluateComplianceApplicabilityCandidate({
  obligationId: 'cms-board-management-oversight',
  proposedDecision: 'applicable',
  entityRole: 'Future bank candidate under evaluation; no charter selected',
  products: ['consumer transaction account concept'],
  jurisdictions: ['United States; exact state footprint unresolved'],
  rationale: 'Candidate review package only. Applicability depends on eventual charter, entity role, products, and supervisory scope.',
  sourceIds: ['occ-cms-2018', 'occ-corporate-risk-governance-2019'],
  accountableRole: 'future compliance executive role - unstaffed',
  reviewerRole: 'qualified bank regulatory counsel / compliance adviser',
  reviewedAt: '2026-08-30',
  evidenceReference: 'private-diligence-room-placeholder-only'
});

assert.equal(candidate.structurallyCompleteForQualifiedReview, true);
assert.equal(candidate.softwareVerifiedLegalApplicability, false);
assert.equal(candidate.softwareVerifiedRegulatoryInterpretation, false);
assert.equal(candidate.softwareVerifiedAccountableOwnerAssignment, false);
assert.equal(candidate.softwareVerifiedPolicyApproval, false);
assert.equal(candidate.softwareVerifiedOperatingCompliance, false);
assert.equal(candidate.softwareVerifiedIndependentTesting, false);
assert.equal(candidate.readinessPromotionAllowed, false);
assert.equal(candidate.qualifiedHumanReviewRequired, true);

assert.throws(
  () => evaluateComplianceApplicabilityCandidate({
    ...candidate.candidate,
    obligationId: 'does-not-exist'
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'UNKNOWN_COMPLIANCE_OBLIGATION'
);

assert.throws(
  () => evaluateComplianceApplicabilityCandidate({
    ...candidate.candidate,
    sourceIds: ['occ-cms-2018']
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'COMPLIANCE_SOURCE_COVERAGE_INCOMPLETE'
);

assert.throws(
  () => evaluateComplianceApplicabilityCandidate({
    ...candidate.candidate,
    reviewedAt: '08/30/2026'
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'INVALID_COMPLIANCE_APPLICABILITY_INPUT'
);

assert.throws(
  () => evaluateComplianceApplicabilityCandidate({
    ...candidate.candidate,
    sourceIds: [...candidate.candidate.sourceIds, 'unknown-source']
  }),
  (error) => error instanceof BankingError && error.status === 400 && error.code === 'UNKNOWN_COMPLIANCE_SOURCE'
);

console.log('Compliance obligation register unresolved-applicability, source coverage, human-review, and software-noncertification runtime checks passed.');
