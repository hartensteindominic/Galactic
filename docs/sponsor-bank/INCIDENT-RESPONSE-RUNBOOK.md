# Galactic Trust — Incident Response Runbook

**Status:** pre-production engineering/operations draft for sponsor-bank/provider diligence. Final notification duties, SLAs, regulator contacts, bank escalation paths, and customer-notice requirements must match the actual approved program.

## 1. Incident goals
1. Protect customers and prevent unauthorized financial activity.
2. Preserve evidence.
3. Stop further impact without destroying accounting history.
4. Reconcile provider and Galactic records before resuming affected functions.
5. Communicate through the approved sponsor-bank/provider/legal process.
6. Record every material decision and recovery action.

## 2. Severity model

### SEV-1 — Critical
Examples:
- suspected provider/operator/database secret compromise;
- unauthorized production money movement;
- ledger integrity failure;
- material customer-data exposure;
- widespread account takeover;
- production banking provider outage with financial-state uncertainty.

Default action: disable affected write paths, engage provider/bank/security/legal contacts, preserve evidence, reconcile before restoration.

### SEV-2 — High
Examples:
- repeated webhook verification failures from expected provider source;
- provider-vs-ledger discrepancy affecting multiple accounts;
- terminal provider-event failures accumulating;
- admin/operator authorization anomaly;
- partial customer-facing outage affecting banking actions.

### SEV-3 — Moderate
Examples:
- isolated sandbox processing failure;
- single-account reconciliation discrepancy in sandbox;
- non-sensitive UI defect;
- recoverable integration degradation with no financial uncertainty.

### SEV-4 — Low
Examples:
- cosmetic defects;
- documentation problems;
- non-security sandbox test failure.

## 3. Immediate containment controls
Depending on incident scope:
- keep/set production `BANKING_ENABLE_LIVE_WRITES=false`;
- keep/set production `CRYPTO_ENABLE_LIVE_TRADING=false`;
- disable provider-sandbox network gate if sandbox credentials may be compromised;
- disable sandbox database gate if database access must stop;
- rotate affected secrets through the hosting/provider secret manager;
- revoke provider credentials at the provider/private gateway;
- block compromised operator IDs from the allowlist;
- do **not** edit/delete posted journals, audit events, or evidence bundles to hide or correct an incident.

Corrections to money-state history must use approved compensating records.

## 4. Evidence preservation
Capture before making destructive infrastructure changes when safely possible:
- UTC detection time;
- exact Git/deployment SHA;
- environment name;
- affected endpoints/components;
- provider incident/reference ID;
- event IDs/fingerprints;
- journal IDs;
- reconciliation IDs;
- audit IDs;
- queue counts;
- terminal/retry counts;
- relevant hosting/provider logs;
- migration versions/checksums;
- configuration status booleans (never secret values);
- certification evidence bundle if the environment is a sandbox and evidence generation remains trustworthy.

Do not copy secrets into incident tickets or chat.

## 5. Financial-state incident procedure
If any event/journal/reconciliation may be wrong:

1. Disable affected write path.
2. Preserve provider event and Galactic audit evidence.
3. Do not mutate historical journal lines.
4. Compare provider transfer/account state to Galactic canonical events.
5. Run event/account reconciliation.
6. Identify missing, duplicate, stale, returned, or failed events.
7. Recover only through leased/replay-safe event processing.
8. For a legitimate correction, post an approved compensating journal/event.
9. Re-run reconciliation.
10. Require zero unexplained discrepancy before resuming the affected financial path.

## 6. Webhook incident procedure
Symptoms:
- signature failures;
- old timestamps;
- conflicting provider event IDs;
- duplicate storm;
- unexpected unsupported event types.

