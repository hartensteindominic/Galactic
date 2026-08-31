import fs from 'node:fs';

const required = [
  ['lib/risk-issue-management.ts', 'productionIssueRepositoryConnected: false', 'production issue repository must remain unclaimed'],
  ['lib/risk-issue-management.ts', 'productionIssueInventoryCompletenessVerified: false', 'zero recorded issues must not imply complete inventory'],
  ['lib/risk-issue-management.ts', 'automaticRiskAcceptanceAllowed: false', 'automatic risk acceptance must be disabled'],
  ['lib/risk-issue-management.ts', 'automaticIssueClosureAllowed: false', 'automatic issue closure must be disabled'],
  ['lib/risk-issue-management.ts', 'softwareMayCloseIssue: false', 'software must not close governed issues'],
  ['lib/risk-issue-management.ts', 'softwareMayAcceptResidualRisk: false', 'software must not accept residual risk'],
  ['lib/risk-issue-management.ts', 'softwareMayRepresentSponsorOrRegulatorClosure: false', 'software must not claim external closure'],
  ['lib/risk-issue-management.ts', 'unresolvedHighCriticalBlocksLaunchByDefault: true', 'high critical issues must block launch by default'],
  ['lib/risk-issue-management.ts', 'unresolvedMoneyMovementOrLedgerIssueBlocksLiveFinancialActivityByDefault: true', 'money movement/ledger issues must block live financial activity'],
  ['lib/risk-issue-management.ts', 'greenCiCountsAsIssueRemediation: false', 'green CI must not count as issue remediation'],
  ['lib/risk-issue-management.ts', 'codeFixCountsAsIssueClosure: false', 'code fix must not count as issue closure'],
  ['lib/risk-issue-management.ts', "input.source === 'sponsor-program-finding' || input.source === 'regulator-or-examiner-finding'", 'external findings must be identified explicitly'],
  ['lib/risk-issue-management.ts', "throw new BankingError(400, 'INVALID_RISK_ISSUE_STATE', 'Software review may not propose a closed issue state.')", 'structural evaluator must reject closed input state'],
  ['app/api/prototype/risk-issue-review/route.ts', 'requirePrototypeOperator(request)', 'risk issue endpoint must require operator access'],
  ['app/api/prototype/risk-issue-review/route.ts', 'requireTrustedOrigin(request)', 'risk issue endpoint must enforce trusted origin'],
  ['app/api/prototype/risk-issue-review/route.ts', 'requireJsonRequest(request)', 'risk issue endpoint must require JSON'],
  ['app/api/prototype/risk-issue-review/route.ts', 'readJsonBodyLimited<RiskIssueReviewRequest>(request, 49_152)', 'risk issue endpoint must bound request body'],
  ['app/api/prototype/risk-issue-review/route.ts', 'persisted: false', 'risk issue endpoint must remain non-persistent'],
  ['docs/RISK_ISSUE_REMEDIATION_GOVERNANCE.md', 'issue identified ≠ owner assigned ≠ containment effective ≠ root cause validated ≠ remediation implemented ≠ independently verified ≠ customer remediation complete ≠ residual risk accepted ≠ sponsor/regulator closure accepted ≠ issue closed.', 'documentation must preserve remediation evidence stages'],
  ['docs/RISK_ISSUE_REMEDIATION_GOVERNANCE.md', 'a recorded count of zero is **not** evidence that no issues exist', 'documentation must preserve inventory truth'],
  ['docs/RISK_ISSUE_REMEDIATION_GOVERNANCE.md', 'AI/software may **not**:', 'documentation must bound AI closure authority'],
  ['scripts/risk-issue-management-runtime-check.mjs', 'Risk issue remediation inventory-truth, no-auto-close, high-critical governance, external-finding, verification, and non-promotion runtime checks passed.', 'risk issue model must have executable runtime coverage']
];

const forbidden = [
  ['lib/risk-issue-management.ts', 'automaticRiskAcceptanceAllowed: true', 'automatic risk acceptance must remain disabled'],
  ['lib/risk-issue-management.ts', 'automaticIssueClosureAllowed: true', 'automatic issue closure must remain disabled'],
  ['lib/risk-issue-management.ts', 'softwareMayCloseIssue: true', 'software must never close governed issues'],
  ['lib/risk-issue-management.ts', 'softwareMayAcceptResidualRisk: true', 'software must never accept residual risk'],
  ['lib/risk-issue-management.ts', 'softwareMayRepresentSponsorOrRegulatorClosure: true', 'software must not self-certify external closure'],
  ['lib/risk-issue-management.ts', 'greenCiCountsAsIssueRemediation: true', 'green CI must not self-remediate an issue'],
  ['lib/risk-issue-management.ts', 'codeFixCountsAsIssueClosure: true', 'code fix must not self-close an issue'],
  ['lib/risk-issue-management.ts', 'issueClosed: true', 'structural evaluator must never close an issue'],
  ['app/api/prototype/risk-issue-review/route.ts', 'await request.json()', 'risk issue endpoint must not bypass bounded JSON parsing'],
  ['app/api/prototype/risk-issue-review/route.ts', 'persisted: true', 'risk issue endpoint must not claim persistence'],
  ['docs/RISK_ISSUE_REMEDIATION_GOVERNANCE.md', 'green CI closes', 'documentation must not equate CI with closure']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}
for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Risk issue remediation no-auto-close, inventory-truth, high-critical block, external-closure, operator/request, and non-promotion safety checks passed.');
