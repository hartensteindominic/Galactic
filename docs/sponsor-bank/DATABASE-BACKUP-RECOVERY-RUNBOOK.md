# Galactic Trust — Banking Database Backup & Recovery Runbook

## Scope
This runbook defines engineering expectations for the isolated Galactic Trust provider-sandbox Postgres database and the future production design. It does not claim that a particular database vendor, sponsor bank, or production RTO/RPO has been approved.

Provider-sandbox certification should not be treated as complete until backup/restore behavior is tested on the selected database platform.

## Protected records
The durable banking database contains engineering records that must survive ordinary process/server restarts and database recovery:
- provider event inbox;
- processing/retry metadata;
- ledger journals;
- ledger journal lines;
- provider resource mappings;
- reconciliation records;
- audit events;
- one-time operator request identifiers/hashes.

Secrets should remain in the environment/secret manager and are not part of normal database evidence exports.

## Recovery principles
1. Never recover by deleting unexplained ledger/audit data.
2. Journals and journal lines are append-only; restoration must preserve that history.
3. Provider event uniqueness must survive restoration.
4. Operator request replay IDs must survive the relevant retention window.
5. Reconciliation and audit history must remain linked to recovered financial-event history.
6. Restore testing happens in an isolated environment first.
7. A database restore does not authorize production banking activation.

## Platform requirements to confirm with the selected database vendor
Document the actual selected provider's capabilities for:
- automated backups;
- point-in-time recovery (PITR);
- backup encryption at rest/in transit;
- regional availability;
- restore to a new isolated database/branch/cluster;
- retention period;
- backup deletion/retention controls;
- administrator access logging;
- customer-managed vs provider-managed keys, if applicable;
- documented restore procedure;
- service-level commitments.

Do not invent RPO/RTO promises until they are supported by the actual database/provider arrangement.

## Sandbox backup test
For an approved provider-sandbox environment:

1. Record exact Git SHA and applied migration checksums.
2. Record non-secret database environment identifier.
3. Insert/obtain known test evidence:
   - one processed provider event;
   - one balanced journal;
   - one provider resource mapping;
   - one reconciliation;
   - one audit event;
   - one consumed operator request ID.
4. Record IDs only; do not export secrets.
5. Initiate the selected vendor's supported snapshot/PITR backup operation.
6. Restore into a **new isolated test database**, never over the active sandbox database for the first validation.
7. Apply no schema-changing shortcut to make the restore pass.
8. Validate data integrity using the checks below.
9. Destroy the temporary restore environment according to vendor policy after evidence is captured, unless it is retained for approved testing.

## Restore validation checks
After restoring, verify:

### Schema/migrations
- migration table exists;
- all expected migration versions exist;
- stored checksums match repository migrations;
- journal-balance trigger exists;
- append-only triggers exist;
- processing-lease constraints exist;
- operator replay table exists.

### Provider events
- known event IDs are present;
- `provider + environment + raw_provider_event_id` uniqueness remains enforced;
- processed/failed/lease/attempt metadata is preserved;
- no duplicate event appears after restore.

### Ledger
- known journal ID exists;
- expected journal line count exists;
- debit total equals credit total;
- event-to-journal uniqueness is intact;
- UPDATE/DELETE against append-only journal/line data remains blocked by the database guard.

### Resource mappings
- known Galactic account/transfer maps to the same provider sandbox resource ID as before backup.

### Reconciliation
- known reconciliation record exists;
- matched/discrepancy state is preserved;
- resolution metadata, if any, is preserved.

### Audit
- known audit record exists;
- audit UPDATE/DELETE remains blocked by the append-only guard.

### Operator replay protection
- previously consumed request ID still exists during the intended retention period;
- exact replay remains rejected after restoration;
- new request ID can be accepted when otherwise authorized.

## Post-restore smoke test
Against the isolated restored environment:

1. Run read-only operations snapshot.
2. Confirm queue counts are intelligible.
3. Run a synthetic/non-production reconciliation test appropriate to that environment.
4. Do not enable production live writes.
5. If provider sandbox networking is connected to the restored environment, use a deliberately isolated provider test configuration and do not accidentally point two active environments at the same webhook destination without a plan.

## Recovery consistency concerns
A point-in-time restore can create divergence between provider state and Galactic's restored state. After any meaningful restore:

- assume reconciliation is required;
- compare provider event history against the restored event inbox;
- compare provider balances against Galactic ledger balances;
- identify provider events that occurred after the restored database timestamp;
- ingest/replay them only through the signed/idempotent provider event path;
- do not manually recreate financial journals from memory.

## RPO/RTO policy placeholder
Before production, assign and approve:
- RPO (maximum acceptable data-loss window);
- RTO (maximum acceptable recovery time);
- backup retention;
- restore test frequency;
- responsible owner/on-call role;
- provider escalation contact;
- sponsor-bank notification requirement where applicable.

These values must be based on the real regulated program and infrastructure, not aspirational marketing targets.

## Recovery evidence
Record non-secret evidence:
- restore test date/time;
- exact commit SHA;
- source backup/PITR identifier;
- restored test database identifier;
- migration checksums;
- integrity check results;
- pre/post known record identifiers;
- ledger debit/credit totals;
- reconciliation result;
- operator replay test result;
- issues found and remediation commit/issue IDs.

## Failure conditions
The restore test fails if:
- migration history is missing/inconsistent;
- a journal becomes unbalanced;
- append-only protection is missing;
- provider-event uniqueness is lost;
- resource mapping changes unexpectedly;
- reconciliation/audit history is absent;
- consumed operator request IDs can be reused inside the required replay-retention window;
- unexplained provider-vs-ledger mismatch remains.

Do not certify the sandbox/production storage design until failures are explained and corrected.
