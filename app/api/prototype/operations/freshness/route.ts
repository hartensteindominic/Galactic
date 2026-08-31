import { bankingErrorResponse, bankingJson } from '../../../../../lib/banking-http';
import { evaluatePrototypeEvidenceFreshness, prototypeEvidenceFreshnessControlStatus } from '../../../../../lib/prototype-evidence-freshness';
import { getPrototypeOperationsSnapshot } from '../../../../../lib/prototype-operations';
import { requirePrototypeOperator } from '../../../../../lib/prototype-operator-auth';
import { resolveRequestBrand } from '../../../../../lib/tenant-boundary';

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
    const freshnessControls = prototypeEvidenceFreshnessControlStatus();

    return bankingJson({
      ok: true,
      tenantKey: brand.key,
      operatorMode: operator.mode,
      controls: freshnessControls,
      evidence: {
        reconciliation: evaluatePrototypeEvidenceFreshness(
          operations.latestReconciliations.map((row) => row.checked_at)
        ),
        sandboxProviderEvents: evaluatePrototypeEvidenceFreshness(
          operations.providerEvents.map((row) => row.received_at)
        ),
        audit: evaluatePrototypeEvidenceFreshness(
          operations.auditEvents.map((row) => row.created_at)
        )
      },
      disclosure: 'Prototype evidence-age summary only. Recent evidence does not prove continuous monitoring, production health, provider-statement reconciliation, legal/compliance approval, or readiness for live customer funds.'
    });
  } catch (error) {
    return bankingErrorResponse(error);
  }
}
