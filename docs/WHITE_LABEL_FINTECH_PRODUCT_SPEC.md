# White-Label Fintech Platform — Product Specification

Status: prototype / simulation only  
Reference tenant: Galactic Trust  
Goal: prove the software, customer experience, and partner-ready architecture before spending capital on a regulated live banking program.

## 1. Product thesis

Build one reusable financial-experience platform that can be branded for niche communities, vertical SaaS companies, membership businesses, creator platforms, employers, and other organizations that want a modern money dashboard without building the entire application layer themselves.

Galactic Trust is the reference implementation and first tenant. The platform is not represented as a bank. During the prototype phase all balances, routing numbers, cards, transfers, linked institutions, and transactions are synthetic or sandbox data.

## 2. Problem

Companies that want embedded or branded financial features face two very different engineering problems:

1. Product experience: onboarding, account dashboard, balances, transactions, transfer UX, cards, support, insights, notifications, and mobile responsiveness.
2. Regulated infrastructure: sponsor-bank approval, BaaS/provider integration, KYC/KYB, AML controls, sanctions screening, fraud, disputes, payment rails, card-program rules, disclosures, reconciliation, and operational oversight.

Teams often have to spend significant time and money before they can even demonstrate the final customer experience. This prototype separates those layers so a prospective client or investor can test the product first while live money stays fail-closed.

## 3. Target customer

Initial B2B customer profile:

- vertical SaaS products with an existing user community;
- creator/freelancer platforms;
- membership or affinity brands;
- small-business software platforms;
- benefits or workforce platforms;
- niche consumer communities that want a branded financial hub.

The customer buys a branded software experience. A future live financial program is available only when the customer, platform, regulated provider, and sponsor bank approve the program and required compliance controls.

## 4. Prototype scope

### Frontend

- Next.js application.
- Tailwind CSS white-label prototype route at `/prototype`.
- Responsive desktop/mobile banking-style dashboard.
- Tenant-specific name, logo text, accent colors, support address, domains, and disclosures.
- Balance, accounts, recent activity, spending preview, quick actions, and sandbox-link state.
- Clear simulation labels throughout the prototype.

### Ledger

Supabase/PostgreSQL stores synthetic prototype data:

- tenants;
- user profiles;
- simulated accounts;
- synthetic routing values and account last-four values;
- balances in integer cents;
- transaction log;
- sanitized linked-account metadata.

The migration is `supabase/migrations/001_white_label_prototype.sql`.

Prototype transfer mutations use a PostgreSQL function so the balance update and transaction insert occur in one database operation. The function rejects any account that is not marked `simulated=true`.

### Sandbox account linking

The server adapter supports Plaid Sandbox when sandbox credentials are configured.

For the fastest demo flow it uses Plaid's Sandbox-only public-token endpoint, exchanges the token server-side, reads synthetic account/transaction data, returns sanitized results, and does not return or persist the Plaid access token. If Plaid Sandbox is not configured, the UI uses a local synthetic bank fallback.

Production account linking must use the production-supported Plaid Link flow and an approved data-retention/security design; the Sandbox bypass is not a production integration.

### Existing banking adapter

The existing application keeps the regulated-provider abstraction:

`Branded UI -> Galactic banking API -> private provider gateway -> approved BaaS / sponsor-bank program`

Live banking writes remain disabled unless the existing partner configuration and explicit live-write switch are enabled after program approval.

## 5. White-label model

Tenant resolution can be driven by a domain or tenant key. A tenant controls:

- public product name;
- legal entity name;
- logo initials / future logo asset;
- primary and secondary accent colors;
- customer-support address;
- permitted domains;
- prototype disclosure;
- future approved banking disclosure.

Environment-based tenant configuration is sufficient for the prototype. A commercial version should move tenant administration to a protected operator console with audit history and role-based permissions.

## 6. Security model

Prototype principles:

- no real deposits;
- no real account numbers in seed data;
- no real ACH/wire/card issuance from the prototype route;
- no browser access to Supabase secret/service credentials;
- no Plaid secret or access token returned to the browser;
- no Plaid access-token persistence in the prototype;
- same-origin checks on mutation endpoints;
- JSON-only mutation endpoints;
- integer-cents ledger values;
- tenant scoping on profiles, accounts, transactions, and linked metadata;
- RLS enabled and direct `anon` / `authenticated` table grants revoked for the server-only prototype design;
- live provider code remains separately fail-closed.

Before a real-money launch, replace the demo identity with a production authentication system, design end-user RLS policies where appropriate, complete threat modeling, logging/audit design, secrets management, reconciliation, incident response, privacy review, vendor diligence, and partner-required security testing.

