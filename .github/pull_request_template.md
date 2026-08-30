## Change summary
Describe what changed and why.

## Environment / money boundary
- [ ] Public demo only
- [ ] Provider sandbox only
- [ ] Production-impacting change (requires separate regulated-program approval before activation)

Confirm:
- [ ] No production money movement is enabled merely by this PR.
- [ ] `BANKING_ENABLE_LIVE_WRITES` remains independently gated.
- [ ] Crypto live trading remains independently gated.
- [ ] No new FDIC/sponsor-bank/card-network/regulatory claim is made without an actually approved relationship/disclosure.

## Secret / sensitive-data review
- [ ] No provider API keys, DB credentials, webhook secrets, operator secrets, deployment tokens, private keys, seed phrases, passwords, PINs, CVVs, OTPs, SSNs, or raw KYC documents are committed.
- [ ] New server-only configuration values are represented by key names/placeholders only.
- [ ] Client code does not receive server provider/database/operator secrets.
- [ ] Logs/errors do not expose restricted credentials or raw sensitive payloads.

## Banking event / webhook changes
If this PR changes provider events/webhooks:
- [ ] Signature verification still occurs before normalization/processing.
- [ ] Timestamp/replay controls remain fail-closed.
- [ ] Provider event IDs remain durably deduplicated.
- [ ] Duplicate delivery cannot create a second financial journal.
- [ ] Payload/version changes are normalized behind the provider/private-gateway boundary.

## Operator / privileged changes
If this PR changes sandbox admin/operator behavior:
- [ ] Customer/demo authentication is still separate from operator authentication.
- [ ] Operator HMAC secret remains server-side.
- [ ] Operator ID must be explicitly allowlisted.
- [ ] One-time request ID is bound into the HMAC.
- [ ] Durable request-ID anti-replay remains enforced.
- [ ] Admin action creates appropriate audit evidence.

## Accounting changes
If this PR changes money/accounting state:

**Trigger/event:**

**Debit account(s):**

**Credit account(s):**

**Amount source:**

**Idempotency/dedupe rule:**

**Return/reversal behavior:**

**Reconciliation effect:**

Confirm:
- [ ] Journal remains balanced.
- [ ] Historical posted journals are not edited/deleted to implement the change.
- [ ] Corrections use legitimate new events/compensating entries where required.
- [ ] Database-level balance/append-only guards remain intact.

## Event processing / recovery
If event processing changes:
- [ ] Processing lease ownership remains required.
- [ ] Stale claims are recoverable safely.
- [ ] Automatic attempts remain bounded.
- [ ] Concurrent recovery uses database locking / `SKIP LOCKED` semantics where applicable.
- [ ] Terminal failures still require signed/allowlisted human review before requeue.

## Reconciliation
If reconciliation changes:
- [ ] Event-level reconciliation remains available where relevant.
- [ ] Account-level provider-vs-ledger reconciliation uses processed events only.
- [ ] Caller cannot supply the provider/internal balance to force a match.
- [ ] Reconciliation resolution does not edit financial journals.
- [ ] Discrepancies remain visible until explained/resolved.

## Database / migration changes
If schema/data changes:
- [ ] New numbered migration added instead of editing already-applied migration history.
- [ ] Migration can run transactionally where supported.
- [ ] Backup/restore impact considered.
- [ ] Data migration/rollback or forward-fix plan documented.
- [ ] Unique/idempotency/accounting constraints remain enforced at the database layer.

## Privacy / retention
If new data is collected/stored/shared:
- [ ] Data category/classification identified.
- [ ] Collection is necessary for the approved flow.
- [ ] Storage location/access boundary identified.
- [ ] Retention/deletion requirement identified.
- [ ] Vendor/subprocessor impact reviewed.
- [ ] Public privacy/disclosure copy updated only when accurate for the actual program.

## Verification
- [ ] Typecheck passes on this exact head.
- [ ] General safety checks pass.
- [ ] Synthetic sandbox checks pass.
- [ ] Durable banking core checks pass.
- [ ] Operator control checks pass.
- [ ] Operator anti-replay checks pass.
- [ ] Diligence documentation checks pass where affected.
- [ ] Production build passes.
- [ ] Relevant mobile/customer flow reviewed.
- [ ] Relevant provider-sandbox evidence/runbook steps executed if the environment is configured.

## Rollback / containment
How can this change be safely disabled, rolled back, or contained if it misbehaves?

## Evidence
List non-secret identifiers only (CI run IDs, SHA, migration numbers/checksums, sandbox run/event/journal/reconciliation/audit IDs).

Never paste credentials or raw restricted customer data here.
