# White-Label Fintech Platform — Product Specification

Status: prototype / simulation only  
Reference tenant: Galactic Trust  
Goal: prove the software, customer experience, operational controls, and partner-ready architecture before a regulated live banking program is approved.

## 1. Product thesis

Build one reusable financial-experience platform that can be branded for vertical SaaS companies, creator/freelancer platforms, membership businesses, workforce products, commerce products, and other organizations that want a modern money experience without rebuilding the application and operations layer from scratch.

Galactic Trust is the reference tenant. The platform is **not represented as a bank** in the prototype phase. All balances, routing values, accounts, transfers, linked institutions, cash-flow schedules, savings goals, provider events, and card experiences are synthetic or sandbox data unless a future regulated program is explicitly approved and integrated.

## 2. Product principles

The platform should win on:

- customer clarity instead of hidden state;
- reconciliation and accounting integrity instead of optimistic balances;
- retry safety instead of duplicate financial effects;
- tenant isolation instead of query-string trust;
- operational visibility instead of black-box provider calls;
- fail-closed live controls instead of accidental enablement;
- fast white-label launch without weakening security boundaries;
- transparent fees, limits, eligibility, and product availability;
- mobile reliability under dropped, repeated, or ambiguous requests.

A polished interface is valuable, but it is not the product by itself. The product includes the ledger, reconciliation, provider boundary, audit evidence, operator controls, incident controls, recovery procedures, and customer-facing trust model underneath it.

## 3. Target customer

Initial B2B customer profile:

- vertical SaaS products with an existing user community;
- creator/freelancer platforms;
- membership or affinity brands;
- small-business software platforms;
- benefits or workforce platforms;
- commerce/property/community products that want a branded financial hub.

The customer buys a branded software experience. Future live financial services can be offered only when the platform, customer, regulated provider, sponsor bank, and required compliance/security parties approve the exact program.

## 4. Current prototype experience

### Customer-facing routes

- `/prototype` — white-label banking-style dashboard with synthetic accounts, activity, transfers, cards and sandbox-link UX.
- `/prototype/cashflow` — Safe-to-Spend planning with 7/14/30-day forecasts, known bills/income, savings plans, customer reserve, confidence labels, and explicit uncertainty disclosure.
- `/prototype/transparency` — plain-English product status, fees, limits, eligibility, and whether a capability is prototype, sandbox, partner-required, or unavailable.
- `/prototype/operations` — operator-facing reconciliation, provider-event, audit and control evidence.

The customer UI has a compact prototype dock so cash-flow intelligence, transparency, and operations evidence are discoverable without typed URLs.

### White-label configuration

A tenant controls:

- product name and short name;
- legal name;
- support address;
- logo initials;
- primary/secondary accent colors;
- permitted domains;
- product disclosure;
- future approved banking disclosure.

Prototype tenant configuration can come from server-side `WHITE_LABEL_TENANTS_JSON`. Configuration fails closed on malformed JSON, invalid canonical tenant keys/domains, duplicate tenant keys, duplicate domains, or the same hostname being assigned to multiple tenants.

Recognized production hostnames are bound to their configured tenant. Query/body tenant switching is rejected on recognized or unrecognized production hosts when it would override routing. Tenant switching is allowed for local development and only when Vercel explicitly identifies an environment as `preview`.

## 5. Persistent prototype data model

The persistent prototype uses Supabase/PostgreSQL with **five ordered migrations**:

1. `001_white_label_prototype.sql`
   - tenants, profiles, simulated accounts, synthetic transactions and linked-account metadata;
   - seed data for the Galactic Trust demo user;
   - simulation-only transfer boundary.
2. `002_operations_reconciliation.sql`
   - opening balance anchors;
   - reconciliation evidence;
   - provider-event deduplication and payload digests;
   - audit events and linked-account sync state.
3. `003_transfer_idempotency.sql`
   - persistent provider-reference/idempotency uniqueness;
   - duplicate transfer replay without a second debit;
   - changed intent with reused key rejected.
4. `004_double_entry_ledger.sql`
   - tenant-scoped GL accounts;
   - immutable journals/lines;
   - deferred zero-sum journal enforcement;
   - atomic simulated transfer journaling;
   - account-vs-GL reconciliation.
5. `005_cashflow_intelligence.sql`
   - synthetic cash-flow items for income, bills, and planned savings;
   - synthetic savings goals;
   - deterministic Galactic Trust planning data;
   - service-role-only persistence with RLS enabled.

All five migrations are required for the current persistent prototype. Migration setup instructions and readiness checks are CI-guarded so the documented migration count cannot silently fall behind the schema.

## 6. Transaction integrity

### Atomic simulated transfers

Persistent simulated transfers run through PostgreSQL so the customer balance update, transaction record, audit evidence, and double-entry journal occur in one database transaction. Non-simulated accounts are rejected by the prototype functions.

### Idempotency

The transfer API requires an idempotency key. The persistent database prevents a successful replay from creating a second economic effect.

The prototype client also hardens intent handling:

