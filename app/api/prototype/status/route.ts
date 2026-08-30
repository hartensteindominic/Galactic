import { bankingJson } from '../../../../lib/banking-http';
import { plaidSandboxStatus } from '../../../../lib/plaid-sandbox';
import { prototypeLedgerStatus } from '../../../../lib/prototype-ledger';
import { prototypeOperationsStatus } from '../../../../lib/prototype-operations';
import { publicBrandConfig, resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const brand = resolveBrand({
    host: request.headers.get('host'),
    key: url.searchParams.get('tenant')
  });

  return bankingJson({
    ok: true,
    brand: publicBrandConfig(brand),
    ledger: prototypeLedgerStatus(),
    bankLink: plaidSandboxStatus(),
    operations: prototypeOperationsStatus(),
    liveBankingEnabled: false,
    mode: 'prototype',
    disclosure: 'White-label prototype only. Real deposits, payments, cards, KYC/AML, production provider webhooks, and banking rails remain disabled until an approved regulated partner program is configured.'
  });
}
