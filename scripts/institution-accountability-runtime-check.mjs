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
vm.runInNewContext(transpile('lib/institution-accountability.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected institution accountability runtime import: ${specifier}`);
  }
}, { filename: 'institution-accountability.runtime.cjs' });

const { institutionAccountabilityStatus, evaluateAccountabilityAssignmentCandidate } = mod.exports;
const status = institutionAccountabilityStatus();

assert.equal(status.accountabilityModelAvailable, true);
assert.equal(status.roleCount, 16);
assert.equal(status.assignedRoleCount, 0);
assert.equal(status.verifiedQualifiedRoleCount, 0);
assert.equal(status.responsibilityMatrixAssigned, false);
assert.equal(status.proposedBankBoardAssignedAndQualified, false);
assert.equal(status.executiveManagementAssignedAndQualified, false);
assert.equal(status.bsaAmlOfficerAssignedAndQualified, false);
assert.equal(status.independentAuditFunctionAssignedAndQualified, false);
assert.equal(status.aiMayServeAsAccountableOwner, false);
assert.equal(status.softwareMayServeAsAccountableOwner, false);
assert.equal(status.automatedAssignmentAllowed, false);
assert.equal(status.readyForSponsorProgramResponsibilitySignoff, false);
assert.equal(status.readyForCharterGovernanceSubmission, false);
assert.ok(status.roles.every((role) => role.assignmentStatus === 'unassigned'));
assert.ok(status.roles.every((role) => role.qualifiedHumanRequired === true));
assert.ok(status.roles.every((role) => role.aiMayServeAsAccountableOwner === false));
assert.ok(status.roles.every((role) => role.assignmentVerified === false));

const candidate = evaluateAccountabilityAssignmentCandidate({
  roleId: 'bsa-aml-officer',
  actorClass: 'human-individual',
  proposedRoleTitle: 'Future BSA/AML Officer candidate',
  proposedOrganization: 'Future regulated institution under evaluation',
  qualificationsSummary: 'Private qualification evidence would be reviewed by accountable humans and applicable authorities.',
  authoritySummary: 'Authority would require actual governance documents, employment/delegation, resources, and escalation rights.',
  independenceSummary: 'Independence and access would require human governance review and evidence.',
  evidenceReferences: ['private-diligence-room/reference-only'],
  reviewerRole: 'qualified bank regulatory/compliance reviewer',
  reviewedAt: '2026-08-30'
});

assert.equal(candidate.structurallyCompleteForHumanGovernanceReview, true);
assert.equal(candidate.assignmentVerified, false);
assert.equal(candidate.qualificationsVerified, false);
assert.equal(candidate.authorityVerified, false);
assert.equal(candidate.independenceVerified, false);
assert.equal(candidate.boardOrGovernanceApprovalVerified, false);
assert.equal(candidate.regulatorOrSponsorAcceptanceVerified, false);
assert.equal(candidate.readinessPromotionAllowed, false);
assert.equal(candidate.aiCanServeAsNamedAccountableOwner, false);
assert.equal(candidate.softwareCanServeAsNamedAccountableOwner, false);
assert.equal(candidate.humanGovernanceReviewRequired, true);

assert.throws(
  () => evaluateAccountabilityAssignmentCandidate({ ...candidate.candidate, roleId: 'unknown-role' }),
  (error) => error instanceof BankingError && error.code === 'UNKNOWN_ACCOUNTABILITY_ROLE'
);
assert.throws(
  () => evaluateAccountabilityAssignmentCandidate({ ...candidate.candidate, actorClass: 'software-service' }),
  (error) => error instanceof BankingError && error.code === 'INVALID_ACCOUNTABILITY_ACTOR_CLASS'
);
assert.throws(
  () => evaluateAccountabilityAssignmentCandidate({ ...candidate.candidate, evidenceReferences: [] }),
  (error) => error instanceof BankingError && error.code === 'INVALID_ACCOUNTABILITY_INPUT'
);

console.log('Institution accountability unassigned-human-owner, no-AI-owner, evidence, and non-promotion runtime checks passed.');
