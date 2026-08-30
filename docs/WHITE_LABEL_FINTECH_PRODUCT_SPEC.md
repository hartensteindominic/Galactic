# White-Label Fintech Platform — Product Specification

Status: prototype / simulation only  
Reference tenant: Galactic Trust  
Goal: prove the software, customer experience, operational controls, governance boundaries, and partner-ready architecture before a regulated live banking program is approved.

## 1. Product thesis

Build one reusable financial-experience platform that can be branded for vertical SaaS companies, creator/freelancer platforms, membership businesses, workforce products, commerce products, and other organizations that want a modern money experience without rebuilding the application and operations layer from scratch.

Galactic Trust is the reference tenant. The platform is **not represented as a bank** in the prototype phase. All balances, routing values, accounts, transfers, linked institutions, cash-flow schedules, savings goals, provider events, and card experiences are synthetic or sandbox data unless a future regulated program is explicitly approved and integrated.

## 2. Product principles

The platform should win on:

- customer clarity instead of hidden state;
- reconciliation and accounting integrity instead of optimistic balances;
- retry safety instead of duplicate financial effects;
- explicit pending/unknown states instead of guessing after provider/network ambiguity;
- tenant isolation instead of query-string trust;
- operational visibility instead of black-box provider calls;
- fail-closed live controls instead of accidental enablement;
- versioned customer terms instead of duplicated/stale financial claims;
- automated-support boundaries instead of pretending a chatbot has regulated authority;
- data minimization and early sensitive-data rejection instead of inviting secrets into chat;
- visible control limitations instead of security/compliance marketing by implication;
- fast white-label launch without weakening security boundaries;
- transparent fees, limits, eligibility, and product availability;
- mobile reliability under dropped, repeated, or ambiguous requests.

A polished interface is valuable, but it is not the product by itself. The product includes the ledger, reconciliation, provider boundary, audit evidence, operator controls, incident controls, recovery procedures, customer-terms governance, support escalation boundaries, data safeguards, and customer-facing trust model underneath it.

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
- `/prototype/transparency` — plain-English product status, fees, limits, eligibility, controlled prototype terms version, and whether a capability is prototype, sandbox, partner-required, or unavailable.
- `/prototype/trust` — Trust & Security Center showing implemented prototype controls, what each control does **not** prove, and known production/legal/operational gaps.
- `/prototype/operations` — operator-facing reconciliation, provider-event, audit and control evidence.

The customer UI has a compact prototype dock so cash-flow intelligence, transparency, trust/security, and operations evidence are discoverable without typed URLs.

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

## 6. Transaction integrity and financial-intent state

### Atomic simulated transfers

Persistent simulated transfers run through PostgreSQL so the customer balance update, transaction record, audit evidence, and double-entry journal occur in one database transaction. Non-simulated accounts are rejected by the prototype functions.

### Idempotency

The transfer API requires an idempotency key. The persistent database prevents a successful replay from creating a second economic effect.

The prototype client also hardens intent handling:

- identical concurrent transfer intents share one in-flight request;
- ambiguous network errors, HTTP 408/429, and server 5xx responses temporarily retain the same intent/key for retry;
- retry state is short-lived and remains in memory rather than browser persistent storage;
- changing the recipient/amount while reusing a committed key is rejected by the persistent ledger.

### Explicit financial-intent state

`lib/financial-intent-state.ts` defines:

`created -> submitted -> pending_unknown -> succeeded | failed`

with cancellation allowed before submission.

A timeout/provider disappearance is not automatically treated as failure. While an intent is submitted or `pending_unknown`, replacement is blocked. Automatic replacement is always disabled. A terminal customer outcome requires authoritative evidence rather than inference from a timeout.

The provider-specific mapping remains unverified until an actual provider is selected and its status/idempotency semantics are exercised in its approved certification/sandbox environment.

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

## 9. Controlled customer terms

`lib/customer-terms-control.ts` provides the current prototype source-of-truth for changing customer-facing prototype terms.

Current source:

- version: `prototype-terms-v1`;
- status: `prototype-only`;
- live effective date: none;
- live approval: false.

