# Galactic Trust — Provider Sandbox Operations Runbook

This runbook is for an **approved provider sandbox only**. It is not a production banking runbook and does not authorize real-money activity.

Never place provider API keys, database passwords, webhook secrets, operator secrets, Vercel tokens, or private keys in Git, screenshots, tickets, or ChatGPT messages.

## 1. Preconditions
Before any provider-sandbox operation:

- exact Git commit under test is known;
- CI is green on that exact commit;
- `BANKING_ENABLE_LIVE_WRITES=false`;
- provider sandbox credentials are isolated from production;
- `BANKING_SANDBOX_PROVIDER_ENABLED=true` only in the approved sandbox environment;
- provider-sandbox Postgres is isolated, migrated, and explicitly enabled;
- operator HMAC secret is configured server-side;
- operator ID is present in `BANKING_SANDBOX_OPERATOR_IDS`;
- webhook endpoint is configured with the provider/private gateway;
- no secret values appear in client JavaScript or customer-facing pages.

Review `/sandbox-readiness` before continuing.

## 2. Operator CLI
The repository provides:

```sh
npm run sandbox:operator -- <command>
```

The CLI expects these variables in the authorized operator environment:

- `GALACTIC_SANDBOX_OPERATOR_CLIENT_ENABLED=true`
- `GALACTIC_SANDBOX_BASE_URL`
- `BANKING_SANDBOX_OPERATOR_ID`
- `BANKING_SANDBOX_OPERATOR_SECRET`

The CLI:
- requires HTTPS for remote environments;
- refuses redirects;
- signs timestamp + method + path + exact request-body hash;
- does not print the operator signing secret.

Do not put the secret on the command line itself. Supply it through the authorized environment/secret manager.

## 3. Initial environment check
Run:

```sh
npm run sandbox:operator -- operations
```

Expected starting posture for a fresh sandbox:
- zero or small received queue;
- zero stale processing leases;
- zero terminal failures;
- zero open reconciliation discrepancies.

Any stale processing, terminal failure, or open discrepancy must be understood before certification continues.

## 4. Fixed certification launch
Run:

```sh
npm run sandbox:operator -- certify
```

The certification is intentionally fixed:
- sandbox customer;
- approved sandbox KYC fixture;
- checking account;
- inbound $25.00 sandbox ACH;
- durable provider-resource mappings;
- audit records.

The command does **not** allow a caller-supplied amount or KYC outcome.

Record the returned certification run ID and Galactic resource IDs. Do not record secrets.

## 5. Signed webhook evidence
After the provider/private gateway emits the authentic sandbox webhook, confirm:

- webhook signature accepted;
- event captured once;
- processing lease acquired;
- event marked processed;
- ledger journal created once;
- event-level reconciliation created;
- audit evidence appended.

Re-deliver the exact same provider event to prove idempotency. The replay must not create another journal.

## 6. Account-level reconciliation
For one known Galactic sandbox account:

```sh
npm run sandbox:operator -- reconcile-account <galactic-account-resource-id>
```

The system will:
- resolve the durable provider account mapping;
- fetch the provider sandbox current/available balance;
- reconstruct the Galactic internal balance from processed provider events and `customer_deposit_liability` journal lines;
- save a matched/discrepancy reconciliation;
- append audit evidence.

The command cannot supply an alternate balance and cannot edit historical journals.

## 7. Bounded account reconciliation sweep
To reconcile mapped sandbox accounts as an operations batch:

```sh
npm run sandbox:operator -- reconcile-all-accounts
```

Safety behavior:
- maximum 100 mapped accounts per run;
- provider balance calls are sequential, not an unbounded burst;
- each account uses the same audited per-account reconciliation path;
- one failed account does not suppress the results for other accounts;
- failed items return bounded error codes, not provider-secret-rich messages.

If the result is marked truncated, investigate account volume and deliberately design pagination/batching before expanding the cap. Do not simply remove the limit.

## 8. Open reconciliation queue
List open discrepancies:

```sh
npm run sandbox:operator -- reconciliations
```

