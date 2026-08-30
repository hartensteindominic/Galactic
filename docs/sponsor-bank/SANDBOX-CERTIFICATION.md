# Galactic Trust — Sandbox Certification Evidence

## Purpose
This document defines the engineering evidence Galactic Trust requires before a sponsor-bank/BaaS provider sandbox can be treated as technically certified.

There are now **two deliberately separate certification layers**:

1. **Synthetic zero-money certification** — runs locally inside Galactic Trust with no provider credentials, no network calls, no real PII, and no real funds.
2. **Provider-sandbox certification** — prepared for an approved/evaluation provider sandbox, but remains disabled until isolated provider credentials, operator signing, an isolated Postgres database, migrations, and the corresponding explicit enable gates are configured.

Neither layer authorizes production banking.

## Synthetic certification flow

1. Create an ephemeral synthetic Galactic customer identifier.
2. Mark a provider-fixture KYC result as `approved_sandbox`.
3. Create an ephemeral synthetic checking-account identifier.
4. Create a synthetic inbound ACH posting for $25.00.
5. Construct a canonical `ach.transfer.posted` event.
6. Sign the event with an ephemeral HMAC secret.
7. Verify the signature using a timing-safe comparison.
8. Ingest the event once.
9. Attempt to ingest the same event again and reject it as a duplicate.
10. Create a balanced double-entry journal:
    - debit `partner_settlement_cash`;
    - credit `customer_deposit_liability`.
11. Reconcile provider-posted amount, customer-liability amount, journal debits, journal credits, and canonical event count.
12. Produce a reviewer-visible pass/fail evidence object.

The interactive synthetic evidence surface remains `/sandbox-readiness`.

## Provider-sandbox architecture now implemented

### Isolated provider configuration
Provider sandbox networking uses its own variables:
- provider name;
- sandbox gateway URL;
- sandbox API key;
- sandbox program ID;
- sandbox webhook secret;
- dedicated sandbox-network enable flag.

The sandbox gateway/API key/program ID are compared against production values. Reuse blocks sandbox networking.

Provider-sandbox networking is also blocked whenever production banking live writes are enabled.

### Operator-only launch authentication
The real provider-sandbox certification launcher is **not** a public beta button.

`lib/sandbox-operator-auth.ts` requires a server-side operator signing secret and HMAC-authenticated requests bound to:
- operator ID;
- timestamp;
- HTTP method;
- request path;
- SHA-256 hash of the exact request body.

Signatures expire after five minutes.

The certification endpoint accepts no custom amount or KYC scenario. Its test is deliberately fixed.

### Fixed provider-sandbox certification scenario
`lib/provider-sandbox-certification-runner.ts` is designed to execute:

1. provider-sandbox customer creation;
2. provider-sandbox KYC `approve` test fixture;
3. open sandbox checking account;
4. inbound **$25.00** sandbox ACH;
5. durable provider-resource mappings;
6. append-only audit evidence;
7. wait for authentic provider-signed webhook processing.

All provider-side writes require idempotency keys.

### Private gateway adapter
`lib/gateway-banking-sandbox-adapter.ts` provides a stable Galactic Trust contract in front of whichever specific provider is selected.

The private gateway contract supports:
- sandbox customer creation;
- KYC fixture execution;
- deposit-account creation;
- ACH creation;
- idempotency headers;
- exact-body signed webhooks;
- canonical event normalization.

Provider-specific API differences should be translated behind this boundary rather than leaking into the Galactic UI or ledger domain.

### Signed webhook protection
`/api/banking/provider-sandbox/webhook`:
- accepts JSON only;
- enforces a 256 KB body limit;
- requires timestamp + signature headers;
- verifies HMAC-SHA256 over `timestamp.rawBody`;
- uses timing-safe signature comparison;
- rejects signatures outside a five-minute replay window;
- verifies header/body event-ID consistency;
- normalizes the event only **after** signature verification;
- sends the canonical event into durable event processing.

### Durable Postgres persistence
The provider sandbox uses a dedicated database gate and connection string. A configured URL alone is insufficient to activate it.

`lib/postgres-banking-store.ts` implements:
- atomic provider-event dedupe;
- provider-event conflict detection;
- event status transitions;
- append-once journal writes;
- provider-resource mappings;
- reconciliation records;
- reconciliation resolution;
- append-only audit writes;
- explicit `BEGIN / COMMIT / ROLLBACK` transaction boundaries;
- prior processed-event lookups for return validation.

