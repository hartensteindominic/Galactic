import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { getPrototypeSnapshot } from '../../../../lib/prototype-ledger';
import { resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const brand = resolveBrand({
      host: request.headers.get('host'),
      key: url.searchParams.get('tenant')
    });
    const snapshot = await getPrototypeSnapshot(brand.key);
    return bankingJson({ ok: true, snapshot });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
