# Galactic Trust Security Policy

## Current scope
Galactic Trust is currently a financial-technology demo / pre-launch engineering project. Demo balances, cards, transfers, and crypto are simulated unless and until an approved regulated program is explicitly activated through separate production gates.

Security reports are welcome, but this repository and its public beta should **never** be used to send financial credentials, identity documents, or authentication secrets.

## Reporting a vulnerability
When a private vulnerability-reporting channel is available for this repository/project, use it instead of a public issue for security-sensitive details.

If a private channel is not available, do **not** publish working exploit details, credentials, private customer data, or secret values in a public issue. Use the project's established private owner/support contact channel and provide only enough non-sensitive information to identify the affected component until a secure exchange method is established.

Useful non-secret information includes:
- affected route/component;
- exact public Git commit SHA if known;
- high-level vulnerability category;
- impact description;
- minimal reproduction steps that do not expose secrets or customer data;
- browser/runtime/version information where relevant.

## Never send
Do not include:
- passwords;
- PINs;
- CVVs;
- one-time codes;
- recovery codes;
- seed phrases/private keys;
- provider API keys;
- webhook signing secrets;
- operator signing secrets;
- database passwords/URLs;
- Vercel/GitHub tokens;
- SSNs/government-ID images;
- full bank account/routing/card numbers;
- raw KYC documents.

If a secret is exposed, rotate/revoke it at the source rather than relying on deletion from a message or commit.

## High-priority categories
Please prioritize reports involving:
- authentication or authorization bypass;
- provider-sandbox operator HMAC/allowlist/replay controls;
- provider webhook signature verification/replay handling;
- secret leakage into client bundles/logs;
- event idempotency/deduplication failures;
- duplicate or unauthorized ledger posting;
- ledger balance/append-only bypass;
- production live-write gate bypass;
- customer/privacy data exposure;
- cross-site request/security-header bypass affecting banking actions;
- unsafe dependency/supply-chain behavior with practical impact.

## Safe research expectations
Do not:
- access data belonging to another person;
- attempt to obtain real financial credentials;
- move real funds;
- perform destructive denial-of-service testing;
- persist access after demonstrating the issue;
- social-engineer users or providers;
- test third-party providers/banks without their authorization;
- publish sensitive vulnerability details before a reasonable remediation process.

Use demo/synthetic flows wherever possible.

## Response posture
Security issues should be handled under `docs/sponsor-bank/INCIDENT-RESPONSE-RUNBOOK.md` when applicable:
- fail closed;
- contain before restoring convenience;
- rotate exposed secrets;
- preserve non-secret evidence;
- do not delete/alter ledger or audit history to hide an incident;
- add regression coverage where practical.

## Production boundary
A successful security review of this repository does not make Galactic Trust a bank, authorize money transmission, establish FDIC insurance, approve KYC/CIP/AML programs, or authorize production banking/crypto functionality.

Production security requirements must be reviewed against the actual sponsor-bank/provider program, contracts, privileged-access model, incident obligations, privacy requirements, and applicable law before live financial activity is enabled.
