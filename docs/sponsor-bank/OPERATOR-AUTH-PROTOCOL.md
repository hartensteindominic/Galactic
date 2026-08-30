# Galactic Trust — Provider Sandbox Operator Authentication Protocol

## Scope
This protocol protects **provider-sandbox administrative actions only**. It is intentionally separate from customer/demo authentication and from any future production banking administrator model.

It does not authorize production money movement.

## Required server-side configuration
The sandbox deployment requires:
- `BANKING_SANDBOX_OPERATOR_SECRET`
- `BANKING_SANDBOX_OPERATOR_IDS`
- isolated provider-sandbox Postgres with migrations applied.

Secret values must not be placed in Git, screenshots, tickets, browser JavaScript, or ChatGPT messages.

## Request headers
Every operator request includes:

- `x-galactic-sandbox-operator`
- `x-galactic-sandbox-operator-request-id`
- `x-galactic-sandbox-operator-timestamp`
- `x-galactic-sandbox-operator-signature`

The request ID is a fresh one-time identifier generated for each call.

## Signed payload
The HMAC-SHA256 payload is:

```text
operatorId.requestId.timestamp.HTTP_METHOD.requestPath.sha256(rawBody)
```

The server reconstructs this exact payload from the received request.

The operator signing secret itself is never sent in the request.

## Verification order
The server performs controls in this order:

1. Require the signing secret and operator-ID allowlist to be configured.
2. Validate operator ID and one-time request ID formats.
3. Require timestamp and signature.
4. Reject timestamps outside the five-minute validity window.
5. Hash the exact raw request body with SHA-256.
6. Reconstruct the HMAC payload using operator ID + request ID + timestamp + method + path + body hash.
7. Verify HMAC-SHA256 with a timing-safe comparison.
8. Confirm the signed operator ID is explicitly allowlisted.
9. Atomically consume the one-time request ID in provider-sandbox Postgres.
10. Only after all previous controls succeed may the requested sandbox operation execute.

A request that fails any step is rejected.

## Durable replay prevention
Migration `004_operator_request_replay_protection.sql` creates a durable one-time request table keyed by `request_id`.

The table records only:
- request ID;
- environment;
- operator ID;
- request path;
- SHA-256 request-body hash;
- signed timestamp;
- receipt time;
- retention expiry.

It does **not** store:
- operator signing secret;
- HMAC signature;
- raw request body;
- provider API keys;
- banking credentials.

The insert is atomic:

```text
INSERT ... ON CONFLICT (request_id) DO NOTHING
```

If the request ID was already consumed, the action fails with `SANDBOX_OPERATOR_REQUEST_REPLAYED`.

This works across separate serverless processes because replay state is database-backed rather than process memory.

## Retention
Consumed request IDs are retained for 24 hours, which exceeds the five-minute signature validity window. A replay is therefore rejected during the validity window, while an older replay is independently rejected by timestamp expiry.

Retention/cleanup policy can be expanded later without weakening the one-time-use rule.

## CLI behavior
The repository operator CLI:

```sh
npm run sandbox:operator -- <command>
```

- requires an explicit local-client enable flag;
- requires an operator ID;
- reads the secret from environment only;
- generates a new UUID request ID every invocation;
- binds the request ID into the HMAC;
- requires HTTPS for remote sandbox URLs;
- refuses redirects;
- may print the non-secret request ID as evidence;
- never intentionally prints the operator signing secret.

## Customer separation
A customer/demo session is not an operator session.

Public Galactic Trust users cannot invoke provider-sandbox admin actions through the normal banking-user boundary. Operator endpoints use this separate signed protocol and explicit allowlist instead.

## Covered operations
The protocol currently protects:
- fixed provider-sandbox certification launch;
- event recovery;
- operations snapshot;
- terminal-event requeue;
- single-account reconciliation;
- bounded all-account reconciliation sweep;
- open reconciliation listing;
- reconciliation resolution.

## Audit behavior
Business/admin actions append banking audit evidence where appropriate. Replay-consumption records are a separate security control and do not replace action-specific audit records.

## Production boundary
This protocol is not a production privileged-access design. Before production, privileged-access requirements must be reviewed against the actual sponsor-bank/provider program, identity provider, role model, MFA requirements, security policies, and applicable legal/compliance obligations.