Actions:
1. Keep invalid events out of normalization/ledger processing.
2. Verify provider webhook signing configuration out-of-band.
3. Check whether gateway/provider changed signature scheme.
4. Inspect event inbox for conflicts/duplicates.
5. Confirm no second journal exists for any canonical event.
6. If provider confirms compromise, rotate webhook secret and revoke old signer.
7. Replay only through the approved provider mechanism and normal dedupe pipeline.

## 7. Operator/admin incident procedure
If an operator secret or ID may be compromised:

1. Remove affected ID from `BANKING_SANDBOX_OPERATOR_IDS`.
2. Rotate `BANKING_SANDBOX_OPERATOR_SECRET` if secret compromise is plausible.
3. Review audit actions for the operator ID and time window.
4. Inspect certification launches, recovery runs, terminal requeues, reconciliation resolutions, account reconciliations, and evidence exports.
5. Confirm no production live-write gate changed.
6. Preserve the old key ID/rotation record outside application logs according to the approved secrets-management process.

Known sandbox hardening gap before production admin design: durable operator request nonces/replay consumption must be added in addition to the current five-minute signed-request window.

## 8. Database/ledger incident procedure
If database integrity is questioned:

1. Stop affected write paths.
2. Do not run ad-hoc UPDATE/DELETE against ledger/audit/evidence tables.
3. Validate applied migration checksums.
4. Confirm append-only triggers and deferred journal-balance trigger exist.
5. Check provider event uniqueness and event-to-journal uniqueness.
6. Compare journal debit/credit totals.
7. Restore to a separate recovery environment if backup testing is needed.
8. Reconcile restored data against provider records before considering it authoritative.

## 9. Reconciliation incident procedure
For open discrepancies:
- do not “resolve” solely to clear a dashboard;
- identify provider/internal source of difference;
- document evidence and root cause;
- post legitimate missing/compensating event/journal if required;
- rerun reconciliation;
- use resolution note only when the discrepancy has an explained disposition;
- audit the resolution.

## 10. Secret exposure procedure
Potential secrets include:
- provider API key;
- provider webhook secret;
- operator signing secret;
- evidence signing secret;
- database URL/password;
- Vercel/GitHub deployment tokens.

Actions:
1. Treat exposed credential as compromised.
2. Revoke/rotate at source.
3. Remove exposed material from active systems/logs/tickets where permitted without destroying required evidence.
4. Review access during exposure window.
5. Validate replacement credentials in sandbox first where applicable.
6. Document key ID/version, rotation time, and impacted systems—never the secret value.

## 11. Customer/data incident procedure
The current public beta should not contain real banking/KYC data.

Before production, define with the actual bank/provider/legal team:
- customer notification triggers/timing;
- bank notification obligations;
- regulator/law-enforcement paths;
- breach-notification obligations by state/data type;
- identity-theft/fraud support;
- complaint handling;
- record preservation.

Do not invent these obligations in the product; they must match the approved program.

## 12. Recovery authorization checklist
Do not restore affected financial writes until:
- root cause understood enough to operate safely;
- compromised credentials rotated/revoked;
- vulnerable path fixed or isolated;
- migrations/database integrity verified;
- event backlog/recovery queue understood;
- terminal failures reviewed;
- provider-vs-ledger reconciliation complete;
- no unexplained material discrepancy remains;
- sponsor bank/provider approval obtained where contract/program requires it;
- incident decision documented.

## 13. Post-incident review
Within the program-defined timeframe, document:
- timeline;
- detection source;
- root cause;
- affected systems/customers/transactions;
- containment;
- reconciliation result;
- corrective action;
- monitoring/test changes;
- owner and due date for each follow-up;
- whether threat model/runbook/control matrix must change.

## 14. Sandbox exercise cadence
Before production, run tabletop/technical exercises for:
- forged webhook;
- duplicate webhook storm;
- stale processing worker;
- database unavailable mid-transaction;
- five failed processing attempts + manual requeue;
- account reconciliation mismatch;
- provider webhook secret compromise;
- operator secret compromise;
- evidence-bundle tampering;
- provider sandbox outage.
