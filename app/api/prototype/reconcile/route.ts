import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { runPrototypeReconciliation } from '../../../../lib/prototype-operations';
import { requirePrototypeOperator } from '../../../../lib/prototype-operator-auth';
import { readJsonBodyLimited, requireJsonRequest, requireTrustedOrigin } from '../../../../lib/request-security';
import { resolveRequestBrand } from '../../../../lib/tenant-boundary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    requireTrustedOrigin(request);
    requireJsonRequest(request);
    requirePrototypeOperator(request);

    const body = await readJsonBodyLimited<{ tenantKey?: string }>(request, 4_096);
    const brand = resolveRequestBrand({
      host: request.headers.get('host'),
      requestedKey: body.tenantKey
    });

    const reconciliation = await runPrototypeReconciliation(brand.key);
    return bankingJson({
      ok: true,
      reconciliation,
      disclosure: 'Simulation reconciliation only. Persistent evidence requires an authenticated prototype operator session and host-bound tenant resolution. No real money moved.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
