import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { plaidSandboxStatus } from '../../../../lib/plaid-sandbox';
import { prototypeLedgerStatus } from '../../../../lib/prototype-ledger';
import { prototypeMigrationIntegrityStatus } from '../../../../lib/prototype-migration-integrity';
import { prototypeOperationsStatus } from '../../../../lib/prototype-operations';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';
import { publicBrandConfig } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: url.searchParams.get('tenant')
    });

    return bankingJson({
      ok: true,
      brand: publicBrandConfig(brand),
      ledger: prototypeLedgerStatus(),
      bankLink: plaidSandboxStatus(),
      operations: prototypeOperationsStatus(),
      migrationIntegrity: prototypeMigrationIntegrityStatus(),
      liveBankingEnabled: false,
      mode: 'prototype',
      disclosure: 'White-label prototype only. Repository migration fingerprints do not prove Supabase execution or production approval. Real deposits, payments, cards, KYC/AML, production provider webhooks, and banking rails remain disabled until an approved regulated partner program is configured.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
