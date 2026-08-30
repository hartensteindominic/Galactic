import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { getPrototypeOperationsSnapshot } from '../../../../lib/prototype-operations';
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

    const operations = await getPrototypeOperationsSnapshot(brand.key);
    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operations,
      disclosure: 'Simulation operations only. This endpoint does not process real provider webhooks or move real money.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
