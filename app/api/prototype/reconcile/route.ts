import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { runPrototypeReconciliation } from '../../../../lib/prototype-operations';
import { requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveBrand } from '../../../../lib/white-label';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);

    const body = await request.json() as { tenantKey?: string };
    const brand = resolveBrand({
      host: request.headers.get('host'),
      key: body.tenantKey
    });

    const reconciliation = await runPrototypeReconciliation(brand.key);
    return bankingJson({
      ok: true,
      reconciliation,
      disclosure: 'Simulation reconciliation only. No real money moved.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
