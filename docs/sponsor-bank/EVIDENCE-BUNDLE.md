# Galactic Trust — Tamper-Evident Sandbox Evidence Bundle

## Purpose
After a provider-sandbox certification run, Galactic Trust can create an append-only evidence snapshot for internal review and sponsor-bank/BaaS diligence.

The bundle is designed to answer:
- what code/release was being evaluated;
- which database migrations were applied;
- which Galactic sandbox resources existed;
- whether provider events were processed/retried/returned;
- whether journals balanced;
- whether event/account reconciliations matched;
- whether queue or reconciliation problems were open at export time;
- whether the exported JSON has changed after generation.

It is **engineering evidence, not legal approval, bank certification, regulatory approval, or production authorization**.

## Evidence-signing configuration
Configure these values only in the approved server-side sandbox environment:

- `BANKING_SANDBOX_EVIDENCE_SECRET`
- `BANKING_SANDBOX_EVIDENCE_KEY_ID`

Rules:
- evidence secret must be at least 32 characters;
- evidence secret must be different from the provider API key, provider webhook secret, and operator signing secret;
- evidence key ID is a non-secret label identifying the internal signing key;
- never commit/paste the evidence secret into Git, chat, screenshots, or diligence documents.

## Export endpoint
Operator-only endpoint:

`POST /api/banking/provider-sandbox/evidence`

The signed operator request body accepts exactly:

```json
{"certificationRunId":"<provider-sandbox-run-uuid>"}
```

The server reconstructs evidence from durable records rather than trusting caller-supplied balances, journals, statuses, or provider identifiers.

## What the manifest includes
The version-1 manifest includes:
- schema version;
- environment (`provider_sandbox`);
- Galactic repository identifier;
- exact release SHA when supplied by the deployment environment;
- certification run ID;
- provider name;
- generation timestamp;
- applied migration names + SHA-256 checksums;
- Galactic customer/account/transfer resource IDs;
- **SHA-256 hashes of provider resource identifiers** rather than raw provider identifiers;
- **SHA-256 hashes of provider event identifiers** rather than raw provider event identifiers;
- event type/status/attempt count/failure state;
- journal IDs + debit/credit totals + balance result;
- transfer-event and account-balance reconciliation records;
- audit action counts, not raw audit payloads;
- operational queue counts;
- open reconciliation count.

The manifest explicitly asserts:
- no secrets;
- no raw provider resource IDs;
- no raw webhook bodies;
- no customer PII;
- no production-live-money authorization.

## Integrity model
Galactic creates two integrity values over deterministic canonical JSON.

### SHA-256 manifest digest
`manifestSha256`

Anyone who has the exported manifest can independently canonicalize it using the documented deterministic JSON rule and recompute the SHA-256 digest.

This detects modification but does not prove who created the manifest.

### HMAC-SHA256 internal signature
`hmacSha256`

The canonical manifest is also signed using the separate server-side evidence secret.

The bundle labels this accurately as:

`verificationScope: galactic_internal_hmac`

This is **not** represented as a third-party notarization, bank signature, regulatory signature, or public-key attestation.

## Stored verification
Operator-only endpoint:

`POST /api/banking/provider-sandbox/evidence/verify`

Request body accepts exactly:

```json
{"bundleId":"evidence-<uuid>"}
```

The server loads the append-only stored manifest and verifies:
- stored key ID matches the currently configured internal evidence key ID;
- canonical manifest SHA-256 matches the stored digest;
- canonical manifest HMAC-SHA256 matches the stored signature.

A key rotation requires retaining/verifying the corresponding historical key in an approved key-management process. The current implementation intentionally fails closed on key-ID mismatch rather than pretending an old bundle verified with a new key.

## Durable storage
Migration `004_banking_certification_evidence.sql` creates append-only storage for:
- bundle ID;
- certification run ID;
- provider;
- evidence key ID;
- generated timestamp;
- manifest JSON;
- SHA-256 digest;
- HMAC signature.

The evidence table uses the same database append-only mutation guard as ledger/audit evidence. Corrections require a new evidence bundle; existing bundles are not edited.

Evidence generation also appends an audit event containing:
- bundle ID;
- certification run ID;
- manifest SHA-256;
- non-secret evidence key ID.

## Privacy / secret boundary
The evidence generator may read durable sandbox database records needed to reconstruct proof, but its exported manifest intentionally excludes:
- provider API keys;
- provider webhook secrets;
- operator signing secrets;
- evidence signing secret;
- database URL;
- raw webhook request bodies;
- raw provider resource IDs;
- raw provider event IDs;
- customer identity/KYC documents;
- passwords, PINs, CVVs, one-time codes, or recovery codes.

Raw provider IDs are hashed with SHA-256 before export. This gives stable correlation evidence without disclosing the underlying identifier.

## Recommended certification sequence
Generate the final evidence bundle only after testing:

1. provider-sandbox customer creation;
2. approved sandbox KYC fixture;
3. open sandbox checking account;
4. fixed $25 inbound ACH;
5. authentic signed webhook;
6. duplicate webhook replay;
7. balanced posted journal;
8. provider-vs-ledger account reconciliation;
9. ACH-return event and compensating journal;
10. failed/retry event path if available;
11. terminal/manual requeue path if deliberately exercised;
12. all expected reconciliation discrepancies resolved or clearly documented.

A bundle can also be generated earlier as an intermediate snapshot; every snapshot receives a new append-only bundle ID.

## CI regression protection
`.github/workflows/banking-evidence-safety.yml` runs a dedicated evidence integrity test on PRs/main.

It fails if evidence protections lose:
- append-only storage;
- deterministic canonicalization;
- SHA-256 digest;
- HMAC signature;
- timing-safe verification;
- provider-ID hashing;
- explicit privacy assertions;
- operator-only export/verification;
- internal-only HMAC labeling.

## What this bundle does not authorize
A completely valid bundle does not authorize:
- production deposits;
- production ACH;
- card issuance;
- FDIC claims;
- money transmission;
- lending;
- crypto custody/trading;
- production KYC/CIP;
- production launch.

Production activation remains controlled by separate partner, compliance, disclosure, certification, and explicit live-write approvals.
