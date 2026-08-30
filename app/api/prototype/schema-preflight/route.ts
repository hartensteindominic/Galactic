import { bankingErrorResponse, bankingJson } from '../../../../lib/banking-http';
import { prototypeSchemaPreflightControlStatus, runPrototypeSchemaPreflight } from '../../../../lib/prototype-schema-preflight';
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

    const preflight = await runPrototypeSchemaPreflight();

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: prototypeSchemaPreflightControlStatus(),
      preflight,
      disclosure: 'Read-only prototype schema capability preflight. Observed table/RPC paths do not prove migration execution/order, data correctness, recovery, legal/compliance approval, provider certification, or readiness for live customer funds.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
