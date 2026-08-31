# Network Retry and Ambiguous-Response Test Plan

## Why this exists

Financial idempotency is only trustworthy if it survives ambiguous network failures, not just clean duplicate button clicks.

A client may submit a transfer, lose the response after the server commits, and then retry because it cannot tell whether the first request succeeded. The retry must return the existing result and must not create a second debit or journal.

A future provider can also disappear after accepting an intent but before returning or delivering a terminal state. That state is not the same as a clean failure. The system must preserve one economic intent, expose uncertainty honestly, and reconcile to an authoritative result rather than creating a replacement transfer blindly.

This plan is for the simulation/persistent prototype first. It must be repeated against any future approved provider sandbox/certification environment using that provider's exact idempotency and status semantics.

## Safety boundary

- Use synthetic accounts and non-production environments.
- Do not introduce a hidden production fault-injection endpoint.
- Do not weaken webhook verification, origin checks, authentication, or idempotency requirements to make testing easier.
- Preserve the same idempotency key when retrying an ambiguous request.
- Never treat an unknown provider outcome as a confirmed failure merely because a timeout elapsed.
- Do not create a replacement economic intent until provider/internal reconciliation rules establish that doing so is safe.

## Current client protections

The route-scoped prototype network guard now adds two layers on top of database idempotency:

1. **In-flight intent deduplication:** identical transfer bodies submitted concurrently through the prototype page share one network request/result rather than receiving independent idempotency keys.
2. **Ambiguous retry-key reuse:** a network exception, HTTP 408/429, or server 5xx temporarily retains the original idempotency key for the same hashed transfer intent. A same-intent retry within the short in-memory TTL reuses that key.

The retry-key cache is memory-only and is cleared on route teardown. It is not stored in `localStorage` or `sessionStorage`.

These protections improve prototype behavior but do not replace the required database unique constraint, provider idempotency, authoritative status lookup, provider reconciliation, or mobile/network chaos testing.

For any future live/provider implementation, the retry/idempotency retention policy must be derived from the selected provider's documented idempotency window, status semantics, and Galactic's approved reconciliation/timeout policy. Do not invent a generic production TTL.

## Core scenarios

### 1. Clean duplicate replay

1. Submit one simulated transfer with a fixed idempotency key.
2. Receive a successful response.
3. Replay the exact request with the same key.
4. Verify one transaction, one debit, and one balanced double-entry journal.
5. Verify replay returns the existing result rather than creating a second effect.

### 2. Response lost after commit

Use a local/network proxy or test harness outside the production app to terminate the client connection after the request reaches the server but before the client receives the response.

1. Submit a transfer with fixed key `K`.
2. Force the response path to fail/close while allowing the server/database transaction to complete.
3. Client records outcome as unknown, not failed.
4. Replay the same transfer with key `K`.
5. Verify only one debit and one journal exist.
6. Verify reconciliation passes.

For a browser-path test, additionally verify that the prototype network guard reuses the same key when the first `fetch` fails ambiguously and the same transfer intent is resubmitted within the retry TTL.

### 3. Request lost before commit

1. Submit with fixed key `K`.
2. Drop the connection before the server/database receives or commits the request.
3. Retry with `K`.
4. Verify exactly one transfer is eventually recorded.

### 4. Concurrent identical requests

Run this in two ways.

**Browser path**

1. Fire two identical transfer intents concurrently through `/prototype`.
2. Verify the route network guard shares one in-flight request/result.
3. Verify one transaction, one debit, and one journal.

**Direct API/database path**

1. Bypass the browser guard and fire two requests concurrently with the same idempotency key and payload.
2. Verify the database unique constraint prevents two committed financial effects.
3. Record whether the losing request returns a clean replay response or a retriable conflict/error.
4. If the direct-concurrency user experience is not graceful, improve concurrency handling without weakening the unique constraint.

The database design protects against double debit through transactional rollback on unique failure. Graceful direct concurrent replay remains something to verify in a real persistent environment.