Orbit and the Transparency Center consume this source for prototype fee/rate/insurance/transfer/funding/rewards/cash-flow language instead of maintaining independent copies.

If a live/partner path requests changing financial terms before an approved live adapter exists, it fails closed with `APPROVED_CUSTOMER_TERMS_UNAVAILABLE` rather than inventing a value or silently falling back to prototype wording.

A future live source must be versioned, tenant/program scoped, have an effective time, approval/source evidence, publication evidence, notice/consent handling where applicable, archive behavior, and a controlled correction process. See `docs/CUSTOMER_TERMS_CHANGE_CONTROL.md`.

## 10. Automated support and human case authority

Orbit is an automated deterministic prototype assistant.

Current boundaries:

- no third-party LLM processing of customer financial data in the prototype;
- no autonomous credit decisions/adverse-action reasoning;
- no SAR/AML/sanctions disposition or SAR disclosure;
- no fraud-liability/reimbursement/dispute decision;
- no KYC/KYB identity adjudication;
- no legal advice;
- no personalized investment recommendation;
- no unsupported insurance/rate/fee/eligibility claim.

Material/account-specific topics return a human-handoff marker. The prototype is explicit that the marker is **not** a real complaint/dispute case, human acknowledgement, investigation, or resolution because no production case-management channel is connected.

`lib/support-case-state.ts` defines a human-controlled case lifecycle. Automation may detect/route, but an `authorized-human` actor is required for human acknowledgement, review, resolution, or closure. Production response deadlines are intentionally not invented before the exact program is known.

## 11. Support sensitive-data guard

Orbit has two best-effort prototype safeguards against customers pasting certain high-risk data into general support chat:

1. Client-side preflight checks run before the message is added to chat history or sent over the network.
2. The assistant API independently checks the request and rejects detected high-risk patterns with `SENSITIVE_DATA_REJECTED`.

Patterns include likely payment-card numbers validated with Luhn, hyphenated SSNs, account/routing numbers with relevant context, OTP/verification codes, assigned PIN/password/passcode values, and several common private/API-key patterns.

The API may return safe detection categories but not the matched secret value or raw submitted message.

This detector is **not production DLP**. It does not replace secure document/identity upload flows, privacy/security architecture, logging controls, enterprise DLP, or formal data-loss testing.

## 12. Trust & Security Center

`/prototype/trust` and `/api/prototype/trust` provide a customer/reviewer-facing trust posture.

The Trust Center shows:

- simulation-only money activity;
- tenant host isolation;
- retry/idempotency/pending-unknown discipline;
- automated-support authority limits;
- sensitive-chat-data guard;
- versioned prototype customer terms;
- human-controlled case-state boundaries;
- a limitation for every implemented control;
- known production gaps.

It explicitly keeps live banking, production DLP, approved live customer terms, sponsor-bank/program approval, and legal/compliance applicability review false/unapproved.

The Trust Center is not a security certification, compliance opinion, bank charter, deposit-insurance statement, or approval for real customer funds.

## 13. Prototype operator access

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

## 14. Request and tenant boundaries

Prototype browser mutations require trusted-origin checks where applicable, JSON content types, and bounded JSON parsing.

Current body caps are intentionally small for operator login, reconciliation, sandbox linking, and support; moderate for transfers; and larger but still bounded for authenticated sandbox webhook payloads.

Tenant-scoped UI and API routes use host-bound tenant resolution. Unknown tenants fail closed. The Transparency Center, Trust Center, prototype terms endpoint, dashboard, cash-flow routes, operations routes, and tenant-scoped APIs all use the tenant boundary. Authenticated server-to-server sandbox webhook tests must name an explicit known tenant after webhook authentication rather than trusting browser routing state.

These controls reduce prototype cross-tenant and abuse risk but do not replace production penetration testing, distributed abuse controls, provider certification, or formal tenant-isolation verification.

## 15. Sandbox account linking and provider boundary

The server adapter supports Plaid Sandbox when sandbox credentials are configured. For the fast demo flow it uses Sandbox-only synthetic institution data and does not return or persist the Plaid access token.

If Plaid Sandbox is not configured, the UI uses a local synthetic fallback.