## 7. Partner-ready architecture

Prototype:

`White-label Next.js UI`
`        |`
`        v`
`Tenant-aware API layer`
`        |--------------------|`
`        v                    v`
`Supabase demo ledger     Plaid Sandbox`
`(synthetic only)         (test data only)`

Future approved live program:

`White-label UI`
`        |`
`        v`
`Tenant-aware API / orchestration`
`        |`
`        v`
`Private partner gateway`
`        |`
`        v`
`BaaS / embedded-banking platform + sponsor bank + KYC/AML/fraud/payment/card services`

Potential infrastructure vendors to evaluate include Unit and Treasury Prime. Vendor selection is a commercial, compliance, legal, technical, and sponsor-bank decision; the prototype does not commit to either provider.

## 8. Core user flows

### A. Investor/customer demo

1. Open `/prototype`.
2. See the selected tenant's branded dashboard.
3. Review synthetic balances and transaction history.
4. Simulate a transfer.
5. Connect a sandbox bank.
6. See synthetic linked-account metadata.
7. Review the partner-ready architecture and simulation disclosures.

### B. Add a white-label customer

Prototype workflow:

1. Add a tenant configuration to `WHITE_LABEL_TENANTS_JSON`.
2. Add the customer's demo domain.
3. Apply customer name, legal name, support address, colors, logo text, and prototype disclosures.
4. Add a tenant/profile seed in Supabase if persistent demo data is required.
5. Deploy a customer-specific preview.

Commercial workflow should replace environment JSON with an audited operator console.

### C. Future live customer onboarding

1. Commercial qualification.
2. Use-case and prohibited-business review.
3. Sponsor-bank / provider program review and diligence.
4. Approved KYC/KYB, AML, sanctions, fraud, privacy, disclosures, support, disputes, and operations design.
5. Provider sandbox / certification testing.
6. Reconciliation and ledger controls.
7. Limited production pilot.
8. Explicit live-write enablement only after approval.

## 9. Business model hypothesis

B2B platform revenue can be tested with:

- implementation / branding fee;
- monthly platform subscription;
- per-active-user or per-account software fee;
- premium support / analytics modules;
- contracted revenue share from eligible partner products where legally and contractually permitted.

Do not model interchange, deposit economics, lending, crypto, or other regulated-product revenue as guaranteed. Economics depend on the selected partner program, customer behavior, network/provider fees, fraud and losses, compliance cost, support cost, and contract terms.

## 10. Pre-seed pitch

Fundraising target hypothesis: $100k–$500k pre-seed.

Use of funds:

- legal/entity and fintech regulatory counsel;
- compliance program design and vendor minimums;
- BaaS/provider onboarding and implementation;
- sponsor-bank diligence requirements;
- security/privacy work;
- reconciliation, fraud, support, and operations tooling;
- customer pilots and go-to-market.

Pitch message:

> We already built the customer-facing software and a working sandbox ledger. The round is not to discover whether we can build the app; it is to convert a proven prototype into an approved regulated program and secure initial white-label customers.

## 11. Investor proof points to collect next

- 3–5 prospective white-label design partners.
- Recorded demo of tenant branding in under five minutes.
- Working Supabase persistent demo.
- Working Plaid Sandbox connection.
- First customer-specific preview domain.
- Written letters of intent or pilot interest.
- BaaS/provider discovery calls and indicative onboarding requirements.
- Bottom-up unit economics based on real provider quotes, not guessed interchange or deposit spreads.
- Security/compliance readiness checklist.

## 12. Prototype setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_white_label_prototype.sql` in the SQL editor.
3. Set `SUPABASE_URL` and a server-only Supabase secret key in Vercel.
4. Optional: configure `PLAID_ENV=sandbox`, `PLAID_CLIENT_ID`, and `PLAID_SECRET` privately in Vercel.
5. Add tenant overrides with `WHITE_LABEL_TENANTS_JSON` if needed.
6. Deploy the feature branch and open `/prototype`.
7. Confirm that the page visibly says simulation only and that real banking remains disabled.

Never paste API secrets, bank credentials, private keys, or production financial credentials into chat, source code, or a public GitHub repository.

## 13. External implementation references

- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API security: https://supabase.com/docs/guides/api/securing-your-api
- Plaid Sandbox: https://plaid.com/docs/sandbox/
- Plaid Link: https://plaid.com/docs/link/
- Stripe testing/sandboxes: https://docs.stripe.com/testing
- Unit: https://www.unit.co/
- Treasury Prime: https://www.treasuryprime.com/
- Y Combinator applications: https://www.ycombinator.com/apply
- Techstars accelerators: https://www.techstars.com/accelerators
