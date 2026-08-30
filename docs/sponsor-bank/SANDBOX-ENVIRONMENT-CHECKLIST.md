# Galactic Trust — Provider Sandbox Environment Checklist

This checklist names configuration keys only. **Do not place secret values in Git, pull-request comments, screenshots, support tickets, or ChatGPT messages.**

## Hard boundary
Provider-sandbox configuration is not production configuration.

A sandbox deployment must use its own:
- provider credentials;
- provider program identifier;
- webhook signing secret;
- operator signing secret;
- database;
- deployment environment.

Production banking live writes remain disabled throughout sandbox certification.

## Provider sandbox variables
Configure these as server-side environment secrets/variables in the approved sandbox deployment:

- `BANKING_SANDBOX_PROVIDER_NAME`
- `BANKING_SANDBOX_GATEWAY_BASE_URL`
- `BANKING_SANDBOX_API_KEY`
- `BANKING_SANDBOX_PROGRAM_ID`
- `BANKING_SANDBOX_WEBHOOK_SECRET`
- `BANKING_SANDBOX_PROVIDER_ENABLED`

The application blocks sandbox networking if the sandbox gateway, API key, or program ID is reused from the production banking configuration.

## Operator authentication
Configure:

- `BANKING_SANDBOX_OPERATOR_SECRET`
- `BANKING_SANDBOX_OPERATOR_IDS`

Requirements:
- operator secret must contain at least 32 characters;
- `BANKING_SANDBOX_OPERATOR_IDS` is a comma-separated allowlist of operator identifiers;
- the signing secret alone is insufficient;
- the operator ID is signed together with timestamp, HTTP method, request path, and exact request-body hash;
- signatures expire after five minutes;
- do not use a customer/demo identity as a sandbox operator.

## Durable sandbox database
Configure:

- `BANKING_SANDBOX_DATABASE_URL`
- `BANKING_SANDBOX_DATABASE_SSL`
- `BANKING_SANDBOX_DATABASE_POOL_MAX`
- `BANKING_SANDBOX_DATABASE_ENABLED`

Requirements:
- use a dedicated sandbox database/branch/cluster;
- do not reuse a production banking database URL;
- TLS certificate validation is enabled by default;
- database access requires the explicit sandbox-database enable flag;
- database access is blocked when production banking live writes are enabled.

## Migration gate
After the isolated sandbox database is provisioned:

1. Confirm production `BANKING_ENABLE_LIVE_WRITES` remains false.
2. Enable only the sandbox database gate in the sandbox environment.
3. Run `npm run db:sandbox:migrate` from an authorized environment.
4. Confirm migration checksums are recorded.
5. Never edit an already-applied migration. Add a new numbered migration instead.
6. Confirm the database-level deferred journal-balance trigger and append-only triggers exist.

## Operator endpoints
These endpoints require the signed operator request scheme and are not public-beta controls:

- provider certification launch: `/api/banking/provider-sandbox/certification`
- failed/stale event recovery: `/api/banking/provider-sandbox/recovery`
- operations snapshot: `/api/banking/provider-sandbox/operations`
- open reconciliations: `/api/banking/provider-sandbox/reconciliations`
- reconciliation resolution: `/api/banking/provider-sandbox/reconciliations/resolve`

Do not expose the operator signing secret in browser/client JavaScript.

## Provider webhook endpoint
The provider/private gateway sends sandbox events to:

- `/api/banking/provider-sandbox/webhook`

Webhook requirements:
- JSON body;
- exact raw-body HMAC-SHA256 verification;
- timestamp included in signed payload;
- five-minute replay window;
- provider event identifier consistency check;
- durable event dedupe before processing;
- processing lease required before journal activity.

## Production variables that stay off during certification
These remain false during the provider-sandbox phase:

- `BANKING_COMPLIANCE_APPROVED`
- `BANKING_DISCLOSURES_APPROVED`
- `BANKING_ENABLE_LIVE_WRITES`
- `CRYPTO_COMPLIANCE_APPROVED`
- `CRYPTO_DISCLOSURES_APPROVED`
- `CRYPTO_ENABLE_LIVE_TRADING`

Do not enable them merely because a sandbox test succeeds.

## External deployment configuration
The GitHub Vercel preview workflow currently expects repository Actions secrets named:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Configure those directly in GitHub/Vercel administration. Never commit or paste their values into chat.

## Evidence to capture after configuration
Capture identifiers/statuses only—never secrets:

- exact Git commit SHA;
- migration versions applied;
- provider sandbox name;
- certification run ID;
- Galactic resource IDs;
- provider sandbox resource IDs where permitted by the diligence process;
- webhook event ID;
- duplicate/replay result;
- ledger journal ID;
- reconciliation ID/status;
- audit-event identifiers;
- recovery attempt count if a failure path is exercised;
- ACH-return reversal evidence.

## Exit criterion
Sandbox environment configuration is acceptable only when:

- `/sandbox-readiness` shows the expected safe readiness booleans;
- production live writes are false;
- provider sandbox credentials are isolated;
- operator signing + allowlist are configured;
- durable sandbox database is enabled and migrated;
- CI is green on the exact commit being certified;
- no secret values appear in repository content or customer-facing pages.

This checklist is an engineering control document, not bank approval or legal advice.