This is intentionally separate from future money movement. Production account linking and ACH/card/payment state machines must use the exact provider-supported production integration, credential retention design, webhook verification, idempotency semantics, and certification requirements.

A provider-neutral banking contract exists for customers, accounts, cards, payment instructions, webhook verification/parsing, and provider reconciliation. Its default adapter is disabled and fails closed.

## 16. Operations and resilience

Current prototype controls include:

- provider-event deduplication;
- payload hashing;
- sanitized audit evidence;
- two reconciliation layers;
- privacy-safe API error correlation IDs;
- fail-closed application money-movement freeze in the partner shell;
- disaster-recovery plan;
- migration/immutable-ledger recovery plan;
- network retry/ambiguous-response/provider-disappearance test plan;
- sponsor-bank/program readiness checklist.

The provider-disappearance scenario preserves `pending_unknown` until authoritative evidence resolves the intent. It must not create a replacement instruction automatically.

The emergency application flag is not represented as a verified production kill switch. A live program needs a provider/partner-approved pause mechanism, controlled unfreeze procedure, measured drill evidence, customer-status communication timing, and alert/escalation ownership.

## 17. Prototype security and compliance boundary

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
- no secrets in source, issues, logs, AI prompts, or chat;
- no claim that prototype operator access equals production MFA/SSO;
- no claim that in-memory throttling equals production abuse protection;
- no claim that support pattern detection equals production DLP;
- no claim that a human-handoff marker equals a staffed support/case program;
- no claim that versioned prototype terms are approved live terms;
- no claim that documentation/CI proves legal compliance or program approval;
- `readyForLiveBanking` remains false.

## 18. Governance artifacts

Current diligence/operating documents include:

- `AI_GOVERNANCE_AND_REGULATED_AUTOMATION.md`;
- `COMPLIANCE_RESPONSIBILITY_MATRIX_TEMPLATE.md`;
- `DATA_CLASSIFICATION_RETENTION_MAP.md`;
- `CUSTOMER_SUPPORT_COMPLAINT_ESCALATION_MODEL.md`;
- `CUSTOMER_TERMS_CHANGE_CONTROL.md`;
- `THIRD_PARTY_AND_AI_VENDOR_RISK_REGISTER_TEMPLATE.md`;
- `FINTECH_SECURITY_THREAT_MODEL.md`;
- `REGULATORY_REFERENCE_CHANGELOG.md`;
- `EMERGENCY_MONEY_MOVEMENT_CONTROL.md`;
- `NETWORK_RETRY_CHAOS_TEST_PLAN.md`;
- `BUSINESS_CONTINUITY_DISASTER_RECOVERY.md`;
- `MIGRATION_ROLLBACK_LEDGER_RECOVERY.md`;
- `SECURITY_OPERATOR_ACCESS_PLAN.md`;
- `SPONSOR_BANK_READINESS_CHECKLIST.md`.

Their existence is evidence of preparation, not evidence that an external approval, legal conclusion, operating exercise, or production control has been completed.

## 19. Future approved live architecture

Target shape:

`White-label customer UI`
`        |`
`        v`
`Authenticated tenant-aware orchestration`
`        |`
`        +--> Controlled customer-terms/disclosure source`
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

## 20. Core demo flow

1. Open `/prototype` on the selected preview tenant.
2. Review synthetic accounts/activity and explicit simulation status.
3. Open Safe-to-Spend and inspect the 7/14/30-day assumptions.
4. Open Fees & Limits and verify the visible `prototype-terms-v1` source is not approved for live use.
5. Open Trust & Security and verify every implemented control includes a limitation and known production gaps remain visible.
6. Exercise Orbit general-support answers and regulated-topic human-handoff markers.
7. Try a synthetic sensitive-data pattern and verify the client blocks it before send; separately verify the API rejects the same category without returning the matched value.
8. Submit one simulated transfer.
9. Replay the same transfer intent and verify no second persistent economic effect.
10. Exercise an ambiguous response and verify the intent stays pending/unknown until authoritative evidence exists.
11. Optional: connect Plaid Sandbox synthetic data.
12. Sign into Operations using the privately configured prototype operator secret.
13. Run transaction-history and GL reconciliation.
14. Review sanitized audit/provider-event evidence.
15. Check `/api/prototype/readiness`, `/api/prototype/terms`, and `/api/prototype/trust` for remaining gates.

