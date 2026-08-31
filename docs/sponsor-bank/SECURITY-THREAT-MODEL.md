# Galactic Trust — Banking Security Threat Model

**Status:** engineering diligence draft for sponsor-bank/BaaS review. This is not a certification, penetration-test report, SOC report, or legal conclusion.

## 1. Scope
This threat model covers the Galactic Trust fintech interface and the provider-sandbox architecture currently implemented in PR #20.

In scope:
- public beta web application;
- customer/session boundary;
- provider-sandbox operator boundary;
- private provider gateway;
- provider webhooks;
- Postgres event inbox, ledger, reconciliation, audit, and evidence records;
- sandbox certification/recovery/reconciliation/evidence operations;
- deployment configuration and secrets.

Out of scope until a real program exists:
- sponsor-bank internal systems;
- card processor/card-network systems;
- production KYC/CIP vendor systems;
- production ACH operator/ODFI systems;
- production crypto custody/trading systems;
- production data warehouse/support tooling.

## 2. Security objectives
1. Demo/public users cannot activate regulated money movement.
2. Provider credentials alone cannot enable production banking.
3. Customer authentication cannot become provider-sandbox operator authorization.
4. A forged/replayed webhook cannot create duplicate money-state changes.
5. A duplicate valid webhook cannot create a second journal.
6. Every posted financial journal balances debits and credits.
7. Posted ledger/audit/evidence records cannot be silently edited.
8. A crashed worker cannot permanently strand an event or allow concurrent double-processing.
9. Reconciliation discrepancies remain visible until explicitly resolved.
10. Evidence exports do not expose secrets, PII, raw webhook bodies, or raw provider identifiers.

## 3. Trust boundaries

### Boundary A — Public browser → Galactic application
Untrusted inputs:
- forms;
- search/chat text;
- simulated transfer requests;
- card-preview actions;
- crypto-demo actions.

Controls:
- JSON/content-type checks on banking writes;
- same-origin checks;
- user/session boundary;
- amount/input validation;
- no client-side provider credentials;
- demo mode default;
- explicit customer-facing demo disclosures.

### Boundary B — Operator client → provider-sandbox admin endpoints
This is a separate administrative trust domain.

Controls:
- 32+ character server-side HMAC secret;
- explicit operator-ID allowlist;
- signed operator ID, timestamp, method, path, exact body hash;
- five-minute signature expiry;
- timing-safe signature comparison;
- fixed/bounded admin scenarios;
- no public/demo-user authentication fallback.

Residual risk:
- a captured valid operator request can potentially be replayed within the signature window unless/until durable request-nonce consumption is added. This is acceptable only for the isolated provider sandbox and must be closed before production operator controls are designed.

### Boundary C — Galactic → private provider sandbox gateway
Controls:
- server-only API key;
- program ID header;
- sandbox-only gateway and credentials;
- sandbox/production credential-isolation checks;
- explicit sandbox-network enable flag;
- production-live-write interlock;
- idempotency key on provider write operations;
- strict response normalization.

### Boundary D — Provider gateway → Galactic webhook
Controls:
- JSON-only endpoint;
- 256 KB body limit;
- HMAC-SHA256 over timestamp + exact raw body;
- five-minute timestamp replay window;
- timing-safe compare;
- event-ID consistency check;
- signature verification before event normalization;
- durable provider-event dedupe;
- processing lease before journal activity.

### Boundary E — Application → banking Postgres
Controls:
- dedicated sandbox database gate;
- TLS certificate validation by default;
- production-live-write interlock;
- explicit database transactions;
- unique provider event identity;
- one journal per canonical event;
- deferred database-level journal-balance trigger;
- append-only journal/line/audit/evidence triggers;
- migration checksums.

## 4. Asset inventory
High-value assets:
- provider API keys;
- provider webhook signing secret;
- operator signing secret;
- evidence signing secret;
- database credentials;
- future production customer PII/KYC data;
- canonical provider events;
- ledger journals/lines;
- reconciliation records;
- audit records;
- certification evidence bundles;
- deployment credentials/tokens.

Public/non-secret identifiers:
- provider display name where approved;
- non-secret evidence key ID;
- Galactic internal resource IDs where permitted;
- commit SHA;
- migration checksums.

## 5. Threats and controls

### T1. Accidental production activation
Threat: credentials/config are added and money movement becomes live unintentionally.

Controls:
- banking defaults to demo;
- production partner configuration is separate from sandbox;
- explicit compliance approval flag;
- explicit disclosure approval flag;
- explicit live-write flag;
- credentials alone are insufficient;
- sandbox networking is blocked when production live writes are enabled.