- identical concurrent transfer intents share one in-flight request;
- ambiguous network errors, HTTP 408/429, and server 5xx responses temporarily retain the same intent/key for retry;
- retry state is short-lived and remains in memory rather than browser persistent storage;
- changing the recipient/amount while reusing a committed key is rejected by the persistent ledger.

The network-chaos test plan still requires manual exercise on a deployed persistent preview, especially on iPhone/Safari under throttled or interrupted networking.

## 7. Accounting and reconciliation

The platform intentionally maintains two independent reconciliation views:

1. **Transaction-history reconciliation** — opening balance + posted credits − posted debits must equal the account balance.
2. **Double-entry reconciliation** — the mapped customer GL balance must equal the account balance and each journal must sum to zero.

The operations console renders both layers separately so an operator can identify whether a mismatch is in customer transaction history, account state, or the GL representation.

Immutable accounting history is corrected through forward/reversing entries rather than destructive journal edits.

## 8. Cash-flow intelligence

Safe-to-Spend is a planning layer, not a promise that spending a number is risk-free.

The engine considers:

- current synthetic balance;
- scheduled/estimated prototype income;
- scheduled/estimated prototype bills;
- planned savings;
- a customer-selected reserve;
- 7, 14 and 30-day horizons.

The headline conservative spendable estimate uses the lowest relevant spendable amount after preserving the reserve. The UI explains that pending card activity, variable bills, cash withdrawals, fees, and unknown obligations can change the result.

A future Bill Guard / obligations experience may build on this data, but live bill payment or autopay must not be implied until an approved provider program exists.

## 9. Prototype operator access

Persistent operations evidence is protected by a prototype operator session boundary.

- Server-side `PROTOTYPE_OPERATOR_ACCESS_SECRET` is required once persistent Supabase operations are configured.
- A configured secret shorter than 32 characters is rejected and persistent operations remain locked.
- Successful sign-in creates a signed 8-hour `HttpOnly`, `SameSite=Strict` cookie; production cookies also use `Secure`.
- The submitted secret is cleared from client state before the network result returns.
- The client does not read or write the signed session cookie.
- Explicit sign-out destroys the session cookie.
- Operator login has a small best-effort in-process throttle for prototype abuse resistance.

This is **not production workforce identity**. A live program still requires a selected workforce identity architecture such as phishing-resistant MFA/passkeys, SSO where appropriate, least privilege, RBAC, privileged-access controls, break-glass governance, and dual control for high-risk actions.

The in-process login throttle is also **not distributed production rate limiting**; production needs shared edge/WAF/rate/abuse enforcement appropriate to the selected infrastructure.

## 10. Request and tenant boundaries

Prototype browser mutations require trusted-origin checks where applicable, JSON content types, and bounded JSON parsing.

Current body caps are intentionally small for operator login, reconciliation, and sandbox linking; moderate for transfers; and larger but still bounded for authenticated sandbox webhook payloads.

Tenant-scoped UI and API routes use host-bound tenant resolution. Unknown tenants fail closed. Authenticated server-to-server sandbox webhook tests must name an explicit known tenant after webhook authentication rather than trusting browser routing state.

These controls reduce prototype cross-tenant and abuse risk but do not replace production penetration testing, distributed abuse controls, provider certification, or formal tenant-isolation verification.

## 11. Sandbox account linking and provider boundary

The server adapter supports Plaid Sandbox when sandbox credentials are configured. For the fast demo flow it uses Sandbox-only synthetic institution data and does not return or persist the Plaid access token.

If Plaid Sandbox is not configured, the UI uses a local synthetic fallback.

This is intentionally separate from future money movement. Production account linking and ACH/card/payment state machines must use the exact provider-supported production integration, credential retention design, webhook verification, idempotency semantics, and certification requirements.

A provider-neutral banking contract exists for customers, accounts, cards, payment instructions, webhook verification/parsing, and provider reconciliation. Its default adapter is disabled and fails closed.

## 12. Operations and resilience

Current prototype controls include:

- provider-event deduplication;
- payload hashing;
- sanitized audit evidence;
- two reconciliation layers;
- privacy-safe API error correlation IDs;
- fail-closed application money-movement freeze in the partner shell;
- disaster-recovery plan;
- migration/immutable-ledger recovery plan;
- network retry/ambiguous-response test plan;
- sponsor-bank/program readiness checklist.

The emergency application flag is not represented as a verified production kill switch. A live program needs a provider/partner-approved pause mechanism, controlled unfreeze procedure, measured drill evidence, and alert/escalation ownership.

## 13. Prototype security boundary

The prototype is designed around the following permanent constraints:

- no real deposits or customer funds in the prototype ledger;
- no live ACH/wires/card issuance from prototype routes;
- no production KYC/AML claims;
- no browser access to Supabase service credentials;
- no Plaid secret/access token exposed to the browser;
- no production provider-webhook claim from the generic sandbox inbox;
- no live banking writes merely because provider interfaces compile;
- no unsupported FDIC, rate, fee, insurance, or sponsor-bank claim;
- no real customer financial credentials in seed data;
- no secrets in source, issues, logs, or chat;
- no claim that prototype operator access equals production MFA/SSO;
- no claim that in-memory throttling equals production abuse protection;
- `readyForLiveBanking` remains false.

