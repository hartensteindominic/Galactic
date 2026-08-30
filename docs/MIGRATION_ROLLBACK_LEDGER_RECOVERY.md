# Migration Rollback and Ledger Recovery

## Goal

Protect financial history and restore a provably correct ledger when a schema migration, deployment, operator action, or infrastructure failure causes uncertainty.

For financial data, "rollback" does not mean deleting history until the database looks convenient again. The recovery objective is to preserve evidence, restore structural integrity, and reconcile to authoritative provider records.

## Current prototype facts

- Migrations `001` through `004` build the simulated tenant/account/transaction model, reconciliation evidence, transfer idempotency, and append-only double-entry journals.
- The prototype transfer path rejects non-simulated accounts.
- Journal records are append-only; corrections should use a reversing/correcting journal rather than rewriting historical entries.
- Migration `004` anchors current simulated balances with opening journals rather than pretending historical transactions were fully backfilled.

## Production rule: prefer forward recovery

For an immutable financial ledger, a normal application rollback may be safe while a destructive database down-migration may not be.

Use this order of preference:

1. Freeze money movement if correctness is uncertain.
2. Preserve the affected database and logs.
3. Roll back the application artifact if the old application remains schema-compatible.
4. Apply a forward corrective migration when possible.
5. Use reversing/correcting journals for financial corrections.
6. Use point-in-time database recovery only under an approved incident plan, then reconcile every event that may have occurred after the restore point.

## Never do this to recover a financial ledger

- Delete journal rows to make balances match.
- Update historical journal amounts in place.
- Reuse an idempotency key for a different financial instruction.
- Re-run a migration blindly because the first attempt was ambiguous.
- Restore a database and reopen money movement before reconciling provider-side activity that happened after the restore point.
- Switch real-money traffic to the prototype in-memory fallback.

## Migration preflight

Before a production ledger migration:

- Confirm emergency money-movement control works.
- Take/verify the approved database backup or restore point.
- Record current schema version and application commit.
- Run transaction-history/account reconciliation.
- Run GL/account reconciliation.
- Confirm provider reconciliation is within approved tolerance.
- Estimate lock duration and failure behavior.
- Identify whether the previous application version can safely run against the new schema.
- Define the exact abort condition.
- Assign migration owner and incident owner.

## If a migration fails before commit

If the database transaction fully rolls back:

1. Confirm the migration transaction was rolled back.
2. Confirm schema version did not partially advance.
3. Re-run reconciliation.
4. Investigate the failure before retrying.
5. Do not assume an error response proves no side effect unless the database/provider transaction semantics establish that.

## If a migration partially applies or outcome is ambiguous

1. Activate the emergency money-movement freeze.
2. Stop automated retries of the migration.
3. Capture schema metadata, logs, migration output, and current commit.
4. Run read-only checks to determine which DDL/data steps completed.
5. Preserve a recovery copy/snapshot.
6. Choose either a forward corrective migration or isolated restore based on evidence.
7. Run both ledger reconciliation layers.
8. For a future live provider, reconcile all provider events/statements for the incident window.
9. Reopen only after correctness is demonstrated.

## Migration 004 / double-entry specific recovery

If the double-entry migration or later GL change is suspect:

- Do not delete journals or lines.
- Verify that every journal sums to zero.
- Verify each simulated financial account maps to the intended customer GL account.
- Verify clearing entries are equal and opposite to customer entries for transfer journals.
- Compare `fintech_accounts.balance_cents` to the mapped GL balance.
- Compare account balance to transaction-history expected balance.
- Treat disagreement among these layers as an incident, not as a display bug.

If an opening journal was seeded incorrectly in a real future migration, fix it with an approved corrective/reversing journal or controlled forward migration; never rewrite posted history without an explicit partner/accounting-approved procedure.

## Point-in-time recovery

Point-in-time recovery can restore database state, but it can also erase knowledge of events that occurred after the restore point. Therefore:

1. Freeze money movement before restore where possible.
2. Record the restore timestamp precisely.
3. Restore into an isolated environment first when incident severity allows.
4. Validate schema and ledger invariants.
5. Enumerate all provider events/instructions from the restore time to the present.
6. Re-ingest or reconstruct only through idempotent, auditable procedures.
7. Reconcile account, GL, and provider balances before reopening.

## Application rollback compatibility

Every production migration should be classified as one of:

- **Backward compatible:** previous and new application versions can both run safely against the schema.
- **Forward-only:** old application cannot safely run after migration.
- **Destructive/high risk:** changes semantics or removes data and requires a special maintenance window and approved recovery path.

Prefer expand/migrate/contract patterns so application rollback remains possible without rolling back financial history.

## Recovery test matrix

Before live launch, exercise at least:

1. Migration fails before commit.
2. Migration applies but application deploy fails.
3. Duplicate migration invocation.
4. Schema upgraded while one old application instance remains.
5. GL reconciliation detects a mismatch.
6. Restore from backup/PITR into an isolated environment.
7. Provider event arrives during recovery.
8. Duplicate financial request is replayed after recovery.

For every drill, record whether idempotency and reconciliation still prevent double debit/credit.

## Evidence required

- Migration identifier.
- Source commit and deployed artifact.
- Database restore point/backup evidence.
- Pre-migration reconciliation output.
- Post-migration reconciliation output.
- Failure/recovery timestamps.
- Operator identities.
- Corrective migration or journal references.
- Provider reconciliation evidence for a future live program.

## Readiness rule

`migrationRecoveryExerciseVerified` must remain false until a disposable or approved non-production environment has actually exercised the recovery path, including reconciliation after the simulated failure.
