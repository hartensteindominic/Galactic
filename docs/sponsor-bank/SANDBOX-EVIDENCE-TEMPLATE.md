# Galactic Trust — Provider Sandbox Evidence Template

Use this template only for approved/evaluation provider-sandbox certification.

**Never paste secrets into this document.** Do not record API keys, database URLs/passwords, webhook secrets, operator secrets, private keys, full account/routing numbers, SSNs, government IDs, authentication codes, or raw KYC documents.

## A. Build identity
- Git repository: `hartensteindominic/Galactic`
- Branch under test:
- Exact commit SHA:
- PR number:
- Test date/time (UTC):
- Operator ID (non-secret allowlisted identifier only):

## B. CI evidence
Record run IDs/links and outcome only.

- Galactic Trust CI run:
- Typecheck: PASS / FAIL
- General safety: PASS / FAIL
- Synthetic sandbox safety: PASS / FAIL
- Durable banking core safety: PASS / FAIL
- Operator control safety: PASS / FAIL
- Production build: PASS / FAIL
- Operator replay safety run: PASS / FAIL

Any failure blocks certification until resolved on a new exact SHA.

## C. Migration evidence
Record migration name + checksum from the isolated provider-sandbox database.

- `001_banking_core.sql` checksum:
- `002_banking_ledger_integrity.sql` checksum:
- `003_banking_event_claims.sql` checksum:
- `004_operator_request_replay_protection.sql` checksum:

Confirm:
- isolated sandbox database: YES / NO
- production database reused: MUST BE NO
- TLS validation enabled: YES / NO
- production live writes disabled: YES / NO

## D. Provider sandbox configuration status
Record status/identifiers only.

- Provider/private gateway name:
- Sandbox program identifier (only if provider permits it in diligence evidence):
- Sandbox credentials configured: YES / NO
- Credentials isolated from production: YES / NO
- Sandbox networking explicitly enabled: YES / NO
- Webhook signing configured: YES / NO
- Operator allowlist configured: YES / NO
- Durable replay protection configured: YES / NO

Do not record secret values.

## E. Certification launch
- Operator request ID:
- Certification run ID:
- Galactic customer resource ID:
- Galactic account resource ID:
- Galactic transfer resource ID:
- Provider sandbox customer/account/transfer IDs (only if provider policy permits):
- Sandbox KYC fixture result: APPROVED / OTHER
- Sandbox account status: OPEN / OTHER
- ACH amount: expected fixed `$25.00`
- Real money moved: MUST BE NO

## F. Operator anti-replay test
For one harmless/read-only operator action:

- Original operator request ID:
- Original request result: ACCEPTED / REJECTED
- Exact same signed request replayed: YES / NO
- Replay result: MUST BE `SANDBOX_OPERATOR_REQUEST_REPLAYED` or equivalent fail-closed response
- New request ID succeeds when otherwise authorized: YES / NO

Do not record the HMAC signature or signing secret.

## G. Provider webhook evidence
- Provider raw event ID:
- Galactic canonical event ID:
- Canonical event type:
- Signature verification: PASS / FAIL
- Timestamp/replay-window verification: PASS / FAIL
- Event-ID header/body consistency: PASS / FAIL
- Event durable capture: PASS / FAIL
- Processing claim token acquired: PASS / FAIL
- Attempt count:
- Event final status:

Do not store the raw signed request body in this template.

## H. Duplicate provider-event replay
- Original canonical event ID:
- Duplicate delivery performed: YES / NO
- Duplicate accepted as duplicate rather than new event: YES / NO
- Additional journal created: MUST BE NO
- Additional financial effect: MUST BE NO

## I. Posted ACH accounting
- Journal ID:
- Debit account: expected `partner_settlement_cash`
- Credit account: expected `customer_deposit_liability`
- Debit cents:
- Credit cents:
- Journal balanced: PASS / FAIL
- Database deferred balance guard confirmed: PASS / FAIL
- Journal/lines append-only guard confirmed: PASS / FAIL

