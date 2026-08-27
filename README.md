# Galactic x402 Licensing

Galactic is now a deployable x402 money app for AI asset licensing.

The product is simple: agents can read a free catalog, choose an eligible Base VoxelFlip NFT, pay a tiny USDC fee through x402, and receive exactly one machine-use license receipt. A second use requires a second payment.

## Money endpoints

- `GET /api/licenses/catalog` - free machine-readable catalog
- `POST /api/licenses/use` - x402-paid one-use license receipt
- `GET /api/agent/manifest` - agent discovery manifest
- `GET /api/agent/openapi` - OpenAPI spec
- `GET /api/agent/health` - status and configuration

## Default revenue setup

The default receiver is the reviewed Base owner wallet from the Voxel Vault flow:

`0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb`

The app points both the direct Base USDC payment button and the x402-paid API route at this same receiver.

The default VoxelFlip contract is:

`0xa00758b05f96ef4409d97c3ffebb6794b2eafbde`

Set these in the hosting environment if you want to override them:

```bash
X402_PAY_TO=0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb
X402_FACILITATOR_URL=https://x402.org/facilitator
X402_LICENSE_PRICE=$0.01
X402_LICENSE_USDC_ATOMIC=10000
BASE_RPC_URL=https://mainnet.base.org
VOXELFLIP_CONTRACT_ADDRESS=0xa00758b05f96ef4409d97c3ffebb6794b2eafbde
AI_LICENSE_LICENSOR_WALLET=0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb
```

Optional: set `LICENSE_TOKEN_IDS=1,2,3` to skip event scanning and make the catalog faster.

## Run

```bash
npm install
npm run dev
npm run test:safety
```

Deploy this repo to a server-capable host such as Vercel. GitHub Pages can show the static root page, but live x402 payment enforcement needs the Next.js API routes.
