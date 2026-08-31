# Galactic Trust — Banking Provider Outreach Brief

## Purpose
This brief is the non-confidential starting point for conversations with a potential sponsor-bank/BaaS/program provider. It intentionally avoids secrets, private customer data, unsupported scale claims, and claims that Galactic Trust is already a bank.

## Product summary
**Galactic Trust** is a financial-technology product interface currently operating in demo/pre-launch mode.

Current engineering work focuses on:
- consumer-style account dashboard UX;
- provider-neutral banking adapter architecture;
- signed/idempotent webhook ingestion;
- append-only double-entry ledger controls;
- provider-vs-internal reconciliation;
- account/event recovery controls;
- audit evidence;
- sponsor-bank/provider sandbox certification.

Galactic Trust does not currently accept real customer deposits or represent itself as a chartered bank.

## Intended initial regulated scope
Subject to provider/bank/legal/compliance approval, the intended first regulated scope is deliberately narrow:
- individual consumer onboarding;
- KYC/CIP through the approved program/provider flow;
- checking/deposit account interface;
- ACH money movement;
- basic account restriction/freeze support;
- transaction history/balances;
- customer support/error/dispute workflow required for the actual program.

Not in the initial regulated scope:
- lending;
- investment products;
- self-custody crypto;
- proprietary deposit custody;
- unsupported money-transmission activity;
- production card issuance unless separately approved.

## Current engineering safety posture
Production banking is fail-closed behind independent gates for:
- approved partner program configuration;
- documented banking compliance approval;
- customer disclosure approval;
- explicit live-write activation.

Provider credentials alone do not enable production money movement.

Provider sandbox uses separate credentials, enable gates, database, operator authentication, and evidence flow.

## Sandbox architecture prepared
Galactic Trust is prepared to test a provider through a private gateway/adapter contract supporting:
- sandbox customer creation;
- KYC test fixtures;
- account creation;
- account balance retrieval;
- ACH;
- idempotent writes;
- signed webhooks;
- canonical event normalization;
- event/account reconciliation.

The engineering sandbox evidence loop includes:
- fixed $25 ACH test;
- signed webhook verification;
- duplicate webhook replay;
- durable event dedupe;
- processing leases/bounded recovery;
- balanced append-only journal;
- ACH return/reversal;
- event reconciliation;
- provider-vs-ledger account reconciliation;
- audited terminal failure/requeue;
- one-time privileged operator request anti-replay.

## Questions for provider

### Program fit
1. What legal/program role would your platform and partner bank(s) play for this product?
2. Which bank would be expected to sponsor/hold the proposed consumer accounts?
3. Is this product/geography currently within your program appetite?
4. What New York-specific availability, restrictions, approvals, or additional diligence should we expect?
5. What entity is party to the customer deposit/account agreement?

### Compliance responsibilities
6. How are KYC/CIP responsibilities divided among fintech, platform, and bank?
7. Who owns OFAC/sanctions screening?
8. Who owns AML/transaction monitoring and suspicious-activity escalation?
9. Which fraud controls are provider/bank-managed vs fintech-managed?
10. What customer complaints/error/dispute responsibilities remain with Galactic Trust?
11. What disclosures and bank-identification language must be used?

### Sandbox
12. Can we receive sandbox/evaluation access before commercial production approval?
13. Does sandbox support customer/KYC/account/ACH test flows?
14. Can ACH returns/reversals be simulated?
15. Are sandbox webhooks signed with production-equivalent semantics?
16. What event replay/history tooling is available?
17. Are provider writes idempotent, and what key constraints apply?
18. Is an account balance endpoint/report available for independent reconciliation?

### Financial operations
19. What is the authoritative account balance/transaction data source?
20. What settlement/ACH/return reports or APIs are available?
21. Which identifiers join webhook events, API resources, and settlement/reconciliation reports?
22. What daily reconciliation process does the bank/platform expect from the fintech?
23. How are discrepancies escalated and resolved?

### Accounts / ACH
24. Which account states/restrictions are supported?
25. What ACH limits, hold periods, return handling, and fraud controls apply?
26. What prefunding/reserve requirements apply?
27. Which ACH direction/types are supported initially?
28. What account freeze/closure/offboarding controls are required?

### Security / operations
29. What security diligence package is available during evaluation/contracting?
30. What incident-notification and escalation process applies?
31. What business-continuity/recovery requirements apply to Galactic Trust?
32. What data must Galactic Trust retain vs what your platform/bank retains?
33. What audit/access evidence is expected from Galactic Trust?

### Commercial / implementation
34. What setup/implementation fees apply?
35. What monthly/minimum commitments apply?
36. What unit pricing applies to accounts, ACH, KYC, cards, disputes, or other relevant services?
37. What reserves/prefund/capital/insurance requirements apply?
38. What implementation/certification timeline and dependencies are typical for a product at this stage?
39. What engineering/compliance resources will be assigned during implementation?
40. What are the termination/data-export/migration provisions?

## Materials Galactic Trust can provide during diligence
Non-secret materials can include:
- product/demo walkthrough;
- architecture overview;
- funds-flow proposal;
- provider-neutral banking adapter contract;
- ledger/reconciliation architecture;
- sandbox certification checklist/evidence template;
- incident response runbook;
- backup/recovery runbook;
- data-minimization framework;
- control/responsibility matrix;
- vendor-risk checklist;
- exact CI/security control summary.

Do not send provider/database/operator secrets as part of ordinary diligence materials.

## Desired next step
The preferred next step with a qualified candidate is:

1. confirm program/geographic fit;
2. exchange initial diligence/commercial requirements;
3. obtain approved sandbox/evaluation access;
4. map the provider API to Galactic's private gateway adapter;
5. execute the zero-real-money provider-sandbox certification evidence loop;
6. evaluate technical/compliance/commercial fit before deeper production commitment.

A successful sandbox is an engineering milestone only. Production remains subject to actual sponsor-bank/provider approval, contracts, legal/compliance review, approved disclosures, security diligence, and separate production activation gates.
