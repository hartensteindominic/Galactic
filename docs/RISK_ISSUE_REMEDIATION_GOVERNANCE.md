# Galactic Trust — Risk Issue, Exception, and Remediation Governance

Status: governance schema and planning workflow only  
Current operating posture: simulation-only fintech prototype

## Purpose

A control framework is incomplete if it only describes the intended control. A bank-grade operating model must also govern what happens when:

- a control test fails;
- reconciliation identifies a break;
- a customer complaint exposes a defect;
- an incident reveals a gap;
- a security/privacy test identifies a weakness;
- a critical provider fails an expectation;
- independent audit or assurance raises a finding;
- qualified legal/compliance review identifies a gap;
- a sponsor program raises a finding;
- a regulator/examiner raises a finding;
- management identifies an issue before an external party does.

Permanent rule:

> issue identified ≠ owner assigned ≠ containment effective ≠ root cause validated ≠ remediation implemented ≠ independently verified ≠ customer remediation complete ≠ residual risk accepted ≠ sponsor/regulator closure accepted ≠ issue closed.

Software must preserve those states separately.

## Machine-readable source

`lib/risk-issue-management.ts` defines the issue/remediation review model.

Supported source classes include:

- internal control test;
- incident;
- customer complaint/dispute;
- independent audit/assurance;
- security/privacy test;
- vendor/provider monitoring;
- sponsor-program finding;
- regulator/examiner finding;
- financial reconciliation;
- legal/compliance review;
- management self-identification.

Severity classes:

- low;
- medium;
- high;
- critical.

High and critical issues require enhanced human governance in the model. The actual severity methodology and remediation timelines remain unapproved until an operating program is designed and reviewed.

## Fail-closed issue states

The review workflow can structurally represent:

1. `identified`
2. `triaged`
3. `remediation-in-progress`
4. `pending-independent-verification`
5. `verified-remediated`
6. `risk-acceptance-proposed`

The structural API does **not** allow a user to propose `closed` as the software-reviewed state. Closure requires a separate authorized human/external process appropriate to the issue.

Even `verified-remediated` in an input package is only a proposed state. The evaluator continues to return:

- remediation implementation verified = false;
- independent verification completed = false;
- customer remediation completed = false;
- residual-risk acceptance approved = false;
- sponsor closure accepted = false;
- regulator closure accepted = false;
- launch restriction cleared = false;
- money-movement restriction cleared = false;
- issue closed = false.

## Minimum issue package

A governed issue should capture, at minimum:

- issue label;
- source;
- severity;
- affected products/processes;
- affected control IDs;
- jurisdictions;
- description;
- customer impact;
- financial impact;
- legal/compliance/sponsor impact;
- immediate containment;
- root cause or current hypothesis;
- remediation plan;
- accountable human owner role;
- independent verifier role;
- target remediation date;
- evidence references;
- external finding reference when applicable;
- residual risk;
- customer-remediation assessment;
- launch/money-movement impact;
- review date.

A non-sensitive reference may point to private evidence; the underlying sensitive evidence should not be pasted into the public repository or AI prompts.

## Closure authority

AI/software may:

- identify a possible issue;
- draft the issue record;
- map affected controls;
- organize evidence references;
- calculate aging or target dates once policy exists;
- compare remediation evidence against expected artifacts;
- flag missing independent verification;
- help prepare management, sponsor, audit, or regulator response packages.

AI/software may **not**:

- accept residual risk on behalf of management or the board;
- close an issue automatically;
- treat a code commit as complete remediation;
- treat green CI as independent verification;
- represent that a sponsor finding is closed without actual sponsor closure evidence where required;
- represent that a regulator/examiner finding is closed without actual authority evidence and accountable review;
- determine that customer remediation is complete without the approved process and evidence;
- clear a product launch gate or money-movement restriction merely because code changed;
- suppress or downgrade a material issue to make readiness appear better.

## Customer harm and remediation

Every issue package requires a customer-remediation assessment even if the current hypothesis is “no known customer impact.” That statement must remain a reviewed assertion, not an automatic software conclusion.

Where customers may have been harmed, the operating program must determine, as applicable:

- affected population;
- transaction/account impact;
- notice requirements;
- refund/reimbursement/fee reversal or other remediation;
- complaint/dispute coordination;
- tax/reporting implications;
- sponsor/network/provider responsibilities;
- regulatory reporting/notification analysis;
- evidence of completed remediation.

The current prototype does not determine any of those obligations automatically.

## Sponsor and regulator findings

Sponsor-program and regulator/examiner findings are marked as potentially requiring external closure evidence.

Software may organize the response but must keep:

- `sponsorClosureAccepted: false`
- `regulatorClosureAccepted: false`
- `softwareMayRepresentExternalFindingClosed: false`

until the appropriate authoritative evidence and accountable human review exist.

A sponsor relationship or conditional charter approval is not permission to mark a specific finding closed.

## Risk acceptance

A proposed risk acceptance is not closure.

Before an operating risk-acceptance process can be used, the actual governance must define:

- which issue classes are eligible for acceptance;
- who has authority by severity/type;
- whether board/committee approval is required;
- expiration/review dates;
- compensating controls;
- monitoring requirements;
- customer/legal/regulatory constraints;
- sponsor approval or notice where applicable;
- categories that may not be accepted instead of remediated.

The prototype therefore keeps `automaticRiskAcceptanceAllowed: false` and `softwareMayAcceptResidualRisk: false`.

## Launch and money-movement interaction

The default governance posture is fail closed:

- unresolved high/critical issues block launch by default;
- unresolved money-movement or ledger issues block live financial activity by default;
- a code fix does not remove the restriction without the required verification and release governance;
- an issue may require rollback, product disablement, customer communication, provider escalation, or money-movement freeze depending on the approved operating procedures.

This model complements `lib/product-launch-governance.ts`; it does not bypass its 17 launch gates.

## Issue inventory truth

`riskIssueManagementStatus()` reports prototype-recorded counts separately from completeness.

The current values include:

- production issue repository connected = false;
- production issue inventory completeness verified = false;
- production remediation SLA approved = false;
- production escalation matrix approved = false;
- production independent verification workflow operating = false.

Therefore a recorded count of zero is **not** evidence that no issues exist. It means no authoritative production issue inventory is connected to this software status model.

## Evidence and sensitive information

Do not commit to the public repository or paste into AI prompts:

- customer PII/financial records;
- confidential complaint/dispute details;
- SAR or SAR-revealing information;
- penetration-test exploit details that require restricted handling;
- credentials/secrets;
- confidential sponsor/provider findings;
- confidential regulator/examiner correspondence;
- privileged legal advice;
- personnel records;
- private financial/source-of-funds materials.

Use non-sensitive references and an approved access-controlled evidence/case system when one is selected.
