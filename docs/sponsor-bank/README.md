# Galactic Trust — Sponsor-Bank Ready Packet

This directory is the working diligence and public-beta launch packet for Galactic Trust.

## Documents

### `24-HOUR-LAUNCH-PLAN.md`
Hour-by-hour plan to launch Galactic Trust as a transparent public fintech demo/beta while all real-money capabilities remain disabled.

### `PUBLIC-BETA-LAUNCH-CHECKLIST.md`
Hard launch gate for product truthfulness, live-money lock, security, technical validation, demo flows and operations.

### `PARTNER-PACKET.md`
Executive diligence packet explaining the proposed product scope, operating boundaries, customer funds model, KYC/AML/fraud expectations, reconciliation, disputes, security and provider questions.

### `ARCHITECTURE.md`
Provider-neutral target architecture for authentication, money movement, signed webhooks, idempotency, ledger mirroring, reconciliation, customer-funds separation and environment isolation.

### `CONTROL-MATRIX.md`
Draft responsibility matrix separating Galactic Trust application responsibilities from sponsor-bank / regulated-provider responsibilities.

### `PROVIDER-SHORTLIST.md`
Current diligence shortlist and scorecard. Initial research order: Synctera, Treasury Prime, Unit, Increase. Verify commercial terms, program appetite, geography and legal/compliance responsibilities directly before selecting a provider.

### `SANDBOX-CERTIFICATION.md`
Engineering evidence and acceptance criteria for the zero-money synthetic certification loop and the later approved provider-sandbox certification. Covers signed webhook verification, duplicate-event handling, double-entry journal invariants, reconciliation, provider credential isolation, durable persistence requirements, and the limits of what sandbox evidence proves.

### `SANDBOX-ENVIRONMENT-CHECKLIST.md`
No-secret environment checklist for provider credentials, operator signing + allowlist, isolated Postgres, migrations, webhook configuration, recovery controls, and provider-vs-ledger reconciliation.

### `SANDBOX-OPERATIONS-RUNBOOK.md`
Repeatable operator procedure for certification, signed webhook evidence, replay testing, single-account and bounded all-account reconciliation, discrepancy handling, recovery, terminal-event review, ACH returns, and diligence evidence capture.

## Current launch posture
Galactic Trust may be considered for a **public demo/beta launch** only when the exact release commit passes all CI gates and the deployed product visibly keeps banking and crypto in demo mode.

The current engineering gates cover:
- TypeScript correctness;
- general product/secret safety;
- synthetic sandbox isolation;
- durable Postgres banking/accounting invariants;
- provider-event leases/recovery;
- operator allowlist/manual recovery controls;
- account-level provider-vs-ledger reconciliation;
- production build.

This packet does not authorize:
- accepting real customer deposits;
- transmitting customer money;
- issuing live cards;
- making loans;
- executing or custodying customer crypto;
- claiming a sponsor-bank, FDIC, Visa/Mastercard or other regulated relationship that has not actually been approved.

## Zero-money certification milestone
The app has a synthetic certification surface at `/sandbox-readiness` that exercises:

> synthetic customer -> sandbox KYC fixture -> synthetic account -> synthetic ACH -> signed webhook -> duplicate rejection -> balanced double-entry journal -> reconciliation -> reviewer-visible evidence.

The synthetic runner is deliberately prevented from:
- calling a provider network;
- reading provider credentials;
- storing real PII;
- moving real money.

## Durable provider-sandbox milestone
The provider-sandbox architecture now supports the technical control path:

> operator-signed certification -> provider sandbox customer -> provider sandbox KYC -> provider sandbox account -> provider sandbox ACH -> authentic provider-signed webhook -> durable event inbox -> leased/idempotent processing -> balanced journal -> event reconciliation -> provider-vs-ledger account reconciliation -> recovery/terminal review -> audit evidence.

Provider-sandbox controls include:
- separate `BANKING_SANDBOX_*` credentials and enable gates;
- isolated sandbox Postgres;
- versioned checksum-protected migrations;
- database-level balanced-journal and append-only enforcement;
- exact-body signed webhook validation with replay window;
- five-attempt processing limit;
- stale lease recovery and `SKIP LOCKED` worker concurrency;
- operator HMAC + explicit operator-ID allowlist;
- audited terminal-event requeue;
- audited reconciliation resolution;
- single-account reconciliation and a bounded 100-account sequential sweep;
- a signed operator CLI that never prints the signing secret.

No provider/database/operator secret values are stored in this packet or repository.

## Remaining real provider-sandbox inputs
The engineering path is prepared, but actual provider-sandbox execution still requires configuration outside Git/chat:
- selected provider/private-gateway sandbox access;
- isolated provider credentials;
- isolated Postgres sandbox database;
- webhook signing secret;
- operator signing secret + allowlisted operator ID;
- sandbox deployment URL;
- Vercel/GitHub deployment secrets if the preview workflow is used.

## Production remains separate
A green synthetic test or provider sandbox does not authorize production.

Production remains blocked until the selected bank/provider, contractual, legal/compliance, KYC/CIP/OFAC/AML/fraud, disclosure, security, certification, and counsel-review gates are complete, followed by the separate production activation controls.
