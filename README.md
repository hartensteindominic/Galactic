# Galactic Trust

Galactic Trust is a fintech dashboard and banking-integration shell designed to connect to a regulated banking program without pretending that a prototype balance is a real deposit.

The repository currently runs in **demo banking mode by default**. Demo balances, transfers, cards, and activity are simulated. No real deposits are held and no real money moves unless a regulated partner program is configured and live writes are explicitly enabled.

## Banking architecture

The app now separates the customer experience from the regulated banking provider:

`Galactic Trust UI -> Galactic banking API -> private partner gateway -> regulated banking platform / partner bank`

The server-side banking adapter lives in `lib/banking.ts`. It intentionally does not hard-code a bank vendor so Galactic Trust can integrate with an approved provider through a private gateway after commercial, compliance, and technical onboarding are complete.

### Banking endpoints

- `GET /api/banking/status` - public integration status and disclosure
- `GET /api/banking/summary` - authenticated account summary; demo data in demo mode
- `POST /api/banking/transfers` - simulated in demo; partner gateway in approved live mode
- `POST /api/banking/cards/freeze` - simulated in demo; partner gateway in approved live mode

### Safety model

- `BANKING_MODE=demo` is the default.
- Partner banking requires the banking gateway URL, API key, program ID, provider name, partner bank name, and a signed authentication boundary.
- Real transfer/card writes remain disabled unless `BANKING_ENABLE_LIVE_WRITES=true` is set server-side.
- Partner mode fails closed when configuration or authenticated-session signatures are missing.
- Provider API keys and auth signing secrets are server-only and must never be placed in client code.
- Full card PAN, CVV, PIN, and equivalent sensitive card-authentication data are not exposed by this prototype.
- Any FDIC, bank-partner, APR, fee, or account-eligibility language must match the actual approved program before public launch.

### Partner environment variables

```bash
BANKING_MODE=demo

# Configure only after a real banking program is approved.
# BANKING_PROVIDER_NAME=Approved Banking Platform
# BANKING_PARTNER_BANK_NAME=Approved FDIC-Insured Bank
# BANKING_PARTNER_DISCLOSURE=Approved program disclosure text
# BANKING_GATEWAY_BASE_URL=https://private-banking-gateway.example.com
# BANKING_GATEWAY_API_KEY=server-side-secret-only
# BANKING_PROGRAM_ID=program-id
# BANKING_AUTH_GATEWAY_SECRET=server-side-signing-secret
# BANKING_ENABLE_LIVE_WRITES=false
```

## Revenue direction

The intended regulated-fintech business model is a mix of card interchange/revenue share, deposit economics through the approved partner program, optional premium membership, merchant-funded rewards, and additional regulated products when eligible. Revenue is not guaranteed and depends on partner contracts, customer activity, fraud/credit losses where applicable, support costs, compliance costs, network/provider fees, and acquisition economics.

## Existing x402 licensing routes

The prior Galactic x402 licensing service remains in the repository as a separate digital-asset revenue feature:

- `GET /api/licenses/catalog` - free machine-readable catalog
- `POST /api/licenses/use` - x402-paid one-use license receipt
- `GET /api/paylink` - direct Base USDC paylink
- `GET /api/agent/manifest` - agent discovery manifest
- `GET /api/agent/openapi` - OpenAPI spec
- `GET /api/agent/health` - x402 status and configuration

The default public x402 payment receiver is:

`0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb`

The default VoxelFlip contract is:

`0xa00758b05f96ef4409d97c3ffebb6794b2eafbde`

## Run

```bash
npm install
npm run typecheck
npm run test:safety
npm run build
npm run dev
```

Deploy the Next.js app to a server-capable host such as Vercel. GitHub Pages can show the static preview, but the banking and x402 APIs require a server deployment.
