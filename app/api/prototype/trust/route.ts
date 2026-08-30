import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { prototypeTrustCenter } from '../../../../lib/prototype-trust';
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

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      trust: prototypeTrustCenter()
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
