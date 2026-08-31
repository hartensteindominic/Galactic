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

const evidenceModule = { exports: {} };
vm.runInNewContext(transpile('lib/charter-evidence-index.ts'), {
  module: evidenceModule,
  exports: evidenceModule.exports,
  console,
  Date,
  Number,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected charter evidence runtime import: ${specifier}`);
  }
}, { filename: 'charter-evidence.runtime.cjs' });

const { charterEvidenceIndexStatus, evaluateCharterEvidenceCandidate } = evidenceModule.exports;
const status = charterEvidenceIndexStatus();

assert.equal(status.machineReadableEvidenceIndexAvailable, true);
assert.equal(status.automaticRegulatoryStatusPromotionEnabled, false);
assert.equal(status.softwareCanVerifyExternalAuthorityRecords, false);
assert.equal(status.softwareCanMarkBankCharterEffective, false);
assert.equal(status.softwareCanMarkFdicInsuranceEffective, false);
assert.equal(status.softwareCanAuthorizeCustomerFacingBankClaims, false);
assert.equal(status.evidenceRepositoryConnected, false);
assert.equal(status.accountableHumanAssignmentComplete, false);
assert.equal(status.qualifiedExternalReviewWorkflowOperating, false);
assert.equal(status.regulatorEvidenceVerificationWorkflowOperating, false);
assert.equal(status.verifiedClaimCount, 0);
assert.ok(status.claims.length >= 12);
assert.ok(status.claims.every((claim) => claim.currentVerified === false));
assert.ok(status.claims.every((claim) => claim.accountableHumanAssigned === false));
assert.ok(status.claims.every((claim) => claim.currentEvidenceReference === null));
assert.ok(status.claims.every((claim) => claim.currentExternalAuthorityRecordVerified === false));

assert.throws(
  () => evaluateCharterEvidenceCandidate({
    claimId: 'validated-business-thesis',
    accountableHumanRole: 'Strategy owner',
    evidenceReference: 'internal://business-thesis-v1',
    qualifiedHumanReviewed: false,
    internalDataSource: 'cohort-analysis-v1'
  }),
  (error) => error instanceof BankingError && error.code === 'QUALIFIED_HUMAN_REVIEW_REQUIRED'
);

assert.throws(
  () => evaluateCharterEvidenceCandidate({
    claimId: 'validated-business-thesis',
    accountableHumanRole: 'Strategy owner',
    evidenceReference: 'internal://business-thesis-v1',
    qualifiedHumanReviewed: true
  }),
  (error) => error instanceof BankingError && error.code === 'INVALID_CHARTER_EVIDENCE'
);

const internal = evaluateCharterEvidenceCandidate({
  claimId: 'validated-business-thesis',
  accountableHumanRole: 'Strategy owner',
  evidenceReference: 'internal://business-thesis-v1',
  qualifiedHumanReviewed: true,
  internalDataSource: 'cohort-analysis-v1'
});
assert.equal(internal.eligibleForHumanEvidenceReview, true);
assert.equal(internal.proofType, 'internal-operating-data');
assert.equal(internal.externalAuthorityRecordPresent, false);
assert.equal(internal.softwareVerifiedClaim, false);

const human = evaluateCharterEvidenceCandidate({
  claimId: 'charter-route-memo',
  accountableHumanRole: 'Qualified banking counsel',
  evidenceReference: 'diligence://charter-route-memo-v1',
  qualifiedHumanReviewed: true
});
assert.equal(human.eligibleForHumanEvidenceReview, true);
assert.equal(human.proofType, 'qualified-human-review');
assert.equal(human.externalAuthorityRecordPresent, false);
assert.equal(human.softwareVerifiedClaim, false);

assert.throws(
  () => evaluateCharterEvidenceCandidate({
    claimId: 'charter-application-receipt',
    accountableHumanRole: 'Organizer application owner',
    evidenceReference: 'diligence://charter-application-receipt',
    qualifiedHumanReviewed: true,
    externalAuthority: 'Applicable chartering authority'
  }),
  (error) => error instanceof BankingError && error.code === 'AUTHORITY_RECORD_DATE_REQUIRED'
);

const external = evaluateCharterEvidenceCandidate({
  claimId: 'charter-application-receipt',
  accountableHumanRole: 'Organizer application owner',
  evidenceReference: 'diligence://charter-application-receipt',
  qualifiedHumanReviewed: true,
  externalAuthority: 'Applicable chartering authority',
  authorityRecordDate: '2026-08-30'
});
assert.equal(external.eligibleForHumanEvidenceReview, true);
assert.equal(external.proofType, 'external-authority-record');
assert.equal(external.externalAuthorityRecordPresent, true);
assert.equal(external.softwareVerifiedClaim, false);
assert.match(external.disclosure, /Software does not verify authenticity/i);
assert.match(external.disclosure, /authority to operate/i);

assert.throws(
  () => evaluateCharterEvidenceCandidate({
    claimId: 'not-a-real-claim',
    accountableHumanRole: 'Owner',
    evidenceReference: 'internal://x',
    qualifiedHumanReviewed: true
  }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_CHARTER_EVIDENCE_CLAIM'
);

console.log('Charter evidence index human-review, external-authority, and software-nonverification runtime checks passed.');