## 14. Future approved live architecture

Target shape:

`White-label customer UI`
`        |`
`        v`
`Authenticated tenant-aware orchestration`
`        |`
`        +--> Internal ledger / accounting / reconciliation`
`        |`
`        +--> Operations, fraud, restrictions, support, audit`
`        |`
`        v`
`Provider-specific certified adapter`
`        |`
`        v`
`Approved BaaS / sponsor bank / payments / card / KYC-AML-fraud services`

A BaaS or sponsor-bank relationship does not remove the platform's legal, compliance, security, reconciliation, support, fraud, privacy, or operating responsibilities.

## 15. Core demo flow

1. Open `/prototype` on the selected preview tenant.
2. Review synthetic accounts/activity and explicit simulation status.
3. Open Safe-to-Spend and inspect the 7/14/30-day assumptions.
4. Open Fees & Limits and verify product availability is described honestly.
5. Submit one simulated transfer.
6. Replay the same transfer intent and verify no second persistent economic effect.
7. Optional: connect Plaid Sandbox synthetic data.
8. Sign into Operations using the privately configured prototype operator secret.
9. Run transaction-history and GL reconciliation.
10. Review sanitized audit/provider-event evidence.
11. Check `/api/prototype/readiness` for remaining gates.

## 16. Future live customer onboarding

A future live tenant should require, at minimum:

1. commercial qualification and use-case review;
2. prohibited-business and program-risk review;
3. legal/compliance responsibility matrix;
4. sponsor-bank/provider diligence and approval;
5. approved KYC/KYB, AML, sanctions, fraud, privacy and disclosures;
6. production workforce identity/access controls;
7. provider sandbox/certification implementation;
8. production webhook verification and event recovery;
9. provider-statement reconciliation;
10. disputes/returns/support escalation flows;
11. security testing, monitoring and incident response;
12. disaster-recovery and kill-switch drills;
13. limited invited production cohort with conservative limits;
14. explicit authorization to enable production writes.

## 17. Business model hypothesis

B2B software revenue can be tested with:

- implementation / branding fee;
- monthly platform subscription;
- per-active-user/account software fee;
- premium support / analytics / operations modules;
- contracted revenue share from eligible partner products where legally and contractually permitted.

Do not model interchange, deposit economics, lending, credit, crypto, or other regulated-product revenue as guaranteed. Economics depend on approved program terms, provider/network fees, customer behavior, fraud/losses, compliance/support costs and contract structure.

## 18. Pre-seed framing

Fundraising target hypothesis: $100k–$500k pre-seed.

Use of funds can include:

- fintech/banking counsel;
- experienced compliance ownership;
- provider/sponsor-bank diligence and onboarding;
- security/privacy assurance;
- cyber/E&O coverage;
- production identity/access and abuse controls;
- reconciliation/fraud/support operations;
- additional technical/operational capacity;
- design-partner pilots.

Pitch framing:

> The customer experience, simulation ledger, accounting controls, retry safety, reconciliation, operator evidence, and white-label architecture already exist. The financing is to convert a disciplined prototype into an approved regulated program and repeatable white-label business—not to discover whether the software can be built.

## 19. Persistent prototype setup

1. Create a disposable/private Supabase prototype project.
2. Run all migrations in order:
   - `001_white_label_prototype.sql`
   - `002_operations_reconciliation.sql`
   - `003_transfer_idempotency.sql`
   - `004_double_entry_ledger.sql`
   - `005_cashflow_intelligence.sql`
3. Configure `SUPABASE_URL` and a server-only Supabase secret/service key privately.
4. Configure a high-entropy `PROTOTYPE_OPERATOR_ACCESS_SECRET` of at least 32 characters privately.
5. Optional: configure `PROTOTYPE_WEBHOOK_SECRET` for sandbox webhook testing.
6. Optional: configure Plaid Sandbox credentials privately.
7. Configure white-label tenant overrides/domains privately if needed.
8. Deploy an actual PR preview.
9. Exercise customer routes, operator login/sign-out, host-bound tenant rejection, body limits, transfers, retries, both reconciliation layers, cash-flow persistence and webhook deduplication.
10. Check `/api/prototype/readiness` and retain evidence.

Never paste API secrets, bank credentials, private keys, operator secrets, webhook secrets, production financial credentials, full bank/card numbers, PINs, CVVs, or OTPs into chat, source code, logs, or public issues.

## 20. Release gate

Do not merge the prototype PR solely because CI passes. Keep it draft until:

- an actual Vercel PR preview exists;
- migrations 001-005 run successfully in disposable Supabase;
- persistent Safe-to-Spend data loads;
- operator access/fail-closed behavior is manually verified;
- tenant isolation/body-limit rejection is manually verified;
- retry/ambiguous-response/concurrency tests show one economic effect per intended transfer;
- transaction-history and GL reconciliation pass;
- sandbox webhook deduplication is exercised;
- database restore/bad-migration recovery is exercised;
- emergency-freeze drill is measured;
- iPhone throttled-network and accessibility/device testing is completed.

Only a future approved regulated program can authorize real financial-service functionality.
