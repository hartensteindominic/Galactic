# Business Continuity and Disaster Recovery Plan

## Scope

This plan covers the white-label fintech application, simulated ledger, future regulated banking integrations, operational tooling, and the supporting cloud services used to run them.

This is a preparedness plan, not a claim that Galactic currently operates a live banking program or has completed a regulated disaster-recovery certification.

## Principles

1. Protect customer funds and ledger integrity before availability.
2. Fail closed for money movement when system state is uncertain.
3. Preserve immutable financial history.
4. Never fabricate a successful transaction during an outage.
5. Restore from evidence, not assumptions.
6. Reconcile internal account state, double-entry state, and provider state after recovery.
7. Keep security and protective controls available where safe even when transactional functionality is disabled.

## Critical services

| Service | Current role | Failure behavior | Recovery dependency |
| --- | --- | --- | --- |
| Vercel / application runtime | Serves UI and APIs | Application unavailable; no successful write may be assumed | Healthy deployment/runtime |
| Supabase prototype database | Persistent simulated accounts, ledger, journals, events | Persistent prototype operations unavailable | Database recovery and reconciliation |
| Banking partner gateway | Future regulated account/card/payment operations | Money movement must fail closed | Partner recovery/status confirmation |
| Plaid Sandbox | Prototype external account-link testing | Linking unavailable; no effect on live funds | Plaid Sandbox recovery |
| DNS/CDN | Routing and TLS path | User experience unavailable or degraded | Provider recovery / DNS failover plan |
| Identity/authentication | Future operator/customer access | Protected operations unavailable | Identity-provider recovery |
| Monitoring/alerting | Detection and evidence | Reduced incident visibility | Secondary alert/evidence path |

## Current prototype posture

- Production banking money movement is disabled.
- The prototype ledger rejects non-simulated accounts.
- Reconciliation checks both transaction-history/account balances and double-entry/account balances.
- Financial journals are append-only.
- The partner banking shell has a fail-closed emergency freeze that defaults to active.

These controls reduce the risk of accidentally treating the prototype as a live bank, but they do not replace a production continuity program.

## Target recovery classes

The following are planning targets to validate with the eventual banking partner and infrastructure vendors. They are not current SLA claims.

### Class A — money movement safety

- Safety objective: stop unsafe new money movement immediately when system state is uncertain.
- Recovery method: freeze first, investigate, then reconcile before reopening.
- RPO target: no unaccounted financial event. Provider records, immutable journals, and reconciliation evidence must be sufficient to reconstruct state.

### Class B — ledger and reconciliation

- Recovery objective: restore an authoritative, internally consistent ledger and prove alignment to provider statements/events before resuming money movement.
- Recovery method: database recovery/PITR where available, schema verification, then account/GL/provider reconciliation.

### Class C — customer reads and support

- Recovery objective: restore read-only customer access and support visibility as soon as doing so is safe and accurate.
- During uncertainty, prefer an explicit maintenance state over stale or misleading financial data.

## Outage scenarios

### Application runtime outage

1. Confirm no write endpoint is reporting false success.
2. If money movement could still reach a provider through another path, activate the partner/program freeze.
3. Restore the last known-good application artifact.
4. Run smoke checks on authentication, read-only account data, write blocking, and status endpoints.
5. Reconcile any events that arrived during the application outage.

### Database outage

1. Freeze money movement if the database is required to safely determine idempotency or ledger state.
2. Do not fall back to a non-persistent in-memory ledger for real funds.
3. Recover the database using the approved vendor recovery mechanism.
4. Verify schema migration level.
5. Run transaction-history and double-entry reconciliation.
6. Compare against provider state before reopening writes.

### Provider outage

1. Mark provider operations degraded.
2. Reject new writes that cannot be safely accepted.
3. Continue receiving/verifying provider events if the callback path is healthy and approved.
4. Track in-flight instructions by idempotency/provider reference.
5. Reconcile after provider recovery before treating ambiguous items as final.

### Credential compromise

1. Activate the emergency money-movement freeze.
2. Disable/rotate affected credentials through the provider-approved process.
3. Preserve audit evidence.
4. Review all activity since the earliest plausible compromise time.
5. Reconcile provider state and internal state.
6. Re-enable only after security ownership approves the recovery.

### Bad deployment or migration

1. Freeze money movement if ledger/write correctness is uncertain.
2. Roll back the application artifact if safe.
3. Do not blindly roll back immutable financial data.
4. Follow `MIGRATION_ROLLBACK_LEDGER_RECOVERY.md`.
5. Reconcile before reopening writes.

## Backup and restore requirements before live launch

- Automated encrypted backups appropriate to the approved data classification.
- Point-in-time recovery where supported for the authoritative database.
- Documented retention schedule approved by legal/compliance/security stakeholders.
- Restore tests into an isolated environment.
- Evidence that restored data can pass ledger and provider reconciliation.
- Backup access protected by least privilege and phishing-resistant MFA for operators.
- No secrets embedded in backup documentation or source control.

## Regional/provider concentration

Before production, document all single points of failure, including hosting, database, DNS, identity, banking provider, notification provider, and observability provider.

A second region or vendor is not automatically safer. Failover must not create split-brain ledger state or duplicate money movement. Any multi-region write design requires explicit financial-consistency controls.

## Communications

For a material incident, maintain:

- Incident commander.
- Engineering owner.
- Security owner.
- Compliance/legal contact as required by the approved program.
- Banking/provider escalation contact.
- Customer/support communications owner.
- Internal timeline with UTC timestamps.

Do not speculate publicly about financial impact before the ledger/provider state is established.

## Required exercises

Before a live program can be called operationally ready, perform and retain evidence for:

1. Application outage recovery.
2. Database restore into an isolated environment.
3. Emergency money-movement freeze drill.
4. Provider outage tabletop.
5. Credential-compromise tabletop.
6. Bad migration / ledger recovery drill.
7. Reconciliation after recovery.
8. Operator access / break-glass drill.

## Readiness rule

`disasterRecoveryExerciseVerified` must remain false until an actual exercise has been completed in an approved environment and reviewed. A written plan alone is not proof of recovery capability.