Only bounded reconciliation summaries should be returned. Raw webhook bodies and provider credentials are not part of this surface.

For every discrepancy:
1. compare provider sandbox evidence to Galactic event/ledger evidence;
2. determine whether the provider state, event ingestion, mapping, or internal accounting needs correction;
3. never edit a posted journal to make numbers match;
4. use a new legitimate provider event and/or compensating journal where accounting correction is required;
5. only after evidence is complete, resolve the reconciliation metadata.

Resolve metadata with:

```sh
npm run sandbox:operator -- resolve-reconciliation <reconciliation-id> <resolution note>
```

The resolution note is audited. Resolution does not alter ledger history.

## 9. Automatic recovery
Check operations first:

```sh
npm run sandbox:operator -- operations
```

Then trigger one bounded recovery pass:

```sh
npm run sandbox:operator -- recover
```

Current recovery controls:
- 10 events maximum per recovery invocation;
- five automatic attempts maximum per event;
- two-minute processing lease;
- exponential retry backoff;
- stale leases may be reclaimed;
- concurrent workers use `FOR UPDATE SKIP LOCKED` so they do not intentionally select the same row.

Do not repeatedly hammer recovery if the same event continues failing. Investigate the failure code.

## 10. Terminal failure review
After automatic attempts are exhausted, the event remains terminal and is excluded from automatic recovery.

Manual requeue requires an allowlisted operator and an explicit reason:

```sh
npm run sandbox:operator -- requeue-event <provider-event-id> <reason>
```

The reason should describe what was fixed or why another retry is justified. Requeue resets the retry cycle and appends audit evidence.

Do not manually requeue an event simply to clear an alert. If the underlying cause is unknown, leave it terminal and investigate.

## 11. ACH return test
A sandbox certification should exercise a returned inbound ACH.

Required proof:
- an original `ach.transfer.posted` event was already processed;
- return refers to the same provider transfer resource;
- return amount equals the prior posted amount;
- return event is signed/deduplicated/leased normally;
- compensating journal debits `customer_deposit_liability`;
- compensating journal credits `partner_settlement_cash`;
- provider-vs-ledger account reconciliation returns to the expected state.

A return received without the prior processed posted event must fail closed.

## 12. Post-test operations snapshot
Run:

```sh
npm run sandbox:operator -- operations
```

Target posture after a clean test:
- no stale processing leases;
- no retryable failures left unexplained;
- no terminal failures left unexplained;
- no open reconciliation discrepancies left unexplained.

A non-zero count is not automatically a defect; it is an investigation queue. Do not hide or auto-resolve it.

## 13. Evidence package
For partner diligence, retain only approved non-secret evidence:

- exact commit SHA;
- applied migration numbers/checksums;
- provider sandbox name;
- certification run ID;
- Galactic resource IDs;
- provider resource IDs where provider policy permits;
- provider webhook event IDs;
- duplicate replay result;
- processing attempt/lease evidence;
- journal IDs;
- event-level reconciliation IDs;
- account-level reconciliation IDs;
- discrepancy values;
- ACH-return evidence;
- audit event IDs;
- terminal failure/requeue evidence if tested.

Do not retain secret material in the evidence package.

## 14. Stop conditions
Stop the sandbox certification and investigate if any of the following occurs:

- production live writes become enabled;
- sandbox credentials overlap production credentials;
- database isolation is uncertain;
- webhook signature verification fails unexpectedly;
- a duplicate event creates a second journal;
- a journal is out of balance;
- a return posts without a prior posted event;
- an account discrepancy cannot be explained;
- processing attempts exhaust without a known cause;
- a secret appears in logs, UI, Git, or an evidence artifact.

Do not weaken a gate to make the test pass.

## 15. Production remains separate
A successful sandbox run does not authorize production.

Production still requires the actual sponsor-bank/provider program, legal/compliance approval, KYC/CIP/OFAC/AML/fraud responsibilities, approved disclosures, security/incident readiness, certification, and the independent production activation gates.