### Versioned migrations
`npm run db:sandbox:migrate`:
- requires the dedicated sandbox-database enable flag;
- refuses to run when production live writes are requested;
- records SHA-256 checksums of applied migrations;
- refuses to silently change an already-applied migration;
- applies each new migration transactionally.

Current migrations define:
- provider event inbox;
- journals + journal lines;
- provider resource mappings;
- reconciliation history;
- audit history;
- deferred database-level balance validation;
- append-only ledger/journal/audit triggers.

### Database-level accounting integrity
The database independently rejects a journal at commit if:
- it has fewer than two lines; or
- total debits do not equal total credits.

Posted ledger journals, ledger lines, and audit events are append-only. Corrections must be expressed with new compensating records.

## ACH posted and return accounting

### Posted inbound ACH
Current high-level program journal:
- debit `partner_settlement_cash`;
- credit `customer_deposit_liability`.

### Returned inbound ACH
A return cannot be journaled unless Galactic Trust can locate a previous **processed** `ach.transfer.posted` event for the same provider transfer.

The return amount must match the prior posted amount.

Then Galactic posts a compensating journal:
- debit `customer_deposit_liability`;
- credit `partner_settlement_cash`.

Customer-specific negative-balance/restriction/collections behavior remains a separate provider/program policy requirement and must be defined before production.

## Durable event lifecycle

The current processing design is:

> signed provider webhook → canonical event → durable inbox dedupe → transactional processing → journal/reconciliation/audit → processed status

If processing fails after event capture:
- the event is marked `failed` when possible;
- a failure audit event is appended;
- the captured event remains available for recovery/retry;
- production funds are not involved.

## CI safety gates
CI now executes:

1. `npm run typecheck`
2. `npm run test:safety`
3. `npm run test:sandbox`
4. `npm run test:banking-core`
5. `npm run build`

The dedicated durable-banking test protects:
- SQL uniqueness and line constraints;
- database balance triggers;
- append-only triggers;
- transactional Postgres behavior;
- database enablement/isolation;
- migration checksums;
- provider-write idempotency;
- webhook verification order;
- replay-window enforcement;
- operator request signing;
- fixed $25 certification scenario;
- prior-posted-event validation for ACH returns;
- compensating return journals;
- public reviewer surfaces from displaying secret configuration.

## What is still intentionally NOT configured
The code does **not** contain:
- a real provider sandbox API key;
- a real provider sandbox webhook secret;
- a provider-sandbox operator secret;
- a provider-sandbox Postgres connection string;
- a selected/contracted sponsor bank;
- production banking approval.

Do not place those secrets in Git or ChatGPT messages.

## Remaining acceptance gates before executing a real provider sandbox test

Before running the operator-only provider-sandbox certification endpoint:

1. Select the provider/gateway implementation being evaluated.
2. Confirm its sandbox or evaluation access is authorized.
3. Configure isolated sandbox provider credentials server-side.
4. Configure a 32+ character sandbox operator signing secret server-side.
5. Provision an isolated Postgres sandbox database.
6. Set `BANKING_SANDBOX_DATABASE_ENABLED=true` only for that sandbox environment.
7. Run `npm run db:sandbox:migrate` against that isolated database.
8. Confirm `/sandbox-readiness` reports database + provider + operator gates correctly without displaying secrets.
9. Configure the provider/private gateway to send signed webhooks to the sandbox webhook endpoint.
10. Run the fixed operator-signed certification launch.
11. Confirm the $25 sandbox ACH produces the authentic signed webhook.
12. Replay the same webhook and prove no duplicate journal is created.
13. Trigger an ACH return scenario and prove the original posted event is required before reversal.
14. Compare provider sandbox records against Galactic event, ledger, reconciliation, and audit evidence.

## What this does not prove
Even a fully green provider sandbox does **not** prove or authorize:
- provider production approval;
- sponsor-bank production approval;
- KYC/CIP program sufficiency;
- OFAC/sanctions or AML program sufficiency;
- FDIC pass-through eligibility;
- ACH/NACHA production approval;
- card-network/issuer approval;
- consumer dispute/error-resolution compliance;
- production incident-response readiness;
- legal permission to offer regulated services.

## Production gate remains separate
Provider credentials, database credentials, a successful sandbox run, or a deployed website must never activate production money movement.

Galactic Trust production banking still requires all independent production controls:
- approved partner program configured;
- banking compliance approval explicitly recorded;
- customer banking disclosures approved;
- live writes explicitly enabled.

Until the actual regulated program is complete, production live writes stay disabled.
