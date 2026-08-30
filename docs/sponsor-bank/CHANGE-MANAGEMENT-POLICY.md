# Galactic Trust — Change Management & Emergency Release Policy

## Purpose
This document defines the engineering change-control posture for Galactic Trust public-beta and provider-sandbox work. It is designed to prevent urgent product pressure from bypassing banking, accounting, security, or disclosure controls.

It does not replace the final sponsor-bank/provider change-approval process that may be required for production.

## Core rules
1. `main` is the production branch.
2. Material banking/security/compliance changes are developed on a review branch/PR.
3. CI must run on the exact commit proposed for release.
4. A previous green commit does not make a later commit green.
5. Production financial activation flags are configuration approvals, not ordinary feature toggles.
6. Emergency changes do not justify disabling fail-closed controls.
7. Secrets are managed outside Git and never embedded to make a build pass.
8. Ledger/audit history is not edited as a deployment shortcut.

## Change classes

### Class A — Financial/security critical
Examples:
- banking/crypto live-mode gates;
- authentication/authorization;
- operator signing/allowlist/replay protection;
- provider credentials/networking;
- webhook verification;
- idempotency/event dedupe;
- ledger journal rules;
- ACH return/reversal rules;
- reconciliation;
- database schema/migrations;
- audit/event recovery;
- privacy/security controls;
- customer disclosures about regulated services.

Required posture:
- dedicated PR;
- relevant CI gates green;
- explicit review of failure modes;
- migration/recovery plan where applicable;
- rollback/containment plan;
- production activation remains separately approved.

### Class B — Customer-facing product behavior
Examples:
- dashboard flows;
- onboarding UI;
- demo transfer/card/crypto interactions;
- support/privacy navigation;
- accessibility/mobile behavior.

Required posture:
- PR/CI;
- mobile/customer-flow review;
- no misleading bank/FDIC/card-network claims;
- no regression of trust/disclosure surfaces.

### Class C — Documentation/non-runtime
Examples:
- sponsor-bank packet;
- runbooks;
- evidence templates;
- internal checklists.

Required posture:
- review for factual consistency;
- diligence documentation CI where covered;
- no secret values.

## Standard release flow

1. Identify the requested outcome and change class.
2. Work on a non-production branch.
3. Make the smallest coherent change set.
4. Add/update regression coverage.
5. Run CI on the exact head.
6. Review changed files and financial/security boundaries.
7. Confirm production/sandbox environment variables are appropriate.
8. Deploy preview/sandbox first where applicable.
9. Execute documented smoke/reconciliation checks.
10. Merge/promote only after required review/approval.
11. Verify the deployed commit/environment after release.
12. Preserve evidence identifiers for material financial/security changes.

## Required CI posture
The current sponsor-bank-ready branch uses multiple independent checks, including:
- TypeScript typecheck;
- general safety checks;
- synthetic sandbox isolation;
- durable banking core checks;
- operator control checks;
- operator one-time request anti-replay checks;
- diligence documentation checks;
- production build.

A check must not be removed or weakened merely because it catches a release blocker. Fix the underlying implementation/check defect and rerun the exact new head.

## Database migrations
Rules:
- migrations are numbered/versioned;
- applied migration checksums are recorded;
- do not edit an already-applied migration to change history;
- add a new migration;
- migration execution requires the intended sandbox/database gate;
- migrations run transactionally where supported;
- destructive changes require explicit backup/recovery and data-migration planning;
- production schema changes require the actual production program approval process before execution.

## Financial/accounting changes
Any change affecting journal creation must document:
- triggering event/state;
- debit account(s);
- credit account(s);
- amount source;
- idempotency rule;
- reversal/return behavior;
- reconciliation effect;
- audit evidence;
- failure/retry behavior.

Historical posted journal lines are not edited to implement a new accounting policy. Use new events/compensating journals as appropriate.

## Webhook/provider changes
For provider event changes, review:
- signature algorithm;
- raw-body handling;
- timestamp/replay window;
- event-ID semantics;
- payload versioning;
- normalization;
- duplicate delivery;
- ordering assumptions;
- retries;
- return/reversal events;
- account/reconciliation joins.

Provider-specific behavior belongs behind the provider/private-gateway adapter boundary.

## Privileged operator changes
Any change to sandbox operator controls must preserve:
- server-side signing secret;
- explicit operator-ID allowlist;
- one-time request ID;
- timestamp expiry;
- method/path/body-hash binding;
- timing-safe signature comparison;
- durable replay consumption;
- customer/operator identity separation;
- audit evidence for material admin actions.

## Configuration changes
Treat these as high sensitivity:
- provider credentials;
- database credentials;
- webhook secrets;
- operator secrets/allowlists;
- sandbox enable flags;
- production compliance/disclosure/live-write flags;
- deployment tokens.

Rules:
- no values in Git/chat;
- use approved secret/environment management;
- rotate on suspected exposure;
- configuration alone does not constitute legal/compliance approval;
- production live-write changes require explicit program authorization.

## Emergency change procedure
An emergency is not permission to bypass controls.

For a SEV-1/SEV-2 incident:
1. contain/disable the affected capability;
2. preserve evidence;
3. make the smallest remediation change;
4. add targeted regression coverage where practical;
5. run required CI on the exact emergency commit;
6. obtain required security/provider/compliance approval for restoration;
7. deploy/verify;
8. perform post-incident review.

If normal deployment tooling is unavailable, favor keeping the affected financial capability disabled rather than enabling an unreviewed/manual money path.

## Prohibited emergency shortcuts
Do not:
- set live-write gates true to test whether an issue disappears;
- disable webhook signatures;
- remove event dedupe;
- bypass operator allowlists/replay protection;
- raise retry limits indefinitely to hide terminal failures;
- edit/delete posted journals;
- delete audit evidence;
- paste credentials into source code;
- merge knowingly failing financial/security CI because the release is urgent;
- claim regulatory/provider approval that has not occurred.

## Rollback vs forward-fix
Rollback is preferred when:
- a recent code/config change caused the issue;
- rollback preserves data integrity;
- the previous deployment is known good and compatible with current schema/state.

Forward-fix may be required when:
- database migration/data state makes rollback unsafe;
- provider event/API semantics changed;
- rollback would reintroduce a known security issue.

Document the decision.

## Release evidence for critical changes
Retain non-secret identifiers:
- change/PR number;
- exact commit SHA;
- CI workflow run IDs;
- deployment ID;
- migration versions/checksums;
- smoke/certification run ID;
- relevant event/journal/reconciliation/audit IDs;
- reviewer/approver identifiers appropriate to the actual program.

## Production boundary
Before Galactic Trust handles real customer financial activity, integrate this engineering policy with:
- sponsor-bank/provider change-control requirements;
- security approval;
- compliance/legal approval;
- production access-management/MFA;
- incident/on-call process;
- customer communication procedures;
- regulatory notification obligations where applicable.

The current policy is an engineering control framework, not regulatory approval.