### 5. Same key, changed payload

1. Submit amount A with key `K`.
2. Retry with amount B or a different recipient using key `K`.
3. Verify the request is rejected and no second financial effect occurs.

### 6. Client double-tap

On iPhone/Safari and at least one other mobile browser:

1. Enable network throttling/high latency.
2. Double-tap the send action quickly.
3. Verify the UI disables the action while busy.
4. Verify the network guard shares the same in-flight request if duplicate submits still reach the request layer.
5. Verify only one financial intent is committed.
6. Verify the UI transitions to a clear pending/unknown state if the result is ambiguous.

### 7. App background/foreground

On iPhone:

1. Submit a synthetic transfer on a throttled network.
2. Background the app/browser before the response arrives.
3. Return to the app.
4. Ensure the UI does not assume success or failure without authoritative state.
5. Retry the same intent and verify the original key is reused when the first browser request ended ambiguously within the retry TTL.

### 8. Server timeout after database commit

Simulate a path where the database transaction commits but the application times out before serializing the response.

Expected result: retry with the same key resolves to the existing transaction and never double-debits.

### 9. Provider disappears after accepting intent

This scenario is for a future approved provider sandbox/certification environment, or a provider stub that accurately models the selected provider's documented semantics.

1. Create one internal payment/transfer intent with idempotency key `K`.
2. Submit it to the provider and capture the provider request/reference if one is returned.
3. Simulate the provider connection/API becoming unavailable after submission but before Galactic receives a terminal status.
4. Mark the customer-facing/internal state as **pending/unknown**, not failed and not succeeded.
5. Do not create a second economic intent or mint a new idempotency key merely because the provider is unavailable.
6. Exercise the approved status-recovery path: provider status lookup when available, verified webhook/event processing, statement/balance reconciliation, or other provider-certified authoritative evidence.
7. Verify that a later terminal success produces one economic effect and one internally reconciled event.
8. Verify that a later terminal failure produces no duplicate/replacement effect unless a separately authorized retry is created after the first intent is authoritatively closed.
9. Verify that an unresolved provider state appears in Operations as requiring attention and remains traceable by internal and provider references.
10. Record how long the intent remained unknown and which evidence resolved it.

Expected state discipline:

`created -> submitted -> pending/unknown -> reconciled terminal success|failure`

Do not model `provider timeout -> failed -> automatically submit new transfer` as a safe transition.

## Evidence to capture

For every scenario retain:

- Test date/time.
- Application commit SHA.
- Environment.
- Idempotency key hash/reference (do not log sensitive credentials).
- Provider reference/status where applicable.
- HTTP request/response status sequence.
- Unknown/pending duration where applicable.
- Authoritative evidence used to resolve an unknown provider state.
- Transaction count before/after.
- Account balance before/after.
- GL journal count before/after.
- Journal zero-sum result.
- Transaction-history reconciliation result.
- GL/account reconciliation result.
- Screenshot/video for mobile cases when useful.

## Pass criteria

A scenario passes only if:

- Customer balance changes at most once for one intended instruction.
- Exactly one economic event is represented for the idempotency key.
- GL remains balanced.
- Account, transaction-history, and GL reconciliation agree.
- Ambiguous network/provider state is not presented as definite success/failure without authoritative evidence.
- Reusing a key with changed financial intent is rejected.
- Provider disappearance does not cause an automatic replacement transfer.
- An unknown provider outcome remains traceable until reconciled to authoritative evidence.

## Future provider certification

Provider idempotency windows, key formats, webhook ordering, payment/ACH/card state transitions, status-query capabilities, and retry semantics vary. Once a regulated provider is selected, create a provider-specific version of this plan from its official certification documentation and reconcile internal references to provider transfer/payment IDs. The provider-specific test suite must define exactly how long an unknown state may remain unresolved, what evidence is authoritative, and who is allowed to authorize any replacement/retry after terminal failure.
