import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { getPrototypeOperationsSnapshot } from '../../../../lib/prototype-operations';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const operator = requirePrototypeOperator(request);
    const url = new URL(request.url);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: url.searchParams.get('tenant')
    });

    const operations = await getPrototypeOperationsSnapshot(brand.key);
    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      operations,
      disclosure: 'Simulation operations only. Persistent operational evidence requires an authenticated prototype operator session and host-bound tenant resolution. This endpoint does not process real provider webhooks or move real money.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