### T2. Browser steals provider secret
Threat: provider credential is bundled into client JS or surfaced in chat/UI.

Controls:
- provider keys referenced server-side only;
- safety regression tests forbid provider keys in banking/crypto/chat client components;
- reviewer status surfaces return booleans, not secret values.

### T3. Forged webhook
Threat: attacker posts a fabricated ACH event.

Controls:
- HMAC verification using server-side webhook secret;
- exact raw-body signature;
- timestamp window;
- event-ID consistency;
- unsupported event types rejected.

### T4. Duplicate webhook causes double credit
Threat: provider retries or attacker replays a valid event.

Controls:
- DB uniqueness on provider/environment/raw event ID;
- canonical conflict detection if an ID is reused with different data;
- unique event-to-journal mapping;
- append-once journal writes.

### T5. Concurrent workers double-process event
Threat: webhook and recovery worker process same event simultaneously.

Controls:
- processing state/token/timestamp;
- token-owned completion/failure;
- atomic event claim;
- `FOR UPDATE SKIP LOCKED` recovery selection;
- stale-lease threshold;
- bounded attempts.

### T6. Worker crashes after event receipt
Threat: event is captured but never completed.

Controls:
- durable inbox;
- finite processing lease;
- stale-claim recovery;
- exponential retry;
- terminal failure state;
- signed allowlisted manual requeue with reason/audit evidence.

### T7. Ledger manipulation
Threat: code defect or insider edits posted accounting history.

Controls:
- application journal validation;
- DB deferred balance validation at transaction commit;
- append-only journal and line triggers;
- corrections use new compensating journals;
- one journal per canonical event.

### T8. Fake ACH return
Threat: return event reduces customer liability without an original posted transfer.

Controls:
- requires prior **processed** posted event for same provider transfer;
- returned amount must match posted amount;
- compensating journal rather than mutation.

### T9. Reconciliation is manually forced to match
Threat: operator changes ledger rather than investigates discrepancy.

Controls:
- reconciliation resolution only updates reconciliation metadata;
- resolution note required;
- audit record required;
- reconciliation endpoints cannot post journal lines;
- account reconciliation amount comes from provider + processed Galactic ledger, not caller input.

### T10. Evidence bundle leaks provider/customer data
Threat: diligence export exposes secrets/PII/raw provider identifiers.

Controls:
- provider resource/event identifiers SHA-256 hashed before export;
- no raw webhook bodies;
- no KYC/customer PII;
- no provider/operator/evidence secrets;
- explicit manifest privacy assertions;
- evidence-specific CI gate.

### T11. Evidence bundle modified after export
Threat: reviewer receives a changed JSON file.

Controls:
- deterministic canonical JSON;
- independently recomputable SHA-256 manifest digest;
- separate internal HMAC-SHA256 signature;
- append-only stored evidence record;
- stored verification endpoint.

### T12. Operator secret compromise
Threat: attacker gains sandbox operator HMAC secret.

Controls:
- operator ID must also be allowlisted;
- bounded signature age;
- body/method/path-bound signature;
- admin endpoints accept narrow fixed fields/scenarios;
- sandbox only;
- audit events.

Required improvement before production admin design:
- durable request-nonce consumption;
- key rotation/runbook;
- stronger human identity/MFA/SSO/RBAC through an approved admin identity provider.

## 6. Abuse-case tests required in provider sandbox
- bad webhook signature;
- expired webhook timestamp;
- duplicate identical webhook;
- same event ID with altered payload;
- concurrent duplicate delivery;
- crash/stale lease recovery;
- five failed processing attempts;
- unauthorized manual requeue;
- non-allowlisted but correctly signed operator;
- ACH return without posted event;
- ACH return with wrong amount;
- account-balance mismatch;
- attempted reconciliation with caller-supplied balance;
- evidence export with unknown run ID;
- modified stored/exported evidence verification failure.

## 7. Production blockers
Before a production banking program, this threat model must be updated for:
- actual sponsor bank/provider contracts;
- production identity/KYC data flows;
- production admin SSO/MFA/RBAC;
- durable operator nonce/replay prevention;
- SIEM/logging/alerting;
- production secrets manager/KMS/HSM policy;
- database role separation;
- backup restore testing;
- incident escalation/contact tree;
- vulnerability scanning/penetration testing;
- vendor security assessments;
- customer support/dispute tooling;
- regulatory retention requirements.

## 8. Review cadence
Review this threat model:
- before first real provider-sandbox execution;
- after provider selection;
- before production certification;
- after any material architecture/security incident;
- at least annually after production launch.
