# Galactic Trust — Sponsor-Bank Ready Packet

This directory is the working diligence and 24-hour public-beta launch packet for Galactic Trust.

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

## Current launch posture
Galactic Trust may be considered for a **public demo/beta launch** only when the exact release commit passes typecheck, safety checks and production build, and the deployment visibly keeps banking and crypto in demo mode.

This packet does not authorize:
- accepting real customer deposits;
- transmitting customer money;
- issuing live cards;
- making loans;
- executing or custodying customer crypto;
- claiming a sponsor-bank, FDIC, Visa/Mastercard or other regulated relationship that has not actually been approved.

## Real-money milestone
The next regulated milestone is not a public production launch. It is a provider sandbox proof:

> sandbox customer -> approved sandbox KYC -> sandbox account -> simulated ACH -> signed webhook -> idempotent event handling -> reconciliation -> customer-visible state -> audit evidence.

Production remains blocked until the selected bank/provider, contractual, compliance, disclosure, certification and counsel-review gates are complete.
