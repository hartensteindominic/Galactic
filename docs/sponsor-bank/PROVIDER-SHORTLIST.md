# Galactic Trust — Provider Shortlist (August 30, 2026)

This is an engineering/business diligence shortlist, not an endorsement. Pricing, minimums, approval criteria, bank availability, New York support and exact program responsibilities must be verified directly before selection.

## Recommended diligence order

### 1. Synctera — first call
**Why it fits Galactic Trust**
- Full embedded-banking platform for accounts, cards and money movement.
- Strong stated focus on sponsor-bank collaboration and oversight.
- Compliance tooling includes KYC/KYB/AML/watchlist support, transaction monitoring, fraud workflows and operational support.
- Public materials specifically emphasize reconciliation technology and bank oversight.
- A centralized console can support operations and customer servicing.

**Why this matters for us**
Galactic Trust's highest-risk gap is not UI; it is the regulated operating layer around KYC, AML/fraud, reconciliation, disputes and sponsor oversight. Synctera's current positioning aligns closely with that need.

**Questions to verify immediately**
- consumer program appetite;
- New York customer availability;
- bank options for our initial feature set;
- minimums/implementation fees/reserves;
- dispute and customer-support allocation;
- sandbox access and certification timeline.

Official starting points:
- https://www.synctera.com/embedded-banking
- https://www.synctera.com/platform/risk-and-compliance
- https://www.synctera.com/platform/bank-accounts-digital-wallets

### 2. Treasury Prime — second call
**Why it fits Galactic Trust**
- Current embedded-banking offering includes payments, debit cards, onboarding and bank accounts.
- Its current bank marketplace says one structured submission can be matched across up to 17 banks.
- The published bank-matching process explicitly moves from profile submission to bank review, direct bank agreement, production setup, testing and go-live.
- A developer sandbox is available for API testing before production banking is connected.
- Treasury Prime publishes compliance-program tooling and guidance for fintechs.

**Why this matters for us**
We do not yet know which sponsor bank will accept the Galactic Trust profile. A provider that can help match the program with multiple banks could reduce the risk of building around one bank before diligence.

**Questions to verify immediately**
- which banks currently accept early-stage consumer fintech programs;
- New York availability;
- minimum economics and cash/reserve requirements;
- exact KYC/AML/dispute responsibilities;
- whether the free sandbox remains suitable for our full proposed flow.

Official starting points:
- https://www.treasuryprime.com/products/find-a-bank
- https://www.treasuryprime.com/use-cases/embedded-banking
- https://app.sandbox.treasuryprime.com/sign_up
- https://www.treasuryprime.com/products/compliance-fintechs

### 3. Unit — third call
**Why it fits Galactic Trust**
- Current platform supports customers, accounts, payments, cards and transactions through APIs/dashboard/components.
- Consumer product materials include deposit/savings capabilities, cards, ACH and other money movement.
- Unit describes direct bank relationships and program-management tooling.
- Published platform capabilities include onboarding, AML, disputes, reconciliation, statements and bank reporting.
- White-label/managed solutions may offer a faster path if Galactic Trust chooses less custom infrastructure initially.

**Why it ranks third rather than first**
The fit is strong, but we need to determine whether Galactic Trust should operate a highly customized program-manager model or use a more managed/white-label approach. That business decision materially affects integration scope and economics.

**Questions to verify immediately**
- early-stage consumer program requirements;
- available sponsor bank choices;
- whether managed solution or API platform is the appropriate route;
- New York customer support;
- implementation/minimum economics;
- responsibility for support, fraud losses, disputes and compliance operations.

Official starting points:
- https://www.unit.co/docs/
- https://www.unit.co/platform-overview
- https://www.unit.co/consumers
- https://www.unit.co/managed-solutions

### 4. Increase — fourth call / technical benchmark
**Why it fits Galactic Trust**
- Strong API infrastructure for accounts, ACH, wires, RTP, FedNow, cards and webhooks.
- Sandbox uses pretend money and exposes simulation APIs for events such as ACH, wires and card refunds.
- API supports idempotency and sandbox event subscriptions/webhooks.
- Card-program documentation describes working with a compliance model and BIN sponsor.

**Why it ranks fourth for this phase**
Increase is extremely attractive technically, especially for precise money movement and reconciliation. But Galactic Trust currently needs sponsor-bank/compliance program formation as much as it needs raw financial infrastructure. We should confirm whether the commercial/compliance model is appropriate for our early-stage program before prioritizing it over the more explicitly sponsor-program-oriented platforms above.

**Questions to verify immediately**
- entity/account eligibility for our proposed consumer model;
- sponsor-bank/BIN relationships needed for each feature;
- New York support;
- compliance requirements we must own ourselves;
- pricing/minimums;
- sandbox-to-production diligence path.

Official starting points:
- https://increase.com/documentation
- https://increase.com/documentation/sandbox
- https://increase.com/documentation/launch-a-card-program

## Selection scorecard
Score each provider 1–5 only after direct confirmation.

| Criterion | Weight |
|---|---:|
| Sponsor-bank fit for early-stage consumer program | 20% |
| New York availability | 15% |
| KYC/CIP + sanctions/AML/fraud tooling | 15% |
| Accounts + ACH + debit cards in one program | 15% |
| Reconciliation/webhook/audit quality | 10% |
| Sandbox quality and speed to proof-of-concept | 10% |
| Minimum fees/reserve/capital requirements | 10% |
| Support/dispute/operations assistance | 5% |

## Decision rule
Do not select solely on API quality or branding.

The preferred provider should be the one that gives Galactic Trust the clearest viable path through:

> sponsor-bank acceptance -> compliance responsibility agreement -> sandbox certification -> customer disclosures -> production approval -> controlled live launch.

Until that path is contractually clear, Galactic Trust remains a demo/beta and all real-money flags remain disabled.
