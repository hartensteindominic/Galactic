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

## Current launch posture
Galactic Trust may be considered for a **public demo/beta launch** only when the exact release commit passes typecheck, general safety checks, dedicated sandbox safety checks, and production build, and the deployment visibly keeps banking and crypto in demo mode.

This packet does not authorize:
- accepting real customer deposits;
- transmitting customer money;
- issuing live cards;
- making loans;
- executing or custodying customer crypto;
- claiming a sponsor-bank, FDIC, Visa/Mastercard or other regulated relationship that has not actually been approved.

## Zero-money certification milestone
The app now has a synthetic certification surface at `/sandbox-readiness` that exercises:

> synthetic customer -> sandbox KYC fixture -> synthetic account -> synthetic ACH -> signed webhook -> duplicate rejection -> balanced double-entry journal -> reconciliation -> reviewer-visible evidence.

The synthetic runner is deliberately prevented from:
- calling a provider network;
- reading provider credentials;
- storing real PII;
- moving real money.

## Real provider-sandbox milestone
The next regulated engineering milestone is:

> authenticated sandbox user -> provider sandbox customer -> provider sandbox KYC -> provider sandbox account -> provider sandbox ACH -> authentic provider-signed webhook -> durable event inbox -> idempotent event handling -> balanced ledger journal -> provider/internal reconciliation -> audit evidence.

Provider-sandbox credentials must use the dedicated `BANKING_SANDBOX_*` configuration and remain isolated from production banking credentials. Provider-sandbox networking has its own explicit enable gate and is blocked whenever production live writes are enabled.

Production remains blocked until the selected bank/provider, contractual, compliance, disclosure, certification and counsel-review gates are complete.
