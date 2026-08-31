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
- **Do not use a customer/demo identity as a sandbox operator.**

Customer/demo authentication and provider-sandbox operator authentication are separate trust domains. A public beta user cannot become a sandbox operator merely by being signed in to Galactic Trust.

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
7. Confirm event-lease/retry migration is applied before enabling provider webhook processing.

## Operator endpoints
These endpoints require the signed operator request scheme and are not public-beta controls:

- provider certification launch: `/api/banking/provider-sandbox/certification`
- failed/stale event recovery: `/api/banking/provider-sandbox/recovery`
- terminal failed-event requeue: `/api/banking/provider-sandbox/events/requeue`
- operations snapshot: `/api/banking/provider-sandbox/operations`
- provider-vs-ledger account reconciliation: `/api/banking/provider-sandbox/reconcile-account`
- open reconciliations: `/api/banking/provider-sandbox/reconciliations`
- reconciliation resolution: `/api/banking/provider-sandbox/reconciliations/resolve`

Do not expose the operator signing secret in browser/client JavaScript.

### Account reconciliation rule
Account reconciliation is read/compare/record only:
- resolve the Galactic sandbox account to its provider resource mapping;
- fetch the provider sandbox current/available balance;
- reconstruct the internal account balance only from **processed** provider events and `customer_deposit_liability` ledger lines;
- record a matched/discrepancy reconciliation plus audit evidence;
- never edit posted journal lines to force a match.

If a discrepancy exists, investigate and resolve the reconciliation record with a signed operator note. Any monetary correction must be represented by a new legitimate provider event and/or compensating journal according to the approved accounting policy—not by editing historical ledger entries.

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

## Event recovery rules
- automatic processing attempts are bounded;
- processing leases expire and may be reclaimed after the configured stale threshold;
- concurrent recovery workers use database row locking / `SKIP LOCKED` semantics;
- terminal events remain stopped after automatic attempts are exhausted;
- only a signed, allowlisted operator may manually requeue a terminal event;
- manual requeue requires an explanatory reason and creates audit evidence;
- manual requeue never edits ledger history.

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
- processing attempt count / lease recovery evidence where exercised;
- ledger journal ID;
- transfer-event reconciliation ID/status;
- account-balance reconciliation ID/status;
- provider vs internal balance discrepancy in cents;
- audit-event identifiers;
- ACH-return reversal evidence;
- terminal-event manual requeue evidence if exercised.

## Exit criterion
Sandbox environment configuration is acceptable only when:

- `/sandbox-readiness` shows the expected safe readiness booleans;
- production live writes are false;
- provider sandbox credentials are isolated;
- operator signing + allowlist are configured;
- durable sandbox database is enabled and migrated;
- CI is green on the exact commit being certified;
- no secret values appear in repository content or customer-facing pages;
- provider webhook replay/dedupe behavior is proven;
- account-level provider-vs-ledger reconciliation is proven;
- ACH-return accounting is proven;
- terminal failures have an audited human-review/requeue path.

This checklist is an engineering control document, not bank approval or legal advice.