## J. Event-level reconciliation
- Reconciliation ID:
- Provider amount cents:
- Internal amount cents:
- Ledger debit cents:
- Ledger credit cents:
- Canonical processed-event count:
- Discrepancy cents:
- Status: MATCHED / DISCREPANCY

## K. Account-level provider-vs-ledger reconciliation
- Galactic account resource ID:
- Reconciliation ID:
- Provider current balance cents:
- Provider available balance cents:
- Internal `customer_deposit_liability` balance cents:
- Processed event count:
- Discrepancy cents:
- Status: MATCHED / DISCREPANCY

Confirm internal balance was reconstructed only from processed events: YES / NO
Confirm historical journals were not edited to force a match: YES / NO

## L. Bounded all-account reconciliation sweep
- Sweep run/request ID:
- Mapped account count processed:
- Hard cap observed (maximum 100): YES / NO
- Matched count:
- Discrepancy count:
- Failed count:
- Truncated: YES / NO
- Provider calls performed sequentially: YES / NO

For failed items, record only account resource ID + bounded error code. Do not copy provider error payloads containing sensitive data.

## M. ACH return accounting
- Original posted provider transfer ID:
- Original posted event processed first: YES / NO
- Return event ID:
- Return amount matches original: YES / NO
- Return journal ID:
- Debit account: expected `customer_deposit_liability`
- Credit account: expected `partner_settlement_cash`
- Journal balanced: PASS / FAIL
- Return without prior posted event rejected in negative test: PASS / FAIL

## N. Recovery / retry evidence
If a controlled failure path is tested:

- Event ID:
- Failure code:
- Automatic attempt count:
- Retry backoff observed: YES / NO
- Processing lease duration control observed: YES / NO
- Stale lease reclaim tested: YES / NO
- Concurrent `SKIP LOCKED` behavior tested: YES / NO
- Terminal after maximum attempts: YES / NO

## O. Terminal-event human review
If a terminal event is manually requeued:

- Terminal event ID:
- Previous attempt count:
- Previous failure code:
- Operator request ID:
- Review/requeue reason recorded: YES / NO
- Audit evidence appended: YES / NO
- Historical journals edited: MUST BE NO

Do not copy sensitive customer/provider details into the review reason.

## P. Open discrepancy handling
- Open reconciliation count before investigation:
- Reconciliation ID investigated:
- Root cause category:
  - provider state
  - event ingestion
  - resource mapping
  - accounting logic
  - timing/eventual consistency
  - other
- Correction used a new legitimate event/compensating record where required: YES / NO / N/A
- Historical journal edited: MUST BE NO
- Operator resolution request ID:
- Resolution metadata audited: YES / NO

## Q. End-of-test operations posture
- Received events:
- Processing events:
- Stale processing leases:
- Retryable failed events:
- Terminal failed events:
- Processed events:
- Open reconciliation discrepancies:

Every non-zero exception queue should have an explained disposition.

## R. Secret/PII review
Confirm the evidence package contains none of the following:

- provider API key: NO
- database URL/password: NO
- webhook signing secret: NO
- operator signing secret: NO
- HMAC signatures: NO
- private keys/seed phrases: NO
- SSN/government-ID values: NO
- full bank account/routing numbers: NO
- passwords/PINs/CVVs/OTP codes: NO
- raw KYC documents: NO

## S. Certification conclusion
- Engineering sandbox result: PASS / FAIL / BLOCKED
- Blocking engineering issues:
- Open reconciliation issues:
- Open recovery/terminal issues:
- Required provider follow-up:
- Required legal/compliance follow-up:

### Required statement

> This evidence demonstrates engineering behavior in a provider sandbox only. It does not constitute bank approval, legal advice, regulatory approval, production KYC/CIP approval, FDIC eligibility, ACH production approval, or authorization to enable live money movement.
