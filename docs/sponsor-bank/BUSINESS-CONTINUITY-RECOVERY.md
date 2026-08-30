# Galactic Trust — Business Continuity & Recovery Plan

**Status:** pre-production engineering draft. Final RTO/RPO commitments, sponsor-bank dependencies, disaster-recovery regions, backup schedules, customer communications, and contractual SLAs must be approved against the actual production stack.

## 1. Continuity principles
- Financial correctness outranks availability.
- If provider and Galactic state cannot be reconciled, fail closed rather than guess.
- Historical ledger/audit/evidence records are append-only.
- Recovery must not bypass idempotency, webhook verification, event leases, or reconciliation.
- Sandbox/production infrastructure and credentials stay separated.

## 2. Critical service tiers

### Tier 0 — Safety controls
Must remain enforceable even during degraded operations:
- production live-write gates;
- provider credential isolation;
- webhook signature verification;
- event dedupe;
- ledger balance constraints;
- append-only protections.

### Tier 1 — Financial-state processing
- provider event inbox;
- ACH posted/return processing;
- journal posting;
- reconciliation;
- audit trail.

### Tier 2 — Customer interface
- dashboard;
- transaction/history display;
- support/status disclosures.

### Tier 3 — Nonessential product surfaces
- rewards previews;
- cosmetic insights;
- optional marketing/educational components.

During incidents, Tier 3 may be disabled before weakening any Tier 0/1 control.

## 3. Dependency map
Primary external dependencies likely include:
- deployment/hosting provider;
- DNS/domain provider;
- GitHub/source-control/CI;
- sponsor-bank/BaaS/private gateway;
- Postgres provider;
- identity/KYC provider (future);
- email/SMS/support vendor (future);
- secrets manager/KMS (future production requirement).

Every production dependency needs:
- owner;
- support/escalation path;
- status page/contact method;
- recovery assumptions;
- data/export capability;
- exit/portability plan.

## 4. Data durability classes

### Class A — Must not be lost
- canonical provider event records;
- posted journals/lines;
- reconciliation history;
- audit history;
- certification evidence history where retained as diligence evidence;
- provider resource mappings needed to reconstruct customer financial state.

### Class B — Rebuildable from authoritative source
- derived dashboard summaries;
- cached provider balances;
- aggregate operational metrics.

### Class C — Disposable
- synthetic zero-money certification objects;
- ephemeral UI state;
- temporary build artifacts.

## 5. Backup requirements before production
Production-grade storage must document and test:
- automated encrypted backups;
- backup retention period;
- point-in-time recovery capability where supported;
- separate backup failure alerting;
- restoration into an isolated recovery environment;
- integrity checks after restoration;
- provider-vs-ledger reconciliation after restoration;
- credential/key recovery procedure without storing secrets in runbooks.

Backups are not considered proven until a restore exercise succeeds.

## 6. Restore procedure
1. Declare incident/recovery owner.
2. Freeze affected financial write paths.
3. Identify recovery point and source backup.
4. Restore into isolated environment first.
5. Apply only checksum-verified migrations required for that recovery point.
6. Verify database append-only/balance constraints.
7. Validate provider event uniqueness and event-to-journal uniqueness.
8. Validate debit/credit balance across journals.
9. Compare restored provider mappings to provider records.
10. Run account/program reconciliation.
11. Quantify any data gap between provider events and restored inbox.
12. Obtain missing events through approved provider replay/export mechanisms.
13. Process through normal signed/deduplicated pipeline.
14. Reconcile again.
15. Only then consider service restoration.

Do not manually insert/edit journal history to “catch up.”

## 7. Provider outage strategy
If sponsor-bank/BaaS/private gateway is unavailable:
- stop initiating affected provider writes;
- continue serving safe read-only/demo surfaces where trustworthy;
- retain already-captured provider events durably;
- do not fabricate transaction success;
- mark customer-facing state according to actual provider/program semantics;
- recover/replay through approved provider mechanism after service returns;
- reconcile before clearing incident.

## 8. Database outage strategy
If durable database is unavailable:
- do not process financial webhook state in memory as a substitute;
- return an error so provider retry policy can operate;
- keep event processing fail-closed;
- alert operations;
- restore database/reconnect;
- process provider retries through normal dedupe pipeline;
- reconcile after recovery.

## 9. Deployment failure / rollback
For application deployment problems:
- identify exact failing SHA;
- preserve database schema compatibility;
- prefer application rollback that can safely read current schema;
- never roll back database by deleting already-applied migration history;
- new schema corrections use a new numbered migration;
- rerun CI/safety gates on rollback/fix SHA;
- verify demo/live configuration after deploy.

## 10. Processing backlog recovery
Provider event recovery is bounded:
- processing lease: 2 minutes;
- automatic attempts: 5 maximum;
- exponential backoff;
- fixed recovery batch: 10 events;
- concurrent recovery uses `SKIP LOCKED`.

Operations should monitor:
- received count;
- processing count;
- stale processing count;
- retryable failures;
- terminal failures;
- open reconciliation discrepancies.

Terminal events require manual signed/allowlisted review and audited reason before requeue.

## 11. Reconciliation as recovery exit gate
A service is not financially recovered merely because HTTP endpoints respond.

For affected scopes, require:
- provider event backlog understood;
- all expected posted/returned events processed;
- balanced journals;
- provider-vs-ledger account reconciliation;
- program-level reconciliation when implemented/required;
- no unexplained material discrepancy;
- terminal events dispositioned.

## 12. Evidence after recovery
For sandbox/provider certification and future auditability, preserve:
- incident/recovery timeline;
- release SHA(s);
- migration checksums;
- backup/recovery point;
- processed/replayed event counts;
- journal/reconciliation IDs;
- terminal recovery actions;
- post-recovery evidence bundle digest.

Do not include secrets/raw PII in continuity evidence packages.

## 13. Key-person / access continuity
Before production:
- at least two authorized administrators for critical vendor accounts;
- MFA on source control, hosting, database, provider, DNS, and secrets systems;
- documented emergency access procedure;
- no shared personal credentials;
- operator/admin identities individually attributable;
- access removal process for departing personnel/vendors.

## 14. Required exercises before production
- restore latest backup to isolated environment;
- point-in-time recovery exercise if supported;
- provider outage tabletop;
- database outage during webhook delivery;
- deployment rollback with current schema;
- stale worker + recovery queue;
- terminal event review/requeue;
- ACH return after restoration;
- reconciliation mismatch after restoration;
- lost/rotated operator or webhook secret;
- evidence bundle regeneration after recovery.

## 15. Production metrics to define with partner
Before launch, agree on realistic/contractual:
- recovery time objective (RTO);
- recovery point objective (RPO);
- webhook retry window;
- provider data export/replay window;
- transaction posting expectations;
- support/escalation SLA;
- incident notification timing;
- backup retention;
- reconciliation frequency/tolerance.

Do not publish numerical commitments until the actual infrastructure/provider program supports them.