## 21. Future live customer onboarding

A future live tenant should require, at minimum:

1. commercial qualification and use-case review;
2. prohibited-business and program-risk review;
3. legal/compliance responsibility matrix;
4. sponsor-bank/provider diligence and approval;
5. approved KYC/KYB, AML, sanctions, fraud, privacy and disclosures;
6. approved/versioned live customer-terms source;
7. production support/case-management ownership and required response/escalation processes;
8. production workforce identity/access controls;
9. provider sandbox/certification implementation;
10. production webhook verification and event recovery;
11. provider-statement reconciliation;
12. disputes/returns/support escalation flows;
13. production data protection/DLP/logging architecture appropriate to the program;
14. security testing, monitoring and incident response;
15. disaster-recovery and kill-switch drills;
16. limited invited production cohort with conservative limits;
17. explicit authorization to enable production writes.

## 22. Business model hypothesis

B2B software revenue can be tested with:

- implementation / branding fee;
- monthly platform subscription;
- per-active-user/account software fee;
- premium support / analytics / operations modules;
- contracted revenue share from eligible partner products where legally and contractually permitted.

Do not model interchange, deposit economics, lending, credit, crypto, or other regulated-product revenue as guaranteed. Economics depend on approved program terms, provider/network fees, customer behavior, fraud/losses, compliance/support costs and contract structure.

## 23. Pre-seed framing

Fundraising target hypothesis: $100k–$500k pre-seed.

Use of funds can include:

- fintech/banking counsel;
- experienced compliance ownership;
- provider/sponsor-bank diligence and onboarding;
- security/privacy assurance;
- cyber/E&O coverage;
- production identity/access, DLP and abuse controls;
- reconciliation/fraud/support operations;
- additional technical/operational capacity;
- design-partner pilots.

Pitch framing:

> The customer experience, simulation ledger, accounting controls, retry safety, reconciliation, operator evidence, customer-terms control, support/AI boundaries, Trust Center, and white-label architecture already exist. The financing is to convert a disciplined prototype into an approved regulated program and repeatable white-label business—not to discover whether the software can be built.

## 24. Persistent prototype setup

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
9. Exercise customer routes, controlled terms, Trust Center, Orbit guardrails, operator login/sign-out, host-bound tenant rejection, body limits, transfers, retries, both reconciliation layers, cash-flow persistence and webhook deduplication.
10. Check `/api/prototype/readiness` and retain evidence.

Never paste API secrets, bank credentials, private keys, operator secrets, webhook secrets, production financial credentials, full bank/card numbers, PINs, CVVs, SSNs, identity documents, or OTPs into chat, source code, logs, or public issues.

## 25. Release gate

Do not merge the prototype PR solely because CI passes. Keep it draft until:

- an actual Vercel PR preview exists;
- migrations 001-005 run successfully in disposable Supabase;
- persistent Safe-to-Spend data loads;
- operator access/fail-closed behavior is manually verified;
- tenant isolation/body-limit rejection is manually verified;
- controlled prototype terms and Trust Center are manually checked in the deployed preview;
- Orbit regulated-topic escalation and sensitive-data client/server rejection are manually exercised;
- retry/ambiguous-response/concurrency tests show one economic effect per intended transfer;
- transaction-history and GL reconciliation pass;
- sandbox webhook deduplication is exercised;
- provider-disappearance recovery is exercised in an approved provider sandbox/stub;
- database restore/bad-migration recovery is exercised;
- emergency-freeze and customer-visible incident-status timing are measured;
- iPhone throttled-network and accessibility/device testing is completed;
- qualified legal/compliance applicability review is complete;
- responsibility ownership is assigned;
- approved live customer terms/support/data-protection programs exist as applicable;
- explicit sponsor/provider approval exists before any real financial-service activity or claims.

Only a future approved regulated program can authorize real financial-service functionality.