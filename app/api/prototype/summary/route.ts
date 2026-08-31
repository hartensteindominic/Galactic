import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { getPrototypeSnapshot } from '../../../../lib/prototype-ledger';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: url.searchParams.get('tenant')
    });
    const snapshot = await getPrototypeSnapshot(brand.key);
    return bankingJson({ ok: true, snapshot });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
